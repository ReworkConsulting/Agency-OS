-- Migration 009: Brand colors on clients + ICP exports table
-- Adds brand_primary_color and brand_secondary_color to the clients table.
-- Creates icp_exports table to track generated PDF/Doc exports per ICP version.

-- Brand colors
alter table clients
  add column if not exists brand_primary_color   text,
  add column if not exists brand_secondary_color text;

-- ICP exports: one row per generated export file
create table if not exists icp_exports (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid not null references clients(id) on delete cascade,
  icp_document_id   uuid not null references icp_documents(id) on delete cascade,
  format            text not null check (format in ('pdf', 'docx')),
  file_url          text not null,
  storage_path      text not null,
  created_at        timestamptz not null default now()
);

create index if not exists icp_exports_client_id_idx on icp_exports(client_id);
create index if not exists icp_exports_icp_document_id_idx on icp_exports(icp_document_id);

-- RLS: same pattern as other tables — service role bypasses, authenticated users see all
alter table icp_exports enable row level security;

create policy "Authenticated users can read icp_exports"
  on icp_exports for select
  to authenticated
  using (true);

create policy "Service role can manage icp_exports"
  on icp_exports for all
  to service_role
  using (true)
  with check (true);
