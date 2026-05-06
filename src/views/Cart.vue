<template>
  <AppNavbar />

  <main class="cart-page">
    <div class="cart-container">

      <RouterLink to="/store" class="cart-back" aria-label="返回商城">← 返回商城</RouterLink>

      <h1 class="cart-title">購物車</h1>

      <!-- 空狀態 -->
      <div v-if="items.length === 0" class="cart-empty">
        <p>購物車是空的</p>
        <RouterLink to="/store" class="cart-empty-btn">去逛逛商城</RouterLink>
      </div>

      <!-- 購物車內容 -->
      <div v-else class="cart-layout">
        <!-- 商品清單 -->
        <div class="cart-list">
          <div v-for="item in items" :key="item.id" class="cart-row">
            <img
              :src="`/api/StoreApi/ProductImage/${item.productId}`"
              :alt="item.name"
              class="cart-row-img"
            />

            <div class="cart-row-info">
              <div class="cart-row-category">{{ item.categoryName }}</div>
              <h3 class="cart-row-name">{{ item.name }}</h3>
              <div class="cart-row-price">NT${{ formatPrice(item.unitPrice) }}</div>
            </div>

            <div class="cart-row-qty">
              <button
                class="qty-btn"
                aria-label="減少數量"
                @click="updateQty(item.id, item.qty - 1)"
              >−</button>
              <input
                type="number"
                min="1"
                :value="item.qty"
                class="qty-input"
                @change="handleQtyInput($event, item.id)"
              />
              <button
                class="qty-btn"
                aria-label="增加數量"
                @click="updateQty(item.id, item.qty + 1)"
              >＋</button>
            </div>

            <div class="cart-row-subtotal">
              NT${{ formatPrice(item.unitPrice * item.qty) }}
            </div>

            <button
              class="cart-row-remove"
              aria-label="移除"
              @click="removeItem(item.id)"
            >✕</button>
          </div>
        </div>

        <!-- 底部結算 -->
        <div class="cart-summary">
          <!-- 優惠券區塊（僅登入時顯示） -->
          <div v-if="loggedIn" class="cart-coupon">
            <div class="cart-coupon-row">
              <label class="cart-coupon-label">優惠券</label>
              <select
                v-model="selectedCouponId"
                class="cart-coupon-select"
                @change="handleCouponChange"
              >
                <option :value="null">不使用</option>
                <option
                  v-for="mc in usableMyCoupons"
                  :key="mc.id"
                  :value="mc.id"
                >{{ mc.coupon.name }}{{ formatExpirySuffix(mc) }}</option>
              </select>
              <button
                type="button"
                class="cart-coupon-auto-btn"
                :disabled="!usableMyCoupons.length || subtotal <= 0 || autoPicking"
                @click="handleAutoPick"
                aria-label="自動選擇折扣最多的優惠券"
              >{{ autoPicking ? '計算中…' : '✨ 自動選最划算' }}</button>
              <RouterLink to="/coupons" class="cart-coupon-link">我的優惠券 →</RouterLink>
            </div>
            <p
              v-if="discountPreview && !discountPreview.isValid && discountPreview.message"
              class="cart-coupon-msg"
            >{{ discountPreview.message }}</p>
          </div>

          <div class="cart-summary-row">
            <span>總件數</span>
            <span>{{ itemCount }} 件</span>
          </div>
          <div class="cart-summary-row">
            <span>小計</span>
            <span>NT${{ formatPrice(subtotal) }}</span>
          </div>
          <div v-if="appliedDiscount > 0" class="cart-summary-row cart-discount">
            <span>優惠折扣</span>
            <span>−NT${{ formatPrice(appliedDiscount) }}</span>
          </div>
          <div class="cart-summary-row cart-total">
            <span>應付總計</span>
            <span>NT${{ formatPrice(finalTotal) }}</span>
          </div>
          <div class="cart-actions">
            <button class="cart-clear-btn" @click="handleClear">清空購物車</button>
            <button class="cart-checkout-btn" @click="handleCheckout">去結帳</button>
          </div>
        </div>
      </div>

    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCart } from '@/composables/useCart'
import { useCoupon } from '@/composables/useCoupon'
import type { MemberCouponDto } from '@/data/coupon'
import AppNavbar from '@/components/AppNavbar.vue'

const router = useRouter()

const { items, itemCount, subtotal, updateQty, removeItem, clearCart } = useCart()
const {
  usableMyCoupons,
  selectedMemberCouponId,
  discountPreview,
  wasAutoPicked,
  loadMyCoupons,
  applyCoupon,
  clearCoupon,
  pickBestCoupon,
} = useCoupon()

const autoPicking = ref(false)

