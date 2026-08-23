/**
 * Cloudflare Pages Function: POST /api/upload
 * Receives multipart/form-data, writes to R2, records in D1 assets table.
 *
 * Env bindings required:
 *   FILES  — R2Bucket  (binding name: FILES)
 *   DB     — D1Database
 */

interface Env {
  FILES: R2Bucket;
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (!env.FILES) {
    return new Response(JSON.stringify({ error: 'Storage not configured (FILES binding missing)' }), {
      status: 503, headers: corsHeaders,
    });
  }

  // Parse multipart/form-data
  let formData: FormData;
  try {
    formData = await ctx.request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid multipart form data' }), {
      status: 400, headers: corsHeaders,
    });
  }

  const file      = formData.get('file') as File | null;
  const projectId = (formData.get('projectId')    as string | null) ?? 'global';
  const userId    = (formData.get('userId')        as string | null) ?? 'anonymous';
  const category  = (formData.get('category')      as string | null) ?? 'other';
  const label     = (formData.get('label')         as string | null) ?? '';

  // New metadata fields
  const brand       = (formData.get('brand')        as string | null) ?? '';
  const model       = (formData.get('model')        as string | null) ?? '';
  const description = (formData.get('description')  as string | null) ?? '';
  const revenueRateRaw = parseFloat((formData.get('revenue_rate') as string | null) ?? '0');
  const revenue_rate = isFinite(revenueRateRaw) && revenueRateRaw >= 0 ? revenueRateRaw : 0;

  if (!file || typeof file === 'string') {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400, headers: corsHeaders,
    });
  }

  // 10 MB hard limit
  const MAX_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return new Response(JSON.stringify({ error: 'File too large (max 10 MB)' }), {
      status: 413, headers: corsHeaders,
    });
  }

  // Build R2 key: safe filename, UUID-prefixed
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
  const id       = crypto.randomUUID();
  const r2Key    = `uploads/${projectId}/${id}_${safeName}`;

  const arrayBuf = await file.arrayBuffer();

  // Write to R2
  try {
    await env.FILES.put(r2Key, arrayBuf, {
      httpMetadata:   { contentType: file.type || 'application/octet-stream' },
      customMetadata: { originalName: file.name, userId, projectId, category },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'R2 write failed', detail: String(e) }), {
      status: 500, headers: corsHeaders,
    });
  }

  // File served via /api/assets/file/<r2Key>
  const fileUrl = `/api/assets/file/${encodeURIComponent(r2Key)}`;

  // Record in D1 (non-fatal if DB unavailable)
  try {
    await env.DB.prepare(
      `INSERT INTO assets
         (id, project_id, user_id, file_name, file_type, file_size, r2_key, file_url,
          category, label, brand, model, description, revenue_rate)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      id, projectId, userId, file.name, file.type, file.size, r2Key, fileUrl,
      category, label, brand, model, description, revenue_rate
    ).run();
  } catch (e) {
    console.error('D1 asset insert failed:', e);
  }

  return new Response(JSON.stringify({
    ok: true,
    id,
    r2Key,
    fileUrl,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    category,
    label,
    brand,
    model,
    description,
    revenue_rate,
    uploadedAt: new Date().toISOString(),
  }), { status: 200, headers: corsHeaders });
};

// Allow CORS preflight
export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
