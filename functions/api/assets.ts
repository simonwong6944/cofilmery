/**
 * Cloudflare Pages Function: GET /api/assets
 * Returns asset list for a project from D1.
 *
 * Query params:
 *   project_id  string  (required)
 *   category    string  (optional filter)
 *   limit       number  (default 100, max 200)
 *
 * Env bindings required:
 *   DB  — D1Database
 */

interface Env {
  DB: D1Database;
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

    const rows = await env.DB.prepare(sql).bind(...params).all();
    return new Response(JSON.stringify({ ok: true, assets: rows.results ?? [] }), {
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
