-- CoFilmery D1 Migration: 0007_asset_categories
-- 1. Create asset_categories table for admin-managed categories
-- 2. Rebuild assets table to remove hardcoded CHECK constraint on category
--    (SQLite does not support ALTER TABLE DROP CONSTRAINT, so we rebuild)
-- 3. Seed default categories

-- ─────────────────────────────────────────────
-- Part 1: asset_categories table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_categories (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_asset_categories_slug ON asset_categories(slug);

-- ─────────────────────────────────────────────
-- Part 2: Rebuild assets table (remove CHECK constraint on category)
-- ─────────────────────────────────────────────

-- Step 1: Create new assets table without CHECK constraint on category
CREATE TABLE IF NOT EXISTS assets_new (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL,
  user_id     TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  file_type   TEXT NOT NULL,
  file_size   INTEGER NOT NULL DEFAULT 0,
  r2_key      TEXT NOT NULL UNIQUE,
  file_url    TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'other',
  label       TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Copy all existing rows into the new table
INSERT INTO assets_new
  SELECT id, project_id, user_id, file_name, file_type, file_size,
         r2_key, file_url, category, label, uploaded_at
  FROM assets;

-- Step 3: Drop original table
DROP TABLE assets;

-- Step 4: Rename new table to assets
ALTER TABLE assets_new RENAME TO assets;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_assets_project ON assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_user    ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_cat     ON assets(project_id, category);

-- ─────────────────────────────────────────────
-- Part 3: Seed default categories
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO asset_categories (id, name, slug) VALUES
  ('cat-character', '角色',     'character'),
  ('cat-scene',     '場景',     'scene'),
  ('cat-prop',      '道具',     'prop'),
  ('cat-sponsor',   '贊助商',   'sponsor'),
  ('cat-audio',     '音頻',     'audio'),
  ('cat-video',     '影片',     'video'),
  ('cat-other',     '其他',     'other');
