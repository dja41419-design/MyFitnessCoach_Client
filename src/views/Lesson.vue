<template>
  <div class="lesson-page">

    <!-- 固定頂部導覽 -->
    <nav class="page-nav">
      <div class="container">
        <RouterLink to="/" class="back-link" aria-label="返回首頁">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
          返回首頁
        </RouterLink>
      </div>
    </nav>

    <!-- 頁面標題 -->
    <header class="page-header">
      <div class="container">
        <div class="scroll-label reveal">Membership Plans</div>
        <h1 class="reveal rd1">儲值方案</h1>
        <p class="subtitle reveal rd2">靈活選擇最適合您的方案，點數儲值一次到位，按次扣抵不浪費。</p>
      </div>
    </header>

    <!-- 篩選 Tab -->
    <section class="filter-section">
      <div class="container">
        <div class="filter-tabs reveal rd2">
          <button
            class="filter-tab"
            :class="{ active: activeFilter === null }"
            aria-label="顯示全部方案"
            @click="activeFilter = null"
          >
            全部方案
          </button>
          <button
            v-for="tag in allTags"
            :key="tag"
            class="filter-tab"
            :class="{ active: activeFilter === tag }"
            :aria-label="`篩選${tag}方案`"
            @click="activeFilter = tag"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </section>

    <!-- 載入中 -->
    <div v-if="loading" class="lesson-loading">
      <p>方案載入中...</p>
    </div>

    <!-- 方案卡片 Grid -->
    <section v-else-if="filteredPlans.length > 0" class="plans-section">
      <div class="container">
        <div class="plans-grid">
          <div
            v-for="(plan, idx) in filteredPlans"
            :key="plan.name"
            class="plan-card reveal"
            :class="[plan.featured ? 'featured' : '', `rd${idx % 4}`]"
          >
            <!-- 標籤 -->
            <div v-if="plan.badge" class="plan-badge">{{ plan.badge }}</div>

            <!-- 方案名稱 -->
            <div class="plan-label">{{ plan.label }}</div>
            <h2 class="plan-name">{{ plan.name }}</h2>

            <!-- 價格 -->
            <div class="plan-price-wrap">
              <span class="plan-price">{{ plan.price }}</span>
              <span class="plan-unit"> / {{ plan.unit }}</span>
            </div>
            <p class="plan-period">{{ plan.period }}</p>

            <!-- 分隔線 -->
            <div class="plan-divider"></div>

            <!-- 功能列表 -->
            <ul class="plan-features" :aria-label="`${plan.name}功能列表`">
              <li v-for="feat in plan.features" :key="feat">
                <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="m5 13 4 4L19 7" />
                </svg>
                {{ feat }}
              </li>
            </ul>

            <!-- CTA 按鈕 -->
            <button
              class="plan-btn"
              :class="plan.btnStyle"
              :aria-label="`${plan.btnText} ${plan.name}`"
            >
              {{ plan.btnText }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 空狀態 -->
    <div v-else class="lesson-empty">
      <p>目前沒有符合條件的方案</p>
    </div>

    <!-- 補充說明區 -->
    <section class="info-section">
      <div class="container">
        <div class="info-grid">
          <div class="info-item reveal">
            <div class="info-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3>點數永久有效</h3>
            <p>購買後儲值點數不設使用期限，可按照自己的節奏安排諮詢。</p>
          </div>
          <div class="info-item reveal rd1">
            <div class="info-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>自選專屬營養師</h3>
            <p>依個人需求自由挑選最適合的營養師，每次諮詢均可更換。</p>
          </div>
          <div class="info-item reveal rd2">
            <div class="info-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 9h6M9 12h6M9 15h4" />
              </svg>
            </div>
            <h3>即時數位報告</h3>
            <p>每次諮詢後自動生成個人體態分析報告，隨時追蹤健康進度。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 頁尾 -->
    <footer class="simple-footer">
      <div class="container">
        <p>© 2025 My Fitness Coach. All rights reserved.</p>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useReveal } from '@/composables/useReveal'
import { plans as localPlans } from '@/data/plans'

const plans = ref([])
const loading = ref(true)
const activeFilter = ref(null)

const allTags = computed(() => {
  const tags = new Set()
  plans.value.forEach(plan => {
    if (plan.featured) tags.add('推薦方案')
    if (plan.badge) tags.add(plan.badge)
  })
  return Array.from(tags)
})

const filteredPlans = computed(() => {
  if (activeFilter.value === null) return plans.value
  if (activeFilter.value === '推薦方案') return plans.value.filter(p => p.featured)
  return plans.value.filter(p => p.badge === activeFilter.value)
})

async function fetchPlans() {
  try {
    const res = await fetch('/api/LessonApi/plans')
    if (!res.ok) throw new Error('API 回應異常')
    const data = await res.json()
    plans.value = data
  } catch {
    // API 尚未就緒時使用本地資料
    plans.value = localPlans
  }
}

onMounted(async () => {
  try {
    await fetchPlans()
  } finally {
    loading.value = false
  }
})

