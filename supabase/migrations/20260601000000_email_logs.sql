create table email_logs (
  id uuid default gen_random_uuid() primary key,
  to_email text not null,
  type text not null,
  restaurant_id uuid references restaurants(id) on delete set null,
  status text not null,
  error text,
  created_at timestamptz default now()
);
