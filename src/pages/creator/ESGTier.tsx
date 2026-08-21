import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { TierBadge } from '@/components/shared/TierBadge';
import { Award, TrendingUp, Star, CheckCircle } from 'lucide-react';

export default function ESGTier() {
  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-4 shrink-0">
          <Logo size="sm" withWordmark />
          <span className="text-primary font-bold">ESG 等級</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="card-base p-6 mb-6 text-center border-t-4 border-t-accent">
              <TierBadge tier="certified" size="lg" />
              <h2 className="text-2xl font-bold text-ink mt-3">認証創作者</h2>
              <p className="text-muted mt-1">ESG 積分：320 / 500（升級至資深創作者）</p>
              <div className="mt-4 max-w-sm mx-auto h-3 bg-line rounded-full">
                <div className="h-3 bg-accent rounded-full" style={{ width: '64%' }} />
              </div>
              <p className="text-xs text-muted mt-2">還需 180 積分升級</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { tier: 'trainee', label: '見習創作者', points: '0–99', done: true },
                { tier: 'certified', label: '認証創作者', points: '100–499', done: true },
                { tier: 'senior', label: '資深創作者', points: '500–999', done: false },
                { tier: 'contracted', label: '簽約創作者', points: '1000+', done: false },
              ].map((t, i) => (
                <div key={i} className={`card-base p-4 ${t.done ? 'border-green-200' : ''}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <TierBadge tier={t.tier as any} />
                    {t.done && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                  </div>
                  <div className="text-sm text-ink font-medium">{t.label}</div>
                  <div className="text-xs text-muted">{t.points} ESG 積分</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
