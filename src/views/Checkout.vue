<template>
  <main class="checkout-page">
    <div class="checkout-container">

      <!-- 提交中：載入遮罩 -->
      <div v-if="submitting" class="checkout-loading">
        <div class="spinner"></div>
        <p>{{ deliveryMethod === 'cvs' ? '訂單建立中…' : '訂單處理中，即將導向付款頁面…' }}</p>
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
                :src="`/api/StoreApi/ProductImage/${item.productId}`"
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

          <!-- Row 2：配送方式 -->
          <section class="card">
            <h2 class="section-title">配送方式</h2>
            <div class="delivery-options">
              <label class="delivery-option" :class="{ active: deliveryMethod === 'home' }">
                <input type="radio" v-model="deliveryMethod" value="home" class="delivery-radio" />
                <div class="delivery-icon">🏠</div>
                <div class="delivery-info">
                  <div class="delivery-name">宅配到府</div>
                  <div class="delivery-desc">信用卡／ATM／超商代碼付款</div>
                </div>
              </label>
              <label class="delivery-option" :class="{ active: deliveryMethod === 'cvs' }">
                <input type="radio" v-model="deliveryMethod" value="cvs" class="delivery-radio" />
                <div class="delivery-icon">🏪</div>
                <div class="delivery-info">
                  <div class="delivery-name">超商取貨付款</div>
                  <div class="delivery-desc">取貨時現場付款，免預先刷卡</div>
                </div>
              </label>
            </div>
          </section>

          <!-- Row 3：訂購資訊 + 收件資訊（平行） -->
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

              <label class="field-label" v-if="deliveryMethod === 'home'">
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

              <!-- 宅配：顯示地址欄位 -->
              <label class="field-label" v-if="deliveryMethod === 'home'">
                收件地址 <span class="required">*</span>
                <input v-model="receiver.address" type="text" class="field-input" placeholder="縣市 + 鄉鎮區 + 路段門號" />
              </label>

              <!-- 超商：顯示門市選擇 -->
              <div v-if="deliveryMethod === 'cvs'" class="cvs-selector">
                <div class="field-label">
                  超商品牌 <span class="required">*</span>
                  <div class="chain-options">
                    <label v-for="c in cvsChains" :key="c.value"
                      class="chain-option"
                      :class="{ active: cvsChain === c.value }"
                    >
                      <input type="radio" v-model="cvsChain" :value="c.value" class="chain-radio" />
                      {{ c.label }}
                    </label>
                  </div>
                </div>

                <div class="field-label">
                  取貨門市 <span class="required">*</span>
                  <div v-if="selectedStore.storeId" class="store-selected">
                    <div class="store-name">{{ selectedStore.storeName }}</div>
                    <div class="store-address">{{ selectedStore.address }}</div>
                    <button type="button" class="btn-reselect" @click="selectStore">重新選擇</button>
                  </div>
                  <button v-else type="button" class="btn-select-store" @click="selectStore">
                    選擇門市
                  </button>
                </div>
              </div>

              <div class="field-label">
                發票類型 <span class="required">*</span>
                <div class="chain-options">
                  <label v-for="t in invoiceTypes" :key="t.value"
                    class="chain-option"
                    :class="{ active: invoiceType === t.value }"
                  >
                    <input type="radio" v-model="invoiceType" :value="t.value" class="chain-radio" />
                    {{ t.label }}
                  </label>
                </div>
              </div>

              <label v-if="invoiceType === 2" class="field-label">
                統一編號 <span class="required">*</span>
                <input v-model="receiver.taxNumber" type="text" inputmode="numeric" maxlength="8" class="field-input" placeholder="8 碼公司統編" />
              </label>

              <label v-if="invoiceType === 3" class="field-label">
                愛心碼 <span class="required">*</span>
                <input v-model="donationCode" type="text" inputmode="numeric" maxlength="7" class="field-input" placeholder="3–7 碼愛心碼（如：25885）" />
              </label>

              <label v-if="invoiceType === 4" class="field-label">
                手機載具號碼 <span class="required">*</span>
                <input
                  v-model="carrierCode"
                  type="text"
                  maxlength="8"
                  class="field-input carrier-input"
                  placeholder="例如：/ABC+123"
                  @input="carrierCode = carrierCode.toUpperCase()"
                />
              </label>

              <label class="field-label">
                備註（選填）
                <input v-model="receiver.memo" type="text" class="field-input" placeholder="送達時間或其他說明" />
              </label>
            </section>

          </div>

          <!-- Row 4：金額摘要 + 送出（右對齊） -->
          <div class="checkout-bottom">
            <section class="card summary-card">
              <div class="summary-row">
                <span>小計</span>
                <span>NT${{ fmt(subtotal) }}</span>
              </div>
              <div v-if="discountAmount > 0" class="summary-row summary-discount">
                <span>優惠折抵</span>
                <span>－NT${{ fmt(discountAmount) }}</span>
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
                <span>NT${{ fmt(finalTotal) }}</span>
              </div>
            </section>
            <p v-if="errorMsg" class="checkout-error">{{ errorMsg }}</p>
            <div class="checkout-actions">
              <RouterLink to="/cart" class="btn-back-cart">回購物車</RouterLink>
              <button class="btn-checkout" :disabled="submitting" @click="handleSubmit">
                {{ deliveryMethod === 'cvs' ? '確認訂單' : '前往付款' }}
              </button>
            </div>
          </div>

        </div>
      </template>

    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { useCoupon } from '@/composables/useCoupon'
