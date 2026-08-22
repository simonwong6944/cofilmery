/**
 * AestheticComposer — 美學定義器共用元件
 * Phase 1 · 三層界面：Presets / Blocks / LightLab
 *
 * 輸出 AestheticOutput：
 *   stylePreset     — 已選積木 id 陣列
 *   compiledPromptZh — 合併後中文提示詞
 *   compiledPromptEn — 合併後英文提示詞
 *   negativePrompt  — 合併後負面詞
 *   aestheticParams — 合併後可調參數 JSON
 *
 * 安全紅線：
 *   - 工具本身不呼叫任何模型、不扣點數
 *   - 涉及真實人物縮圖由 safety.noRealPersonNotice 提示
 *   - 所有 UI 文字從語系檔讀取，無硬編
 */

import { useState, useMemo } from 'react';
import { Layers, Sliders, Zap, Check, X, ChevronRight, Info } from 'lucide-react';
import { t } from '@/i18n';
import { useLocaleStore } from '@/store/localeStore';

// ─── 型別 ───────────────────────────────────────────────────────────────────

export interface AestheticBlock {
  id: string;
  category: string;
  subcategory: string;
  name_i18n: { 'zh-HK': string; en: string; 'zh-CN': string };
  description_i18n: { 'zh-HK': string; en: string; 'zh-CN': string };
  emotion_tags: string[];
  composed_of: string[];
  prompt_fragment_zh: string;
  prompt_fragment_en: string;
  negative_fragment: string;
  adjustable_params: Record<string, string>;
  thumbnail_r2_key?: string;
  mode_scope: string[];
  usage_count?: number;
}

export interface AestheticOutput {
  stylePreset: string[];
  compiledPromptZh: string;
  compiledPromptEn: string;
  negativePrompt: string;
  aestheticParams: Record<string, string>;
}

export type AestheticMode = 'drama' | 'legacy' | 'both';

interface AestheticComposerProps {
  mode?: AestheticMode;                       // 限制顯示的模式
  initialOutput?: AestheticOutput;            // 既有美學鎖（可預填）
  onApply: (output: AestheticOutput) => void; // 確認套用回調
  onCancel?: () => void;
  isSeriesLock?: boolean;                     // 顯示「系列美學鎖」說明
}

// ─── 靜態示範積木（Phase 1 前端展示用，實際生產由 API 載入）──────────────────

import SEED_BLOCKS from '@/data/aesthetic-library.json';

// ─── 衝突對（光位衝突規則）────────────────────────────────────────────────────

const CONFLICT_PAIRS: [string, string][] = [
  ['light-color-warm', 'light-position-backlight'], // 暖光 + 逆光可接受但有衝突提示
  // 可擴充更多衝突規則
];

// ─── 全域負面詞（所有生成統一附加）──────────────────────────────────────────

const GLOBAL_NEGATIVE = 'nudity, explicit sexual content, recognisable real person, watermark';

// ─── 光位效果說明對應 ───────────────────────────────────────────────────────

const LIGHT_POSITIONS = ['front', 'side', 'back', 'top', 'bottom'] as const;
type LightPos = typeof LIGHT_POSITIONS[number];

// ─── 主元件 ─────────────────────────────────────────────────────────────────

