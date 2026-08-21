import { Building2, Coins, Film, TrendingUp, Award } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { KPIStatCard } from '@/components/shared/KPIStatCard';
import { PublicNav } from '@/components/layout/PublicNav';

export default function SponsorDashboard() {
  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-ink mb-2">企業贊助方儀表板</h1>
        <p className="text-muted mb-8">管理您的 ESG 贊助項目及傳承影片</p>
        <div className="grid grid-cols-4 gap-4 mb-8">
          <KPIStatCard label="贊助項目" value="3" unit="個" trend="" icon={<Building2 className="w-5 h-5"/>} />
          <KPIStatCard label="累計投入" value="HK$45,000" unit="" trend="+15%" icon={<Coins className="w-5 h-5"/>} />
          <KPIStatCard label="傳承影片" value="12" unit="部" trend="+3" icon={<Film className="w-5 h-5"/>} />
          <KPIStatCard label="ESG 積分" value="580" unit="點" trend="+80" icon={<Award className="w-5 h-5"/>} />
        </div>
        <div className="card-base p-6">
          <h2 className="font-bold text-ink mb-4">贊助項目列表</h2>
          <div className="space-y-3">
            {['陳伯的街市歲月（傳承系列）','海邊老友記（傳承系列）','中藥世家三代傳（企業傳承）'].map((p,i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-bg-soft rounded-lg">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><Film className="w-5 h-5 text-accent"/></div>
                <div className="flex-1"><p className="font-medium text-ink">{p}</p><p className="text-xs text-muted">進行中 · 已發佈 {i+2} 集</p></div>
                <span className="text-sm font-bold text-green-600">+{(i+1)*40} ESG積分</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
