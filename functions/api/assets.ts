/**
 * Cloudflare Pages Function: GET /api/assets
 * Returns asset list for a project from D1, with media angles and is_complete flag.
 *
 * Query params:
 *   project_id  string  (required; 'all' or empty = return all)
 *   category    string  (optional filter)
 *   limit       number  (default 100, max 200)
 *
 * Response shape per asset (extends existing fields):
 *   { ...existingAssetFields, media: AssetMediaRow[], is_complete: boolean }
 *
 * Env bindings required:
 *   DB  — D1Database
 *
 * Completeness rules (mirrored from /api/asset-media, inline to avoid cross-file imports):
 *   character | prop | costume | sponsor  → needs roles: front + side + back
 *   scene                                 → needs role: main
 *   audio                                 → needs role: primary
 *   other / anything else                 → needs role: primary
 */

interface Env {
  DB: D1Database;
}

interface AssetMediaRow {
  id:         string;
  asset_id:   string;
  file_url:   string;
  role:       string;
  sort_order: number;
  created_at: string;
}

// ── Inline completeness helper (same logic as isAssetComplete in asset-media.ts) ──
function isAssetComplete(category: string, roles: string[]): boolean {
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
    default:
      return roleSet.has('primary');
  }
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const env     = ctx.env;
  const url     = new URL(ctx.request.url);
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const projectIdRaw = url.searchParams.get('project_id') ?? '';
  const category     = url.searchParams.get('category')   ?? '';
  const limit        = Math.min(Number(url.searchParams.get('limit') ?? '100'), 200);

  // 'all' 或空值 → 不篩 project_id，返全部；否則 WHERE project_id=?
  const scopeAll = !projectIdRaw || projectIdRaw === 'all';

  try {
    // ── 1. Fetch matching assets ──────────────────────────────────────────────
    const whereClauses: string[] = [];
    const params: (string | number)[] = [];

    if (!scopeAll) {
      whereClauses.push(`project_id = ?`);
      params.push(projectIdRaw);
    }
    if (category) {
      whereClauses.push(`category = ?`);
      params.push(category);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const sql = `SELECT * FROM assets ${whereSQL} ORDER BY uploaded_at DESC LIMIT ?`;
    params.push(limit);

    const rows = await env.DB.prepare(sql).bind(...params).all<Record<string, unknown>>();
    const assets = rows.results ?? [];

    if (assets.length === 0) {
      return new Response(JSON.stringify({ ok: true, assets: [] }), {
        status: 200, headers: corsHeaders,
      });
    }

    // ── 2. Batch-fetch all asset_media for these assets in ONE query ──────────
    const assetIds = assets.map(a => a['id'] as string);
    // Build IN clause with positional bindings
    const placeholders = assetIds.map(() => '?').join(', ');
    const mediaRows = await env.DB.prepare(
      `SELECT id, asset_id, file_url, role, sort_order, created_at
         FROM asset_media
        WHERE asset_id IN (${placeholders})
        ORDER BY sort_order ASC, created_at ASC`
    ).bind(...assetIds).all<AssetMediaRow>();

    // ── 3. Group media by asset_id ────────────────────────────────────────────
    const mediaByAsset = new Map<string, AssetMediaRow[]>();
    for (const m of (mediaRows.results ?? [])) {
      const bucket = mediaByAsset.get(m.asset_id) ?? [];
      bucket.push(m);
      mediaByAsset.set(m.asset_id, bucket);
    }

    // ── 4. Merge media + is_complete onto each asset ──────────────────────────
    const enriched = assets.map(a => {
      const id       = a['id'] as string;
      const cat      = (a['category'] as string) ?? 'other';
      const media    = mediaByAsset.get(id) ?? [];
      const roles    = media.map(m => m.role);
      return {
        ...a,
        media,
        is_complete: isAssetComplete(cat, roles),
      };
    });

    return new Response(JSON.stringify({ ok: true, assets: enriched }), {
      status: 200, headers: corsHeaders,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB read failed', detail: String(e) }), {
      status: 500, headers: corsHeaders,
    });
  }
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
