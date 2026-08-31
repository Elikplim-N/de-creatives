-- ========================================================
-- 6. SUBSCRIBERS TABLE (Clan & Newsletter Members)
-- ========================================================

create table if not exists public.de_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  type text default 'all' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.de_subscribers enable row level security;

-- Allow public insert (anyone can join the clan)
create policy "Allow public insert on de_subscribers"
  on public.de_subscribers for insert
  to anon, authenticated
  with check (true);

-- Allow authenticated admins to view/manage all subscribers
create policy "Allow authenticated admin full access on de_subscribers"
  on public.de_subscribers for all
  to authenticated
  using (true)
  with check (true);
