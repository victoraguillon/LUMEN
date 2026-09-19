-- ---------- Fix: cumpleaños del día para service_role ----------
-- El backend (api/_lib/push.js) llama cumpleanos_list con la clave service_role
-- (sin auth.uid()), y el guard `is_member()` devolvía siempre lista vacía.
-- Ahora: si el rol del JWT es service_role se permite leer; para el resto
-- (anon/authenticated) se conserva el check de miembro/aprobado.

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
  IF auth.role() IS DISTINCT FROM 'service_role' AND NOT public.is_member() THEN
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
GRANT EXECUTE ON FUNCTION public.cumpleanos_list(integer) TO service_role;