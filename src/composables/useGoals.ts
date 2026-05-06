// Mifflin-St Jeor formula — keep in sync with backend GoalCalculator.cs
// BMR (M): 10w + 6.25h - 5a + 5
// BMR (F): 10w + 6.25h - 5a - 161
// TDEE: BMR × activityLevel
// Macros: see calculateMacrosFromGoal

export interface GoalsData {
  height: number
  targetWeight: number
  birthDate: string
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

export const HEALTH_GOALS = ['健康飲食', '增肌', '減脂', '生酮飲食', '糖尿病控糖'] as const

function r0(n: number): number {
  return Math.round(n)
}

function r1(n: number): number {
  return Math.round(n * 10) / 10
}

export function compareOp(val: number, op: string, target: number): boolean {
  switch (op) {
    case '>':  return val > target
    case '<':  return val < target
    case '=':  return val === target
    case '≥':  return val >= target
    case '≤':  return val <= target
    default:   return true
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
