/**
 * S5Keyframes — 關鍵幀生成頁面。
 * 第一磚：讀取 S4 D1 分鏡作輸入，展示佔位框 + desc/camNote；
 * 移除全部 mock；生成邏輯留第二磚。
 */
import { useState, useEffect } from 'react';
import { AestheticComposer, type AestheticOutput } from '@/components/shared/AestheticComposer';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { loadStoryboardFromD1 } from '@/adapters/storyboardAdapter';
import type { StoryboardPanel } from '@/components/shared/S4StoryboardGen';
import { t } from '@/i18n';
import {
  Layers, AlertTriangle, Check, ChevronRight, Image, Edit3, Camera,
} from 'lucide-react';

export function S5Keyframes({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const { aestheticLock, storyCards, characters, currentEpisode, projectId } = useProjectStore();

  const [genMode, setGenMode]                         = useState<'reference' | 'text'>('reference');
  const [localAestheticOpen, setLocalAestheticOpen]   = useState(false);
  const [localAdjustment, setLocalAdjustment]         = useState<AestheticOutput | null>(null);
  const [selectedEp, setSelectedEp]                   = useState(
    currentEpisode ?? (storyCards[0]?.episodeNumber ?? 1),
  );
  const [panels, setPanels]                           = useState<StoryboardPanel[]>([]);

  const episodeNums = storyCards.length > 0 ? storyCards.map(c => c.episodeNumber) : [1];

  useEffect(() => {
    setPanels([]);
    if (!projectId) return;
    loadStoryboardFromD1(projectId, selectedEp)
      .then(loaded => { if (loaded.length > 0) setPanels(loaded); })
      .catch(e => console.warn('[S5Keyframes] load storyboard failed:', e));
  }, [projectId, selectedEp]);

  return (
    <div className="max-w-2xl">
      {/* 標題 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s5.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s5.subtitle}</p>
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

      {/* 局部微調展開 */}
      {localAestheticOpen && (
        <div className="bg-card rounded-xl border border-violet-200 shadow-card overflow-hidden mb-4">
          <div className="p-3 border-b border-violet-100 bg-violet-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-violet-800">本格局部微調（只影響本集，不改動全劇美學鎖）</p>
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

      {/* 生成模式 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <label className="block text-sm font-semibold text-ink mb-3">{tr.creator.drama.s5.genModeLabel}</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'reference' as const, label: tr.creator.drama.s5.modeReference, desc: tr.creator.drama.s5.modeReferenceDesc, icon: Image },
            { id: 'text'      as const, label: tr.creator.drama.s5.modeText,      desc: tr.creator.drama.s5.modeTextDesc,      icon: Edit3  },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setGenMode(m.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${genMode === m.id ? 'border-primary bg-primary/5' : 'border-line hover:border-primary/40'}`}
            >
              <m.icon size={20} className={genMode === m.id ? 'text-primary' : 'text-muted'} />
              <div className="font-semibold text-sm text-ink mt-2">{m.label}</div>
              <div className="text-xs text-muted mt-1">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 資產完整度 — 讀真 characters */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Check size={16} className="text-green-500" />
          <h3 className="font-semibold text-ink text-sm">{tr.creator.drama.s5.assetCheckTitle}</h3>
        </div>
        {characters.length === 0 ? (
          <p className="text-xs text-muted">尚無角色資料。請先在 S1 建立角色。</p>
        ) : (
          <div className="space-y-2">
            {characters.map(ch => {
              const ok = Boolean(ch.img);
              const name = typeof ch.name_i18n === 'string' ? ch.name_i18n : (ch.name_i18n?.['zh-HK'] ?? ch.id);
              return (
                <div key={ch.id} className="flex items-center gap-2 text-sm">
                  {ok ? <Check size={14} className="text-green-500" /> : <AlertTriangle size={14} className="text-amber-500" />}
                  <span className={ok ? 'text-ink' : 'text-amber-700'}>{name} 角色參考圖</span>
                  {!ok && <span className="text-xs text-amber-600 ml-auto">{tr.creator.drama.s5.recommended}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 集數選擇器 */}
      <div className="bg-card rounded-xl border border-line p-4 shadow-card mb-4">
        <p className="text-xs font-semibold text-ink mb-2">選擇集數</p>
        <div className="flex flex-wrap gap-2">
          {episodeNums.slice(0, 12).map(ep => (
            <button
              key={ep}
              onClick={() => setSelectedEp(ep)}
              className={`px-3 py-1 text-xs rounded-lg border transition-colors ${selectedEp === ep ? 'bg-primary text-white border-primary' : 'border-line text-ink hover:border-primary/40'}`}
            >
              第{ep}集
            </button>
          ))}
        </div>
      </div>

      {/* 分鏡佔位框 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-6">
        <h3 className="font-semibold text-ink text-sm mb-3">{tr.creator.drama.s5.previewTitle}</h3>
        {panels.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted">
            <AlertTriangle size={28} className="text-amber-400" />
            <p className="text-sm text-center">尚無分鏡資料。<br />請先在 S4 生成分鏡，再回來進行關鍵幀生成。</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {panels.map((p, i) => (
              <div key={i} className="rounded-xl border border-line overflow-hidden">
                <div className="aspect-video bg-muted/10 flex items-center justify-center">
                  <Camera size={24} className="text-muted/40" />
                </div>
                <div className="p-2">
                  <p className="text-xs text-ink leading-tight line-clamp-2">{p.desc}</p>
                  {p.camNote && <p className="text-xs text-muted mt-1 truncate">{p.camNote}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 確認按鈕 — 無 CreditIndicator */}
      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> {tr.creator.drama.s5.confirmBtn}
      </button>
    </div>
  );
}
