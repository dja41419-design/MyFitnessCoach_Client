# MyFitnessCoach Client (前端專案)

> **基於 Vue 3 與 Vite 構建的智能健康飲食電商前端系統**  
> 本專案為 MyFitnessCoach 的前端實現，專注於極致的使用者體驗、響應式狀態管理與複雜的電商邏輯處理。

---

## 🔗 相關連結
*   **後端 API 專案 (Master README)**：[MyFitnessCoach_Server](https://github.com/dja41419-design/MyFitnessCoach_Server)
*   **展示影片**：[YouTube 連結](https://www.youtube.com/watch?v=你的影片連結)

---

## 🛠️ 前端技術棧 (Frontend Tech Stack)

*   **框架**: Vue 3 (Composition API, `<script setup>`)
*   **構建工具**: Vite
*   **語言**: TypeScript / JavaScript
*   **UI 組件庫**: Element Plus
*   **狀態管理**: 自定義 Composables (Module-level Singleton Pattern)
*   **HTTP 客戶端**: Fetch API + 自定義封裝 (`fetchWithAuth`)

---

## 🚀 前端技術亮點

### 1. 全站單例狀態管理 (Global State Management)
本專案不依賴傳統的 Vuex 或 Pinia，而是運用 Vue 3 的響應式原理（`ref`, `computed`）實作了 **Module-level Singleton** 模式。
*   **實現檔案**: `src/composables/useCart.ts`, `src/composables/useCoupon.ts`
*   **優勢**: 確保全站 Navbar 的購物車數量圖標、商城頁面與購物車詳情頁面的資料即時同步，並大幅降低狀態維護的複雜度。

### 2. 智能購物車同步與持久化
*   **離線優先**: 訪客模式下，使用 `watch` 監聽器自動將購物車狀態同步至 `LocalStorage`。
*   **自動合併機制**: 當 `useCart` 偵測到使用者登入時，自動觸發合併請求，將本地暫存商品與資料庫購物車同步。

### 3. 優惠券試算與推薦引擎 (Frontend Logic)
*   **並行計算**: 在購物車頁面，系統會利用 `Promise.all` 同時對所有可用券進行後端試算。
*   **加權排序**: 實作 `pickBestCoupon` 邏輯，自動依據「折扣金額」與「過期時間」挑選最優方案。

### 4. 健壯的請求封裝 (`fetchWithAuth`)
*   實作了統一的 API 請求攔截機制。
*   自動處理 `JWT Token` 注入。
*   集中處理 `401 Unauthorized` 登入過期跳轉與全域錯誤提示。

---

## 📂 專案目錄結構

```text
src/
├── assets/          # 靜態資源 (圖片、樣式)
├── components/      # 共用 UI 組件 (Navbar, LoginForm 等)
├── composables/     # 核心業務邏輯與狀態管理 (最核心處)
│   ├── useCart.ts      # 購物車狀態與單例邏輯
│   ├── useCoupon.ts    # 優惠券領取與推薦演算法
│   └── useProducts.ts  # 商品搜尋與篩選邏輯
├── data/            # API 請求與資料模型定義
├── router/          # 路由配置
└── views/           # 頁面級組件 (Store, Cart, Login 等)
```

---

## 💻 快速上手 (Getting Started)

### 1. 安裝依賴
```bash
npm install
```

### 2. 啟動開發伺服器
```bash
npm run dev
```

### 3. 編譯並壓縮 (Production)
```bash
npm run build
```

---

## 📸 介面縮影

| 商城主介面 | 購物車與優惠券 |
| :---: | :---: |
| ![商城](../專題畫面截圖/商城+廣告.jpg) | ![購物車](../專題畫面截圖/購物車優惠券試算手動自動.png) |

---

## 💡 開發體悟
透過 Vue 3 的 Composition API，我深刻體會到「邏輯抽離」對大型前端專案的重要性。將複雜的購物車合併邏輯與優惠券演算法封裝成 Composable，不僅讓視圖層（View）變得純粹，也讓代碼的複用性與可讀性達到了商業級標準。
