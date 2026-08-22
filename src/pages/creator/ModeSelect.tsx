import { useNavigate } from 'react-router-dom';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { Film, BookOpen, ArrowRight, Cpu, Camera, Mic, MessageSquare, Video, FileText, Scissors } from 'lucide-react';

const LEGACY_SUB_MODES = [
  { icon: '👤', label: '個人模式', desc: '個人／家庭傳承故事', path: '/creator/legacy/0?sub=personal' },
  { icon: '🏢', label: '企業模式', desc: '員工付出與成就記錄', path: '/creator/legacy/0?sub=corporate' },
  { icon: '🌍', label: '社會人士模式', desc: '義工、老師、社區英雄', path: '/creator/legacy/0?sub=social' },
];

export default function ModeSelect() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-4">
          <Logo size="sm" withWordmark />
          <span className="text-lg font-bold text-primary">選擇創作方向</span>
        </header>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold text-ink mb-2">選擇今天的創作方向</h1>
          <p className="text-muted mb-10">兩種創作方向，共用同一套粵語影像生成技術</p>
          <div className="grid md:grid-cols-2 gap-6">

            {/* Drama */}
            <div className="bg-primary rounded-2xl p-8 text-left text-white shadow-card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2.5 rounded-xl"><Film size={24} /></div>
                <span className="font-bold text-2xl">戲劇模式</span>
              </div>
              <p className="text-white/90 font-medium mb-1">以長者提供之生活素材作為創作基礎</p>
              <p className="text-white/70 text-sm mb-5">創作虛構粵語短劇 · 最多七十集 · 每集十五至六十秒</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { icon: Cpu,          label: '人工智能劇本生成' },
                  { icon: Camera,       label: '角色形象生成' },
                  { icon: MessageSquare,label: '分鏡自動生成' },
                  { icon: Mic,          label: '粵語人工配音' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-white/80">
                    <Icon size={14} className="text-white/60" /> {label}
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/creator/drama/0')}
                className="flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors w-full justify-center"
              >
                開始創作 <ArrowRight size={16} />
              </button>
            </div>

            {/* Legacy */}
            <div className="bg-accent rounded-2xl p-8 text-left text-white shadow-card-hover flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2.5 rounded-xl"><BookOpen size={24} /></div>
                <span className="font-bold text-2xl">傳承模式</span>
              </div>
              <p className="text-white/90 font-medium mb-1">為真實人生留下珍貴的影像紀錄</p>
              <p className="text-white/70 text-sm mb-4">每集三至十分鐘 · 支援單集或多集系列</p>

              {/* Sub-mode selector */}
              <div className="bg-white/10 rounded-xl p-3 mb-5 space-y-2">
                <p className="text-xs text-white/60 font-semibold uppercase tracking-wide mb-2 px-1">選擇傳承對象</p>
                {LEGACY_SUB_MODES.map(sub => (
                  <button
                    key={sub.label}
                    onClick={() => navigate('/creator/legacy/0')}
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors group"
                  >
                    <span className="text-lg">{sub.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-white">{sub.label}</div>
                      <div className="text-xs text-white/60">{sub.desc}</div>
                    </div>
                    <ArrowRight size={14} className="text-white/40 group-hover:text-white/80 transition-colors" />
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { icon: MessageSquare, label: '結構化訪談' },
                  { icon: FileText,      label: '粵語語音轉錄' },
                  { icon: Cpu,           label: 'AI 整理故事線' },
                  { icon: Scissors,      label: '剪輯合成' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-white/80">
                    <Icon size={14} className="text-white/60" /> {label}
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/creator/legacy/0')}
                className="flex items-center gap-2 bg-white text-accent font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors w-full justify-center mt-auto"
              >
                開始記錄 <ArrowRight size={16} />
              </button>
            </div>

          </div>
          <p className="text-sm text-muted mt-6">兩種模式，共用一條粵語影像生成引擎</p>
        </div>
      </main>
    </div>
  );
}
