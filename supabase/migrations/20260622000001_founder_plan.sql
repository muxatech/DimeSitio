alter table restaurants
  add column plan_type text not null default 'standard'
  check (plan_type in ('standard', 'founder'));

alter table subscriptions
  drop constraint if exists subscriptions_status_check;

alter table subscriptions
  add constraint subscriptions_status_check
  check (status in ('active', 'inactive', 'past_due', 'canceled', 'founder_pending'));
