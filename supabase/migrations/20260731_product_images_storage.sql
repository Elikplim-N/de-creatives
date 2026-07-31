-- Sets up a real Storage bucket for product photos, replacing the
-- base64-in-database approach the admin panel used until now. Safe to run
-- multiple times - bucket creation is idempotent and the policy blocks are
-- guarded against duplicates.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Public read access to product images'
  ) then
    create policy "Public read access to product images"
      on storage.objects for select
      using (bucket_id = 'product-images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Authenticated upload of product images'
  ) then
    create policy "Authenticated upload of product images"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'product-images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Authenticated update of product images'
  ) then
    create policy "Authenticated update of product images"
      on storage.objects for update
      to authenticated
      using (bucket_id = 'product-images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Authenticated delete of product images'
  ) then
    create policy "Authenticated delete of product images"
      on storage.objects for delete
      to authenticated
      using (bucket_id = 'product-images');
  end if;
end $$;
