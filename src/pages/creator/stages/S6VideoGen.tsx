import { useState, useEffect } from 'react';
import { VideoGenPanel } from '@/components/shared/VideoGenPanel';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/i18n';
import { Film, ChevronRight, Lock } from 'lucide-react';
import { loadKeyframesFromD1, type KeyframeRecord } from '@/adapters/keyframeAdapter';
import { loadStoryboardFromD1 } from '@/adapters/storyboardAdapter';
import type { StoryboardPanel } from '@/components/shared/S4StoryboardGen';
import type { CharacterCard } from '@/adapters/types';

// ── Helper ────────────────────────────────────────────────────────────────────
function toAbsUrl(rel: string): string {
  return rel.startsWith('http') ? rel : `${location.origin}${rel}`;
}

// ── Per-panel list（抽出降低 S6VideoGen 行數）────────────────────────────────
function S6PanelList({ panels, kfMap, charRefs, durationSec, userId, pid6, selectedEp, completedVideos, onDone }: {
  panels: StoryboardPanel[]; kfMap: Record<number, KeyframeRecord>;
  charRefs: string[]; durationSec: number; userId?: string;
  pid6: string; selectedEp: number; completedVideos: Record<number, string>;
  onDone: (scene: number, url: string) => void;
}) {
  const buildPrompt = (panelDesc: string) =>
    panelDesc ? `分鏡描述：${panelDesc}。粵日常對白，香港老年生活場景，高畫質短劇` : '粵日常對白，香港老年生活場景，高畫質短劇';

  return (
    <div className="space-y-3">
      {panels.map(panel => {
        const kf = kfMap[panel.scene];
        const frameImages = kf?.imageUrl ? [toAbsUrl(kf.imageUrl)] : [];
        const isPanel1 = panel.scene === 1;
        return (
          <div key={panel.scene} className="bg-card rounded-xl border border-line shadow-card overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              {kf?.imageUrl
                ? <img src={toAbsUrl(kf.imageUrl)} alt={`P${panel.scene}`} className="w-14 h-14 rounded-lg object-cover shrink-0 border border-line" />
                : <div className="w-14 h-14 rounded-lg bg-muted/10 border border-line shrink-0 flex items-center justify-center text-xs text-muted">無圖</div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-ink">分鏡 {panel.scene}{completedVideos[panel.scene] ? ' ✓' : ''}</p>
                <p className="text-xs text-muted mt-0.5 line-clamp-2">{panel.desc}</p>
                {panel.camNote && <p className="text-xs text-muted/70 mt-0.5">{panel.camNote}</p>}
              </div>
              {!isPanel1 && (
                <span className="shrink-0 flex items-center gap-1 text-xs text-muted/60 border border-line rounded-lg px-2 py-1">
                  <Lock size={11} /> 驗證後開放
                </span>
              )}
            </div>
            {isPanel1 && (
              <div className="border-t border-line px-4 pb-4 pt-3">
                <VideoGenPanel
                  prompt={buildPrompt(panel.desc)}
                  frameImages={frameImages}
                  // TODO(#s6-input-references-disabled): 暫停傳 input_references，因 Seedance 真人偵測
                  // (InputImageSensitiveContentDetected)；S5 首幀已錨定角色；將來可 per-mode 恢復
                  inputReferences={[]}
                  aspectRatio="9:16"
                  duration={durationSec}
                  resolution="720p"
                  userId={userId}
                  episodeId={`${pid6}-ep${selectedEp}-p${panel.scene}`}
                  onComplete={(url, credits) => { onDone(panel.scene, url); void credits; }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────
// S6: 影片 per-panel 生成（驗證模式：只開放 Panel 1）
// ─────────────────────────────────────────
export function S6VideoGen({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const { context, characters, storyCards, aestheticLock, projectId: pid6, currentEpisode } = useProjectStore();
  const { user: u6 } = useAuthStore();
  void aestheticLock;
  const [selectedEp, setSelectedEp]             = useState(currentEpisode);
  const [gate, setGate]                         = useState<'params' | 'generate'>('params');
  const [completedVideos, setCompletedVideos]   = useState<Record<number, string>>({});
  const [panels, setPanels]                     = useState<StoryboardPanel[]>([]);
  const [kfMap, setKfMap]                       = useState<Record<number, KeyframeRecord>>({});

  const card        = storyCards.find(c => c.episodeNumber === selectedEp);
  const durationSec = Math.min(Number((context?.durationLabel ?? '5').replace(/[^0-9]/g, '')) || 5, 10);
  const episodeNums = storyCards.length > 0 ? storyCards.map(c => c.episodeNumber) : [1, 2, 3];

  // 角色 reference：card.characterIds → characters lookup（fallback slice(0,2)）
  const episodeChars = (card?.characterIds ?? [])
    .map(id => characters.find(c => c.id === id))
    .filter((c): c is CharacterCard => Boolean(c?.img));
  const charRefs = (episodeChars.length > 0 ? episodeChars : characters.slice(0, 2))
    .map(c => toAbsUrl(c.img!)).filter(Boolean);

  // Load panels + keyframes when selectedEp changes
  useEffect(() => {
    if (!pid6 || !selectedEp) return;
    setPanels([]); setKfMap({});
    loadStoryboardFromD1(pid6, selectedEp)
      .then(ps => { if (ps.length > 0) setPanels(ps); })
      .catch(e => console.warn('[S6VideoGen] load panels failed:', e));
    loadKeyframesFromD1(pid6, selectedEp)
      .then(kfs => {
        const m: Record<number, KeyframeRecord> = {};
        kfs.forEach(kf => { m[kf.panelScene] = kf; });
        setKfMap(m);
      })
      .catch(e => console.warn('[S6VideoGen] load keyframes failed:', e));
  }, [pid6, selectedEp]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s6.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s6.subtitle}</p>
      </div>

      {gate === 'params' && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-line p-5 shadow-card">
            <h3 className="font-semibold text-ink text-sm mb-3">選擇生成集數</h3>
            <div className="flex flex-wrap gap-2">
              {episodeNums.slice(0, 12).map(ep => (
                <button key={ep} onClick={() => setSelectedEp(ep)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${selectedEp === ep ? 'border-primary bg-primary text-white' : 'border-line text-muted hover:border-primary'}`}>
                  第{ep}集
                </button>
              ))}
            </div>
          </div>
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
          <button onClick={() => setGate('generate')}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <Film size={16} /> 開始生成第{selectedEp}集
          </button>
        </div>
      )}

      {gate === 'generate' && (
        <div className="space-y-4">
          <button onClick={() => setGate('params')} className="text-sm text-muted hover:text-primary flex items-center gap-1">
            ← 返回選集
          </button>
          {panels.length === 0
            ? <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">尚無分鏡資料，請先在 S4 生成分鏡。</div>
            : <S6PanelList panels={panels} kfMap={kfMap} charRefs={charRefs} durationSec={durationSec}
                userId={u6?.id} pid6={pid6} selectedEp={selectedEp!} completedVideos={completedVideos}
                onDone={(scene, url) => setCompletedVideos(prev => ({ ...prev, [scene]: url }))} />
          }
          {Object.keys(completedVideos).length > 0 && (
            <button onClick={onNext}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <ChevronRight size={18} /> {tr.creator.drama.s6.confirmBtn}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
