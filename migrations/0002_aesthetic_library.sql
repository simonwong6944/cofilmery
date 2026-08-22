-- Migration 0002: Create aesthetic_library table
-- Aesthetic Composer feature — Phase 1

CREATE TABLE IF NOT EXISTS aesthetic_library (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK(category IN ('light','material','art_movement','illustration','atmosphere','lens')),
  subcategory TEXT NOT NULL,
  name_i18n TEXT NOT NULL,        -- JSON: { "zh-HK": ..., "en": ..., "zh-CN": ... }
  description_i18n TEXT NOT NULL, -- JSON: { "zh-HK": ..., "en": ..., "zh-CN": ... }
  emotion_tags TEXT NOT NULL DEFAULT '[]', -- JSON array of strings
  composed_of TEXT NOT NULL DEFAULT '[]',  -- JSON array of aesthetic_library ids
  prompt_fragment_zh TEXT NOT NULL DEFAULT '',
  prompt_fragment_en TEXT NOT NULL DEFAULT '',
  negative_fragment TEXT NOT NULL DEFAULT '',
  adjustable_params TEXT NOT NULL DEFAULT '{}', -- JSON object
  thumbnail_r2_key TEXT,
  source TEXT NOT NULL DEFAULT 'curated' CHECK(source IN ('book','curated','community','ai_generated')),
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK(status IN ('published','pending_review','rejected')),
  contributor_id TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  remix_count INTEGER NOT NULL DEFAULT 0,
  rating_avg REAL NOT NULL DEFAULT 0,
  mode_scope TEXT NOT NULL DEFAULT '["both"]', -- JSON array: ["drama"], ["legacy"], ["both"]
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_aesthetic_status ON aesthetic_library(status);
CREATE INDEX IF NOT EXISTS idx_aesthetic_category ON aesthetic_library(category);
CREATE INDEX IF NOT EXISTS idx_aesthetic_source ON aesthetic_library(source);
CREATE INDEX IF NOT EXISTS idx_aesthetic_usage ON aesthetic_library(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_aesthetic_created ON aesthetic_library(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aesthetic_contributor ON aesthetic_library(contributor_id);
