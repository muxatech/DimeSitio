-- Demo/Founder badges for restaurants
alter table restaurants add column if not exists is_demo boolean not null default false;
alter table restaurants add column if not exists founder_rank integer;

-- Only non-demo restaurants can have a founder rank
create unique index if not exists idx_restaurants_founder_rank on restaurants (founder_rank) where founder_rank is not null;