const loggedIn = ref(!!localStorage.getItem('username'))

// 雙向綁定優惠券下拉
const selectedCouponId = computed<number | null>({
  get: () => selectedMemberCouponId.value,
  set: (v) => {
    selectedMemberCouponId.value = v
  },
})

// 套用後實際的折扣 / 應付（無券或試算失敗時退回 0）
const appliedDiscount = computed(() =>
  discountPreview.value?.isValid ? discountPreview.value.discountAmount : 0,
)
const finalTotal = computed(() => Math.max(0, subtotal.value - appliedDiscount.value))

onMounted(async () => {
  if (!loggedIn.value) return
  await loadMyCoupons()
  // 進入購物車時自動挑最划算的券（僅在尚未選任何券時觸發，不覆蓋使用者先前的手動選擇）
  if (selectedMemberCouponId.value == null && subtotal.value > 0) {
    await runAutoPick({ silent: true })
  }
})

// 小計變動時:
//   自動模式 → 重跑 pickBestCoupon,可能從無到有 / 切換更划算 / 變成沒券
//   手動模式 → 只重試算當前已選券,尊重使用者選擇
watch(subtotal, async (newVal) => {
  if (newVal <= 0) return

  if (wasAutoPicked.value) {
    const prevId = selectedMemberCouponId.value
    const picked = await pickBestCoupon(newVal)
    if (picked && picked.id !== prevId) {
      ElMessage.success(
        `已自動切換為「${picked.coupon.name}」，省 NT$${formatPrice(discountPreview.value?.discountAmount ?? 0)}`,
      )
    }
    // picked === null 或同一張:不 toast 避免吵
  } else if (selectedMemberCouponId.value) {
    await applyCoupon(selectedMemberCouponId.value, newVal)
  }
})

async function handleCouponChange(): Promise<void> {
  if (selectedMemberCouponId.value == null) {
    clearCoupon()
    return
  }
  await applyCoupon(selectedMemberCouponId.value, subtotal.value)
}

/** 共用的自動挑券流程；silent=true 時不顯示「沒有可用券」warning */
async function runAutoPick(opts: { silent?: boolean } = {}): Promise<void> {
  if (autoPicking.value) return
  autoPicking.value = true
  try {
    const picked = await pickBestCoupon(subtotal.value)
    if (!picked) {
      if (!opts.silent) ElMessage.warning('目前沒有可使用的優惠券')
      return
    }
    const saved = discountPreview.value?.discountAmount ?? 0
    if (saved > 0) {
      ElMessage.success(
        `已自動選用「${picked.coupon.name}」，省 NT$${formatPrice(saved)}`,
      )
    }
  } finally {
    autoPicking.value = false
  }
}

async function handleAutoPick(): Promise<void> {
  await runAutoPick()
}

function formatPrice(price: number): string {
  return Math.floor(price).toLocaleString()
}

function formatExpirySuffix(mc: MemberCouponDto): string {
  // 1. 個人到期日(WELCOME100)
  if (mc.expiresAt) {
    const target = new Date(mc.expiresAt)
    const diffDays = Math.ceil((target.getTime() - Date.now()) / 86400000)
    if (diffDays < 0) return ''
    const m = target.getMonth() + 1
    const d = target.getDate()
    if (diffDays === 0) return ` (${m}/${d} 到期 · 今日到期)`
    return ` (${m}/${d} 到期 · 剩 ${diffDays} 天)`
  }
  // 2. 限當日券(DAY22 等):後端只在當日下發,顯示「今日 23:59 截止」
  if (mc.coupon.visibleOnlyOnDayOfMonth) {
    return ' (今日 23:59 截止)'
  }
  return ''
}

function handleQtyInput(e: Event, id: number): void {
  const val = Number((e.target as HTMLInputElement).value)
  if (!Number.isFinite(val) || val < 1) {
    updateQty(id, 1)
  } else {
    updateQty(id, Math.floor(val))
  }
}

async function handleClear(): Promise<void> {
  try {
    await ElMessageBox.confirm('確定要清空購物車嗎？', '確認', {
      confirmButtonText: '清空',
      cancelButtonText: '取消',
      type: 'warning',
    })
    clearCart()
    clearCoupon()
    ElMessage.success('已清空購物車')
  } catch {
    // 使用者取消
  }
}

function handleCheckout(): void {
  router.push('/checkout')
}
</script>

<style scoped>
.cart-page {
  padding: 120px 0 80px;
  min-height: 100vh;
  background: var(--bg);
}

.cart-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

.cart-back {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
  text-decoration: none;
  transition: color 0.3s;
}

.cart-back:hover {
  color: var(--text-primary);
}

