/**
 * Cloudflare Pages Function: /api/ai/*
 * All OpenRouter calls are proxied here — the API key never leaves the server.
 * Env bindings: OPENROUTER_API_KEY (secret), DB (D1), FILES (R2)
 */
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { cors } from 'hono/cors';

// ── Constants ─────────────────────────────────────────────────────────────────
export const AI_MODELS = {
  TEXT_MODEL:  'moonshotai/kimi-k2',
  VIDEO_MODEL: 'bytedance/seedance-2.0',
  TTS_MODEL:   'minimax/speech-2.8-hd',
} as const;

const HKD_PER_CREDIT = 0.196;
const USD_TO_HKD     = 7.8;

function costUsdToCredits(costUsd: number): number {
  const hkd = costUsd * USD_TO_HKD;
  return Math.ceil(hkd / HKD_PER_CREDIT);
}

// ── OpenRouter fetch helper ───────────────────────────────────────────────────
async function orFetch(
  apiKey: string,
  path: string,
  init: RequestInit
): Promise<Response> {
  return fetch(`https://openrouter.ai/api/v1${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://cofilmery.app',
      'X-Title': 'CoFilmery',
      ...(init.headers as Record<string, string> ?? {}),
    },
  });
}

// ── D1 helpers ────────────────────────────────────────────────────────────────
async function recordCreditDebit(
  db: D1Database, userId: string, credits: number, category: string, desc: string
) {
  try {
    await db.prepare(
      `INSERT INTO credit_transactions (id, user_id, type, amount, description, category, created_at)
       VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP)`
    ).bind(crypto.randomUUID(), userId, 'debit', credits, desc, category).run();
  } catch { /* non-blocking */ }
}

async function recordGenJob(
  db: D1Database, jobId: string, userId: string,
  jobType: string, status: string, credits: number,
  provider: string, resultUrl?: string, episodeId?: string
) {
  try {
    await db.prepare(
      `INSERT OR REPLACE INTO gen_jobs
         (id, user_id, episode_id, job_type, status, credits_consumed, provider, result_url, created_at)
       VALUES (?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`
    ).bind(jobId, userId, episodeId ?? null, jobType, status, credits, provider, resultUrl ?? null).run();
  } catch { /* non-blocking */ }
}

// ── Hono app ──────────────────────────────────────────────────────────────────
type Env = { Bindings: { OPENROUTER_API_KEY: string; DB: D1Database; FILES: R2Bucket } };
const app = new Hono<Env>();
app.use('*', cors({ origin: '*' }));

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/api/ai/health', (c) => {
  const hasKey = !!c.env.OPENROUTER_API_KEY;
  return c.json({ ok: true, aiConfigured: hasKey, models: AI_MODELS });
});

// ─── Text generation ─────────────────────────────────────────────────────────
app.post('/api/ai/text', async (c) => {
  const env = c.env;
  if (!env.OPENROUTER_API_KEY) return c.json({ error: 'AI not configured' }, 503);

  const body = await c.req.json<{
    prompt: string; context?: string; maxTokens?: number;
    userId?: string; model?: string; episodeId?: string;
  }>();

  const messages = [];
  if (body.context) messages.push({ role: 'system', content: body.context });
  messages.push({ role: 'user', content: body.prompt });

  const res = await orFetch(env.OPENROUTER_API_KEY, '/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: body.model ?? AI_MODELS.TEXT_MODEL,
      messages,
      max_tokens: body.maxTokens ?? 2000,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return c.json({ error: 'Text generation failed', detail: err }, 502);
  }

  const data = await res.json<{
    choices: { message: { content: string } }[];
    usage: { total_tokens: number };
    usage_cost?: number;
  }>();

  const text       = data.choices[0]?.message?.content ?? '';
  const tokens     = data.usage?.total_tokens ?? 0;
  const costUsd    = data.usage_cost ?? (tokens * 0.000002);
  const credits    = costUsdToCredits(costUsd);
  const userId     = body.userId ?? 'anonymous';
  const jobId      = crypto.randomUUID();

  await recordGenJob(env.DB, jobId, userId, 'script', 'completed', credits, AI_MODELS.TEXT_MODEL, undefined, body.episodeId);
  await recordCreditDebit(env.DB, userId, credits, 'ai_generation', `文字生成 (${tokens} tokens)`);

  return c.json({ text, tokensUsed: tokens, creditsConsumed: credits, costUsd, provider: 'openrouter' });
});

// ─── Story Architect ─────────────────────────────────────────────────────────
app.post('/api/ai/architect', async (c) => {
  const env = c.env;
  if (!env.OPENROUTER_API_KEY) return c.json({ error: 'AI not configured' }, 503);

  const body = await c.req.json<{
    stage: string;
    context: Record<string, unknown>;
    selectedTopic?: Record<string, unknown>;
    characters?: unknown[];
    targetEpisode?: number;
    humanInput?: string;
    userId?: string;
    projectId?: string;
  }>();

  const { stage, context, humanInput } = body;

  const systemPrompt = `你是一位專業的粵語短劇創作顧問，擅長為55歲以上長者觀眾設計有共鳴的故事。
請用繁體中文主要回應，同時提供英文(en)和簡體中文(zh-CN)翻譯，輸出純 JSON。
系列資訊：${JSON.stringify(context)}`;

  let userPrompt = '';

  if (stage === 'outline') {
    userPrompt = `基於以下創作者提供的故事原材料，生成${context.episodeCount ?? 30}集全劇大綱。
故事原材料：\n${humanInput ?? '（未提供）'}

回傳 JSON（必須為 json_object）：
{"outline":[{"episodeNumber":1,"title_i18n":{"zh-HK":"...","en":"...","zh-CN":"..."},"oneLine_i18n":{"zh-HK":"...","en":"...","zh-CN":"..."}}]}`;

  } else if (stage === 'episodes') {
    const ep = body.targetEpisode ?? 1;
    userPrompt = `為第${ep}集生成故事卡（150-250字）。角色：${JSON.stringify((body.characters ?? []).map((ch: Record<string, unknown>) => ch.name_i18n))}
故事原材料：${humanInput ?? ''}

回傳 JSON：
{"storyCard":{"episodeNumber":${ep},"title_i18n":{"zh-HK":"","en":"","zh-CN":""},"coreEmotion_i18n":{"zh-HK":"","en":"","zh-CN":""},"hook_i18n":{"zh-HK":"","en":"","zh-CN":""},"body_i18n":{"zh-HK":"","en":"","zh-CN":""},"turningPoint_i18n":{"zh-HK":"","en":"","zh-CN":""},"linkPrevNext_i18n":{"zh-HK":"","en":"","zh-CN":""},"characterIds":[]}}`;

  } else {
    userPrompt = humanInput ?? `請為 stage="${stage}" 生成合適內容，回傳 JSON。`;
  }

  const res = await orFetch(env.OPENROUTER_API_KEY, '/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: AI_MODELS.TEXT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens: 4000,
      temperature: 0.85,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return c.json({ error: 'Architect failed', detail: err }, 502);
  }

  const data = await res.json<{
    choices: { message: { content: string } }[];
    usage: { total_tokens: number };
    usage_cost?: number;
  }>();

  let parsed: Record<string, unknown> = {};
  try { parsed = JSON.parse(data.choices[0]?.message?.content ?? '{}'); }
  catch { return c.json({ error: 'AI returned invalid JSON' }, 502); }

  const tokens     = data.usage?.total_tokens ?? 0;
  const costUsd    = data.usage_cost ?? (tokens * 0.000002);
  const credits    = costUsdToCredits(costUsd);
  const userId     = body.userId ?? 'anonymous';
  const projectId  = body.projectId ?? 'unknown';
  const jobId      = crypto.randomUUID();

  await recordGenJob(env.DB, jobId, userId, 'script', 'completed', credits, AI_MODELS.TEXT_MODEL);
  await recordCreditDebit(env.DB, userId, credits, 'ai_generation', `Story Architect: ${stage} (${tokens} tokens)`);

  try {
    await env.DB.prepare(
      `INSERT INTO architect_actions (id, project_id, stage, action, actor, credits_consumed, created_at)
       VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP)`
    ).bind(jobId, projectId, stage, 'generate', 'ai', credits).run();
  } catch { /* non-blocking */ }

  return c.json({ stage, ...parsed, tokensUsed: tokens, creditsConsumed: credits, costUsd, provider: 'openrouter' });
});

// ─── Video submit ────────────────────────────────────────────────────────────
app.post('/api/ai/video', async (c) => {
  const env = c.env;
  if (!env.OPENROUTER_API_KEY) return c.json({ error: 'AI not configured' }, 503);

  const body = await c.req.json<{
    prompt: string; duration?: number; resolution?: string;
    aspectRatio?: string; frameImages?: string[];
    inputReferences?: string[]; userId?: string;
    episodeId?: string; model?: string;
  }>();

  const payload: Record<string, unknown> = {
    model: body.model ?? AI_MODELS.VIDEO_MODEL,
    prompt: body.prompt,
    duration: body.duration ?? 5,
    resolution: body.resolution ?? '720p',
    aspect_ratio: body.aspectRatio ?? '9:16',
  };

  if (body.frameImages?.length) {
    payload.frame_images = body.frameImages.map((url, i) => ({
      type: i === 0 ? 'first_frame' : 'last_frame',
      image_url: { url },
    }));
  }
  if (body.inputReferences?.length) {
    payload.input_references = body.inputReferences.map(url => ({
      type: 'reference', image_url: { url },
    }));
  }

  const res = await orFetch(env.OPENROUTER_API_KEY, '/videos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    return c.json({ error: 'Video submission failed', detail: err }, 502);
  }

  const data = await res.json<{ id: string; status: string }>();
  const userId = body.userId ?? 'anonymous';

  await recordGenJob(env.DB, data.id, userId, 'visual', 'processing', 0, AI_MODELS.VIDEO_MODEL, undefined, body.episodeId);

  return c.json({ jobId: data.id, status: data.status ?? 'processing', pollingUrl: `/api/ai/video/${data.id}` });
});

// ─── Video poll ──────────────────────────────────────────────────────────────
app.get('/api/ai/video/:jobId', async (c) => {
  const env   = c.env;
  const jobId = c.req.param('jobId');

  const res = await orFetch(env.OPENROUTER_API_KEY, `/videos/${jobId}`, { method: 'GET' });
  if (!res.ok) return c.json({ error: 'Poll failed', detail: await res.text() }, 502);

  const data = await res.json<{
    id: string; status: string; progress?: number;
    urls?: { get?: string }; usage_cost?: number;
  }>();

  if (data.status === 'completed') {
    let videoUrl = data.urls?.get ?? '';
    const contentRes = await orFetch(env.OPENROUTER_API_KEY, `/videos/${jobId}/content`, { method: 'GET' });
    if (contentRes.ok) {
      const cd = await contentRes.json<{ url?: string }>().catch(() => ({}));
      videoUrl = cd.url ?? videoUrl;
    }
    const costUsd = data.usage_cost ?? 0.5;
    const credits = costUsdToCredits(costUsd);
    try {
      await env.DB.prepare(
        `UPDATE gen_jobs SET status='completed', credits_consumed=?, result_url=?, completed_at=CURRENT_TIMESTAMP WHERE id=?`
      ).bind(credits, videoUrl, jobId).run();
    } catch { /* non-blocking */ }
    return c.json({ jobId, status: 'completed', videoUrl, creditsConsumed: credits, costUsd });
  }

  if (data.status === 'failed') {
    try { await env.DB.prepare(`UPDATE gen_jobs SET status='failed' WHERE id=?`).bind(jobId).run(); } catch { /* noop */ }
    return c.json({ jobId, status: 'failed', progress: 0 });
  }

  return c.json({ jobId, status: data.status, progress: data.progress ?? null });
});

// ─── TTS ─────────────────────────────────────────────────────────────────────
app.post('/api/ai/tts', async (c) => {
  const env = c.env;
  if (!env.OPENROUTER_API_KEY) return c.json({ error: 'AI not configured' }, 503);

  const body = await c.req.json<{
    text: string; voiceId?: string; language?: string;
    userId?: string; episodeId?: string; model?: string;
  }>();

  const voiceId = body.voiceId ?? (body.language === 'mandarin' ? 'Mandarin_Gentle_Man' : 'Cantonese_WarmMan');

  const res = await orFetch(env.OPENROUTER_API_KEY, '/audio/speech', {
    method: 'POST',
    body: JSON.stringify({
      model: body.model ?? AI_MODELS.TTS_MODEL,
      input: body.text,
      voice: voiceId,
    }),
  });

  if (!res.ok) return c.json({ error: 'TTS failed', detail: await res.text() }, 502);

  const audioBuffer = await res.arrayBuffer();
  const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

  const costUsd = (body.text.length / 1000) * 0.002;
  const credits = costUsdToCredits(costUsd);
  const userId  = body.userId ?? 'anonymous';
  const jobId   = crypto.randomUUID();

  await recordGenJob(env.DB, jobId, userId, 'voice', 'completed', credits, AI_MODELS.TTS_MODEL, undefined, body.episodeId);
  await recordCreditDebit(env.DB, userId, credits, 'voice', `TTS 配音 (${body.text.length} chars)`);

  return c.json({
    audioBase64,
    contentType: 'audio/mpeg',
    durationEstimate: Math.ceil(body.text.length / 150),
    creditsConsumed: credits,
    costUsd,
    provider: 'openrouter',
  });
});

// ─── Project save ─────────────────────────────────────────────────────────────
app.post('/api/ai/project/save', async (c) => {
  const env  = c.env;
  const body = await c.req.json<{
    projectId: string; userId: string; title: string;
    mode?: string; characters?: unknown; storyCards?: unknown[]; outline?: unknown;
  }>();

  try {
    await env.DB.prepare(
      `INSERT INTO projects (id, title, mode, status, creator_id, characters, series_outline, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         title=excluded.title, characters=excluded.characters,
         series_outline=excluded.series_outline, updated_at=CURRENT_TIMESTAMP`
    ).bind(
      body.projectId, body.title, body.mode ?? 'drama', 'draft', body.userId,
      JSON.stringify(body.characters ?? []),
      JSON.stringify(body.outline ?? [])
    ).run();

    if (Array.isArray(body.storyCards)) {
      for (const card of body.storyCards as Array<{ episodeNumber: number; title_i18n: Record<string, string> }>) {
        const epId = `${body.projectId}-ep${card.episodeNumber}`;
        await env.DB.prepare(
          `INSERT INTO episodes (id, project_id, episode_number, title, story_card, status)
           VALUES (?,?,?,?,?,'draft')
           ON CONFLICT(id) DO UPDATE SET story_card=excluded.story_card, title=excluded.title`
        ).bind(epId, body.projectId, card.episodeNumber, card.title_i18n?.['zh-HK'] ?? '', JSON.stringify(card)).run();
      }
    }
    return c.json({ ok: true, projectId: body.projectId });
  } catch (e) {
    return c.json({ error: 'Save failed', detail: String(e) }, 500);
  }
});

// ─── Credits balance ──────────────────────────────────────────────────────────
app.get('/api/ai/credits/:userId', async (c) => {
  const env    = c.env;
  const userId = c.req.param('userId');
  try {
    const txns = await env.DB.prepare(
      `SELECT type, SUM(amount) as total FROM credit_transactions WHERE user_id=? GROUP BY type`
    ).bind(userId).all();
    let balance = 0;
    for (const row of txns.results as { type: string; total: number }[]) {
      if (row.type === 'credit') balance += row.total;
      if (row.type === 'debit')  balance -= row.total;
    }
    return c.json({ userId, balance, unit: 'points' });
  } catch {
    return c.json({ userId, balance: 0, unit: 'points' });
  }
});

// ─── File upload → R2 + D1 ────────────────────────────────────────────────────
// POST /api/upload
// multipart/form-data fields:
//   file       : File (required)
//   projectId  : string (required)
//   userId     : string (optional, defaults to 'anonymous')
//   category   : 'character'|'scene'|'prop'|'sponsor'|'audio'|'video'|'other'
//   label      : string (optional caption)
app.post('/api/upload', async (c) => {
  const env = c.env;
  if (!env.FILES) return c.json({ error: 'Storage not configured' }, 503);

  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return c.json({ error: 'Invalid multipart form data' }, 400);
  }

  const file       = formData.get('file') as File | null;
  const projectId  = (formData.get('projectId')  as string | null) ?? 'global';
  const userId     = (formData.get('userId')      as string | null) ?? 'anonymous';
  const category   = (formData.get('category')    as string | null) ?? 'other';
  const label      = (formData.get('label')        as string | null) ?? '';

  if (!file || typeof file === 'string') {
    return c.json({ error: 'No file provided' }, 400);
  }

  // 10 MB limit
  const MAX_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return c.json({ error: 'File too large (max 10 MB)' }, 413);
  }

  // Sanitise filename
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
  const id       = crypto.randomUUID();
  // staging prefix so we can distinguish from production objects in the same bucket
  const r2Key    = `uploads/${projectId}/${id}_${safeName}`;

  const arrayBuf = await file.arrayBuffer();

  try {
    await env.FILES.put(r2Key, arrayBuf, {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
      customMetadata: { originalName: file.name, userId, projectId, category },
    });
  } catch (e) {
    return c.json({ error: 'R2 write failed', detail: String(e) }, 500);
  }

  // Public URL — served via /api/assets/file/:key (proxy route below)
  const fileUrl = `/api/assets/file/${encodeURIComponent(r2Key)}`;

  try {
    await env.DB.prepare(
      `INSERT INTO assets (id, project_id, user_id, file_name, file_type, file_size, r2_key, file_url, category, label)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    ).bind(id, projectId, userId, file.name, file.type, file.size, r2Key, fileUrl, category, label).run();
  } catch (e) {
    // D1 write failed — object is in R2 but not indexed; non-fatal, return URL anyway
    console.error('D1 asset insert failed:', e);
  }

  return c.json({
    ok: true,
    id,
    r2Key,
    fileUrl,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    category,
    label,
    uploadedAt: new Date().toISOString(),
  });
});

