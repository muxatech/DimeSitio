-- Founder price variants: 39€ (existing) and 69€ (new)
-- Keep 'founder' for backward compat, add explicit founder_39 / founder_69

alter table restaurants drop constraint if exists restaurants_plan_type_check;
alter table restaurants add constraint restaurants_plan_type_check check (plan_type in ('standard', 'founder', 'founder_39', 'founder_69'));

-- Backfill existing 'founder' to 'founder_39' for explicitness
update restaurants set plan_type = 'founder_39' where plan_type = 'founder';
