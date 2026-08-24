/**
 * Cloudflare Pages Function: DELETE /api/asset-media/:id
 *
 * Deletes a single asset_media row by its primary-key id.
 * R2 cleanup is attempted when file_url is a local /api/assets/file/<r2key> path.
 * R2 failure is non-fatal — D1 row is always deleted.
 *
 * Env bindings required:
 *   DB    — D1Database
 *   FILES — R2Bucket (optional — only for R2 cleanup)
 */

interface Env {
  DB:    D1Database;
  FILES: R2Bucket;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const id = ctx.params['id'] as string | undefined;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing media id' }), {
      status: 400, headers: CORS,
    });
  }

  try {
    const row = await ctx.env.DB.prepare(
      `SELECT id, file_url FROM asset_media WHERE id = ?`
    ).bind(id).first<{ id: string; file_url: string }>();

    if (!row) {
      return new Response(JSON.stringify({ error: 'Media not found' }), {
        status: 404, headers: CORS,
      });
    }

    // Attempt R2 cleanup for locally-hosted files
    const LOCAL_PREFIX = '/api/assets/file/';
    if (ctx.env.FILES && row.file_url.startsWith(LOCAL_PREFIX)) {
      try {
        const r2Key = decodeURIComponent(row.file_url.slice(LOCAL_PREFIX.length));
        await ctx.env.FILES.delete(r2Key);
      } catch (r2Err) {
        console.error('[asset-media DELETE] R2 cleanup failed (continuing):', r2Err);
      }
    }

    await ctx.env.DB.prepare(`DELETE FROM asset_media WHERE id = ?`).bind(id).run();

    return new Response(JSON.stringify({ ok: true, id }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Delete failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
