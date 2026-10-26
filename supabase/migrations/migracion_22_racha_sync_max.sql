-- ============================================================
-- LUMEN - Migración 22: sync_streak nunca pierde una racha viva
--
-- Si el servidor tiene una racha que llegó hasta ayer, el día de hoy
-- se suma a ese conteo aunque la copia local venga de otro dispositivo
-- con un número menor (por ejemplo, un móvil nuevo que completó sin
-- conexión). Antes, sync_streak podía reemplazar 9 días por 1.
-- ============================================================

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
      IF p_last = v_today AND v_last = v_today - 1 THEN
        -- La racha del servidor sigue viva: el nuevo día se suma a su
        -- conteo, aunque la copia local venga de otro dispositivo.
        v_days := LEAST(GREATEST(v_days + 1, p_days), 3650);
      ELSIF p_last = v_last THEN
        v_days := LEAST(GREATEST(v_days, p_days), 3650);
      ELSE
        v_days := p_days;
      END IF;
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

-- ============================================================
-- FIN de la migración 22
-- ============================================================
