import { useState } from 'react';
import { PublicNav } from '@/components/layout/PublicNav';
import { TierBadge } from '@/components/shared/TierBadge';
import { CheckCircle, ArrowRight, Sparkles, TrendingUp, Users, Award, ChevronDown, ChevronUp } from 'lucide-react';

const PAIN_POINTS = [
  {
    problem: '有熱情，但無出口',
    desc: '對影像創作充滿興趣，卻找不到一個值得投入、有意義的創作題材——大量時間花在無止境的流量競逐，換來的只是空洞的數字。',
  },
  {
    problem: '有創意，但無工具',
    desc: '傳統短片製作門檻極高：器材、場地、演員、後期剪接……光靠個人很難產出專業水準的成品，更遑論持續創作。',
  },
  {
    problem: '有付出，但無回報',
    desc: '即使辛苦創作，大多數創作者都缺乏一個正式、可持續、能夠成長的收入渠道——只有平台賺走了大部份的廣告收益。',
  },
];

const VALUE_PROPS = [
  {
    icon: Sparkles,
    img: '/images/recruit/creator-desk.jpg',
    title: 'AI 工具，降低門檻至零',
    subtitle: '毋須器材、場地、演員',
    body: '透過 CoFilmery 的 AI 影像生成系統，你只需要一個故事想法——AI 自動生成劇本、角色形象、分鏡畫面及粵語配音。由構思到完成一集，最快一個工作天。這是年輕創作者第一次能夠以個人之力產出專業水準短片的時代。',
    highlight: '平均製作時間由傳統 3 週縮短至 1–2 天',
  },
  {
    icon: Users,
    img: '/images/recruit/interview-elder.jpg',
    title: '有意義的題材，讓創作超越流量',
    subtitle: '你的作品，是有人生閱歷的故事',
    body: '你不再只是在追算法。透過戲劇模式，你以長者的真實生活素材創作虛構短劇，每一集都有血有肉；透過傳承模式，你親自採訪長者，用鏡頭留住一段即將消逝的人生故事。你的觀眾不是無聊滑屏的陌生人，而是珍視每一個畫面的長者及其家人。',
    highlight: '每一個創作都有真實的社會價值',
  },
  {
    icon: TrendingUp,
    img: '/images/recruit/team-collab.jpg',
    title: '實質收入 + 職業履歷，讓創作成為事業',
    subtitle: '由學員到簽約創作者的成長路徑',
    body: 'CoFilmery 設有正式的 ESG 創作者成長階梯：見習 → 認證創作者 → 資深創作者 → 簽約創作者。每一級都帶來更高的分紅比例（最高 80%）、更多的企業合作機會，以及可以放進求職履歷的正式認證。你在這裡的每一集作品，都是你創業路上的真實資產。',
    highlight: '勞務分紅最高 80%，另有 ESG 企業合作酬勞',
  },
];

const IMPACT_STATS = [
  { value: '55萬+', label: '香港55歲以上長者人口', sub: '龐大而被忽略的內容需求群體' },
  { value: '2天', label: '平均製作一集所需時間', sub: '由構思到完成，AI 全程輔助' },
  { value: '80%', label: '最高分紅比例', sub: '資深及簽約創作者可獲' },
  { value: '4級', label: 'ESG 認證成長階梯', sub: '可放入履歷的正式創作資歷' },
];

const TESTIMONIALS = [
  {
    quote: '我起初不知道如何用 AI 製作影像，但 CoFilmery 的系統令我在兩周內完成了第一套短劇。看到長者觀眾的回饋，感覺非常有意義。',
    name: '李美華',
    age: 24,
    tier: 'certified' as const,
    detail: '已發布 3 部作品 · 月均收入 HK$12,000',
  },
  {
    quote: '以前做 YouTube 做了三年，累積了幾千個訂閱，根本養不活自己。在 CoFilmery 做了六個月，有穩定收入，還有 ESG 認證，面試時對方很感興趣。',
    name: '陳志明',
    age: 27,
    tier: 'senior' as const,
    detail: '已發布 5 部作品 · 企業合作簽約中',
  },
];

const TIERS = [
  { tier: 'trainee' as const, label: '見習創作者', unlock: '完成入門培訓後即獲', perks: ['基礎 AI 工具使用權', '50% 觀看分紅', '平台輔導支援'] },
  { tier: 'certified' as const, label: '認證創作者', unlock: '完成首 3 部作品審批後', perks: ['進階 AI 功能解鎖', '65% 觀看分紅', 'ESG 企業合作資格'] },
  { tier: 'senior' as const, label: '資深創作者', unlock: 'ESG 積分達標後晉升', perks: ['全功能 AI 工具', '75% 觀看分紅', '受邀企業傳承合作'] },
  { tier: 'contracted' as const, label: '簽約創作者', unlock: '由 CoFilmery 邀請', perks: ['月薪底薪保障', '80% 觀看分紅', '品牌贊助合作優先分配'] },
];

