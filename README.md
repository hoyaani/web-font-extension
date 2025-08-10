# 網頁字體管理器 Font Manager Extension

專業的 Chrome/EDGE 瀏覽器擴充功能，提供完整的網頁字體管理與自訂功能。

## 🌟 主要功能

### 📝 字體管理

  - **快速調整**：一鍵增大/縮小字體大小
  - **顏色設定**：自訂文字顏色和背景顏色
  - **字體選擇**：支援多種常用字體，下拉選單顯示實際字體效果
  - **連結設定**：控制超連結的底線和顏色顯示

### 🎯 網站特定設定

  - 為每個網站保存獨立的字體設定
  - 自動記憶並套用網站專屬配置
  - 支援批次管理多個網站設定

### ⚡ 快捷鍵支援

  - `Ctrl + =`：增大字體
  - `Ctrl + -`：縮小字體
  - `Ctrl + 0`：重置字體

### 💾 配置管理

  - 導出/導入配置文件
  - 一鍵備份所有設定
  - 重置為預設值功能

## 📁 文件結構

```
web-font-extension/
├── manifest.json          # 擴充功能配置文件
├── popup.html             # 彈出視窗界面
├── background.js          # 背景腳本
├── content.js             # 內容腳本
├── content.css            # 內容樣式
├── options.html           # 選項頁面
├── options.js             # 選項頁面腳本
├── icons/                 # 圖標文件夾
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md              # 說明文件
```

## 🚀 安裝步驟

### 開發者安裝（推薦）

1.  **下載源碼**
       `bash    git clone https://github.com/hoyaani/web-font-extension.git    cd font-manager-extension    `

2.  **安裝到 Chrome/EDGE**
       - 打開 Chrome 或 EDGE 瀏覽器
       - 在網址列輸入 `chrome://extensions` (Chrome) 或 `edge://extensions` (EDGE)
       - 開啟右上角的\*\*「開發人員模式」**開關
       - 點擊**「載入未封裝項目」\*\*
       - 選擇整個 `font-manager-extension` 資料夾

### 打包安裝

1.  **創建 ZIP 文件**
       `bash    zip -r font-manager-extension.zip * -x "*.git*" "README.md"    `

2.  **在擴充功能頁面安裝**
       - 在 `chrome://extensions` 或 `edge://extensions` 頁面中
       - 將打包好的 `.zip` 文件拖曳到頁面中安裝

## 📖 使用指南

### 基本操作

1.  **開啟管理器**
       - 點擊工具列上的擴充功能圖標
       - 或使用快捷鍵 `Ctrl + Shift + F`

2.  **調整字體**
       - 使用 A+/A- 按鈕快速調整
       - 或直接修改數值輸入框

3.  **設定顏色**
       - 點擊色彩選擇器選擇顏色
       - 或手動輸入十六進制色碼

### 進階功能

1.  **網站特定設定**
       - 調整好設定後點擊對應的保存按鈕
       - 下次造訪該網站時會自動套用

2.  **配置管理**
       - 導出：備份所有設定為 JSON 文件
       - 導入：從備份文件恢復設定
       - 重置：清除所有設定回到預設值

3.  **選項頁面**
       - 右鍵點擊擴充功能圖標選擇\*\*「選項」\*\*
       - 或在擴充功能管理器中點擊\*\*「詳細資訊」\*\*進入

## ⚙️ 技術規格

  - **Manifest 版本**：V3 (相容 Chrome/EDGE)

  - **權限需求**：
      - `storage`：保存用戶設定
      - `activeTab`：操作目前分頁
      - `scripting`：注入腳本或樣式到分頁
      - `<all_urls>`：在所有網站運行

  - **相容性**：Chrome / EDGE

  - **儲存方式**：本機儲存 (`chrome.storage.local`)

## 🔧 開發資訊

 - v0.1.0.0 初版測試版

### API 使用

```javascript
// 取得設定
chrome.storage.local.get(['globalSettings', 'siteSettings'])

// 保存設定  
chrome.storage.local.set({ globalSettings: settings })

// 發送訊息到內容腳本
chrome.tabs.sendMessage(tabId, { action: 'applySettings', settings })
```

### 自訂樣式

擴充功能會注入 CSS 規則來套用字體設定：

```css
/* 範例：調整字體大小 */
* { font-size: 18px !important; }

/* 範例：調整字體顏色 */
body, body * { color: #333333 !important; }
```

## 🐛 疑難排解

### 常見問題

1.  **設定沒有套用**
       - 檢查網站是否阻止內容腳本
       - 重新整理頁面試試
       - 檢查瀏覽器主控台是否有錯誤

2.  **快捷鍵無效**
       - 確認沒有與其他擴充功能衝突
       - 檢查 Chrome 的快捷鍵設定：`chrome://extensions/shortcuts`

3.  **導入配置失敗**
       - 確認 JSON 文件格式正確
       - 檢查文件是否被截斷或損壞

### 除錯方式

1.  開啟瀏覽器開發者工具 (F12)
2.  查看 **Console** 標籤的錯誤訊息
3.  檢查擴充功能頁面 (`chrome://extensions`) 的錯誤報告

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

1.  Fork 此專案
2.  創建功能分支：`git checkout -b feature/AmazingFeature`
3.  提交變更：`git commit -m 'Add some AmazingFeature'`
4.  推送到分支：`git push origin feature/AmazingFeature`
5.  開啟 Pull Request

## 📄 授權條款

此專案使用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件

## 🙏 致謝

  - Chromium WebExtensions API 文檔
  - Google/Microsoft 開發者社群
  - 所有測試用戶的寶貴反饋

## 📞 聯絡資訊

  - 專案首頁：[GitHub Repository](https://github.com/hoyaani/web-font-extension)
  - 問題回報：[GitHub Issues](https://github.com/hoyaani/web-font-extension/issues)
  - 作者：hoyaani

-----

**享受更好的網頁閱讀體驗！** 🎉