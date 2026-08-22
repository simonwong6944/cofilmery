-- 0004_video_jobs.sql
-- Add video generation tracking fields to gen_jobs
-- Also add generation_log table for OpenRouter usage cost tracking

-- Extend gen_jobs with OpenRouter-specific fields
ALTER TABLE gen_jobs ADD COLUMN external_job_id TEXT;
ALTER TABLE gen_jobs ADD COLUMN cost_usd REAL DEFAULT 0;
ALTER TABLE gen_jobs ADD COLUMN tokens_used INTEGER DEFAULT 0;
ALTER TABLE gen_jobs ADD COLUMN model_slug TEXT;
ALTER TABLE gen_jobs ADD COLUMN video_duration INTEGER;
ALTER TABLE gen_jobs ADD COLUMN video_resolution TEXT;
ALTER TABLE gen_jobs ADD COLUMN video_aspect_ratio TEXT;

-- generation_log: immutable audit trail of every AI call
CREATE TABLE IF NOT EXISTS generation_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  episode_id TEXT,
  gen_type TEXT NOT NULL CHECK(gen_type IN ('text','video','tts','architect')),
  model_slug TEXT NOT NULL,
  stage TEXT,                    -- architect stage, if applicable
  tokens_used INTEGER DEFAULT 0,
  cost_usd REAL DEFAULT 0,
  credits_consumed INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('completed','failed','refunded')),
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_gen_log_user ON generation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_gen_log_project ON generation_log(project_id);
CREATE INDEX IF NOT EXISTS idx_gen_log_type ON generation_log(gen_type);
CREATE INDEX IF NOT EXISTS idx_gen_log_created ON generation_log(created_at DESC);

-- Add external_job_id index for video polling
CREATE INDEX IF NOT EXISTS idx_gen_jobs_external ON gen_jobs(external_job_id);
