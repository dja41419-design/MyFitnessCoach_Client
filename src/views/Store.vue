<template>
  <main class="store-page">
    <div class="store-container">

      <!-- 頁面標題 -->
      <div class="store-header">
        <div>
          <RouterLink to="/" class="store-back" aria-label="返回首頁">← 返回首頁</RouterLink>
          <h1 class="reveal">健康食品商城</h1>
          <p class="reveal rd1">官方直營、品質保證。嚴選優質健康食品，讓你的飲食計畫更輕鬆執行。</p>
        </div>
      </div>

      <!-- 分類 Tab -->
      <div class="store-tabs reveal rd2">
        <button
          class="store-tab"
          :class="{ active: activeCategory === null }"
          aria-label="顯示全部商品"
          @click="activeCategory = null"
        >
          全部
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="store-tab"
          :class="{ active: activeCategory === cat.id }"
          :aria-label="`篩選${cat.categoryName}分類`"
          @click="activeCategory = cat.id"
        >
          {{ cat.categoryName }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="store-loading">
        <p>商品載入中...</p>
      </div>

      <!-- 商品 Grid -->
      <div v-else-if="filteredProducts.length > 0" class="store-grid">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="store-card reveal"
        >
          <div class="store-img-wrap">
            <span v-if="hasDiscount(product)" class="store-card-badge">特價</span>
            <img :src="`/api/StoreApi/ProductImage/${product.id}`" :alt="product.name" class="store-img" />
          </div>
          <div class="store-body">
            <div class="store-category">{{ product.categoryName }}</div>
            <h3>{{ product.name }}</h3>
            <p class="store-desc">{{ product.description }}</p>
            <div class="store-price">
              NT${{ formatPrice(product.unitPrice) }}
              <span v-if="hasDiscount(product)" class="original">
                NT${{ formatPrice(product.originalPrice) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-else class="store-empty">
        <p>目前此分類沒有商品</p>
      </div>

    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useReveal } from '@/composables/useReveal'

interface CategoryDto {
  id: number
  categoryName: string
  sortOrder: number
  isActive: boolean
}

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

const categories = ref<CategoryDto[]>([])
const products = ref<ProductDto[]>([])
const activeCategory = ref<number | null>(null)
const loading = ref<boolean>(true)

const filteredProducts = computed<ProductDto[]>(() => {
  if (activeCategory.value === null) return products.value
  return products.value.filter(p => p.categoryId === activeCategory.value)
})

function hasDiscount(product: ProductDto): boolean {
  return product.originalPrice > product.unitPrice
}

function formatPrice(price: number): string {
  return Math.floor(price).toLocaleString()
}

async function fetchCategories(): Promise<void> {
  const res = await fetch('/api/StoreApi/categories')
  categories.value = await res.json()
}

async function fetchProducts(): Promise<void> {
  const res = await fetch('/api/StoreApi/products')
  products.value = await res.json()
}

onMounted(async () => {
  try {
    await Promise.all([fetchCategories(), fetchProducts()])
  } finally {
    loading.value = false
  }
})

useReveal()
</script>

<style scoped>
.store-page {
  padding: 120px 0 80px;
  min-height: 100vh;
  background: var(--bg);
}

.store-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── 返回連結 ── */
.store-back {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
  transition: color 0.3s;
}

.store-back:hover {
  color: var(--text-primary);
}

/* ── 頁面標題 ── */
.store-header {
  margin-bottom: 48px;
}

.store-header h1 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  line-height: 1.15;
  color: var(--text-primary);
}

.store-header p {
  font-size: 0.92rem;
  color: var(--text-secondary);
  max-width: 480px;
  margin-top: 10px;
  line-height: 1.6;
}

/* ── 分類 Tab ── */
.store-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.store-tab {
  padding: 8px 20px;
  border-radius: 100px;
  font-size: 0.82rem;
  font-weight: 600;
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.store-tab.active {
  background: var(--bg-dark);
  color: var(--text-light);
  border-color: var(--bg-dark);
}

.store-tab:hover:not(.active) {
  border-color: var(--text-secondary);
}

/* ── 商品 Grid ── */
.store-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.store-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
  transition: transform 0.4s, box-shadow 0.4s;
  cursor: pointer;
}

.store-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px var(--shadow-light, rgba(26, 22, 19, 0.06));
}

.store-img-wrap {
  overflow: hidden;
  height: 200px;
  position: relative;
}

.store-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s;
}

.store-card:hover .store-img {
  transform: scale(1.04);
}

.store-card-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  background: var(--bg-dark);
  color: var(--text-light);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 100px;
}

.store-body {
  padding: 20px;
}

.store-category {
  font-size: 0.72rem;
  color: var(--accent-dark);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.store-body h3 {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.3;
}

.store-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.store-price {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.store-price .original {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-decoration: line-through;
  margin-left: 8px;
  font-weight: 400;
}

/* ── Loading & Empty ── */
.store-loading,
.store-empty {
  text-align: center;
  padding: 80px 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* ── 響應式 ── */
@media (max-width: 1024px) {
  .store-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .store-page {
    padding: 100px 0 60px;
  }

  .store-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
