import { useState } from 'react';
import { AestheticComposer, type AestheticOutput } from '@/components/shared/AestheticComposer';
import {
  S1aTopic, S1bOutline, S2Characters, S1cEpisodes,
  StageProgress, type ArchitectSubStage,
} from '@/components/shared/StoryArchitect';
import type { TopicOption, CharacterCard, EpisodeStoryCard, SeriesContext } from '@/adapters/types';
import { Layers } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { StepNavigation } from '@/components/shared/StepNavigation';
import { AIAssistantPanel } from '@/components/shared/AIAssistantPanel';
import { CreditIndicator } from '@/components/shared/CreditIndicator';
import { Logo } from '@/components/shared/Logo';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { t } from '@/i18n';
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
  const [episodeCount, setEpisodeCount] = useState(30);
  const [duration, setDuration] = useState('60秒');
  const [genre, setGenre] = useState('');
  const [tone, setTone] = useState('');
  const [need, setNeed] = useState('');
  const [aestheticLockOpen, setAestheticLockOpen] = useState(false);
  const [aestheticLocked, setAestheticLocked] = useState<AestheticOutput | null>(null);

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
            defaultValue="街市情緣"
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

        {/* 系列美學鎖 */}
        <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
          <button
            onClick={() => setAestheticLockOpen(v => !v)}
            className="w-full flex items-center justify-between p-4 hover:bg-bg-soft transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${aestheticLocked ? 'bg-violet-500' : 'bg-bg-soft border border-line'}`}>
                <Layers size={15} className={aestheticLocked ? 'text-white' : 'text-muted'} />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-ink">{tr.aestheticComposer.seriesLock.title}</div>
                <div className="text-xs text-muted">
                  {aestheticLocked
                    ? tr.aestheticComposer.seriesLock.locked
                    : tr.aestheticComposer.seriesLock.hint}
                </div>
              </div>
            </div>
            <ChevronDown size={16} className={`text-muted transition-transform ${aestheticLockOpen ? 'rotate-180' : ''}`} />
          </button>
          {aestheticLockOpen && (
            <div className="border-t border-line p-4">
              <AestheticComposer
                mode="drama"
                initialOutput={aestheticLocked ?? undefined}
                isSeriesLock
                onApply={(output) => {
                  setAestheticLocked(output);
                  setAestheticLockOpen(false);
                }}
                onCancel={() => setAestheticLockOpen(false)}
              />
            </div>
          )}
        </div>

        <button
          onClick={onNext}
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
// 前置: 策劃案總覽（Plan Overview）
// ─────────────────────────────────────────
function PlanOverview({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-semibold mb-3">
          <Eye size={12} /> 策劃案總覽
        </div>
        <h2 className="text-2xl font-bold text-primary">確認策劃案，再開始製作</h2>
        <p className="text-muted text-sm mt-1">以下係根據你的系列設定生成的策劃案，確認後才會開始消耗積分。</p>
      </div>

      <div className="space-y-4 mb-6">
        {/* 一頁總覽 */}
        <div className="bg-card rounded-xl border border-line p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink">《街市情緣》系列策劃</h3>
            <span className="text-xs text-muted bg-bg-soft px-2 py-1 rounded">草稿</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: '題材類型', value: '圓夢類 🌟' },
              { label: '情感基調', value: '溫暖 😌' },
              { label: '核心情感需求', value: '🌟 被看見' },
              { label: '總集數', value: '30 集' },
              { label: '每集時長', value: '60 秒' },
              { label: '目標受眾', value: '55–75 歲長者及家庭' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-bg-soft rounded-lg p-3">
                <p className="text-xs text-muted mb-0.5">{label}</p>
                <p className="font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI 生成的故事核心預覽 */}
        <div className="bg-card rounded-xl border border-line p-6 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-accent" />
            <h3 className="font-bold text-ink">AI 生成的故事核心預覽</h3>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-ink leading-relaxed">
            <p className="font-medium mb-2">《街市情緣》— 30集 溫暖圓夢劇</p>
            <p className="text-muted">陳伯係一位在灣仔街市做咗四十年豬肉佬嘅老師傅。年輕時因為家貧放棄咗夢想做廚師，但佢嘅廚藝秘笈一直藏喺心底。退休前最後一個月，佢遇上咗一班想學廚藝的年輕人，跌跌碰碰之間，陳伯終於喺生命嘅黃昏時分，圓咗年輕時嘅廚師夢……</p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-center">
            <div className="bg-bg-soft rounded-lg p-2">
              <div className="font-semibold text-primary">開端</div>
              <div className="text-muted">第1–8集</div>
            </div>
            <div className="bg-bg-soft rounded-lg p-2">
              <div className="font-semibold text-primary">發展＋高潮</div>
              <div className="text-muted">第9–25集</div>
            </div>
            <div className="bg-bg-soft rounded-lg p-2">
              <div className="font-semibold text-primary">結局</div>
              <div className="text-muted">第26–30集</div>
            </div>
          </div>
        </div>

        {/* 積分估算 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <h3 className="font-bold text-ink mb-3">製作積分估算</h3>
          <div className="space-y-2 text-sm">
            {[
              { step: 'S3 故事框架生成', credits: 15 },
              { step: 'S4 分鏡生成（30集）', credits: 60 },
              { step: 'S5 關鍵幀生成', credits: 120 },
              { step: 'S6 影片批量生成', credits: 300 },
              { step: 'S7 粵語配音', credits: 80 },
            ].map(({ step, credits }) => (
              <div key={step} className="flex items-center justify-between">
                <span className="text-muted">{step}</span>
                <span className="font-semibold text-ink">{credits} 積分</span>
              </div>
            ))}
            <div className="border-t border-line pt-2 flex items-center justify-between font-bold">
              <span className="text-ink">預計總消耗</span>
              <span className="text-accent text-lg">575 積分</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex items-center gap-2 border border-line px-5 py-3 rounded-xl text-muted hover:border-primary hover:text-primary transition-colors text-sm">
          <Save size={15} /> {tr.creator.drama.s9.saveDraft}
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
        >
          <Check size={18} /> {tr.creator.drama.s0.confirmBtn}
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
type SelectedSponsorAsset = { brandId: string; assetId: string; category: SponsorCategory; name: string; img: string; tag: string };

const TIER_COLORS: Record<string, string> = {
  '白金贊助': 'bg-slate-100 text-slate-700 border-slate-300',
  '金牌贊助': 'bg-amber-50 text-amber-700 border-amber-300',
  '銀牌贊助': 'bg-gray-100 text-gray-600 border-gray-300',
};

function S1AssetBank({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const [activeTab, setActiveTab] = useState<'own' | 'sponsor'>('own');
  const [sponsorCategory, setSponsorCategory] = useState<SponsorCategory>('car');
  const [expandedBrand, setExpandedBrand] = useState<string | null>('lexus');
  const [selectedSponsorAssets, setSelectedSponsorAssets] = useState<SelectedSponsorAsset[]>([]);
  const [showSponsorInfo, setShowSponsorInfo] = useState(false);

  const sponsorCategories: { id: SponsorCategory; icon: React.ElementType; label: string; desc: string; color: string }[] = [
    { id: 'car',        icon: Car,            label: tr.creator.drama.s1.catCar,        desc: tr.creator.drama.s1.catCarDesc,        color: 'text-blue-500' },
    { id: 'restaurant', icon: UtensilsCrossed, label: tr.creator.drama.s1.catRestaurant, desc: tr.creator.drama.s1.catRestaurantDesc, color: 'text-orange-500' },
    { id: 'product',    icon: ShoppingBag,     label: tr.creator.drama.s1.catProduct,    desc: tr.creator.drama.s1.catProductDesc,    color: 'text-purple-500' },
    { id: 'location',   icon: MapPin,          label: tr.creator.drama.s1.catLocation,   desc: tr.creator.drama.s1.catLocationDesc,   color: 'text-green-500' },
  ];

  const ownAssetIcons = [Users, Image, Camera, Music];
  const ownAssetColors = ['text-blue-500','text-green-500','text-purple-500','text-amber-500'];
  const ownAssetTypes = tr.creator.drama.s1.ownAssets.map((a, i) => ({
    icon: ownAssetIcons[i], label: a.label, color: ownAssetColors[i],
    accept: a.accept, count: [0,2,0,1][i],
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
              <div className="border-2 border-dashed border-line rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload size={20} className="mx-auto text-muted mb-1" />
                <p className="text-xs text-muted">{tr.creator.drama.s1.uploadPrompt}</p>
              </div>
            </div>
          ))}

          {/* Preview grid */}
          <div className="bg-card rounded-xl border border-line p-5 shadow-card">
            <h3 className="font-semibold text-ink text-sm mb-3">{tr.creator.drama.s1.previewTitle}</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&h=120&fit=crop',
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&h=120&fit=crop',
                'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=120&h=120&fit=crop',
              ].map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt="" className="w-full aspect-square object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                    <button className="text-white text-xs">刪除</button>
                  </div>
                </div>
              ))}
              <div className="aspect-square border-2 border-dashed border-line rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <Plus size={20} className="text-muted" />
              </div>
            </div>
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
          onClick={onNext}
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
};

