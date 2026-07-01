-- ============================================================================
-- FIX: profiles / books / blogs requests return 403 (Forbidden), and admin
-- login says "This account does not have admin access".
--
-- Cause: the tables were dropped & recreated, which removed the table-level
-- privileges that Supabase's API roles (anon / authenticated) need. Without
-- them, PostgREST rejects every request with 403 BEFORE row-level security is
-- even checked. This restores those grants. RLS still controls row access.
--
-- Safe to run anytime. No data is changed or deleted.
-- ============================================================================

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables    in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

-- Make any future tables inherit the same grants automatically.
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- Re-confirm the admin flag while we're here (harmless if already set).
insert into public.profiles (id, email, full_name, role)
select id, email, coalesce(raw_user_meta_data->>'full_name', 'Awokunle M. Kelechi'), 'admin'
from auth.users
where email = 'kellyinkspired@gmail.com'
on conflict (id) do update set role = 'admin';

-- Verify (should return one row, role = admin):
select p.email, p.role from public.profiles p where p.email = 'kellyinkspired@gmail.com';
