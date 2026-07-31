-- Turns de_testimonials from a static seeded display into a real,
-- moderated review system: customers can submit, admins approve before
-- anything shows publicly. Safe to run multiple times.

alter table public.de_testimonials
  add column if not exists is_approved boolean default false not null;

-- Existing seeded/demo rows were never real customer reviews - hide them
-- rather than have them appear "approved" by default. Delete this block
-- instead if you'd rather keep them as approved sample content.
update public.de_testimonials set is_approved = false where is_approved is null;

drop policy if exists "Allow public read access to testimonials" on public.de_testimonials;
drop policy if exists "Allow authenticated admin write access to testimonials" on public.de_testimonials;
drop policy if exists "Allow public read access to approved testimonials" on public.de_testimonials;
drop policy if exists "Allow public insert of unapproved testimonials" on public.de_testimonials;
drop policy if exists "Allow authenticated admin full access to testimonials" on public.de_testimonials;

create policy "Allow public read access to approved testimonials"
  on public.de_testimonials for select
  using (is_approved = true);

create policy "Allow public insert of unapproved testimonials"
  on public.de_testimonials for insert
  with check (is_approved = false);

create policy "Allow authenticated admin full access to testimonials"
  on public.de_testimonials for all
  to authenticated
  using (true)
  with check (true);
