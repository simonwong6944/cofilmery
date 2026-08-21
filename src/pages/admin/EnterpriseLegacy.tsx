import { useState } from 'react';
import { Building2, Plus, Search, Calendar, Users, Film, DollarSign, ChevronRight } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { cn } from '@/lib/utils';

const MOCK_ENTERPRISE_PROJECTS = [
  {
    id: 'ep1',
    company: '滙豐銀行香港',
    logo: '🏦',
    projectName: '百年金融傳承',
    description: '記錄香港金融業百年歷史，訪問十位資深從業員的人生故事。',
    targetElders: 10,
    completedElders: 7,
    budget: 800000,
    spent: 560000,
    startDate: '2026-06-01',
    endDate: '2027-05-31',
    status: 'active',
    creator: '劉德華',
    episodes: 10,
  },
  {
    id: 'ep2',
    company: '香港電燈',
    logo: '💡',
    projectName: '光電香江七十年',
    description: '七位老員工分享香港電力業的發展歷程與個人回憶。',
    targetElders: 7,
    completedElders: 7,
    budget: 500000,
    spent: 498000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'completed',
    creator: '陳志明',
    episodes: 7,
  },
  {
    id: 'ep3',
    company: '香港小輪',
    logo: '⛴️',
    projectName: '渡海情懷',
    description: '記錄天星小輪及香港渡輪業的歷史變遷，訪問退役船員。',
    targetElders: 5,
    completedElders: 0,
    budget: 350000,
    spent: 0,
    startDate: '2026-09-01',
    endDate: '2027-08-31',
    status: 'pending',
    creator: '待分配',
    episodes: 0,
  },
  {
    id: 'ep4',
    company: '和記黃埔',
    logo: '🏗️',
    projectName: '建設香港半世紀',
    description: '八位建築業老匠人講述香港城市建設的親歷故事。',
    targetElders: 8,
    completedElders: 3,
    budget: 620000,
    spent: 230000,
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    status: 'active',
    creator: '李美華',
    episodes: 3,
  },
];

const STATUS_CONFIG = {
  active: { label: '進行中', color: 'bg-green-100 text-green-700' },
  completed: { label: '已完成', color: 'bg-blue-100 text-blue-700' },
  pending: { label: '待啟動', color: 'bg-amber-100 text-amber-700' },
  paused: { label: '暫停', color: 'bg-gray-100 text-gray-600' },
};

export default function EnterpriseLegacy() {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = MOCK_ENTERPRISE_PROJECTS.filter(p =>
    p.company.includes(search) || p.projectName.includes(search)
  );

  const totalBudget = MOCK_ENTERPRISE_PROJECTS.reduce((s, p) => s + p.budget, 0);
  const totalSpent = MOCK_ENTERPRISE_PROJECTS.reduce((s, p) => s + p.spent, 0);
  const activeProjects = MOCK_ENTERPRISE_PROJECTS.filter(p => p.status === 'active').length;
  const totalElders = MOCK_ENTERPRISE_PROJECTS.reduce((s, p) => s + p.completedElders, 0);

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-3 shrink-0">
          <Building2 className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-primary">企業傳承計劃管理</h1>
          <button onClick={() => setShowAdd(true)} className="ml-auto btn-primary flex items-center gap-2 py-1.5 text-sm">
            <Plus size={14} />
            新增計劃
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: '進行中計劃', value: activeProjects, color: 'text-green-600', icon: Building2 },
              { label: '已記錄長者', value: totalElders, color: 'text-primary', icon: Users },
              { label: '總合約金額', value: `HK$${(totalBudget / 10000).toFixed(0)}萬`, color: 'text-accent', icon: DollarSign },
              { label: '已執行預算', value: `${((totalSpent / totalBudget) * 100).toFixed(0)}%`, color: 'text-blue-600', icon: Film },
            ].map(s => (
              <div key={s.label} className="card-base p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">{s.label}</span>
                  <s.icon size={16} className={s.color} />
                </div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="card-base p-4 mb-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="搜尋企業或計劃名稱…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input pl-9 w-full"
              />
            </div>
          </div>

          {/* Project Cards */}
          <div className="space-y-4">
            {filtered.map(project => {
              const progress = project.targetElders > 0 ? (project.completedElders / project.targetElders) * 100 : 0;
              const budgetProgress = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
              const cfg = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG];

              return (
                <div key={project.id} className="card-base p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{project.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-ink text-lg">{project.projectName}</h3>
                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', cfg.color)}>{cfg.label}</span>
                          </div>
                          <div className="text-sm text-muted font-medium">{project.company}</div>
                          <p className="text-sm text-muted mt-1">{project.description}</p>
                        </div>
                        <button className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm">
                          詳情 <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mt-3">
                        <div>
                          <div className="text-xs text-muted mb-1">負責創作者</div>
                          <div className="text-sm font-medium text-ink">{project.creator}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted mb-1">拍攝長者</div>
                          <div className="text-sm font-medium text-ink">{project.completedElders} / {project.targetElders} 位</div>
                          <div className="mt-1.5 h-1.5 bg-line rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted mb-1">預算執行</div>
                          <div className="text-sm font-medium text-ink">HK${project.spent.toLocaleString()} / {project.budget.toLocaleString()}</div>
                          <div className="mt-1.5 h-1.5 bg-line rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full', budgetProgress > 90 ? 'bg-red-500' : 'bg-accent')} style={{ width: `${budgetProgress}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted mb-1">計劃期限</div>
                          <div className="text-sm font-medium text-ink flex items-center gap-1">
                            <Calendar size={12} className="text-muted" />
                            {project.endDate}
                          </div>
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
            <h3 className="text-lg font-bold text-ink mb-4">新增企業傳承計劃</h3>
            <div className="space-y-3">
              <div><label className="text-xs text-muted mb-1 block">企業名稱</label>
                <input type="text" className="form-input w-full" /></div>
              <div><label className="text-xs text-muted mb-1 block">計劃名稱</label>
                <input type="text" className="form-input w-full" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted mb-1 block">目標長者人數</label>
                  <input type="number" className="form-input w-full" /></div>
                <div><label className="text-xs text-muted mb-1 block">合約金額 (HK$)</label>
                  <input type="number" className="form-input w-full" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted mb-1 block">開始日期</label>
                  <input type="date" className="form-input w-full" /></div>
                <div><label className="text-xs text-muted mb-1 block">結束日期</label>
                  <input type="date" className="form-input w-full" /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg border border-line text-ink hover:bg-bg-soft">取消</button>
              <button onClick={() => { alert('企業傳承計劃已建立'); setShowAdd(false); }} className="flex-1 btn-primary py-2">建立計劃</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
