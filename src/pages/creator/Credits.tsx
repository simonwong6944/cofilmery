import { useState } from 'react';
import { Coins, TrendingUp, TrendingDown, Plus, CreditCard, Gift, Star } from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';
import { creditToHKD, PRICING_TIERS, CREDIT } from '@/credit-config';

const TRANSACTIONS = [
  { id: 1, type: 'earn', desc: '作品「街市情緣 E1」發佈獎勵', amount: 50, date: '2025-01-15', balance: 340 },
  { id: 2, type: 'spend', desc: 'AI 劇本生成 × 3 次', amount: -15, date: '2025-01-14', balance: 290 },
  { id: 3, type: 'earn', desc: '月度優質創作者獎勵', amount: 100, date: '2025-01-01', balance: 305 },
  { id: 4, type: 'spend', desc: 'AI 畫面生成 × 5 格', amount: -25, date: '2025-01-10', balance: 205 },
  { id: 5, type: 'spend', desc: 'AI 配音生成 × 2 段', amount: -12, date: '2025-01-08', balance: 230 },
  { id: 6, type: 'earn', desc: '訂閱升級至認証創作者', amount: 200, date: '2024-12-20', balance: 242 },
  { id: 7, type: 'earn', desc: '作品「涼茶世家 E2」觀看量達標', amount: 30, date: '2024-12-15', balance: 42 },
];

