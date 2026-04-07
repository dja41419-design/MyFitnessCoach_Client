---
name: create-page
description: 建立符合 MyFitnessCoach 設計規範的完整頁面
user_invocable: true
---

# 建立新頁面

當使用者要求建立新的頁面（view）時，請遵循以下規範，確保與 Landing Page 風格一致。

## 步驟

1. **讀取現有設計**：先讀取 `src/styles/global.css` 和 `src/views/MyFitnessCoach.vue` 了解設計系統與現有頁面風格
2. **確認頁面結構**：與使用者確認需要哪些 section
3. **判斷哪些區塊需要入場動畫**：只有大型展示區塊才需要，功能性區塊不加
4. **在 `src/views/` 建立頁面元件**
5. **如已安裝 Vue Router，在 router 設定中註冊路由**

## 頁面模板

```vue
<template>
  <!-- ========== NAVBAR ========== -->
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="container nav-inner">
      <a href="/" class="nav-logo">
        <img src="/assets/logo.png" alt="Logo" class="logo-img" />
        My Fitness Coach
      </a>
      <div class="nav-links">
        <!-- 依頁面需求調整導覽連結 -->
      </div>
    </div>
  </nav>

  <!-- ========== 頁面主內容 ========== -->
  <main>
    <!-- Section 1：展示型區塊 → 可加 reveal 動畫 -->
    <section class="section-name" id="section-id">
      <div class="container">
        <h2 class="reveal">區塊標題</h2>
        <p class="reveal rd1">區塊描述文字</p>
        <!-- 內容 -->
      </div>
    </section>

    <!-- Section 2：功能型區塊 → 不加動畫，直接顯示 -->
    <section class="section-name-2">
      <div class="container">
        <!-- 表單、互動功能等 -->
      </div>
    </section>
  </main>

  <!-- ========== FOOTER ========== -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">
            <img src="/assets/logo.png" alt="Logo" class="logo-img" />
            My Fitness Coach
          </div>
          <p>全方位體態管理整合平台</p>
        </div>
        <!-- Footer columns -->
      </div>
      <div class="footer-bottom">
        <span>&copy; {{ new Date().getFullYear() }} My Fitness Coach</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useReveal } from '@/composables/useReveal'

// ── Navbar 滾動效果 ──
const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 40
}

// ── 平滑捲動 ──
const scrollTo = (selector) => {
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' })
}

// ── 入場動畫（選配：僅需要動畫的頁面才呼叫） ──
useReveal()

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* ── 共用容器 ── */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── Navbar ── */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 20px 0;
  transition: all var(--transition);
}
.navbar.scrolled {
  background: rgba(245, 240, 235, 0.95);
  backdrop-filter: blur(12px);
  padding: 12px 0;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
}
.logo-img {
  height: 32px;
  width: auto;
}
.nav-links {
  display: flex;
  gap: 32px;
}
.nav-links a {
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: color var(--transition);
}
.nav-links a:hover {
  color: var(--text-primary);
}

/* ── Section 通用 ── */
section {
  padding: 100px 0;
}
section h2 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}
section p {
  font-family: var(--font-body);
  color: var(--text-secondary);
  line-height: 1.8;
}

/* ── Footer ── */
.footer {
  background: var(--bg-dark);
  color: var(--text-light);
  padding: 60px 0 30px;
}
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
}
.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 16px;
}
.footer-bottom {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* ── 響應式 ── */
@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 768px) {
  section {
    padding: 60px 0;
  }
  .nav-links {
    display: none;
  }
  .footer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```

## 入場動畫使用指引

> **動畫是選配，不是標配。**

### 適合加動畫

- Landing Page 的大型展示 Section（Hero、產品介紹、定價方案）
- 首次進入畫面的重要視覺內容
- 使用者明確要求「加動畫」或「增加動態感」

### 不適合加動畫

- 導航欄、側邊欄（應立即顯示）
- 表單、輸入框（會干擾操作）
- Modal、Drawer、Toast（有自己的出現邏輯）
- 功能性按鈕、工具列
- 頁面內大量重複的列表項目（造成 UX 疲勞）

### 使用方式

CSS 已在 `global.css` 全域定義（`.reveal` / `.visible` / `.rd0`~`.rd4`），**元件內不需要重複寫動畫 CSS**。

JS 只需在頁面級呼叫一次 `useReveal()`，統一管理該頁所有 `.reveal` 元素：

```js
import { useReveal } from '@/composables/useReveal'
useReveal()
```

## 設計一致性檢查清單

建立頁面後，請逐項確認：

- [ ] 所有顏色皆使用 CSS 變數（`var(--bg)`, `var(--accent)` 等），無寫死色碼
- [ ] 標題使用 `font-family: var(--font-display)`（Cormorant Garamond）
- [ ] 內文使用 `font-family: var(--font-body)`（Noto Sans TC / DM Sans）
- [ ] 圓角使用 `var(--radius)` 或 `var(--radius-lg)`，無寫死數值
- [ ] 過渡動畫使用 `var(--transition)`
- [ ] Navbar 樣式與 Landing Page 一致（固定定位、滾動變色）
- [ ] Footer 樣式與 Landing Page 一致
- [ ] 入場動畫僅用於展示型區塊，功能型區塊直接顯示
- [ ] 動畫 CSS 來自 `global.css`，元件內無重複定義
- [ ] 響應式處理了 1024px 和 768px 斷點
- [ ] 互動元素有 `aria-label`
- [ ] 圖片有 `alt` 屬性
- [ ] 使用 `<script setup>` + Composition API
- [ ] `<style scoped>` 已加上 `scoped`
- [ ] 整體視覺風格為：暖色大地色系、高級感、大量留白

## 深色區塊範例

頁面中如需深色背景區塊（如 Landing Page 的「飲食追蹤」區段）：

```css
.dark-section {
  background: var(--bg-dark);
  color: var(--text-light);
  padding: 100px 0;
}
.dark-section h2 {
  color: var(--text-light);
}
.dark-section p {
  color: rgba(245, 240, 235, 0.65);
}
```

## Section Header 範例（含側邊按鈕）

```css
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 48px;
  gap: 24px;
}
.section-header h2 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
}
.section-header p {
  color: var(--text-secondary);
  margin-top: 8px;
  line-height: 1.8;
}
```

## 卡片網格範例

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform var(--transition);
}
.card:hover {
  transform: translateY(-4px);
}
```
