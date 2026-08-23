import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Film, Search, Filter, Eye, Clock, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useLocaleStore } from '@/store/localeStore';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { t } from '@/i18n';

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
  created_at: string;
  updated_at: string;
}

export default function CreatorWorks() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { loadProject, startNewProject, setProjectId } = useProjectStore();
  const { locale } = useLocaleStore();
  const tr = t();

  // suppress unused warning — locale subscribed for re-render
  void locale;

  // ── State ────────────────────────────────────────────────────────
  const [projects, setProjects]   = useState<ProjectRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch]       = useState('');
  const [deleting, setDeleting]   = useState<string | null>(null);

  // ── Dialog state (新增短劇) ──────────────────────────────────────
  const [showDialog, setShowDialog]   = useState(false);
  const [newTitle, setNewTitle]       = useState('');
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState('');

  const creatorId = user?.id ?? 'demo-user';

  // ── Fetch projects ───────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`/api/projects?creator_id=${encodeURIComponent(creatorId)}`);
      const data = await res.json() as { ok: boolean; projects?: ProjectRow[]; error?: string };
      if (data.ok && data.projects) {
        setProjects(data.projects);
      } else {
        setError(data.error ?? tr.creator.works.noWorks);
      }
    } catch {
      setError(tr.creator.works.noWorks);
    } finally {
      setLoading(false);
    }
  }, [creatorId, tr.creator.works.noWorks]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // ── Continue (loadProject + navigate) ───────────────────────────
  const handleContinue = (proj: ProjectRow) => {
    loadProject({ id: proj.id, title: proj.title, mode: proj.mode });
    navigate('/creator/drama');
  };

  // ── Delete ───────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm(tr.creator.works.delete + '?')) return;
    setDeleting(id);
    try {
      const res  = await fetch(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json() as { ok: boolean; error?: string };
      if (data.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch {
      // silent — user can retry
    } finally {
      setDeleting(null);
    }
  };

  // ── Create new project (dialog) ──────────────────────────────────
  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const res  = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), mode: 'drama', creator_id: creatorId }),
      });
      const data = await res.json() as { ok: boolean; project?: ProjectRow; error?: string };
      if (data.ok && data.project) {
        startNewProject();
        setProjectId(data.project.id, data.project.title);
        setShowDialog(false);
        setNewTitle('');
        navigate('/creator/drama');
      } else {
        setCreateError(data.error ?? tr.creator.hub.errorCreate);
      }
    } catch {
      setCreateError(tr.creator.hub.errorCreate);
    } finally {
      setCreating(false);
    }
  };

  // ── Derived list ─────────────────────────────────────────────────
  const tabs = [
    { id: 'all',        label: tr.creator.works.tabAll },
    { id: 'draft',      label: tr.creator.works.tabDraft },
    { id: 'reviewing',  label: tr.creator.works.tabReviewing },
    { id: 'published',  label: tr.creator.works.tabPublished },
    { id: 'revision',   label: tr.creator.works.tabRevision },
  ];

  const filtered = projects.filter(p => {
    if (activeTab !== 'all' && p.status !== activeTab) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Logo size="sm" withWordmark />
            <span className="text-primary font-bold text-lg">{tr.creator.works.title}</span>
          </div>
          <button
            onClick={() => { setShowDialog(true); setCreateError(''); setNewTitle(''); }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            {tr.creator.works.addWork}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Search + Filter */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                className="form-input pl-9 py-2"
                placeholder={tr.creator.works.searchPlaceholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 border border-line px-3 py-2 rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors">
              <Filter className="w-4 h-4" />
              {tr.creator.works.filterBtn}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-card rounded-lg p-1 border border-line w-fit">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-primary text-white' : 'text-muted hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-20 text-muted">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{tr.creator.hub.loading}</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-center justify-center gap-2 py-20 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20 text-muted">
              <Film className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>{tr.creator.works.noWorks}</p>
              <button
                onClick={() => { setShowDialog(true); setCreateError(''); setNewTitle(''); }}
                className="mt-4 inline-block text-primary hover:underline text-sm"
              >
                {tr.creator.works.createFirst}
              </button>
            </div>
          )}

          {/* Works Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(project => (
                <div key={project.id} className="card-base overflow-hidden hover:shadow-md transition-shadow">
                  {/* Thumbnail */}
                  <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 relative flex items-center justify-center">
                    {project.thumbnail_url ? (
                      <img src={project.thumbnail_url} alt={project.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <Film className="w-10 h-10 text-primary/30" />
                    )}
                    <div className="absolute top-3 left-3">
                      <ModeBadge mode={project.mode as 'drama' | 'legacy'} />
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={project.status as 'draft' | 'reviewing' | 'published' | 'revision' | 'approved'} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-ink mb-1 line-clamp-1">{project.title}</h3>
                    <p className="text-muted text-sm mb-3 line-clamp-2">
                      {project.description ?? ''}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {(project.total_views ?? 0).toLocaleString()} {tr.creator.works.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {project.episode_count ?? 0} {tr.creator.works.episodes}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-line flex gap-2">
                      <button
                        onClick={() => handleContinue(project)}
                        className="flex-1 text-center text-sm text-primary hover:underline font-medium"
                      >
                        {tr.creator.works.continueEdit}
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={deleting === project.id}
                        className="flex items-center gap-1 text-sm text-muted hover:text-red-500 transition-colors disabled:opacity-40"
                      >
                        {deleting === project.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                        {tr.creator.works.delete}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── 建立新短劇 Dialog ──────────────────────────────────────── */}
      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDialog(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{tr.creator.hub.dialogTitle}</h3>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tr.creator.hub.dialogLabel}
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !creating) handleCreate(); }}
              placeholder={tr.creator.hub.dialogPlaceholder}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
              autoFocus
              maxLength={100}
            />

            {createError && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {createError}
              </p>
            )}

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowDialog(false)}
                disabled={creating}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                {tr.creator.hub.dialogCancel}
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim() || creating}
                className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {tr.creator.hub.creating}
                  </>
                ) : (
                  tr.creator.hub.dialogConfirm
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
