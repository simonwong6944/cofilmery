/**
 * S5KeyframeGen — per-panel 關鍵幀生成複合模組（第三磚）。
 * 第三磚新增：批量「全部生成」(並行上限 KEYFRAME_GEN_CONCURRENCY)、進度條、
 *   onStatesChange 回調（供父層確認門控用）、export PanelState 型別。
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { StoryboardPanel } from '@/components/shared/S4StoryboardGen';
import type { CharacterCard } from '@/adapters/types';
import { saveKeyframeToD1, loadKeyframesFromD1, type KeyframeRecord } from '@/adapters/keyframeAdapter';
import { Camera, Loader2, AlertTriangle, RefreshCw, Zap } from 'lucide-react';

// ── Config ────────────────────────────────────────────────────────────────────
const KEYFRAME_GEN_CONCURRENCY = 3; // max parallel image-gen requests

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PanelState {
  imageUrl: string | null;
  loading:  boolean;
  error:    string | null;
  credits:  number | null;
}

interface Props {
  projectId:        string;
  episode:          number;
  panels:           StoryboardPanel[];
  aestheticPrompt:  string;
  characters:       CharacterCard[];
  onStatesChange?:  (states: PanelState[]) => void;
}

function initStates(count: number): PanelState[] {
  return Array.from({ length: count }, () => ({ imageUrl: null, loading: false, error: null, credits: null }));
}

// ── Component ─────────────────────────────────────────────────────────────────
export function S5KeyframeGen({ projectId, episode, panels, aestheticPrompt, characters, onStatesChange }: Props) {
  const [panelStates, setPanelStates] = useState<PanelState[]>(() => initStates(panels.length));
  const [batchRunning, setBatchRunning] = useState(false);
  const statesRef = useRef(panelStates);

  // Keep ref in sync with state (for generateAll closure)
  useEffect(() => { statesRef.current = panelStates; }, [panelStates]);

  // Notify parent on state change
  useEffect(() => { onStatesChange?.(panelStates); }, [panelStates, onStatesChange]);

  // Reset when panels/episode change
  useEffect(() => { setPanelStates(initStates(panels.length)); }, [panels.length, episode]);

  // Load existing keyframes from D1
  useEffect(() => {
    if (!projectId || panels.length === 0) return;
    loadKeyframesFromD1(projectId, episode)
      .then((records: KeyframeRecord[]) => {
        if (records.length === 0) return;
        setPanelStates(prev => {
          const next = [...prev];
          records.forEach(kf => {
            const idx = panels.findIndex(p => p.scene === kf.panelScene);
            if (idx >= 0 && kf.imageUrl) next[idx] = { ...next[idx], imageUrl: kf.imageUrl };
          });
          return next;
        });
      })
      .catch(e => console.warn('[S5KeyframeGen] load keyframes failed:', e));
  }, [projectId, episode, panels]);

  // ── Generate one panel ────────────────────────────────────────────────────
  const generatePanel = useCallback(async (idx: number) => {
    const panel = panels[idx];
    if (!panel) return;
    setPanelStates(prev => { const n = [...prev]; n[idx] = { ...n[idx], loading: true, error: null }; return n; });
    try {
      const refUrls = characters.filter(ch => Boolean(ch.img)).map(ch => ch.img as string).slice(0, 3);
      const appearanceSummary = [
        panel.desc,
        panel.camNote ? `鏡頭：${panel.camNote}` : '',
        aestheticPrompt ? `美學：${aestheticPrompt}` : '',
      ].filter(Boolean).join(' ');

      const res  = await fetch('/api/ai/image-gen', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appearanceSummary, projectId, referenceImageUrls: refUrls }),
      });
      const data = await res.json() as { ok: boolean; fileUrl?: string; r2Key?: string; creditsConsumed?: number; error?: string };
      if (!data.ok || !data.fileUrl) throw new Error(data.error ?? '生成失敗，請重試');

      saveKeyframeToD1(projectId, episode, panel.scene, data.fileUrl, data.r2Key ?? '')
        .catch(e => console.warn('[S5KeyframeGen] save keyframe failed:', e));

      setPanelStates(prev => {
        const n = [...prev];
        n[idx] = { imageUrl: data.fileUrl!, loading: false, error: null, credits: data.creditsConsumed ?? null };
        return n;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setPanelStates(prev => { const n = [...prev]; n[idx] = { ...n[idx], loading: false, error: msg }; return n; });
    }
  }, [panels, projectId, episode, aestheticPrompt, characters]);

  // ── Batch generate (only panels without image) ────────────────────────────
  const generateAll = useCallback(async () => {
    if (batchRunning) return;
    setBatchRunning(true);
    const pending = panels.map((_, i) => i)
      .filter(i => !statesRef.current[i]?.imageUrl && !statesRef.current[i]?.loading);
    for (let s = 0; s < pending.length; s += KEYFRAME_GEN_CONCURRENCY) {
      await Promise.all(pending.slice(s, s + KEYFRAME_GEN_CONCURRENCY).map(i => generatePanel(i)));
    }
    setBatchRunning(false);
  }, [batchRunning, panels, generatePanel]);

  // ── Derived counts ────────────────────────────────────────────────────────
  const doneCount    = panelStates.filter(s => s.imageUrl).length;
  const loadingCount = panelStates.filter(s => s.loading).length;
  const total        = panels.length;

  // ── Render ────────────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted">
        <AlertTriangle size={28} className="text-amber-400" />
        <p className="text-sm text-center">尚無分鏡資料。<br />請先在 S4 生成分鏡，再回來進行關鍵幀生成。</p>
      </div>
    );
  }

  return (
    <div>
      {/* Batch controls */}
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted">
              已完成 {doneCount} / {total}{loadingCount > 0 ? `（生成中 ${loadingCount}）` : ''}
            </span>
          </div>
          <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: total > 0 ? `${(doneCount / total) * 100}%` : '0%' }} />
          </div>
        </div>
        <button onClick={generateAll} disabled={batchRunning || doneCount === total}
          className="shrink-0 flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {batchRunning ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
          全部生成
        </button>
      </div>

      {/* Panel grid */}
      <div className="grid grid-cols-3 gap-3">
        {panels.map((p, i) => {
          const ps = panelStates[i] ?? { imageUrl: null, loading: false, error: null, credits: null };
          return (
            <div key={i} className="rounded-xl border border-line overflow-hidden">
              <div className="relative aspect-video bg-muted/10 flex items-center justify-center">
                {ps.imageUrl ? (
                  <img src={ps.imageUrl} alt={`Panel ${p.scene}`} className="w-full h-full object-cover" />
                ) : ps.loading ? (
                  <Loader2 size={24} className="text-primary animate-spin" />
                ) : (
                  <Camera size={24} className="text-muted/40" />
                )}
                {ps.imageUrl && !ps.loading && (
                  <button onClick={() => generatePanel(i)}
                    className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                    title="重新生成">
                    <RefreshCw size={20} className="text-white" />
                  </button>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs text-ink leading-tight line-clamp-2">{p.desc}</p>
                {p.camNote && <p className="text-xs text-muted mt-0.5 truncate">{p.camNote}</p>}
                {ps.error && <p className="text-xs text-red-500 mt-1 line-clamp-2">{ps.error}</p>}
                {ps.credits !== null && <p className="text-xs text-muted mt-0.5">-{ps.credits} 積分</p>}
                {!ps.imageUrl && !ps.loading && (
                  <button onClick={() => generatePanel(i)} disabled={ps.loading}
                    className="mt-1.5 w-full text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-lg transition-colors">
                    生成
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
