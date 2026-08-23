/**
 * Cloudflare Pages Function: /api/project-sponsor-assets
 *
 * GET  /api/project-sponsor-assets?project_id=<pid>
 *   → SELECT all sponsor asset rows for the project
 *   → returns { ok: true, assets: SelectedSponsorAsset[] }
 *   → empty project_id → returns { ok: true, assets: [] }
 *
 * POST /api/project-sponsor-assets
 *   body: { project_id: string; assets: SelectedSponsorAsset[] }
 *   → full overwrite: DELETE + batch-INSERT via D1 batch
 *   → returns { ok: true, count: N }
 *
 * OPTIONS → 204 CORS preflight
 *
 * Env bindings required:
 *   DB  — D1Database
 */

interface Env {
  DB: D1Database;
}

interface SponsorAssetRow {
  project_id:   string;
  asset_id:     string;
  category:     string;
  name:         string;
  img:          string;
  brand:        string;
  revenue_rate: number;
  created_at:   string;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

// ── GET /api/project-sponsor-assets?project_id=<pid> ─────────────────────────
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url       = new URL(ctx.request.url);
  const projectId = url.searchParams.get('project_id') ?? '';

  // Empty project_id → return empty array (no error)
  if (!projectId) {
    return new Response(JSON.stringify({ ok: true, assets: [] }), {
      status: 200, headers: CORS,
    });
  }

  try {
    const rows = await ctx.env.DB.prepare(
      `SELECT project_id, asset_id, category, name, img, brand, revenue_rate, created_at
       FROM project_sponsor_assets
       WHERE project_id = ?
       ORDER BY created_at ASC`
    ).bind(projectId).all<SponsorAssetRow>();

    return new Response(JSON.stringify({ ok: true, assets: rows.results ?? [] }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB read failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

// ── POST /api/project-sponsor-assets ─────────────────────────────────────────
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  let body: {
    project_id?: string;
    assets?: {
      asset_id:     string;
      category:     string;
      name:         string;
      img:          string;
      brand:        string;
      revenue_rate: number;
    }[];
  };

  try {
    body = await ctx.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: CORS,
    });
  }

  const { project_id: projectId, assets } = body;

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'project_id is required' }), {
      status: 400, headers: CORS,
    });
  }
  if (!Array.isArray(assets)) {
    return new Response(JSON.stringify({ error: 'assets must be an array' }), {
      status: 400, headers: CORS,
    });
  }

  const now = new Date().toISOString();

  try {
    // Full overwrite: delete all existing selections for this project, then re-insert
    const deleteStmt = ctx.env.DB.prepare(
      `DELETE FROM project_sponsor_assets WHERE project_id = ?`
    ).bind(projectId);

    const insertStmts = assets.map(a =>
      ctx.env.DB.prepare(
        `INSERT INTO project_sponsor_assets
           (project_id, asset_id, category, name, img, brand, revenue_rate, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(project_id, asset_id) DO UPDATE SET
           category     = excluded.category,
           name         = excluded.name,
           img          = excluded.img,
           brand        = excluded.brand,
           revenue_rate = excluded.revenue_rate`
      ).bind(
        projectId,
        a.asset_id    ?? '',
        a.category    ?? '',
        a.name        ?? '',
        a.img         ?? '',
        a.brand       ?? '',
        typeof a.revenue_rate === 'number' ? a.revenue_rate : 0,
        now
      )
    );

    // D1 batch: atomic delete + inserts
    await ctx.env.DB.batch([deleteStmt, ...insertStmts]);

    return new Response(JSON.stringify({ ok: true, count: assets.length }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB write failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

// ── OPTIONS: CORS preflight ───────────────────────────────────────────────────
export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
