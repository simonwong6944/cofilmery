import { useState, useRef, useEffect } from 'react';
import {
  S1bOutline, S1cEpisodes,
  StageProgress, type ArchitectSubStage,
} from '@/components/shared/StoryArchitect';
import type { EpisodeStoryCard, SeriesContext } from '@/adapters/types';
import { useLocaleStore } from '@/store/localeStore';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/i18n';
import { saveArchitectToD1 } from '@/adapters';
import { BookOpen, Users, AlertTriangle, Check, Star, Film, ChevronRight } from 'lucide-react';

// ─────────────────────────────────────────
// S3: 故事框架（新版）
// 整合：3a 選題方向 → 3b 全劇大綱 → 3c 逐集故事卡
// 讀取 S2 characters 作為生成上下文
// 每階段有 Accept / Regenerate / Edit 三動作
// ─────────────────────────────────────────
export function S3StoryFramework({ onNext }: { onNext: () => void }) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;
  const sa = tr.storyArchitect;

  // 從 store 讀取 S2 角色資料（作為生成上下文）及 S1 贊助商已選資產
  // 修正五六：移除 setSelectedTopic（不再有選題子步驟）
  const {
    characters: storedCharacters,
    selectedSponsorAssets: storedSponsorAssets,
    storyMaterial,
    setOutline: storeSetOutline,
    setStoryCards: storeSetStoryCards,
    setCoCreated,
    isCoCreated, coCreateNote,
    projectId: projectId3, projectTitle, outline: storedOutline3,
    storyCards: storedStoryCards3,
  } = useProjectStore();
  const { user: authUser3 } = useAuthStore();

  // 系列上下文：優先從 projectStore 讀取（S0 已設定），否則使用預設值
  const storedCtx = useProjectStore(s => s.context);
  const context: SeriesContext = storedCtx ?? {
    seriesTitle: projectTitle || '新劇集',
    genre: 'drama',
    tone: 'warm',
    coreNeed: 'seen',
    episodeCount: 30,
    durationLabel: '60秒',
    mode: 'drama',
  };

  // 子階段狀態（修正五六：直接由 outline 開始，不再有 topic / characters 子步驟）
  const [subStage, setSubStage] = useState<ArchitectSubStage>('outline');
  const [outline, setOutline] = useState<{ episodeNumber: number; title_i18n: { 'zh-HK': string; en: string; 'zh-CN': string }; oneLine_i18n: { 'zh-HK': string; en: string; 'zh-CN': string } }[]>([]);
  const [storyCards, setStoryCards] = useState<EpisodeStoryCard[]>([]);

  // ── S3 重入還原：掛載回填 subStage/local outline/local storyCards ──
  // 因 loadProject 為 async，store 值可能喺 mount 之後先到，故用 useEffect + dep
  // （不可只靠 useState 初始值）。ref guard 確保只 hydrate 一次，唔會蓋使用者
  // 之後喺 S1bOutline/S1cEpisodes 內做嘅編輯。
  const s3HydratedRef = useRef(false);
  useEffect(() => {
    if (s3HydratedRef.current) return; // 已回填過，不再覆蓋
    if (!(storedOutline3?.length > 0) && !(storedStoryCards3?.length > 0)) return; // 兩者皆空，等下次 dep 觸發（或維持顯示生成按鈕）
    s3HydratedRef.current = true;
    if (storedOutline3?.length > 0) {
      setOutline(storedOutline3);
      setSubStage('episodes'); // 已有大綱 → 直接去 3b，唔使重新生成
    }
    if (storedStoryCards3?.length > 0) {
      setStoryCards(storedStoryCards3);
    }
  }, [storedOutline3, storedStoryCards3]);

  return (
    <div className="max-w-2xl space-y-4">
      {/* 標題 */}
      <div className="mb-2">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-semibold mb-3">
          <BookOpen size={12} /> S3 故事框架
        </div>
        <h2 className="text-2xl font-bold text-primary">{tr.creator.drama.s3.title}</h2>
        <p className="text-muted text-sm mt-1">{tr.creator.drama.s3.subtitle}</p>
      </div>

      {/* 角色上下文提示（若 S2 有角色） */}
      {storedCharacters.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
          <Users size={16} className="text-green-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green-800">故事將圍繞以下主角展開</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {storedCharacters.slice(0, 4).map(c => (
                <span key={c.id} className="inline-flex items-center gap-1 bg-white text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-xs">
                  {c.name_i18n['zh-HK']}
                </span>
              ))}
              {storedCharacters.length > 4 && (
                <span className="text-xs text-green-600">+{storedCharacters.length - 4}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 無角色提示 */}
      {storedCharacters.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700">尚未定義角色。可以先生成故事框架，之後返回 S2 補充主角。</p>
        </div>
      )}

      {/* 進度列 */}
      <StageProgress current={subStage} />

      {/* 3b 全劇大綱（修正五六：直接由大綱開始；storyMaterial 作為生成依據） */}
      {subStage === 'outline' && (
        <S1bOutline
          context={{ ...context, humanInput: storyMaterial }}
          selectedTopic={{ id: 'creator-input', title_i18n: { 'zh-HK': '創作者故事原材料', en: 'Creator Story Material', 'zh-CN': '创作者故事原材料' }, logline_i18n: { 'zh-HK': storyMaterial.slice(0, 80), en: storyMaterial.slice(0, 80), 'zh-CN': storyMaterial.slice(0, 80) }, hook_i18n: { 'zh-HK': '', en: '', 'zh-CN': '' } }}
          initialOutline={outline}
          onAccept={(ol, outlineCoCreateNote) => {
            setOutline(ol);
            storeSetOutline(ol);
            if (outlineCoCreateNote && outlineCoCreateNote.trim()) {
              setCoCreated(true, outlineCoCreateNote.trim());
            }
            // A1 持久化：將 30 集 outline 寫入 D1 projects.series_outline（non-blocking）
            // 改用 saveArchitectToD1 — 只打 /api/ai/project/save，不碰 story_material/series_context
            // 注意：唔傳 characters — characters 由 /api/characters 獨立管理，saveArchitectToD1 唔應覆蓋
            saveArchitectToD1({
              projectId: projectId3,
              userId: authUser3?.id ?? 'demo-user',
              title: projectTitle || '未命名劇集',
              outline: ol,
              storyCards: [],
            }).catch(e => console.warn('[S3 outline onAccept] D1 save failed:', e));
            setSubStage('episodes');
          }}
        />
      )}

      {/* 3c 逐集故事卡 */}
      {subStage === 'episodes' && (
        <S1cEpisodes
          context={context}
          outline={outline}
          characters={storedCharacters}        // ← S2 角色（作為故事生成上下文）
          sponsorAssets={storedSponsorAssets}  // ← S1 贊助商已選（作為元素選擇器資料源）
          initialCards={storyCards}
          onAccept={(cards) => {
            // Guard: S1cEpisodes already prevents calling onAccept with empty array,
            // but add a second-layer check here so DramaWorkflow never overwrites D1
            // with storyCards: [] even if something upstream changes.
            if (!cards || cards.length === 0) {
              console.warn('[S3 onAccept] received empty cards array — skipping D1 write to avoid data loss');
              setSubStage('done');
              return;
            }
            console.log(`[S3 onAccept] persisting ${cards.length} story card(s) to D1`);
            setStoryCards(cards);
            storeSetStoryCards(cards);
            // 非同步存 D1（non-blocking，失敗只 warn 不阻塞 S3 UI）
            // 改用 saveArchitectToD1 — 只打 /api/ai/project/save，不碰 story_material/series_context
            // 注意：唔傳 characters — characters 由 /api/characters 獨立管理，saveArchitectToD1 唔應覆蓋
            saveArchitectToD1({
              projectId: projectId3,
              userId: authUser3?.id ?? 'demo-user',
              title: projectTitle || '未命名劇集',
              storyCards: cards,
              outline: storedOutline3,
            }).catch(e => console.warn('[S3 onAccept] D1 save failed:', e));
            setSubStage('done');
          }}
        />
      )}

      {/* 完成 → 前往下一步 */}
      {subStage === 'done' && (
        <div className="bg-card rounded-xl border border-line shadow-card p-6 text-center">
          <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-accent" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">{tr.storyArchitect.stage.done ?? '故事框架完成！'}</h3>
          <p className="text-muted text-sm mb-4">{tr.storyArchitect.ep?.doneDesc ?? '全劇大綱及分集故事卡已儲存，可隨時返回修改。'}</p>

          {/* Co-create badge */}
          {isCoCreated && (
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {sa.coCreate.badge}
              {coCreateNote && <span className="text-xs font-normal text-amber-600 ml-1">· {coCreateNote.slice(0, 20)}{coCreateNote.length > 20 ? '…' : ''}</span>}
            </div>
          )}

          {/* 摘要 */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {storedCharacters.slice(0, 3).map(c => (
              <span key={c.id} className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-xs">
                <Users size={10} /> {c.name_i18n['zh-HK']}
              </span>
            ))}
            {storyCards.length > 0 && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                <Film size={10} /> {storyCards.length} 集故事卡
              </span>
            )}
          </div>

          <button
            onClick={onNext}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors mx-auto"
          >
            <ChevronRight size={18} /> 前往分鏡
          </button>
        </div>
      )}

      {/* 跳過按鈕 */}
      {subStage !== 'done' && (
        <div className="text-center">
          <button
            onClick={onNext}
            className="text-xs text-muted hover:text-primary transition-colors underline underline-offset-2"
          >
            跳過故事框架，直接前往分鏡
          </button>
        </div>
      )}
    </div>
  );
}
