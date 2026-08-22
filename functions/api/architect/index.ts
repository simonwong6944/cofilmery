/**
 * Cloudflare Pages Function: /api/architect
 * Story Architect — 故事骨架與角色深化引擎後端 API
 *
 * POST /api/architect/action   — 記錄 architect_actions（generate/regenerate/accept/edit）
 * POST /api/architect/project  — 更新 project 骨架資料（selected_topic/outline/characters/architect_stage）
 * GET  /api/architect/project/:id — 取得 project 骨架資料
 * POST /api/architect/episode  — 更新 episode story_card / human_edited
 * POST /api/architect/generate — 代理呼叫 OpenRouter API（帶 credit 扣減）
 */

interface Env {
  DB: D1Database;
  OPENROUTER_API_KEY?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function err(msg: string, status = 400) {
  return json({ error: msg }, status);
}

// ── Credit costs（與 src/credit-config.ts 保持一致）──────────────────
const ARCHITECT_CREDITS: Record<string, number> = {
  topic: 2,
  outline: 3,
  characters: 3,
  episodes: 2,
  accept: 0,
  edit: 0,
};

// ── OpenRouter API 呼叫（Phase 2 核心）───────────────────────────────
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'anthropic/claude-3.5-haiku';
const SEED_MODEL = 'bytedance/seed-1.6';

// System prompt — 所有階段共用硬性規則
function buildSystemPrompt(mode: string): string {
  const legacyRule = mode === 'legacy'
    ? `\n\n【傳承模式強制規則】：嚴禁虛構人名、年份、真實事件。只可潤飾創作者提供的 humanInput。遇到缺少資料時，必須明確標記「（待長者補充）」，絕不編造。`
    : '';

  return `你是一位專業香港粵語短劇創作顧問，擅長為 55 歲以上長者觀眾創作感人的短片故事。

【輸出語言規則】：
- 主要以繁體中文（香港粵語用語）輸出
- I18nText 物件必須同時提供三個語言欄位：zh-HK（繁體粵語）、en（英文）、zh-CN（簡體中文）
- 三語都必須完整，不得留空

【香港短劇黃金法則】：
1. 每集鉤子在前 3 秒——必須立即抓住觀眾
2. 聚焦 1–3 個核心角色，避免過多配角分散注意力
3. 台詞句句推進劇情，無廢話
4. 單集敘述精煉，150–250 字為佳
5. 情感必須真實——長者觀眾對虛假情節敏感

【適合長者的題材方向】：圓夢、家庭和解、友情重燃、傳承技藝、社區守護、跨代連結

【內容紅線（絕對禁止）】：
- 裸露或色情露骨內容
- 以可辨識真實人物為原型（不得虛構真實名人行為）
- 不適合 55+ 長者家庭觀眾的內容${legacyRule}

【輸出格式】：必須返回有效 JSON，不要加 Markdown 代碼塊。`;
}

// 呼叫 OpenRouter
async function callOpenRouter(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL
): Promise<{ text: string; tokensUsed: number }> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://cofilmery.vip.gensparksite.com',
      'X-Title': 'CoFilmery Story Architect',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4096,
      temperature: 0.85,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${errText}`);
  }

  const data = await res.json() as {
    choices: { message: { content: string } }[];
    usage?: { total_tokens: number };
  };

  return {
    text: data.choices[0]?.message?.content ?? '',
    tokensUsed: data.usage?.total_tokens ?? 0,
  };
}

// ── Stage prompt builders ─────────────────────────────────────────────

function buildTopicPrompt(context: Record<string, unknown>): string {
  return `根據以下系列設定，生成 3 個選題方向（TopicOption 陣列）：

系列設定：
- 系列標題：${context.seriesTitle}
- 題材類型：${context.genre}
- 情感基調：${context.tone}
- 核心情感需求：${context.coreNeed}
- 總集數：${context.episodeCount}
- 每集時長：${context.durationLabel}

返回 JSON 格式（陣列，3 個元素）：
[
  {
    "id": "topic-1",
    "title_i18n": { "zh-HK": "...", "en": "...", "zh-CN": "..." },
    "logline_i18n": { "zh-HK": "一句話故事線", "en": "...", "zh-CN": "..." },
    "hook_i18n": { "zh-HK": "為何吸引55+長者", "en": "...", "zh-CN": "..." }
  }
]`;
}

function buildOutlinePrompt(context: Record<string, unknown>, selectedTopic: Record<string, unknown>): string {
  const topicZhHK = (selectedTopic.title_i18n as Record<string, string>)?.['zh-HK'] ?? '';
  return `根據選定的故事方向，為 ${context.episodeCount} 集系列生成全劇大綱：

選定故事方向：${topicZhHK}
系列設定：${context.seriesTitle}，${context.episodeCount} 集，每集 ${context.durationLabel}

返回 JSON 格式（陣列，${context.episodeNumber} 個元素，含所有集數）：
[
  {
    "episodeNumber": 1,
    "title_i18n": { "zh-HK": "集名", "en": "...", "zh-CN": "..." },
    "oneLine_i18n": { "zh-HK": "一行故事概述", "en": "...", "zh-CN": "..." }
  }
]

注意：標題要有起承轉合的敘事弧線，第一集設置懸念，中間集推進衝突，最後集解決。`;
}

function buildCharactersPrompt(context: Record<string, unknown>, humanInput?: string): string {
  const desireHint = humanInput ? `\n\n創作者提供的主角核心欲望（重要！據此深化）：「${humanInput}」` : '';
  return `為以下系列生成 2–3 個主要角色卡（CharacterCard 陣列）：

系列：${context.seriesTitle}，題材：${context.genre}，${context.episodeCount} 集${desireHint}

返回 JSON 格式：
[
  {
    "id": "char-1",
    "name_i18n": { "zh-HK": "角色名（含稱謂）", "en": "...", "zh-CN": "..." },
    "identityTag_i18n": { "zh-HK": "一句話身份定位", "en": "...", "zh-CN": "..." },
    "coreDesire_i18n": { "zh-HK": "整劇想要什麼（核心欲望）", "en": "...", "zh-CN": "..." },
    "traitsConflict_i18n": { "zh-HK": "性格特質 + 致命弱點", "en": "...", "zh-CN": "..." },
    "arc_i18n": { "zh-HK": "人物弧線：首→末如何改變", "en": "...", "zh-CN": "..." },
    "speechStyle_i18n": { "zh-HK": "語言風格/口頭禪，餵給對白生成", "en": "...", "zh-CN": "..." },
    "relations_i18n": { "zh-HK": "與其他角色關係", "en": "...", "zh-CN": "..." },
    "appearancePrompt_zh": "外貌描述（餵給圖像生成）",
    "appearancePrompt_en": "Appearance description for image generation",
    "humanEdited": false
  }
]

角色必須：
1. 適合香港長者觀眾的共鳴點
2. 至少一個主角是 55+ 長者
3. 角色關係有戲劇張力（不是純粹友好）`;
}

function buildEpisodePrompt(
  context: Record<string, unknown>,
  targetEpisode: number,
  characters: Record<string, unknown>[],
  outline?: Record<string, unknown>[]
): string {
  const ep = outline?.find((o) => (o.episodeNumber as number) === targetEpisode);
  const epTitle = ep ? (ep.title_i18n as Record<string, string>)?.['zh-HK'] ?? '' : `第${targetEpisode}集`;
  const epOneLine = ep ? (ep.oneLine_i18n as Record<string, string>)?.['zh-HK'] ?? '' : '';
  const charNames = characters
    .map(c => (c.name_i18n as Record<string, string>)?.['zh-HK'] ?? '')
    .join('、');

  return `為第 ${targetEpisode} 集生成詳細故事卡（EpisodeStoryCard）：

集名：${epTitle}
一行大綱：${epOneLine}
主要角色：${charNames}
系列：${context.seriesTitle}，每集 ${context.durationLabel}

返回 JSON 格式（單個物件）：
{
  "episodeNumber": ${targetEpisode},
  "title_i18n": { "zh-HK": "${epTitle}", "en": "...", "zh-CN": "..." },
  "coreEmotion_i18n": { "zh-HK": "一句話定調本集情感", "en": "...", "zh-CN": "..." },
  "hook_i18n": { "zh-HK": "前3秒鉤子——必須立即抓住觀眾（黃金法則）", "en": "...", "zh-CN": "..." },
  "body_i18n": { "zh-HK": "故事主體150-250字，起承轉合，粵語口語風格", "en": "...", "zh-CN": "..." },
  "turningPoint_i18n": { "zh-HK": "情緒轉折/反轉點", "en": "...", "zh-CN": "..." },
  "linkPrevNext_i18n": { "zh-HK": "承接上集 + 為下集埋下伏筆", "en": "...", "zh-CN": "..." },
  "characterIds": ["char-1", "char-2"],
  "humanEdited": false
}

注意：body 必須是 150–250 字的完整故事敘述，粵語口語風格，含情節起伏。`;
}

// ── 主請求處理 ────────────────────────────────────────────────────────
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // ── POST /api/architect/action — 記錄動作至 D1 ────────────────────
  if (path.endsWith('/action') && request.method === 'POST') {
    const body = await request.json() as {
      id: string;
      project_id: string;
      episode_id?: string;
      stage: string;
      action: string;
      actor: string;
    };

    const credits = ARCHITECT_CREDITS[body.stage] ?? 0;
    const actionId = body.id || crypto.randomUUID();

    await env.DB.prepare(`
      INSERT OR IGNORE INTO architect_actions
        (id, project_id, episode_id, stage, action, actor, credits_consumed)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      actionId, body.project_id, body.episode_id ?? null,
      body.stage, body.action, body.actor, credits
    ).run();

    // 如果是 AI 生成動作，同時寫入 credit_transactions
    if (body.actor === 'ai' && credits > 0) {
      await env.DB.prepare(`
        INSERT OR IGNORE INTO credit_transactions
          (id, project_id, credits, category, description, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        crypto.randomUUID(), body.project_id,
        -credits, 'ai_generation',
        `Story Architect: ${body.stage} ${body.action}`
      ).run().catch(() => {
        // credit_transactions 可能不存在或欄位不同，不影響主流程
      });
    }

    return json({ success: true, actionId, creditsConsumed: credits });
  }

  // ── POST /api/architect/project — 更新 project 骨架資料 ──────────
  if (path.endsWith('/project') && request.method === 'POST') {
    const body = await request.json() as {
      project_id: string;
      selected_topic?: string;
      series_outline?: string;
      characters?: string;
      architect_stage?: string;
    };

    const sets: string[] = [];
    const vals: unknown[] = [];

    if (body.selected_topic !== undefined) { sets.push('selected_topic = ?'); vals.push(body.selected_topic); }
    if (body.series_outline !== undefined) { sets.push('series_outline = ?'); vals.push(body.series_outline); }
    if (body.characters !== undefined) { sets.push('characters = ?'); vals.push(body.characters); }
    if (body.architect_stage !== undefined) { sets.push('architect_stage = ?'); vals.push(body.architect_stage); }

    if (sets.length === 0) return err('No fields to update');

    vals.push(body.project_id);
    await env.DB.prepare(
      `UPDATE projects SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(...vals).run();

    return json({ success: true });
  }

  // ── GET /api/architect/project/:id — 取得 project 骨架資料 ────────
  if (path.match(/\/project\/[^/]+$/) && request.method === 'GET') {
    const projectId = path.split('/').pop()!;
    const row = await env.DB.prepare(
      `SELECT selected_topic, series_outline, characters, architect_stage FROM projects WHERE id = ?`
    ).bind(projectId).first<{
      selected_topic: string | null;
      series_outline: string | null;
      characters: string | null;
      architect_stage: string | null;
    }>();

    if (!row) return err('Project not found', 404);

    return json({
      selected_topic: row.selected_topic ? JSON.parse(row.selected_topic) : null,
      series_outline: row.series_outline ? JSON.parse(row.series_outline) : null,
      characters: row.characters ? JSON.parse(row.characters) : null,
      architect_stage: row.architect_stage ?? 'topic',
    });
  }

  // ── POST /api/architect/episode — 更新 episode story_card ─────────
  if (path.endsWith('/episode') && request.method === 'POST') {
    const body = await request.json() as {
      episode_id: string;
      story_card?: string;
      human_edited?: number;
    };

    await env.DB.prepare(
      `UPDATE episodes SET story_card = ?, human_edited = ? WHERE id = ?`
    ).bind(
      body.story_card ?? null,
      body.human_edited ?? 0,
      body.episode_id
    ).run();

    return json({ success: true });
  }

  // ── POST /api/architect/generate — 代理呼叫 OpenRouter ───────────
  if (path.endsWith('/generate') && request.method === 'POST') {
    const body = await request.json() as {
      stage: string;
      context: Record<string, unknown>;
      selectedTopic?: Record<string, unknown>;
      characters?: Record<string, unknown>[];
      outline?: Record<string, unknown>[];
      targetEpisode?: number;
      humanInput?: string;
      useModel?: 'default' | 'seed';
    };

    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // 無 API key：返回 mock 提示，前端 fallback 到 mockAdapter
      return json({ error: 'OPENROUTER_API_KEY not configured', fallback: true }, 503);
    }

    const model = body.useModel === 'seed' ? SEED_MODEL : DEFAULT_MODEL;
    const mode = (body.context.mode as string) ?? 'drama';
    const systemPrompt = buildSystemPrompt(mode);

    let userPrompt = '';
    switch (body.stage) {
      case 'topic':
        userPrompt = buildTopicPrompt(body.context);
        break;
      case 'outline':
        userPrompt = buildOutlinePrompt(body.context, body.selectedTopic ?? {});
        break;
      case 'characters':
        userPrompt = buildCharactersPrompt(body.context, body.humanInput);
        break;
      case 'episodes':
        userPrompt = buildEpisodePrompt(
          body.context,
          body.targetEpisode ?? 1,
          body.characters ?? [],
          body.outline
        );
        break;
      default:
        return err(`Unknown stage: ${body.stage}`);
    }

    const credits = ARCHITECT_CREDITS[body.stage] ?? 0;

    try {
      const { text, tokensUsed } = await callOpenRouter(apiKey, systemPrompt, userPrompt, model);

      // 解析 JSON 回應
      let parsed: unknown;
      try {
        // 去掉可能的 Markdown 代碼塊
        const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        return json({ error: 'AI returned invalid JSON', raw: text }, 422);
      }

      // 組裝 ArchitectResponse 格式
      const response: Record<string, unknown> = {
        stage: body.stage,
        tokensUsed,
        creditsConsumed: credits,
        provider: body.useModel === 'seed' ? 'seed' : 'openrouter',
      };

      switch (body.stage) {
        case 'topic': response.topics = parsed; break;
        case 'outline': response.outline = parsed; break;
        case 'characters': response.characters = parsed; break;
        case 'episodes': response.storyCard = parsed; break;
      }

      return json(response);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return json({ error: msg, fallback: true }, 502);
    }
  }

  return err('Not found', 404);
};
