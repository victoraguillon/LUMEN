-- ============================================================
-- LUMEN - Migración 7: Diagnóstico de activación de push
-- Ejecutar ANTES de probar la nueva versión de js/push.js (v3).
--
-- Qué hace:
--  1) Agrega la columna profiles.push_diag (jsonb).
--     La app escribe en cada paso de la activación de notificaciones
--     el punto exacto donde muere (permiso / SW / control de página /
--     subscribe). Así se diagnostica en iOS sin adivinar.
--
-- Comprobación posterior:
--   SELECT u.email, p.push_diag
--   FROM profiles p JOIN auth.users u ON u.id = p.id
--   WHERE u.email = '<tu-email>';
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS push_diag jsonb;

-- ============================================================
-- FIN migración 7
-- ============================================================