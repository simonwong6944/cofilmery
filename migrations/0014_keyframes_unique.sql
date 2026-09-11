-- Migration 0014: deduplicate keyframes + add UNIQUE index
-- Required for true upsert (ON CONFLICT DO UPDATE) in /api/keyframes POST.
-- Step 1: delete duplicate rows, keeping latest rowid per (project_id, episode, panel_scene)
DELETE FROM keyframes
WHERE rowid NOT IN (
  SELECT MAX(rowid)
  FROM keyframes
  GROUP BY project_id, episode, panel_scene
);
-- Step 2: create UNIQUE index to enforce one row per (project_id, episode, panel_scene)
CREATE UNIQUE INDEX IF NOT EXISTS idx_keyframes_unique_panel
  ON keyframes(project_id, episode, panel_scene);
