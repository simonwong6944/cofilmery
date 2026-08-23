-- Migration 0006: characters table
-- Stores per-project character cards as JSON blobs.
-- project_id FOREIGN KEY → projects(id); staging D1 has FK enforcement ON.
-- Caller must ensure the project row exists before inserting characters.

CREATE TABLE IF NOT EXISTS characters (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL,
  name        TEXT,
  img         TEXT,
  data        TEXT,                    -- full CharacterCard JSON
  sort_order  INTEGER DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX IF NOT EXISTS idx_characters_project ON characters(project_id);
