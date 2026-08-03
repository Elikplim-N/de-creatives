-- ========================================================
-- DE CREATIVES — DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. CATEGORIES TABLE
create table public.de_categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PRODUCTS TABLE
create table public.de_products (
  id text primary key,
  sku text not null unique,
  name text not null,
  category_id text references public.de_categories(id) on delete set null,
  price numeric(10, 2) not null check (price >= 0),
  compare_price numeric(10, 2) check (compare_price is null or compare_price >= 0),
  description text,
  colors text[] default '{}'::text[] not null,
  color_names text[] default '{}'::text[] not null,
  sizes text[] default '{}'::text[] not null,
  stock integer default 0 not null check (stock >= 0),
  is_new boolean default false not null,
  is_featured boolean default false not null,
  is_bestseller boolean default false not null,
  rating numeric(3, 2) default 5.00 not null check (rating >= 0 and rating <= 5.00),
  review_count integer default 0 not null check (review_count >= 0),
  images text[] default '{}'::text[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TESTIMONIALS TABLE
create table public.de_testimonials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  location text,
  text text not null,
  rating integer default 5 not null check (rating >= 1 and rating <= 5),
  avatar text,
  is_approved boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. HERO SLIDES TABLE (homepage carousel, admin-managed)
create table public.de_hero_slides (
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

-- 5. ORDERS TABLE (For checkout logging)
create table public.de_orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique not null,
  customer_name text not null,
  customer_email text not null,
  shipping_address text,
  payment_method text default 'cod' not null check (payment_method in ('momo', 'cod')),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  shipping numeric(10, 2) not null default 0 check (shipping >= 0),
  total numeric(10, 2) not null check (total >= 0),
  status text default 'pending' not null check (status in ('pending', 'processing', 'shipped', 'cancelled', 'completed')),
  items jsonb not null, -- Stores array of items: [{id, name, size, color, qty, price}]
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

-- Enable RLS on all tables
alter table public.de_categories enable row level security;
alter table public.de_products enable row level security;
alter table public.de_testimonials enable row level security;
alter table public.de_hero_slides enable row level security;
alter table public.de_orders enable row level security;

-- Categories Policies
create policy "Allow public read access to categories"
  on public.de_categories for select
  using (true);

create policy "Allow authenticated admin write access to categories"
  on public.de_categories for all
  to authenticated
  using (true)
  with check (true);

-- Products Policies
create policy "Allow public read access to products"
  on public.de_products for select
  using (true);

create policy "Allow authenticated admin write access to products"
  on public.de_products for all
  to authenticated
  using (true)
  with check (true);

-- Testimonials Policies
-- Public can only ever see approved reviews - pending/rejected ones stay
-- invisible until an admin acts on them.
create policy "Allow public read access to approved testimonials"
  on public.de_testimonials for select
  using (is_approved = true);

-- Anyone can submit a review, but cannot mark it approved themselves -
-- new rows are always forced into the moderation queue.
create policy "Allow public insert of unapproved testimonials"
  on public.de_testimonials for insert
  with check (is_approved = false);

create policy "Allow authenticated admin full access to testimonials"
  on public.de_testimonials for all
  to authenticated
  using (true)
  with check (true);

-- Hero Slides Policies
-- Public only ever sees active slides - inactive ones stay editable in
-- draft without going live on the storefront.
create policy "Allow public read access to active hero slides"
  on public.de_hero_slides for select
  using (is_active = true);

create policy "Allow authenticated admin full access to hero slides"
  on public.de_hero_slides for all
  to authenticated
  using (true)
  with check (true);

-- Orders Policies
create policy "Allow public insert access to orders"
  on public.de_orders for insert
  with check (true);

create policy "Allow authenticated admin read access to orders"
  on public.de_orders for select
  to authenticated
  using (true);

create policy "Allow authenticated admin update access to orders"
  on public.de_orders for update
  to authenticated
  using (true)
  with check (true);

-- ========================================================
-- STORAGE (PRODUCT IMAGES)
-- ========================================================
-- Product photos are uploaded as real files here instead of being stored as
-- base64 text in de_products.images - that approach bloated every row and
-- slowed down every product-list query as the catalog grew.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read access to product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Authenticated upload of product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "Authenticated update of product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

create policy "Authenticated delete of product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

-- ========================================================
-- SEED DATA (MOCK DATA CORRESPONDENCE)
-- ========================================================

-- Seeded rows below intentionally carry no image data. Every image the
-- storefront shows must be a real file in the product-images Storage
-- bucket (uploaded through Admin > Products/Categories/Homepage) - never a
-- path into the frontend's own /public folder, which ships with the
-- deployed bundle rather than living in Storage. Upload real photos for
-- each row through the admin dashboard after seeding.

-- Insert Categories
insert into public.de_categories (id, name, slug, description) values
('cat-1', 'Streetwear', 'streetwear', 'Bold, urban-inspired pieces that make a statement.'),
('cat-2', 'Essentials', 'essentials', 'Premium basics engineered for everyday luxury.'),
('cat-3', 'Limited Edition', 'limited-edition', 'Exclusive drops with limited-run designs.'),
('cat-4', 'Accessories', 'accessories', 'The details that define your look.');

-- Insert Hero Slides
insert into public.de_hero_slides (id, eyebrow, heading, subheading, cta, cta_secondary, sort_order, is_active) values
('hero-1', 'New Arrival — SS26', 'DEFINE YOUR' || chr(10) || 'CREATIVE', 'Premium streetwear engineered for the bold. Made in Africa, worn by the world.', 'Shop Collection', 'Explore Lookbook', 0, true),
('hero-2', 'Limited Edition Drop', 'WALK BY' || chr(10) || 'FAITH', 'The iconic white tee. Only 150 pieces. Own a piece of history.', 'Get Yours Now', 'View Details', 1, true),
('hero-3', 'The DE Creatives Look', 'WEAR THE' || chr(10) || 'CULTURE', 'Bold prints, premium cotton, zero compromise. This is DE Creatives.', 'Shop Now', 'See Lookbook', 2, true);

-- Insert Products
insert into public.de_products (id, sku, name, category_id, price, compare_price, description, colors, color_names, sizes, stock, is_new, is_featured, is_bestseller, rating, review_count) values
('p-001', 'DE-SW-001', 'DE Signature Tee — Black', 'cat-1', 89.99, 120.00, 'The original. Ultra-soft premium cotton, oversized silhouette. The iconic DE Creatives logo printed front-centre. This is what started it all.', array['#0A0A0A', '#FAFAFA'], array['Phantom Black', 'Clean White'], array['XS', 'S', 'M', 'L', 'XL', 'XXL'], 47, true, true, false, 4.80, 124),
('p-002', 'DE-ES-002', 'DE Classic Tee — White', 'cat-2', 64.99, null, 'Walk by faith. Clean white oversized tee with the DE Creatives vertical back print. A wardrobe cornerstone built for everyday wear.', array['#FAFAFA', '#0A0A0A'], array['Clean White', 'Phantom Black'], array['XS', 'S', 'M', 'L', 'XL'], 83, false, true, true, 4.90, 287),
('p-003', 'DE-LE-003', 'DE Bracket Logo Tee', 'cat-3', 219.99, null, 'Limited run. The bracket-frame DE Creatives logo in full teal-and-white on deep black. Only available while stock lasts — collector''s status guaranteed.', array['#0A0A0A'], array['Void Black'], array['S', 'M', 'L', 'XL'], 12, true, true, false, 5.00, 41),
('p-004', 'DE-SW-004', 'DE Duo Set — His & Hers', 'cat-1', 149.99, 200.00, 'Two iconic DE Creatives tees in one set. White and black, both with signature logo prints. Perfect for couples or as a gift.', array['#FAFAFA', '#0A0A0A'], array['White + Black Set'], array['S/S', 'M/M', 'L/L', 'S/M', 'M/L'], 29, false, false, true, 4.70, 98),
('p-005', 'DE-ES-005', 'DE Relaxed Fit Tee — Black', 'cat-2', 74.99, null, 'Relaxed silhouette, premium weight cotton. The DE bracket logo sits clean at the chest. Pairs with everything.', array['#0A0A0A'], array['Jet Black'], array['XS', 'S', 'M', 'L', 'XL'], 62, false, true, false, 4.70, 153),
('p-006', 'DE-LE-006', 'DE Girls Collection Drop', 'cat-3', 89.99, 110.00, 'Shot in the garden. The DE Creatives women''s cut — slightly cropped, soft cotton, full logo print. Limited seasonal drop.', array['#0A0A0A'], array['Jet Black'], array['XS', 'S', 'M', 'L'], 38, true, false, false, 4.50, 76),
('p-007', 'DE-SW-007', 'DE Duo — Two Friends Edition', 'cat-1', 159.99, null, 'Two DE Creatives tees, two different logo placements. Shot together, worn together. Limited friendship edition.', array['#0A0A0A'], array['Black Duo'], array['S/S', 'M/M', 'L/L', 'M/L'], 22, false, false, true, 4.80, 64),
('p-008', 'DE-ES-008', 'DE Garden Series Tee', 'cat-2', 79.99, null, 'Lush. Tropical. DE Creatives. Shot in the garden series — the DE bracket logo pops bold against the greens. Premium 300GSM cotton.', array['#0A0A0A'], array['Jet Black'], array['XS', 'S', 'M', 'L', 'XL'], 55, false, false, true, 4.80, 218);

-- Testimonials are no longer seeded - they come from real customers via the
-- storefront review form and go live only after admin approval.
