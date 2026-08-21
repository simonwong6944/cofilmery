import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Eye, Film, DollarSign, Calendar, Download } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const MONTHLY_VIEWS = [
  { month: '3月', drama: 85000, legacy: 24000 },
  { month: '4月', drama: 102000, legacy: 31000 },
  { month: '5月', drama: 118000, legacy: 38000 },
  { month: '6月', drama: 143000, legacy: 42000 },
  { month: '7月', drama: 168000, legacy: 51000 },
  { month: '8月', drama: 210000, legacy: 75000 },
];

const CREATOR_GROWTH = [
  { month: '3月', trainee: 180, certified: 120, senior: 28, contracted: 7 },
  { month: '4月', trainee: 195, certified: 135, senior: 33, contracted: 9 },
  { month: '5月', trainee: 210, certified: 151, senior: 38, contracted: 10 },
  { month: '6月', trainee: 225, certified: 163, senior: 40, contracted: 11 },
  { month: '7月', trainee: 238, certified: 176, senior: 42, contracted: 12 },
  { month: '8月', trainee: 245, certified: 187, senior: 43, contracted: 12 },
];

const REVENUE_DATA = [
  { month: '3月', subscriptions: 180000, brands: 62000, enterprise: 120000 },
  { month: '4月', subscriptions: 210000, brands: 78000, enterprise: 140000 },
  { month: '5月', subscriptions: 245000, brands: 95000, enterprise: 180000 },
  { month: '6月', subscriptions: 278000, brands: 112000, enterprise: 200000 },
  { month: '7月', subscriptions: 312000, brands: 138000, enterprise: 230000 },
  { month: '8月', subscriptions: 356000, brands: 165000, enterprise: 280000 },
];

const CONTENT_MIX = [
  { name: '都市短劇', value: 54, color: '#1f3a5f' },
  { name: '傳承記錄', value: 31, color: '#c8912f' },
  { name: '企業傳承', value: 15, color: '#6b7280' },
];

const TOP_WORKS = [
  { title: '獅子山下', mode: 'drama', views: 32100, esgScore: 9.0, creator: '王小龍' },
  { title: '街市情緣', mode: 'drama', views: 12500, esgScore: 8.5, creator: '李美華' },
  { title: '涼茶世家', mode: 'drama', views: 8200, esgScore: 9.2, creator: '陳志明' },
  { title: '陳伯的街市歲月', mode: 'legacy', views: 4500, esgScore: 9.5, creator: '李美華' },
  { title: '中藥世家三代傳', mode: 'legacy', views: 2100, esgScore: 8.8, creator: '陳志明' },
];

const PERIODS = [
  { id: '7d', label: '最近7天' },
  { id: '30d', label: '最近30天' },
  { id: '6m', label: '最近6個月' },
  { id: '1y', label: '今年' },
];

