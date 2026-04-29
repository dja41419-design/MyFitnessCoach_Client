import { fetchWithAuth } from './fetchWithAuth'

export interface BasicInfoDto {
  height: number
  targetWeight: number
  dateOfBirth: string   // 'YYYY-MM-DD'
  gender: 'M' | 'F'
  activityLevel: string // '1.2' | '1.375' | '1.55' | '1.725' | '1.9'
  healthGoal: string
}

export interface TargetCaloriesDto {
  totalCalories: number
  protein: number
  carbs: number
  fat: number
  water: number
}

export interface GoalPageResponse {
  info: BasicInfoDto | null
  goals: TargetCaloriesDto | null
}

export async function loadGoalPage(): Promise<GoalPageResponse> {
  const res = await fetchWithAuth('/api/Goals')
  if (!res.ok) throw new Error('載入目標設定失敗')
  return res.json()
}

export async function saveBasicInfo(dto: BasicInfoDto): Promise<GoalPageResponse> {
  const res = await fetchWithAuth('/api/Goals/Info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })
  if (!res.ok) throw new Error('儲存基本資料失敗')
  return res.json()
}

export async function saveTargetCalories(dto: TargetCaloriesDto): Promise<void> {
  const res = await fetchWithAuth('/api/Goals/TargetCalories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })
  if (!res.ok) throw new Error('儲存營養目標失敗')
}
