/**
 * S5KeyframeGen — per-panel 關鍵幀生成複合模組。
 * 第二磚：逐 panel「生成」→ POST /api/ai/image-gen → 顯示圖 + 存 D1(keyframeAdapter)。
 * 入場 / 切集時從 D1 載入已生成圖。per-panel loading + error，不 crash 全頁。
 *
 * Props:
 *   projectId       — 當前項目 ID
 *   episode         — 當前集數
 *   panels          — StoryboardPanel[] (來自 S4 D1)
 *   aestheticPrompt — 美學 prompt（全劇或局部微調）
 *   characters      — CharacterCard[]（用作參考圖）
 */
import { useState, useEffect, useCallback } from 'react';
import type { StoryboardPanel } from '@/components/shared/S4StoryboardGen';
import type { CharacterCard } from '@/adapters/types';
import { saveKeyframeToD1, loadKeyframesFromD1, type KeyframeRecord } from '@/adapters/keyframeAdapter';
import { Camera, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  projectId:       string;
  episode:         number;
  panels:          StoryboardPanel[];
  aestheticPrompt: string;
  characters:      CharacterCard[];
}

// ── Per-panel state ───────────────────────────────────────────────────────────
interface PanelState {
  imageUrl:  string | null;
  loading:   boolean;
  error:     string | null;
  credits:   number | null;
}

function initPanelStates(count: number): PanelState[] {
  return Array.from({ length: count }, () => ({
    imageUrl: null, loading: false, error: null, credits: null,
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────
export function S5KeyframeGen({ projectId, episode, panels, aestheticPrompt, characters }: Props) {
  const [panelStates, setPanelStates] = useState<PanelState[]>(() => initPanelStates(panels.length));

  // Reset states when panels change (new episode or new storyboard)
  useEffect(() => {
    setPanelStates(initPanelStates(panels.length));
  }, [panels.length, episode]);

  // Load existing keyframes from D1 on mount / episode change
  useEffect(() => {
    if (!projectId || panels.length === 0) return;
    loadKeyframesFromD1(projectId, episode)
      .then((records: KeyframeRecord[]) => {
        if (records.length === 0) return;
        setPanelStates(prev => {
          const next = [...prev];
          records.forEach(kf => {
            // Match by panel_scene (1-indexed scene number)
            const idx = panels.findIndex(p => p.scene === kf.panelScene);
            if (idx >= 0 && kf.imageUrl) {
              next[idx] = { ...next[idx], imageUrl: kf.imageUrl };
            }
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

    // Mark loading, clear previous error
    setPanelStates(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], loading: true, error: null };
      return next;
    });

    try {
      // Gather reference images from characters (all chars with img, max 3)
      const refUrls = characters
        .filter(ch => Boolean(ch.img))
        .map(ch => ch.img as string)
        .slice(0, 3);

      // Build appearanceSummary from panel desc + camNote + aesthetic prompt
      const appearanceSummary = [
        panel.desc,
        panel.camNote ? `鏡頭：${panel.camNote}` : '',
        aestheticPrompt ? `美學：${aestheticPrompt}` : '',
      ].filter(Boolean).join(' ');

      const res = await fetch('/api/ai/image-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appearanceSummary,
          projectId,
          referenceImageUrls: refUrls,
        }),
      });

      const data = await res.json() as {
        ok: boolean;
        fileUrl?: string;
        assetId?: string;
        r2Key?: string;
        creditsConsumed?: number;
        error?: string;
      };

      if (!data.ok || !data.fileUrl) {
        throw new Error(data.error ?? '生成失敗，請重試');
      }

      // Save to D1 (non-fatal)
      saveKeyframeToD1(
        projectId, episode, panel.scene,
        data.fileUrl, data.r2Key ?? '',
      ).catch(e => console.warn('[S5KeyframeGen] save keyframe failed:', e));

      // Update panel state with new image
      setPanelStates(prev => {
        const next = [...prev];
        next[idx] = { imageUrl: data.fileUrl!, loading: false, error: null, credits: data.creditsConsumed ?? null };
        return next;
      });
    } catch (err) {
      // Per-panel error — does NOT affect other panels
      const msg = err instanceof Error ? err.message : String(err);
      setPanelStates(prev => {
        const next = [...prev];
        next[idx] = { ...next[idx], loading: false, error: msg };
        return next;
      });
    }
  }, [panels, projectId, episode, aestheticPrompt, characters]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (panels.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted">
        <AlertTriangle size={28} className="text-amber-400" />
        <p className="text-sm text-center">尚無分鏡資料。<br />請先在 S4 生成分鏡，再回來進行關鍵幀生成。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {panels.map((p, i) => {
        const ps = panelStates[i] ?? { imageUrl: null, loading: false, error: null, credits: null };
        return (
          <div key={i} className="rounded-xl border border-line overflow-hidden">
            {/* Image area */}
            <div className="relative aspect-video bg-muted/10 flex items-center justify-center">
              {ps.imageUrl ? (
                <img
                  src={ps.imageUrl}
                  alt={`Panel ${p.scene}`}
                  className="w-full h-full object-cover"
                />
              ) : ps.loading ? (
                <Loader2 size={24} className="text-primary animate-spin" />
              ) : (
                <Camera size={24} className="text-muted/40" />
              )}
              {/* Re-generate overlay when image exists */}
              {ps.imageUrl && !ps.loading && (
                <button
                  onClick={() => generatePanel(i)}
                  className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                  title="重新生成"
                >
                  <RefreshCw size={20} className="text-white" />
                </button>
              )}
            </div>

            {/* Caption + action */}
            <div className="p-2">
              <p className="text-xs text-ink leading-tight line-clamp-2">{p.desc}</p>
              {p.camNote && <p className="text-xs text-muted mt-0.5 truncate">{p.camNote}</p>}

              {/* Per-panel error */}
              {ps.error && (
                <p className="text-xs text-red-500 mt-1 line-clamp-2">{ps.error}</p>
              )}

              {/* Credits consumed */}
              {ps.credits !== null && (
                <p className="text-xs text-muted mt-0.5">-{ps.credits} 積分</p>
              )}

              {/* Generate / regenerate button */}
              {!ps.imageUrl && !ps.loading && (
                <button
                  onClick={() => generatePanel(i)}
                  disabled={ps.loading}
                  className="mt-1.5 w-full text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-lg transition-colors"
                >
                  生成
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
