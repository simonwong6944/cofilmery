import { useState } from 'react';
import { Heart, Search, Plus, Users, DollarSign, Film, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { cn } from '@/lib/utils';

const MOCK_SPONSORED_PROJECTS = [
  {
    id: 'sp1',
    elderName: '陳伯',
    elderAge: 82,
    elderLocation: '大埔',
    sponsorName: '陳大文',
    sponsorRelation: '孫兒',
    projectTitle: '陳伯的街市歲月',
    creator: '李美華',
    fundingGoal: 15000,
    fundingRaised: 15000,
    fundingBackers: 23,
    status: 'completed',
    submittedAt: '2026-06-01',
    completedAt: '2026-08-10',
    episodes: 3,
  },
  {
    id: 'sp2',
    elderName: '李婆婆',
    elderAge: 75,
    elderLocation: '西貢',
    sponsorName: '李志強',
    sponsorRelation: '兒子',
    projectTitle: '海邊老友記',
    creator: '黃小明',
    fundingGoal: 12000,
    fundingRaised: 8400,
    fundingBackers: 15,
    status: 'active',
    submittedAt: '2026-07-15',
    completedAt: '',
    episodes: 1,
  },
  {
    id: 'sp3',
    elderName: '陳師傅',
    elderAge: 78,
    elderLocation: '上環',
    sponsorName: '陳家明',
    sponsorRelation: '徒弟',
    projectTitle: '中藥世家三代傳',
    creator: '陳志明',
    fundingGoal: 20000,
    fundingRaised: 20000,
    fundingBackers: 31,
    status: 'reviewing',
    submittedAt: '2026-07-01',
    completedAt: '',
    episodes: 2,
  },
  {
    id: 'sp4',
    elderName: '王阿姐',
    elderAge: 70,
    elderLocation: '觀塘',
    sponsorName: '王美珍',
    sponsorRelation: '女兒',
    projectTitle: '針線情緣',
    creator: '待分配',
    fundingGoal: 8000,
    fundingRaised: 1200,
    fundingBackers: 4,
    status: 'crowdfunding',
    submittedAt: '2026-08-15',
    completedAt: '',
    episodes: 0,
  },
];

const STATUS_CONFIG = {
  crowdfunding: { label: '眾籌中', color: 'bg-blue-100 text-blue-700', icon: Users },
  active: { label: '製作中', color: 'bg-green-100 text-green-700', icon: Film },
  reviewing: { label: '審批中', color: 'bg-amber-100 text-amber-700', icon: Clock },
  completed: { label: '已完成', color: 'bg-gray-100 text-gray-600', icon: CheckCircle },
  rejected: { label: '已拒絕', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function SponsoredLegacyAdmin() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = MOCK_SPONSORED_PROJECTS.filter(p => {
    const matchSearch = p.elderName.includes(search) || p.projectTitle.includes(search) || p.sponsorName.includes(search);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalFunding = MOCK_SPONSORED_PROJECTS.reduce((s, p) => s + p.fundingRaised, 0);
  const totalBackers = MOCK_SPONSORED_PROJECTS.reduce((s, p) => s + p.fundingBackers, 0);

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-3 shrink-0">
          <Heart className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-primary">贊助式傳承管理</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: '全部計劃', value: MOCK_SPONSORED_PROJECTS.length, color: 'text-primary', icon: Heart },
              { label: '眾籌中計劃', value: MOCK_SPONSORED_PROJECTS.filter(p => p.status === 'crowdfunding').length, color: 'text-blue-600', icon: Users },
              { label: '總眾籌金額', value: `HK$${totalFunding.toLocaleString()}`, color: 'text-green-600', icon: DollarSign },
              { label: '贊助人數', value: totalBackers, color: 'text-accent', icon: Users },
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

          {/* Filters */}
          <div className="card-base p-4 mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="搜尋長者姓名、計劃名或贊助人…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input pl-9 w-full"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'crowdfunding', 'active', 'reviewing', 'completed'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    statusFilter === s ? 'bg-primary text-white' : 'bg-bg-soft text-ink hover:bg-line'
                  )}>
                  {s === 'all' ? '全部' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s}
                </button>
              ))}
            </div>
          </div>

          {/* Project Cards */}
          <div className="space-y-3">
            {filtered.map(project => {
              const cfg = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = cfg.icon;
              const fundingPct = project.fundingGoal > 0 ? Math.min((project.fundingRaised / project.fundingGoal) * 100, 100) : 0;

              return (
                <div key={project.id} className="card-base p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-ink">{project.projectTitle}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted">
                        <span>長者：{project.elderName}（{project.elderAge}歲，{project.elderLocation}）</span>
                        <span>·</span>
                        <span>贊助人：{project.sponsorName}（{project.sponsorRelation}）</span>
                      </div>
                    </div>
                    <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium', cfg.color)}>
                      <StatusIcon size={11} />
                      {cfg.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted mb-1">負責創作者</div>
                      <div className="text-sm font-medium text-ink">{project.creator}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted mb-1">已完成集數</div>
                      <div className="text-sm font-medium text-ink">{project.episodes} 集</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted mb-1">眾籌進度</div>
                      <div className="text-sm font-medium text-ink">
                        HK${project.fundingRaised.toLocaleString()} / {project.fundingGoal.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted mb-1">贊助人數</div>
                      <div className="text-sm font-medium text-ink">{project.fundingBackers} 人</div>
                    </div>
                  </div>

                  {/* Funding bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted mb-1">
                      <span>眾籌進度</span>
                      <span>{fundingPct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-line rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', fundingPct >= 100 ? 'bg-green-500' : 'bg-accent')}
                        style={{ width: `${fundingPct}%` }}
                      />
                    </div>
                  </div>

                  {project.status === 'reviewing' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => alert('已批准計劃')} className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium">批准啟動</button>
                      <button onClick={() => alert('已退回修改')} className="text-xs px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 font-medium">退回修改</button>
                      <button onClick={() => alert('已拒絕計劃')} className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium">拒絕</button>
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
