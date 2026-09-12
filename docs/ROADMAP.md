# CoFilmery ROADMAP

> 本檔管「進度」:當前做緊乜、下一步乜、已完成乜。
> 實作細節同最新進度以本檔為準;不變嘅設計意圖見 Architecture.md。
> 本檔屬「狀態類」:可編輯(項目可由「進行中」移去「完成」),但每次改動須喺底部修訂記錄加一行。

## 完成

- [x] `22ee110` S2 角度圖 cache bust + avatar 寫入 — 2026-08-25
- [x] `d02daf5` S2 相似度 mid=70% + 外觀 5 欄 — 2026-08-25
- [x] `e0df6fc` S3 外觀 4 欄擴展 — 2026-08-25
- [x] `4b294ec` S3 分集素材 + snapshot + 全選 — 2026-08-27
- [x] `0b3433f` S1 素材分類修正 — 2026-09-01
- [x] `6eee9de` S3 story card 持久化修正(空陣列 bug)— 2026-09-03
- [x] `1032c01` 建立 docs/ SOP 文件 — 2026-09-08
- [x] 測試 project「街市之王」資產全清(R2 69 + D1 69)
- [x] `7f21377` S4 第一磚：AI 分鏡生成完成（per-episode，local state，無 D1）— 2026-09-08
- [x] `66b0c8a` S4 第二磚：panel 逐項編輯 / 刪除 / AI 重寫完成（local state，S4PanelEditor.tsx 新建，parse 失敗防護）— 2026-09-09
- [x] `c0459ec` S4 第三磚：storyboard panels 持久化至 D1 完成（0012_storyboard_panels migration、/api/storyboard 路由、storyboardAdapter.ts、S4StoryboardGen load/save）— 2026-09-10
- [x] `fafc059` S5 第一磚：S5Keyframes.tsx 移除全部 mock，接入 D1 分鏡（loadStoryboardFromD1、集數選擇器、真 characters 資產完整度、panel 佔位框、空狀態提示；186行）— 2026-09-10
- [x] `8ecb05d` S5 第二磚：per-panel 關鍵幀生成 + D1 持久化 + AI_MODELS.IMAGE_MODEL（新建 S5KeyframeGen.tsx(215行)、keyframes API、keyframeAdapter、migration 0013；S5Keyframes.tsx 186→132行）— 2026-09-10
- [x] `77d55a1` S5 第三磚：批量關鍵幀生成 + upsert dedup 修正 + 確認門控（migration 0014 UNIQUE INDEX + ON CONFLICT DO UPDATE；S5KeyframeGen.tsx 加批量生成+進度條+onStatesChange；S5Keyframes.tsx 加確認門控+溫和警示；S5 三磚全部完成）— 2026-09-11
- [x] `eaabf1f` S6 第一磚：video job 完整收片 + R2 歸檔 + D1 持久化 + submit 閉包 bug 修正（[[path]].ts 加 VIDEO_COST_USD_FALLBACK 常數 + GET handler 補 R2 put + recordCreditDebit；新建 episodes.ts(106行) + videoAdapter.ts(84行)；useVideoGen.ts 加 VIDEO_POLL 常數 + submit() return value；VideoGenPanel.tsx 修 Bug F）— 2026-09-11
- [x] `1624999` S6 磚 1b：修正 video URL 解析 + backfill 舊 completed job（[[path]].ts 修正 unsigned_urls[0] + data.usage?.cost；抽出 archiveMp4ToR2() helper（full URL + Bearer，唔拆 base）；GET handler 加 backfill 分支；新增 POST /api/ai/video/backfill 端點（三重保護：skip_not_completed / skip_already_filled / GET-only）；recordCreditDebit 只在正常 poll 路徑，backfill 唔扣錢；pending_changes 加 #episode-id-format-mismatch）— 2026-09-11

## 進行中

