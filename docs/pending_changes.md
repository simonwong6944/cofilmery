# CoFilmery 未決事項 pending_changes

> 本檔記錄:設計矛盾、未拍板事項、未完成整合。
> 格式:編號 | 步驟／範圍 | 問題描述 | 來源引用 | 建議選項。
> 只有產品負責人拍板咗嘅項先可以動手做。
> 本檔屬純 append:項目解決後喺該行尾標「已解決 → 見 commit/決策」,唔刪原文。

---

## #B-provider — 文字／影片模型直連(路線 B)

- 範圍:`functions/api/ai/[[path]].ts`、`src/adapters/openRouterAdapter.ts`
- 問題:現行全部經 OpenRouter。決定改直連官方 API,但延後到 app 主體完成先做。call-site 越遲改,越多地方 hard-code `orFetch` / `AI_MODELS.TEXT_MODEL`,將來改動面越大。
- 來源:memory_vault 決策 #1、#2
- 建議選項:
  - (A) 主體完成後,一次過建 provider registry(host/model/key),`orFetch` 改 `providerFetch`。
  - (B) Seedance 影片改 async task + poll(`/contents/generations/tasks`),video 程式碼目前未完成,做影片功能時一齊搞。
- 狀態:未開始(已決定方向,等時機)。

## #catlabel — catLabel 缺中文標籤

- 範圍:前端 catLabel 對照表
- 問題:`audio`、`other` 兩個 category 未有中文標籤。
- 建議:補上兩個 entry。
- 狀態:待做。

## #similarity-ui — 相似度 UI

- 問題:相似度目前硬編碼 70%(mid),UI 未簡化。
- 建議:確認係咪保留單一 70%,定係要畀用戶選。
- 狀態:待產品負責人拍板。

## #rules-ui — Rules.md UI 規則

- 問題:UI 顏色／字體規則未定義。
- 來源:memory_vault 決策 #4
- 建議:暫緩,先參考 cofilmery.com 現況;正式定義前 Rules.md 相關段標 TODO。
- 狀態:待產品負責人定義。

## #misc — 雜項修正

- 贊助商資源全選、標籤重命名、鬍鬚亂碼(絡腮胡)修正、S0 回歸驗證。
- 狀態:待做。

## #move-vs-slim — 搬遷磚與瘦身磚分開規矩

- 範圍:所有 refactor 磚
- 規矩:搬遷磚（move-only）與瘦身磚（slim-to-SOP-limit）必須分開成獨立 commit，唔准合併。搬遷磚容許暫時超行（行數合規留待瘦身磚處理）。
- 來源:DramaWorkflow 拆分第一批(S7/S8/S9) 2026-09-08
- 狀態:已立規，往後所有 refactor 磚照辦。

## #dramaSplit — DramaWorkflow.tsx 過大，按 stage 逐批拆分

- 範圍:src/pages/creator/DramaWorkflow.tsx
- 問題:原檔 4042 行，遠超 SOP 頁面≤200行上限，需按 stage 逐批拆出獨立組件至 src/pages/creator/stages/。
- 進度:第一批 S7/S8/S9 完成（commits 71e6d55/e709466/f6b7d8c），DramaWorkflow.tsx 縮至 3791 行。待辦：第二批 S4–S6、第三批 S1–S3，最終主殼瘦身至 ≤200 行。
- 進度更新(2026-09-08):第二批 S5/PlanOverview/S0 完成（commits 0fbddb8/ebc8642/07b9e0d），DramaWorkflow.tsx 縮至 3256 行（自原始 4042 行共縮減 786 行）。待辦：第三批 S4/S6/S1/S2/S3，最終主殼瘦身。
- 進度更新(2026-09-08):第三批 S4/S6/S3 完成（commits dc3dd7e/6e91385/12fbabf），DramaWorkflow.tsx 縮至 2798 行（自原始 4042 行共縮減 1244 行）。待辦：第四批 SeriesAestheticLock（含其 refImages 未持久化 bug 待修）+ S1/S2 + 最終主殼瘦身。
- 進度更新(2026-09-08):第四批前段完成（commits 7ab122e/a3ee0dc），抽出 ImageLightbox 至 src/components/shared/ImageLightbox.tsx、搬遷 SeriesAestheticLock 至 src/pages/creator/stages/SeriesAestheticLock.tsx，DramaWorkflow.tsx 縮至 2516 行（自原始 4042 行共縮減 1526 行）。待辦：SeriesAestheticLock refImages 未持久化 bug 修正（獨立磚）+ S1/S2 + 最終主殼瘦身。
- ⚠️ SeriesAestheticLock 未搬：SeriesAestheticLock 仍留在 DramaWorkflow.tsx，其 refImages（參考圖）上傳後只存於 component local state，未寫入 D1 或 R2，重載後會遺失。此 bug 需喺第四批搬遷時一併修正（搬遷 + bug fix 分兩個獨立 commit）。 → 已搬遷完成（a3ee0dc），bug 修正待獨立磚。
- ⚠️ SeriesAestheticLock refImages 未持久化 bug 待修（獨立磚）：refImages（參考圖）上傳後只存於 component local state，未寫入 D1 或 R2，重載後會遺失。需獨立磚修正，不得與其他搬遷磚合併。
- 進度更新(2026-09-09):第四批中段完成（commits d9c1bf7/60712b5），新建 appearanceConstants.ts(82行)純 TS 共享模組；抽出 CharacterProfileCard.tsx(1108行) 至 src/components/shared/，DramaWorkflow.tsx 縮至 1343 行（自原始 4042 行共縮減 2699 行）。待辦：CharacterProfileCard 瘦身磚（目前 1108 行，超 250 行上限）+ S1/S2 + 主殼瘦身。
- 狀態:進行中（第一批+第二批+第三批+第四批前段+第四批中段完成，CharacterProfileCard 瘦身磚 + refImages bug 修正磚 + S1/S2 + 主殼瘦身待啟動）。

## #s4-module-location — S4StoryboardGen / S4PanelEditor 分層待議

- 範圍:`src/components/shared/S4StoryboardGen.tsx`、`src/components/shared/S4PanelEditor.tsx`
- 問題:兩個模組屬 S4 stage 專屬複合模組，按 SOP-modular 三層架構應置於 stage 層或專屬子目錄，暫因 S4StoryboardGen 歷史位置（`src/components/shared/`）而跟隨放置於此。
- 建議:待 DramaWorkflow 拆分接近完成後，獨立一磚將 S4-specific 模組歸位至合適目錄（如 `src/pages/creator/stages/s4/`）。
- 來源:2026-09-09 S4 第二磚方案修正一
- 狀態:待議（低優先，不阻礙當前功能開發）。
## #s4-d1-migration — S4 第三磚：storyboard_panels D1 migration 部署提示

- 範圍:`migrations/0012_storyboard_panels.sql`、Cloudflare D1 production database
- 說明:0012 migration 已入 repo，但 staging D1 及 production D1 都需要手動 apply：
  - Staging：`npx wrangler d1 migrations apply webapp-staging --env staging`（或對應 staging D1 名）
  - Production：`npx wrangler d1 migrations apply webapp-production`
  - 本地 dev：`npx wrangler d1 migrations apply webapp-production --local`
  - 若 `storyboard_panels` table 未 apply，save 會靜默失敗（non-fatal），load 返回空陣列，唔影響 UI。
- 來源:2026-09-10 S4 第三磚(c0459ec)
- 狀態:待 D1 apply（staging + production）。
