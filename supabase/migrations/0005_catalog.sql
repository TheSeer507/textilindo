-- ============================================================
-- 0005 — CATÁLOGO: ARTÍCULOS Y PRECIOS
-- Pegar completo en Supabase → SQL Editor → Run (después de 0004).
-- Luego correr 0006_catalog_seed.sql, que carga los artículos.
-- Idempotente: se puede volver a correr.
--
-- Qué guarda la base y qué no:
--   SÍ   qué artículos hay, cómo se venden (por yarda o por unidad),
--        sus presentaciones y el PRECIO de cada una, si están
--        disponibles, y el historial de cada cambio de precio.
--   NO   cuántas yardas quedan de cada tela. La tienda todavía no
--        lleva ese conteo; mientras tanto hay un interruptor manual
--        ("disponible") para marcar una tela como agotada.
--   NO   fotos ni textos largos de venta: viven en el código, junto
--        con la página (src/data/catalog.js y src/assets/catalogo/).
-- ============================================================

-- ------------------------------------------------------------
-- ARTÍCULOS
-- El `id` es el mismo texto que usa la página y la carpeta de
-- fotos ("organza", "tela-tapiz"), así que se puede leer.
-- name / category / description son una copia de lo que dice la
-- página, para que los reportes y el panel muestren nombres: la
-- página usa los suyos. Lo que la base SÍ decide es `unit` y `active`.
-- ------------------------------------------------------------
create table if not exists public.products (
  id          text primary key,
  name        text not null,
  category    text not null,
  description text,
  unit        text not null default 'yarda' check (unit in ('yarda', 'unidad')),
  active      boolean not null default true,   -- false = retirado: no sale en la tienda
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PRESENTACIONES Y PRECIOS
-- Lo que se cobra es siempre una fila de aquí. La mayoría de los
-- artículos tiene una sola (con el mismo id que el artículo); los
-- que vienen en varios anchos o tipos tienen una por cada uno:
--   organza-60   "60″ de ancho"   2.95
--   organza-120  "120″ de ancho"  3.95
--
-- price NULL = "Precio a consultar": la página manda a WhatsApp.
-- label NULL en un artículo con varias filas = la tienda dio varios
--   precios sin decir de qué depende cada uno; la página muestra el
--   rango y no deja elegir hasta que se les ponga rótulo.
-- available = false → la página la muestra como "Agotada".
-- ------------------------------------------------------------
create table if not exists public.product_variants (
  id          text primary key,
  product_id  text not null references public.products(id) on delete cascade,
  label       text,
  price       numeric(10,2) check (price is null or price >= 0),
  available   boolean not null default true,
  active      boolean not null default true,   -- false = ya no se ofrece
  sort_order  integer not null default 0,
  note        text,                            -- de dónde salió el precio
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx
  on public.product_variants (product_id);

-- ------------------------------------------------------------
-- HISTORIAL DE PRECIOS
-- Una fila por cada vez que cambia un precio: cuánto era, cuánto
-- quedó, quién lo cambió y cuándo. Nadie escribe aquí a mano: lo
-- llena el disparador de abajo.
-- ------------------------------------------------------------
create table if not exists public.price_history (
  id          bigint generated always as identity primary key,
  variant_id  text not null references public.product_variants(id) on delete cascade,
  old_price   numeric(10,2),
  new_price   numeric(10,2),
  changed_by  uuid references public.profiles(id) on delete set null,
  changed_at  timestamptz not null default now()
);

create index if not exists price_history_variant_idx
  on public.price_history (variant_id, changed_at desc);

-- updated_at automático (la función viene de 0003).
drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists product_variants_touch_updated_at on public.product_variants;
create trigger product_variants_touch_updated_at
  before update on public.product_variants
  for each row execute function public.touch_updated_at();

-- SECURITY DEFINER: price_history no tiene política de escritura para
-- nadie, así que solo esta función puede dejar registro.
-- auth.uid() queda NULL cuando el cambio se hace desde el SQL Editor.
create or replace function public.log_price_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.price is not null then
      insert into public.price_history (variant_id, old_price, new_price, changed_by)
      values (new.id, null, new.price, auth.uid());
    end if;
  elsif new.price is distinct from old.price then
    insert into public.price_history (variant_id, old_price, new_price, changed_by)
    values (new.id, old.price, new.price, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists product_variants_log_price on public.product_variants;
create trigger product_variants_log_price
  after insert or update of price on public.product_variants
  for each row execute function public.log_price_change();

-- ------------------------------------------------------------
-- RLS
-- Leer el catálogo: cualquiera, con o sin sesión (es la vitrina).
-- Se deja leer también lo inactivo a propósito: la página necesita
-- VER que un artículo fue retirado para dejar de mostrarlo; si la
-- fila le llegara oculta, lo confundiría con uno que la base no
-- conoce y seguiría mostrando el precio viejo.
-- Escribir (precios incluidos): solo admin.
-- ------------------------------------------------------------
alter table public.products         enable row level security;
alter table public.product_variants enable row level security;
alter table public.price_history    enable row level security;

drop policy if exists "catálogo visible para todos" on public.products;
create policy "catálogo visible para todos"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "admin administra artículos" on public.products;
create policy "admin administra artículos"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "precios visibles para todos" on public.product_variants;
create policy "precios visibles para todos"
  on public.product_variants for select
  to anon, authenticated
  using (true);

drop policy if exists "admin administra precios" on public.product_variants;
create policy "admin administra precios"
  on public.product_variants for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- El historial lo ve el personal; nadie lo edita.
drop policy if exists "personal ve historial de precios" on public.price_history;
create policy "personal ve historial de precios"
  on public.price_history for select
  to authenticated
  using (public.is_staff());

-- Permisos explícitos: RLS decide las filas, pero el rol igual
-- necesita permiso sobre la tabla.
grant select on public.products, public.product_variants to anon, authenticated;
grant insert, update, delete on public.products, public.product_variants to authenticated;
grant select on public.price_history to authenticated;

-- ============================================================
-- PEDIDOS POR YARDA
-- Un renglón de pedido ahora dice en qué unidad va su cantidad
-- (3 yardas no es lo mismo que 3 piezas) y cuál presentación fue.
-- Los pedidos anteriores quedan como 'unidad', que es lo que eran.
-- ============================================================
alter table public.order_items add column if not exists variant_id text;
alter table public.order_items add column if not exists unit text not null default 'unidad';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'order_items_unit_check') then
    alter table public.order_items
      add constraint order_items_unit_check check (unit in ('unidad', 'yarda'));
  end if;
end;
$$;

-- Misma función de 0004 (misma firma, así que conserva sus permisos),
-- ahora guardando `variant_id` y `unit`. Una página que aún no los
-- mande sigue funcionando: quedan en NULL y 'unidad'.
create or replace function public.create_order(
  p_customer_id    uuid,
  p_guest_name     text,
  p_guest_phone    text,
  p_province       text,
  p_city           text,
  p_notes          text,
  p_subtotal       numeric,
  p_shipping       numeric,
  p_tax            numeric,
  p_total          numeric,
  p_payment_method text,
  p_items          jsonb
)
returns table (order_id uuid, order_number bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id  uuid;
  v_num bigint;
begin
  if p_customer_id is not null and p_customer_id is distinct from auth.uid() then
    raise exception 'No puedes crear un pedido a nombre de otro usuario';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido no tiene productos';
  end if;

  insert into public.orders (
    customer_id, guest_name, guest_phone, province, city, notes,
    subtotal, shipping, tax, total, payment_method, status
  ) values (
    p_customer_id, p_guest_name, p_guest_phone, p_province, p_city, p_notes,
    p_subtotal, p_shipping, p_tax, p_total, p_payment_method, 'pending'
  )
  returning id, orders.order_number into v_id, v_num;

  insert into public.order_items (order_id, product_id, variant_id, product_name, unit_price, qty, unit)
  select v_id,
         item ->> 'product_id',
         nullif(item ->> 'variant_id', ''),
         item ->> 'product_name',
         (item ->> 'unit_price')::numeric,
         (item ->> 'qty')::integer,
         -- Cualquier cosa que no sea 'yarda' se guarda como 'unidad': un
         -- valor inesperado no debe tumbar el pedido completo.
         case when item ->> 'unit' = 'yarda' then 'yarda' else 'unidad' end
  from jsonb_array_elements(p_items) as item;

  return query select v_id, v_num;
end;
$$;

-- Lo más vendido, ahora por presentación y diciendo la unidad:
-- `quantity` son yardas en las telas y piezas en lo demás.
drop view if exists public.product_sales;
create view public.product_sales
with (security_invoker = true) as
select
  i.product_id,
  i.variant_id,
  i.product_name,
  i.unit,
  sum(i.qty)                 as quantity,
  sum(i.line_total)          as revenue,
  count(distinct i.order_id) as orders
from public.order_items i
join public.orders o on o.id = i.order_id
where o.status <> 'cancelled'
group by i.product_id, i.variant_id, i.product_name, i.unit
order by revenue desc;

grant select on public.product_sales to authenticated;
