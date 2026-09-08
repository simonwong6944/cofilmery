/**
 * S4StoryboardGen — AI-generate storyboard panels from episode story card.
 * Composite module. State is local (no D1 — future brick).
 * Panel edit/delete/rewrite handlers are TODO stubs.
 */
import { useState, useEffect } from 'react';
import { Camera, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import type { EpisodeStoryCard } from '@/adapters/types';

export interface StoryboardPanel {
  scene:    number;
  desc:     string;
  camNote:  string;
  duration: number;
}

interface Props {
  storyCards:      EpisodeStoryCard[];
  selectedEp:      number;
  aestheticPrompt: string;
  epLabel:         string;
  addShotLabel:    string;
  editLabel:       string;
  aiRewriteLabel:  string;
  deleteLabel:     string;
}

function buildPrompt(card: EpisodeStoryCard, aestheticPrompt: string): string {
  const hook = card.hook_i18n['zh-HK'] ?? '';
  const body = card.body_i18n['zh-HK'] ?? '';
  const title = card.title_i18n['zh-HK'] ?? '';
  const aesthetic = aestheticPrompt
    ? `\n全劇美學風格：${aestheticPrompt.slice(0, 100)}`
    : '';

  return `你是短劇分鏡師。請根據以下分集故事卡，生成 3 至 5 個分鏡 panel。

第${card.episodeNumber}集：${title}
故事鉤：${hook}
故事內容：${body.slice(0, 300)}${aesthetic}

要求：
- 輸出純 JSON array，唔要任何其他文字。
- 每個 panel 格式：{"scene":數字,"desc":"畫面描述（20字內）","camNote":"鏡頭語言（如全景、特寫、跟焦）","duration":秒數（整數3–12）}
- desc 同 camNote 必須用繁體中文。
- 場景按故事順序排列。

輸出範例（僅示格式，唔要抄）：
[{"scene":1,"desc":"主角步入街市，環境嘈雜","camNote":"廣角推鏡","duration":6},{"scene":2,"desc":"攤主遞上一碗湯","camNote":"中景，慢推鏡","duration":8}]`;
}

function parsePanels(raw: string): StoryboardPanel[] {
  const cleaned = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('[');
  const end   = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return [];
  const arr = JSON.parse(cleaned.slice(start, end + 1)) as unknown[];
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((p): p is Record<string, unknown> => typeof p === 'object' && p !== null)
    .map((p, i) => ({
      scene:    typeof p.scene    === 'number' ? p.scene    : i + 1,
      desc:     typeof p.desc     === 'string' ? p.desc     : '',
      camNote:  typeof p.camNote  === 'string' ? p.camNote  : '',
      duration: typeof p.duration === 'number' ? p.duration : 6,
    }))
    .filter(p => p.desc.length > 0)
    .slice(0, 5);
}

export function S4StoryboardGen({
  storyCards,
  selectedEp,
  aestheticPrompt,
  epLabel,
  addShotLabel,
  editLabel,
  aiRewriteLabel,
  deleteLabel,
}: Props) {
  const [panels,  setPanels]  = useState<StoryboardPanel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Clear panels when selected episode changes
  useEffect(() => {
    setPanels([]);
    setError(null);
  }, [selectedEp]);

  const card = storyCards.find(c => c.episodeNumber === selectedEp) ?? null;

  const handleGenerate = async () => {
    if (!card || loading) return;
    setLoading(true);
    setError(null);
    setPanels([]);

    try {
      const prompt = buildPrompt(card, aestheticPrompt);
      const res = await fetch('/api/ai/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 800 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json<{ text: string }>();
      const parsed = parsePanels(data.text ?? '');
      if (parsed.length === 0) throw new Error('AI 未能生成有效分鏡，請重試。');
      setPanels(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失敗，請重試。');
    } finally {
      setLoading(false);
    }
  };

  // ── No story card available ──────────────────────────────────────────────
  if (!card) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          {epLabel} 尚無故事卡。請先完成 S3 故事框架，再回來生成分鏡。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Story card context chip */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs font-semibold text-blue-800 mb-0.5">{epLabel}·故事鉤</p>
        <p className="text-xs text-blue-700 leading-relaxed line-clamp-2">
          {card.hook_i18n['zh-HK'] || card.body_i18n['zh-HK'].slice(0, 80)}
        </p>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading
          ? <><Loader2 size={15} className="animate-spin" />生成分鏡中…</>
          : <><Sparkles size={15} />{panels.length > 0 ? '重新生成分鏡' : '生成分鏡'}</>
        }
      </button>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Panel cards */}
      {panels.length > 0 && (
        <>
          <p className="text-xs text-muted">{epLabel} · 共 {panels.length} 個鏡頭</p>
          <div className="flex overflow-x-auto gap-4 pb-4">
            {panels.map(p => (
              <div key={p.scene} className="shrink-0 w-52 bg-card rounded-xl overflow-hidden shadow-card border border-line">
                <div className="h-28 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Camera size={24} className="text-primary/50" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted">鏡頭{p.scene} · {p.duration}秒 · {p.camNote}</p>
                  <p className="text-xs text-muted leading-relaxed mt-1">{p.desc}</p>
                  <div className="flex gap-1 mt-2">
                    {/* TODO: implement edit handler */}
                    <button className="text-xs text-accent opacity-40 cursor-not-allowed" disabled>{editLabel}</button>
                    <span className="text-muted">·</span>
                    {/* TODO: implement AI rewrite handler */}
                    <button className="text-xs text-muted opacity-40 cursor-not-allowed" disabled>{aiRewriteLabel}</button>
                    <span className="text-muted">·</span>
                    {/* TODO: implement delete handler */}
                    <button className="text-xs text-red-400 opacity-40 cursor-not-allowed" disabled>{deleteLabel}</button>
                  </div>
                </div>
              </div>
            ))}
            {/* Add shot placeholder */}
            <div className="shrink-0 w-52 border-2 border-dashed border-line rounded-xl flex items-center justify-center">
              <div className="text-center text-muted">
                <span className="text-3xl block">+</span>
                <span className="text-xs">{addShotLabel}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