const DEFAULT_APPEARANCE: AppearanceOptions = {
  height: '', build: '', skin: '', hair: '', hairColor: '', hairLength: '',
  face: '', eyes: '', eyewear: '', facial: '', posture: '', style: '',
};

// ── Shared: CharacterProfileCard ────────────────────────────────────────────
function CharacterProfileCard({
  img, name, role, age, bg, similarity, setSimilarity, mode,
}: {
  img: string; name: string; role: string; age: string; bg: string;
  similarity: string; setSimilarity: (v: string) => void;
  mode: 'drama' | 'legacy';
}) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const [traits, setTraits] = useState(['開朗樂觀', '勤力', '重情義', '愛說故事', '傳統']);
  const [newTrait, setNewTrait] = useState('');
  const [addingTrait, setAddingTrait] = useState(false);
  const [appearance, setAppearance] = useState<AppearanceOptions>(DEFAULT_APPEARANCE);
  const [showAppearance, setShowAppearance] = useState(false);

  const removeTrait = (t: string) => setTraits(prev => prev.filter(x => x !== t));
  const addTrait = () => {
    const v = newTrait.trim();
    if (v && !traits.includes(v)) setTraits(prev => [...prev, v]);
    setNewTrait(''); setAddingTrait(false);
  };

  const setApp = (k: keyof AppearanceOptions, v: string) =>
    setAppearance(prev => ({ ...prev, [k]: prev[k] === v ? '' : v }));

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
                onClick={() => setTraits(prev => [...prev, p])}
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
              />
            </div>

            {/* Preview summary */}
            {Object.values(appearance).some(Boolean) && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-xs text-primary font-semibold mb-1">{s2tr.appearancePreview}</p>
                <p className="text-xs text-ink leading-relaxed">
                  {[
                    appearance.height, appearance.build,
                    appearance.skin ? appearance.skin + '膚色' : '',
                    appearance.hairLength && appearance.hairColor ? `${appearance.hairColor}${appearance.hairLength}${appearance.hair || ''}` : (appearance.hair || ''),
                    appearance.face, appearance.eyewear !== '無眼鏡' ? appearance.eyewear : '',
                    appearance.facial !== '無鬚' ? appearance.facial : '',
                    appearance.eyes, appearance.posture, appearance.style,
                  ].filter(Boolean).join('，')}
                </p>
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
// S2: 主要角色設定（新版）
// 靈魂欄位（欲望/弧線/語言）+ 視覺欄位（外型/一致性）
// 允許「淨係主角」過關；re-entrant 不清空 S3 資料
// ─────────────────────────────────────────
function S2CharacterSetup({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  // 從 store 讀取已有角色（re-entrant：返回時保留）
  const { characters: storedCharacters, setCharacters: storeSetCharacters } = useProjectStore();

  // 固定的系列上下文（之後可從 S0 store 讀取）
  const context: SeriesContext = {
    seriesTitle: '街市情緣',
    genre: 'dream',
    tone: 'warm',
    coreNeed: 'seen',
    episodeCount: 30,
    durationLabel: '60秒',
    mode: 'drama',
  };

  const handleAccept = (chars: CharacterCard[]) => {
    storeSetCharacters(chars);
    // 注意：不清空 S3 資料（不呼叫 setSelectedTopic/setOutline/setStoryCards）
    onNext();
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="mb-2">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3">
          <Users size={12} /> S2 主要角色設定
        </div>
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s2.title}</h2>
        <p className="text-muted text-sm mt-1">先定 1–2 個主角，配角隨時可回頭補充。靈魂欄位餵給故事生成，視覺欄位餵給關鍵幀。</p>
      </div>

      {/* 已有角色時顯示已存角色提示 */}
      {storedCharacters.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
          <Users size={16} className="text-blue-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800">已有 {storedCharacters.length} 個角色</p>
            <p className="text-xs text-blue-600">返回編輯唔會清空 S3 已生成的故事框架。</p>
          </div>
        </div>
      )}

      {/* 使用 StoryArchitect 的 S2Characters 元件（靈魂欄位完整） */}
      <S2Characters
        context={context}
        onAccept={handleAccept}
      />

      {/* 主角已定，快速過關 CTA */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-amber-800">只定主角，稍後補配角？</p>
          <p className="text-xs text-amber-600 mt-0.5">S2 隨時可回頭新增或修改角色，不影響已生成的故事。</p>
        </div>
        <button
          onClick={() => {
            // 允許「淨係主角」過關：即使無角色也可進入 S3
            onNext();
          }}
          className="shrink-0 flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
        >
          <ChevronRight size={15} />
          主角已定，開始寫故事
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

  // 從 store 讀取 S2 角色資料（作為生成上下文）
  const {
    characters: storedCharacters,
    setSelectedTopic: storeSetTopic,
    setOutline: storeSetOutline,
    setStoryCards: storeSetStoryCards,
    setCoCreated,
    isCoCreated, coCreateNote,
  } = useProjectStore();

  // 系列上下文（之後可從 S0 store 讀取）
  const context: SeriesContext = {
    seriesTitle: '街市情緣',
    genre: 'dream',
    tone: 'warm',
    coreNeed: 'seen',
    episodeCount: 30,
    durationLabel: '60秒',
    mode: 'drama',
  };

  // 子階段狀態
  const [subStage, setSubStage] = useState<ArchitectSubStage>('topic');
  const [selectedTopic, setSelectedTopic] = useState<TopicOption | null>(null);
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
        <p className="text-muted text-sm mt-1">選題方向 → 全劇大綱 → 逐集故事卡，每步都可接受、重生成或手動編輯。</p>
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

      {/* 3a 選題方向 */}
      {subStage === 'topic' && (
        <S1aTopic
          context={context}
          onAccept={(topic) => {
            setSelectedTopic(topic);
            storeSetTopic(topic);
            setSubStage('outline');
          }}
        />
      )}

      {/* 3b 全劇大綱 */}
      {subStage === 'outline' && selectedTopic && (
        <S1bOutline
          context={context}
          selectedTopic={selectedTopic}
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
          characters={storedCharacters}   // ← 讀取 S2 角色作為故事生成上下文
          onAccept={(cards) => {
            setStoryCards(cards);
            storeSetStoryCards(cards);
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
          <h3 className="text-lg font-bold text-ink mb-2">故事框架完成！</h3>
          <p className="text-muted text-sm mb-4">選題方向、全劇大綱及分集故事卡已儲存，可隨時返回修改。</p>

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
  const [genMode, setGenMode] = useState<'reference' | 'text'>('reference');
  const [aestheticOpen, setAestheticOpen] = useState(false);
  const [aestheticOutput, setAestheticOutput] = useState<AestheticOutput | null>(null);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s5.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s5.subtitle}</p>
      </div>

      {/* 美學定義器前置步驟 */}
      <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden mb-4">
        <button
          onClick={() => setAestheticOpen(v => !v)}
          className="w-full flex items-center justify-between p-4 hover:bg-bg-soft transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${aestheticOutput ? 'bg-violet-500' : 'bg-bg-soft border border-line'}`}>
              <Layers size={15} className={aestheticOutput ? 'text-white' : 'text-muted'} />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-ink">{tr.aestheticComposer.common.toolName}</div>
              <div className="text-xs text-muted">
                {aestheticOutput
                  ? tr.aestheticComposer.seriesLock.locked
                  : tr.aestheticComposer.composer.subtitle}
              </div>
            </div>
          </div>
          <ChevronDown size={16} className={`text-muted transition-transform ${aestheticOpen ? 'rotate-180' : ''}`} />
        </button>
        {aestheticOpen && (
          <div className="border-t border-line p-4">
            <AestheticComposer
              mode="drama"
              initialOutput={aestheticOutput ?? undefined}
              onApply={(output) => {
                setAestheticOutput(output);
                setAestheticOpen(false);
              }}
              onCancel={() => setAestheticOpen(false)}
            />
          </div>
        )}
        {aestheticOutput && !aestheticOpen && (
          <div className="border-t border-line px-4 py-2 bg-violet-50 text-xs text-violet-700 flex items-center gap-2">
            <Check size={12} />
            <span className="line-clamp-1">{aestheticOutput.compiledPromptZh}</span>
          </div>
        )}
      </div>

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
  const [gate, setGate] = useState<'params' | 'credit' | 'generating' | 'done'>('params');

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s6.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s6.subtitle}</p>
      </div>

      {gate === 'params' && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-line p-5 shadow-card">
            <h3 className="font-semibold text-ink text-sm mb-4">{tr.creator.drama.s6.paramsTitle}</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: tr.creator.drama.s6.engineLabel, value: 'Seedance 2.0（最高一致性）' },
                { label: tr.creator.drama.s6.qualityLabel, value: '1080p Full HD' },
                { label: tr.creator.drama.s6.batchLabel, value: '第1–30集（共30集）' },
                { label: tr.creator.drama.s6.durationLabel, value: '60秒' },
                { label: tr.creator.drama.s6.consistencyLabel, value: '跨集保持（綁定系列 ID）' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-muted">{label}</span>
                  <span className="font-medium text-ink">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setGate('credit')}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            {tr.creator.drama.s6.confirmParamsBtn}
          </button>
        </div>
      )}

      {gate === 'credit' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <Zap size={32} className="mx-auto text-amber-500 mb-3" />
            <p className="font-bold text-ink text-lg mb-1">{tr.creator.drama.s6.creditConfirmTitle}</p>
            <p className="text-muted text-sm mb-2">{tr.creator.drama.s6.creditConfirmDesc}</p>
            <p className="text-xs text-muted">{tr.creator.drama.s6.creditBalance}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setGate('params')}
              className="flex-1 border border-line px-5 py-3 rounded-xl text-muted hover:border-primary transition-colors text-sm"
            >
              {tr.creator.drama.s6.backBtn}
            </button>
            <button
              onClick={() => setGate('generating')}
              className="flex-1 bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors"
            >
              {tr.creator.drama.s6.startGenBtn}
            </button>
          </div>
        </div>
      )}

      {gate === 'generating' && (
        <div className="bg-card rounded-xl border border-line p-8 shadow-card text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Film size={28} className="text-primary" />
          </div>
          <p className="font-bold text-ink text-lg mb-1">{tr.creator.drama.s6.generating}</p>
          <p className="text-muted text-sm mb-4">{tr.creator.drama.s6.generatingDesc}</p>
          <div className="space-y-2 text-sm text-left mb-4">
            {['第1–5集', '第6–10集', '第11–15集'].map((eps, i) => (
              <div key={eps} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-primary animate-pulse' : 'bg-line'}`}>
                  {i === 0 && <Check size={10} className="text-white" />}
                </div>
                <span className={i < 2 ? 'text-ink' : 'text-muted'}>{eps}</span>
                {i === 1 && <span className="text-xs text-primary ml-auto">生成中⋯</span>}
              </div>
            ))}
          </div>
          <button onClick={() => setGate('done')} className="text-xs text-accent hover:underline">
            {tr.creator.drama.s6.generatingDemo}
          </button>
        </div>
      )}

      {gate === 'done' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <Check size={28} className="mx-auto text-green-500 mb-2" />
            <p className="font-bold text-ink">{tr.creator.drama.s6.doneTitle}</p>
            <p className="text-sm text-muted mt-1">{tr.creator.drama.s6.doneDesc}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(ep => (
              <div key={ep} className="bg-card border border-line rounded-lg overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Film size={20} className="text-primary/50" />
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-ink">第{ep}集</p>
                  <p className="text-xs text-muted">60秒</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={onNext}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <ChevronRight size={18} /> {tr.creator.drama.s6.confirmBtn}
          </button>
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
// Route index map (11 items, no hidden routes):
//   0  = S0SeriesSetup
//   1  = PlanOverview        (策劃案總覽，導覽列有視覺標記)
//   2  = S1AssetBank
//   3  = S2CharacterSetup    (新版)
//   4  = S3StoryFramework    (新版)
//   5  = S4Storyboard
//   6  = S5Keyframes
//   7  = S6VideoGen
//   8  = S7Voiceover
//   9  = S8PlatformEdit
//   10 = S9ReviewPublish
// ─────────────────────────────────────────
const STEPS = [
  S0SeriesSetup,       // 0
  PlanOverview,        // 1 (策劃案總覽，有視覺標記)
  S1AssetBank,         // 2
  S2CharacterSetup,    // 3 (新版)
  S3StoryFramework,    // 4 (新版)
  S4Storyboard,        // 5
  S5Keyframes,         // 6
  S6VideoGen,          // 7
  S7Voiceover,         // 8
  S8PlatformEdit,      // 9
  S9ReviewPublish,     // 10
];

// routeStep 轉 navStep：
// route 0 → nav 0 (S0)
// route 1 → nav 0 (PlanOverview，不在 dramaSteps 計數，用 isPlanOverview)
// route 2 → nav 1 (S1)
// route 3+ → nav (route - 2)
function routeStepToNavStep(routeStep: number): number {
  if (routeStep === 0) return 0;
  if (routeStep === 1) return 0; // PlanOverview：navStep 停在 0，靠 isPlanOverview flag
  return routeStep - 2;
}

// navStep 轉 routeStep（導覽列點擊）：
// nav 0 → route 0 (S0)
// nav 1 → route 2 (S1AssetBank)
// nav n≥2 → route n+2
function navStepToRouteStep(navStep: number): number {
  if (navStep === 0) return 0;
  return navStep + 2;
}

export default function DramaWorkflow() {
  const { step } = useParams();
  const navigate = useNavigate();
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const routeStep = Math.min(parseInt(step ?? '0', 10), 10);
  const StepComponent = STEPS[routeStep];

  // isPlanOverview: route 1 是策劃案總覽，導覽列 navStep 維持在 0 但顯示視覺標記
  const isPlanOverview = routeStep === 1;
  const navStep = routeStepToNavStep(routeStep);

  const goNext = () => navigate(`/creator/drama/${Math.min(routeStep + 1, 10)}`);

  // Determine series title for header
  const seriesTitles: Record<number, string> = {
    0: tr.creator.modeSelect.dramaTitle,
  };
  const headerTitle = seriesTitles[routeStep] ?? '街市情緣';

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-4 shrink-0">
          <Logo size="sm" withWordmark />
          <span className="text-primary font-bold">{tr.creator.modeSelect.dramaTitle}</span>
          <span className="text-muted text-sm">· {headerTitle}</span>
          <div className="ml-auto flex items-center gap-3">
            <Heart size={16} className="text-accent" />
            <span className="text-xs text-muted">{tr.creator.credits} 842</span>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          {/* Step nav */}
          <div className="w-48 shrink-0 bg-card border-r border-line overflow-y-auto">
            <StepNavigation
              mode="drama"
              currentStep={navStep}
              isPlanOverview={isPlanOverview}
              onStepClick={s => navigate(`/creator/drama/${navStepToRouteStep(s)}`)}
              onPlanOverviewClick={() => navigate('/creator/drama/1')}
            />
          </div>
          {/* Canvas */}
          <main className="flex-1 overflow-y-auto p-8">
            <StepComponent onNext={goNext} />
          </main>
          {/* AI Assistant */}
          <aside className="w-72 shrink-0 overflow-hidden">
            <AIAssistantPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
