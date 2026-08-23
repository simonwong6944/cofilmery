/**
 * Cloudflare Pages Function: GET /api/projects/:id
 * Returns a single project by id.
 *
 * Env bindings: DB (D1Database)
 */

interface Env {
  DB: D1Database;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;
  const id  = ctx.params['id'] as string;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Project id is required' }), {
      status: 400, headers: CORS,
    });
  }

  try {
    const row = await env.DB.prepare(
      `SELECT id, title, mode, status, creator_id, description, tags,
              episode_count, completed_episodes, thumbnail_url,
              total_views, esg_score, published_at, created_at, updated_at,
              story_material, series_context
       FROM projects WHERE id = ?`
    ).bind(id).first();

    if (!row) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404, headers: CORS,
      });
    }

    return new Response(JSON.stringify({ ok: true, project: row }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB read failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;
  const id  = ctx.params['id'] as string;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Project id is required' }), {
      status: 400, headers: CORS,
    });
  }

  try {
    const result = await env.DB.prepare(
      `DELETE FROM projects WHERE id = ?`
    ).bind(id).run();

    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404, headers: CORS,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB delete failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
