/**
 * Cloudflare Pages Function: /api/episodes
 *
 * PATCH /api/episodes/:episodeId — update episodes.video_url.
 *
 * episodeId format: artificial string "${projectId}-ep${epNum}" (NOT a real D1 UUID).
 * This matches the format used in S6VideoGen.tsx and VideoGenPanel.tsx.
 *
 * Episodes are looked up by deriving project_id + episode_number from the
 * artificial episodeId key, then matched against the D1 episodes table.
 *
 * Env bindings: DB (D1Database)
 */
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

type Env = { Bindings: { DB: D1Database } };

const app = new Hono<Env>();

// ── Parse artificial episodeId → { projectId, epNum } ────────────────────────
function parseEpisodeId(episodeId: string): { projectId: string; epNum: number } | null {
  // Format: "${projectId}-ep${epNum}"
  const match = episodeId.match(/^(.+)-ep(\d+)$/);
  if (!match) return null;
  return { projectId: match[1], epNum: parseInt(match[2], 10) };
}

// ── PATCH /api/episodes/:episodeId ───────────────────────────────────────────
app.patch('/api/episodes/:episodeId', async (c) => {
  const { DB } = c.env;
  const episodeId = c.req.param('episodeId');

  const parsed = parseEpisodeId(episodeId);
  if (!parsed) {
    return c.json({ error: 'Invalid episodeId format (expected {projectId}-ep{n})' }, 400);
  }
  const { projectId, epNum } = parsed;

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { video_url } = body as { video_url?: string };
  if (typeof video_url !== 'string' || !video_url) {
    return c.json({ error: 'video_url is required' }, 400);
  }

  // ── Update episodes.video_url ────────────────────────────────────────────
  try {
    const result = await DB.prepare(
      `UPDATE episodes
         SET video_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE project_id = ? AND episode_number = ?`
    ).bind(video_url, projectId, epNum).run();

    if (result.meta.changes === 0) {
      // Row may not exist yet — upsert via INSERT OR REPLACE
      await DB.prepare(
        `INSERT OR REPLACE INTO episodes (id, project_id, episode_number, video_url, updated_at)
         VALUES (
           COALESCE(
             (SELECT id FROM episodes WHERE project_id = ? AND episode_number = ?),
             lower(hex(randomblob(16)))
           ),
           ?, ?, ?, CURRENT_TIMESTAMP
         )`
      ).bind(projectId, epNum, projectId, epNum, video_url).run();
    }

    return c.json({ ok: true, episodeId, video_url });
  } catch (e) {
    console.warn('[episodes] DB write failed:', String(e));
    return c.json({ error: 'DB write failed', detail: String(e) }, 500);
  }
});

// ── GET /api/episodes/:episodeId — read episode (incl. video_url) ─────────────
app.get('/api/episodes/:episodeId', async (c) => {
  const { DB } = c.env;
  const episodeId = c.req.param('episodeId');

  const parsed = parseEpisodeId(episodeId);
  if (!parsed) {
    return c.json({ error: 'Invalid episodeId format' }, 400);
  }
  const { projectId, epNum } = parsed;

  try {
    const row = await DB.prepare(
      `SELECT id, project_id, episode_number, video_url, updated_at
         FROM episodes
        WHERE project_id = ? AND episode_number = ?`
    ).bind(projectId, epNum).first();

    if (!row) return c.json({ error: 'Episode not found' }, 404);
    return c.json({ ok: true, episode: row });
  } catch (e) {
    return c.json({ error: 'DB read failed', detail: String(e) }, 500);
  }
});

export const onRequest = handle(app);
