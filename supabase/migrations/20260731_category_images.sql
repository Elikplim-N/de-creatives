-- Adds an image field to categories so the homepage editorial banner's
-- tiles can be managed from Admin > Categories instead of being hardcoded
-- in the frontend (CategoryBanner.jsx used a fixed image per category id,
-- with no way to change it without editing code). Safe to run multiple
-- times.

alter table public.de_categories
  add column if not exists image text;
