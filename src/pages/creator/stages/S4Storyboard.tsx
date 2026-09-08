import { useState } from 'react';
import { AestheticComposer, type AestheticOutput } from '@/components/shared/AestheticComposer';
import { S4StoryboardGen } from '@/components/shared/S4StoryboardGen';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { t } from '@/i18n';
import { CreditIndicator } from '@/components/shared/CreditIndicator';
import { Layers, Sparkles, ChevronRight } from 'lucide-react';

// ─────────────────────────────────────────
// S4: 分鏡
// ─────────────────────────────────────────
export function S4Storyboard({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const { aestheticLock, storyCards, currentEpisode } = useProjectStore();
  const [localAestheticOpen, setLocalAestheticOpen] = useState(false);
  const [localAdjustment, setLocalAdjustment] = useState<AestheticOutput | null>(null);
  const [selectedEp, setSelectedEp] = useState(currentEpisode ?? (storyCards[0]?.episodeNumber ?? 1));

  const episodeNums = storyCards.length > 0
    ? storyCards.map(c => c.episodeNumber)
    : [1];

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s4.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s4.subtitle}</p>
      </div>

      {/* 全劇美學繼承 banner */}
      <div className={`rounded-xl border p-3 mb-4 flex items-center gap-3 ${aestheticLock ? 'bg-violet-50 border-violet-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${aestheticLock ? 'bg-violet-500' : 'bg-amber-400'}`}>
          <Layers size={13} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          {aestheticLock ? (
            <>
              <p className="text-xs font-semibold text-violet-800">本集繼承全劇美學：</p>
              <p className="text-xs text-violet-600 truncate">{aestheticLock.compiledPromptZh}</p>
            </>
          ) : (
            <p className="text-xs text-amber-700">尚未設定全劇美學鎖。可繼續進行，或返回美學鎖頁面設定後再來。</p>
          )}
        </div>
        <button
          onClick={() => setLocalAestheticOpen(v => !v)}
          className="shrink-0 text-xs border border-violet-300 text-violet-600 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          {localAdjustment ? '已微調 ✓' : '局部微調'}
        </button>
      </div>

      {/* 局部微調展開（不覆寫全劇鎖） */}
      {localAestheticOpen && (
        <div className="bg-card rounded-xl border border-violet-200 shadow-card overflow-hidden mb-4">
          <div className="p-3 border-b border-violet-100 bg-violet-50 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-violet-800">本集局部微調（只影響本集，不改動全劇美學鎖）</p>
              <p className="text-xs text-violet-600 mt-0.5">改全劇 look 請返「全劇美學鎖」時機</p>
            </div>
            <button onClick={() => setLocalAestheticOpen(false)} className="text-xs text-violet-500 hover:text-violet-700">收起</button>
          </div>
          <div className="p-4">
            <AestheticComposer
              mode="drama"
              initialOutput={localAdjustment ?? aestheticLock ?? undefined}
              onApply={(output) => { setLocalAdjustment(output); setLocalAestheticOpen(false); }}
              onCancel={() => setLocalAestheticOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 集數選擇器 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {episodeNums.slice(0, 12).map(ep => (
          <button
            key={ep}
            onClick={() => setSelectedEp(ep)}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
              selectedEp === ep ? 'border-primary bg-primary text-white' : 'border-line text-muted hover:border-primary'
            }`}
          >
            第{ep}集
          </button>
        ))}
      </div>

      {/* AI 分鏡生成模組 */}
      <div className="mb-6">
        <S4StoryboardGen
          storyCards={storyCards}
          selectedEp={selectedEp}
          aestheticPrompt={localAdjustment?.compiledPromptZh ?? aestheticLock?.compiledPromptZh ?? ''}
          epLabel={`第${selectedEp}集`}
          addShotLabel={tr.creator.drama.s4.addShot}
          editLabel={tr.creator.drama.s4.editShot}
          aiRewriteLabel={tr.creator.drama.s4.aiRewrite}
          deleteLabel={tr.creator.drama.s4.deleteShot}
        />
      </div>

      {/* AI 自然語言編輯 — TODO: connect to /api/ai/text */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-primary" />
          <span className="text-sm font-semibold text-primary">{tr.creator.drama.s4.aiAssistant}</span>
        </div>
        <input
          className="w-full bg-white border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          placeholder={tr.creator.drama.s4.aiInputPlaceholder}
        />
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> {tr.creator.drama.s4.confirmBtn}
        <CreditIndicator cost={60} className="ml-2" />
      </button>
    </div>
  );
}
