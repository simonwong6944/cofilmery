import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { TierBadge } from '@/components/shared/TierBadge';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';
import { CheckCircle } from 'lucide-react';

export default function ESGTier() {
  const { locale } = useLocaleStore();
  const tr = t();

  // suppress unused warning — locale subscribed for re-render
  void locale;

  const tiers = [
    { tier: 'trainee',    label: tr.creator.esgTier.tierLabels.trainee,    points: '0–99',    done: true },
    { tier: 'certified',  label: tr.creator.esgTier.tierLabels.certified,  points: '100–499', done: true },
    { tier: 'senior',     label: tr.creator.esgTier.tierLabels.senior,     points: '500–999', done: false },
    { tier: 'contracted', label: tr.creator.esgTier.tierLabels.contracted, points: '1000+',   done: false },
  ];

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-4 shrink-0">
          <Logo size="sm" withWordmark />
          <span className="text-primary font-bold">{tr.creator.esgTier.pageTitle}</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="card-base p-6 mb-6 text-center border-t-4 border-t-accent">
              <TierBadge tier="certified" />
              <h2 className="text-2xl font-bold text-ink mt-3">{tr.creator.esgTier.tierLabels.certified}</h2>
              <p className="text-muted mt-1">ESG {tr.creator.esgTier.metrics.esg}：320 / 500（{tr.creator.esgTier.tierLabels.senior}）</p>
              <div className="mt-4 max-w-sm mx-auto h-3 bg-line rounded-full">
                <div className="h-3 bg-accent rounded-full" style={{ width: '64%' }} />
              </div>
              <p className="text-xs text-muted mt-2">{tr.creator.esgTier.upgradeNeeded.replace('{{n}}', '180')}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {tiers.map((t_item, i) => (
                <div key={i} className={`card-base p-4 ${t_item.done ? 'border-green-200' : ''}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <TierBadge tier={t_item.tier as any} />
                    {t_item.done && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                  </div>
                  <div className="text-sm text-ink font-medium">{t_item.label}</div>
                  <div className="text-xs text-muted">{t_item.points} ESG {tr.creator.esgTier.metrics.esg}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
