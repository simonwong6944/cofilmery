-- CoFilmery D1 Migration: 0011_asset_media (v2 — expanded roles)
-- DROP + CREATE to update the CHECK constraint with the full 10-role set.
-- Safe on staging: no production data to lose.
--
-- role set (10 slugs):
--   立體角度: front, three-quarter, side, back, action, detail
--   場景:     main, alt-angle
--   通用:     primary, other
--
-- Completeness rules (enforced at API layer via isAssetComplete()):
--   character / prop / costume / sponsor  → needs front + side + back
--   scene                                 → needs main
--   audio / other / anything else         → needs primary
--   three-quarter: optional (suggested but not required for completeness)
--
-- assets.file_url kept as main-image shortcut; this table adds multi-angle support.
-- NOTE: Only ADDs new table / drops own table — does NOT alter assets table.

DROP TABLE IF EXISTS asset_media;

CREATE TABLE asset_media (
  id          TEXT    PRIMARY KEY,
  asset_id    TEXT    NOT NULL,
  file_url    TEXT    NOT NULL,
  role        TEXT    NOT NULL
              CHECK(role IN (
                'front', 'three-quarter', 'side', 'back', 'action', 'detail',
                'main', 'alt-angle', 'primary', 'other'
              )),
  sort_order  INTEGER DEFAULT 0,
  created_at  TEXT    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asset_media_asset_id ON asset_media(asset_id);
CREATE INDEX idx_asset_media_role     ON asset_media(asset_id, role);
