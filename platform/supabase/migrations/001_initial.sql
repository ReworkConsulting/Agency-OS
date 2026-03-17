-- ============================================================
-- Agency OS — Initial Schema
-- Apply via Supabase Dashboard SQL Editor or: supabase db push
-- ============================================================

-- ============================================================
-- CLIENTS
-- One row per client. Direct translation of client_model.md
-- ============================================================
create table if not exists clients (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  status       text not null default 'active' check (status in ('active', 'archived')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),

  -- Business Information
  company_name     text not null,
  owner_name       text,
  email            text,
  phone            text,
  address          text,
  time_zone        text,
  website_url      text,
  gbp_url          text,
  ein              text,
  company_type     text,
  industry         text,

  -- Service Details
  primary_service       text,
  services_list         text[],
  service_area          text,
  financing_available   boolean,
  financing_details     text,
  average_job_value     numeric,

  -- Marketing Context
  starting_ad_spend           numeric,
  biggest_marketing_challenge text,
  ideal_client_description    text,
  main_goal                   text,

  -- Partnership Context
  how_they_heard        text,
  why_hired_rework      text,
  values_in_partnership text,

  -- Social Media
  facebook_url   text,
  instagram_url  text,
  youtube_url    text,
  tiktok_url     text,
  linkedin_url   text,

  -- Assets & Integrations
  logo_url               text,
  facebook_ad_account_id text,
  ghl_sub_account        text,
  preferred_comms        text,

  -- Interview
  interview_transcript_available boolean default false,
  interview_transcript           text,

  -- Overflow for future fields
  extras jsonb default '{}'
);

-- ============================================================
-- COMPETITORS
-- Many per client
-- ============================================================
create table if not exists competitors (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  name        text not null,
  gbp_url     text,
  website_url text,
  notes       text,
  created_at  timestamptz default now()
);

-- ============================================================
-- REVIEWS
-- One row per scraped review
-- ============================================================
create table if not exists reviews (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients(id) on delete cascade,
  source        text not null check (source in ('client', 'competitor')),
  competitor_id uuid references competitors(id) on delete set null,
  reviewer_name text,
  star_rating   integer check (star_rating between 1 and 5),
  review_text   text not null,
  review_date   date,
  platform      text,
  scraped_at    timestamptz default now(),
  is_curated    boolean default false
);

-- ============================================================
-- ICP DOCUMENTS
-- Versioned. One marked is_current = true per client.
-- ============================================================
create table if not exists icp_documents (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references clients(id) on delete cascade,
  version          integer not null default 1,
  is_current       boolean default true,
  created_at       timestamptz default now(),
  confidence_level text check (confidence_level in ('HIGH', 'MEDIUM', 'LOW')),
  source_materials text,
  has_transcript   boolean default false,
  icp_content      text not null,
  profiles         jsonb,
  unique (client_id, version)
);

-- ============================================================
-- WORKFLOW RUNS
-- Append-only execution log
-- ============================================================
create table if not exists workflow_runs (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references clients(id) on delete cascade,
  workflow_id  text not null,
  tool_id      text not null,
  started_at   timestamptz default now(),
  completed_at timestamptz,
  status       text not null default 'running'
    check (status in ('running', 'completed', 'failed', 'cancelled')),
  inputs       jsonb,
  output_id    uuid,
  error_message text,
  model        text,
  tokens_used  integer
);

-- ============================================================
-- WORKFLOW OUTPUTS
-- The actual text output of completed runs
-- ============================================================
create table if not exists workflow_outputs (
  id               uuid primary key default gen_random_uuid(),
  run_id           uuid references workflow_runs(id) on delete cascade,
  client_id        uuid references clients(id) on delete cascade,
  workflow_id      text not null,
  created_at       timestamptz default now(),
  output_markdown  text not null,
  output_type      text,
  saved_to         text,
  metadata         jsonb default '{}'
);

-- Add FK from workflow_runs to workflow_outputs (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_output' and conrelid = 'workflow_runs'::regclass
  ) then
    alter table workflow_runs
      add constraint fk_output
      foreign key (output_id) references workflow_outputs(id)
      on delete set null;
  end if;
end;
$$;

-- ============================================================
-- BRAND ASSETS
-- Per-client brand files and metadata
-- ============================================================
create table if not exists brand_assets (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  asset_type  text not null,
  file_url    text,
  file_name   text,
  metadata    jsonb,
  created_at  timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_competitors_client    on competitors(client_id);
create index if not exists idx_reviews_client        on reviews(client_id);
create index if not exists idx_reviews_client_source on reviews(client_id, source);
create index if not exists idx_icp_client_current    on icp_documents(client_id, is_current);
create index if not exists idx_runs_client           on workflow_runs(client_id);
create index if not exists idx_runs_client_workflow  on workflow_runs(client_id, workflow_id);
create index if not exists idx_outputs_client        on workflow_outputs(client_id);
create index if not exists idx_outputs_client_wf     on workflow_outputs(client_id, workflow_id);
create index if not exists idx_brand_client          on brand_assets(client_id);

-- ============================================================
-- AUTO-UPDATE updated_at ON clients
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_updated_at on clients;
create trigger clients_updated_at
  before update on clients
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- All writes go through Next.js API routes using service role key.
-- Service role bypasses RLS automatically.
-- ============================================================
alter table clients enable row level security;
alter table competitors enable row level security;
alter table reviews enable row level security;
alter table icp_documents enable row level security;
alter table workflow_runs enable row level security;
alter table workflow_outputs enable row level security;
alter table brand_assets enable row level security;
