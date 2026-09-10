/**
 * storyboardAdapter — D1 persistence helpers for S4 storyboard panels.
 *
 * Mirrors the saveCharactersToD1 / loadCharactersFromD1 pattern in openRouterAdapter.ts.
 * Pure TS — no JSX, no hooks, no external deps.
 *
 * POST /api/storyboard: full overwrite for (project_id, episode) — other episodes untouched.
 * GET  /api/storyboard?project_id=<pid>&episode=<ep>: returns panels array.
 */
import type { StoryboardPanel } from '@/components/shared/S4StoryboardGen';

/**
 * saveStoryboardToD1 — full overwrite of storyboard panels for one episode.
 *
 * Calls POST /api/storyboard with project_id + episode + panels array.
 * Backend does DELETE (episode-scoped) + batch-INSERT atomically.
 * Throws on network / DB error so callers can surface failures.
 */
export async function saveStoryboardToD1(
  projectId: string,
  episode: number,
  panels: StoryboardPanel[],
): Promise<{ ok: boolean; count: number }> {
  const res = await fetch('/api/storyboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: projectId, episode, panels }),
  });
  if (!res.ok) {
    const err = await res.json<{ error?: string }>().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * loadStoryboardFromD1 — fetch storyboard panels for one episode from D1.
 *
 * Returns an empty array when no rows exist (new project or episode not yet generated).
 * Throws on network / DB error.
 */
export async function loadStoryboardFromD1(
  projectId: string,
  episode: number,
): Promise<StoryboardPanel[]> {
  const res = await fetch(
    `/api/storyboard?project_id=${encodeURIComponent(projectId)}&episode=${episode}`,
  );
  if (!res.ok) {
    const err = await res.json<{ error?: string }>().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  const data = await res.json<{ ok: boolean; panels: StoryboardPanel[] }>();
  return data.panels ?? [];
}