import { fetchWithAuth } from '@/data/fetchWithAuth'
import type { EcPayResponse } from '@/types/lesson'

const router = useRouter()
const { items, subtotal, clearCart } = useCart()
const { selectedMemberCouponId, discountPreview } = useCoupon()

const discountAmount = computed(() =>
  discountPreview.value?.isValid ? (discountPreview.value.discountAmount ?? 0) : 0
)
const finalTotal = computed(() => Math.max(0, subtotal.value - discountAmount.value) + shippingFee.value)
const shippingFee = computed(() => subtotal.value >= 1000 ? 0 : 60)

// 配送方式
const deliveryMethod = ref<'home' | 'cvs'>('home')

// 超商品牌
const cvsChains = [
  { value: 'FAMI',    label: '全家' },
  { value: 'UNIMART', label: '7-11' },
  { value: 'HILIFE',  label: '萊爾富' },
  { value: 'OKMART',  label: 'OK超商' },
]
const cvsChain = ref('FAMI')

// 已選門市
const selectedStore = ref({ storeId: '', storeName: '', address: '' })

// 訂購資訊（預設帶入會員資料）
const orderer = ref({ name: '', phone: '', address: '' })

// 收件資訊
const receiver = ref({ name: '', phone: '', address: '', taxNumber: '', memo: '' })

// 同訂購資訊勾選
const sameAsOrderer = ref(false)

// 發票類型
const invoiceTypes = [
  { value: 1, label: '二聯式' },
  { value: 2, label: '三聯式' },
  { value: 3, label: '捐贈發票' },
  { value: 4, label: '手機載具' },
]
const invoiceType = ref<1 | 2 | 3 | 4>(1)
const donationCode = ref('')
const carrierCode  = ref('')

function syncFromOrderer(): void {
  receiver.value.name    = orderer.value.name
  receiver.value.phone   = orderer.value.phone
  receiver.value.address = orderer.value.address
}

watch(sameAsOrderer, (val) => { if (val) syncFromOrderer() })

// 切換配送方式時清空門市
watch(deliveryMethod, () => {
  selectedStore.value = { storeId: '', storeName: '', address: '' }
})

const submitting = ref(false)
const errorMsg   = ref('')

function fmt(n: number): string {
  return Math.floor(n).toLocaleString()
}

