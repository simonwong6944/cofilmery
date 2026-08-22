/**
 * Cloudflare Pages Function: GET /api/assets/file/*
 * Proxies R2 objects to the browser.
 * The full R2 key is captured by the [[key]] catch-all segment.
 *
 * Example:
 *   GET /api/assets/file/uploads%2Fglobal%2Fuuid_photo.jpg
 *   → R2.get('uploads/global/uuid_photo.jpg') → stream
 *
 * Env bindings required:
 *   FILES  — R2Bucket
 */

interface Env {
  FILES: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;

  if (!env.FILES) {
    return new Response(JSON.stringify({ error: 'Storage not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ctx.params.key is the catch-all path after /api/assets/file/
  // It may be URL-encoded — decode it to get the real R2 key
  const rawKey = (ctx.params as Record<string, string | string[]>).key;
  const keyStr = Array.isArray(rawKey) ? rawKey.join('/') : (rawKey ?? '');
  const r2Key  = decodeURIComponent(keyStr);

  if (!r2Key) {
    return new Response(JSON.stringify({ error: 'Missing key' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const obj = await env.FILES.get(r2Key);
  if (!obj) {
    return new Response(JSON.stringify({ error: 'Not found', key: r2Key }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(obj.body, { status: 200, headers });
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
