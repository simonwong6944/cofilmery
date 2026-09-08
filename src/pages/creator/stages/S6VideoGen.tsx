import { useState } from 'react';
import { VideoGenPanel } from '@/components/shared/VideoGenPanel';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/i18n';
import { Film, ChevronRight } from 'lucide-react';

// ─────────────────────────────────────────
// S6: 影片批量生成（兩步確認門）
// ─────────────────────────────────────────
export function S6VideoGen({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const { context, characters, storyCards, aestheticLock, projectId: pid6, currentEpisode } = useProjectStore();
  const { user: u6 } = useAuthStore();
  const [selectedEp, setSelectedEp] = useState(currentEpisode);
  const [gate, setGate] = useState<'params' | 'generate'>('params');
  const [completedVideos, setCompletedVideos] = useState<Record<number, string>>({});

  const card = storyCards.find(c => c.episodeNumber === selectedEp);
  const durationSec = Math.min(Number((context?.durationLabel ?? '5').replace(/[^0-9]/g, '')) || 5, 10);
  const episodeNums = storyCards.length > 0 ? storyCards.map(c => c.episodeNumber) : [1, 2, 3];

  const buildPrompt = () => {
    const parts: string[] = [];
    if (card) {
      parts.push(`第${card.episodeNumber}集：${card.title_i18n['zh-HK']}`);
      if (card.hook_i18n['zh-HK']) parts.push(`故事鈎：${card.hook_i18n['zh-HK']}`);
      if (card.body_i18n['zh-HK']) parts.push(card.body_i18n['zh-HK'].slice(0, 120));
    }
    if (aestheticLock?.style) parts.push(`美學風格：${aestheticLock.style}`);
    if (characters.length > 0) parts.push(`主角：${characters.slice(0, 2).map(c => c.name_i18n['zh-HK']).join('、')}`);
    parts.push('粵日常對白，貴州情感，香港老年生活場景，高畫質短劇');
    return parts.join('。');
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s6.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s6.subtitle}</p>
      </div>

      {gate === 'params' && (
        <div className="space-y-4">
          {/* 選集 */}
          <div className="bg-card rounded-xl border border-line p-5 shadow-card">
            <h3 className="font-semibold text-ink text-sm mb-3">選擇生成集數</h3>
            <div className="flex flex-wrap gap-2">
              {episodeNums.slice(0, 12).map(ep => (
                <button
                  key={ep}
                  onClick={() => setSelectedEp(ep)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    selectedEp === ep ? 'border-primary bg-primary text-white' : 'border-line text-muted hover:border-primary'
                  }${completedVideos[ep] ? ' ring-2 ring-green-400' : ''}`}
                >
                  第{ep}集{completedVideos[ep] ? ' ✓' : ''}
                </button>
              ))}
            </div>
          </div>
          {/* 參數摘要 */}
          <div className="bg-card rounded-xl border border-line p-5 shadow-card">
            <h3 className="font-semibold text-ink text-sm mb-4">{tr.creator.drama.s6.paramsTitle}</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: tr.creator.drama.s6.engineLabel, value: 'Seedance 2.0' },
                { label: tr.creator.drama.s6.qualityLabel, value: '720p HD' },
                { label: '選定集數', value: `第${selectedEp}集` },
                { label: tr.creator.drama.s6.durationLabel, value: `${durationSec}秒` },
                { label: '畫面比例', value: '9:16 豎版' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-muted">{label}</span>
                  <span className="font-medium text-ink">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setGate('generate')}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Film size={16} /> 開始生成第{selectedEp}集
          </button>
        </div>
      )}

      {gate === 'generate' && (
        <div className="space-y-4">
          <button onClick={() => setGate('params')} className="text-sm text-muted hover:text-primary flex items-center gap-1">
            ← 返回選集
          </button>
          <VideoGenPanel
            prompt={buildPrompt()}
            aspectRatio="9:16"
            duration={durationSec}
            resolution="720p"
            userId={u6?.id}
            episodeId={`${pid6}-ep${selectedEp}`}
            onComplete={(videoUrl, credits) => {
              setCompletedVideos(prev => ({ ...prev, [selectedEp]: videoUrl }));
              void credits;
            }}
          />
          {Object.keys(completedVideos).length > 0 && (
            <button
              onClick={onNext}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronRight size={18} /> {tr.creator.drama.s6.confirmBtn}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
