/**
 * videoAdapter — D1 persistence helpers for S6 video generation.
 *
 * Mirrors the storyboardAdapter.ts / keyframeAdapter.ts pattern.
 * Pure TS — no JSX, no hooks, no external deps.
 *
 * PATCH /api/episodes/:episodeId — update episodes.video_url.
 * GET   /api/episodes/:episodeId — load episode (incl. video_url).
 *
 * episodeId format: artificial string "${projectId}-ep${epNum}"
 * (NOT a real D1 UUID — must stay consistent with S6VideoGen.tsx).
 */

export interface VideoRecord {
  episodeId: string;
  videoUrl:  string;
  updatedAt?: string;
}

/**
 * saveVideoToD1 — persist video_url to episodes table via PATCH /api/episodes.
 *
 * Non-fatal pattern: callers should .catch(e => console.warn(...))
 * so a D1 write failure never blocks the UI or the video response.
 *
 * @param episodeId  Artificial key "${projectId}-ep${epNum}"
 * @param videoUrl   Permanent R2 URL (or CDN fallback URL)
 */
export async function saveVideoToD1(
  episodeId: string,
  videoUrl:  string,
): Promise<{ ok: boolean }> {
  const res = await fetch(`/api/episodes/${encodeURIComponent(episodeId)}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ video_url: videoUrl }),
  });

  if (!res.ok) {
    const err = await (res.json() as Promise<{ error?: string }>).catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? `HTTP ${res.status} from /api/episodes/${episodeId}`
    );
  }

  return res.json() as Promise<{ ok: boolean }>;
}

/**
 * fetchCompletedVideoByEpisode — query gen_jobs for latest completed video
 * by per-panel episodeId via GET /api/ai/video/by-episode/:episodeId.
 *
 * Uses the brick-3a endpoint which bypasses episodes.parseEpisodeId bug
 * (episodes table has no -p1 suffix support, gen_jobs does).
 *
 * Returns the videoUrl string, or null if not found / network error.
 * Never throws — callers should treat null as "not yet completed".
 *
 * @param episodeId  Per-panel key e.g. "${pid6}-ep${ep}-p${scene}"
 */
export async function fetchCompletedVideoByEpisode(
  episodeId: string,
): Promise<string | null> {
  try {
    const res = await fetch(`/api/ai/video/by-episode/${encodeURIComponent(episodeId)}`);
    if (!res.ok) return null;
    const body = await res.json() as { videoUrl?: string | null };
    return body.videoUrl ?? null;
  } catch {
    return null; // graceful: network error → treat as not completed
  }
}

/**
 * loadVideoFromD1 — fetch episode record including video_url from D1.
 *
 * Returns null if episode not found (404) so callers can fall back to
 * state / local storage gracefully without throwing.
 *
 * @param episodeId  Artificial key "${projectId}-ep${epNum}"
 */
export async function loadVideoFromD1(
  episodeId: string,
): Promise<VideoRecord | null> {
  const res = await fetch(`/api/episodes/${encodeURIComponent(episodeId)}`);

  if (res.status === 404) return null;

  if (!res.ok) {
    const err = await (res.json() as Promise<{ error?: string }>).catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? `HTTP ${res.status} from /api/episodes/${episodeId}`
    );
  }

  const body = await res.json() as {
    ok: boolean;
    episode: { episode_number: number; video_url?: string; updated_at?: string };
  };

  const ep = body.episode;
  if (!ep.video_url) return null;

  return {
    episodeId,
    videoUrl:  ep.video_url,
    updatedAt: ep.updated_at,
  };
}
