<template>
  <div class="orders-page">
    <h1 class="page-title">訂單查詢</h1>

    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <p>載入中…</p>
    </div>

    <div v-else-if="orders.length === 0" class="state-box empty">
      <i class="mdi mdi-clipboard-text-off-outline empty-icon"></i>
      <p>目前沒有任何訂單</p>
      <RouterLink to="/store" class="btn-primary">去逛逛商城</RouterLink>
    </div>

    <div v-else class="order-list">
      <div
        v-for="order in orders"
        :key="order.id"
        class="order-card"
      >
        <!-- 訂單標頭 -->
        <div class="order-header" @click="toggle(order.id)">
          <div class="order-meta">
            <span class="order-id"># {{ order.id }}</span>
            <span class="order-date">{{ formatDate(order.createAt) }}</span>
          </div>
          <div class="order-tags">
            <span class="tag" :class="paymentClass(order.paymentMethod)">
              {{ paymentLabel(order.paymentMethod) }}
            </span>
            <span class="tag" :class="statusClass(order.status)">
              {{ statusLabel(order.status) }}
            </span>
          </div>
          <div class="order-amount">
            NT${{ fmt(order.finalAmount ?? order.originalAmount) }}
          </div>
          <i class="mdi expand-icon" :class="expanded.has(order.id) ? 'mdi-chevron-up' : 'mdi-chevron-down'"></i>
        </div>

        <!-- 展開：訂單明細 -->
        <div v-if="expanded.has(order.id)" class="order-body">

          <!-- 商品列表 -->
          <div class="detail-section">
            <div class="detail-title">訂購商品</div>
            <div v-for="d in order.details" :key="d.productName" class="detail-row">
              <img
                :src="d.imageURL || '/StaticFiles/images/NoImage.jpg'"
                :alt="d.productName"
                class="detail-img"
              />
              <div class="detail-info">
                <div class="detail-name">{{ d.productName }}</div>
                <div class="detail-price">NT${{ fmt(d.unitPrice) }} × {{ d.qty }}</div>
              </div>
              <div class="detail-subtotal">NT${{ fmt(d.subTotal) }}</div>
            </div>
          </div>

          <!-- 收件 / 門市資訊 -->
          <div class="detail-section">
            <div class="detail-title">{{ order.paymentMethod === 1 ? '取貨資訊' : '收件資訊' }}</div>
            <div class="info-grid">
              <div class="info-row"><span class="info-label">收件人</span><span>{{ order.receiver }}</span></div>
              <div class="info-row"><span class="info-label">手機</span><span>{{ order.mobile }}</span></div>
              <template v-if="order.paymentMethod === 1">
                <div class="info-row"><span class="info-label">取貨門市</span><span>{{ order.storeName }}</span></div>
                <div v-if="order.logisticsOrderNo" class="info-row">
                  <span class="info-label">物流單號</span><span>{{ order.logisticsOrderNo }}</span>
                </div>
              </template>
              <template v-else>
                <div class="info-row"><span class="info-label">地址</span><span>{{ order.address }}</span></div>
              </template>
              <div v-if="order.memo" class="info-row"><span class="info-label">備註</span><span>{{ order.memo }}</span></div>
            </div>
          </div>

          <!-- 金額摘要 -->
          <div class="detail-section amount-section">
            <div class="amount-row">
              <span>小計</span><span>NT${{ fmt(order.originalAmount) }}</span>
            </div>
            <div class="amount-row">
              <span>折扣</span><span>- NT${{ fmt(order.discountAmount) }}</span>
            </div>
            <div class="amount-row amount-total">
              <span>總金額</span><span>NT${{ fmt(order.finalAmount ?? order.originalAmount) }}</span>
            </div>
          </div>

          <!-- 重新付款（待付款 + 線上付款） -->
          <div v-if="order.status === 0 && order.paymentMethod !== 1" class="return-action">
            <button
              class="btn-pay-again"
              :disabled="payingOrderId === order.id"
              @click.stop="resumePayment(order.id)"
            >
              <i class="mdi mdi-credit-card-outline"></i>
              {{ payingOrderId === order.id ? '導向綠界中…' : '重新付款' }}
            </button>
          </div>

          <!-- 申請退換貨 -->
          <div v-if="order.status === 1 || order.status === 2" class="return-action">
            <button class="btn-return" @click.stop="openReturnModal(order.id)">
              <i class="mdi mdi-swap-horizontal"></i> 申請退換貨
            </button>
          </div>

          <!-- 退換貨審核結果 -->
          <div v-if="order.status === 3" class="return-status-banner banner--pending">
            <i class="mdi mdi-clock-outline"></i>
            <div>
              <div class="banner-title">退換貨申請審核中</div>
              <div class="banner-desc">客服人員將在 1–3 個工作天內與您聯繫，請耐心等候。</div>
            </div>
          </div>

          <div v-if="order.status === 4" class="return-status-banner banner--approved">
            <i class="mdi mdi-check-circle-outline"></i>
            <div>
              <div class="banner-title">退換貨申請已核准</div>
              <div class="banner-desc">我們已受理您的申請，請依客服指示寄回商品，退款將於商品確認後處理。</div>
            </div>
          </div>

          <div v-if="order.status === 5" class="return-status-banner banner--refunded">
            <i class="mdi mdi-cash-refund"></i>
            <div>
              <div class="banner-title">退款已完成</div>
              <div class="banner-desc">款項已退回至您的帳戶，感謝您的耐心等候。</div>
            </div>
          </div>

          <div v-if="order.status === 6" class="return-status-banner banner--rejected">
            <i class="mdi mdi-close-circle-outline"></i>
            <div>
              <div class="banner-title">退換貨申請已拒絕</div>
              <div class="banner-desc">
                {{ order.memo?.startsWith('[退換貨]') ? order.memo.replace('[退換貨] ', '拒絕原因：') : '本次申請不符合退換貨條件，如有疑問請聯繫客服。' }}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- 退換貨申請彈窗 -->
  <div v-if="returnModal.visible" class="modal-overlay" @click.self="closeReturnModal">
    <div class="modal-card">
      <div class="modal-header">
        <h3>申請退換貨</h3>
        <button class="modal-close" @click="closeReturnModal"><i class="mdi mdi-close"></i></button>
      </div>
      <div class="modal-body">
        <p class="modal-hint">請說明退換貨原因，客服人員將在 1–3 個工作天內與您聯繫。</p>
        <textarea
          v-model="returnModal.reason"
          class="return-textarea"
          placeholder="請輸入退換貨原因（必填，最多 40 字）"
          rows="4"
          maxlength="40"
        ></textarea>
        <div class="char-count">{{ returnModal.reason.length }} / 40</div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="closeReturnModal">取消</button>
        <button
          class="btn-submit"
          :disabled="!returnModal.reason.trim() || returnModal.submitting"
          @click="submitReturn"
        >
          {{ returnModal.submitting ? '送出中…' : '確認送出' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchWithAuth } from '@/data/fetchWithAuth'

interface OrderDetail {
  productName: string
  unitPrice: number
  qty: number
  subTotal: number
  imageURL: string | null
}

interface Order {
  id: number
  createAt: string
  originalAmount: number
  discountAmount: number
  finalAmount: number | null
  status: number
  paymentMethod: number
  receiver: string
  address: string | null
  mobile: string
  storeName: string | null
  logisticsOrderNo: string | null
  memo: string | null
  details: OrderDetail[]
}

const loading = ref(true)
const orders  = ref<Order[]>([])
const expanded = ref(new Set<number>())
const payingOrderId = ref<number | null>(null)

const returnModal = ref({
  visible: false,
  orderId: 0,
  reason: '',
  submitting: false,
})

function toggle(id: number): void {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
}

function fmt(n: number | null | undefined): string {
  return Math.floor(n ?? 0).toLocaleString()
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function statusLabel(s: number): string {
  return (
    ['待付款', '已付款', '已取貨', '退換貨申請中', '退換貨核准', '已退款', '申請已拒絕'][s] ?? '未知'
  )
}
function statusClass(s: number): string {
  return (
    ['tag--pending', 'tag--paid', 'tag--done', 'tag--return', 'tag--approved', 'tag--refunded', 'tag--rejected'][s] ?? ''
  )
}

function openReturnModal(orderId: number): void {
  returnModal.value = { visible: true, orderId, reason: '', submitting: false }
}
function closeReturnModal(): void {
  returnModal.value.visible = false
}

async function submitReturn(): Promise<void> {
  if (!returnModal.value.reason.trim()) return
  returnModal.value.submitting = true
  try {
    const res = await fetchWithAuth(`/api/ProductOrders/${returnModal.value.orderId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: returnModal.value.reason.trim() }),
    })
    if (res.ok) {
      const order = orders.value.find(o => o.id === returnModal.value.orderId)
      if (order) order.status = 3
      closeReturnModal()
      alert('退換貨申請已送出，客服將在 1–3 個工作天內與您聯繫。')
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.message || '申請失敗，請稍後再試')
    }
  } catch {
    alert('網路錯誤，請稍後再試')
  } finally {
    returnModal.value.submitting = false
  }
}
function paymentLabel(m: number): string {
  return m === 1 ? '超商取貨付款' : '線上付款'
}

async function resumePayment(orderId: number): Promise<void> {
  if (payingOrderId.value !== null) return
  payingOrderId.value = orderId
  try {
    const formData = new URLSearchParams()
    formData.append('productOrderId', orderId.toString())

    const res = await fetchWithAuth('/api/Payment/ProductSendToEcPay', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    formData,
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || `付款初始化失敗（${res.status}）`)
      return
    }

    const ecpay = await res.json() as { action: string; parameters: Record<string, string> }

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
    alert(err.message || '網路錯誤，請稍後再試')
  } finally {
    payingOrderId.value = null
  }
}
function paymentClass(m: number): string {
  return m === 1 ? 'tag--cvs' : 'tag--online'
}

onMounted(async () => {
  try {
    const res = await fetchWithAuth('/api/ProductOrders')
    if (res.ok) orders.value = await res.json()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.orders-page { padding: 8px 0 40px; }

.page-title {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 400;
  color: var(--text-primary);
  margin-bottom: 32px;
}

/* 載入 / 空狀態 */
.state-box {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 16px; padding: 80px 0;
  color: var(--text-secondary);
}
.spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(26,22,19,.1);
  border-top-color: var(--bg-dark);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-icon { font-size: 3rem; color: var(--border); }
.btn-primary {
  padding: 10px 28px; border-radius: 100px;
  background: var(--bg-dark); color: var(--text-light);
  font-size: 0.88rem; font-weight: 600; text-decoration: none;
  transition: opacity .3s;
}
.btn-primary:hover { opacity: .85; }

/* 訂單列表 */
.order-list { display: flex; flex-direction: column; gap: 16px; }

.order-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* 訂單標頭 */
.order-header {
  display: flex; align-items: center; gap: 16px;
  padding: 20px 24px;
  cursor: pointer;
  transition: background .2s;
}
.order-header:hover { background: var(--bg); }

.order-meta { display: flex; flex-direction: column; gap: 2px; min-width: 80px; }
.order-id   { font-size: 0.78rem; color: var(--text-secondary); }
.order-date { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }

.order-tags { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }

.tag {
  padding: 3px 10px; border-radius: 100px;
  font-size: 0.75rem; font-weight: 600;
}
.tag--pending  { background: #fef3cd; color: #856404; }
.tag--paid     { background: #d1e7dd; color: #0a5236; }
.tag--done     { background: #cfe2ff; color: #084298; }
.tag--online   { background: var(--tag-bg); color: var(--text-secondary); }
.tag--cvs      { background: #fff3cd; color: #664d03; }

.order-amount {
  font-family: var(--font-display);
  font-size: 1.1rem; font-weight: 600;
  color: var(--text-primary); white-space: nowrap;
}
.expand-icon { font-size: 1.2rem; color: var(--text-secondary); flex-shrink: 0; }

/* 展開內容 */
.order-body {
  border-top: 1px solid var(--border);
  padding: 24px;
  display: flex; flex-direction: column; gap: 24px;
}

.detail-section { display: flex; flex-direction: column; gap: 12px; }
.detail-title {
  font-size: 0.8rem; font-weight: 700;
  color: var(--accent-dark); text-transform: uppercase;
  letter-spacing: .06em;
}

/* 商品行 */
.detail-row {
  display: flex; align-items: center; gap: 14px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
.detail-row:last-child { border-bottom: none; }
.detail-img {
  width: 56px; height: 56px; object-fit: cover;
  border-radius: var(--radius); background: var(--bg); flex-shrink: 0;
}
.detail-info { flex: 1; min-width: 0; }
.detail-name  { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }
.detail-price { font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; }
.detail-subtotal {
  font-size: 0.9rem; font-weight: 600;
  color: var(--text-primary); white-space: nowrap;
}

/* 資訊格 */
.info-grid { display: flex; flex-direction: column; gap: 8px; }
.info-row  { display: flex; gap: 12px; font-size: 0.85rem; }
.info-label { color: var(--text-secondary); min-width: 72px; flex-shrink: 0; }

/* 金額摘要 */
.amount-section {
  background: var(--bg);
  border-radius: var(--radius);
  padding: 16px 20px;
  gap: 8px;
}
.amount-row {
  display: flex; justify-content: space-between;
  font-size: 0.88rem; color: var(--text-secondary);
}
.amount-total {
  border-top: 1px solid var(--border);
  margin-top: 4px; padding-top: 10px;
  font-size: 1rem; font-weight: 600; color: var(--text-primary);
}

/* 退換貨狀態標籤 */
.tag--return    { background: #fde8e8; color: #922b21; }
.tag--approved  { background: #d1f0e0; color: #1a6b3c; }
.tag--refunded  { background: #cfe2ff; color: #084298; }
.tag--rejected  { background: #e8e8e8; color: #555; }

/* 退換貨審核結果橫幅 */
.return-status-banner {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 16px 20px;
  border-radius: var(--radius, 8px);
  font-size: 0.88rem;
}
.return-status-banner .mdi {
  font-size: 1.4rem; flex-shrink: 0; margin-top: 1px;
}
.banner-title { font-weight: 700; margin-bottom: 4px; }
.banner-desc  { color: inherit; opacity: 0.85; line-height: 1.5; }

.banner--pending  { background: #fef9ec; color: #92660a; border: 1px solid #f5d97a; }
.banner--approved { background: #edfaf3; color: #1a6b3c; border: 1px solid #6fcf97; }
.banner--refunded { background: #eaf2ff; color: #084298; border: 1px solid #90bef5; }
.banner--rejected { background: #f5f5f5; color: #555;    border: 1px solid #ccc; }

/* 申請退換貨按鈕 */
.return-action { display: flex; justify-content: flex-end; }
.btn-return {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 20px;
  background: transparent;
  border: 1.5px solid #c0392b;
  color: #c0392b;
  border-radius: 100px;
  font-size: 0.85rem; font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-return:hover { background: #c0392b; color: white; }

/* 重新付款按鈕 */
.btn-pay-again {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 20px;
  background: var(--bg-dark);
  border: 1.5px solid var(--bg-dark);
  color: var(--text-light);
  border-radius: 100px;
  font-size: 0.85rem; font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-pay-again:hover:not(:disabled) { opacity: 0.85; }
.btn-pay-again:disabled { opacity: 0.5; cursor: not-allowed; }

/* 彈窗 */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 24px;
}
.modal-card {
  background: white;
  border-radius: var(--radius-lg, 16px);
  width: 100%; max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}
.modal-header h3 { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; }
.modal-close {
  background: none; border: none; cursor: pointer;
  font-size: 1.2rem; color: var(--text-secondary);
  line-height: 1;
}
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 12px; }
.modal-hint { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }
.return-textarea {
  width: 100%; padding: 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius, 8px);
  font-size: 0.9rem; font-family: var(--font-body);
  resize: vertical; outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.return-textarea:focus { border-color: var(--accent); }
.char-count { font-size: 0.78rem; color: var(--text-secondary); text-align: right; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}
.btn-cancel {
  padding: 10px 24px; border-radius: 100px;
  background: transparent; border: 1.5px solid var(--border);
  color: var(--text-secondary); font-size: 0.88rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.btn-cancel:hover { border-color: var(--text-secondary); color: var(--text-primary); }
.btn-submit {
  padding: 10px 24px; border-radius: 100px;
  background: #c0392b; border: none;
  color: white; font-size: 0.88rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.btn-submit:hover:not(:disabled) { background: #922b21; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
