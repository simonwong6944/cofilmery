/**
 * keyframeAdapter — D1 persistence helpers for S5 keyframe images.
 *
 * Mirrors the storyboardAdapter.ts pattern.
 * Pure TS — no JSX, no hooks, no external deps.
 *
 * POST /api/keyframes: upsert a single keyframe (project_id + episode + panel_scene).
 * GET  /api/keyframes?project_id=<pid>&episode=<ep>: returns keyframes array.
 */

export interface KeyframeRecord {
  id:         string;
  panelScene: number;
  imageUrl:   string;
  r2Key:      string;
  sortOrder:  number;
}

/**
 * saveKeyframeToD1 — upsert a single keyframe for one panel.
 *
 * Calls POST /api/keyframes with project_id + episode + panel_scene + image_url + r2_key.
 * Backend does INSERT OR REPLACE (keyed on project_id + episode + panel_scene).
 * Throws on network / DB error so callers can surface failures.
 */
export async function saveKeyframeToD1(
  projectId:  string,
  episode:    number,
  panelScene: number,
  imageUrl:   string,
  r2Key:      string,
): Promise<{ ok: boolean; id: string }> {
  const res = await fetch('/api/keyframes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id:  projectId,
      episode,
      panel_scene: panelScene,
      image_url:   imageUrl,
      r2_key:      r2Key,
    }),
  });
  if (!res.ok) {
    const err = await (res.json() as Promise<{ error?: string }>).catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<{ ok: boolean; id: string }>;
}

/**
 * loadKeyframesFromD1 — fetch all keyframes for one episode from D1.
 *
 * Returns an empty array when no rows exist (episode not yet generated).
 * Throws on network / DB error.
 */
export async function loadKeyframesFromD1(
  projectId: string,
  episode:   number,
): Promise<KeyframeRecord[]> {
  const res = await fetch(
    `/api/keyframes?project_id=${encodeURIComponent(projectId)}&episode=${episode}`,
  );
  if (!res.ok) {
    const err = await (res.json() as Promise<{ error?: string }>).catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  const data = await (res.json() as Promise<{ ok: boolean; keyframes: KeyframeRecord[] }>);
  return data.keyframes ?? [];
}
