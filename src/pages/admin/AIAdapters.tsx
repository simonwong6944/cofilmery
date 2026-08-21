import { useState } from 'react';
import { Cpu, Zap, CheckCircle, XCircle, RefreshCw, Settings, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { cn } from '@/lib/utils';

type AdapterStatus = 'active' | 'inactive' | 'error' | 'testing';

interface AIAdapter {
  id: string;
  name: string;
  provider: string;
  model: string;
  purpose: string[];
  status: AdapterStatus;
  latency: number; // ms
  costPerCall: number; // HKD
  callsToday: number;
  successRate: number;
  apiKeyMasked: string;
  notes: string;
}

const MOCK_ADAPTERS: AIAdapter[] = [
  {
    id: 'a1', name: 'OpenRouter GPT-4o', provider: 'OpenRouter', model: 'openai/gpt-4o',
    purpose: ['劇本生成', 'AI 審批評分', '對白優化'],
    status: 'active', latency: 1240, costPerCall: 0.12, callsToday: 847,
    successRate: 99.2, apiKeyMasked: 'sk-or-v1-••••••••••••••••••••5f3a',
    notes: '主要 LLM，用於劇本生成及審批評分。配置 max_tokens=4096',
  },
  {
    id: 'a2', name: 'Seedance Video', provider: 'ByteDance', model: 'seedance-1.0-lite',
    purpose: ['AI 畫面生成', '分鏡板生成'],
    status: 'active', latency: 8500, costPerCall: 0.85, callsToday: 124,
    successRate: 97.6, apiKeyMasked: 'sdnc-••••••••••••••••••••a2b1',
    notes: '視頻生成適配器，每次生成 5 秒片段，最大解析度 720p',
  },
  {
    id: 'a3', name: '粵語 TTS', provider: 'MiniMax', model: 'speech-02-hd',
    purpose: ['粵語配音', '長者語音合成'],
    status: 'active', latency: 2100, costPerCall: 0.08, callsToday: 312,
    successRate: 98.9, apiKeyMasked: 'mm-••••••••••••••••••••c9d2',
    notes: '粵語 TTS，支援六十歲以上男女聲色。速率範圍 0.8~1.2',
  },
  {
    id: 'a4', name: 'FLUX 圖像生成', provider: 'OpenRouter', model: 'black-forest-labs/flux-pro',
    purpose: ['封面圖生成', 'AI 畫面生成'],
    status: 'inactive', latency: 4800, costPerCall: 0.45, callsToday: 0,
    successRate: 94.1, apiKeyMasked: 'sk-or-v1-••••••••••••••••••••7e2c',
    notes: '備用圖像生成，主要用於 Seedance 停用時切換',
  },
  {
    id: 'a5', name: 'Claude 3.5 Sonnet', provider: 'OpenRouter', model: 'anthropic/claude-3.5-sonnet',
    purpose: ['五維評分複審', '紅線合規檢查'],
    status: 'error', latency: 0, costPerCall: 0.18, callsToday: 0,
    successRate: 0, apiKeyMasked: 'sk-or-v1-••••••••••••••••••••9f1b',
    notes: '⚠️ API 密鑰已過期，請更新',
  },
];

const STATUS_CONFIG: Record<AdapterStatus, { label: string; color: string; icon: any }> = {
  active: { label: '正常', color: 'text-green-600', icon: CheckCircle },
  inactive: { label: '停用', color: 'text-gray-400', icon: XCircle },
  error: { label: '錯誤', color: 'text-red-600', icon: AlertTriangle },
  testing: { label: '測試中', color: 'text-blue-600', icon: RefreshCw },
};

export default function AIAdapters() {
  const [adapters, setAdapters] = useState<AIAdapter[]>(MOCK_ADAPTERS);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<string | null>(null);

  const toggleStatus = (id: string) => {
    setAdapters(prev => prev.map(a => {
      if (a.id !== id) return a;
      if (a.status === 'active') return { ...a, status: 'inactive' as AdapterStatus };
      if (a.status === 'inactive') return { ...a, status: 'active' as AdapterStatus };
      return a;
    }));
  };

  const testAdapter = async (id: string) => {
    setTesting(id);
    setAdapters(prev => prev.map(a => a.id === id ? { ...a, status: 'testing' as AdapterStatus } : a));
    await new Promise(r => setTimeout(r, 2000));
    setAdapters(prev => prev.map(a => a.id === id ? { ...a, status: 'active' as AdapterStatus } : a));
    setTesting(null);
    alert('Adapter 連線測試成功！');
  };

  const totalCallsToday = adapters.reduce((s, a) => s + a.callsToday, 0);
  const totalCostToday = adapters.reduce((s, a) => s + a.callsToday * a.costPerCall, 0);

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-3 shrink-0">
          <Cpu className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-primary">AI Adapter 配置</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: '已啟用 Adapter', value: adapters.filter(a => a.status === 'active').length, color: 'text-green-600' },
              { label: '今日 API 呼叫', value: totalCallsToday.toLocaleString(), color: 'text-primary' },
              { label: '今日估算成本', value: `HK$${totalCostToday.toFixed(2)}`, color: 'text-accent' },
              { label: '異常 Adapter', value: adapters.filter(a => a.status === 'error').length, color: 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="card-base p-4 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Error Alert */}
          {adapters.some(a => a.status === 'error') && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertTriangle size={16} className="text-red-600 shrink-0" />
              <p className="text-sm text-red-800">
                有 {adapters.filter(a => a.status === 'error').length} 個 Adapter 發生錯誤，請立即檢查並更新 API 密鑰。
              </p>
            </div>
          )}

          {/* Adapters */}
          <div className="space-y-4">
            {adapters.map(adapter => {
              const st = STATUS_CONFIG[adapter.status];
              const StatusIcon = st.icon;
              return (
                <div key={adapter.id} className={cn('card-base p-5', adapter.status === 'error' && 'border-red-200 border-2')}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Cpu size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-ink">{adapter.name}</h3>
                        <p className="text-xs text-muted">{adapter.provider} · {adapter.model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn('inline-flex items-center gap-1 text-sm font-medium', st.color)}>
                        <StatusIcon size={14} className={adapter.status === 'testing' ? 'animate-spin' : ''} />
                        {st.label}
                      </span>
                      <button
                        onClick={() => testAdapter(adapter.id)}
                        disabled={testing === adapter.id}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-bg-soft hover:bg-line border border-line text-ink transition-colors"
                      >
                        <RefreshCw size={12} className={testing === adapter.id ? 'animate-spin' : ''} />
                        測試
                      </button>
                      <button
                        onClick={() => toggleStatus(adapter.id)}
                        className={cn('w-10 h-5 rounded-full transition-colors relative',
                          adapter.status === 'active' ? 'bg-primary' : 'bg-line'
                        )}
                      >
                        <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                          adapter.status === 'active' ? 'translate-x-5' : 'translate-x-0.5'
                        )} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-4 mb-3 text-sm">
                    <div>
                      <div className="text-xs text-muted mb-0.5">延遲</div>
                      <div className={cn('font-medium', adapter.latency > 5000 ? 'text-amber-600' : 'text-ink')}>
                        {adapter.latency > 0 ? `${adapter.latency}ms` : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted mb-0.5">每次費用</div>
                      <div className="font-medium text-ink">HK${adapter.costPerCall}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted mb-0.5">今日呼叫</div>
                      <div className="font-medium text-ink">{adapter.callsToday.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted mb-0.5">成功率</div>
                      <div className={cn('font-medium', adapter.successRate >= 98 ? 'text-green-600' : adapter.successRate >= 90 ? 'text-amber-600' : 'text-red-600')}>
                        {adapter.successRate > 0 ? `${adapter.successRate}%` : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted mb-0.5">今日費用</div>
                      <div className="font-medium text-accent">HK${(adapter.callsToday * adapter.costPerCall).toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs text-muted mb-1">用途</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {adapter.purpose.map(p => (
                        <span key={p} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{p}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-xs text-muted mb-1">API Key</div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-bg-soft px-2 py-1 rounded font-mono text-ink">
                          {showKey[adapter.id] ? 'sk-or-v1-••••••••••••••••••••5f3a (已隱藏)' : adapter.apiKeyMasked}
                        </code>
                        <button onClick={() => setShowKey(p => ({ ...p, [adapter.id]: !p[adapter.id] }))} className="text-muted hover:text-ink">
                          {showKey[adapter.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button onClick={() => alert('請在環境變量中更新 API Key')} className="text-xs px-2 py-0.5 rounded bg-line hover:bg-line/80 text-muted">更新</button>
                      </div>
                    </div>
                  </div>

                  {adapter.notes && (
                    <div className={cn('mt-3 text-xs px-3 py-2 rounded-lg',
                      adapter.status === 'error' ? 'bg-red-50 text-red-700' : 'bg-bg-soft text-muted'
                    )}>
                      {adapter.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