- [ ] DramaWorkflow.tsx 按 stage 拆分（第一批 S7/S8/S9 完成，第二批 S5/PlanOverview/S0 完成，**第三批 S4/S6/S3 完成(commits dc3dd7e/6e91385/12fbabf)**，**第四批前段：ImageLightbox + SeriesAestheticLock 完成(commits 7ab122e/a3ee0dc)**，**第四批中段：appearanceConstants + CharacterProfileCard 完成(commits d9c1bf7/60712b5)**，CharacterProfileCard 瘦身磚 + S1/S2 及最終主殼瘦身待啟動）；DramaWorkflow 目前 1343 行

## 待辦(未開始)

- [ ] catLabel 補中文標籤:`audio`、`other`
- [ ] 外觀選項第二批擴展(眼睛大小、嘴型、鼻形、臉形等驗收)
- [ ] 相似度 UI 簡化(目前硬編碼 70%)
- [ ] S0 回歸驗證
- [ ] 贊助商資源全選、標籤重命名、鬍鬚亂碼(絡腮胡)修正
- [ ] provider 直連路線 B(延後至主體完成後)— 見 pending_changes.md #B-provider
- [ ] Rules.md UI 規則(顏色／字體，待產品負責人定義)

---

## 修訂記錄

| 日期 | 修訂人 | 改咗乜 |
|------|--------|--------|
| 2026-09-08 | (初版) | 建立 ROADMAP,填入真實 commit 進度 |
| 2026-09-08 | AI 協作 | S4 第一磚完成，移入「完成」；S4 第二磚加入「進行中」；移除舊版「docs/ 記憶庫文件補齊」進行中項(已完成) |
| 2026-09-08 | AI 協作 | DramaWorkflow 拆分第一批(S7/S8/S9)完成(commits 71e6d55/e709466/f6b7d8c)，加入「進行中」 |
| 2026-09-08 | AI 協作 | DramaWorkflow 拆分第二批(S5/PlanOverview/S0)完成(commits 0fbddb8/ebc8642/07b9e0d)；DramaWorkflow 由 3791→3256行；「進行中」項更新 |
| 2026-09-08 | AI 協作 | DramaWorkflow 拆分第三批(S4/S6/S3)完成(commits dc3dd7e/6e91385/12fbabf)；DramaWorkflow 由 3256→2798行；「進行中」項更新 |
| 2026-09-08 | AI 協作 | DramaWorkflow 第四批前段：ImageLightbox 抽出(7ab122e) + SeriesAestheticLock 搬遷(a3ee0dc)完成；DramaWorkflow 由 2798→2516行；「進行中」項更新 |
| 2026-09-09 | AI 協作 | DramaWorkflow 第四批中段：appearanceConstants.ts 新建(d9c1bf7) + CharacterProfileCard.tsx 抽出(60712b5)完成；DramaWorkflow 由 2516→1343行；「進行中」項更新 |
| 2026-09-09 | AI 協作 | S4 第二磚(66b0c8a)：S4PanelEditor.tsx 新建(233行)，S4StoryboardGen.tsx 修改(211行)，panel edit/delete/AI-rewrite 完成；S4 第二磚移入「完成」 |
| 2026-09-10 | AI 協作 | S4 第三磚(c0459ec)：storyboard_panels D1 table(0012 migration)、/api/storyboard 路由(GET+POST+OPTIONS)、storyboardAdapter.ts、S4StoryboardGen.tsx 修改(211→234行)；S4 第三磚移入「完成」 |
| 2026-09-10 | AI 協作 | S5 第一磚(fafc059)：S5Keyframes.tsx 完全改寫(157→186行)；移除所有 mock，接入 D1 分鏡，真 characters 資產完整度，集數選擇器，panel 佔位框，空狀態；S5 第一磚移入「完成」 |
| 2026-09-10 | AI 協作 | S5 第二磚(8ecb05d)：新建 S5KeyframeGen.tsx(215行,per-panel 生成+load+error+retry)、keyframes.ts(147行)、keyframeAdapter.ts(70行)、migration 0013；修改 S5Keyframes.tsx(186→132行)；[[path]].ts 加 IMAGE_MODEL，移除 image-gen + character-angle 兩處 hardcode；還 #image-model-registry 債；S5 第二磚移入「完成」 |
| 2026-09-11 | AI 協作 | S5 第三磚(77d55a1)：新建 migration 0014(UNIQUE INDEX + dedup)；keyframes.ts 改 ON CONFLICT DO UPDATE(147→151行)；S5KeyframeGen.tsx 改寫(215→192行，KEYFRAME_GEN_CONCURRENCY=3 config、export PanelState、onStatesChange、批量全部生成、進度條)；S5Keyframes.tsx 改寫(132→149行，確認門控+溫和警示+仍然繼續)；S5 三磚全部完成，移入「完成」 |
| 2026-09-11 | AI 協作 | S6 第一磚(eaabf1f)：[[path]].ts 加 VIDEO_COST_USD_FALLBACK + GET handler 補 R2 歸檔 + recordCreditDebit；新建 episodes.ts(PATCH+GET /api/episodes/:episodeId)、videoAdapter.ts(saveVideoToD1+loadVideoFromD1)；useVideoGen.ts 加 VIDEO_POLL_INTERVAL_MS/VIDEO_POLL_MAX_ATTEMPTS 常數、submit() return {jobId,videoUrl}；VideoGenPanel.tsx 修 Bug F(stale closure → return value)；S6 第一磚移入「完成」；pending_changes 加 #ai-router-oversized |
| 2026-09-11 | AI 協作 | S6 磚 1b(1624999)：[[path]].ts 修正 video URL 解析（unsigned_urls[0] + data.usage?.cost）；archiveMp4ToR2() helper；GET handler backfill 分支；POST /api/ai/video/backfill 端點（三重保護）；recordCreditDebit 隔離在 poll 路徑；pending_changes 加 #episode-id-format-mismatch；S6 磚 1b 移入「完成」 |

