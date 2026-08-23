-- Migration: 0009_project_sponsor_assets
-- Creates project_sponsor_assets table for persisting S1 sponsor asset selections per project.
-- Primary key (project_id, asset_id) ensures no duplicate asset per project.

CREATE TABLE IF NOT EXISTS project_sponsor_assets (
  project_id   TEXT NOT NULL,
  asset_id     TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT '',
  name         TEXT NOT NULL DEFAULT '',
  img          TEXT NOT NULL DEFAULT '',
  brand        TEXT NOT NULL DEFAULT '',
  revenue_rate REAL NOT NULL DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id, asset_id)
);
