<template>
  <main class="checkout-page">
    <div class="checkout-container">

      <!-- 提交中：載入遮罩 -->
      <div v-if="submitting" class="checkout-loading">
        <div class="spinner"></div>
        <p>訂單處理中，即將導向付款頁面…</p>
      </div>

      <template v-else>
        <RouterLink to="/cart" class="checkout-back">← 返回購物車</RouterLink>
        <h1 class="checkout-title">確認訂單</h1>

        <!-- 購物車空時 -->
        <div v-if="items.length === 0" class="checkout-empty">
          <p>購物車是空的</p>
          <RouterLink to="/store" class="btn-primary">去逛逛商城</RouterLink>
        </div>

        <div v-else class="checkout-layout">

          <!-- Row 1：訂單商品（橫幅） -->
          <section class="card">
            <h2 class="section-title">訂單商品</h2>
            <div v-for="item in items" :key="item.id" class="item-row">
              <img
                :src="`/api/StoreApi/ProductImage/${item.id}`"
                :alt="item.name"
                class="item-img"
              />
              <div class="item-info">
                <div class="item-category">{{ item.categoryName }}</div>
                <div class="item-name">{{ item.name }}</div>
                <div class="item-unit">NT${{ fmt(item.unitPrice) }} × {{ item.qty }}</div>
              </div>
              <div class="item-subtotal">NT${{ fmt(item.unitPrice * item.qty) }}</div>
            </div>
          </section>

          <!-- Row 2：訂購資訊 + 收件資訊（平行） -->
          <div class="checkout-forms">

            <!-- 訂購資訊 -->
            <section class="card">
              <h2 class="section-title">訂購資訊</h2>

              <label class="field-label">
                訂購人姓名 <span class="required">*</span>
                <input v-model="orderer.name" type="text" class="field-input" placeholder="請輸入姓名" />
              </label>

              <label class="field-label">
                手機號碼 <span class="required">*</span>
                <input v-model="orderer.phone" type="tel" class="field-input" placeholder="09XXXXXXXX" />
              </label>

              <label class="field-label">
                地址 <span class="required">*</span>
                <input v-model="orderer.address" type="text" class="field-input" placeholder="縣市 + 鄉鎮區 + 路段門號" />
              </label>
            </section>

            <!-- 收件資訊 -->
            <section class="card">
              <div class="section-title-row">
                <h2 class="section-title">收件資訊</h2>
                <label class="same-as-label">
                  <input type="checkbox" v-model="sameAsOrderer" class="same-as-check" />
                  同訂購資訊
                </label>
              </div>

              <label class="field-label">
                收件人姓名 <span class="required">*</span>
                <input v-model="receiver.name" type="text" class="field-input" placeholder="請輸入姓名" />
              </label>

              <label class="field-label">
                手機號碼 <span class="required">*</span>
                <input v-model="receiver.phone" type="tel" class="field-input" placeholder="09XXXXXXXX" />
              </label>

              <label class="field-label">
                收件地址 <span class="required">*</span>
                <input v-model="receiver.address" type="text" class="field-input" placeholder="縣市 + 鄉鎮區 + 路段門號" />
              </label>

              <label class="field-label">
                統一編號（選填）
                <input v-model="receiver.taxNumber" type="text" inputmode="numeric" class="field-input" placeholder="公司行號統編" />
              </label>

              <label class="field-label">
                備註（選填）
                <input v-model="receiver.memo" type="text" class="field-input" placeholder="送達時間或其他說明" />
              </label>
            </section>

          </div>

          <!-- Row 3：金額摘要 + 送出（右對齊） -->
          <!-- TODO: 接上 CouponService.PreviewDiscountAsync -->
          <div class="checkout-bottom">
            <section class="card summary-card">
              <div class="summary-row">
                <span>小計</span>
                <span>NT${{ fmt(subtotal) }}</span>
              </div>
              <div class="summary-row">
                <span>運費</span>
                <span>{{ shippingFee === 0 ? '免運' : `NT$${fmt(shippingFee)}` }}</span>
              </div>
              <div v-if="subtotal > 0 && subtotal < 1000" class="summary-hint">
                再購 NT${{ fmt(1000 - subtotal) }} 即享免運
              </div>
              <div class="summary-row summary-total">
                <span>總金額</span>
                <span>NT${{ fmt(subtotal + shippingFee) }}</span>
              </div>
            </section>
            <p v-if="errorMsg" class="checkout-error">{{ errorMsg }}</p>
            <div class="checkout-actions">
              <RouterLink to="/cart" class="btn-back-cart">回購物車</RouterLink>
              <button class="btn-checkout" :disabled="submitting" @click="handleSubmit">
                前往付款
              </button>
            </div>
          </div>

        </div>
      </template>

    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { fetchWithAuth } from '@/data/fetchWithAuth'
