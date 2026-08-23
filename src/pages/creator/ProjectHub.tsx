/**
 * ProjectHub — 項目選擇入口
 * 路由: /creator/projects
 * 功能:
 *   1. 建立新短劇（dialog → POST /api/projects → startNewProject + navigate）
 *   2. 繼續已有項目（GET /api/projects?creator_id=<id> → loadProject + navigate）
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Film, Clock, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/i18n';

// ── 類型 ─────────────────────────────────────────────────────────
interface ProjectRow {
  id: string;
  title: string;
  mode: string;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// ── 狀態標籤顏色 ──────────────────────────────────────────────────
function statusBadge(status: string, hub: typeof t.prototype) {
  const map: Record<string, { label: string; cls: string }> = {
    draft:      { label: t().creator.hub.statusDraft,      cls: 'bg-gray-100 text-gray-600' },
    reviewing:  { label: t().creator.hub.statusReviewing,  cls: 'bg-yellow-100 text-yellow-700' },
    published:  { label: t().creator.hub.statusPublished,  cls: 'bg-green-100 text-green-700' },
  };
  const fallback = { label: status, cls: 'bg-gray-100 text-gray-500' };
  return map[status] ?? fallback;
}

// ── ProjectHub Component ──────────────────────────────────────────
export default function ProjectHub() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { startNewProject, loadProject } = useProjectStore();
  const tr = t().creator.hub;

  // 列表狀態
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  // Dialog 狀態
  const [showDialog, setShowDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // ── 載入項目列表 ──────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setListLoading(true);
    setListError('');
    try {
      const res = await fetch(`/api/projects?creator_id=${encodeURIComponent(user.id)}`);
      const data = await res.json() as { ok: boolean; projects?: ProjectRow[]; error?: string };
      if (data.ok && data.projects) {
        setProjects(data.projects);
      } else {
        setListError(data.error ?? tr.errorLoad);
      }
    } catch {
      setListError(tr.errorLoad);
    } finally {
      setListLoading(false);
    }
  }, [user, tr.errorLoad]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ── 建立新項目 ────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newTitle.trim() || !user) return;
    setCreating(true);
    setCreateError('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          mode: 'drama',
          creator_id: user.id,
        }),
      });
      const data = await res.json() as { ok: boolean; project?: ProjectRow; error?: string };
      if (data.ok && data.project) {
        // 重置 store，生成新 projectId，然後 navigate
        startNewProject();
        // 用 API 回傳的 id 覆蓋 store（保證和 D1 一致）
        useProjectStore.getState().setProjectId(data.project.id, data.project.title);
        setShowDialog(false);
        setNewTitle('');
        navigate('/creator/drama');
      } else {
        setCreateError(data.error ?? tr.errorCreate);
      }
    } catch {
      setCreateError(tr.errorCreate);
    } finally {
      setCreating(false);
    }
  };

  // ── 繼續已有項目 ──────────────────────────────────────────────
  const handleContinue = (project: ProjectRow) => {
    loadProject({ id: project.id, title: project.title, mode: project.mode });
    navigate('/creator/drama');
  };

  // ── 格式化時間 ────────────────────────────────────────────────
  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('zh-HK', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  // ── 渲染 ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <CreatorSidebar />

      <main className="flex-1 min-w-0 p-6 lg:p-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Logo className="h-7 w-auto opacity-80" />
              <span className="text-gray-300">／</span>
              <h1 className="text-2xl font-bold text-gray-800">{tr.title}</h1>
            </div>
            <p className="text-sm text-gray-500">{tr.subtitle}</p>
          </div>

          {/* 建立新短劇按鈕 */}
          <button
            onClick={() => { setShowDialog(true); setCreateError(''); setNewTitle(''); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {tr.createBtn}
          </button>
        </div>

        {/* 繼續已有項目 */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-4">{tr.continueTitle}</h2>

          {listLoading ? (
            <div className="flex items-center gap-2 text-gray-400 py-12 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{tr.loading}</span>
            </div>
          ) : listError ? (
            <div className="flex items-center gap-2 text-red-500 py-12 justify-center">
              <AlertCircle className="w-5 h-5" />
              <span>{listError}</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
              <Film className="w-12 h-12 opacity-30" />
              <p className="text-sm">{tr.emptyHint}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => {
                const badge = statusBadge(proj.status, null as any);
                return (
                  <button
                    key={proj.id}
                    onClick={() => handleContinue(proj)}
                    className="group text-left bg-white rounded-xl border border-gray-200 hover:border-rose-300 hover:shadow-md transition-all p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-gray-800 truncate group-hover:text-rose-700 transition-colors">
                          {proj.title}
                        </p>
                      </div>
                      <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>

                    {proj.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{proj.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {tr.lastUpdated}{fmtDate(proj.updated_at)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-rose-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {tr.continueBtn}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ── 建立新短劇 Dialog ─────────────────────────────────── */}
      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDialog(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{tr.dialogTitle}</h3>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tr.dialogLabel}
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !creating) handleCreate(); }}
              placeholder={tr.dialogPlaceholder}
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
                {tr.dialogCancel}
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim() || creating}
                className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {tr.creating}
                  </>
                ) : (
                  tr.dialogConfirm
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
