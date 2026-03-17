-- Add ad_format (named creative template) and is_winner flag to ad_creatives

ALTER TABLE ad_creatives ADD COLUMN IF NOT EXISTS ad_format TEXT;
ALTER TABLE ad_creatives ADD COLUMN IF NOT EXISTS is_winner BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_ad_creatives_format ON ad_creatives(ad_format);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_winner ON ad_creatives(is_winner) WHERE is_winner = true;
