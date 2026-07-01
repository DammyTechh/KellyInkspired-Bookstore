-- ============================================================================
-- IMMEDIATE FIX: make kellyinkspired@gmail.com an admin.
-- Run this in the Supabase SQL editor if admin login says
-- "This account does not have admin access."
--
-- It does NOT touch your password — it only ensures the profile row exists
-- and is flagged 'admin'. After running, refresh the site and sign in again.
-- ============================================================================

insert into public.profiles (id, email, full_name, role)
select id,
       email,
       coalesce(raw_user_meta_data->>'full_name', 'Awokunle M. Kelechi'),
       'admin'
from auth.users
where email = 'kellyinkspired@gmail.com'
on conflict (id) do update set role = 'admin';

-- Verify (should return one row with role = admin):
select p.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'kellyinkspired@gmail.com';
