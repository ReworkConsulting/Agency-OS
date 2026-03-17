-- ============================================================
-- Migration 005: Add allowed_menus to user_profiles
-- Controls which client menu tabs a member can see
-- ============================================================

alter table user_profiles
  add column if not exists allowed_menus text[] default '{}';
-- Empty array = all menus allowed (same convention as allowed_tools)
