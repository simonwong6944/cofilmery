import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { StepNavigation } from '@/components/shared/StepNavigation';
import { AIAssistantPanel } from '@/components/shared/AIAssistantPanel';
import { CreditIndicator } from '@/components/shared/CreditIndicator';
import { Logo } from '@/components/shared/Logo';
import {
  AlertTriangle, RefreshCw, Check, Mic, Save, ChevronDown, ChevronRight,
  Sparkles, Image, Film, Music, Edit3, Upload, Zap, Eye, Send,
  Heart, Clock, Star, Users, BookOpen, Camera
} from 'lucide-react';

// ─────────────────────────────────────────
// S0: 系列設定
// ─────────────────────────────────────────
function S0SeriesSetup({ onNext }: { onNext: () => void }) {
  const [episodeCount, setEpisodeCount] = useState(30);
  const [duration, setDuration] = useState('60秒');
  const [genre, setGenre] = useState('');
  const [tone, setTone] = useState('');
  const [need, setNeed] = useState('');

  const genres = [
    { id: 'dream', icon: '🌟', label: '圓夢類', desc: '年輕時的未竟心願，晚年實現' },
    { id: 'love', icon: '💛', label: '愛情回憶類', desc: '錯過的愛情、重逢與和解' },
    { id: 'family', icon: '👨‍👩‍👧‍👦', label: '家庭溫情類', desc: '兒孫滿堂、跨代連結、親情修復' },
    { id: 'restart', icon: '🌺', label: '人生重啟類', desc: '55歲後重新出發、找回自我' },
    { id: 'nostalgia', icon: '🕰️', label: '年代回憶類', desc: '香港60–90年代背景、集體記憶' },
    { id: 'hero', icon: '🤝', label: '長者英雄類', desc: '熟齡智慧解決問題、被需要' },
  ];

  const tones = [
    { id: 'warm', icon: '😌', label: '溫暖', desc: '細水長流，看完有被擁抱的感覺' },
    { id: 'touching', icon: '🥲', label: '感動', desc: '催淚、觸動、引起共鳴' },
    { id: 'light', icon: '😊', label: '輕鬆', desc: '生活化、親切、有笑點但不失溫度' },
    { id: 'nostalgic', icon: '💛', label: '懷舊', desc: '舊日香港氛圍、時代感' },
    { id: 'inspiring', icon: '🌱', label: '勵志', desc: '唔怕遲、重新出發、仍有可能' },
    { id: 'healing', icon: '💔', label: '療癒', desc: '遺憾被接納、傷口被理解、和解' },
  ];

  const needs = [
    { id: 'seen', label: '🌟 被看見', desc: '長者的價值與貢獻被認可' },
    { id: 'connected', label: '💛 不孤單', desc: '連結感、有人陪伴、被愛' },
    { id: 'reconcile', label: '🔄 和解', desc: '與自己、家人、過去和解' },
    { id: 'possible', label: '✨ 仍有可能', desc: '年紀唔係終點，仍有新故事' },
  ];

  const durations = ['15秒', '30秒', '45秒', '60秒', '3分鐘', '5分鐘'];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">S0 · 系列設定</h2>
        <p className="text-muted text-sm mt-1">設定你的短劇系列基本資訊，AI 會根據這些資訊為你量身生成故事框架。</p>
      </div>

      <div className="space-y-6">
        {/* 劇集名稱 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-2">劇集名稱</label>
          <input
            className="w-full border border-line rounded-lg px-3 py-2.5 bg-bg-soft focus:outline-none focus:border-primary text-ink"
            placeholder="例：街市情緣、阿婆的裁縫心事"
            defaultValue="街市情緣"
          />
        </div>

        {/* 題材類型 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <label className="block text-sm font-semibold text-ink mb-3">題材類型</label>
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
          <label className="block text-sm font-semibold text-ink mb-3">情感基調</label>
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
          <label className="block text-sm font-semibold text-ink mb-1">核心情感需求</label>
          <p className="text-xs text-muted mb-3">呢套劇最想讓觀眾（長者）感受到什麼？</p>
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
                集數規劃（最多 70 集）
              </label>
              <input
                type="range" min={5} max={70} value={episodeCount}
                onChange={e => setEpisodeCount(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-sm text-primary font-semibold mt-1">已選：{episodeCount} 集</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">每集時長</label>
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
          <label className="block text-sm font-semibold text-ink mb-3">目標受眾</label>
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
          <label className="block text-sm font-semibold text-ink mb-2">品牌 / 商業背景（選填）</label>
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
            <p className="font-semibold text-sm text-ink">確認前注意</p>
            <p className="text-sm text-muted mt-0.5">系列設定確認後，AI 將生成策劃案總覽供你審閱，然後才開始消耗積分。</p>
          </div>
        </div>

        <button
          onClick={onNext}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronRight size={18} />
          確認系列設定，查看策劃案總覽
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 前置: 策劃案總覽（Plan Overview）
// ─────────────────────────────────────────
function PlanOverview({ onNext }: { onNext: () => void }) {
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
          <Save size={15} /> 儲存草稿
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
        >
          <Check size={18} /> 確認策劃，進入資產庫
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// S1: 資產庫（Asset Bank，綁定 series_id）
// ─────────────────────────────────────────
function S1AssetBank({ onNext }: { onNext: () => void }) {
  const assetTypes = [
    { icon: Users, label: '角色參考圖', count: 0, color: 'text-blue-500', accept: 'JPG/PNG' },
    { icon: Image, label: '場景參考圖', count: 2, color: 'text-green-500', accept: 'JPG/PNG' },
    { icon: Camera, label: '道具 / 服裝', count: 0, color: 'text-purple-500', accept: 'JPG/PNG' },
    { icon: Music, label: '背景音樂', count: 1, color: 'text-amber-500', accept: 'MP3/WAV' },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">S1 · 資產庫</h2>
        <p className="text-muted text-sm mt-1">上傳系列視覺素材，確保所有集數角色和場景保持一致。</p>
        <div className="inline-flex items-center gap-1.5 mt-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
          <Zap size={11} /> 綁定系列 ID：DRAMA-2026-001
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {assetTypes.map((type, i) => (
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
              <p className="text-xs text-muted">點擊上傳或拖放</p>
            </div>
          </div>
        ))}

        {/* 已上傳素材預覽 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <h3 className="font-semibold text-ink text-sm mb-3">已上傳素材</h3>
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
              <span className="text-muted text-2xl">+</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} />
        資產庫確認，進入角色設定
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S2: 角色設定
// ─────────────────────────────────────────
function S2CharacterSetup({ onNext }: { onNext: () => void }) {
  const [selectedChar, setSelectedChar] = useState(0);
  const characters = [
    {
      name: '陳伯', role: '主角', age: '72歲', bg: '退休豬肉佬，性格開朗樂觀，愛做菜',
      similarity: '極似', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    },
    {
      name: '陳太', role: '女主角', age: '68歲', bg: '陳伯老伴，賢惠體貼，支持丈夫圓夢',
      similarity: '70%', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
    },
    {
      name: '阿明', role: '配角', age: '35歲', bg: '街坊年輕人，跟陳伯學廚的學生',
      similarity: '神韻', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    },
  ];

  const similarityLabels = [
    { id: '極似', label: '極似', desc: '幾乎一模一樣（AI 強一致性）', color: 'bg-green-500' },
    { id: '70%', label: '70%', desc: '主要特徵保持，細節有變化', color: 'bg-blue-500' },
    { id: '神韻', label: '神韻', desc: '捕捉神態氣質，不拘形似', color: 'bg-purple-500' },
  ];

  const char = characters[selectedChar];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">S2 · 角色設定</h2>
        <p className="text-muted text-sm mt-1">建立系列角色卡，設定 AI 生成時的外型一致性程度。</p>
      </div>

      <div className="space-y-4 mb-6">
        {/* 角色列表 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-ink text-sm">角色陣容</h3>
            <button className="text-accent text-sm hover:underline flex items-center gap-1">
              <span>+</span> 新增角色
            </button>
          </div>
          <div className="flex gap-3">
            {characters.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelectedChar(i)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  selectedChar === i ? 'border-primary bg-primary/5' : 'border-line hover:border-primary/40'
                }`}
              >
                <img src={c.img} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                <span className="text-xs font-semibold text-ink">{c.name}</span>
                <span className="text-xs text-muted">{c.role}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 選中角色詳情 */}
        <div className="bg-card rounded-xl border border-line p-5 shadow-card">
          <div className="flex gap-4 mb-4">
            <img src={char.img} alt={char.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted">角色名稱</label>
                  <input className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary" defaultValue={char.name} />
                </div>
                <div>
                  <label className="text-xs text-muted">角色定位</label>
                  <input className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary" defaultValue={char.role} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted">年齡 / 背景</label>
                <input className="w-full border border-line rounded px-2 py-1.5 text-sm bg-bg-soft focus:outline-none focus:border-primary" defaultValue={`${char.age} · ${char.bg}`} />
              </div>
            </div>
          </div>

          {/* 一致性標籤 */}
          <div>
            <label className="text-sm font-semibold text-ink mb-2 block">AI 生成一致性設定</label>
            <div className="grid grid-cols-3 gap-2">
              {similarityLabels.map(s => (
                <button
                  key={s.id}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    char.similarity === s.id
                      ? 'border-primary bg-primary/5'
                      : 'border-line hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${s.color}`} />
                    <span className="font-bold text-sm text-ink">{s.label}</span>
                  </div>
                  <p className="text-xs text-muted leading-tight">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 border border-dashed border-line rounded-lg p-3 text-center cursor-pointer hover:border-primary transition-colors">
            <Upload size={16} className="mx-auto text-muted mb-1" />
            <p className="text-xs text-muted">上傳角色參考圖（可多張）</p>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} />
        角色確認，進入故事框架
        <CreditIndicator cost={0} className="ml-2" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S3: 故事框架（3a → 3b → 3c 垂直展開）
// ─────────────────────────────────────────
function S3StoryFramework({ onNext }: { onNext: () => void }) {
  const [phase3a, setPhase3a] = useState(true);
  const [phase3b, setPhase3b] = useState(false);
  const [phase3bDone, setPhase3bDone] = useState(false);
  const [phase3c, setPhase3c] = useState(false);

  const arcData = [
    {
      act: '第一幕：開端', eps: '第1–8集', theme: '街市老師傅的最後一個月',
      core: '介紹陳伯的退休倒數，埋下廚師夢的伏線',
      points: [
        { ep: 1, plot: '陳伯最後一天上班，街坊依依不捨', hook: '陳太無意發現陳伯藏了一本舊廚藝筆記' },
        { ep: 2, plot: '退休第一天，陳伯無所適從', hook: '阿明登門拜師，陳伯拒絕' },
        { ep: 3, plot: '阿明第三次求師，陳伯動搖', hook: '廚藝筆記第一頁出現：「給未來的自己」' },
      ],
    },
    {
      act: '第二幕：發展', eps: '第9–22集', theme: '師徒情誼，跌跌撞撞學廚藝',
      core: '陳伯打開心扉，師徒關係昇華，家人關係修復',
      points: [
        { ep: 9, plot: '第一堂廚藝課，笑料百出', hook: '阿明比賽報名截止迫近' },
        { ep: 15, plot: '陳太生病，陳伯崩潰放棄', hook: '阿明獨自練習，拍下影片給陳伯' },
      ],
    },
    {
      act: '第三幕：高潮＋結局', eps: '第23–30集', theme: '圓夢舞台，老夫妻的最美結局',
      core: '廚藝比賽登場，陳伯以觀眾身份重新看見自己的價值',
      points: [
        { ep: 23, plot: '比賽當日，阿明失常', hook: '陳伯衝上舞台，親自示範' },
        { ep: 30, plot: '陳伯獲得「終身成就獎」', hook: '全劇終' },
      ],
    },
  ];

  const episodeCards = [
    { ep: 1, scene: '豬肉檔，清晨五點', conflict: '陳伯最後一天上班，心情複雜', dialogue: '陳伯（低沉）：「做咗四十年，今日係最後一次⋯」', hook: '陳太在家發現舊廚藝筆記，封面寫：給未來的自己' },
    { ep: 2, scene: '陳伯家廳，早上', conflict: '退休第一天無所事事，連倒垃圾都倒錯時間', dialogue: '陳太（溫柔）：「係咪悶㗎？」陳伯（倔強）：「我唔悶！」', hook: '門鈴響，阿明出現在門口' },
    { ep: 3, scene: '街市舊鋪位，黃昏', conflict: '阿明三顧茅廬，陳伯終於動搖', dialogue: '阿明（誠懇）：「陳伯，我唔係要學廚藝，我係想學您嘅人生。」', hook: '陳伯打開廚藝筆記第一頁⋯' },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">S3 · 故事框架</h2>
        <p className="text-muted text-sm mt-1">分三步建立完整故事：輸入大綱 → AI 生成結構 → AI 逐集展開腳本。</p>
      </div>

      <div className="space-y-4">
        {/* ── 3a 大綱 ── */}
        <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
          <button
            onClick={() => setPhase3a(!phase3a)}
            className="w-full flex items-center justify-between p-5 hover:bg-bg-soft transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">3a</span>
              <div className="text-left">
                <div className="font-bold text-ink">大綱輸入</div>
                <div className="text-xs text-muted">創作者輸入故事核心</div>
              </div>
            </div>
            {phase3a ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
          </button>

          {phase3a && (
            <div className="px-5 pb-5 space-y-4 border-t border-line pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted mb-1 block">核心衝突</label>
                  <textarea
                    className="w-full border border-line rounded-lg px-3 py-2 bg-bg-soft text-sm text-ink resize-none focus:outline-none focus:border-primary"
                    rows={2}
                    placeholder="主角面對什麼核心困境？"
                    defaultValue="陳伯年輕時放棄廚師夢，退休後不知如何面對空白人生"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">主角弧光（成長路徑）</label>
                  <textarea
                    className="w-full border border-line rounded-lg px-3 py-2 bg-bg-soft text-sm text-ink resize-none focus:outline-none focus:border-primary"
                    rows={2}
                    placeholder="主角由什麼狀態成長到什麼狀態？"
                    defaultValue="由「人生已完」的失落感，走向「重新被需要」的圓滿"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">主要場景</label>
                <input
                  className="w-full border border-line rounded-lg px-3 py-2 bg-bg-soft text-sm text-ink focus:outline-none focus:border-primary"
                  defaultValue="灣仔街市、陳伯家廳、社區廚藝中心"
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">重要角色關係</label>
                <input
                  className="w-full border border-line rounded-lg px-3 py-2 bg-bg-soft text-sm text-ink focus:outline-none focus:border-primary"
                  defaultValue="陳伯（主）＋ 陳太（支持者）＋ 阿明（觸發者）"
                />
              </div>
              <button
                onClick={() => { setPhase3b(true); setPhase3a(false); }}
                className="w-full bg-primary text-white py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles size={15} /> AI 生成故事框架
                <CreditIndicator cost={15} className="ml-1" />
              </button>
            </div>
          )}
        </div>

        {/* ── 3b 故事框架 ── */}
        {phase3b && (
          <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
            <button
              onClick={() => setPhase3b(!phase3b)}
              className="w-full flex items-center justify-between p-5 hover:bg-bg-soft transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">3b</span>
                <div className="text-left">
                  <div className="font-bold text-ink">故事框架</div>
                  <div className="text-xs text-muted">AI 生成章節 / 幕結構</div>
                </div>
                {phase3bDone && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">已確認</span>}
              </div>
              {phase3b ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
            </button>

            <div className="px-5 pb-5 border-t border-line pt-4 space-y-3">
              {arcData.map((arc, i) => (
                <div key={i} className="bg-bg-soft rounded-xl p-4 border border-line">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-primary text-sm">{arc.act}</span>
                      <span className="text-xs text-muted ml-2">{arc.eps}</span>
                    </div>
                    <button className="text-xs text-accent hover:underline flex items-center gap-1">
                      <RefreshCw size={11} /> 重生
                    </button>
                  </div>
                  <p className="text-xs text-ink font-medium mb-1">{arc.theme}</p>
                  <p className="text-xs text-muted mb-2">{arc.core}</p>
                  <div className="space-y-1.5">
                    {arc.points.map((pt, j) => (
                      <div key={j} className="bg-white rounded-lg px-3 py-2 text-xs border border-line/50">
                        <span className="font-semibold text-primary">第{pt.ep}集</span>
                        <span className="text-ink ml-2">{pt.plot}</span>
                        <div className="text-amber-600 mt-0.5">🔗 懸念：{pt.hook}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 border border-line px-4 py-2 rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors">
                  <RefreshCw size={13} /> 全部重生
                </button>
                <button
                  onClick={() => { setPhase3bDone(true); setPhase3c(true); setPhase3b(false); }}
                  className="flex-1 bg-accent text-white py-2 rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check size={14} /> 確認框架，AI 展開分集腳本
                  <CreditIndicator cost={10} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 3c 分集展開 ── */}
        {phase3c && (
          <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
            <button
              onClick={() => setPhase3c(!phase3c)}
              className="w-full flex items-center justify-between p-5 hover:bg-bg-soft transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">3c</span>
                <div className="text-left">
                  <div className="font-bold text-ink">分集展開</div>
                  <div className="text-xs text-muted">AI 逐集腳本格式（含鉤子）</div>
                </div>
              </div>
              {phase3c ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
            </button>

            <div className="px-5 pb-5 border-t border-line pt-4 space-y-3">
              {/* 前5集示例 */}
              {episodeCards.map((ep, i) => (
                <div key={i} className="bg-bg-soft rounded-xl p-4 border border-line">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-primary text-sm">第 {ep.ep} 集</span>
                    <button className="text-xs text-accent hover:underline flex items-center gap-1">
                      <RefreshCw size={11} /> 重生本集
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div><span className="text-muted font-medium">場景：</span><span className="text-ink">{ep.scene}</span></div>
                    <div><span className="text-muted font-medium">核心衝突：</span><span className="text-ink">{ep.conflict}</span></div>
                    <div className="bg-white border border-line rounded-lg p-2">
                      <span className="text-muted font-medium">對白片段：</span>
                      <p className="text-ink mt-0.5 italic">「{ep.dialogue}」</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                      <span className="text-amber-700 font-medium">結尾鉤子：</span>
                      <span className="text-amber-800">{ep.hook}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* 批量生成更多集 */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                <p className="text-sm text-primary font-medium mb-1">已生成 第1–5集</p>
                <p className="text-xs text-muted mb-3">繼續生成第 6–30 集</p>
                <button className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto">
                  <Sparkles size={14} /> 批量生成第6–30集
                  <CreditIndicator cost={50} className="ml-1" />
                </button>
              </div>

              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 border border-line px-4 py-2 rounded-lg text-sm text-muted hover:border-primary transition-colors">
                  <BookOpen size={13} /> 下載全集腳本
                </button>
                <button
                  onClick={onNext}
                  className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ChevronRight size={14} /> 確認所有集數，進入分鏡
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// S4: 分鏡
// ─────────────────────────────────────────
function S4Storyboard({ onNext }: { onNext: () => void }) {
  const panels = [
    { scene: 1, title: '街市清晨開檔', desc: '陳伯熟練地掛起豬肉，街坊陸續到來', cam: '全景→特寫', dur: 8 },
    { scene: 2, title: '最後一天告別', desc: '街坊圍著陳伯，眼帶不捨', cam: '中景，慢推鏡', dur: 10 },
    { scene: 3, title: '廚藝筆記出現', desc: '陳太打開陳伯的舊抽屜，發現泛黃筆記', cam: '特寫，跟焦', dur: 6 },
    { scene: 4, title: '夕陽收檔', desc: '陳伯最後一次關上鋪門，回望街市', cam: '廣角，逆光', dur: 8 },
  ];

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">S4 · 分鏡</h2>
        <p className="text-muted text-sm mt-1">AI 根據 3c 腳本自動生成分鏡初稿，可用自然語言編輯每個鏡頭。</p>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted">第1集 · 共 {panels.length} 個鏡頭</span>
        <div className="flex gap-2">
          <button className="text-xs border border-line px-3 py-1.5 rounded-lg text-muted hover:border-primary transition-colors">
            上一集
          </button>
          <button className="text-xs border border-line px-3 py-1.5 rounded-lg text-muted hover:border-primary transition-colors">
            下一集
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
                <button className="text-xs text-accent hover:underline">✏ 編輯</button>
                <span className="text-muted">·</span>
                <button className="text-xs text-muted hover:text-primary">AI改寫</button>
                <span className="text-muted">·</span>
                <button className="text-xs text-red-400 hover:underline">🗑</button>
              </div>
            </div>
          </div>
        ))}
        <div className="shrink-0 w-52 border-2 border-dashed border-line rounded-xl flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
          <div className="text-center text-muted">
            <span className="text-3xl block">+</span>
            <span className="text-xs">新增鏡頭</span>
          </div>
        </div>
      </div>

      {/* AI 自然語言編輯 */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-primary" />
          <span className="text-sm font-semibold text-primary">AI 分鏡助手</span>
        </div>
        <input
          className="w-full bg-white border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          placeholder="輸入修改指令，例：「把鏡頭3改成夜景，用柔和燈光」"
        />
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> 確認分鏡，生成關鍵幀
        <CreditIndicator cost={60} className="ml-2" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S5: 關鍵幀生成
// ─────────────────────────────────────────
function S5Keyframes({ onNext }: { onNext: () => void }) {
  const [genMode, setGenMode] = useState<'reference' | 'text'>('reference');

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">S5 · 關鍵幀生成</h2>
        <p className="text-muted text-sm mt-1">為每個分鏡生成關鍵視覺幀，角色一致性由 S2 角色設定保障。</p>
      </div>

      {/* 生成模式 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <label className="block text-sm font-semibold text-ink mb-3">生成模式</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'reference' as const, label: '參考圖模式', desc: '以 S1 資產庫的圖片作參考，保持視覺一致', icon: Image },
            { id: 'text' as const, label: '純文字模式', desc: '純 Prompt 生成，適合場景需全新創作', icon: Edit3 },
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
          <h3 className="font-semibold text-ink text-sm">資產完整度檢查</h3>
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
              {!item.ok && <span className="text-xs text-amber-600 ml-auto">建議補充</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 生成預覽 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-ink text-sm">第1集 關鍵幀預覽</h3>
          <button className="text-xs text-accent hover:underline flex items-center gap-1">
            <RefreshCw size={11} /> 全部重生
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
                <button className="text-white text-xs bg-white/20 px-2 py-1 rounded">接受</button>
                <button className="text-white text-xs bg-white/20 px-2 py-1 rounded">重生</button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
          <Check size={11} /> 角色一致性：陳伯 94% · 陳太 88%
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> 確認關鍵幀，批量生成影片
        <CreditIndicator cost={120} className="ml-2" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S6: 影片批量生成（兩步確認門）
// ─────────────────────────────────────────
function S6VideoGen({ onNext }: { onNext: () => void }) {
  const [gate, setGate] = useState<'params' | 'credit' | 'generating' | 'done'>('params');

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">S6 · 影片批量生成</h2>
        <p className="text-muted text-sm mt-1">以 Seedance 2.0 批量生成所有集數影片，角色一致性跨集保持。</p>
      </div>

      {gate === 'params' && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-line p-5 shadow-card">
            <h3 className="font-semibold text-ink text-sm mb-4">生成參數確認</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: '影片引擎', value: 'Seedance 2.0（最高一致性）' },
                { label: '輸出畫質', value: '1080p Full HD' },
                { label: '批量集數', value: '第1–30集（共30集）' },
                { label: '每集時長', value: '60秒' },
                { label: '角色一致性', value: '跨集保持（綁定系列 ID）' },
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
            確認參數，查看積分消耗
          </button>
        </div>
      )}

      {gate === 'credit' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <Zap size={32} className="mx-auto text-amber-500 mb-3" />
            <p className="font-bold text-ink text-lg mb-1">確認消耗 300 積分</p>
            <p className="text-muted text-sm mb-2">批量生成 30 集 × 60秒影片</p>
            <p className="text-xs text-muted">現有積分：842 · 生成後餘：542</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setGate('params')}
              className="flex-1 border border-line px-5 py-3 rounded-xl text-muted hover:border-primary transition-colors text-sm"
            >
              返回修改
            </button>
            <button
              onClick={() => setGate('generating')}
              className="flex-1 bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors"
            >
              確認，開始生成！
            </button>
          </div>
        </div>
      )}

      {gate === 'generating' && (
        <div className="bg-card rounded-xl border border-line p-8 shadow-card text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Film size={28} className="text-primary" />
          </div>
          <p className="font-bold text-ink text-lg mb-1">AI 正在生成影片中⋯</p>
          <p className="text-muted text-sm mb-4">第1–30集批量生成，預計需 15–20 分鐘</p>
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
            模擬完成（Demo）
          </button>
        </div>
      )}

      {gate === 'done' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <Check size={28} className="mx-auto text-green-500 mb-2" />
            <p className="font-bold text-ink">30集影片生成完成！</p>
            <p className="text-sm text-muted mt-1">共消耗 300 積分</p>
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
            <ChevronRight size={18} /> 影片確認，進入粵語配音
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
  const voices = [
    { id: 'v1', label: '懷舊男聲 · 陳伯（粵語）', desc: '沉穩溫厚，70歲長者質感', active: true },
    { id: 'v2', label: '溫柔女聲 · 陳太（粵語）', desc: '細膩體貼，60歲熟齡女聲', active: false },
    { id: 'v3', label: '旁白聲（粵語）', desc: '親切敘事感，貫穿全集', active: false },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">S7 · 粵語配音</h2>
        <p className="text-muted text-sm mt-1">Seedance API 生成粵語配音並同步唇形，確保長者觀眾最佳收看體驗。</p>
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
              <Mic size={12} /> 試聽
            </button>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <h3 className="font-semibold text-ink text-sm mb-3">唇形同步設定</h3>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted">唇形同步（Lip-sync）</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-5 bg-primary rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" />
            </div>
            <span className="text-primary font-medium text-xs">開啟</span>
          </label>
        </div>
        <p className="text-xs text-muted">AI 會自動調整角色唇形配合粵語配音，長者觀眾更容易跟隨。</p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <Mic size={18} /> 生成粵語配音
        <CreditIndicator cost={80} className="ml-2" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S8: 平台內剪輯
// ─────────────────────────────────────────
function S8PlatformEdit({ onNext }: { onNext: () => void }) {
  return (
    <div className="w-full max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">S8 · 平台內剪輯</h2>
        <p className="text-muted text-sm mt-1">平台內剪輯不消耗積分。可修剪片段、調整字幕、加入 BGM。</p>
        <div className="inline-flex items-center gap-1.5 mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
          <Check size={11} /> 此步驟免費，不消耗積分
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
        <h3 className="font-semibold text-ink text-sm mb-3">時間軸剪輯</h3>
        <div className="space-y-2">
          {[
            { label: '影片軌', color: 'bg-primary', width: '100%' },
            { label: '字幕軌', color: 'bg-accent', width: '85%' },
            { label: 'BGM', color: 'bg-green-500', width: '100%' },
            { label: '配音軌', color: 'bg-purple-400', width: '70%' },
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
          <h4 className="font-semibold text-ink text-sm mb-2">字幕設定</h4>
          <div className="space-y-1.5 text-xs text-muted">
            <div className="flex justify-between"><span>字型大小</span><span className="text-ink font-medium">大（長者友善）</span></div>
            <div className="flex justify-between"><span>字幕位置</span><span className="text-ink font-medium">底部居中</span></div>
            <div className="flex justify-between"><span>語言</span><span className="text-ink font-medium">繁體中文</span></div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-line p-4 shadow-card">
          <h4 className="font-semibold text-ink text-sm mb-2">背景音樂</h4>
          <div className="space-y-1.5">
            {['溫暖鋼琴曲', '懷舊廣東歌（純音樂）', '輕鬆木結他'].map((bgm, i) => (
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
        <ChevronRight size={18} /> 剪輯完成，提交審批發佈
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// S9: 審批與發佈
// ─────────────────────────────────────────
function S9ReviewPublish({ onNext }: { onNext: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  const dims = [
    { key: 'content', label: '內容品質', score: 9, note: '故事流暢，情感真實' },
    { key: 'language', label: '語言表達', score: 8, note: '粵語用詞貼近長者日常' },
    { key: 'culture', label: '文化適切', score: 9, note: '香港街市文化呈現準確' },
    { key: 'ethics', label: '倫理規範', score: 10, note: '無敏感內容，價值觀正面' },
    { key: 'commercial', label: '商業合規', score: 8, note: '建議移除隱性品牌標誌' },
  ];

  if (submitted) {
    return (
      <div className="max-w-2xl text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold text-primary mb-3">作品已審批通過！</h2>
        <p className="text-muted mb-2">《街市情緣》將發佈至 CoEldery 85 長者觀眾平台</p>
        <p className="text-xs text-muted mb-8">預計觸達：12,500 位長者觀眾</p>
        <div className="grid grid-cols-2 gap-4 mb-8 text-left">
          {[
            { label: '發佈範圍', value: '公開發佈至 CoEldery 85' },
            { label: '發佈日期', value: '2026 年 8 月 22 日' },
            { label: '預計觸達', value: '約 12,500 位長者觀眾' },
            { label: '勞務分紅', value: '觀看收益 70%' },
            { label: 'ESG 積分', value: '+85 社企貢獻積分' },
            { label: '系列 ID', value: 'DRAMA-2026-001' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card rounded-xl p-4 shadow-card">
              <p className="text-xs text-muted mb-1">{label}</p>
              <p className="font-semibold text-ink text-sm">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <button className="bg-accent text-white px-8 py-3 rounded-xl font-bold hover:bg-accent/90 transition-colors">
            確認發佈
          </button>
          <button className="border border-line px-8 py-3 rounded-xl text-ink hover:border-primary transition-colors">
            分享至社交媒體
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">S9 · 審批與發佈</h2>
        <p className="text-muted text-sm mt-1">五維度 AI 評分，確認後提交人工審核，通過即發佈。</p>
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
        <p className="text-sm text-primary font-semibold">AI 總評：8.8/10 · 建議通過</p>
        <p className="text-xs text-muted mt-1">作品情感真實、文化貼近，適合長者觀眾。建議商業合規方面加強說明。</p>
      </div>

      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-6">
        <h3 className="font-semibold text-ink text-sm mb-3">發佈設定</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted mb-1 block">發佈對象</label>
            <select className="w-full border border-line rounded-lg px-3 py-2 bg-bg-soft text-sm focus:outline-none focus:border-primary">
              <option>公開發佈（CoEldery 85 平台）</option>
              <option>登入用戶限定</option>
              <option>ESG 贊助商專屬</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">相關標籤</label>
            <input
              className="w-full border border-line rounded-lg px-3 py-2 bg-bg-soft text-sm focus:outline-none focus:border-primary"
              defaultValue="街市、圓夢、長者故事、香港情懷、CoEldery85"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex items-center gap-2 border border-line px-5 py-3 rounded-xl text-muted hover:border-primary transition-colors text-sm">
          <Eye size={15} /> 預覽
        </button>
        <button className="flex items-center gap-2 border border-line px-5 py-3 rounded-xl text-muted hover:border-accent transition-colors text-sm">
          <Save size={15} /> 儲存草稿
        </button>
        <button
          onClick={() => setSubmitted(true)}
          className="flex-1 bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
        >
          <Send size={16} /> 提交審批發佈
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main Component
// Plan Overview is step index 10 (injected between S0 and S1)
// ─────────────────────────────────────────
const STEPS = [
  S0SeriesSetup,   // 0
  PlanOverview,    // 1 (前置策劃案)
  S1AssetBank,     // 2
  S2CharacterSetup,// 3
  S3StoryFramework,// 4
  S4Storyboard,    // 5
  S5Keyframes,     // 6
  S6VideoGen,      // 7
  S7Voiceover,     // 8
  S8PlatformEdit,  // 9
  S9ReviewPublish, // 10
];

// StepNavigation only shows S0-S9 (10 steps), Plan Overview is hidden from nav
// We offset by 1 after Plan Overview (index 1) for nav display
function navStepToRouteStep(navStep: number): number {
  return navStep >= 1 ? navStep + 1 : navStep;
}

export default function DramaWorkflow() {
  const { step } = useParams();
  const navigate = useNavigate();
  const routeStep = Math.min(parseInt(step ?? '0', 10), 10);
  const StepComponent = STEPS[routeStep];

  // Nav step: hide Plan Overview (route 1) from nav count
  const navStep = routeStep > 1 ? routeStep - 1 : routeStep;

  const goNext = () => navigate(`/creator/drama/${Math.min(routeStep + 1, 10)}`);

  // Determine series title for header
  const seriesTitles: Record<number, string> = {
    0: '新系列設定',
  };
  const headerTitle = seriesTitles[routeStep] ?? '街市情緣';

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-4 shrink-0">
          <Logo size="sm" withWordmark />
          <span className="text-primary font-bold">戲劇模式</span>
          <span className="text-muted text-sm">· {headerTitle}</span>
          <div className="ml-auto flex items-center gap-3">
            <Heart size={16} className="text-accent" />
            <span className="text-xs text-muted">積分：842</span>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          {/* Step nav — only show for non-PlanOverview steps */}
          <div className="w-48 shrink-0 bg-card border-r border-line overflow-y-auto">
            <StepNavigation
              mode="drama"
              currentStep={navStep}
              onStepClick={s => navigate(`/creator/drama/${navStepToRouteStep(s)}`)}
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
