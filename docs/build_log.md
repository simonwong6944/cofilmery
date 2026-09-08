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

> 註:上述早期記錄嘅 preview URL 當時未有系統化記低,以「—」標示。往後每條新記錄須填齊 preview URL。
