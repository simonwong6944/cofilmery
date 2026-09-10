# CoFilmery Build Log

> 本檔管「每次 build／commit 嘅事實紀錄」。
> 本檔屬純 append:只准喺尾加新記錄,永遠唔准改或刪已有記錄。
> 格式:日期 | commit hash | 改咗乜 | 驗證結果 | preview URL

---

| 日期 | commit | 改動摘要 | 驗證 | preview URL |
|------|--------|----------|------|-------------|
| 2026-08-25 | `22ee110` | S2 角度圖 R2 cache bust、setAsAvatar 寫 characters.img | 0 TS errors | — |
| 2026-08-25 | `d02daf5` | S2 similarity=mid(70%)+ 外觀 5 欄 | 0 TS errors (10.76s) | — |
| 2026-08-25 | `e0df6fc` | S3 外觀 4 欄(ageLook/makeup/accessory/faceMark) | 0 TS errors | — |
| 2026-08-27 | `4b294ec` | S3 分集素材 + snapshot + 全選 | build pass | — |
| 2026-09-01 | `0b3433f` | S1 分類 fallback 'other' 修正 | build pass | — |
| 2026-09-03 | `6eee9de` | S3 story card 持久化(空陣列 bug)修正 | build pass | — |
| 2026-09-08 | `1032c01` | 建立 docs/ SOP-workflow + SOP-modular | docs only | — |
| 2026-09-08 | `7f21377` | S4 AI 分鏡生成：新建 S4StoryboardGen.tsx(198行)，移除 mock panels，接入 /api/ai/text per-episode | build pass (0 TS errors, 16.81s)；wc-l 198≤250；grep: 無 mock/key/log | — |
| 2026-09-08 | `71e6d55` | refactor(s7): 新建 S7Voiceover.tsx(62行)，從 DramaWorkflow.tsx 搬出 S7 stage，移除 useTts import；DramaWorkflow 4042→3984行 | build pass (0 TS errors, 11.58s)；grep: 無殘留定義、無 console.log | — |
| 2026-09-08 | `e709466` | refactor(s8): 新建 S8PlatformEdit.tsx(83行)，從 DramaWorkflow.tsx 搬出 S8 stage；DramaWorkflow 3984→3904行 | build pass (0 TS errors, 10.48s)；grep: 無殘留定義、無 console.log | — |
| 2026-09-08 | `f6b7d8c` | refactor(s9): 新建 S9ReviewPublish.tsx(119行)，從 DramaWorkflow.tsx 搬出 S9 stage，移除 Send icon import；DramaWorkflow 3904→3791行 | build pass (0 TS errors, 11.00s)；grep: 無殘留定義、無 console.log | — |
| 2026-09-08 | `0fbddb8` | refactor(s5): 新建 S5Keyframes.tsx(157行)，從 DramaWorkflow.tsx 搬出 S5 stage（含 AestheticComposer、AestheticOutput、genMode/localAestheticOpen/localAdjustment 三個 local state）；DramaWorkflow 3791→3642行 | build pass (0 TS errors, 10.63s)；grep: 無殘留定義、無 console.log | — |
| 2026-09-08 | `ebc8642` | refactor(plan-overview): 新建 PlanOverview.tsx(121行)，從 DramaWorkflow.tsx 搬出 PlanOverview stage（含 localMaterial/poHydratedRef、D1 persistMaterial）；DramaWorkflow 3642→3525行 | build pass (0 TS errors, 10.41s)；grep: 無殘留定義、無 console.log | — |
| 2026-09-08 | `07b9e0d` | refactor(s0): 新建 S0SeriesSetup.tsx(276行)，從 DramaWorkflow.tsx 搬出 S0 stage（含8個 local state + s0HydratedRef + D1 saveProjectToD1）；移除 DramaWorkflow saveProjectToD1 import；DramaWorkflow 3525→3256行 | build pass (0 TS errors, 11.59s)；grep: 無殘留定義、無 console.log | — |

