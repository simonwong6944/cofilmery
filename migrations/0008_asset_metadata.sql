-- CoFilmery D1 Migration: 0008_asset_metadata
-- Add four new metadata columns to the assets table.
-- Using ALTER TABLE ADD COLUMN (safe, non-destructive — no rebuild needed).

ALTER TABLE assets ADD COLUMN brand        TEXT NOT NULL DEFAULT '';
ALTER TABLE assets ADD COLUMN model        TEXT NOT NULL DEFAULT '';
ALTER TABLE assets ADD COLUMN description  TEXT NOT NULL DEFAULT '';
ALTER TABLE assets ADD COLUMN revenue_rate REAL NOT NULL DEFAULT 0;
