-- ============================================================
-- LUMEN - Migración 14: Push v3 (recordatorios a inscritos +
-- notificaciones diarias con deduplicación + telemetría)
-- Ejecutar en: Supabase -> SQL Editor (todo en una sola pasada)
--
--   1) notificaciones.user_id: permite avisos DIRIGIDOS (una fila por
--      inscrito) en el Centro de Notificaciones. Las filas con
--      user_id = NULL siguen siendo avisos globales.
--   2) push_daily (clave, fecha): deduplicación por día de las
--      notificaciones diarias automáticas (evangelio, devocional,
--      cumpleaños). Solo service_role escribe/lee.
--   3) push_logs: bitácora de cada corrida del cron y de los
--      recordatorios manuales a inscritos (quién, a qué actividad,
--      cuántos alcanzados). Solo service_role.
--   4) Backfill: las fechas de actividades únicas guardadas como texto
--      sin zona horaria ("YYYY-MM-DDTHH:MM", hora local de Venezuela)
--      se convierten a ISO-8601 con offset (la antigua representación
--      hacía que el cron en UTC disparara ~4 horas antes).
-- ============================================================

-- ---------- 1) notificaciones dirigidas (por usuario) ----------
ALTER TABLE public.notificaciones
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_notificaciones_user ON public.notificaciones (user_id);

DROP POLICY IF EXISTS "notificaciones_read" ON public.notificaciones;
CREATE POLICY "notificaciones_read" ON public.notificaciones
  FOR SELECT USING (
    public.is_admin()
    OR (public.is_member() AND for_admin = false AND (user_id IS NULL OR user_id = auth.uid()))
  );

-- ---------- 2) push_daily (dedup diario) ----------
CREATE TABLE IF NOT EXISTS public.push_daily (
  clave     text NOT NULL,
  fecha     date NOT NULL,
  creado_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (clave, fecha)
);

CREATE INDEX IF NOT EXISTS push_daily_fecha_idx ON public.push_daily (fecha);

ALTER TABLE public.push_daily ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.push_daily FROM anon, authenticated;

-- ---------- 3) push_logs (telemetría) ----------
CREATE TABLE IF NOT EXISTS public.push_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo          text NOT NULL CHECK (tipo IN ('cron', 'evento')),
  evento_id     uuid REFERENCES public.eventos (id) ON DELETE SET NULL,
  admin_id      uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  target_count  integer,
  sent          integer NOT NULL DEFAULT 0,
  failed        integer NOT NULL DEFAULT 0,
  gone          integer NOT NULL DEFAULT 0,
  creado_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_logs_creado_idx ON public.push_logs (creado_at);

ALTER TABLE public.push_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.push_logs FROM anon, authenticated;

-- ---------- 4) Backfill zonas horarias de actividades únicas ----------
-- Formato antiguo guardado por <input type="datetime-local"> sin offset
-- (hora local de Venezuela). Se interpreta en America/Caracas y se
-- persiste como ISO-8601 UTC, igual que hará la app de ahora en adelante.
UPDATE public.eventos
SET fecha_inicio = to_char(
      (fecha_inicio::timestamp AT TIME ZONE 'America/Caracas') AT TIME ZONE 'UTC',
      'YYYY-MM-DD"T"HH24:MI:SS.000"Z"'
    )
WHERE tipo = 'unico'
  AND fecha_inicio ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$';

UPDATE public.eventos
SET fecha_fin = to_char(
      (fecha_fin::timestamp AT TIME ZONE 'America/Caracas') AT TIME ZONE 'UTC',
      'YYYY-MM-DD"T"HH24:MI:SS.000"Z"'
    )
WHERE tipo = 'unico'
  AND fecha_fin ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$';

-- ============================================================
-- FIN de la migración 14
-- ============================================================