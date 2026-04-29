<template>
  <AppNavbar />

  <main class="coupons-page">
    <div class="coupons-container">

      <RouterLink to="/store" class="coupons-back" aria-label="返回商城">← 返回商城</RouterLink>

      <h1 class="coupons-title reveal">我的優惠券</h1>

      <!-- 輸入代碼領取 -->
      <section class="coupons-claim reveal rd1">
        <label class="coupons-claim-label">輸入優惠碼領取</label>
        <div class="coupons-claim-row">
          <input
            v-model="claimCode"
            type="text"
            class="coupons-claim-input"
            placeholder="例如:MyFitness222"
            @keydown.enter="handleClaim"
          />
          <button
            class="coupons-claim-btn"
            :disabled="!claimCode.trim() || claiming"
            @click="handleClaim"
          >
            {{ claiming ? '領取中…' : '領取' }}
          </button>
        </div>
      </section>

      <!-- 可領取清單 -->
      <section class="coupons-section">
        <h2 class="coupons-section-title reveal">可領取</h2>
        <div v-if="availableCoupons.length === 0" class="coupons-empty">
          目前沒有可領取的優惠券
        </div>
        <div v-else class="coupons-grid">
          <article
            v-for="c in availableCoupons"
            :key="c.id"
            class="coupon-card coupon-card--available"
          >
            <div class="coupon-card-discount">{{ formatDiscount(c) }}</div>
            <h3 class="coupon-card-name">{{ c.name }}</h3>
            <p class="coupon-card-desc">{{ c.description }}</p>
            <button
              class="coupon-card-btn"
              :disabled="claiming"
              @click="handleClaimByCode(c.code)"
            >領取</button>
          </article>
        </div>
      </section>

      <!-- 我的優惠券 -->
      <section class="coupons-section">
        <h2 class="coupons-section-title reveal">我的優惠券</h2>

        <h3 class="coupons-subtitle">未使用</h3>
        <div v-if="unusedCoupons.length === 0" class="coupons-empty">
          尚未領取任何優惠券
        </div>
        <div v-else class="coupons-grid">
          <article
            v-for="mc in unusedCoupons"
            :key="mc.id"
            class="coupon-card coupon-card--mine"
          >
            <div class="coupon-card-discount">{{ formatDiscount(mc.coupon) }}</div>
            <h3 class="coupon-card-name">{{ mc.coupon.name }}</h3>
            <p class="coupon-card-desc">{{ mc.coupon.description }}</p>
            <div class="coupon-card-meta">
              <span v-if="mc.expiresAt" class="coupon-card-expiry">
                {{ formatDate(mc.expiresAt) }} 到期({{ daysLeft(mc.expiresAt) }})
              </span>
              <span v-else-if="mc.coupon.visibleOnlyOnDayOfMonth" class="coupon-card-expiry">
                今日 23:59 截止
              </span>
              <span v-else>{{ formatDateRange(mc.coupon.startAt, mc.coupon.endAt) }}</span>
            </div>
            <RouterLink to="/cart" class="coupon-card-btn coupon-card-btn--link">前往使用</RouterLink>
          </article>
        </div>

        <h3 class="coupons-subtitle">已使用</h3>
        <div v-if="usedCoupons.length === 0" class="coupons-empty">
          沒有已使用的優惠券
        </div>
        <div v-else class="coupons-grid">
          <article
            v-for="mc in usedCoupons"
            :key="mc.id"
            class="coupon-card coupon-card--used"
          >
            <div class="coupon-card-discount">{{ formatDiscount(mc.coupon) }}</div>
            <h3 class="coupon-card-name">{{ mc.coupon.name }}</h3>
            <p class="coupon-card-desc">{{ mc.coupon.description }}</p>
            <div class="coupon-card-meta">
              <span>已使用於 {{ formatDate(mc.usedAt) }}</span>
            </div>
          </article>
        </div>
      </section>

    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppNavbar from '@/components/AppNavbar.vue'
import { useCoupon } from '@/composables/useCoupon'
import { useReveal } from '@/composables/useReveal'
import type { CouponDto } from '@/data/coupon'

useReveal()

const {
  availableCoupons,
  myCoupons,
  loadAvailable,
  loadMyCoupons,
  claim,
} = useCoupon()

