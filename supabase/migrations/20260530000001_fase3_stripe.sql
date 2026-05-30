-- =============================================================
-- Fase 3: Stripe + Flujo Staff
-- =============================================================

-- -----------------------------------------------------------
-- 1. staff_users
-- -----------------------------------------------------------
create table if not exists staff_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table staff_users enable row level security;

create policy "Staff puede leerse a sí mismo"
  on staff_users for select
  using (auth.uid() = user_id);

create policy "Service role puede gestionar staff"
  on staff_users for all
  using (auth.role() = 'service_role');

-- -----------------------------------------------------------
-- 2. RLS: restaurants — permitir a staff leer/crear sin ser owner
-- -----------------------------------------------------------

create policy "Staff puede leer restaurantes donde es admin"
  on restaurants for select
  using (
    exists (
      select 1 from restaurant_admins
      where restaurant_id = id and user_id = auth.uid()
    )
    or exists (
      select 1 from staff_users where user_id = auth.uid()
    )
  );

create policy "Staff puede crear restaurantes"
  on restaurants for insert
  with check (
    exists (select 1 from staff_users where user_id = auth.uid())
  );

create policy "Staff puede modificar restaurantes donde es admin o sin owner"
  on restaurants for update
  using (
    exists (
      select 1 from restaurant_admins
      where restaurant_id = id and user_id = auth.uid()
    )
    or (
      exists (select 1 from staff_users where user_id = auth.uid())
      and owner_id is null
    )
  );

create policy "Staff puede eliminar restaurantes"
  on restaurants for delete
  using (
    exists (select 1 from staff_users where user_id = auth.uid())
  );

-- -----------------------------------------------------------
-- 3. RLS: restaurant_admins — staff puede insertar
-- -----------------------------------------------------------

create policy "Staff puede gestionar admins"
  on restaurant_admins for insert
  with check (
    exists (select 1 from staff_users where user_id = auth.uid())
  );

create policy "Staff puede eliminar admins"
  on restaurant_admins for delete
  using (
    exists (select 1 from staff_users where user_id = auth.uid())
  );

-- -----------------------------------------------------------
-- 4. RLS: restaurant_categories — staff puede gestionar
-- -----------------------------------------------------------

create policy "Staff puede gestionar categorías"
  on restaurant_categories for insert
  with check (
    exists (select 1 from staff_users where user_id = auth.uid())
  );

create policy "Staff puede eliminar categorías"
  on restaurant_categories for delete
  using (
    exists (select 1 from staff_users where user_id = auth.uid())
  );
