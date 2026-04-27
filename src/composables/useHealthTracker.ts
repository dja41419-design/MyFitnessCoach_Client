import { ref } from 'vue'

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

export interface BodyLog {
  date: string
  weight: number | null
  bodyFat: number | null
  muscleMass: number | null
  waist: number | null
  hip: number | null
  photo: string | null
}

export interface GoalsData {
  height: number
  targetWeight: number
  age: number
  gender: 'M' | 'F'
  activityLevel: string
  healthGoal: string
  calories: number
  protein: number
  carbs: number
  fat: number
  water: number
}

export interface MacroSuggestion {
  calories: number
  protein: number
  carbs: number
  fat: number
}

// ── Constants ──────────────────────────────────────────────────
export const FOOD_PAGE_SIZE = 20

export const FOOD_CATEGORIES = [
  '蛋豆魚肉類', '蔬菜類', '水果類', '澱粉類', '乳製品類',
  '油脂類', '堅果類', '飲品類', '其他',
]

export const HEALTH_GOALS = ['健康飲食', '增肌', '減脂', '生酮飲食', '糖尿病控糖']

export const MEAL_META = [
  { id: 'breakfast', label: '早餐', icon: '🌅' },
  { id: 'lunch',     label: '午餐', icon: '☀️' },
  { id: 'dinner',    label: '晚餐', icon: '🌙' },
  { id: 'snack',     label: '點心', icon: '🍎' },
] as const

const DEFAULT_FOODS: Food[] = [
  { id:'f01', name:'白飯',     category:'澱粉類',    baseAmount:1,   measure:'碗',  weightInGrams:200, cal:260, p:4.8, c:57,  f:0.4, custom:false },
  { id:'f02', name:'地瓜',     category:'澱粉類',    baseAmount:1,   measure:'條',  weightInGrams:100, cal:86,  p:1.6, c:20,  f:0.1, custom:false },
  { id:'f03', name:'雞胸肉',   category:'蛋豆魚肉類', baseAmount:1,   measure:'份',  weightInGrams:100, cal:165, p:31,  c:0,   f:3.6, custom:false },
  { id:'f04', name:'水煮蛋',   category:'蛋豆魚肉類', baseAmount:1,   measure:'顆',  weightInGrams:50,  cal:77,  p:6.4, c:0.6, f:5.3, custom:false },
  { id:'f05', name:'嫩豆腐',   category:'蛋豆魚肉類', baseAmount:1,   measure:'塊',  weightInGrams:100, cal:76,  p:8,   c:1.9, f:4.2, custom:false },
  { id:'f06', name:'花椰菜',   category:'蔬菜類',    baseAmount:100, measure:'g',   weightInGrams:100, cal:34,  p:2.8, c:6.6, f:0.4, custom:false },
  { id:'f07', name:'香蕉',     category:'水果類',    baseAmount:1,   measure:'根',  weightInGrams:120, cal:107, p:1.3, c:27,  f:0.4, custom:false },
  { id:'f08', name:'全脂牛奶', category:'乳製品類',   baseAmount:250, measure:'ml',  weightInGrams:257, cal:148, p:7.7, c:11.6,f:8,   custom:false },
  { id:'f09', name:'大燕麥片', category:'澱粉類',    baseAmount:100, measure:'g',   weightInGrams:100, cal:379, p:13,  c:67,  f:6.5, custom:false },
  { id:'f10', name:'鮭魚',     category:'蛋豆魚肉類', baseAmount:1,   measure:'份',  weightInGrams:100, cal:208, p:20,  c:0,   f:13,  custom:false },
  { id:'f11', name:'豬里脊',   category:'蛋豆魚肉類', baseAmount:1,   measure:'份',  weightInGrams:100, cal:143, p:22,  c:0,   f:5.5, custom:false },
  { id:'f12', name:'白吐司',   category:'澱粉類',    baseAmount:1,   measure:'片',  weightInGrams:30,  cal:80,  p:2.6, c:15,  f:1,   custom:false },
  { id:'f13', name:'蘋果',     category:'水果類',    baseAmount:1,   measure:'顆',  weightInGrams:200, cal:104, p:0.5, c:28,  f:0.3, custom:false },
  { id:'f14', name:'希臘優格', category:'乳製品類',   baseAmount:150, measure:'g',   weightInGrams:150, cal:88,  p:15,  c:4.7, f:0.8, custom:false },
  { id:'f15', name:'花生醬',   category:'油脂類',    baseAmount:1,   measure:'大匙', weightInGrams:15,  cal:90,  p:3.6, c:3,   f:7.6, custom:false },
  { id:'f16', name:'牛肉片',   category:'蛋豆魚肉類', baseAmount:100, measure:'g',   weightInGrams:100, cal:250, p:26,  c:0,   f:15,  custom:false },
  { id:'f17', name:'雞蛋炒飯', category:'澱粉類',    baseAmount:1,   measure:'碗',  weightInGrams:300, cal:520, p:15,  c:78,  f:16,  custom:false },
  { id:'f18', name:'拿鐵',     category:'飲品類',    baseAmount:360, measure:'ml',  weightInGrams:370, cal:190, p:10,  c:18,  f:8,   custom:false },
  { id:'f19', name:'毛豆',     category:'蛋豆魚肉類', baseAmount:100, measure:'g',   weightInGrams:100, cal:122, p:11,  c:10,  f:5.2, custom:false },
  { id:'f20', name:'義大利麵', category:'澱粉類',    baseAmount:100, measure:'g',   weightInGrams:100, cal:371, p:13,  c:74,  f:1.1, custom:false },
  { id:'f21', name:'鮪魚罐頭', category:'蛋豆魚肉類', baseAmount:1,   measure:'罐',  weightInGrams:85,  cal:110, p:25,  c:0,   f:1,   custom:false },
  { id:'f22', name:'雞蛋',     category:'蛋豆魚肉類', baseAmount:1,   measure:'顆',  weightInGrams:55,  cal:83,  p:7.3, c:0.6, f:5.7, custom:false },
  { id:'f23', name:'糙米飯',   category:'澱粉類',    baseAmount:1,   measure:'碗',  weightInGrams:200, cal:220, p:5.2, c:46,  f:1.8, custom:false },
  { id:'f24', name:'酪梨',     category:'油脂類',    baseAmount:0.5, measure:'顆',  weightInGrams:100, cal:160, p:2,   c:9,   f:15,  custom:false },
  { id:'f25', name:'菠菜',     category:'蔬菜類',    baseAmount:100, measure:'g',   weightInGrams:100, cal:23,  p:2.9, c:3.6, f:0.4, custom:false },
]

