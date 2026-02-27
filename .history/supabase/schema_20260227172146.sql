-- Supabase Postgres schema for GoodNeighbor
-- Run this in Supabase SQL Editor.

-- 1) Role enum
do $$ begin
  create type public.user_role as enum ('elder', 'caregiver');
exception
  when duplicate_object then null;
end $$;

-- 2) Profiles table (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Read own profile
do $$ begin
  create policy "profiles_select_own" on public.profiles
  for select
  using (auth.uid() = id);
exception
  when duplicate_object then null;
end $$;

-- Create own profile (used by onboarding)
do $$ begin
  create policy "profiles_insert_own" on public.profiles
  for insert
  with check (auth.uid() = id);
exception
  when duplicate_object then null;
end $$;

-- Update own profile
-- (You can later tighten this to prevent role changes after initial selection, if desired.)
do $$ begin
  create policy "profiles_update_own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
exception
  when duplicate_object then null;
end $$;

-- 3) Caregiver <-> Elder relationship table (for future assign/consent feature)
create table if not exists public.caregiver_elder_links (
  id bigserial primary key,
  caregiver_id uuid not null references public.profiles(id) on delete cascade,
  elder_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('pending', 'active', 'revoked')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create unique index if not exists caregiver_elder_links_unique
  on public.caregiver_elder_links (caregiver_id, elder_id);

alter table public.caregiver_elder_links enable row level security;

-- Basic visibility: caregiver or elder can see their own links
do $$ begin
  create policy "links_select_participants" on public.caregiver_elder_links
  for select
  using (auth.uid() = caregiver_id or auth.uid() = elder_id);
exception
  when duplicate_object then null;
end $$;

-- Caregiver can create a request
-- Recommended: pair with an invite-code flow so elder consents before activation.
do $$ begin
  create policy "links_insert_caregiver" on public.caregiver_elder_links
  for insert
  with check (auth.uid() = caregiver_id);
exception
  when duplicate_object then null;
end $$;

-- Elder can approve/revoke (update) links where they are the elder
-- Recommended: also restrict which columns can change via triggers or RPC.
do $$ begin
  create policy "links_update_elder" on public.caregiver_elder_links
  for update
  using (auth.uid() = elder_id)
  with check (auth.uid() = elder_id);
exception
  when duplicate_object then null;
end $$;
