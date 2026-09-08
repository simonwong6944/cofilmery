# CoAppery AI 協作開發流程 SOP

> 本文件管「點樣一步步交付」:AI 協作開發嘅標準流程。
> 與 SOP-modular.md（模組結構）、Rules.md（內容語體）、Architecture.md（設計意圖）、ROADMAP.md（進度）並行。
> 本文件屬「狀態類」文件:可編輯,但每次修改須喺文件底「修訂記錄」加一行。

## 一、目的

規範 AI（Genspark Code / 對話助手）喺 CoAppery / CoFilmery 專案入面嘅開發行為,確保每次交付都可驗證、可回滾、可追溯。

## 二、核心意識

- AI 冇跨對話記憶,一切以 repo 內文件為準。
- 每次動手前,先讀 memory_vault.md、ROADMAP.md、pending_changes.md。
- 唔准擅自偏離既定計劃;有矛盾要記入 pending_changes.md,由產品負責人拍板。

## 三、四個核心動作

1. 讀:開工前讀齊記憶文件（memory_vault / ROADMAP / pending_changes）。
2. 拆:大任務拆成細磚（brick），每磚對應一個可驗證嘅改動。
3. 做:一次只改一磚,守住行數同「只改所屬模組」嘅硬規則。
4. 記:完成即更新文檔（見第六節「文檔同步」）。

## 四、標準流程(七步)

1. 讀記憶:讀 memory_vault.md、ROADMAP.md、pending_changes.md,確認當前狀態同未決事項。
2. 拆磚:將任務拆成一個或多個細改動,每個改動有明確驗收標準。
3. 審視:對照 Rules.md、SOP-modular.md,確認唔違反內容語體同模組結構規則。
4. 實作:改動限於所屬模組;新頁面 ≤200 行,新／改模組 ≤250 行。
5. 驗證:
   - wc -l <file> 檢查行數(頁面 ≤200、模組 ≤250)。
   - grep 檢查(確認冇殘留 debug／冇重複定義／冇硬編碼 key 等)。
   - npm run build 必須零錯誤。
6. 提交:commit 後記低 commit hash、build log、preview URL 三樣。
7. 文檔同步:更新 build_log.md 同 ROADMAP.md(見第六節)。

## 五、Gating 指標(唔達標唔准 merge)

| 項目 | 門檻 |
|------|------|
| 頁面行數 | wc -l ≤ 200 行 |
| 模組行數 | wc -l ≤ 250 行 |
| grep 檢查 | 冇殘留 debug／重複定義／硬編碼密鑰 |
| build | npm run build 零錯誤 |
| 可追溯 | 記錄 commit hash + build log + preview URL |

## 六、文檔同步步驟（新增）

每次完成一個階段並 commit 之後,AI 必須同步更新以下文件:

- build_log.md（純 append）:新增一條記錄,格式 = 日期 | commit hash | 改咗乜 | 驗證結果（build / wc-l / grep）| preview URL。
- ROADMAP.md（可編輯）:將對應項目由「進行中」移去「完成」,並喺文件底修訂記錄加一行。
- 若過程中發現矛盾／未決事項,寫入 pending_changes.md（純 append）。

### 可重用 prompt footer（貼喺每次交付指令尾）

> 完成後請執行文檔同步:
> 1. 喺 docs/build_log.md 尾 append 一條:日期、commit hash、改動摘要、驗證結果、preview URL(唔准改舊記錄)。
> 2. 喺 docs/ROADMAP.md 將本項目由「進行中」移去「完成」,並喺底部修訂記錄加一行。
> 3. 如有矛盾或未決,append 入 docs/pending_changes.md。
> 4. 純日誌類文件（build_log / pending_changes / memory_vault 決策段）只准 append,唔准覆蓋。

## 七、失敗與回滾

- build 失敗或驗證唔過:唔准夾硬 merge。
- 需要撤回已 commit 嘅改動:用 git revert <hash>(唔用 reset,保留歷史)。
- 回滾後,喺 pending_changes.md 記低失敗原因同下一步。

## 八、角色分工

- 產品負責人:定計劃、拍板矛盾、批准規則變更。
- AI（開發者）:只跟文件執行,唔擅自改規則;有疑問寫入 pending_changes.md。

## 九、與其他 SOP / 文件嘅關係

- 結構規則見 SOP-modular.md。
- 內容語體、紅線見 Rules.md。
- 設計意圖見 Architecture.md。
- 進度見 ROADMAP.md。

## 十、修訂機制

本文件如需修改,須由產品負責人批准,並喺下方「修訂記錄」加一行(唔覆蓋舊行)。

---

## 修訂記錄

| 日期 | 修訂人 | 改咗乜 |
|------|--------|--------|
| 2026-09-04 | (初版) | 建立文件,含七步流程、gating、文檔同步步驟 |
