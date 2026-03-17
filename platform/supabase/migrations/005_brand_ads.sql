-- Brand Ads Table
-- Stores brand inspiration ads scraped from Facebook Ad Library or added manually

CREATE TABLE IF NOT EXISTS brand_ads (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name         TEXT NOT NULL,
  brand_page_url     TEXT,
  image_url          TEXT,                        -- Supabase Storage URL (persisted copy)
  original_image_url TEXT,                        -- Source URL before we downloaded it
  headline           TEXT,
  body_text          TEXT,
  cta                TEXT,
  tags               TEXT[] DEFAULT '{}',
  platform           TEXT DEFAULT 'facebook',
  source_url         TEXT,                        -- The Ad Library URL scraped from
  created_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_ads_brand_name ON brand_ads(brand_name);
CREATE INDEX IF NOT EXISTS idx_brand_ads_created ON brand_ads(created_at DESC);

-- Storage bucket for brand ad images
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-ads', 'brand-ads', true)
ON CONFLICT (id) DO NOTHING;
