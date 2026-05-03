import { ref } from 'vue'
import { type GoalsData, HEALTH_GOALS } from './useGoals'

// ── Types ──────────────────────────────────────────────────────
export interface Food {
  id: string
  name: string
  category: string
  baseAmount: number
  measure: string
  weightInGrams: number
  cal: number
  p: number
  c: number
  f: number
  custom: boolean
}

export interface MealEntry {
  uid: string
  foodId: string
  name: string
  cal: number
  p: number
  c: number
  f: number
  serving: string
  servings: number
}

export interface DietLog {
  meals: {
    breakfast: MealEntry[]
    lunch: MealEntry[]
    dinner: MealEntry[]
    snack: MealEntry[]
  }
  water: number
}

// ── Constants ──────────────────────────────────────────────────
export const FOOD_PAGE_SIZE = 20

/** @deprecated — category list now comes from GET /api/FoodLibrary/all */
export const FOOD_CATEGORIES: string[] = []

export const MEAL_META = [
  { id: 'breakfast', label: '早餐', icon: '🌅' },
  { id: 'lunch',     label: '午餐', icon: '☀️' },
  { id: 'dinner',    label: '晚餐', icon: '🌙' },
  { id: 'snack',     label: '點心', icon: '🍎' },
] as const

function defaultBirthDate(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 30)
  return d.toISOString().split('T')[0]
}

const DEFAULT_GOALS: GoalsData = {
  height: 165, targetWeight: 60, birthDate: defaultBirthDate(), gender: 'F',
  activityLevel: '1.55', healthGoal: '健康飲食',
  calories: 1800, protein: 130, carbs: 180, fat: 55, water: 2000,
}

// ── Module-level singleton state ───────────────────────────────
const dietLogs  = ref<Record<string, DietLog>>({})
const goals     = ref<GoalsData>({ ...DEFAULT_GOALS })
let initialized = false

// ── Utilities ──────────────────────────────────────────────────
export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function prevDay(ds: string): string {
  const [y, m, day] = ds.split('-').map(Number)
  const d = new Date(y, m - 1, day - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function genUid(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function r1(n: number): number {
  return Math.round(n * 10) / 10
}

export function r0(n: number): number {
  return Math.round(n)
}

export function pct(v: number, g: number): number {
  if (!g) return 0
  return Math.min(100, Math.round((v / g) * 100))
}

export function servingText(f: { baseAmount: number; measure: string; weightInGrams: number }): string {
  return `${f.baseAmount}${f.measure}（${f.weightInGrams}g）`
}

// ── Storage ────────────────────────────────────────────────────
function loadData() {
  const sd = localStorage.getItem('hf_diet')
  dietLogs.value = sd ? JSON.parse(sd) : {}

  const sg = localStorage.getItem('hf_goals')
  if (sg) {
    const parsed = JSON.parse(sg) as GoalsData & { age?: number }
    if (parsed.age && !parsed.birthDate) {
      const d = new Date()
      d.setFullYear(d.getFullYear() - parsed.age)
      parsed.birthDate = d.toISOString().split('T')[0]
    }
    goals.value = { ...DEFAULT_GOALS, ...parsed }
  } else {
    goals.value = { ...DEFAULT_GOALS }
  }
}

function saveData() {
  localStorage.setItem('hf_diet',  JSON.stringify(dietLogs.value))
  localStorage.setItem('hf_goals', JSON.stringify(goals.value))
}

// ── Day log helpers ────────────────────────────────────────────
function getDayLog(date: string): DietLog {
  if (!dietLogs.value[date]) {
    dietLogs.value[date] = {
      meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
      water: 0,
    }
  }
  return dietLogs.value[date]
}

function getDayTotals(date: string) {
  const log = getDayLog(date)
  let cal = 0, p = 0, c = 0, f = 0
  for (const items of Object.values(log.meals)) {
    for (const it of items) {
      cal += it.cal * it.servings
      p   += it.p   * it.servings
      c   += it.c   * it.servings
      f   += it.f   * it.servings
    }
  }
  return { cal, p, c, f }
}

function getMealTotals(date: string, mealId: string) {
  const items = getDayLog(date).meals[mealId as keyof DietLog['meals']] || []
  let cal = 0, p = 0, c = 0, f = 0
  for (const it of items) {
    cal += it.cal * it.servings
    p   += it.p   * it.servings
    c   += it.c   * it.servings
    f   += it.f   * it.servings
  }
  return { cal, p, c, f }
}

// ── Public composable ──────────────────────────────────────────
export function useHealthTracker() {
  if (!initialized) {
    initialized = true
    loadData()
  }

  return {
    // State
    dietLogs,
    goals,
    // Storage
    saveData,
    loadData,
    // Day log
    getDayLog,
    getDayTotals,
    getMealTotals,
    // Constants
    HEALTH_GOALS,
    MEAL_META,
    FOOD_PAGE_SIZE,
    DEFAULT_GOALS,
    // Utils
    todayStr,
    prevDay,
    genUid,
    r1,
    r0,
    pct,
    servingText,
  }
}