// ── 接收門市選擇結果（postMessage from popup）──
function handleStoreMessage(event: MessageEvent): void {
  if (event.data?.type === 'STORE_SELECTED') {
    selectedStore.value = {
      storeId:   event.data.storeId   ?? '',
      storeName: event.data.storeName ?? '',
      address:   event.data.address   ?? '',
    }
  }
}

// ── 開啟綠界門市選擇 popup ──
async function selectStore(): Promise<void> {
  try {
    const res = await fetchWithAuth('/api/Logistics/MapForm', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ logisticsSubType: cvsChain.value }),
    })
    if (!res.ok) throw new Error('無法取得門市選擇頁面')

    const data: { action: string; parameters: Record<string, string> } = await res.json()

    const popup = window.open('', 'storeSelect', 'width=1024,height=768,scrollbars=yes')
    if (!popup) { errorMsg.value = '請允許彈出視窗以選擇門市'; return }

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = data.action
    form.target = 'storeSelect'
    for (const key in data.parameters) {
      const input = document.createElement('input')
      input.type  = 'hidden'
      input.name  = key
      input.value = data.parameters[key]
      form.appendChild(input)
    }
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  } catch (err: any) {
    errorMsg.value = err.message ?? '開啟門市選擇失敗'
  }
}

onMounted(async () => {
  window.addEventListener('message', handleStoreMessage)

  try {
    const res = await fetchWithAuth('/api/Member/Info')
    if (res.ok) {
      const data = await res.json()
      orderer.value.name  = data.name  ?? ''
      orderer.value.phone = data.phone ?? ''
    }
  } catch { /* 靜默，讓使用者手動填 */ }
})

onUnmounted(() => {
  window.removeEventListener('message', handleStoreMessage)
})

function validate(): string {
  if (!orderer.value.name.trim())  return '請填寫訂購人姓名'
  if (!orderer.value.phone.trim()) return '請填寫訂購人手機號碼'
  if (deliveryMethod.value === 'home' && !orderer.value.address.trim())
    return '請填寫訂購人地址'
  if (!receiver.value.name.trim())  return '請填寫收件人姓名'
  if (receiver.value.name.trim().length < 2 || receiver.value.name.trim().length > 10)
    return '收件人姓名需為 2–10 個字元'
  if (!receiver.value.phone.trim()) return '請填寫收件人手機號碼'
  if (deliveryMethod.value === 'home' && !receiver.value.address.trim())
    return '請填寫收件地址'
  if (deliveryMethod.value === 'cvs' && !selectedStore.value.storeId)
    return '請選擇取貨門市'
  if (invoiceType.value === 2 && !/^\d{8}$/.test(receiver.value.taxNumber.trim()))
    return '三聯式發票需填寫 8 碼統一編號'
  if (invoiceType.value === 3 && !/^\d{3,7}$/.test(donationCode.value.trim()))
    return '捐贈發票需填寫 3–7 碼愛心碼'
  if (invoiceType.value === 4 && !/^\/[0-9A-Z+\-.]{7}$/.test(carrierCode.value.trim()))
    return '手機載具格式錯誤（需為 / 開頭共 8 碼，例：/ABC+123）'
  return ''
}

