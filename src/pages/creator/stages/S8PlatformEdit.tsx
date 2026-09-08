import { Check, ChevronRight } from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

// ─────────────────────────────────────────
// S8: 平台內剪輯
// ─────────────────────────────────────────
export function S8PlatformEdit({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  return (
    <div className="w-full max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s8.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s8.subtitle}</p>
        <div className="inline-flex items-center gap-1.5 mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
          <Check size={11} /> {tr.creator.drama.s8.freeStep}
        </div>
      </div>

      {/* 播放預覽 */}
      <div className="bg-black rounded-xl overflow-hidden mb-4 aspect-video flex items-center justify-center relative">
        <p className="text-white text-lg opacity-60">▶ 第1集預覽</p>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="h-1 bg-white/30 rounded-full">
            <div className="h-full bg-white rounded-full w-1/3" />
          </div>
        </div>
      </div>

      {/* 時間軸 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <h3 className="font-semibold text-ink text-sm mb-3">{tr.creator.drama.s8.timelineTitle}</h3>
        <div className="space-y-2">
          {[
            { label: tr.creator.drama.s8.videoTrack, color: 'bg-primary', width: '100%' },
            { label: tr.creator.drama.s8.subtitleTrack, color: 'bg-accent', width: '85%' },
            { label: tr.creator.drama.s8.bgmTrack, color: 'bg-green-500', width: '100%' },
            { label: tr.creator.drama.s8.voiceTrack, color: 'bg-purple-400', width: '70%' },
          ].map(track => (
            <div key={track.label} className="flex items-center gap-3">
              <span className="text-xs text-muted w-14 text-right">{track.label}</span>
              <div className="flex-1 h-7 bg-line rounded overflow-hidden">
                <div className={`h-full ${track.color} opacity-70 rounded cursor-pointer`} style={{ width: track.width }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 字幕 + BGM 選項 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card rounded-xl border border-line p-4 shadow-card">
          <h4 className="font-semibold text-ink text-sm mb-2">{tr.creator.drama.s8.subtitleTitle}</h4>
          <div className="space-y-1.5 text-xs text-muted">
            <div className="flex justify-between"><span>{tr.creator.drama.s8.subtitleSize}</span><span className="text-ink font-medium">{tr.creator.drama.s8.subtitleSizeVal}</span></div>
            <div className="flex justify-between"><span>{tr.creator.drama.s8.subtitlePos}</span><span className="text-ink font-medium">{tr.creator.drama.s8.subtitlePosVal}</span></div>
            <div className="flex justify-between"><span>{tr.creator.drama.s8.subtitleLang}</span><span className="text-ink font-medium">{tr.creator.drama.s8.subtitleLangVal}</span></div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-line p-4 shadow-card">
          <h4 className="font-semibold text-ink text-sm mb-2">{tr.creator.drama.s8.bgmTitle}</h4>
          <div className="space-y-1.5">
            {tr.creator.drama.s8.bgmOptions.map((bgm, i) => (
              <label key={bgm} className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="radio" name="bgm" className="accent-accent" defaultChecked={i === 0} />
                <span className="text-ink">{bgm}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> {tr.creator.drama.s8.confirmBtn}
      </button>
    </div>
  );
}
