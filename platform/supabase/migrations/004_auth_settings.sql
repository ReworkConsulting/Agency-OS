-- ============================================================
-- Migration 004: Auth Settings
-- Agency-level settings and user profiles for auth/permissions
-- ============================================================

-- Agency-level settings (single row)
create table if not exists agency_settings (
  id            uuid primary key default gen_random_uuid(),
  agency_name   text not null default 'Rework Consulting',
  logo_url      text,
  favicon_url   text,
  default_theme text default 'dark' check (default_theme in ('dark','light')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
insert into agency_settings (agency_name)
select 'Rework Consulting' where not exists (select 1 from agency_settings);

-- User profiles (1-to-1 with auth.users)
create table if not exists user_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  avatar_url      text,
  role            text not null default 'member' check (role in ('admin','member')),
  -- Tool permissions: empty array = access to all tools
  allowed_tools   text[] default '{}',
  -- Client access: 'all' or 'specific'
  client_access   text not null default 'all' check (client_access in ('all','specific')),
  allowed_clients uuid[] default '{}',
  -- Menu access: empty = all menus visible
  allowed_menus   text[] default '{}',
  -- Personal prefs
  theme           text default 'system',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
