-- ============================================================================
-- FIX: admin login says "This account does not have admin access" even though
-- the profile row is role = 'admin'.
--
-- Cause: the profiles SELECT policy referenced public.is_admin(), which itself
-- reads profiles. That self-reference can make a signed-in user's own-row read
-- return nothing, so the app thinks they aren't an admin.
--
-- This rewrites the profiles policies so reading YOUR OWN row is a plain
-- id = auth.uid() check (no function call, no recursion). Safe to run anytime.
-- ============================================================================

drop policy if exists "profiles: self read"    on public.profiles;
drop policy if exists "profiles: self update"  on public.profiles;
drop policy if exists "profiles: admin manage" on public.profiles;
-- (also drop the new names in case this was run before)
drop policy if exists "profiles_self_read"     on public.profiles;
drop policy if exists "profiles_self_update"   on public.profiles;

create policy "profiles_self_read"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "profiles_self_update"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Make sure the admin profile is correct (harmless if already set):
insert into public.profiles (id, email, full_name, role)
select id, email, coalesce(raw_user_meta_data->>'full_name', 'Awokunle M. Kelechi'), 'admin'
from auth.users
where email = 'kellyinkspired@gmail.com'
on conflict (id) do update set role = 'admin';