const DEFAULT_GOALS: GoalsData = {
  height: 165, targetWeight: 60, age: 30, gender: 'F',
  activityLevel: '1.55', healthGoal: '健康飲食',
  calories: 1800, protein: 130, carbs: 180, fat: 55, water: 2000,
}

// ── Module-level singleton state ───────────────────────────────
const foods     = ref<Food[]>([])
const dietLogs  = ref<Record<string, DietLog>>({})
const bodyLogs  = ref<BodyLog[]>([])
const goals     = ref<GoalsData>({ ...DEFAULT_GOALS })
const favorites = ref<string[]>([])
let initialized = false

// ── Utilities ──────────────────────────────────────────────────
export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function prevDay(ds: string): string {
  const d = new Date(ds)
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
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

export function servingText(f: Food): string {
  return `${f.baseAmount}${f.measure}（${f.weightInGrams}g）`
}

export function compareOp(val: number, op: string, target: number): boolean {
  switch (op) {
    case '>': return val > target
    case '<': return val < target
    case '=': return val === target
    case '≥': return val >= target
    case '≤': return val <= target
    default: return true
  }
}

export function calcBMI(weight: number | null, height: number): number | null {
  if (!weight || !height) return null
  return r1(weight / Math.pow(height / 100, 2))
}

export function bmiLabel(bmi: number): { text: string; cls: string } {
  if (bmi < 18.5) return { text: '過輕', cls: 'badge-yellow' }
  if (bmi < 24)   return { text: '正常', cls: 'badge-green' }
  if (bmi < 27)   return { text: '過重', cls: 'badge-yellow' }
  return                  { text: '肥胖', cls: 'badge-red' }
}

export function calculateBMR(weight: number, height: number, age: number, gender: string): number | null {
  if (!weight || !height || !age) return null
  const base = 10 * weight + 6.25 * height - 5 * age
  return r0(gender === 'M' ? base + 5 : base - 161)
}

export function calculateTDEE(bmr: number, activityLevel: string): number | null {
  if (!bmr) return null
  return r0(bmr * parseFloat(activityLevel))
}

export function calculateMacrosFromGoal(tdee: number, weightKg: number, goal: string): MacroSuggestion {
  const w = weightKg || 60
  let calories: number, protein: number, carbs: number, fat: number
  switch (goal) {
    case '增肌':
      calories = r0(tdee + 300)
      protein  = r0(w * 2)
      fat      = r0(calories * 0.25 / 9)
      carbs    = Math.max(0, r0((calories - protein * 4 - fat * 9) / 4))
      break
    case '減脂':
      calories = Math.max(1200, r0(tdee - 500))
      protein  = r0(w * 2)
      fat      = r0(calories * 0.25 / 9)
      carbs    = Math.max(0, r0((calories - protein * 4 - fat * 9) / 4))
      break
    case '生酮飲食':
      calories = r0(tdee)
      fat      = r0(calories * 0.70 / 9)
      protein  = r0(calories * 0.25 / 4)
      carbs    = r0(calories * 0.05 / 4)
      break
    case '糖尿病控糖':
      calories = r0(tdee)
      carbs    = r0(calories * 0.40 / 4)
      protein  = r0(calories * 0.30 / 4)
      fat      = r0(calories * 0.30 / 9)
      break
    default: // 健康飲食
      calories = r0(tdee)
      carbs    = r0(calories * 0.50 / 4)
      protein  = r0(calories * 0.20 / 4)
      fat      = r0(calories * 0.30 / 9)
  }
  return { calories, protein, carbs, fat }
}

// ── Sample data generators ─────────────────────────────────────
function generateSampleBody(): BodyLog[] {
  const logs: BodyLog[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const date = d.toISOString().split('T')[0]
    const w  = r1(68.5 - i * 0.04 + (Math.random() * 0.4 - 0.2))
    const bf = r1(22.5 - i * 0.015 + (Math.random() * 0.3 - 0.15))
    logs.push({
      date, weight: w, bodyFat: bf,
      muscleMass: r1(w * (1 - bf / 100) * 0.55),
      waist: r1(76 + Math.random() * 0.8 - 0.4),
      hip:   r1(97 + Math.random() * 0.8 - 0.4),
      photo: null,
    })
  }
  return logs.sort((a, b) => b.date.localeCompare(a.date))
}

function generateSampleDiet(): Record<string, DietLog> {
  const logs: Record<string, DietLog> = {}
  const now = new Date()
  const bSets = [['f09','f08','f04'],['f12','f04','f08'],['f14','f07','f08']]
  const lSets = [['f01','f03','f06'],['f23','f11','f25'],['f17','f25']]
  const dSets = [['f01','f10','f06'],['f23','f16','f19'],['f01','f11','f05']]
  const sSets = [['f07','f14'],['f13','f04'],['f19','f07']]
  for (let i = 13; i >= 1; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const date = d.toISOString().split('T')[0]
    const pick = (s: string[][]) => s[i % s.length]
    const makeItems = (ids: string[]): MealEntry[] => ids.map(id => {
      const food = DEFAULT_FOODS.find(f => f.id === id) || DEFAULT_FOODS[0]
      const srvOptions = [0.5, 1, 1, 1, 1.5, 2]
      const srv = srvOptions[Math.floor(Math.random() * srvOptions.length)]
      return {
        uid: genUid(), foodId: food.id, name: food.name,
        cal: food.cal, p: food.p, c: food.c, f: food.f,
        serving: servingText(food), servings: srv,
      }
    })
    logs[date] = {
      meals: {
        breakfast: makeItems(pick(bSets)),
        lunch:     makeItems(pick(lSets)),
        dinner:    makeItems(pick(dSets)),
        snack:     makeItems(pick(sSets)),
      },
      water: r0(1200 + Math.random() * 1000),
    }
  }
  return logs
}

// ── Storage ────────────────────────────────────────────────────
function loadData() {
  const sf = localStorage.getItem('hf_foods')
  foods.value = sf
    ? (JSON.parse(sf) as Food[]).map(f => ({
        baseAmount: f.baseAmount ?? 1, measure: f.measure ?? '份',
        weightInGrams: f.weightInGrams ?? 100, category: f.category ?? '其他',
        ...f,
      }))
    : DEFAULT_FOODS.map(f => ({ ...f }))

  const sd = localStorage.getItem('hf_diet')
  dietLogs.value = sd ? JSON.parse(sd) : generateSampleDiet()

  const sb = localStorage.getItem('hf_body')
  bodyLogs.value = sb ? JSON.parse(sb) : generateSampleBody()

  const sg = localStorage.getItem('hf_goals')
  goals.value = sg ? { ...DEFAULT_GOALS, ...JSON.parse(sg) } : { ...DEFAULT_GOALS }

  const sv = localStorage.getItem('hf_favs')
  favorites.value = sv ? JSON.parse(sv) : ['f03', 'f07', 'f14']
}

function saveData() {
  localStorage.setItem('hf_foods',  JSON.stringify(foods.value))
  localStorage.setItem('hf_diet',   JSON.stringify(dietLogs.value))
  localStorage.setItem('hf_body',   JSON.stringify(bodyLogs.value))
  localStorage.setItem('hf_goals',  JSON.stringify(goals.value))
  localStorage.setItem('hf_favs',   JSON.stringify(favorites.value))
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

function currentWeight(): number | null {
  return bodyLogs.value[0]?.weight ?? null
}

// ── Public composable ──────────────────────────────────────────
export function useHealthTracker() {
  if (!initialized) {
    initialized = true
    loadData()
  }

  return {
    // State
    foods,
    dietLogs,
    bodyLogs,
    goals,
    favorites,
    // Storage
    saveData,
    loadData,
    // Day log
    getDayLog,
    getDayTotals,
    getMealTotals,
    currentWeight,
    // Constants
    FOOD_CATEGORIES,
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
    compareOp,
    calcBMI,
    bmiLabel,
    calculateBMR,
    calculateTDEE,
    calculateMacrosFromGoal,
  }
}
