/**
 * Cloudflare Pages Function: /api/ai/*
 * All OpenRouter calls are proxied here — the API key never leaves the server.
 * Env bindings: OPENROUTER_API_KEY (secret), DB (D1)
 */
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { cors } from 'hono/cors';

// ── Constants ─────────────────────────────────────────────────────────────────
export const AI_MODELS = {
  TEXT_MODEL:  'moonshotai/kimi-k2.5',
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

  // ── response_format: outline/episodes 用嚴格 json_schema，其他維持 json_object ──
  function architectResponseFormat(s: string): Record<string, unknown> {
    const i18nObj = {
      type: 'object',
      properties: {
        'zh-HK': { type: 'string' },
        'en':    { type: 'string' },
        'zh-CN': { type: 'string' },
      },
      required: ['zh-HK', 'en', 'zh-CN'],
      additionalProperties: false,
    };

    if (s === 'outline') {
      return {
        type: 'json_schema',
        json_schema: {
          name: 'outline_response',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              outline: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    episodeNumber: { type: 'number' },
                    title_i18n:   i18nObj,
                    oneLine_i18n: i18nObj,
                  },
                  required: ['episodeNumber', 'title_i18n', 'oneLine_i18n'],
                  additionalProperties: false,
                },
              },
            },
            required: ['outline'],
            additionalProperties: false,
          },
        },
      };
    }

    if (s === 'episodes') {
      return {
        type: 'json_schema',
        json_schema: {
          name: 'episodes_response',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              storyCard: {
                type: 'object',
                properties: {
                  episodeNumber:     { type: 'number' },
                  title_i18n:        i18nObj,
                  coreEmotion_i18n:  i18nObj,
                  hook_i18n:         i18nObj,
                  body_i18n:         i18nObj,
                  turningPoint_i18n: i18nObj,
                  linkPrevNext_i18n: i18nObj,
                  characterIds:      { type: 'array', items: { type: 'string' } },
                },
                required: [
                  'episodeNumber', 'title_i18n', 'coreEmotion_i18n',
                  'hook_i18n', 'body_i18n', 'turningPoint_i18n',
                  'linkPrevNext_i18n', 'characterIds',
                ],
                additionalProperties: false,
              },
            },
            required: ['storyCard'],
            additionalProperties: false,
          },
        },
      };
    }

    // topic / characters / 其他：維持 json_object
    return { type: 'json_object' };
  }

  // ── max_tokens 依 stage 調整：outline 30 集三語需 ~12-15k output tokens ──
  function architectMaxTokens(s: string): number {
    if (s === 'outline')  return 16000;
    if (s === 'episodes') return 8000;
    return 4000; // topic / characters / 其他
  }

  const res = await orFetch(env.OPENROUTER_API_KEY, '/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: AI_MODELS.TEXT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens: architectMaxTokens(stage),
      temperature: 0.85,
      response_format: architectResponseFormat(stage),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return c.json({ error: 'Architect failed', detail: err }, 502);
  }

  const data = await res.json<{
    choices: { message: { content: string }; finish_reason?: string }[];
    usage: { total_tokens: number };
    usage_cost?: number;
  }>();

  // ── finish_reason 檢查：若被截斷則直接回 502，不進入 parse ──
  const finishReason = data.choices[0]?.finish_reason ?? null;
  if (finishReason === 'length') {
    return c.json({
      error: 'AI 生成內容過長被截斷，請重試或縮短故事原材料',
      finishReason: 'length',
    }, 502);
  }

  let parsed: Record<string, unknown> = {};
  try {
    // Strip possible markdown code fence (```json ... ``` or ``` ... ```)
    const raw = (data.choices[0]?.message?.content ?? '').trim();
    const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    parsed = JSON.parse(stripped || '{}');
  } catch {
    return c.json({
      error: 'AI returned invalid JSON',
      finishReason,
    }, 502);
  }

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
      type: 'image_url', image_url: { url },
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

