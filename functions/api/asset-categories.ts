/**
 * Cloudflare Pages Function: GET/POST /api/asset-categories
 * Admin-managed asset categories for the Assets Library.
 *
 * GET  → { ok, categories: AssetCategory[] }
 * POST → body { name: string } → { ok, category: AssetCategory }
 *        409 if slug already exists
 *
 * Env bindings required:
 *   DB  — D1Database
 */

interface Env {
  DB: D1Database;
}

interface AssetCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'category';
}

// ── GET: list all categories ──────────────────────────────────────────────
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  try {
    const rows = await ctx.env.DB.prepare(
      `SELECT id, name, slug, created_at FROM asset_categories ORDER BY created_at ASC`
    ).all<AssetCategory>();
    return new Response(JSON.stringify({ ok: true, categories: rows.results ?? [] }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB read failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

// ── POST: create a new category ───────────────────────────────────────────
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  let body: { name?: string };
  try {
    body = await ctx.request.json() as { name?: string };
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: CORS,
    });
  }

  const name = (body.name ?? '').trim();
  if (!name) {
    return new Response(JSON.stringify({ error: 'name is required' }), {
      status: 400, headers: CORS,
    });
  }

  const slug = slugify(name);
  const id   = `cat-${crypto.randomUUID().slice(0, 8)}`;

  try {
    // Check slug uniqueness
    const existing = await ctx.env.DB.prepare(
      `SELECT id FROM asset_categories WHERE slug = ?`
    ).bind(slug).first();

    if (existing) {
      return new Response(JSON.stringify({ error: 'Category slug already exists', slug }), {
        status: 409, headers: CORS,
      });
    }

    await ctx.env.DB.prepare(
      `INSERT INTO asset_categories (id, name, slug) VALUES (?, ?, ?)`
    ).bind(id, name, slug).run();

    const category: AssetCategory = { id, name, slug, created_at: new Date().toISOString() };
    return new Response(JSON.stringify({ ok: true, category }), {
      status: 201, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB write failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

// ── OPTIONS: CORS preflight ───────────────────────────────────────────────
export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