import type { EcPayResponse } from '@/types/lesson'

const { items, subtotal } = useCart()

const shippingFee = computed(() => subtotal.value >= 1000 ? 0 : 60)

// 訂購資訊（預設帶入會員資料）
const orderer = ref({ name: '', phone: '', address: '' })

// 收件資訊
const receiver = ref({ name: '', phone: '', address: '', taxNumber: '', memo: '' })

// 同訂購資訊勾選
const sameAsOrderer = ref(false)

function syncFromOrderer(): void {
  receiver.value.name = orderer.value.name
  receiver.value.phone = orderer.value.phone
  receiver.value.address = orderer.value.address
}

watch(sameAsOrderer, (val) => {
  if (val) syncFromOrderer()
})

const submitting = ref(false)
const errorMsg = ref('')

function fmt(n: number): string {
  return Math.floor(n).toLocaleString()
}

onMounted(async () => {
  try {
    const res = await fetchWithAuth('/api/Member/Info')
    if (res.ok) {
      const data = await res.json()
      orderer.value.name = data.name ?? ''
      orderer.value.phone = data.phone ?? ''
    }
  } catch {
    // 取得失敗不阻擋頁面，讓使用者手動填
  }
})

function validate(): string {
  if (!orderer.value.name.trim()) return '請填寫訂購人姓名'
  if (!orderer.value.phone.trim()) return '請填寫訂購人手機號碼'
  if (!orderer.value.address.trim()) return '請填寫訂購人地址'
  if (!receiver.value.name.trim()) return '請填寫收件人姓名'
  if (!receiver.value.phone.trim()) return '請填寫收件人手機號碼'
  if (!receiver.value.address.trim()) return '請填寫收件地址'
  if (receiver.value.taxNumber && !/^\d{8}$/.test(receiver.value.taxNumber))
    return '統一編號格式錯誤（需為 8 位數字）'
  return ''
}

async function handleSubmit(): Promise<void> {
  errorMsg.value = ''
  const validationError = validate()
  if (validationError) {
    errorMsg.value = validationError
    return
  }

  submitting.value = true

  try {
    // Step 1：建立訂單（隊友的 CheckoutApi）
    // TODO: 確認隊友的 endpoint 路徑與 request body 格式
    const orderRes = await fetchWithAuth('/api/CheckoutApi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiver: receiver.value.name.trim(),
        mobile: receiver.value.phone.trim(),
        address: receiver.value.address.trim(),
        taxNumber: receiver.value.taxNumber ? parseInt(receiver.value.taxNumber) : null,
        memo: receiver.value.memo.trim() || null,
        couponId: null, // TODO: 等優惠券功能完成後帶入
      }),
    })

    if (!orderRes.ok) {
      const body = await orderRes.json().catch(() => ({}))
      throw new Error((body as any).error ?? `建立訂單失敗（${orderRes.status}）`)
    }

    const { productOrderId } = await orderRes.json() as { productOrderId: number }

    // Step 2：取得綠界表單參數
    const payFormData = new URLSearchParams()
    payFormData.append('productOrderId', productOrderId.toString())

    const payRes = await fetchWithAuth('/api/Payment/ProductSendToEcPay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payFormData,
    })

    if (!payRes.ok) {
      const body = await payRes.json().catch(() => ({}))
      throw new Error((body as any).error ?? `金流初始化失敗（${payRes.status}）`)
    }

    const ecpay: EcPayResponse = await payRes.json()

    // Step 3：動態送出表單至綠界
    const ecForm = document.createElement('form')
    ecForm.method = 'POST'
    ecForm.action = ecpay.action
    for (const key in ecpay.parameters) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = ecpay.parameters[key]
      ecForm.appendChild(input)
    }
    document.body.appendChild(ecForm)
    ecForm.submit()

  } catch (err: any) {
    errorMsg.value = err.message ?? '發生未知錯誤，請稍後再試'
    submitting.value = false
  }
}
</script>

