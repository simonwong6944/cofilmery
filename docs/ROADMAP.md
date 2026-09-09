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

## 進行中

- [ ] S4 第二磚：panel 逐項編輯 / 刪除 / AI 重寫（依賴第一磚）
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
