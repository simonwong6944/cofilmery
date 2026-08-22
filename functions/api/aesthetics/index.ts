/**
 * Cloudflare Pages Function: /api/aesthetics
 * aesthetic_library CRUD API
 *
 * GET  /api/aesthetics             — 列出已發佈條目（支援 category/mode/emotion/search 篩選）
 * POST /api/aesthetics/apply       — 套用選取（usage_count +1）
 * POST /api/aesthetics/contribute  — 眾包貢獻投稿（status=pending_review）
 */

interface Env {
  DB: D1Database;
}

interface AestheticRow {
  id: string;
  category: string;
  subcategory: string;
  name_i18n: string;
  description_i18n: string;
  emotion_tags: string;
  composed_of: string;
  prompt_fragment_zh: string;
  prompt_fragment_en: string;
  negative_fragment: string;
  adjustable_params: string;
  thumbnail_r2_key: string | null;
  source: string;
  status: string;
  contributor_id: string | null;
  usage_count: number;
  remix_count: number;
  rating_avg: number;
  mode_scope: string;
  created_at: string | null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function parseRow(row: AestheticRow) {
  return {
    ...row,
    name_i18n: JSON.parse(row.name_i18n),
    description_i18n: JSON.parse(row.description_i18n),
    emotion_tags: JSON.parse(row.emotion_tags),
    composed_of: JSON.parse(row.composed_of),
    adjustable_params: JSON.parse(row.adjustable_params),
    mode_scope: JSON.parse(row.mode_scope),
  };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // POST /api/aesthetics/apply
  if (method === 'POST' && url.pathname.endsWith('/apply')) {
    try {
      const body = await request.json() as { id: string };
      if (!body.id) return json({ error: 'id required' }, 400);

      await env.DB.prepare(
        'UPDATE aesthetic_library SET usage_count = usage_count + 1 WHERE id = ?'
      ).bind(body.id).run();

      return json({ success: true });
    } catch (e) {
      return json({ error: String(e) }, 500);
    }
  }

  // POST /api/aesthetics/remix  (remix_count +1)
  if (method === 'POST' && url.pathname.endsWith('/remix')) {
    try {
      const body = await request.json() as { id: string };
      if (!body.id) return json({ error: 'id required' }, 400);

      await env.DB.prepare(
        'UPDATE aesthetic_library SET remix_count = remix_count + 1 WHERE id = ?'
      ).bind(body.id).run();

      return json({ success: true });
    } catch (e) {
      return json({ error: String(e) }, 500);
    }
  }

  // POST /api/aesthetics/contribute
  if (method === 'POST' && url.pathname.endsWith('/contribute')) {
    try {
      const body = await request.json() as {
        id?: string;
        category: string;
        subcategory?: string;
        name_i18n: object;
        description_i18n: object;
        emotion_tags?: string[];
        composed_of?: string[];
        prompt_fragment_zh: string;
        prompt_fragment_en: string;
        negative_fragment?: string;
        adjustable_params?: object;
        mode_scope?: string[];
        contributor_id?: string;
      };

      const id = body.id || `community-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      await env.DB.prepare(`
        INSERT INTO aesthetic_library
          (id, category, subcategory, name_i18n, description_i18n, emotion_tags, composed_of,
           prompt_fragment_zh, prompt_fragment_en, negative_fragment, adjustable_params,
           source, status, contributor_id, mode_scope)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'community', 'pending_review', ?, ?)
      `).bind(
        id,
        body.category,
        body.subcategory || '',
        JSON.stringify(body.name_i18n),
        JSON.stringify(body.description_i18n),
        JSON.stringify(body.emotion_tags || []),
        JSON.stringify(body.composed_of || []),
        body.prompt_fragment_zh,
        body.prompt_fragment_en,
        body.negative_fragment || '',
        JSON.stringify(body.adjustable_params || {}),
        body.contributor_id || null,
        JSON.stringify(body.mode_scope || ['both']),
      ).run();

      return json({ success: true, id, status: 'pending_review' });
    } catch (e) {
      return json({ error: String(e) }, 500);
    }
  }

  // GET /api/aesthetics  — 查詢列表
  if (method === 'GET') {
    try {
      const category = url.searchParams.get('category');
      const mode = url.searchParams.get('mode');        // drama | legacy | both
      const emotion = url.searchParams.get('emotion');
      const search = url.searchParams.get('search');
      const sort = url.searchParams.get('sort') || 'popular'; // popular | newest | remixed
      const source = url.searchParams.get('source');    // for admin: all sources
      const statusFilter = url.searchParams.get('status') || 'published'; // published | pending_review

      let query = 'SELECT * FROM aesthetic_library WHERE status = ?';
      const params: (string | number)[] = [statusFilter];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }
      if (source) {
        query += ' AND source = ?';
        params.push(source);
      }
      if (mode && mode !== 'both') {
        query += ` AND (mode_scope LIKE ? OR mode_scope LIKE ?)`;
        params.push(`%"${mode}"%`, `%"both"%`);
      }
      if (emotion) {
        query += ` AND emotion_tags LIKE ?`;
        params.push(`%${emotion}%`);
      }
      if (search) {
        query += ` AND (name_i18n LIKE ? OR emotion_tags LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      if (sort === 'popular') query += ' ORDER BY usage_count DESC';
      else if (sort === 'newest') query += ' ORDER BY created_at DESC';
      else if (sort === 'remixed') query += ' ORDER BY remix_count DESC';
      else query += ' ORDER BY usage_count DESC';

      const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);
      query += ` LIMIT ${limit}`;

      const { results } = await env.DB.prepare(query).bind(...params).all<AestheticRow>();
      const items = (results || []).map(parseRow);

      return json({ items, total: items.length });
    } catch (e) {
      return json({ error: String(e) }, 500);
    }
  }

  return json({ error: 'Method not allowed' }, 405);
};
