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
  generateVoice(req: AIVoiceRequest): Promise<AIVoiceResponse>;
  getStatus(): Promise<{ healthy: boolean; provider: string; latencyMs: number }>;
}
