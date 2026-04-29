<template>
  <div class="goals">
    <!-- 基本資料未填提示 -->
    <div v-if="!hasInfo" class="info-notice">
      尚未設定基本資料，請填寫下方表單並儲存，才能啟用飲食紀錄功能。
    </div>

    <!-- 基本資料 -->
    <div class="card">
      <div class="goals-section-title">基本資料</div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">身高 (cm) <span class="required">*</span></label>
          <input type="number" v-model.number="localInfo.height" min="100" max="250" step="0.1" class="form-input" @blur="liveRefreshTDEE" />
        </div>
        <div class="form-group">
          <label class="form-label">目前體重 (kg)</label>
          <input type="number" v-model.number="localInfo.currentWeight" step="0.1" class="form-input" placeholder="自動抓取體重紀錄" @blur="liveRefreshTDEE" />
        </div>
        <div class="form-group">
          <label class="form-label">目標體重 (kg)</label>
          <input type="number" v-model.number="localInfo.targetWeight" step="0.1" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">生日 <span class="required">*</span></label>
          <input type="date" v-model="localInfo.birthDate" class="form-input" @change="liveRefreshTDEE" />
        </div>
        <div class="form-group">
          <label class="form-label">性別 <span class="required">*</span></label>
          <div class="radio-group">
            <label class="radio-label"><input type="radio" v-model="localInfo.gender" value="F" @change="liveRefreshTDEE" /> 女</label>
            <label class="radio-label"><input type="radio" v-model="localInfo.gender" value="M" @change="liveRefreshTDEE" /> 男</label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">活動量 <span class="required">*</span></label>
          <select v-model="localInfo.activityLevel" class="form-input" @change="liveRefreshTDEE">
            <option value="1.2">久坐（幾乎不運動）</option>
            <option value="1.375">輕度活動（每週 1-3 天）</option>
            <option value="1.55">中度活動（每週 3-5 天）</option>
            <option value="1.725">高度活動（每週 6-7 天）</option>
            <option value="1.9">非常高強度（每天 2 次）</option>
          </select>
        </div>
        <div class="form-group" style="grid-column: span 2">
          <label class="form-label">健康目標 <span class="required">*</span></label>
          <select v-model="localInfo.healthGoal" class="form-input" @change="liveRefreshTDEE">
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
        建議目標 (<strong>{{ localInfo.healthGoal }}</strong>)：
        熱量 <strong>{{ macroSuggestion.calories }}</strong> kcal ·
        蛋白質 <strong>{{ macroSuggestion.protein }}</strong>g ·
        碳水 <strong>{{ macroSuggestion.carbs }}</strong>g ·
        脂肪 <strong>{{ macroSuggestion.fat }}</strong>g
        <button class="btn btn-sm ml-8" style="background:var(--ht-warn);color:#fff;border:none" @click="applySuggestion">套用建議</button>
      </div>

      <button class="btn btn-primary" :disabled="saving" @click="onSaveBasicInfo">
        {{ saving ? '儲存中…' : '儲存基本資料' }}
      </button>
    </div>

    <!-- 每日營養目標 -->
    <div class="card">
      <div class="goals-section-title">每日營養目標</div>
      <div v-if="!hasInfo" class="goals-locked">請先儲存基本資料以啟用營養目標設定。</div>
      <template v-else>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">每日熱量目標 (kcal)</label>
            <input type="number" v-model.number="localGoals.totalCalories" min="0" class="form-input" />
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
          <button class="btn btn-primary" :disabled="saving" @click="onSaveTargetCalories">
            {{ saving ? '儲存中…' : '儲存營養目標' }}
          </button>
          <button v-if="macroSuggestion" class="btn btn-outline" @click="applySuggestion">套用 TDEE 建議</button>
        </div>
      </template>
    </div>

    <!-- Toast -->
    <div :class="['toast', { show: toastVisible }]">{{ toastMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  calcBMI, bmiLabel,
  calculateBMR, calculateTDEE, calculateMacrosFromGoal,
  type MacroSuggestion,
  HEALTH_GOALS,
} from '@/composables/useGoals'
import {
  loadGoalPage, saveBasicInfo, saveTargetCalories,
  type BasicInfoDto, type TargetCaloriesDto,
} from '@/data/goals'

// ── Local state ────────────────────────────────────────────────
interface LocalInfo extends BasicInfoDto {
  currentWeight: number | null
}

const localInfo = reactive<LocalInfo>({
  height: 0,
  currentWeight: null,
  targetWeight: 0,
  birthDate: '',
  gender: 'F',
  activityLevel: '1.55',
  healthGoal: '健康飲食',
})

const localGoals = reactive<TargetCaloriesDto>({
  totalCalories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  water: 2000,
})

const hasInfo = ref(false)
const saving  = ref(false)

// ── Load page ──────────────────────────────────────────────────
onMounted(async () => {
  try {
    const data = await loadGoalPage()
    applyPageResponse(data)
  } catch {
    // API 尚未就緒時靜默失敗，讓使用者填寫表單
  }
  liveRefreshTDEE()
})

function applyPageResponse(data: { info: BasicInfoDto | null; goals: TargetCaloriesDto | null }) {
  if (data.info) {
    localInfo.height        = data.info.height
    localInfo.targetWeight  = data.info.targetWeight
    localInfo.birthDate     = data.info.dateOfBirth
    localInfo.gender        = data.info.gender
    localInfo.activityLevel = data.info.activityLevel
    localInfo.healthGoal    = data.info.healthGoal
    hasInfo.value = true
  }
  if (data.goals) {
    localGoals.totalCalories = data.goals.totalCalories
    localGoals.protein       = data.goals.protein
    localGoals.carbs         = data.goals.carbs
    localGoals.fat           = data.goals.fat
    localGoals.water         = data.goals.water
  }
}

// ── TDEE preview ───────────────────────────────────────────────
const tdeeResult     = reactive({ bmr: null as number | null, tdee: null as number | null })
const macroSuggestion = ref<MacroSuggestion | null>(null)

function ageFromBirthDate(bd: string): number {
  if (!bd) return 0
  const today = new Date()
  const birth = new Date(bd)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function liveRefreshTDEE() {
  const w   = localInfo.currentWeight ?? localInfo.targetWeight
  const bmr = calculateBMR(w, localInfo.height, ageFromBirthDate(localInfo.birthDate), localInfo.gender)
  tdeeResult.bmr  = bmr
  tdeeResult.tdee = bmr ? calculateTDEE(bmr, localInfo.activityLevel) : null
  if (tdeeResult.tdee && w) {
    macroSuggestion.value = calculateMacrosFromGoal(tdeeResult.tdee, w, localInfo.healthGoal)
  } else {
    macroSuggestion.value = null
  }
}

const bmiDisplay = computed(() => {
  const w   = localInfo.currentWeight ?? localInfo.targetWeight
  const bmi = calcBMI(w, localInfo.height)
  if (!bmi) return { value: null, text: '', cls: '' }
  return { value: bmi, ...bmiLabel(bmi) }
})

function applySuggestion() {
  if (!macroSuggestion.value) return
  localGoals.totalCalories = macroSuggestion.value.calories
  localGoals.protein       = macroSuggestion.value.protein
  localGoals.carbs         = macroSuggestion.value.carbs
  localGoals.fat           = macroSuggestion.value.fat
  showToast('已套用 TDEE 建議')
}

// ── Validation ─────────────────────────────────────────────────
function validateBasicInfo(): string | null {
  if (!localInfo.height)       return '請填寫身高'
  if (!localInfo.birthDate)    return '請填寫生日'
  if (!localInfo.gender)       return '請選擇性別'
  if (!localInfo.activityLevel) return '請選擇活動量'
  if (!localInfo.healthGoal)   return '請選擇健康目標'
  return null
}

// ── Save ───────────────────────────────────────────────────────
async function onSaveBasicInfo() {
  const err = validateBasicInfo()
  if (err) { showToast(err); return }

  saving.value = true
  try {
    const dto: BasicInfoDto = {
      height:        localInfo.height,
      targetWeight:  localInfo.targetWeight,
      dateOfBirth:   localInfo.birthDate,
      gender:        localInfo.gender,
      activityLevel: localInfo.activityLevel,
      healthGoal:    localInfo.healthGoal,
    }
    const data = await saveBasicInfo(dto)
    applyPageResponse(data)
    liveRefreshTDEE()
    showToast('基本資料已儲存')
  } catch (e: unknown) {
    showToast(e instanceof Error ? e.message : '儲存失敗')
  } finally {
    saving.value = false
  }
}

async function onSaveTargetCalories() {
  saving.value = true
  try {
    await saveTargetCalories({ ...localGoals })
    showToast('營養目標已儲存')
  } catch (e: unknown) {
    showToast(e instanceof Error ? e.message : '儲存失敗')
  } finally {
    saving.value = false
  }
}

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
.info-notice {
  background: #fdf3e0;
  border: 1px solid #f0d58c;
  border-radius: var(--ht-radius);
  padding: 10px 14px;
  font-size: 13px;
  color: #9e7a28;
  margin-bottom: 12px;
}

.goals-locked {
  font-size: 13px;
  color: var(--ht-text3);
  padding: 8px 0 16px;
}

.required {
  color: var(--ht-danger);
  margin-left: 2px;
}

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
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--ht-green); color: #fff; border-color: var(--ht-green); }
.btn-primary:not(:disabled):hover { opacity: 0.88; }
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
