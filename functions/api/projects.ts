/**
 * Cloudflare Pages Function: /api/projects
 *
 * GET  /api/projects?creator_id=<id>   → list all projects for a creator
 * POST /api/projects                   → create a new project
 *
 * Env bindings: DB (D1Database)
 *
 * NOTE: D1 SQLite has PRAGMA foreign_keys = OFF by default, so INSERTs with
 * an unknown creator_id succeed without referential errors — safe for the
 * current mock-auth / anonymous-user scenario.
 */

interface Env {
  DB: D1Database;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

// ── GET /api/projects?creator_id=<id> ────────────────────────────────────────
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;
  const url = new URL(ctx.request.url);
  const creatorId = url.searchParams.get('creator_id') ?? '';

  if (!creatorId) {
    return new Response(JSON.stringify({ error: 'creator_id is required' }), {
      status: 400, headers: CORS,
    });
  }

  try {
    const rows = await env.DB.prepare(
      `SELECT id, title, mode, status, creator_id, description, tags,
              episode_count, completed_episodes, thumbnail_url,
              total_views, esg_score, published_at, created_at, updated_at
       FROM projects
       WHERE creator_id = ?
       ORDER BY updated_at DESC
       LIMIT 100`
    ).bind(creatorId).all();

    return new Response(JSON.stringify({ ok: true, projects: rows.results ?? [] }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB read failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

// ── POST /api/projects ────────────────────────────────────────────────────────
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;

  let body: { title?: string; mode?: string; creator_id?: string; description?: string };
  try {
    body = await ctx.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: CORS,
    });
  }

  const { title, mode, creator_id, description } = body;

  if (!title || !creator_id) {
    return new Response(JSON.stringify({ error: 'title and creator_id are required' }), {
      status: 400, headers: CORS,
    });
  }

  const validMode = (mode === 'drama' || mode === 'legacy') ? mode : 'drama';
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await env.DB.prepare(
      `INSERT INTO projects (id, title, mode, status, creator_id, description, created_at, updated_at)
       VALUES (?, ?, ?, 'draft', ?, ?, ?, ?)`
    ).bind(id, title, validMode, creator_id, description ?? null, now, now).run();

    const project = {
      id, title,
      mode: validMode,
      status: 'draft',
      creator_id,
      description: description ?? null,
      episode_count: 0,
      completed_episodes: 0,
      thumbnail_url: null,
      created_at: now,
      updated_at: now,
    };

    return new Response(JSON.stringify({ ok: true, project }), {
      status: 201, headers: CORS,
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
