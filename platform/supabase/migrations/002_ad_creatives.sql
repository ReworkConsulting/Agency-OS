-- Ad Creatives Table
-- Stores each individual generated Facebook ad (copy + image) per client

CREATE TABLE IF NOT EXISTS ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  workflow_run_id UUID REFERENCES workflow_runs(id) ON DELETE SET NULL,

  -- Campaign context
  target_service TEXT,
  campaign_objective TEXT,
  angle TEXT,
  visual_style TEXT,
  ad_size TEXT DEFAULT '1080x1080',

  -- Ad copy
  hook TEXT,
  primary_text TEXT,
  headline TEXT,
  cta TEXT,

  -- Image generation
  image_prompt TEXT,
  image_url TEXT,
  image_status TEXT DEFAULT 'pending', -- pending | generating | complete | failed

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_creatives_client_id ON ad_creatives(client_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_client_created ON ad_creatives(client_id, created_at DESC);
