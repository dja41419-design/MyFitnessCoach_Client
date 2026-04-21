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

    <!-- 載入中 -->
    <div v-if="loading" class="lesson-loading">
      <p>方案載入中...</p>
    </div>

    <!-- 方案卡片 Grid -->
    <section v-else-if="plans.length > 0" class="plans-section">
      <div class="container">
        <div class="plans-grid">
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="plan-card"
          >
            <!-- 圖片（有才顯示） -->
            <div v-if="plan.imageUrl" class="plan-img-wrap">
              <img :src="plan.imageUrl" :alt="plan.planName" class="plan-img" />
            </div>

            <!-- 卡片主體 -->
            <div class="plan-body">

              <!-- 點數 -->
              <div class="plan-points-label">{{ plan.points }} 點</div>

              <!-- 方案名稱 -->
              <h2 class="plan-name">{{ plan.planName }}</h2>

              <!-- 價格 -->
              <div class="plan-price-wrap">
                <span class="plan-currency">NT$</span>
                <span class="plan-price">{{ formatPrice(plan.price) }}</span>
              </div>

              <!-- 分隔線 -->
              <div class="plan-divider"></div>

              <!-- 說明 -->
              <p class="plan-desc">{{ plan.description }}</p>

              <!-- CTA 按鈕 -->
              <button
                class="plan-btn"
                :aria-label="`加入購物車 ${plan.planName}`"
                @click="addToCart(plan)"
              >
                立即購買
              </button>

            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 空狀態 / 錯誤 -->
    <div v-else class="lesson-empty">
      <p>目前沒有可用的方案，請稍後再試。</p>
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReveal } from '@/composables/useReveal'
import { topUpPlans as fallbackPlans, type TopUpPlanDto } from '@/data/topUpPlans'
import type { LessonPlan } from '@/types/lesson'

const router = useRouter()
const CART_KEY = 'lessonCart'

const plans = ref<LessonPlan[]>([])
const loading = ref(true)

function formatPrice(price: number) {
  return Math.floor(price).toLocaleString()
}

function addToCart(plan: LessonPlan) {
  try {
    const cart: LessonPlan[] = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    // 同一方案不重複加入，直接跳轉
    if (!cart.find(item => item.id === plan.id)) {
      cart.push({
        id: plan.id,
        planName: plan.planName,
        price: plan.price,
        points: plan.points,
        description: plan.description,
        imageUrl: plan.imageUrl,
      })
      localStorage.setItem(CART_KEY, JSON.stringify(cart))
    }
  } catch {
    // localStorage 不可用時直接跳轉
  }
  router.push('/lesson-cart')
}

async function fetchPlans() {
  const res = await fetch('/api/LessonApi/plans')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data: TopUpPlanDto[] = await res.json()
  
  if (data.length > 0) {
    // API 資料 imageUrl 若為空或 null，補上本地備用圖片路徑（依 id 對應）
    plans.value = data.map(plan => {
      const fallback = fallbackPlans.find(f => f.id === plan.id)?.imageUrl ?? null
      return {
        id: plan.id,
        planName: plan.planName,
        price: plan.price,
        points: plan.points,
        description: plan.description || '',
        imageUrl: (plan.imageUrl && plan.imageUrl.trim() !== '') ? plan.imageUrl : fallback,
      } as LessonPlan
    })
  } else {
    plans.value = fallbackPlans.map(p => ({
      id: p.id,
      planName: p.planName,
      price: p.price,
      points: p.points,
      description: p.description || '',
      imageUrl: p.imageUrl
    }))
  }
}

onMounted(async () => {
  window.scrollTo(0, 0)
  try {
    await fetchPlans()
  } catch (err) {
    plans.value = fallbackPlans.map(p => ({
      id: p.id,
      planName: p.planName,
      price: p.price,
      points: p.points,
      description: p.description || '',
      imageUrl: p.imageUrl
    }))
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
  padding: 64px 0 48px;
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

/* ── 方案 Grid ── */
.plans-section {
  padding-bottom: 80px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* ── 方案卡片 ── */
.plan-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid rgba(212, 204, 194, 0.5);
  transition: transform var(--transition), box-shadow var(--transition);
  display: flex;
  flex-direction: column;
  cursor: default;
}

.plan-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 50px rgba(26, 22, 19, 0.08);
}

/* 圖片 */
.plan-img-wrap {
  height: 160px;
  overflow: hidden;
  flex-shrink: 0;
  background: #fdfcfb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.plan-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.6s;
}

.plan-card:hover .plan-img {
  transform: scale(1.04);
}

/* 卡片主體 */
.plan-body {
  padding: 28px 32px 32px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 點數 */
.plan-points-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent-dark);
  margin-bottom: 8px;
}

/* 方案名稱 */
.plan-name {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 400;
  line-height: 1.15;
  margin: 0 0 20px;
  color: inherit;
}

/* 價格 */
.plan-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 24px;
}

.plan-currency {
  font-size: 1rem;
  font-weight: 600;
  color: inherit;
  opacity: 0.7;
}

.plan-price {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 600;
  color: inherit;
}

/* 分隔線 */
.plan-divider {
  height: 1px;
  background: var(--border);
  margin-bottom: 20px;
  opacity: 0.5;
}

/* 說明 */
.plan-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.7;
  flex: 1;
  margin-bottom: 28px;
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
  margin-top: auto;
}

.plan-btn {
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--text-primary);
}

.plan-btn:hover {
  background: var(--bg-dark);
  color: var(--text-light);
  border-color: var(--bg-dark);
  transform: translateY(-2px);
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

  .plan-body {
    padding: 24px 24px 28px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
