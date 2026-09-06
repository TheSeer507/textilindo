-- ============================================================
-- 0004 — PEDIDOS
-- Pegar en Supabase → SQL Editor → Run (después de 0003).
-- Idempotente: se puede volver a correr.
-- ============================================================

-- ------------------------------------------------------------
-- PEDIDOS
-- `order_number` es un correlativo legible (#1, #2, …) para citar
-- en WhatsApp: un UUID no se puede dictar por teléfono.
--
-- `customer_id` admite NULL a propósito: se puede comprar sin
-- cuenta, igual que hoy. En ese caso el nombre y el teléfono
-- quedan en las columnas guest_*.
-- ------------------------------------------------------------
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   bigint generated always as identity,

  customer_id    uuid references public.profiles(id) on delete set null,
  guest_name     text,
  guest_phone    text,

  province       text not null,
  city           text not null,
  notes          text,

  -- Cifras congeladas al momento de la compra. Si mañana cambia el
  -- ITBMS o el flete, los pedidos viejos siguen cuadrando.
  subtotal       numeric(10,2) not null,
  shipping       numeric(10,2) not null default 0,
  tax            numeric(10,2) not null default 0,
  total          numeric(10,2) not null,

  payment_method text not null,
  payment_ref    text,          -- id de transacción cuando entre la pasarela

  status         text not null default 'pending'
                 check (status in ('pending','confirmed','paid','delivered','cancelled')),

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_created_at_idx  on public.orders (created_at desc);
create index if not exists orders_status_idx      on public.orders (status);

-- ------------------------------------------------------------
-- RENGLONES
-- El nombre y el precio se guardan COPIADOS, no por referencia:
-- si mañana sube el precio de una tela, el pedido de hace un mes
-- tiene que seguir mostrando lo que el cliente realmente pagó.
-- ------------------------------------------------------------
create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  text not null,
  product_name text not null,
  unit_price  numeric(10,2) not null,
  qty         integer not null check (qty > 0),
  line_total  numeric(10,2) generated always as (unit_price * qty) stored
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- RLS — PEDIDOS
-- ------------------------------------------------------------

-- El cliente ve los suyos; el personal ve todos.
drop policy if exists "ver pedidos propios o personal" on public.orders;
create policy "ver pedidos propios o personal"
  on public.orders for select
  to authenticated
  using (customer_id = auth.uid() or public.is_staff());

-- Con sesión: solo puede crear pedidos a su propio nombre (o sin dueño).
drop policy if exists "crear pedido propio" on public.orders;
create policy "crear pedido propio"
  on public.orders for insert
  to authenticated
  with check (customer_id = auth.uid() or customer_id is null);

-- Sin sesión (compra de invitado): puede insertar, pero NUNCA
-- atribuirse el pedido a la cuenta de otro, y no puede leer nada.
drop policy if exists "invitado crea pedido sin dueño" on public.orders;
create policy "invitado crea pedido sin dueño"
  on public.orders for insert
  to anon
  with check (customer_id is null);

-- Solo el personal mueve el estado del pedido.
drop policy if exists "personal actualiza pedidos" on public.orders;
create policy "personal actualiza pedidos"
  on public.orders for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ------------------------------------------------------------
-- RLS — RENGLONES  (siguen el permiso de su pedido)
-- ------------------------------------------------------------
drop policy if exists "ver renglones de pedidos visibles" on public.order_items;
create policy "ver renglones de pedidos visibles"
  on public.order_items for select
  to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.customer_id = auth.uid() or public.is_staff())
  ));

drop policy if exists "crear renglones de pedido propio" on public.order_items;
create policy "crear renglones de pedido propio"
  on public.order_items for insert
  to authenticated
  with check (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.customer_id = auth.uid() or o.customer_id is null)
  ));

drop policy if exists "invitado crea renglones" on public.order_items;
create policy "invitado crea renglones"
  on public.order_items for insert
  to anon
  with check (exists (
    select 1 from public.orders o where o.id = order_id and o.customer_id is null
  ));

-- ============================================================
-- VISTAS DE REPORTE
-- security_invoker = true hace que la vista respete el RLS de quien
-- consulta: el personal ve el negocio completo y un cliente solo lo
-- suyo, sin necesidad de duplicar reglas aquí.
--
-- Los pedidos 'cancelled' nunca cuentan como venta.
-- ============================================================

-- Ventas por día.
drop view if exists public.revenue_daily;
create view public.revenue_daily
with (security_invoker = true) as
select
  date_trunc('day', created_at)::date as day,
  count(*)                            as orders,
  sum(subtotal)                       as subtotal,
  sum(shipping)                       as shipping,
  sum(tax)                            as itbms,
  sum(total)                          as total
from public.orders
where status <> 'cancelled'
group by 1
order by 1 desc;

-- Clientes que más compran: la base del programa de lealtad.
drop view if exists public.customer_lifetime_value;
create view public.customer_lifetime_value
with (security_invoker = true) as
select
  o.customer_id,
  p.full_name,
  p.email,
  p.phone,
  p.company_name,
  count(*)                as orders,
  sum(o.total)            as lifetime_total,
  round(avg(o.total), 2)  as avg_order,
  max(o.created_at)       as last_order_at
from public.orders o
join public.profiles p on p.id = o.customer_id
where o.status <> 'cancelled'
group by o.customer_id, p.full_name, p.email, p.phone, p.company_name
order by lifetime_total desc;

-- Productos más vendidos.
drop view if exists public.product_sales;
create view public.product_sales
with (security_invoker = true) as
select
  i.product_id,
  i.product_name,
  sum(i.qty)          as units,
  sum(i.line_total)   as revenue,
  count(distinct i.order_id) as orders
from public.order_items i
join public.orders o on o.id = i.order_id
where o.status <> 'cancelled'
group by i.product_id, i.product_name
order by revenue desc;

-- ============================================================
-- CREAR PEDIDO (RPC)
--
-- Por qué una función y no dos inserts desde el cliente:
--
-- 1. ATOMICIDAD. Si el insert de renglones falla después del de
--    cabecera, quedaría un pedido fantasma sin productos.
--
-- 2. RLS. La política de order_items consulta `orders`, y un
--    invitado (rol anon) no tiene permiso de lectura ahí — la
--    subconsulta le devolvería vacío y sus renglones se
--    rechazarían en silencio. SECURITY DEFINER evita ese enredo.
--
-- 3. UNA SOLA VUELTA a la red, que importa porque esto corre
--    antes de abrir WhatsApp.
--
-- Al ser SECURITY DEFINER se salta RLS, así que la validación va
-- explícita abajo: nadie puede crear un pedido a nombre de otro.
-- ============================================================
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

  insert into public.order_items (order_id, product_id, product_name, unit_price, qty)
  select v_id,
         item ->> 'product_id',
         item ->> 'product_name',
         (item ->> 'unit_price')::numeric,
         (item ->> 'qty')::integer
  from jsonb_array_elements(p_items) as item;

  return query select v_id, v_num;
end;
$$;

revoke all on function public.create_order(uuid,text,text,text,text,text,numeric,numeric,numeric,numeric,text,jsonb) from public;
grant execute on function public.create_order(uuid,text,text,text,text,text,numeric,numeric,numeric,numeric,text,jsonb) to anon, authenticated;
