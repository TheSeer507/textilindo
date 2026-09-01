-- ============================================================
-- 0002 — SOPORTE PARA INICIO DE SESIÓN CON GOOGLE
-- Pegar en Supabase → SQL Editor → Run (después de 0001).
-- Idempotente: se puede volver a correr.
-- ============================================================

-- Google sí nos da una foto de perfil; el registro por correo no.
alter table public.profiles
  add column if not exists avatar_url text;

-- ------------------------------------------------------------
-- El trigger original leía solo las claves que mandamos nosotros
-- desde signUp(). Google llena otras: `name` y `picture`.
-- Con coalesce cubrimos ambos caminos con un solo trigger.
--
-- El teléfono queda NULL cuando entran con Google: Google no lo
-- entrega. Se pide después (el checkout ya lo solicita igual).
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, company_name, avatar_url)
  values (
    new.id,
    new.email,
    nullif(coalesce(
      new.raw_user_meta_data ->> 'full_name',   -- registro por correo
      new.raw_user_meta_data ->> 'name'         -- Google
    ), ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'company_name', ''),
    nullif(coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'      -- Google
    ), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Si alguien ya tenía cuenta por correo y ahora entra con Google,
-- Supabase reutiliza el mismo usuario cuando el correo coincide y
-- está confirmado. En ese caso el perfil ya existe y el trigger no
-- hace nada (on conflict do nothing), así que la foto no se guarda.
-- Esto la rellena para los perfiles que aún no la tengan.
-- ------------------------------------------------------------
update public.profiles p
set avatar_url = nullif(coalesce(
      u.raw_user_meta_data ->> 'avatar_url',
      u.raw_user_meta_data ->> 'picture'
    ), '')
from auth.users u
where u.id = p.id
  and p.avatar_url is null
  and coalesce(u.raw_user_meta_data ->> 'avatar_url',
               u.raw_user_meta_data ->> 'picture') is not null;

-- Lo mismo para el nombre: un perfil creado por correo sin nombre
-- se completa con el que venga de Google.
update public.profiles p
set full_name = nullif(coalesce(
      u.raw_user_meta_data ->> 'full_name',
      u.raw_user_meta_data ->> 'name'
    ), '')
from auth.users u
where u.id = p.id
  and (p.full_name is null or p.full_name = '')
  and coalesce(u.raw_user_meta_data ->> 'full_name',
               u.raw_user_meta_data ->> 'name') is not null;
