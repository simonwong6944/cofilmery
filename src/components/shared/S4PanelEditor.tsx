/**
 * S4PanelEditor — inline edit / delete-confirm / AI-rewrite for a single storyboard panel.
 * Composite module. All state is local — no D1 / persistence (S4 brick 2 scope).
 * Placed alongside S4StoryboardGen.tsx (S4-specific; future re-layering: see pending_changes.md).
 */
import { useState } from 'react';
import { Loader2, Check, X, AlertTriangle } from 'lucide-react';
import type { StoryboardPanel } from './S4StoryboardGen';

// ── Configurable constants (Rules.md §4 — no magic numbers scattered) ──────────
const PANEL_REWRITE_MAX_TOKENS = 300;
const PANEL_DURATION_MIN       = 3;
const PANEL_DURATION_MAX       = 12;

// ── Parse + validate a single panel returned by AI rewrite ────────────────────
function parseRewrittenPanel(raw: string, originalScene: number): StoryboardPanel | null {
  try {
    const cleaned = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    // accept either a bare object or the first object inside an array
    const objStart = cleaned.indexOf('{');
    const objEnd   = cleaned.lastIndexOf('}');
    if (objStart === -1 || objEnd === -1 || objEnd <= objStart) return null;
    const p = JSON.parse(cleaned.slice(objStart, objEnd + 1)) as Record<string, unknown>;
    const scene    = typeof p.scene    === 'number' ? p.scene    : originalScene;
    const desc     = typeof p.desc     === 'string' ? p.desc.trim()    : '';
    const camNote  = typeof p.camNote  === 'string' ? p.camNote.trim() : '';
    const duration = typeof p.duration === 'number' ? p.duration : 0;
    // Validation — must have desc + valid duration
    if (!desc) return null;
    if (duration < PANEL_DURATION_MIN || duration > PANEL_DURATION_MAX) return null;
    return { scene, desc, camNote, duration };
  } catch {
    return null;
  }
}