<style scoped>
.checkout-page {
  padding: 120px 0 80px;
  min-height: 100vh;
  background: var(--bg);
}

.checkout-container {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}

.checkout-back {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
  text-decoration: none;
  transition: color 0.3s;
}
.checkout-back:hover { color: var(--text-primary); }

.checkout-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 400;
  color: var(--text-primary);
  margin-bottom: 40px;
}

/* 載入中 */
.checkout-loading {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: var(--text-secondary);
}
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(26, 22, 19, 0.1);
  border-top-color: var(--bg-dark);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 空狀態 */
.checkout-empty {
  text-align: center;
  padding: 80px 0;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* 主版面 */
.checkout-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 共用卡片 */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 28px;
  border: 1px solid var(--border);
}

/* Row 2：訂購 + 收件平行 */
.checkout-forms {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

/* Row 3：金額摘要右對齊 */
.checkout-bottom {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.summary-card {
  width: 420px;
}

/* section 標題列 */
.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--text-primary);
  margin-bottom: 20px;
}
.section-title-row .section-title { margin-bottom: 0; }

/* 同訂購資訊 */
.same-as-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
}
.same-as-check {
  width: 15px;
  height: 15px;
  accent-color: var(--bg-dark);
  cursor: pointer;
}

/* 商品列 */
.item-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
}
.item-row:last-child { border-bottom: none; }

.item-img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: var(--radius);
  background: var(--bg);
  flex-shrink: 0;
}

.item-info { flex: 1; min-width: 0; }
.item-category {
  font-size: 0.68rem;
  color: var(--accent-dark);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 2px;
}
.item-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}
.item-unit { font-size: 0.8rem; color: var(--text-secondary); }

.item-subtotal {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

/* 表單欄位 */
.field-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
}
.field-label:last-child { margin-bottom: 0; }

.required { color: #c0392b; }

.field-input {
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  font-size: 0.9rem;
  color: var(--text-primary);
  font-family: var(--font-body);
  outline: none;
  transition: border-color 0.3s, background 0.3s;
}
.field-input:focus { border-color: var(--accent-dark); }

.field-input--readonly {
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: not-allowed;
}

/* 金額摘要 */
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.92rem;
  color: var(--text-secondary);
  padding: 6px 0;
}
.summary-hint {
  font-size: 0.78rem;
  color: var(--accent-dark);
  text-align: right;
  margin-top: -2px;
  margin-bottom: 4px;
}
.summary-total {
  border-top: 1px solid var(--border);
  margin-top: 8px;
  padding-top: 14px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}
.summary-total span:last-child {
  font-family: var(--font-display);
  font-size: 1.5rem;
}

/* 錯誤訊息 */
.checkout-error {
  font-size: 0.85rem;
  color: #c0392b;
  background: #fdf0ee;
  border-radius: var(--radius);
  padding: 10px 14px;
  margin: 0;
}

/* 按鈕 */
.checkout-actions {
  display: flex;
  gap: 12px;
  width: 420px;
}

.btn-back-cart,
.btn-checkout {
  flex: 1;
  padding: 14px;
  border-radius: 100px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  text-align: center;
  transition: opacity 0.3s, border-color 0.3s;
}

.btn-back-cart {
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-back-cart:hover { border-color: var(--text-primary); color: var(--text-primary); }

.btn-checkout {
  border: none;
  background: var(--bg-dark);
  color: var(--text-light);
}
.btn-checkout:hover:not(:disabled) { opacity: 0.85; }
.btn-checkout:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary {
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
.btn-primary:hover { opacity: 0.85; }

/* 響應式 */
@media (max-width: 900px) {
  .checkout-forms { grid-template-columns: 1fr; }
  .summary-card { width: 100%; }
  .checkout-bottom { align-items: stretch; }
  .checkout-actions { width: 100%; }
}
@media (max-width: 768px) {
  .checkout-page { padding: 100px 0 60px; }
}
</style>
