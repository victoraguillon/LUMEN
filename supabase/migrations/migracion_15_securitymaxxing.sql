-- ============================================================
-- MIGRACIÓN 15: Securitymaxxing
--  1) Rate limiting DB-backed (tabla rate_limits + RPC atómico).
--  2) Endurecimiento de RLS/grants: matriz SELECT/INSERT/UPDATE/DELETE
--     por tabla y rol; revoke de EXECUTE innecesario en funciones.
--  3) Real-time reducido a las 5 tablas que la app realmente suscribe.
--  4) security_logs (auditoría server-side, solo service_role).
--  5) CRON_SECRET sin literales en git: tabla cron_secrets + re-programación
--     del job; el valor se setea vía SQL Editor (nunca commiteado).
-- ============================================================

BEGIN;

-- ---------- 1) Rate limiting ----------

CREATE TABLE IF NOT EXISTS public.rate_limits (
  clave        text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  count        integer NOT NULL DEFAULT 0
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON public.rate_limits FROM anon, authenticated, PUBLIC;

CREATE OR REPLACE FUNCTION public.rate_limit_check(p_clave text, p_limite integer, p_ventana_s integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start timestamptz := now() - (p_ventana_s * interval '1 second');
  v_count integer;
BEGIN
  DELETE FROM public.rate_limits WHERE window_start < v_start;
  INSERT INTO public.rate_limits (clave, window_start, count)
  VALUES (p_clave, now(), 1)
  ON CONFLICT (clave) DO UPDATE SET
    count = CASE WHEN public.rate_limits.window_start < v_start THEN 1 ELSE public.rate_limits.count + 1 END,
    window_start = CASE WHEN public.rate_limits.window_start < v_start THEN now() ELSE public.rate_limits.window_start END
  RETURNING count INTO v_count;
  RETURN v_count <= p_limite;
END;
$$;

REVOKE ALL ON FUNCTION public.rate_limit_check(text, integer, integer) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.rate_limit_check(text, integer, integer) TO service_role;

-- ---------- 2) security_logs (solo service_role) ----------

CREATE TABLE IF NOT EXISTS public.security_logs (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo      text NOT NULL,
  detalle   jsonb,
  ip        text,
  ua        text,
  creado_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_logs_creado ON public.security_logs (creado_at);

ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON public.security_logs FROM anon, authenticated, PUBLIC;
GRANT ALL PRIVILEGES ON public.security_logs TO service_role;

-- ---------- 3) Endurecimiento de funciones ----------

-- Trigger-funciones / muertas: sin EXECUTE para el cliente.
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_privilege_escalation() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.guard_articulos_status() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM anon, authenticated, PUBLIC;

-- RPCs privadas: solo authenticated/servicio (nunca anon).
REVOKE ALL ON FUNCTION public.cumpleanos_list(integer) FROM anon;
REVOKE ALL ON FUNCTION public.send_notification(text, boolean) FROM anon;
REVOKE ALL ON FUNCTION public.eliminar_mi_cuenta() FROM anon;

-- is_admin()/is_member() SE MANTIENEN para anon+authenticated:
-- las policies RLS los evalúan durante las consultas.

-- search_path explícito para evitar el aviso del advisor.
ALTER FUNCTION public.set_updated_at() SET search_path = public;

-- ---------- 4) Matriz de grants por tabla ----------

-- Eventos (lectura pública; escritura admin). Profiles: anon NO lee
-- (policy exige auth.uid() = id) -> sin grant anon.
REVOKE ALL PRIVILEGES ON public.eventos          FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.articulos        FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.intenciones      FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.intencion_likes  FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.encuestas        FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.encuesta_votos   FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.inscripciones    FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.asistencia       FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.profiles         FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.notificaciones   FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.push_subscriptions FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.recursos         FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.export_logs      FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.push_daily       FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.push_logs        FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON public.push_pings       FROM anon, authenticated;

GRANT SELECT ON public.eventos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eventos TO authenticated;

GRANT SELECT ON public.articulos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articulos TO authenticated;

GRANT SELECT ON public.intenciones TO anon;
GRANT SELECT, INSERT, DELETE ON public.intenciones TO authenticated;

GRANT SELECT, INSERT, DELETE ON public.intencion_likes TO authenticated;

GRANT SELECT ON public.encuestas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.encuestas TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.encuesta_votos TO authenticated;

GRANT SELECT, INSERT ON public.inscripciones TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.asistencia TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

GRANT SELECT, INSERT ON public.notificaciones TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recursos TO authenticated;

GRANT SELECT, INSERT ON public.export_logs TO authenticated;

-- push_*: solo service_role (toros sin grants al cliente).

-- ---------- 5) Realtime reducido a lo que suscribe la app ----------

ALTER PUBLICATION supabase_realtime DROP TABLE
  public.inscripciones, public.asistencia, public.export_logs,
  public.intenciones, public.intencion_likes, public.encuestas, public.encuesta_votos;

-- ---------- 6) CRON_SECRET sin literales + re-programación del job ----------

CREATE TABLE IF NOT EXISTS public.cron_secrets (
  key   text PRIMARY KEY,
  value text NOT NULL
);

ALTER TABLE public.cron_secrets ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON public.cron_secrets FROM anon, authenticated, PUBLIC;

DO $cron$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'lumen-push-cron') THEN
    PERFORM cron.unschedule('lumen-push-cron');
  END IF;
  PERFORM cron.schedule(
    'lumen-push-cron',
    '*/30 * * * *',
    $job$
    SELECT net.http_post(
      url := 'https://etioxnigysbxitiaveyp.functions.supabase.co/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (SELECT value FROM public.cron_secrets WHERE key = 'push_cron')
      ),
      body := jsonb_build_object('mode', 'cron')
    )
    $job$
  );
END;
$cron$;

COMMIT;