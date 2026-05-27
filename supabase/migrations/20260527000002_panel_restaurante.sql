-- =============================================================
-- Fase 2: Panel Restaurante
-- =============================================================

-- -----------------------------------------------------------
-- 1. restaurant_admins — relación N:M usuarios ↔ restaurantes
-- -----------------------------------------------------------
create table if not exists restaurant_admins (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'manager')),
  created_at timestamptz not null default now(),
  unique(restaurant_id, user_id)
);

-- -----------------------------------------------------------
-- 2. flow_starts — inicios de flujo (tracking)
-- -----------------------------------------------------------
create table if not exists flow_starts (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------
-- Índices
-- -----------------------------------------------------------
create index if not exists idx_restaurant_admins_user on restaurant_admins(user_id);
create index if not exists idx_restaurant_admins_restaurant on restaurant_admins(restaurant_id);
create index if not exists idx_flow_starts_session on flow_starts(session_id);

-- =============================================================
-- RLS — restaurant_admins
-- =============================================================
alter table restaurant_admins enable row level security;

create policy "Usuario puede ver sus registros en restaurant_admins"
  on restaurant_admins for select
  using (auth.uid() = user_id);

create policy "Owner puede invitar managers"
  on restaurant_admins for insert
  with check (
    exists (
      select 1 from restaurant_admins ra
      where ra.restaurant_id = restaurant_id
      and ra.user_id = auth.uid()
      and ra.role = 'owner'
    )
  );

create policy "Owner puede eliminar admins de su restaurante"
  on restaurant_admins for delete
  using (
    exists (
      select 1 from restaurant_admins ra
      where ra.restaurant_id = restaurant_id
      and ra.user_id = auth.uid()
      and ra.role = 'owner'
    )
  );

create policy "Service role full access restaurant_admins"
  on restaurant_admins for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- =============================================================
-- RLS — flow_starts
-- =============================================================
alter table flow_starts enable row level security;

create policy "Anónimos pueden insertar flow_starts"
  on flow_starts for insert
  with check (true);

create policy "Admin puede leer flow_starts de sus restaurantes"
  on flow_starts for select
  using (
    exists (
      select 1 from restaurant_admins ra
      join restaurants r on r.id = ra.restaurant_id
      where ra.user_id = auth.uid()
    )
  );

-- =============================================================
-- ACTUALIZAR POLICIES EXISTENTES — Migrar de owner_id a restaurant_admins
-- =============================================================

-- Drop policies antiguas basadas en owner_id
drop policy if exists "Dueño puede leer sus restaurantes" on restaurants;
drop policy if exists "Dueño puede crear restaurantes" on restaurants;
drop policy if exists "Dueño puede modificar sus restaurantes" on restaurants;
drop policy if exists "Dueño puede eliminar sus restaurantes" on restaurants;

drop policy if exists "Dueño puede gestionar categorías de sus restaurantes" on restaurant_categories;
drop policy if exists "Dueño puede eliminar categorías de sus restaurantes" on restaurant_categories;

drop policy if exists "Dueño puede ver su suscripción" on subscriptions;

drop policy if exists "Dueño puede ver impresiones de sus restaurantes" on impressions;
drop policy if exists "Dueño puede ver selecciones de sus restaurantes" on selections;
drop policy if exists "Dueño puede ver llamadas de sus restaurantes" on calls;

-- restaurants: SELECT (público activos + admins)
create policy "Admin puede leer restaurantes"
  on restaurants for select
  using (
    exists (
      select 1 from restaurant_admins ra
      where ra.restaurant_id = id
      and ra.user_id = auth.uid()
    )
  );

-- restaurants: INSERT (se añade como owner en la EF)
create policy "Usuario autenticado puede crear restaurantes"
  on restaurants for insert
  with check (auth.uid() = owner_id);

-- restaurants: UPDATE
create policy "Admin puede modificar restaurantes"
  on restaurants for update
  using (
    exists (
      select 1 from restaurant_admins ra
      where ra.restaurant_id = id
      and ra.user_id = auth.uid()
    )
  );

-- restaurants: DELETE (solo owner)
create policy "Owner puede eliminar restaurantes"
  on restaurants for delete
  using (
    exists (
      select 1 from restaurant_admins ra
      where ra.restaurant_id = id
      and ra.user_id = auth.uid()
      and ra.role = 'owner'
    )
  );

-- restaurant_categories
create policy "Admin puede gestionar categorías"
  on restaurant_categories for insert
  with check (
    exists (
      select 1 from restaurant_admins ra
      where ra.restaurant_id = restaurant_id
      and ra.user_id = auth.uid()
    )
  );

create policy "Admin puede eliminar categorías"
  on restaurant_categories for delete
  using (
    exists (
      select 1 from restaurant_admins ra
      where ra.restaurant_id = restaurant_id
      and ra.user_id = auth.uid()
    )
  );

-- subscriptions
create policy "Admin puede ver suscripción de sus restaurantes"
  on subscriptions for select
  using (
    exists (
      select 1 from restaurant_admins ra
      where ra.restaurant_id = restaurant_id
      and ra.user_id = auth.uid()
    )
  );

-- impressions
create policy "Admin puede ver impresiones de sus restaurantes"
  on impressions for select
  using (
    exists (
      select 1 from restaurant_admins ra
      where ra.restaurant_id = restaurant_id
      and ra.user_id = auth.uid()
    )
  );

-- selections
create policy "Admin puede ver selecciones de sus restaurantes"
  on selections for select
  using (
    exists (
      select 1 from restaurant_admins ra
      where ra.restaurant_id = restaurant_id
      and ra.user_id = auth.uid()
    )
  );

-- calls
create policy "Admin puede ver llamadas de sus restaurantes"
  on calls for select
  using (
    exists (
      select 1 from restaurant_admins ra
      where ra.restaurant_id = restaurant_id
      and ra.user_id = auth.uid()
    )
  );

-- =============================================================
-- Storage: bucket restaurant-images
-- Ejecutar en Supabase SQL Editor o dashboard:
--
-- insert into storage.buckets (id, name, public)
-- values ('restaurant-images', 'restaurant-images', true);
--
-- Policy: Public read
-- create policy "Public read"
--   on storage.objects for select
--   using (bucket_id = 'restaurant-images');
--
-- Policy: Authenticated owner upload
-- create policy "Owner upload"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'restaurant-images'
--     and auth.role() = 'authenticated'
--   );
-- =============================================================