// ── Build AI-rewrite prompt for a single panel ────────────────────────────────
function buildRewritePrompt(panel: StoryboardPanel, aestheticPrompt: string): string {
  const aesthetic = aestheticPrompt
    ? `\n全劇美學：${aestheticPrompt.slice(0, 100)}`
    : '';
  return `你是短劇分鏡師。請重新構思以下分鏡 panel，輸出唯一一個 JSON object（唔要 array、唔要任何其他文字）。
當前 panel：鏡頭${panel.scene}，描述「${panel.desc}」，鏡頭語言「${panel.camNote}」，${panel.duration}秒。${aesthetic}
要求：保持場景序號 ${panel.scene} 不變；重寫描述同鏡頭語言；繁體中文；duration 必須係 ${PANEL_DURATION_MIN}–${PANEL_DURATION_MAX} 整數。
格式（僅示格式，唔要抄）：{"scene":${panel.scene},"desc":"重寫後畫面描述","camNote":"重寫後鏡頭語言","duration":7}`;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  panel:           StoryboardPanel;
  idx:             number;
  aestheticPrompt: string;
  editLabel:       string;
  aiRewriteLabel:  string;
  deleteLabel:     string;
  onUpdate:        (idx: number, updated: StoryboardPanel) => void;
  onDelete:        (idx: number) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function S4PanelEditor({
  panel, idx, aestheticPrompt,
  editLabel, aiRewriteLabel, deleteLabel,
  onUpdate, onDelete,
}: Props) {
  // ui mode: 'view' | 'edit' | 'delete'
  const [mode,         setMode]         = useState<'view' | 'edit' | 'delete'>('view');
  const [rewriting,    setRewriting]    = useState(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);

  // edit form state — initialised from prop on each entry into edit mode
  const [draftDesc,     setDraftDesc]     = useState(panel.desc);
  const [draftCamNote,  setDraftCamNote]  = useState(panel.camNote);
  const [draftDuration, setDraftDuration] = useState(panel.duration);

  // ── Enter edit mode: reset draft to current panel values ──────────────────
  function handleEditClick() {
    setDraftDesc(panel.desc);
    setDraftCamNote(panel.camNote);
    setDraftDuration(panel.duration);
    setRewriteError(null);
    setMode('edit');
  }

  // ── Save edited panel (only if at least desc is non-empty) ────────────────
  function handleSave() {
    if (!draftDesc.trim()) return;
    const d = Math.round(draftDuration);
    const clampedDuration = Math.max(PANEL_DURATION_MIN, Math.min(PANEL_DURATION_MAX, d));
    onUpdate(idx, {
      scene:    panel.scene,
      desc:     draftDesc.trim(),
      camNote:  draftCamNote.trim(),
      duration: clampedDuration,
    });
    setMode('view');
  }

  // ── AI rewrite ─────────────────────────────────────────────────────────────
  async function handleAiRewrite() {
    if (rewriting) return;
    setRewriting(true);
    setRewriteError(null);
    try {
      const prompt = buildRewritePrompt(panel, aestheticPrompt);
      const res = await fetch('/api/ai/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: PANEL_REWRITE_MAX_TOKENS }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json<{ text: string }>();
      const parsed = parseRewrittenPanel(data.text ?? '', panel.scene);
      if (!parsed) {
        // Parse failed or invalid — do NOT overwrite original panel
        setRewriteError('AI 改寫失敗，已保留原分鏡');
      } else {
        onUpdate(idx, parsed);
        setRewriteError(null);
      }
    } catch (e) {
      setRewriteError(e instanceof Error ? e.message : 'AI 改寫失敗，已保留原分鏡');
    } finally {
      setRewriting(false);
    }
  }

  // ── Edit mode UI ───────────────────────────────────────────────────────────
  if (mode === 'edit') {
    return (
      <div className="p-3 space-y-2">
        <textarea
          className="w-full text-xs border border-primary/40 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary resize-none"
          rows={3}
          value={draftDesc}
          onChange={e => setDraftDesc(e.target.value)}
          placeholder="畫面描述"
        />
        <input
          className="w-full text-xs border border-line rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
          value={draftCamNote}
          onChange={e => setDraftCamNote(e.target.value)}
          placeholder="鏡頭語言"
        />
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted shrink-0">秒數</label>
          <input
            type="number"
            min={PANEL_DURATION_MIN}
            max={PANEL_DURATION_MAX}
            className="w-16 text-xs border border-line rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
            value={draftDuration}
            onChange={e => setDraftDuration(Number(e.target.value))}
          />
          <span className="text-xs text-muted">({PANEL_DURATION_MIN}–{PANEL_DURATION_MAX})</span>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 text-xs bg-primary text-white px-2.5 py-1 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Check size={11} /> 儲存
          </button>
          <button
            onClick={() => setMode('view')}
            className="flex items-center gap-1 text-xs border border-line text-muted px-2.5 py-1 rounded-lg hover:border-primary transition-colors"
          >
            <X size={11} /> 取消
          </button>
        </div>
      </div>
    );
  }

  // ── Delete confirm UI ──────────────────────────────────────────────────────
  if (mode === 'delete') {
    return (
      <div className="p-3">
        <p className="text-xs text-red-600 mb-2">確定刪除鏡頭 {panel.scene}？</p>
        <div className="flex gap-2">
          <button
            onClick={() => onDelete(idx)}
            className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600 transition-colors"
          >
            確定刪除
          </button>
          <button
            onClick={() => setMode('view')}
            className="text-xs border border-line text-muted px-2.5 py-1 rounded-lg hover:border-primary transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    );
  }

  // ── View mode: action buttons + optional rewrite error ────────────────────
  return (
    <div>
      {rewriteError && (
        <div className="px-3 pb-1 flex items-start gap-1">
          <AlertTriangle size={11} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-600">{rewriteError}</p>
        </div>
      )}
      <div className="flex gap-1 px-3 pb-2 flex-wrap">
        <button
          onClick={handleEditClick}
          className="text-xs text-accent hover:text-accent/80 transition-colors"
        >
          {editLabel}
        </button>
        <span className="text-muted text-xs">·</span>
        <button
          onClick={handleAiRewrite}
          disabled={rewriting}
          className="flex items-center gap-0.5 text-xs text-muted hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {rewriting ? <Loader2 size={10} className="animate-spin" /> : null}
          {aiRewriteLabel}
        </button>
        <span className="text-muted text-xs">·</span>
        <button
          onClick={() => { setRewriteError(null); setMode('delete'); }}
          className="text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          {deleteLabel}
        </button>
      </div>
    </div>
  );
}
