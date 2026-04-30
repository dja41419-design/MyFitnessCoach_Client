<template>
  <div class="cart-page">

    <!-- 固定頂部導覽 -->
    <nav class="page-nav">
      <div class="container">
        <RouterLink to="/lesson" class="back-link" aria-label="返回瀏覽方案">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
          返回瀏覽方案
        </RouterLink>
      </div>
    </nav>

    <!-- 頁面標題 -->
    <header class="page-header">
      <div class="container">
        <div class="scroll-label">Order Summary</div>
        <h1>確認訂單</h1>
        <p class="subtitle">請確認您所選擇的儲值方案，確認無誤後即可進行結帳。</p>
      </div>
    </header>

    <!-- 有商品 -->
    <main v-if="cartItems.length > 0" class="cart-main">
      <div class="container">
        <div class="cart-layout">

          <!-- ── 方案列表 ── -->
          <section class="cart-list-section">
            <h2 class="section-title">
              已選方案
              <span class="item-count">{{ cartItems.length }} 項</span>
            </h2>

            <ul class="cart-list" aria-label="已選課程方案列表">
              <li
                v-for="(item, idx) in cartItems"
                :key="item.id"
                class="cart-item"
              >
                <!-- 序號 -->
                <span class="item-index" aria-hidden="true">
                  {{ String(idx + 1).padStart(2, '0') }}
                </span>

                <!-- 方案資訊 -->
                <div class="item-info">
                  <h3 class="item-name">{{ item.planName }}</h3>
                  <p class="item-points">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    {{ item.points }} 點諮詢點數
                  </p>
                  <p class="item-desc">{{ item.description }}</p>
                </div>

                <!-- 價格 -->
                <div class="item-price" aria-label="方案價格">
                  <span class="item-currency">NT$</span>
                  <span class="item-amount">{{ formatPrice(item.price) }}</span>
                </div>

                <!-- 移除按鈕 -->
                <button
                  class="item-remove"
                  @click="removeItem(item.id)"
                  :aria-label="`移除 ${item.planName}`"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </li>
            </ul>
          </section>

          <!-- ── 訂單摘要 ── -->
          <aside class="cart-sidebar">
            <div class="summary-card">
              <h2 class="summary-title">訂單摘要</h2>

              <div class="summary-rows">
                <div class="summary-row">
                  <span>已選方案</span>
                  <span>{{ cartItems.length }} 項</span>
                </div>
                <div class="summary-row">
                  <span>合計點數</span>
                  <span class="summary-points">{{ totalPoints }} 點</span>
                </div>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-row summary-total">
                <span>應付金額</span>
                <span class="total-price">NT${{ formatPrice(totalPrice) }}</span>
              </div>

              <!-- 條約同意 -->
              <label class="terms-agree" :class="{ 'terms-warn': termsWarn }">
                <input type="checkbox" v-model="agreedTerms" class="terms-checkbox" />
                <span class="terms-label-text">
                  我已閱讀並同意
                  <a href="#" class="terms-link" @click.prevent.stop="showTermsModal = true">《點數購買須知與使用條約》</a>
                </span>
              </label>
              <p v-if="termsWarn" class="terms-warn-msg">請先閱讀並勾選同意條約後才能結帳</p>

              <!-- 結帳按鈕 -->
              <button
                type="button"
                class="btn-checkout"
                :class="{ 'btn-disabled-look': !agreedTerms }"
                @click="handleCheckout"
                :disabled="isProcessing"
              >
                {{ isProcessing ? '跳轉中...' : '前往結帳' }}
                <svg v-if="!isProcessing" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>

              <RouterLink to="/lesson" class="btn-continue" aria-label="繼續瀏覽方案">
                繼續瀏覽方案
              </RouterLink>
            </div>
          </aside>

        </div>
      </div>
    </main>

    <!-- 空購物車 -->
    <div v-else class="cart-empty">
      <div class="empty-icon" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>
      <p class="empty-title">購物車是空的</p>
      <p class="empty-desc">您尚未選擇任何方案，前往瀏覽並加入購物車。</p>
      <RouterLink to="/lesson" class="btn-browse" aria-label="瀏覽儲值方案">
        瀏覽儲值方案
      </RouterLink>
    </div>

    <!-- 頁尾 -->
    <footer class="simple-footer">
      <div class="container">
        <p>© 2025 My Fitness Coach. All rights reserved.</p>
      </div>
    </footer>

    <!-- 條約彈跳視窗 -->
    <Teleport to="body">
      <transition name="lc-modal-fade">
        <div v-if="showTermsModal" class="lc-modal-overlay" @click.self="showTermsModal = false">
          <div class="lc-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="terms-modal-title">

            <!-- 標題列 -->
            <div class="lc-modal-header">
              <h2 id="terms-modal-title" class="lc-modal-title">點數購買須知與使用條約</h2>
              <button class="lc-modal-close" @click="showTermsModal = false" aria-label="關閉">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- 內容 -->
            <div class="lc-modal-body">
              <div class="lc-terms-block">
                <h3>一、點數價值與使用範圍</h3>
                <ol>
                  <li>本平台提供之「諮詢點數」僅限用於預約營養師一對一諮詢服務，<strong>1 點 = 1 次諮詢</strong>（每次 1 小時）。</li>
                  <li>點數依所購買之儲值方案定價，實際金額以結帳頁面顯示為準。</li>
                  <li>點數僅限購買帳號本人使用，不得轉讓、轉售或與他人共用。</li>
                  <li>點數購買後即儲值至您的會員錢包，可於「預約諮詢」頁面選擇以點數支付。</li>
                </ol>
              </div>

              <div class="lc-terms-block">
                <h3>二、退款政策</h3>
                <ol>
                  <li>依據《消費者保護法》第 19 條，透過本平台線上購買之點數方案，消費者得於收受商品或接受服務後 <strong>7 日內</strong>，無須說明理由即可申請退款。</li>
                  <li>鑑賞期內若已使用部分點數，僅退還未使用之點數對應金額。</li>
                  <li>超過 7 日鑑賞期後，已購買之點數恕不接受退款申請。</li>
                  <li>退款將透過原付款方式退回，處理時間約 7～14 個工作天，如需申請退款請聯繫客服。</li>
                </ol>
              </div>

              <div class="lc-terms-block">
                <h3>三、點數有效期限</h3>
                <ol>
                  <li>本平台購買之諮詢點數 <strong>無使用期限</strong>，購買後永久有效。</li>
                  <li>若帳號因違反平台規範遭停權或刪除，未使用之點數將無法使用，且不予退還。</li>
                </ol>
              </div>

              <div class="lc-terms-block">
                <h3>四、預約取消與點數退還</h3>
                <ol>
                  <li>以點數支付之預約，若於諮詢開始前 <strong>40 分鐘</strong>以上取消，點數將全額退還至您的會員錢包。</li>
                  <li>距離諮詢開始不足 40 分鐘，系統將不允許取消預約。</li>
                  <li>每位會員累計取消預約次數上限為 <strong>3 次</strong>，達上限後將無法自行取消，需聯繫客服處理。</li>
                  <li>以信用卡付款之預約取消後，退款將透過原付款管道處理。</li>
                </ol>
              </div>

              <div class="lc-terms-block">
                <h3>五、其他約定事項</h3>
                <ol>
                  <li>本平台保留修改點數方案內容與定價之權利，修改後之條件適用於新購買之訂單，不影響已完成購買之點數。</li>
                  <li>如對點數購買或使用有任何疑問，請透過平台客服信箱與我們聯繫。</li>
                  <li>購買點數即表示您已閱讀並同意本條約內容。</li>
                </ol>
              </div>
            </div>

            <!-- 底部按鈕 -->
            <div class="lc-modal-footer">
              <button class="lc-modal-btn-agree" @click="showTermsModal = false; agreedTerms = true">
                我已閱讀並同意
              </button>
            </div>

          </div>
        </div>
      </transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { CartItem } from '@/types/lesson'

