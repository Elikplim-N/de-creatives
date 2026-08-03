-- Homepage hero carousel (image, heading, subheading, CTAs) was hardcoded
-- in the frontend (mockData.js heroSlides) with no way to change it without
-- editing code. This gives it a real table so Admin > Homepage can manage
-- it, matching the pattern already used for category cover images.

create table if not exists public.de_hero_slides (
  id text primary key,
  eyebrow text,
  heading text not null,
  subheading text,
  cta text,
  cta_secondary text,
  image text,
  sort_order integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.de_hero_slides enable row level security;

drop policy if exists "Allow public read access to active hero slides" on public.de_hero_slides;
create policy "Allow public read access to active hero slides"
  on public.de_hero_slides for select
  using (is_active = true);

drop policy if exists "Allow authenticated admin full access to hero slides" on public.de_hero_slides;
create policy "Allow authenticated admin full access to hero slides"
  on public.de_hero_slides for all
  to authenticated
  using (true)
  with check (true);

-- Seed with the slides that used to be hardcoded, so the homepage isn't
-- blank the moment this migration runs. No-op if already seeded.
-- Deliberately no image here - every slide image must be a real file
-- uploaded to Storage through Admin > Homepage, never a path into the
-- frontend's own /public folder. Upload a background photo for each
-- slide from the dashboard after this runs.
insert into public.de_hero_slides (id, eyebrow, heading, subheading, cta, cta_secondary, sort_order, is_active)
select * from (values
  ('hero-1', 'New Arrival — SS26', 'DEFINE YOUR' || chr(10) || 'CREATIVE', 'Premium streetwear engineered for the bold. Made in Africa, worn by the world.', 'Shop Collection', 'Explore Lookbook', 0, true),
  ('hero-2', 'Limited Edition Drop', 'WALK BY' || chr(10) || 'FAITH', 'The iconic white tee. Only 150 pieces. Own a piece of history.', 'Get Yours Now', 'View Details', 1, true),
  ('hero-3', 'The DE Creatives Look', 'WEAR THE' || chr(10) || 'CULTURE', 'Bold prints, premium cotton, zero compromise. This is DE Creatives.', 'Shop Now', 'See Lookbook', 2, true)
) as seed(id, eyebrow, heading, subheading, cta, cta_secondary, sort_order, is_active)
where not exists (select 1 from public.de_hero_slides);
