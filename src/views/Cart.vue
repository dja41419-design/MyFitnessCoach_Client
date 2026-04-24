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
              :src="`/api/StoreApi/ProductImage/${item.id}`"
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
          <div class="cart-summary-row">
            <span>總件數</span>
            <span>{{ itemCount }} 件</span>
          </div>
          <div class="cart-summary-row cart-total">
            <span>總金額</span>
            <span>NT${{ formatPrice(subtotal) }}</span>
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
import { RouterLink, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCart } from '@/composables/useCart'
import AppNavbar from '@/components/AppNavbar.vue'

const router = useRouter()

const { items, itemCount, subtotal, updateQty, removeItem, clearCart } = useCart()

function formatPrice(price: number): string {
  return Math.floor(price).toLocaleString()
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
