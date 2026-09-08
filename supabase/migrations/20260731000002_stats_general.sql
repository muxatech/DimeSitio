-- Stats generales + CTA

create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  visitor_id text not null,
  path text not null,
  locale text,
  created_at timestamptz not null default now()
);

create table if not exists question_views (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  question_key text not null check (question_key in ('categories','price','location')),
  q_index int not null,
  created_at timestamptz not null default now()
);

create table if not exists cta_clicks (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  cta_type text not null check (cta_type in ('call','maps','menu','reservations','instagram','winner')),
  session_id text not null,
  path text,
  created_at timestamptz not null default now()
);

create index if not exists idx_page_views_path on page_views(path);
create index if not exists idx_page_views_created on page_views(created_at);
create index if not exists idx_page_views_visitor on page_views(visitor_id);
create index if not exists idx_page_views_session on page_views(session_id);

create index if not exists idx_question_views_key on question_views(question_key);
create index if not exists idx_question_views_created on question_views(created_at);
create index if not exists idx_question_views_session on question_views(session_id);

create index if not exists idx_cta_clicks_restaurant on cta_clicks(restaurant_id);
create index if not exists idx_cta_clicks_type on cta_clicks(cta_type);
create index if not exists idx_cta_clicks_created on cta_clicks(created_at);
create index if not exists idx_cta_clicks_session on cta_clicks(session_id);

alter table page_views enable row level security;
alter table question_views enable row level security;
alter table cta_clicks enable row level security;

create policy "Anónimos pueden registrar page_views"
  on page_views for insert with check (true);
create policy "Staff puede leer page_views"
  on page_views for select using (
    exists (select 1 from staff_users where user_id = auth.uid())
  );

create policy "Anónimos pueden registrar question_views"
  on question_views for insert with check (true);
create policy "Staff puede leer question_views"
  on question_views for select using (
    exists (select 1 from staff_users where user_id = auth.uid())
  );

create policy "Anónimos pueden registrar cta_clicks"
  on cta_clicks for insert with check (true);
create policy "Staff puede leer cta_clicks"
  on cta_clicks for select using (
    exists (select 1 from staff_users where user_id = auth.uid())
  );
create policy "Admin puede leer cta_clicks de sus restaurantes"
  on cta_clicks for select using (
    exists (
      select 1 from restaurant_admins ra
      where ra.restaurant_id = cta_clicks.restaurant_id
      and ra.user_id = auth.uid()
    )
  );
