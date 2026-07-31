-- Fixes de_orders to match what the checkout flow (CartDrawer.jsx) actually
-- writes. The original schema only had total_amount (not null, no default)
-- and no shipping_address/payment_method/subtotal/shipping/total columns,
-- so every real checkout insert was failing. Safe to run multiple times.

alter table public.de_orders
  add column if not exists order_number text,
  add column if not exists shipping_address text,
  add column if not exists payment_method text default 'cod',
  add column if not exists subtotal numeric(10, 2),
  add column if not exists shipping numeric(10, 2) default 0,
  add column if not exists total numeric(10, 2);

-- Backfill any pre-existing rows so the new not-null-style constraints below
-- don't choke on old data (there likely are none, since inserts were failing).
update public.de_orders
set order_number = coalesce(order_number, 'ord-' || substr(id::text, 1, 6)),
    subtotal = coalesce(subtotal, total_amount, 0),
    total = coalesce(total, total_amount, 0);

alter table public.de_orders
  alter column order_number set not null,
  alter column payment_method set not null,
  alter column subtotal set not null,
  alter column shipping set not null,
  alter column total set not null;

-- total_amount is no longer written by the app; keep the column (harmless)
-- but stop requiring it so it doesn't block inserts.
alter table public.de_orders
  alter column total_amount drop not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'de_orders_order_number_key'
  ) then
    alter table public.de_orders add constraint de_orders_order_number_key unique (order_number);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'de_orders_payment_method_check'
  ) then
    alter table public.de_orders add constraint de_orders_payment_method_check
      check (payment_method in ('momo', 'cod'));
  end if;
end $$;
