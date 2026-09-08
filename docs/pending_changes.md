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
