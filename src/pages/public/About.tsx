import { PublicNav } from '@/components/layout/PublicNav';
import { Logo } from '@/components/shared/Logo';

export default function About() {
  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />

      {/* ── Hero with photo ── */}
      <div className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0">
          <img
            src="/images/about/two-generations.jpg"
            alt="兩代人分享故事"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <Logo size="xl" withWordmark withTagline className="justify-center mb-8" theme="dark" />
          <h1 className="text-4xl font-bold text-white mb-3">關於 CoFilmery</h1>
          <p className="text-xl text-white/75">一個在 CoEldery 85 生態內的人工智能短片共創平台</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* 3 Pillars */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { title: '一個技術引擎，兩種價值彰顯', desc: '戲劇模式與傳承模式共用同一套粵語影像生成技術，以不同創作方向服務不同需要。', icon: '🎬' },
            { title: '為五十五歲以上觀眾而設', desc: '每一個設計決策均以長者觀眾的觀看體驗為優先，確保字體大小、色彩對比、介面複雜度均符合長者需要。', icon: '👁️' },
            { title: '為有意義的創作而設', desc: '我們相信有意義的故事值得被記錄，有尊嚴的創作值得被支持，因此建立了公平的點數回饋制度。', icon: '💛' },
          ].map(({ title, desc, icon }) => (
            <div key={title} className="bg-card rounded-xl p-6 shadow-card">
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="font-bold text-primary mb-3">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Mission Image + Text */}
        <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
          <div className="rounded-2xl overflow-hidden shadow-card-hover">
            <img
              src="/images/about/two-generations.jpg"
              alt="兩代人分享故事"
              className="w-full h-72 object-cover"
            />
          </div>
          <div>
            <p className="text-accent font-semibold text-sm mb-2">我們的使命</p>
            <h2 className="text-2xl font-bold text-primary mb-4">連結兩代人的影像橋樑</h2>
            <div className="space-y-3 text-muted text-sm leading-relaxed">
              <p>
                CoFilmery 相信，每一個人的生命故事都值得被好好記錄。香港有數以十萬計的長者，他們的人生閱歷、奮鬥歲月、對家人的愛——往往在不聲不響中逝去，從未被留住。
              </p>
              <p>
                另一方面，這一代的年輕創作者充滿才華和熱情，卻在流量競逐中迷失方向、找不到值得投入的理由。CoFilmery 將這兩個群體連接起來，讓年輕人的創意，成為長者故事的載體。
              </p>
              <p>
                我們不是一個純粹的科技平台，我們是香港跨代文化保育的一次實驗——用 AI 的力量，讓有意義的創作變得更可及。
              </p>
            </div>
          </div>
        </div>

        {/* Ecosystem Banner */}
        <div className="bg-primary text-white rounded-2xl p-8 text-center mb-12">
          <p className="text-sm text-white/70 mb-2">生態系統</p>
          <h2 className="text-2xl font-bold mb-3">CoFilmery 為 CoEldery 85 生態之原生功能</h2>
          <p className="text-white/80">共享會員及支付信任，為五十五歲以上香港居民提供完整的數位生活服務</p>
        </div>

        {/* Milestones */}
        <div>
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">發展里程碑</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { period: '2026 年 Q1', event: '平台正式啟動，完成首批創作者招募' },
              { period: '2026 年 Q3', event: '推出企業 ESG 合作計劃，首批企業夥伴加入' },
              { period: '2027 年 Q1', event: '擴展至 CoEldery 85 全港長者用戶群' },
              { period: '2027 年 Q3', event: '推出品牌贊助計劃，為文化保育建立可持續生態' },
            ].map(({ period, event }) => (
              <div key={period} className="bg-card rounded-xl p-5 shadow-card border-l-4 border-accent">
                <p className="text-accent font-semibold text-sm mb-2">{period}</p>
                <p className="text-ink text-sm">{event}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
