-- ============================================================
-- MIGRACIÓN 13: consolidación (Fase C del plan)
--  1) updated_at en profiles y eventos con trigger anti-ruido:
--     solo se "toca" la marca cuando el UPDATE cambia datos reales.
--     Refuerza el fingerprint de LumenData (Fase A: censo/realtime).
--  2) Índices que faltaban para los ORDER BY de la app y del cron.
--  3) Publicación realtime ampliada a las tablas que leerá Fase D/E.
-- ============================================================

-- Todo el script en una sola transacción: si cualquier sentencia falla, se
-- revierte (incluida la reactivación del guard) y no quedan piezas a medias.
BEGIN;

-- ---------- 1) updated_at ----------

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Perfiles: los re-renders por realtime solo ocurren cuando algo cambió.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

-- El guard guard_profiles_privileges bloquea CUALQUIER UPDATE sobre filas
-- admin aunque role/status no cambien, y el SQL Editor de Studio corre sin
-- auth.uid() (is_admin() = false). Se desactiva SOLO durante el backfill y
-- se reactiva en el mismo bloque transaccional.
ALTER TABLE public.profiles DISABLE TRIGGER guard_profiles_privileges;
UPDATE public.profiles SET updated_at = created_at WHERE updated_at IS NULL AND created_at IS NOT NULL;
UPDATE public.profiles SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE public.profiles ENABLE TRIGGER guard_profiles_privileges;

DROP TRIGGER IF EXISTS trg_profiles_touch_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_touch_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD IS DISTINCT FROM NEW)
  EXECUTE FUNCTION public.touch_updated_at();

-- Eventos: idem (ORDER BY created_at y ediciones frecuentes).
ALTER TABLE public.eventos
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE public.eventos SET updated_at = created_at WHERE updated_at IS NULL AND created_at IS NOT NULL;
UPDATE public.eventos SET updated_at = now() WHERE updated_at IS NULL;

DROP TRIGGER IF EXISTS trg_eventos_touch_updated_at ON public.eventos;
CREATE TRIGGER trg_eventos_touch_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW
  WHEN (OLD IS DISTINCT FROM NEW)
  EXECUTE FUNCTION public.touch_updated_at();

-- ---------- 2) índices que faltaban ----------

CREATE INDEX IF NOT EXISTS idx_articulos_ts        ON public.articulos (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_created     ON public.eventos (created_at ASC);
CREATE INDEX IF NOT EXISTS idx_recursos_created    ON public.recursos (created_at ASC);
CREATE INDEX IF NOT EXISTS idx_asistencia_mes      ON public.asistencia (mes);

-- Cron de avisos: encuesta de pendientes manuales sin empujar todavía.
CREATE INDEX IF NOT EXISTS idx_notificaciones_pendientes
  ON public.notificaciones (timestamp)
  WHERE manual IS TRUE AND pushed_at IS NULL;

-- ---------- 3) realtime ampliado ----------

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE
    public.inscripciones, public.asistencia, public.export_logs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.inscripciones REPLICA IDENTITY FULL;
ALTER TABLE public.asistencia REPLICA IDENTITY FULL;
ALTER TABLE public.export_logs REPLICA IDENTITY FULL;

COMMIT;