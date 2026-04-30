<template>
  <div class="daily-diet">
    <!-- 日期列 -->
    <div class="date-row">
      <input type="date" v-model="selectedDate" class="form-input date-input" />
      <button class="btn btn-outline btn-sm" @click="setToday">今天</button>
      <button class="btn btn-outline btn-sm" :disabled="isSaving" @click="copyYesterday">複製昨天飲食</button>
    </div>

    <!-- Error -->
    <div v-if="errorMessage" class="card error-banner">
      {{ errorMessage }}
      <button class="btn btn-outline btn-sm" @click="retryLoad">重試</button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && !records.length" class="card loading-banner">載入中…</div>

    <!-- 摘要 Grid -->
    <div class="summary-grid">
      <div class="summary-item">
        <div :class="['summary-num', remainingCalClass]">{{ r0(remaining) }}</div>
        <div class="summary-label">剩餘熱量</div>
        <div class="summary-sub">kcal</div>
      </div>
      <div class="summary-item">
        <div class="summary-num">{{ r0(totals.cal) }}</div>
        <div class="summary-label">今日攝取</div>
        <div class="summary-sub">kcal</div>
      </div>
      <div class="summary-item">
        <div class="summary-num">{{ r1(totals.p) }}</div>
        <div class="summary-label">蛋白質</div>
        <div class="summary-sub">g</div>
      </div>
      <div class="summary-item">
        <div class="summary-num">{{ r1(totals.c) }}</div>
        <div class="summary-label">碳水化合物</div>
        <div class="summary-sub">g</div>
      </div>
      <div class="summary-item">
        <div class="summary-num">{{ r1(totals.f) }}</div>
        <div class="summary-label">脂肪</div>
        <div class="summary-sub">g</div>
      </div>
    </div>

    <!-- 巨量素進度條 -->
    <div class="card macro-card">
      <div class="card-title">今日進度</div>
      <div class="macro-bars">
        <div class="macro-row">
          <span class="macro-lbl">熱量</span>
          <div class="bar-track"><div class="bar-fill bar-cal" :class="{ 'bar-over': pct(totals.cal, goals.calories) >= 100 }" :style="{ width: pct(totals.cal, goals.calories) + '%' }"></div></div>
          <span class="macro-val">{{ r0(totals.cal) }} / {{ goals.calories }} kcal</span>
        </div>
        <div class="macro-row">
          <span class="macro-lbl">蛋白質</span>
          <div class="bar-track"><div class="bar-fill bar-p" :class="{ 'bar-over': pct(totals.p, goals.protein) >= 100 }" :style="{ width: pct(totals.p, goals.protein) + '%' }"></div></div>
          <span class="macro-val">{{ r0(totals.p) }} / {{ goals.protein }} g</span>
        </div>
        <div class="macro-row">
          <span class="macro-lbl">碳水</span>
          <div class="bar-track"><div class="bar-fill bar-c" :class="{ 'bar-over': pct(totals.c, goals.carbs) >= 100 }" :style="{ width: pct(totals.c, goals.carbs) + '%' }"></div></div>
          <span class="macro-val">{{ r0(totals.c) }} / {{ goals.carbs }} g</span>
        </div>
        <div class="macro-row">
          <span class="macro-lbl">脂肪</span>
          <div class="bar-track"><div class="bar-fill bar-f" :class="{ 'bar-over': pct(totals.f, goals.fat) >= 100 }" :style="{ width: pct(totals.f, goals.fat) + '%' }"></div></div>
          <span class="macro-val">{{ r0(totals.f) }} / {{ goals.fat }} g</span>
        </div>
        <div class="macro-row">
          <span class="macro-lbl">飲水</span>
          <div class="bar-track"><div class="bar-fill bar-w" :class="{ 'bar-over': pct(waterAmount, goals.water) >= 100 }" :style="{ width: pct(waterAmount, goals.water) + '%' }"></div></div>
          <span class="macro-val">{{ waterAmount }} / {{ goals.water }} ml</span>
        </div>
      </div>
    </div>

    <!-- 飲水 -->
    <div class="card water-card">
      <div class="card-title">飲水追蹤</div>
      <div class="water-row">
        <div class="water-slider-wrap">
          <input
            type="range" min="0" :max="goals.water * 1.5" step="50"
            :value="waterAmount"
            :style="{ '--pct': pct(waterAmount, goals.water * 1.5) + '%' }"
            @input="setWater(+($event.target as HTMLInputElement).value)"
          />
          <div :class="['water-diff', waterAmount >= goals.water ? 'over' : 'under']">
            {{ waterAmount >= goals.water ? '已達目標 🎉' : `距目標還差 ${goals.water - waterAmount} ml` }}
          </div>
        </div>
        <div class="water-val">{{ waterAmount }} ml</div>
        <div class="water-btns">
          <button class="water-btn" @click="addWater(-250)">−250</button>
          <button class="water-btn" @click="addWater(250)">+250</button>
          <button class="water-btn" @click="addWater(500)">+500</button>
          <button class="water-btn" @click="addWater(750)">+750</button>
        </div>
      </div>
    </div>

    <!-- 餐點 -->
    <div v-for="meal in MEAL_META" :key="meal.id" class="meal-section">
      <div class="meal-header" @click="toggleMeal(meal.id)">
        <div class="meal-left">
          <span class="meal-icon">{{ meal.icon }}</span>
          <span class="meal-name">{{ meal.label }}</span>
        </div>
        <span class="meal-cal">{{ r0(getMealCalories(meal.id)) }} kcal</span>
      </div>
      <div :class="['meal-body', { collapsed: collapsedMeals.has(meal.id) }]">
        <div v-for="record in getMealRecords(meal.id)" :key="record.id" class="food-row">
          <span class="food-name">{{ record.foodName }}</span>
          <span class="food-amount">{{ formatAmount(record.amount) }} {{ record.measure }}</span>
          <span class="food-macros">P{{ r1(record.protein) }} C{{ r1(record.carbs) }} F{{ r1(record.fat) }}</span>
          <span class="food-kcal">{{ r0(record.calories) }} kcal</span>
          <button class="food-del" :disabled="isSaving" @click="handleDeleteFood(record.id)" title="刪除">×</button>
        </div>
        <div v-if="!getMealRecords(meal.id).length && !isLoading" class="empty-state">尚無紀錄</div>
        <button class="add-food-btn" @click="openModal(meal.id)">＋ 新增食物</button>
      </div>
    </div>

    <!-- ── 新增食物 Modal ── -->
    <div v-if="modalVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-title">新增食物到{{ MEAL_META.find(m => m.id === activeMeal)?.label }}</div>

        <!-- 搜尋 -->
        <input
          type="text" v-model="modalSearch" placeholder="搜尋食物名稱…"
          class="form-input mb-12" style="width:100%"
          @input="modalPage = 1"
        />

        <!-- 食物結果 -->
        <div class="food-results-box">
          <div v-if="foodLibLoading && !allFoods.length" class="empty-state">載入食物庫中…</div>
          <template v-else>
            <div
              v-for="f in modalFoodList" :key="f.id"
              :class="['result-item', { selected: selectedFoodId === f.id }]"
              @click="selectedFoodId = f.id"
            >
              <span class="result-name">
                {{ f.foodName }}
                <span v-if="isFavoriteFood(f.id)" class="tag tag-fav ml-4">常用</span>
                <span v-if="f.isCustom" class="tag tag-custom ml-4">自訂</span>
              </span>
              <span class="result-info">
                <template v-if="f.servingSizes[0]">
                  {{ servingText(f.servingSizes[0]) }} · {{ f.servingSizes[0].kcal }} kcal
                </template>
              </span>
            </div>
            <div v-if="!modalFoodList.length" class="empty-state">無符合結果</div>
          </template>
        </div>

        <!-- 分頁控制 -->
        <div v-if="modalTotalPages > 1" class="modal-pagination">
          <button class="btn btn-outline btn-sm" :disabled="modalPage <= 1" @click="modalPage--">‹</button>
          <span class="page-info">{{ modalPage }} / {{ modalTotalPages }}</span>
          <button class="btn btn-outline btn-sm" :disabled="modalPage >= modalTotalPages" @click="modalPage++">›</button>
        </div>

        <!-- 選取的食物 -->
        <div v-if="selectedFood" class="selected-food-panel mb-12">
          <div class="selected-food-name">{{ selectedFood.foodName }}</div>

          <!-- 份量單位選擇 -->
          <div v-if="selectedFood.servingSizes.length > 1" class="form-group mb-8">
            <label class="form-label">單位</label>
            <select v-model.number="selectedServingIdx" class="form-input">
              <option
                v-for="(sz, idx) in selectedFood.servingSizes"
                :key="sz.id"
                :value="idx"
              >
                {{ servingText(sz) }} — {{ sz.kcal }} kcal
              </option>
            </select>
          </div>

          <div v-if="selectedServingSize" class="selected-food-info">
            {{ servingText(selectedServingSize) }} = {{ selectedServingSize.kcal }} kcal
            · P{{ selectedServingSize.proteinGram }}g C{{ selectedServingSize.carbGram }}g F{{ selectedServingSize.fatGram }}g
          </div>

          <div class="form-group">
            <label class="form-label">數量（{{ selectedServingSize?.measure ?? '' }}）</label>
            <input
              type="number"
              v-model.number="modalServings"
              :min="modalAmountStep"
              :step="modalAmountStep"
              class="form-input"
              style="width:100px"
            />
          </div>

          <div v-if="selectedServingSize" class="serving-preview">
            合計：{{ r0(selectedServingSize.kcal * modalAmountRatio) }} kcal
            · P{{ r1(selectedServingSize.proteinGram * modalAmountRatio) }}g
            C{{ r1(selectedServingSize.carbGram * modalAmountRatio) }}g
            F{{ r1(selectedServingSize.fatGram * modalAmountRatio) }}g
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeModal">取消</button>
          <button class="btn btn-primary" :disabled="!selectedFoodId || !selectedServingSize || isSaving" @click="confirmAdd">加入</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div :class="['toast', { show: toastVisible }]">{{ toastMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useHealthTracker, servingText, MEAL_META, todayStr, prevDay, r0, r1, pct } from '@/composables/useHealthTracker'
import { useFoodLibrary } from '@/composables/useFoodLibrary'
import type { FoodDto } from '@/data/foodLibrary'
import {
  getDailyDiet, createFoodRecord, deleteFoodRecord, copyDailyDiet, updateWaterLog,
  type FoodRecordDto, type DailyNutritionSummaryDto,
} from '@/data/dailyDiet'

// ── Water ─────────────────────────────────────────────────────
const { goals: htGoals } = useHealthTracker()

const memberId = Number(localStorage.getItem('memberId') ?? '0')
const { allFoods, favoriteFoodIds, loadFoods, isLoading: foodLibLoading } = useFoodLibrary()

// ── Core state ─────────────────────────────────────────────────
const selectedDate   = ref<string>(todayStr())
const records        = ref<FoodRecordDto[]>([])
const summary        = ref<DailyNutritionSummaryDto | null>(null)
const isLoading      = ref(false)
const isSaving       = ref(false)
const errorMessage   = ref<string | null>(null)

// ── Derived from summary ───────────────────────────────────────
const totals = computed(() => ({
  cal: summary.value?.consumedCalories ?? 0,
  p:   summary.value?.consumedProtein  ?? 0,
  c:   summary.value?.consumedCarbs    ?? 0,
  f:   summary.value?.consumedFat      ?? 0,
}))

const goals = computed(() => ({
  calories: summary.value?.targetCalories ?? 0,
  protein:  summary.value?.targetProtein  ?? 0,
  carbs:    summary.value?.targetCarbs    ?? 0,
  fat:      summary.value?.targetFat      ?? 0,
  water:    summary.value?.targetWater    ?? htGoals.value.water,
}))

const remaining = computed(() => summary.value?.remainingCalories ?? 0)
const remainingCalClass = computed(() => {
  if (remaining.value < 0)   return 'summary-num n-danger'
  if (remaining.value < 150) return 'summary-num n-warn'
  return 'summary-num n-accent'
})

// ── Meal helpers ───────────────────────────────────────────────
function normalizeMealType(mealType: string): string {
  const normalized = mealType.toLowerCase()
  if (normalized === '早餐') return 'breakfast'
  if (normalized === '午餐') return 'lunch'
  if (normalized === '晚餐') return 'dinner'
  if (normalized === '點心' || normalized === '點心/宵夜') return 'snack'
  return normalized
}

function getMealRecords(mealId: string): FoodRecordDto[] {
  return records.value.filter(r => normalizeMealType(r.mealType) === mealId.toLowerCase())
}

function getMealCalories(mealId: string): number {
  return getMealRecords(mealId).reduce((sum, r) => sum + r.calories, 0)
}

function formatAmount(value: number): string {
  return Number.isInteger(value) ? String(value) : String(r1(value))
}

// ── Water ─────────────────────────────────────────────────────
const waterAmount = ref(0)
let waterRequestSeq = 0

function addWater(delta: number) {
  setWater(waterAmount.value + delta)
}

async function setWater(val: number) {
  const nextAmount = Math.max(0, Math.round(val))
  const logDate = selectedDate.value
  const requestSeq = ++waterRequestSeq
  waterAmount.value = nextAmount

  try {
    const savedAmount = await updateWaterLog({ logDate, amount: nextAmount })
    if (requestSeq === waterRequestSeq && logDate === selectedDate.value) {
      waterAmount.value = savedAmount
    }
  } catch (e: any) {
    showToast(e.message || '更新飲水紀錄失敗')
  }
}

// ── API load ───────────────────────────────────────────────────
async function loadDailyDiet(date: string) {
  isLoading.value    = true
  errorMessage.value = null
  try {
    const page     = await getDailyDiet(date)
    records.value  = page.records
    summary.value  = page.summary
    waterAmount.value = page.waterAmount ?? 0
  } catch (e: any) {
    errorMessage.value = e.message || '載入失敗'
  } finally {
    isLoading.value = false
  }
}

function retryLoad() {
  loadDailyDiet(selectedDate.value)
}

onMounted(() => {
  loadFoods(memberId)
  loadDailyDiet(selectedDate.value)
})
watch(selectedDate, (date) => loadDailyDiet(date))

// ── Meal collapse ──────────────────────────────────────────────
const collapsedMeals = ref<Set<string>>(new Set())
function toggleMeal(id: string) {
  if (collapsedMeals.value.has(id)) collapsedMeals.value.delete(id)
  else collapsedMeals.value.add(id)
}

// ── Delete food ────────────────────────────────────────────────
async function handleDeleteFood(id: number) {
  isSaving.value = true
  try {
    await deleteFoodRecord(id)
    await loadDailyDiet(selectedDate.value)
  } catch (e: any) {
    showToast(e.message || '刪除失敗')
  } finally {
    isSaving.value = false
  }
}

// ── Copy yesterday ─────────────────────────────────────────────
async function copyYesterday() {
  const sourceDate = prevDay(selectedDate.value)
  isSaving.value = true
  try {
    const result = await copyDailyDiet({
      sourceDate,
      targetDate: selectedDate.value,
      overwriteTargetDate: false,
    })
    records.value = result.records
    summary.value = result.summary
    waterAmount.value = result.waterAmount ?? 0
    showToast('已複製昨天的飲食紀錄')
  } catch (e: any) {
    if (e.status === 409) {
      const confirmed = window.confirm('今天已有飲食紀錄，確定要覆蓋嗎？')
      if (!confirmed) { isSaving.value = false; return }
      try {
        const result = await copyDailyDiet({
          sourceDate,
          targetDate: selectedDate.value,
          overwriteTargetDate: true,
        })
        records.value = result.records
        summary.value = result.summary
        waterAmount.value = result.waterAmount ?? 0
        showToast('已複製昨天的飲食紀錄（已覆蓋）')
      } catch {
        showToast('複製失敗')
      }
    } else {
      showToast(e.message || '複製失敗')
    }
  } finally {
    isSaving.value = false
  }
}

function setToday() {
  selectedDate.value = todayStr()
}

// ── Add food modal ─────────────────────────────────────────────
const modalVisible        = ref(false)
const activeMeal          = ref('breakfast')
const modalSearch         = ref('')
const modalPage           = ref(1)
const selectedFoodId      = ref<number | null>(null)
const modalServings       = ref(1)
const selectedServingIdx  = ref(0)

const MODAL_PAGE_SIZE = 12

function isFavoriteFood(foodId: number): boolean {
  return favoriteFoodIds.value.includes(foodId)
}

function compareFoodForModal(a: FoodDto, b: FoodDto): number {
  const aRank = isFavoriteFood(a.id) ? 0 : a.isCustom ? 1 : 2
  const bRank = isFavoriteFood(b.id) ? 0 : b.isCustom ? 1 : 2
  if (aRank !== bRank) return aRank - bRank
  return (a.categoryName ?? '').localeCompare(b.categoryName ?? '') || a.foodName.localeCompare(b.foodName)
}

const modalFilteredFoods = computed<FoodDto[]>(() => {
  let list = [...allFoods.value]
  if (modalSearch.value) {
    const q = modalSearch.value.toLowerCase()
    list = list.filter(f => f.foodName.toLowerCase().includes(q))
  }
  return list.sort(compareFoodForModal)
})

const modalFilteredCount = computed<number>(() => modalFilteredFoods.value.length)

const modalTotalPages = computed(() => Math.max(1, Math.ceil(modalFilteredCount.value / MODAL_PAGE_SIZE)))

const modalFoodList = computed<FoodDto[]>(() => {
  const start = (modalPage.value - 1) * MODAL_PAGE_SIZE
  return modalFilteredFoods.value.slice(start, start + MODAL_PAGE_SIZE)
})

const selectedFood = computed<FoodDto | null>(() =>
  allFoods.value.find(f => f.id === selectedFoodId.value) ?? null
)

const selectedServingSize = computed(() =>
  selectedFood.value?.servingSizes[selectedServingIdx.value] ?? selectedFood.value?.servingSizes[0] ?? null
)

const modalAmountStep = computed(() => {
  const measure = selectedServingSize.value?.measure.toLowerCase()
  return measure === '克' || measure === 'g' || measure === 'ml' ? 1 : 0.5
})

const modalAmountRatio = computed(() => {
  const baseAmount = selectedServingSize.value?.baseAmount ?? 1
  if (baseAmount <= 0) return 0
  return (Number(modalServings.value) || 0) / baseAmount
})

watch(selectedFood, () => {
  selectedServingIdx.value = 0
})

watch(selectedServingSize, (serving) => {
  if (serving) modalServings.value = serving.baseAmount
})

function openModal(mealId: string) {
  activeMeal.value        = mealId
  modalSearch.value       = ''
  modalPage.value         = 1
  selectedFoodId.value    = null
  modalServings.value     = 1
  selectedServingIdx.value = 0
  modalVisible.value      = true
}

function closeModal() {
  modalVisible.value = false
}

async function confirmAdd() {
  const food = selectedFood.value
  const s = selectedServingSize.value
  if (!food || !s) return
  isSaving.value = true
  try {
    await createFoodRecord({
      foodId:   food.id,
      amount:   modalServings.value,
      measure:  s.measure,
      mealType: activeMeal.value,
      eatDT:    selectedDate.value,
    })
    await loadDailyDiet(selectedDate.value)
    closeModal()
    showToast('已新增 ' + food.foodName)
  } catch (e: any) {
    showToast(e.message || '新增失敗')
  } finally {
    isSaving.value = false
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
/* ── 共用表單 / 按鈕 ── */
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
.btn-primary  { background: var(--ht-green); color: #fff; border-color: var(--ht-green); }
.btn-primary:hover  { opacity: 0.88; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-outline  { background: none; border-color: var(--ht-border); color: var(--ht-text2); }
.btn-outline:hover  { background: var(--ht-surface2); }
.btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-sm  { padding: 4px 10px; font-size: 12px; }

/* ── Error / Loading banners ── */
.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff0f0;
  border-color: #f0b0b0;
  color: var(--ht-danger);
  margin-bottom: 12px;
  font-size: 13px;
}
.loading-banner {
  text-align: center;
  color: var(--ht-text2);
  font-size: 13px;
  margin-bottom: 12px;
}

/* ── Layout ── */
.date-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.date-input { font-size: 13px; }

/* ── Summary Grid ── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}
@media (max-width: 640px) { .summary-grid { grid-template-columns: repeat(3, 1fr); } }

.summary-item {
  background: var(--ht-surface);
  border: 1px solid var(--ht-border);
  border-radius: var(--ht-radius);
  padding: 13px 8px;
  text-align: center;
}
.summary-num {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 3px;
  line-height: 1;
}
.n-accent { color: var(--ht-green); }
.n-warn   { color: var(--ht-warn); }
.n-danger { color: var(--ht-danger); }
.summary-label { font-size: 11px; color: var(--ht-text2); }
.summary-sub   { font-size: 10px; color: var(--ht-text3); margin-top: 1px; }

/* ── Card ── */
.card {
  background: var(--ht-surface);
  border: 1px solid var(--ht-border);
  border-radius: var(--ht-radius);
  padding: 18px;
  margin-bottom: 12px;
}
.card-title {
  font-size: 10px;
  font-weight: 600;
  color: var(--ht-text3);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 14px;
}

/* ── Macro Bars ── */
.macro-bars { display: flex; flex-direction: column; gap: 10px; }
.macro-row  { display: flex; align-items: center; gap: 10px; }
.macro-lbl  { width: 54px; font-size: 12px; color: var(--ht-text2); flex-shrink: 0; }
.bar-track  { flex: 1; height: 6px; background: var(--ht-surface2); border-radius: 3px; overflow: hidden; }
.bar-fill   { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.bar-cal    { background: #7a9a7a; }
.bar-p      { background: #7a9aaa; }
.bar-c      { background: #a49a6a; }
.bar-f      { background: #aa7a7a; }
.bar-w      { background: #7aaec8; }
.bar-over   { background: var(--ht-danger) !important; }
.macro-val  { font-size: 11px; color: var(--ht-text2); min-width: 90px; text-align: right; flex-shrink: 0; }

/* ── Water ── */
.water-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.water-slider-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  border: none;
  padding: 0;
  background: linear-gradient(to right, #7aaec8 0%, #7aaec8 var(--pct, 0%), var(--ht-surface2) var(--pct, 0%), var(--ht-surface2) 100%);
  cursor: pointer;
  outline: none;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4a8aaa;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  cursor: pointer;
}
.water-val  { font-size: 12px; color: var(--ht-text2); min-width: 70px; }
.water-btns { display: flex; gap: 6px; }
.water-btn  {
  padding: 5px 10px;
  border: 1px solid var(--ht-border);
  background: var(--ht-surface);
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  color: var(--ht-text2);
  font-family: inherit;
  transition: background 0.15s;
}
.water-btn:hover { background: var(--ht-surface2); }
.water-diff { font-size: 11px; color: var(--ht-text3); }
.water-diff.over  { color: var(--ht-green); }
.water-diff.under { color: var(--ht-info); }

/* ── Meals ── */
.meal-section {
  margin-bottom: 10px;
  border-radius: var(--ht-radius);
  overflow: hidden;
  border: 1px solid var(--ht-border);
}
.meal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  background: var(--ht-surface);
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}
.meal-header:hover { background: var(--ht-surface2); }
.meal-left  { display: flex; align-items: center; gap: 8px; }
.meal-icon  { font-size: 15px; }
.meal-name  { font-weight: 500; font-size: 13px; }
.meal-cal   { font-size: 12px; color: var(--ht-text2); }
.meal-body  { background: var(--ht-surface); }
.meal-body.collapsed { display: none; }

.food-row {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  border-top: 1px solid var(--ht-border);
  gap: 8px;
}
.food-name   { flex: 1; font-size: 13px; }
.food-amount { font-size: 11px; color: var(--ht-text3); white-space: nowrap; }
.food-macros { font-size: 10px; color: var(--ht-text3); white-space: nowrap; }
.food-kcal   { font-size: 12px; color: var(--ht-text); min-width: 62px; text-align: right; white-space: nowrap; }
.food-del {
  width: 22px;
  height: 22px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--ht-text3);
  font-size: 18px;
  line-height: 1;
  border-radius: 3px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.food-del:hover { background: #f5e5e2; color: var(--ht-danger); }
.food-del:disabled { opacity: 0.4; cursor: not-allowed; }

.add-food-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  color: var(--ht-green);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  border: none;
  background: none;
  width: 100%;
  border-top: 1px dashed var(--ht-border);
  transition: background 0.15s;
}
.add-food-btn:hover { background: var(--ht-green-light); }

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
}
.modal {
  background: var(--ht-surface);
  border-radius: 10px;
  padding: 22px;
  width: 520px;
  max-width: 96vw;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.14);
}
.modal-title   { font-size: 15px; font-weight: 600; margin-bottom: 16px; }
.modal-footer  { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--ht-border); }

.food-results-box {
  border: 1px solid var(--ht-border);
  border-radius: 6px;
  max-height: 220px;
  overflow-y: auto;
  margin-bottom: 12px;
}
.result-item {
  padding: 9px 13px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--ht-border);
  transition: background 0.12s;
}
.result-item:last-child { border-bottom: none; }
.result-item:hover      { background: var(--ht-surface2); }
.result-item.selected   { background: var(--ht-green-light); }
.result-name  { font-size: 13px; }
.result-info  { font-size: 10px; color: var(--ht-text2); }

.selected-food-panel {
  background: var(--ht-green-light);
  border-radius: 6px;
  padding: 12px 14px;
  margin-bottom: 12px;
}
.selected-food-name { font-weight: 500; margin-bottom: 3px; font-size: 13px; }
.selected-food-info { font-size: 11px; color: var(--ht-text2); margin-bottom: 10px; }

.form-grid  { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-label { font-size: 11px; color: var(--ht-text2); font-weight: 500; }
.mb-8 { margin-bottom: 8px; }

.modal-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;
}
.page-info { font-size: 12px; color: var(--ht-text2); }

.serving-preview {
  margin-top: 8px;
  font-size: 12px;
  color: var(--ht-green);
  font-weight: 500;
}

.tag         { display: inline-block; padding: 1px 6px; border-radius: 20px; font-size: 10px; font-weight: 600; margin-left: 3px; }
.tag-fav     { background: #fdf3e0; color: #9e7a28; }
.tag-custom  { background: var(--ht-green-light); color: var(--ht-green); }
.empty-state { text-align: center; padding: 24px; color: var(--ht-text3); font-size: 13px; }
.divider     { height: 1px; background: var(--ht-border); margin: 14px 0; }
.mb-12       { margin-bottom: 12px; }
.ml-4        { margin-left: 4px; }

/* ── Toast ── */
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
