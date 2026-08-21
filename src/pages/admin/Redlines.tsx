import { useState } from 'react';
import { AlertTriangle, Plus, Trash2, Edit2, Save, X, ShieldCheck, Info } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { cn } from '@/lib/utils';

type Severity = 'critical' | 'high' | 'medium' | 'low';

interface RedlineRule {
  id: string;
  category: string;
  rule: string;
  description: string;
  severity: Severity;
  aiPromptNote: string;
  enabled: boolean;
}

const MOCK_REDLINES: RedlineRule[] = [
  {
    id: 'r1', category: '政治合規',
    rule: '不得涉及批評特區政府或中央政府的政治言論',
    description: '包括隱晦的政治暗示或象徵性符號',
    severity: 'critical', aiPromptNote: '審查對白及畫面中所有可能被詮釋為政治評論的內容',
    enabled: true,
  },
  {
    id: 'r2', category: '版權保護',
    rule: '禁止使用未授權音樂、商標、品牌標誌',
    description: '背景音樂、店舖招牌、商品包裝均需版權確認',
    severity: 'high', aiPromptNote: '掃描所有音頻及畫面中可識別的受保護元素',
    enabled: true,
  },
  {
    id: 'r3', category: '長者保護',
    rule: '長者同意書必須有書面記錄，錄影前完成',
    description: '認知障礙症長者需監護人共同簽署',
    severity: 'critical', aiPromptNote: '核對提交材料中的同意書日期與錄製日期',
    enabled: true,
  },
  {
    id: 'r4', category: '兒童保護',
    rule: '未成年人出現在畫面中必須獲家長書面同意',
    description: '包括路人中的兒童',
    severity: 'high', aiPromptNote: 'AI 人臉識別標記所有未成年面孔',
    enabled: true,
  },
  {
    id: 'r5', category: '語言規範',
    rule: '禁止使用粗俗、歧視性或仇恨性語言',
    description: '包括隱晦的粵語粗口及方言罵人用語',
    severity: 'medium', aiPromptNote: '對白文本過濾違禁詞典，包括諧音字',
    enabled: true,
  },
  {
    id: 'r6', category: '廣告規範',
    rule: '隱性廣告必須於片尾字幕標明「贊助內容」',
    description: '品牌植入若超過 5 秒或有明顯推廣意圖',
    severity: 'medium', aiPromptNote: '識別畫面中超過 3 秒的品牌曝光',
    enabled: true,
  },
  {
    id: 'r7', category: '文化敏感',
    rule: '不得歪曲或醜化香港傳統文化習俗',
    description: '包括宗教禮儀、傳統節日的不當描繪',
    severity: 'medium', aiPromptNote: '對照文化習俗資料庫驗證描繪準確性',
    enabled: false,
  },
];

const SEV_CONFIG: Record<Severity, { label: string; color: string; bg: string }> = {
  critical: { label: '嚴重', color: 'text-red-700', bg: 'bg-red-100' },
  high: { label: '高', color: 'text-orange-700', bg: 'bg-orange-100' },
  medium: { label: '中', color: 'text-amber-700', bg: 'bg-amber-100' },
  low: { label: '低', color: 'text-blue-700', bg: 'bg-blue-100' },
};

const CATEGORIES = [...new Set(MOCK_REDLINES.map(r => r.category))];