export default function Credits() {
  const [tab, setTab] = useState<'overview' | 'history' | 'buy'>('overview');
  const { locale } = useLocaleStore();
  const tr = t();
  const currentBalance = 340;
  const practiceBalance = 50;

  // suppress unused warning — locale subscribed for re-render
  void locale;

  const TABS = [
    { id: 'overview', label: tr.creator.creditsMgmt.tabOverview },
    { id: 'history',  label: tr.creator.creditsMgmt.tabHistory },
    { id: 'buy',      label: tr.creator.creditsMgmt.tabBuy },
  ];

  const USAGE_ITEMS = [
    { label: tr.creator.creditsMgmt.aiScript, used: 45, color: 'bg-primary' },
    { label: tr.creator.creditsMgmt.aiImage,  used: 35, color: 'bg-accent' },
    { label: tr.creator.creditsMgmt.aiVoice,  used: 15, color: 'bg-blue-400' },
    { label: tr.creator.creditsMgmt.other,    used: 5,  color: 'bg-gray-300' },
  ];

  const EARN_ITEMS = [
    { action: tr.creator.creditsMgmt.earnPublish,  reward: '+50 積分/集' },
    { action: tr.creator.creditsMgmt.earnViews,    reward: '+30 積分' },
    { action: tr.creator.creditsMgmt.earnMonthly,  reward: '+100 積分' },
    { action: tr.creator.creditsMgmt.earnInvite,   reward: '+20 積分/人' },
    { action: tr.creator.creditsMgmt.earnCourse,   reward: '+10 積分' },
  ];

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold">{tr.creator.creditsMgmt.title}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card-base p-5 col-span-1 border-t-4 border-t-accent">
              <div className="flex items-center gap-2 mb-3">
                <Coins className="w-5 h-5 text-accent" />
                <span className="text-muted text-sm">{tr.creator.creditsMgmt.productionBalance}</span>
              </div>
              <div className="text-3xl font-bold text-ink">{currentBalance}</div>
              <div className="text-muted text-sm mt-1">≈ HK${creditToHKD(currentBalance)}</div>
              <p className="text-xs text-muted mt-2">1 積分 = HK${CREDIT.pointToHKD}</p>
            </div>
            <div className="card-base p-5 col-span-1 border-t-4 border-t-blue-400">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-blue-400" />
                <span className="text-muted text-sm">{tr.creator.creditsMgmt.practiceBalance}</span>
              </div>
              <div className="text-3xl font-bold text-ink">{practiceBalance}</div>
              <div className="text-xs text-muted mt-2">{tr.creator.creditsMgmt.practiceNote}</div>
            </div>
            <div className="card-base p-5 col-span-1 border-t-4 border-t-green-400">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-green-500" />
                <span className="text-muted text-sm">{tr.creator.creditsMgmt.monthlyEarned}</span>
              </div>
              <div className="text-3xl font-bold text-ink">180</div>
              <div className="text-xs text-muted mt-2">{tr.creator.creditsMgmt.earningNote}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-card rounded-lg p-1 border border-line w-fit">
            {TABS.map(tabItem => (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id as any)}
                className={`px-5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === tabItem.id ? 'bg-primary text-white' : 'text-muted hover:text-ink'
                }`}
              >
                {tabItem.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {tab === 'overview' && (
            <div className="grid grid-cols-2 gap-5">
              <div className="card-base p-5">
                <h3 className="font-bold text-ink mb-4">{tr.creator.creditsMgmt.usageTitle}</h3>
                <div className="space-y-3">
                  {USAGE_ITEMS.map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted">{item.label}</span>
                        <span className="font-medium text-ink">{item.used}%</span>
                      </div>
                      <div className="h-2 bg-line rounded-full">
                        <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.used}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-base p-5">
                <h3 className="font-bold text-ink mb-4">{tr.creator.creditsMgmt.earnTitle}</h3>
                <div className="space-y-3">
                  {EARN_ITEMS.map(item => (
                    <div key={item.action} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                      <span className="text-sm text-ink">{item.action}</span>
                      <span className="text-sm font-bold text-green-600">{item.reward}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div className="card-base overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-bg-soft border-b border-line">
                  <tr>
                    <th className="text-left px-5 py-3 text-muted font-medium">{tr.creator.creditsMgmt.historyDesc}</th>
                    <th className="text-left px-5 py-3 text-muted font-medium">{tr.creator.creditsMgmt.historyDate}</th>
                    <th className="text-right px-5 py-3 text-muted font-medium">{tr.creator.creditsMgmt.historyChange}</th>
                    <th className="text-right px-5 py-3 text-muted font-medium">{tr.creator.creditsMgmt.historyBalance}</th>
                  </tr>
                </thead>
                <tbody>
                  {TRANSACTIONS.map(tx => (
                    <tr key={tx.id} className="border-b border-line last:border-0 hover:bg-bg-soft">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {tx.type === 'earn' ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          {tx.desc}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted">{tx.date}</td>
                      <td className={`px-5 py-3 text-right font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </td>
                      <td className="px-5 py-3 text-right text-ink">{tx.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'buy' && (
            <div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {PRICING_TIERS.map((tier, i) => (
                  <div
                    key={i}
                    className={`card-base p-5 text-center hover:shadow-md transition-shadow ${
                      i === 1 ? 'border-2 border-accent relative' : ''
                    }`}
                  >
                    {i === 1 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs px-3 py-1 rounded-full">
                        {tr.creator.creditsMgmt.buyMostPopular}
                      </div>
                    )}
                    <div className="text-2xl font-bold text-ink mb-1">{tier.nameKey.split('.').pop()?.toUpperCase() ?? tier.id}</div>
                    <div className="text-3xl font-bold text-primary mb-1">
                      {tier.priceHKD != null ? `HK$${tier.priceHKD}` : '自訂'}
                    </div>
                    <div className="text-muted text-sm mb-3">{tier.productionCredits < 0 ? '無限' : tier.productionCredits} 積分</div>
                    {tier.practiceCredits > 0 && (
                      <div className="text-xs text-green-600 mb-3">+{tier.practiceCredits} 練習積分</div>
                    )}
                    <button className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                      i === 1 ? 'bg-accent text-white hover:bg-accent/90' : 'border border-primary text-primary hover:bg-primary hover:text-white'
                    }`}>
                      <CreditCard className="w-3.5 h-3.5 inline mr-1.5" />
                      {tr.creator.creditsMgmt.buyNow}
                    </button>
                  </div>
                ))}
              </div>
              <div className="card-base p-4 border-l-4 border-l-primary text-sm text-muted">
                <strong className="text-ink">{tr.creator.credits}：</strong>
                {tr.creator.creditsMgmt.creditNote}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
