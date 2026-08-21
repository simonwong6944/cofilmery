import { useState } from 'react';
import { ShieldAlert, Plus, Trash2, Search, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { cn } from '@/lib/utils';

const MOCK_REDLINE_KEYWORDS = [
  { id: 'k1', keyword: '非法賭博', category: '違法', severity: 'high', addedAt: '2026-01-10' },
  { id: 'k2', keyword: '政治敏感', category: '敏感', severity: 'high', addedAt: '2026-02-15' },
  { id: 'k3', keyword: '歧視言論', category: '仇恨', severity: 'high', addedAt: '2026-03-05' },
  { id: 'k4', keyword: '色情內容', category: '成人', severity: 'high', addedAt: '2026-04-12' },
  { id: 'k5', keyword: '暴力煽動', category: '暴力', severity: 'medium', addedAt: '2026-05-20' },
  { id: 'k6', keyword: '未成年人', category: '保護', severity: 'medium', addedAt: '2026-06-01' },
];

const MOCK_FLAGGED_CONTENT = [
  { id: 'f1', title: '街市情緣 第七集', creator: '李美華', mode: 'drama' as const, reason: '第12分鐘出現未授權品牌標誌', flaggedAt: '2026-08-21 09:15', status: 'pending' },
  { id: 'f2', title: '涼茶世家 第三集', creator: '陳志明', mode: 'drama' as const, reason: '對白中含有不當粵語粗口', flaggedAt: '2026-08-20 14:30', status: 'resolved' },
  { id: 'f3', title: '陳伯的街市歲月 第二集', creator: '李美華', mode: 'legacy' as const, reason: 'AI 生成畫面與受訪者形象不符', flaggedAt: '2026-08-19 11:00', status: 'rejected' },
  { id: 'f4', title: '海邊老友記 第四集', creator: '黃小明', mode: 'legacy' as const, reason: '背景音樂疑似侵犯版權', flaggedAt: '2026-08-18 16:45', status: 'pending' },
];

const SEV_COLOR = { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-blue-100 text-blue-700' };
const STATUS_CONFIG = {
  pending: { label: '待處理', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  resolved: { label: '已處理', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: '已駁回', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function ContentModeration() {
  const [tab, setTab] = useState<'flagged' | 'keywords'>('flagged');
  const [search, setSearch] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const filteredFlags = MOCK_FLAGGED_CONTENT.filter(f =>
    f.title.includes(search) || f.creator.includes(search) || f.reason.includes(search)
  );

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-3 shrink-0">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-primary">內容審核</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: '待處理舉報', value: MOCK_FLAGGED_CONTENT.filter(f => f.status === 'pending').length, color: 'text-amber-600' },
              { label: '今日已處理', value: 5, color: 'text-green-600' },
              { label: '紅線關鍵字', value: MOCK_REDLINE_KEYWORDS.length, color: 'text-red-600' },
              { label: '本月違規', value: 12, color: 'text-ink' },
            ].map(s => (
              <div key={s.label} className="card-base p-4 text-center">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            {[
              { id: 'flagged', label: '舉報內容' },
              { id: 'keywords', label: '紅線關鍵字' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  tab === t.id ? 'bg-primary text-white' : 'bg-card text-ink hover:bg-line border border-line'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'flagged' && (
            <div className="card-base overflow-hidden">
              <div className="p-4 border-b border-line flex gap-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="搜尋舉報內容…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="form-input pl-9 w-full text-sm"
                  />
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-bg-soft border-b border-line">
                  <tr>
                    <th className="text-left px-4 py-3 text-muted font-medium">作品</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">舉報原因</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">舉報時間</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">狀態</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredFlags.map(flag => {
                    const StatusIcon = STATUS_CONFIG[flag.status as keyof typeof STATUS_CONFIG].icon;
                    return (
                      <tr key={flag.id} className="hover:bg-bg-soft transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-ink">{flag.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <ModeBadge mode={flag.mode} />
                            <span className="text-xs text-muted">{flag.creator}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted max-w-xs">{flag.reason}</td>
                        <td className="px-4 py-3 text-xs text-muted">{flag.flaggedAt}</td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium',
                            STATUS_CONFIG[flag.status as keyof typeof STATUS_CONFIG].color
                          )}>
                            <StatusIcon size={11} />
                            {STATUS_CONFIG[flag.status as keyof typeof STATUS_CONFIG].label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {flag.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => alert('已標記為已處理')}
                                className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                              >
                                處理
                              </button>
                              <button
                                onClick={() => alert('已駁回舉報')}
                                className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                駁回
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'keywords' && (
            <div className="space-y-4">
              {/* Add keyword */}
              <div className="card-base p-4 flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs text-muted mb-1 block">新增關鍵字</label>
                  <input
                    type="text"
                    placeholder="輸入違禁詞…"
                    value={newKeyword}
                    onChange={e => setNewKeyword(e.target.value)}
                    className="form-input w-full"
                  />
                </div>
                <div className="w-32">
                  <label className="text-xs text-muted mb-1 block">類別</label>
                  <input
                    type="text"
                    placeholder="類別"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="form-input w-full"
                  />
                </div>
                <button
                  onClick={() => { if (newKeyword) { alert(`已新增關鍵字：${newKeyword}`); setNewKeyword(''); setNewCategory(''); } }}
                  className="btn-primary flex items-center gap-2 py-2"
                >
                  <Plus size={16} />
                  新增
                </button>
              </div>

              {/* Keywords table */}
              <div className="card-base overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-bg-soft border-b border-line">
                    <tr>
                      <th className="text-left px-4 py-3 text-muted font-medium">關鍵字</th>
                      <th className="text-left px-4 py-3 text-muted font-medium">類別</th>
                      <th className="text-left px-4 py-3 text-muted font-medium">嚴重程度</th>
                      <th className="text-left px-4 py-3 text-muted font-medium">新增日期</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {MOCK_REDLINE_KEYWORDS.map(kw => (
                      <tr key={kw.id} className="hover:bg-bg-soft">
                        <td className="px-4 py-3 font-medium text-ink">{kw.keyword}</td>
                        <td className="px-4 py-3 text-muted">{kw.category}</td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                            SEV_COLOR[kw.severity as keyof typeof SEV_COLOR]
                          )}>
                            {kw.severity === 'high' ? '高' : kw.severity === 'medium' ? '中' : '低'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted">{kw.addedAt}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => alert(`已刪除關鍵字：${kw.keyword}`)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
