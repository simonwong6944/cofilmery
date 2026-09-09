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
  AppearanceOptions, DEFAULT_APPEARANCE,
  buildAppearanceSummary,
} from '@/components/shared/appearanceConstants';
import { SeriesAestheticLock } from './stages/SeriesAestheticLock';
import { CharacterProfileCard } from '@/components/shared/CharacterProfileCard';
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
