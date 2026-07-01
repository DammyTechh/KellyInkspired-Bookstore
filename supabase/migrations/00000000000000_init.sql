/* ============================================================================
   KellyInkspired Bookstore — Consolidated Schema (single migration)
   ----------------------------------------------------------------------------
   Everything the platform needs in ONE file:
     • profiles (extends auth.users; role = 'customer' | 'admin')
     • categories, books (published / coming_soon / draft, new-release flag)
     • blogs (+ media), blog_likes, blog_comments
     • newsletter_subscribers, contact_messages
     • orders, order_items   (Naira / Paystack / Opay)
     • broadcasts            (log of new-release / coming-soon email blasts)
     • Row Level Security on every table
     • Storage buckets + policies (book-covers, book-files, blog-media)
     • Auto-profile trigger on signup
     • Manually seeded ADMIN account (CHANGE THE CREDENTIALS BELOW)

   Customers authenticate passwordless (email OTP). Admins use email + password
   and are seeded here — admins can NOT self-register.
   ============================================================================ */

-- Extensions ----------------------------------------------------------------
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- RESET (makes this migration fully re-runnable and overrides any older schema
-- left over from a previous version of the app). Drops only this app's public
-- tables; it does NOT touch auth.users accounts. Safe for a fresh rebuild.
-- ---------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.order_items          cascade;
drop table if exists public.orders               cascade;
drop table if exists public.blog_comments        cascade;
drop table if exists public.blog_likes           cascade;
drop table if exists public.broadcasts           cascade;
drop table if exists public.blogs                cascade;
drop table if exists public.books                cascade;
drop table if exists public.categories           cascade;
drop table if exists public.contact_messages     cascade;
drop table if exists public.newsletter_subscribers cascade;
drop table if exists public.profiles             cascade;

-- ---------------------------------------------------------------------------
-- Helper: am I an admin?  (SECURITY DEFINER avoids recursive RLS on profiles)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- Generic updated_at touch
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================================================
-- PROFILES
-- ===========================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  full_name   text,
  role        text not null default 'customer' check (role in ('customer','admin')),
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_self_read"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "profiles_self_update"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Create a profile automatically whenever a new auth user appears.
-- New users default to 'customer'. (The seeded admin keeps its 'admin' row
-- because of ON CONFLICT DO NOTHING.)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- CATEGORIES
-- ===========================================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  created_at  timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories: public read"
  on public.categories for select to anon, authenticated using (true);

create policy "categories: admin manage"
  on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- BOOKS
-- ===========================================================================
create table if not exists public.books (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text unique not null,
  description    text not null default '',
  cover_url      text,
  price          numeric(12,2) not null default 0,        -- Naira
  category_id    uuid references public.categories(id) on delete set null,
  pages          integer,
  language       text default 'English',
  isbn           text,
  status         text not null default 'published'
                   check (status in ('published','coming_soon','draft')),
  is_new_release boolean not null default false,          -- shows in hero / new-release rail
  is_featured    boolean not null default false,
  release_date   date,
  download_url   text,                                     -- delivered after payment
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists books_status_idx       on public.books(status);
create index if not exists books_new_release_idx   on public.books(is_new_release);

alter table public.books enable row level security;

-- Public sees published + coming_soon. Drafts are admin-only.
create policy "books: public read live"
  on public.books for select to anon, authenticated
  using (status in ('published','coming_soon') or public.is_admin());

create policy "books: admin manage"
  on public.books for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop trigger if exists books_touch on public.books;
create trigger books_touch before update on public.books
  for each row execute function public.touch_updated_at();

-- ===========================================================================
-- BLOGS
-- ===========================================================================
create table if not exists public.blogs (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text unique not null,
  excerpt      text,
  content      text not null default '',                  -- markdown / rich text
  cover_url    text,
  media        jsonb not null default '[]'::jsonb,         -- [{type:'image'|'video'|'audio'|'file', url, caption}]
  status       text not null default 'published'
                 check (status in ('published','draft')),
  author_id    uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists blogs_status_idx on public.blogs(status);

alter table public.blogs enable row level security;

create policy "blogs: public read published"
  on public.blogs for select to anon, authenticated
  using (status = 'published' or public.is_admin());

create policy "blogs: admin manage"
  on public.blogs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop trigger if exists blogs_touch on public.blogs;
create trigger blogs_touch before update on public.blogs
  for each row execute function public.touch_updated_at();

-- Likes ---------------------------------------------------------------------
create table if not exists public.blog_likes (
  id         uuid primary key default gen_random_uuid(),
  blog_id    uuid not null references public.blogs(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blog_id, user_id)
);

alter table public.blog_likes enable row level security;

create policy "likes: public read"
  on public.blog_likes for select to anon, authenticated using (true);

create policy "likes: own insert"
  on public.blog_likes for insert to authenticated
  with check (user_id = auth.uid());

create policy "likes: own delete"
  on public.blog_likes for delete to authenticated
  using (user_id = auth.uid());

-- Comments ------------------------------------------------------------------
create table if not exists public.blog_comments (
  id          uuid primary key default gen_random_uuid(),
  blog_id     uuid not null references public.blogs(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete set null,
  author_name text not null default 'Reader',
  content     text not null,
  created_at  timestamptz not null default now()
);

alter table public.blog_comments enable row level security;

create policy "comments: public read"
  on public.blog_comments for select to anon, authenticated using (true);

create policy "comments: auth insert"
  on public.blog_comments for insert to authenticated
  with check (user_id = auth.uid());

create policy "comments: own or admin delete"
  on public.blog_comments for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ===========================================================================
-- NEWSLETTER
-- ===========================================================================
create table if not exists public.newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  name          text,
  confirmed     boolean not null default true,
  unsubscribed  boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Anyone may subscribe; only admin can read the list.
create policy "newsletter: public subscribe"
  on public.newsletter_subscribers for insert to anon, authenticated
  with check (true);

create policy "newsletter: admin read"
  on public.newsletter_subscribers for select to authenticated
  using (public.is_admin());

create policy "newsletter: admin manage"
  on public.newsletter_subscribers for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- CONTACT MESSAGES
-- ===========================================================================
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "contact: public insert"
  on public.contact_messages for insert to anon, authenticated
  with check (true);

create policy "contact: admin read"
  on public.contact_messages for select to authenticated
  using (public.is_admin());

create policy "contact: admin manage"
  on public.contact_messages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- ORDERS / PAYMENTS  (Naira)
-- ===========================================================================
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.profiles(id) on delete set null,
  email             text not null,
  status            text not null default 'pending'
                      check (status in ('pending','paid','failed')),
  subtotal          numeric(12,2) not null default 0,
  total             numeric(12,2) not null default 0,
  currency          text not null default 'NGN',
  payment_provider  text check (payment_provider in ('paystack','opay')),
  payment_reference text,
  paid_at           timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_ref_idx   on public.orders(payment_reference);

alter table public.orders enable row level security;

create policy "orders: own read"
  on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "orders: own create"
  on public.orders for insert to authenticated
  with check (user_id = auth.uid());

create policy "orders: admin manage"
  on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.order_items (
  id        uuid primary key default gen_random_uuid(),
  order_id  uuid not null references public.orders(id) on delete cascade,
  book_id   uuid references public.books(id) on delete set null,
  title     text not null,
  price     numeric(12,2) not null,
  quantity  integer not null default 1
);

alter table public.order_items enable row level security;

create policy "order_items: read via order"
  on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.user_id = auth.uid() or public.is_admin())
  ));

