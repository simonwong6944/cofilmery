import { useState } from 'react';
import { Megaphone, Plus, Eye, DollarSign, TrendingUp, BarChart2, Tag } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { cn } from '@/lib/utils';

const MOCK_BRANDS = [
  { id: 'b1', name: '百佳超級市場', logo: '🛒', category: '零售', placements: 12, budget: 120000, spent: 78400, impressions: 284000, ctr: 3.2, status: 'active' },
  { id: 'b2', name: '鴻福堂', logo: '🌿', category: '食品飲料', placements: 8, budget: 80000, spent: 65200, impressions: 198000, ctr: 4.1, status: 'active' },
  { id: 'b3', name: '大家樂集團', logo: '🍜', category: '餐飲', placements: 6, budget: 60000, spent: 42000, impressions: 156000, ctr: 2.8, status: 'active' },
  { id: 'b4', name: '恒生銀行', logo: '🏦', category: '金融', placements: 4, budget: 200000, spent: 89000, impressions: 412000, ctr: 1.9, status: 'pending' },
  { id: 'b5', name: '澳門博彩', logo: '🎲', category: '娛樂', placements: 0, budget: 0, spent: 0, impressions: 0, ctr: 0, status: 'rejected' },
];

const MOCK_PLACEMENTS = [
  { id: 'p1', brand: '百佳超級市場', work: '街市情緣 第五集', type: '片頭廣告', duration: 15, startDate: '2026-08-01', endDate: '2026-08-31', status: 'active' },
  { id: 'p2', brand: '鴻福堂', work: '涼茶世家 第三集', type: '植入廣告', duration: 30, startDate: '2026-07-15', endDate: '2026-09-15', status: 'active' },
  { id: 'p3', brand: '大家樂集團', work: '獅子山下 第八集', type: '片尾廣告', duration: 10, startDate: '2026-08-10', endDate: '2026-09-10', status: 'active' },
  { id: 'p4', brand: '恒生銀行', work: '陳伯的街市歲月', type: '贊助字卡', duration: 5, startDate: '2026-09-01', endDate: '2026-12-31', status: 'pending' },
];

const STATUS_COLOR = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  paused: 'bg-gray-100 text-gray-600',
};
const STATUS_LABEL = { active: '投放中', pending: '審核中', rejected: '已拒絕', paused: '暫停' };

export default function BrandAds() {
  const [tab, setTab] = useState<'brands' | 'placements'>('brands');
  const [showAdd, setShowAdd] = useState(false);

  const totalRevenue = MOCK_BRANDS.reduce((s, b) => s + b.spent, 0);
  const totalImpressions = MOCK_BRANDS.reduce((s, b) => s + b.impressions, 0);

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-3 shrink-0">
          <Megaphone className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-primary">品牌廣告管理</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="ml-auto btn-primary flex items-center gap-2 py-1.5 text-sm"
          >
            <Plus size={14} />
            新增品牌
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: '合作品牌', value: MOCK_BRANDS.filter(b => b.status === 'active').length, sub: '投放中', color: 'text-primary', icon: Tag },
              { label: '本月廣告收入', value: `HK$${(totalRevenue / 1000).toFixed(0)}K`, sub: '廣告費用', color: 'text-green-600', icon: DollarSign },
              { label: '總曝光次數', value: `${(totalImpressions / 10000).toFixed(1)}萬`, sub: '本月', color: 'text-blue-600', icon: Eye },
              { label: '廣告位數量', value: MOCK_PLACEMENTS.length, sub: '全部', color: 'text-accent', icon: BarChart2 },
            ].map(s => (
              <div key={s.label} className="card-base p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">{s.label}</span>
                  <s.icon size={16} className={s.color} />
                </div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            {[{ id: 'brands', label: '品牌一覽' }, { id: 'placements', label: '廣告位管理' }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  tab === t.id ? 'bg-primary text-white' : 'bg-card text-ink hover:bg-line border border-line'
                )}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'brands' && (
            <div className="card-base overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-bg-soft border-b border-line">
                  <tr>
                    <th className="text-left px-4 py-3 text-muted font-medium">品牌</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">類別</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">廣告位</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">預算 (HK$)</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">已消耗</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">曝光</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">點擊率</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">狀態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {MOCK_BRANDS.map(brand => (
                    <tr key={brand.id} className="hover:bg-bg-soft">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{brand.logo}</span>
                          <span className="font-medium text-ink">{brand.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{brand.category}</td>
                      <td className="px-4 py-3 text-right">{brand.placements}</td>
                      <td className="px-4 py-3 text-right">{brand.budget > 0 ? brand.budget.toLocaleString() : '—'}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">
                        {brand.spent > 0 ? brand.spent.toLocaleString() : '—'}
                        {brand.budget > 0 && <div className="text-xs text-muted">{((brand.spent / brand.budget) * 100).toFixed(0)}%</div>}
                      </td>
                      <td className="px-4 py-3 text-right">{brand.impressions > 0 ? brand.impressions.toLocaleString() : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        {brand.ctr > 0 ? (
                          <span className={cn('flex items-center justify-end gap-1', brand.ctr >= 3 ? 'text-green-600' : 'text-ink')}>
                            <TrendingUp size={12} />
                            {brand.ctr}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                          STATUS_COLOR[brand.status as keyof typeof STATUS_COLOR]
                        )}>
                          {STATUS_LABEL[brand.status as keyof typeof STATUS_LABEL]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'placements' && (
            <div className="card-base overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-bg-soft border-b border-line">
                  <tr>
                    <th className="text-left px-4 py-3 text-muted font-medium">品牌</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">投放作品</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">廣告類型</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">時長 (秒)</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">投放期間</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">狀態</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {MOCK_PLACEMENTS.map(p => (
                    <tr key={p.id} className="hover:bg-bg-soft">
                      <td className="px-4 py-3 font-medium text-ink">{p.brand}</td>
                      <td className="px-4 py-3 text-muted">{p.work}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{p.type}</span>
                      </td>
                      <td className="px-4 py-3 text-right">{p.duration}s</td>
                      <td className="px-4 py-3 text-xs text-muted">{p.startDate} ~ {p.endDate}</td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                          STATUS_COLOR[p.status as keyof typeof STATUS_COLOR]
                        )}>
                          {STATUS_LABEL[p.status as keyof typeof STATUS_LABEL]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => alert('廣告位詳情')} className="text-xs text-primary hover:underline">詳情</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Add Brand Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-ink mb-4">新增合作品牌</h3>
            <div className="space-y-3">
              <div><label className="text-xs text-muted mb-1 block">品牌名稱</label>
                <input type="text" placeholder="品牌名稱" className="form-input w-full" /></div>
              <div><label className="text-xs text-muted mb-1 block">類別</label>
                <input type="text" placeholder="食品飲料 / 零售 / 金融…" className="form-input w-full" /></div>
              <div><label className="text-xs text-muted mb-1 block">廣告預算 (HK$)</label>
                <input type="number" placeholder="0" className="form-input w-full" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg border border-line text-ink hover:bg-bg-soft">取消</button>
              <button onClick={() => { alert('品牌已新增，待審核'); setShowAdd(false); }} className="flex-1 btn-primary py-2">提交</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