export default function Analytics() {
  const [period, setPeriod] = useState('6m');

  const currentMonth = MONTHLY_VIEWS[MONTHLY_VIEWS.length - 1];
  const prevMonth = MONTHLY_VIEWS[MONTHLY_VIEWS.length - 2];
  const viewGrowth = (((currentMonth.drama + currentMonth.legacy) / (prevMonth.drama + prevMonth.legacy)) - 1) * 100;

  const currentRevenue = REVENUE_DATA[REVENUE_DATA.length - 1];
  const totalRevenue = currentRevenue.subscriptions + currentRevenue.brands + currentRevenue.enterprise;
  const prevRevenue = REVENUE_DATA[REVENUE_DATA.length - 2];
  const prevTotalRevenue = prevRevenue.subscriptions + prevRevenue.brands + prevRevenue.enterprise;
  const revenueGrowth = ((totalRevenue / prevTotalRevenue) - 1) * 100;

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-3 shrink-0">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-primary">分析報表</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex bg-bg-soft rounded-lg p-1 border border-line">
              {PERIODS.map(p => (
                <button key={p.id} onClick={() => setPeriod(p.id)}
                  className={cn('px-3 py-1 rounded text-xs font-medium transition-colors',
                    period === p.id ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-ink'
                  )}>
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => alert('報表匯出功能開發中')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-line rounded-lg bg-card hover:bg-bg-soft text-ink"
            >
              <Download size={14} />
              匯出
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              {
                label: '本月總觀看', value: `${((currentMonth.drama + currentMonth.legacy) / 10000).toFixed(1)}萬`,
                growth: viewGrowth, icon: Eye, color: 'text-blue-600',
              },
              {
                label: '本月收入', value: `HK$${(totalRevenue / 10000).toFixed(0)}萬`,
                growth: revenueGrowth, icon: DollarSign, color: 'text-green-600',
              },
              {
                label: '活躍創作者', value: '1,247',
                growth: 5.8, icon: Users, color: 'text-primary',
              },
              {
                label: '新上線作品', value: '38',
                growth: 12.3, icon: Film, color: 'text-accent',
              },
            ].map(kpi => (
              <div key={kpi.label} className="card-base p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">{kpi.label}</span>
                  <kpi.icon size={16} className={kpi.color} />
                </div>
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                <div className={cn('text-xs mt-1 flex items-center gap-1',
                  kpi.growth >= 0 ? 'text-green-600' : 'text-red-500'
                )}>
                  <TrendingUp size={11} />
                  {kpi.growth >= 0 ? '+' : ''}{kpi.growth.toFixed(1)}% 較上月
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5 mb-5">
            {/* Views Chart */}
            <div className="col-span-2 card-base p-5">
              <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                <Eye size={14} className="text-primary" />
                每月觀看次數
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MONTHLY_VIEWS} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 10000).toFixed(0)}萬`} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                  <Legend />
                  <Bar dataKey="drama" name="都市短劇" fill="#1f3a5f" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="legacy" name="傳承記錄" fill="#c8912f" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Content Mix */}
            <div className="card-base p-5">
              <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                <Film size={14} className="text-primary" />
                內容類型分佈
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={CONTENT_MIX} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                    {CONTENT_MIX.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {CONTENT_MIX.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted">{item.name}</span>
                    </div>
                    <span className="font-medium text-ink">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-5">
            {/* Revenue Chart */}
            <div className="card-base p-5">
              <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                <DollarSign size={14} className="text-primary" />
                每月收入分佈 (HK$)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={REVENUE_DATA} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 10000).toFixed(0)}萬`} />
                  <Tooltip formatter={(v: number) => `HK$${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="subscriptions" name="訂閱" fill="#1f3a5f" stackId="a" />
                  <Bar dataKey="brands" name="品牌廣告" fill="#c8912f" stackId="a" />
                  <Bar dataKey="enterprise" name="企業合作" fill="#6b7280" stackId="a" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Creator Growth */}
            <div className="card-base p-5">
              <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                <Users size={14} className="text-primary" />
                創作者增長
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={CREATOR_GROWTH}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="certified" name="認證" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="senior" name="資深" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="contracted" name="簽約" stroke="#c8912f" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Works */}
          <div className="card-base p-5">
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <Film size={14} className="text-primary" />
              本月熱門作品
            </h3>
            <table className="w-full text-sm">
              <thead className="bg-bg-soft">
                <tr>
                  <th className="text-left px-3 py-2 text-muted font-medium rounded-l-lg">作品</th>
                  <th className="text-left px-3 py-2 text-muted font-medium">類型</th>
                  <th className="text-left px-3 py-2 text-muted font-medium">創作者</th>
                  <th className="text-right px-3 py-2 text-muted font-medium">觀看次數</th>
                  <th className="text-right px-3 py-2 text-muted font-medium rounded-r-lg">ESG 分</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {TOP_WORKS.map((work, i) => (
                  <tr key={work.title} className="hover:bg-bg-soft">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                          i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-bg-soft text-muted'
                        )}>
                          {i + 1}
                        </span>
                        <span className="font-medium text-ink">{work.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                        work.mode === 'drama' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                      )}>
                        {work.mode === 'drama' ? '都市短劇' : '傳承記錄'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted">{work.creator}</td>
                    <td className="px-3 py-3 text-right font-medium text-ink">{work.views.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right">
                      <span className={cn('font-bold', work.esgScore >= 9 ? 'text-green-600' : 'text-primary')}>
                        {work.esgScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
