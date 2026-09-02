-- ============================================================
-- LUMEN - Migración 2: RPC de avisos + fix RLS (seguridad)
-- Ejecutar en: Supabase -> SQL Editor (todo en una sola pasada)
--
-- Qué corrige:
--  1) RPC send_notification: permite que cualquier usuario
--     AUTENTICADO cree avisos públicos (recordatorios, "nuevo
--     registro", "solicitud"), y solo los coordinadores creen
--     avisos de "solo coordinador" (for_admin = true).
--     El código JS ya llama a este RPC en js/data.js.
--  2) Bloquea la auto-promoción a admin/cambio de estado
--     (vulnerabilidad B1): los usuarios ya no pueden modificar
--     role/status de su propio perfil para escalar privilegios.
--  3) Impide que un no-admin publique artículos de blog directo
--     (status 'approved') saltándose la revisión.
--  4) RPC eliminar_mi_cuenta: borrado real de la cuenta propia
--     (fallback del botón "Eliminar cuenta").
-- ============================================================

-- ---------- 1) RPC: crear notificación -----------------------
CREATE OR REPLACE FUNCTION public.send_notification(p_texto text, p_for_admin boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Se requiere sesión autenticada';
  END IF;
  IF p_for_admin AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo los coordinadores pueden crear este aviso';
  END IF;
  INSERT INTO public.notificaciones (texto, for_admin, manual, timestamp)
  VALUES (p_texto, p_for_admin, false, floor(extract(epoch from now()) * 1000)::bigint);
END;
$$;

REVOKE ALL ON FUNCTION public.send_notification(text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_notification(text, boolean) TO authenticated;

-- ---------- 2) Fix B1: impedir escalada de privilegios -------
-- Regla para NO administradores:
--  - Nunca pueden dejar su propio role = 'admin'
--  - Nunca pueden pasar su propio status a 'approved' si venían
--    de pending, eran global, o cambiaron de role en el mismo update
-- Se permite (son flujos legítimos del app):
--  - global -> miembro con status 'pending' (registro / solicitar
--    ingreso a Juvemar)
--  - Editar sus datos manteniendo role/status
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
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
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_privilege_escalation();

-- Reforzar la política con WITH CHECK (segunda barrera)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- ---------- 3) Fix: artículos sin aprobación directa ---------
-- Un no-admin solo puede insertar artículos con status 'pending'
CREATE OR REPLACE FUNCTION public.guard_articulos_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() AND NEW.status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'Los artículos requieren revisión de un coordinador antes de publicarse';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_articulos_status ON public.articulos;
CREATE TRIGGER guard_articulos_status
  BEFORE INSERT OR UPDATE ON public.articulos
  FOR EACH ROW EXECUTE FUNCTION public.guard_articulos_status();

-- ---------- 4) RPC: borrado real de la propia cuenta ---------
-- Fallback del botón "Eliminar cuenta" (js/auth.js deleteAccount):
-- el cliente intenta primero DELETE /auth/v1/user (REST) y, si el
-- navegador no lo permite, cae a este RPC. SECURITY DEFINER para
-- poder borrar el registro en auth.users.
CREATE OR REPLACE FUNCTION public.eliminar_mi_cuenta()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Se requiere sesión autenticada';
  END IF;
  DELETE FROM public.encuesta_votos WHERE user_id = v_uid;
  DELETE FROM public.inscripciones WHERE user_id = v_uid;
  DELETE FROM public.asistencia WHERE user_id = v_uid;
  DELETE FROM public.profiles WHERE id = v_uid;
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.eliminar_mi_cuenta() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.eliminar_mi_cuenta() TO authenticated;

-- ============================================================
-- FIN de la migración 2
-- ============================================================