-- ============================================================
-- VIDEO SCRIPTS
-- One row per generated script variation
-- ============================================================
CREATE TABLE IF NOT EXISTS video_scripts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  workflow_run_id     UUID REFERENCES workflow_runs(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT now(),

  -- Generation inputs (preserved for reproducibility + learning)
  target_service      TEXT,
  audience_type       TEXT,       -- 'B2C' | 'B2B'
  script_goal         TEXT,
  script_length       TEXT,       -- '15s' | '30s' | '60s' | '90s'
  script_style        TEXT,
  specific_offer      TEXT,
  hook_angle          TEXT,
  include_broll_notes BOOLEAN DEFAULT false,

  -- Script content (parsed sections)
  hook_text           TEXT,
  body_text           TEXT,
  cta_text            TEXT,
  broll_notes         TEXT,
  director_note       TEXT,
  full_script_text    TEXT NOT NULL,
  word_count          INTEGER,

  -- Feedback / learning fields
  status              TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'rejected', 'in_review', 'used')),
  is_winner           BOOLEAN NOT NULL DEFAULT false,
  feedback_notes      TEXT,
  rejection_reason    TEXT,
  performance_notes   TEXT,
  saved_to_library    BOOLEAN NOT NULL DEFAULT false,

  -- Audit fields
  references_used     JSONB,
  workflow_file_hash  TEXT
);

CREATE INDEX IF NOT EXISTS idx_video_scripts_client_id ON video_scripts(client_id);
CREATE INDEX IF NOT EXISTS idx_video_scripts_client_created ON video_scripts(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_scripts_status ON video_scripts(status);
CREATE INDEX IF NOT EXISTS idx_video_scripts_winner ON video_scripts(is_winner) WHERE is_winner = true;
CREATE INDEX IF NOT EXISTS idx_video_scripts_saved ON video_scripts(saved_to_library) WHERE saved_to_library = true;

-- ============================================================
-- SCRIPT FEEDBACK
-- Structured feedback that trains the system over time
-- ============================================================
CREATE TABLE IF NOT EXISTS script_feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id       UUID NOT NULL REFERENCES video_scripts(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now(),

  -- Scoring dimensions (1-5, null = not evaluated)
  score_hook      INTEGER CHECK (score_hook BETWEEN 1 AND 5),
  score_body      INTEGER CHECK (score_body BETWEEN 1 AND 5),
  score_cta       INTEGER CHECK (score_cta BETWEEN 1 AND 5),
  score_voice     INTEGER CHECK (score_voice BETWEEN 1 AND 5),
  score_overall   INTEGER CHECK (score_overall BETWEEN 1 AND 5),

  -- Qualitative feedback
  what_worked     TEXT,
  what_failed     TEXT,
  suggested_edits TEXT,

  -- Disposition
  action_taken    TEXT CHECK (action_taken IN ('approved', 'rejected', 'revised', 'used_verbatim', 'used_modified'))
);

CREATE INDEX IF NOT EXISTS idx_script_feedback_script_id ON script_feedback(script_id);
CREATE INDEX IF NOT EXISTS idx_script_feedback_client_id ON script_feedback(client_id);
