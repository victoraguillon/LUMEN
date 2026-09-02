-- ============================================================
-- LUMEN - Migración 12: resolver bug de edición de perfil
-- Ejecutar en: Supabase -> SQL Editor (todo en una sola pasada)
--
-- PROBLEMA:
--   El guard prevent_privilege_escalation() bloqueaba CUALQUIER
--   UPDATE de un usuario global (role='global', status='approved').
--   La condición evaluaba OLD.role='global' sin comprobar si role o
--   status realmente cambiaban, así que editar nombre/foto/teléfono
--   de un usuario global lanzaba:
--     'Tu solicitud de aprobación requiere la revisión de un coordinador'
--   (P0001) y el guard rechazaba todo el UPDATE con 400 Bad Request.
-- SOLUCIÓN:
--   Las reglas de escalada solo se evalúan cuando role o status
--   cambian de verdad. Editar datos manteniendo role/status queda
--   permitido (flujo legítimo del app: "Editar sus datos manteniendo
--   role/status", que ya estaba documentado como permitido en la
--   migración 2 pero el código no lo cumplía).
--
--   Se conservan intactas las reglas de escalada existentes:
--     - INSERT solo admite global/approved (no-admin)
--     - Nunca role='admin' por autogestión
--     - No auto-aprobación (pending->approved, cambio de rol a
--       approved, o global aprobándose sin pasar por coordinador)
--     - global -> miembro/pending sigue permitido (solicitud Juvemar)

-- ============================================================

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
    -- Solo se evalúa la escalada si realmente cambió role o status.
    -- Editar datos (nombre, foto, teléfono, nacimiento, etc.)
    -- manteniendo role/status queda permitido.
    IF NEW.role IS DISTINCT FROM OLD.role OR NEW.status IS DISTINCT FROM OLD.status THEN
      IF NEW.status = 'approved' AND (OLD.status = 'pending' OR OLD.role = 'global' OR NEW.role IS DISTINCT FROM OLD.role) THEN
        RAISE EXCEPTION 'Tu solicitud de aprobación requiere la revisión de un coordinador';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profiles_privileges ON public.profiles;
CREATE TRIGGER guard_profiles_privileges
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_privilege_escalation();

-- ============================================================
-- FIN de la migración 12
-- ============================================================