useReveal()
</script>

<style scoped>
/* ── 整體頁面 ── */
.lesson-page {
  background: var(--bg);
  min-height: 100vh;
  padding-top: 80px;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── 固定導覽列 ── */
.page-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 20px 0;
  background: rgba(245, 240, 235, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  transition: transform 0.3s, color 0.3s;
}

.back-link:hover {
  transform: translateX(-4px);
  color: var(--accent-dark);
}

/* ── 頁面標題 ── */
.page-header {
  padding: 64px 0 40px;
  text-align: center;
}

.scroll-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent-dark);
  margin-bottom: 16px;
}

.page-header h1 {
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 400;
  color: var(--text-primary);
  margin: 0 0 16px;
  line-height: 1.1;
}

.subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ── 篩選 Tab ── */
.filter-section {
  padding-bottom: 8px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.filter-tab {
  padding: 8px 22px;
  border-radius: 100px;
  font-size: 0.82rem;
  font-weight: 600;
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.filter-tab.active {
  background: var(--bg-dark);
  color: var(--text-light);
  border-color: var(--bg-dark);
}

.filter-tab:hover:not(.active) {
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

/* ── 方案 Grid ── */
.plans-section {
  padding-bottom: 80px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: start;
}

/* ── 方案卡片 ── */
.plan-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 40px 32px;
  border: 1px solid rgba(212, 204, 194, 0.5);
  transition: transform var(--transition), box-shadow var(--transition);
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: default;
}

.plan-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 50px rgba(26, 22, 19, 0.08);
}

.plan-card.featured {
  background: var(--bg-dark);
  border-color: transparent;
  color: var(--text-light);
}

/* 標籤 */
.plan-badge {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: var(--text-primary);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 5px 18px;
  border-radius: 100px;
  white-space: nowrap;
}

.plan-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-dark);
  margin-bottom: 8px;
}

.plan-card.featured .plan-label {
  color: var(--accent);
}

.plan-name {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 400;
  line-height: 1.15;
  margin: 0 0 20px;
  color: inherit;
}

/* 價格區 */
.plan-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-bottom: 6px;
}

.plan-price {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 600;
  color: inherit;
}

.plan-unit {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.plan-card.featured .plan-unit {
  color: rgba(245, 240, 235, 0.6);
}

.plan-period {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin: 0 0 24px;
  line-height: 1.5;
}

.plan-card.featured .plan-period {
  color: rgba(245, 240, 235, 0.55);
}

/* 分隔線 */
.plan-divider {
  height: 1px;
  background: var(--border);
  margin-bottom: 24px;
  opacity: 0.5;
}

.plan-card.featured .plan-divider {
  background: rgba(245, 240, 235, 0.15);
  opacity: 1;
}

/* 功能列表 */
.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  padding: 9px 0;
  border-bottom: 1px solid rgba(212, 204, 194, 0.25);
  color: inherit;
  line-height: 1.4;
}

.plan-features li:last-child {
  border-bottom: none;
}

.check-icon {
  flex-shrink: 0;
  color: var(--accent-dark);
}

.plan-card.featured .check-icon {
  color: var(--accent);
}

/* CTA 按鈕 */
.plan-btn {
  display: block;
  width: 100%;
  padding: 14px 24px;
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  border: none;
}

.plan-btn.light {
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--text-primary);
}

.plan-btn.light:hover {
  background: var(--bg-dark);
  color: var(--text-light);
  border-color: var(--bg-dark);
  transform: translateY(-2px);
}

.plan-btn.accent {
  background: var(--accent);
  color: var(--text-primary);
  border: 1.5px solid transparent;
}

.plan-btn.accent:hover {
  background: var(--accent-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(196, 168, 130, 0.35);
}

.plan-card.featured .plan-btn.light {
  border-color: rgba(245, 240, 235, 0.3);
  color: var(--text-light);
}

.plan-card.featured .plan-btn.light:hover {
  background: rgba(245, 240, 235, 0.12);
  border-color: rgba(245, 240, 235, 0.5);
}

/* ── 載入 / 空狀態 ── */
.lesson-loading,
.lesson-empty {
  text-align: center;
  padding: 80px 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* ── 補充說明區 ── */
.info-section {
  padding: 72px 0 80px;
  border-top: 1px solid var(--border);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.info-item {
  text-align: center;
}

.info-icon {
  width: 56px;
  height: 56px;
  background: var(--bg-card);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  border: 1px solid var(--border);
  color: var(--accent-dark);
}

.info-item h3 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 10px;
}

.info-item p {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 280px;
  margin: 0 auto;
}

/* ── 頁尾 ── */
.simple-footer {
  padding: 40px 0;
  text-align: center;
  border-top: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.85rem;
}

/* ── 響應式 ── */
@media (max-width: 1024px) {
  .plans-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .lesson-page {
    padding-top: 72px;
  }

  .page-header {
    padding: 48px 0 32px;
  }

  .plans-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .plan-card {
    padding: 36px 24px 28px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
