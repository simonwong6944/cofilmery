/**
 * Cloudflare Pages Function: PATCH /api/assets/[id]  — update asset metadata
 *                            DELETE /api/assets/[id]  — delete asset (R2 + D1)
 *
 * Env bindings required:
 *   DB    — D1Database
 *   FILES — R2Bucket
 *
 * Owner check (anti-accidental-delete, not a hard auth boundary):
 *   - X-User-Role: 'admin' → bypass owner check (can modify any asset)
 *   - otherwise           → X-User-Id must match assets.user_id; else 403
 */

interface Env {
  DB: D1Database;
  FILES: R2Bucket;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

// ── Allowed metadata fields for PATCH ────────────────────────────────────────
const PATCHABLE = ['brand', 'model', 'description', 'revenue_rate', 'category', 'label'] as const;
type PatchField = typeof PATCHABLE[number];

// ── Helper: read caller identity from request headers ─────────────────────────
function callerIdentity(request: Request): { callerId: string; isAdmin: boolean } {
  const callerId = request.headers.get('X-User-Id') ?? '';
  const callerRole = request.headers.get('X-User-Role') ?? '';
  return { callerId, isAdmin: callerRole === 'admin' };
}

// ── PATCH: update asset metadata ─────────────────────────────────────────────
export const onRequestPatch: PagesFunction<Env> = async (ctx) => {
  const id = ctx.params['id'] as string | undefined;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing asset id' }), {
      status: 400, headers: CORS,
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await ctx.request.json() as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: CORS,
    });
  }

  // Build dynamic SET clause from whitelist only
  const setClauses: string[] = [];
  const bindings: (string | number)[] = [];

  for (const field of PATCHABLE) {
    if (!(field in body)) continue;

    if (field === 'revenue_rate') {
      const raw = parseFloat(String(body[field]));
      const val = isFinite(raw) && raw >= 0 ? raw : 0;
      setClauses.push(`${field} = ?`);
      bindings.push(val);
    } else {
      setClauses.push(`${field} = ?`);
      bindings.push(String(body[field] ?? ''));
    }
  }

  if (setClauses.length === 0) {
    return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
      status: 400, headers: CORS,
    });
  }

  try {
    // Fetch asset — need user_id for owner check
    const existing = await ctx.env.DB.prepare(
      `SELECT id, user_id FROM assets WHERE id = ?`
    ).bind(id).first<{ id: string; user_id: string }>();

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Asset not found' }), {
        status: 404, headers: CORS,
      });
    }

    // ── Owner check ──────────────────────────────────────────────────────────
    const { callerId, isAdmin } = callerIdentity(ctx.request);
    if (!isAdmin && existing.user_id !== callerId) {
      return new Response(JSON.stringify({ error: 'Not owner' }), {
        status: 403, headers: CORS,
      });
    }

    // Execute UPDATE
    await ctx.env.DB.prepare(
      `UPDATE assets SET ${setClauses.join(', ')} WHERE id = ?`
    ).bind(...bindings, id).run();

    // Return updated row
    const updated = await ctx.env.DB.prepare(
      `SELECT * FROM assets WHERE id = ?`
    ).bind(id).first();

    return new Response(JSON.stringify({ ok: true, id, asset: updated }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'DB update failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

// ── DELETE: remove asset from R2 and D1 ──────────────────────────────────────
export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const id = ctx.params['id'] as string | undefined;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing asset id' }), {
      status: 400, headers: CORS,
    });
  }

  try {
    // Get r2_key + user_id before deletion
    const row = await ctx.env.DB.prepare(
      `SELECT r2_key, user_id FROM assets WHERE id = ?`
    ).bind(id).first<{ r2_key: string; user_id: string }>();

    if (!row) {
      return new Response(JSON.stringify({ error: 'Asset not found' }), {
        status: 404, headers: CORS,
      });
    }

    // ── Owner check ──────────────────────────────────────────────────────────
    const { callerId, isAdmin } = callerIdentity(ctx.request);
    if (!isAdmin && row.user_id !== callerId) {
      return new Response(JSON.stringify({ error: 'Not owner' }), {
        status: 403, headers: CORS,
      });
    }

    // Delete from R2 (non-fatal — log on failure, continue to D1 delete)
    try {
      if (ctx.env.FILES) {
        await ctx.env.FILES.delete(row.r2_key);
      }
    } catch (r2Err) {
      console.error('R2 delete failed (continuing to D1 delete):', r2Err);
    }

    // Delete from D1
    await ctx.env.DB.prepare(
      `DELETE FROM assets WHERE id = ?`
    ).bind(id).run();

    return new Response(JSON.stringify({ ok: true, id }), {
      status: 200, headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Delete failed', detail: String(e) }), {
      status: 500, headers: CORS,
    });
  }
};

// ── OPTIONS: CORS preflight ───────────────────────────────────────────────────
export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-User-Role',
    },
  });
