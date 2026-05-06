import { fetchWithAuth } from './fetchWithAuth'

export interface DietPrerequisiteStatusDto {
  canUseDailyDiet: boolean
  hasPersonalInfo: boolean
  hasGoalBasicInfo: boolean
  hasNutritionGoals: boolean
  missingCodes: string[]
  messages: string[]
}

export class DietPrerequisiteError extends Error {
  readonly status: DietPrerequisiteStatusDto
  constructor(status: DietPrerequisiteStatusDto) {
    super('飲食紀錄前置條件未達成')
    this.name   = 'DietPrerequisiteError'
    this.status = status
  }
}

export async function getDailyDietPrerequisites(): Promise<DietPrerequisiteStatusDto> {
  const res = await fetchWithAuth('/api/DailyDiet/prerequisites')
  if (!res.ok) throw new Error('載入前置條件失敗')
  return res.json()
}

function throwIfPrerequisite(res: Response, body: unknown): void {
  if (res.status === 412) throw new DietPrerequisiteError(body as DietPrerequisiteStatusDto)
}

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
  targetWater: number
}

export interface DailyDietPageDto {
  eatDate: string
  waterAmount: number
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

export interface UpdateWaterLogRequest {
  logDate: string
  amount: number
}

export async function getDailyDiet(eatDate: string): Promise<DailyDietPageDto> {
  const res  = await fetchWithAuth(`/api/DailyDiet?eatDate=${eatDate}`)
  const body = await res.json().catch(() => ({}))
  throwIfPrerequisite(res, body)
  if (!res.ok) throw new Error('載入飲食紀錄失敗')
  return body as DailyDietPageDto
}

export async function createFoodRecord(request: CreateFoodRecordRequest): Promise<FoodRecordDto> {
  const res  = await fetchWithAuth('/api/DailyDiet/food-records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  const body = await res.json().catch(() => ({}))
  throwIfPrerequisite(res, body)
  if (!res.ok) throw new Error('新增食物紀錄失敗')
  return body as FoodRecordDto
}

export async function updateFoodRecord(id: number, request: UpdateFoodRecordRequest): Promise<FoodRecordDto> {
  const res  = await fetchWithAuth(`/api/DailyDiet/food-records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  const body = await res.json().catch(() => ({}))
  throwIfPrerequisite(res, body)
  if (!res.ok) throw new Error('修改食物紀錄失敗')
  return body as FoodRecordDto
}

export async function deleteFoodRecord(id: number): Promise<void> {
  const res  = await fetchWithAuth(`/api/DailyDiet/food-records/${id}`, { method: 'DELETE' })
  const body = await res.json().catch(() => ({}))
  throwIfPrerequisite(res, body)
  if (!res.ok) throw new Error('刪除食物紀錄失敗')
}

export async function copyDailyDiet(request: CopyDailyDietRequest): Promise<DailyDietPageDto> {
  const res  = await fetchWithAuth('/api/DailyDiet/copy-from-date', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  const body = await res.json().catch(() => ({}))
  throwIfPrerequisite(res, body)
  if (res.status === 409) throw Object.assign(new Error('目標日期已有飲食紀錄'), { status: 409 })
  if (!res.ok) throw new Error('複製飲食紀錄失敗')
  return body as DailyDietPageDto
}

export async function updateWaterLog(request: UpdateWaterLogRequest): Promise<number> {
  const res  = await fetchWithAuth('/api/DailyDiet/water-log', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  const body = await res.json().catch(() => ({}))
  throwIfPrerequisite(res, body)
  if (!res.ok) throw new Error('更新飲水紀錄失敗')
  return (body as { amount: number }).amount
}