const router = useRouter()
const CART_KEY = 'lessonCart'

const cartItems = ref<CartItem[]>([])
const isProcessing = ref(false)
const agreedTerms = ref(false)
const termsWarn = ref(false)
const showTermsModal = ref(false)

watch(agreedTerms, (val) => { if (val) termsWarn.value = false })

// ── 計算屬性 ──────────────────────────────────────
const totalPoints = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.points, 0)
)

const totalPrice = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.price, 0)
)

// ── 工具函式 ──────────────────────────────────────
function formatPrice(price: number) {
  return Math.floor(price).toLocaleString()
}

function loadCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]')
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

function removeItem(id: number) {
  cartItems.value = cartItems.value.filter(item => item.id !== id)
  saveCart(cartItems.value)
}

function handleCheckout() {
  if (isProcessing.value) return

  if (!agreedTerms.value) {
    termsWarn.value = true
    return
  }
  termsWarn.value = false

  if (totalPrice.value <= 0) {
    alert('購物車金額不能為 0')
    return
  }

  isProcessing.value = true
  
  // 將結帳金額與方案 ID 存入 sessionStorage，供 LessonPay.vue 使用
  sessionStorage.setItem('checkoutAmount', totalPrice.value.toString())
  sessionStorage.setItem('checkoutPlanIds', cartItems.value.map(item => item.id).join(','))

  // 跳轉到支付引導頁面
  router.push('/lesson-pay')
}