.cart-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 400;
  color: var(--text-primary);
  margin-bottom: 40px;
}

/* 空狀態 */
.cart-empty {
  text-align: center;
  padding: 80px 0;
  color: var(--text-secondary);
}

.cart-empty p {
  font-size: 1rem;
  margin-bottom: 24px;
}

.cart-empty-btn {
  display: inline-block;
  padding: 12px 32px;
  border-radius: 100px;
  background: var(--bg-dark);
  color: var(--text-light);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.3s;
}

.cart-empty-btn:hover {
  opacity: 0.85;
}

/* 清單 */
.cart-list {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 8px 24px;
  border: 1px solid var(--border);
  margin-bottom: 24px;
}

.cart-row {
  display: grid;
  grid-template-columns: 88px 1fr auto auto 32px;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid var(--border);
}

.cart-row:last-child {
  border-bottom: none;
}

.cart-row-img {
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: var(--radius);
  background: var(--bg);
}

.cart-row-category {
  font-size: 0.68rem;
  color: var(--accent-dark);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.cart-row-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.3;
}

.cart-row-price {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.cart-row-qty {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover {
  border-color: var(--text-primary);
  background: var(--bg);
}

.qty-input {
  width: 48px;
  height: 28px;
  text-align: center;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  background: transparent;
  font-size: 0.85rem;
  color: var(--text-primary);
  font-family: var(--font-body);
  outline: none;
}

.qty-input:focus {
  border-color: var(--accent);
}

.cart-row-subtotal {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 90px;
  text-align: right;
}

.cart-row-remove {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
}

.cart-row-remove:hover {
  background: rgba(26, 22, 19, 0.08);
  color: var(--text-primary);
}

/* 結算區 */
.cart-summary {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 28px 32px;
  border: 1px solid var(--border);
}

.cart-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.cart-discount {
  color: var(--accent-dark);
}
.cart-discount span:last-child {
  font-weight: 600;
}

.cart-total {
  padding-top: 16px;
  margin-top: 8px;
  border-top: 1px solid var(--border);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.cart-total span:last-child {
  font-family: var(--font-display);
  font-size: 1.6rem;
}

/* 優惠券區塊 */
.cart-coupon {
  padding: 16px 0 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 8px;
}
.cart-coupon-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.cart-coupon-label {
  font-size: 0.92rem;
  color: var(--text-secondary);
  min-width: 50px;
}
.cart-coupon-select {
  flex: 1;
  min-width: 140px;
  height: 38px;
  padding: 0 14px;
  border: 1.5px solid var(--border);
  border-radius: 100px;
  background: var(--bg);
  font-family: var(--font-body);
  font-size: 0.88rem;
  color: var(--text-primary);
  outline: none;
  cursor: pointer;
  transition: border-color 0.3s;
}
.cart-coupon-select:focus { border-color: var(--accent); }
.cart-coupon-auto-btn {
  height: 38px;
  padding: 0 16px;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: var(--text-light);
  border-radius: 100px;
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}
.cart-coupon-auto-btn:hover:not(:disabled) {
  background: var(--accent-dark);
  border-color: var(--accent-dark);
}
.cart-coupon-auto-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.cart-coupon-link {
  font-size: 0.78rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.3s;
}
.cart-coupon-link:hover { color: var(--text-primary); }
.cart-coupon-msg {
  margin: 8px 0 0;
  font-size: 0.8rem;
  color: #c45c5c;
}

.cart-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.cart-clear-btn,
.cart-checkout-btn {
  padding: 12px 28px;
  border-radius: 100px;
  font-size: 0.9rem;
  font-family: var(--font-body);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.cart-clear-btn {
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
}

.cart-clear-btn:hover {
  border-color: var(--text-primary);
  color: var(--text-primary);
}

.cart-checkout-btn {
  border: none;
  background: var(--bg-dark);
  color: var(--text-light);
}

.cart-checkout-btn:hover {
  opacity: 0.85;
}

/* 響應式 */
@media (max-width: 768px) {
  .cart-page {
    padding: 100px 0 60px;
  }

  .cart-row {
    grid-template-columns: 72px 1fr 28px;
    grid-template-areas:
      "img info remove"
      "img qty  subtotal";
    gap: 12px;
  }

  .cart-row-img { grid-area: img; width: 72px; height: 72px; }
  .cart-row-info { grid-area: info; }
  .cart-row-qty { grid-area: qty; }
  .cart-row-subtotal { grid-area: subtotal; }
  .cart-row-remove { grid-area: remove; }

  .cart-summary {
    padding: 20px 24px;
  }

  .cart-actions {
    flex-direction: column;
  }

  .cart-actions button {
    width: 100%;
  }
}
</style>
