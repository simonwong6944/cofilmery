/**
 * Cloudflare Pages Function: /api/storyboard
 *
 * GET  /api/storyboard?project_id=<pid>&episode=<ep>
 *   → SELECT all panels for (project_id, episode), return { ok, panels }
 *
 * POST /api/storyboard
 *   body: { project_id: string; episode: number; panels: StoryboardPanel[] }
 *   → DELETE existing panels for this (project_id, episode) only
 *   → batch-INSERT new panels
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

interface StoryboardPanelRow {
  scene:    number;
  desc:     string;
  cam_note: string;
  duration: number;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

// ── GET /api/storyboard?project_id=<pid>&episode=<ep> ────────────────────────
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;
  const url = new URL(ctx.request.url);
  const projectId = url.searchParams.get('project_id') ?? '';
  const episodeRaw = url.searchParams.get('episode') ?? '';
  const episode = parseInt(episodeRaw, 10);

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
      `SELECT scene, desc, cam_note, duration
       FROM storyboard_panels
       WHERE project_id = ? AND episode = ?
       ORDER BY sort_order ASC`
    ).bind(projectId, episode).all();

    const panels = (rows.results ?? []).map((row: Record<string, unknown>) => ({
      scene:    row.scene    as number,
      desc:     row.desc     as string,
      camNote:  row.cam_note as string,
      duration: row.duration as number,
    }));

    return new Response(JSON.stringify({ ok: true, panels }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB read failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

// ── POST /api/storyboard ──────────────────────────────────────────────────────
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;

  let body: { project_id?: string; episode?: unknown; panels?: unknown[] };
  try {
    body = await ctx.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: CORS,
    });
  }

  const { project_id: projectId, episode, panels } = body;

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'project_id is required' }), {
      status: 400, headers: CORS,
    });
  }
  if (typeof episode !== 'number' || isNaN(episode)) {
    return new Response(JSON.stringify({ error: 'episode must be a number' }), {
      status: 400, headers: CORS,
    });
  }
  if (!Array.isArray(panels)) {
    return new Response(JSON.stringify({ error: 'panels must be an array' }), {
      status: 400, headers: CORS,
    });
  }

  const now = new Date().toISOString();

  try {
    // Delete only this episode's panels — other episodes are untouched
    const deleteStmt = env.DB.prepare(
      `DELETE FROM storyboard_panels WHERE project_id = ? AND episode = ?`
    ).bind(projectId, episode);

    // Build INSERT statements for each panel
    const insertStmts = (panels as Record<string, unknown>[]).map((panel, idx) => {
      const row = panel as StoryboardPanelRow;
      const id       = crypto.randomUUID();
      const scene    = typeof row.scene    === 'number' ? row.scene    : idx + 1;
      const desc     = typeof row.desc     === 'string' ? row.desc     : '';
      const camNote  = typeof row.camNote  === 'string' ? row.camNote  : '';
      const duration = typeof row.duration === 'number' ? row.duration : 6;
      return env.DB.prepare(
        `INSERT INTO storyboard_panels
           (id, project_id, episode, scene, desc, cam_note, duration, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, projectId, episode, scene, desc, camNote, duration, idx, now, now);
    });

    // D1 batch: atomic delete + inserts (episode-scoped)
    await env.DB.batch([deleteStmt, ...insertStmts]);

    return new Response(JSON.stringify({ ok: true, count: panels.length }), {
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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