const FAQ = [
  { q: '我需要有影片製作經驗才能申請嗎？', a: '不需要。CoFilmery 提供完整的 AI 工具及入門培訓，只要你對故事創作有熱情，系統會幫你完成技術部分。' },
  { q: '我每個月可以賺多少？', a: '收入視乎作品數量及觀看數。認證創作者月均約 HK$5,000–15,000，資深創作者加上企業合作可達 HK$20,000–50,000 以上。' },
  { q: '創作題材是否有限制？', a: '戲劇模式的題材圍繞六大類型（圓夢、愛情回憶、家庭溫情等），傳承模式則記錄真實長者故事。所有內容均須通過 AI 倫理審查。' },
  { q: '我可以同時做其他工作或讀書嗎？', a: '完全可以。見習及認證創作者是彈性兼職制，你可以按自己節奏製作。簽約創作者才有全職要求。' },
];

export default function Recruit() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />

      {/* ── Hero ── */}
      <div className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/recruit/team-collab.jpg"
            alt="年輕創作者"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/60" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-24">
          <p className="text-accent font-semibold mb-3 text-sm tracking-wide">創作者招募 · 十八至三十歲</p>
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            在 AI 浪潮中<br />
            找到你的位置與意義
          </h1>
          <p className="text-white/80 text-xl max-w-2xl mb-8 leading-relaxed">
            CoFilmery 不只是一個創作工具——它是一條讓你在短視頻時代真正發光發熱的路：<strong className="text-white">有報酬、有意義、有履歷</strong>，同時用你的創作連結兩代人。
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-10">
            {(['trainee', 'certified', 'senior', 'contracted'] as const).map((t, i) => (
              <div key={t} className="flex items-center gap-2">
                <TierBadge tier={t} />
                {i < 3 && <ArrowRight size={14} className="text-white/40" />}
              </div>
            ))}
          </div>
          <a href="#apply" className="inline-flex items-center gap-2 bg-accent text-white font-bold px-8 py-4 rounded-xl hover:bg-accent/90 transition-colors text-lg">
            立即申請成為創作者 <ArrowRight size={18} />
          </a>
        </div>
      </div>

      {/* ── Impact Stats ── */}
      <div className="bg-white border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {IMPACT_STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{s.value}</div>
              <div className="text-sm font-semibold text-ink mb-0.5">{s.label}</div>
              <div className="text-xs text-muted">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">

        {/* ── Problem: What Young Creators Lack ── */}
        <section>
          <p className="text-accent font-semibold text-sm mb-2">你面對的問題，我們都知道</p>
          <h2 className="text-3xl font-bold text-ink mb-3">年輕創作者普遍缺乏的三樣東西</h2>
          <p className="text-muted mb-8 max-w-2xl">
            這一代年輕人成長於短視頻文化，對影像創作有天然的熱情與直覺——但現實往往讓人洩氣。
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="bg-card border border-line rounded-xl p-5 shadow-card">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm mb-3">
                  {i + 1}
                </div>
                <h3 className="font-bold text-ink mb-2">{p.problem}</h3>
                <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Solution: 3 Value Props with Images ── */}
        <section>
          <p className="text-accent font-semibold text-sm mb-2">CoFilmery 的答案</p>
          <h2 className="text-3xl font-bold text-ink mb-10">一個平台，同時解決三個問題</h2>

          <div className="space-y-16">
            {VALUE_PROPS.map((vp, i) => {
              const Icon = vp.icon;
              const isEven = i % 2 === 0;
              return (
                <div key={i} className={`grid md:grid-cols-2 gap-8 items-center ${isEven ? '' : 'md:[direction:rtl]'}`}>
                  {/* Image */}
                  <div className={`rounded-2xl overflow-hidden shadow-card-hover aspect-video ${isEven ? '' : 'md:[direction:ltr]'}`}>
                    <img
                      src={vp.img}
                      alt={vp.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Text */}
                  <div className={isEven ? '' : 'md:[direction:ltr]'}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={18} className="text-accent" />
                      <span className="text-sm text-accent font-semibold">{vp.subtitle}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-ink mb-4">{vp.title}</h3>
                    <p className="text-muted leading-relaxed mb-5">{vp.body}</p>
                    <div className="bg-primary/8 border border-primary/20 rounded-lg px-4 py-3">
                      <p className="text-sm text-primary font-semibold flex items-center gap-2">
                        <CheckCircle size={14} /> {vp.highlight}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Social Mission Divider ── */}
        <section className="relative rounded-2xl overflow-hidden">
          <img
            src="/images/recruit/elder-watching.jpg"
            alt="長者觀看短片"
            className="w-full h-72 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/50 flex items-center">
            <div className="px-10 max-w-2xl">
              <p className="text-accent font-semibold text-sm mb-2">更大的社會意義</p>
              <h2 className="text-3xl font-bold text-white mb-3">你的創作，是有人在等待的</h2>
              <p className="text-white/85 text-lg leading-relaxed">
                香港有超過 55 萬名 65 歲以上長者，他們的故事從未被好好記錄，他們的娛樂需求從未被認真對待。你創作的每一集，都在回應一個真實的人、真實的需要。這不是流量競逐——這是一種連結。
              </p>
            </div>
          </div>
        </section>

        {/* ── Growth Tiers ── */}
        <section>
          <p className="text-accent font-semibold text-sm mb-2">成長路徑</p>
          <h2 className="text-3xl font-bold text-ink mb-3">由學員到簽約創作者</h2>
          <p className="text-muted mb-8">每一個階段都有清晰的晉升條件和實質福利。你的努力，在這裡會被看見。</p>
          <div className="grid md:grid-cols-4 gap-4">
            {TIERS.map((t, i) => (
              <div key={t.tier} className="bg-card border border-line rounded-2xl p-5 shadow-card relative overflow-hidden">
                {i === 3 && (
                  <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">最高級</div>
                )}
                <TierBadge tier={t.tier} />
                <h3 className="font-bold text-ink mt-3 mb-1">{t.label}</h3>
                <p className="text-xs text-muted mb-3 pb-3 border-b border-line">{t.unlock}</p>
                <ul className="space-y-1.5">
                  {t.perks.map(perk => (
                    <li key={perk} className="flex items-start gap-1.5 text-xs text-ink">
                      <CheckCircle size={12} className="text-green-500 shrink-0 mt-0.5" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section>
          <p className="text-accent font-semibold text-sm mb-2">創作者心聲</p>
          <h2 className="text-3xl font-bold text-ink mb-8">他們選擇了 CoFilmery</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-card border border-line rounded-2xl p-6 shadow-card">
                <p className="text-ink leading-relaxed mb-5 italic">「{t.quote}」</p>
                <div className="flex items-center gap-3 pt-4 border-t border-line">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {t.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink text-sm">{t.name}</span>
                      <span className="text-xs text-muted">· {t.age} 歲</span>
                      <TierBadge tier={t.tier} />
                    </div>
                    <p className="text-xs text-muted mt-0.5">{t.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section>
          <p className="text-accent font-semibold text-sm mb-2">常見問題</p>
          <h2 className="text-3xl font-bold text-ink mb-8">你想知道的，都在這裡</h2>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <div key={i} className="bg-card border border-line rounded-xl overflow-hidden shadow-card">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between"
                >
                  <span className="font-semibold text-ink">{f.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={18} className="text-muted shrink-0" />
                    : <ChevronDown size={18} className="text-muted shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-muted leading-relaxed border-t border-line pt-4">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Apply Form ── */}
        <section id="apply">
          <div className="bg-card rounded-2xl p-8 shadow-card border border-line">
            <div className="flex items-start gap-4 mb-6">
              <Award size={28} className="text-accent shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-primary mb-1">立即申請成為創作者</h2>
                <p className="text-muted text-sm">填妥申請表格後，我們的團隊將在三個工作天內與你聯絡，安排入門培訓。</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {['姓名', '電郵地址', '作品集連結（如有）', '聯絡電話'].map(label => (
                <div key={label}>
                  <label className="block text-sm font-medium text-ink mb-1">{label}</label>
                  <input
                    className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-soft focus:outline-none focus:border-primary"
                    placeholder={label}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-ink mb-1">希望參與之模式</label>
                <select className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-soft focus:outline-none focus:border-primary">
                  <option>🎬 戲劇模式（虛構粵語短劇）</option>
                  <option>📖 傳承模式（記錄真實長者故事）</option>
                  <option>兩者皆可</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">現時身份</label>
                <select className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-soft focus:outline-none focus:border-primary">
                  <option>在讀大學生</option>
                  <option>應屆畢業生</option>
                  <option>在職人士（兼職）</option>
                  <option>自由工作者</option>
                  <option>其他</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1">自我介紹及創作動機</label>
                <textarea
                  rows={4}
                  className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-soft focus:outline-none focus:border-primary resize-none"
                  placeholder="請分享你的創作背景、對 CoFilmery 的了解，以及你希望透過這個平台達到什麼目標⋯"
                />
              </div>
            </div>
            <button className="mt-5 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
              提交申請 <ArrowRight size={16} />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
