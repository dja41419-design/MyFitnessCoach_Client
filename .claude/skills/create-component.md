---
name: create-component
description: 建立符合 MyFitnessCoach 設計規範的 Vue 3 元件
user_invocable: true
---

# 建立新元件

當使用者要求建立新的 Vue 元件時，請遵循以下規範產出程式碼。

## 步驟

1. **確認元件用途**：詢問或根據上下文判斷此元件屬於 `components/`（可複用）或 `views/`（頁面級）
2. **讀取設計變數**：先讀取 `src/styles/global.css` 確認最新的 CSS 變數
3. **判斷是否需要入場動畫**：只有大型展示區塊才需要，一般功能元件不加
4. **產出元件**：依照下方模板建立 `.vue` 檔

## 元件模板

```vue
<template>
  <section class="元件名稱-kebab" id="section-id">
    <div class="container">
      <!-- 內容 -->
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

// ── Props ──
const props = defineProps({
  // propName: { type: String, required: true }
})

// ── Emits ──
const emit = defineEmits([])

// ── 響應式狀態 ──

// ── 入場動畫（選配：僅在大型展示區塊使用） ──
// import { useReveal } from '@/composables/useReveal'
// useReveal()
</script>

<style scoped>
/* ── 佈局 ── */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── 區塊樣式 ── */
/* 使用 CSS 變數，禁止寫死色碼 */
/* 背景：var(--bg) 或 var(--bg-dark) */
/* 文字：var(--text-primary) 或 var(--text-light) */
/* 強調色：var(--accent) */
/* 圓角：var(--radius) 或 var(--radius-lg) */
/* 過渡：var(--transition) */

/* ── 響應式 ── */
@media (max-width: 1024px) {
  /* 平板調整 */
}
@media (max-width: 768px) {
  /* 手機調整 */
}
</style>
```

## 強制規則

- **`<script setup>`**：一律使用 Composition API，禁止 Options API
- **`<style scoped>`**：新元件必須加 `scoped`
- **CSS 變數**：所有顏色、字型、圓角、動畫必須引用 `global.css` 中定義的變數，禁止寫死數值
- **字型**：標題用 `font-family: var(--font-display)`，內文用 `font-family: var(--font-body)`
- **色彩**：
  - 淺色背景區塊：背景 `var(--bg)`，文字 `var(--text-primary)`
  - 深色背景區塊：背景 `var(--bg-dark)`，文字 `var(--text-light)`
  - 按鈕 / 強調：`var(--accent)` 或 `var(--accent-dark)`
  - 卡片背景：`var(--bg-card)`
  - 標籤背景：`var(--tag-bg)`
- **命名**：
  - 檔名 PascalCase：`NutriCard.vue`
  - CSS class kebab-case：`.nutri-card`
  - JS 變數 camelCase：`isVisible`
- **佈局**：使用 CSS Grid 或 Flexbox，禁止 float
- **響應式**：必須處理 1024px 和 768px 兩個斷點
- **無障礙**：互動元素加 `aria-label`，圖片加 `alt`

## 入場動畫（選配）

> **不要預設加入動畫。** 只有在以下情況才加入：
> - 使用者明確要求「加動畫」或「增加動態感」
> - 元件是 Landing Page 上的大型展示 Section
> - 元件是首次進入畫面的重要視覺內容

**不適合加動畫的元件**：導航欄、側邊欄、表單、Modal、Toast、小型按鈕元件、頻繁互動的 UI

### 使用方式（需要時）

CSS 樣式已在 `global.css` 定義，**元件內不需要重複寫 `.reveal` 樣式**。

```vue
<template>
  <section class="my-section">
    <h2 class="reveal">標題</h2>
    <p class="reveal rd1">描述</p>
    <div class="reveal rd2">內容</div>
  </section>
</template>

<script setup>
import { useReveal } from '@/composables/useReveal'
useReveal()
</script>
```

## 按鈕樣式參考

```css
/* 主要按鈕（深色底） */
.btn-dark {
  display: inline-block;
  padding: 16px 40px;
  background: var(--bg-dark);
  color: var(--text-light);
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  transition: background var(--transition);
}
.btn-dark:hover {
  background: var(--accent-dark);
}

/* 外框按鈕 */
.btn-outline {
  display: inline-block;
  padding: 12px 28px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
  transition: all var(--transition);
}
.btn-outline:hover {
  background: var(--bg-dark);
  color: var(--text-light);
  border-color: var(--bg-dark);
}
```

## 卡片樣式參考

```css
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  transition: transform var(--transition);
}
.card:hover {
  transform: translateY(-4px);
}
```