// ── 初始化 ──────────────────────────────────────
onMounted(() => {
  cartItems.value = loadCart()
})
</script>

<style scoped>
/* ── 整體頁面 ── */
.cart-page {
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
  font-size: clamp(2.2rem, 4.5vw, 3.6rem);
  font-weight: 400;
  color: var(--text-primary);
  margin: 0 0 14px;
  line-height: 1.1;
}

.subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
  max-width: 480px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ── 主要內容區佈局 ── */
.cart-main {
  padding-bottom: 80px;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 40px;
  align-items: start;
}

/* ── 方案列表標題 ── */
.section-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-count {
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 600;
  background: var(--tag-bg);
  color: var(--text-secondary);
  padding: 3px 12px;
  border-radius: 100px;
}

/* ── 購物車列表 ── */
.cart-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid var(--border);
}

/* ── 單一方案列 ── */
.cart-item {
  display: grid;
  grid-template-columns: 40px 1fr auto 40px;
  gap: 16px;
  align-items: center;
  padding: 24px 0;
  border-bottom: 1px solid var(--border);
  transition: background 0.2s;
}

.cart-item:hover {
  background: rgba(212, 204, 194, 0.08);
  margin: 0 -12px;
  padding: 24px 12px;
  border-radius: var(--radius);
}

/* 序號 */
.item-index {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--border);
  line-height: 1;
  align-self: flex-start;
  padding-top: 4px;
}

/* 方案資訊 */
.item-info {
  min-width: 0;
}

.item-name {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 6px;
}

.item-points {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--accent-dark);
  background: var(--tag-bg);
  padding: 3px 10px;
  border-radius: 100px;
  margin-bottom: 8px;
}

.item-desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;

  /* 最多顯示兩行 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 價格 */
.item-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
  white-space: nowrap;
}

