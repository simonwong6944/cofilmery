import { useState, useRef, useCallback, useEffect } from 'react';
import { AestheticComposer, type AestheticOutput } from '@/components/shared/AestheticComposer';
import {
  S1bOutline, S1cEpisodes,
  StageProgress, type ArchitectSubStage,
} from '@/components/shared/StoryArchitect';
import type { CharacterCard, EpisodeStoryCard, SeriesContext } from '@/adapters/types';
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
import { saveProjectToD1, saveArchitectToD1, saveCharactersToD1, loadCharactersFromD1, saveSponsorAssetsToD1, loadSponsorAssetsFromD1 } from '@/adapters';
import type { SelectedSponsorAsset } from '@/adapters/types';
import { VideoGenPanel } from '@/components/shared/VideoGenPanel';
import { useTts } from '@/hooks/useTts';
import {
  AlertTriangle, RefreshCw, Check, Mic, Save, ChevronDown, ChevronRight,
  Sparkles, Image, Film, Music, Edit3, Upload, Zap, Eye, Send,
  Heart, Clock, Star, Users, BookOpen, Camera, Car, UtensilsCrossed,
  ShoppingBag, MapPin, Gift, Plus, X, Info, Tag, Building2, Package, Trash2
} from 'lucide-react';

// ─────────────────────────────────────────
// Shared: ImageLightbox
// ─────────────────────────────────────────
function ImageLightbox({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X size={28} />
      </button>
      <img
        src={url}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

// ─────────────────────────────────────────
// S0: 系列設定
// ─────────────────────────────────────────
function S0SeriesSetup({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const { setProjectId, setContext, projectId, context } = useProjectStore();
  const { user } = useAuthStore();
  const [seriesName, setSeriesName] = useState('');
  const [episodeCount, setEpisodeCount] = useState(30);
  const [duration, setDuration] = useState('60秒');
  const [genre, setGenre] = useState('');
  const [tone, setTone] = useState('');
  const [need, setNeed] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── 掛載回填：從 store.context 同步 local state（僅首次有值時執行一次）──
  // 使用 hydratedRef 避免蓋掉使用者正在編輯的輸入
  const s0HydratedRef = useRef(false);
  useEffect(() => {
    if (s0HydratedRef.current) return; // 已回填過，不再覆蓋
    if (!context) return;              // async load 尚未完成，等下次 dep 觸發
    s0HydratedRef.current = true;
    if (context.seriesTitle)   setSeriesName(context.seriesTitle);
    if (context.genre)         setGenre(context.genre);
    if (context.tone)          setTone(context.tone);
    if (context.coreNeed)      setNeed(context.coreNeed);
    if (context.episodeCount)  setEpisodeCount(context.episodeCount);
    if (context.durationLabel) setDuration(context.durationLabel);
  }, [context]);

  const genreIcons = ['🌟','💛','👨‍👩‍👧‍👦','🌺','🕰️','🤝'];
  const genres = tr.creator.drama.s0.genres.map((g, i) => ({
    id: ['dream','love','family','restart','nostalgia','hero'][i],
    icon: genreIcons[i], label: g.label, desc: g.desc,
  }));

  const toneIcons = ['😌','🥲','😊','💛','🌱','💔'];
  const tones = tr.creator.drama.s0.tones.map((t, i) => ({
    id: ['warm','touching','light','nostalgic','inspiring','healing'][i],
    icon: toneIcons[i], label: t.label, desc: t.desc,
  }));

  const needs = tr.creator.drama.s0.needs.map((n, i) => ({
    id: ['seen','connected','reconcile','possible'][i],
    label: n.label, desc: n.desc,
  }));

  const durations = tr.creator.drama.s0.durations;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s0.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s0.subtitle}</p>
      </div>

      <div className="space-y-6">
        {/* 劇集名稱 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-2">{tr.creator.drama.s0.seriesNameLabel}</label>
          <input
            className="w-full border border-line rounded-lg px-3 py-2.5 bg-bg-soft focus:outline-none focus:border-primary text-ink"
            placeholder="例：街市情緣、阿婆的裁縫心事"
            value={seriesName}
            onChange={e => setSeriesName(e.target.value)}
          />
        </div>

        {/* 題材類型 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-3">{tr.creator.drama.s0.genreLabel}</label>
          <div className="grid grid-cols-2 gap-3">
            {genres.map(g => (
              <button
                key={g.id}
                onClick={() => setGenre(g.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  genre === g.id
                    ? 'border-primary bg-primary/5'
                    : 'border-line hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{g.icon}</span>
                  <span className="font-semibold text-sm text-ink">{g.label}</span>
                </div>
                <p className="text-xs text-muted">{g.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 情感基調 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-3">{tr.creator.drama.s0.toneLabel}</label>
          <div className="grid grid-cols-3 gap-2">
            {tones.map(t => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  tone === t.id
                    ? 'border-accent bg-accent/5'
                    : 'border-line hover:border-accent/40'
                }`}
              >
                <div className="text-xl mb-1">{t.icon}</div>
                <div className="font-semibold text-xs text-ink">{t.label}</div>
                <div className="text-xs text-muted mt-0.5 leading-tight">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 核心情感需求 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-1">{tr.creator.drama.s0.needLabel}</label>
          <p className="text-xs text-muted mb-3">{tr.creator.drama.s0.needSubtitle}</p>
          <div className="grid grid-cols-2 gap-2">
            {needs.map(n => (
              <button
                key={n.id}
                onClick={() => setNeed(n.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  need === n.id
                    ? 'border-primary bg-primary/5'
                    : 'border-line hover:border-primary/30'
                }`}
              >
                <div className="font-semibold text-sm text-ink">{n.label}</div>
                <div className="text-xs text-muted mt-0.5">{n.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 集數 + 時長 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                {tr.creator.drama.s0.episodeLabel}
              </label>
              <input
                type="range" min={5} max={70} value={episodeCount}
                onChange={e => setEpisodeCount(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-sm text-primary font-semibold mt-1">{tr.creator.drama.s0.episodeSelected}{episodeCount} {tr.creator.drama.s0.episodeUnit}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">{tr.creator.drama.s0.durationLabel}</label>
              <div className="grid grid-cols-2 gap-1.5">
                {durations.map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      duration === d
                        ? 'border-primary bg-primary text-white'
                        : 'border-line text-muted hover:border-primary'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 目標受眾 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-3">{tr.creator.drama.s0.audienceLabel}</label>
          <div className="flex flex-wrap gap-2">
            {['55–65 歲', '65–75 歲', '75 歲以上', '家庭觀眾（陪同長者）', '全港市民'].map(a => (
              <label
                key={a}
                className="flex items-center gap-2 bg-bg-soft border border-line rounded-lg px-3 py-2 cursor-pointer hover:border-primary"
              >
                <input type="checkbox" className="accent-primary"
                  defaultChecked={a === '65–75 歲' || a === '55–65 歲'} />
                <span className="text-sm text-ink">{a}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 品牌/商業背景 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-2">{tr.creator.drama.s0.brandLabel}</label>
          <textarea
            className="w-full border border-line rounded-lg px-3 py-2.5 bg-bg-soft focus:outline-none focus:border-primary text-sm text-ink resize-none"
            rows={2}
            placeholder="例：CoEldery 85 社企品牌，主打長者有價值、有貢獻；適合 ESG 贊助商植入⋯"
          />
        </div>

        {/* 提示 */}
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 flex gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-ink">{tr.creator.drama.s0.warningTitle}</p>
            <p className="text-sm text-muted mt-0.5">{tr.creator.drama.s0.warningDesc}</p>
          </div>
        </div>

        {/* 視覺提示：美學鎖在 S3 完成後才設定 */}
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-center gap-3">
          <Layers size={16} className="text-violet-500 shrink-0" />
          <p className="text-xs text-violet-700">全劇視覺風格（美學鎖）將在 S3 故事框架完成後統一設定，令視覺從第一格就緊扣故事。</p>
        </div>

        <button
          disabled={saving}
          onClick={async () => {
            setSaveError('');
            setSaving(true);
            // 儲存劇集標題 + 系列上下文到 projectStore
            const title = seriesName.trim() || tr.creator.drama.s0.seriesNameLabel;
            setProjectId(projectId, title);
            const ctx: SeriesContext = {
              seriesTitle: title,
              genre: genre || 'drama',
              tone: tone || 'warm',
              coreNeed: need || 'seen',
              episodeCount,
              durationLabel: duration,
              mode: 'drama',
            };
            setContext(ctx);
            // 同步寫入 D1 projects 表（upsert），失敗時顯示錯誤不繼續
            try {
              await saveProjectToD1({
                projectId,
                userId: user?.id ?? 'demo-user',
                title,
                mode: 'drama',
                storyMaterial: '',           // S0 無 storyMaterial；PlanOverview(route 1)才輸入
                seriesContext: JSON.stringify(ctx),
              });
              onNext();
            } catch (e) {
              setSaveError('儲存失敗，請稍後再試：' + (e instanceof Error ? e.message : String(e)));
            } finally {
              setSaving(false);
            }
          }}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <><RefreshCw size={18} className="animate-spin" /> 儲存中…</>
          ) : (
            <><ChevronRight size={18} /> {tr.creator.drama.s0.confirmBtn}</>
          )}
        </button>
        {saveError && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <AlertTriangle size={14} className="shrink-0" />
            {saveError}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 前置: 故事原材料輸入（修正一）
// 創作者輸入長者口述故事，AI 只做潤飾，不憑空生成
// ─────────────────────────────────────────
function PlanOverview({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const po = tr.creator.drama.planOverview;

  const { storyMaterial, setStoryMaterial, projectId: poProjectId, context: poContext } = useProjectStore();
  const { user: poUser } = useAuthStore();
  const [localMaterial, setLocalMaterial] = useState(storyMaterial);

  // ── 掛載回填：storyMaterial 可能在 async loadProject 後才灌入 store ──
  // hydratedRef 確保只在首次拿到非空值時同步一次，不蓋掉使用者已編輯的內容
  const poHydratedRef = useRef(false);
  useEffect(() => {
    if (poHydratedRef.current) return;
    if (!storyMaterial) return;
    poHydratedRef.current = true;
    setLocalMaterial(storyMaterial);
  }, [storyMaterial]);

  // 非同步存 D1 story_material（non-blocking，失敗只 warn）
  const persistMaterial = (material: string) => {
    if (!poProjectId) return;
    saveProjectToD1({
      projectId: poProjectId,
      userId: poUser?.id ?? 'demo-user',
      title: poContext?.seriesTitle ?? '未命名劇集',
      mode: 'drama',
      storyMaterial: material,
      seriesContext: poContext ? JSON.stringify(poContext) : undefined,
    }).catch(e => console.warn('[PlanOverview] D1 story_material save failed:', e));
  };

  const handleConfirm = () => {
    setStoryMaterial(localMaterial);
    persistMaterial(localMaterial);
    onNext();
  };

  const handleSaveDraft = () => {
    setStoryMaterial(localMaterial);
    persistMaterial(localMaterial);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3">
          <Mic size={12} /> {po.badge}
        </div>
        <h2 className="text-2xl font-bold text-primary">{po.title}</h2>
        <p className="text-muted text-sm mt-1">{po.subtitle}</p>
      </div>

      <div className="space-y-4 mb-6">
        {/* 主輸入區 */}
        <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
          <div className="p-4 border-b border-line flex items-center justify-between">
            <label className="text-sm font-semibold text-ink">{po.inputLabel}</label>
            <span className="text-xs text-muted">
              {localMaterial.length} {po.charCount}
            </span>
          </div>
          <div className="p-4">
            <textarea
              value={localMaterial}
              onChange={e => setLocalMaterial(e.target.value)}
              placeholder={po.inputPlaceholder}
              rows={12}
              className="w-full border border-line rounded-xl px-4 py-3 bg-bg-soft focus:outline-none focus:border-primary text-sm text-ink leading-relaxed resize-none placeholder:text-muted/60"
            />
          </div>
          {/* AI 提示 */}
          <div className="px-4 pb-4">
            <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-2.5 flex items-start gap-2">
              <Sparkles size={14} className="text-accent mt-0.5 shrink-0" />
              <p className="text-xs text-accent/80 leading-relaxed">{po.aiHint}</p>
            </div>
          </div>
        </div>

        {/* 小提示 */}
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
          <p className="font-semibold text-sm text-amber-900 mb-2">{po.tipTitle}</p>
          <ul className="space-y-1">
            {[po.tip1, po.tip2, po.tip3].map((tip, i) => (
              <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSaveDraft}
          className="flex items-center gap-2 border border-line px-5 py-3 rounded-xl text-muted hover:border-primary hover:text-primary transition-colors text-sm"
        >
          <Save size={15} /> {po.saveDraft}
        </button>
        <button
          onClick={handleConfirm}
          disabled={!localMaterial.trim()}
          className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={18} /> {po.confirmBtn}
        </button>
      </div>
    </div>
  );
}

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
// 全劇美學鎖（修正九：加入參考圖上傳）
// 故事已定，進入視覺化前為整套劇定調一次視覺風格
// 支援：風格參考圖 / 角色參考圖 / 場景參考圖 + 文字描述並存
// ─────────────────────────────────────────
type RefImageItem = { id: string; url: string; caption: string; linkedCharId?: string };
type RefImageSection = 'style' | 'character' | 'scene';

function SeriesAestheticLock({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const { aestheticLock, setAestheticLock, characters: storedCharacters } = useProjectStore();
  const [open, setOpen] = useState(true);
  const alTr = tr.creator.drama.aestheticLock;

  // 參考圖 state（三類）
  const [refImages, setRefImages] = useState<Record<RefImageSection, RefImageItem[]>>({
    style: [], character: [], scene: [],
  });

  const addRefImage = (section: RefImageSection, url: string) => {
    const id = `ref-${section}-${Date.now()}`;
    setRefImages(prev => ({ ...prev, [section]: [...prev[section], { id, url, caption: '' }] }));
  };

  const removeRefImage = (section: RefImageSection, id: string) => {
    setRefImages(prev => ({ ...prev, [section]: prev[section].filter(r => r.id !== id) }));
  };

  const updateCaption = (section: RefImageSection, id: string, caption: string) => {
    setRefImages(prev => ({
      ...prev,
      [section]: prev[section].map(r => r.id === id ? { ...r, caption } : r),
    }));
  };

  const linkChar = (section: RefImageSection, id: string, charId: string) => {
    setRefImages(prev => ({
      ...prev,
      [section]: prev[section].map(r => r.id === id ? { ...r, linkedCharId: charId } : r),
    }));
  };

  // 真實上傳 — 開啟 file picker，上傳到 R2，把 URL 加入 refImages
  const uploadRef = useRef<HTMLInputElement>(null);
  const [uploadingSection, setUploadingSection] = useState<RefImageSection | null>(null);
  const { projectId: storeProjectId } = useProjectStore();

  const handleUpload = (section: RefImageSection) => {
    setUploadingSection(section);
    uploadRef.current?.click();
  };

  const onRefFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !uploadingSection) return;
    const categoryMap: Record<RefImageSection, string> = {
      style: 'other', character: 'character', scene: 'scene',
    };
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('projectId', storeProjectId || 'global');
      fd.append('userId', 'creator-local');
      fd.append('category', categoryMap[uploadingSection]);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json<{ fileUrl: string }>();
      addRefImage(uploadingSection, data.fileUrl);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingSection(null);
    }
  };

  const RefImageSectionUI = ({
    sectionKey, title, subtitle,
  }: { sectionKey: RefImageSection; title: string; subtitle: string }) => {
    const items = refImages[sectionKey];
    return (
      <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-line bg-violet-50/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">{title}</p>
            <p className="text-xs text-muted">{subtitle}</p>
          </div>
          <button
            onClick={() => handleUpload(sectionKey)}
            className="flex items-center gap-1.5 text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Upload size={12} /> {alTr.uploadBtn}
          </button>
        </div>
        <div className="p-4">
          {items.length === 0 ? (
            <button
              onClick={() => handleUpload(sectionKey)}
              className="w-full border-2 border-dashed border-line rounded-xl p-6 text-center hover:border-violet-300 transition-colors group"
            >
              <Upload size={24} className="mx-auto text-muted mb-2 group-hover:text-violet-400 transition-colors" />
              <p className="text-xs text-muted">{alTr.uploadHint}</p>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {items.map(item => (
                <div key={item.id} className="relative group">
                  <img src={item.url} alt="" className="w-full h-28 object-cover rounded-lg" />
                  {/* 移除按鈕 */}
                  <button
                    onClick={() => removeRefImage(sectionKey, item.id)}
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title={alTr.removeImg}
                  >
                    <X size={10} />
                  </button>
                  {/* 說明欄 */}
                  <input
                    value={item.caption}
                    onChange={e => updateCaption(sectionKey, item.id, e.target.value)}
                    placeholder={alTr.captionPlaceholder}
                    className="w-full mt-1.5 text-[11px] border border-line rounded px-2 py-1 bg-bg-soft focus:outline-none focus:border-violet-400"
                  />
                  {/* 角色關聯（僅 character 區顯示） */}
                  {sectionKey === 'character' && storedCharacters.length > 0 && (
                    <select
                      value={item.linkedCharId ?? ''}
                      onChange={e => linkChar(sectionKey, item.id, e.target.value)}
                      className="w-full mt-1 text-[11px] border border-line rounded px-2 py-1 bg-bg-soft focus:outline-none focus:border-violet-400"
                    >
                      <option value="">{alTr.linkChar}</option>
                      {storedCharacters.map(c => (
                        <option key={c.id} value={c.id}>{c.name_i18n['zh-HK']}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
              {/* 加更多 */}
              <button
                onClick={() => handleUpload(sectionKey)}
                className="h-28 border-2 border-dashed border-line rounded-lg flex items-center justify-center hover:border-violet-300 transition-colors"
              >
                <Plus size={20} className="text-muted" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* 標題 */}
      <div className="mb-2">
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
          <Layers size={12} /> {alTr.title}
        </div>
        <h2 className="text-2xl font-bold text-primary">{alTr.title}</h2>
        <p className="text-muted text-sm mt-1">{alTr.subtitle}</p>
      </div>

      {/* 已鎖定摘要 */}
      {aestheticLock && !open && (
        <div className="bg-violet-50 border border-violet-300 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center shrink-0">
            <Layers size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-violet-800">{tr.aestheticComposer.seriesLock.locked}</p>
            <p className="text-xs text-violet-600 mt-0.5 line-clamp-2">{aestheticLock.compiledPromptZh}</p>
          </div>
          <button onClick={() => setOpen(true)} className="text-xs text-violet-600 hover:text-violet-800 border border-violet-300 px-3 py-1.5 rounded-lg transition-colors shrink-0">
            修改
          </button>
        </div>
      )}

      {open && (<>
        {/* Hidden file input for real uploads */}
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onRefFileChange}
        />

        {/* ── 參考圖三區（修正九）── */}
        <RefImageSectionUI sectionKey="style"     title={alTr.styleRefTitle}  subtitle={alTr.styleRefSubtitle}  />
        <RefImageSectionUI sectionKey="character" title={alTr.charRefTitle}   subtitle={alTr.charRefSubtitle}   />
        <RefImageSectionUI sectionKey="scene"     title={alTr.sceneRefTitle}  subtitle={alTr.sceneRefSubtitle}  />

        {/* ── 文字風格描述（原 AestheticComposer）── */}
        <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-line flex items-center gap-2">
            <Layers size={16} className="text-violet-600" />
            <span className="text-sm font-semibold text-ink">{alTr.textStyleTitle}</span>
            {aestheticLock && (
              <button onClick={() => setOpen(false)} className="ml-auto text-xs text-muted hover:text-ink transition-colors">
                收起
              </button>
            )}
          </div>
          <div className="p-4">
            <AestheticComposer
              mode="drama"
              initialOutput={aestheticLock ?? undefined}
              isSeriesLock
              onApply={(output) => {
                setAestheticLock(output);
                setOpen(false);
              }}
              onCancel={aestheticLock ? () => setOpen(false) : undefined}
            />
          </div>
        </div>
      </>)}

      {/* 說明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1">
        <p className="font-semibold flex items-center gap-1.5"><Info size={13} /> 美學鎖如何運作？</p>
        <p>・S4 分鏡、S5 關鍵幀頂部會顯示「繼承全劇美學：<span className="font-semibold">{aestheticLock?.compiledPromptZh?.slice(0, 20) ?? '未設定'}…</span>」</p>
        <p>・每集可局部微調（只影響當前集），唔會改動呢度的全劇設定。</p>
        <p>・之後返呢度可以修改全劇美學；改完後新一集自動套用，舊集保留局部調整。</p>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        {!aestheticLock && (
          <button onClick={onNext} className="flex items-center gap-2 border border-line px-5 py-3 rounded-xl text-muted hover:border-primary hover:text-primary transition-colors text-sm">
            稍後再設定，先去分鏡
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!aestheticLock}
          className={`flex-1 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
            aestheticLock ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-line text-muted cursor-not-allowed'
          }`}
        >
          <ChevronRight size={18} />
          {aestheticLock ? alTr.confirmBtn : '請先設定全劇美學'}
        </button>
      </div>
    </div>
  );
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
        fd.append('category', file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : 'other');
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      await fetchS1Assets();
    } catch (err) {
      setS1UploadErr(err instanceof Error ? err.message : '上傳失敗');
    } finally {
      setS1Uploading(false);
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
    // count from real assets (0 while loading)
    count: s1Assets.filter(asset => {
      if (i === 0) return asset.category === 'character';
      if (i === 1) return asset.file_type.startsWith('image/');
      if (i === 2) return asset.file_type.startsWith('video/');
      if (i === 3) return asset.file_type.startsWith('audio/');
      return false;
    }).length,
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
                onClick={() => !s1Uploading && s1FileRef.current?.click()}
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
type AppearanceOptions = {
  height: string; build: string; skin: string;
  hair: string; hairColor: string; hairLength: string;
  face: string; eyes: string; eyewear: string;
  facial: string; posture: string; style: string;
  extraNote: string; // 補充描述（自由填寫）
};

const DEFAULT_APPEARANCE: AppearanceOptions = {
  height: '', build: '', skin: '', hair: '', hairColor: '', hairLength: '',
  face: '', eyes: '', eyewear: '', facial: '', posture: '', style: '',
  extraNote: '',
};

// 將 AppearanceOptions 轉成中文摘要字串供 AI prompt 導入
function buildAppearanceSummary(a: AppearanceOptions): string {
  return [
    a.height, a.build,
    a.skin ? a.skin + '膚色' : '',
    a.hairLength && a.hairColor ? `${a.hairColor}${a.hairLength}${a.hair || ''}` : (a.hair || ''),
    a.face ? a.face + '臉型' : '',
    a.eyewear && a.eyewear !== '無眼鏡' ? a.eyewear : '',
    a.facial && a.facial !== '無鬚' ? a.facial : '',
    a.eyes, a.posture, a.style,
    a.extraNote,
  ].filter(Boolean).join('，');
}

// ── Shared: CharacterProfileCard ────────────────────────────────────────────
function CharacterProfileCard({
  img, refs, name, role, age, bg, similarity, setSimilarity, mode,
  gender, onGenderChange,
  initialTraits, initialAppearance,
  onTraitsChange, onAppearanceChange,
  onNameChange, onRoleChange, onAgeChange, onBgChange,
  onImgChange, onRefsChange,
  onSaveChar,
  projectId,
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
  const appearanceRows: { label: string; key: keyof AppearanceOptions; opts: string[] }[] =
    appearanceRowLabels.map((r, i) => {
      const key = appearanceRowKeys[i];
      const overriddenOpts = appearanceOptsOverride?.[key];
      return { label: r.label, key, opts: overriddenOpts ?? r.opts };
    });

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
                        onClick={() => onGenderChange?.(isSelected ? undefined : g)}
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

      {/* D3: AI 角色一致性圖像生成（替代舊有相似度設定） */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={15} className="text-primary" />
          <label className="text-sm font-semibold text-ink">AI 生成一致性角色圖</label>
        </div>
        <p className="text-xs text-muted mb-3">
          根據角色外貌設定，以 AI 生成符合視覺一致性的角色圖，生成後可直接設為頭像。
        </p>

        {/* Current avatar preview + generate button */}
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
                  // Merge avatar (img) + refs[], deduplicate, cap at 3
                  const allRefs = [...new Set([img, ...(refs ?? [])].filter(Boolean))].slice(0, 3);
                  const body: Record<string, unknown> = {
                    appearanceSummary: prompt,
                    charName: name,
                    age,
                    role,                              // Fix 1: pass role for better prompt
                    projectId: projectId ?? 'global',  // Fix 1: needed for R2 key
                    similarity,                        // pass mode so backend adjusts prompt
                  };
                  if (allRefs.length > 0) body.referenceImageUrls = allRefs;
                  const res = await fetch('/api/ai/image-gen', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                  });
                  const data = await res.json() as { ok: boolean; fileUrl?: string; error?: string };
                  if (!data.ok || !data.fileUrl) throw new Error(data.error ?? 'Generation failed');
                  setImageGenResult(data.fileUrl);  // Fix 1: use fileUrl (R2-backed)
                } catch (e) {
                  setImageGenError(e instanceof Error ? e.message : '生成失敗，請稍後再試。');
                } finally {
                  setImageGenLoading(false);
                }
              }}
              disabled={imageGenLoading}
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

        {/* Generated result */}
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
                onClick={() => { onImgChange?.(imageGenResult); setImageGenResult(null); }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white text-xs py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Check size={12} /> 設為頭像
              </button>
              <button
                onClick={() => { onRefsChange?.([...(refs ?? []), imageGenResult]); setImageGenResult(null); }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-bg-soft border border-line text-ink text-xs py-2 rounded-lg hover:border-primary transition-colors"
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

        {/* Similarity preference (compact, kept as metadata) */}
        <details className="mt-3">
          <summary className="text-[11px] text-muted cursor-pointer hover:text-ink transition-colors select-none">
            進階：視覺相似度設定（{similarity || '未設定'}）
          </summary>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {similarityLabels.map(s => (
              <button
                key={s.id}
                onClick={() => setSimilarity(s.id)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  similarity === s.id
                    ? `${s.border} ${s.bg}`
                    : 'border-line hover:border-primary/40 bg-bg-soft'
                }`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="font-semibold text-[11px] text-ink">{s.label}</span>
                </div>
                <p className="text-[10px] text-muted leading-tight">{s.desc}</p>
              </button>
            ))}
          </div>
        </details>
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
    // 非同步存 D1（non-blocking，失敗只 warn 不阻塞 S2 UI）
    saveProjectToD1({
      projectId: pid,
      userId: authUser?.id ?? 'demo-user',
      title: ptitle || '未命名劇集',
      characters: chars,
      outline: storedOutline,
    }).catch(e => console.warn('[S2 handleSaveAndNext] D1 save failed:', e));
    // 非同步存全部角色至 D1（non-blocking）
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
            {/* D1: 個別角色儲存按鈕 */}
            <button
              onClick={() => {
                const chars = draftsToCards(drafts);
                storeSetCharacters(chars);
                saveProjectToD1({
                  projectId: pid,
                  userId: authUser?.id ?? 'demo-user',
                  title: ptitle || '未命名劇集',
                  characters: chars,
                  outline: storedOutline,
                }).catch(e => console.warn('[S2 saveChar] D1 save failed:', e));
              }}
              className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-lg hover:bg-primary/20 transition-colors font-medium"
              title="儲存此角色至 D1"
            >
              <Save size={10} /> 儲存此角色
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
// S3: 故事框架（新版）
// 整合：3a 選題方向 → 3b 全劇大綱 → 3c 逐集故事卡
// 讀取 S2 characters 作為生成上下文
// 每階段有 Accept / Regenerate / Edit 三動作
// ─────────────────────────────────────────
function S3StoryFramework({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const sa = tr.storyArchitect;

  // 從 store 讀取 S2 角色資料（作為生成上下文）及 S1 贊助商已選資產
  // 修正五六：移除 setSelectedTopic（不再有選題子步驟）
  const {
    characters: storedCharacters,
    selectedSponsorAssets: storedSponsorAssets,
    storyMaterial,
    setOutline: storeSetOutline,
    setStoryCards: storeSetStoryCards,
    setCoCreated,
    isCoCreated, coCreateNote,
    projectId: projectId3, projectTitle, outline: storedOutline3,
    storyCards: storedStoryCards3,
  } = useProjectStore();
  const { user: authUser3 } = useAuthStore();

  // 系列上下文：優先從 projectStore 讀取（S0 已設定），否則使用預設值
  const storedCtx = useProjectStore(s => s.context);
  const context: SeriesContext = storedCtx ?? {
    seriesTitle: projectTitle || '新劇集',
    genre: 'drama',
    tone: 'warm',
    coreNeed: 'seen',
    episodeCount: 30,
    durationLabel: '60秒',
    mode: 'drama',
  };

  // 子階段狀態（修正五六：直接由 outline 開始，不再有 topic / characters 子步驟）
  const [subStage, setSubStage] = useState<ArchitectSubStage>('outline');
  const [outline, setOutline] = useState<{ episodeNumber: number; title_i18n: { 'zh-HK': string; en: string; 'zh-CN': string }; oneLine_i18n: { 'zh-HK': string; en: string; 'zh-CN': string } }[]>([]);
  const [storyCards, setStoryCards] = useState<EpisodeStoryCard[]>([]);

  // ── S3 重入還原：掛載回填 subStage/local outline/local storyCards ──
  // 因 loadProject 為 async，store 值可能喺 mount 之後先到，故用 useEffect + dep
  // （不可只靠 useState 初始值）。ref guard 確保只 hydrate 一次，唔會蓋使用者
  // 之後喺 S1bOutline/S1cEpisodes 內做嘅編輯。
  const s3HydratedRef = useRef(false);
  useEffect(() => {
    if (s3HydratedRef.current) return; // 已回填過，不再覆蓋
    if (!(storedOutline3?.length > 0) && !(storedStoryCards3?.length > 0)) return; // 兩者皆空，等下次 dep 觸發（或維持顯示生成按鈕）
    s3HydratedRef.current = true;
    if (storedOutline3?.length > 0) {
      setOutline(storedOutline3);
      setSubStage('episodes'); // 已有大綱 → 直接去 3b，唔使重新生成
    }
    if (storedStoryCards3?.length > 0) {
      setStoryCards(storedStoryCards3);
    }
  }, [storedOutline3, storedStoryCards3]);

  return (
    <div className="max-w-2xl space-y-4">
      {/* 標題 */}
      <div className="mb-2">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-semibold mb-3">
          <BookOpen size={12} /> S3 故事框架
        </div>
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s3.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s3.subtitle}</p>
      </div>

      {/* 角色上下文提示（若 S2 有角色） */}
      {storedCharacters.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
          <Users size={16} className="text-green-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green-800">故事將圍繞以下主角展開</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {storedCharacters.slice(0, 4).map(c => (
                <span key={c.id} className="inline-flex items-center gap-1 bg-white text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-xs">
                  {c.name_i18n['zh-HK']}
                </span>
              ))}
              {storedCharacters.length > 4 && (
                <span className="text-xs text-green-600">+{storedCharacters.length - 4}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 無角色提示 */}
      {storedCharacters.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700">尚未定義角色。可以先生成故事框架，之後返回 S2 補充主角。</p>
        </div>
      )}

      {/* 進度列 */}
      <StageProgress current={subStage} />

      {/* 3b 全劇大綱（修正五六：直接由大綱開始；storyMaterial 作為生成依據） */}
      {subStage === 'outline' && (
        <S1bOutline
          context={{ ...context, humanInput: storyMaterial }}
          selectedTopic={{ id: 'creator-input', title_i18n: { 'zh-HK': '創作者故事原材料', en: 'Creator Story Material', 'zh-CN': '创作者故事原材料' }, logline_i18n: { 'zh-HK': storyMaterial.slice(0, 80), en: storyMaterial.slice(0, 80), 'zh-CN': storyMaterial.slice(0, 80) }, hook_i18n: { 'zh-HK': '', en: '', 'zh-CN': '' } }}
          initialOutline={outline}
          onAccept={(ol, outlineCoCreateNote) => {
            setOutline(ol);
            storeSetOutline(ol);
            if (outlineCoCreateNote && outlineCoCreateNote.trim()) {
              setCoCreated(true, outlineCoCreateNote.trim());
            }
            // A1 持久化：將 30 集 outline 寫入 D1 projects.series_outline（non-blocking）
            // 改用 saveArchitectToD1 — 只打 /api/ai/project/save，不碰 story_material/series_context
            saveArchitectToD1({
              projectId: projectId3,
              userId: authUser3?.id ?? 'demo-user',
              title: projectTitle || '未命名劇集',
              characters: storedCharacters,
              outline: ol,
              storyCards: [],
            }).catch(e => console.warn('[S3 outline onAccept] D1 save failed:', e));
            setSubStage('episodes');
          }}
        />
      )}

      {/* 3c 逐集故事卡 */}
      {subStage === 'episodes' && (
        <S1cEpisodes
          context={context}
          outline={outline}
          characters={storedCharacters}        // ← S2 角色（作為故事生成上下文）
          sponsorAssets={storedSponsorAssets}  // ← S1 贊助商已選（作為元素選擇器資料源）
          initialCards={storyCards}
          onAccept={(cards) => {
            setStoryCards(cards);
            storeSetStoryCards(cards);
            // 非同步存 D1（non-blocking，失敗只 warn 不阻塞 S3 UI）
            // 改用 saveArchitectToD1 — 只打 /api/ai/project/save，不碰 story_material/series_context
            saveArchitectToD1({
              projectId: projectId3,
              userId: authUser3?.id ?? 'demo-user',
              title: projectTitle || '未命名劇集',
              characters: storedCharacters,
              storyCards: cards,
              outline: storedOutline3,
            }).catch(e => console.warn('[S3 onAccept] D1 save failed:', e));
            setSubStage('done');
          }}
        />
      )}

      {/* 完成 → 前往下一步 */}
      {subStage === 'done' && (
        <div className="bg-card rounded-xl border border-line shadow-card p-6 text-center">
          <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-accent" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">{tr.storyArchitect.stage.done ?? '故事框架完成！'}</h3>
          <p className="text-muted text-sm mb-4">{tr.storyArchitect.ep?.doneDesc ?? '全劇大綱及分集故事卡已儲存，可隨時返回修改。'}</p>

          {/* Co-create badge */}
          {isCoCreated && (
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {sa.coCreate.badge}
              {coCreateNote && <span className="text-xs font-normal text-amber-600 ml-1">· {coCreateNote.slice(0, 20)}{coCreateNote.length > 20 ? '…' : ''}</span>}
            </div>
          )}

          {/* 摘要 */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {storedCharacters.slice(0, 3).map(c => (
              <span key={c.id} className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-xs">
                <Users size={10} /> {c.name_i18n['zh-HK']}
              </span>
            ))}
            {storyCards.length > 0 && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                <Film size={10} /> {storyCards.length} 集故事卡
              </span>
            )}
          </div>

          <button
            onClick={onNext}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors mx-auto"
          >
            <ChevronRight size={18} /> 前往分鏡
          </button>
        </div>
      )}

      {/* 跳過按鈕 */}
      {subStage !== 'done' && (
        <div className="text-center">
          <button
            onClick={onNext}
            className="text-xs text-muted hover:text-primary transition-colors underline underline-offset-2"
          >
            跳過故事框架，直接前往分鏡
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// S4: 分鏡
// ─────────────────────────────────────────
function S4Storyboard({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const { aestheticLock } = useProjectStore();
  const [localAestheticOpen, setLocalAestheticOpen] = useState(false);
  const [localAdjustment, setLocalAdjustment] = useState<AestheticOutput | null>(null);
  const panels = [
    { scene: 1, title: '街市清晨開檔', desc: '陳伯熟練地掛起豬肉，街坊陸續到來', cam: '全景→特寫', dur: 8 },
    { scene: 2, title: '最後一天告別', desc: '街坊圍著陳伯，眼帶不捨', cam: '中景，慢推鏡', dur: 10 },
    { scene: 3, title: '廚藝筆記出現', desc: '陳太打開陳伯的舊抽屜，發現泛黃筆記', cam: '特寫，跟焦', dur: 6 },
    { scene: 4, title: '夕陽收檔', desc: '陳伯最後一次關上鋪門，回望街市', cam: '廣角，逆光', dur: 8 },
  ];

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s4.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s4.subtitle}</p>
      </div>

      {/* 全劇美學繼承 banner */}
      <div className={`rounded-xl border p-3 mb-4 flex items-center gap-3 ${aestheticLock ? 'bg-violet-50 border-violet-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${aestheticLock ? 'bg-violet-500' : 'bg-amber-400'}`}>
          <Layers size={13} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          {aestheticLock ? (
            <>
              <p className="text-xs font-semibold text-violet-800">本集繼承全劇美學：</p>
              <p className="text-xs text-violet-600 truncate">{aestheticLock.compiledPromptZh}</p>
            </>
          ) : (
            <p className="text-xs text-amber-700">尚未設定全劇美學鎖。可繼續進行，或返回美學鎖頁面設定後再來。</p>
          )}
        </div>
        <button
          onClick={() => setLocalAestheticOpen(v => !v)}
          className="shrink-0 text-xs border border-violet-300 text-violet-600 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          {localAdjustment ? '已微調 ✓' : '局部微調'}
        </button>
      </div>

      {/* 局部微調展開（不覆寫全劇鎖） */}
      {localAestheticOpen && (
        <div className="bg-card rounded-xl border border-violet-200 shadow-card overflow-hidden mb-4">
          <div className="p-3 border-b border-violet-100 bg-violet-50 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-violet-800">本集局部微調（只影響本集，不改動全劇美學鎖）</p>
              <p className="text-xs text-violet-600 mt-0.5">改全劇 look 請返「全劇美學鎖」時機</p>
            </div>
            <button onClick={() => setLocalAestheticOpen(false)} className="text-xs text-violet-500 hover:text-violet-700">收起</button>
          </div>
          <div className="p-4">
            <AestheticComposer
              mode="drama"
              initialOutput={localAdjustment ?? aestheticLock ?? undefined}
              onApply={(output) => { setLocalAdjustment(output); setLocalAestheticOpen(false); }}
              onCancel={() => setLocalAestheticOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted">第1集 · 共 {panels.length} 個鏡頭</span>
        <div className="flex gap-2">
          <button className="text-xs border border-line px-3 py-1.5 rounded-lg text-muted hover:border-primary transition-colors">
            {tr.creator.drama.s4.prevEp}
          </button>
          <button className="text-xs border border-line px-3 py-1.5 rounded-lg text-muted hover:border-primary transition-colors">
            {tr.creator.drama.s4.nextEp}
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 mb-6">
        {panels.map(p => (
          <div key={p.scene} className="shrink-0 w-52 bg-card rounded-xl overflow-hidden shadow-card border border-line">
            <div className="h-28 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Camera size={24} className="text-primary/50" />
            </div>
            <div className="p-3">
              <p className="text-xs text-muted">鏡頭{p.scene} · {p.dur}秒 · {p.cam}</p>
              <p className="text-sm font-semibold text-ink mt-0.5 mb-1">{p.title}</p>
              <p className="text-xs text-muted leading-relaxed">{p.desc}</p>
              <div className="flex gap-1 mt-2">
                <button className="text-xs text-accent hover:underline">{tr.creator.drama.s4.editShot}</button>
                <span className="text-muted">·</span>
                <button className="text-xs text-muted hover:text-primary">{tr.creator.drama.s4.aiRewrite}</button>
                <span className="text-muted">·</span>
                <button className="text-xs text-red-400 hover:underline">{tr.creator.drama.s4.deleteShot}</button>
              </div>
            </div>
          </div>
        ))}
        <div className="shrink-0 w-52 border-2 border-dashed border-line rounded-xl flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
          <div className="text-center text-muted">
            <span className="text-3xl block">+</span>
            <span className="text-xs">{tr.creator.drama.s4.addShot}</span>
          </div>
        </div>
      </div>

      {/* AI 自然語言編輯 */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-primary" />
          <span className="text-sm font-semibold text-primary">{tr.creator.drama.s4.aiAssistant}</span>
        </div>
        <input
          className="w-full bg-white border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          placeholder={tr.creator.drama.s4.aiInputPlaceholder}
        />
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> {tr.creator.drama.s4.confirmBtn}
        <CreditIndicator cost={60} className="ml-2" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S5: 關鍵幀生成
// ─────────────────────────────────────────
function S5Keyframes({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const { aestheticLock } = useProjectStore();
  const [genMode, setGenMode] = useState<'reference' | 'text'>('reference');
  const [localAestheticOpen, setLocalAestheticOpen] = useState(false);
  const [localAdjustment, setLocalAdjustment] = useState<AestheticOutput | null>(null);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s5.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s5.subtitle}</p>
      </div>

      {/* 全劇美學繼承 banner */}
      <div className={`rounded-xl border p-3 mb-4 flex items-center gap-3 ${aestheticLock ? 'bg-violet-50 border-violet-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${aestheticLock ? 'bg-violet-500' : 'bg-amber-400'}`}>
          <Layers size={13} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          {aestheticLock ? (
            <>
              <p className="text-xs font-semibold text-violet-800">本集繼承全劇美學：</p>
              <p className="text-xs text-violet-600 truncate">{aestheticLock.compiledPromptZh}</p>
            </>
          ) : (
            <p className="text-xs text-amber-700">尚未設定全劇美學鎖。可繼續進行，或返回美學鎖頁面設定後再來。</p>
          )}
        </div>
        <button
          onClick={() => setLocalAestheticOpen(v => !v)}
          className="shrink-0 text-xs border border-violet-300 text-violet-600 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          {localAdjustment ? '已微調 ✓' : '局部微調'}
        </button>
      </div>

      {/* 局部微調展開 */}
      {localAestheticOpen && (
        <div className="bg-card rounded-xl border border-violet-200 shadow-card overflow-hidden mb-4">
          <div className="p-3 border-b border-violet-100 bg-violet-50 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-violet-800">本格局部微調（只影響本格，不改動全劇美學鎖）</p>
              <p className="text-xs text-violet-600 mt-0.5">改全劇 look 請返「全劇美學鎖」時機</p>
            </div>
            <button onClick={() => setLocalAestheticOpen(false)} className="text-xs text-violet-500 hover:text-violet-700">收起</button>
          </div>
          <div className="p-4">
            <AestheticComposer
              mode="drama"
              initialOutput={localAdjustment ?? aestheticLock ?? undefined}
              onApply={(output) => { setLocalAdjustment(output); setLocalAestheticOpen(false); }}
              onCancel={() => setLocalAestheticOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 生成模式 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <label className="block text-sm font-semibold text-ink mb-3">{tr.creator.drama.s5.genModeLabel}</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'reference' as const, label: tr.creator.drama.s5.modeReference, desc: tr.creator.drama.s5.modeReferenceDesc, icon: Image },
            { id: 'text' as const, label: tr.creator.drama.s5.modeText, desc: tr.creator.drama.s5.modeTextDesc, icon: Edit3 },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setGenMode(m.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                genMode === m.id ? 'border-primary bg-primary/5' : 'border-line hover:border-primary/40'
              }`}
            >
              <m.icon size={20} className={genMode === m.id ? 'text-primary' : 'text-muted'} />
              <div className="font-semibold text-sm text-ink mt-2">{m.label}</div>
              <div className="text-xs text-muted mt-1">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 資產完整度檢查 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Check size={16} className="text-green-500" />
          <h3 className="font-semibold text-ink text-sm">{tr.creator.drama.s5.assetCheckTitle}</h3>
        </div>
        <div className="space-y-2">
          {[
            { label: '陳伯角色參考圖', ok: true },
            { label: '陳太角色參考圖', ok: true },
            { label: '阿明角色參考圖', ok: false },
            { label: '街市場景參考', ok: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {item.ok
                ? <Check size={14} className="text-green-500" />
                : <AlertTriangle size={14} className="text-amber-500" />
              }
              <span className={item.ok ? 'text-ink' : 'text-amber-700'}>{item.label}</span>
              {!item.ok && <span className="text-xs text-amber-600 ml-auto">{tr.creator.drama.s5.recommended}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 生成預覽 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-ink text-sm">{tr.creator.drama.s5.previewTitle}</h3>
          <button className="text-xs text-accent hover:underline flex items-center gap-1">
            <RefreshCw size={11} /> {tr.creator.drama.s5.regenerateAll}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop',
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=150&fit=crop',
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=150&fit=crop',
          ].map((src, i) => (
            <div key={i} className="relative group cursor-pointer">
              <img src={src} alt="" className="w-full aspect-video object-cover rounded-lg" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center gap-2 transition-opacity">
                <button className="text-white text-xs bg-white/20 px-2 py-1 rounded">{tr.creator.drama.s5.accept}</button>
                <button className="text-white text-xs bg-white/20 px-2 py-1 rounded">{tr.creator.drama.s5.regenerate}</button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
          <Check size={11} /> {tr.creator.drama.s5.consistencyLabel}陳伯 94% · 陳太 88%
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> {tr.creator.drama.s5.confirmBtn}
        <CreditIndicator cost={120} className="ml-2" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S6: 影片批量生成（兩步確認門）
// ─────────────────────────────────────────
function S6VideoGen({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const { context, characters, storyCards, aestheticLock, projectId: pid6, currentEpisode } = useProjectStore();
  const { user: u6 } = useAuthStore();
  const [selectedEp, setSelectedEp] = useState(currentEpisode);
  const [gate, setGate] = useState<'params' | 'generate'>('params');
  const [completedVideos, setCompletedVideos] = useState<Record<number, string>>({});

  const card = storyCards.find(c => c.episodeNumber === selectedEp);
  const durationSec = Math.min(Number((context?.durationLabel ?? '5').replace(/[^0-9]/g, '')) || 5, 10);
  const episodeNums = storyCards.length > 0 ? storyCards.map(c => c.episodeNumber) : [1, 2, 3];

  const buildPrompt = () => {
    const parts: string[] = [];
    if (card) {
      parts.push(`第${card.episodeNumber}集：${card.title_i18n['zh-HK']}`);
      if (card.hook_i18n['zh-HK']) parts.push(`故事鈎：${card.hook_i18n['zh-HK']}`);
      if (card.body_i18n['zh-HK']) parts.push(card.body_i18n['zh-HK'].slice(0, 120));
    }
    if (aestheticLock?.style) parts.push(`美學風格：${aestheticLock.style}`);
    if (characters.length > 0) parts.push(`主角：${characters.slice(0, 2).map(c => c.name_i18n['zh-HK']).join('、')}`);
    parts.push('粵日常對白，貴州情感，香港老年生活場景，高畫質短劇');
    return parts.join('。');
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s6.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s6.subtitle}</p>
      </div>

      {gate === 'params' && (
        <div className="space-y-4">
          {/* 選集 */}
          <div className="bg-card rounded-xl border border-line p-5 shadow-card">
            <h3 className="font-semibold text-ink text-sm mb-3">選擇生成集數</h3>
            <div className="flex flex-wrap gap-2">
              {episodeNums.slice(0, 12).map(ep => (
                <button
                  key={ep}
                  onClick={() => setSelectedEp(ep)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    selectedEp === ep ? 'border-primary bg-primary text-white' : 'border-line text-muted hover:border-primary'
                  }${completedVideos[ep] ? ' ring-2 ring-green-400' : ''}`}
                >
                  第{ep}集{completedVideos[ep] ? ' ✓' : ''}
                </button>
              ))}
            </div>
          </div>
          {/* 參數摘要 */}
          <div className="bg-card rounded-xl border border-line p-5 shadow-card">
            <h3 className="font-semibold text-ink text-sm mb-4">{tr.creator.drama.s6.paramsTitle}</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: tr.creator.drama.s6.engineLabel, value: 'Seedance 2.0' },
                { label: tr.creator.drama.s6.qualityLabel, value: '720p HD' },
                { label: '選定集數', value: `第${selectedEp}集` },
                { label: tr.creator.drama.s6.durationLabel, value: `${durationSec}秒` },
                { label: '畫面比例', value: '9:16 豎版' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-muted">{label}</span>
                  <span className="font-medium text-ink">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setGate('generate')}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Film size={16} /> 開始生成第{selectedEp}集
          </button>
        </div>
      )}

      {gate === 'generate' && (
        <div className="space-y-4">
          <button onClick={() => setGate('params')} className="text-sm text-muted hover:text-primary flex items-center gap-1">
            ← 返回選集
          </button>
          <VideoGenPanel
            prompt={buildPrompt()}
            aspectRatio="9:16"
            duration={durationSec}
            resolution="720p"
            userId={u6?.id}
            episodeId={`${pid6}-ep${selectedEp}`}
            onComplete={(videoUrl, credits) => {
              setCompletedVideos(prev => ({ ...prev, [selectedEp]: videoUrl }));
              void credits;
            }}
          />
          {Object.keys(completedVideos).length > 0 && (
            <button
              onClick={onNext}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronRight size={18} /> {tr.creator.drama.s6.confirmBtn}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// S7: 粵語配音
// ─────────────────────────────────────────
function S7Voiceover({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const voices = tr.creator.drama.s7.voices.map((v, i) => ({
    id: `v${i+1}`, label: v.label, desc: v.desc, active: i === 0,
  }));

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s7.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s7.subtitle}</p>
      </div>

      <div className="space-y-3 mb-6">
        {voices.map(v => (
          <div key={v.id} className={`flex items-center gap-4 bg-card border rounded-xl p-4 cursor-pointer transition-all ${v.active ? 'border-primary shadow-card' : 'border-line hover:border-primary/40'}`}>
            <input type="radio" name="voice" className="accent-primary" defaultChecked={v.active} />
            <div className="flex-1">
              <p className="font-semibold text-sm text-ink">{v.label}</p>
              <p className="text-xs text-muted">{v.desc}</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-accent border border-accent px-3 py-1.5 rounded-lg hover:bg-accent/5">
              <Mic size={12} /> {tr.creator.drama.s7.audition}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <h3 className="font-semibold text-ink text-sm mb-3">{tr.creator.drama.s7.lipsyncTitle}</h3>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted">{tr.creator.drama.s7.lipsyncLabel}</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-5 bg-primary rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" />
            </div>
            <span className="text-primary font-medium text-xs">{tr.creator.drama.s7.lipsyncOn}</span>
          </label>
        </div>
        <p className="text-xs text-muted">{tr.creator.drama.s7.lipsyncDesc}</p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <Mic size={18} /> {tr.creator.drama.s7.confirmBtn}
        <CreditIndicator cost={80} className="ml-2" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S8: 平台內剪輯
// ─────────────────────────────────────────
function S8PlatformEdit({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  return (
    <div className="w-full max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s8.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s8.subtitle}</p>
        <div className="inline-flex items-center gap-1.5 mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
          <Check size={11} /> {tr.creator.drama.s8.freeStep}
        </div>
      </div>

      {/* 播放預覽 */}
      <div className="bg-black rounded-xl overflow-hidden mb-4 aspect-video flex items-center justify-center relative">
        <p className="text-white text-lg opacity-60">▶ 第1集預覽</p>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="h-1 bg-white/30 rounded-full">
            <div className="h-full bg-white rounded-full w-1/3" />
          </div>
        </div>
      </div>

      {/* 時間軸 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <h3 className="font-semibold text-ink text-sm mb-3">{tr.creator.drama.s8.timelineTitle}</h3>
        <div className="space-y-2">
          {[
            { label: tr.creator.drama.s8.videoTrack, color: 'bg-primary', width: '100%' },
            { label: tr.creator.drama.s8.subtitleTrack, color: 'bg-accent', width: '85%' },
            { label: tr.creator.drama.s8.bgmTrack, color: 'bg-green-500', width: '100%' },
            { label: tr.creator.drama.s8.voiceTrack, color: 'bg-purple-400', width: '70%' },
          ].map(track => (
            <div key={track.label} className="flex items-center gap-3">
              <span className="text-xs text-muted w-14 text-right">{track.label}</span>
              <div className="flex-1 h-7 bg-line rounded overflow-hidden">
                <div className={`h-full ${track.color} opacity-70 rounded cursor-pointer`} style={{ width: track.width }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 字幕 + BGM 選項 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card rounded-xl border border-line p-4 shadow-card">
          <h4 className="font-semibold text-ink text-sm mb-2">{tr.creator.drama.s8.subtitleTitle}</h4>
          <div className="space-y-1.5 text-xs text-muted">
            <div className="flex justify-between"><span>{tr.creator.drama.s8.subtitleSize}</span><span className="text-ink font-medium">{tr.creator.drama.s8.subtitleSizeVal}</span></div>
            <div className="flex justify-between"><span>{tr.creator.drama.s8.subtitlePos}</span><span className="text-ink font-medium">{tr.creator.drama.s8.subtitlePosVal}</span></div>
            <div className="flex justify-between"><span>{tr.creator.drama.s8.subtitleLang}</span><span className="text-ink font-medium">{tr.creator.drama.s8.subtitleLangVal}</span></div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-line p-4 shadow-card">
          <h4 className="font-semibold text-ink text-sm mb-2">{tr.creator.drama.s8.bgmTitle}</h4>
          <div className="space-y-1.5">
            {tr.creator.drama.s8.bgmOptions.map((bgm, i) => (
              <label key={bgm} className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="radio" name="bgm" className="accent-accent" defaultChecked={i === 0} />
                <span className="text-ink">{bgm}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> {tr.creator.drama.s8.confirmBtn}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S9: 審批與發佈
// ─────────────────────────────────────────
function S9ReviewPublish({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const [submitted, setSubmitted] = useState(false);

  const dimKeys = ['content', 'language', 'culture', 'ethics', 'commercial'];
  const dimScores = [9, 8, 9, 10, 8];
  const dims = tr.creator.drama.s9.dims.map((d, i) => ({
    key: dimKeys[i], label: d.label, score: dimScores[i], note: d.note,
  }));

  if (submitted) {
    return (
      <div className="max-w-2xl text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold text-primary mb-3">{tr.creator.drama.s9.successTitle}</h2>
        <p className="text-muted mb-2">{tr.creator.drama.s9.successDesc}</p>
        <p className="text-xs text-muted mb-8">{tr.creator.drama.s9.successReach}</p>
        <div className="grid grid-cols-2 gap-4 mb-8 text-left">
          {[
            { label: tr.creator.drama.s9.publishRange, value: '公開發佈至 CoEldery 85' },
            { label: tr.creator.drama.s9.publishDate, value: '2026 年 8 月 22 日' },
            { label: tr.creator.drama.s9.expectedReach, value: '約 12,500 位長者觀眾' },
            { label: tr.creator.drama.s9.revenueShare, value: '觀看收益 70%' },
            { label: tr.creator.drama.s9.esgPoints, value: '+85 社企貢獻積分' },
            { label: tr.creator.drama.s9.seriesId, value: 'DRAMA-2026-001' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card rounded-xl p-4 shadow-card">
              <p className="text-xs text-muted mb-1">{label}</p>
              <p className="font-semibold text-ink text-sm">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <button className="bg-accent text-white px-8 py-3 rounded-xl font-bold hover:bg-accent/90 transition-colors">
            {tr.creator.drama.s9.confirmPublish}
          </button>
          <button className="border border-line px-8 py-3 rounded-xl text-ink hover:border-primary transition-colors">
            {tr.creator.drama.s9.shareBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s9.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s9.subtitle}</p>
      </div>

      <div className="space-y-3 mb-6">
        {dims.map(d => (
          <div key={d.key} className="bg-card rounded-xl p-4 shadow-card border border-line">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-ink">{d.label}</span>
              <span className="text-accent font-bold">{d.score}/10</span>
            </div>
            <div className="h-2 bg-line rounded-full overflow-hidden mb-2">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${d.score * 10}%` }} />
            </div>
            <p className="text-xs text-muted">{d.note}</p>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
        <p className="text-sm text-primary font-semibold">{tr.creator.drama.s9.aiSummary}</p>
        <p className="text-xs text-muted mt-1">{tr.creator.drama.s9.aiSummaryDesc}</p>
      </div>

      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-6">
        <h3 className="font-semibold text-ink text-sm mb-3">{tr.creator.drama.s9.publishTitle}</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted mb-1 block">{tr.creator.drama.s9.publishAudienceLabel}</label>
            <select className="w-full border border-line rounded-lg px-3 py-2 bg-bg-soft text-sm focus:outline-none focus:border-primary">
              <option>公開發佈（CoEldery 85 平台）</option>
              <option>登入用戶限定</option>
              <option>ESG 贊助商專屬</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">{tr.creator.drama.s9.tagsLabel}</label>
            <input
              className="w-full border border-line rounded-lg px-3 py-2 bg-bg-soft text-sm focus:outline-none focus:border-primary"
              defaultValue="街市、圓夢、長者故事、香港情懷、CoEldery85"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex items-center gap-2 border border-line px-5 py-3 rounded-xl text-muted hover:border-primary transition-colors text-sm">
          <Eye size={15} /> {tr.creator.drama.s9.previewBtn}
        </button>
        <button className="flex items-center gap-2 border border-line px-5 py-3 rounded-xl text-muted hover:border-accent transition-colors text-sm">
          <Save size={15} /> {tr.creator.drama.s9.saveDraft}
        </button>
        <button
          onClick={() => setSubmitted(true)}
          className="flex-1 bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
        >
          <Send size={16} /> {tr.creator.drama.s9.submitBtn}
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
