-- Migration 013: SEO Audit exports table
-- Tracks generated PDF exports for SEO audit reports.
-- SEO audits are stored in workflow_outputs (not a dedicated table),
-- so this table references workflow_outputs.id instead of a dedicated seo_audit_documents table.

create table if not exists seo_audit_exports (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients(id) on delete cascade,
  output_id    uuid not null references workflow_outputs(id) on delete cascade,
  format       text not null check (format in ('pdf')),
  file_url     text not null,
  storage_path text not null,
  created_at   timestamptz not null default now()
);

create index if not exists seo_audit_exports_client_id_idx on seo_audit_exports(client_id);
create index if not exists seo_audit_exports_output_id_idx on seo_audit_exports(output_id);

-- RLS: same pattern as icp_exports
alter table seo_audit_exports enable row level security;

create policy "Authenticated users can read seo_audit_exports"
  on seo_audit_exports for select
  to authenticated
  using (true);

create policy "Service role can manage seo_audit_exports"
  on seo_audit_exports for all
  to service_role
  using (true)
  with check (true);