.item-currency {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.item-amount {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 移除按鈕 */
.item-remove {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s;
  flex-shrink: 0;
}

.item-remove:hover {
  background: var(--bg-dark);
  border-color: var(--bg-dark);
  color: var(--text-light);
}

/* ── 訂單摘要側欄 ── */
.cart-sidebar {
  position: sticky;
  top: 100px;
}

.summary-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  border: 1px solid var(--border);
}

.summary-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 24px;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.summary-points {
  font-weight: 600;
  color: var(--accent-dark);
}

.summary-divider {
  height: 1px;
  background: var(--border);
  margin-bottom: 20px;
}

.summary-total {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.total-price {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 條約同意 */
.terms-agree {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--radius);
  background: var(--bg);
  border: 1.5px solid var(--border);
  cursor: pointer;
  transition: border-color 0.3s, background 0.3s;
  user-select: none;
  margin-bottom: 8px;
}

.terms-agree:hover {
  border-color: var(--accent);
}

.terms-agree.terms-warn {
  border-color: #c0392b;
  background: #fdf6f5;
}

.terms-checkbox {
  width: 17px;
  height: 17px;
  accent-color: var(--bg-dark);
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 1px;
}

.terms-label-text {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.terms-link {
  color: var(--accent-dark);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.terms-link:hover {
  color: var(--text-primary);
  text-decoration: underline;
}

.terms-warn-msg {
  font-size: 0.78rem;
  color: #c0392b;
  margin: 0 0 8px;
  padding-left: 2px;
}

/* 結帳按鈕 */
.btn-disabled-look {
  opacity: 0.5;
}

.btn-checkout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 15px 24px;
  border-radius: 100px;
  background: var(--bg-dark);
  color: var(--text-light);
  font-size: 0.92rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 12px;
}

.btn-checkout:hover {
  background: #2d2620;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(26, 22, 19, 0.18);
}

/* 繼續瀏覽 */
.btn-continue {
  display: block;
  width: 100%;
  padding: 12px 24px;
  border-radius: 100px;
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s;
}

.btn-continue:hover {
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

/* ── 空狀態 ── */
.cart-empty {
  text-align: center;
  padding: 80px 24px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: var(--bg-card);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  border: 1px solid var(--border);
  color: var(--border);
}

.empty-title {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 400;
  color: var(--text-primary);
  margin: 0 0 10px;
}

.empty-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 32px;
  line-height: 1.6;
}

.btn-browse {
  display: inline-flex;
  align-items: center;
  padding: 13px 32px;
  border-radius: 100px;
  background: var(--bg-dark);
  color: var(--text-light);
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-browse:hover {
  background: #2d2620;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(26, 22, 19, 0.15);
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
  .cart-layout {
    grid-template-columns: 1fr 340px;
    gap: 28px;
  }
}

@media (max-width: 768px) {
  .cart-page {
    padding-top: 72px;
  }

  .page-header {
    padding: 48px 0 32px;
  }

  .cart-layout {
    grid-template-columns: 1fr;
  }

  .cart-sidebar {
    position: static;
  }

  .cart-item {
    grid-template-columns: 36px 1fr 40px;
    grid-template-rows: auto auto;
  }

  .item-price {
    grid-column: 2;
    grid-row: 2;
  }

  .item-remove {
    grid-column: 3;
    grid-row: 1;
    align-self: start;
  }
}
</style>

<style>
/* ── 條約彈跳視窗（非 scoped，因 Teleport 到 body）── */
.lc-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(26, 22, 19, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.lc-modal-dialog {
  background: var(--bg);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 640px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(26, 22, 19, 0.18);
  overflow: hidden;
}

.lc-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.lc-modal-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.lc-modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s;
  flex-shrink: 0;
}

.lc-modal-close:hover {
  background: var(--bg-dark);
  border-color: var(--bg-dark);
  color: var(--text-light);
}

.lc-modal-body {
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
}

.lc-modal-body .lc-terms-block {
  margin-bottom: 24px;
}

.lc-modal-body .lc-terms-block:last-child {
  margin-bottom: 0;
}

.lc-modal-body .lc-terms-block h3 {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 10px;
}

.lc-modal-body .lc-terms-block ol {
  list-style: none;
  counter-reset: lc-terms;
  padding: 0;
  margin: 0;
}

.lc-modal-body .lc-terms-block ol li {
  counter-increment: lc-terms;
  position: relative;
  padding-left: 26px;
  font-size: 0.86rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 4px;
}

.lc-modal-body .lc-terms-block ol li::before {
  content: counter(lc-terms) ".";
  position: absolute;
  left: 0;
  font-weight: 600;
  color: var(--accent-dark);
  font-size: 0.84rem;
}

.lc-modal-body .lc-terms-block ol li strong {
  color: var(--text-primary);
  font-weight: 600;
}

.lc-modal-footer {
  padding: 16px 28px 24px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.lc-modal-btn-agree {
  display: block;
  width: 100%;
  padding: 14px 24px;
  border-radius: 100px;
  background: var(--bg-dark);
  color: var(--text-light);
  font-size: 0.92rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  transition: all 0.3s;
}

.lc-modal-btn-agree:hover {
  background: #2d2620;
  box-shadow: 0 8px 24px rgba(26, 22, 19, 0.18);
}

/* 彈窗動畫 */
.lc-modal-fade-enter-active,
.lc-modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.lc-modal-fade-enter-active .lc-modal-dialog,
.lc-modal-fade-leave-active .lc-modal-dialog {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease;
}

.lc-modal-fade-enter-from,
.lc-modal-fade-leave-to {
  opacity: 0;
}

.lc-modal-fade-enter-from .lc-modal-dialog {
  transform: translateY(24px) scale(0.96);
  opacity: 0;
}

.lc-modal-fade-leave-to .lc-modal-dialog {
  transform: translateY(12px) scale(0.98);
  opacity: 0;
}

@media (max-width: 768px) {
  .lc-modal-overlay {
    padding: 16px;
    align-items: flex-end;
  }

  .lc-modal-dialog {
    max-height: 90vh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  .lc-modal-header {
    padding: 20px 20px 16px;
  }

  .lc-modal-title {
    font-size: 1.1rem;
  }

  .lc-modal-body {
    padding: 20px;
  }

  .lc-modal-footer {
    padding: 14px 20px 20px;
  }
}
</style>
