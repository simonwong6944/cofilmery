import { useState } from 'react';
import { UserCheck, Search, ChevronUp, ChevronDown, Film, Eye, Star, Award, MoreHorizontal } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { TierBadge } from '@/components/shared/TierBadge';
import { cn } from '@/lib/utils';

const MOCK_CREATORS = [
  { id: 'c1', name: '李美華', email: 'li.meihua@example.com', tier: 'certified' as const, works: 3, totalViews: 18700, esgScore: 8.7, joinedAt: '2026-01-15', status: 'active' },
  { id: 'c2', name: '陳志明', email: 'chan.jimming@example.com', tier: 'senior' as const, works: 5, totalViews: 41200, esgScore: 9.1, joinedAt: '2025-11-03', status: 'active' },
  { id: 'c3', name: '王小龍', email: 'wong.siulung@example.com', tier: 'certified' as const, works: 2, totalViews: 32100, esgScore: 9.0, joinedAt: '2026-02-20', status: 'active' },
  { id: 'c4', name: '黃小明', email: 'wong.siuming@example.com', tier: 'trainee' as const, works: 1, totalViews: 0, esgScore: 0, joinedAt: '2026-07-01', status: 'active' },
  { id: 'c5', name: '張秀英', email: 'cheung.sauyeng@example.com', tier: 'trainee' as const, works: 0, totalViews: 0, esgScore: 0, joinedAt: '2026-08-10', status: 'active' },
  { id: 'c6', name: '劉德華', email: 'lau.takwa@example.com', tier: 'contracted' as const, works: 12, totalViews: 189000, esgScore: 9.6, joinedAt: '2025-06-01', status: 'active' },
  { id: 'c7', name: '鄭家富', email: 'cheng.kafoo@example.com', tier: 'senior' as const, works: 7, totalViews: 56300, esgScore: 8.9, joinedAt: '2025-09-12', status: 'suspended' },
  { id: 'c8', name: '吳美玲', email: 'ng.meiling@example.com', tier: 'certified' as const, works: 4, totalViews: 22400, esgScore: 8.5, joinedAt: '2026-03-07', status: 'active' },
];

const TIER_COLORS: Record<string, string> = {
  trainee: 'bg-gray-100 text-gray-600',
  certified: 'bg-blue-100 text-blue-700',
  senior: 'bg-purple-100 text-purple-700',
  contracted: 'bg-amber-100 text-amber-700',
};

const TIER_ORDER = ['trainee', 'certified', 'senior', 'contracted'];

export default function CreatorManagement() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [actionCreator, setActionCreator] = useState<string | null>(null);

  const filtered = MOCK_CREATORS.filter(c => {
    const matchSearch = c.name.includes(search) || c.email.includes(search);
    const matchTier = tierFilter === 'all' || c.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const stats = {
    total: MOCK_CREATORS.length,
    trainee: MOCK_CREATORS.filter(c => c.tier === 'trainee').length,
    certified: MOCK_CREATORS.filter(c => c.tier === 'certified').length,
    senior: MOCK_CREATORS.filter(c => c.tier === 'senior').length,
    contracted: MOCK_CREATORS.filter(c => c.tier === 'contracted').length,
  };

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-3 shrink-0">
          <UserCheck className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-primary">創作者管理</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[
              { label: '全部', value: stats.total, color: 'text-ink' },
              { label: '見習', value: stats.trainee, color: 'text-gray-600' },
              { label: '認證', value: stats.certified, color: 'text-blue-600' },
              { label: '資深', value: stats.senior, color: 'text-purple-600' },
              { label: '簽約', value: stats.contracted, color: 'text-amber-600' },
            ].map(s => (
              <div key={s.label} className="card-base p-4 text-center">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-muted mt-1">{s.label}創作者</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="card-base p-4 mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="搜尋創作者姓名或電郵…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input pl-9 w-full"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'trainee', 'certified', 'senior', 'contracted'].map(tier => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    tierFilter === tier ? 'bg-primary text-white' : 'bg-bg-soft text-ink hover:bg-line'
                  )}
                >
                  {tier === 'all' ? '全部' : tier === 'trainee' ? '見習' : tier === 'certified' ? '認證' : tier === 'senior' ? '資深' : '簽約'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="card-base overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-soft border-b border-line">
                <tr>
                  <th className="text-left px-4 py-3 text-muted font-medium">創作者</th>
                  <th className="text-left px-4 py-3 text-muted font-medium">等級</th>
                  <th className="text-right px-4 py-3 text-muted font-medium">作品數</th>
                  <th className="text-right px-4 py-3 text-muted font-medium">累計觀看</th>
                  <th className="text-right px-4 py-3 text-muted font-medium">ESG 分</th>
                  <th className="text-left px-4 py-3 text-muted font-medium">加入日期</th>
                  <th className="text-left px-4 py-3 text-muted font-medium">狀態</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map(creator => (
                  <tr key={creator.id} className="hover:bg-bg-soft transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{creator.name}</div>
                      <div className="text-xs text-muted">{creator.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <TierBadge tier={creator.tier} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Film size={12} className="text-muted" />
                        <span>{creator.works}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Eye size={12} className="text-muted" />
                        <span>{creator.totalViews.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star size={12} className="text-accent" />
                        <span className={creator.esgScore >= 9 ? 'text-green-600 font-bold' : 'text-ink'}>
                          {creator.esgScore > 0 ? creator.esgScore.toFixed(1) : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{creator.joinedAt}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                        creator.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}>
                        {creator.status === 'active' ? '正常' : '停用'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setActionCreator(actionCreator === creator.id ? null : creator.id)}
                          className="p-1.5 rounded hover:bg-line transition-colors"
                        >
                          <MoreHorizontal size={16} className="text-muted" />
                        </button>
                        {actionCreator === creator.id && (
                          <div className="absolute right-0 top-8 z-10 bg-card border border-line rounded-lg shadow-lg w-40 py-1">
                            <div className="px-3 py-1 text-xs text-muted font-medium uppercase tracking-wide">升降等級</div>
                            {TIER_ORDER.filter(t => t !== creator.tier).map(tier => (
                              <button
                                key={tier}
                                onClick={() => { alert(`已將 ${creator.name} 調整為 ${tier}`); setActionCreator(null); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-bg-soft"
                              >
                                {TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(creator.tier)
                                  ? <ChevronUp size={14} className="text-green-600" />
                                  : <ChevronDown size={14} className="text-red-500" />
                                }
                                升為{tier === 'trainee' ? '見習' : tier === 'certified' ? '認證' : tier === 'senior' ? '資深' : '簽約'}
                              </button>
                            ))}
                            <hr className="my-1 border-line" />
                            <button
                              onClick={() => { alert(creator.status === 'active' ? `已停用 ${creator.name}` : `已啟用 ${creator.name}`); setActionCreator(null); }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                            >
                              {creator.status === 'active' ? '停用帳號' : '啟用帳號'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted">
                <Award size={32} className="mx-auto mb-3 opacity-30" />
                <p>找不到符合條件的創作者</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
