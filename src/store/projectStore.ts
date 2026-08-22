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
}

const INITIAL: Omit<ProjectState,
  'setProjectId' | 'setStoryMaterial' | 'setContext' | 'setSelectedTopic' | 'setOutline' |
  'setCharacters' | 'setStoryCards' | 'setAestheticLock' | 'setSelectedSponsorAssets' |
  'setCoCreated' | 'setCurrentEpisode' | 'getStoryCard' | 'reset'
> = {
  projectId: 'demo-project',
  projectTitle: '街市情緣',
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
