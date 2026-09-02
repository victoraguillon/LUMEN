-- ============================================================
-- LUMEN - Migración 6: Push v2 (sin pg_net; GitHub Actions)
-- Ejecutar DESPUÉS de desplegar la Edge Function send-push v2.
--
-- Qué hace:
--  1) Columna notificaciones.pushed_at (para deduplicar el push de avisos).
--  2) Marca como ya enviados los avisos antiguos (para no empujarlos al instalar).
--  3) Elimina el job pg_cron 'lumen-push-cron' de la migración 5:
--     usaba net.http_post (pg_net) que NO existe en plan Free → fallaba en cada
--     ejecución. El disparo cada ~5 minutos ahora lo hace GitHub Actions
--     (.github/workflows/push-cron.yml) llamando a send-push en modo cron.
-- ============================================================

ALTER TABLE public.notificaciones
  ADD COLUMN IF NOT EXISTS pushed_at timestamptz;

-- Avisos existentes: no re-enviar los que ya estaban antes de esta migración
UPDATE public.notificaciones
  SET pushed_at = now()
  WHERE pushed_at IS NULL AND manual IS TRUE;

-- Matar el cron roto (pg_net no disponible)
DO $cron$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'lumen-push-cron') THEN
    PERFORM cron.unschedule('lumen-push-cron');
  END IF;
END;
$cron$;

-- Comprobación: SELECT jobname FROM cron.job WHERE jobname = 'lumen-push-cron';
-- (debe devolver 0 filas)

-- ============================================================
-- FIN migración 6
-- ============================================================