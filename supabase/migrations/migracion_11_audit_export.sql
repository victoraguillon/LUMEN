-- ============================================================
-- LUMEN - Migración 11: auditoría de exportaciones del censo
-- Ejecutar en: Supabase -> SQL Editor (todo en una sola pasada)
--
--   Registro de quién exportó datos personales (censos y
--   asistencias) y cuándo. Solo admins pueden escribir y leer.
-- ============================================================

-- ---------- 1) Tabla de auditoría ----------------------------
CREATE TABLE IF NOT EXISTS public.export_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('censo', 'asistencia')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- 2) RLS: solo administradores ---------------------
ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.export_logs FROM PUBLIC;
GRANT ALL ON public.export_logs TO authenticated;

DROP POLICY IF EXISTS "export_logs_select_admin" ON public.export_logs;
CREATE POLICY "export_logs_select_admin" ON public.export_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "export_logs_insert_admin" ON public.export_logs;
CREATE POLICY "export_logs_insert_admin" ON public.export_logs
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================================
-- FIN de la migración 11
-- ============================================================