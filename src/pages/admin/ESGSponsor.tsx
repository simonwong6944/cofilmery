import { useState } from 'react';
import { Leaf, Star, Trophy, Award, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { TierBadge } from '@/components/shared/TierBadge';
import { cn } from '@/lib/utils';

const ESG_TIERS = [
  {
    id: 'trainee', label: '見習創作者', emoji: '🌱', color: 'bg-gray-50 border-gray-200',
    headerColor: 'bg-gray-100', textColor: 'text-gray-700',
    minScore: 0, maxScore: 199,
    benefits: ['基礎 AI 工具使用', '每月 1,000 點數', '社群支援'],
    requirements: ['完成平台培訓', '提交首部作品'],
    creators: 245,
  },
  {
    id: 'certified', label: '認證創作者', emoji: '⭐', color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-100', textColor: 'text-blue-700',
    minScore: 200, maxScore: 499,
    benefits: ['進階 AI 工具', '每月 5,000 點數', '品牌廣告分紅 15%', '認證徽章'],
    requirements: ['ESG 積分 ≥ 200', '完成 ≥ 2 部作品', '平均評分 ≥ 7.5'],
    creators: 187,
  },
  {
    id: 'senior', label: '資深創作者', emoji: '💎', color: 'bg-purple-50 border-purple-200',
    headerColor: 'bg-purple-100', textColor: 'text-purple-700',
    minScore: 500, maxScore: 999,
    benefits: ['全套 AI 工具', '每月 12,000 點數', '品牌廣告分紅 25%', '優先審批', '導師計劃'],
    requirements: ['ESG 積分 ≥ 500', '完成 ≥ 5 部作品', '平均評分 ≥ 8.5'],
    creators: 43,
  },
  {
    id: 'contracted', label: '簽約創作者', emoji: '🏆', color: 'bg-amber-50 border-amber-200',
    headerColor: 'bg-amber-100', textColor: 'text-amber-700',
    minScore: 1000, maxScore: Infinity,
    benefits: ['無限 AI 工具', '每月 30,000 點數', '廣告分紅 40%', '獨家合約', '作品版權分成', '企業合作優先'],
    requirements: ['ESG 積分 ≥ 1000', '完成 ≥ 10 部作品', '平均評分 ≥ 9.0', '平台委員會審批'],
    creators: 12,
  },
];

const MOCK_APPLICATIONS = [
  { id: 'app1', name: '黃小明', currentTier: 'trainee' as const, applyFor: 'certified' as const, esgScore: 215, works: 2, avgRating: 7.8, submittedAt: '2026-08-20', status: 'pending' },
  { id: 'app2', name: '吳美玲', currentTier: 'certified' as const, applyFor: 'senior' as const, esgScore: 510, works: 4, avgRating: 8.7, submittedAt: '2026-08-18', status: 'pending' },
  { id: 'app3', name: '張秀英', currentTier: 'trainee' as const, applyFor: 'certified' as const, esgScore: 180, works: 1, avgRating: 7.2, submittedAt: '2026-08-15', status: 'rejected' },
  { id: 'app4', name: '鄭家富', currentTier: 'certified' as const, applyFor: 'senior' as const, esgScore: 485, works: 6, avgRating: 8.3, submittedAt: '2026-08-10', status: 'approved' },
];

const APP_STATUS = {
  pending: { label: '待審批', color: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: '已批准', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: '已拒絕', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function ESGSponsor() {
  const [tab, setTab] = useState<'tiers' | 'applications'>('tiers');

  const totalCreators = ESG_TIERS.reduce((s, t) => s + t.creators, 0);

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-3 shrink-0">
          <Leaf className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-primary">ESG 創作者等級管理</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Overview */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {ESG_TIERS.map(tier => (
              <div key={tier.id} className="card-base p-4 text-center">
                <div className="text-3xl mb-1">{tier.emoji}</div>
                <div className="text-2xl font-bold text-ink">{tier.creators}</div>
                <div className="text-sm text-muted">{tier.label}</div>
                <div className="text-xs text-muted mt-1">ESG {tier.minScore}+ 分</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5">
            {[{ id: 'tiers', label: '等級架構' }, { id: 'applications', label: '升級申請' }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  tab === t.id ? 'bg-primary text-white' : 'bg-card text-ink hover:bg-line border border-line'
                )}>
                {t.label}
                {t.id === 'applications' && MOCK_APPLICATIONS.filter(a => a.status === 'pending').length > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {MOCK_APPLICATIONS.filter(a => a.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === 'tiers' && (
            <div className="grid grid-cols-2 gap-5">
              {ESG_TIERS.map((tier, i) => (
                <div key={tier.id} className={cn('rounded-xl border-2 overflow-hidden', tier.color)}>
                  <div className={cn('px-5 py-4', tier.headerColor)}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tier.emoji}</span>
                      <div>
                        <h3 className={cn('font-bold text-lg', tier.textColor)}>{tier.label}</h3>
                        <p className="text-xs text-muted">ESG {tier.minScore} ~ {tier.maxScore === Infinity ? '∞' : tier.maxScore} 分</p>
                      </div>
                      <div className="ml-auto text-right">
                        <div className={cn('text-2xl font-bold', tier.textColor)}>{tier.creators}</div>
                        <div className="text-xs text-muted">人</div>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">資格要求</h4>
                      <ul className="space-y-1">
                        {tier.requirements.map(r => (
                          <li key={r} className="flex items-center gap-2 text-sm text-ink">
                            <CheckCircle size={12} className="text-green-500 shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">等級福利</h4>
                      <ul className="space-y-1">
                        {tier.benefits.map(b => (
                          <li key={b} className="flex items-center gap-2 text-sm text-ink">
                            <Star size={11} className="text-accent shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'applications' && (
            <div className="card-base overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-bg-soft border-b border-line">
                  <tr>
                    <th className="text-left px-4 py-3 text-muted font-medium">申請人</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">現等級</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">申請升至</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">ESG 分</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">作品數</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">平均評分</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">申請日期</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">狀態</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {MOCK_APPLICATIONS.map(app => {
                    const cfg = APP_STATUS[app.status as keyof typeof APP_STATUS];
                    const StatusIcon = cfg.icon;
                    return (
                      <tr key={app.id} className="hover:bg-bg-soft">
                        <td className="px-4 py-3 font-medium text-ink">{app.name}</td>
                        <td className="px-4 py-3"><TierBadge tier={app.currentTier} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <ChevronRight size={14} className="text-green-500" />
                            <TierBadge tier={app.applyFor} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-primary">{app.esgScore}</td>
                        <td className="px-4 py-3 text-right">{app.works}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={app.avgRating >= 8.5 ? 'text-green-600 font-bold' : 'text-ink'}>{app.avgRating}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted">{app.submittedAt}</td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium', cfg.color)}>
                            <StatusIcon size={11} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {app.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => alert(`已批准 ${app.name} 升級申請`)} className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200">批准</button>
                              <button onClick={() => alert(`已拒絕 ${app.name} 升級申請`)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200">拒絕</button>
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
        </main>
      </div>
    </div>
  );
}
