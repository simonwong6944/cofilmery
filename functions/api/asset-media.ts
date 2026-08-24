/**
 * Cloudflare Pages Function: /api/asset-media
 *
 * GET  /api/asset-media?asset_id=<id>
 *   → { ok, media: AssetMediaRow[] } ordered by sort_order ASC
 *
 * POST /api/asset-media
 *   JSON body: { asset_id, role, file_url, sort_order? }
 *   → writes D1 row directly (caller already has the file_url from R2 upload)
 *   → rejects if asset already has ≥ 8 media rows
 *   → returns { ok, media: AssetMediaRow }
 *
 * DELETE /api/asset-media/:id  — handled in asset-media/[id].ts
 *
 * Env bindings required:
 *   DB — D1Database
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Role set (10 slugs, must match CHECK constraint in migration 0011):
 *   front | three-quarter | side | back | action | detail
 *   main  | alt-angle     | primary | other
 *
 * isAssetComplete(category, roles) — inline helper used by assets.ts too:
 *   character | prop | costume | sponsor  → needs front + side + back
 *   scene                                 → needs main
 *   audio / other / *                     → needs primary
 *   three-quarter: optional, never blocks completeness
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface AssetMediaRow {
  id:         string;
  asset_id:   string;
  file_url:   string;
  role:       string;
  sort_order: number;
  created_at: string;
}

interface Env {
  DB: D1Database;
  FILES: R2Bucket;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

// Must stay in sync with CHECK constraint in 0011_asset_media.sql
const VALID_ROLES = [
  'front', 'three-quarter', 'side', 'back', 'action', 'detail',
  'main', 'alt-angle', 'primary', 'other',
] as const;
type MediaRole = typeof VALID_ROLES[number];

const MAX_MEDIA_PER_ASSET = 8;

// ── Shared completeness helper ────────────────────────────────────────────────
// Inlined here AND in assets.ts / assets/[id].ts (CF Pages can't cross-import).
export function isAssetComplete(category: string, roles: string[]): boolean {
  const roleSet = new Set(roles);
  switch (category) {
    case 'character':
    case 'prop':
    case 'costume':
    case 'sponsor':
      return roleSet.has('front') && roleSet.has('side') && roleSet.has('back');
    case 'scene':
      return roleSet.has('main');
    case 'audio':
      return roleSet.has('primary');
    default: // 'other' and anything else
      return roleSet.has('primary');
  }
}

// ── GET /api/asset-media?asset_id=<id> ───────────────────────────────────────
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url     = new URL(ctx.request.url);
  const assetId = url.searchParams.get('asset_id') ?? '';

  if (!assetId) {
    return new Response(JSON.stringify({ error: 'asset_id is required' }), {
      status: 400, headers: CORS,
    });
  }

  try {
    const rows = await ctx.env.DB.prepare(
      `SELECT id, asset_id, file_url, role, sort_order, created_at
         FROM asset_media
        WHERE asset_id = ?
        ORDER BY sort_order ASC, created_at ASC`
    ).bind(assetId).all<AssetMediaRow>();

    return new Response(JSON.stringify({ ok: true, media: rows.results ?? [] }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB read failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

// ── POST /api/asset-media ─────────────────────────────────────────────────────
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  let body: { asset_id?: string; role?: string; file_url?: string; sort_order?: number };
  try {
    body = await ctx.request.json() as typeof body;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: CORS,
    });
  }

  const assetId   = body.asset_id ?? '';
  const role      = body.role     ?? '';
  const fileUrl   = body.file_url ?? '';
  const sortOrder = typeof body.sort_order === 'number' ? body.sort_order : 0;

  if (!assetId) {
    return new Response(JSON.stringify({ error: 'asset_id is required' }), {
      status: 400, headers: CORS,
    });
  }
  if (!fileUrl) {
    return new Response(JSON.stringify({ error: 'file_url is required' }), {
      status: 400, headers: CORS,
    });
  }
  if (!(VALID_ROLES as readonly string[]).includes(role)) {
    return new Response(JSON.stringify({
      error: `Invalid role '${role}'. Allowed: ${VALID_ROLES.join(', ')}`,
    }), { status: 400, headers: CORS });
  }

  const mediaId = crypto.randomUUID();
  return insertMediaRow(ctx.env.DB, mediaId, assetId, fileUrl, role as MediaRole, sortOrder);
};

// ── Shared insert helper ──────────────────────────────────────────────────────
async function insertMediaRow(
  db:        D1Database,
  mediaId:   string,
  assetId:   string,
  fileUrl:   string,
  role:      string,
  sortOrder: number,
): Promise<Response> {
  try {
    // Verify asset exists
    const asset = await db.prepare(
      `SELECT id FROM assets WHERE id = ?`
    ).bind(assetId).first<{ id: string }>();

    if (!asset) {
      return new Response(JSON.stringify({ error: 'Asset not found' }), {
        status: 404, headers: CORS,
      });
    }

    // Enforce 8-media cap
    const countRow = await db.prepare(
      `SELECT COUNT(*) AS cnt FROM asset_media WHERE asset_id = ?`
    ).bind(assetId).first<{ cnt: number }>();

    if ((countRow?.cnt ?? 0) >= MAX_MEDIA_PER_ASSET) {
      return new Response(JSON.stringify({
        error: `Asset already has ${MAX_MEDIA_PER_ASSET} media items (maximum reached)`,
      }), { status: 422, headers: CORS });
    }

    const now = new Date().toISOString();

    await db.prepare(
      `INSERT INTO asset_media (id, asset_id, file_url, role, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(mediaId, assetId, fileUrl, role, sortOrder, now).run();

    const row = await db.prepare(
      `SELECT id, asset_id, file_url, role, sort_order, created_at
         FROM asset_media WHERE id = ?`
    ).bind(mediaId).first<AssetMediaRow>();

    return new Response(JSON.stringify({ ok: true, media: row }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB write failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
}

// ── OPTIONS ───────────────────────────────────────────────────────────────────
export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
