/** AI Provider adapter interface — swap OpenRouter / Seedance without changing callers */
export interface AITextRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
}

export interface AITextResponse {
  text: string;
  tokensUsed: number;
  creditsConsumed: number;
  provider: 'openrouter' | 'mock';
}

export interface AIVoiceRequest {
  text: string;
  voiceId: string;
  language: 'cantonese' | 'mandarin';
}

export interface AIVoiceResponse {
  audioUrl: string;
  durationSeconds: number;
  creditsConsumed: number;
  provider: 'seedance' | 'mock';
}

export interface AIScriptRequest {
  seriesTitle: string;
  episodeNumber: number;
  materials: string[];
  elderContext: string;
}

export interface AIScriptResponse extends AITextResponse {
  scenes: SceneScript[];
}

export interface SceneScript {
  sceneNumber: number;
  title: string;
  dialogue: string[];
  duration: number;
}

export interface AIAdapter {
  generateText(req: AITextRequest): Promise<AITextResponse>;
  generateScript(req: AIScriptRequest): Promise<AIScriptResponse>;
  generateArchitect(req: ArchitectRequest): Promise<ArchitectResponse>; // Story Architect
  generateVoice(req: AIVoiceRequest): Promise<AIVoiceResponse>;
  getStatus(): Promise<{ healthy: boolean; provider: string; latencyMs: number }>;
}

// ── Story Architect 分階段生成 ──────────────────────────────────────────

export type ArchitectStage = 'topic' | 'outline' | 'characters' | 'episodes';

export interface I18nText {
  'zh-HK': string;
  'en': string;
  'zh-CN': string;
}

export interface SeriesContext {
  seriesTitle: string;
  genre: string;        // dream/love/family/restart/nostalgia/hero
  tone: string;
  coreNeed: string;
  episodeCount: number;
  durationLabel: string; // e.g. "60秒"
  mode: 'drama' | 'legacy';
}

// 選題方向
export interface TopicOption {
  id: string;
  title_i18n: I18nText;
  logline_i18n: I18nText;
  hook_i18n: I18nText;
}

// 角色卡（存 project 層，整劇共用）
export interface CharacterCard {
  id: string;
  name_i18n: I18nText;
  identityTag_i18n: I18nText;
  coreDesire_i18n: I18nText;
  traitsConflict_i18n: I18nText;
  arc_i18n: I18nText;
  speechStyle_i18n: I18nText;
  relations_i18n: I18nText;
  appearancePrompt_zh: string;
  appearancePrompt_en: string;
  humanEdited: boolean;
}

// 分集故事卡（150–250字）
export interface EpisodeStoryCard {
  episodeNumber: number;
  title_i18n: I18nText;
  coreEmotion_i18n: I18nText;
  hook_i18n: I18nText;
  body_i18n: I18nText;
  turningPoint_i18n: I18nText;
  linkPrevNext_i18n: I18nText;
  characterIds: string[];
  humanEdited: boolean;
}

// 分階段請求/回應
export interface ArchitectRequest {
  stage: ArchitectStage;
  context: SeriesContext;
  selectedTopic?: TopicOption;
  characters?: CharacterCard[];
  targetEpisode?: number;
  humanInput?: string;
}

export interface ArchitectResponse {
  stage: ArchitectStage;
  topics?: TopicOption[];
  outline?: { episodeNumber: number; title_i18n: I18nText; oneLine_i18n: I18nText }[];
  characters?: CharacterCard[];
  storyCard?: EpisodeStoryCard;
  tokensUsed: number;
  creditsConsumed: number;
  provider: 'openrouter' | 'seed' | 'mock';
}

// 模型選擇（Phase 2 接真 API 時用）
export const ARCHITECT_MODELS = {
  default: 'openrouter/anthropic/claude-3.5-haiku',
  seed: 'bytedance/seed-1.6',
} as const;
