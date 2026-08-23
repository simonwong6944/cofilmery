/**
 * Cloudflare Pages Function: DELETE /api/asset-categories/[id]
 * Deletes an asset category by id.
 *
 * Safety check: if any asset is currently using this category slug,
 * deletion is refused with HTTP 400 to prevent orphan records.
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

// ── DELETE: remove category by id ────────────────────────────────────────
export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const id = ctx.params['id'] as string | undefined;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing category id' }), {
      status: 400, headers: CORS,
    });
  }

  try {
    // Look up the category to get its slug
    const cat = await ctx.env.DB.prepare(
      `SELECT id, slug FROM asset_categories WHERE id = ?`
    ).bind(id).first<{ id: string; slug: string }>();

    if (!cat) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404, headers: CORS,
      });
    }

    // Safety check: refuse if any asset is still using this category
    const inUse = await ctx.env.DB.prepare(
      `SELECT COUNT(*) AS cnt FROM assets WHERE category = ?`
    ).bind(cat.slug).first<{ cnt: number }>();

    if (inUse && inUse.cnt > 0) {
      return new Response(JSON.stringify({
        error: `Cannot delete: ${inUse.cnt} asset(s) are using category "${cat.slug}". Re-assign them first.`,
        inUseCount: inUse.cnt,
      }), { status: 400, headers: CORS });
    }

    await ctx.env.DB.prepare(
      `DELETE FROM asset_categories WHERE id = ?`
    ).bind(id).run();

    return new Response(JSON.stringify({ ok: true, deletedId: id }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB operation failed', detail: String(e) }), {
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
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
