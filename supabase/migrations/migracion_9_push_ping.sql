-- ============================================================
-- MIGRACIÓN 9: diagnóstico de entrega push (echo del Service Worker)
-- push_pings registra cada envío aceptado (ping_id único por dispositivo)
-- y, si el SW del dispositivo confirmó haberlo recibido/renderizado,
-- se marca recibido_at.
-- RLS activo SIN políticas: solo service_role (la Edge Function) puede
-- escribir/leer. El SW responde con el ping_id como credencial (UUID
-- inidentificable que solo viaja cifrado dentro del mensaje).
-- ============================================================

create table if not exists public.push_pings (
  id          uuid primary key default gen_random_uuid(),
  ping_id     uuid not null unique,
  endpoint    text not null,
  creado_at   timestamptz not null default now(),
  recibido_at timestamptz,
  render_ok   boolean,
  ua          text
);

create index if not exists push_pings_creado_idx on public.push_pings (creado_at);

alter table public.push_pings enable row level security;

revoke all on public.push_pings from anon, authenticated;