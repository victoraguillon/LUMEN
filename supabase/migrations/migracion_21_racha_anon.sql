-- ============================================================
-- LUMEN - Migración 21: cierra EXECUTE de anon en las RPC de racha
--
-- Supabase concede EXECUTE a anon/authenticated por privilegios por
-- defecto en funciones de public. La migración 20 revocó PUBLIC, pero
-- el grant explícito a anon seguía existiendo. Las funciones ya exigen
-- auth.uid(), pero se revoca igualmente para que no sean invocables sin
-- sesión (y para que el advisor de seguridad no las marque).
-- ============================================================

REVOKE ALL ON FUNCTION public.record_streak(date, integer) FROM anon;
REVOKE ALL ON FUNCTION public.sync_streak(date, integer) FROM anon;

-- ============================================================
-- FIN de la migración 21
-- ============================================================
