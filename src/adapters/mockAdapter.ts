import type { AIAdapter, AITextRequest, AITextResponse, AIScriptRequest, AIScriptResponse, AIVoiceRequest, AIVoiceResponse } from './types';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Mock AI adapter — returns realistic responses without real API calls */
export const mockAdapter: AIAdapter = {
  async generateText(req: AITextRequest): Promise<AITextResponse> {
    await delay(800);
    return {
      text: `根據您的要求，我建議將對白調整為更符合五十五歲以上觀眾的語言習慣。建議使用七十年代常見的粵語詞彙，加入當時流行的語氣助詞，令長者觀眾更有共鳴。\n\n修改後的對白：「今日菜心非常新鮮，價錢又公道，實在難得！」`,
      tokensUsed: 256,
      creditsConsumed: 5,
      provider: 'mock',
    };
  },

  async generateScript(req: AIScriptRequest): Promise<AIScriptResponse> {
    await delay(1200);
    return {
      text: '劇本生成完成',
      tokensUsed: 1024,
      creditsConsumed: 50,
      provider: 'mock',
      scenes: [
        { sceneNumber: 1, title: '街市清晨', dialogue: ['陳先生：今日菜心非常新鮮！', '街坊：是呀，每日清早就要來才有好貨。'], duration: 15 },
        { sceneNumber: 2, title: '舊友重逢', dialogue: ['李先生：多年不見，你依然精神！', '陳先生：還好，每日來街市走走，身體自然好。'], duration: 30 },
        { sceneNumber: 3, title: '溫馨收檔', dialogue: ['陳先生：又是收檔的時候了，感謝各位街坊今日的光顧。'], duration: 15 },
      ],
    };
  },

  async generateVoice(req: AIVoiceRequest): Promise<AIVoiceResponse> {
    await delay(1500);
    return {
      audioUrl: '/mock/audio/sample-cantonese.mp3',
      durationSeconds: 30,
      creditsConsumed: 80,
      provider: 'mock',
    };
  },

  async getStatus() {
    await delay(100);
    return { healthy: true, provider: 'mock', latencyMs: 100 };
  },
};

/** OpenRouter adapter — STUBBED, wires in real calls when API key provided */
export const openRouterAdapter: AIAdapter = {
  async generateText(req: AITextRequest): Promise<AITextResponse> {
    // TODO: wire real OpenRouter API
    return mockAdapter.generateText(req);
  },
  async generateScript(req: AIScriptRequest): Promise<AIScriptResponse> {
    return mockAdapter.generateScript(req);
  },
  async generateVoice(req: AIVoiceRequest): Promise<AIVoiceResponse> {
    // TODO: wire real Seedance Cantonese voice API
    return mockAdapter.generateVoice(req);
  },
  async getStatus() {
    return { healthy: true, provider: 'openrouter-stub', latencyMs: 120 };
  },
};

/** Active adapter — switch here when going live */
export const aiAdapter: AIAdapter = mockAdapter;