// ─── Image generation (D3) ────────────────────────────────────────────────────
// POST /api/ai/image-gen
// Body: { appearanceSummary, charName?, age?, role?, referenceImageUrl?, projectId?, userId? }
// Returns: { ok, fileUrl }  — image stored in R2, served via /api/assets/file/*
//
// Uses OpenRouter POST /api/v1/images  (official image gen endpoint).
// Model: bytedance-seed/seedream-4.5  (photorealistic, consistent with character-angle route).
// Response data[0].b64_json → base64 PNG → decode → R2 put → D1 assets row.
app.post('/api/ai/image-gen', async (c) => {
  const env = c.env;
  if (!env.OPENROUTER_API_KEY) return c.json({ ok: false, error: 'AI not configured' }, 503);
  if (!env.FILES) return c.json({ ok: false, error: 'Storage not configured' }, 503);

  const body = await c.req.json<{
    appearanceSummary: string;
    charName?: string;
    age?: string;
    role?: string;
    referenceImageUrl?: string;    // legacy single — kept for backward compat
    referenceImageUrls?: string[]; // new multi-ref (max 3); takes priority
    projectId?: string;
    userId?: string;
    similarity?: string;   // '極似' | '70%' | '神韻' — visual similarity mode
  }>();

  if (!body.appearanceSummary) {
    return c.json({ ok: false, error: 'appearanceSummary is required' }, 400);
  }

  // Normalise reference URLs: prefer new array field; fall back to legacy single.
  // Always cap at 3 to avoid oversized payloads.
  const refUrls = (
    body.referenceImageUrls ?? (body.referenceImageUrl ? [body.referenceImageUrl] : [])
  ).slice(0, 3);

  // Map similarity mode → English prompt directive.
  // The directive is always appended to the prompt so the model knows the intent
  // even if no reference image is available (e.g. 神韻 still shapes the output style).
  // '極似' / '70%' lean heavily on the reference; '神韻' captures vibe only.
  const hasRef = refUrls.length > 0; // true if at least one reference image was provided
  const simDirective = (() => {
    const s = body.similarity ?? '';
    if (s.includes('極似')) {
      // Only meaningful with a reference; without one, still ask for high realism
      return hasRef
        ? 'IMPORTANT: The generated face must exactly match the reference image — identical facial features, same person, minimal variation.'
        : 'IMPORTANT: Render the character with high photographic realism, strictly faithful to the appearance description.';
    }
    if (s.includes('70')) {
      return hasRef
        ? 'Keep the main identity and key features consistent with the reference, but allow natural variation in expression, angle, and minor details.'
        : 'Render the character with good fidelity to the appearance description; allow natural lighting and expression variation.';
    }
    if (s.includes('神韻')) {
      // Spirit mode: reference is a loose inspiration, not a hard constraint
      return 'Capture the overall temperament, demeanor and vibe of the character; the exact facial features may differ from the reference.';
    }
    return ''; // no directive for unknown / unset values
  })();

  // Build prompt — Chinese for accuracy, English appended for model comprehension
  const parts = [
    'Portrait photo of a Hong Kong drama character.',
    body.charName ? `Character name: ${body.charName}.` : '',
    body.age      ? `Age: ${body.age}.`                  : '',
    body.role     ? `Role: ${body.role}.`                : '',
    `Appearance: ${body.appearanceSummary}.`,
    simDirective,   // similarity mode directive (empty string filtered out below)
    'Half-body portrait, natural lighting, cinematic realism, clear facial features, 3:4 ratio.',
  ].filter(Boolean).join(' ');

  // Build request payload for OpenRouter images API
  type ImagePayload = {
    model: string;
    prompt: string;
    aspect_ratio: string;
    input_references?: { type: string; image_url: { url: string } }[];
  };
  const payload: ImagePayload = {
    model: 'bytedance-seed/seedream-4.5',
    prompt: parts,
    aspect_ratio: '3:4',
  };

  // ── Reference images: for each URL resolve R2 key → read bytes → base64 data URL ──
  // Seedream (same as character-angle route) requires base64 data URLs via input_references.
  // We read bytes directly from R2 and encode; per-image fallback if one fails.
  // Per-image fallback: if one image fails we skip it and continue with the rest.
  let referenceSkipped = false;
  if (refUrls.length > 0) {
    const prefix = '/api/assets/file/';
    const inputRefs: { type: string; image_url: { url: string } }[] = [];

    for (const refUrl of refUrls) {
      try {
        const encodedKey = refUrl.startsWith(prefix)
          ? refUrl.slice(prefix.length)
          : refUrl;
        const r2Key = decodeURIComponent(encodedKey);

        const obj = await env.FILES.get(r2Key);
        if (!obj) {
          console.warn('[image-gen] R2 object not found for key:', r2Key, '— skipping this ref');
          referenceSkipped = true;
          continue;
        }

        const buf = await obj.arrayBuffer();
        const contentType = obj.httpMetadata?.contentType ?? 'image/jpeg';

        // Chunked btoa to avoid stack overflow on large buffers (8 KB chunks)
        const bytes = new Uint8Array(buf);
        const CHUNK = 8192;
        let b64 = '';
        for (let i = 0; i < bytes.length; i += CHUNK) {
          b64 += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
        }
        const dataUrl = `data:${contentType};base64,${btoa(b64)}`;
        inputRefs.push({ type: 'image_url', image_url: { url: dataUrl } });
      } catch (refErr) {
        console.error('[image-gen] Failed to load reference image from R2:', refErr, '— skipping this ref');
        referenceSkipped = true;
      }
    }

    if (inputRefs.length > 0) {
      payload.input_references = inputRefs;
    }
    // If ALL refs failed, referenceSkipped=true; generation continues text-only.
  }

  // Call OpenRouter images endpoint (NOT /chat/completions)
  const res = await fetch('https://openrouter.ai/api/v1/images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://cofilmery.app',
      'X-Title': 'CoFilmery',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    return c.json({ ok: false, error: 'Image generation failed', detail: errText }, 502);
  }

  // Response shape: { data: [{ b64_json: string, revised_prompt?: string }], usage_cost?: number }
  const imgData = await res.json<{
    data: { b64_json?: string; url?: string; revised_prompt?: string }[];
    usage_cost?: number;
  }>();

  const item = imgData.data?.[0];
  if (!item) {
    return c.json({ ok: false, error: 'No image returned from OpenRouter' }, 502);
  }

  // ── Decode base64 → ArrayBuffer → R2 ──────────────────────────────────────
  let imageBuffer: ArrayBuffer;

  if (item.b64_json) {
    // base64 PNG/JPEG bytes
    const b64 = item.b64_json;
    // atob works in Workers runtime
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    imageBuffer = bytes.buffer;
  } else if (item.url) {
    // Some models return a URL — fetch and re-store
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) return c.json({ ok: false, error: 'Failed to fetch generated image URL' }, 502);
    imageBuffer = await imgRes.arrayBuffer();
  } else {
    return c.json({ ok: false, error: 'Unexpected image response format' }, 502);
  }

  // ── Store in R2 ───────────────────────────────────────────────────────────
  const projectId = body.projectId ?? 'global';
  const userId    = body.userId    ?? 'anonymous';
  const assetId   = crypto.randomUUID();
  const r2Key     = `generated/${projectId}/${assetId}.png`;

  try {
    await env.FILES.put(r2Key, imageBuffer, {
      httpMetadata:   { contentType: 'image/png' },
      customMetadata: { userId, projectId, category: 'character', source: 'ai-generated' },
    });
  } catch (e) {
    return c.json({ ok: false, error: 'R2 write failed', detail: String(e) }, 500);
  }

  const fileUrl = `/api/assets/file/${encodeURIComponent(r2Key)}`;

  // ── Record in D1 assets ──────────────────────────────────────────────────
  try {
    await env.DB.prepare(
      `INSERT INTO assets
         (id, project_id, user_id, file_name, file_type, file_size, r2_key, file_url, category, label)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      assetId, projectId, userId,
      `ai-generated-${assetId.slice(0,8)}.png`, 'image/png',
      imageBuffer.byteLength, r2Key, fileUrl,
      'character', 'AI generated'
    ).run();
  } catch (e) {
    console.error('D1 asset insert failed (non-fatal):', e);
  }

  // ── Record credits ────────────────────────────────────────────────────────
  const costUsd = imgData.usage_cost ?? 0.04; // ~$0.04 per image for Seedream 4.5
  const credits = costUsdToCredits(costUsd);
  const jobId   = crypto.randomUUID();

  await recordGenJob(env.DB, jobId, userId, 'image_gen', 'completed', credits, 'bytedance-seed/seedream-4.5', fileUrl);
  await recordCreditDebit(env.DB, userId, credits, 'ai_generation', `角色圖像生成 (AI generated)`);

  const referencesUsed = payload.input_references?.length ?? 0;
  return c.json({
    ok: true, fileUrl, assetId, creditsConsumed: credits,
    referencesUsed,
    ...(referenceSkipped ? { referenceSkipped: true } : {}),
  });
});

// ─── Character angle generation ───────────────────────────────────────────────
// POST /api/ai/character-angle
// Body: { assetId, role, referenceImageUrl?, appearanceSummary, projectId, userId, similarity? }
// Returns: { ok, fileUrl, role }
//
// Model: bytedance-seed/seedream-4.5  (photorealistic, NOT illustration)
// Roles: front | three-quarter | side | back (mandatory set)
//        action | detail (optional, user-triggered only)
// similarity: 'high' | 'mid' | 'low'  (default 'mid')
//   high → SAME real person, preserve facial identity
//   mid  → idealized version of the same person
//   low  → new character inspired by the same vibe/aura
// Path A chaining: front output → reference for subsequent angles.
// Stores result in R2 at generated/{projectId}/{assetId}_{role}.png
// Writes one row to asset_media; if role=front also updates assets.file_url.
app.post('/api/ai/character-angle', async (c) => {
  const env = c.env;
  if (!env.OPENROUTER_API_KEY) return c.json({ ok: false, error: 'AI not configured' }, 503);
  if (!env.FILES)               return c.json({ ok: false, error: 'Storage not configured' }, 503);

  const body = await c.req.json<{
    assetId: string;
    role: string;
    referenceImageUrl?: string;
    appearanceSummary: string;
    projectId: string;
    userId: string;
    similarity?: 'high' | 'mid' | 'low';
  }>();

  const { assetId, role, appearanceSummary, projectId, userId } = body;
  const similarity: 'high' | 'mid' | 'low' = body.similarity ?? 'mid';

  if (!assetId)           return c.json({ ok: false, error: 'assetId is required' }, 400);
  if (!appearanceSummary) return c.json({ ok: false, error: 'appearanceSummary is required' }, 400);
  if (!projectId)         return c.json({ ok: false, error: 'projectId is required' }, 400);
  if (!userId)            return c.json({ ok: false, error: 'userId is required' }, 400);

  const VALID_ANGLE_ROLES = ['front', 'three-quarter', 'side', 'back', 'action', 'detail'] as const;
  type AngleRole = typeof VALID_ANGLE_ROLES[number];
  if (!VALID_ANGLE_ROLES.includes(role as AngleRole)) {
    return c.json({ ok: false, error: `Invalid role. Must be one of: ${VALID_ANGLE_ROLES.join(', ')}` }, 400);
  }

  // ── Angle-specific pose directives (strong wording to override consistency pressure) ──
  const ANGLE_DIRECTIVES: Record<AngleRole, string> = {
    'front':
      'facing the camera directly, full frontal view',
    'three-quarter':
      'body clearly rotated about 45 degrees, three-quarter angle, one shoulder noticeably closer to camera — distinctly different from a front view',
    'side':
      'full profile, body rotated 90 degrees to the side, only one side of the face visible',
    'back':
      'back turned to the camera, rear view, showing the back of the head and body',
    'action':
      'dynamic full-body action pose',
    'detail':
      'close-up on face and upper body, sharp realistic facial detail',
  };

  // ── Similarity directives: controls how closely the output tracks the reference ──
  const SIMILARITY_DIRECTIVES: Record<'high' | 'mid' | 'low', string> = {
    high:
      'This is the SAME real person as the reference photo. Preserve their facial identity, bone structure, and overall likeness faithfully. Apply only the specified appearance settings as light refinements (grooming, styling, wardrobe). A viewer must instantly recognize this as the same individual.',
    mid:
      'Base this person on the reference photo but present an improved, idealized version of them. Keep enough of the reference likeness that a viewer can still tell it is clearly based on the same person, while visibly incorporating the specified appearance settings to reshape their look. Recognizable, but a better version of them.',
    low:
      'Take only the general vibe, aura, and overall impression from the reference photo. This is a NEW character inspired by that person — not the same individual. Let the specified appearance settings drive the design; the reference only informs the feel and energy, not the exact face.',
  };

  const angleDirective     = ANGLE_DIRECTIVES[role as AngleRole];
  const similarityDirective = SIMILARITY_DIRECTIVES[similarity];

  // ── Build photorealistic prompt (no illustration / cartoon language) ──────
  const parts = [
    'Photorealistic full-body character portrait for a live-action Hong Kong TV drama.',
    `Appearance settings to apply: ${appearanceSummary}.`,
    similarityDirective,
    `Pose/View: ${angleDirective}.`,
    'Real human being, cinematic photography, natural skin texture and pores, realistic studio lighting, shot on a professional camera, film-still quality, plain neutral background.',
    'Absolutely NOT illustration, NOT cartoon, NOT anime, NOT 3D render, NOT painting, NOT drawing, NOT stylized.',
    '3:4 aspect ratio.',
  ].filter(Boolean).join(' ');

  // ── Build OpenRouter images payload (bytedance-seed/seedream-4.5) ─────────
  // Seedream 4.5 supports same /api/v1/images schema as Gemini:
  //   model, prompt, aspect_ratio, input_references (0-14 refs)
  type ImagePayload = {
    model: string;
    prompt: string;
    aspect_ratio: string;
    input_references?: { type: string; image_url: { url: string } }[];
  };
  const payload: ImagePayload = {
    model: 'bytedance-seed/seedream-4.5',
    prompt: parts,
    aspect_ratio: '3:4',
  };

  // ── Load reference image from R2 (Path A chaining) ───────────────────────
  // Only attach reference when one is provided; absent = text-only generation.
  let referenceSkipped = false;
  if (body.referenceImageUrl) {
    try {
      const prefix = '/api/assets/file/';
      const encodedKey = body.referenceImageUrl.startsWith(prefix)
        ? body.referenceImageUrl.slice(prefix.length)
        : body.referenceImageUrl;
      const r2Key = decodeURIComponent(encodedKey);

      const obj = await env.FILES.get(r2Key);
      if (!obj) {
        console.warn('[character-angle] R2 ref not found:', r2Key, '— proceeding text-only');
        referenceSkipped = true;
      } else {
        const buf = await obj.arrayBuffer();
        const contentType = obj.httpMetadata?.contentType ?? 'image/jpeg';

        // Chunked btoa (8 KB chunks) to avoid stack overflow on large buffers
        const bytes = new Uint8Array(buf);
        const CHUNK = 8192;
        let b64 = '';
        for (let i = 0; i < bytes.length; i += CHUNK) {
          b64 += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
        }
        const dataUrl = `data:${contentType};base64,${btoa(b64)}`;
        payload.input_references = [{ type: 'image_url', image_url: { url: dataUrl } }];
      }
    } catch (refErr) {
      console.error('[character-angle] Failed to load reference from R2:', refErr, '— proceeding text-only');
      referenceSkipped = true;
    }
  }

  // ── Call OpenRouter images endpoint ──────────────────────────────────────
  const res = await fetch('https://openrouter.ai/api/v1/images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://cofilmery.app',
      'X-Title': 'CoFilmery',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    return c.json({ ok: false, error: 'Image generation failed', detail: errText }, 502);
  }

  const imgData = await res.json<{
    data: { b64_json?: string; url?: string; revised_prompt?: string }[];
    usage_cost?: number;
  }>();

  const item = imgData.data?.[0];
  if (!item) {
    return c.json({ ok: false, error: 'No image returned from OpenRouter' }, 502);
  }

  // ── Decode base64 → ArrayBuffer ───────────────────────────────────────────
  let imageBuffer: ArrayBuffer;
  if (item.b64_json) {
    const binary = atob(item.b64_json);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    imageBuffer = bytes.buffer;
  } else if (item.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) return c.json({ ok: false, error: 'Failed to fetch generated image URL' }, 502);
    imageBuffer = await imgRes.arrayBuffer();
  } else {
    return c.json({ ok: false, error: 'Unexpected image response format' }, 502);
  }

  // ── Store in R2: generated/{projectId}/{assetId}_{role}.png ───────────────
  const r2Key  = `generated/${projectId}/${assetId}_${role}.png`;
  const fileUrl = `/api/assets/file/${encodeURIComponent(r2Key)}`;

  try {
    await env.FILES.put(r2Key, imageBuffer, {
      httpMetadata:   { contentType: 'image/png' },
      customMetadata: { userId, projectId, assetId, role, similarity, source: 'character-angle' },
    });
  } catch (e) {
    return c.json({ ok: false, error: 'R2 write failed', detail: String(e) }, 500);
  }

  // ── Write asset_media row (DELETE+INSERT for idempotent re-generation) ────
  const mediaId = crypto.randomUUID();
  try {
    await env.DB.prepare(
      `DELETE FROM asset_media WHERE asset_id = ? AND role = ?`
    ).bind(assetId, role).run();

    await env.DB.prepare(
      `INSERT INTO asset_media (id, asset_id, file_url, role, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(
      mediaId, assetId, fileUrl, role,
      // sort_order: front=0, three-quarter=1, side=2, back=3, action=4, detail=5
      ['front', 'three-quarter', 'side', 'back', 'action', 'detail'].indexOf(role),
    ).run();
  } catch (e) {
    console.error('[character-angle] asset_media INSERT failed (non-fatal):', e);
  }

  // ── If role=front: update assets.file_url to this new image ──────────────
  if (role === 'front') {
    try {
      await env.DB.prepare(
        `UPDATE assets SET file_url = ? WHERE id = ?`
      ).bind(fileUrl, assetId).run();
    } catch (e) {
      console.error('[character-angle] assets.file_url UPDATE failed (non-fatal):', e);
    }
  }

  // ── Record credits ────────────────────────────────────────────────────────
  const costUsd = imgData.usage_cost ?? 0.04;
  const credits = costUsdToCredits(costUsd);
  const jobId   = crypto.randomUUID();

  await recordGenJob(env.DB, jobId, userId, 'character_angle', 'completed', credits, 'bytedance-seed/seedream-4.5', fileUrl);
  await recordCreditDebit(env.DB, userId, credits, 'ai_generation', `角色設定圖生成 — ${role} (${assetId.slice(0, 8)})`);

  return c.json({
    ok: true,
    fileUrl,
    role,
    creditsConsumed: credits,
    similarity,
    ...(referenceSkipped ? { referenceSkipped: true } : {}),
  });
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

export const onRequest = handle(app);
