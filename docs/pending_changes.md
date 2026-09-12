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

## #image-model-registry — 圖像生成 model 字串硬編碼違反 Rules §4

- 範圍:`functions/api/ai/[[path]].ts`
- 問題:`'bytedance-seed/seedream-4.5'` 字串硬編碼於 `/api/ai/image-gen` 及 `/api/ai/character-angle` 兩個路由，未收錄入 `AI_MODELS` registry（目前只有 `TEXT_MODEL`、`VIDEO_MODEL`、`TTS_MODEL`），違反 Rules.md §4「所有可配置參數禁止硬編碼，必須集中在 config/env」。
- 建議:於 S5 第二磚（per-panel keyframe 生成）實作時，同步將圖像 model 加入 `AI_MODELS.IMAGE_MODEL = 'bytedance-seed/seedream-4.5'`，並將兩個路由改讀 `AI_MODELS.IMAGE_MODEL`。
- 來源:2026-09-10 S5 第一磚調查（fafc059）
- 狀態:已解決 → 見 commit 8ecb05d（S5 第二磚）：AI_MODELS.IMAGE_MODEL 加入 registry，image-gen + character-angle 兩處 hardcode 已改用 AI_MODELS.IMAGE_MODEL。

## #s5-keyframes-migration — S5 第二磚：keyframes D1 migration 部署提示

- 範圍:`migrations/0013_keyframes.sql`、Cloudflare D1 production database
- 說明:0013 migration 已入 repo，但 staging D1 及 production D1 需要手動 apply：
  - Staging：`npx wrangler d1 migrations apply webapp-staging --env staging`（或對應 staging D1 名）
  - Production：`npx wrangler d1 migrations apply webapp-production`
  - 本地 dev：`npx wrangler d1 migrations apply webapp-production --local`
  - 若 `keyframes` table 未 apply，就箕 save 會靜默失敗（non-fatal），load 返回空陣列，不影響 UI。
- 來源:2026-09-10 S5 第二磚（８ecb05d）
- 狀態:待 D1 apply（staging + production）。

## #s5-keyframes-unique — S5 第三磚：keyframes UNIQUE INDEX migration 部署提示

- 範圍:`migrations/0014_keyframes_unique.sql`、Cloudflare D1 `cofilmery-staging`（及 production）
- 說明:0014 migration 已入 repo（commit 77d55a1），需手動 apply 至 D1：
  - 本地 dev：`npx wrangler d1 migrations apply cofilmery-staging --local`
  - Staging：`npx wrangler d1 migrations apply cofilmery-staging`
  - Migration 會：(1) 清走現有重複 row（每個 project_id/episode/panel_scene 保留最新 rowid），(2) 建立 UNIQUE INDEX `idx_keyframes_unique_panel`。
  - 若未 apply，/api/keyframes POST 的 `ON CONFLICT DO UPDATE` 子句會報錯（UNIQUE constraint 不存在時 SQLite 不認 ON CONFLICT 語法）。
  - 先 apply 0013（keyframes table），再 apply 0014（UNIQUE INDEX）。
- 來源:2026-09-11 S5 第三磚（77d55a1）
- 狀態:待 D1 apply（cofilmery-staging + production）。

## #ai-router-oversized — `functions/api/ai/[[path]].ts` 體積過大，待拆

