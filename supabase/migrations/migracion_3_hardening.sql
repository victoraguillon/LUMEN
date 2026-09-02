-- ============================================================
-- LUMEN - Migración 3: endurecimiento de seguridad
-- Ejecutar en: Supabase -> SQL Editor (todo en una sola pasada)
--
-- Correcciones de la auditoría "fallas similares a B1":
--  1) Escalada vía INSERT: se podía crear el propio perfil con
--     role='admin' o status='approved' (INSERT en profiles).
--     Ahora un no-admin solo puede crear su perfil como
--     'global'/'approved' (lo que genera el trigger de alta).
--  2) Avisos públicos visibles para CUALQUIER visitante anónimo:
--     ahora solo los leen miembros aprobados y coordinadores.
--     Evita filtrar nombres de los que se registran/inscriben.
--  3) send_notification: validación (texto no vacío, límite 500).
-- ============================================================

-- ---------- 1) INSERT a profiles blindado --------------------
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.role IS DISTINCT FROM 'global' OR NEW.status IS DISTINCT FROM 'approved' THEN
        RAISE EXCEPTION 'El alta de perfil solo admite rol global aprobado';
      END IF;
      RETURN NEW;
    END IF;
    IF NEW.role = 'admin' THEN
      RAISE EXCEPTION 'Solo un coordinador puede otorgar el rol administrador';
    END IF;
    IF NEW.status = 'approved' AND (OLD.status = 'pending' OR OLD.role = 'global' OR NEW.role IS DISTINCT FROM OLD.role) THEN
      RAISE EXCEPTION 'Tu solicitud de aprobación requiere la revisión de un coordinador';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profiles_privileges ON public.profiles;
CREATE TRIGGER guard_profiles_privileges
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_privilege_escalation();

-- ---------- 2) Avisos: solo miembros aprobados/admins -------
DROP POLICY IF EXISTS "notificaciones_read" ON public.notificaciones;
CREATE POLICY "notificaciones_read" ON public.notificaciones
  FOR SELECT USING (public.is_admin() OR (public.is_member() AND for_admin = false));

-- ---------- 3) send_notification: validar texto --------------
CREATE OR REPLACE FUNCTION public.send_notification(p_texto text, p_for_admin boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Se requiere sesión autenticada';
  END IF;
  IF p_texto IS NULL OR length(trim(p_texto)) = 0 THEN
    RAISE EXCEPTION 'El texto del aviso no puede estar vacío';
  END IF;
  IF length(p_texto) > 500 THEN
    RAISE EXCEPTION 'El texto del aviso no puede superar los 500 caracteres';
  END IF;
  IF p_for_admin AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo los coordinadores pueden crear este aviso';
  END IF;
  INSERT INTO public.notificaciones (texto, for_admin, manual, timestamp)
  VALUES (trim(p_texto), p_for_admin, false, floor(extract(epoch from now()) * 1000)::bigint);
END;
$$;

REVOKE ALL ON FUNCTION public.send_notification(text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_notification(text, boolean) TO authenticated;

-- ============================================================
-- FIN de la migración 3
-- ============================================================