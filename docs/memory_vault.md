# CoFilmery 記憶庫 memory_vault

> 每次新對話,將本檔連同 docs/ 其他文件貼給對話助手,即可無縫接續。
> 對話助手冇跨對話記憶,一切以本 repo 文件為準。
> 本檔「決策段」屬純 append:唔准覆蓋或刪改舊決策;要推翻舊決策,喺尾新增一條並註明「取代 #x」。

## 一、專案一句話

CoFilmery(網址 cofilmery.com)—— AI 短劇／影片生成 app。用戶經 S0→S3 流程:建 project、上傳素材、生成角色與外觀、砌 story card 與分集,最終生成影片。

## 二、技術棧與部署(事實)

- 前端:Vite + React + TypeScript,喺 `src/`。
- 後端:Cloudflare Pages Functions,喺 `functions/api/`。
- 資料:Cloudflare D1(schema 喺 `migrations/`)、R2(存 asset,key 格式 `generated/{projectId}/...`、`uploads/{projectId}/...`)。
- 部署設定:`wrangler.jsonc`(prod)、`wrangler.staging.jsonc`(staging)。
- 密鑰:一律入 Cloudflare env secret(見 `.dev.vars.example`),唔准硬編碼、唔准入前端。

## 三、AI provider 現況與決策

- 現行:前端 adapter(`src/adapters/openRouterAdapter.ts`)只呼叫後端 `/api/ai/*` proxy,key 留喺後端(`c.env.OPENROUTER_API_KEY`),前端見唔到 key。
- 後端 registry(`functions/api/ai/[[path]].ts`):
  - TEXT_MODEL: `moonshotai/kimi-k2.5`
  - VIDEO_MODEL: `bytedance/seedance-2.0`
  - TTS_MODEL: `minimax/speech-2.8-hd`
- 決策(2026-09):走「路線 B」直連官方 API,但**延後到 app 主體完成後先做**。
  - 文字:Kimi K3(`api.moonshot.ai/v1`,model `kimi-k3`)、DeepSeek V4(`api.deepseek.com`,model `deepseek-v4-pro` / `deepseek-v4-flash`)、可加豆包國際版 BytePlus(`ark.ap-southeast.bytepluses.com/api/v3`)。
  - 影片:Seedance 走 BytePlus 國際版,端點 `/contents/generations/tasks`,需 async poll(現有 video 程式碼未完成)。
  - 詳見 pending_changes.md #B-provider。

## 四、已完成里程碑(對應真實 commit)

- `6eee9de`(09-03)S3 story card 持久化修正:onAccept stale-closure 空陣列 bug 已修,登出後唔會再丟 story card。
- `0b3433f`(09-01)S1 分類修正:上傳場景／道具／音訊唔再誤判成 'other'。
- `4b294ec`(08-27)S3 分集素材:EpisodeAssetPickerModal、snapshot、全選。
- `e0df6fc` / `d02daf5`(08-25)S2/S3 外觀選項擴展(共 17+ 欄)、相似度 mid=70%。
- `22ee110`(08-25)S2 角度圖 R2 cache bust、setAsAvatar 寫入 characters.img。
- `1032c01`(09-08)建立 docs/ SOP 文件。

## 五、素材清理紀錄

- 測試 project「街市之王」(id `76a58278-7865-4971-820f-a3fbee13c335`)全部資產已清空:R2 刪 69(52 generated + 17 uploads)、D1 刪 69 rows,驗證 count = 0。characters/episodes/story_card 表未動,其他 project 未受影響。

## 六、待辦(詳見 ROADMAP.md)

- provider 直連(路線 B,延後)。
- catLabel 補中文標籤 `audio`、`other`。
- 外觀選項第二批擴展、相似度 UI 簡化。
- 贊助商資源全選、標籤重命名、鬍鬚亂碼(絡腮胡)修正。
- S0 回歸驗證。

---

## 決策記錄(純 append,唔准改舊行)

| # | 日期 | 決策 | 備註 |
|---|------|------|------|
| 1 | 2026-09 | 文字模型走直連官方 API(Kimi K3 / DeepSeek V4 / 豆包國際版),但延後到 app 主體完成後 | 路線 B |
| 2 | 2026-09 | 影片用 BytePlus 國際版 Seedance,`/contents/generations/tasks` + async poll | |
| 3 | 2026-09 | 文檔更新採乙案:日誌類純 append、狀態類可編輯+底部修訂記錄 | |
| 4 | 2026-09 | UI 顏色／字體規則暫緩,Rules.md 相關段標 TODO | 參考 cofilmery.com |
