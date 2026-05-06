import { ref, computed } from 'vue'
import {
  fetchFoodVersion,
  fetchFoodBundle,
  createCustomFood,
  updateCustomFood,
  deleteCustomFood,
  addFavorite,
  removeFavorite,
  type FoodDto,
  type FoodCategoryDto,
  type CreateFoodDto,
  type UpdateFoodDto,
} from '@/data/foodLibrary'

// ── Module-level singleton state ───────────────────────────────
const systemFoods     = ref<FoodDto[]>([])
const customFoods     = ref<FoodDto[]>([])
const favoriteFoodIds = ref<number[]>([])
const categories      = ref<FoodCategoryDto[]>([])
const isLoading       = ref(false)
const loadError       = ref<string | null>(null)
let initialized       = false

const allFoods = computed<FoodDto[]>(() => [...systemFoods.value, ...customFoods.value])

// ── Cache helpers ──────────────────────────────────────────────
function bundleKey(memberId: number)  { return `food_lib_v1:${memberId}:bundle` }
function versionKey(memberId: number) { return `food_lib_v1:${memberId}:version` }

function saveToCache(memberId: number) {
  localStorage.setItem(bundleKey(memberId), JSON.stringify({
    systemFoods: systemFoods.value,
    customFoods: customFoods.value,
    favoriteFoodIds: favoriteFoodIds.value,
    categories: categories.value,
  }))
}

// ── Load (stale-while-revalidate) ─────────────────────────────
export async function loadFoods(memberId: number): Promise<void> {
  const localBundle  = localStorage.getItem(bundleKey(memberId))
  const localVersion = localStorage.getItem(versionKey(memberId))

  if (localBundle) {
    const b = JSON.parse(localBundle)
    systemFoods.value     = b.systemFoods     ?? []
    customFoods.value     = b.customFoods     ?? []
    favoriteFoodIds.value = b.favoriteFoodIds ?? []
    categories.value      = b.categories      ?? []
  }

  isLoading.value = true
  loadError.value = null

  try {
    const remoteVersion = await fetchFoodVersion()
    const cachedVersion = localVersion ? Number(localVersion) : -1

    if (remoteVersion !== cachedVersion || !localBundle) {
      const bundle = await fetchFoodBundle()
      systemFoods.value     = bundle.systemFoods
      customFoods.value     = bundle.customFoods
      favoriteFoodIds.value = bundle.favoriteFoodIds
      categories.value      = bundle.categories
      saveToCache(memberId)
      localStorage.setItem(versionKey(memberId), String(bundle.version))
    }
  } catch (e) {
    if (!localBundle) loadError.value = '資料載入失敗，請稍後重試'
    console.warn('FoodLibrary load failed', e)
  } finally {
    isLoading.value = false
    initialized = true
  }
}

// ── CRUD ───────────────────────────────────────────────────────
export async function createFood(memberId: number, dto: CreateFoodDto): Promise<FoodDto> {
  const food = await createCustomFood(dto)
  customFoods.value.push(food)
  saveToCache(memberId)
  return food
}

export async function updateFood(memberId: number, id: number, dto: UpdateFoodDto): Promise<void> {
  await updateCustomFood(id, dto)
  const idx = customFoods.value.findIndex(f => f.id === id)
  if (idx !== -1) {
    customFoods.value[idx] = {
      ...customFoods.value[idx],
      categoryId: dto.categoryId,
      foodName: dto.foodName,
      servingSizes: dto.servingSizes.map((s, i) => ({
        id: customFoods.value[idx].servingSizes[i]?.id ?? 0,
        ...s,
      })),
    }
  }
  saveToCache(memberId)
}

export async function deleteFood(memberId: number, id: number): Promise<void> {
  await deleteCustomFood(id)
  customFoods.value     = customFoods.value.filter(f => f.id !== id)
  favoriteFoodIds.value = favoriteFoodIds.value.filter(fid => fid !== id)
  saveToCache(memberId)
}

export async function toggleFavorite(memberId: number, foodId: number): Promise<void> {
  const isFav = favoriteFoodIds.value.includes(foodId)
  if (isFav) {
    await removeFavorite(foodId)
    favoriteFoodIds.value = favoriteFoodIds.value.filter(id => id !== foodId)
  } else {
    await addFavorite(foodId)
    favoriteFoodIds.value.push(foodId)
  }
  saveToCache(memberId)
}

// ── Public composable ──────────────────────────────────────────
export function useFoodLibrary() {
  return {
    systemFoods,
    customFoods,
    favoriteFoodIds,
    categories,
    allFoods,
    isLoading,
    loadError,
    initialized: computed(() => initialized),
    loadFoods,
    createFood,
    updateFood,
    deleteFood,
    toggleFavorite,
  }
}
