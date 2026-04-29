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

        </div>
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
  return ['待付款', '已付款', '已取貨'][s] ?? '未知'
}
function statusClass(s: number): string {
  return ['tag--pending', 'tag--paid', 'tag--done'][s] ?? ''
}
function paymentLabel(m: number): string {
  return m === 1 ? '超商取貨付款' : '線上付款'
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
</style>
