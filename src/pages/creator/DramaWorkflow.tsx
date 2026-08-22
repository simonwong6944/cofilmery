import { useState, useRef, useCallback, useEffect } from 'react';
import { AestheticComposer, type AestheticOutput } from '@/components/shared/AestheticComposer';
import {
  S1bOutline, S1cEpisodes,
  StageProgress, type ArchitectSubStage,
} from '@/components/shared/StoryArchitect';
import type { CharacterCard, EpisodeStoryCard, SeriesContext } from '@/adapters/types';
import { Layers } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { StepNavigation } from '@/components/shared/StepNavigation';
import { AIAssistantPanel } from '@/components/shared/AIAssistantPanel';
import { CreditIndicator } from '@/components/shared/CreditIndicator';
import { Logo } from '@/components/shared/Logo';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/i18n';
import { saveProjectToD1 } from '@/adapters';
import { VideoGenPanel } from '@/components/shared/VideoGenPanel';
import { useTts } from '@/hooks/useTts';
import {
  AlertTriangle, RefreshCw, Check, Mic, Save, ChevronDown, ChevronRight,
  Sparkles, Image, Film, Music, Edit3, Upload, Zap, Eye, Send,
  Heart, Clock, Star, Users, BookOpen, Camera, Car, UtensilsCrossed,
  ShoppingBag, MapPin, Gift, Plus, X, Info, Tag, Building2, Package
} from 'lucide-react';

