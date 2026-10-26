-- ============================================================
-- LUMEN - Migración 20: racha diaria persistida
-- Ejecutar en: Supabase -> SQL Editor (todo en una sola pasada)
--
-- La racha deja de vivir solo en localStorage para que el cron de
-- notificaciones pueda enviar el número exacto de días a todos los
-- dispositivos aprobados (incluidos los usuarios con rol global).
--
--   1) public.streaks: una fila por usuario, con RLS de lectura propia.
--      La escritura solo se hace mediante RPC SECURITY DEFINER.
--   2) record_streak(): registra la práctica completada de hoy. Es
--      idempotente dentro del mismo día y acepta los valores locales
--      como semilla si el usuario todavía no tenía fila en el servidor.
--   3) sync_streak(): reconcilia una racha local con la del servidor al
--      iniciar sesión o al recuperar conexión, sin retroceder nunca.
--
-- El "hoy" se calcula siempre en America/Caracas, igual que el cron.
-- ============================================================

-- ---------- 1) Tabla de rachas ----------
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id    uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  last_date  date NOT NULL,
  days       integer NOT NULL DEFAULT 1 CHECK (days BETWEEN 1 AND 3650),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS streaks_last_date_idx ON public.streaks (last_date);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.streaks FROM anon, authenticated;
GRANT SELECT ON public.streaks TO authenticated;
GRANT SELECT ON public.streaks TO service_role;

DROP POLICY IF EXISTS "streaks_select_own" ON public.streaks;
CREATE POLICY "streaks_select_own" ON public.streaks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.streaks IS
  'Racha diaria por usuario. La escribe record_streak/sync_streak; el cron la lee para el push de las 18:00 VE.';

-- ---------- 2) Registrar la práctica de hoy ----------
-- p_last y p_days son la copia local que envía el cliente. Solo se usan
-- como semilla cuando todavía no existe una fila en el servidor; si ya
-- existe, el servidor manda y recalcula desde su propia fecha.
CREATE OR REPLACE FUNCTION public.record_streak(
  p_last date DEFAULT NULL,
  p_days integer DEFAULT NULL
)
RETURNS TABLE(days integer, last_date date, new_day boolean)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid    uuid := auth.uid();
  v_today  date := (now() AT TIME ZONE 'America/Caracas')::date;
  v_days   integer;
  v_last   date;
  v_new    boolean := false;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Sesion requerida' USING ERRCODE = '28000';
  END IF;

  -- Serializa las llamadas concurrentes del mismo usuario (varios
  -- dispositivos o reintentos del cliente).
  PERFORM pg_advisory_xact_lock(hashtext(v_uid::text)::bigint);

  SELECT s.days, s.last_date
    INTO v_days, v_last
    FROM public.streaks s
   WHERE s.user_id = v_uid
     FOR UPDATE;

  IF NOT FOUND THEN
    -- Primera fila del usuario: aprovecha la racha local si es válida.
    IF p_last = v_today AND p_days BETWEEN 1 AND 3650 THEN
      v_days := p_days;
    ELSIF p_last = v_today - 1 AND p_days BETWEEN 1 AND 3650 THEN
      v_days := LEAST(p_days + 1, 3650);
    ELSE
      v_days := 1;
    END IF;
    v_last := v_today;
    v_new := true;

    INSERT INTO public.streaks (user_id, last_date, days)
    VALUES (v_uid, v_last, v_days);
  ELSIF v_last = v_today THEN
    -- Ya se registró hoy: idempotente, no suma dos veces.
    v_new := false;
  ELSIF v_last = v_today - 1 THEN
    v_days := LEAST(v_days + 1, 3650);
    v_last := v_today;
    v_new := true;

    UPDATE public.streaks
       SET days = v_days, last_date = v_last, updated_at = now()
     WHERE user_id = v_uid;
  ELSE
    -- Se rompió la cadena: vuelve a empezar en 1.
    v_days := 1;
    v_last := v_today;
    v_new := true;

    UPDATE public.streaks
       SET days = v_days, last_date = v_last, updated_at = now()
     WHERE user_id = v_uid;
  END IF;

  RETURN QUERY SELECT v_days AS days, v_last AS last_date, v_new AS new_day;
END;
$$;

REVOKE ALL ON FUNCTION public.record_streak(date, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_streak(date, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.record_streak(date, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_streak(date, integer) TO service_role;

-- ---------- 3) Reconciliar la copia local con el servidor ----------
-- Al iniciar sesión o volver online, el cliente llama aquí con su copia
-- local. Si el servidor no tiene fila, la crea. Si la tiene, solo avanza
-- cuando la copia local es más reciente o tiene más días: nunca retrocede.
CREATE OR REPLACE FUNCTION public.sync_streak(
  p_last date,
  p_days integer
)
RETURNS TABLE(days integer, last_date date)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_today date := (now() AT TIME ZONE 'America/Caracas')::date;
  v_days  integer;
  v_last  date;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Sesion requerida' USING ERRCODE = '28000';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(v_uid::text)::bigint);

  SELECT s.days, s.last_date
    INTO v_days, v_last
    FROM public.streaks s
   WHERE s.user_id = v_uid
     FOR UPDATE;

  IF FOUND THEN
    IF p_last IS NOT NULL
       AND p_days BETWEEN 1 AND 3650
       AND p_last BETWEEN v_today - 1 AND v_today
       AND (p_last > v_last OR (p_last = v_last AND p_days > v_days)) THEN
      v_days := p_days;
      v_last := p_last;

      UPDATE public.streaks
         SET days = v_days, last_date = v_last, updated_at = now()
       WHERE user_id = v_uid;
    END IF;

    RETURN QUERY SELECT v_days AS days, v_last AS last_date;
    RETURN;
  END IF;

  -- Sin fila en el servidor: solo se crea si la copia local es de hoy o
  -- de ayer. Una racha más antigua ya no está viva y no debe sembrarse.
  IF p_last BETWEEN v_today - 1 AND v_today AND p_days BETWEEN 1 AND 3650 THEN
    INSERT INTO public.streaks (user_id, last_date, days)
    VALUES (v_uid, p_last, p_days);

    RETURN QUERY SELECT p_days AS days, p_last AS last_date;
  END IF;

  RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_streak(date, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_streak(date, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.sync_streak(date, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_streak(date, integer) TO service_role;

-- ============================================================
-- FIN de la migración 20
-- ============================================================
