-- ============================================================
-- LUMEN - Migración 19: Table Editor / SQL Editor con edición libre
--
-- Los guards de "coordinador" (triggers BEFORE en public.profiles y
-- public.articulos) se ejecutan para TODOS los roles, incluido el
-- service_role/postgres con el que opera el Table Editor y el SQL
-- Editor de Supabase. Eso es lo que impedía editar datos desde el
-- dashboard aunque RLS se omita para el service_role.
--
-- Esta migración añade public.is_server_role(): cuando la sesión es
-- del servidor/dashboard (service_role / postgres / supabase_admin),
-- se salta el guard y se puede editar CUALQUIER dato libremente.
--
-- IMPORTANTE: en la PÁGINA (roles authenticated/anon) el guard se
-- conserva igual que antes: los coordinadores siguen aprobando
-- perfiles, artículos y roles coordinador/admin desde la app.
-- ============================================================

-- Helper: ¿la sesión es del servidor / dashboard de Supabase y no
-- del navegador de la página? (service_role viaja en el JWT; los
-- roles internos postgres/supabase_admin aparecen en current_user.)
CREATE OR REPLACE FUNCTION public.is_server_role()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'service_role'
      OR current_user IN ('service_role', 'postgres', 'supabase_admin', 'dashboard');
$$;

-- 1) profiles: el dashboard puede editar cualquier dato (incluido
--    rol/status) sin pasar por la aprobación de un coordinador.
--    La página sigue . . .
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF public.is_server_role() THEN
    RETURN NEW;
  END IF;
  IF NOT public.is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.role IS DISTINCT FROM 'global' OR NEW.status IS DISTINCT FROM 'approved' THEN
        RAISE EXCEPTION 'Elevación de perfil solo admite rol global aprobado';
      END IF;
      RETURN NEW;
    END IF;
    IF NEW.role = 'admin' THEN
      RAISE EXCEPTION 'Solo un coordinador puede otorgar el rol administrador';
    END IF;
    IF NEW.role IS DISTINCT FROM OLD.role OR NEW.status IS DISTINCT FROM OLD.status THEN
      IF NEW.status = 'approved' AND (OLD.status = 'pending' OR OLD.role = 'asistente' OR NEW.role IS DISTINCT FROM OLD.role) THEN
        RAISE EXCEPTION 'Tu solicitud de aprobación requiere la revisión de un coordinador';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 2) articulos: el dashboard puede publicar/editar directamente.
--    La página sigue exigiendo la revisión de un coordinador.
CREATE OR REPLACE FUNCTION public.guard_articulos_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF public.is_server_role() THEN
    RETURN NEW;
  END IF;
  IF NOT public.is_admin() AND NEW.status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'Los artículos requieren revisión de un coordinador antes de publicarse';
  END IF;
  RETURN NEW;
END;
$function$;
