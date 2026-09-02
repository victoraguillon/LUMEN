-- ============================================================
-- MIGRACIÓN 8: suscripciones push MULTI-DISPOSITIVO
-- profiles.push_subscription (una por usuario) -> push_subscriptions (una por endpoint)
-- Permite que un miembro reciba avisos en Chrome + iPhone (y más) A LA VEZ.
-- ============================================================

create table if not exists public.push_subscriptions (
  endpoint  text primary key,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  keys      jsonb not null,
  creado_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);

-- Mueve lo que ya existía en la columna (p. ej. la suscripción de Chrome del coordinador)
insert into public.push_subscriptions (endpoint, user_id, keys)
select
  (push_subscription ->> 'endpoint'),
  id,
  push_subscription -> 'keys'
from public.profiles
where
  push_subscription is not null
  and push_subscription ->> 'endpoint' is not null
  and push_subscription -> 'keys' is not null
on conflict (endpoint) do nothing;

-- La columna profiles.push_subscription se MANTIENE tal cual (conveniencia del front
-- para el estado "suscrito"; la escribe el cliente con sesión autenticada).
-- La entrega real se lee SIEMPRE de push_subscriptions (una fila por endpoint).
-- NOTA: NO se pone a null aquí porque el trigger guard_profiles_privileges (migración 3)
--   bloquea el UPDATE de perfiles con role='admin' si no hay contexto auth (SQL Editor).

-- ============================================================
-- RLS: cada miembro solo gestiona SUS propias suscripciones.
-- La Edge Function usa service_role (bypassa RLS).
-- ============================================================
alter table public.push_subscriptions enable row level security;

drop policy if exists "lumen_push_subs_miembro_insert" on public.push_subscriptions;
create policy "lumen_push_subs_miembro_insert" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);

drop policy if exists "lumen_push_subs_miembro_update" on public.push_subscriptions;
create policy "lumen_push_subs_miembro_update" on public.push_subscriptions
  for update using (auth.uid() = user_id);

drop policy if exists "lumen_push_subs_miembro_delete" on public.push_subscriptions;
create policy "lumen_push_subs_miembro_delete" on public.push_subscriptions
  for delete using (auth.uid() = user_id);

drop policy if exists "lumen_push_subs_miembro_select" on public.push_subscriptions;
create policy "lumen_push_subs_miembro_select" on public.push_subscriptions
  for select using (auth.uid() = user_id);