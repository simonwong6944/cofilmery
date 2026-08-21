import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/layout/PublicNav';
import { Logo } from '@/components/shared/Logo';
import { Film, BookOpen, BookMarked, Users, Eye, ArrowRight, Play } from 'lucide-react';
import { MOCK_DRAMA_SERIES, MOCK_LEGACY_SERIES } from '@/lib/mockData';
import { ModeBadge } from '@/components/shared/ModeBadge';

export function Landing() {
  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          CoEldery 85 生態系統原生功能
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-ink leading-tight mb-5">
          看見每一段人生故事<br />
          <span className="text-primary">延續每一份值得傳承的回憶</span>
        </h1>
        <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
          一個創作平台 · 兩種創作方向 · 同一套粵語影像技術
        </p>

        {/* Two Mode Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-14">
          <div className="bg-primary rounded-2xl p-8 text-left text-white shadow-card-hover">
            <div className="flex items-center gap-2 mb-4">
              <Film size={22} />
              <span className="font-bold text-xl">戲劇模式</span>
            </div>
            <p className="text-white/90 font-medium mb-2">以長者提供之生活素材作為創作基礎</p>
            <p className="text-white/70 text-sm mb-6">創作虛構粵語短劇 · 最多七十集 · 每集十五至六十秒</p>
            <Link to="/modes/drama" className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors text-sm">
              了解更多 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="bg-accent rounded-2xl p-8 text-left text-white shadow-card-hover">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={22} />
              <span className="font-bold text-xl">傳承模式</span>
            </div>
            <p className="text-white/90 font-medium mb-2">運用人工智能記錄真實人生故事</p>
            <p className="text-white/70 text-sm mb-6">每集三至十分鐘 · 為家人留下珍貴的人生紀錄</p>
            <Link to="/modes/legacy" className="inline-flex items-center gap-2 bg-white text-accent font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors text-sm">
              了解更多 <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 mb-12">
          {[
            { icon: BookMarked, label: '已記錄', value: '二千八百四十七', unit: '個生命故事' },
            { icon: Users,      label: '支援',   value: '三千二百位',    unit: '年輕創作者' },
            { icon: Eye,        label: '覆蓋',   value: '二百九十六萬', unit: '五十五歲以上觀眾' },
          ].map(({ icon: Icon, label, value, unit }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon size={24} className="text-accent mb-1" />
              <span className="text-sm text-muted">{label}</span>
              <span className="text-2xl font-bold text-primary">{value}</span>
              <span className="text-sm text-muted">{unit}</span>
            </div>
          ))}
        </div>

        {/* Creator Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl py-4 px-6 text-sm text-primary font-medium">
          創作者招募中 · 現正接受十八至三十歲創作者申請 ·{' '}
          <Link to="/recruit" className="underline hover:no-underline">立即加入</Link>
        </div>
      </section>

      {/* Featured Works */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-line">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-primary">精選作品</h2>
          <Link to="/works" className="text-sm text-accent hover:underline flex items-center gap-1">
            查看全部 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[...MOCK_DRAMA_SERIES.slice(0,2), ...MOCK_LEGACY_SERIES.slice(0,1)].map(project => (
            <Link key={project.id} to={`/works/${project.id}`} className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
              <div className="relative">
                <img src={project.thumbnail} alt={project.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 left-3">
                  <ModeBadge mode={project.mode} size="sm" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <Play size={40} className="text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-ink mb-1">{project.title}</h3>
                <p className="text-xs text-muted mb-3 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{project.creator.name}</span>
                  <span className="flex items-center gap-1"><Eye size={12} /> {project.views.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white mt-20 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <Logo size="md" withWordmark withTagline theme="dark" />
              <p className="text-white/60 text-sm mt-3 max-w-xs">人工智能輔助粵語短片共創平台，CoEldery 85 生態系統原生功能</p>
            </div>
            <div className="grid grid-cols-3 gap-8 text-sm">
              <div>
                <p className="font-semibold mb-3">平台</p>
                {['關於', '兩種模式', '作品展廊', '定價'].map(l => (
                  <p key={l} className="text-white/60 hover:text-white cursor-pointer mb-1.5">{l}</p>
                ))}
              </div>
              <div>
                <p className="font-semibold mb-3">創作者</p>
                {['創作者招募', 'ESG 階梯', '點數制度', '提交審批'].map(l => (
                  <p key={l} className="text-white/60 hover:text-white cursor-pointer mb-1.5">{l}</p>
                ))}
              </div>
              <div>
                <p className="font-semibold mb-3">企業</p>
                {['ESG 合作', '企業傳承', '贊助式傳承', '聯絡我們'].map(l => (
                  <p key={l} className="text-white/60 hover:text-white cursor-pointer mb-1.5">{l}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-white/50">
            <p>© 2026 CoFilmery · CoEldery 85 生態系統</p>
            <p>私隱政策 · 使用條款 · 聯絡我們</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
