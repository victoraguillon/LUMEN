-- ============================================================
-- LUMEN - Esquema Supabase (PostgreSQL)
-- Ejecutar en: Supabase -> SQL Editor (todo en una sola pasada)
-- ============================================================

-- ---------- ENUMS ----------
DO $$ BEGIN
  CREATE TYPE public.user_role      AS ENUM ('global', 'miembro', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.user_status    AS ENUM ('pending', 'approved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.evento_tipo    AS ENUM ('unico', 'recurrente');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.articulo_status AS ENUM ('pending', 'approved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- EXTENSIONES ----------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- TABLA: profiles ----------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                        uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  nombre                    text,
  email                     text,
  edad                      int,
  nacimiento                text,
  direccion                 text,
  telefono                  text,
  juvemar_status            text,
  juvemar_tiempo            text,
  sacramentos               jsonb          DEFAULT '[]'::jsonb,
  kerigma                   text,
  kerigma_otra              text,
  samuel_parroquia          text,
  representante_nombre      text,
  representante_telefono    text,
  photo_url                 text,
  push_subscription         jsonb,
  role                      public.user_role   DEFAULT 'global',
  status                    public.user_status DEFAULT 'approved',
  created_at                timestamptz   DEFAULT now()
);

-- ---------- TABLA: eventos ----------
CREATE TABLE IF NOT EXISTS public.eventos (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo            text NOT NULL,
  tipo              public.evento_tipo NOT NULL DEFAULT 'unico',
  descripcion       text,
  ubicacion         text,
  requisitos_edad   text,
  requisitos_texto  text,
  requisito_fecha   text,
  requisito_min_edad int,
  requisito_max_edad int,
  costo             text,
  image_url         text,
  fecha_inicio      text,
  fecha_fin         text,
  dia               text,
  hora              text,
  notifs_sent       jsonb DEFAULT '[]'::jsonb,
  created_at        timestamptz DEFAULT now()
);

-- ---------- TABLA: inscripciones ----------
CREATE TABLE IF NOT EXISTS public.inscripciones (
  evento_id   uuid NOT NULL REFERENCES public.eventos (id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  nombre      text,
  telefono    text,
  fecha       timestamptz DEFAULT now(),
  PRIMARY KEY (evento_id, user_id)
);

-- ---------- TABLA: recursos ----------
CREATE TABLE IF NOT EXISTS public.recursos (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria   text NOT NULL,
  titulo      text NOT NULL,
  tipo        text,
  url         text,
  created_at  timestamptz DEFAULT now()
);

-- ---------- TABLA: notificaciones ----------
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  texto       text NOT NULL,
  for_admin   boolean DEFAULT false,
  manual      boolean DEFAULT false,
  timestamp   bigint
);

-- ---------- TABLA: articulos (blog) ----------
CREATE TABLE IF NOT EXISTS public.articulos (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo        text NOT NULL,
  contenido     text,
  image_url     text,
  author_name   text,
  author_email  text,
  author_uid    uuid,
  status        public.articulo_status DEFAULT 'pending',
  timestamp     bigint
);

-- ---------- TABLA: intenciones ----------
CREATE TABLE IF NOT EXISTS public.intenciones (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  texto       text NOT NULL,
  author_name text,
  author_uid  uuid,
  timestamp   bigint
);

-- ---------- TABLA: intencion_likes (N:M) ----------
CREATE TABLE IF NOT EXISTS public.intencion_likes (
  intencion_id  uuid NOT NULL REFERENCES public.intenciones (id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  PRIMARY KEY (intencion_id, user_id)
);

-- ---------- TABLA: encuestas ----------
CREATE TABLE IF NOT EXISTS public.encuestas (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  question    text NOT NULL,
  options     jsonb DEFAULT '[]'::jsonb,
  timestamp   bigint
);

-- ---------- TABLA: encuesta_votos (N:M) ----------
CREATE TABLE IF NOT EXISTS public.encuesta_votos (
  encuesta_id   uuid NOT NULL REFERENCES public.encuestas (id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  option_index  int,
  PRIMARY KEY (encuesta_id, user_id)
);

-- ---------- TABLA: asistencia (N:M) ----------
-- col_id: para eventos únicos es el id del evento; para recurrentes combina "eventoId_timestamp"
CREATE TABLE IF NOT EXISTS public.asistencia (
  user_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  mes         text NOT NULL,                        -- formato 'YYYY-MM'
  col_id      text NOT NULL,
  presente    boolean DEFAULT true,
  PRIMARY KEY (user_id, mes, col_id)
);

-- ---------- ÍNDICES ----------
CREATE INDEX IF NOT EXISTS idx_inscripciones_evento   ON public.inscripciones (evento_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_user      ON public.inscripciones (user_id);
CREATE INDEX IF NOT EXISTS idx_recursos_categoria      ON public.recursos (categoria);
CREATE INDEX IF NOT EXISTS idx_articulos_status        ON public.articulos (status);
CREATE INDEX IF NOT EXISTS idx_intenciones_ts          ON public.intenciones (timestamp);
CREATE INDEX IF NOT EXISTS idx_intencion_likes_user    ON public.intencion_likes (user_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_ts            ON public.encuestas (timestamp);
CREATE INDEX IF NOT EXISTS idx_encuesta_votos_user     ON public.encuesta_votos (user_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_ts       ON public.notificaciones (timestamp);

-- ---------- TRIGGER: crear profiles al registrarse ----------
-- (se ejecuta solo si no existe ya la función)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, status)
  VALUES (new.id, new.email, 'global', 'approved')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- GENERAR FOTOS UPDATED_TRIGGER (opcional, para created_at) ----------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  new.created_at = now();
  RETURN new;
END;
$$;

-- ============================================================
-- RLS: habilitar en TODAS las tablas (bloquea todo por defecto)
-- Las políticas se añaden en el siguiente bloque (Fase 6)
-- ============================================================
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articulos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intenciones     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intencion_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuestas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuesta_votos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencia      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FASE 6: POLÍTICAS RLS
-- Helpers: auth.uid() = id en profiles, is_admin() desde profiles
-- ============================================================

-- Helper: el usuario autenticado ¿es admin?
-- SECURITY DEFINER para evitar recursión RLS al consultar profiles
-- durante evaluaciones RLS sobre la propia tabla profiles.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'approved'
  );
$$;

-- Helper: el usuario autenticado ¿es miembro (o admin)?
CREATE OR REPLACE FUNCTION public.is_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('miembro','admin') AND status = 'approved'
  );
$$;

-- ---------- policies: profiles ----------
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE USING (public.is_admin());

-- ---------- policies: eventos ----------
DROP POLICY IF EXISTS "eventos_read_all" ON public.eventos;
CREATE POLICY "eventos_read_all" ON public.eventos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "eventos_write_admin" ON public.eventos;
CREATE POLICY "eventos_write_admin" ON public.eventos
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- policies: inscripciones ----------
DROP POLICY IF EXISTS "inscripciones_read" ON public.inscripciones;
CREATE POLICY "inscripciones_read" ON public.inscripciones
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "inscripciones_insert" ON public.inscripciones;
CREATE POLICY "inscripciones_insert" ON public.inscripciones
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "inscripciones_delete" ON public.inscripciones;
CREATE POLICY "inscripciones_delete" ON public.inscripciones
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- ---------- policies: recursos ----------
DROP POLICY IF EXISTS "recursos_read_member" ON public.recursos;
CREATE POLICY "recursos_read_member" ON public.recursos
  FOR SELECT USING (public.is_member());

DROP POLICY IF EXISTS "recursos_write_admin" ON public.recursos;
CREATE POLICY "recursos_write_admin" ON public.recursos
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- policies: notificaciones ----------
-- Lectura: solo coordinadores y miembros aprobados (avisos públicos)
DROP POLICY IF EXISTS "notificaciones_read" ON public.notificaciones;
CREATE POLICY "notificaciones_read" ON public.notificaciones
  FOR SELECT USING (public.is_admin() OR (public.is_member() AND for_admin = false));

DROP POLICY IF EXISTS "notificaciones_write_admin" ON public.notificaciones;
CREATE POLICY "notificaciones_write_admin" ON public.notificaciones
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- policies: articulos ----------
DROP POLICY IF EXISTS "articulos_read_approved" ON public.articulos;
CREATE POLICY "articulos_read_approved" ON public.articulos
  FOR SELECT USING (status = 'approved' OR public.is_admin());

DROP POLICY IF EXISTS "articulos_insert" ON public.articulos;
CREATE POLICY "articulos_insert" ON public.articulos
  FOR INSERT WITH CHECK (auth.uid() = author_uid OR public.is_admin());

DROP POLICY IF EXISTS "articulos_update_admin" ON public.articulos;
CREATE POLICY "articulos_update_admin" ON public.articulos
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "articulos_delete_admin" ON public.articulos;
CREATE POLICY "articulos_delete_admin" ON public.articulos
  FOR DELETE USING (public.is_admin());

-- Autores: ven SU artículo pendiente (además de los aprobados)
DROP POLICY IF EXISTS "articulos_read_author" ON public.articulos;
CREATE POLICY "articulos_read_author" ON public.articulos
  FOR SELECT USING (author_uid = auth.uid());

-- ---------- policies: intenciones ----------
DROP POLICY IF EXISTS "intenciones_read_all" ON public.intenciones;
CREATE POLICY "intenciones_read_all" ON public.intenciones
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "intenciones_insert_member" ON public.intenciones;
CREATE POLICY "intenciones_insert_member" ON public.intenciones
  FOR INSERT WITH CHECK (public.is_member() AND auth.uid() = author_uid);

DROP POLICY IF EXISTS "intenciones_delete_owner" ON public.intenciones;
CREATE POLICY "intenciones_delete_owner" ON public.intenciones
  FOR DELETE USING (auth.uid() = author_uid OR public.is_admin());

-- ---------- policies: intencion_likes ----------
DROP POLICY IF EXISTS "intencion_likes_read" ON public.intencion_likes;
CREATE POLICY "intencion_likes_read" ON public.intencion_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "intencion_likes_insert" ON public.intencion_likes;
CREATE POLICY "intencion_likes_insert" ON public.intencion_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_member());

DROP POLICY IF EXISTS "intencion_likes_delete" ON public.intencion_likes;
CREATE POLICY "intencion_likes_delete" ON public.intencion_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ---------- policies: encuestas ----------
DROP POLICY IF EXISTS "encuestas_read_all" ON public.encuestas;
CREATE POLICY "encuestas_read_all" ON public.encuestas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "encuestas_insert_admin" ON public.encuestas;
CREATE POLICY "encuestas_insert_admin" ON public.encuestas
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "encuestas_delete_admin" ON public.encuestas;
CREATE POLICY "encuestas_delete_admin" ON public.encuestas
  FOR DELETE USING (public.is_admin());

-- ---------- policies: encuesta_votos ----------
DROP POLICY IF EXISTS "encuesta_votos_read" ON public.encuesta_votos;
CREATE POLICY "encuesta_votos_read" ON public.encuesta_votos
  FOR SELECT USING (public.is_member());

DROP POLICY IF EXISTS "encuesta_votos_insert" ON public.encuesta_votos;
CREATE POLICY "encuesta_votos_insert" ON public.encuesta_votos
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_member());

DROP POLICY IF EXISTS "encuesta_votos_upsert" ON public.encuesta_votos;
CREATE POLICY "encuesta_votos_upsert" ON public.encuesta_votos
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------- policies: asistencia ----------
DROP POLICY IF EXISTS "asistencia_read_admin" ON public.asistencia;
CREATE POLICY "asistencia_read_admin" ON public.asistencia
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "asistencia_write_admin" ON public.asistencia;
CREATE POLICY "asistencia_write_admin" ON public.asistencia
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- REALTIME: habilitar las tablas para recepción de cambios en vivo
-- (intenciones, intencion_likes, encuestas, encuesta_votos, avisos, etc.)
-- ============================================================
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'eventos', 'inscripciones', 'recursos',
    'notificaciones', 'articulos', 'intenciones', 'intencion_likes',
    'encuestas', 'encuesta_votos', 'asistencia'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL;', t);
  END LOOP;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE
    public.eventos, public.recursos, public.notificaciones, public.articulos,
    public.intenciones, public.intencion_likes, public.encuestas, public.encuesta_votos,
    public.profiles;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- FASE 7: RPC de avisos + fix RLS (migración 2)
-- 1) RPC send_notification (autenticados crean avisos públicos;
--    solo admin crea avisos de solo-coordinador)
-- 2) Bloqueo de auto-promoción a admin / cambio de estado
-- 3) Artículos sin aprobación: no-admin solo status 'pending'
-- ============================================================

-- ---------- RPC: lista de cumpleaños (migración 4) ----------
-- p_dias = ventana en días (0 = hoy, 400 = todo el año). Solo miembros/aprobados.
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

-- ---------- RPC: crear notificación ---------------------------
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

-- ---------- Fix B1: impedir escalada de privilegios -----------
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

-- Reforzar la política con WITH CHECK (segunda barrera)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- ---------- Fix: artículos sin aprobación directa ------------
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

-- ---------- RPC: borrado real de la propia cuenta -------------
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
-- FIN
-- ============================================================