create policy "order_items: insert via own order"
  on public.order_items for insert to authenticated
  with check (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = auth.uid()
  ));

-- ===========================================================================
-- BROADCASTS  (log of new-release / coming-soon email blasts)
-- ===========================================================================
create table if not exists public.broadcasts (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('new_release','coming_soon','newsletter')),
  book_id     uuid references public.books(id) on delete set null,
  subject     text,
  recipients  integer not null default 0,
  sent_at     timestamptz not null default now()
);

alter table public.broadcasts enable row level security;

create policy "broadcasts: admin read"
  on public.broadcasts for select to authenticated using (public.is_admin());

create policy "broadcasts: admin insert"
  on public.broadcasts for insert to authenticated with check (public.is_admin());

-- ===========================================================================
-- STORAGE BUCKETS  (covers + blog media are public; book files are private)
-- ===========================================================================
insert into storage.buckets (id, name, public)
values
  ('book-covers', 'book-covers', true),
  ('blog-media',  'blog-media',  true),
  ('book-files',  'book-files',  false)
on conflict (id) do nothing;

-- Public read for the public buckets
drop policy if exists "storage: public read covers" on storage.objects;
create policy "storage: public read covers"
  on storage.objects for select to anon, authenticated
  using (bucket_id in ('book-covers','blog-media'));

-- Admins may write to any of the buckets
drop policy if exists "storage: admin write" on storage.objects;
create policy "storage: admin write"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('book-covers','blog-media','book-files') and public.is_admin());

drop policy if exists "storage: admin update" on storage.objects;
create policy "storage: admin update"
  on storage.objects for update to authenticated
  using (public.is_admin());

drop policy if exists "storage: admin delete" on storage.objects;
create policy "storage: admin delete"
  on storage.objects for delete to authenticated
  using (public.is_admin());

-- ===========================================================================
-- GRANTS
-- Supabase normally auto-grants table privileges to the API roles, but because
-- the RESET block above drops and recreates the tables, we grant explicitly so
-- PostgREST (anon / authenticated) can reach them. Every table has RLS enabled,
-- so these grants do NOT expose data — the policies above still gate every row.
-- ===========================================================================
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public      to anon, authenticated, service_role;
grant all on all sequences in schema public   to anon, authenticated, service_role;
grant all on all functions in schema public   to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- ===========================================================================
-- SEED DATA
-- ===========================================================================
insert into public.categories (name, slug) values
  ('Faith & Spirituality', 'faith-spirituality'),
  ('Purpose & Growth',     'purpose-growth'),
  ('Teen & Young Adult',   'teen-young-adult'),
  ('Inspirational',        'inspirational')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- ADMIN SEED  ───────────────────────────────────────────────────────────────
--   Admins are created HERE, not through any signup form.
--   >>> CHANGE THE EMAIL AND PASSWORD before running in production. <<<
-- ---------------------------------------------------------------------------
do $$
declare
  admin_email text := 'kellyinkspired@gmail.com';
  admin_pass  text := 'ChangeMe!2025';          -- <<< CHANGE THIS
  admin_name  text := 'Awokunle M. Kelechi';
  uid         uuid;
begin
  select id into uid from auth.users where email = admin_email;

  if uid is null then
    -- Create the admin auth account.
    uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      uid, 'authenticated', 'authenticated', admin_email,
      crypt(admin_pass, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', admin_name),
      now(), now(), '', '', '', ''
    );
  else
    -- Account already exists: reset its password to admin_pass and confirm it.
    update auth.users
       set encrypted_password = crypt(admin_pass, gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
     where id = uid;
  end if;

  -- ALWAYS ensure the profile exists and is flagged admin. The signup trigger
  -- may have auto-created a 'customer' row, so we force it back to 'admin' here.
  insert into public.profiles (id, email, full_name, role)
  values (uid, admin_email, admin_name, 'admin')
  on conflict (id) do update
    set role = 'admin', full_name = excluded.full_name, email = excluded.email;
end $$;
