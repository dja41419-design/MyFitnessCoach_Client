import { fetchWithAuth } from './fetchWithAuth'

export interface FoodRecordDto {
  id: number
  foodId: number
  foodName: string
  amount: number
  measure: string
  mealType: string
  calories: number
  protein: number
  carbs: number
  fat: number
  eatDT: string       // 'YYYY-MM-DD'
  note?: string | null
}

export interface DailyNutritionSummaryDto {
  targetCalories: number
  consumedCalories: number
  remainingCalories: number
  targetProtein: number
  consumedProtein: number
  remainingProtein: number
  targetCarbs: number
  consumedCarbs: number
  remainingCarbs: number
  targetFat: number
  consumedFat: number
  remainingFat: number
}

export interface DailyDietPageDto {
  eatDate: string
  records: FoodRecordDto[]
  summary: DailyNutritionSummaryDto
}

export interface CreateFoodRecordRequest {
  foodId: number
  amount: number
  measure: string
  mealType: string
  eatDT: string
  note?: string
}

export interface UpdateFoodRecordRequest {
  amount: number
  measure: string
  mealType: string
  eatDT: string
  note?: string
}

export interface CopyDailyDietRequest {
  sourceDate: string
  targetDate: string
  overwriteTargetDate: boolean
}

export async function getDailyDiet(eatDate: string): Promise<DailyDietPageDto> {
  const res = await fetchWithAuth(`/api/DailyDiet?eatDate=${eatDate}`)
  if (!res.ok) throw new Error('載入飲食紀錄失敗')
  return res.json()
}

export async function createFoodRecord(request: CreateFoodRecordRequest): Promise<FoodRecordDto> {
  const res = await fetchWithAuth('/api/DailyDiet/food-records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) throw new Error('新增食物紀錄失敗')
  return res.json()
}

export async function updateFoodRecord(id: number, request: UpdateFoodRecordRequest): Promise<FoodRecordDto> {
  const res = await fetchWithAuth(`/api/DailyDiet/food-records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) throw new Error('修改食物紀錄失敗')
  return res.json()
}

export async function deleteFoodRecord(id: number): Promise<void> {
  const res = await fetchWithAuth(`/api/DailyDiet/food-records/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('刪除食物紀錄失敗')
}

export async function copyDailyDiet(request: CopyDailyDietRequest): Promise<DailyDietPageDto> {
  const res = await fetchWithAuth('/api/DailyDiet/copy-from-date', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (res.status === 409) throw Object.assign(new Error('目標日期已有飲食紀錄'), { status: 409 })
  if (!res.ok) throw new Error('複製飲食紀錄失敗')
  return res.json()
}
