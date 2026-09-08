import { Mic } from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';
import { CreditIndicator } from '@/components/shared/CreditIndicator';

// ─────────────────────────────────────────
// S7: 粵語配音
// ─────────────────────────────────────────
export function S7Voiceover({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const voices = tr.creator.drama.s7.voices.map((v, i) => ({
    id: `v${i+1}`, label: v.label, desc: v.desc, active: i === 0,
  }));

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s7.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s7.subtitle}</p>
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
              <Mic size={12} /> {tr.creator.drama.s7.audition}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <h3 className="font-semibold text-ink text-sm mb-3">{tr.creator.drama.s7.lipsyncTitle}</h3>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted">{tr.creator.drama.s7.lipsyncLabel}</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-5 bg-primary rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" />
            </div>
            <span className="text-primary font-medium text-xs">{tr.creator.drama.s7.lipsyncOn}</span>
          </label>
        </div>
        <p className="text-xs text-muted">{tr.creator.drama.s7.lipsyncDesc}</p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <Mic size={18} /> {tr.creator.drama.s7.confirmBtn}
        <CreditIndicator cost={80} className="ml-2" />
      </button>
    </div>
  );
}
