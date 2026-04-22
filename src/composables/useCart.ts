import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchWithAuth } from '@/data/fetchWithAuth'

// ----- Types ----------------------------------------------------------------

export interface CartItem {
  /** Row identifier — guest 模式下 = productId;登入模式下 = CartItem.Id(DB PK) */
  id: number
  /** 一律是 Product.Id(不論 guest / logged-in) */
  productId: number
  name: string
  unitPrice: number
  originalPrice: number
  imageUrl: string
  categoryName: string
  qty: number
}

/** 呼叫 addItem 時要傳入的商品輪廓。id 就是 Product.Id。 */
export interface ProductLike {
  id: number
  name: string
  unitPrice: number
  originalPrice: number
  imageUrl: string
  categoryName: string
}

interface ServerCartItemDto {
  id: number
  productId: number
  qty: number
  name: string
  unitPrice: number
  originalPrice: number
  imageUrl: string | null
  categoryName: string | null
}

interface ServerCartDto {
  id: number
  memberId: number
  items: ServerCartItemDto[]
  itemCount?: number
  subtotal?: number
}

const STORAGE_KEY = 'myfitnesscoach_cart'

// ----- localStorage helpers -------------------------------------------------

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // 相容舊格式(沒有 productId 欄位時,id 就是 productId)
    return parsed.map((p: any) => ({
      id: p.id,
      productId: p.productId ?? p.id,
      name: p.name,
      unitPrice: p.unitPrice,
      originalPrice: p.originalPrice,
      imageUrl: p.imageUrl,
      categoryName: p.categoryName,
      qty: p.qty,
    }))
  } catch {
    return []
  }
}

function isLoggedIn(): boolean {
  return !!localStorage.getItem('token')
}

function mapServerItem(dto: ServerCartItemDto): CartItem {
  return {
    id: dto.id,                    // CartItem.Id
    productId: dto.productId,      // Product.Id
    name: dto.name,
    unitPrice: dto.unitPrice,
    originalPrice: dto.originalPrice,
    imageUrl: dto.imageUrl ?? '',
    categoryName: dto.categoryName ?? '',
    qty: dto.qty,
  }
}

// ----- Module-level state ---------------------------------------------------

const items = ref<CartItem[]>(loadFromStorage())

// 僅在 guest 模式下持久化到 localStorage;登入狀態的 cart 由 DB 保管,不寫回 localStorage。
watch(
  items,
  (newItems) => {
    if (!isLoggedIn()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))
    }
  },
  { deep: true }
)

/** 從 API 或 localStorage 重新載入購物車(登入 / 登出後呼叫)。 */
async function loadCart(): Promise<void> {
  if (isLoggedIn()) {
    try {
      const res = await fetchWithAuth('/api/CartApi')
      if (res.ok) {
        const dto = (await res.json()) as ServerCartDto
        items.value = (dto.items ?? []).map(mapServerItem)
      } else if (res.status !== 401) {
        // 401 會被 fetchWithAuth 自動導去登入頁;其它錯誤靜默
        items.value = []
      }
    } catch {
      items.value = []
    }
  } else {
    items.value = loadFromStorage()
  }
}

// 模組載入時觸發一次非同步載入(登入狀態改變時各處理器要再呼叫 loadCart)
void loadCart()

// ----- Exported API ---------------------------------------------------------

export function useCart() {
  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.qty, 0)
  )

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
  )

  /** 加入商品。product.id 是 Product.Id。 */
  async function addItem(product: ProductLike, qty = 1): Promise<void> {
    if (isLoggedIn()) {
      try {
        const res = await fetchWithAuth('/api/CartApi/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, qty }),
        })
        if (!res.ok) {
          ElMessage.error('加入購物車失敗')
          return
        }
        const dto = (await res.json()) as ServerCartItemDto
        const mapped = mapServerItem(dto)
        const idx = items.value.findIndex((i) => i.productId === mapped.productId)
        if (idx >= 0) {
          items.value[idx] = mapped
        } else {
          items.value.push(mapped)
        }
      } catch {
        ElMessage.error('加入購物車失敗')
      }
    } else {
      // Guest 模式:本地操作
      const existing = items.value.find((i) => i.productId === product.id)
      if (existing) {
        existing.qty += qty
      } else {
        items.value.push({
          id: product.id,
          productId: product.id,
          name: product.name,
          unitPrice: product.unitPrice,
          originalPrice: product.originalPrice,
          imageUrl: product.imageUrl,
          categoryName: product.categoryName,
          qty,
        })
      }
    }
  }

  /**
   * 移除購物車單項。
   * id 的意義:guest 模式下是 productId;登入模式下是 CartItem.Id。
   * 這也正是 cart view 內 `v-for` 用的 item.id。
   */
  async function removeItem(id: number): Promise<void> {
    if (isLoggedIn()) {
      try {
        const res = await fetchWithAuth(`/api/CartApi/items/${id}`, { method: 'DELETE' })
        if (!res.ok && res.status !== 404) {
          ElMessage.error('移除失敗')
          return
        }
        items.value = items.value.filter((i) => i.id !== id)
      } catch {
        ElMessage.error('移除失敗')
      }
    } else {
      items.value = items.value.filter((i) => i.id !== id)
    }
  }

  /** 調整數量;qty <= 0 時等同移除。 */
  async function updateQty(id: number, qty: number): Promise<void> {
    if (qty <= 0) {
      await removeItem(id)
      return
    }

    if (isLoggedIn()) {
      try {
        const res = await fetchWithAuth(`/api/CartApi/items/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qty }),
        })
        if (!res.ok) {
          ElMessage.error('更新失敗')
          return
        }
        const dto = (await res.json()) as ServerCartItemDto
        const mapped = mapServerItem(dto)
        const idx = items.value.findIndex((i) => i.id === id)
        if (idx >= 0) items.value[idx] = mapped
      } catch {
        ElMessage.error('更新失敗')
      }
    } else {
      const item = items.value.find((i) => i.id === id)
      if (item) item.qty = qty
    }
  }

  async function clearCart(): Promise<void> {
    if (isLoggedIn()) {
      try {
        const res = await fetchWithAuth('/api/CartApi', { method: 'DELETE' })
        if (!res.ok) {
          ElMessage.error('清空失敗')
          return
        }
        items.value = []
      } catch {
        ElMessage.error('清空失敗')
      }
    } else {
      items.value = []
    }
  }

  return {
    items,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    loadCart, // 供登入 / 登出流程手動觸發重新載入
  }
}

/**
 * 登入成功後呼叫:把 localStorage 的 guest 購物車合併到 DB,然後重新載入。
 * 若沒有 guest 資料,單純 reload。
 */
export async function mergeGuestCartOnLogin(): Promise<void> {
  const guest = loadFromStorage()

  if (guest.length > 0) {
    try {
      await fetchWithAuth('/api/CartApi/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: guest.map((i) => ({ productId: i.productId, qty: i.qty })),
        }),
      })
    } catch {
      // 合併失敗不阻擋登入流程,靜默
    }
    localStorage.removeItem(STORAGE_KEY)
  }

  // 重新從 API 撈最新購物車
  const res = await fetchWithAuth('/api/CartApi')
  if (res.ok) {
    const dto = (await res.json()) as ServerCartDto
    items.value = (dto.items ?? []).map(mapServerItem)
  }
}

/** 登出時呼叫:清空 in-memory cart state 與 localStorage。 */
export function clearCartOnLogout(): void {
  items.value = []
  localStorage.removeItem(STORAGE_KEY)
}
