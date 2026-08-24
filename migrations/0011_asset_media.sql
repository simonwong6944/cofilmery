-- CoFilmery D1 Migration: 0011_asset_media
-- Creates asset_media table for one-to-many media angles per asset.
-- Each asset can have up to 8 media items (enforced at API layer).
-- role values: 'front' | 'side' | 'back' | 'main' | 'primary' | 'other'
--
-- Completeness rules (enforced at API layer via isAssetComplete()):
--   character / prop / costume / sponsor product  → needs front + side + back
--   scene                                         → needs main
--   audio (background music)                      → needs primary (audio file)
--   other                                         → needs primary
--
-- assets.file_url is kept as main-image shortcut; this table adds multi-angle support.
-- NOTE: Only ADDs new table; does NOT alter or drop any existing table/column.

CREATE TABLE IF NOT EXISTS asset_media (
  id          TEXT    PRIMARY KEY,                          -- UUID
  asset_id    TEXT    NOT NULL,                             -- FK concept → assets.id
  file_url    TEXT    NOT NULL,                             -- R2-served URL
  role        TEXT    NOT NULL DEFAULT 'primary'
              CHECK(role IN ('front','side','back','main','primary','other')),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Fast lookup by asset_id (the most common query)
CREATE INDEX IF NOT EXISTS idx_asset_media_asset ON asset_media(asset_id);

-- Composite index for ordered listing per asset
CREATE INDEX IF NOT EXISTS idx_asset_media_asset_sort ON asset_media(asset_id, sort_order);
