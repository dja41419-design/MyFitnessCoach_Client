<template>
  <AppNavbar />

  <div class="coupons-container-inner">

    <div class="section-header">
      <h2 class="section-title">我的優惠券</h2>
      <p class="section-desc">領取、查看與管理您的折扣券</p>
    </div>

    <!-- 輸入代碼領取 -->
    <section class="coupons-claim">
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
      <div class="coupons-section-head">
        <h3 class="coupons-section-title">可領取</h3>
        <button
          v-if="availableCoupons.length > 0"
          class="coupons-claim-all-btn"
          :disabled="claiming"
          @click="handleClaimAll"
          aria-label="一鍵領取所有可領取的優惠券"
        >{{ claiming ? '領取中…' : `一鍵領取全部 (${availableCoupons.length})` }}</button>
      </div>
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
          <h4 class="coupon-card-name">{{ c.name }}</h4>
          <p class="coupon-card-desc">{{ c.description }}</p>
          <button
            class="coupon-card-btn"
            :disabled="claiming"
            @click="handleClaimByCode(c.code)"
          >領取</button>
        </article>
      </div>
    </section>

    <!-- 我已領取的券 -->
    <section class="coupons-section">
      <h3 class="coupons-section-title">我擁有的優惠券</h3>

      <h4 class="coupons-subtitle">未使用</h4>
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
          <h4 class="coupon-card-name">{{ mc.coupon.name }}</h4>
          <p class="coupon-card-desc">{{ mc.coupon.description }}</p>
          <div class="coupon-card-meta">
            <span v-if="mc.expiresAt" class="coupon-card-expiry">
              {{ formatDate(mc.expiresAt) }} 到期({{ daysLeft(mc.expiresAt) }})
            </span>
            <span v-else-if="mc.coupon.visibleOnlyOnDayOfMonth" class="coupon-card-expiry">
              今日 23:59 截止
            </span>
            <span
              v-else-if="isLimitedTime(mc.coupon.startAt, mc.coupon.endAt)"
              class="coupon-card-expiry"
            >
              {{ formatLimitedExpiry(mc.coupon.endAt) }}
            </span>
            <!-- 長期券:不渲染任何日期 span -->
          </div>
          <RouterLink to="/cart" class="coupon-card-btn coupon-card-btn--link">前往使用</RouterLink>
        </article>
      </div>

      <h4 class="coupons-subtitle">已使用</h4>
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
          <h4 class="coupon-card-name">{{ mc.coupon.name }}</h4>
          <p class="coupon-card-desc">{{ mc.coupon.description }}</p>
          <div class="coupon-card-meta">
            <span>已使用於 {{ formatDate(mc.usedAt) }}</span>
          </div>
        </article>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppNavbar from '@/components/AppNavbar.vue'
import { useCoupon } from '@/composables/useCoupon'
import type { CouponDto } from '@/data/coupon'

const {
  availableCoupons,
  myCoupons,
  loadAvailable,
  loadMyCoupons,
  claim,
  claimAll,
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

async function handleClaimAll(): Promise<void> {
  if (claiming.value || availableCoupons.value.length === 0) return
  claiming.value = true
  try {
    const { ok, failed } = await claimAll()
    if (failed.length === 0) {
      ElMessage.success(`成功領取 ${ok} 張優惠券`)
    } else if (ok === 0) {
      ElMessage.error(`領取失敗：${failed[0].message}`)
    } else {
      ElMessage.warning(
        `領取 ${ok} 張，失敗 ${failed.length} 張（${failed.map((f) => f.code).join('、')}）`,
      )
    }
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

const LIMITED_TIME_THRESHOLD_DAYS = 60

/** 判斷是否為「短期限時券」(整體上下架期間 ≤ 60 天) */
function isLimitedTime(startIso: string, endIso: string): boolean {
  const start = new Date(startIso).getTime()
  const end   = new Date(endIso).getTime()
  const days  = (end - start) / (1000 * 60 * 60 * 24)
  return days <= LIMITED_TIME_THRESHOLD_DAYS
}

/** 短期券專用:回傳「5/15 到期 (剩 N 天)」格式
 *  EndAt 慣例為 exclusive upper bound (T00:00:00),所以顯示時減 1 天才是真實最後可用日。
 *  此函式只給短期券用,長期券走另一條 v-else-if 不渲染,所以這個 -1 不會影響其他卡片。 */
function formatLimitedExpiry(endIso: string): string {
  const d = new Date(endIso)
  d.setDate(d.getDate() - 1)
  return `${d.getMonth() + 1}/${d.getDate()} 到期 (${daysLeft(d.toISOString())})`
}

function daysLeft(iso: string | null): string {
  if (!iso) return ''
  const target = new Date(iso)
  const now = new Date()
  // 用 calendar day 比較,避免 DATETIME2(0) 進位 + 瀏覽器 / 伺服器 sub-second 時差
  // 造成「剛領券顯示 31 天、重整變 30 天」的跳動。
  // Math.round 是為了 DST 切換那兩天 (有 23/25 小時) 時保護整數結果。
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime()
  const todayDay  = new Date(now.getFullYear(),    now.getMonth(),    now.getDate()).getTime()
  const diffDays  = Math.round((targetDay - todayDay) / (1000 * 60 * 60 * 24))
  if (diffDays < 0)  return '已過期'
  if (diffDays === 0) return '今日到期'
  return `剩 ${diffDays} 天`
}
</script>

<style scoped>
.coupons-container-inner {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  margin-bottom: 8px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.section-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
}

/* 領取輸入區 */
.coupons-claim {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
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
.coupons-section {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
.coupons-section-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}
.coupons-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}
.coupons-section-head .coupons-section-title {
  margin: 0;
  padding-bottom: 0;
  border-bottom: none;
}
.coupons-claim-all-btn {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 18px;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: var(--text-light);
  border-radius: 100px;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}
.coupons-claim-all-btn:hover:not(:disabled) {
  background: var(--accent-dark);
  border-color: var(--accent-dark);
}
.coupons-claim-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  .coupons-claim,
  .coupons-section { padding: 20px; }
  .coupons-claim-row { flex-direction: column; }
  .coupons-claim-btn { width: 100%; }
  .section-title { font-size: 1.5rem; }
}
</style>
