-- ============================================================
-- LUMEN - Migración 5: Push programado (pg_net + pg_cron)
-- EJECUTAR SOLO DESPUÉS DE DESPLEGAR la Edge Function send-push
-- y definir el secreto CRON_SECRET (supabase secrets set CRON_SECRET=...),
-- con el MISMO valor usado aquí abajo.
--
-- AVISO IMPORTANTE:
--  * pg_net: en planes gratuitos puede NO estar disponible según época
--    (varió varias veces). Si la extensión no instala, revisa el Add-on
--    "Database Webhooks" o un plan de pago; mientras tanto los
--    recordatorios se disparan por la actividad de la app y el aviso
--    del coordinador (push inmediato) — el cron queda documentado.
--  * Reemplaza <PROJECT_REF> por la ref real (etioxnigysbxitiaveyp).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ---------- Programar la tarea (cada 30 minutos) ----------
DO $cron$
DECLARE
  v_url text := 'https://etioxnigysbxitiaveyp.functions.supabase.co/send-push';
  v_cron_secret text := 'V4W0jKaxW9Zpw5Yxx6WF31XlgNBOuD63c7WQmTNc3Bc'; -- MISMO valor del secreto CRON_SECRET
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'lumen-push-cron') THEN
    PERFORM cron.unschedule('lumen-push-cron');
  END IF;
  PERFORM cron.schedule(
    'lumen-push-cron',
    '*/30 * * * *',
    format(
      $$SELECT net.http_post(
          url := %L::text,
          headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', %L),
          body := jsonb_build_object('mode', 'cron')
        )$$,
      v_url,
      v_cron_secret
    )
  );
END;
$cron$;

-- ---------- Comprobación manual ----------
-- SELECT cron.job, cron.schedule, jobname FROM cron.job;
-- SELECT * FROM net._http_response ORDER BY id DESC LIMIT 5;

-- ============================================================
-- FIN migración 5
-- ============================================================