const claimCode = ref('')
const claiming  = ref(false)

const unusedCoupons = computed(() => myCoupons.value.filter((mc) => !mc.isUsed))
const usedCoupons   = computed(() => myCoupons.value.filter((mc) => mc.isUsed))

onMounted(async () => {
  await Promise.all([loadAvailable(), loadMyCoupons()])
})

async function handleClaim(): Promise<void> {
  const code = claimCode.value.trim()
  if (!code) return
  await handleClaimByCode(code)
  claimCode.value = ''
}

async function handleClaimByCode(code: string): Promise<void> {
  if (claiming.value) return
  claiming.value = true
  try {
    await claim(code)
    ElMessage.success(`已領取：${code}`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : '領取失敗'
    ElMessage.error(msg)
  } finally {
    claiming.value = false
  }
}

function formatDiscount(c: CouponDto): string {
  if (c.discountType === 1) {
    return `折 NT$${Math.floor(c.discountValue).toLocaleString()}`
  }
  // 百分比：DiscountValue=10 → 9 折；=15 → 85 折
  const display = (100 - c.discountValue) / 10
  // 整數時用 9 折這種寫法；非整數例如 7.5 折就直接顯示
  const formatted = Number.isInteger(display) ? `${display} 折` : `${display.toFixed(1)} 折`
  return formatted
}

function formatDate(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function formatDateRange(startIso: string, endIso: string): string {
  return `${formatDate(startIso)} - ${formatDate(endIso)}`
}

function daysLeft(iso: string | null): string {
  if (!iso) return ''
  const target = new Date(iso)
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return '已過期'
  if (diffDays === 0) return '今日到期'
  return `剩 ${diffDays} 天`
}
</script>

<style scoped>
.coupons-page {
  padding: 120px 0 80px;
  min-height: 100vh;
  background: var(--bg);
}

.coupons-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

.coupons-back {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
  text-decoration: none;
  transition: color 0.3s;
}
.coupons-back:hover { color: var(--text-primary); }

.coupons-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 400;
  color: var(--text-primary);
  margin-bottom: 32px;
}

/* 領取輸入區 */
.coupons-claim {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  margin-bottom: 40px;
}
.coupons-claim-label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
  font-weight: 600;
}
.coupons-claim-row {
  display: flex;
  gap: 12px;
}
.coupons-claim-input {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  border: 1.5px solid var(--border);
  border-radius: 100px;
  background: var(--bg);
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.3s;
}
.coupons-claim-input:focus { border-color: var(--accent); }
.coupons-claim-btn {
  padding: 0 28px;
  height: 44px;
  border-radius: 100px;
  border: none;
  background: var(--bg-dark);
  color: var(--text-light);
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}
.coupons-claim-btn:hover { opacity: 0.85; }
.coupons-claim-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Section */
.coupons-section { margin-bottom: 48px; }
.coupons-section-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.coupons-subtitle {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 24px 0 12px;
}

.coupons-empty {
  padding: 32px 0;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Grid */
.coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* Card */
.coupon-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.3s, box-shadow 0.3s;
}
.coupon-card--available:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(26, 22, 19, 0.06);
}
.coupon-card--used {
  opacity: 0.55;
  filter: grayscale(0.4);
}

.coupon-card-discount {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--accent-dark);
  margin-bottom: 4px;
}
.coupon-card-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.coupon-card-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  min-height: 2.5em;
}
.coupon-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 4px;
}
.coupon-card-expiry {
  color: var(--accent-dark);
  font-weight: 600;
}
.coupon-card-btn {
  margin-top: 12px;
  padding: 10px 20px;
  border-radius: 100px;
  border: 1.5px solid var(--text-primary);
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s;
}
.coupon-card-btn:hover:not(:disabled) {
  background: var(--bg-dark);
  color: var(--text-light);
  border-color: var(--bg-dark);
}
.coupon-card-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.coupon-card-btn--link { display: inline-block; }

@media (max-width: 768px) {
  .coupons-page { padding: 100px 0 60px; }
  .coupons-claim-row { flex-direction: column; }
  .coupons-claim-btn { width: 100%; }
}
</style>
