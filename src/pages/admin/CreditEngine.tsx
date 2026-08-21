import { useState } from 'react';
import { Coins, TrendingUp, TrendingDown, Users, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { cn } from '@/lib/utils';
import { CREDIT } from '@/credit-config';

const MOCK_CREDIT_FLOWS = [
  { id: 'cf1', user: '李美華', type: 'earn', description: '街市情緣 第五集 觀看分紅', amount: 580, date: '2026-08-21 14:30' },
  { id: 'cf2', user: '陳志明', type: 'spend', description: 'AI 劇本生成 (GPT-4o)', amount: -120, date: '2026-08-21 13:45' },
  { id: 'cf3', user: '王小龍', type: 'earn', description: '獅子山下 第八集 觀看分紅', amount: 1240, date: '2026-08-21 12:00' },
  { id: 'cf4', user: '黃小明', type: 'spend', description: 'AI 畫面生成 (Seedance)', amount: -200, date: '2026-08-21 11:15' },
  { id: 'cf5', user: '吳美玲', type: 'spend', description: '粵語配音生成 (TTS)', amount: -80, date: '2026-08-21 10:30' },
  { id: 'cf6', user: '李美華', type: 'refund', description: '系統錯誤補償', amount: 50, date: '2026-08-21 09:00' },
  { id: 'cf7', user: '劉德華', type: 'earn', description: '月度頂尖創作者獎勵', amount: 5000, date: '2026-08-20 18:00' },
  { id: 'cf8', user: '鄭家富', type: 'spend', description: '分鏡板 AI 生成', amount: -160, date: '2026-08-20 16:30' },
];

const MOCK_TOP_EARNERS = [
  { name: '劉德華', tier: 'contracted', earned: 28500, spent: 3200, net: 25300 },
  { name: '王小龍', tier: 'certified', earned: 12800, spent: 1800, net: 11000 },
  { name: '陳志明', tier: 'senior', earned: 9600, spent: 2400, net: 7200 },
  { name: '李美華', tier: 'certified', earned: 7200, spent: 1600, net: 5600 },
  { name: '吳美玲', tier: 'certified', earned: 5400, spent: 1200, net: 4200 },
];

const MOCK_TOP_SPENDERS = [
  { name: '黃小明', tier: 'trainee', spent: 4800, main_use: 'AI 畫面生成' },
  { name: '陳志明', tier: 'senior', spent: 2400, main_use: 'AI 劇本生成' },
  { name: '李美華', tier: 'certified', spent: 1600, main_use: '粵語配音' },
  { name: '吳美玲', tier: 'certified', spent: 1200, main_use: 'AI 劇本生成' },
  { name: '劉德華', tier: 'contracted', spent: 3200, main_use: '多項 AI 服務' },
];

type FlowType = 'earn' | 'spend' | 'refund';

const FLOW_CONFIG: Record<FlowType, { label: string; color: string; icon: any }> = {
  earn: { label: '收入', color: 'text-green-600', icon: ArrowUpRight },
  spend: { label: '消耗', color: 'text-red-500', icon: ArrowDownRight },
  refund: { label: '退款', color: 'text-blue-600', icon: ArrowUpRight },
};

export default function CreditEngine() {
  const [tab, setTab] = useState<'flows' | 'earners' | 'spenders'>('flows');

  const totalEarned = MOCK_CREDIT_FLOWS.filter(f => f.amount > 0).reduce((s, f) => s + f.amount, 0);
  const totalSpent = Math.abs(MOCK_CREDIT_FLOWS.filter(f => f.amount < 0).reduce((s, f) => s + f.amount, 0));

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-3 shrink-0">
          <Coins className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-primary">信用額引擎</h1>
          <span className="text-xs text-muted ml-2">1 點 = HK${CREDIT.pointToHKD}</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: '今日發放點數', value: totalEarned.toLocaleString(), sub: `≈ HK$${(totalEarned * CREDIT.pointToHKD).toFixed(0)}`, color: 'text-green-600', icon: TrendingUp },
              { label: '今日消耗點數', value: totalSpent.toLocaleString(), sub: `≈ HK$${(totalSpent * CREDIT.pointToHKD).toFixed(0)}`, color: 'text-red-500', icon: TrendingDown },
              { label: '活躍用戶', value: '1,247', sub: '本月', color: 'text-primary', icon: Users },
              { label: '平台點數存量', value: '2,840,500', sub: '全部用戶', color: 'text-accent', icon: Zap },
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

          {/* AI Service Cost Reference */}
          <div className="card-base p-4 mb-6">
            <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <Zap size={14} className="text-accent" />
              AI 服務點數定價
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {[
                { service: 'AI 劇本生成', cost: CREDIT.aiScript, unit: '次' },
                { service: '粵語配音 TTS', cost: CREDIT.aiVoice, unit: '分鐘' },
                { service: 'AI 畫面生成', cost: CREDIT.aiImage, unit: '張' },
                { service: 'AI 分鏡板', cost: CREDIT.aiStoryboard, unit: '場景' },
                { service: 'AI 剪接', cost: CREDIT.aiEdit, unit: '分鐘' },
              ].map(item => (
                <div key={item.service} className="bg-bg-soft rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-accent">{item.cost}</div>
                  <div className="text-xs text-muted">{item.service}</div>
                  <div className="text-xs text-muted">每{item.unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            {[
              { id: 'flows', label: '流水記錄' },
              { id: 'earners', label: '頂尖收益者' },
              { id: 'spenders', label: '頂尖消費者' },
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

          {tab === 'flows' && (
            <div className="card-base overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-bg-soft border-b border-line">
                  <tr>
                    <th className="text-left px-4 py-3 text-muted font-medium">用戶</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">描述</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">類型</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">點數</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">時間</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {MOCK_CREDIT_FLOWS.map(flow => {
                    const ft = flow.type as FlowType;
                    const cfg = FLOW_CONFIG[ft];
                    const FlowIcon = cfg.icon;
                    return (
                      <tr key={flow.id} className="hover:bg-bg-soft">
                        <td className="px-4 py-3 font-medium text-ink">{flow.user}</td>
                        <td className="px-4 py-3 text-muted">{flow.description}</td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn('font-bold flex items-center justify-end gap-0.5', cfg.color)}>
                            <FlowIcon size={12} />
                            {flow.amount > 0 ? '+' : ''}{flow.amount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted">{flow.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'earners' && (
            <div className="card-base overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-bg-soft border-b border-line">
                  <tr>
                    <th className="text-left px-4 py-3 text-muted font-medium">排名</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">創作者</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">總收入</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">總消耗</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">淨收益</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">折算港幣</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {MOCK_TOP_EARNERS.map((e, i) => (
                    <tr key={e.name} className="hover:bg-bg-soft">
                      <td className="px-4 py-3">
                        <span className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                          i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-bg-soft text-muted'
                        )}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">{e.name}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">+{e.earned.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-red-500">-{e.spent.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-bold text-primary">{e.net.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-accent font-medium">HK${(e.net * CREDIT.pointToHKD).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'spenders' && (
            <div className="card-base overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-bg-soft border-b border-line">
                  <tr>
                    <th className="text-left px-4 py-3 text-muted font-medium">排名</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">創作者</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">總消耗</th>
                    <th className="text-left px-4 py-3 text-muted font-medium">主要用途</th>
                    <th className="text-right px-4 py-3 text-muted font-medium">折算港幣</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {MOCK_TOP_SPENDERS.sort((a, b) => b.spent - a.spent).map((s, i) => (
                    <tr key={s.name} className="hover:bg-bg-soft">
                      <td className="px-4 py-3 text-muted font-medium">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
                      <td className="px-4 py-3 text-right text-red-500 font-medium">-{s.spent.toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted">{s.main_use}</td>
                      <td className="px-4 py-3 text-right text-muted">HK${(s.spent * CREDIT.pointToHKD).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
