-- ============================================================
-- LUMEN - Migración 10: hardening adicional de seguridad
-- Ejecutar en: Supabase -> SQL Editor (todo en una sola pasada)
--
--  1) Registro de aceptación legal: columna acepta_terminos
--     (+ timestamp) para blindar el consentimiento RGPD/LSSI
--     del usuario al crear/actualizar su perfil.
--  2) is_admin()/is_member(): revocar EXECUTE del rol PUBLIC
--     y concederlo de forma explícita a los roles que realmente
--     utilizan las policies RLS (authenticated + anon).
--  3) encuestas: faltaba la policy de UPDATE para admin
--     (existían INSERT y DELETE, pero no UPDATE).
-- ============================================================

-- ---------- 1) Registro de aceptación legal ----------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS acepta_terminos boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS acepta_terminos_ts timestamptz;

-- ---------- 2) Helpers de autorización: least privilege ----
-- En Postgres, las funciones reciben EXECUTE para PUBLIC por
-- defecto. Lo revocamos y lo concedemos únicamente a los roles
-- que las policies RLS necesitan (ambos usan auth.uid()).
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_member() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_member() TO authenticated, anon;

-- ---------- 3) encuestas: UPDATE para admin ---------------
DROP POLICY IF EXISTS "encuestas_update_admin" ON public.encuestas;
CREATE POLICY "encuestas_update_admin" ON public.encuestas
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- FIN de la migración 10
-- ============================================================