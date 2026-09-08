# CoFilmery 架構設計備忘 Architecture

> 本文件管「為什麼這樣設計」:記憶架構嘅理念與職責分工。
> 與 ROADMAP.md(進度)、Rules.md(內容語體)、SOP-workflow.md / SOP-modular.md(流程與結構)並行。
> 實作細節與最新進度以 ROADMAP.md 為準;本文件記錄不變嘅設計意圖,供接手者理解「點解咁分」。
> 本檔屬「狀態類」:可編輯,但每次改動須喺底部修訂記錄加一行。

## 一、頂層目錄(事實)

- `src/` — 前端(Vite + React + TS)。adapter 喺 `src/adapters/`。
- `functions/api/` — 後端 Cloudflare Pages Functions(REST API)。
- `migrations/` — D1 schema。
- `public/` — 靜態資源。
- `docs/` — 記憶庫與 SOP。
- config:`wrangler.jsonc`(prod)、`wrangler.staging.jsonc`(staging)、`vite.config.ts`、`tailwind.config.js`、`tsconfig*`。

## 二、核心設計意圖

### 1. 前端唔掂密鑰,一切經後端 proxy
前端 adapter 只識呼叫 `/api/ai/*`,真 key(OpenRouter / 未來 Kimi、DeepSeek、BytePlus)只存喺 Cloudflare env secret,由後端讀。
**點解咁分**:前端係公開嘅,任何 key 落前端等於洩露。後端 proxy 亦係計費、扣點(credit)、記 `gen_jobs` log 嘅唯一位。

### 2. 三層模組化(見 SOP-modular.md)
共用模組 → 複合模組 → 頁面檔。頁面 ≤200 行、模組 ≤250 行。
**點解咁分**:短劇流程 S0–S3 邏輯多,唔切細會出現一個檔幾千行、一改牽全身、AI 難以安全修改。

### 3. Asset 存 R2 + D1 雙寫
檔案本體入 R2(key 帶 projectId),metadata 入 D1 `assets` 表(含 `r2_key`)。刪除時兩邊都要清。
**點解咁分**:R2 慳錢適合大檔,D1 適合查詢／分類／關聯 project。分開令查詢快,亦令「按 project 清理」有單一 where 條件可依。

### 4. Provider registry 收斂喺後端一處
所有模型字串集中喺 `functions/api/ai/[[path]].ts` 嘅 `AI_MODELS`,呼叫走單一 `orFetch`。
**點解咁分**:將來換 provider(路線 B)只改一處,唔使全 repo 搜。呢個係「延後切換」可行嘅前提。

### 5. Story card 讀寫嘅單一真相
story card 以 D1 `story_card`(JSON)為準,前端 state 只係緩存。持久化 bug(`6eee9de`)教訓:唔可以喺 render time 影 state snapshot 落 closure,要 click 時即讀最新 state。
**點解咁分**:React state 非同步,render-time snapshot 會寫空陣列落 D1。

## 三、與其他文件關係

- 進度 → ROADMAP.md
- 流程 → SOP-workflow.md
- 結構 → SOP-modular.md
- 內容語體／紅線 → Rules.md
- 未決／矛盾 → pending_changes.md

---

## 修訂記錄

| 日期 | 修訂人 | 改咗乜 |
|------|--------|--------|
| 2026-09-08 | (初版) | 建立 Architecture,記錄五項設計意圖 |
