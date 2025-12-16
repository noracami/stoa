# 實作計劃：Stoa - 分散式個人圖書借閱系統 (MVP)

**專案名稱：** Stoa (古希臘語：柱廊，哲學家們分享知識的場所)
**建立日期：** 2025-12-17
**技術棧：** Vite + Astro + React + Tailwind CSS 4
**部署平台：** GitHub Pages
**介面語言：** 繁體中文（i18n-ready）
**主題模式：** 深色/淺色切換
**Node 版本：** 22 LTS (實際: 22.17.0)
**套件管理：** pnpm (實際: 9.12.3)
**規格文件：** [spec.md](./spec.md)

---

## 技術選型決策

| 項目 | 選擇 | 考慮過的替代方案 | 決策理由 |
|------|------|-----------------|---------|
| 前端框架 | Astro + React | Vue 3, Vanilla JS | 島嶼架構適合靜態為主+局部互動 |
| CSS 方案 | Tailwind CSS 4 | 純 CSS/SCSS | 快速開發、utility-first |
| 壓縮方案 | LZ-String | Base64 + JSON | 專為 URL/LocalStorage 設計，壓縮率高 |
| i18n 方案 | 自建 JSON 字典 | react-i18next | MVP 簡單夠用，架構設計為未來可遷移 |
| 部署平台 | GitHub Pages | Vercel, Netlify | 免費、與 Git 整合 |

---

## 階段總覽

| 階段 | 名稱 | 狀態 |
|------|------|------|
| 0 | 專案初始化 | ⬜ 待開始 |
| 1 | 核心資料層 | ⬜ 待開始 |
| 2 | UI 元件開發 | ⬜ 待開始 |
| 3 | 功能整合 | ⬜ 待開始 |
| 4 | 部署與優化 | ⬜ 待開始 |

---

## 階段 0：專案初始化

### 0.1 環境設定
- [ ] 建立 `.nvmrc` 檔案（內容：`22`）
- [ ] 建立 `.node-version` 檔案（內容：`22`）
- [ ] 確認 Node 22 已安裝：`node -v`
- [ ] 確認 pnpm 已安裝：`pnpm -v`

### 0.2 建立專案結構
- [ ] 使用 `pnpm create astro@latest stoa` 建立 Astro 專案
- [ ] 安裝 React 整合：`pnpm astro add react`
- [ ] 安裝 Tailwind CSS 4：`pnpm astro add tailwind`
- [ ] 設定 GitHub Pages 部署配置
- [ ] 在 `package.json` 加入 engines 欄位

```json
// package.json 新增
{
  "engines": {
    "node": ">=22"
  },
  "packageManager": "pnpm@9.12.3"
}
```

### 0.3 專案目錄結構
```
src/
├── components/       # React 元件
│   ├── BookCard.tsx
│   ├── BookList.tsx
│   ├── AddBookModal.tsx
│   ├── ShareButton.tsx
│   ├── CapacityWarning.tsx
│   └── ThemeToggle.tsx
├── hooks/            # 自定義 Hooks
│   ├── useUrlState.ts
│   ├── useBookApi.ts
│   ├── useLocalCache.ts
│   └── useTheme.ts
├── i18n/             # 國際化（i18n-ready 架構）
│   ├── index.ts      # i18n Context + Hook
│   └── locales/
│       └── zh-TW.json
├── lib/              # 核心邏輯
│   ├── codec.ts      # URL 編解碼 (LZ-String)
│   ├── googleBooks.ts
│   └── types.ts
├── layouts/
│   └── Layout.astro
└── pages/
    └── index.astro
```

### 0.4 安裝依賴
```bash
# 核心依賴
pnpm add lz-string

# 開發依賴
pnpm add -D @types/lz-string
```

---

## 階段 1：核心資料層

