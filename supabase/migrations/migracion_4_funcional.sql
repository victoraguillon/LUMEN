-- ============================================================
-- LUMEN - Migración 4: Funcional
-- Ejecutar en: Supabase -> SQL Editor
-- (aplicar DESPUÉS de esto: desplegar la Edge Function send-push,
--  y luego la migración 5 con pg_net + cron)
-- ============================================================

-- ---------- 1) Bucket 'avatars' + políticas de Storage ----------
-- (fotos de perfil: antes daba "400 Bucket not found")
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('avatars', 'avatars', true, 5242880)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_authenticated_upload" ON storage.objects;
CREATE POLICY "avatars_authenticated_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_owner_update" ON storage.objects;
CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_owner_delete" ON storage.objects;
CREATE POLICY "avatars_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------- 2) Suscripción push por miembro ----------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS push_subscription jsonb;

-- ---------- 3) RPC: lista de cumpleaños ----------
-- p_dias = ventana en días sobre el próximo cumpleaños (0 = hoy, 400 = todo el año)
-- Solo miembros/aprobados; SOLO accesible para miembro/admin autenticado.
CREATE OR REPLACE FUNCTION public.cumpleanos_list(p_dias integer DEFAULT 0)
RETURNS TABLE(id uuid, nombre text, nacimiento text, edad integer, dia integer, mes integer, en_dias integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_ano integer := extract(year from now())::int;
  v_hoy date := current_date;
BEGIN
  IF NOT public.is_member() THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::text, NULL::int, NULL::int, NULL::int, NULL::int WHERE false;
    RETURN;
  END IF;

  RETURN QUERY
    SELECT t.id, t.nombre, t.nacimiento, t.edad, t.dia, t.mes, (t.prox - v_hoy)
    FROM (
      SELECT p.id, p.nombre, p.nacimiento, p.edad,
             (split_part(p.nacimiento,'/',1))::int AS dia,
             (split_part(p.nacimiento,'/',2))::int AS mes,
             CASE
               WHEN (make_date(v_ano,1,1) + ((split_part(p.nacimiento,'/',2))::int - 1) * interval '1 month'
                                                        + ((split_part(p.nacimiento,'/',1))::int - 1) * interval '1 day')::date >= v_hoy
               THEN ((make_date(v_ano,1,1) + ((split_part(p.nacimiento,'/',2))::int - 1) * interval '1 month'
                                              + ((split_part(p.nacimiento,'/',1))::int - 1) * interval '1 day')::date)
               ELSE ((make_date(v_ano+1,1,1) + ((split_part(p.nacimiento,'/',2))::int - 1) * interval '1 month'
                                                + ((split_part(p.nacimiento,'/',1))::int - 1) * interval '1 day')::date)
             END AS prox
      FROM public.profiles p
      WHERE p.status = 'approved'
        AND p.role IN ('miembro','admin')
        AND p.nacimiento ~ '^[0-9]{2}/[0-9]{2}/[0-9]{4}$'
    ) t
    WHERE t.mes BETWEEN 1 AND 12 AND t.dia BETWEEN 1 AND 31
      AND (t.prox - v_hoy) <= p_dias
    ORDER BY (t.prox - v_hoy);
END;
$$;

REVOKE ALL ON FUNCTION public.cumpleanos_list(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cumpleanos_list(integer) TO authenticated;

-- ---------- 4) RLS: autores ven sus artículos pendientes ----------
-- (los autores no veían su propio artículo hasta aprobarlo)
DROP POLICY IF EXISTS "articulos_read_author" ON public.articulos;
CREATE POLICY "articulos_read_author" ON public.articulos
  FOR SELECT USING (author_uid = auth.uid());

-- ============================================================
-- FIN migración 4
-- ============================================================