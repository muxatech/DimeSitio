-- =============================================================
-- Fase 0: Fundación — Schema inicial
-- =============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------
-- 1. categories
-- -----------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------
-- 2. restaurants
-- -----------------------------------------------------------
create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  description text,
  phone text,
  address text,
  city text not null default 'Valencia',
  lat numeric,
  lng numeric,
  price_level int not null check (price_level between 1 and 3),
  image_url text,
  menu_url text,
  zone text,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------
-- 3. restaurant_categories (M:N)
-- -----------------------------------------------------------
create table if not exists restaurant_categories (
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (restaurant_id, category_id)
);

-- -----------------------------------------------------------
-- 4. subscriptions
-- -----------------------------------------------------------
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null unique references restaurants(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive'
    check (status in ('active', 'inactive', 'past_due', 'canceled')),
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------
-- 5. impressions
-- -----------------------------------------------------------
create table if not exists impressions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------
-- 6. selections
-- -----------------------------------------------------------
create table if not exists selections (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  session_id text not null,
  round int not null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------
-- 7. calls
-- -----------------------------------------------------------
create table if not exists calls (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now()
);

-- =============================================================
-- Índices
-- =============================================================

create index if not exists idx_restaurants_active on restaurants (active) where active = true;
create index if not exists idx_restaurants_city on restaurants (city);
create index if not exists idx_restaurants_owner on restaurants (owner_id);
create index if not exists idx_restaurants_zone on restaurants (zone);
create index if not exists idx_restaurants_price_level on restaurants (price_level);

create index if not exists idx_subscriptions_status on subscriptions (status);
create index if not exists idx_subscriptions_restaurant on subscriptions (restaurant_id);

create index if not exists idx_impressions_restaurant on impressions (restaurant_id);
create index if not exists idx_impressions_session on impressions (session_id);
create index if not exists idx_impressions_created on impressions (created_at);

create index if not exists idx_selections_restaurant on selections (restaurant_id);
create index if not exists idx_selections_session on selections (session_id);
create index if not exists idx_selections_round on selections (round);

create index if not exists idx_calls_restaurant on calls (restaurant_id);
create index if not exists idx_calls_session on calls (session_id);

-- =============================================================
-- RLS — Seguridad por defecto
-- =============================================================

-- restaurants
alter table restaurants enable row level security;

create policy "Todos pueden leer restaurantes activos"
  on restaurants for select
  using (active = true);

create policy "Dueño puede leer sus restaurantes"
  on restaurants for select
  using (auth.uid() = owner_id);

create policy "Dueño puede crear restaurantes"
  on restaurants for insert
  with check (auth.uid() = owner_id);

create policy "Dueño puede modificar sus restaurantes"
  on restaurants for update
  using (auth.uid() = owner_id);

create policy "Dueño puede eliminar sus restaurantes"
  on restaurants for delete
  using (auth.uid() = owner_id);

-- categories
alter table categories enable row level security;

create policy "Todos pueden leer categorías"
  on categories for select
  using (true);

create policy "Solo autenticados pueden crear categorías"
  on categories for insert
  with check (auth.role() = 'authenticated');

create policy "Solo autenticados pueden modificar categorías"
  on categories for update
  using (auth.role() = 'authenticated');

create policy "Solo autenticados pueden eliminar categorías"
  on categories for delete
  using (auth.role() = 'authenticated');

-- restaurant_categories
alter table restaurant_categories enable row level security;

create policy "Todos pueden leer relaciones"
  on restaurant_categories for select
  using (true);

create policy "Dueño puede gestionar categorías de sus restaurantes"
  on restaurant_categories for insert
  with check (
    exists (
      select 1 from restaurants
      where id = restaurant_id and owner_id = auth.uid()
    )
  );

create policy "Dueño puede eliminar categorías de sus restaurantes"
  on restaurant_categories for delete
  using (
    exists (
      select 1 from restaurants
      where id = restaurant_id and owner_id = auth.uid()
    )
  );

-- subscriptions
alter table subscriptions enable row level security;

create policy "Dueño puede ver su suscripción"
  on subscriptions for select
  using (
    exists (
      select 1 from restaurants
      where id = restaurant_id and owner_id = auth.uid()
    )
  );

create policy "Service role puede gestionar suscripciones"
  on subscriptions for all
  using (auth.role() = 'service_role');

-- impressions
alter table impressions enable row level security;

create policy "Anónimos pueden registrar impresiones"
  on impressions for insert
  with check (true);

create policy "Dueño puede ver impresiones de sus restaurantes"
  on impressions for select
  using (
    exists (
      select 1 from restaurants
      where id = restaurant_id and owner_id = auth.uid()
    )
  );

-- selections
alter table selections enable row level security;

create policy "Anónimos pueden registrar selecciones"
  on selections for insert
  with check (true);

create policy "Dueño puede ver selecciones de sus restaurantes"
  on selections for select
  using (
    exists (
      select 1 from restaurants
      where id = restaurant_id and owner_id = auth.uid()
    )
  );

-- calls
alter table calls enable row level security;

create policy "Anónimos pueden registrar llamadas"
  on calls for insert
  with check (true);

create policy "Dueño puede ver llamadas de sus restaurantes"
  on calls for select
  using (
    exists (
      select 1 from restaurants
      where id = restaurant_id and owner_id = auth.uid()
    )
  );
