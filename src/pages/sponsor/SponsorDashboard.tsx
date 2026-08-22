import { useState } from 'react';
import { Building2, Coins, Film, Award, TrendingUp, ChevronRight, Plus, BarChart2, Users, Eye, FileCheck, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { KPIStatCard } from '@/components/shared/KPIStatCard';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';

type Project = {
  id: string;
  title: string;
  type: '贊助式傳承' | '企業領袖傳承' | '創作者群組贊助';
  status: '進行中' | '審核中' | '已完成' | '待啟動';
  budget: number;
  spent: number;
  episodes: number;
  views: number;
  esgPoints: number;
  startDate: string;
  endDate: string;
};

const MOCK_PROJECTS: Project[] = [
  {
    id: 'sp-001',
    title: '陳伯的街市歲月（傳承系列）',
    type: '贊助式傳承',
    status: '進行中',
    budget: 80000,
    spent: 42000,
    episodes: 3,
    views: 4500,
    esgPoints: 240,
    startDate: '2026-06-01',
    endDate: '2026-12-31',
  },
  {
    id: 'sp-002',
    title: '海邊老友記（傳承系列）',
    type: '贊助式傳承',
    status: '審核中',
    budget: 50000,
    spent: 0,
    episodes: 0,
    views: 0,
    esgPoints: 0,
    startDate: '2026-09-01',
    endDate: '2027-03-31',
  },
  {
    id: 'sp-003',
    title: '中藥世家三代傳（企業傳承）',
    type: '企業領袖傳承',
    status: '已完成',
    budget: 120000,
    spent: 118500,
    episodes: 5,
    views: 12800,
    esgPoints: 580,
    startDate: '2026-01-15',
    endDate: '2026-07-31',
  },
];

const STATUS_COLORS: Record<Project['status'], string> = {
  '進行中': 'bg-green-500/15 text-green-400 border-green-500/20',
  '審核中': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  '已完成': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  '待啟動': 'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

const STATUS_ICONS: Record<Project['status'], JSX.Element> = {
  '進行中': <CheckCircle className="w-3.5 h-3.5"/>,
  '審核中': <Clock className="w-3.5 h-3.5"/>,
  '已完成': <CheckCircle className="w-3.5 h-3.5"/>,
  '待啟動': <AlertCircle className="w-3.5 h-3.5"/>,
};

const TYPE_COLORS: Record<Project['type'], string> = {
  '贊助式傳承': 'bg-amber-500/15 text-amber-400',
  '企業領袖傳承': 'bg-primary/15 text-primary',
  '創作者群組贊助': 'bg-purple-500/15 text-purple-400',
};

export default function SponsorDashboard() {
  const { user, logout } = useAuthStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'impact'>('overview');

  const totalBudget = MOCK_PROJECTS.reduce((a, p) => a + p.budget, 0);
  const totalSpent = MOCK_PROJECTS.reduce((a, p) => a + p.spent, 0);
  const totalViews = MOCK_PROJECTS.reduce((a, p) => a + p.views, 0);
  const totalEsgPoints = MOCK_PROJECTS.reduce((a, p) => a + p.esgPoints, 0);
  const totalEpisodes = MOCK_PROJECTS.reduce((a, p) => a + p.episodes, 0);

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-line shadow-nav">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo size="md" withWordmark />
          </Link>
          <nav className="flex items-center gap-1">
            {([['overview', '總覽'], ['projects', '贊助項目'], ['impact', 'ESG 成效']] as const).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'text-ink hover:bg-bg-soft'}`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.[0] ?? 'S'}
            </div>
            <span className="text-sm text-ink font-medium">{user?.name ?? '企業贊助方'}</span>
            <button onClick={logout} className="text-sm text-muted hover:text-ink transition-colors">登出</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">企業贊助方儀表板</h1>
              <p className="text-white/70">管理您的 ESG 贊助項目，追蹤社會影響力</p>
            </div>
            <button className="flex items-center gap-2 bg-white text-primary font-semibold px-4 py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm">
              <Plus className="w-4 h-4"/>新增贊助項目
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <KPIStatCard label="贊助項目" value={MOCK_PROJECTS.length.toString()} unit="個" trend="" icon={<Building2 className="w-5 h-5"/>}/>
          <KPIStatCard label="累計投入" value={`HK$${(totalSpent / 1000).toFixed(0)}K`} unit="" trend="+15%" icon={<Coins className="w-5 h-5"/>}/>
          <KPIStatCard label="傳承影片" value={totalEpisodes.toString()} unit="集" trend="+3" icon={<Film className="w-5 h-5"/>}/>
          <KPIStatCard label="總觀看次數" value={totalViews.toLocaleString()} unit="" trend="+28%" icon={<Eye className="w-5 h-5"/>}/>
          <KPIStatCard label="ESG 積分" value={totalEsgPoints.toString()} unit="點" trend="+80" icon={<Award className="w-5 h-5"/>}/>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Budget Usage */}
            <div className="card-base p-6">
              <h2 className="font-bold text-ink mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary"/>預算使用情況
              </h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-muted mb-2">
                  <span>已使用</span>
                  <span>HK${totalSpent.toLocaleString()} / HK${totalBudget.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-bg-soft rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                    style={{ width: `${Math.round((totalSpent / totalBudget) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>{Math.round((totalSpent / totalBudget) * 100)}% 已使用</span>
                  <span>剩餘 HK${(totalBudget - totalSpent).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Recent Projects Summary */}
            <div className="card-base p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-ink flex items-center gap-2"><Film className="w-5 h-5 text-primary"/>近期贊助項目</h2>
                <button onClick={() => setActiveTab('projects')} className="text-sm text-primary hover:underline flex items-center gap-1">
                  查看全部 <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
              <div className="space-y-3">
                {MOCK_PROJECTS.map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-4 bg-bg-soft rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Film className="w-5 h-5 text-accent"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink text-sm truncate">{p.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[p.type]}`}>{p.type}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${STATUS_COLORS[p.status]}`}>
                        {STATUS_ICONS[p.status]}{p.status}
                      </span>
                      <p className="text-xs text-muted mt-1">{p.esgPoints > 0 ? `+${p.esgPoints} ESG積分` : '待審核'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ESG Report Preview */}
            <div className="card-base p-6 border-l-4 border-accent">
              <div className="flex items-center gap-3 mb-3">
                <FileCheck className="w-6 h-6 text-accent"/>
                <h2 className="font-bold text-ink">ESG 報告摘要</h2>
                <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded-full font-medium">2026 年度</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: '受惠長者人數', value: '12', unit: '位' },
                  { label: '記錄口述歷史', value: '8', unit: '小時' },
                  { label: '社區觸達', value: '17,300', unit: '次' },
                ].map(({ label, value, unit }) => (
                  <div key={label} className="text-center p-3 bg-bg-soft rounded-xl">
                    <div className="text-2xl font-bold text-primary">{value}<span className="text-sm text-muted ml-1">{unit}</span></div>
                    <div className="text-xs text-muted mt-1">{label}</div>
                  </div>
                ))}
              </div>
              <button className="w-full text-center text-sm text-primary font-medium py-2 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                下載完整 ESG 報告（PDF）
              </button>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink">所有贊助項目</h2>
              <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4"/>新增項目
              </button>
            </div>

            {MOCK_PROJECTS.map(p => (
              <div key={p.id} className="card-base p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${TYPE_COLORS[p.type]}`}>{p.type}</span>
                      <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${STATUS_COLORS[p.status]}`}>
                        {STATUS_ICONS[p.status]}{p.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-ink text-lg">{p.title}</h3>
                    <p className="text-xs text-muted">{p.startDate} — {p.endDate}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-primary">+{p.esgPoints}</div>
                    <div className="text-xs text-muted">ESG 積分</div>
                  </div>
                </div>

                {/* Budget Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted mb-1.5">
                    <span>預算使用</span>
                    <span>HK${p.spent.toLocaleString()} / HK${p.budget.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-bg-soft rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${p.spent >= p.budget ? 'bg-red-500' : 'bg-gradient-to-r from-primary to-accent'}`}
                      style={{ width: `${Math.min(100, Math.round((p.spent / p.budget) * 100))}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-muted mt-1">{Math.round((p.spent / p.budget) * 100)}%</div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: <Film className="w-4 h-4"/>, value: p.episodes, label: '已產集數' },
                    { icon: <Eye className="w-4 h-4"/>, value: p.views.toLocaleString(), label: '觀看次數' },
                    { icon: <Users className="w-4 h-4"/>, value: p.episodes > 0 ? Math.round(p.views / Math.max(p.episodes, 1)) : 0, label: '平均每集觀看' },
                  ].map(({ icon, value, label }) => (
                    <div key={label} className="flex items-center gap-2 p-3 bg-bg-soft rounded-xl">
                      <span className="text-primary">{icon}</span>
                      <div>
                        <div className="font-bold text-ink text-sm">{value}</div>
                        <div className="text-xs text-muted">{label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Impact Tab */}
        {activeTab === 'impact' && (
          <div className="space-y-6">
            <div className="card-base p-6">
              <h2 className="font-bold text-ink text-xl mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-accent"/>ESG 社會影響力報告
              </h2>

              {/* Impact KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { emoji: '👴', value: '12', label: '受訪長者', sub: '記錄人生故事' },
                  { emoji: '🎬', value: totalEpisodes.toString(), label: '傳承影片', sub: '已製作完成' },
                  { emoji: '👁', value: totalViews.toLocaleString(), label: '觀看次數', sub: '長者觀眾' },
                  { emoji: '⏱', value: '26', label: '小時口述歷史', sub: '珍貴記錄' },
                ].map(({ emoji, value, label, sub }) => (
                  <div key={label} className="text-center p-4 bg-bg-soft rounded-2xl">
                    <div className="text-3xl mb-1">{emoji}</div>
                    <div className="text-2xl font-bold text-primary">{value}</div>
                    <div className="text-sm font-medium text-ink">{label}</div>
                    <div className="text-xs text-muted">{sub}</div>
                  </div>
                ))}
              </div>

              {/* ESG Dimensions */}
              <h3 className="font-bold text-ink mb-4">ESG 維度評分</h3>
              <div className="space-y-3">
                {[
                  { label: '社會 (S) — 長者故事記錄', score: 92, color: 'bg-green-500' },
                  { label: '環境 (E) — 低碳數字製作', score: 78, color: 'bg-blue-500' },
                  { label: '管治 (G) — 透明度及報告', score: 85, color: 'bg-purple-500' },
                  { label: '文化傳承 — 非物質文化遺產', score: 88, color: 'bg-amber-500' },
                ].map(({ label, score, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm text-ink mb-1">
                      <span>{label}</span>
                      <span className="font-bold text-primary">{score}/100</span>
                    </div>
                    <div className="h-2.5 bg-bg-soft rounded-full overflow-hidden">
                      <div className={`h-2.5 ${color} rounded-full`} style={{ width: `${score}%` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates */}
            <div className="card-base p-6">
              <h3 className="font-bold text-ink mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-accent"/>獲得認證</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { title: 'CoFilmery ESG 銀級贊助商', date: '2026-08-01', valid: '2027-07-31' },
                  { title: '長者友善企業認證', date: '2026-06-15', valid: '2027-06-14' },
                ].map(({ title, date, valid }) => (
                  <div key={title} className="flex items-center gap-3 p-4 border border-accent/30 bg-accent/5 rounded-xl">
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-accent"/>
                    </div>
                    <div>
                      <p className="font-semibold text-ink text-sm">{title}</p>
                      <p className="text-xs text-muted">頒發：{date} · 有效至：{valid}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full text-center text-sm text-primary font-medium py-2.5 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
                下載 ESG 認證報告（PDF）
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
