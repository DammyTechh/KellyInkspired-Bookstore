-- ============================================================================
-- FIX: "File upload failed" / 400 (Bad Request) when uploading book covers or
-- book files from the admin panel.
--
-- Cause: the storage buckets and/or the storage RLS policies were not fully
-- created (the earlier migration stopped at the first storage policy). This
-- recreates the buckets and the policies. Safe to run anytime.
-- ============================================================================

-- 1) Make sure the buckets exist (and have the right public/private flag).
insert into storage.buckets (id, name, public)
values
  ('book-covers', 'book-covers', true),
  ('blog-media',  'blog-media',  true),
  ('book-files',  'book-files',  false)
on conflict (id) do update set public = excluded.public;

-- 2) Reset our storage policies (drop first so this is re-runnable).
drop policy if exists "storage: public read covers" on storage.objects;
drop policy if exists "storage: admin write"        on storage.objects;
drop policy if exists "storage: admin update"       on storage.objects;
drop policy if exists "storage: admin delete"       on storage.objects;

-- Anyone may READ the public buckets (covers + blog media).
create policy "storage: public read covers"
  on storage.objects for select
  using (bucket_id in ('book-covers','blog-media'));

-- Only admins may WRITE to any of our buckets.
create policy "storage: admin write"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('book-covers','blog-media','book-files')
    and public.is_admin()
  );

create policy "storage: admin update"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('book-covers','blog-media','book-files')
    and public.is_admin()
  );

create policy "storage: admin delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('book-covers','blog-media','book-files')
    and public.is_admin()
  );

-- 3) Quick checks ------------------------------------------------------------
-- Buckets (should list book-covers, blog-media, book-files):
select id, public from storage.buckets order by id;

-- Our storage policies (should list the 4 above):
select policyname, cmd
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and policyname like 'storage:%'
order by policyname;
