import { useState, useRef, useCallback, useEffect } from 'react';
import type { CharacterCard } from '@/adapters/types';
import { Layers } from 'lucide-react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { StepNavigation } from '@/components/shared/StepNavigation';
import { AIAssistantPanel } from '@/components/shared/AIAssistantPanel';
import { CreditIndicator } from '@/components/shared/CreditIndicator';
import { Logo } from '@/components/shared/Logo';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/i18n';
import { saveCharactersToD1, loadCharactersFromD1, saveSponsorAssetsToD1, loadSponsorAssetsFromD1 } from '@/adapters';
import type { SelectedSponsorAsset } from '@/adapters/types';
import { S7Voiceover } from './stages/S7Voiceover';
import { S8PlatformEdit } from './stages/S8PlatformEdit';
import { S9ReviewPublish } from './stages/S9ReviewPublish';
import { S5Keyframes } from './stages/S5Keyframes';
import { PlanOverview } from './stages/PlanOverview';
import { S0SeriesSetup } from './stages/S0SeriesSetup';
import { S4Storyboard } from './stages/S4Storyboard';
import { S6VideoGen } from './stages/S6VideoGen';
import { S3StoryFramework } from './stages/S3StoryFramework';
import { ImageLightbox } from '@/components/shared/ImageLightbox';
import {
  AppearanceOptions, DEFAULT_APPEARANCE, BEARD_VALUES,
  buildAppearanceSummary, CHAR_ANGLE_ROLES, CharAngleRole, CHAR_ANGLE_LABELS,
} from '@/components/shared/appearanceConstants';
import { SeriesAestheticLock } from './stages/SeriesAestheticLock';
import {
  AlertTriangle, RefreshCw, Check, Mic, Save, ChevronDown, ChevronRight,
  Sparkles, Image, Film, Music, Edit3, Upload, Zap, Eye,
  Heart, Clock, Users, Camera, Car, UtensilsCrossed,
  ShoppingBag, MapPin, Gift, Plus, X, Info, Tag, Building2, Package, Trash2
} from 'lucide-react';


// ─────────────────────────────────────────
// ─────────────────────────────────────────
// S1: 資產庫（Asset Bank，綁定 series_id）
// ─────────────────────────────────────────

// GlobalAsset — shape returned by GET /api/assets
interface GlobalAsset {
  id: string;
  file_name: string;
  file_url: string;
  category: string;
  label: string;
  brand: string;
  revenue_rate: number;
}

