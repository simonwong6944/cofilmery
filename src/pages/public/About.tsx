import { PublicNav } from '@/components/layout/PublicNav';
import { Logo } from '@/components/shared/Logo';

export default function About() {
  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <Logo size="xl" withWordmark withTagline className="justify-center mb-6" />
          <h1 className="text-4xl font-bold text-primary mb-3">關於 CoFilmery</h1>
          <p className="text-xl text-muted">一個在 CoEldery 85 生態內的人工智能短片共創平台</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { title: '一個技術引擎，兩種價值彰顯', desc: '戲劇模式與傳承模式共用同一套粵語影像生成技術，以不同創作方向服務不同需要。' },
            { title: '為五十五歲以上觀眾而設', desc: '每一個設計決策均以長者觀眾的觀看體驗為優先，確保字體大小、色彩對比、介面複雜度均符合長者需要。' },
            { title: '為有意義的創作而設', desc: '我們相信有意義的故事值得被記錄，有尊嚴的創作值得被支持，因此建立了公平的點數回饋制度。' },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-card rounded-xl p-6 shadow-card">
              <h3 className="font-bold text-primary mb-3">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-primary text-white rounded-2xl p-8 text-center mb-12">
          <p className="text-sm text-white/70 mb-2">生態系統</p>
          <h2 className="text-2xl font-bold mb-3">CoFilmery 為 CoEldery 85 生態之原生功能</h2>
          <p className="text-white/80">共享會員及支付信任，為五十五歲以上香港居民提供完整的數位生活服務</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">發展里程碑</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { period: '2026 年 Q1', event: '平台正式啟動，完成首批創作者招募' },
              { period: '2026 年 Q3', event: '推出企業 ESG 合作計劃，首批企業夥伴加入' },
              { period: '2027 年 Q1', event: '擴展至 CoEldery 85 全港長者用戶群' },
              { period: '2027 年 Q3', event: '推出贊助式傳承計劃，為基層長者記錄故事' },
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
