-- ============================================================================
-- FIX: "File upload failed" / 400 on the admin book/blog uploads.
--
-- Covers upload to the public "book-covers" bucket; the private book PDF goes
-- to "book-files". If covers work but the PDF fails, the "book-files" bucket is
-- usually missing or was created with a size/MIME restriction. This makes sure
-- all three buckets exist with NO restrictions, and (re)creates the policies.
-- Safe to run anytime.
-- ============================================================================

-- 1) Buckets — create if missing, and clear any size / mime-type restriction.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('book-covers', 'book-covers', true,  null, null),
  ('blog-media',  'blog-media',  true,  null, null),
  ('book-files',  'book-files',  false, null, null)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = null,
      allowed_mime_types = null;

-- 2) Policies — drop then recreate so this is re-runnable.
drop policy if exists "storage: public read covers" on storage.objects;
drop policy if exists "storage: admin write"        on storage.objects;
drop policy if exists "storage: admin update"       on storage.objects;
drop policy if exists "storage: admin delete"       on storage.objects;

create policy "storage: public read covers"
  on storage.objects for select
  using (bucket_id in ('book-covers','blog-media'));

create policy "storage: admin write"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('book-covers','blog-media','book-files') and public.is_admin());

create policy "storage: admin update"
  on storage.objects for update to authenticated
  using (bucket_id in ('book-covers','blog-media','book-files') and public.is_admin());

create policy "storage: admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id in ('book-covers','blog-media','book-files') and public.is_admin());

-- 3) Checks -------------------------------------------------------------------
-- Should list all three buckets, book-files with public = false and no limits:
select id, public, file_size_limit, allowed_mime_types
from storage.buckets order by id;

-- Should list the four storage: policies:
select policyname, cmd
from pg_policies
where schemaname = 'storage' and tablename = 'objects' and policyname like 'storage:%'
order by policyname;
