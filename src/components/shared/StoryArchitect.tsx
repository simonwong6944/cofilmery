/**
 * StoryArchitect — 故事骨架與角色深化引擎
 * Phase 3：project_id 從 useProjectStore 取得，廢除 DEFAULT_PROJECT_ID 硬編碼
 * 原則：AI 起草，人來定奪（三動作列：接受/重新生成/手動編輯）
 */
import { useState, useEffect, useRef } from 'react';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { t } from '@/i18n';
import { aiAdapter, saveStoryCardToD1 } from '@/adapters';
import { useAuthStore } from '@/store/authStore';
import { CREDIT } from '@/credit-config';
import type {
  SeriesContext, TopicOption, CharacterCard, EpisodeStoryCard,
  ArchitectResponse, SelectedSponsorAsset,
} from '@/adapters/types';
import {
  RefreshCw, Check, Edit3, ChevronDown, ChevronUp,
  Sparkles, Users, BookOpen, Film, Plus, X, Save,
  Mic, Star, AlertCircle, Loader2, Package, ArrowLeft,
  Image as ImageIcon, Filter, CheckSquare, Square,
} from 'lucide-react';

// ── EpisodeAssetPickerModal ─────────────────────────────────────────────
// 每集「+ 揀資產」modal — 呼叫 GET /api/assets?project_id=<pid> 列出全部資產
// 支援 category filter、多選、全選、snapshot 存入 EpisodeStoryCard.selectedAssets
// ───────────────────────────────────────────────────────────────────────

interface RawAsset {
  id: string;
  file_name: string;
  file_url: string;
  category: string;
  label: string;
  brand: string;
  revenue_rate: number;
  is_complete?: boolean;
  media?: { role: string; file_url: string }[];
}

interface EpisodeAssetPickerModalProps {
  projectId: string;
  episodeNumber: number;
  initialSelected: SelectedSponsorAsset[];
  onConfirm: (assets: SelectedSponsorAsset[]) => void;
  onClose: () => void;
}