### 1.1 資料型別定義 (`lib/types.ts`)
- [ ] `Book` 介面：ISBN、格式、狀態、購入日期
- [ ] `BookMetadata` 介面：書名、作者、封面 URL
- [ ] `BookshelfState` 介面：書籍陣列 + 版本號

```typescript
// 預計資料結構
interface Book {
  isbn: string;
  format: 'physical' | 'ebook';
  status: 'available' | 'borrowed';
  addedDate: string; // YYYY-MM-DD
}

interface BookMetadata {
  title: string;
  authors: string[];
  thumbnail?: string;
}
```

### 1.2 URL 編解碼模組 (`lib/codec.ts`)
- [ ] `encode(books: Book[]): string` - 將書籍陣列壓縮為 URL-safe 字串
- [ ] `decode(hash: string): Book[]` - 從 URL hash 還原書籍陣列
- [ ] 使用 LZ-String 的 `compressToEncodedURIComponent` / `decompressFromEncodedURIComponent`
- [ ] 錯誤處理：無效 hash 回傳空陣列

### 1.3 Google Books API 模組 (`lib/googleBooks.ts`)
- [ ] `fetchBookMetadata(isbn: string): Promise<BookMetadata | null>`
- [ ] API 端點：`https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}`
- [ ] 錯誤處理：API 失敗時回傳 null
- [ ] 批次查詢優化（避免同時發送過多請求）

### 1.4 LocalStorage 快取 (`hooks/useLocalCache.ts`)
- [ ] 快取 key 格式：`book_meta_{isbn}`
- [ ] 快取有效期：7 天
- [ ] `getCachedMetadata(isbn: string): BookMetadata | null`
- [ ] `setCachedMetadata(isbn: string, data: BookMetadata): void`
- [ ] 自動清理過期快取

---

## 階段 2：UI 元件開發

### 2.0 主題與國際化基礎建設

#### 深色模式 (`hooks/useTheme.ts`)
- [ ] 偵測系統偏好 (`prefers-color-scheme`)
- [ ] LocalStorage 持久化使用者選擇
- [ ] 透過 Tailwind `dark:` 前綴實現主題切換
- [ ] ThemeToggle 元件（日/月圖示切換）

#### 國際化架構 (`i18n/`)
- [ ] 建立 `zh-TW.json` 語言檔（所有 UI 文字）
- [ ] 建立 `useTranslation` Hook
- [ ] 設計 i18n-ready 架構，方便未來擴充語言
- [ ] 文字 key 命名規範：`{page}.{component}.{element}`

```json
// i18n/locales/zh-TW.json 範例
{
  "app": {
    "title": "Stoa 書架",
    "empty": "書架空空如也，新增第一本書吧！"
  },
  "book": {
    "status": {
      "available": "可借閱",
      "borrowed": "借出中"
    },
    "format": {
      "physical": "紙本",
      "ebook": "電子書"
    }
  },
  "action": {
    "add": "新增書籍",
    "delete": "刪除",
    "share": "複製連結",
    "confirm": "確定",
    "cancel": "取消"
  }
}
```

### 2.1 BookCard 元件
- [ ] 顯示封面圖（含 loading skeleton）
- [ ] 顯示書名、作者
- [ ] 顯示 ISBN（小字）
- [ ] 顯示格式標籤（紙本/電子書）
- [ ] 顯示狀態標籤（可借閱/不可借閱）
- [ ] 刪除按鈕（含確認對話框）
- [ ] 狀態切換按鈕

### 2.2 BookList 元件
- [ ] 響應式網格佈局
- [ ] 空狀態提示（無書籍時）
- [ ] 書籍數量統計

### 2.3 AddBookModal 元件
- [ ] ISBN 輸入框（支援 ISBN-10 / ISBN-13）
- [ ] 格式選擇（紙本/電子書）
- [ ] ISBN 格式驗證
- [ ] 防止重複新增相同 ISBN

### 2.4 ShareButton 元件
- [ ] 複製連結到剪貼簿
- [ ] 複製成功提示 (Toast)
- [ ] 顯示目前書籍數量

