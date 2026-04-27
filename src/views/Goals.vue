<template>
  <div class="goals">
    <!-- 基本資料 -->
    <div class="card">
      <div class="goals-section-title">基本資料</div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">身高 (cm)</label>
          <input type="number" v-model.number="localGoals.height" min="100" max="250" step="0.1" class="form-input" @blur="liveRefreshTDEE" />
        </div>
        <div class="form-group">
          <label class="form-label">目前體重 (kg)</label>
          <input type="number" v-model.number="localGoals.currentWeight" step="0.1" class="form-input" @blur="liveRefreshTDEE" />
        </div>
        <div class="form-group">
          <label class="form-label">目標體重 (kg)</label>
          <input type="number" v-model.number="localGoals.targetWeight" step="0.1" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">年齡</label>
          <input type="number" v-model.number="localGoals.age" min="10" max="120" class="form-input" @blur="liveRefreshTDEE" />
        </div>
        <div class="form-group">
          <label class="form-label">性別</label>
          <div class="radio-group">
            <label class="radio-label"><input type="radio" v-model="localGoals.gender" value="F" @change="liveRefreshTDEE" /> 女</label>
            <label class="radio-label"><input type="radio" v-model="localGoals.gender" value="M" @change="liveRefreshTDEE" /> 男</label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">活動量</label>
          <select v-model="localGoals.activityLevel" class="form-input" @change="liveRefreshTDEE">
            <option value="1.2">久坐（幾乎不運動）</option>
            <option value="1.375">輕度活動（每週 1-3 天）</option>
            <option value="1.55">中度活動（每週 3-5 天）</option>
            <option value="1.725">高度活動（每週 6-7 天）</option>
            <option value="1.9">非常高強度（每天 2 次）</option>
          </select>
        </div>
        <div class="form-group" style="grid-column: span 2">
          <label class="form-label">健康目標</label>
          <select v-model="localGoals.healthGoal" class="form-input" @change="onGoalChange">
            <option v-for="g in HEALTH_GOALS" :key="g">{{ g }}</option>
          </select>
        </div>
      </div>

      <!-- TDEE 顯示 -->
      <div v-if="tdeeResult.bmr" class="tdee-display">
        <div class="tdee-card">
          <div class="tdee-num">{{ tdeeResult.bmr }}</div>
          <div class="tdee-label">基礎代謝率 (BMR)</div>
          <div class="tdee-sub">kcal/day</div>
        </div>
        <div class="tdee-card">
          <div class="tdee-num">{{ tdeeResult.tdee }}</div>
          <div class="tdee-label">每日總熱量消耗 (TDEE)</div>
          <div class="tdee-sub">kcal/day</div>
        </div>
        <div class="tdee-card">
          <div class="tdee-num">{{ bmiDisplay.value ?? '—' }}</div>
          <div class="tdee-label">BMI</div>
          <div class="tdee-sub" v-if="bmiDisplay.value">
            <span :class="['badge', bmiDisplay.cls]">{{ bmiDisplay.text }}</span>
          </div>
        </div>
      </div>

      <!-- 建議 Banner -->
      <div v-if="macroSuggestion" class="goal-suggest-bar">
        建議目標 (<strong>{{ localGoals.healthGoal }}</strong>)：
        熱量 <strong>{{ macroSuggestion.calories }}</strong> kcal ·
        蛋白質 <strong>{{ macroSuggestion.protein }}</strong>g ·
        碳水 <strong>{{ macroSuggestion.carbs }}</strong>g ·
        脂肪 <strong>{{ macroSuggestion.fat }}</strong>g
        <button class="btn btn-sm ml-8" style="background:var(--ht-warn);color:#fff;border:none" @click="applySuggestion">套用建議</button>
      </div>

      <button class="btn btn-primary" @click="saveBasicInfo">儲存基本資料</button>
    </div>

    <!-- 營養目標 -->
    <div class="card">
      <div class="goals-section-title">每日營養目標</div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">每日熱量目標 (kcal)</label>
          <input type="number" v-model.number="localGoals.calories" min="0" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">蛋白質目標 (g)</label>
          <input type="number" v-model.number="localGoals.protein" min="0" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">碳水化合物目標 (g)</label>
          <input type="number" v-model.number="localGoals.carbs" min="0" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">脂肪目標 (g)</label>
          <input type="number" v-model.number="localGoals.fat" min="0" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">每日飲水目標 (ml)</label>
          <input type="number" v-model.number="localGoals.water" min="0" step="50" class="form-input" />
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" @click="saveNutritionGoals">儲存營養目標</button>
        <button v-if="macroSuggestion" class="btn btn-outline" @click="applySuggestion">套用 TDEE 建議</button>
      </div>
    </div>

    <!-- Toast -->
    <div :class="['toast', { show: toastVisible }]">{{ toastMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  useHealthTracker,
  calcBMI, bmiLabel,
  calculateBMR, calculateTDEE, calculateMacrosFromGoal,
  type MacroSuggestion,
} from '@/composables/useHealthTracker'

const { goals, bodyLogs, saveData, HEALTH_GOALS, r0 } = useHealthTracker()

// local copy of goals (with currentWeight injected)
interface LocalGoals {
  height: number
  currentWeight: number | null
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

const localGoals = reactive<LocalGoals>({
  height: goals.value.height,
  currentWeight: bodyLogs.value[0]?.weight ?? null,
  targetWeight: goals.value.targetWeight,
  age: goals.value.age,
  gender: goals.value.gender,
  activityLevel: goals.value.activityLevel,
  healthGoal: goals.value.healthGoal,
  calories: goals.value.calories,
  protein: goals.value.protein,
  carbs: goals.value.carbs,
  fat: goals.value.fat,
  water: goals.value.water,
})

// ── TDEE calculation ───────────────────────────────────────────
const tdeeResult = reactive({ bmr: null as number | null, tdee: null as number | null })
const macroSuggestion = ref<MacroSuggestion | null>(null)

function liveRefreshTDEE() {
  const w   = localGoals.currentWeight ?? goals.value.targetWeight
  const bmr = calculateBMR(w, localGoals.height, localGoals.age, localGoals.gender)
  tdeeResult.bmr  = bmr
  tdeeResult.tdee = bmr ? calculateTDEE(bmr, localGoals.activityLevel) : null
  if (tdeeResult.tdee) {
    macroSuggestion.value = calculateMacrosFromGoal(tdeeResult.tdee, w, localGoals.healthGoal)
  }
}

function onGoalChange() {
  liveRefreshTDEE()
}

const bmiDisplay = computed(() => {
  const w = localGoals.currentWeight ?? goals.value.targetWeight
  const bmi = calcBMI(w, localGoals.height)
  if (!bmi) return { value: null, text: '', cls: '' }
  const info = bmiLabel(bmi)
  return { value: bmi, ...info }
})

function applySuggestion() {
  if (!macroSuggestion.value) return
  localGoals.calories = macroSuggestion.value.calories
  localGoals.protein  = macroSuggestion.value.protein
  localGoals.carbs    = macroSuggestion.value.carbs
  localGoals.fat      = macroSuggestion.value.fat
  showToast('已套用 TDEE 建議')
}

// ── Save ───────────────────────────────────────────────────────
function saveBasicInfo() {
  goals.value.height        = localGoals.height
  goals.value.targetWeight  = localGoals.targetWeight
  goals.value.age           = localGoals.age
  goals.value.gender        = localGoals.gender
  goals.value.activityLevel = localGoals.activityLevel
  goals.value.healthGoal    = localGoals.healthGoal
  saveData()
  liveRefreshTDEE()
  showToast('基本資料已儲存')
}

function saveNutritionGoals() {
  goals.value.calories = localGoals.calories
  goals.value.protein  = localGoals.protein
  goals.value.carbs    = localGoals.carbs
  goals.value.fat      = localGoals.fat
  goals.value.water    = localGoals.water
  saveData()
  showToast('營養目標已儲存')
}

onMounted(liveRefreshTDEE)

// ── Toast ──────────────────────────────────────────────────────
const toastMsg     = ref('')
const toastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout>

function showToast(msg: string) {
  toastMsg.value     = msg
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 2500)
}
</script>

<style scoped>
.form-input {
  font-family: var(--font-body);
  font-size: 13px;
  border: 1px solid var(--ht-border);
  border-radius: 4px;
  padding: 6px 9px;
  background: var(--ht-surface);
  color: var(--ht-text);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}
.form-input:focus { border-color: var(--ht-green); }

.btn {
  padding: 7px 14px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  border: 1px solid transparent;
  transition: opacity 0.15s, background 0.15s;
}
.btn-primary { background: var(--ht-green); color: #fff; border-color: var(--ht-green); }
.btn-primary:hover { opacity: 0.88; }
.btn-outline { background: none; border-color: var(--ht-border); color: var(--ht-text2); }
.btn-outline:hover { background: var(--ht-surface2); }
.btn-sm { padding: 4px 10px; font-size: 12px; }
.ml-8 { margin-left: 8px; }

.card {
  background: var(--ht-surface);
  border: 1px solid var(--ht-border);
  border-radius: var(--ht-radius);
  padding: 18px;
  margin-bottom: 12px;
}
.goals-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--ht-text2);
  margin-bottom: 12px;
  letter-spacing: 0.4px;
}

