-- Cash payment distinguible manteniendo status=active (opción A)
alter table subscriptions add column if not exists payment_method text check (payment_method in ('stripe','cash')) default 'stripe';
-- Backfill existing rows
update subscriptions set payment_method = 'stripe' where payment_method is null;
