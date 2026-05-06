import { fetchWithAuth } from './fetchWithAuth'

export interface ServingSizeDto {
  id: number
  measure: string
  baseAmount: number
  weightInGrams: number
  kcal: number
  proteinGram: number
  carbGram: number
  fatGram: number
}

export interface FoodDto {
  id: number
  memberId: number | null
  categoryId: number | null
  categoryName: string | null
  foodName: string
  isCustom: boolean
  servingSizes: ServingSizeDto[]
}

export interface FoodCategoryDto {
  id: number
  categoryName: string
}

export interface FoodLibraryBundle {
  systemFoods: FoodDto[]
  customFoods: FoodDto[]
  favoriteFoodIds: number[]
  categories: FoodCategoryDto[]
  version: number
}

export interface CreateServingSizeDto {
  measure: string
  baseAmount: number
  weightInGrams: number
  kcal: number
  proteinGram: number
  carbGram: number
  fatGram: number
}

export interface CreateFoodDto {
  categoryId: number
  foodName: string
  servingSizes: CreateServingSizeDto[]
}

export interface UpdateFoodDto {
  categoryId: number
  foodName: string
  servingSizes: CreateServingSizeDto[]
}

export async function fetchFoodVersion(): Promise<number> {
  const res = await fetch('/api/FoodLibrary/version')
  if (!res.ok) throw new Error('version fetch failed')
  const data = await res.json()
  return data.version
}

export async function fetchFoodBundle(): Promise<FoodLibraryBundle> {
  const res = await fetchWithAuth('/api/FoodLibrary/all')
  if (!res.ok) throw new Error('bundle fetch failed')
  return res.json()
}

export async function createCustomFood(dto: CreateFoodDto): Promise<FoodDto> {
  const res = await fetchWithAuth('/api/FoodLibrary/foods', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto)
  })
  if (!res.ok) throw new Error('create food failed')
  return res.json()
}

export async function updateCustomFood(id: number, dto: UpdateFoodDto): Promise<void> {
  const res = await fetchWithAuth(`/api/FoodLibrary/foods/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto)
  })
  if (!res.ok) throw new Error('update food failed')
}

export async function deleteCustomFood(id: number): Promise<void> {
  const res = await fetchWithAuth(`/api/FoodLibrary/foods/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('delete food failed')
}

export async function addFavorite(foodId: number): Promise<void> {
  const res = await fetchWithAuth('/api/FoodLibrary/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ foodId })
  })
  if (!res.ok) throw new Error('add favorite failed')
}

export async function removeFavorite(foodId: number): Promise<void> {
  const res = await fetchWithAuth(`/api/FoodLibrary/favorites/${foodId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('remove favorite failed')
}
