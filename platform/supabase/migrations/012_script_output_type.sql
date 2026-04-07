-- Add output_type to video_scripts table
-- Supports: 'videos' (default), 'ad_copy', 'headlines'
ALTER TABLE video_scripts
  ADD COLUMN IF NOT EXISTS output_type text NOT NULL DEFAULT 'videos';

-- Index for filtering by output type
CREATE INDEX IF NOT EXISTS idx_video_scripts_output_type
  ON video_scripts (output_type);
