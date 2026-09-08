import { useState, useRef, useEffect } from 'react';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/i18n';
import { saveProjectToD1 } from '@/adapters';
import { Check, Mic, Save, Sparkles } from 'lucide-react';

export function PlanOverview({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const po = tr.creator.drama.planOverview;

  const { storyMaterial, setStoryMaterial, projectId: poProjectId, context: poContext } = useProjectStore();
  const { user: poUser } = useAuthStore();
  const [localMaterial, setLocalMaterial] = useState(storyMaterial);

  // ── 掛載回填：storyMaterial 可能在 async loadProject 後才灌入 store ──
  // hydratedRef 確保只在首次拿到非空值時同步一次，不蓋掉使用者已編輯的內容
  const poHydratedRef = useRef(false);
  useEffect(() => {
    if (poHydratedRef.current) return;
    if (!storyMaterial) return;
    poHydratedRef.current = true;
    setLocalMaterial(storyMaterial);
  }, [storyMaterial]);

  // 非同步存 D1 story_material（non-blocking，失敗只 warn）
  const persistMaterial = (material: string) => {
    if (!poProjectId) return;
    saveProjectToD1({
      projectId: poProjectId,
      userId: poUser?.id ?? 'demo-user',
      title: poContext?.seriesTitle ?? '未命名劇集',
      mode: 'drama',
      storyMaterial: material,
      seriesContext: poContext ? JSON.stringify(poContext) : undefined,
    }).catch(e => console.warn('[PlanOverview] D1 story_material save failed:', e));
  };

  const handleConfirm = () => {
    setStoryMaterial(localMaterial);
    persistMaterial(localMaterial);
    onNext();
  };

  const handleSaveDraft = () => {
    setStoryMaterial(localMaterial);
    persistMaterial(localMaterial);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3">
          <Mic size={12} /> {po.badge}
        </div>
        <h2 className="text-2xl font-bold text-primary">{po.title}</h2>
        <p className="text-muted text-sm mt-1">{po.subtitle}</p>
      </div>

      <div className="space-y-4 mb-6">
        {/* 主輸入區 */}
        <div className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
          <div className="p-4 border-b border-line flex items-center justify-between">
            <label className="text-sm font-semibold text-ink">{po.inputLabel}</label>
            <span className="text-xs text-muted">
              {localMaterial.length} {po.charCount}
            </span>
          </div>
          <div className="p-4">
            <textarea
              value={localMaterial}
              onChange={e => setLocalMaterial(e.target.value)}
              placeholder={po.inputPlaceholder}
              rows={12}
              className="w-full border border-line rounded-xl px-4 py-3 bg-bg-soft focus:outline-none focus:border-primary text-sm text-ink leading-relaxed resize-none placeholder:text-muted/60"
            />
          </div>
          {/* AI 提示 */}
          <div className="px-4 pb-4">
            <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-2.5 flex items-start gap-2">
              <Sparkles size={14} className="text-accent mt-0.5 shrink-0" />
              <p className="text-xs text-accent/80 leading-relaxed">{po.aiHint}</p>
            </div>
          </div>
        </div>

        {/* 小提示 */}
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
          <p className="font-semibold text-sm text-amber-900 mb-2">{po.tipTitle}</p>
          <ul className="space-y-1">
            {[po.tip1, po.tip2, po.tip3].map((tip, i) => (
              <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSaveDraft}
          className="flex items-center gap-2 border border-line px-5 py-3 rounded-xl text-muted hover:border-primary hover:text-primary transition-colors text-sm"
        >
          <Save size={15} /> {po.saveDraft}
        </button>
        <button
          onClick={handleConfirm}
          disabled={!localMaterial.trim()}
          className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={18} /> {po.confirmBtn}
        </button>
      </div>
    </div>
  );
}
