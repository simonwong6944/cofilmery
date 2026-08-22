import { Link } from 'react-router-dom';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { AIAssistantPanel } from '@/components/shared/AIAssistantPanel';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { KPIStatCard } from '@/components/shared/KPIStatCard';
import { TierBadge } from '@/components/shared/TierBadge';
import { MOCK_ALL_SERIES, MOCK_CURRENT_CREATOR } from '@/lib/mockData';
import { useAuthStore } from '@/store/authStore';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';
import { Coins, Eye, TrendingUp, Leaf, MoreHorizontal } from 'lucide-react';

export default function CreatorDashboard() {
  const { user } = useAuthStore();
  const { locale } = useLocaleStore();
  const tr = t();
  const creator = MOCK_CURRENT_CREATOR;

  // suppress unused warning — locale subscribed for re-render
  void locale;

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Logo size="sm" withWordmark />
            <span className="text-lg font-bold text-primary">{tr.creator.dashboard}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-bg-soft px-3 py-1.5 rounded-lg">
              <Coins size={16} className="text-accent" />
              <span className="text-sm font-semibold text-ink">{tr.creator.credits} {creator.credits.toLocaleString()}</span>
            </div>
            <TierBadge tier="certified" />
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {(user?.name ?? tr.creator.dashboard[0])[0]}
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <KPIStatCard label={tr.creator.stats.inProgress} value={creator.stats.inProgress} unit="個" trend="+3%" icon={<TrendingUp size={20}/>} />
              <KPIStatCard label={tr.creator.stats.monthlyRevenue} value={`HK$${creator.stats.monthlyRevenue.toLocaleString()}`} trend="+8%" icon={<Coins size={20}/>} />
              <KPIStatCard label={tr.creator.stats.views} value={creator.stats.views.toLocaleString()} trend="+12%" icon={<Eye size={20}/>} />
              <KPIStatCard label={tr.creator.stats.esgScore} value={`${creator.esgScore}/${creator.esgScoreMax}`} trend="+5%" icon={<Leaf size={20}/>} />
            </div>

            {/* Project Cards */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-primary text-lg">{tr.creator.myWorks}</h2>
              <Link to="/creator/new" className="bg-accent text-white text-sm px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors">{tr.creator.addWork}</Link>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {MOCK_ALL_SERIES.map(project => (
                <Link key={project.id} to={`/creator/drama/0`} className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow group">
                  <div className="relative">
                    <img src={project.thumbnail} alt={project.title} className="w-full h-28 object-cover" />
                    <div className="absolute top-2 left-2"><ModeBadge mode={project.mode} size="sm" /></div>
                    <div className="absolute top-2 right-2"><StatusBadge status={project.status} /></div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="text-sm font-semibold text-ink line-clamp-1">{project.title}</h3>
                      <MoreHorizontal size={14} className="text-muted shrink-0" />
                    </div>
                    <p className="text-xs text-muted">{project.creator.name}</p>
                    {project.mode==='drama' && (
                      <div className="mt-1.5 h-1.5 bg-line rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{width:`${(project.completedEpisodes/project.episodes)*100}%`}} />
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </main>

          {/* AI Assistant */}
          <aside className="w-80 shrink-0 overflow-hidden">
            <AIAssistantPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
