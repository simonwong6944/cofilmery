import { useNavigate } from 'react-router-dom';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';
import { Film, BookOpen, ArrowRight, Cpu, Camera, Mic, MessageSquare, Video, FileText, Scissors } from 'lucide-react';

export default function ModeSelect() {
  const navigate = useNavigate();
  const { locale } = useLocaleStore();
  const tr = t();

  // suppress unused warning — locale subscribed for re-render
  void locale;

  const LEGACY_SUB_MODES = [
    { icon: '👤', label: tr.creator.modeSelect.legacySub1Label, desc: tr.creator.modeSelect.legacySub1Desc, path: '/creator/legacy/0?sub=personal' },
    { icon: '🏢', label: tr.creator.modeSelect.legacySub2Label, desc: tr.creator.modeSelect.legacySub2Desc, path: '/creator/legacy/0?sub=corporate' },
    { icon: '🌍', label: tr.creator.modeSelect.legacySub3Label, desc: tr.creator.modeSelect.legacySub3Desc, path: '/creator/legacy/0?sub=social' },
  ];

  const dramaFeatures = [
    { icon: Cpu,           label: tr.creator.modeSelect.dramaFeatures[0] },
    { icon: Camera,        label: tr.creator.modeSelect.dramaFeatures[1] },
    { icon: MessageSquare, label: tr.creator.modeSelect.dramaFeatures[2] },
    { icon: Mic,           label: tr.creator.modeSelect.dramaFeatures[3] },
  ];

  const legacyFeatures = [
    { icon: MessageSquare, label: tr.creator.modeSelect.legacyFeatures[0] },
    { icon: FileText,      label: tr.creator.modeSelect.legacyFeatures[1] },
    { icon: Cpu,           label: tr.creator.modeSelect.legacyFeatures[2] },
    { icon: Scissors,      label: tr.creator.modeSelect.legacyFeatures[3] },
  ];

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center gap-4">
          <Logo size="sm" withWordmark />
          <span className="text-lg font-bold text-primary">{tr.creator.modeSelect.title}</span>
        </header>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold text-ink mb-2">{tr.creator.modeSelect.heading}</h1>
          <p className="text-muted mb-10">{tr.creator.modeSelect.subtitle}</p>
          <div className="grid md:grid-cols-2 gap-6">

            {/* Drama */}
            <div className="bg-primary rounded-2xl p-8 text-left text-white shadow-card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2.5 rounded-xl"><Film size={24} /></div>
                <span className="font-bold text-2xl">{tr.creator.modeSelect.dramaTitle}</span>
              </div>
              <p className="text-white/90 font-medium mb-1">{tr.creator.modeSelect.dramaSubtitle}</p>
              <p className="text-white/70 text-sm mb-5">{tr.creator.modeSelect.dramaDesc}</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {dramaFeatures.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-white/80">
                    <Icon size={14} className="text-white/60" /> {label}
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/creator/drama/0')}
                className="flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors w-full justify-center"
              >
                {tr.creator.modeSelect.dramaCta} <ArrowRight size={16} />
              </button>
            </div>

            {/* Legacy */}
            <div className="bg-accent rounded-2xl p-8 text-left text-white shadow-card-hover flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2.5 rounded-xl"><BookOpen size={24} /></div>
                <span className="font-bold text-2xl">{tr.creator.modeSelect.legacyTitle}</span>
              </div>
              <p className="text-white/90 font-medium mb-1">{tr.creator.modeSelect.legacySubtitle}</p>
              <p className="text-white/70 text-sm mb-4">{tr.creator.modeSelect.legacyDesc}</p>

              {/* Sub-mode selector */}
              <div className="bg-white/10 rounded-xl p-3 mb-5 space-y-2">
                <p className="text-xs text-white/60 font-semibold uppercase tracking-wide mb-2 px-1">{tr.creator.modeSelect.legacySubjectLabel}</p>
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
                {legacyFeatures.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-white/80">
                    <Icon size={14} className="text-white/60" /> {label}
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/creator/legacy/0')}
                className="flex items-center gap-2 bg-white text-accent font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors w-full justify-center mt-auto"
              >
                {tr.creator.modeSelect.legacyCta} <ArrowRight size={16} />
              </button>
            </div>

          </div>
          <p className="text-sm text-muted mt-6">{tr.creator.modeSelect.sharedEngine}</p>
        </div>
      </main>
    </div>
  );
}
