---
name: maps-link
description: 使用 Playwright MCP 開啟 Google Maps，透過 URL 參數注入出發日期與時間，取得含時間資訊的分享連結，回傳結果供更新行程表。若起訖點為行程表內的地點連結，須先開啟連結解析為標準地名／地址再規劃路徑。用法：/maps-link <起點> <終點> <日期 MM/DD> <出發時間 HH:MM> [備註說明]
---

使用 Playwright MCP 開啟 Google Maps 路線頁面，透過修改 `data=` URL 參數直接設定出發日期與時間（無需操作 UI 日曆），取得分享連結，輸出供行程表使用的替換資訊。若起訖點來自行程表內嵌的 Google 地點連結（例如 `maps.app.goo.gl`），須先開啟該連結後取得 Google 顯示的正式地名或地址，再組出 `/maps/dir/…`；不要把未解析的短網址或完整 `https://` 當作 `dir` 路徑段塞進去。

## 核心原理

Google Maps 將出發時間編碼在 URL 的 `data=` 參數中：

| Token | 說明 |
|-------|------|
| `!6e0` | 最佳路線 |
| `!7e2` | 出發時間模式（`!7e3` 為抵達時間） |
| `!8j{ts}` | Unix 時間戳記（以本地時鐘時間直接當作 UTC 計算） |
| `!3e3` | 大眾運輸模式 |

## 執行流程

### 第一步：解析參數

從 `$ARGUMENTS`（或使用者指定的行程 Markdown 列／儲存格）解析：起點、終點、日期（MM/DD）、出發時間（HH:MM）、備註說明（選填）。若參數不足，請求使用者補充。

**行程表慣例：** 關鍵地點常以 Markdown 連結呈現，例如 `[地點顯示名](https://maps.app.goo.gl/…)` 或 `google.com/maps/place/…`。規劃路徑時**以該連結為權威來源**，不要用連結顯示文字猜地址。

### 第一步（補）：由地點連結取得「規劃用起訖字串」

對**起點、終點**各別處理（可平行開分頁或先後執行）：

1. **判定是否為地點連結**  
   符合任一則視為地點連結，必須先做本節再進入第三步路徑頁：
   - `https://maps.app.goo.gl/…`、`goo.gl/maps`、短網址會轉址到 Maps
   - `https://www.google.com/maps/place/…`（含 `@lat,lng` 的 place 頁）
   - **注意：** 若參數已是純文字地址或車站名（無 URL），可跳過本節，直接以該字串當規劃用字串（必要時 `encodeURIComponent`）。

2. **禁止事項**  
   **不要**把 `https://maps.app.goo.gl/…` 或完整 `https://` URL 當成 `/maps/dir/{起點}/{終點}` 中路徑段的「地名」——Google 常無法正確解析，且與行程表內嵌連結不一致。必須先還原成單一地點頁，再取標題／地址。

3. **用 Playwright 解析**  
   - `browser_navigate` 開啟該地點連結（必要時跟隨轉址至 `google.com/maps`）。  
   - `browser_snapshot` 確認已載入地點資訊（側邊欄或標題列有可讀的地名／地址）。  
   - 取得「規劃用字串」的優先順序：
     1. 地點**正式名稱**＋必要時**結構化地址**（與路線面板搜尋結果一致者為佳）
     2. 若名稱過短或重名風險高，改用頁面上顯示的**完整地址**（日文或英文皆可，與 Google 顯示一致）
     3. 仍無法取得文字時，可自當前 URL 取出已解析的 `place/` 座標或 `data=` 內與該點對應的座標，改以 **`lat,lng` 字串**作為該端點（僅作最後手段）

   實務上也可用 `browser_evaluate` 輔助，例如讀取 `document.title`（通常含「地點名 - Google 地圖」）、或頁面上標頭元素的 `textContent`，**以快照可見文字交叉驗證**，避免錯拿週邊搜尋結果。

4. **輸出給下一步**  
   記錄兩個變數：`規劃起點字串`、`規劃終點字串`（之後第三步組 URL 時使用這兩個值，並對路徑段做 URL 編碼）。