export function AestheticComposer({
  mode = 'both',
  initialOutput,
  onApply,
  onCancel,
  isSeriesLock = false,
}: AestheticComposerProps) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const ac = tr.aestheticComposer;
  const lang = locale as 'zh-HK' | 'en' | 'zh-CN';

  const [activeTab, setActiveTab] = useState<'presets' | 'blocks' | 'lightlab'>('presets');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialOutput?.stylePreset ?? [])
  );

  // 打光實驗室狀態
  const [lightPos, setLightPos] = useState<LightPos>('front');
  const [colorTemp, setColorTemp] = useState<number>(50); // 0=冷, 100=暖

  // 依模式篩選積木
  const filteredBlocks = useMemo(() => {
    return (SEED_BLOCKS as AestheticBlock[]).filter(b =>
      mode === 'both' || b.mode_scope.includes(mode) || b.mode_scope.includes('both')
    );
  }, [mode]);

  // 依 category 分組
  const blocksByCategory = useMemo(() => {
    const map = new Map<string, AestheticBlock[]>();
    for (const b of filteredBlocks) {
      if (!map.has(b.category)) map.set(b.category, []);
      map.get(b.category)!.push(b);
    }
    return map;
  }, [filteredBlocks]);

  // 找 composed_of 齊全的「風格包」（即有 composed_of 陣列的複合條目）
  const presets = useMemo(
    () => filteredBlocks.filter(b => b.composed_of.length > 0),
    [filteredBlocks]
  );

  // 偵測衝突
  const conflicts = useMemo(() => {
    return CONFLICT_PAIRS.filter(
      ([a, b]) => selectedIds.has(a) && selectedIds.has(b)
    );
  }, [selectedIds]);

  // 編譯輸出
  const compiled = useMemo<AestheticOutput>(() => {
    const ids = Array.from(selectedIds);
    const chosen = (SEED_BLOCKS as AestheticBlock[]).filter(b => ids.includes(b.id));

    const promptZh = chosen.map(b => b.prompt_fragment_zh).filter(Boolean).join('，');
    const promptEn = chosen.map(b => b.prompt_fragment_en).filter(Boolean).join(', ');
    const negative = [
      ...chosen.map(b => b.negative_fragment).filter(Boolean),
      GLOBAL_NEGATIVE,
    ].join(', ');
    const params = Object.assign({}, ...chosen.map(b => b.adjustable_params));

    // 打光實驗室補充（若在 LightLab tab 且有選光位）
    const lightEnhance: Record<LightPos, { zh: string; en: string }> = {
      front: { zh: '面光，均勻照亮', en: 'front lighting, even illumination' },
      side: { zh: '全側光，塑造立體', en: 'full side light, sculpted form' },
      back: { zh: '逆光，輪廓勾勒', en: 'backlight, silhouette outline' },
      top: { zh: '頂光，莊重威嚴', en: 'top lighting, solemn authority' },
      bottom: { zh: '底光，戲劇張力', en: 'bottom light, dramatic tension' },
    };
    const tempLabel = colorTemp >= 60 ? (lang === 'en' ? 'warm light' : '暖色光') :
                      colorTemp <= 40 ? (lang === 'en' ? 'cool light' : '冷色光') : '';

    const labZhExtra = activeTab === 'lightlab'
      ? [lightEnhance[lightPos].zh, tempLabel].filter(Boolean).join('，') : '';
    const labEnExtra = activeTab === 'lightlab'
      ? [lightEnhance[lightPos].en, tempLabel].filter(Boolean).join(', ') : '';

    return {
      stylePreset: ids,
      compiledPromptZh: [promptZh, labZhExtra].filter(Boolean).join('，'),
      compiledPromptEn: [promptEn, labEnExtra].filter(Boolean).join(', '),
      negativePrompt: negative,
      aestheticParams: params,
    };
  }, [selectedIds, activeTab, lightPos, colorTemp, lang]);

  // 切換積木選取
  const toggleBlock = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // 套用預設風格包
  const applyPreset = (preset: AestheticBlock) => {
    setSelectedIds(new Set([preset.id, ...preset.composed_of]));
  };

  // 取得積木名稱（依語系）
  const name = (b: AestheticBlock) => b.name_i18n[lang] ?? b.name_i18n['zh-HK'];
  const desc = (b: AestheticBlock) => b.description_i18n[lang] ?? b.description_i18n['zh-HK'];
  const catLabel = (cat: string) =>
    (ac.category as Record<string, string>)[cat] ?? cat;

  // 打光實驗室效果說明
  const lightEffectLabel: Record<LightPos, string> = {
    front: ac.composer.effectFront,
    side: ac.composer.effectSide,
    back: ac.composer.effectBack,
    top: ac.composer.effectTop,
    bottom: ac.composer.effectBottom,
  };
  const tempLabel = colorTemp >= 60 ? ac.composer.effectWarm
                  : colorTemp <= 40 ? ac.composer.effectCool : '';

  return (
    <div className="space-y-4">
      {/* 標頭 */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
          <Layers size={16} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-ink text-base">{ac.common.toolName}</h3>
          {isSeriesLock && (
            <p className="text-xs text-muted">{ac.seriesLock.hint}</p>
          )}
        </div>
      </div>

      {/* Tab 切換 */}
      <div className="flex gap-1 p-1 bg-bg-soft rounded-xl border border-line">
        {([
          { id: 'presets' as const, label: ac.composer.tabPresets, icon: Zap },
          { id: 'blocks' as const, label: ac.composer.tabBlocks, icon: Layers },
          { id: 'lightlab' as const, label: ac.composer.tabLightLab, icon: Sliders },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <tab.icon size={13} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 衝突警告 */}
      {conflicts.length > 0 && conflicts.map(([a, b]) => {
        const blockA = (SEED_BLOCKS as AestheticBlock[]).find(bl => bl.id === a);
        const blockB = (SEED_BLOCKS as AestheticBlock[]).find(bl => bl.id === b);
        const labelA = blockA ? name(blockA) : a;
        const labelB = blockB ? name(blockB) : b;
        return (
          <div key={`${a}-${b}`} className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <Info size={13} className="mt-0.5 shrink-0 text-amber-600" />
            {ac.composer.conflictWarning.replace('{a}', labelA).replace('{b}', labelB)}
          </div>
        );
      })}

      {/* ── Tab: 一鍵風格包 ── */}
      {activeTab === 'presets' && (
        <div className="space-y-3">
          <p className="text-xs text-muted">{ac.composer.presetsHint}</p>
          {presets.length === 0 && (
            <p className="text-sm text-muted text-center py-4">{ac.common.empty}</p>
          )}
          {presets.map(preset => {
            const composedNames = preset.composed_of
              .map(cid => {
                const b = (SEED_BLOCKS as AestheticBlock[]).find(bl => bl.id === cid);
                return b ? name(b) : cid;
              }).join(' · ');
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedIds.has(preset.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-line hover:border-primary/40 bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-ink mb-1">{name(preset)}</div>
                    <div className="text-xs text-muted mb-2 line-clamp-2">{desc(preset)}</div>
                    <div className="text-xs text-violet-600 bg-violet-50 rounded-lg px-2 py-1 inline-block">
                      {ac.composer.presetComposedOf.replace('{blocks}', composedNames || '—')}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {preset.emotion_tags.map(tag => (
                        <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                  {selectedIds.has(preset.id) && (
                    <Check size={18} className="text-primary shrink-0 mt-1" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Tab: 積木自選 ── */}
      {activeTab === 'blocks' && (
        <div className="flex gap-4">
          {/* 積木列表 */}
          <div className="flex-1 space-y-4 min-w-0">
            <p className="text-xs text-muted">{ac.composer.blocksHint}</p>
            {Array.from(blocksByCategory.entries()).map(([cat, blocks]) => (
              <div key={cat}>
                <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">{catLabel(cat)}</div>
                <div className="space-y-2">
                  {blocks.map(block => (
                    <button
                      key={block.id}
                      onClick={() => toggleBlock(block.id)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3 ${
                        selectedIds.has(block.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-line hover:border-primary/30 bg-card'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                        selectedIds.has(block.id)
                          ? 'border-primary bg-primary'
                          : 'border-line'
                      }`}>
                        {selectedIds.has(block.id) && <Check size={11} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-ink">{name(block)}</div>
                        <div className="text-xs text-muted mt-0.5 line-clamp-2">{desc(block)}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {block.emotion_tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-bg-soft text-muted px-1.5 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 右側即時預覽 */}
          <div className="w-52 shrink-0 hidden md:block">
            <div className="sticky top-0 space-y-3">
              <div className="text-xs font-semibold text-ink">{ac.composer.selectedBlocks}</div>
              {selectedIds.size === 0 ? (
                <p className="text-xs text-muted italic">{ac.composer.noBlockSelected}</p>
              ) : (
                <div className="space-y-1">
                  {Array.from(selectedIds).map(id => {
                    const b = (SEED_BLOCKS as AestheticBlock[]).find(bl => bl.id === id);
                    return b ? (
                      <div key={id} className="flex items-center gap-1.5 text-xs bg-primary/5 border border-primary/20 rounded-lg px-2 py-1">
                        <span className="flex-1 text-primary font-medium">{name(b)}</span>
                        <button onClick={() => toggleBlock(id)}>
                          <X size={11} className="text-muted hover:text-red-500" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              {/* 提示詞預覽 */}
              {compiled.compiledPromptZh && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-ink">{ac.composer.promptPreviewZh}</div>
                  <div className="text-xs text-muted bg-bg-soft rounded-lg p-2 leading-relaxed">
                    {compiled.compiledPromptZh}
                  </div>
                  <div className="text-xs font-semibold text-ink">{ac.composer.promptPreviewEn}</div>
                  <div className="text-xs text-muted bg-bg-soft rounded-lg p-2 leading-relaxed font-mono">
                    {compiled.compiledPromptEn}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: 打光實驗室 ── */}
      {activeTab === 'lightlab' && (
        <div className="space-y-5">
          <p className="text-xs text-muted">{ac.composer.lightLabHint}</p>

          {/* 光源方向 */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-3">{ac.composer.lightPosition}</label>
            <div className="grid grid-cols-5 gap-2">
              {(LIGHT_POSITIONS).map(pos => {
                const posLabel: Record<LightPos, string> = {
                  front: ac.composer.positionFront,
                  side: ac.composer.positionSide,
                  back: ac.composer.positionBack,
                  top: ac.composer.positionTop,
                  bottom: ac.composer.positionBottom,
                };
                const posIcon: Record<LightPos, string> = {
                  front: '☀️', side: '🌤️', back: '🌅', top: '⬆️', bottom: '⬇️',
                };
                return (
                  <button
                    key={pos}
                    onClick={() => setLightPos(pos)}
                    className={`p-3 rounded-xl border-2 text-center text-xs transition-all ${
                      lightPos === pos
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-line bg-card text-muted hover:border-primary/40'
                    }`}
                  >
                    <div className="text-lg mb-1">{posIcon[pos]}</div>
                    <div className="font-medium leading-tight">{posLabel[pos]}</div>
                  </button>
                );
              })}
            </div>

            {/* 光位效果說明 */}
            <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700">
              <Info size={12} className="inline mr-1" />
              {lightEffectLabel[lightPos]}
            </div>
          </div>

          {/* 色溫滑桿 */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-3">
              {ac.composer.colorTemp}
              <span className="ml-2 text-xs font-normal text-muted">
                {colorTemp <= 40 ? ac.composer.tempCool : colorTemp >= 60 ? ac.composer.tempWarm : '—'}
              </span>
            </label>
            <div className="relative">
              <div className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-white to-amber-400 mb-2" />
              <input
                type="range"
                min={0}
                max={100}
                value={colorTemp}
                onChange={e => setColorTemp(Number(e.target.value))}
                className="w-full -mt-8 appearance-none bg-transparent cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>{ac.composer.tempCool}</span>
              <span>{ac.composer.tempWarm}</span>
            </div>
            {tempLabel && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700">
                <Info size={12} className="inline mr-1" />
                {tempLabel}
              </div>
            )}
          </div>

          {/* 互動說明示意圖（文字版） */}
          <div className="bg-card border border-line rounded-xl p-4 text-center">
            <div className="text-4xl mb-2">🎬</div>
            <div className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
              {(() => {
                const posLabelMap: Record<LightPos, string> = {
                  front: ac.composer.positionFront,
                  side: ac.composer.positionSide,
                  back: ac.composer.positionBack,
                  top: ac.composer.positionTop,
                  bottom: ac.composer.positionBottom,
                };
                const warmCool = colorTemp >= 60 ? ac.composer.tempWarm
                               : colorTemp <= 40 ? ac.composer.tempCool : '';
                return `${posLabelMap[lightPos]}${warmCool ? ` · ${warmCool}` : ''}`;
              })()}
            </div>
            <div className="text-xs text-indigo-600 mt-2 font-medium">
              {lightEffectLabel[lightPos]}
            </div>
          </div>

          {/* 安全提示 */}
          <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-500">
            <Info size={12} className="mt-0.5 shrink-0" />
            {tr.aestheticComposer.safety.noRealPersonNotice}
          </div>
        </div>
      )}

      {/* 底部操作列（積木自選：手機版提示詞預覽） */}
      {activeTab === 'blocks' && selectedIds.size > 0 && (
        <div className="md:hidden bg-bg-soft border border-line rounded-xl p-3 space-y-2">
          <div className="text-xs font-semibold text-ink">{ac.composer.promptPreviewZh}</div>
          <div className="text-xs text-muted">{compiled.compiledPromptZh}</div>
        </div>
      )}

      {/* 確認 / 取消按鈕 */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-line text-sm text-muted hover:text-ink transition-colors"
          >
            {ac.common.cancel}
          </button>
        )}
        <button
          onClick={() => onApply(compiled)}
          className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronRight size={16} />
          {ac.common.confirm}
        </button>
      </div>
    </div>
  );
}