async function handleSubmit(): Promise<void> {
  errorMsg.value = ''
  const validationError = validate()
  if (validationError) { errorMsg.value = validationError; return }

  submitting.value = true

  try {
    // ── 建立訂單（收件資訊 → ProductOrder）──────────────────
    const orderRes = await fetchWithAuth('/api/CartApi/checkout', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiver:        receiver.value.name.trim(),
        address:         deliveryMethod.value === 'home'
                           ? receiver.value.address.trim()
                           : selectedStore.value.address,
        mobile:          receiver.value.phone.trim(),
        taxNumber:       invoiceType.value === 2 ? Number(receiver.value.taxNumber) : null,
        memo:            receiver.value.memo.trim() || null,
        memberCouponId:  selectedMemberCouponId.value ?? null,
        invoiceType:     invoiceType.value,
        donationCode:    invoiceType.value === 3 ? donationCode.value.trim() : null,
        carrierCode:     invoiceType.value === 4 ? carrierCode.value.trim()  : null,
      }),
    })

    if (!orderRes.ok) {
      const body = await orderRes.json().catch(() => ({}))
      throw new Error((body as any).message ?? `建立訂單失敗（${orderRes.status}）`)
    }

    const { productOrderId } = await orderRes.json() as { productOrderId: number }

    // ── 超商取貨付款 ──────────────────────────────────────
    if (deliveryMethod.value === 'cvs') {
      const logRes = await fetchWithAuth('/api/Logistics/CreateOrder', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productOrderId,
          logisticsSubType: cvsChain.value,
          storeId:          selectedStore.value.storeId,
          storeName:        selectedStore.value.storeName,
          receiverName:     receiver.value.name.trim(),
          receiverPhone:    receiver.value.phone.trim(),
          receiverEmail:    '',
        }),
      })

      if (!logRes.ok) {
        const body = await logRes.json().catch(() => ({}))
        throw new Error((body as any).error ?? `物流建單失敗（${logRes.status}）`)
      }

      const { logisticsOrderNo } = await logRes.json() as { logisticsOrderNo: string }
      await clearCart()
      router.push(`/checkout-result?RtnCode=1&RtnMsg=OK&MerchantTradeNo=${logisticsOrderNo}&isCvs=1`)
      return
    }

    // ── 宅配線上付款 ──────────────────────────────────────
    const payFormData = new URLSearchParams()
    payFormData.append('productOrderId', productOrderId.toString())

    const payRes = await fetchWithAuth('/api/Payment/ProductSendToEcPay', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    payFormData,
    })

    if (!payRes.ok) {
      const body = await payRes.json().catch(() => ({}))
      throw new Error((body as any).error ?? `金流初始化失敗（${payRes.status}）`)
    }

    const ecpay: EcPayResponse = await payRes.json()

    const ecForm = document.createElement('form')
    ecForm.method = 'POST'
    ecForm.action = ecpay.action
    for (const key in ecpay.parameters) {
      const input = document.createElement('input')
      input.type  = 'hidden'
      input.name  = key
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
  width: 48px; height: 48px;
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
.checkout-layout { display: flex; flex-direction: column; gap: 24px; }

/* 共用卡片 */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 28px;
  border: 1px solid var(--border);
}

/* 配送方式 */
.delivery-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.delivery-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.delivery-option.active {
  border-color: var(--bg-dark);
  background: var(--bg);
}
.delivery-radio { display: none; }
.delivery-icon { font-size: 1.6rem; flex-shrink: 0; }
.delivery-name { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); }
.delivery-desc { font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; }

