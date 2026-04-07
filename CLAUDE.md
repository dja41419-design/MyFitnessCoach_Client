# MyFitnessCoach — 開發規範

## 專案概述

MyFitnessCoach 是一個體態管理整合平台，結合營養師諮詢、飲食追蹤與健康食品商城。
前端採用 **Vue 3 + Vite**，純手刻 CSS（無 Tailwind / UI 框架）。

## 技術棧

- **框架**：Vue 3.5+
- **建構工具**：Vite 8+
- **語言**：JavaScript（非 TypeScript）
- **樣式**：純 CSS，使用 CSS Custom Properties（設計變數）
- **狀態管理**：Vue Composition API `ref()` / `reactive()`，未來視需求引入 Pinia
- **路由**：目前為 SPA Landing Page，未來視需求引入 Vue Router

## 開發規範

### Vue 元件撰寫

- **一律使用 `<script setup>` 語法**（Composition API）
- 禁止使用 Options API（`data()`、`methods`、`computed` 物件寫法）
- SFC 結構順序：`<template>` → `<script setup>` → `<style scoped>`
- 新元件必須加 `scoped` 於 `<style>` 標籤

### 命名慣例

| 項目 | 規則 | 範例 |
|------|------|------|
| 元件檔名 | PascalCase | `NutriCard.vue` |
| CSS class | kebab-case | `.nutri-card`, `.hero-badge` |
| JS 變數 / ref | camelCase | `isScrolled`, `activeTab` |
| 資料陣列 | camelCase 複數 | `nutritionists`, `pricingPlans` |
| CSS 變數 | `--` 前綴 kebab-case | `--bg-dark`, `--accent` |
| 事件處理函式 | camelCase 動詞開頭 | `handleScroll`, `toggleMenu` |
| Composables | `use` 前綴 camelCase | `useReveal`, `useScroll` |

### 目錄結構

```
src/
├── assets/          # 需經 Vite 處理的靜態資源（import 引入）
├── components/      # 可複用元件
├── composables/     # 可複用邏輯（Composition API 抽離）
│   └── useReveal.js # 入場動畫 composable（選配）
├── views/           # 頁面級元件
├── styles/
│   └── global.css   # 全域設計變數、reset、工具類別
├── App.vue          # 根元件
└── main.js          # 進入點
public/
└── assets/          # 不經 Vite 處理的靜態資源（絕對路徑引用 /assets/...）
```

## 設計系統（Design Tokens）

所有顏色、字型、圓角、動畫皆定義於 `src/styles/global.css` 的 `:root`，**禁止在元件中寫死色碼**。

### 色彩

| 變數 | 色碼 | 用途 |
|------|------|------|
| `--bg` | `#f5f0eb` | 主背景（暖米色） |
| `--bg-dark` | `#1a1613` | 深色區塊背景 / 深色按鈕 |
| `--bg-card` | `#eae4dc` | 卡片背景 |
| `--text-primary` | `#1a1613` | 主要文字（深棕） |
| `--text-secondary` | `#6b5e52` | 次要文字（灰棕） |
| `--text-light` | `#f5f0eb` | 深色背景上的淺色文字 |
| `--accent` | `#c4a882` | 主強調色（金棕） |
| `--accent-dark` | `#a68b6b` | 次強調色（深金棕） |
| `--border` | `#d4ccc2` | 邊框 / 分隔線 |
| `--tag-bg` | `#ddd5cb` | 標籤底色 |

### 字型

| 變數 | 字體 | 用途 |
|------|------|------|
| `--font-display` | `'Cormorant Garamond', Georgia, serif` | 標題（優雅襯線體） |
| `--font-body` | `'Noto Sans TC', 'DM Sans', sans-serif` | 內文（無襯線體） |

- 標題（h1–h3）使用 `var(--font-display)`
- 內文、按鈕、標籤使用 `var(--font-body)`
- 字體已在 `index.html` 透過 Google Fonts `<link>` 載入，**勿在 CSS 中使用 `@import url()`**

### 圓角與動畫

- 標準圓角：`var(--radius)` → `16px`
- 大圓角：`var(--radius-lg)` → `24px`
- 標準過渡：`var(--transition)` → `0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`

### 整體風格關鍵字

- **暖色調、高級感、大地色系**
- 大量留白，寬鬆 padding
- 柔和圓角、淡陰影
- 滑順的入場動畫（opacity + translateY）

## CSS 撰寫規則

1. **一律使用 CSS 變數**，禁止直接寫 `color: #c4a882`，應寫 `color: var(--accent)`
2. 新增顏色需先於 `global.css` 的 `:root` 定義變數
3. 響應式斷點：
   - `@media (max-width: 1024px)` — 平板
   - `@media (max-width: 768px)` — 手機
4. 文字大小建議使用 `clamp()` 做流體排版
5. 佈局優先使用 CSS Grid / Flexbox
6. 動畫使用 `transform` + `opacity`（GPU 加速），避免 `top/left` 動畫

## 入場動畫（選配設計模式）

> **注意：入場動畫是選配功能，不是每個元件的預設標配。**
> 適用場景：Landing Page 大型 Section、需要視覺強調的區塊、首次進入畫面的重要內容。
> 不適用：導航欄、側邊欄、表單元素、小型功能元件、頻繁互動的 UI。

### 使用方式

CSS 樣式已定義於 `global.css`（`.reveal` / `.visible` / `.rd0`~`.rd4`），元件內**不需要重複撰寫**。

JS 邏輯透過 `useReveal()` composable 統一管理，避免每個元件各自建立 IntersectionObserver：

```js
// 僅在需要入場動畫的元件中引入
import { useReveal } from '@/composables/useReveal'
useReveal()                       // 觀察元件內所有 .reveal 元素
useReveal({ threshold: 0.3 })     // 自訂觸發門檻
useReveal({ root: sectionRef })   // 限定觀察範圍
```

```html
<!-- 在需要動畫的元素加上 class -->
<h2 class="reveal">標題</h2>
<p class="reveal rd1">描述文字（延遲 0.1s）</p>
```

### 無障礙

已在 `global.css` 加入 `@media (prefers-reduced-motion: reduce)` 自動停用動畫。

## 無障礙（A11y）

- 互動元素必須有 `aria-label`
- 使用語意化標籤：`<nav>`、`<section>`、`<footer>`、`<main>`
- 圖片必須有 `alt` 屬性

## 常用指令

```bash
npm run dev      # 啟動開發伺服器
npm run build    # 正式環境建構
npm run preview  # 預覽建構結果
```
