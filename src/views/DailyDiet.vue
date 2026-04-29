<template>
  <div class="daily-diet">
    <!-- 日期列 -->
    <div class="date-row">
      <input type="date" v-model="currentDate" class="form-input date-input" />
      <button class="btn btn-outline btn-sm" @click="setToday">今天</button>
      <button class="btn btn-outline btn-sm" @click="copyYesterday">複製昨天飲食</button>
    </div>

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
          <div class="bar-track"><div class="bar-fill bar-w" :class="{ 'bar-over': pct(dayLog.water, goals.water) >= 100 }" :style="{ width: pct(dayLog.water, goals.water) + '%' }"></div></div>
          <span class="macro-val">{{ dayLog.water }} / {{ goals.water }} ml</span>
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
            :value="dayLog.water"
            :style="{ '--pct': pct(dayLog.water, goals.water * 1.5) + '%' }"
            @input="setWater(+($event.target as HTMLInputElement).value)"
          />
          <div :class="['water-diff', dayLog.water >= goals.water ? 'over' : 'under']">
            {{ dayLog.water >= goals.water ? '已達目標 🎉' : `距目標還差 ${goals.water - dayLog.water} ml` }}
          </div>
        </div>
        <div class="water-val">{{ dayLog.water }} ml</div>
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
        <span class="meal-cal">{{ r0(getMealTotals(currentDate, meal.id).cal) }} kcal</span>
      </div>
      <div :class="['meal-body', { collapsed: collapsedMeals.has(meal.id) }]">
        <div v-for="(item, idx) in dayLog.meals[meal.id as keyof typeof dayLog.meals]" :key="item.uid" class="food-row">
          <span class="food-name">{{ item.name }}</span>
          <span class="food-amount">{{ item.servings }} × {{ item.serving || '—' }}</span>
          <span class="food-macros">P{{ r1(item.p * item.servings) }} C{{ r1(item.c * item.servings) }} F{{ r1(item.f * item.servings) }}</span>
          <span class="food-kcal">{{ r0(item.cal * item.servings) }} kcal</span>
          <button class="food-del" @click="deleteFood(meal.id, idx)" title="刪除">×</button>
        </div>
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
          <div
            v-for="f in modalFoodList" :key="f.id"
            :class="['result-item', { selected: selectedFoodId === f.id }]"
            @click="selectedFoodId = f.id"
          >
            <span class="result-name">{{ f.foodName }}<span v-if="f.isCustom" class="tag tag-custom ml-4">自訂</span></span>
            <span class="result-info">
              <template v-if="f.servingSizes[0]">
                {{ servingText(f.servingSizes[0]) }} · {{ f.servingSizes[0].kcal }} kcal
                · P{{ f.servingSizes[0].proteinGram }} C{{ f.servingSizes[0].carbGram }} F{{ f.servingSizes[0].fatGram }}
              </template>
            </span>
          </div>
          <div v-if="!modalFoodList.length" class="empty-state">無符合結果</div>
        </div>

        <!-- 選取的食物 -->
        <div v-if="selectedFood" class="selected-food-panel mb-12">
          <div class="selected-food-name">{{ selectedFood.foodName }}</div>
          <div v-if="selectedFood.servingSizes[0]" class="selected-food-info">
            {{ servingText(selectedFood.servingSizes[0]) }} · {{ selectedFood.servingSizes[0].kcal }} kcal
            · P{{ selectedFood.servingSizes[0].proteinGram }} C{{ selectedFood.servingSizes[0].carbGram }} F{{ selectedFood.servingSizes[0].fatGram }}
          </div>
          <div class="form-group">
            <label class="form-label">份數</label>
            <input type="number" v-model.number="modalServings" min="0.5" step="0.5" class="form-input" style="width:100px" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeModal">取消</button>
          <button class="btn btn-primary" :disabled="!selectedFoodId" @click="confirmAdd">加入</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div :class="['toast', { show: toastVisible }]">{{ toastMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useHealthTracker, genUid, servingText } from '@/composables/useHealthTracker'
import { useFoodLibrary } from '@/composables/useFoodLibrary'
import type { FoodDto } from '@/data/foodLibrary'

const {
  dietLogs, goals,
  getDayLog, getDayTotals, getMealTotals,
  saveData, todayStr, prevDay,
  MEAL_META, pct, r0, r1,
} = useHealthTracker()

const { allFoods, categories } = useFoodLibrary()

const currentDate = ref(todayStr())

const dayLog = computed(() => getDayLog(currentDate.value))
const totals  = computed(() => getDayTotals(currentDate.value))

const remaining = computed(() => goals.value.calories - totals.value.cal)
const remainingCalClass = computed(() => {
  if (remaining.value < 0) return 'summary-num n-danger'
  if (remaining.value < 150) return 'summary-num n-warn'
  return 'summary-num n-accent'
})

// ── Meal collapse ──────────────────────────────────────────────
const collapsedMeals = ref<Set<string>>(new Set())
function toggleMeal(id: string) {
  if (collapsedMeals.value.has(id)) collapsedMeals.value.delete(id)
  else collapsedMeals.value.add(id)
}

// ── Water ──────────────────────────────────────────────────────
function addWater(delta: number) {
  const log = getDayLog(currentDate.value)
  log.water = Math.max(0, log.water + delta)
  saveData()
}

function setWater(val: number) {
  getDayLog(currentDate.value).water = val
  saveData()
}

// ── Delete food from meal ──────────────────────────────────────
function deleteFood(mealId: string, idx: number) {
  const meal = getDayLog(currentDate.value).meals[mealId as keyof typeof dayLog.value.meals]
  meal.splice(idx, 1)
  saveData()
}

// ── Copy yesterday ─────────────────────────────────────────────
function copyYesterday() {
  const yesterday = prevDay(currentDate.value)
  const yLog = dietLogs.value[yesterday]
  if (!yLog) { showToast('昨天沒有飲食紀錄'); return }
  const today = getDayLog(currentDate.value)
  const keys = ['breakfast', 'lunch', 'dinner', 'snack'] as const
  for (const k of keys) {
    today.meals[k] = (yLog.meals[k] || []).map(it => ({ ...it, uid: genUid() }))
  }
  saveData()
  showToast('已複製昨天的飲食紀錄')
}

function setToday() {
  currentDate.value = todayStr()
}

// ── Add food modal ─────────────────────────────────────────────
const modalVisible   = ref(false)
const activeMeal     = ref('breakfast')
const modalSearch    = ref('')
const modalPage      = ref(1)
const selectedFoodId = ref<number | null>(null)
const modalServings  = ref(1)

const MODAL_PAGE_SIZE = 12

const modalFoodList = computed<FoodDto[]>(() => {
  let list = [...allFoods.value]
  if (modalSearch.value) {
    const q = modalSearch.value.toLowerCase()
    list = list.filter(f => f.foodName.toLowerCase().includes(q))
  }
  const start = (modalPage.value - 1) * MODAL_PAGE_SIZE
  return list.slice(start, start + MODAL_PAGE_SIZE)
})

const selectedFood = computed<FoodDto | null>(() =>
  allFoods.value.find(f => f.id === selectedFoodId.value) ?? null
)

watch(selectedFood, (f) => {
  if (f) modalServings.value = 1
})

function openModal(mealId: string) {
  activeMeal.value     = mealId
  modalSearch.value    = ''
  selectedFoodId.value = null
  modalServings.value  = 1
  modalVisible.value   = true
}

function closeModal() {
  modalVisible.value = false
}

function confirmAdd() {
  const food = selectedFood.value
  if (!food) return
  const s = food.servingSizes[0]
  const entry = {
    uid: genUid(), foodId: String(food.id), name: food.foodName,
    cal: s?.kcal ?? 0, p: s?.proteinGram ?? 0, c: s?.carbGram ?? 0, f: s?.fatGram ?? 0,
    serving: s ? servingText(s) : '—', servings: modalServings.value,
  }
  const meal = getDayLog(currentDate.value).meals[activeMeal.value as keyof typeof dayLog.value.meals]
  meal.push(entry)
  saveData()
  closeModal()
  showToast('已新增 ' + food.foodName)
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
.btn-sm  { padding: 4px 10px; font-size: 12px; }

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

.tag         { display: inline-block; padding: 1px 6px; border-radius: 20px; font-size: 10px; font-weight: 600; margin-left: 3px; }
.tag-custom  { background: var(--ht-green-light); color: var(--ht-green); }
.empty-state { text-align: center; padding: 24px; color: var(--ht-text3); font-size: 13px; }
.divider     { height: 1px; background: var(--ht-border); margin: 14px 0; }
.mb-12       { margin-bottom: 12px; }

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
