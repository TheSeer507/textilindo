-- ============================================================
-- 0003 — DIRECCIONES DE ENTREGA
-- Pegar en Supabase → SQL Editor → Run (después de 0002).
-- Idempotente: se puede volver a correr.
-- ============================================================

-- ------------------------------------------------------------
-- Tabla aparte y no columnas en `profiles`: hoy la tienda guarda
-- una sola dirección por cliente, pero un cliente de empresa que
-- pide para sucursales distintas es cuestión de tiempo. `is_default`
-- es lo que autocompleta el checkout.
-- ------------------------------------------------------------
create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  label       text,                       -- "Casa", "Oficina"…
  province    text not null,
  city        text not null,              -- ciudad / sector / barriada
  notes       text,                       -- punto de referencia, edificio
  is_default  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists addresses_profile_id_idx
  on public.addresses (profile_id);

-- Una sola dirección predeterminada por cliente.
create unique index if not exists addresses_one_default_per_profile
  on public.addresses (profile_id)
  where is_default;

alter table public.addresses enable row level security;

-- ------------------------------------------------------------
-- RLS: cada quien maneja las suyas; el personal puede verlas para
-- coordinar una entrega por WhatsApp, pero no modificarlas.
-- ------------------------------------------------------------
drop policy if exists "ver direcciones propias o personal" on public.addresses;
create policy "ver direcciones propias o personal"
  on public.addresses for select
  to authenticated
  using (profile_id = auth.uid() or public.is_staff());

drop policy if exists "crear direcciones propias" on public.addresses;
create policy "crear direcciones propias"
  on public.addresses for insert
  to authenticated
  with check (profile_id = auth.uid());

drop policy if exists "editar direcciones propias" on public.addresses;
create policy "editar direcciones propias"
  on public.addresses for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

drop policy if exists "borrar direcciones propias" on public.addresses;
create policy "borrar direcciones propias"
  on public.addresses for delete
  to authenticated
  using (profile_id = auth.uid());

-- ------------------------------------------------------------
-- updated_at automático.
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists addresses_touch_updated_at on public.addresses;
create trigger addresses_touch_updated_at
  before update on public.addresses
  for each row execute function public.touch_updated_at();