export default function Redlines() {
  const [rules, setRules] = useState<RedlineRule[]>(MOCK_REDLINES);
  const [editId, setEditId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState({ category: '', rule: '', description: '', severity: 'medium' as Severity, aiPromptNote: '' });

  const filtered = rules.filter(r => filterCat === 'all' || r.category === filterCat);

  const toggleEnabled = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteRule = (id: string) => {
    if (confirm('確定要刪除此紅線規則？')) {
      setRules(prev => prev.filter(r => r.id !== id));
    }
  };

  const addRule = () => {
    if (!newRule.rule || !newRule.category) return;
    setRules(prev => [...prev, { ...newRule, id: `r${Date.now()}`, enabled: true }]);
    setNewRule({ category: '', rule: '', description: '', severity: 'medium', aiPromptNote: '' });
    setShowAdd(false);
  };

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-3 shrink-0">
          <AlertTriangle className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-primary">紅線合規配置</h1>
          <button onClick={() => setShowAdd(true)} className="ml-auto btn-primary flex items-center gap-2 py-1.5 text-sm">
            <Plus size={14} />
            新增規則
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: '全部規則', value: rules.length, color: 'text-ink' },
              { label: '已啟用', value: rules.filter(r => r.enabled).length, color: 'text-green-600' },
              { label: '嚴重級別', value: rules.filter(r => r.severity === 'critical').length, color: 'text-red-600' },
              { label: '本月觸發', value: 28, color: 'text-amber-600' },
            ].map(s => (
              <div key={s.label} className="card-base p-4 text-center">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-800">
              紅線規則會被自動注入 AI 審批 Prompt，並於人工審批時作為核對清單。
              嚴重（Critical）級別規則一旦觸發，作品將自動進入人工複審。
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {['all', ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  filterCat === cat ? 'bg-primary text-white' : 'bg-card text-ink hover:bg-line border border-line'
                )}>
                {cat === 'all' ? '全部類別' : cat}
              </button>
            ))}
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            {filtered.map(rule => {
              const sev = SEV_CONFIG[rule.severity];
              return (
                <div key={rule.id} className={cn('card-base p-4 transition-opacity', !rule.enabled && 'opacity-50')}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <button
                        onClick={() => toggleEnabled(rule.id)}
                        className={cn('w-10 h-5 rounded-full transition-colors relative',
                          rule.enabled ? 'bg-primary' : 'bg-line'
                        )}
                      >
                        <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                          rule.enabled ? 'translate-x-5' : 'translate-x-0.5'
                        )} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted bg-bg-soft px-2 py-0.5 rounded">{rule.category}</span>
                            <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', sev.bg, sev.color)}>
                              {sev.label}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-ink">{rule.rule}</p>
                          {rule.description && <p className="text-xs text-muted mt-0.5">{rule.description}</p>}
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-600">
                            <ShieldCheck size={11} />
                            <span className="italic">{rule.aiPromptNote}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => setEditId(editId === rule.id ? null : rule.id)}
                            className="p-1.5 rounded hover:bg-bg-soft text-muted">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => deleteRule(rule.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-bold text-ink mb-4">新增紅線規則</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted mb-1 block">類別</label>
                  <input type="text" value={newRule.category} onChange={e => setNewRule(p => ({ ...p, category: e.target.value }))} className="form-input w-full" placeholder="政治合規" /></div>
                <div><label className="text-xs text-muted mb-1 block">嚴重程度</label>
                  <select value={newRule.severity} onChange={e => setNewRule(p => ({ ...p, severity: e.target.value as Severity }))} className="form-input w-full">
                    <option value="critical">嚴重</option>
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select></div>
              </div>
              <div><label className="text-xs text-muted mb-1 block">規則描述</label>
                <input type="text" value={newRule.rule} onChange={e => setNewRule(p => ({ ...p, rule: e.target.value }))} className="form-input w-full" /></div>
              <div><label className="text-xs text-muted mb-1 block">詳細說明</label>
                <textarea value={newRule.description} onChange={e => setNewRule(p => ({ ...p, description: e.target.value }))} className="form-input w-full h-16 resize-none" /></div>
              <div><label className="text-xs text-muted mb-1 block">AI Prompt 備注</label>
                <input type="text" value={newRule.aiPromptNote} onChange={e => setNewRule(p => ({ ...p, aiPromptNote: e.target.value }))} className="form-input w-full" /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg border border-line text-ink hover:bg-bg-soft">取消</button>
              <button onClick={addRule} className="flex-1 btn-primary py-2">新增規則</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
