-- Quick Bite initial schema
create extension if not exists "uuid-ossp";

do $$ begin
  create type order_status as enum ('placed','acknowledged','in_kitchen','ready','served','cancelled');
exception when duplicate_object then null; end $$;

create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  locale_default text not null default 'en',
  tax_rate numeric(5,2) not null default 10.00,
  service_charge numeric(5,2) not null default 0.00,
  created_at timestamptz not null default now()
);

create table if not exists tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  code text not null,
  display_name text,
  unique (restaurant_id, code)
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name_i18n jsonb not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name_i18n jsonb not null,
  description_i18n jsonb,
  price_jpy int not null,
  allergens text[],
  image_path text,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists option_groups (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name_i18n jsonb not null,
  min_select int not null default 0,
  max_select int not null default 1
);

create table if not exists item_option_groups (
  item_id uuid references items(id) on delete cascade,
  group_id uuid references option_groups(id) on delete cascade,
  sort_order int not null default 0,
  primary key (item_id, group_id)
);

create table if not exists options (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references option_groups(id) on delete cascade,
  name_i18n jsonb not null,
  price_delta_jpy int not null default 0,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  table_id uuid not null references tables(id),
  table_code text not null,
  locale text not null,
  status order_status not null default 'placed',
  subtotal_jpy int not null,
  tax_jpy int not null,
  service_charge_jpy int not null default 0,
  total_jpy int not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  item_id uuid references items(id),
  name_snapshot text not null,
  quantity int not null,
  base_price_jpy int not null,
  line_total_jpy int not null
);

create table if not exists order_item_options (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references order_items(id) on delete cascade,
  name_snapshot text not null,
  price_delta_jpy int not null
);

create table if not exists order_events (
  id bigserial primary key,
  order_id uuid not null references orders(id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  actor_role text not null,
  actor_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists staff_users (
  id uuid primary key,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  role text not null,
  display_name text
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role text not null,
  restaurant_id uuid references restaurants(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function log_order_status_change()
returns trigger as $$
begin
  if new.status is distinct from old.status then
    insert into order_events(order_id, from_status, to_status, actor_role)
    values (new.id, old.status, new.status, 'system');
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_order_status_change on orders;
create trigger trg_order_status_change
after update on orders
for each row execute function log_order_status_change();


