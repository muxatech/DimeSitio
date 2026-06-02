-- =============================================================
-- Restringir creación/modificación/eliminación de categorías a staff
-- =============================================================

drop policy if exists "Solo autenticados pueden crear categorías" on categories;
drop policy if exists "Solo autenticados pueden modificar categorías" on categories;
drop policy if exists "Solo autenticados pueden eliminar categorías" on categories;

create policy "Solo staff puede crear categorías"
  on categories for insert
  with check (exists (select 1 from staff_users where user_id = auth.uid()));

create policy "Solo staff puede modificar categorías"
  on categories for update
  using (exists (select 1 from staff_users where user_id = auth.uid()));

create policy "Solo staff puede eliminar categorías"
  on categories for delete
  using (exists (select 1 from staff_users where user_id = auth.uid()));
