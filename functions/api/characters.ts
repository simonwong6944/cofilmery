/**
 * Cloudflare Pages Function: /api/characters
 *
 * GET  /api/characters?project_id=<pid>
 *   → SELECT all rows for project, parse data JSON, return { ok, characters }
 *
 * POST /api/characters
 *   body: { project_id: string; characters: CharacterCard[] }
 *   → DELETE existing rows for project, then batch-INSERT new rows
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

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

// ── GET /api/characters?project_id=<pid> ─────────────────────────────────────
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;
  const url = new URL(ctx.request.url);
  const projectId = url.searchParams.get('project_id') ?? '';

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'project_id is required' }), {
      status: 400, headers: CORS,
    });
  }

  try {
    const rows = await env.DB.prepare(
      `SELECT id, project_id, name, img, data, sort_order, created_at, updated_at
       FROM characters
       WHERE project_id = ?
       ORDER BY sort_order ASC`
    ).bind(projectId).all();

    // Parse the JSON blob in each row back into a CharacterCard object
    const characters = (rows.results ?? []).map((row: Record<string, unknown>) => {
      let parsed: unknown = {};
      try { parsed = JSON.parse(row.data as string); } catch { /* ignore bad JSON */ }
      return parsed;
    });

    return new Response(JSON.stringify({ ok: true, characters }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB read failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

// ── POST /api/characters ──────────────────────────────────────────────────────
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;

  let body: { project_id?: string; characters?: unknown[] };
  try {
    body = await ctx.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: CORS,
    });
  }

  const { project_id: projectId, characters } = body;

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'project_id is required' }), {
      status: 400, headers: CORS,
    });
  }
  if (!Array.isArray(characters)) {
    return new Response(JSON.stringify({ error: 'characters must be an array' }), {
      status: 400, headers: CORS,
    });
  }

  const now = new Date().toISOString();

  try {
    // Full overwrite: delete all existing rows for this project, then re-insert
    const deleteStmt = env.DB.prepare(
      `DELETE FROM characters WHERE project_id = ?`
    ).bind(projectId);

    // Build INSERT statements for each character
    const insertStmts = (characters as Record<string, unknown>[]).map((char, idx) => {
      const id: string = (char.id as string) || crypto.randomUUID();
      const name: string = ((char.name_i18n as Record<string, string>)?.['zh-HK']) ?? '';
      const img: string = (char.img as string) ?? '';
      const data: string = JSON.stringify(char);
      return env.DB.prepare(
        `INSERT INTO characters (id, project_id, name, img, data, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           project_id = excluded.project_id,
           name       = excluded.name,
           img        = excluded.img,
           data       = excluded.data,
           sort_order = excluded.sort_order,
           updated_at = excluded.updated_at`
      ).bind(id, projectId, name, img, data, idx, now, now);
    });

    // D1 batch: atomic delete + inserts
    await env.DB.batch([deleteStmt, ...insertStmts]);

    return new Response(JSON.stringify({ ok: true, count: characters.length }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB write failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

// ── PATCH /api/characters ─────────────────────────────────────────────────────
// Lightweight single-field update: sync a character's img column AND data blob.
// Body: { id: string; img: string }
// Reads the existing data JSON, merges in the new img, then writes both columns.
// Used by setAsAvatar flow so loadCharactersFromD1 returns the correct thumbnail
// after logout/re-login without requiring a full characters overwrite.
export const onRequestPatch: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;

  let body: { id?: string; img?: string };
  try {
    body = await ctx.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: CORS,
    });
  }

  const { id, img } = body;
  if (!id)  return new Response(JSON.stringify({ error: 'id is required' }),  { status: 400, headers: CORS });
  if (!img) return new Response(JSON.stringify({ error: 'img is required' }), { status: 400, headers: CORS });

  const now = new Date().toISOString();
  try {
    // Read existing data blob so we can merge img into it
    const row = await env.DB.prepare(
      `SELECT data FROM characters WHERE id = ?`
    ).bind(id).first<{ data: string }>();

    if (!row) {
      return new Response(JSON.stringify({ error: 'Character not found', id }), {
        status: 404, headers: CORS,
      });
    }

    // Merge img into the existing data JSON blob
    let dataObj: Record<string, unknown> = {};
    try { dataObj = JSON.parse(row.data); } catch { /* keep empty */ }
    dataObj.img = img;
    const mergedData = JSON.stringify(dataObj);

    await env.DB.prepare(
      `UPDATE characters SET img = ?, data = ?, updated_at = ? WHERE id = ?`
    ).bind(img, mergedData, now, id).run();

    return new Response(JSON.stringify({ ok: true, id, img }), { status: 200, headers: CORS });
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
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
