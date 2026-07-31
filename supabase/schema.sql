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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ORDERS TABLE (For checkout logging)
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
create policy "Allow public read access to testimonials"
  on public.de_testimonials for select
  using (true);

create policy "Allow authenticated admin write access to testimonials"
  on public.de_testimonials for all
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
-- SEED DATA (MOCK DATA CORRESPONDENCE)
-- ========================================================

-- Insert Categories
insert into public.de_categories (id, name, slug, description) values
('cat-1', 'Streetwear', 'streetwear', 'Bold, urban-inspired pieces that make a statement.'),
('cat-2', 'Essentials', 'essentials', 'Premium basics engineered for everyday luxury.'),
('cat-3', 'Limited Edition', 'limited-edition', 'Exclusive drops with limited-run designs.'),
('cat-4', 'Accessories', 'accessories', 'The details that define your look.');

-- Insert Products
insert into public.de_products (id, sku, name, category_id, price, compare_price, description, colors, color_names, sizes, stock, is_new, is_featured, is_bestseller, rating, review_count, images) values
('p-001', 'DC-SW-001', 'DC Signature Tee — Black', 'cat-1', 89.99, 120.00, 'The original. Ultra-soft premium cotton, oversized silhouette. The iconic DC Creatives logo printed front-centre. This is what started it all.', array['#0A0A0A', '#FAFAFA'], array['Phantom Black', 'Clean White'], array['XS', 'S', 'M', 'L', 'XL', 'XXL'], 47, true, true, false, 4.80, 124, array['/products/tee-black-girl-tree.jpg', '/products/tee-black-girl-smile.jpg']),
('p-002', 'DC-ES-002', 'DC Classic Tee — White', 'cat-2', 64.99, null, 'Walk by faith. Clean white oversized tee with the DC Creatives vertical back print. A wardrobe cornerstone built for everyday wear.', array['#FAFAFA', '#0A0A0A'], array['Clean White', 'Phantom Black'], array['XS', 'S', 'M', 'L', 'XL'], 83, false, true, true, 4.90, 287, array['/products/tee-white-back.jpg', '/products/tee-duo-white-black.jpg']),
('p-003', 'DC-LE-003', 'DC Bracket Logo Tee', 'cat-3', 219.99, null, 'Limited run. The bracket-frame DC Creatives logo in full teal-and-white on deep black. Only available while stock lasts — collector''s status guaranteed.', array['#0A0A0A'], array['Void Black'], array['S', 'M', 'L', 'XL'], 12, true, true, false, 5.00, 41, array['/products/tee-black-girl-palm.jpg', '/products/tee-black-girl-garden.jpg']),
('p-004', 'DC-SW-004', 'DC Duo Set — His & Hers', 'cat-1', 149.99, 200.00, 'Two iconic DC Creatives tees in one set. White and black, both with signature logo prints. Perfect for couples or as a gift.', array['#FAFAFA', '#0A0A0A'], array['White + Black Set'], array['S/S', 'M/M', 'L/L', 'S/M', 'M/L'], 29, false, false, true, 4.70, 98, array['/products/tee-duo-white-black.jpg', '/products/tee-black-duo-girls.jpg']),
('p-005', 'DC-ES-005', 'DC Relaxed Fit Tee — Black', 'cat-2', 74.99, null, 'Relaxed silhouette, premium weight cotton. The DC bracket logo sits clean at the chest. Pairs with everything.', array['#0A0A0A'], array['Jet Black'], array['XS', 'S', 'M', 'L', 'XL'], 62, false, true, false, 4.70, 153, array['/products/tee-black-girl-smile2.jpg', '/products/tee-black-girl-smile.jpg']),
('p-006', 'DC-LE-006', 'DC Girls Collection Drop', 'cat-3', 89.99, 110.00, 'Shot in the garden. The DC Creatives women''s cut — slightly cropped, soft cotton, full logo print. Limited seasonal drop.', array['#0A0A0A'], array['Jet Black'], array['XS', 'S', 'M', 'L'], 38, true, false, false, 4.50, 76, array['/products/tee-black-girl-grass.jpg', '/products/tee-black-girl-palm.jpg']),
('p-007', 'DC-SW-007', 'DC Duo — Two Friends Edition', 'cat-1', 159.99, null, 'Two DC Creatives tees, two different logo placements. Shot together, worn together. Limited friendship edition.', array['#0A0A0A'], array['Black Duo'], array['S/S', 'M/M', 'L/L', 'M/L'], 22, false, false, true, 4.80, 64, array['/products/tee-black-duo-girls.jpg', '/products/tee-black-girl-tree.jpg']),
('p-008', 'DC-ES-008', 'DC Garden Series Tee', 'cat-2', 79.99, null, 'Lush. Tropical. DE Creatives. Shot in the garden series — the DC bracket logo pops bold against the greens. Premium 300GSM cotton.', array['#0A0A0A'], array['Jet Black'], array['XS', 'S', 'M', 'L', 'XL'], 55, false, false, true, 4.80, 218, array['/products/tee-black-girl-garden.jpg', '/products/tee-black-girl-smile2.jpg']);

-- Insert Testimonials
insert into public.de_testimonials (name, location, text, rating, avatar) values
('Kwame A.', 'Accra, Ghana', 'DE Creatives completely changed how I approach fashion. The quality is unreal — these pieces are investment-grade.', 5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80'),
('Zara M.', 'Lagos, Nigeria', 'The bracket logo tee is the most premium item I own. Worth every cedi. Will be ordering again.', 5, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80'),
('Olu B.', 'London, UK', 'Fast shipping, incredible packaging, and the fits are exactly as advertised. DE Creatives is the real deal.', 5, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80');
