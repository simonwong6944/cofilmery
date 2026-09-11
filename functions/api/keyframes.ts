/**
 * Cloudflare Pages Function: /api/keyframes
 *
 * GET  /api/keyframes?project_id=<pid>&episode=<ep>
 *   → SELECT keyframes for (project_id, episode), return { ok, keyframes }
 *
 * POST /api/keyframes
 *   body: { project_id, episode, panel_scene, image_url, r2_key }
 *   → UPSERT single keyframe (INSERT OR REPLACE)
 *   → returns { ok, id }
 *
 * OPTIONS → 204 CORS preflight
 *
 * Env bindings required:
 *   DB  — D1Database
 */

interface Env {
  DB: D1Database;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

// ── GET /api/keyframes?project_id=<pid>&episode=<ep> ─────────────────────────
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;
  const url = new URL(ctx.request.url);
  const projectId  = url.searchParams.get('project_id') ?? '';
  const episodeRaw = url.searchParams.get('episode') ?? '';
  const episode    = parseInt(episodeRaw, 10);

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'project_id is required' }), {
      status: 400, headers: CORS,
    });
  }
  if (!episodeRaw || isNaN(episode)) {
    return new Response(JSON.stringify({ error: 'episode is required and must be a number' }), {
      status: 400, headers: CORS,
    });
  }

  try {
    const rows = await env.DB.prepare(
      `SELECT id, panel_scene, image_url, r2_key, sort_order
       FROM keyframes
       WHERE project_id = ? AND episode = ?
       ORDER BY sort_order ASC`
    ).bind(projectId, episode).all();

    const keyframes = (rows.results ?? []).map((row: Record<string, unknown>) => ({
      id:          row.id          as string,
      panelScene:  row.panel_scene as number,
      imageUrl:    row.image_url   as string,
      r2Key:       row.r2_key      as string,
      sortOrder:   row.sort_order  as number,
    }));

    return new Response(JSON.stringify({ ok: true, keyframes }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB read failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

// ── POST /api/keyframes ───────────────────────────────────────────────────────
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;

  let body: {
    project_id?: string;
    episode?: unknown;
    panel_scene?: unknown;
    image_url?: string;
    r2_key?: string;
  };
  try {
    body = await ctx.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: CORS,
    });
  }

  const { project_id: projectId, episode, panel_scene: panelScene, image_url: imageUrl, r2_key: r2Key } = body;

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'project_id is required' }), {
      status: 400, headers: CORS,
    });
  }
  if (typeof episode !== 'number' || isNaN(episode as number)) {
    return new Response(JSON.stringify({ error: 'episode must be a number' }), {
      status: 400, headers: CORS,
    });
  }
  if (typeof panelScene !== 'number' || isNaN(panelScene as number)) {
    return new Response(JSON.stringify({ error: 'panel_scene must be a number' }), {
      status: 400, headers: CORS,
    });
  }
  if (!imageUrl) {
    return new Response(JSON.stringify({ error: 'image_url is required' }), {
      status: 400, headers: CORS,
    });
  }

  const id  = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    // True upsert: requires UNIQUE index on (project_id, episode, panel_scene) — migration 0014.
    // ON CONFLICT DO UPDATE avoids new-row-on-replace behaviour of INSERT OR REPLACE.
    await env.DB.prepare(
      `INSERT INTO keyframes
         (id, project_id, episode, panel_scene, image_url, r2_key, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(project_id, episode, panel_scene)
       DO UPDATE SET image_url = excluded.image_url,
                     r2_key    = excluded.r2_key`
    ).bind(
      id, projectId, episode as number, panelScene as number,
      imageUrl, r2Key ?? '', panelScene as number, now,
    ).run();

    return new Response(JSON.stringify({ ok: true, id }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB write failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

// ── OPTIONS (CORS preflight) ──────────────────────────────────────────────────
export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