### 第二步：計算 Unix 時間戳記

用 Bash 計算出發時間的 Unix 時間戳記（**本地時鐘時間視為 UTC**，即不加時區偏移）：

```bash
python3 -c "import calendar; from datetime import datetime; print(calendar.timegm(datetime(2026, MM, DD, HH, MM, 0).timetuple()))"
```

例如 5/25 08:40 → `1779698400`

### 第三步：開啟 Google Maps 路線

用 `browser_navigate` 開啟（繁體中文介面）。`{起點}`、`{終點}` 必須為**第一步（補）**得到的規劃用字串（已編碼），不可再塞入未解析的短網址：

```
https://www.google.com/maps/dir/{encodeURIComponent(規劃起點)}/{encodeURIComponent(規劃終點)}?hl=zh-TW&travelmode=transit
```

若手動組 URL，確保路徑中無未轉義的 `?`、`&`、`#`。

若收到「Browser is already in use」錯誤，執行以下 Bash 指令後重試：
```bash
pkill -f "mcp-chrome" 2>/dev/null; sleep 1
```

### 第四步：等待頁面解析地點，取得帶 place ID 的 URL

執行 `browser_snapshot` 確認頁面載入（應看到路線面板且已解析起訖點）。

若目的地出現下拉選單，從快照找第一個建議項目的 ref 點擊，再執行 `browser_snapshot` 確認已選取。

> ⚠️ 此時的 URL 已包含解析後的 place ID（`!1s0x...`）和座標（`!1d`, `!2d`），但尚無時間參數。

### 第五步：注入時間戳記，構造目標 URL

用 `browser_evaluate` 取得當前 URL，並注入時間參數：

```javascript
() => {
  const ts = {TIMESTAMP}; // 替換為第二步計算的時間戳記
  let url = window.location.href;

  // 若已有時間戳記，直接替換
  if (url.includes('!8j')) {
    return url.replace(/!8j\d+/, `!8j${ts}`);
  }

  // 尚無時間參數：將兩個 !4mN 計數器各加 5（新增 5 個 token）
  url = url.replace(/(!4m)(\d+)(!4m)(\d+)/, (m, p1, n1, p2, n2) =>
    `${p1}${+n1+5}${p2}${+n2+5}`
  );

  // 在 ? 之前插入時間參數
  url = url.replace('?', `!2m3!6e0!7e2!8j${ts}!3e3?`);
  return url;
}
```

### 第六步：直接導航到含時間的 URL

用 `browser_navigate` 導航到第五步回傳的 URL。

### 第七步：快照確認日期與時間正確

執行 `browser_snapshot`，確認：
- 時間欄顯示正確出發時間（如「上午8:40」）
- 日期按鈕顯示目標日期（如「5月25日週一」）
- 路線結果顯示星期標示（如「(星期一)」）

### 第八步：取得分享連結

1. 點擊路線面板中的「**複製連結**」按鈕（直接複製到剪貼簿，不會出現彈窗）
2. 用 `browser_evaluate` 讀取剪貼簿：
   ```js
   () => navigator.clipboard.readText()
   ```
3. 記錄取得的短網址（格式：`https://maps.app.goo.gl/xxxxx`）

### 第九步：讀取路線資訊（只看大眾交通結果）

從路線面板的**第一個**大眾運輸結果讀取（忽略開車選項）：
- 交通工具名稱（如「山陰本線」「近鐵特急」「市バス9」）
- **實際出發時刻**（班次發車時間，非搜尋時間——如搜尋08:45，但第一班是08:56，記08:56）
- **實際抵達時刻**

### 第十步：輸出結果並更新行程表

輸出格式：

```
路線連結已更新：
交通工具：<交通工具>
発→着：<實際出發時間>→<實際抵達時間>
連結：<分享連結>
```

然後直接用 `Edit` 工具更新行程 Markdown 檔案：
- 同時更新連結 URL 與顯示文字，格式：`[{{交通方式}} {{實際出發時間}}→{{實際抵達時間}}](新連結)`
- 備註欄：只保留 ⚠️/✅ 提醒事項，移除已驗證資訊
- 備註欄不列費用金額
