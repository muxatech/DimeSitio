-- Assign founder_rank to existing restaurants on the founder plan that missed it
do $$
declare
  r record;
  next_rank int;
begin
  select coalesce(max(founder_rank), 0) + 1 into next_rank
  from restaurants
  where founder_rank is not null;

  for r in
    select id
    from restaurants
    where plan_type = 'founder'
      and founder_rank is null
    order by created_at
  loop
    exit when next_rank > 100;
    update restaurants set founder_rank = next_rank where id = r.id;
    next_rank := next_rank + 1;
  end loop;
end $$;
