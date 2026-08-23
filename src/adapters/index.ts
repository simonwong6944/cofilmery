/**
 * Adapter factory — VITE_AI_MODE controls which adapter is used.
 *
 * VITE_AI_MODE=mock   → mockAdapter (default, for demos and dev without API key)
 * VITE_AI_MODE=live   → openRouterAdapter (calls /api/ai/* backend proxy)
 *
 * The OPENROUTER_API_KEY is NEVER imported here — it lives in the Cloudflare
 * Worker env and is accessed only in functions/api/ai/[[path]].ts.
 */
import type { AIAdapter } from './types';
import { mockAdapter }        from './mockAdapter';
import { openRouterAdapter }  from './openRouterAdapter';

const mode = import.meta.env.VITE_AI_MODE ?? 'mock';

export const aiAdapter: AIAdapter = mode === 'live' ? openRouterAdapter : mockAdapter;

export { mockAdapter, openRouterAdapter };
export * from './types';

// Re-export video / TTS helpers for direct use in components
export {
  submitVideoJob,
  pollVideoJob,
  pollVideoUntilDone,
  generateTts,
  fetchCreditsBalance,
  saveProjectToD1,
  saveCharactersToD1,
  loadCharactersFromD1,
  type VideoJobStatus,
  type VideoSubmitResult,
  type TtsResult,
} from './openRouterAdapter';
