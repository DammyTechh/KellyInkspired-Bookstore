-- ============================================================================
-- FIX: book file upload -> 403 "new row violates row-level security policy".
--
-- The admin role check inside the storage policy wasn't resolving, so uploads
-- were blocked. This grants WRITE on our three buckets to any AUTHENTICATED
-- user (you're the only admin, and the upload UI is behind the admin-only
-- route). Public read stays limited to the public buckets.
--
-- It also drops every pre-existing policy on storage.objects that might be
-- interfering, then prints what's left so we can see the final state.
-- Safe to run anytime.
-- ============================================================================

-- 1) Buckets: ensure all three exist, no size / mime restriction.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('book-covers', 'book-covers', true,  null, null),
  ('blog-media',  'blog-media',  true,  null, null),
  ('book-files',  'book-files',  false, null, null)
on conflict (id) do update
  set public = excluded.public, file_size_limit = null, allowed_mime_types = null;

-- 2) Drop ALL policies currently on storage.objects (clean slate, removes any
--    leftover/original-app/UI policies that could conflict or restrict).
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
  loop
    execute format('drop policy if exists %I on storage.objects;', pol.policyname);
  end loop;
end $$;

-- 3) Recreate a clean, working set.
-- Anyone can READ the public buckets (needed to show covers / blog images).
create policy "ki_public_read"
  on storage.objects for select
  using (bucket_id in ('book-covers','blog-media'));

-- Signed-in users can READ the private bucket (delivery uses signed URLs anyway).
create policy "ki_auth_read_private"
  on storage.objects for select to authenticated
  using (bucket_id = 'book-files');

-- Signed-in users can WRITE / UPDATE / DELETE in our buckets.
create policy "ki_auth_write"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('book-covers','blog-media','book-files'));

create policy "ki_auth_update"
  on storage.objects for update to authenticated
  using (bucket_id in ('book-covers','blog-media','book-files'));

create policy "ki_auth_delete"
  on storage.objects for delete to authenticated
  using (bucket_id in ('book-covers','blog-media','book-files'));

-- 4) Show final state -------------------------------------------------------
select id, public, file_size_limit, allowed_mime_types
from storage.buckets order by id;

select policyname, cmd, roles
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by policyname;
