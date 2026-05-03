import { fetchWithAuth } from './fetchWithAuth'

export interface HealthReportRange {
  fromDate: string
  toDate: string
  rangeDays: number
  isPreset: boolean
}

export interface HealthReportSummary {
  latestWeight: number | null
  weightChange: number | null
  latestBodyFat: number | null
  bodyFatChange: number | null
  latestSkeletalMuscle: number | null
  skeletalMuscleChange: number | null
  latestBmi: number | null
  targetWeight: number | null
  avgCalories: number | null
  avgProtein: number | null
  avgCarbs: number | null
  avgFat: number | null
  avgWater: number | null
  recordedBodyDays: number
  recordedDietDays: number
}

export interface HealthReportTrends {
  weightSlope: number | null
  bodyFatSlope: number | null
  skeletalMuscleSlope: number | null
  calorieSlope: number | null
  proteinSlope: number | null
  weightDirection: 'up' | 'down' | 'flat' | 'unknown'
  bodyFatDirection: 'up' | 'down' | 'flat' | 'unknown'
  skeletalMuscleDirection: 'up' | 'down' | 'flat' | 'unknown'
  calorieDirection: 'up' | 'down' | 'flat' | 'unknown'
  proteinDirection: 'up' | 'down' | 'flat' | 'unknown'
}

export interface BodyMetricPoint {
  date: string
  weight: number | null
  bodyFat: number | null
  skeletalMuscle: number | null
  waistCircumference: number | null
  hipCircumference: number | null
  bmi: number | null
}

export interface NutritionPoint {
  date: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  water: number | null
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  targetWater: number
}

export interface AdvicePreviewItem {
  category: string
  severity: string
  message: string
}

export interface HealthReportResponse {
  range: HealthReportRange
  summary: HealthReportSummary
  trends: HealthReportTrends
  series: {
    body: BodyMetricPoint[]
    nutrition: NutritionPoint[]
  }
  advicePreview: AdvicePreviewItem[]
}

export async function getHealthReport(params: {
  rangeDays?: number
  fromDate?: string
  toDate?: string
}): Promise<HealthReportResponse> {
  const qs = new URLSearchParams()
  if (params.rangeDays != null) qs.set('rangeDays', String(params.rangeDays))
  if (params.fromDate)          qs.set('fromDate',  params.fromDate)
  if (params.toDate)            qs.set('toDate',    params.toDate)

  const res = await fetchWithAuth(`/api/HealthReport?${qs}`)
  if (!res.ok) throw new Error(`HealthReport API error: ${res.status}`)
  return res.json()
}
