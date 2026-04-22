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

      <!-- 搜尋 + 排序列 -->
      <div class="store-toolbar reveal rd1">
        <input
          v-model="searchKeyword"
          type="search"
          placeholder="搜尋商品名稱..."
          class="store-search-input"
          aria-label="搜尋商品名稱"
          @input="handleSearch"
        />
        <select v-model="sortBy" class="store-sort-select" aria-label="商品排序">
          <option value="default">預設排序</option>
          <option value="price-asc">價格：低 → 高</option>
          <option value="price-desc">價格：高 → 低</option>
          <option value="name-asc">名稱 A → Z</option>
        </select>
      </div>

      <!-- 分類 Tab -->
      <div class="store-tabs reveal rd2">
        <button
          class="store-tab"
          :class="{ active: activeCategory === null }"
          aria-label="顯示全部商品"
          @click="setCategory(null)"
        >
          全部
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="store-tab"
          :class="{ active: activeCategory === cat.id }"
          :aria-label="`篩選${cat.categoryName}分類`"
          @click="setCategory(cat.id)"
        >
          {{ cat.categoryName }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="store-loading">
        <p>商品載入中...</p>
      </div>

      <!-- 商品 Grid -->
      <div v-else-if="sortedProducts.length > 0" class="store-grid">
        <div
          v-for="product in sortedProducts"
          :key="product.id"
          class="store-card reveal"
          @click="openProduct(product)"
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
        <p v-if="searchKeyword.trim()">找不到符合「{{ searchKeyword.trim() }}」的商品</p>
        <p v-else>目前此分類沒有商品</p>
      </div>

    </div>
  </main>

  <!-- 商品詳情 Modal -->
  <v-dialog
    v-model="isModalOpen"
    max-width="720"
    transition="fade-transition"
    scrim="#1a1613"
  >
    <div v-if="selectedProduct" class="product-modal">
      <button class="modal-close" aria-label="關閉" @click="isModalOpen = false">✕</button>

      <div class="modal-img-wrap">
        <span v-if="hasDiscount(selectedProduct)" class="store-card-badge">特價</span>
        <img
          :src="`/api/StoreApi/ProductImage/${selectedProduct.id}`"
          :alt="selectedProduct.name"
          class="modal-img"
        />
      </div>

      <div class="modal-body">
        <div class="store-category">{{ selectedProduct.categoryName }}</div>
        <h2 class="modal-title">{{ selectedProduct.name }}</h2>
        <p class="modal-desc">{{ selectedProduct.description }}</p>

        <div class="modal-footer">
          <div class="store-price">
            NT${{ formatPrice(selectedProduct.unitPrice) }}
            <span v-if="hasDiscount(selectedProduct)" class="original">
              NT${{ formatPrice(selectedProduct.originalPrice) }}
            </span>
          </div>
          <div class="modal-actions">
            <RouterLink
              :to="`/store/${selectedProduct.id}`"
              class="modal-detail-btn"
              aria-label="查看完整詳情"
            >
              查看完整詳情
            </RouterLink>
            <button class="modal-cart-btn" disabled>加入購物車（即將推出）</button>
          </div>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
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
const searchKeyword = ref<string>('')
const sortBy = ref<string>('default')
const loading = ref<boolean>(true)
const isModalOpen = ref(false)
const selectedProduct = ref<ProductDto | null>(null)

const sortedProducts = computed<ProductDto[]>(() => {
  const list = [...products.value]
  switch (sortBy.value) {
    case 'price-asc':  return list.sort((a, b) => a.unitPrice - b.unitPrice)
    case 'price-desc': return list.sort((a, b) => b.unitPrice - a.unitPrice)
    case 'name-asc':   return list.sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'))
    default:           return list.sort((a, b) => a.sortOrder - b.sortOrder)
  }
})

let searchTimer: ReturnType<typeof setTimeout>

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
  loading.value = true
  const params = new URLSearchParams()
  if (searchKeyword.value.trim()) params.set('name', searchKeyword.value.trim())
  if (activeCategory.value !== null) params.set('categoryId', String(activeCategory.value))
  const res = await fetch(`/api/StoreApi/products?${params}`)
  products.value = await res.json()
  loading.value = false
}

function handleSearch(): void {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(fetchProducts, 400)
}

function setCategory(id: number | null): void {
  activeCategory.value = id
}

function openProduct(product: ProductDto): void {
  selectedProduct.value = product
  isModalOpen.value = true
}

watch(activeCategory, fetchProducts)

onMounted(async () => {
  await fetchCategories()
  await fetchProducts()
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

/* ── 搜尋 + 排序列 ── */
.store-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.store-search-input {
  flex: 1;
  min-width: 200px;
  max-width: 360px;
  padding: 10px 16px;
  border-radius: 100px;
  border: 1.5px solid var(--border);
  background: transparent;
  font-size: 0.88rem;
  color: var(--text-primary);
  font-family: var(--font-body);
  transition: border-color 0.3s;
  outline: none;
}

.store-search-input:focus {
  border-color: var(--accent);
}

.store-search-input::placeholder {
  color: var(--text-secondary);
}

.store-sort-select {
  padding: 10px 36px 10px 16px;
  border-radius: 100px;
  border: 1.5px solid var(--border);
  background: transparent;
  font-size: 0.88rem;
  color: var(--text-primary);
  font-family: var(--font-body);
  cursor: pointer;
  transition: border-color 0.3s;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b5e52' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
}

.store-sort-select:focus {
  border-color: var(--accent);
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

/* ── Modal ── */
:deep(.v-overlay__content) {
  border-radius: var(--radius-lg) !important;
  overflow: hidden;
}

.product-modal {
  background: var(--bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.modal-close:hover {
  background: #ffffff;
  transform: scale(1.1);
}

.modal-img-wrap {
  position: relative;
  height: 320px;
  overflow: hidden;
}

.modal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-body {
  padding: 32px;
}

.modal-title {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 400;
  color: var(--text-primary);
  margin: 8px 0 16px;
  line-height: 1.2;
}

.modal-desc {
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 28px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.modal-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.modal-detail-btn {
  padding: 12px 24px;
  border-radius: 100px;
  border: 1.5px solid var(--bg-dark);
  background: transparent;
  color: var(--text-primary);
  font-size: 0.88rem;
  font-family: var(--font-body);
  font-weight: 600;
  text-decoration: none;
  transition: background 0.3s, color 0.3s;
}

.modal-detail-btn:hover {
  background: var(--bg-dark);
  color: var(--text-light);
}

.modal-cart-btn {
  padding: 12px 28px;
  border-radius: 100px;
  border: none;
  background: var(--bg-dark);
  color: var(--text-light);
  font-size: 0.88rem;
  font-family: var(--font-body);
  font-weight: 600;
  cursor: not-allowed;
  opacity: 0.45;
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

  .modal-img-wrap {
    height: 220px;
  }

  .modal-body {
    padding: 24px;
  }

  .modal-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
