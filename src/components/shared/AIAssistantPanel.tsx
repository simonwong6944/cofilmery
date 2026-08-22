import { useState, useRef, useEffect } from 'react';
import { Send, Bot, RefreshCw, Check, Edit3, Sliders, Languages, Mic, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreditIndicator } from './CreditIndicator';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { t } from '@/i18n';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  error?: boolean;
}

/**
 * AIAssistantPanel — 側邊 AI 創作助手
 *
 * 直接呼叫 /api/ai/text（Hono → OpenRouter Kimi K2）。
 * 不使用任何 mock 資料或寫死回應。
 * Prompt 包含：使用者即時輸入 + 故事素材 + projectStore context。
 */
export function AIAssistantPanel({ projectTitle }: { projectTitle?: string }) {
  // 空陣列啟動 — 移除所有 MOCK_AI_MESSAGES
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  // 從 projectStore 讀取真實 context
  const {
    projectTitle: storeTitle,
    storyMaterial,
    context,
    characters,
    storyCards,
    currentEpisode,
  } = useProjectStore();

  const displayTitle = projectTitle ?? storeTitle ?? tr.creator.aiAssistant.title;

  // 自動捲到最新訊息
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // 建立完整 system context 字串
  const buildSystemContext = (): string => {
    const parts: string[] = [
      '你是 CoFilmery 的 AI 創作助手，協助香港長者微電影創作者。',
      '請用繁體中文回應，語氣專業但親切。',
    ];

    if (storeTitle) parts.push(`專案名稱：${storeTitle}`);

    if (storyMaterial?.trim()) {
      parts.push(`\n【故事原材料（創作者輸入）】\n${storyMaterial.trim()}`);
    }

    if (context) {
      parts.push(`\n【系列設定】\n模式：${context.mode ?? '不明'}\n題材：${context.topic ?? '不明'}`);
      if (context.setting) parts.push(`場景：${context.setting}`);
    }

    if (characters && characters.length > 0) {
      const charList = characters
        .map(c => `  - ${c.name}（${c.age ?? ''}歲，${c.role ?? ''}）：${c.trait ?? ''}`)
        .join('\n');
      parts.push(`\n【角色設定】\n${charList}`);
    }

    const currentCard = storyCards?.find(s => s.episodeNumber === currentEpisode);
    if (currentCard) {
      parts.push(
        `\n【當前集數】第 ${currentEpisode} 集：${currentCard.title ?? ''}\n故事鉤：${currentCard.hook ?? ''}`
      );
    }

    return parts.join('\n');
  };

  const handleSend = async (overridePrompt?: string) => {
    const userInput = (overridePrompt ?? input).trim();
    if (!userInput || loading) return;

    const userMsg: Message = { role: 'user', content: userInput };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // 直接呼叫後端 /api/ai/text，不經過 adapter 的 mock/live 開關
      // 確保在 staging / production 上永遠打真實 OpenRouter
      const res = await fetch('/api/ai/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userInput,
          context: buildSystemContext(),
          maxTokens: 800,
        }),
      });

      if (!res.ok) {
        const errData = await res.json<{ error?: string; detail?: string }>().catch(() => ({}));
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json<{ text: string; creditsConsumed?: number }>();
      setMessages(m => [...m, { role: 'assistant', content: data.text }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知錯誤';
      setMessages(m => [
        ...m,
        { role: 'assistant', content: `⚠️ 請求失敗：${msg}`, error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: RefreshCw, label: tr.creator.aiAssistant.actions.regenerate,  prompt: '請重新生成上一個回應，換一個角度或語氣。' },
    { icon: Check,     label: tr.creator.aiAssistant.actions.accept,       prompt: '' },
    { icon: Edit3,     label: tr.creator.aiAssistant.actions.rewrite,      prompt: '請改寫上一段對白，使語言更自然流暢，更適合香港長者觀看。' },
    { icon: Sliders,   label: tr.creator.aiAssistant.actions.adjustStyle,  prompt: '請調整故事風格，加強情感張力和戲劇衝突。' },
    { icon: Languages, label: tr.creator.aiAssistant.actions.toFormal,     prompt: '請將對白改為較正式的書面粵語，保留地道語氣。' },
    { icon: Mic,       label: tr.creator.aiAssistant.actions.addVoice,     prompt: '請為上面的對白加入旁白指引，描述說話時的語氣和情緒。' },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-l border-line">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-primary/5">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-primary" />
          <span className="font-semibold text-sm text-primary">{tr.creator.aiAssistant.title}</span>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        <span className="text-xs text-muted">Kimi K2</span>
      </div>

      {/* Context 提示 */}
      <div className="px-4 py-2 bg-bg-soft border-b border-line">
        <p className="text-xs text-muted">
          {tr.creator.aiAssistant.editing}
          <span className="font-medium text-ink">{displayTitle}</span>
        </p>
        {storyMaterial?.trim() && (
          <p className="text-xs text-green-600 mt-0.5">✓ 已讀取故事原材料</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
            <Bot size={32} className="text-muted/40" />
            <p className="text-xs text-muted leading-relaxed">
              輸入你的創作需求，AI 會根據你的故事原材料和角色設定來回應。
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
              msg.role === 'user'
                ? 'bg-accent text-white rounded-tr-sm'
                : msg.error
                  ? 'bg-red-50 text-red-700 rounded-tl-sm border border-red-200'
                  : 'bg-bg-soft text-ink rounded-tl-sm'
            )}>
              {msg.error && <AlertCircle size={14} className="inline mr-1 mb-0.5" />}
              {msg.content}
              {msg.suggestions && (
                <div className="mt-2 flex flex-col gap-1">
                  {msg.suggestions.map((s, j) => (
                    <button
                      key={j}
                      onClick={() => handleSend(s)}
                      className="text-left text-xs bg-white rounded px-2 py-1 text-primary hover:bg-primary/5 transition-colors"
                    >
                      ▶ {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-bg-soft rounded-2xl px-4 py-2.5 text-sm text-muted animate-pulse">
              {tr.creator.aiAssistant.thinking}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-t border-line grid grid-cols-2 gap-1.5">
        {quickActions.map(({ icon: Icon, label, prompt }) => (
          <button
            key={label}
            disabled={loading || label === tr.creator.aiAssistant.actions.accept}
            onClick={() => prompt && handleSend(prompt)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-ink bg-bg-soft hover:bg-line transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon size={12} className="text-accent shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-line">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={tr.creator.aiAssistant.placeholder}
            disabled={loading}
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-bg-soft border border-line focus:outline-none focus:border-primary disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-primary text-white rounded-lg p-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 flex justify-center">
          <CreditIndicator cost={5} />
        </div>
      </div>
    </div>
  );
}
