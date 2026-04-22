import { ref, computed, watch } from 'vue'

export interface CartItem {
  id: number
  name: string
  unitPrice: number
  originalPrice: number
  imageUrl: string
  categoryName: string
  qty: number
}

const STORAGE_KEY = 'myfitnesscoach_cart'

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// 模組層級的 reactive state，讓多個元件共享同一份購物車
const items = ref<CartItem[]>(loadFromStorage())

// 變動時自動持久化到 localStorage
watch(
  items,
  (newItems) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))
  },
  { deep: true }
)

export function useCart() {
  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.qty, 0)
  )

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
  )

  function addItem(product: Omit<CartItem, 'qty'>, qty = 1): void {
    const existing = items.value.find((i) => i.id === product.id)
    if (existing) {
      existing.qty += qty
    } else {
      items.value.push({ ...product, qty })
    }
  }

  function removeItem(id: number): void {
    items.value = items.value.filter((i) => i.id !== id)
  }

  function updateQty(id: number, qty: number): void {
    const item = items.value.find((i) => i.id === id)
    if (!item) return
    if (qty <= 0) {
      removeItem(id)
    } else {
      item.qty = qty
    }
  }

  function clearCart(): void {
    items.value = []
  }

  return {
    items,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQty,
    clearCart,
  }
}
