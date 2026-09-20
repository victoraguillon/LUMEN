-- ============================================================
-- MIGRACIÓN 18: Auth Hook "Before User Created" (anti-rebote)
--
-- Rechaza en el ORIGEN los signups con correos desechables o con
-- errores tipográficos en proveedores conocidos, reutilizando
-- public.email_es_valida() de la migración 17. Supabase Auth llama
-- a esta función ANTES de crear el usuario: si devuelve un objeto
-- de error, el registro se bloquea, el cliente recibe el mensaje y
-- NO se envía ningún correo de confirmación (→ sin rebotes).
--
-- No toca el schema auth (endurecido): vive en schema public y el
-- hook se activa desde Dashboard → Authentication → Hooks →
-- "Before User Created" → PostgreSQL function →
-- public.auth_hook_before_user_created.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.auth_hook_before_user_created(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  v_email := lower(btrim(coalesce(event->'user'->>'email', '')));

  IF v_email = '' OR NOT public.email_es_valida(v_email) THEN
    RETURN jsonb_build_object(
      'error', jsonb_build_object(
        'message', 'Correo no permitido: dominio desechable o error tipografico en el proveedor de correo.',
        'http_code', 403
      )
    );
  END IF;

  RETURN '{}'::jsonb;
END;
$$;

-- Permisos: solo supabase_auth_admin (el rol de Supabase Auth) ejecuta
-- la función; fuera del alcance de anon/authenticated/público.
GRANT EXECUTE
  ON FUNCTION public.auth_hook_before_user_created(jsonb)
  TO supabase_auth_admin;

REVOKE EXECUTE
  ON FUNCTION public.auth_hook_before_user_created(jsonb)
  FROM authenticated, anon, PUBLIC;

COMMIT;