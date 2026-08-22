import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/layout/PublicNav';
import { MOCK_DRAMA_SERIES } from '@/lib/mockData';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { Eye, ArrowRight, MessageSquare, Cpu, Camera, Mic } from 'lucide-react';

const GENRES = [
  {
    icon: '🌟',
    num: 1,
    title: '圓夢類',
    tagline: '年輕時的未竟心願，晚年實現',
    desc: '年輕時因種種原因未能達成的夢想——學廚藝、學樂器、開一間小店——到了晚年，終於有時間、有勇氣去實現。這類故事充滿希望與溫度，讓觀眾感受到：任何時候出發都不算遲。',
    eg: '例：退休後開小餐廳的街市肉販、73歲學鋼琴的婆婆',
    color: 'from-yellow-50 to-amber-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  {
    icon: '💛',
    num: 2,
    title: '愛情回憶類',
    tagline: '錯過的愛情、重逢與和解',
    desc: '那些年因家庭、社會、命運而錯過的愛情，在晚年重逢、和解、或者只是靜靜地懷念。這類故事帶出了長者內心深處最柔軟的部分，引起廣泛情感共鳴。',
    eg: '例：60年代分隔兩地的戀人在退休後重遇、白頭偕老背後的點滴',
    color: 'from-rose-50 to-pink-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    num: 3,
    title: '家庭溫情類',
    tagline: '兒孫滿堂、跨代連結、親情修復',
    desc: '家庭關係中的矛盾、誤解與修復，跨越幾十年的親情故事。祖父母與孫兒之間的連結，或是父母與子女之間遲來的和解——這類故事最能觸動觀眾的家庭情感。',
    eg: '例：嚴父晚年學懂說「我愛你」、跨代共學廣東話的爺孫情',
    color: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    icon: '🌺',
    num: 4,
    title: '人生重啟類',
    tagline: '55歲後重新出發、找回自我',
    desc: '退休不是終點，而是重新認識自己的起點。失去伴侶後的重建、轉換身份的蛻變、或者忽然發現人生另一面的故事，帶出了長者生命力的驚喜與感動。',
    eg: '例：喪偶後獨自環遊香港的婆婆、60歲開始學畫的退休教師',
    color: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: '🕰️',
    num: 5,
    title: '年代回憶類',
    tagline: '香港60–90年代背景、集體記憶',
    desc: '以香港60至90年代為背景，重現那個年代的街道、人情、工作與生活方式。透過長者親歷者的視角，讓年輕一代了解香港的歷史根脈，也讓同輩共同追憶。',
    eg: '例：當年石硤尾徙置區的童年生活、70年代灣仔舞廳的青春歲月',
    color: 'from-orange-50 to-amber-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
  },
  {
    icon: '🤝',
    num: 6,
    title: '長者英雄類',
    tagline: '熟齡智慧解決問題、被需要',
    desc: '長者以其一生積累的智慧、技藝或人脈，在關鍵時刻解決了問題、幫助了他人——被需要、被尊重的感覺，是這類故事的核心情感。讓觀眾重新看見長者的價值。',
    eg: '例：靠手藝幫助鄰居的老木匠、用一生人情幫孫子找到工作的阿公',
    color: 'from-violet-50 to-purple-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
  },
];

export default function DramaMode() {
  const [activeGenre, setActiveGenre] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="mb-3"><ModeBadge mode="drama" /></div>
        <h1 className="text-5xl font-bold text-ink mb-4 leading-tight">
          以長者提供之生活素材作為創作基礎<br />
          <span className="text-primary">人工智能助您完成一套粵語短劇</span>
        </h1>
        <p className="text-xl text-muted mb-12">一套最多七十集 · 每集十五至六十秒 · 為五十五歲以上觀眾而設</p>

        {/* ─── Genre Section ─── */}
        <div className="mb-16">
          <div className="text-center mb-3">
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">六大題材類型</span>
            <h2 className="text-3xl font-bold text-ink mb-2">選擇最適合的故事題材</h2>
            <p className="text-muted text-base max-w-xl mx-auto">每一種題材都圍繞「情感共鳴」設計，讓五十五歲以上的觀眾在故事中看見自己、感受到被理解。</p>
          </div>

          {/* Genre grid */}
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {GENRES.map((g) => {
              const isActive = activeGenre === g.num;
              return (
                <button
                  key={g.num}
                  onClick={() => setActiveGenre(isActive ? null : g.num)}
                  className={`text-left rounded-2xl border-2 p-5 transition-all duration-200 bg-gradient-to-br ${g.color} ${
                    isActive ? `${g.border} shadow-lg scale-[1.01]` : 'border-transparent hover:border-gray-200 hover:shadow-md'
                  }`}
                >
                  {/* Card top */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl leading-none">{g.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${g.badge}`}>題材 {g.num}</span>
                        </div>
                        <h3 className="font-bold text-ink text-lg leading-tight">{g.title}</h3>
                      </div>
                    </div>
                    <span className={`text-xl transition-transform duration-200 ${isActive ? 'rotate-90' : ''}`}>›</span>
                  </div>

                  <p className="text-sm font-medium text-primary mb-2">{g.tagline}</p>

                  {/* Expanded detail */}
                  {isActive && (
                    <div className="mt-3 pt-3 border-t border-black/10 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-sm text-ink/80 leading-relaxed">{g.desc}</p>
                      <div className="bg-white/70 rounded-lg px-3 py-2">
                        <p className="text-xs text-muted leading-relaxed">{g.eg}</p>
                      </div>
                    </div>
                  )}

                  {/* Collapsed preview */}
                  {!isActive && (
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">{g.desc}</p>
                  )}
                </button>
              );
            })}
          </div>

          {/* CTA below genres */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted mb-4">所有題材均支援一至七十集 · 每集長度可設定為十五秒至五分鐘</p>
            <Link
              to="/creator/new"
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              選好題材，開始創作 <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* 4-step flow */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-primary mb-6">創作流程</h2>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { icon: MessageSquare, step: '第一步', title: '訪問長者收集素材', desc: '透過結構化訪談，收集長者的生活故事與生命經歷作為創作基礎' },
              { icon: Cpu,           step: '第二步', title: '人工智能劇本生成', desc: '將素材輸入系統，AI 自動生成符合粵語文化的戲劇性劇本' },
              { icon: Camera,        step: '第三步', title: '分鏡及畫面自動生成', desc: '根據劇本自動生成分鏡圖及場景畫面，可自行調整細節' },
              { icon: Mic,           step: '第四步', title: '粵語配音', desc: '為每一集添加真實粵語語音，支援多種聲線選擇' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="bg-card rounded-xl p-5 shadow-card border-t-4 border-primary">
                <Icon size={24} className="text-primary mb-3" />
                <p className="text-xs text-muted mb-1">{step}</p>
                <h3 className="font-bold text-ink mb-2">{title}</h3>
                <p className="text-sm text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Works */}
        <h2 className="text-2xl font-bold text-primary mb-6">熱門劇集</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {MOCK_DRAMA_SERIES.map(s => (
            <Link key={s.id} to={`/works/${s.id}`} className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow group">
              <img src={s.thumbnail} alt={s.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="p-4">
                <h3 className="font-semibold text-ink mb-1">{s.title}</h3>
                <p className="text-xs text-muted flex items-center gap-1"><Eye size={12} /> {s.views.toLocaleString()} 觀看 · 共{s.episodes}集</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <Link to="/creator/new" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-10 py-4 rounded-xl hover:bg-primary/90 transition-colors text-lg">
            立即開始使用戲劇模式創作 <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
