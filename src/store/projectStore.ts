/**
 * useProjectStore — 全域 project 狀態
 * Phase 3: 儲存 Story Architect 產出（角色卡、分集故事卡、系列上下文）
 * Phase 4: 加入 aestheticLock（全劇美學鎖），供 S3→S4 過場後全劇繼承
 * 供 ScriptEditor、Storyboard 等下游工具讀取，實現跨組件資料共享
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CharacterCard, EpisodeStoryCard, SeriesContext, TopicOption, SelectedSponsorAsset } from '@/adapters/types';
import type { AestheticOutput } from '@/components/shared/AestheticComposer';

interface ProjectState {
  // ── 基本資訊 ─────────────────────────────────────────────
  projectId: string;
  projectTitle: string;

  // ── 故事原材料（PlanOverview 創作者輸入）────────────────────
  storyMaterial: string;

  // ── Story Architect 產出 ──────────────────────────────────
  context: SeriesContext | null;
  selectedTopic: TopicOption | null;
  outline: { episodeNumber: number; title_i18n: { 'zh-HK': string; en: string; 'zh-CN': string }; oneLine_i18n: { 'zh-HK': string; en: string; 'zh-CN': string } }[];
  characters: CharacterCard[];
  storyCards: EpisodeStoryCard[];

  // ── 全劇美學鎖（S3→S4 之間設定，全劇繼承）────────────────
  aestheticLock: AestheticOutput | null;

  // ── S1 資產庫已選贊助商資產（供 S3 元素選擇器讀取）──────
  selectedSponsorAssets: SelectedSponsorAsset[];

  // ── Co-create 標記 ─────────────────────────────────────────
  isCoCreated: boolean;
  coCreateNote: string;

  // ── 當前編輯集數 ─────────────────────────────────────────
  currentEpisode: number;

  // ── Actions ──────────────────────────────────────────────
  setProjectId: (id: string, title?: string) => void;
  setStoryMaterial: (material: string) => void;
  setContext: (ctx: SeriesContext) => void;
  setSelectedTopic: (topic: TopicOption) => void;
  setOutline: (outline: ProjectState['outline']) => void;
  setCharacters: (chars: CharacterCard[]) => void;
  setStoryCards: (cards: EpisodeStoryCard[]) => void;
  setAestheticLock: (lock: AestheticOutput | null) => void;
  setSelectedSponsorAssets: (assets: SelectedSponsorAsset[]) => void;
  setCoCreated: (flag: boolean, note?: string) => void;
  setCurrentEpisode: (ep: number) => void;
  getStoryCard: (episodeNumber: number) => EpisodeStoryCard | null;
  reset: () => void;
  /** 載入既有 project，填充 store（從 ProjectHub 點選繼續）
   *  接受從 GET /api/projects/:id 取得的完整 row，含 story_material / series_context /
   *  series_outline / characters，以及 episodes 陣列（含 story_card）。
   *  順序：先以 INITIAL 重置，再覆蓋 D1 回傳的值，避免殘留舊 state。
   */
  loadProject: (project: {
    id: string;
    title: string;
    mode?: string;
    description?: string;
    story_material?: string | null;
    series_context?: string | null;
    series_outline?: string | null;
    characters?: string | null;
  }, episodes?: Array<{ episode_number: number; title: string; story_card: string | null }>) => void;
  /** 重置 store 並生成新 projectId（從 ProjectHub 建立新項目後呼叫） */
  startNewProject: () => void;
  /**
   * 共用入口：fetch GET /api/projects/:id → loadProject（含 story_material / series_context）。
   * 所有「繼續編輯」入口（Dashboard / Works / 未來新入口）皆呼叫此 action，確保 D1 資料完整還原。
   * @returns true 表示成功載入，false 表示網路錯誤或 project 不存在（呼叫端自行 fallback）
   */
  openProject: (id: string) => Promise<boolean>;
}

const INITIAL: Omit<ProjectState,
  'setProjectId' | 'setStoryMaterial' | 'setContext' | 'setSelectedTopic' | 'setOutline' |
  'setCharacters' | 'setStoryCards' | 'setAestheticLock' | 'setSelectedSponsorAssets' |
  'setCoCreated' | 'setCurrentEpisode' | 'getStoryCard' | 'reset' |
  'loadProject' | 'startNewProject'
