-- ============================================================
-- MIGRACIÓN 17: Anti-rebote de correos transaccionales de auth
--
-- Causa raíz (aviso de Supabase por alta tasa de rebotes): ráfagas
-- de signups/resets de prueba con correos inválidos disparan correos
-- de confirmación/reset que rebotan. Solución: bloquear dominios
-- desechables y typos de proveedores grandes EN EL ORIGEN (no crear
-- el usuario → no enviar el correo).
--
-- PARTE A (aplicable con el runner de migraciones): función pública
--   public.email_es_valida(email) con la blocklist, espejo de la que
--   usa el comprobador del lado cliente (js/ui.js).
-- PARTE B (migración 18 + config en Dashboard): NO se toca el schema
--   auth (está endurecido y el runner no tiene privilegios). En su
--   lugar se usa el Auth Hook "Before User Created" de Supabase, una
--   función normal en schema public que Auth invoca ANTES de crear el
--   usuario: si devuelve error, el signup se rechaza y no se envía ni
--   crea nada. Ver migracion_18_auth_hook_before_user_created.sql y,
--   al final, activar el hook en Dashboard → Authentication → Hooks.
-- ============================================================

BEGIN;

-- ---------- PARTE A: función pública comprobable ----------
CREATE OR REPLACE FUNCTION public.email_es_valida(p_email text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_domain text;
  v_desechables text[] := ARRAY[
    'mailinator.com','yopmail.com','guerrillamail.com','guerrillamail.de',
    'guerrillamail.net','sharklasers.com','temp-mail.org','tempmail.com',
    'tempmail.net','10minutemail.com','dispostable.com','throwawaymail.com',
    'maildrop.cc','getnada.com','trashmail.com','mailnesia.com','spam4.me',
    'emailondeck.com','mailnox.com','mailsac.com','dropmail.me','fakemail.net',
    'inboxbear.com','tempinbox.com','tokemails.com','emlpro.com','moakt.com',
    '0-mail.com','spamgourmet.com','throwaway.email','mytemp.email'
  ];
  v_typos text[] := ARRAY[
    'gmail.con','gmail.co','gmail.cm','gmail.comm','gmail.cmo','gmaill.com',
    'gmil.com','gmial.com','gamil.com','gmali.com','gmai.com','gmaaail.com',
    'hotmail.con','hotmail.co','hotmail.cm','hotmial.com','hotmali.com',
    'outlook.con','outlook.co','outlook.cm','outllok.com','otlook.com',
    'oulook.com','outlok.com','outlool.com','outllok.com',
    'yahoo.con','yahoo.co','yahoo.cm','yaho.com','yahooo.com','yahho.com','yahoo.comm',
    'icloud.con','icloud.co','icloud.cm','icolud.com','ilcoud.com','iclud.com',
    'aol.con','aol.co','aol.cm',
    'protonmail.con','protonmail.co','protonmail.cm','proton.con',
    'zoho.con','zoho.co','gmx.con','gmx.co'
  ];
BEGIN
  IF p_email IS NULL OR position('@' in p_email) = 0 THEN
    RETURN false;
  END IF;
  v_domain := lower(split_part(p_email, '@', 2));
  IF v_domain = '' THEN
    RETURN false;
  END IF;
  IF v_domain = ANY(v_desechables) OR v_domain = ANY(v_typos) THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.email_es_valida(text) FROM PUBLIC;

COMMIT;

-- ============================================================
-- PARTE B — SUPERSEDED por migracion_18_auth_hook_before_user_created.
-- (La vía del trigger sobre auth.users no es posible: el schema auth
-- está endurecido incluso para el SQL Editor, que corre como postgres.
-- Ver el SQL completo del hook en migracion_18.)
--
-- Pasos de configuración del hook (una sola vez, en el Dashboard):
--   1. Authentication → Hooks → "Before User Created" → Add hook.
--   2. Tipo: PostgreSQL function. Función: auth_hook_before_user_created
--      (schema public). Tipos de email que disparan: Sign Up.
--   3. Activar el hook. Sin secret (pg-functions:// no usa HMAC).
-- ============================================================