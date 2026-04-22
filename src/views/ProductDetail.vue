<template>
  <main class="detail-page">
    <div class="detail-container">

      <div class="detail-topbar">
        <RouterLink to="/store" class="detail-back" aria-label="返回商城">← 返回商城</RouterLink>
        <RouterLink to="/cart" class="cart-icon-link" aria-label="前往購物車">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span v-if="itemCount > 0" class="cart-icon-badge">{{ itemCount }}</span>
        </RouterLink>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="detail-status">
        <p>商品載入中...</p>
      </div>

      <!-- Not Found -->
      <div v-else-if="!product" class="detail-status">
        <p>找不到此商品</p>
        <RouterLink to="/store" class="detail-back-link">回到商城</RouterLink>
      </div>

      <!-- 商品詳情 -->
      <div v-else class="detail-layout">
        <!-- 左側：商品圖 -->
        <div class="detail-img-wrap">
          <span v-if="hasDiscount(product)" class="detail-badge">特價</span>
          <img
            :src="`/api/StoreApi/ProductImage/${product.id}`"
            :alt="product.name"
            class="detail-img"
          />
        </div>

        <!-- 右側：商品資訊 -->
        <div class="detail-info">
          <div class="detail-category">{{ product.categoryName }}</div>
          <h1 class="detail-title">{{ product.name }}</h1>

          <div class="detail-price">
            NT${{ formatPrice(product.unitPrice) }}
            <span v-if="hasDiscount(product)" class="original">
              NT${{ formatPrice(product.originalPrice) }}
            </span>
          </div>

          <div class="detail-divider"></div>

          <div class="detail-desc-block">
            <h3 class="detail-desc-title">商品介紹</h3>
            <p class="detail-desc">{{ product.description }}</p>
          </div>

          <button class="detail-cart-btn" @click="handleAddToCart">加入購物車</button>
        </div>
      </div>

    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ElNotification } from 'element-plus'
import { useCart } from '@/composables/useCart'

interface ProductDto {
  id: number
  categoryId: number
  name: string
  imageUrl: string
  originalPrice: number
  unitPrice: number
  description: string
  sortOrder: number
  isActive: boolean
  categoryName: string
}

const route = useRoute()
const product = ref<ProductDto | null>(null)
const loading = ref<boolean>(true)

const { addItem, itemCount } = useCart()

function handleAddToCart(): void {
  if (!product.value) return
  const p = product.value
  addItem({
    id: p.id,
    name: p.name,
    unitPrice: p.unitPrice,
    originalPrice: p.originalPrice,
    imageUrl: p.imageUrl,
    categoryName: p.categoryName,
  })
  ElNotification({
    title: '已加入購物車',
    message: p.name,
    type: 'success',
    duration: 2500,
    position: 'top-right',
  })
}

function hasDiscount(p: ProductDto): boolean {
  return p.originalPrice > p.unitPrice
}

function formatPrice(price: number): string {
  return Math.floor(price).toLocaleString()
}

async function fetchProduct(): Promise<void> {
  loading.value = true
  try {
    const res = await fetch(`/api/StoreApi/products/${route.params.id}`)
    if (res.ok) {
      product.value = await res.json()
    } else {
      product.value = null
    }
  } catch {
    product.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchProduct)
</script>

<style scoped>
.detail-page {
  padding: 120px 0 80px;
  min-height: 100vh;
  background: var(--bg);
}

.detail-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── 頂部列（返回 + 購物車 icon） ── */
.detail-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.detail-back {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  transition: color 0.3s;
  text-decoration: none;
}

.detail-back:hover {
  color: var(--text-primary);
}

.cart-icon-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  color: var(--text-primary);
  background: transparent;
  text-decoration: none;
  transition: all 0.3s;
  flex-shrink: 0;
}

.cart-icon-link:hover {
  border-color: var(--text-primary);
  background: var(--bg-card);
}

.cart-icon-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: var(--bg-dark);
  color: var(--text-light);
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* ── 狀態 ── */
.detail-status {
  text-align: center;
  padding: 120px 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.detail-back-link {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 24px;
  border-radius: 100px;
  border: 1.5px solid var(--border);
  color: var(--text-primary);
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.detail-back-link:hover {
  border-color: var(--text-primary);
}

/* ── 主版面 ── */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}

/* ── 左側圖片 ── */
.detail-img-wrap {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg-card);
  aspect-ratio: 1 / 1;
}

.detail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 2;
  background: var(--bg-dark);
  color: var(--text-light);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 100px;
}

/* ── 右側資訊 ── */
.detail-info {
  padding: 8px 0;
}

.detail-category {
  font-size: 0.76rem;
  color: var(--accent-dark);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
}

.detail-title {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 400;
  line-height: 1.2;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.detail-price {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
}

.detail-price .original {
  font-size: 1rem;
  color: var(--text-secondary);
  text-decoration: line-through;
  margin-left: 12px;
  font-weight: 400;
}

.detail-divider {
  height: 1px;
  background: var(--border);
  margin: 32px 0;
}

.detail-desc-block {
  margin-bottom: 40px;
}

.detail-desc-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.detail-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.8;
  white-space: pre-line;
}

.detail-cart-btn {
  width: 100%;
  padding: 16px 32px;
  border-radius: 100px;
  border: none;
  background: var(--bg-dark);
  color: var(--text-light);
  font-size: 0.95rem;
  font-family: var(--font-body);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.detail-cart-btn:hover {
  opacity: 0.85;
}

/* ── 響應式 ── */
@media (max-width: 1024px) {
  .detail-layout {
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .detail-page {
    padding: 100px 0 60px;
  }

  .detail-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