> = {
  projectId: '',  // 空字串 = 未選項目，workflow 頁面應 redirect 去 ProjectHub
  projectTitle: '',
  storyMaterial: '',
  context: null,
  selectedTopic: null,
  outline: [],
  characters: [],
  storyCards: [],
  aestheticLock: null,
  selectedSponsorAssets: [],
  isCoCreated: false,
  coCreateNote: '',
  currentEpisode: 1,
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      setProjectId: (id, title) => set({
        projectId: id,
        ...(title ? { projectTitle: title } : {}),
      }),

      setStoryMaterial: (material) => set({ storyMaterial: material }),

      setContext: (ctx) => set({ context: ctx }),

      setSelectedTopic: (topic) => set({ selectedTopic: topic }),

      setOutline: (outline) => set({ outline }),

      setCharacters: (chars) => set({ characters: chars }),

      setStoryCards: (cards) => set({ storyCards: cards }),

      setAestheticLock: (lock) => set({ aestheticLock: lock }),

      setSelectedSponsorAssets: (assets) => set({ selectedSponsorAssets: assets }),

      setCoCreated: (flag, note) => set({
        isCoCreated: flag,
        ...(note !== undefined ? { coCreateNote: note } : {}),
      }),

      setCurrentEpisode: (ep) => set({ currentEpisode: ep }),

      getStoryCard: (episodeNumber) => {
        const { storyCards } = get();
        return storyCards.find(c => c.episodeNumber === episodeNumber) ?? null;
      },

      reset: () => set({ ...INITIAL }),

      loadProject: (project, episodes) => {
        // Parse series_context JSON back to SeriesContext
        let parsedContext: SeriesContext | null = null;
        if (project.series_context) {
          try { parsedContext = JSON.parse(project.series_context) as SeriesContext; }
          catch { /* 格式損壞則維持 null */ }
        }

        // Parse series_outline JSON back to outline array
        type OutlineItem = { episodeNumber: number; title_i18n: { 'zh-HK': string; en: string; 'zh-CN': string }; oneLine_i18n: { 'zh-HK': string; en: string; 'zh-CN': string } };
        let parsedOutline: OutlineItem[] = [];
        if (project.series_outline) {
          try { parsedOutline = JSON.parse(project.series_outline) as OutlineItem[]; }
          catch { /* 格式損壞則維持空陣列 */ }
        }

        // Parse characters JSON
        let parsedCharacters: CharacterCard[] = [];
        if (project.characters) {
          try { parsedCharacters = JSON.parse(project.characters) as CharacterCard[]; }
          catch { /* ignore */ }
        }

        // Parse episode story_cards
        const parsedStoryCards: EpisodeStoryCard[] = [];
        if (episodes && episodes.length > 0) {
          for (const ep of episodes) {
            if (ep.story_card) {
              try {
                parsedStoryCards.push(JSON.parse(ep.story_card) as EpisodeStoryCard);
              } catch { /* skip malformed card */ }
            }
          }
        }

        set({
          ...INITIAL,
          projectId:     project.id,
          projectTitle:  project.title,
          storyMaterial: project.story_material ?? '',
          context:       parsedContext,
          outline:       parsedOutline,
          characters:    parsedCharacters,
          storyCards:    parsedStoryCards,
        });
      },

      startNewProject: () => set({
        ...INITIAL,
        projectId: crypto.randomUUID(),
      }),

      openProject: async (id: string): Promise<boolean> => {
        try {
          const res  = await fetch(`/api/projects/${encodeURIComponent(id)}`);
          const data = await res.json() as {
            ok: boolean;
            project?: {
              id: string; title: string; mode?: string; description?: string;
              story_material?: string | null; series_context?: string | null;
              series_outline?: string | null; characters?: string | null;
            };
            episodes?: Array<{ episode_number: number; title: string; story_card: string | null }>;
          };
          if (data.ok && data.project) {
            get().loadProject(data.project, data.episodes);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'cofilmery-project',
      partialize: (state) => ({
        projectId: state.projectId,
        projectTitle: state.projectTitle,
        storyMaterial: state.storyMaterial,
        context: state.context,
        selectedTopic: state.selectedTopic,
        outline: state.outline,
        characters: state.characters,
        storyCards: state.storyCards,
        aestheticLock: state.aestheticLock,
        selectedSponsorAssets: state.selectedSponsorAssets,
        isCoCreated: state.isCoCreated,
        coCreateNote: state.coCreateNote,
        currentEpisode: state.currentEpisode,
      }),
    }
  )
);
