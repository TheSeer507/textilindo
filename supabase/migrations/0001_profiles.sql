-- ============================================================
-- 0001 — PERFILES Y ROLES
-- Pegar completo en Supabase → SQL Editor → Run.
-- Es idempotente: se puede volver a correr sin romper nada.
-- ============================================================

-- ------------------------------------------------------------
-- Tabla de perfiles: 1 a 1 con auth.users.
-- auth.users es de Supabase y no se toca; aquí guardamos lo
-- nuestro (nombre, teléfono, empresa, rol).
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  full_name    text,
  phone        text,                     -- 8 dígitos locales, sin el 507
  company_name text,                     -- para clientes empresa (mayoreo)
  role         text not null default 'customer'
               check (role in ('customer', 'employee', 'admin')),
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ------------------------------------------------------------
-- Al crearse un usuario en auth.users, se crea su perfil solo.
-- Los datos extra viajan en options.data desde signUp().
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, company_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'company_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- Helpers de rol.
--
-- Van como SECURITY DEFINER a propósito: una política sobre
-- `profiles` que consulte `profiles` se llamaría a sí misma en
-- bucle (recursión infinita). Al ser definer, la función lee la
-- tabla saltándose RLS y corta el ciclo.
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Empleados: pueden ver clientes, pero no tocar configuración.
create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('employee', 'admin')
  );
$$;

-- ------------------------------------------------------------
-- Políticas RLS
-- ------------------------------------------------------------

-- Cada quien ve su propio perfil; el personal ve todos.
drop policy if exists "perfil propio o personal" on public.profiles;
create policy "perfil propio o personal"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_staff());

-- Cada quien edita su propio perfil.
drop policy if exists "editar perfil propio" on public.profiles;
create policy "editar perfil propio"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Solo un admin puede cambiar roles (ascender a empleado, etc.).
drop policy if exists "admin edita cualquier perfil" on public.profiles;
create policy "admin edita cualquier perfil"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- CÓMO NOMBRAR AL PRIMER ADMIN
-- Regístrate normal en la página, luego corre esto una vez con
-- tu correo. Después ya puedes ascender empleados desde el panel.
--
--   update public.profiles set role = 'admin'
--   where email = 'tucorreo@ejemplo.com';
-- ------------------------------------------------------------