.form-grid  { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-label { font-size: 11px; color: var(--ht-text2); font-weight: 500; }

.radio-group { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
.radio-label { display: flex; align-items: center; gap: 5px; font-size: 13px; cursor: pointer; color: var(--ht-text2); }

/* TDEE display */
.tdee-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin: 14px 0 6px;
}
.tdee-card {
  background: var(--ht-green-light);
  border-radius: 6px;
  padding: 12px 14px;
  text-align: center;
}
.tdee-num   { font-size: 22px; font-weight: 500; color: var(--ht-green); }
.tdee-label { font-size: 11px; color: var(--ht-text2); margin-top: 3px; }
.tdee-sub   { font-size: 10px; color: var(--ht-text3); margin-top: 2px; }

/* Suggestion bar */
.goal-suggest-bar {
  background: #fdf3e0;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 14px;
  font-size: 12px;
  color: var(--ht-warn);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

/* Badge */
.badge        { display: inline-block; padding: 2px 7px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-green  { background: var(--ht-green-light); color: var(--ht-green); }
.badge-yellow { background: #fdf3e0; color: #9e7a28; }
.badge-red    { background: #f5e5e2; color: var(--ht-danger); }

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #2a2a28;
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 13px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s, transform 0.25s;
  z-index: 999;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
</style>
