CREATE TABLE IF NOT EXISTS keyframes (
  id          TEXT    PRIMARY KEY,
  project_id  TEXT    NOT NULL,
  episode     INTEGER NOT NULL,
  panel_scene INTEGER NOT NULL,
  image_url   TEXT    NOT NULL DEFAULT '',
  r2_key      TEXT    NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_keyframes_proj_ep ON keyframes(project_id, episode);