// ─── Asset list for a project ─────────────────────────────────────────────────
// GET /api/assets?project_id=xxx[&category=scene][&limit=50]
app.get('/api/assets', async (c) => {
  const env       = c.env;
  const projectId = c.req.query('project_id') ?? 'global';
  const category  = c.req.query('category') ?? '';
  const limit     = Math.min(Number(c.req.query('limit') ?? 100), 200);

  try {
    let sql = `SELECT * FROM assets WHERE project_id=?`;
    const params: (string | number)[] = [projectId];
    if (category) { sql += ` AND category=?`; params.push(category); }
    sql += ` ORDER BY uploaded_at DESC LIMIT ?`;
    params.push(limit);

    const rows = await env.DB.prepare(sql).bind(...params).all();
    return c.json({ ok: true, assets: rows.results ?? [] });
  } catch (e) {
    return c.json({ error: 'DB read failed', detail: String(e) }, 500);
  }
});

// ─── R2 file proxy ────────────────────────────────────────────────────────────
// GET /api/assets/file/:key  — streams R2 object to browser
app.get('/api/assets/file/:key{.+}', async (c) => {
  const env    = c.env;
  const r2Key  = decodeURIComponent(c.req.param('key'));
  if (!env.FILES) return c.json({ error: 'Storage not configured' }, 503);

  const obj = await env.FILES.get(r2Key);
  if (!obj) return c.json({ error: 'Not found' }, 404);

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(obj.body, { headers });
});

export const onRequest = handle(app);
