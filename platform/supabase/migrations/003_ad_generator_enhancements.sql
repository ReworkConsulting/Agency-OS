-- Ad Generator Enhancements
-- Adds: reference images, global ad library, library tags

-- Extend ad_creatives with library + reference image support
ALTER TABLE ad_creatives
  ADD COLUMN IF NOT EXISTS reference_image_url TEXT,
  ADD COLUMN IF NOT EXISTS saved_to_library BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS library_tags TEXT[];

CREATE INDEX IF NOT EXISTS idx_ad_creatives_library ON ad_creatives(saved_to_library) WHERE saved_to_library = true;

-- Reference images table (manually uploaded or pulled from ad library)
CREATE TABLE IF NOT EXISTS reference_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL, -- null = global
  name TEXT,
  url TEXT NOT NULL,
  source TEXT DEFAULT 'upload', -- 'upload' | 'generated'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reference_images_client ON reference_images(client_id);

-- Supabase Storage bucket for reference images (run if using Supabase Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reference-images', 'reference-images', true)
-- ON CONFLICT (id) DO NOTHING;
