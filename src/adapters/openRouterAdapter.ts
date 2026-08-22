/**
 * OpenRouter Adapter — calls /api/ai/* backend proxy.
 * The real OPENROUTER_API_KEY lives ONLY on the Cloudflare Worker side.
 * This file runs in the browser and MUST NOT contain any API key.
 */
import type {
  AIAdapter, AITextRequest, AITextResponse,
  AIScriptRequest, AIScriptResponse,
  AIVoiceRequest, AIVoiceResponse,
  ArchitectRequest, ArchitectResponse,
  CharacterCard, EpisodeStoryCard,
} from './types';

// ── API base path (always relative — same origin as the app) ─────────────────
const API_BASE = '/api/ai';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json<{ error?: string; detail?: string }>().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Video polling helper ──────────────────────────────────────────────────────
export interface VideoJobStatus {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  progress?: number | null;
  videoUrl?: string;
  creditsConsumed?: number;
  costUsd?: number;
}

export interface VideoSubmitResult {
  jobId: string;
  status: string;
  pollingUrl: string;
}

export async function submitVideoJob(req: {
  prompt: string;
  duration?: number;
  resolution?: string;
  aspectRatio?: string;
  frameImages?: string[];
  inputReferences?: string[];
  userId?: string;
  episodeId?: string;
}): Promise<VideoSubmitResult> {
  return post('/video', req);
}

export async function pollVideoJob(jobId: string): Promise<VideoJobStatus> {
  return get(`/video/${jobId}`);
}

/**
 * pollVideoUntilDone — polls every `intervalMs` until status is terminal.
 * Calls `onProgress(status)` on each tick for UI updates.
 * Resolves with the final VideoJobStatus or rejects on timeout.
 */
export async function pollVideoUntilDone(
  jobId: string,
  onProgress: (status: VideoJobStatus) => void,
  intervalMs = 3000,
  maxAttempts = 120          // 6 minutes max
): Promise<VideoJobStatus> {
  let attempts = 0;
  while (attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, intervalMs));
    const status = await pollVideoJob(jobId);
    onProgress(status);
    if (status.status === 'completed' || status.status === 'failed') {
      return status;
    }
    attempts++;
  }
  throw new Error('Video generation timed out after 6 minutes');
}

// ── TTS helper (returns blob URL for playback) ────────────────────────────────
export interface TtsResult {
  audioBlobUrl: string;
  durationEstimate: number;
  creditsConsumed: number;
  costUsd: number;
}

export async function generateTts(req: {
  text: string;
  voiceId?: string;
  language?: string;
  userId?: string;
  episodeId?: string;
}): Promise<TtsResult> {
  const data = await post<{
    audioBase64: string;
    contentType: string;
    durationEstimate: number;
    creditsConsumed: number;
    costUsd: number;
  }>('/tts', req);

  // Convert base64 → Blob → object URL for <audio> element
  const binary = atob(data.audioBase64);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: data.contentType });
  const audioBlobUrl = URL.createObjectURL(blob);

  return {
    audioBlobUrl,
    durationEstimate: data.durationEstimate,
    creditsConsumed: data.creditsConsumed,
    costUsd: data.costUsd,
  };
}

// ── Credits balance ───────────────────────────────────────────────────────────
export async function fetchCreditsBalance(userId: string): Promise<number> {
  const data = await get<{ balance: number }>(`/credits/${userId}`);
  return data.balance;
}

// ── AIAdapter implementation ──────────────────────────────────────────────────
export const openRouterAdapter: AIAdapter = {

  async generateText(req: AITextRequest): Promise<AITextResponse> {
    const data = await post<{
      text: string; tokensUsed: number; creditsConsumed: number; costUsd: number;
    }>('/text', {
      prompt: req.prompt,
      context: req.context,
      maxTokens: req.maxTokens,
    });
    return { ...data, provider: 'openrouter' };
  },

  async generateScript(req: AIScriptRequest): Promise<AIScriptResponse> {
    const prompt = `
請為以下短劇系列生成第 ${req.episodeNumber} 集的完整劇本：
系列：${req.seriesTitle}
長者語境：${req.elderContext}
素材：${req.materials.join('\n')}

請生成含分場的劇本，包含對白和場景描述。格式為 JSON：
{"scenes":[{"sceneNumber":1,"title":"場景標題","dialogue":["角色A: ...","角色B: ..."],"duration":30}]}
`;
    const data = await post<{
      text: string; tokensUsed: number; creditsConsumed: number; costUsd: number;
    }>('/text', { prompt, maxTokens: 3000 });

    let scenes = [];
    try {
      const parsed = JSON.parse(data.text);
      scenes = parsed.scenes ?? [];
    } catch { /* keep empty */ }

    return { ...data, provider: 'openrouter', scenes };
  },

  async generateArchitect(req: ArchitectRequest): Promise<ArchitectResponse> {
    const data = await post<ArchitectResponse>('/architect', {
      stage: req.stage,
      context: req.context,
      selectedTopic: req.selectedTopic,
      characters: req.characters,
      targetEpisode: req.targetEpisode,
      humanInput: req.humanInput,
    });
    return data;
  },

  async generateVoice(req: AIVoiceRequest): Promise<AIVoiceResponse> {
    const result = await generateTts({
      text: req.text,
      voiceId: req.voiceId,
      language: req.language,
    });
    return {
      audioUrl: result.audioBlobUrl,
      durationSeconds: result.durationEstimate,
      creditsConsumed: result.creditsConsumed,
      provider: 'seedance', // still reported as seedance for backward-compat
    };
  },

  async getStatus(): Promise<{ healthy: boolean; provider: string; latencyMs: number }> {
    const t0 = Date.now();
    try {
      const data = await get<{ ok: boolean; aiConfigured: boolean }>('/health');
      return { healthy: data.ok && data.aiConfigured, provider: 'openrouter', latencyMs: Date.now() - t0 };
    } catch {
      return { healthy: false, provider: 'openrouter', latencyMs: Date.now() - t0 };
    }
  },
};

// ── Architect save helper (persist to D1) ─────────────────────────────────────
export async function saveProjectToD1(params: {
  projectId: string;
  userId: string;
  title: string;
  mode?: string;
  characters?: CharacterCard[];
  storyCards?: EpisodeStoryCard[];
  outline?: { episodeNumber: number; title_i18n: { 'zh-HK': string; en: string; 'zh-CN': string }; oneLine_i18n: { 'zh-HK': string; en: string; 'zh-CN': string } }[];
}): Promise<void> {
  try {
    await post('/project/save', params);
  } catch (e) {
    console.warn('[openRouterAdapter] D1 save failed (non-blocking):', e);
  }
}