### 2.5 CapacityWarning 元件
- [ ] 計算目前 URL 長度
- [ ] 接近限制（>1500 bytes）時顯示警告
- [ ] 達到限制時禁止新增

---

## 階段 3：功能整合

### 3.1 URL 狀態同步 Hook (`hooks/useUrlState.ts`)
- [ ] 初始化時從 `window.location.hash` 讀取狀態
- [ ] 狀態變更時自動更新 URL（`history.replaceState`）
- [ ] 監聽 `hashchange` 事件（支援瀏覽器返回）

### 3.2 書籍 CRUD 操作
- [ ] 新增書籍：驗證 → 加入陣列 → 更新 URL
- [ ] 刪除書籍：確認 → 移除 → 更新 URL
- [ ] 切換狀態：更新狀態 → 更新 URL

### 3.3 Metadata 非同步載入 (`hooks/useBookApi.ts`)
- [ ] 優先從 LocalStorage 取得快取
- [ ] 快取未命中時呼叫 API
- [ ] 使用 React Query 或自建 loading 狀態管理
- [ ] 批次載入策略（每次最多 5 本並行）

### 3.4 主頁面整合 (`pages/index.astro`)
- [ ] 組合所有元件
- [ ] 處理初次訪問（空白書架）vs 有資料訪問
- [ ] 響應式設計（手機/平板/桌面）

---

## 階段 4：部署與優化

### 4.1 GitHub Pages 部署
- [ ] 設定 `astro.config.mjs` 的 `base` 和 `site`
- [ ] 建立 GitHub Actions workflow (`.github/workflows/deploy.yml`)
- [ ] 測試部署流程

### 4.2 效能優化
- [ ] 圖片 lazy loading
- [ ] 元件 code splitting
- [ ] Lighthouse 效能檢測（目標 >90 分）

### 4.3 使用者體驗優化
- [ ] 載入中骨架畫面 (Skeleton)
- [ ] 錯誤邊界處理 (Error Boundary)
- [ ] 離線提示

---

## 技術備註

### LZ-String 壓縮估算
- 單本書約需 30-40 bytes（壓縮後）
- URL 安全上限 2000 bytes
- 預估容量：約 50-60 本書

### Google Books API 注意事項
- 無 API Key 限制：每 IP 每日約 1000 次
- 部分書籍可能無封面圖
- 中文書籍搜尋可能需要 ISBN-13

### Astro + React 整合要點
- 使用 `client:load` 指令啟用互動
- 狀態管理在 React 島嶼內完成
- 避免不必要的 hydration

---

## 風險與對策

| 風險 | 影響 | 對策 |
|------|------|------|
| URL 超長被截斷 | 資料遺失 | 容量警告 + 禁止新增 |
| API 限流 | 無法顯示書籍資訊 | 積極快取 + 優雅降級 |
| 瀏覽器不支援 | 功能異常 | 基本功能降級支援 |

---

## 驗收標準

- [ ] 可新增/刪除書籍，URL 即時更新
- [ ] 重新開啟連結能正確還原書架
- [ ] 書籍資訊自動從 API 載入並快取
- [ ] 複製連結功能正常運作
- [ ] 響應式設計在手機上可用
- [ ] 深色/淺色模式可切換，記住使用者偏好
- [ ] 所有 UI 文字從 i18n 語言檔讀取
- [ ] 部署到 GitHub Pages 可正常訪問

---

## i18n 擴充指南

當需要新增語言時，只需：

1. 在 `i18n/locales/` 新增語言檔（如 `en.json`）
2. 在 `i18n/index.ts` 註冊新語言
3. 新增語言切換 UI

此架構設計為未來可無縫遷移至 `react-i18next`，只需：
- 安裝 `react-i18next` 和 `i18next`
- 將 `useTranslation` Hook 替換為 react-i18next 版本
- 語言檔格式完全相容，無需修改