// ─────────────────────────────────────────
// S0: 系列設定
// ─────────────────────────────────────────
function S0SeriesSetup({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const { setProjectId, setContext, projectId } = useProjectStore();
  const { user } = useAuthStore();
  const [seriesName, setSeriesName] = useState('');
  const [episodeCount, setEpisodeCount] = useState(30);
  const [duration, setDuration] = useState('60秒');
  const [genre, setGenre] = useState('');
  const [tone, setTone] = useState('');
  const [need, setNeed] = useState('');

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
          onClick={() => {
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
            // 非同步存 D1（non-blocking）
            void saveProjectToD1({
              projectId,
              userId: user?.id ?? 'anonymous',
              title,
              mode: 'drama',
            });
            onNext();
          }}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronRight size={18} />
          {tr.creator.drama.s0.confirmBtn}
        </button>
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

  const { storyMaterial, setStoryMaterial } = useProjectStore();
  const [localMaterial, setLocalMaterial] = useState(storyMaterial);

  const handleConfirm = () => {
    setStoryMaterial(localMaterial);
    onNext();
  };

  const handleSaveDraft = () => {
    setStoryMaterial(localMaterial);
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

// Sponsor brand library data (mock)
const SPONSOR_BRANDS = {
  car: [
    {
      id: 'lexus', name: 'Lexus', tier: '白金贊助', logo: '🚗',
      tagline: '追求卓越，感受每一刻',
      assets: [
        { id: 'lx-1', name: 'Lexus LX 600（黑）', type: '行政 SUV', img: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=200&h=140&fit=crop', tag: '場景：夜晚接送' },
        { id: 'lx-2', name: 'Lexus ES 350（珍珠白）', type: '房車', img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=200&h=140&fit=crop', tag: '場景：日常駕駛' },
        { id: 'lx-3', name: 'Lexus RX 500h（深藍）', type: '油電SUV', img: 'https://images.unsplash.com/photo-1669215420018-e8f5e27a8a8a?w=200&h=140&fit=crop', tag: '場景：郊遊出行' },
      ],
    },
    {
      id: 'bmw', name: 'BMW', tier: '金牌贊助', logo: '🚙',
      tagline: '駕駛的樂趣',
      assets: [
        { id: 'bm-1', name: 'BMW 5 Series（暗夜藍）', type: '行政房車', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&h=140&fit=crop', tag: '場景：商務出行' },
        { id: 'bm-2', name: 'BMW X5（礦石白）', type: '豪華SUV', img: 'https://images.unsplash.com/photo-1617654112368-307921291f42?w=200&h=140&fit=crop', tag: '場景：家庭旅遊' },
      ],
    },
    {
      id: 'toyota', name: 'Toyota', tier: '銀牌贊助', logo: '🚐',
      tagline: '永遠向前',
      assets: [
        { id: 'ty-1', name: 'Toyota Alphard（珍珠白）', type: '豪華廂型車', img: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=200&h=140&fit=crop', tag: '場景：長者接送' },
      ],
    },
  ],
  restaurant: [
    {
      id: 'maxims', name: '美心集團', tier: '白金贊助', logo: '🍽️',
      tagline: '香港人的家鄉味道',
      assets: [
        { id: 'mx-1', name: '美心皇宮中菜廳（銅鑼灣）', type: '中菜廳', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=140&fit=crop', tag: '場景：家庭飯局' },
        { id: 'mx-2', name: '翠園餐廳（尖沙咀）', type: '粵式點心', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=140&fit=crop', tag: '場景：週末飲茶' },
        { id: 'mx-3', name: '美心 MX 快餐廳', type: '快餐', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=140&fit=crop', tag: '場景：街坊日常' },
      ],
    },
    {
      id: 'fortress-hill', name: '香港酒店集團', tier: '金牌贊助', logo: '🏨',
      tagline: '',
      assets: [
        { id: 'fh-1', name: '半島酒店大堂餐廳', type: '高級西餐', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=140&fit=crop', tag: '場景：重要約會' },
      ],
    },
  ],
  product: [
    {
      id: 'mannings', name: '萬寧 Mannings', tier: '白金贊助', logo: '💊',
      tagline: '守護每一天的健康',
      assets: [
        { id: 'mn-1', name: '萬寧保健品系列', type: '保健產品', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=140&fit=crop', tag: '道具：長者關節保健' },
        { id: 'mn-2', name: '萬寧護膚品系列', type: '護膚品', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&h=140&fit=crop', tag: '道具：日常護理' },
      ],
    },
    {
      id: 'pricerite', name: '結志街 / 老字號', tier: '銀牌贊助', logo: '🧧',
      tagline: '香港老字號，歲月留情',
      assets: [
        { id: 'pr-1', name: '旗袍 / 長衫（60年代）', type: '服裝道具', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=140&fit=crop', tag: '服裝：懷舊年代劇' },
        { id: 'pr-2', name: '舊式搪瓷茶杯組', type: '年代道具', img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=140&fit=crop', tag: '道具：60–70年代' },
      ],
    },
  ],
  location: [
    {
      id: 'hk-tourism', name: '香港旅遊發展局', tier: '白金贊助', logo: '🏙️',
      tagline: '探索香港，發現更多',
      assets: [
        { id: 'hk-1', name: '維多利亞港日景', type: '戶外場景', img: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=200&h=140&fit=crop', tag: '場景：城市背景' },
        { id: 'hk-2', name: '大澳漁村', type: '特色場景', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=140&fit=crop', tag: '場景：懷舊漁村' },
        { id: 'hk-3', name: '中環舊街市建築', type: '歷史場景', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=140&fit=crop', tag: '場景：年代背景' },
      ],
    },
    {
      id: 'kwun-tong', name: '觀塘工廈文創區', tier: '銀牌贊助', logo: '🏭',
      tagline: '',
      assets: [
        { id: 'kt-1', name: '工廈藝術工作室', type: '室內場景', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=140&fit=crop', tag: '場景：藝術創作' },
      ],
    },
  ],
};

type SponsorCategory = keyof typeof SPONSOR_BRANDS;
// category 用 string（而非 SponsorCategory）以兼容 projectStore 的 SelectedSponsorAsset 型別
type SelectedSponsorAsset = { brandId: string; assetId: string; category: string; name: string; img: string; tag: string };

const TIER_COLORS: Record<string, string> = {
  '白金贊助': 'bg-slate-100 text-slate-700 border-slate-300',
  '金牌贊助': 'bg-amber-50 text-amber-700 border-amber-300',
  '銀牌贊助': 'bg-gray-100 text-gray-600 border-gray-300',
};

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
  const [sponsorCategory, setSponsorCategory] = useState<SponsorCategory>('car');
  const [expandedBrand, setExpandedBrand] = useState<string | null>('lexus');
  const [selectedSponsorAssets, setSelectedSponsorAssets] = useState<SelectedSponsorAsset[]>(storedSponsorAssets);
  const [showSponsorInfo, setShowSponsorInfo] = useState(false);

  const sponsorCategories: { id: SponsorCategory; icon: React.ElementType; label: string; desc: string; color: string }[] = [
    { id: 'car',        icon: Car,            label: tr.creator.drama.s1.catCar,        desc: tr.creator.drama.s1.catCarDesc,        color: 'text-blue-500' },
    { id: 'restaurant', icon: UtensilsCrossed, label: tr.creator.drama.s1.catRestaurant, desc: tr.creator.drama.s1.catRestaurantDesc, color: 'text-orange-500' },
    { id: 'product',    icon: ShoppingBag,     label: tr.creator.drama.s1.catProduct,    desc: tr.creator.drama.s1.catProductDesc,    color: 'text-purple-500' },
    { id: 'location',   icon: MapPin,          label: tr.creator.drama.s1.catLocation,   desc: tr.creator.drama.s1.catLocationDesc,   color: 'text-green-500' },
  ];

  // 真實上傳 state
  const { projectId: s1ProjectId } = useProjectStore();
  const s1FileRef = useRef<HTMLInputElement>(null);
  const [s1Uploading, setS1Uploading]   = useState(false);
  const [s1UploadErr, setS1UploadErr]   = useState('');
  const [s1Assets, setS1Assets]         = useState<Array<{ id: string; file_name: string; file_type: string; file_size: number; file_url: string; category: string }>>([]);
  const [s1Loaded, setS1Loaded]         = useState(false);

  const fetchS1Assets = useCallback(async () => {
    try {
      const res = await fetch(`/api/assets?project_id=${s1ProjectId || 'global'}&limit=100`);
      if (!res.ok) return;
      const data = await res.json<{ assets: typeof s1Assets }>();
      setS1Assets(data.assets ?? []);
    } catch { /* non-blocking */ } finally {
      setS1Loaded(true);
    }
  }, [s1ProjectId]);

  useEffect(() => { fetchS1Assets(); }, [fetchS1Assets]);

  const onS1FileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    setS1Uploading(true); setS1UploadErr('');
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('projectId', s1ProjectId || 'global');
        fd.append('userId', 'creator-local');
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

  const toggleAsset = (cat: SponsorCategory, brand: { id: string; name: string }, asset: { id: string; name: string; img: string; tag: string }) => {
    setSelectedSponsorAssets(prev => {
      const exists = prev.find(a => a.assetId === asset.id);
      if (exists) return prev.filter(a => a.assetId !== asset.id);
      return [...prev, { brandId: brand.id, assetId: asset.id, category: cat, name: asset.name, img: asset.img, tag: asset.tag }];
    });
  };

  const isSelected = (assetId: string) => selectedSponsorAssets.some(a => a.assetId === assetId);

  const brands = SPONSOR_BRANDS[sponsorCategory];
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
                      <img src={asset.file_url} alt={asset.file_name} className="w-full aspect-square object-cover rounded-lg" loading="lazy" />
                    ) : (
                      <div className="w-full aspect-square bg-bg-soft rounded-lg flex flex-col items-center justify-center text-xs text-muted gap-1 p-2">
                        {asset.file_type.startsWith('video/') ? <Film size={20} /> : <Music size={20} />}
                        <span className="truncate w-full text-center">{asset.file_name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs truncate px-1">{asset.file_name}</span>
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

      {/* ── TAB: 贊助商品牌資產庫 ── */}
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

          {/* Category selector */}
          <div className="grid grid-cols-4 gap-2">
            {sponsorCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSponsorCategory(cat.id); setExpandedBrand(null); }}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  sponsorCategory === cat.id
                    ? 'border-accent bg-accent/5'
                    : 'border-line hover:border-accent/40 bg-card'
                }`}
              >
                <cat.icon size={20} className={`mx-auto mb-1 ${sponsorCategory === cat.id ? 'text-accent' : cat.color}`} />
                <p className="text-xs font-semibold text-ink leading-tight">{cat.label}</p>
                <p className="text-[10px] text-muted mt-0.5 leading-tight hidden sm:block">{cat.desc}</p>
              </button>
            ))}
          </div>

          {/* Brand list */}
          <div className="space-y-3">
            {brands.map(brand => {
              const isExpanded = expandedBrand === brand.id;
              const brandSelectedCount = selectedSponsorAssets.filter(a => a.brandId === brand.id).length;
              return (
                <div key={brand.id} className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
                  {/* Brand header */}
                  <button
                    onClick={() => setExpandedBrand(isExpanded ? null : brand.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-bg-soft transition-colors text-left"
                  >
                    <span className="text-2xl flex-shrink-0">{brand.logo}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-ink text-sm">{brand.name}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TIER_COLORS[brand.tier]}`}>
                          {brand.tier}
                        </span>
                        {brandSelectedCount > 0 && (
                          <span className="bg-accent/10 text-accent text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            已選 {brandSelectedCount} 項
                          </span>
                        )}
                      </div>
                      {brand.tagline && <p className="text-xs text-muted mt-0.5 truncate">{brand.tagline}</p>}
                    </div>
                    <ChevronDown
                      size={16}
                      className={`flex-shrink-0 text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Asset grid */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-line pt-3">
                      <p className="text-xs text-muted mb-3 flex items-center gap-1">
                        <Package size={11} /> {tr.creator.drama.s1.clickToSelect}
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {brand.assets.map(asset => {
                          const selected = isSelected(asset.id);
                          return (
                            <button
                              key={asset.id}
                              onClick={() => toggleAsset(sponsorCategory, brand, asset)}
                              className={`rounded-xl overflow-hidden border-2 transition-all text-left ${
                                selected
                                  ? 'border-accent ring-2 ring-accent/20'
                                  : 'border-line hover:border-accent/40'
                              }`}
                            >
                              <div className="relative">
                                <img src={asset.img} alt={asset.name} className="w-full h-24 object-cover" />
                                {selected && (
                                  <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                                    <div className="bg-accent text-white rounded-full p-1">
                                      <Check size={14} />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="p-2">
                                <p className="text-xs font-semibold text-ink leading-tight line-clamp-2">{asset.name}</p>
                                <p className="text-[10px] text-muted mt-0.5">{asset.type}</p>
                                <span className="inline-block mt-1 bg-primary/8 text-primary text-[10px] px-1.5 py-0.5 rounded leading-tight">
                                  {asset.tag}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected summary */}
          {totalSelected > 0 && (
            <div className="bg-card border border-line rounded-xl p-4">
              <h4 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                <Check size={14} className="text-accent" />
                已選贊助商資產（{totalSelected} 項）
              </h4>
              <div className="space-y-2">
                {selectedSponsorAssets.map(asset => (
                  <div key={asset.assetId} className="flex items-center gap-3 bg-bg-soft rounded-lg p-2">
                    <img src={asset.img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">{asset.name}</p>
                      <p className="text-[10px] text-muted">{asset.tag}</p>
                    </div>
                    <button
                      onClick={() => setSelectedSponsorAssets(prev => prev.filter(a => a.assetId !== asset.assetId))}
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
          onClick={() => {
            // 存入 projectStore 供 S3 讀取
            storeSetSponsorAssets(selectedSponsorAssets);
            onNext();
          }}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronRight size={18} />
          {tr.creator.drama.s1.confirmBtn}
        </button>
        {totalSelected > 0 && (
          <p className="text-center text-xs text-muted mt-2">
            {tr.creator.drama.s1.confirmNote} {totalSelected} {tr.creator.drama.s1.confirmNote2}
          </p>
        )}
      </div>
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
  img, name, role, age, bg, similarity, setSimilarity, mode,
  initialTraits, initialAppearance,
  onTraitsChange, onAppearanceChange,
}: {
  img: string; name: string; role: string; age: string; bg: string;
  similarity: string; setSimilarity: (v: string) => void;
  mode: 'drama' | 'legacy';
  initialTraits?: string[];
  initialAppearance?: AppearanceOptions;
  onTraitsChange?: (t: string[]) => void;
  onAppearanceChange?: (a: AppearanceOptions) => void;
}) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const [traits, setTraits] = useState(initialTraits ?? ['開朗樂觀', '勤力', '重情義', '愛說故事', '傳統']);
  const [newTrait, setNewTrait] = useState('');
  const [addingTrait, setAddingTrait] = useState(false);
  const [appearance, setAppearance] = useState<AppearanceOptions>(initialAppearance ?? DEFAULT_APPEARANCE);
  const [showAppearance, setShowAppearance] = useState(false);

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

  const TRAIT_PRESETS = tr.creator.drama.shared.traitPresets;

  // Appearance option rows — from locale so they rebuild on locale change
  const appearanceRowLabels = tr.creator.drama.s2.appearanceRows;
  const appearanceRowKeys: (keyof AppearanceOptions)[] = [
    'height','build','skin','hair','hairColor','hairLength',
    'face','eyes','eyewear','facial','posture','style',
  ];
  const appearanceRows: { label: string; key: keyof AppearanceOptions; opts: string[] }[] =
    appearanceRowLabels.map((r, i) => ({ label: r.label, key: appearanceRowKeys[i], opts: r.opts }));

  const accentColor = mode === 'drama' ? 'primary' : 'accent';

  return (
    <div className="space-y-4">
      {/* Basic info */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <img src={img} alt={name} className="w-20 h-20 rounded-xl object-cover" />
            <button className="absolute -bottom-1 -right-1 bg-white border border-line rounded-full p-1 hover:bg-bg-soft shadow-sm">
              <Upload size={10} className="text-muted" />
            </button>
          </div>
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted">{mode === 'drama' ? s2tr.charNameLabel : tr.creator.legacy.s2.nameLabel}</label>
                <input className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary" defaultValue={name} />
              </div>
              <div>
                <label className="text-xs text-muted">{mode === 'drama' ? s2tr.charRoleLabel : tr.creator.legacy.s2.roleLabel}</label>
                <input className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary" defaultValue={role} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted">{s2tr.charAgeLabel}</label>
                <input className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary" defaultValue={age} />
              </div>
              <div>
                <label className="text-xs text-muted">{mode === 'drama' ? s2tr.charBgLabel : tr.creator.legacy.s2.bgLabel}</label>
                <input className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary" defaultValue={bg} />
              </div>
            </div>
          </div>
        </div>

        {/* Upload refs */}
        <div className="border border-dashed border-line rounded-lg p-3 text-center cursor-pointer hover:border-primary transition-colors">
          <Upload size={14} className="mx-auto text-muted mb-1" />
          <p className="text-xs text-muted">{mode === 'drama' ? s2tr.uploadRef : tr.creator.legacy.s2.uploadRef}</p>
        </div>
      </div>

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

      {/* 身份視覺一致性 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-semibold text-ink">{s2tr.similarityTitle}</label>
        </div>
        <p className="text-xs text-muted mb-3">{mode === 'drama' ? s2tr.similaritySubtitle : tr.creator.legacy.s2.similaritySubtitle}</p>
        <div className="grid grid-cols-3 gap-2">
          {similarityLabels.map(s => (
            <button
              key={s.id}
              onClick={() => setSimilarity(s.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                similarity === s.id
                  ? `${s.border} ${s.bg}`
                  : 'border-line hover:border-primary/40 bg-bg-soft'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                <span className="font-bold text-sm text-ink">{s.label}</span>
              </div>
              <p className="text-[11px] text-muted leading-tight">{s.desc}</p>
            </button>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted bg-bg-soft rounded-lg p-2.5">
          {similarity === s2tr.simVeryClose && (mode === 'drama' ? s2tr.simHintVeryClose : tr.creator.legacy.s2.simHintVeryClose)}
          {similarity === s2tr.simSeventyPct && (mode === 'drama' ? s2tr.simHint70 : tr.creator.legacy.s2.simHint70)}
          {similarity === s2tr.simSpirit && (mode === 'drama' ? s2tr.simHintSpirit : tr.creator.legacy.s2.simHintSpirit)}
          {!similarity && (mode === 'drama' ? s2tr.simHintNone : tr.creator.legacy.s2.simHintNone)}
        </div>
      </div>
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
  img: string;
  name: string;
  role: string;
  age: string;
  bg: string;
  roleTag: 'lead' | 'support' | 'extra';
  similarity: string;
  traits: string[];
  appearance: AppearanceOptions;
};

const newCharDraft = (id: string, similarity: string): CharDraft => ({
  id, img: '', name: '', role: '', age: '', bg: '',
  roleTag: 'support', similarity,
  traits: [], appearance: { ...DEFAULT_APPEARANCE },
});

function S2CharacterSetup({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const s2tr = tr.creator.drama.s2;

  const { characters: storedCharacters, setCharacters: storeSetCharacters } = useProjectStore();

  // 預設兩個角色（若 store 已有則還原自 store）
  const buildDefaultDrafts = (): CharDraft[] => {
    if (storedCharacters.length > 0) {
      return storedCharacters.map(c => ({
        id: c.id,
        img: '',
        name: c.name_i18n['zh-HK'],
        role: c.identityTag_i18n['zh-HK'],
        age: '',
        bg: c.traitsConflict_i18n['zh-HK'],
        roleTag: 'support' as const,
        similarity: c.similarityLevel ?? s2tr.simSeventyPct,
        traits: c.personality ?? [],
        appearance: (c.appearanceOptions as AppearanceOptions) ?? { ...DEFAULT_APPEARANCE },
      }));
    }
    return [
      {
        id: 'char-1',
        img: 'https://images.unsplash.com/photo-1546961342-ea5f62d5a27b?w=200&h=200&fit=crop',
        name: '陳伯（陳錦榮）',
        role: '街市豬肉檔主',
        age: '68歲',
        bg: '四十年老街坊，年輕時有廚師夢',
        roleTag: 'lead',
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
        name: '阿明（李志明）',
        role: '廚藝班學員',
        age: '28歲',
        bg: '熱愛烹飪，新開廚藝班',
        roleTag: 'support',
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
  const [activeId, setActiveId] = useState<string>(drafts[0]?.id ?? '');

  // 每個角色卡的 traits / appearance / similarity — 由 CharacterProfileCard 回調更新至 drafts
  const updateDraft = (id: string, patch: Partial<CharDraft>) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
  };

  const addCharacter = () => {
    const id = `char-${Date.now()}`;
    const newDraft = newCharDraft(id, s2tr.simSeventyPct);
    setDrafts(prev => [...prev, newDraft]);
    setActiveId(id);
  };

  const deleteCharacter = (id: string) => {
    setDrafts(prev => {
      const next = prev.filter(d => d.id !== id);
      if (activeId === id && next.length > 0) setActiveId(next[0].id);
      return next;
    });
  };

  const { user: authUser } = useAuthStore();
  const { projectId: pid, projectTitle: ptitle, outline: storedOutline } = useProjectStore();

  const handleSaveAndNext = () => {
    const chars: CharacterCard[] = drafts.map(d => ({
      id: d.id,
      name_i18n: { 'zh-HK': d.name, en: d.name, 'zh-CN': d.name },
      identityTag_i18n: { 'zh-HK': d.role, en: d.role, 'zh-CN': d.role },
      coreDesire_i18n: { 'zh-HK': '', en: '', 'zh-CN': '' },
      traitsConflict_i18n: { 'zh-HK': d.bg, en: d.bg, 'zh-CN': d.bg },
      arc_i18n: { 'zh-HK': '', en: '', 'zh-CN': '' },
      speechStyle_i18n: { 'zh-HK': '', en: '', 'zh-CN': '' },
      relations_i18n: { 'zh-HK': '', en: '', 'zh-CN': '' },
      appearancePrompt_zh: buildAppearanceSummary(d.appearance),
      personality: d.traits,
      appearanceOptions: d.appearance,
      similarityLevel: d.similarity,
      humanEdited: false,
    }));
    storeSetCharacters(chars);
    // 非同步存 D1（non-blocking）
    void saveProjectToD1({
      projectId: pid,
      userId: authUser?.id ?? 'anonymous',
      title: ptitle || '未命名劇集',
      characters: chars,
      outline: storedOutline,
    });
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

      {/* ── 角色陣容（頂部橫向卡列表）── */}
      <div className="bg-card rounded-xl border border-line shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-ink">{s2tr.castTitle}</p>
            <p className="text-xs text-muted mt-0.5">{s2tr.castSubtitle}</p>
          </div>
          <button
            onClick={addCharacter}
            className="flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            <Plus size={13} /> {s2tr.addChar}
          </button>
        </div>

        {drafts.length === 0 ? (
          <div className="text-center py-6 text-muted text-sm border-2 border-dashed border-line rounded-xl">
            {s2tr.noCharHint}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {drafts.map(d => {
              const isActive = d.id === activeId;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveId(d.id)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all w-28 relative group ${
                    isActive
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-line bg-bg-soft hover:border-primary/40'
                  }`}
                >
                  {/* 頭像 */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                    {d.img ? (
                      <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users size={20} className="text-primary/40" />
                    )}
                  </div>
                  {/* 角色名稱 */}
                  <p className="text-xs font-semibold text-ink text-center leading-tight line-clamp-1 w-full">
                    {d.name || '未命名'}
                  </p>
                  {/* 定位標籤 */}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleTagColors[d.roleTag]}`}>
                    {roleTagLabels[d.roleTag]}
                  </span>
                  {/* 視覺一致性檔次 */}
                  <span className="text-[9px] text-muted border border-line px-1.5 py-0.5 rounded">
                    {d.similarity || '—'}
                  </span>
                  {/* 刪除按鈕 */}
                  {drafts.length > 1 && (
                    <button
                      onClick={e => { e.stopPropagation(); deleteCharacter(d.id); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title={s2tr.deleteChar}
                    >
                      <X size={10} />
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 完整角色編輯器（顯示目前選中角色）── */}
      {activeDraft && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${roleTagColors[activeDraft.roleTag]}`}>
              {roleTagLabels[activeDraft.roleTag]}
            </span>
            <span className="text-sm font-semibold text-ink">{activeDraft.name || '未命名角色'}</span>
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
            name={activeDraft.name}
            role={activeDraft.role}
            age={activeDraft.age}
            bg={activeDraft.bg}
            similarity={activeDraft.similarity}
            setSimilarity={v => updateDraft(activeDraft.id, { similarity: v })}
            mode="drama"
            initialTraits={activeDraft.traits}
            initialAppearance={activeDraft.appearance}
            onTraitsChange={ts => updateDraft(activeDraft.id, { traits: ts })}
            onAppearanceChange={ap => updateDraft(activeDraft.id, { appearance: ap })}
          />
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
          {s2tr.saveChar}
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
          onAccept={(ol, outlineCoCreateNote) => {
            setOutline(ol);
            storeSetOutline(ol);
            if (outlineCoCreateNote && outlineCoCreateNote.trim()) {
              setCoCreated(true, outlineCoCreateNote.trim());
            }
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
          onAccept={(cards) => {
            setStoryCards(cards);
            storeSetStoryCards(cards);
            // 非同步存 D1（non-blocking）
            void saveProjectToD1({
              projectId: projectId3,
              userId: authUser3?.id ?? 'anonymous',
              title: projectTitle || '未命名劇集',
              characters: storedCharacters,
              storyCards: cards,
              outline: storedOutline3,
            });
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
  const { projectTitle } = useProjectStore();
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
