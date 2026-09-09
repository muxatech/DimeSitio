-- Stats realtime para muro <1s

do $$ begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter table if exists page_views replica identity default;
alter table if exists question_views replica identity default;
alter table if exists cta_clicks replica identity default;
alter table if exists impressions replica identity default;
alter table if exists selections replica identity default;
alter table if exists flow_starts replica identity default;
alter table if exists calls replica identity default;

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='page_views') then
    alter publication supabase_realtime add table page_views;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='question_views') then
    alter publication supabase_realtime add table question_views;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='cta_clicks') then
    alter publication supabase_realtime add table cta_clicks;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='impressions') then
    alter publication supabase_realtime add table impressions;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='selections') then
    alter publication supabase_realtime add table selections;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='flow_starts') then
    alter publication supabase_realtime add table flow_starts;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='calls') then
    alter publication supabase_realtime add table calls;
  end if;
end $$;

drop policy if exists "Staff puede leer impressions" on impressions;
create policy "Staff puede leer impressions"
  on impressions for select using (exists (select 1 from staff_users where user_id = auth.uid()));

drop policy if exists "Staff puede leer selections" on selections;
create policy "Staff puede leer selections"
  on selections for select using (exists (select 1 from staff_users where user_id = auth.uid()));

drop policy if exists "Staff puede leer calls" on calls;
create policy "Staff puede leer calls"
  on calls for select using (exists (select 1 from staff_users where user_id = auth.uid()));

drop policy if exists "Staff puede leer flow_starts" on flow_starts;
create policy "Staff puede leer flow_starts"
  on flow_starts for select using (exists (select 1 from staff_users where user_id = auth.uid()));
