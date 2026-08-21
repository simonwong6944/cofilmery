import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/layout/PublicNav';
import { MOCK_DRAMA_SERIES } from '@/lib/mockData';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { Eye, ArrowRight, MessageSquare, Cpu, Camera, Mic } from 'lucide-react';

export function DramaMode() {
  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-3"><ModeBadge mode="drama" /></div>
        <h1 className="text-5xl font-bold text-ink mb-4 leading-tight">
          以長者提供之生活素材作為創作基礎<br />
          <span className="text-primary">人工智能助您完成一套粵語短劇</span>
        </h1>
        <p className="text-xl text-muted mb-12">一套最多七十集 · 每集十五至六十秒 · 為五十五歲以上觀眾而設</p>
        <div className="grid md:grid-cols-4 gap-5 mb-16">
          {[
            { icon: MessageSquare, step: '第一步', title: '訪問長者收集素材', desc: '透過結構化訪談，收集長者的生活故事與生命經歷作為創作基礎' },
            { icon: Cpu,           step: '第二步', title: '人工智能劇本生成', desc: '將素材輸入系統，AI 自動生成符合粵語文化的戲劇性劇本' },
            { icon: Camera,        step: '第三步', title: '分鏡及畫面自動生成', desc: '根據劇本自動生成分鏡圖及場景畫面，可自行調整細節' },
            { icon: Mic,           step: '第四步', title: '人工粵語配音', desc: '為每一集添加真實粵語語音，支援多種聲線選擇' },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="bg-card rounded-xl p-5 shadow-card">
              <Icon size={24} className="text-primary mb-3" />
              <p className="text-xs text-muted mb-1">{step}</p>
              <h3 className="font-bold text-ink mb-2">{title}</h3>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
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
        <div className="text-center">
          <Link to="/creator/mode-select" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-10 py-4 rounded-xl hover:bg-primary/90 transition-colors text-lg">
            立即開始使用戲劇模式創作 <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