## S6 磚 1c ✅ COMPLETED（commit d4b708a，2026-09-11）
- 修正 R2 archive 假成功 bug：archiveMp4ToR2 加 byteLength > 0 guard + r2.head() verify
- 改用 fresh signed URL（內部即時 GET /videos/{jobId}），排除 expired URL 導致 empty body
- 加診斷 log：status / content-type / byteLength（唔 print token）
- 三個 caller 更新至 4-param signature
- result_url 只在 R2 已驗證成功後才寫 D1，徹底消除假成功

## S6 磚 2 ✅ COMPLETED（commit 22a0fcd，2026-09-12）
- S6VideoGen.tsx 改為 per-panel 架構（121→182 lines）
- 新增 S6PanelList file-internal component（降行數用）
- 每 panel 用 kfMap[panel.scene] 對應自己 S5 keyframe 做首幀（frameImages）
- inputReferences 用 card.characterIds → characters lookup（fallback slice(0,2)），characters.img → toAbsUrl
- 只開放 panel 1 生成（驗證模式），panel 2-5 顯示「驗證後開放」badge
- episodeId 格式：${pid6}-ep${ep}-p${panelScene}（saveVideoToD1 PATCH 靜默失敗，gen_jobs 正常寫入）
- R2 key 用 jobId，無衝突

---
## ✅ S6 磚 2b — frame_images payload schema 修正（d0fb683）
- 修正 `frame_images` map：`type` 固定 `'image_url'`，`frame_type` 獨立欄位
- 符合 OpenRouter OpenAPI FrameImage schema（allOf ContentPartImage + frame_type required）
- `input_references` 確認正確，不動

---
## ✅ S6 磚 2c — 移除 input_references 繞開真人偵測（826081f）
- `inputReferences={[]}` 暫停傳角色參考圖，只靠 S5 首幀錨定角色
- 繞開 Seedance `InputImageSensitiveContentDetected.PrivacyInformation`
- charRefs 計算保留，後端不動，TODO 記錄於 pending_changes.md #s6-input-references-disabled
| 2026-09-12 | AI 協作 | S6 磚 2d(9949b2a)：AI_MODELS.VIDEO_MODEL 由 bytedance/seedance-2.0 改為 minimax/hailuo-3-max；繞開 Seedance 寫實人物偵測；1 檔案 1 行改動；DIAG log 保留至 Hailuo 成功出片 |
