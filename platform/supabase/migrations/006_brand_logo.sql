-- Add brand logo URL to brand_ads
ALTER TABLE brand_ads
  ADD COLUMN IF NOT EXISTS brand_logo_url TEXT;