| 2026-09-08 | `7ab122e` | refactor(lightbox): 新建 ImageLightbox.tsx(33行) 至 src/components/shared/，從 DramaWorkflow.tsx 移除內聯定義，改 import 共用版；S1 兩處 lightboxUrl JSX 用法不變；DramaWorkflow 2798→2769行 | build pass (0 TS errors, 10.96s)；grep: 無殘留定義、無 console.log | — |
| 2026-09-08 | `a3ee0dc` | refactor(aesthetic-lock): 新建 SeriesAestheticLock.tsx(258行) 至 stages/，含 RefImageItem/RefImageSection types、refImages/open/uploadingSection state、upload /api/upload、RefImageSectionUI 內聯子組件、AestheticComposer；合併兩個 useProjectStore 呼叫（無行為改變）；移除 DramaWorkflow AestheticComposer/AestheticOutput import；DramaWorkflow 2769→2516行 | build pass (0 TS errors, 11.37s)；grep: 無殘留定義、無 AestheticComposer/AestheticOutput | — |
| 2026-09-08 | `dc3dd7e` | refactor(s4): 新建 S4Storyboard.tsx(127行)，從 DramaWorkflow.tsx 搬出 S4 stage（含 localAestheticOpen/localAdjustment/selectedEp 三個 local state、AestheticComposer、S4StoryboardGen）；移除 S4StoryboardGen import；DramaWorkflow 3256→3136行 | build pass (0 TS errors, 11.22s)；grep: 無殘留定義、無 console.log | — |
| 2026-09-08 | `6e91385` | refactor(s6): 新建 S6VideoGen.tsx(121行)，從 DramaWorkflow.tsx 搬出 S6 stage（含 selectedEp/gate/completedVideos 三個 local state、buildPrompt、VideoGenPanel）；移除 VideoGenPanel import；DramaWorkflow 3136→3023行 | build pass (0 TS errors, 10.44s)；grep: 無殘留定義、無 console.log | — |
| 2026-09-08 | `12fbabf` | refactor(s3): 新建 S3StoryFramework.tsx(234行)，從 DramaWorkflow.tsx 搬出 S3 stage（含 subStage/outline/storyCards/s3HydratedRef、saveArchitectToD1 兩次 D1 call、S1bOutline/S1cEpisodes/StageProgress）；移除 saveArchitectToD1/S1bOutline/S1cEpisodes/StageProgress/ArchitectSubStage/EpisodeStoryCard/SeriesContext/BookOpen/Star import；DramaWorkflow 3023→2798行 | build pass (0 TS errors, 10.70s)；grep: 無殘留定義；D1 hydrate 邏輯驗證完整 | — |

| 2026-09-09 | `d9c1bf7` | refactor(appearance): 新建 `src/components/shared/appearanceConstants.ts`(82行)，純 TS 模組，exports 7 個共享符號(AppearanceOptions/DEFAULT_APPEARANCE/BEARD_VALUES/buildAppearanceSummary/CHAR_ANGLE_ROLES/CharAngleRole/CHAR_ANGLE_LABELS)；DramaWorkflow 2516→2440行（移除 inline 定義，改 import 共用版） | build pass (0 TS errors) | — |
| 2026-09-09 | `60712b5` | refactor(char-profile-card): 新建 `src/components/shared/CharacterProfileCard.tsx`(1108行)，從 DramaWorkflow 抽出 `CharacterProfileCard` 組件（move-only）；imports 7 符號自 appearanceConstants；DramaWorkflow 2440→1343行 | build pass (0 TS errors, 11.92s)；grep: 無殘留定義 | — |
| 2026-09-09 | `66b0c8a` | feat(s4): 新建 `src/components/shared/S4PanelEditor.tsx`(233行)；修改 `S4StoryboardGen.tsx`(198→211行)；實作 panel 逐項編輯（inline 表單）、刪除（inline 確認）、AI 重寫（POST /api/ai/text，parse 失敗保留原 panel）；全部 local state，無 D1；可配置常數 PANEL_REWRITE_MAX_TOKENS/PANEL_DURATION_MIN/PANEL_DURATION_MAX | build pass (0 TS errors, 10.07s, 2308 modules)；wc-l: S4PanelEditor=233≤250，S4StoryboardGen=211≤250，S4Storyboard=127≤200；grep: 無硬編碼 key/model，無 console.log，無 D1，無 TODO disabled stubs | — |
> 註:上述早期記錄嘅 preview URL 當時未有系統化記低,以「—」標示。往後每條新記錄須填齊 preview URL。
| c0459ec | 2026-09-10 | feat | S4 第三磚：storyboard 持久化至 D1 | 新增 migrations/0012_storyboard_panels.sql、functions/api/storyboard.ts、src/adapters/storyboardAdapter.ts；修改 S4StoryboardGen.tsx（211→234行）；load on mount + episode change，non-fatal save after generate/update/delete |
| fafc059 | 2026-09-10 | feat | S5 第一磚：S5Keyframes.tsx 移除全部 mock，接入 D1 分鏡 | 移除 Unsplash 圖、假資產清單、假一致性 %、CreditIndicator cost=120；新增 useEffect loadStoryboardFromD1、集數選擇器、真 characters 資產完整度、panel 佔位框 + desc/camNote、空狀態提示；build pass (0 TS errors, 10.95s, 2309 modules)；wc-l 186≤200；grep: 無 mock URL、無硬編碼數字、無 console.log |