- 範圍：`functions/api/ai/[[path]].ts`（目前 ~1050 行）
- 說明：S6 磚 1 只做最小侵入式修改（加 VIDEO_COST_USD_FALLBACK 常數 + GET handler 補 R2 歸檔 + recordCreditDebit），未做重構。該檔已超出 SOP-modular module ≤250 行上限，需在獨立後磚（磚 N）將各路由拆分為獨立 functions/api/ai/*.ts 並共用 orFetch helper。
- 目前影響：build/runtime 正常，但可維護性差，每次功能修改有衝突風險。
- 待做磚：新磚「AI router 拆分」，範圍：video.ts / tts.ts / image.ts / text.ts 各自 ≤250 行，共用 lib/orFetch.ts。
- 來源：2026-09-11 S6 第一磚（eaabf1f）
- 狀態：待開新磚處理，目前暫不影響功能。

## #episode-id-format-mismatch — gen_jobs.episode_id 格式與 S6VideoGen.tsx 不一致

- 範圍：`functions/api/ai/[[path]].ts`（POST /api/ai/video handler）+ `src/pages/creator/stages/S6VideoGen.tsx`
- 說明：gen_jobs 表存嘅 `episode_id` 係真實 D1 episode UUID（例如 `76a58278-...-ep1`），而 S6VideoGen.tsx 傳入 episodeId 係人造 key `${projectId}-ep${epNum}`（例如 `76a58278-...-ep1` 湊巧格式近似，但 POST video handler 存嘅係前端傳入的原始值）。調查時發現 3 條已完成舊 job 的 episode_id 格式為 `76a58278-7865-4971-820f-a3fbee13c335-ep1`，與 episodes.ts PATCH endpoint 的 parse 邏輯（`${projectId}-ep${epNum}`）有機會衝突。
- 回填策略：S6 磚 1b 的 backfill endpoint 使用 gen_jobs 表存的原始 episode_id，直接 `UPDATE episodes SET video_url=? WHERE id=?`（uuid match），唔用 episodes.ts PATCH 的 parse 邏輯，規避格式問題。
- 待修：VIDEO POST handler 應統一用 `${projectId}-ep${epNum}` 人造 key format，並更新 episodes.ts PATCH 邏輯相應地 parse；或者改成直接用真實 episode UUID（兩個選擇留返下一磚決策）。
- 來源：2026-09-11 S6 磚 1b 調查（1624999）
- 狀態：已記錄，待獨立磚處理。

## #s6-brick1c-r2-verify — R2 archive 假成功 bug（已解決）

- 範圍：`functions/api/ai/[[path]].ts`，`archiveMp4ToR2()` helper
- 問題：(1) `mp4Buffer.byteLength` 未 check，0-byte body 仍被 put 到 R2；(2) `r2.put()` 後無 verify，靜默假成功；(3) 用 caller 傳入的 URL（可能已過期），導致 CDN 返回 empty body。
- 真兇判定：signed URL 短效過期 → fetch 返回 `res.ok=true` 但 body 為空（0 bytes）→ `r2.put(key, emptyBuffer)` R2 靜默接受 → `archiveMp4ToR2` 返回 URL → caller 寫 result_url → 假成功。
- 解決：(a) fresh GET /videos/{jobId} 取最新 URL；(b) byteLength > 0 guard；(c) r2.head() verify；(d) 任一失敗 return ''，result_url 不寫。
- 來源：2026-09-11 S6 磚 1c（d4b708a）
- 狀態：已解決 → 見 commit d4b708a

## #s6-brick2-panel-video-episode — per-panel 影片暫唔寫 episodes.video_url

- 範圍：`src/adapters/videoAdapter.ts`、`functions/api/episodes.ts`、`src/pages/creator/stages/S6VideoGen.tsx`
- 說明：S6 磚 2 episodeId 格式改為 `${pid6}-ep${ep}-p${panelScene}`，parseEpisodeId regex `/^(.+)-ep(\d+)$/` 唔識別 `-p1` suffix，PATCH 返回 400，saveVideoToD1 .catch 靜默吸收。gen_jobs.episode_id 正常寫入，但 episodes.video_url 唔更新。
- 影響：S6 per-panel 影片唔持久化到 episodes 表，只存 gen_jobs。
- 待做磚（拼接磚）：(1) 5 條 per-panel 影片拼接成 episode-level 影片；(2) 拼接完成後 PATCH episodes.video_url；(3) 可考慮同時修 parseEpisodeId 或另建 gen_jobs → episode 映射。
- 來源：2026-09-12 S6 磚 2（22a0fcd）
- 狀態：已知，待拼接磚處理。

---
## ✅ RESOLVED: #s6-brick2b-frame-images-schema
frame_images payload 格式已修正（d0fb683），ZodError 已消除。

---
## #s6-input-references-disabled（磚 2c，826081f）
**狀態**：暫停（intentional）
**原因**：Seedance 真人偵測（`InputImageSensitiveContentDetected.PrivacyInformation`）
- 偵測對象：`content[1]`（`input_references[0]`，即 AI 生成角色頭像）
- 即使係 AI 生成圖亦觸發，submit 即被拒，冇扣錢
**現況**：`S6VideoGen.tsx` line 59 傳 `inputReferences={[]}`，只靠 S5 首幀錨定角色
**charRefs 計算保留**（line 98-100），方便將來恢復
**將來方向**：
- 驗證純首幀生成角色一致性是否足夠
- 可考慮 per-mode 控制（legacy vs drama 分別傳/不傳）
- 或改用非寫實風格角色圖以繞開偵測

---
## #s6-diag-log-removal — [DIAG-S6] 臨時 log 待移除（c8b2b12 加入）

- 範圍：`functions/api/ai/[[path]].ts` lines 363–370
- 說明：`[DIAG-S6] video submit payload` console.log 係磚 2d 調查期間加入（commit c8b2b12），
  用於確認 `frame_images_count` 及 `input_references_count`。
- 保留原因：等待 Hailuo H3 Max 成功出片確認後，才可安全移除
- 待做磚：Hailuo 成功出片後，獨立 commit `chore(s6): remove DIAG-S6 diagnostic log` 移除 lines 363–370
- 來源：2026-09-12 S6 磚 2d（9949b2a）
- 狀態：保留中，待 Hailuo 成功出片後移除。

## #s6-video-model — VIDEO_MODEL 歷史記錄

| 日期 | commit | 舊值 | 新值 | 原因 |
|------|--------|------|------|------|
| 2026-09-12 | 9949b2a | bytedance/seedance-2.0 | minimax/hailuo-3-max | Seedance 寫實人物偵測（InputImageSensitiveContentDetected），DIAG log 確認非 code 問題 |

---
## #s6-video-resolution — VIDEO_RESOLUTION 歷史記錄（附磚 2e）

| 日期 | commit | 舊值 | 新值 | 原因 |
|------|--------|------|------|------|
| 2026-09-12 | 6ad9568 | 720p（硬編）| 768p（AI_MODELS.VIDEO_RESOLUTION）| Hailuo H3 Max 唔支援 720p，只收 768p/480p |

---
## #s6-diag-log-removal（已解決）
- 狀態：**已解決 → 見 commit d29fcaa**（S6 磚 2f）
- [DIAG-S6] console.log 已從 `functions/api/ai/[[path]].ts` 移除

---
## #s6-brick3a-by-episode-endpoint（已完成）
- 狀態：**已完成 → commit d4dc680**（S6 磚 3a）
- `GET /api/ai/video/by-episode/:episodeId` 已加入 `[[path]].ts` line 449（Video poll 前）
- 查 gen_jobs，回傳最新 completed + result_url 非空的 row
- 依賴此 endpoint 的前端 restore 邏輯待磚 3b 實施

## #s6-brick3b-video-restore（待實施）
- 狀態：**待實施**（S6 brick 3b）
- 需改動：`useVideoGen.ts` 加 `initialVideoUrl` 參數；`VideoGenPanel.tsx` 加 `initialVideoUrl` prop；`S6VideoGen.tsx` mount 時對每個 panel 查詢 `/api/ai/video/by-episode/:episodeId` 並設 completedVideos
- 前置條件：S6 磚 3a endpoint 已上線（d4dc680）