function EpisodeAssetPickerModal({
  projectId,
  episodeNumber,
  initialSelected,
  onConfirm,
  onClose,
}: EpisodeAssetPickerModalProps) {
  const [assets, setAssets] = useState<RawAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState<string>('all');
  const [selected, setSelected] = useState<SelectedSponsorAsset[]>(initialSelected);

  // Load assets on mount
  useEffect(() => {
    setLoading(true);
    fetch(`/api/assets?project_id=${encodeURIComponent(projectId)}`)
      .then(r => r.json() as Promise<{ assets?: RawAsset[] }>)
      .then(data => setAssets(data.assets ?? []))
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  // Derive categories from loaded assets
  const categories = ['all', ...Array.from(new Set(assets.map(a => a.category))).sort()];

  const filtered = catFilter === 'all' ? assets : assets.filter(a => a.category === catFilter);

  const isSelected = (id: string) => selected.some(s => s.asset_id === id);

  const toggle = (asset: RawAsset) => {
    setSelected(prev => {
      const exists = prev.find(s => s.asset_id === asset.id);
      if (exists) return prev.filter(s => s.asset_id !== asset.id);
      // Build snapshot — same pattern as toggleAsset in S1
      const snap: SelectedSponsorAsset = {
        asset_id:     asset.id,
        category:     asset.category,
        name:         asset.label || asset.file_name,
        img:          asset.media?.[0]?.file_url || asset.file_url,
        brand:        asset.brand ?? '',
        revenue_rate: asset.revenue_rate ?? 0,
      };
      return [...prev, snap];
    });
  };

  // Select all / deselect all visible (filtered)
  const allFilteredSelected = filtered.length > 0 && filtered.every(a => isSelected(a.id));
  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect all filtered
      const filteredIds = new Set(filtered.map(a => a.id));
      setSelected(prev => prev.filter(s => !filteredIds.has(s.asset_id)));
    } else {
      // Select all filtered not yet selected
      const toAdd: SelectedSponsorAsset[] = filtered
        .filter(a => !isSelected(a.id))
        .map(asset => ({
          asset_id:     asset.id,
          category:     asset.category,
          name:         asset.label || asset.file_name,
          img:          asset.media?.[0]?.file_url || asset.file_url,
          brand:        asset.brand ?? '',
          revenue_rate: asset.revenue_rate ?? 0,
        }));
      setSelected(prev => [...prev, ...toAdd]);
    }
  };

  const catLabel: Record<string, string> = {
    all: '全部',
    character: '角色',
    prop: '道具',
    costume: '服裝',
    scene: '場景',
    sponsor: '贊助商',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div>
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              <Package size={16} className="text-violet-600" />
              第 {episodeNumber} 集 — 揀選資產
            </h3>
            <p className="text-xs text-muted mt-0.5">存為 snapshot，已揀資產資料不受原庫改動影響</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Filters + Select-all */}
        <div className="px-5 py-3 border-b border-line bg-bg-soft flex items-center gap-2 flex-wrap">
          <Filter size={12} className="text-muted shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                catFilter === cat
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'border-line text-muted hover:border-violet-400 hover:text-violet-700 bg-white'
              }`}
            >
              {catLabel[cat] ?? cat}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1 text-[11px] text-violet-700 hover:text-violet-900 transition-colors"
            >
              {allFilteredSelected
                ? <CheckSquare size={13} className="text-violet-600" />
                : <Square size={13} className="text-muted" />
              }
              {allFilteredSelected ? '取消全選' : '全選'}
            </button>
            {selected.length > 0 && (
              <span className="text-[11px] text-violet-700 font-semibold bg-violet-100 px-2 py-0.5 rounded-full">
                已選 {selected.length}
              </span>
            )}
          </div>
        </div>

        {/* Asset grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-muted text-sm">
              <Loader2 size={16} className="animate-spin" /> 載入資產庫…
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted">
              <Package size={28} className="opacity-40" />
              <p className="text-sm">暫無資產</p>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map(asset => {
                const sel = isSelected(asset.id);
                const thumb = asset.media?.[0]?.file_url || asset.file_url;
                return (
                  <button
                    key={asset.id}
                    onClick={() => toggle(asset)}
                    className={`rounded-xl overflow-hidden border-2 transition-all text-left ${
                      sel
                        ? 'border-violet-500 ring-2 ring-violet-200'
                        : 'border-line hover:border-violet-300'
                    }`}
                  >
                    <div className="relative">
                      {thumb ? (
                        <img src={thumb} alt={asset.label || asset.file_name} className="w-full h-20 object-cover" />
                      ) : (
                        <div className="w-full h-20 bg-bg-soft flex items-center justify-center">
                          <ImageIcon size={20} className="text-muted opacity-40" />
                        </div>
                      )}
                      {sel && (
                        <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
                          <div className="bg-violet-600 text-white rounded-full p-1">
                            <Check size={12} />
                          </div>
                        </div>
                      )}
                      {asset.is_complete && (
                        <div className="absolute top-1 right-1 bg-green-500 text-white text-[9px] px-1 py-0.5 rounded font-bold">
                          完整
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] font-semibold text-ink leading-tight line-clamp-2">
                        {asset.label || asset.file_name}
                      </p>
                      <p className="text-[10px] text-muted mt-0.5">{catLabel[asset.category] ?? asset.category}</p>
                      {asset.brand && (
                        <p className="text-[10px] text-muted truncate">{asset.brand}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-line bg-bg-soft flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {selected.length > 0 ? `已選 ${selected.length} 個資產` : '未選任何資產'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs text-muted border border-line hover:border-ink transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => onConfirm(selected)}
              className="px-4 py-1.5 rounded-lg text-xs bg-violet-600 text-white hover:bg-violet-700 transition-colors font-semibold"
            >
              確認（{selected.length}）
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 記錄 architect_actions 至後端 D1（fire-and-forget）────────────────
async function recordAction(params: {
  project_id: string;
  stage: string;
  action: 'generate' | 'regenerate' | 'accept' | 'edit';
  actor: 'ai' | 'human';
  episode_id?: string;
}) {
  try {
    await fetch('/api/architect/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: crypto.randomUUID(), ...params }),
    });
  } catch {
    // fire-and-forget：記錄失敗不影響 UX
  }
}

// project_id hook — 從 projectStore 取得（Phase 3）
function useProjectId() {
  return useProjectStore((s) => s.projectId);
}

// ── 共用三動作列 ──────────────────────────────────────────────────────
interface ActionBarProps {
  onAccept: () => void;
  onRegenerate: () => void;
  onEdit: () => void;
  loading?: boolean;
  creditCost?: number;
  acceptLabel?: string;
}

function ActionBar({ onAccept, onRegenerate, onEdit, loading, creditCost, acceptLabel }: ActionBarProps) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const sa = tr.storyArchitect;
  return (
    <div className="flex items-center gap-3 p-4 bg-bg-soft border-b border-line">
      <button
        onClick={onAccept}
        disabled={loading}
        className="flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-accent/90 transition-colors text-sm disabled:opacity-50"
      >
        <Check size={16} /> {acceptLabel ?? sa.action.accept}
      </button>
      <button
        onClick={onRegenerate}
        disabled={loading}
        className="flex items-center gap-2 border border-line px-4 py-2.5 rounded-xl text-muted hover:border-primary hover:text-primary transition-colors text-sm disabled:opacity-50"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
        {sa.action.regenerate}
        {creditCost !== undefined && (
          <span className="text-xs text-muted ml-1">
            {sa.credit.cost.replace('{n}', String(creditCost))}
          </span>
        )}
      </button>
      <button
        onClick={onEdit}
        disabled={loading}
        className="flex items-center gap-2 border border-line px-4 py-2.5 rounded-xl text-muted hover:border-ink hover:text-ink transition-colors text-sm disabled:opacity-50"
      >
        <Edit3 size={15} /> {sa.action.edit}
      </button>
    </div>
  );
}

// ── S1a 選題方向 ──────────────────────────────────────────────────────
interface S1aTopicProps {
  context: SeriesContext;
  onAccept: (topic: TopicOption) => void;
}

export function S1aTopic({ context, onAccept }: S1aTopicProps) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const sa = tr.storyArchitect;
  const loc = locale as 'zh-HK' | 'en' | 'zh-CN';
  const projectId = useProjectId();

  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLogline, setEditLogline] = useState('');

  const generate = async (isRegenerate = false) => {
    setLoading(true);
    try {
      const res: ArchitectResponse = await aiAdapter.generateArchitect({ stage: 'topic', context });
      setTopics(res.topics ?? []);
      if (res.topics && res.topics.length > 0) setSelected(res.topics[0].id);
      // 記錄 AI 生成動作
      void recordAction({
        project_id: projectId,
        stage: 'topic',
        action: isRegenerate ? 'regenerate' : 'generate',
        actor: 'ai',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    const topic = topics.find(t => t.id === selected);
    if (!topic) return;
    void recordAction({ project_id: projectId, stage: 'topic', action: 'accept', actor: 'human' });
    onAccept(topic);
  };

  const handleEdit = () => {
    setEditMode(true);
    const idx = topics.findIndex(t => t.id === selected);
    if (idx >= 0) {
      setEditIdx(idx);
      setEditTitle(topics[idx].title_i18n[loc]);
      setEditLogline(topics[idx].logline_i18n[loc]);
    }
    void recordAction({ project_id: projectId, stage: 'topic', action: 'edit', actor: 'human' });
  };

  const saveEdit = () => {
    if (editIdx === null) return;
    setTopics(prev => prev.map((t, i) => i === editIdx ? {
      ...t,
      title_i18n: { ...t.title_i18n, [loc]: editTitle },
      logline_i18n: { ...t.logline_i18n, [loc]: editLogline },
    } : t));
    setEditMode(false);
  };

  return (
    <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
      {/* 標題列 */}
      <div className="p-5 border-b border-line">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-semibold mb-2">
          <Sparkles size={12} /> {sa.stage.topic}
        </div>
        <h3 className="text-lg font-bold text-ink">{sa.topic.pickPrompt}</h3>
        <p className="text-xs text-muted mt-0.5">AI 起草 · 人來定奪</p>
      </div>

      {/* 三動作列（有內容才顯示） */}
      {topics.length > 0 && (
        <ActionBar
          onAccept={handleAccept}
          onRegenerate={() => generate(true)}
          onEdit={handleEdit}
          loading={loading}
          creditCost={CREDIT.architectTopic}
        />
      )}

      {/* 內容區 */}
      <div className="p-5">
        {topics.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles size={32} className="text-accent/40 mx-auto mb-3" />
            <p className="text-muted text-sm mb-4">點擊生成，AI 將根據你的系列設定提供 3 個選題方向</p>
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors mx-auto disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? '生成中…' : `AI 生成選題方向（${CREDIT.architectTopic} 積分）`}
            </button>
          </div>
        ) : editMode && editIdx !== null ? (
          // 編輯模式
          <div className="space-y-3">
            <p className="text-sm font-semibold text-ink mb-3">{sa.action.edit}：{sa.topic.pickPrompt}</p>
            <div>
              <label className="text-xs text-muted mb-1 block">標題</label>
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm text-ink bg-bg-soft focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">{sa.topic.logline}</label>
              <textarea
                value={editLogline}
                onChange={e => setEditLogline(e.target.value)}
                rows={3}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm text-ink bg-bg-soft focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={saveEdit} className="flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold">
                <Save size={14} /> {sa.action.save}
              </button>
              <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-lg text-sm text-muted border border-line">
                {sa.action.cancel}
              </button>
            </div>
          </div>
        ) : (
          // 選題卡片
          <div className="space-y-3">
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelected(topic.id)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                  selected === topic.id
                    ? 'border-accent bg-accent/5'
                    : 'border-line bg-bg-soft hover:border-primary/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                    selected === topic.id ? 'border-accent bg-accent' : 'border-line'
                  }`}>
                    {selected === topic.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-sm mb-1">{topic.title_i18n[loc]}</p>
                    <p className="text-muted text-xs leading-relaxed mb-2">{topic.logline_i18n[loc]}</p>
                    <div className="flex items-start gap-1.5">
                      <Star size={11} className="text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-amber-700 text-xs leading-relaxed">{topic.hook_i18n[loc]}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── S1b 全劇大綱 ──────────────────────────────────────────────────────
interface S1bOutlineProps {
  context: SeriesContext;
  selectedTopic: TopicOption;
  onAccept: (outline: { episodeNumber: number; title_i18n: { 'zh-HK': string; en: string; 'zh-CN': string }; oneLine_i18n: { 'zh-HK': string; en: string; 'zh-CN': string } }[], coCreateNote: string) => void;
  /** S3 重入還原：由 parent（S3StoryFramework）灌入已從 D1/store 還原的 outline，
   *  令重入時直接顯示已生成大綱，唔使重新生成（唔扣積分）。可選，預設 undefined。 */
  initialOutline?: { episodeNumber: number; title_i18n: { 'zh-HK': string; en: string; 'zh-CN': string }; oneLine_i18n: { 'zh-HK': string; en: string; 'zh-CN': string } }[];
}

export function S1bOutline({ context, selectedTopic, onAccept, initialOutline }: S1bOutlineProps) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const sa = tr.storyArchitect;
  const projectId = useProjectId();
  const loc = locale as 'zh-HK' | 'en' | 'zh-CN';

  type OutlineItem = { episodeNumber: number; title_i18n: { 'zh-HK': string; en: string; 'zh-CN': string }; oneLine_i18n: { 'zh-HK': string; en: string; 'zh-CN': string } };
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState('');
  const [coCreateNote, setCoCreateNote] = useState('');
  const [genError, setGenError] = useState<string | null>(null);

  // ── S3 重入還原：掛載回填 outline（僅首次拿到非空 initialOutline 時執行一次）──
  // 因 initialOutline 嚟自 S3StoryFramework 嘅 async store hydrate，可能喺
  // mount 之後先到值，故用 useEffect + dep（唔可以只靠 useState 初始值）。
  // ref guard 確保只回填一次，唔會蓋使用者之後喺此 component 內做嘅編輯/重新生成。
  const outlineHydratedRef = useRef(false);
  useEffect(() => {
    if (outlineHydratedRef.current) return; // 已回填過，不再覆蓋
    if (!(initialOutline && initialOutline.length > 0)) return; // 尚未有值，等下次 dep 觸發
    outlineHydratedRef.current = true;
    setOutline(initialOutline);
  }, [initialOutline]);

  const generate = async (isRegenerate = false) => {
    setLoading(true);
    setGenError(null);
    try {
      const res = await aiAdapter.generateArchitect({ stage: 'outline', context, selectedTopic });
      const items = (res.outline ?? []) as OutlineItem[];
      if (items.length === 0) {
        setGenError('生成結果為空，請重試（或確認故事原材料已填寫）');
      } else {
        setOutline(items);
      }
      void recordAction({
        project_id: projectId, stage: 'outline',
        action: isRegenerate ? 'regenerate' : 'generate', actor: 'ai',
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // 嘗試解析後端回傳的 JSON error方便顯示根因
      setGenError(`生成失敗：${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const saveEpEdit = (idx: number) => {
    setOutline(prev => prev.map((ep, i) => i === idx
      ? { ...ep, title_i18n: { ...ep.title_i18n, [loc]: editVal } }
      : ep
    ));
    setEditIdx(null);
  };

  return (
    <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
      <div className="p-5 border-b border-line">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-2">
          <BookOpen size={12} /> {sa.stage.outline}
        </div>
        <h3 className="text-lg font-bold text-ink">{sa.outline.title}</h3>
        <p className="text-xs text-muted mt-0.5">已選：{selectedTopic.title_i18n[loc]}</p>
      </div>

      {outline.length > 0 && (
        <ActionBar
          onAccept={() => {
            void recordAction({ project_id: projectId, stage: 'outline', action: 'accept', actor: 'human' });
            onAccept(outline, coCreateNote);
          }}
          onRegenerate={() => generate(true)}
          onEdit={() => {
            setEditIdx(0);
            void recordAction({ project_id: projectId, stage: 'outline', action: 'edit', actor: 'human' });
          }}
          loading={loading}
          creditCost={CREDIT.architectOutline}
        />
      )}

      <div className="p-5">
        {outline.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen size={32} className="text-primary/30 mx-auto mb-3" />
            <p className="text-muted text-sm mb-4">AI 將生成全 {context.episodeCount} 集的標題與一行大綱</p>
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors mx-auto disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} />}
              {loading ? '生成中…' : `AI 生成全劇大綱（${CREDIT.architectOutline} 積分）`}
            </button>
            {genError && (
              <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-left max-w-sm mx-auto">
                <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 leading-relaxed">{genError}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* 逐集列表 */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {outline.map((ep, i) => (
                <div key={ep.episodeNumber} className="bg-bg-soft rounded-lg p-3 flex items-start gap-3">
                  <span className="text-xs text-muted font-mono shrink-0 mt-0.5 w-10">
                    {sa.outline.episodeLabel.replace('{n}', String(ep.episodeNumber))}
                  </span>
                  {editIdx === i ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        className="flex-1 border border-line rounded px-2 py-1 text-xs text-ink bg-card focus:outline-none focus:border-primary"
                        autoFocus
                      />
                      <button onClick={() => saveEpEdit(i)} className="text-xs text-accent font-semibold px-2">
                        <Save size={12} />
                      </button>
                      <button onClick={() => setEditIdx(null)} className="text-xs text-muted px-1">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-ink truncate">{ep.title_i18n[loc]}</p>
                        <button
                          onClick={() => { setEditIdx(i); setEditVal(ep.title_i18n[loc]); }}
                          className="text-muted hover:text-primary transition-colors ml-2 shrink-0"
                        >
                          <Edit3 size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-muted leading-relaxed mt-0.5">{ep.oneLine_i18n[loc]}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 共創問句 */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
              <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
                <Mic size={14} /> {sa.coCreate.confirmStory}
              </p>
              <textarea
                value={coCreateNote}
                onChange={e => setCoCreateNote(e.target.value)}
                placeholder={sa.coCreate.addYours}
                rows={2}
                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:border-amber-400 resize-none placeholder:text-amber-400/70"
              />
              {coCreateNote && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Star size={12} className="text-amber-500" />
                  <span className="text-xs text-amber-700 font-semibold">{sa.coCreate.badge}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── S2 角色深化 ───────────────────────────────────────────────────────
interface S2CharactersProps {
  context: SeriesContext;
  onAccept: (characters: CharacterCard[]) => void;
}

export function S2Characters({ context, onAccept }: S2CharactersProps) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const sa = tr.storyArchitect;
  const projectId = useProjectId();
  const loc = locale as 'zh-HK' | 'en' | 'zh-CN';

  const [characters, setCharacters] = useState<CharacterCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [desireInputs, setDesireInputs] = useState<Record<string, string>>({});

  const generate = async (humanInput?: string, isRegenerate = false) => {
    setLoading(true);
    try {
      const res = await aiAdapter.generateArchitect({ stage: 'characters', context, humanInput });
      setCharacters(res.characters ?? []);
      void recordAction({
        project_id: projectId, stage: 'characters',
        action: isRegenerate ? 'regenerate' : 'generate', actor: 'ai',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const updateCard = (id: string, field: keyof CharacterCard, value: string) => {
    setCharacters(prev => prev.map(c => {
      if (c.id !== id) return c;
      const current = c[field];
      const updated = typeof current === 'object' && current !== null
        ? { ...(current as unknown as Record<string, string>), [loc]: value }
        : value;
      return { ...c, [field]: updated, humanEdited: true };
    }));
  };

  const FieldRow = ({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) => (
    <div>
      <label className="text-xs text-muted block mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="w-full border border-line rounded-lg px-3 py-2 text-xs text-ink bg-bg-soft focus:outline-none focus:border-primary resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 text-xs text-ink bg-bg-soft focus:outline-none focus:border-primary"
        />
      )}
    </div>
  );

  return (
    <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
      <div className="p-5 border-b border-line">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
          <Users size={12} /> {sa.stage.characters}
        </div>
        <h3 className="text-lg font-bold text-ink">{sa.char.sectionTitle}</h3>
        <p className="text-xs text-muted mt-0.5">角色卡存於整個系列，全劇共用</p>
      </div>

      {characters.length > 0 && (
        <ActionBar
          onAccept={() => {
            void recordAction({ project_id: projectId, stage: 'characters', action: 'accept', actor: 'human' });
            onAccept(characters);
          }}
          onRegenerate={() => generate(undefined, true)}
          onEdit={() => {
            setEditingId(characters[0]?.id ?? null);
            void recordAction({ project_id: projectId, stage: 'characters', action: 'edit', actor: 'human' });
          }}
          loading={loading}
          creditCost={CREDIT.architectCharacters}
        />
      )}

      <div className="p-5">
        {characters.length === 0 ? (
          <div className="space-y-4">
            {/* 引導人先填核心欲望 */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800 mb-1 flex items-center gap-1.5">
                <Mic size={14} /> {sa.char.coreDesirePrompt}
              </p>
              <p className="text-xs text-green-600 mb-2">先告訴我主角最想要咩，AI 會據此深化角色（可選填）</p>
              <textarea
                value={desireInputs['main'] ?? ''}
                onChange={e => setDesireInputs(p => ({ ...p, main: e.target.value }))}
                placeholder="例：退休前，用自己的廚藝令家人感到驕傲一次…"
                rows={2}
                className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:border-green-400 resize-none placeholder:text-green-400/60"
              />
            </div>
            <div className="text-center py-4">
              <button
                onClick={() => generate(desireInputs['main'])}
                disabled={loading}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors mx-auto disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
              {loading ? '生成中…' : `AI 生成角色卡（${CREDIT.architectCharacters} 積分）`}
            </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {characters.map(char => (
              <div key={char.id} className="border border-line rounded-xl overflow-hidden">
                {/* 簡版頭部 */}
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {char.name_i18n[loc].charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-sm">{char.name_i18n[loc]}</p>
                    <p className="text-xs text-muted truncate">{char.identityTag_i18n[loc]}</p>
                    {char.humanEdited && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5">
                        <Star size={10} /> {sa.coCreate.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingId(editingId === char.id ? null : char.id)}
                      className="text-xs text-muted hover:text-primary transition-colors border border-line px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <Edit3 size={12} /> {sa.action.edit}
                    </button>
                    <button
                      onClick={() => toggleExpand(char.id)}
                      className="text-xs text-muted hover:text-primary transition-colors border border-line px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      {expanded.has(char.id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      {sa.action.deepen}
                    </button>
                  </div>
                </div>

                {/* 簡版：核心欲望（預設可見） */}
                <div className="px-4 pb-3 bg-bg-soft/50">
                  <p className="text-xs text-muted mb-0.5">{sa.char.coreDesire}</p>
                  <p className="text-sm text-ink">{char.coreDesire_i18n[loc]}</p>
                </div>

                {/* 展開：完整六欄 */}
                {expanded.has(char.id) && (
                  <div className="border-t border-line p-4 bg-bg-soft/30 space-y-3">
                    {editingId === char.id ? (
                      // 編輯模式
                      <div className="space-y-3">
                        <FieldRow label={sa.char.identityTag} value={char.identityTag_i18n[loc]}
                          onChange={v => updateCard(char.id, 'identityTag_i18n', v)} />
                        <FieldRow label={sa.char.coreDesire} value={char.coreDesire_i18n[loc]}
                          onChange={v => updateCard(char.id, 'coreDesire_i18n', v)} />
                        <FieldRow label={sa.char.traitsConflict} value={char.traitsConflict_i18n[loc]}
                          onChange={v => updateCard(char.id, 'traitsConflict_i18n', v)} multiline />
                        <FieldRow label={sa.char.arc} value={char.arc_i18n[loc]}
                          onChange={v => updateCard(char.id, 'arc_i18n', v)} multiline />
                        <FieldRow label={sa.char.speechStyle} value={char.speechStyle_i18n[loc]}
                          onChange={v => updateCard(char.id, 'speechStyle_i18n', v)} multiline />
                        <FieldRow label={sa.char.relations} value={char.relations_i18n[loc]}
                          onChange={v => updateCard(char.id, 'relations_i18n', v)} multiline />
                        <FieldRow label={sa.char.appearance} value={char.appearancePrompt_zh}
                          onChange={v => updateCard(char.id, 'appearancePrompt_zh', v)} multiline />
                        <button onClick={() => setEditingId(null)}
                          className="flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold">
                          <Save size={14} /> {sa.action.save}
                        </button>
                      </div>
                    ) : (
                      // 顯示模式
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {[
                          { k: sa.char.traitsConflict, v: char.traitsConflict_i18n[loc] },
                          { k: sa.char.arc, v: char.arc_i18n[loc] },
                          { k: sa.char.speechStyle, v: char.speechStyle_i18n[loc] },
                          { k: sa.char.relations, v: char.relations_i18n[loc] },
                          { k: sa.char.appearance, v: char.appearancePrompt_zh },
                        ].map(({ k, v }) => (
                          <div key={k} className="col-span-2 md:col-span-1">
                            <p className="text-muted mb-0.5">{k}</p>
                            <p className="text-ink leading-relaxed">{v}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* 新增角色 */}
            <button className="w-full border-2 border-dashed border-line rounded-xl p-3 flex items-center justify-center gap-2 text-muted hover:border-primary hover:text-primary transition-colors text-sm">
              <Plus size={16} /> {sa.char.addCharacter}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── S1c 逐集故事卡 ────────────────────────────────────────────────────
// 本集元素（每集故事卡各自維持）
interface EpisodeElements {
  characterIds: string[];       // 出場角色（來自 S2）
  sponsorProductIds: string[];  // 贊助商產品置入（來自 S1 已選）
  ownAssetTags: string[];       // 資產/場景標籤（自由加）
  props: string[];              // 道具/物件（自由填寫）
  propInput: string;            // 道具輸入暫存
}
const DEFAULT_ELEMENTS: EpisodeElements = {
  characterIds: [], sponsorProductIds: [], ownAssetTags: [], props: [], propInput: '',
};

// 將本集元素轉成 humanInput 文字，注入 AI prompt
function buildElementsHint(el: EpisodeElements, characters: CharacterCard[], sponsorAssets: SelectedSponsorAsset[]): string {
  const parts: string[] = [];
  if (el.characterIds.length > 0) {
    const names = el.characterIds.map(id => characters.find(c => c.id === id)?.name_i18n['zh-HK'] ?? id);
    parts.push(`本集出場角色：${names.join('、')}`);
  }
  if (el.sponsorProductIds.length > 0) {
    const prods = el.sponsorProductIds.map(id => sponsorAssets.find(a => a.asset_id === id)?.name ?? id);
    parts.push(`本集須自然植入贊助商產品：${prods.join('、')}（請融入劇情，避免硬銷）`);
  }
  if (el.ownAssetTags.length > 0) {
    parts.push(`本集資產/場景：${el.ownAssetTags.join('、')}`);
  }
  if (el.props.length > 0) {
    parts.push(`本集道具/物件：${el.props.join('、')}`);
  }
  return parts.join('\n');
}

interface S1cEpisodesProps {
  context: SeriesContext;
  outline: { episodeNumber: number; title_i18n: { 'zh-HK': string; en: string; 'zh-CN': string }; oneLine_i18n: { 'zh-HK': string; en: string; 'zh-CN': string } }[];
  characters: CharacterCard[];
  sponsorAssets?: SelectedSponsorAsset[]; // S1 已選贊助商資產（唯一資料源）
  onAccept: (cards: EpisodeStoryCard[]) => void;
  /** S3 重入還原：由 parent（S3StoryFramework）灌入已從 D1/store 還原的分集故事卡陣列，
   *  令重入 3b 時已生成嘅集直接顯示，唔使重新展開（唔扣積分）。可選，預設 undefined。 */
  initialCards?: EpisodeStoryCard[];
}

export function S1cEpisodes({ context, outline, characters, sponsorAssets = [], onAccept, initialCards }: S1cEpisodesProps) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const sa = tr.storyArchitect;
  const projectId = useProjectId();
  const projectTitle = useProjectStore(s => s.projectTitle);
  const { user: epUser } = useAuthStore();
  const loc = locale as 'zh-HK' | 'en' | 'zh-CN';

  const [cards, setCards] = useState<Record<number, EpisodeStoryCard>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [editing, setEditing] = useState<number | null>(null);
  const [editBody, setEditBody] = useState('');
  // 每集的本集元素（各自獨立）
  const [episodeElements, setEpisodeElements] = useState<Record<number, EpisodeElements>>({});
  // 控制每集元素選擇器是否展開
  const [elementsExpanded, setElementsExpanded] = useState<Set<number>>(new Set());
  // Batch 2 組二：每集 D1 存檔狀態（'saving' | 'saved' | 'error'），用於 UI 即時反饋
  const [saveState, setSaveState] = useState<Record<number, 'saving' | 'saved' | 'error'>>({});
  // STEP-EP-ASSETS: 每集揀資產 modal 開關（epNum | null）
  const [assetPickerEp, setAssetPickerEp] = useState<number | null>(null);

  // ── S3 重入還原：掛載回填 cards（僅首次拿到非空 initialCards 時執行一次）──
  // 因 initialCards 嚟自 S3StoryFramework 嘅 async store hydrate，可能喺
  // mount 之後先到值，故用 useEffect + dep（唔可以只靠 useState 初始值）。
  // ref guard 確保只回填一次，唔會蓋使用者之後喺此 component 內做嘅編輯/重新生成。
  const cardsHydratedRef = useRef(false);
  useEffect(() => {
    if (cardsHydratedRef.current) return; // 已回填過，不再覆蓋
    if (!(initialCards && initialCards.length > 0)) return; // 尚未有值，等下次 dep 觸發
    cardsHydratedRef.current = true;
    const record: Record<number, EpisodeStoryCard> = {};
    for (const card of initialCards) record[card.episodeNumber] = card;
    setCards(record);
  }, [initialCards]);

  const getElements = (epNum: number): EpisodeElements =>
    episodeElements[epNum] ?? DEFAULT_ELEMENTS;
  const updateElements = (epNum: number, patch: Partial<EpisodeElements>) =>
    setEpisodeElements(prev => ({ ...prev, [epNum]: { ...getElements(epNum), ...patch } }));

  // Batch 2 組二：共用存檔 helper — 包住 saveStoryCardToD1，統一管理 saveState
  // 用於 expandEpisode（首次生成）、regenerateEpisode（重新生成）、saveEdit（編輯後儲存）
  // 三個動作，確保每次卡片內容變更都即時持久化到 D1，並在 UI 反映存檔狀態。
  const persistCard = async (epNum: number, card: EpisodeStoryCard) => {
    setSaveState(prev => ({ ...prev, [epNum]: 'saving' }));
    try {
      await saveStoryCardToD1({
        projectId,
        userId: epUser?.id ?? 'demo-user',
        title: projectTitle || context.seriesTitle || '未命名劇集',
        card,
      });
      setSaveState(prev => ({ ...prev, [epNum]: 'saved' }));
    } catch (e) {
      setSaveState(prev => ({ ...prev, [epNum]: 'error' }));
      console.warn(`[S1cEpisodes] persistCard failed for episode ${epNum}:`, e);
    }
  };

  // STEP-EP-ASSETS: 確認揀資產後更新該集 selectedAssets 並即時 persist
  const updateCardAssets = (epNum: number, assets: SelectedSponsorAsset[]) => {
    setCards(prev => {
      const existing = prev[epNum];
      if (!existing) return prev;
      const updated: EpisodeStoryCard = { ...existing, selectedAssets: assets };
      void persistCard(epNum, updated);
      return { ...prev, [epNum]: updated };
    });
    setAssetPickerEp(null);
  };

  const expandEpisode = async (epNum: number) => {
    if (cards[epNum]) {
      setExpanded(prev => { const s = new Set(prev); s.has(epNum) ? s.delete(epNum) : s.add(epNum); return s; });
      return;
    }
    setLoading(prev => ({ ...prev, [epNum]: true }));
    try {
      const elemHint = buildElementsHint(getElements(epNum), characters, sponsorAssets);
      const res = await aiAdapter.generateArchitect({
        stage: 'episodes', context, characters, targetEpisode: epNum,
        humanInput: elemHint || undefined,
      });
      if (res.storyCard) {
        setCards(prev => ({ ...prev, [epNum]: res.storyCard! }));
        setExpanded(prev => { const s = new Set(prev); s.add(epNum); return s; });
        void recordAction({ project_id: projectId, stage: 'episodes', action: 'generate', actor: 'ai' });
        // A2 持久化：每集生成成功後即時寫入 D1 episodes.story_card（統一經 persistCard，帶 UI 狀態）
        void persistCard(epNum, res.storyCard);
      }
    } finally {
      setLoading(prev => ({ ...prev, [epNum]: false }));
    }
  };

  const regenerateEpisode = async (epNum: number) => {
    setLoading(prev => ({ ...prev, [epNum]: true }));
    try {
      const elemHint = buildElementsHint(getElements(epNum), characters, sponsorAssets);
      const res = await aiAdapter.generateArchitect({
        stage: 'episodes', context, characters, targetEpisode: epNum,
        humanInput: elemHint || undefined,
      });
      if (res.storyCard) {
        setCards(prev => ({ ...prev, [epNum]: res.storyCard! }));
        void recordAction({ project_id: projectId, stage: 'episodes', action: 'regenerate', actor: 'ai' });
        // Batch 2 組二：重新生成後同樣即時存 D1，避免改動離開頁面即丟失
        void persistCard(epNum, res.storyCard);
      }
    } finally {
      setLoading(prev => ({ ...prev, [epNum]: false }));
    }
  };

  const saveEdit = (epNum: number) => {
    const updatedCard: EpisodeStoryCard = {
      ...cards[epNum],
      body_i18n: { ...cards[epNum].body_i18n, [loc]: editBody },
      humanEdited: true,
    };
    setCards(prev => ({ ...prev, [epNum]: updatedCard }));
    setEditing(null);
    void recordAction({ project_id: projectId, stage: 'episodes', action: 'edit', actor: 'human' });
    // Batch 2 組二：編輯後撳「儲存」才即時存 D1（不綁 onChange 逐字存）
    void persistCard(epNum, updatedCard);
  };

  const acceptedCards = Object.values(cards);

  return (
    <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
      <div className="p-5 border-b border-line">
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
          <Film size={12} /> {sa.stage.episodes}
        </div>
        <h3 className="text-lg font-bold text-ink">逐集展開故事卡</h3>
        <p className="text-xs text-muted mt-0.5">按「展開」即時生成 150–250 字故事卡，可讀可改可重生成</p>
      </div>

      {acceptedCards.length > 0 && (
        <ActionBar
          onAccept={() => onAccept(acceptedCards)}
          onRegenerate={() => {}}
          onEdit={() => {}}
          loading={false}
          acceptLabel={`接受並繼續（已展開 ${acceptedCards.length} 集）`}
        />
      )}

      <div className="p-5 space-y-2 max-h-[600px] overflow-y-auto">
        {outline.map(ep => {
          const card = cards[ep.episodeNumber];
          const isExp = expanded.has(ep.episodeNumber);
          const isLoad = loading[ep.episodeNumber];

          return (
            <div key={ep.episodeNumber} className="border border-line rounded-xl overflow-hidden">
              {/* 標題列 */}
              <div className="flex items-center gap-3 p-3 bg-bg-soft/50">
                <span className="text-xs font-mono text-muted w-10 shrink-0">
                  {sa.outline.episodeLabel.replace('{n}', String(ep.episodeNumber))}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{ep.title_i18n[loc]}</p>
                  <p className="text-xs text-muted truncate">{ep.oneLine_i18n[loc]}</p>
                </div>
                {/* Batch 2 組二：per-episode D1 存檔狀態顯示 */}
                {saveState[ep.episodeNumber] === 'saving' && (
                  <span className="flex items-center gap-1 text-[11px] text-muted shrink-0">
                    <Loader2 size={11} className="animate-spin" /> 儲存中…
                  </span>
                )}
                {saveState[ep.episodeNumber] === 'saved' && (
                  <span className="flex items-center gap-1 text-[11px] text-green-600 shrink-0">
                    <Check size={11} /> 已儲存
                  </span>
                )}
                {saveState[ep.episodeNumber] === 'error' && card && (
                  <button
                    onClick={() => persistCard(ep.episodeNumber, card)}
                    className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 shrink-0"
                    title="點擊重試存檔"
                  >
                    <AlertCircle size={11} /> 儲存失敗 ⚠ 重試
                  </button>
                )}
                {/* 元素選擇器切換按鈕 */}
                <button
                  onClick={() => setElementsExpanded(prev => {
                    const s = new Set(prev);
                    s.has(ep.episodeNumber) ? s.delete(ep.episodeNumber) : s.add(ep.episodeNumber);
                    return s;
                  })}
                  className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border transition-colors shrink-0 ${
                    elementsExpanded.has(ep.episodeNumber)
                      ? 'border-amber-400 text-amber-700 bg-amber-50'
                      : 'border-line text-muted hover:border-amber-300 hover:text-amber-600'
                  }`}
                  title="設定本集元素"
                >
                  <Package size={10} />
                  {(() => {
                    const el = getElements(ep.episodeNumber);
                    const count = el.characterIds.length + el.sponsorProductIds.length + el.ownAssetTags.length + el.props.length;
                    return count > 0 ? `元素 ${count}` : '元素';
                  })()}
                </button>
                {/* STEP-EP-ASSETS: 「+ 揀資產」掣 */}
                <button
                  onClick={() => setAssetPickerEp(ep.episodeNumber)}
                  className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border transition-colors shrink-0 ${
                    (cards[ep.episodeNumber]?.selectedAssets?.length ?? 0) > 0
                      ? 'border-violet-400 text-violet-700 bg-violet-50'
                      : 'border-line text-muted hover:border-violet-300 hover:text-violet-600'
                  }`}
                  title="揀選本集資產（snapshot）"
                >
                  <Plus size={10} />
                  {(cards[ep.episodeNumber]?.selectedAssets?.length ?? 0) > 0
                    ? `資產 ${cards[ep.episodeNumber]!.selectedAssets!.length}`
                    : '揀資產'
                  }
                </button>
                {!card && (
                  <button
                    onClick={() => expandEpisode(ep.episodeNumber)}
                    disabled={isLoad}
                    className="flex items-center gap-1.5 text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 shrink-0"
                  >
                    {isLoad ? <Loader2 size={12} className="animate-spin" /> : <ChevronDown size={12} />}
                    {isLoad ? '生成中…' : sa.action.expand}
                  </button>
                )}
                {card && (
                  <button
                    onClick={() => setExpanded(prev => { const s = new Set(prev); s.has(ep.episodeNumber) ? s.delete(ep.episodeNumber) : s.add(ep.episodeNumber); return s; })}
                    className="text-xs text-violet-600 px-3 py-1.5 rounded-lg border border-violet-200 hover:bg-violet-50 transition-colors flex items-center gap-1 shrink-0"
                  >
                    {isExp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {isExp ? '收起' : '展開'}
                  </button>
                )}
              </div>

              {/* ── 本集元素選擇器（只讀 S1/S2 已選範圍）── */}
              {elementsExpanded.has(ep.episodeNumber) && (() => {
                const el = getElements(ep.episodeNumber);
                return (
                  <div className="p-4 border-t border-amber-100 bg-amber-50/40 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Package size={13} className="text-amber-600" />
                      <span className="text-xs font-semibold text-amber-800">本集元素（生成/重新生成時 AI 會將以下元素織入故事）</span>
                    </div>

                    {/* 1. 出場角色（來自 S2） */}
                    <div>
                      <p className="text-[11px] font-semibold text-ink mb-1.5 flex items-center gap-1">
                        <Users size={11} className="text-primary" /> 出場角色
                        <span className="text-muted font-normal">（來自 S2 角色設定）</span>
                      </p>
                      {characters.length === 0 ? (
                        <div className="flex items-center gap-2 text-xs text-muted bg-white rounded-lg px-3 py-2 border border-dashed border-line">
                          <ArrowLeft size={11} />
                          未從 S2 設定角色，可返回 S2 補充
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {characters.map(c => {
                            const selected = el.characterIds.includes(c.id);
                            return (
                              <button
                                key={c.id}
                                onClick={() => updateElements(ep.episodeNumber, {
                                  characterIds: selected
                                    ? el.characterIds.filter(id => id !== c.id)
                                    : [...el.characterIds, c.id],
                                })}
                                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                                  selected
                                    ? 'bg-primary text-white border-primary'
                                    : 'border-line text-muted hover:border-primary hover:text-primary bg-white'
                                }`}
                              >
                                {selected && <Check size={9} className="inline mr-0.5" />}
                                {c.name_i18n['zh-HK']}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 2. 贊助商產品置入（來自 S1 已選） */}
                    <div>
                      <p className="text-[11px] font-semibold text-ink mb-1.5 flex items-center gap-1">
                        <Sparkles size={11} className="text-amber-500" /> 贊助商產品置入
                        <span className="text-muted font-normal">（只顯示 S1 資產庫已選產品）</span>
                      </p>
                      {sponsorAssets.length === 0 ? (
                        <div className="flex items-center gap-2 text-xs text-muted bg-white rounded-lg px-3 py-2 border border-dashed border-line">
                          <ArrowLeft size={11} />
                          未從資產庫選取贊助商產品，可返回 S1 補充
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {sponsorAssets.map(asset => {
                            const selected = el.sponsorProductIds.includes(asset.asset_id);
                            return (
                              <button
                                key={asset.asset_id}
                                onClick={() => updateElements(ep.episodeNumber, {
                                  sponsorProductIds: selected
                                    ? el.sponsorProductIds.filter(id => id !== asset.asset_id)
                                    : [...el.sponsorProductIds, asset.asset_id],
                                })}
                                className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                                  selected
                                    ? 'bg-amber-500 text-white border-amber-500'
                                    : 'border-line text-muted hover:border-amber-400 hover:text-amber-700 bg-white'
                                }`}
                              >
                                {selected && <Check size={9} />}
                                {asset.name}
                                <span className={`text-[9px] ${selected ? 'text-amber-100' : 'text-muted'}`}>{asset.category}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 3. 資產/場景標籤（自由加，來自 S1 自有素材描述） */}
                    <div>
                      <p className="text-[11px] font-semibold text-ink mb-1.5 flex items-center gap-1">
                        <Film size={11} className="text-green-600" /> 資產/場景
                        <span className="text-muted font-normal">（自由標記本集場景）</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {el.ownAssetTags.map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 text-[11px] bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full border border-green-200">
                            {tag}
                            <button onClick={() => updateElements(ep.episodeNumber, { ownAssetTags: el.ownAssetTags.filter(t => t !== tag) })}>
                              <X size={9} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          className="flex-1 text-[11px] border border-line rounded-lg px-2.5 py-1 bg-white focus:outline-none focus:border-green-400"
                          placeholder="例：街市攤檔、舊式公屋走廊…"
                          value={el.propInput + ''}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                              const v = (e.target as HTMLInputElement).value.trim();
                              if (!el.ownAssetTags.includes(v)) updateElements(ep.episodeNumber, { ownAssetTags: [...el.ownAssetTags, v] });
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                        <span className="text-[10px] text-muted self-center">Enter 加入</span>
                      </div>
                    </div>

                    {/* 4. 道具/物件（自由填寫） */}
                    <div>
                      <p className="text-[11px] font-semibold text-ink mb-1.5 flex items-center gap-1">
                        <BookOpen size={11} className="text-violet-600" /> 道具/物件
                        <span className="text-muted font-normal">（自由加入）</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {el.props.map(prop => (
                          <span key={prop} className="inline-flex items-center gap-1 text-[11px] bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-full border border-violet-200">
                            {prop}
                            <button onClick={() => updateElements(ep.episodeNumber, { props: el.props.filter(p => p !== prop) })}>
                              <X size={9} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          className="flex-1 text-[11px] border border-line rounded-lg px-2.5 py-1 bg-white focus:outline-none focus:border-violet-400"
                          placeholder="例：一封手寫信、舊單車…"
                          value={el.propInput}
                          onChange={e => updateElements(ep.episodeNumber, { propInput: e.target.value })}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && el.propInput.trim()) {
                              if (!el.props.includes(el.propInput.trim()))
                                updateElements(ep.episodeNumber, { props: [...el.props, el.propInput.trim()], propInput: '' });
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (el.propInput.trim() && !el.props.includes(el.propInput.trim()))
                              updateElements(ep.episodeNumber, { props: [...el.props, el.propInput.trim()], propInput: '' });
                          }}
                          className="text-[11px] bg-violet-600 text-white px-2.5 py-1 rounded-lg hover:bg-violet-700 transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* STEP-EP-ASSETS: 已揀資產縮圖列 */}
              {(() => {
                const epAssets = cards[ep.episodeNumber]?.selectedAssets ?? [];
                if (epAssets.length === 0) return null;
                return (
                  <div className="px-4 py-2.5 border-t border-violet-100 bg-violet-50/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Package size={11} className="text-violet-600" />
                      <span className="text-[11px] font-semibold text-violet-800">本集已揀資產（{epAssets.length}）</span>
                      <button
                        onClick={() => setAssetPickerEp(ep.episodeNumber)}
                        className="ml-auto text-[10px] text-violet-600 hover:text-violet-800 underline"
                      >
                        編輯
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {epAssets.map(asset => (
                        <div
                          key={asset.asset_id}
                          className="flex items-center gap-1.5 bg-white border border-violet-200 rounded-lg px-2 py-1"
                        >
                          {asset.img ? (
                            <img src={asset.img} alt={asset.name} className="w-6 h-6 rounded object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded bg-bg-soft border border-line flex items-center justify-center flex-shrink-0">
                              <Package size={10} className="text-muted" />
                            </div>
                          )}
                          <span className="text-[10px] text-ink max-w-[80px] truncate">{asset.name}</span>
                          <button
                            onClick={() => {
                              const filtered = epAssets.filter(a => a.asset_id !== asset.asset_id);
                              updateCardAssets(ep.episodeNumber, filtered);
                            }}
                            className="text-muted hover:text-red-500 transition-colors flex-shrink-0"
                            title="移除"
                          >
                            <X size={9} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 展開的故事卡內容 */}
              {card && isExp && (
                <div className="p-4 border-t border-line space-y-3">
                  {/* 三動作列（單集） */}
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => regenerateEpisode(ep.episodeNumber)}
                      disabled={isLoad}
                      className="flex items-center gap-1.5 text-xs border border-line px-3 py-1.5 rounded-lg text-muted hover:border-violet-400 hover:text-violet-700 transition-colors disabled:opacity-50"
                    >
                      {isLoad ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                      {sa.action.regenerate}（{CREDIT.architectEpisode} 積分）
                    </button>
                    <button
                      onClick={() => { setEditing(ep.episodeNumber); setEditBody(card.body_i18n[loc]); }}
                      className="flex items-center gap-1.5 text-xs border border-line px-3 py-1.5 rounded-lg text-muted hover:border-ink hover:text-ink transition-colors"
                    >
                      <Edit3 size={11} /> {sa.action.edit}
                    </button>
                    {card.humanEdited && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ml-auto">
                        <Star size={10} /> {sa.coCreate.badge}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted mb-0.5">{sa.ep.coreEmotion}</p>
                      <p className="text-ink">{card.coreEmotion_i18n[loc]}</p>
                    </div>
                    <div>
                      <p className="text-muted mb-0.5">{sa.ep.hook}</p>
                      <p className="text-ink">{card.hook_i18n[loc]}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted mb-1">{sa.ep.body}</p>
                    {editing === ep.episodeNumber ? (
                      <div className="space-y-2">
                        <textarea
                          value={editBody}
                          onChange={e => setEditBody(e.target.value)}
                          rows={8}
                          className="w-full border border-line rounded-lg px-3 py-2 text-xs text-ink bg-bg-soft focus:outline-none focus:border-primary resize-none"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(ep.episodeNumber)}
                            className="flex items-center gap-1 bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                            <Save size={11} /> {sa.action.save}
                          </button>
                          <button onClick={() => setEditing(null)}
                            className="px-3 py-1.5 rounded-lg text-xs text-muted border border-line">
                            {sa.action.cancel}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-ink leading-relaxed whitespace-pre-line">{card.body_i18n[loc]}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted mb-0.5">{sa.ep.turningPoint}</p>
                      <p className="text-ink leading-relaxed">{card.turningPoint_i18n[loc]}</p>
                    </div>
                    <div>
                      <p className="text-muted mb-0.5">{sa.ep.linkPrevNext}</p>
                      <p className="text-ink leading-relaxed">{card.linkPrevNext_i18n[loc]}</p>
                    </div>
                  </div>

                  {/* 引用角色 */}
                  {card.characterIds.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted">{sa.ep.characters}：</span>
                      {card.characterIds.map(cid => {
                        const ch = characters.find(c => c.id === cid);
                        return ch ? (
                          <span key={cid} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {ch.name_i18n[loc]}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* STEP-EP-ASSETS: 揀資產 Modal */}
      {assetPickerEp !== null && (
        <EpisodeAssetPickerModal
          projectId={projectId}
          episodeNumber={assetPickerEp}
          initialSelected={cards[assetPickerEp]?.selectedAssets ?? []}
          onConfirm={(assets) => updateCardAssets(assetPickerEp, assets)}
          onClose={() => setAssetPickerEp(null)}
        />
      )}
    </div>
  );
}

// ── 步驟進度列 ────────────────────────────────────────────────────────
// 修正五六：移除 'topic'（選題方向）與 'characters'（角色深化）子步驟
// S3 直接由 outline（全劇大綱）→ episodes（分集故事卡）
export type ArchitectSubStage = 'outline' | 'episodes' | 'done';

interface StageProgressProps {
  current: ArchitectSubStage;
}

export function StageProgress({ current }: StageProgressProps) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const sa = tr.storyArchitect;

  const stages: { key: ArchitectSubStage; label: string; icon: React.ReactNode }[] = [
    { key: 'outline', label: sa.stage.outline, icon: <BookOpen size={13} /> },
    { key: 'episodes', label: sa.stage.episodes, icon: <Film size={13} /> },
  ];

  const order: ArchitectSubStage[] = ['outline', 'episodes', 'done'];
  const curIdx = order.indexOf(current);

  return (
    <div className="flex items-center gap-1 mb-4">
      {stages.map(({ key, label, icon }, i) => {
        const stageIdx = order.indexOf(key);
        const isDone = stageIdx < curIdx;
        const isActive = key === current;
        return (
          <div key={key} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isDone ? 'bg-accent/20 text-accent' :
              isActive ? 'bg-accent text-white shadow-sm' :
              'bg-bg-soft text-muted'
            }`}>
              {isDone ? <Check size={12} /> : icon}
              {label}
            </div>
            {i < stages.length - 1 && (
              <div className={`w-4 h-0.5 rounded ${isDone ? 'bg-accent/40' : 'bg-line'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 傳承模式安全提示 ──────────────────────────────────────────────────
export function LegacyModeNotice() {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
      <AlertCircle size={15} className="text-amber-600 mt-0.5 shrink-0" />
      <p className="text-xs text-amber-700">{tr.storyArchitect.legacy.noFabricationNote}</p>
    </div>
  );
}
