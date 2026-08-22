/**
 * useProjectStore — 全域 project 狀態
 * Phase 3: 儲存 Story Architect 產出（角色卡、分集故事卡、系列上下文）
 * 供 ScriptEditor、Storyboard 等下游工具讀取，實現跨組件資料共享
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CharacterCard, EpisodeStoryCard, SeriesContext, TopicOption } from '@/adapters/types';

interface ProjectState {
  // ── 基本資訊 ─────────────────────────────────────────────
  projectId: string;
  projectTitle: string;

  // ── Story Architect 產出 ──────────────────────────────────
  context: SeriesContext | null;
  selectedTopic: TopicOption | null;
  outline: { episodeNumber: number; title_i18n: { 'zh-HK': string; en: string; 'zh-CN': string }; oneLine_i18n: { 'zh-HK': string; en: string; 'zh-CN': string } }[];
  characters: CharacterCard[];
  storyCards: EpisodeStoryCard[];

  // ── Co-create 標記 ─────────────────────────────────────────
  isCoCreated: boolean;       // 創作者提供過 humanInput
  coCreateNote: string;       // 共創備注（從 S1bOutline coCreateNote 取得）

  // ── 當前編輯集數 ─────────────────────────────────────────
  currentEpisode: number;     // 當前編輯的集數（1-based）

  // ── Actions ──────────────────────────────────────────────
  setProjectId: (id: string, title?: string) => void;
  setContext: (ctx: SeriesContext) => void;
  setSelectedTopic: (topic: TopicOption) => void;
  setOutline: (outline: ProjectState['outline']) => void;
  setCharacters: (chars: CharacterCard[]) => void;
  setStoryCards: (cards: EpisodeStoryCard[]) => void;
  setCoCreated: (flag: boolean, note?: string) => void;
  setCurrentEpisode: (ep: number) => void;
  getStoryCard: (episodeNumber: number) => EpisodeStoryCard | null;
  reset: () => void;
}

const INITIAL: Omit<ProjectState,
  'setProjectId' | 'setContext' | 'setSelectedTopic' | 'setOutline' |
  'setCharacters' | 'setStoryCards' | 'setCoCreated' | 'setCurrentEpisode' |
  'getStoryCard' | 'reset'
> = {
  projectId: 'demo-project',
  projectTitle: '街市情緣',
  context: null,
  selectedTopic: null,
  outline: [],
  characters: [],
  storyCards: [],
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

      setContext: (ctx) => set({ context: ctx }),

      setSelectedTopic: (topic) => set({ selectedTopic: topic }),

      setOutline: (outline) => set({ outline }),

      setCharacters: (chars) => set({ characters: chars }),

      setStoryCards: (cards) => set({ storyCards: cards }),

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
      // 只持久化必要欄位，敏感 API 資料不持久化
      partialize: (state) => ({
        projectId: state.projectId,
        projectTitle: state.projectTitle,
        context: state.context,
        selectedTopic: state.selectedTopic,
        outline: state.outline,
        characters: state.characters,
        storyCards: state.storyCards,
        isCoCreated: state.isCoCreated,
        coCreateNote: state.coCreateNote,
        currentEpisode: state.currentEpisode,
      }),
    }
  )
);
