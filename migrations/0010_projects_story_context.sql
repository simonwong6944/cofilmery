-- Migration 0010: Add story_material and series_context to projects table
-- story_material : raw text the creator enters in PlanOverview (S0 → route 1)
-- series_context : JSON-serialised SeriesContext (genre, tone, episodeCount, …)
--
-- SQLite does not support conditional ADD COLUMN (IF NOT EXISTS), so this
-- migration is intentionally idempotent at the application level:
-- wrangler d1 migrations apply tracks which files have been executed and will
-- skip this file on subsequent runs.

ALTER TABLE projects ADD COLUMN story_material TEXT;
ALTER TABLE projects ADD COLUMN series_context  TEXT;
