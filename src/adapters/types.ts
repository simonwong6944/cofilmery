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

// S1 資產庫：贊助商已選資產（存 projectStore + D1 project_sponsor_assets 表）
// 與 DB schema 對齊：project_id 由外層提供，此為 per-asset payload
export interface SelectedSponsorAsset {
  asset_id:     string;   // assets.id (真實 D1 asset uuid)
  category:     string;   // asset category slug
  name:         string;   // asset.label || asset.file_name
  img:          string;   // asset.file_url
  brand:        string;   // asset.brand
  revenue_rate: number;   // asset.revenue_rate
}

// 角色外型選項（存角色層，供 S4/S5 視覺一致性讀取）
export interface CharacterAppearanceOptions {
  height: string;
  build: string;
  skin: string;
  hair: string;
  hairColor: string;
  hairLength: string;
  face: string;
  eyes: string;
  eyewear: string;
  facial: string;
  posture: string;
  style: string;
  extraNote: string; // 補充描述（自由填寫）
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
  // 靈魂欄位 → 用於故事生成
  appearancePrompt_zh: string;
  appearancePrompt_en: string;
  // 視覺欄位 → 用於 S4/S5 關鍵幀
  personality: string[];           // 性格特質標籤
  appearanceOptions: CharacterAppearanceOptions; // 外型細節
  similarityLevel: string;         // 極似 / 70% / 神韻
  humanEdited: boolean;
  // S2 UI 欄位（持久化避免返回時丟失）
  age?: string;                    // 年齡
  gender?: 'male' | 'female' | 'other'; // 性別
  img?: string;                    // 頭像 URL（R2 fileUrl 或外部 URL）
  refs?: string[];                 // 參考相 URL 陣列
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
