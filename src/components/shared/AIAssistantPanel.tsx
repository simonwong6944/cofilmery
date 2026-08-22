import { useState } from 'react';
import { Send, Bot, RefreshCw, Check, Edit3, Sliders, Languages, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreditIndicator } from './CreditIndicator';
import { MOCK_AI_MESSAGES } from '@/lib/mockData';
import { aiAdapter } from '@/adapters/mockAdapter';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

interface Message { role: 'user' | 'assistant'; content: string; suggestions?: string[] }

export function AIAssistantPanel({ projectTitle = '第三集 · 街市情緣' }: { projectTitle?: string }) {
  const [messages, setMessages] = useState<Message[]>(MOCK_AI_MESSAGES as Message[]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const { locale } = useLocaleStore();
  const tr = t();

  // suppress unused warning — locale subscribed for re-render
  void locale;

  const quickActions = [
    { icon: RefreshCw, label: tr.creator.aiAssistant.actions.regenerate, cost: 50 },
    { icon: Check,     label: tr.creator.aiAssistant.actions.accept,     cost: 0 },
    { icon: Edit3,     label: tr.creator.aiAssistant.actions.rewrite,    cost: 20 },
    { icon: Sliders,   label: tr.creator.aiAssistant.actions.adjustStyle,cost: 15 },
    { icon: Languages, label: tr.creator.aiAssistant.actions.toFormal,   cost: 10 },
    { icon: Mic,       label: tr.creator.aiAssistant.actions.addVoice,   cost: 80 },
  ];

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    const res = await aiAdapter.generateText({ prompt: input });
    setMessages(m => [...m, { role: 'assistant', content: res.text }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-line">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-primary/5">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-primary" />
          <span className="font-semibold text-sm text-primary">{tr.creator.aiAssistant.title}</span>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        <span className="text-xs text-muted">⋯</span>
      </div>

      {/* Context */}
      <div className="px-4 py-2 bg-bg-soft border-b border-line">
        <p className="text-xs text-muted">{tr.creator.aiAssistant.editing}{projectTitle}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-accent text-white rounded-tr-sm'
                : 'bg-bg-soft text-ink rounded-tl-sm'
            )}>
              {msg.content}
              {msg.suggestions && (
                <div className="mt-2 flex flex-col gap-1">
                  {msg.suggestions.map((s, j) => (
                    <button key={j} className="text-left text-xs bg-white rounded px-2 py-1 text-primary hover:bg-primary/5 transition-colors">
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
            <div className="bg-bg-soft rounded-2xl px-4 py-2.5 text-sm text-muted animate-pulse">{tr.creator.aiAssistant.thinking}</div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-t border-line grid grid-cols-2 gap-1.5">
        {quickActions.map(({ icon: Icon, label, cost }) => (
          <button key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-ink bg-bg-soft hover:bg-line transition-colors text-left">
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
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-bg-soft border border-line focus:outline-none focus:border-primary"
          />
          <button onClick={handleSend} className="bg-primary text-white rounded-lg p-2 hover:bg-primary/90 transition-colors">
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
