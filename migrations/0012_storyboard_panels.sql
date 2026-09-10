-- CoFilmery D1 Migration: 0012_storyboard_panels
-- Stores AI-generated + user-edited storyboard panels per project + episode.
--
-- Keyed by (project_id, episode): GET and POST both filter by this pair.
-- POST does DELETE + batch-INSERT for the given episode only (other episodes untouched).
-- sort_order preserves panel display order independent of scene number.

CREATE TABLE IF NOT EXISTS storyboard_panels (
  id          TEXT    PRIMARY KEY,
  project_id  TEXT    NOT NULL,
  episode     INTEGER NOT NULL,
  scene       INTEGER NOT NULL,
  desc        TEXT    NOT NULL DEFAULT '',
  cam_note    TEXT    NOT NULL DEFAULT '',
  duration    INTEGER NOT NULL DEFAULT 6,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TEXT    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_storyboard_panels_proj_ep
  ON storyboard_panels(project_id, episode);