/* 表單雙欄 */
.checkout-forms {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

/* 超商品牌選擇 */
.cvs-selector { margin-bottom: 0; }
.chain-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.chain-option {
  padding: 7px 16px;
  border: 1.5px solid var(--border);
  border-radius: 100px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}
.chain-option.active {
  border-color: var(--bg-dark);
  background: var(--bg-dark);
  color: var(--text-light);
}
.chain-radio { display: none; }

/* 已選門市顯示 */
.store-selected {
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.store-name { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); }
.store-address { font-size: 0.8rem; color: var(--text-secondary); }
.btn-reselect {
  align-self: flex-start;
  margin-top: 6px;
  font-size: 0.78rem;
  color: var(--accent-dark);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

/* 選擇門市按鈕 */
.btn-select-store {
  padding: 10px 20px;
  border: 1.5px solid var(--bg-dark);
  border-radius: 100px;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.88rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.3s;
  align-self: flex-start;
}
.btn-select-store:hover { background: var(--bg-dark); color: var(--text-light); }

/* section 標題 */
.section-title-row {
  display: flex; align-items: center;
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
  display: flex; align-items: center; gap: 6px;
  font-size: 0.85rem; color: var(--text-secondary);
  cursor: pointer; user-select: none;
}
.same-as-check { width: 15px; height: 15px; accent-color: var(--bg-dark); cursor: pointer; }

/* 商品列 */
.item-row {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
}
.item-row:last-child { border-bottom: none; }
.item-img {
  width: 72px; height: 72px;
  object-fit: cover;
  border-radius: var(--radius);
  background: var(--bg);
  flex-shrink: 0;
}
.item-info { flex: 1; min-width: 0; }
.item-category {
  font-size: 0.68rem; color: var(--accent-dark);
  font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.08em; margin-bottom: 2px;
}
.item-name { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
.item-unit { font-size: 0.8rem; color: var(--text-secondary); }
.item-subtotal {
  font-family: var(--font-display);
  font-size: 1rem; font-weight: 600;
  color: var(--text-primary); white-space: nowrap;
}

/* 表單欄位 */
.field-label {
  display: flex; flex-direction: column; gap: 6px;
  font-size: 0.85rem; color: var(--text-secondary);
  margin-bottom: 16px;
}
.field-label:last-child { margin-bottom: 0; }
.required { color: #c0392b; }
.field-input {
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  font-size: 0.9rem; color: var(--text-primary);
  font-family: var(--font-body);
  outline: none;
  transition: border-color 0.3s;
}
.field-input:focus { border-color: var(--accent-dark); }
.carrier-input { font-family: 'Courier New', monospace; letter-spacing: 0.05em; }

/* 金額摘要 */
.checkout-bottom {
  display: flex; flex-direction: column;
  align-items: flex-end; gap: 16px;
}
.summary-card { width: 420px; }
.summary-row {
  display: flex; justify-content: space-between;
  font-size: 0.92rem; color: var(--text-secondary); padding: 6px 0;
}
.summary-discount {
  color: #c0392b;
}
.summary-hint {
  font-size: 0.78rem; color: var(--accent-dark);
  text-align: right; margin-top: -2px; margin-bottom: 4px;
}
.summary-total {
  border-top: 1px solid var(--border);
  margin-top: 8px; padding-top: 14px;
  font-size: 1.1rem; font-weight: 600; color: var(--text-primary);
}
.summary-total span:last-child {
  font-family: var(--font-display); font-size: 1.5rem;
}

/* 錯誤 */
.checkout-error {
  font-size: 0.85rem; color: #c0392b;
  background: #fdf0ee;
  border-radius: var(--radius);
  padding: 10px 14px; margin: 0;
}

/* 按鈕 */
.checkout-actions { display: flex; gap: 12px; width: 420px; }
.btn-back-cart, .btn-checkout {
  flex: 1; padding: 14px;
  border-radius: 100px;
  font-size: 0.95rem; font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer; text-align: center;
  transition: opacity 0.3s, border-color 0.3s;
}
.btn-back-cart {
  border: 1.5px solid var(--border);
  background: transparent; color: var(--text-secondary);
  text-decoration: none;
  display: flex; align-items: center; justify-content: center;
}
.btn-back-cart:hover { border-color: var(--text-primary); color: var(--text-primary); }
.btn-checkout { border: none; background: var(--bg-dark); color: var(--text-light); }
.btn-checkout:hover:not(:disabled) { opacity: 0.85; }
.btn-checkout:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary {
  display: inline-block; padding: 12px 32px;
  border-radius: 100px; background: var(--bg-dark); color: var(--text-light);
  font-size: 0.9rem; font-weight: 600; text-decoration: none; transition: opacity 0.3s;
}
.btn-primary:hover { opacity: 0.85; }

/* 響應式 */
@media (max-width: 900px) {
  .delivery-options { grid-template-columns: 1fr; }
  .checkout-forms { grid-template-columns: 1fr; }
  .summary-card { width: 100%; }
  .checkout-bottom { align-items: stretch; }
  .checkout-actions { width: 100%; }
}
@media (max-width: 768px) {
  .checkout-page { padding: 100px 0 60px; }
}
</style>
