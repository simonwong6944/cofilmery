import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { AIAssistantPanel } from '@/components/shared/AIAssistantPanel';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { KPIStatCard } from '@/components/shared/KPIStatCard';
import { TierBadge } from '@/components/shared/TierBadge';
import { MOCK_CURRENT_CREATOR } from '@/lib/mockData';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';
import { Coins, Eye, TrendingUp, Leaf, MoreHorizontal, Film, Plus, Loader2, AlertCircle } from 'lucide-react';

// ── D1 row shape ──────────────────────────────────────────────────
interface ProjectRow {
  id: string;
  title: string;
  mode: string;
  status: string;
  description: string | null;
  episode_count: number;
  completed_episodes: number;
  total_views: number;
  thumbnail_url: string | null;
  updated_at: string;
}

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { loadProject, startNewProject, setProjectId } = useProjectStore();
  const { locale } = useLocaleStore();
  const tr = t();
  const creator = MOCK_CURRENT_CREATOR;

  // suppress unused warning — locale subscribed for re-render
  void locale;

  // ── State ────────────────────────────────────────────────────────
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading]   = useState(true);

  const creatorId = user?.id ?? 'demo-user';

  // ── Fetch projects ───────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/projects?creator_id=${encodeURIComponent(creatorId)}`);
      const data = await res.json() as { ok: boolean; projects?: ProjectRow[]; error?: string };
      if (data.ok && data.projects) {
        setProjects(data.projects);
      }
    } catch {
      // silent on dashboard — works page has explicit error UI
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // ── Continue project ─────────────────────────────────────────────
  const handleContinue = (proj: ProjectRow) => {
    loadProject({ id: proj.id, title: proj.title, mode: proj.mode });
    navigate('/creator/drama');
  };

  // ── New project (quick-create without dialog — goes to hub) ─────
  const handleNewWork = () => {
    navigate('/creator/works');
  };

  // ── Derived stats from real projects ─────────────────────────────
  const inProgressCount = projects.filter(p => p.status === 'draft' || p.status === 'reviewing').length;

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
            {/* Stats — inProgress from real data; others keep mock */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <KPIStatCard
                label={tr.creator.stats.inProgress}
                value={loading ? '…' : String(inProgressCount)}
                unit="個"
                trend="+3%"
                icon={<TrendingUp size={20}/>}
              />
              <KPIStatCard label={tr.creator.stats.monthlyRevenue} value={`HK$${creator.stats.monthlyRevenue.toLocaleString()}`} trend="+8%" icon={<Coins size={20}/>} />
              <KPIStatCard label={tr.creator.stats.views} value={creator.stats.views.toLocaleString()} trend="+12%" icon={<Eye size={20}/>} />
              <KPIStatCard label={tr.creator.stats.esgScore} value={`${creator.esgScore}/${creator.esgScoreMax}`} trend="+5%" icon={<Leaf size={20}/>} />
            </div>

            {/* Project Cards */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-primary text-lg">{tr.creator.myWorks}</h2>
              <button
                onClick={handleNewWork}
                className="flex items-center gap-1 bg-accent text-white text-sm px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
              >
                <Plus size={14} />
                {tr.creator.addWork}
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center gap-2 py-10 justify-center text-muted">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{tr.creator.hub.loading}</span>
              </div>
            )}

            {/* Empty */}
            {!loading && projects.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-14 text-muted">
                <Film className="w-10 h-10 opacity-30" />
                <p className="text-sm">{tr.creator.works.noWorks}</p>
                <button
                  onClick={handleNewWork}
                  className="text-sm text-primary hover:underline"
                >
                  {tr.creator.works.createFirst}
                </button>
              </div>
            )}

            {/* Real project grid */}
            {!loading && projects.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {projects.slice(0, 8).map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleContinue(project)}
                    className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow group text-left"
                  >
                    <div className="relative">
                      {project.thumbnail_url ? (
                        <img
                          src={project.thumbnail_url}
                          alt={project.title}
                          className="w-full h-28 object-cover"
                        />
                      ) : (
                        <div className="w-full h-28 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                          <Film className="w-8 h-8 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <ModeBadge mode={project.mode as 'drama' | 'legacy'} size="sm" />
                      </div>
                      <div className="absolute top-2 right-2">
                        <StatusBadge status={project.status as 'draft' | 'reviewing' | 'published' | 'revision' | 'approved'} />
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h3 className="text-sm font-semibold text-ink line-clamp-1 group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <MoreHorizontal size={14} className="text-muted shrink-0" />
                      </div>
                      <p className="text-xs text-muted">{user?.name ?? ''}</p>
                      {project.mode === 'drama' && project.episode_count > 0 && (
                        <div className="mt-1.5 h-1.5 bg-line rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full"
                            style={{ width: `${Math.round((project.completed_episodes / project.episode_count) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
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
