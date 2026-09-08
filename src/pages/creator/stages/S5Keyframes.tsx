import { useState } from 'react';
import { AestheticComposer, type AestheticOutput } from '@/components/shared/AestheticComposer';
import { CreditIndicator } from '@/components/shared/CreditIndicator';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { t } from '@/i18n';
import { Layers } from 'lucide-react';
import {
  AlertTriangle, RefreshCw, Check, ChevronRight, Image, Edit3,
} from 'lucide-react';

export function S5Keyframes({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const { aestheticLock } = useProjectStore();
  const [genMode, setGenMode] = useState<'reference' | 'text'>('reference');
  const [localAestheticOpen, setLocalAestheticOpen] = useState(false);
  const [localAdjustment, setLocalAdjustment] = useState<AestheticOutput | null>(null);

  return (
    <div className="max-w-2xl">
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
            <div>
              <p className="text-xs font-semibold text-violet-800">本格局部微調（只影響本格，不改動全劇美學鎖）</p>
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

      {/* 生成模式 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <label className="block text-sm font-semibold text-ink mb-3">{tr.creator.drama.s5.genModeLabel}</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'reference' as const, label: tr.creator.drama.s5.modeReference, desc: tr.creator.drama.s5.modeReferenceDesc, icon: Image },
            { id: 'text' as const, label: tr.creator.drama.s5.modeText, desc: tr.creator.drama.s5.modeTextDesc, icon: Edit3 },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setGenMode(m.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                genMode === m.id ? 'border-primary bg-primary/5' : 'border-line hover:border-primary/40'
              }`}
            >
              <m.icon size={20} className={genMode === m.id ? 'text-primary' : 'text-muted'} />
              <div className="font-semibold text-sm text-ink mt-2">{m.label}</div>
              <div className="text-xs text-muted mt-1">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 資產完整度檢查 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Check size={16} className="text-green-500" />
          <h3 className="font-semibold text-ink text-sm">{tr.creator.drama.s5.assetCheckTitle}</h3>
        </div>
        <div className="space-y-2">
          {[
            { label: '陳伯角色參考圖', ok: true },
            { label: '陳太角色參考圖', ok: true },
            { label: '阿明角色參考圖', ok: false },
            { label: '街市場景參考', ok: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {item.ok
                ? <Check size={14} className="text-green-500" />
                : <AlertTriangle size={14} className="text-amber-500" />
              }
              <span className={item.ok ? 'text-ink' : 'text-amber-700'}>{item.label}</span>
              {!item.ok && <span className="text-xs text-amber-600 ml-auto">{tr.creator.drama.s5.recommended}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 生成預覽 */}
      <div className="bg-card rounded-xl border border-line p-5 shadow-card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-ink text-sm">{tr.creator.drama.s5.previewTitle}</h3>
          <button className="text-xs text-accent hover:underline flex items-center gap-1">
            <RefreshCw size={11} /> {tr.creator.drama.s5.regenerateAll}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop',
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=150&fit=crop',
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=150&fit=crop',
          ].map((src, i) => (
            <div key={i} className="relative group cursor-pointer">
              <img src={src} alt="" className="w-full aspect-video object-cover rounded-lg" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center gap-2 transition-opacity">
                <button className="text-white text-xs bg-white/20 px-2 py-1 rounded">{tr.creator.drama.s5.accept}</button>
                <button className="text-white text-xs bg-white/20 px-2 py-1 rounded">{tr.creator.drama.s5.regenerate}</button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
          <Check size={11} /> {tr.creator.drama.s5.consistencyLabel}陳伯 94% · 陳太 88%
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> {tr.creator.drama.s5.confirmBtn}
        <CreditIndicator cost={120} className="ml-2" />
      </button>
    </div>
  );
}