// ─────────────────────────────────────────
// S1: 資產庫
// ─────────────────────────────────────────
function S1AssetBank({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  // 從 store 讀取已選贊助商（re-entrant 時保留），並可寫回 store
  const {
    selectedSponsorAssets: storedSponsorAssets,
    setSelectedSponsorAssets: storeSetSponsorAssets,
  } = useProjectStore();
  const [activeTab, setActiveTab] = useState<'own' | 'sponsor'>('own');
  const [selectedSponsorAssets, setSelectedSponsorAssets] = useState<SelectedSponsorAsset[]>(storedSponsorAssets);
  const [showSponsorInfo, setShowSponsorInfo] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // ── 真實中央庫 state ─────────────────────────────────────────────────────
  const [globalAssets, setGlobalAssets]         = useState<GlobalAsset[]>([]);
  const [globalCategories, setGlobalCategories] = useState<{ slug: string; name: string }[]>([]);
  const [globalLoading, setGlobalLoading]       = useState(false);
  const [sponsorMsg, setSponsorMsg]             = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sponsorSaving, setSponsorSaving]       = useState(false);

  // 真實上傳 state
  const { projectId: s1ProjectId } = useProjectStore();
  const { user: s1User } = useAuthStore();
  const s1FileRef = useRef<HTMLInputElement>(null);
  const [s1Uploading, setS1Uploading]   = useState(false);
  const [s1UploadErr, setS1UploadErr]   = useState('');
  const [s1Assets, setS1Assets]         = useState<Array<{ id: string; file_name: string; file_type: string; file_size: number; file_url: string; category: string; label: string }>>([]);
  const [s1Loaded, setS1Loaded]         = useState(false);
  // FIX-CATEGORY: 記錄用戶點擊了哪個分組 (index)，供 onS1FileChange 決定 canonical category
  // index 對應：0=character, 1=scene, 2=prop(道具/服裝), 3=audio
  const [s1UploadSection, setS1UploadSection] = useState<number | null>(null);
  // label index → canonical category 對應表（跟 locale ownAssets 順序一致）
  const S1_SECTION_CATEGORY: Record<number, string> = {
    0: 'character',  // 角色參考圖
    1: 'scene',      // 場景參考圖
    2: 'prop',       // 道具 / 服裝（合組，canonical 用 prop）
    3: 'audio',      // 背景音樂
  };
  // edit / delete state
  const [s1EditAsset, setS1EditAsset]   = useState<{ id: string; label: string } | null>(null);
  const [s1EditLabel, setS1EditLabel]   = useState('');
  const [s1ActionMsg, setS1ActionMsg]   = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  useEffect(() => {
    if (!s1ActionMsg) return;
    const t = setTimeout(() => setS1ActionMsg(null), 3000);
    return () => clearTimeout(t);
  }, [s1ActionMsg]);

  const fetchS1Assets = useCallback(async () => {
    // 若無 project id，不發 request，直接標記已載入（空列表）
    if (!s1ProjectId) {
      setS1Assets([]);
      setS1Loaded(true);
      return;
    }
    try {
      const res = await fetch(`/api/assets?project_id=${s1ProjectId}&limit=100`);
      if (!res.ok) return;
      const data = await res.json<{ assets: typeof s1Assets }>();
      setS1Assets(data.assets ?? []);
    } catch { /* non-blocking */ } finally {
      setS1Loaded(true);
    }
  }, [s1ProjectId]);

  useEffect(() => { fetchS1Assets(); }, [fetchS1Assets]);

  // ── 載入全局贊助商庫 + 分類 ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const fetchGlobalLib = async () => {
      setGlobalLoading(true);
      try {
        const [assetsRes, catsRes] = await Promise.all([
          fetch('/api/assets?project_id=global&limit=200'),
          fetch('/api/asset-categories'),
        ]);
        if (cancelled) return;
        if (assetsRes.ok) {
          const data = await assetsRes.json<{ assets: GlobalAsset[] }>();
          setGlobalAssets(data.assets ?? []);
        }
        if (catsRes.ok) {
          const data = await catsRes.json<{ categories: { id: string; name: string; slug: string }[] }>();
          setGlobalCategories((data.categories ?? []).map(c => ({ slug: c.slug, name: c.name })));
        }
      } catch { /* non-blocking */ } finally {
        if (!cancelled) setGlobalLoading(false);
      }
    };
    fetchGlobalLib();
    return () => { cancelled = true; };
  }, []);

  // ── Mount 時從 D1 還原已揀選的贊助商資產（只有 projectId 且 store 為空時才覆寫）──
  useEffect(() => {
    if (!s1ProjectId) return;
    if (storedSponsorAssets.length > 0) return; // 有本地暫存，唔覆蓋
    loadSponsorAssetsFromD1(s1ProjectId)
      .then(dbAssets => {
        if (dbAssets.length > 0) {
          setSelectedSponsorAssets(dbAssets);
          storeSetSponsorAssets(dbAssets);
        }
      })
      .catch(() => { /* non-blocking */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s1ProjectId]);

  // sponsorMsg auto-clear
  useEffect(() => {
    if (!sponsorMsg) return;
    const timer = setTimeout(() => setSponsorMsg(null), 3000);
    return () => clearTimeout(timer);
  }, [sponsorMsg]);

  const onS1FileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    // 前置驗證：需有登入用戶及 project id
    const s1tr = tr.creator.drama.s1;
    if (!s1User?.id) {
      setS1UploadErr(s1tr.uploadLoginRequired);
      return;
    }
    if (!s1ProjectId) {
      setS1UploadErr(s1tr.uploadNoProject);
      return;
    }
    setS1Uploading(true); setS1UploadErr('');
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('projectId', s1ProjectId);
        fd.append('userId', s1User.id);
        // FIX-CATEGORY: 優先用分組 canonical category；音頻 MIME 作二次兜底
        const canonicalCategory: string =
          s1UploadSection !== null && S1_SECTION_CATEGORY[s1UploadSection] !== undefined
            ? S1_SECTION_CATEGORY[s1UploadSection]
            : file.type.startsWith('audio/') ? 'audio'
            : file.type.startsWith('video/') ? 'video'
            : 'other';
        fd.append('category', canonicalCategory);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      await fetchS1Assets();
    } catch (err) {
      setS1UploadErr(err instanceof Error ? err.message : '上傳失敗');
    } finally {
      setS1Uploading(false);
      setS1UploadSection(null); // 上傳完成後清除分組記錄
    }
  };

  // ── S1 asset delete ──────────────────────────────────────────────────────────
  const handleS1Delete = async (asset: { id: string; file_name: string }) => {
    const s1tr = tr.creator.drama.s1;
    if (!window.confirm(s1tr.s1AssetDeleteConfirm)) return;
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id':   s1User?.id ?? '',
          'X-User-Role': s1User?.role ?? 'creator',
        },
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (res.status === 403) {
        setS1ActionMsg({ type: 'error', text: s1tr.s1AssetNotOwner });
      } else if (data.ok) {
        setS1Assets(prev => prev.filter(a => a.id !== asset.id));
        setS1ActionMsg({ type: 'success', text: s1tr.s1AssetDeleteSuccess });
      } else {
        setS1ActionMsg({ type: 'error', text: data.error ?? 'Delete failed' });
      }
    } catch (e) {
      setS1ActionMsg({ type: 'error', text: String(e) });
    }
  };

  // ── S1 asset edit (label only) ────────────────────────────────────────────
  const openS1Edit = (asset: { id: string; label: string }) => {
    setS1EditAsset(asset);
    setS1EditLabel(asset.label ?? '');
  };
  const handleS1SaveEdit = async () => {
    if (!s1EditAsset) return;
    const s1tr = tr.creator.drama.s1;
    try {
      const res = await fetch(`/api/assets/${s1EditAsset.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id':   s1User?.id ?? '',
          'X-User-Role': s1User?.role ?? 'creator',
        },
        body: JSON.stringify({ label: s1EditLabel }),
      });
      const data = await res.json() as { ok?: boolean; asset?: { id: string; file_name: string; file_type: string; file_size: number; file_url: string; category: string; label: string }; error?: string };
      if (res.status === 403) {
        setS1ActionMsg({ type: 'error', text: s1tr.s1AssetNotOwner });
      } else if (data.ok && data.asset) {
        setS1Assets(prev => prev.map(a => a.id === s1EditAsset.id ? data.asset! : a));
        setS1ActionMsg({ type: 'success', text: s1tr.s1AssetEditSuccess });
        setS1EditAsset(null);
      } else {
        setS1ActionMsg({ type: 'error', text: data.error ?? 'Update failed' });
      }
    } catch (e) {
      setS1ActionMsg({ type: 'error', text: String(e) });
    }
  };

  const ownAssetIcons = [Users, Image, Camera, Music];
  const ownAssetColors = ['text-blue-500','text-green-500','text-purple-500','text-amber-500'];
  const ownAssetTypes = tr.creator.drama.s1.ownAssets.map((a, i) => ({
    icon: ownAssetIcons[i], label: a.label, color: ownAssetColors[i],
    accept: a.accept,
    // FIX-CATEGORY: count by canonical category（唔再靠 MIME type 推斷）
    count: s1Assets.filter(asset => asset.category === (S1_SECTION_CATEGORY[i] ?? 'other')).length,
  }));

  // toggleAsset — uses real GlobalAsset fields, mapped to SelectedSponsorAsset
  const toggleAsset = (asset: GlobalAsset) => {
    setSelectedSponsorAssets(prev => {
      const exists = prev.find(a => a.asset_id === asset.id);
      if (exists) return prev.filter(a => a.asset_id !== asset.id);
      return [...prev, {
        asset_id:     asset.id,
        category:     asset.category,
        name:         asset.label || asset.file_name,
        img:          asset.file_url,
        brand:        asset.brand,
        revenue_rate: asset.revenue_rate,
      }];
    });
  };

  const isSelected = (assetId: string) => selectedSponsorAssets.some(a => a.asset_id === assetId);

  const totalSelected = selectedSponsorAssets.length;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s1.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s1.subtitle}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
            <Zap size={11} /> 綁定系列 ID：DRAMA-2026-001
          </div>
          {totalSelected > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">
              <Tag size={11} /> 已選 {totalSelected} 個贊助商資產
            </div>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-xl border border-line overflow-hidden mb-5 bg-bg-soft">
        <button
          onClick={() => setActiveTab('own')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'own'
              ? 'bg-primary text-white'
              : 'text-muted hover:text-ink'
          }`}
        >
          <Upload size={15} /> {tr.creator.drama.s1.ownTab}
        </button>
        <button
          onClick={() => setActiveTab('sponsor')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'sponsor'
              ? 'bg-accent text-white'
              : 'text-muted hover:text-ink'
          }`}
        >
          <Gift size={15} /> {tr.creator.drama.s1.sponsorTab}
          {totalSelected > 0 && (
            <span className="bg-white/25 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {totalSelected}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB: 自有素材 ── */}
      {activeTab === 'own' && (
        <div className="space-y-4">
          {/* Hidden file input */}
          <input
            ref={s1FileRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            className="hidden"
            onChange={onS1FileChange}
          />

          {/* Error banner */}
          {s1UploadErr && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">
              ⚠️ {s1UploadErr}
            </div>
          )}

          {ownAssetTypes.map((type, i) => (
            <div key={i} className="bg-card rounded-xl border border-line p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <type.icon size={18} className={type.color} />
                  <span className="font-semibold text-sm text-ink">{type.label}</span>
                  {type.count > 0 && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                      {type.count} 個已上傳
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted">{type.accept}</span>
              </div>
              <div
                onClick={() => {
                  if (s1Uploading) return;
                  // FIX-CATEGORY: 記錄分組 index，onS1FileChange 據此 map canonical category
                  setS1UploadSection(i);
                  s1FileRef.current?.click();
                }}
                className="border-2 border-dashed border-line rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
              >
                {s1Uploading
                  ? <div className="flex items-center justify-center gap-2 text-xs text-muted"><Upload size={16} className="animate-bounce" /> 上傳中…</div>
                  : <><Upload size={20} className="mx-auto text-muted mb-1" /><p className="text-xs text-muted">{tr.creator.drama.s1.uploadPrompt}</p></>
                }
              </div>
            </div>
          ))}

          {/* Real uploaded assets preview */}
          <div className="bg-card rounded-xl border border-line p-5 shadow-card">
            <h3 className="font-semibold text-ink text-sm mb-3">{tr.creator.drama.s1.previewTitle}</h3>

            {/* Action feedback banner */}
            {s1ActionMsg && (
              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs mb-3 ${
                s1ActionMsg.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {s1ActionMsg.text}
              </div>
            )}

            {!s1Loaded && (
              <p className="text-xs text-muted">載入中…</p>
            )}
            {s1Loaded && s1Assets.length === 0 && (
              <p className="text-xs text-muted">尚未上傳任何素材</p>
            )}
            {s1Loaded && s1Assets.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {s1Assets.map(asset => (
                  <div key={asset.id} className="relative group">
                    {asset.file_type.startsWith('image/') ? (
                      <img
                        src={asset.file_url}
                        alt={asset.file_name}
                        className="w-full aspect-square object-cover rounded-lg"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-bg-soft rounded-lg flex flex-col items-center justify-center text-xs text-muted gap-1 p-2">
                        {asset.file_type.startsWith('video/') ? <Film size={20} /> : <Music size={20} />}
                        <span className="truncate w-full text-center">{asset.file_name}</span>
                      </div>
                    )}
                    {/* Hover overlay: filename + view/edit/delete buttons */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-opacity px-1">
                      <span className="text-white text-[10px] truncate w-full text-center leading-tight">{asset.label || asset.file_name}</span>
                      <div className="flex gap-1">
                        {asset.file_type.startsWith('image/') && (
                          <button
                            onClick={e => { e.stopPropagation(); setLightboxUrl(asset.file_url); }}
                            title={tr.creator.drama.s1.s1AssetViewFull}
                            className="bg-white/20 hover:bg-white/40 text-white rounded p-1 transition-colors"
                          >
                            <Eye size={12} />
                          </button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); openS1Edit(asset); }}
                          title={tr.creator.drama.s1.s1AssetEditLabel}
                          className="bg-white/20 hover:bg-white/40 text-white rounded p-1 transition-colors"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleS1Delete(asset); }}
                          title={tr.creator.drama.s1.s1AssetDeleteConfirm}
                          className="bg-white/20 hover:bg-red-500/80 text-white rounded p-1 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  onClick={() => s1FileRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-line rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                >
                  <Plus size={20} className="text-muted" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── S1 Edit Label Modal ───────────────────────────────────────────────── */}
      {s1EditAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setS1EditAsset(null)}
        >
          <div
            className="bg-card rounded-2xl shadow-xl w-80 p-6 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-ink text-base">{tr.creator.drama.s1.s1AssetEditLabel}</h3>
            <input
              type="text"
              value={s1EditLabel}
              onChange={e => setS1EditLabel(e.target.value)}
              className="border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary w-full"
              placeholder={tr.creator.drama.s1.s1AssetEditLabel}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setS1EditAsset(null)}
                className="px-4 py-2 rounded-lg text-sm text-muted hover:bg-bg-soft transition-colors"
              >
                {tr.creator.drama.s1.s1AssetCancelBtn}
              </button>
              <button
                onClick={handleS1SaveEdit}
                className="px-4 py-2 rounded-lg text-sm bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                {tr.creator.drama.s1.s1AssetSaveBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: 贊助商品牌資產庫（真實中央庫）── */}
      {activeTab === 'sponsor' && (
        <div className="space-y-4">
          {/* Info banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <Gift size={18} className="text-accent flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">{tr.creator.drama.s1.sponsorTitle}</p>
              <p className="text-xs text-amber-700 mt-0.5">{tr.creator.drama.s1.sponsorDesc}</p>
            </div>
            <button onClick={() => setShowSponsorInfo(v => !v)} className="flex-shrink-0 text-amber-500 hover:text-amber-700">
              <Info size={15} />
            </button>
          </div>

          {showSponsorInfo && (
            <div className="bg-card border border-line rounded-xl p-4 text-xs text-muted space-y-1.5">
              <p className="font-semibold text-ink text-sm">{tr.creator.drama.s1.howItWorksTitle}</p>
              <p>{tr.creator.drama.s1.howItWorks1}</p>
              <p>{tr.creator.drama.s1.howItWorks2}</p>
              <p>{tr.creator.drama.s1.howItWorks3}</p>
              <p>{tr.creator.drama.s1.howItWorks4}</p>
            </div>
          )}

          {/* Sponsor action feedback */}
          {sponsorMsg && (
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
              sponsorMsg.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {sponsorMsg.type === 'success' ? '✅' : '⚠️'} {sponsorMsg.text}
            </div>
          )}

          {/* Loading state */}
          {globalLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted text-sm">
              <RefreshCw size={16} className="animate-spin" />
              {tr.creator.drama.s1.sponsorLoadingLib}
            </div>
          )}

          {/* Empty state — lib loaded but 0 assets */}
          {!globalLoading && globalAssets.length === 0 && (
            <div className="bg-bg-soft rounded-xl p-8 text-center text-muted">
              <Package size={28} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">{tr.creator.drama.s1.sponsorEmptyLib}</p>
            </div>
          )}

          {/* Assets grouped by category */}
          {!globalLoading && globalAssets.length > 0 && (() => {
            // Build category order: prefer admin-defined categories (slug + name), fall back to unique slugs in assets
            const catOrder: { slug: string; name: string }[] = globalCategories.length > 0
              ? globalCategories
              : [...new Set(globalAssets.map(a => a.category))].map(s => ({ slug: s, name: s }));

            return catOrder.map(cat => {
              const catAssets = globalAssets.filter(a => a.category === cat.slug);
              if (catAssets.length === 0) return null;
              const catSelectedCount = catAssets.filter(a => isSelected(a.id)).length;
              return (
                <div key={cat.slug} className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
                  {/* Category heading */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-bg-soft">
                    <Tag size={14} className="text-accent" />
                    <span className="font-bold text-sm text-ink">{cat.name}</span>
                    <span className="text-xs text-muted ml-1">({catAssets.length})</span>
                    {catSelectedCount > 0 && (
                      <span className="ml-auto bg-accent/10 text-accent text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {tr.creator.drama.s1.selectedCount} {catSelectedCount}
                      </span>
                    )}
                  </div>
                  {/* Asset grid */}
                  <div className="p-4">
                    <p className="text-xs text-muted mb-3 flex items-center gap-1">
                      <Package size={11} /> {tr.creator.drama.s1.clickToSelect}
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {catAssets.map(asset => {
                        const selected = isSelected(asset.id);
                        return (
                          <button
                            key={asset.id}
                            onClick={() => toggleAsset(asset)}
                            className={`rounded-xl overflow-hidden border-2 transition-all text-left ${
                              selected
                                ? 'border-accent ring-2 ring-accent/20'
                                : 'border-line hover:border-accent/40'
                            }`}
                          >
                            <div className="relative">
                              {asset.file_url ? (
                                <img src={asset.file_url} alt={asset.label || asset.file_name} className="w-full h-24 object-cover" />
                              ) : (
                                <div className="w-full h-24 bg-bg-soft flex items-center justify-center">
                                  <Package size={24} className="text-muted opacity-40" />
                                </div>
                              )}
                              {selected && (
                                <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                                  <div className="bg-accent text-white rounded-full p-1">
                                    <Check size={14} />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <p className="text-xs font-semibold text-ink leading-tight line-clamp-2">
                                {asset.label || asset.file_name}
                              </p>
                              {asset.brand && (
                                <p className="text-[10px] text-muted mt-0.5 truncate">{asset.brand}</p>
                              )}
                              {asset.revenue_rate > 0 && (
                                <span className="inline-block mt-1 bg-primary/8 text-primary text-[10px] px-1.5 py-0.5 rounded leading-tight">
                                  {(asset.revenue_rate * 100).toFixed(0)}% 分成
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            });
          })()}

          {/* Selected summary */}
          {totalSelected > 0 && (
            <div className="bg-card border border-line rounded-xl p-4">
              <h4 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                <Check size={14} className="text-accent" />
                {tr.creator.drama.s1.selectedSummaryTitle}（{totalSelected} 項）
              </h4>
              <div className="space-y-2">
                {selectedSponsorAssets.map(asset => (
                  <div key={asset.asset_id} className="flex items-center gap-3 bg-bg-soft rounded-lg p-2">
                    {asset.img ? (
                      <img src={asset.img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-bg-soft border border-line flex items-center justify-center flex-shrink-0">
                        <Package size={14} className="text-muted" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">{asset.name}</p>
                      <p className="text-[10px] text-muted">{asset.brand || asset.category}</p>
                    </div>
                    <button
                      onClick={() => setSelectedSponsorAssets(prev => prev.filter(a => a.asset_id !== asset.asset_id))}
                      className="flex-shrink-0 text-muted hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs text-amber-700 flex items-center gap-1.5">
                  <Zap size={11} />
                  {tr.creator.drama.s1.sponsorNote} {totalSelected} {tr.creator.drama.s1.sponsorNote2}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="mt-6">
        <button
          disabled={sponsorSaving}
          onClick={async () => {
            // 1. 存入 projectStore 供後續步驟讀取
            storeSetSponsorAssets(selectedSponsorAssets);
            // 2. 若有 projectId，同步儲存至 D1
            if (s1ProjectId) {
              setSponsorSaving(true);
              try {
                await saveSponsorAssetsToD1(s1ProjectId, selectedSponsorAssets);
                setSponsorMsg({ type: 'success', text: tr.creator.drama.s1.sponsorSaveSuccess });
              } catch {
                setSponsorMsg({ type: 'error', text: tr.creator.drama.s1.sponsorSaveNoProject });
              } finally {
                setSponsorSaving(false);
              }
            }
            onNext();
          }}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sponsorSaving ? <RefreshCw size={16} className="animate-spin" /> : <ChevronRight size={18} />}
          {tr.creator.drama.s1.confirmBtn}
        </button>
        {totalSelected > 0 && (
          <p className="text-center text-xs text-muted mt-2">
            {tr.creator.drama.s1.confirmNote} {totalSelected} {tr.creator.drama.s1.confirmNote2}
          </p>
        )}
      </div>
      {lightboxUrl && <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
    </div>
  );
}

// ─────────────────────────────────────────
// S2: 角色設定
// ─────────────────────────────────────────
// ── Shared: appearance option type ──────────────────────────────────────────


function CharacterProfileCard({
  img, refs, name, role, age, bg, similarity, setSimilarity, mode,
  gender, onGenderChange,
  initialTraits, initialAppearance,
  onTraitsChange, onAppearanceChange,
  onNameChange, onRoleChange, onAgeChange, onBgChange,
  onImgChange, onRefsChange,
  onSaveChar,
  projectId,
  charId,
  userId,
}: {
  img: string; refs?: string[]; name: string; role: string; age: string; bg: string;
  similarity: string; setSimilarity: (v: string) => void;
  mode: 'drama' | 'legacy';
  gender?: 'male' | 'female' | 'other';
  onGenderChange?: (g: 'male' | 'female' | 'other' | undefined) => void;
  initialTraits?: string[];
  initialAppearance?: AppearanceOptions;
  onTraitsChange?: (t: string[]) => void;
  onAppearanceChange?: (a: AppearanceOptions) => void;
  onNameChange?: (v: string) => void;
  onRoleChange?: (v: string) => void;
  onAgeChange?: (v: string) => void;
  onBgChange?: (v: string) => void;
  onImgChange?: (url: string) => void;
  onRefsChange?: (urls: string[]) => void;
  onSaveChar?: () => void;
  projectId?: string;
  charId?: string;
  userId?: string;
}) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const [traits, setTraits] = useState(initialTraits ?? ['開朗樂觀', '勤力', '重情義', '愛說故事', '傳統']);
  const [newTrait, setNewTrait] = useState('');
  const [addingTrait, setAddingTrait] = useState(false);
  const [appearance, setAppearance] = useState<AppearanceOptions>(initialAppearance ?? DEFAULT_APPEARANCE);
  const [showAppearance, setShowAppearance] = useState(false);
  const [saveCharSaved, setSaveCharSaved] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [assetPickerTarget, setAssetPickerTarget] = useState<'img' | 'refs'>('img');
  const [showAvatarModal, setShowAvatarModal] = useState(false);   // Fix 2: avatar click modal
  const [s1Assets, setS1Assets] = useState<{ id: string; file_name: string; file_url: string; file_type: string }[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

  // D3: AI image generation state
  const [imageGenLoading, setImageGenLoading] = useState(false);
  const [imageGenResult, setImageGenResult] = useState<string | null>(null);
  const [imageGenError, setImageGenError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // S2 角色設定圖：多角度生成狀態
  type AngleStatus = 'idle' | 'loading' | 'done' | 'error';
  const [angleMedia, setAngleMedia] = useState<Record<string, string>>({}); // role → fileUrl
  const [angleStatus, setAngleStatus] = useState<Record<string, AngleStatus>>(
    () => Object.fromEntries(CHAR_ANGLE_ROLES.map(r => [r, 'idle' as AngleStatus]))
  );
  const [angleError, setAngleError] = useState<Record<string, string>>({});
  const [isLoopRunning, setIsLoopRunning] = useState(false);
  const [loopProgress, setLoopProgress] = useState<{ current: number; total: number; roleName: string } | null>(null);
  // Similarity mode for character-angle API (independent from D3 image-gen similarity)
  const [angleSimMode, setAngleSimMode] = useState<'high' | 'mid' | 'low'>('mid');

  // Load existing asset_media rows on mount / charId change (persistence)
  useEffect(() => {
    if (!charId) return;
    fetch(`/api/asset-media?asset_id=${charId}`)
      .then(r => r.json())
      .then((data: { ok: boolean; media?: { role: string; file_url: string }[] }) => {
        if (data.ok && data.media) {
          const map: Record<string, string> = {};
          const statusMap: Record<string, AngleStatus> = Object.fromEntries(
            CHAR_ANGLE_ROLES.map(r => [r, 'idle' as AngleStatus])
          );
          data.media.forEach(m => {
            if ((CHAR_ANGLE_ROLES as readonly string[]).includes(m.role)) {
              map[m.role] = m.file_url;
              statusMap[m.role] = 'done';
            }
          });
          setAngleMedia(map);
          setAngleStatus(statusMap);
        }
      })
      .catch(() => { /* non-blocking */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charId]);

  // Call POST /api/ai/character-angle for one role
  const generateOneAngle = async (
    angleRole: CharAngleRole,
    appearanceSummary: string,
    referenceImageUrl?: string,
    sim?: 'high' | 'mid' | 'low'
  ): Promise<string> => {
    const t0 = Date.now();
    console.log('[generateOneAngle] START role=', angleRole, 'sim=', sim, 'hasRef=', !!referenceImageUrl, 'charId=', charId);
    const res = await fetch('/api/ai/character-angle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetId: charId ?? 'unknown',
        role: angleRole,
        referenceImageUrl,
        appearanceSummary,
        projectId: projectId ?? 'global',
        userId: userId ?? 'anonymous',
        similarity: sim ?? 'mid',
      }),
    });
    console.log('[generateOneAngle] HTTP role=', angleRole, 'status=', res.status, 'elapsed=', Date.now()-t0, 'ms');
    const data = await res.json() as { ok: boolean; fileUrl?: string; error?: string; mediaWriteFailed?: boolean; mediaWriteError?: string };
    console.log('[generateOneAngle] RESPONSE role=', angleRole, 'ok=', data.ok, 'fileUrl=', data.fileUrl?.slice(0,60), 'error=', data.error, 'total=', Date.now()-t0, 'ms');
    if (data.mediaWriteFailed) {
      console.warn('[generateOneAngle] mediaWriteFailed role=', angleRole, data.mediaWriteError);
    }
    if (!data.ok || !data.fileUrl) throw new Error(data.error ?? '生成失敗');
    return data.fileUrl;
  };

  // FIX A — 呼叫前先清掉三個舊角度（避免舊圖殘留），再用最新 frontUrl 串連重生
  // 串連生成 three-quarter → side → back（front 已由 image-gen 產生並設為頭像）
  // frontUrl: 一致性角色圖 URL，全部角度都用它做 reference
  const startRemainingAngles = async (frontUrl: string) => {
    console.log('[startRemainingAngles] called, frontUrl=', frontUrl, 'charId=', charId);
    if (!charId) { console.log('[startRemainingAngles] EARLY RETURN: charId is empty/undefined'); return; }
    const prompt = buildAppearanceSummary(appearance);
    console.log('[startRemainingAngles] prompt=', JSON.stringify(prompt), 'appearance=', JSON.stringify(appearance));
    if (!prompt) { console.log('[startRemainingAngles] EARLY RETURN: prompt is empty (appearance not filled)'); return; }

    // ① FIX A: 先清掉舊三角度 media 及狀態，防止舊圖殘留
    const REMAINING_ROLES: CharAngleRole[] = ['three-quarter', 'side', 'back'];
    setAngleMedia(prev => {
      const next = { ...prev };
      REMAINING_ROLES.forEach(r => { delete next[r]; });
      return next;
    });
    setAngleStatus(prev => {
      const next = { ...prev };
      REMAINING_ROLES.forEach(r => { next[r] = 'idle'; });
      return next;
    });
    setAngleError(prev => {
      const next = { ...prev };
      REMAINING_ROLES.forEach(r => { next[r] = ''; });
      return next;
    });

    setIsLoopRunning(true);
    setLoopProgress(null);

    for (let i = 0; i < REMAINING_ROLES.length; i++) {
      const r = REMAINING_ROLES[i];
      setLoopProgress({ current: i + 1, total: 3, roleName: CHAR_ANGLE_LABELS[r] });
      setAngleStatus(prev => ({ ...prev, [r]: 'loading' }));
      setAngleError(prev => ({ ...prev, [r]: '' }));
      try {
        // 全部角度用最新 frontUrl 做 reference，用 high 盡量跟近 front
        const fileUrl = await generateOneAngle(r, prompt, frontUrl, 'high');
        console.log('[startRemainingAngles] got fileUrl for', r, '=', fileUrl?.slice(0,60), '→ setAngleMedia');
        setAngleMedia(prev => ({ ...prev, [r]: fileUrl }));
        setAngleStatus(prev => ({ ...prev, [r]: 'done' }));
        console.log('[startRemainingAngles] setAngleMedia+Status done for', r);
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : '生成失敗';
        console.error('[startRemainingAngles] CATCH role=', r, 'error=', errMsg, e);
        setAngleStatus(prev => ({ ...prev, [r]: 'error' }));
        setAngleError(prev => ({ ...prev, [r]: errMsg }));
        // Don't abort — continue remaining angles
      }
    }
    setIsLoopRunning(false);
    setLoopProgress(null);
  };

  // 个別角度重試（用 front 做 reference）
  const retryAngle = async (r: CharAngleRole) => {
    const prompt = buildAppearanceSummary(appearance);
    if (!prompt || !charId) return;
    setAngleStatus(prev => ({ ...prev, [r]: 'loading' }));
    setAngleError(prev => ({ ...prev, [r]: '' }));
    try {
      // front retry: 用原相/refs; 其餘角度: 用 front output
      const refUrl = r === 'front'
        ? (img || (refs ?? [])[0] || undefined)
        : (angleMedia['front'] || undefined);
      const sim = r === 'front' ? 'mid' : 'high'; // STEP 1: front fixed mid, others fixed high
      const fileUrl = await generateOneAngle(r, prompt, refUrl, sim);
      setAngleMedia(prev => ({ ...prev, [r]: fileUrl }));
      setAngleStatus(prev => ({ ...prev, [r]: 'done' }));
      if (r === 'front') onImgChange?.(fileUrl);
    } catch (e) {
      setAngleStatus(prev => ({ ...prev, [r]: 'error' }));
      setAngleError(prev => ({ ...prev, [r]: e instanceof Error ? e.message : '生成失敗' }));
    }
  };

  // 補齊全部 idle non-front 角度（離開再入後使用）
  // 重用 retryAngle 邏輯：各角度用 front 做 reference，sim='high'
  const fillIdleAngles = async () => {
    const idleRoles = (['three-quarter', 'side', 'back'] as CharAngleRole[]).filter(
      r => (angleStatus[r] ?? 'idle') === 'idle'
    );
    for (const r of idleRoles) {
      await retryAngle(r);
    }
  };

  // 是否有任何 non-front 角度仍係 idle（front done 但尚未自動串）
  const hasIdleRemainingAngles =
    angleStatus['front'] === 'done' &&
    (['three-quarter', 'side', 'back'] as CharAngleRole[]).some(
      r => (angleStatus[r] ?? 'idle') === 'idle'
    );

  // Completeness gate: front + side + back required (three-quarter optional)
  const isAngleSetComplete =
    angleStatus['front'] === 'done' &&
    angleStatus['side'] === 'done' &&
    angleStatus['back'] === 'done';

  // Upload helper: POST to /api/upload
  const uploadFile = async (file: File, target: 'img' | 'refs') => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('projectId', projectId ?? 'global');
      fd.append('userId', 'anonymous');
      fd.append('category', 'character');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json() as { ok: boolean; fileUrl: string };
      if (!data.ok) throw new Error('upload failed');
      if (target === 'img') {
        onImgChange?.(data.fileUrl);
      } else {
        onRefsChange?.([...(refs ?? []), data.fileUrl]);
      }
    } catch (e) {
      console.error('S2 upload error:', e);
    } finally {
      setUploading(false);
    }
  };

  // Fetch all assets for picker (no category filter — show everything uploaded)
  const loadAssets = async () => {
    if (s1Assets.length > 0) return;
    setAssetsLoading(true);
    try {
      const res = await fetch(`/api/assets?project_id=${projectId ?? 'global'}&limit=200`);
      const data = await res.json() as { ok: boolean; assets: typeof s1Assets };
      if (data.ok) setS1Assets(data.assets);
    } catch { /* non-blocking */ }
    finally { setAssetsLoading(false); }
  };

  // Open asset picker for refs
  const openAssetPicker = async (target: 'img' | 'refs') => {
    setAssetPickerTarget(target);
    setShowAssetPicker(true);
    await loadAssets();
  };

  // Fix 2: open avatar picker modal
  const openAvatarModal = async () => {
    setShowAvatarModal(true);
    await loadAssets();
  };

  const removeTrait = (t: string) => {
    const next = traits.filter(x => x !== t);
    setTraits(next);
    onTraitsChange?.(next);
  };
  const addTrait = () => {
    const v = newTrait.trim();
    if (v && !traits.includes(v)) {
      const next = [...traits, v];
      setTraits(next);
      onTraitsChange?.(next);
    }
    setNewTrait(''); setAddingTrait(false);
  };
  const addPresetTrait = (p: string) => {
    const next = [...traits, p];
    setTraits(next);
    onTraitsChange?.(next);
  };

  const setApp = (k: keyof AppearanceOptions, v: string) => {
    const next = { ...appearance, [k]: appearance[k] === v ? '' : v };
    setAppearance(next);
    onAppearanceChange?.(next);
  };
  const setAppText = (k: keyof AppearanceOptions, v: string) => {
    const next = { ...appearance, [k]: v };
    setAppearance(next);
    onAppearanceChange?.(next);
  };

  const simColors = [
    { color: 'bg-green-500', border: 'border-green-500', bg: 'bg-green-50' },
    { color: 'bg-blue-500',  border: 'border-blue-500',  bg: 'bg-blue-50'  },
    { color: 'bg-purple-500',border: 'border-purple-500',bg: 'bg-purple-50'},
  ];
  const s2tr = tr.creator.drama.s2;
  const similarityLabels = [
    { id: s2tr.simVeryClose, label: s2tr.simVeryClose, desc: s2tr.simVeryCloseDesc, ...simColors[0] },
    { id: s2tr.simSeventyPct, label: s2tr.simSeventyPct, desc: s2tr.simSeventyPctDesc, ...simColors[1] },
    { id: s2tr.simSpirit, label: s2tr.simSpirit, desc: s2tr.simSpiritDesc, ...simColors[2] },
  ];

  // 性別聯動性格預設清單
  const PERSONALITY_PRESETS_BY_GENDER: Record<'male' | 'female' | 'other', string[]> = {
    male:   s2tr.personalityPresetsMale,
    female: s2tr.personalityPresetsFemale,
    other:  s2tr.personalityPresetsOther,
  };
  const TRAIT_PRESETS = gender
    ? PERSONALITY_PRESETS_BY_GENDER[gender]
    : tr.creator.drama.shared.traitPresets;

  // 性別聯動外型選項覆蓋清單
  // 分性別的類別：build / hairLength / face / facial / style（共 5 個）
  // 共用類別：height / skin / hair / hairColor / eyes / eyewear / posture（共 7 個）
  const appearanceOptsOverride = gender
    ? (s2tr.appearanceOptsOverride[gender] as Partial<Record<keyof AppearanceOptions, string[]>>)
    : null;

  // Appearance option rows — from locale so they rebuild on locale change
  // gender 有值時，5 個分性別 key 用 override opts；其餘 7 個保持共用
  const appearanceRowLabels = tr.creator.drama.s2.appearanceRows;
  const appearanceRowKeys: (keyof AppearanceOptions)[] = [
    'height','build','skin','hair','hairColor','hairLength',
    'face','eyes','eyewear','facial','posture','style',
  ];
  // FIX 2: female/other 嘅 facial row 移除鬚款選項，只保留面部特徵（酒窩/皺紋/睫毛等）
  // 令用戶唔會誤揀鬚款，且 summary 唔會帶鬚字眼
  const BEARD_OPTS = new Set(['\u7121鬚', '短鬚', '山羊鬚', '八字鬚', '滿臉鬚',
    'No Beard', 'Stubble', 'Goatee', 'Moustache', 'Full Beard',
    '无胡须', '短胡须', '山羊胡', '八字胡', '络煶胡']);

  const appearanceRows: { label: string; key: keyof AppearanceOptions; opts: string[] }[] = [
    // 原有 12 row（locale 驅動，gender override 適用）
    ...appearanceRowLabels.map((r, i) => {
      const key = appearanceRowKeys[i];
      const overriddenOpts = appearanceOptsOverride?.[key];
      let opts = overriddenOpts ?? r.opts;
      // female/other: strip beard options from facial row
      if (key === 'facial' && (gender === 'female' || gender === 'other')) {
        opts = opts.filter(o => !BEARD_OPTS.has(o));
      }
      return { label: r.label, key, opts };
    }),
    // STEP 2: 新增五個外貌細節 row（繁中 hardcode，gender-neutral，唔需要 locale / override）
    { label: '眼睛大小', key: 'eyeSize'   as keyof AppearanceOptions, opts: ['大眼', '細眼', '丹鳳眼', '圓眼'] },
    { label: '嘴型',     key: 'mouthSize' as keyof AppearanceOptions, opts: ['櫻桃小嘴', '厚唇', '薄唇', '標準'] },
    { label: '鼻型',     key: 'noseShape' as keyof AppearanceOptions, opts: ['挺鼻', '小巧', '鷹鉤鼻', '標準'] },
    { label: '眉型',     key: 'eyebrows'  as keyof AppearanceOptions, opts: ['濃眉', '細眉', '劍眉', '彎眉'] },
    { label: '臉部特徵', key: 'faceDetail' as keyof AppearanceOptions, opts: ['高顴骨', '尖下巴', '方下巴'] },
    // STEP 3: 離散元素型四個新 row（繁中 hardcode，gender-neutral，唔需要 locale / gender filter）
    { label: '年齡感',   key: 'ageLook'   as keyof AppearanceOptions, opts: ['少女', '青年', '中年', '老年'] },
    { label: '妝容',     key: 'makeup'    as keyof AppearanceOptions, opts: ['素顏', '淡妝', '濃妝', '紅唇', '煙燻妝'] },
    { label: '配件',     key: 'accessory' as keyof AppearanceOptions, opts: ['耳環', '頸鏈', '帽', '頭飾'] },
    { label: '面部標記', key: 'faceMark'  as keyof AppearanceOptions, opts: ['痣', '雀斑', '疤痕', '酒渦'] },
  ];

  const accentColor = mode === 'drama' ? 'primary' : 'accent';

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) { uploadFile(f, 'img'); e.target.value = ''; } }}
      />
      <input
        ref={refInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? []);
          files.forEach(f => uploadFile(f, 'refs'));
          e.target.value = '';
        }}
      />

      {/* Fix 2: Avatar picker modal — shows on avatar click */}
      {showAvatarModal && (
        <div className="bg-card rounded-xl border border-primary/30 shadow-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink flex items-center gap-2">
              <Camera size={14} className="text-primary" /> 設定角色頭像
            </p>
            <button onClick={() => setShowAvatarModal(false)} className="text-muted hover:text-ink">
              <X size={16} />
            </button>
          </div>

          {/* Option A: Upload new */}
          <button
            onClick={() => { setShowAvatarModal(false); avatarInputRef.current?.click(); }}
            disabled={uploading}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-line hover:border-primary bg-bg-soft hover:bg-primary/5 transition-all text-left disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Upload size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">上傳新相片</p>
              <p className="text-xs text-muted">從裝置選擇圖片檔案</p>
            </div>
          </button>

          {/* Option B: Pick from uploaded assets */}
          <div>
            <p className="text-xs font-semibold text-muted mb-2">從已上傳素材揀選</p>
            {assetsLoading ? (
              <div className="flex items-center justify-center py-6">
                <RefreshCw size={16} className="text-muted animate-spin" />
              </div>
            ) : s1Assets.filter(a => a.file_type.startsWith('image')).length === 0 ? (
              <p className="text-xs text-muted text-center py-4 border border-dashed border-line rounded-xl">
                尚無已上傳圖片，請先在 S1 上傳素材或使用「上傳新相片」。
              </p>
            ) : (
              <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                {s1Assets.filter(a => a.file_type.startsWith('image')).map(a => (
                  <button
                    key={a.id}
                    onClick={() => { onImgChange?.(a.file_url); setShowAvatarModal(false); }}
                    className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                    title={a.file_name}
                  >
                    <img src={a.file_url} alt={a.file_name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Basic info */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card">
        <div className="flex gap-4 mb-4">
          {/* Fix 2: Avatar — entire area is clickable, opens avatar picker modal */}
          <div className="relative flex-shrink-0 group cursor-pointer" onClick={openAvatarModal}>
            {img ? (
              <img src={img} alt={name} className="w-20 h-20 rounded-xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users size={28} className="text-primary/30" />
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploading
                ? <RefreshCw size={16} className="text-white animate-spin" />
                : <Camera size={16} className="text-white" />
              }
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 shadow-sm">
              <Camera size={9} />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted">{mode === 'drama' ? s2tr.charNameLabel : tr.creator.legacy.s2.nameLabel}</label>
                <input
                  className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary"
                  value={name}
                  onChange={e => onNameChange?.(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted">{mode === 'drama' ? s2tr.charRoleLabel : tr.creator.legacy.s2.roleLabel}</label>
                <input
                  className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary"
                  value={role}
                  onChange={e => onRoleChange?.(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted">{s2tr.charAgeLabel}</label>
                <input
                  className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary"
                  value={age}
                  onChange={e => onAgeChange?.(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted">{mode === 'drama' ? s2tr.charBgLabel : tr.creator.legacy.s2.bgLabel}</label>
                <input
                  className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary"
                  value={bg}
                  onChange={e => onBgChange?.(e.target.value)}
                />
              </div>
            </div>

            {/* 性別選擇 + 保存掣（同一行）*/}
            <div className="flex items-center gap-3 pt-0.5">
              <div className="flex items-center gap-1.5 flex-1">
                <label className="text-xs text-muted whitespace-nowrap">{s2tr.genderLabel}：</label>
                <div className="flex gap-1">
                  {(['male', 'female', 'other'] as const).map(g => {
                    const label = g === 'male' ? s2tr.genderMale : g === 'female' ? s2tr.genderFemale : s2tr.genderOther;
                    const isSelected = gender === g;
                    return (
                      <button
                        key={g}
                        onClick={() => {
                          const newGender = isSelected ? undefined : g;
                          onGenderChange?.(newGender);
                          // FIX 2: 切換 gender 時，若新 gender 係 female/other，清空 beard 殘留
                          // male → female/other: 若 facial 係鬚款式，清空
                          // 任何 → undefined: 不清（保留用戶已揀的值）
                          if (newGender === 'female' || newGender === 'other') {
                            if (BEARD_VALUES.has(appearance.facial ?? '')) {
                              const clearedApp = { ...appearance, facial: '' };
                              setAppearance(clearedApp);
                              onAppearanceChange?.(clearedApp);
                            }
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                          isSelected
                            ? 'bg-primary text-white border-primary'
                            : 'border-line text-muted hover:border-primary hover:text-primary bg-bg-soft'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* 保存角色掣 */}
              <button
                onClick={() => {
                  onSaveChar?.();
                  setSaveCharSaved(true);
                  setTimeout(() => setSaveCharSaved(false), 2000);
                }}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-all font-medium flex-shrink-0 ${
                  saveCharSaved
                    ? 'bg-green-50 text-green-600 border-green-300'
                    : 'bg-bg-soft text-ink border-line hover:border-primary hover:text-primary'
                }`}
              >
                <Save size={11} />
                {saveCharSaved ? s2tr.saveCharDone : s2tr.saveCharBtn}
              </button>
            </div>
          </div>
        </div>

        {/* Upload refs — 參考相 */}
        <div className="space-y-2">
          {/* 已上傳參考相預覽 */}
          {(refs ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(refs ?? []).map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-line group">
                  <img src={url} alt={`ref-${i}`} className="w-full h-full object-cover" />
                  {/* D2: hover overlay — 刪除 or 設為頭像 */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
                    <button
                      onClick={() => onImgChange?.(url)}
                      className="text-[9px] text-white bg-primary/80 rounded px-1.5 py-0.5 hover:bg-primary leading-tight"
                      title="設為頭像"
                    >
                      設為頭像
                    </button>
                    <button
                      onClick={() => onRefsChange?.((refs ?? []).filter((_, idx) => idx !== i))}
                      className="text-[9px] text-white bg-red-500/80 rounded px-1.5 py-0.5 hover:bg-red-600 leading-tight"
                    >
                      移除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* 上傳 / 從素材庫揀 */}
          <div className="flex gap-2">
            <button
              onClick={() => refInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 border border-dashed border-line rounded-lg p-3 text-center hover:border-primary transition-colors disabled:opacity-50"
            >
              <Upload size={14} className="mx-auto text-muted mb-1" />
              <p className="text-xs text-muted">{mode === 'drama' ? s2tr.uploadRef : tr.creator.legacy.s2.uploadRef}</p>
            </button>
            <button
              onClick={() => openAssetPicker('refs')}
              className="flex-shrink-0 border border-dashed border-line rounded-lg px-3 py-2 text-center hover:border-primary transition-colors"
              title="從已上傳素材揀選"
            >
              <Image size={14} className="mx-auto text-muted mb-1" />
              <p className="text-[10px] text-muted">素材庫</p>
            </button>
          </div>
        </div>
      </div>

      {/* S1 素材庫 Picker Modal */}
      {showAssetPicker && (
        <div className="bg-card rounded-xl border border-line p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink">從已上傳素材揀選</p>
            <button onClick={() => setShowAssetPicker(false)} className="text-muted hover:text-ink">
              <X size={16} />
            </button>
          </div>
          {s1Assets.length === 0 ? (
            <p className="text-xs text-muted text-center py-4">尚無已上傳素材，請先在 S1 上傳。</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {s1Assets.filter(a => a.file_type.startsWith('image')).map(a => (
                <div key={a.id} className="relative group">
                  <button
                    onClick={() => {
                      if (assetPickerTarget === 'img') {
                        onImgChange?.(a.file_url);
                      } else {
                        onRefsChange?.([...(refs ?? []), a.file_url]);
                      }
                      setShowAssetPicker(false);
                    }}
                    className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all w-full"
                  >
                    <img src={a.file_url} alt={a.file_name} className="w-full h-full object-cover" />
                  </button>
                  {/* D2: 從素材庫揀時，refs 模式額外顯示「設為頭像」 */}
                  {assetPickerTarget === 'refs' && (
                    <button
                      onClick={() => { onImgChange?.(a.file_url); setShowAssetPicker(false); }}
                      className="absolute bottom-0.5 left-0.5 right-0.5 text-[9px] text-white bg-primary/80 rounded px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-center leading-tight"
                    >
                      設為頭像
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 性格特質 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-ink">{s2tr.traitsLabel}</label>
          <span className="text-xs text-muted">{mode === 'drama' ? s2tr.traitsSubtitle : tr.creator.legacy.s2.traitsSubtitle}</span>
        </div>

        {/* Active traits */}
        <div className="flex flex-wrap gap-2 mb-3">
          {traits.map(t => (
            <span
              key={t}
              className={`inline-flex items-center gap-1 bg-${accentColor}/10 text-${accentColor} text-xs px-3 py-1 rounded-full font-medium group`}
            >
              {t}
              <button onClick={() => removeTrait(t)} className="opacity-40 hover:opacity-100 transition-opacity ml-0.5">
                <X size={10} />
              </button>
            </span>
          ))}
          {!addingTrait && (
            <button
              onClick={() => setAddingTrait(true)}
              className="text-xs text-muted border border-dashed border-line px-3 py-1 rounded-full hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
            >
              <Plus size={10} /> {s2tr.addTrait}
            </button>
          )}
        </div>

        {/* Add trait input */}
        {addingTrait && (
          <div className="flex gap-2 mb-3">
            <input
              autoFocus
              className="flex-1 border border-primary rounded-lg px-3 py-1.5 text-sm bg-bg-soft focus:outline-none"
              placeholder={s2tr.traitInputPlaceholder}
              value={newTrait}
              onChange={e => setNewTrait(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTrait(); if (e.key === 'Escape') setAddingTrait(false); }}
            />
            <button onClick={addTrait} className="bg-primary text-white text-xs px-3 py-1.5 rounded-lg">{s2tr.traitConfirm}</button>
            <button onClick={() => setAddingTrait(false)} className="text-muted text-xs px-2 py-1.5 rounded-lg hover:bg-bg-soft">{s2tr.traitCancel}</button>
          </div>
        )}

        {/* Preset suggestions */}
        <div>
          <p className="text-xs text-muted mb-1.5">{s2tr.quickAdd}</p>
          <div className="flex flex-wrap gap-1.5">
            {TRAIT_PRESETS.filter(p => !traits.includes(p)).map(p => (
              <button
                key={p}
                onClick={() => addPresetTrait(p)}
                className="text-[11px] text-muted border border-line px-2.5 py-0.5 rounded-full hover:border-primary hover:text-primary transition-colors"
              >
                + {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 外型設定 */}
      <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
        <button
          onClick={() => setShowAppearance(v => !v)}
          className="w-full flex items-center justify-between p-5 hover:bg-bg-soft transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users size={16} className="text-primary" />
            <span className="text-sm font-semibold text-ink">{s2tr.appearanceTitle}</span>
            <span className="text-xs text-muted">{s2tr.appearanceSubtitle}</span>
          </div>
          <div className="flex items-center gap-2">
            {Object.values(appearance).filter(Boolean).length > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-medium">
                {s2tr.appearanceSet} {Object.values(appearance).filter(Boolean).length} 項
              </span>
            )}
            <ChevronDown size={16} className={`text-muted transition-transform ${showAppearance ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showAppearance && (
          <div className="px-5 pb-5 border-t border-line pt-4 space-y-4">
            {appearanceRows.map(row => (
              <div key={row.key}>
                <label className="text-xs font-semibold text-ink mb-1.5 block">{row.label}</label>
                <div className="flex flex-wrap gap-1.5">
                  {row.opts.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setApp(row.key, opt)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        appearance[row.key] === opt
                          ? 'bg-primary text-white border-primary'
                          : 'border-line text-muted hover:border-primary hover:text-primary bg-bg-soft'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Free text supplement */}
            <div>
              <label className="text-xs font-semibold text-ink mb-1.5 block">{s2tr.supplement}</label>
              <textarea
                className="w-full border border-line rounded-lg px-3 py-2 text-xs bg-bg-soft focus:outline-none focus:border-primary resize-none"
                rows={2}
                placeholder={s2tr.supplementPlaceholder}
                value={appearance.extraNote}
                onChange={e => setAppText('extraNote', e.target.value)}
              />
            </div>

            {/* Preview summary */}
            {Object.entries(appearance).some(([k, v]) => k !== 'extraNote' && v) && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-xs text-primary font-semibold mb-1">{s2tr.appearancePreview}</p>
                <p className="text-xs text-ink leading-relaxed">{buildAppearanceSummary(appearance)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* D3: AI 角色一致性圖像生成 → 生成 front → 設為頭像自動串連其餘三角度 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={15} className="text-primary" />
          <label className="text-sm font-semibold text-ink">AI 生成一致性角色圖</label>
        </div>
        <p className="text-xs text-muted mb-3">
          根據外貌設定生成一致性 front 圖；設為頭像後自動串連生成四分三面、側面、背面。
        </p>

        {/* ① 似度選項（已固定為 70%，隱藏 UI）*/}
        {/* STEP 1: similarity 三檔實測分唔開（50% 仍同樣面孔），固定 mid。UI 隱藏，data/state 保留供將來恢復。*/}

        {/* ② 頭像預覽 + 生成按鈕 */}
        <div className="flex gap-3 items-start mb-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-line flex-shrink-0 bg-primary/5 flex items-center justify-center">
            {img ? (
              <img src={img} alt="current avatar" className="w-full h-full object-cover" />
            ) : (
              <Users size={22} className="text-primary/30" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-[11px] text-muted leading-snug">
              {buildAppearanceSummary(appearance) || '請先在「外型設定」填寫角色外貌特徵，再生成圖像。'}
            </p>
            <button
              onClick={async () => {
                const prompt = buildAppearanceSummary(appearance);
                if (!prompt) { setImageGenError('請先填寫角色外貌設定。'); return; }
                setImageGenLoading(true);
                setImageGenResult(null);
                setImageGenError(null);
                try {
                  // STEP 1: similarity 固定 70%（mid），唔再讀 angleSimMode
                  // Merge avatar (img) + refs[], deduplicate, cap at 3
                  const allRefs = [...new Set([img, ...(refs ?? [])].filter(Boolean))].slice(0, 3);
                  const body: Record<string, unknown> = {
                    appearanceSummary: prompt,
                    charName: name,
                    age,
                    role,
                    projectId: projectId ?? 'global',
                    similarity: '70%', // fixed mid
                  };
                  if (allRefs.length > 0) body.referenceImageUrls = allRefs;
                  console.log('[imageGen] calling /api/ai/image-gen (front only), body keys=', Object.keys(body));
                  const res = await fetch('/api/ai/image-gen', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                  });
                  const data = await res.json() as { ok: boolean; fileUrl?: string; error?: string };
                  console.log('[imageGen] result ok=', data.ok, 'fileUrl=', data.fileUrl?.slice(0, 60));
                  if (!data.ok || !data.fileUrl) throw new Error(data.error ?? 'Generation failed');
                  setImageGenResult(data.fileUrl);
                } catch (e) {
                  setImageGenError(e instanceof Error ? e.message : '生成失敗，請稍後再試。');
                } finally {
                  setImageGenLoading(false);
                }
              }}
              disabled={imageGenLoading || isLoopRunning}
              className="flex items-center gap-1.5 bg-primary text-white text-xs px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
            >
              {imageGenLoading
                ? <><RefreshCw size={12} className="animate-spin" /> 生成中…</>
                : <><Sparkles size={12} /> 生成一致性角色圖</>
              }
            </button>
          </div>
        </div>

        {/* Error */}
        {imageGenError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs text-red-700 flex items-center gap-2 mb-2">
            <AlertTriangle size={12} className="flex-shrink-0" /> {imageGenError}
          </div>
        )}

        {/* ③ 生成結果：設為頭像觸發串連 */}
        {imageGenResult && (
          <div className="border border-primary/30 rounded-xl overflow-hidden bg-primary/3">
            <img
              src={imageGenResult}
              alt="AI generated character"
              className="w-full max-h-64 object-contain cursor-pointer"
              onClick={() => setLightboxUrl(imageGenResult)}
            />
            <div className="flex gap-2 p-2">
              <button
                onClick={async () => {
                  console.log('[setAsAvatar] clicked, imageGenResult=', imageGenResult);
                  if (!imageGenResult) return;
                  const frontUrl = imageGenResult;
                  // (a) 設為主頭像（更新 draft img in-memory）
                  onImgChange?.(frontUrl);
                  setImageGenResult(null);
                  // (b) 即時更新 front 格為 done
                  setAngleMedia(prev => ({ ...prev, front: frontUrl }));
                  setAngleStatus(prev => ({ ...prev, front: 'done' }));
                  // (c-i) 寫 asset_media(role='front')
                  if (charId) {
                    fetch('/api/asset-media', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        asset_id: charId,
                        file_url: frontUrl,
                        role: 'front',
                        sort_order: 0,
                      }),
                    }).catch(e => console.warn('[setAsAvatar] asset_media front write failed:', e));
                  }
                  // (c-ii) BUG 2 FIX: 同步更新 characters 表 img 欄 (PATCH 單一欄位)
                  // onImgChange 已更新 draft in-memory；PATCH 令 D1 img 欄即時正確，
                  // 確保登出後 loadCharactersFromD1 讀回正確縮圖。
                  if (charId) {
                    fetch('/api/characters', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: charId, img: frontUrl }),
                    }).catch(e => console.warn('[setAsAvatar] characters img PATCH failed:', e));
                  }
                  // (d) FIX A+B: startRemainingAngles 先清掉舊三角度再以 frontUrl 串連重生
                  await startRemainingAngles(frontUrl);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white text-xs py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Check size={12} /> 設為頭像並生成其餘角度
              </button>
              <button
                onClick={() => { onRefsChange?.([...(refs ?? []), imageGenResult]); setImageGenResult(null); }}
                className="flex items-center justify-center gap-1.5 bg-bg-soft border border-line text-ink text-xs py-2 px-3 rounded-lg hover:border-primary transition-colors"
              >
                <Image size={12} /> 加入參考相
              </button>
              <button
                onClick={() => setImageGenResult(null)}
                className="px-2 text-muted hover:text-red-500 transition-colors"
                title="棄用"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
      {lightboxUrl && <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}

      {/* ── 角色設定圖（多角度）── */}
      {charId && (
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          {/* Header — no main generate button; triggered by 設為頭像 in section above */}
          <div className="flex items-center gap-2 mb-1">
            <Layers size={15} className="text-primary" />
            <span className="text-sm font-semibold text-ink">角色設定圖</span>
            {isAngleSetComplete && (
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Check size={9} /> 完整
              </span>
            )}
          </div>
          <p className="text-xs text-muted mb-3">
            設為頭像後自動生成四分三面、側面、背面；可個別重試失敗格。
          </p>

          {/* ── NO-FRONT BLOCK: show when front not yet set ── */}
          {angleStatus['front'] !== 'done' ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-line bg-bg-soft text-center">
              <Users size={28} className="text-muted/30" />
              <p className="text-xs text-muted leading-snug max-w-[220px]">
                請先在上方「一致性角色圖」生成正面圖，<br />
                然後點「設為頭像並生成其餘角度」。
              </p>
            </div>
          ) : (
            <>
              {/* ── 補齊橫額：front done 但有 idle 角度時顯示（離開再入後用）── */}
              {hasIdleRemainingAngles && !isLoopRunning && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-600" />
                    <span className="text-[11px] text-amber-800 font-medium">部分角度尚未生成</span>
                  </div>
                  <button
                    onClick={fillIdleAngles}
                    disabled={isLoopRunning || !buildAppearanceSummary(appearance)}
                    className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={10} /> 補齊其餘角度
                  </button>
                </div>
              )}

              {/* Progress bar — total reflects 3 remaining angles (three-quarter/side/back) */}
              {loopProgress && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] text-muted mb-1">
                    <span>生成中 {loopProgress.current}/{loopProgress.total}：{loopProgress.roleName}…</span>
                    <span>{Math.round((loopProgress.current - 1) / loopProgress.total * 100)}%</span>
                  </div>
                  <div className="w-full bg-bg-soft rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((loopProgress.current - 1) / loopProgress.total * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 2×2 angle grid */}
              <div className="grid grid-cols-2 gap-3">
                {CHAR_ANGLE_ROLES.map(r => {
                  const status = angleStatus[r] ?? 'idle';
                  const mediaUrl = angleMedia[r];
                  const errMsg = angleError[r];
                  const isFront = r === 'front';
                  return (
                    <div
                      key={r}
                      className={`rounded-xl border overflow-hidden flex flex-col ${
                        status === 'error' ? 'border-red-300 bg-red-50'
                        : status === 'done' ? 'border-primary/30 bg-primary/3'
                        : 'border-line bg-bg-soft'
                      }`}
                    >
                      {/* Image or placeholder */}
                      <div className="w-full aspect-[3/4] flex items-center justify-center bg-bg-soft relative overflow-hidden">
                        {mediaUrl ? (
                          <img
                            src={mediaUrl}
                            alt={CHAR_ANGLE_LABELS[r]}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setLightboxUrl(mediaUrl)}
                          />
                        ) : status === 'loading' ? (
                          <RefreshCw size={24} className="text-primary/40 animate-spin" />
                        ) : (
                          <Users size={24} className="text-muted/30" />
                        )}
                        {/* Loading overlay on top of existing image (re-gen) */}
                        {status === 'loading' && mediaUrl && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <RefreshCw size={20} className="text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      {/* Label + status + action row */}
                      <div className="px-2 py-1.5 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-[11px] font-semibold text-ink truncate">{CHAR_ANGLE_LABELS[r]}</span>
                          {isFront && (
                            <span className="text-[9px] text-muted/70 flex-shrink-0">(主頭像)</span>
                          )}
                        </div>
                        {status === 'done' && <Check size={11} className="text-green-500 flex-shrink-0" />}
                        {/* idle non-front: show individual generate button */}
                        {status === 'idle' && !isFront && (
                          <button
                            onClick={() => retryAngle(r)}
                            disabled={isLoopRunning || !buildAppearanceSummary(appearance)}
                            className="text-[10px] flex items-center gap-0.5 text-primary hover:text-primary/80 font-medium flex-shrink-0 disabled:opacity-40"
                          >
                            <Sparkles size={10} /> 生成
                          </button>
                        )}
                        {/* error non-front: retry button */}
                        {status === 'error' && !isFront && (
                          <button
                            onClick={() => retryAngle(r)}
                            disabled={isLoopRunning}
                            className="text-[10px] flex items-center gap-0.5 text-red-600 hover:text-red-800 font-medium flex-shrink-0 disabled:opacity-40"
                            title={errMsg}
                          >
                            <RefreshCw size={10} /> 重試
                          </button>
                        )}
                        {/* front angle: no action button — set via 一致性角色圖 section */}
                      </div>
                      {status === 'error' && errMsg && (
                        <p className="px-2 pb-1.5 text-[10px] text-red-500 leading-tight line-clamp-2">{errMsg}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// S2: 主要角色設定（修正三四：多角色陣容管理）
// 頂部角色陣容橫向卡列表，點擊切換展開編輯器
// 支援新增/編輯/刪除；所有角色存入 store 供 S3/S4 讀取
// ─────────────────────────────────────────

// 本地角色草稿類型（含姓名、定位等可編輯欄位）
type CharDraft = {
  id: string;
  img: string;       // 頭像 URL（R2 fileUrl 或 Unsplash，空字串顯示佔位符）
  refs: string[];    // 參考相 URL 陣列（R2 fileUrl）
  name: string;
  role: string;
  age: string;
  bg: string;
  gender?: 'male' | 'female' | 'other'; // 性別
  roleTag: 'lead' | 'support' | 'extra';
  similarity: string;
  traits: string[];
  appearance: AppearanceOptions;
};

const newCharDraft = (id: string, similarity: string): CharDraft => ({
  id, img: '', refs: [], name: '', role: '', age: '', bg: '',
  gender: undefined,
  roleTag: 'support', similarity,
  traits: [], appearance: { ...DEFAULT_APPEARANCE },
});

function S2CharacterSetup({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const s2tr = tr.creator.drama.s2;

  const { characters: storedCharacters, setCharacters: storeSetCharacters } = useProjectStore();

  // 初始角色草稿：store 有資料則還原，否則 live 模式空陣列，mock 模式保留示範
  const buildDefaultDrafts = (): CharDraft[] => {
    if (storedCharacters.length > 0) {
      return storedCharacters.map(c => ({
        id: c.id,
        img: c.img ?? '',                                              // Fix C: 讀回頭像
        refs: c.refs ?? [],                                            // Fix C: 讀回參考相
        name: c.name_i18n['zh-HK'],
        role: c.identityTag_i18n['zh-HK'],
        age: c.age ?? '',                                              // Fix C: 讀回年齡
        gender: c.gender,                                              // 讀回性別
        bg: c.traitsConflict_i18n['zh-HK'],
        roleTag: 'support' as const,
        similarity: c.similarityLevel ?? s2tr.simSeventyPct,
        traits: c.personality ?? [],
        appearance: (c.appearanceOptions as AppearanceOptions) ?? { ...DEFAULT_APPEARANCE },
      }));
    }
    // live 模式：開場空白，由用戶自行建立角色
    if (import.meta.env.VITE_AI_MODE === 'live') return [];
    // mock/dev 模式：保留示範角色幫助預覽 UI
    return [
      {
        id: 'char-1',
        img: 'https://images.unsplash.com/photo-1546961342-ea5f62d5a27b?w=200&h=200&fit=crop',
        refs: [],
        name: '陳伯（陳錦榮）',
        role: '街市豬肉檔主',
        age: '68歲',
        bg: '四十年老街坊，年輕時有廚師夢',
        roleTag: 'lead' as const,
        similarity: s2tr.simVeryClose,
        traits: ['重情義', '傳統', '固執', '沉默寡言', '善解人意'],
        appearance: {
          height: '中等身高', build: '壯實', skin: '古銅色',
          hair: '直髮', hairColor: '全白', hairLength: '短髮',
          face: '方臉', eyes: '眼神溫和', eyewear: '無眼鏡',
          facial: '短鬚', posture: '昂首挺胸', style: '廚師圍裙',
          extraNote: '雙手粗糙有力，慣穿藍色圍裙',
        },
      },
      {
        id: 'char-2',
        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        refs: [],
        name: '阿明（李志明）',
        role: '廚藝班學員',
        age: '28歲',
        bg: '熱愛烹飪，新開廚藝班',
        roleTag: 'support' as const,
        similarity: s2tr.simSeventyPct,
        traits: ['開朗樂觀', '勵志', '勇於嘗試', '好勝', '念舊'],
        appearance: {
          height: '高挑', build: '纖細', skin: '白皙',
          hair: '直髮', hairColor: '黑色', hairLength: '短髮',
          face: '瓜子臉', eyes: '眼神銳利', eyewear: '細框眼鏡',
          facial: '無鬚', posture: '輕鬆隨意', style: '廚師圍裙',
          extraNote: '手腕有小廚刀紋身',
        },
      },
    ];
  };

  const [drafts, setDrafts] = useState<CharDraft[]>(buildDefaultDrafts);
  const [activeId, setActiveId] = useState<string>(() => buildDefaultDrafts()[0]?.id ?? '');
  const [saveCharError, setSaveCharError] = useState<string>('');
  const [isSavingChar, setIsSavingChar] = useState(false);

  // 將 drafts 陣列轉換為 CharacterCard[] 寫入 store（即時同步）
  const draftsToCards = (ds: CharDraft[]): CharacterCard[] =>
    ds.map(d => ({
      id: d.id,
      name_i18n: { 'zh-HK': d.name, en: d.name, 'zh-CN': d.name },
      identityTag_i18n: { 'zh-HK': d.role, en: d.role, 'zh-CN': d.role },
      coreDesire_i18n: { 'zh-HK': '', en: '', 'zh-CN': '' },
      traitsConflict_i18n: { 'zh-HK': d.bg, en: d.bg, 'zh-CN': d.bg },
      arc_i18n: { 'zh-HK': '', en: '', 'zh-CN': '' },
      speechStyle_i18n: { 'zh-HK': '', en: '', 'zh-CN': '' },
      relations_i18n: { 'zh-HK': '', en: '', 'zh-CN': '' },
      appearancePrompt_zh: buildAppearanceSummary(d.appearance),
      appearancePrompt_en: buildAppearanceSummary(d.appearance),
      personality: d.traits,
      appearanceOptions: d.appearance,
      similarityLevel: d.similarity,
      humanEdited: false,
      age: d.age,       // Fix C: 持久化年齡
      gender: d.gender, // 性別
      img: d.img,       // Fix C: 持久化頭像
      refs: d.refs,     // Fix C: 持久化參考相
    }));

  // 每個角色卡的欄位回調更新至 drafts state + 即時同步 projectStore
  const updateDraft = (id: string, patch: Partial<CharDraft>) => {
    setDrafts(prev => {
      const next = prev.map(d => d.id === id ? { ...d, ...patch } : d);
      storeSetCharacters(draftsToCards(next)); // Fix 3: 即時同步
      return next;
    });
  };

  const addCharacter = () => {
    const id = `char-${Date.now()}`;
    const newDraft = newCharDraft(id, s2tr.simSeventyPct);
    setDrafts(prev => {
      const next = [...prev, newDraft];
      storeSetCharacters(draftsToCards(next)); // Fix 3: 即時同步
      return next;
    });
    setActiveId(id);
  };

  const deleteCharacter = (id: string) => {
    setDrafts(prev => {
      const next = prev.filter(d => d.id !== id);
      if (activeId === id && next.length > 0) setActiveId(next[0].id);
      storeSetCharacters(draftsToCards(next)); // Fix 3: 即時同步
      return next;
    });
  };

  const { user: authUser } = useAuthStore();
  const { projectId: pid, projectTitle: ptitle, outline: storedOutline } = useProjectStore();

  // S2 mount 時：如果 store characters 空，從 D1 拉返（换機登入場景）
  // 不覆蓋已有資料（storedCharacters.length > 0 則 buildDefaultDrafts 已還原）
  useEffect(() => {
    if (!pid || storedCharacters.length > 0) return; // 已有資料，不重複載入
    loadCharactersFromD1(pid)
      .then(chars => {
        if (chars.length > 0) {
          storeSetCharacters(chars);
          // 換機返回：用 D1 chars 重建 drafts state
          const restoredDrafts: CharDraft[] = chars.map(c => ({
            id: c.id,
            img: c.img ?? '',
            refs: c.refs ?? [],
            name: c.name_i18n['zh-HK'],
            role: c.identityTag_i18n['zh-HK'],
            age: c.age ?? '',
            gender: c.gender,
            bg: c.traitsConflict_i18n['zh-HK'],
            roleTag: 'support' as const,
            similarity: c.similarityLevel ?? s2tr.simSeventyPct,
            traits: c.personality ?? [],
            appearance: (c.appearanceOptions as AppearanceOptions) ?? { ...DEFAULT_APPEARANCE },
          }));
          setDrafts(restoredDrafts);
          setActiveId(restoredDrafts[0]?.id ?? '');
        }
      })
      .catch(e => console.warn('[S2 mount] loadCharactersFromD1 failed:', e));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]); // 只在 pid 變時觸發一次

  const handleSaveAndNext = () => {
    // draftsToCards 已包含所有欄位（含 appearancePrompt_en）
    const chars = draftsToCards(drafts);
    storeSetCharacters(chars);
    // 只用 saveCharactersToD1（獨立表，全覆寫）— 唔再雙寫 saveProjectToD1 characters
    // saveProjectToD1 只管 story_material / series_context，唔傳 characters
    saveCharactersToD1(pid, chars)
      .catch(e => console.warn('[S2 handleSaveAndNext] saveCharactersToD1 failed:', e));
    onNext();
  };

  const activeDraft = drafts.find(d => d.id === activeId) ?? drafts[0];

  const roleTagColors: Record<string, string> = {
    lead: 'bg-primary text-white',
    support: 'bg-blue-100 text-blue-700',
    extra: 'bg-gray-100 text-gray-600',
  };
  const roleTagLabels: Record<string, string> = {
    lead: s2tr.roleTagLead,
    support: s2tr.roleTagSupport,
    extra: s2tr.roleTagExtra,
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* 標題 */}
      <div className="mb-2">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3">
          <Users size={12} /> S2
        </div>
        <h2 className="text-2xl font-bold text-primary">{s2tr.title}</h2>
        <p className="text-muted text-sm mt-1">{s2tr.subtitle}</p>
      </div>

      {/* ── 角色陣容（電影 cast 大頭橫向捲動）── */}
      <div className="bg-card rounded-xl border border-line shadow-card p-4">
        <div className="mb-3">
          <p className="text-sm font-semibold text-ink">{s2tr.castTitle}</p>
          <p className="text-xs text-muted mt-0.5">{s2tr.castSubtitle}</p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3">
          {drafts.map(d => {
            const isActive = d.id === activeId;
            return (
              <button
                key={d.id}
                onClick={() => setActiveId(d.id)}
                className={`flex-shrink-0 flex flex-col rounded-xl border-2 transition-all overflow-hidden relative group cursor-pointer w-36 ${
                  isActive
                    ? 'border-primary shadow-md'
                    : 'border-line hover:border-primary/40'
                }`}
              >
                {/* 大頭肖像圖 */}
                <div className="w-full h-44 bg-bg-soft flex items-center justify-center overflow-hidden">
                  {d.img ? (
                    <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={36} className="text-muted/40" />
                  )}
                </div>
                {/* 角色資料 */}
                <div className={`px-2 py-2 flex flex-col gap-0.5 ${isActive ? 'bg-primary/5' : 'bg-card'}`}>
                  <p className="text-sm font-semibold text-ink leading-tight line-clamp-1">
                    {d.name || s2tr.charNameFallback}
                  </p>
                  <p className="text-xs text-muted leading-tight line-clamp-1">
                    {d.role || roleTagLabels[d.roleTag]}
                  </p>
                </div>
                {/* 刪除按鈕（hover 顯示）*/}
                {drafts.length > 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); deleteCharacter(d.id); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title={s2tr.deleteChar}
                  >
                    <X size={11} />
                  </button>
                )}
              </button>
            );
          })}

          {/* ＋ 新增角色卡片 */}
          <button
            onClick={addCharacter}
            className="flex-shrink-0 w-36 h-[calc(11rem+3.5rem)] flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line hover:border-primary/60 hover:bg-primary/5 transition-all text-muted hover:text-primary cursor-pointer"
          >
            <Plus size={24} />
            <span className="text-xs font-semibold">{s2tr.addChar}</span>
          </button>
        </div>
      </div>

      {/* ── 完整角色編輯器（顯示目前選中角色）── */}
      {activeDraft && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${roleTagColors[activeDraft.roleTag]}`}>
              {roleTagLabels[activeDraft.roleTag]}
            </span>
            <span className="text-sm font-semibold text-ink">{activeDraft.name || s2tr.charNameFallback}</span>
            {/* D1: 個別角色儲存按鈕 — 改用 saveCharactersToD1（獨立表，全覆寫）*/}
            <button
              onClick={async () => {
                const chars = draftsToCards(drafts);
                storeSetCharacters(chars);
                setSaveCharError('');
                setIsSavingChar(true);
                try {
                  await saveCharactersToD1(pid, chars);
                } catch (e) {
                  setSaveCharError(e instanceof Error ? e.message : '保存失敗，請稍後重試');
                } finally {
                  setIsSavingChar(false);
                }
              }}
              disabled={isSavingChar}
              className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-lg hover:bg-primary/20 transition-colors font-medium disabled:opacity-50"
              title="儲存此角色至 D1"
            >
              {isSavingChar
                ? <><RefreshCw size={10} className="animate-spin" /> 儲存中…</>
                : <><Save size={10} /> 儲存此角色</>
              }
            </button>
            {/* 定位切換 */}
            <div className="ml-auto flex gap-1">
              {(['lead', 'support', 'extra'] as const).map(rt => (
                <button
                  key={rt}
                  onClick={() => updateDraft(activeDraft.id, { roleTag: rt })}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                    activeDraft.roleTag === rt
                      ? 'border-primary bg-primary text-white'
                      : 'border-line text-muted hover:border-primary'
                  }`}
                >
                  {roleTagLabels[rt]}
                </button>
              ))}
            </div>
          </div>
          <CharacterProfileCard
            img={activeDraft.img}
            refs={activeDraft.refs}
            name={activeDraft.name}
            role={activeDraft.role}
            age={activeDraft.age}
            bg={activeDraft.bg}
            gender={activeDraft.gender}
            onGenderChange={g => updateDraft(activeDraft.id, { gender: g })}
            similarity={activeDraft.similarity}
            setSimilarity={v => updateDraft(activeDraft.id, { similarity: v })}
            mode="drama"
            initialTraits={activeDraft.traits}
            initialAppearance={activeDraft.appearance}
            onTraitsChange={ts => updateDraft(activeDraft.id, { traits: ts })}
            onAppearanceChange={ap => updateDraft(activeDraft.id, { appearance: ap })}
            onNameChange={v => updateDraft(activeDraft.id, { name: v })}
            onRoleChange={v => updateDraft(activeDraft.id, { role: v })}
            onAgeChange={v => updateDraft(activeDraft.id, { age: v })}
            onBgChange={v => updateDraft(activeDraft.id, { bg: v })}
            onImgChange={url => updateDraft(activeDraft.id, { img: url })}
            onRefsChange={urls => updateDraft(activeDraft.id, { refs: urls })}
            onSaveChar={async () => {
              const chars = draftsToCards(drafts);
              storeSetCharacters(chars);
              setSaveCharError('');
              try {
                await saveCharactersToD1(pid, chars);
              } catch (e) {
                setSaveCharError(e instanceof Error ? e.message : '保存失敗，請稍後重試');
              }
            }}
            projectId={pid}
            charId={activeDraft.id}
            userId={authUser?.id ?? 'anonymous'}
          />
        </div>
      )}

      {/* 保存角色 D1 error banner */}
      {saveCharError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-xs text-red-700">
          <AlertTriangle size={14} className="flex-shrink-0" />
          <span>{saveCharError}</span>
          <button onClick={() => setSaveCharError('')} className="ml-auto text-red-400 hover:text-red-600"><X size={12} /></button>
        </div>
      )}

      {/* CTA */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-green-800">{s2tr.confirmBtn}</p>
          <p className="text-xs text-green-600 mt-0.5">
            {drafts.length > 0
              ? `已建立 ${drafts.length} 個角色，個性特質和外型細節將自動帶入 S3 故事生成。`
              : s2tr.noCharHint}
          </p>
        </div>
        <button
          onClick={handleSaveAndNext}
          className="shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
        >
          <ChevronRight size={15} />
          儲存全部角色並繼續下一步
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main Component
// Route index map (12 items):
//   0  = S0SeriesSetup
//   1  = PlanOverview          (策劃案總覽，導覽列有視覺標記，isPlanOverview)
//   2  = S1AssetBank           → nav 1
//   3  = S2CharacterSetup      → nav 2
//   4  = S3StoryFramework      → nav 3
//   5  = SeriesAestheticLock   (全劇美學鎖，導覽列有視覺標記，isAestheticLock)
//   6  = S4Storyboard          → nav 4
//   7  = S5Keyframes           → nav 5
//   8  = S6VideoGen            → nav 6
//   9  = S7Voiceover           → nav 7
//  10  = S8PlatformEdit        → nav 8
//  11  = S9ReviewPublish       → nav 9
// ─────────────────────────────────────────
const STEPS = [
  S0SeriesSetup,        // 0
  PlanOverview,         // 1 (策劃案總覽，isPlanOverview)
  S1AssetBank,          // 2 → nav 1
  S2CharacterSetup,     // 3 → nav 2
  S3StoryFramework,     // 4 → nav 3
  SeriesAestheticLock,  // 5 (全劇美學鎖，isAestheticLock)
  S4Storyboard,         // 6 → nav 4
  S5Keyframes,          // 7 → nav 5
  S6VideoGen,           // 8 → nav 6
  S7Voiceover,          // 9 → nav 7
  S8PlatformEdit,       // 10 → nav 8
  S9ReviewPublish,      // 11 → nav 9
];

// routeStep 轉 navStep：
// route 0 → nav 0 (S0)
// route 1 → nav 0 (PlanOverview，isPlanOverview flag)
// route 2 → nav 1 (S1AssetBank)
// route 3 → nav 2 (S2CharacterSetup)
// route 4 → nav 3 (S3StoryFramework)
// route 5 → nav 3 (SeriesAestheticLock，isAestheticLock flag，navStep 停在 3)
// route 6 → nav 4 (S4Storyboard)
// route 7 → nav 5 (S5Keyframes)
// route 8 → nav 6 (S6VideoGen)
// route 9 → nav 7 (S7Voiceover)
// route 10 → nav 8 (S8PlatformEdit)
// route 11 → nav 9 (S9ReviewPublish)
function routeStepToNavStep(routeStep: number): number {
  if (routeStep <= 1) return 0;          // S0 / PlanOverview
  if (routeStep <= 4) return routeStep - 1; // S1→1, S2→2, S3→3
  if (routeStep === 5) return 3;         // SeriesAestheticLock：navStep 停在 3
  return routeStep - 2;                  // S4(6)→4, S5(7)→5 … S9(11)→9
}

// navStep 轉 routeStep（導覽列點擊）：
// nav 0 → route 0 (S0)
// nav 1 → route 2 (S1)
// nav 2 → route 3 (S2)
// nav 3 → route 4 (S3)
// nav 4 → route 6 (S4，跳過 route 5 SeriesAestheticLock)
// nav 5 → route 7 (S5)
// nav 6 → route 8 (S6)
// nav 7 → route 9 (S7)
// nav 8 → route 10 (S8)
// nav 9 → route 11 (S9)
function navStepToRouteStep(navStep: number): number {
  if (navStep === 0) return 0;
  if (navStep <= 3) return navStep + 1;  // nav 1→2(S1), nav 2→3(S2), nav 3→4(S3)
  return navStep + 2;                   // nav 4→6(S4), nav 5→7(S5) … nav 9→11(S9)
}

export default function DramaWorkflow() {
  const { step } = useParams();
  const navigate = useNavigate();
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const [mobilePanel, setMobilePanel] = useState<'steps' | 'ai' | null>(null);

  const routeStep = Math.min(parseInt(step ?? '0', 10), 11);
  const StepComponent = STEPS[routeStep];

  // isPlanOverview: route 1 是策劃案總覽，導覽列 navStep 維持在 0 但顯示視覺標記
  const isPlanOverview = routeStep === 1;
  // isAestheticLock: route 5 是全劇美學鎖，導覽列 navStep 維持在 3 但顯示視覺標記
  const isAestheticLock = routeStep === 5;
  const navStep = routeStepToNavStep(routeStep);

  const goNext = () => navigate(`/creator/drama/${Math.min(routeStep + 1, 11)}`);

  // Determine series title for header
  const { projectTitle, projectId: currentProjectId } = useProjectStore();

  // 未選項目時 redirect 回 ProjectHub
  if (!currentProjectId) {
    return <Navigate to="/creator/projects" replace />;
  }

  const headerTitle = routeStep === 0 ? tr.creator.modeSelect.dramaTitle : (projectTitle || tr.creator.modeSelect.dramaTitle);

  const stepNavProps = {
    mode: 'drama' as const,
    currentStep: navStep,
    isPlanOverview,
    isAestheticLock,
    onStepClick: (s: number) => { navigate(`/creator/drama/${navStepToRouteStep(s)}`); setMobilePanel(null); },
    onPlanOverviewClick: () => { navigate('/creator/drama/1'); setMobilePanel(null); },
    onAestheticLockClick: () => { navigate('/creator/drama/5'); setMobilePanel(null); },
  };

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      {/* Desktop sidebar — hidden on mobile, CreatorSidebar handles its own mobile top bar */}
      <CreatorSidebar />

      <div className="flex flex-col flex-1 overflow-hidden md:ml-0">
        {/* Header — desktop only (mobile uses CreatorSidebar's top bar) */}
        <header className="hidden md:flex bg-card border-b border-line px-6 py-3 items-center gap-4 shrink-0">
          <Logo size="sm" withWordmark />
          <span className="text-primary font-bold">{tr.creator.modeSelect.dramaTitle}</span>
          <span className="text-muted text-sm">· {headerTitle}</span>
          <div className="ml-auto flex items-center gap-3">
            <Heart size={16} className="text-accent" />
            <span className="text-xs text-muted">{tr.creator.credits} 842</span>
          </div>
        </header>

        {/* Mobile: spacer for fixed top bar from CreatorSidebar */}
        <div className="md:hidden h-12 shrink-0" />

        <div className="flex flex-1 overflow-hidden">
          {/* Step nav — desktop only */}
          <div className="hidden md:block w-48 shrink-0 bg-card border-r border-line overflow-y-auto">
            <StepNavigation {...stepNavProps} />
          </div>

          {/* Canvas */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
            <StepComponent onNext={goNext} />
          </main>

          {/* AI Assistant — desktop only */}
          <aside className="hidden md:block w-72 shrink-0 overflow-hidden">
            <AIAssistantPanel />
          </aside>
        </div>
      </div>

      {/* Mobile bottom toolbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-line flex items-stretch h-14 safe-area-pb">
        <button
          onClick={() => setMobilePanel(v => v === 'steps' ? null : 'steps')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${mobilePanel === 'steps' ? 'text-primary' : 'text-muted'}`}
        >
          <Layers size={20} />
          <span>步驟</span>
        </button>
        <button
          onClick={goNext}
          className="flex-none mx-3 my-2 bg-primary text-white rounded-xl px-6 text-sm font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
        >
          下一步
        </button>
        <button
          onClick={() => setMobilePanel(v => v === 'ai' ? null : 'ai')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${mobilePanel === 'ai' ? 'text-primary' : 'text-muted'}`}
        >
          <Sparkles size={20} />
          <span>AI助理</span>
        </button>
      </div>

      {/* Mobile step nav sheet */}
      {mobilePanel === 'steps' && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobilePanel(null)} />
          <div className="relative bg-card rounded-t-2xl shadow-xl max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <span className="font-semibold text-ink text-sm">選擇步驟</span>
              <button onClick={() => setMobilePanel(null)} className="text-muted hover:text-ink p-1">
                <X size={18} />
              </button>
            </div>
            <StepNavigation {...stepNavProps} />
          </div>
        </div>
      )}

      {/* Mobile AI assistant sheet */}
      {mobilePanel === 'ai' && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobilePanel(null)} />
          <div className="relative bg-card rounded-t-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <span className="font-semibold text-ink text-sm">AI 創作助理</span>
              <button onClick={() => setMobilePanel(null)} className="text-muted hover:text-ink p-1">
                <X size={18} />
              </button>
            </div>
            <AIAssistantPanel />
          </div>
        </div>
      )}
    </div>
  );
}
