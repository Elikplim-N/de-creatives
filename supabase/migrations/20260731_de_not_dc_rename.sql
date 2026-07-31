-- Corrects a leftover "DC" naming inconsistency from an earlier copy-paste
-- (the brand is DE Creatives, not DC) in any live product rows that still
-- carry the old prefix/wording. Safe to run multiple times - a no-op once
-- everything's already renamed.

update public.de_products
set
  sku = regexp_replace(sku, '^DC-', 'DE-'),
  name = regexp_replace(name, '\bDC\b', 'DE', 'g'),
  description = regexp_replace(description, '\bDC\b', 'DE', 'g')
where sku like 'DC-%' or name like '%DC %' or description like '%DC %';
