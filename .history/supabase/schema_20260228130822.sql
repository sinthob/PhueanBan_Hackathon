-- Supabase Postgres schema for GoodNeighbor
-- Run this in Supabase SQL Editor.

-- 1) Profiles table (1:1 with auth.users)
-- NOTE: Older versions of this project used an enum (public.user_role) for role.
-- This schema uses TEXT + CHECK instead (simpler to extend and matches app code).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  profile_name text,
  avatar_url text,
  gender text,
  role text not null,
  health_category text,
  activity_interests text[] not null default '{}',
  -- Back-compat: existing app code reads display_name
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If the table already exists, apply additive migrations safely.
alter table public.profiles
  add column if not exists email text;

alter table public.profiles
  add column if not exists profile_name text;

alter table public.profiles
  add column if not exists avatar_url text;

alter table public.profiles
  add column if not exists gender text;

alter table public.profiles
  add column if not exists health_category text;

alter table public.profiles
  add column if not exists activity_interests text[];

-- Default empty array (avoid NULL checks everywhere)
alter table public.profiles
  alter column activity_interests set default '{}';

-- Older DBs may have role as enum; convert to text while preserving values.
do $$ begin
  alter table public.profiles
    alter column role type text using role::text;
exception
  when undefined_column then null;
  when datatype_mismatch then null;
end $$;

-- Basic validation constraints (idempotent)
do $$ begin
  alter table public.profiles
    add constraint profiles_role_check check (role in ('elder', 'caregiver'));
exception
  when duplicate_object then null;
end $$;

do $$ begin
  alter table public.profiles
    add constraint profiles_gender_check check (gender is null or gender in ('male', 'female'));
exception
  when duplicate_object then null;
end $$;

do $$ begin
  alter table public.profiles
    add constraint profiles_health_category_check
      check (
        health_category is null
        or health_category in (
          'cardiovascular',
          'diabetes',
          'mobility_joint',
          'respiratory',
          'other'
        )
      );
exception
  when duplicate_object then null;
end $$;

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

-- 4) (Optional) Supabase Storage for profile images
-- Recommended approach: store image files in Storage, store the public URL in profiles.avatar_url.
--
-- Steps (run in Supabase Dashboard):
--   1) Storage → Create bucket named "avatars" (Public = true)
--   2) Add policies below to allow authenticated users to upload/update only inside their own folder.
--
-- NOTE: Policies apply to storage.objects.
-- A simple convention used by the app: object path = "<userId>/avatar-<timestamp>.jpg"
--
-- Allow anyone to read public avatars (only needed if bucket is NOT public).
-- create policy "avatars_read_public"
-- on storage.objects for select
-- using (bucket_id = 'avatars');
--
-- Allow authenticated users to upload to their own folder.
do $$ begin
  create policy "avatars_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
exception
  when duplicate_object then null;
end $$;

-- Allow authenticated users to update/delete objects in their own folder.
do $$ begin
  create policy "avatars_update_own_folder"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "avatars_delete_own_folder"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
exception
  when duplicate_object then null;
end $$;

-- 5) Auto-create profile row on sign up (recommended)
-- This makes a public.profiles row appear immediately after Auth sign up,
-- even when "Confirm email" is enabled (no session on the client yet).
-- It reads values from auth.users.raw_user_meta_data.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
  meta_role text;
  meta_profile_name text;
  meta_avatar_url text;
  meta_gender text;
  meta_health_category text;
  meta_interests text[];
begin
  meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);

  meta_role := meta->>'role';
  if meta_role not in ('elder', 'caregiver') then
    meta_role := 'elder';
  end if;

  meta_profile_name := nullif(trim(coalesce(meta->>'profile_name', '')), '');
  meta_avatar_url := nullif(trim(coalesce(meta->>'avatar_url', '')), '');
  meta_gender := meta->>'gender';
  if meta_gender not in ('male', 'female') then
    meta_gender := null;
  end if;

  meta_health_category := meta->>'health_category';
  if meta_health_category not in ('cardiovascular','diabetes','mobility_joint','respiratory','other') then
    meta_health_category := null;
  end if;

  select coalesce(array_agg(value::text), '{}'::text[])
  into meta_interests
  from jsonb_array_elements_text(coalesce(meta->'activity_interests', '[]'::jsonb));

  insert into public.profiles (
    id,
    email,
    profile_name,
    display_name,
    avatar_url,
    gender,
    role,
    health_category,
    activity_interests,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    meta_profile_name,
    meta_profile_name,
    meta_avatar_url,
    meta_gender,
    meta_role,
    meta_health_category,
    meta_interests,
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    profile_name = coalesce(excluded.profile_name, public.profiles.profile_name),
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    gender = coalesce(excluded.gender, public.profiles.gender),
    role = coalesce(excluded.role, public.profiles.role),
    health_category = coalesce(excluded.health_category, public.profiles.health_category),
    activity_interests = coalesce(excluded.activity_interests, public.profiles.activity_interests),
    updated_at = now();

  return new;
end;
$$;

do $$ begin
  create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
exception
  when duplicate_object then null;
end $$;
