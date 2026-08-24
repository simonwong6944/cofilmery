/**
 * Cloudflare Pages Function: GET /api/assets
 * Returns asset list for a project from D1, enriched with media angles + is_complete.
 *
 * Query params:
 *   project_id  string  (required; 'all' or empty = return all)
 *   category    string  (optional filter)
 *   limit       number  (default 100, max 200)
 *
 * Response shape per asset:
 *   { ...existingAssetFields, media: AssetMediaRow[], is_complete: boolean }
 *
 * Env bindings required:
 *   DB — D1Database
 *
 * Completeness rules (inline — CF Pages can't cross-import):
 *   character | prop | costume | sponsor  → needs front + side + back
 *   scene                                 → needs main
 *   audio / other / *                     → needs primary
 *   three-quarter: optional, never blocks
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

// Inline completeness helper — must stay in sync with asset-media.ts + assets/[id].ts
function isAssetComplete(category: string, roles: string[]): boolean {
  const s = new Set(roles);
  switch (category) {
    case 'character': case 'prop': case 'costume': case 'sponsor':
      return s.has('front') && s.has('side') && s.has('back');
    case 'scene':
      return s.has('main');
    case 'audio':
      return s.has('primary');
    default:
      return s.has('primary');
  }
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const env  = ctx.env;
  const url  = new URL(ctx.request.url);
  const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  const projectIdRaw = url.searchParams.get('project_id') ?? '';
  const category     = url.searchParams.get('category')   ?? '';
  const limit        = Math.min(Number(url.searchParams.get('limit') ?? '100'), 200);
  const scopeAll     = !projectIdRaw || projectIdRaw === 'all';

  try {
    // ── 1. Fetch matching assets ──────────────────────────────────────────────
    const whereClauses: string[] = [];
    const params: (string | number)[] = [];

    if (!scopeAll)  { whereClauses.push('project_id = ?'); params.push(projectIdRaw); }
    if (category)   { whereClauses.push('category = ?');   params.push(category); }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    params.push(limit);

    const rows   = await env.DB.prepare(
      `SELECT * FROM assets ${whereSQL} ORDER BY uploaded_at DESC LIMIT ?`
    ).bind(...params).all<Record<string, unknown>>();
    const assets = rows.results ?? [];

    if (assets.length === 0) {
      return new Response(JSON.stringify({ ok: true, assets: [] }), { status: 200, headers: CORS });
    }

    // ── 2. Batch-fetch asset_media (single IN query — avoids N+1) ─────────────
    const assetIds    = assets.map(a => a['id'] as string);
    const placeholders = assetIds.map(() => '?').join(', ');

    const mediaRows = await env.DB.prepare(
      `SELECT id, asset_id, file_url, role, sort_order, created_at
         FROM asset_media
        WHERE asset_id IN (${placeholders})
        ORDER BY sort_order ASC, created_at ASC`
    ).bind(...assetIds).all<AssetMediaRow>();

    // ── 3. Group by asset_id ──────────────────────────────────────────────────
    const byAsset = new Map<string, AssetMediaRow[]>();
    for (const m of (mediaRows.results ?? [])) {
      const bucket = byAsset.get(m.asset_id) ?? [];
      bucket.push(m);
      byAsset.set(m.asset_id, bucket);
    }

    // ── 4. Merge ──────────────────────────────────────────────────────────────
    const enriched = assets.map(a => {
      const id    = a['id'] as string;
      const cat   = (a['category'] as string) ?? 'other';
      const media = byAsset.get(id) ?? [];
      return { ...a, media, is_complete: isAssetComplete(cat, media.map(m => m.role)) };
    });

    return new Response(JSON.stringify({ ok: true, assets: enriched }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB read failed', detail: String(e) }), {
      status: 500, headers: CORS,
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
