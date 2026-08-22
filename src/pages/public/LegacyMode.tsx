import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/layout/PublicNav';
import { MOCK_LEGACY_SERIES } from '@/lib/mockData';
import { ModeBadge } from '@/components/shared/ModeBadge';
import { User, FileCheck, Video, Cpu, ArrowRight, Eye, Building2, Globe, ChevronDown, ChevronUp } from 'lucide-react';

const SUB_MODES = [
  {
    id: 'personal',
    icon: '👤',
    title: '個人模式',
    color: 'border-primary bg-primary/5',
    activeColor: 'border-primary bg-primary text-white',
    tagColor: 'bg-primary/10 text-primary',
    desc: '個人記錄自己一生故事，傳承給後代；或由子女、孫兒為父母、祖父母拍攝他們的人生歲月。',
    examples: [
      '年屆七旬的退休老師，親自口述一生執教故事，留給子孫珍藏',
      '三代同堂家庭，由孫兒採訪阿公阿婆，拍成跨代連結的家族傳記',
      '子女為年邁父母製作影像紀錄，作為壽宴禮物或永久家族珍藏',
    ],
    badge: '家庭珍藏',
    episodeNote: '可製作一集（精華版）或多集系列（按人生章節分集）',
  },
  {
    id: 'corporate',
    icon: '🏢',
    title: '企業模式',
    color: 'border-accent bg-accent/5',
    activeColor: 'border-accent bg-accent text-white',
    tagColor: 'bg-accent/10 text-accent',
    desc: '企業為員工拍攝在公司的付出與成就。不論是企業創辦人、高管，還是一位默默耕耘數十年的普通員工，每個人都有值得被記錄的故事。',
    examples: [
      '創辦人口述創業歷程，留存企業文化與精神根源',
      '服務三十年的清潔阿姐，分享她眼中公司由小到大的點滴',
      '一批即將退休的員工，共同拍攝「我在這裡的那些年」系列',
    ],
    badge: '企業傳承',
    episodeNote: '可製作單人一集專題，或多人多集系列（按部門、年代或職級）',
  },
  {
    id: 'social',
    icon: '🌍',
    title: '社會人士模式',
    color: 'border-green-600 bg-green-50',
    activeColor: 'border-green-600 bg-green-600 text-white',
    tagColor: 'bg-green-100 text-green-700',
    desc: '由政府機構、社福組織、學校或一群學生，為默默付出的社會人士拍攝故事，記錄他們對社會的貢獻與精神。',
    examples: [
      '學生為任教三十年的校長拍攝退休紀念影片',
      '環保組織記錄一位堅持數十年的民間環保義工的心路歷程',
      '社區中心為長年照顧陌生老人的義工婆婆拍攝人生故事',
    ],
    badge: '社會記錄',
    episodeNote: '可製作一集感謝短片，或深度多集系列（追蹤人物多個人生面向）',
  },
];

export default function LegacyMode() {
  const [activeMode, setActiveMode] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-bg-soft">
      <PublicNav />
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="mb-3"><ModeBadge mode="legacy" /></div>
        <h1 className="text-5xl font-bold text-ink mb-4 leading-tight">
          運用人工智能技術記錄真實人生<br />
          <span className="text-accent">為每一個人留下值得被記住的故事</span>
        </h1>
        <p className="text-xl text-muted mb-12">每集三至十分鐘 · 支援單集或多集系列 · 適用於個人、企業及社會各界</p>

        {/* 4-Step Flow */}
        <div className="grid md:grid-cols-4 gap-5 mb-14">
          {[
            { icon: User,      step: '第一步', title: '立項選定對象', desc: '確定記錄對象，填寫基本資料及取得倫理審查授權' },
            { icon: FileCheck, step: '第二步', title: '邀請受訪者並取得授權', desc: '提供正式的知情同意書，保障受訪者的隱私及權益' },
            { icon: Video,     step: '第三步', title: '結構化訪談錄影', desc: '按系統生成的訪談問題，引導受訪者分享珍貴的人生故事' },
            { icon: Cpu,       step: '第四步', title: '人工智能整理故事線與剪輯', desc: 'AI 自動整理訪談內容，生成章節結構，完成剪輯合成' },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="bg-card rounded-xl p-5 shadow-card border-t-4 border-accent">
              <Icon size={24} className="text-accent mb-3" />
              <p className="text-xs text-muted mb-1">{step}</p>
              <h3 className="font-bold text-ink mb-2">{title}</h3>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>

        {/* 3 Sub-Modes */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-primary mb-2">三種傳承模式</h2>
          <p className="text-muted mb-6">不論是家人、員工還是社會貢獻者，每個人的故事都值得被好好記錄。</p>

          <div className="grid md:grid-cols-3 gap-5">
            {SUB_MODES.map(mode => {
              const isActive = activeMode === mode.id;
              return (
                <div
                  key={mode.id}
                  className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 cursor-pointer ${
                    isActive ? mode.activeColor : mode.color + ' hover:shadow-card-hover'
                  }`}
                  onClick={() => setActiveMode(isActive ? null : mode.id)}
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{mode.icon}</span>
                        <div>
                          <h3 className={`font-bold text-xl ${isActive ? 'text-white' : 'text-ink'}`}>
                            {mode.title}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isActive ? 'bg-white/20 text-white' : mode.tagColor
                          }`}>
                            {mode.badge}
                          </span>
                        </div>
                      </div>
                      {isActive
                        ? <ChevronUp size={18} className="text-white/70" />
                        : <ChevronDown size={18} className="text-muted" />
                      }
                    </div>
                    <p className={`text-sm leading-relaxed ${isActive ? 'text-white/90' : 'text-muted'}`}>
                      {mode.desc}
                    </p>
                  </div>

                  {/* Expanded Details */}
                  {isActive && (
                    <div className="px-6 pb-6 border-t border-white/20 pt-4">
                      <p className="text-xs text-white/70 font-semibold uppercase tracking-wide mb-3">實際例子</p>
                      <ul className="space-y-2 mb-4">
                        {mode.examples.map((eg, i) => (
                          <li key={i} className="flex gap-2 text-sm text-white/90">
                            <span className="text-white/50 shrink-0">·</span>
                            <span>{eg}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="bg-white/10 rounded-lg px-4 py-3">
                        <p className="text-xs text-white/80">
                          <span className="font-semibold">集數安排：</span>{mode.episodeNote}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Click hint */}
          {!activeMode && (
            <p className="text-center text-sm text-muted mt-4">點擊任一模式了解詳情</p>
          )}
        </div>

        {/* Works Gallery */}
        <h2 className="text-2xl font-bold text-primary mb-6">真實故事</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {MOCK_LEGACY_SERIES.map(s => (
            <Link key={s.id} to={`/works/${s.id}`} className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow group">
              <img src={s.thumbnail} alt={s.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="p-4">
                <h3 className="font-semibold text-ink mb-1">{s.title}</h3>
                <p className="text-xs text-muted flex items-center gap-1"><Eye size={12} /> {s.views.toLocaleString()} 觀看 · {s.duration} 分鐘</p>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/creator/new" className="inline-flex items-center gap-2 bg-accent text-white font-bold px-10 py-4 rounded-xl hover:bg-accent/90 transition-colors text-lg">
            立即開始使用傳承模式 <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </div>
  );
}
