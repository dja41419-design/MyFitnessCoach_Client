<template>
  <div class="food-library">
    <!-- 篩選列 -->
    <div class="card">
      <div class="filter-bar">
        <input
          type="text" v-model="fs.search" placeholder="搜尋食物名稱…"
          class="form-input search-input" @input="fs.page = 1"
        />
        <select v-model="fs.category" class="form-input filter-select" @change="fs.page = 1">
          <option value="">全部種類</option>
          <option v-for="cat in FOOD_CATEGORIES" :key="cat">{{ cat }}</option>
        </select>
        <label class="filter-check-label">
          <input type="checkbox" v-model="fs.favOnly" @change="fs.page = 1" />
          只看常用
        </label>
        <button class="btn btn-outline btn-sm" @click="clearFilters">清除篩選</button>
        <button class="btn btn-outline btn-sm" @click="showAdvanced = !showAdvanced">
          {{ showAdvanced ? '▲ 收起' : '▼ 進階篩選' }}
        </button>
        <button class="btn btn-primary btn-sm" @click="showAddForm = !showAddForm">
          {{ showAddForm ? '▲ 收起' : '＋ 新增自訂食物' }}
        </button>
      </div>

      <!-- 進階篩選 -->
      <div v-if="showAdvanced" class="filter-adv">
        <div class="filter-group">
          <div class="filter-group-label">熱量 (kcal)</div>
          <div class="filter-inline">
            <select v-model="fs.calOp" class="form-input filter-op">
              <option>≥</option><option>≤</option><option>=</option><option>></option><option><</option>
            </select>
            <input type="number" v-model.number="fs.calVal" min="0" class="form-input filter-num" placeholder="值" />
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-group-label">蛋白質 (g)</div>
          <div class="filter-inline">
            <select v-model="fs.proteinOp" class="form-input filter-op">
              <option>≥</option><option>≤</option><option>=</option><option>></option><option><</option>
            </select>
            <input type="number" v-model.number="fs.proteinVal" min="0" class="form-input filter-num" placeholder="值" />
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-group-label">脂肪 (g)</div>
          <div class="filter-inline">
            <select v-model="fs.fatOp" class="form-input filter-op">
              <option>≥</option><option>≤</option><option>=</option><option>></option><option><</option>
            </select>
            <input type="number" v-model.number="fs.fatVal" min="0" class="form-input filter-num" placeholder="值" />
          </div>
        </div>
      </div>

      <!-- 新增自訂食物 -->
      <div v-if="showAddForm" class="add-food-section">
        <div class="section-divider"></div>
        <div class="goals-section-title">新增自訂食物</div>
        <div class="form-grid">
          <div class="form-group" style="grid-column: span 2">
            <label class="form-label">食物名稱 *</label>
            <input type="text" v-model="newFood.name" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">食物種類 *</label>
            <select v-model="newFood.category" class="form-input">
              <option value="">選擇類別</option>
              <option v-for="cat in FOOD_CATEGORIES" :key="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">份量數字</label>
            <input type="number" v-model.number="newFood.baseAmount" step="0.1" min="0" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">量測單位</label>
            <input type="text" v-model="newFood.measure" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">每份克重 (g)</label>
            <input type="number" v-model.number="newFood.weightInGrams" step="1" min="0" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">熱量 (kcal) *</label>
            <input type="number" v-model.number="newFood.cal" min="0" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">蛋白質 (g)</label>
            <input type="number" v-model.number="newFood.p" step="0.1" min="0" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">碳水 (g)</label>
            <input type="number" v-model.number="newFood.c" step="0.1" min="0" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">脂肪 (g)</label>
            <input type="number" v-model.number="newFood.f" step="0.1" min="0" class="form-input" />
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary btn-sm" @click="saveNewFood">儲存到食物庫</button>
          <button class="btn btn-outline btn-sm" @click="showAddForm = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 食物庫表格 -->
    <div class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-sort" @click="toggleSort('fav')">
                ★ <span :class="sortIconClass('fav')"></span>
              </th>
              <th class="th-sort" @click="toggleSort('name')">
                名稱 <span :class="sortIconClass('name')"></span>
              </th>
              <th class="th-sort" @click="toggleSort('category')">
                種類 <span :class="sortIconClass('category')"></span>
              </th>
              <th class="th-sort" @click="toggleSort('baseAmount')">
                份量 <span :class="sortIconClass('baseAmount')"></span>
              </th>
              <th>單位</th>
              <th class="th-sort" @click="toggleSort('weightInGrams')">
                克重(g) <span :class="sortIconClass('weightInGrams')"></span>
              </th>
              <th class="th-sort" @click="toggleSort('cal')">
                熱量 <span :class="sortIconClass('cal')"></span>
              </th>
              <th class="th-sort" @click="toggleSort('p')">
                蛋白(g) <span :class="sortIconClass('p')"></span>
              </th>
              <th class="th-sort" @click="toggleSort('c')">
                碳水(g) <span :class="sortIconClass('c')"></span>
              </th>
              <th class="th-sort" @click="toggleSort('f')">
                脂肪(g) <span :class="sortIconClass('f')"></span>
              </th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!pageItems.length">
              <td colspan="11" class="empty-state">無符合結果</td>
            </tr>
            <tr v-for="food in pageItems" :key="food.id">
              <td style="text-align:center">
                <button
                  :class="['icon-btn', isFav(food.id) ? 'icon-star-on' : '']"
                  @click="toggleFav(food.id)"
                  :title="isFav(food.id) ? '移除常用' : '加入常用'"
                >{{ isFav(food.id) ? '★' : '☆' }}</button>
              </td>
              <td class="td-text">
                {{ food.name }}
                <span v-if="isFav(food.id)" class="tag tag-fav">★常用</span>
                <span v-if="food.custom" class="tag tag-custom">自訂</span>
              </td>
              <td class="td-text text-secondary">{{ food.category || '—' }}</td>
              <td>{{ food.baseAmount }}</td>
              <td class="td-text">{{ food.measure }}</td>
              <td>{{ food.weightInGrams }}</td>
              <td>{{ food.cal }}</td>
              <td>{{ food.p }}</td>
              <td>{{ food.c }}</td>
              <td>{{ food.f }}</td>
              <td>
                <div class="action-icons">
                  <button class="icon-btn icon-accent" @click="openQuickAdd(food.id)" title="加入飲食紀錄">🍽️</button>
                  <template v-if="food.custom">
                    <button class="icon-btn" @click="openEdit(food.id)" title="編輯">✏️</button>
                    <button class="icon-btn icon-danger" @click="deleteFood(food.id)" title="刪除">🗑️</button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 分頁 -->
      <div class="pagination">
        <button class="page-btn" :disabled="fs.page <= 1" @click="fs.page--">‹ 上一頁</button>
        <span class="page-info">第 {{ fs.page }} / {{ totalPages }} 頁（共 {{ filteredFoods.length }} 筆）</span>
        <button class="page-btn" :disabled="fs.page >= totalPages" @click="fs.page++">下一頁 ›</button>
      </div>
    </div>

    <!-- ── 快速加入 Modal ── -->
    <div v-if="quickAddVisible && quickFood" class="modal-overlay" @click.self="quickAddVisible = false">
      <div class="modal modal-sm">
        <div class="modal-title">加入飲食紀錄</div>
        <div class="selected-food-panel mb-12">
          <div class="selected-food-name">{{ quickFood.name }}</div>
          <div class="selected-food-info">{{ servingText(quickFood) }} · {{ quickFood.cal }} kcal · P{{ quickFood.p }} C{{ quickFood.c }} F{{ quickFood.f }}</div>
        </div>
        <div class="form-group mb-12">
          <label class="form-label">選擇餐點</label>
          <div class="meal-radio-group">
            <label
              v-for="m in MEAL_META" :key="m.id"
              :class="['meal-radio-label', { selected: quickMeal === m.id }]"
            >
              <input type="radio" v-model="quickMeal" :value="m.id" />
              {{ m.icon }} {{ m.label }}
            </label>
          </div>
        </div>
        <div class="form-group mb-12">
          <label class="form-label">份數</label>
          <input type="number" v-model.number="quickServings" min="0.5" step="0.5" class="form-input" style="width:100px" />
        </div>
        <div class="form-group mb-12">
          <label class="form-label">日期</label>
          <input type="date" v-model="quickDate" class="form-input" style="width:160px" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="quickAddVisible = false">取消</button>
          <button class="btn btn-primary" @click="confirmQuickAdd">加入</button>
        </div>
      </div>
    </div>

    <!-- ── 編輯自訂食物 Modal ── -->
    <div v-if="editVisible" class="modal-overlay" @click.self="editVisible = false">
      <div class="modal">
        <div class="modal-title">編輯食物</div>
        <div class="form-grid">
          <div class="form-group" style="grid-column: span 2">
            <label class="form-label">食物名稱 *</label>
            <input type="text" v-model="editForm.name" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">食物種類 *</label>
            <select v-model="editForm.category" class="form-input">
              <option value="">選擇類別</option>
              <option v-for="cat in FOOD_CATEGORIES" :key="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">份量數字</label>
            <input type="number" v-model.number="editForm.baseAmount" step="0.1" min="0" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">量測單位</label>
            <input type="text" v-model="editForm.measure" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">每份克重 (g)</label>
            <input type="number" v-model.number="editForm.weightInGrams" step="1" min="0" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">熱量 (kcal) *</label>
            <input type="number" v-model.number="editForm.cal" min="0" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">蛋白質 (g)</label>
            <input type="number" v-model.number="editForm.p" step="0.1" min="0" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">碳水 (g)</label>
            <input type="number" v-model.number="editForm.c" step="0.1" min="0" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">脂肪 (g)</label>
            <input type="number" v-model.number="editForm.f" step="0.1" min="0" class="form-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="editVisible = false">取消</button>
          <button class="btn btn-primary" @click="confirmEdit">儲存</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div :class="['toast', { show: toastVisible }]">{{ toastMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  useHealthTracker, genUid, servingText, FOOD_CATEGORIES,
  compareOp, type Food,
} from '@/composables/useHealthTracker'

const {
  foods, favorites, dietLogs, goals,
  saveData, getDayLog, todayStr,
  FOOD_PAGE_SIZE, MEAL_META, r0,
} = useHealthTracker()

// ── Filter state ───────────────────────────────────────────────
const fs = reactive({
  search: '', favOnly: false, category: '',
  calOp: '≥', calVal: '' as number | '',
  proteinOp: '≥', proteinVal: '' as number | '',
  fatOp: '≥', fatVal: '' as number | '',
  sortField: 'default', sortDir: 'asc',
  page: 1,
})

const showAdvanced = ref(false)
const showAddForm  = ref(false)

function clearFilters() {
  fs.search = ''; fs.favOnly = false; fs.category = ''
  fs.calVal = ''; fs.proteinVal = ''; fs.fatVal = ''
  fs.sortField = 'default'; fs.sortDir = 'asc'; fs.page = 1
}

// ── Filtered / sorted foods ────────────────────────────────────
const filteredFoods = computed<Food[]>(() => {
  let list = [...foods.value]
  if (fs.search) {
    const q = fs.search.toLowerCase()
    list = list.filter(f => f.name.toLowerCase().includes(q))
  }
  if (fs.favOnly) list = list.filter(f => favorites.value.includes(f.id))
  if (fs.category) list = list.filter(f => f.category === fs.category)
  if (fs.calVal !== '') {
    const v = Number(fs.calVal)
    if (!isNaN(v)) list = list.filter(f => compareOp(f.cal, fs.calOp, v))
  }
  if (fs.proteinVal !== '') {
    const v = Number(fs.proteinVal)
    if (!isNaN(v)) list = list.filter(f => compareOp(f.p, fs.proteinOp, v))
  }
  if (fs.fatVal !== '') {
    const v = Number(fs.fatVal)
    if (!isNaN(v)) list = list.filter(f => compareOp(f.f, fs.fatOp, v))
  }

  if (fs.sortField === 'default') {
    list.sort((a, b) => {
      const aFav = favorites.value.includes(a.id) ? 0 : 1
      const bFav = favorites.value.includes(b.id) ? 0 : 1
      if (aFav !== bFav) return aFav - bFav
      const aCus = a.custom ? 0 : 1, bCus = b.custom ? 0 : 1
      if (aCus !== bCus) return aCus - bCus
      return (a.category || '').localeCompare(b.category || '') || a.name.localeCompare(b.name)
    })
  } else if (fs.sortField === 'fav') {
    const dir = fs.sortDir === 'asc' ? 1 : -1
    list.sort((a, b) => {
      const aF = favorites.value.includes(a.id) ? 0 : 1
      const bF = favorites.value.includes(b.id) ? 0 : 1
      return (aF - bF) * dir
    })
  } else {
    const field = fs.sortField as keyof Food
    const dir   = fs.sortDir === 'asc' ? 1 : -1
    list.sort((a, b) => {
      const av = a[field], bv = b[field]
      if (typeof av === 'string') return String(av).localeCompare(String(bv)) * dir
      return (Number(av) - Number(bv)) * dir
    })
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredFoods.value.length / FOOD_PAGE_SIZE)))

const pageItems = computed<Food[]>(() => {
  const p = Math.min(fs.page, totalPages.value)
  const start = (p - 1) * FOOD_PAGE_SIZE
  return filteredFoods.value.slice(start, start + FOOD_PAGE_SIZE)
})

// ── Sort icons ─────────────────────────────────────────────────
function toggleSort(field: string) {
  if (fs.sortField === field) {
    fs.sortDir = fs.sortDir === 'asc' ? 'desc' : 'asc'
  } else {
    fs.sortField = field
    fs.sortDir   = 'asc'
  }
  fs.page = 1
}

function sortIconClass(field: string) {
  if (fs.sortField !== field) return 'sort-icon inactive'
  return 'sort-icon ' + (fs.sortDir === 'asc' ? 'active-asc' : 'active-desc')
}

// ── Favorites ──────────────────────────────────────────────────
function isFav(id: string) { return favorites.value.includes(id) }

function toggleFav(id: string) {
  const idx = favorites.value.indexOf(id)
  if (idx >= 0) favorites.value.splice(idx, 1)
  else favorites.value.push(id)
  saveData()
}

// ── Delete custom food ─────────────────────────────────────────
function deleteFood(id: string) {
  if (!confirm('確定刪除此食物？')) return
  foods.value = foods.value.filter(f => f.id !== id)
  saveData()
  showToast('已刪除')
}

// ── New food form ──────────────────────────────────────────────
const newFood = ref<Omit<Food, 'id' | 'custom'>>({
  name: '', category: '', baseAmount: 1, measure: '份',
  weightInGrams: 100, cal: 0, p: 0, c: 0, f: 0,
})

function saveNewFood() {
  if (!newFood.value.name) { showToast('請填寫食物名稱'); return }
  if (!newFood.value.cal)  { showToast('請填寫熱量');     return }
  const food: Food = {
    id: 'u' + genUid(),
    ...newFood.value,
    category: newFood.value.category || '其他',
    custom: true,
  }
  foods.value.push(food)
  saveData()
  newFood.value = { name: '', category: '', baseAmount: 1, measure: '份', weightInGrams: 100, cal: 0, p: 0, c: 0, f: 0 }
  showAddForm.value = false
  showToast('食物已加入食物庫')
}

// ── Edit modal ─────────────────────────────────────────────────
const editVisible = ref(false)
const editForm = ref<Food & { id: string }>({
  id: '', name: '', category: '', baseAmount: 1, measure: '份',
  weightInGrams: 100, cal: 0, p: 0, c: 0, f: 0, custom: true,
})

function openEdit(id: string) {
  const f = foods.value.find(x => x.id === id)
  if (!f) return
  editForm.value = { ...f }
  editVisible.value = true
}

function confirmEdit() {
  const idx = foods.value.findIndex(f => f.id === editForm.value.id)
  if (idx < 0) return
  foods.value[idx] = { ...editForm.value }
  saveData()
  editVisible.value = false
  showToast('食物已更新')
}

// ── Quick add modal ────────────────────────────────────────────
const quickAddVisible = ref(false)
const quickFoodId     = ref<string | null>(null)
const quickMeal       = ref('breakfast')
const quickServings   = ref(1)
const quickDate       = ref(todayStr())

const quickFood = computed<Food | null>(() =>
  foods.value.find(f => f.id === quickFoodId.value) ?? null
)

function openQuickAdd(id: string) {
  quickFoodId.value  = id
  quickServings.value = 1
  quickDate.value    = todayStr()
  quickMeal.value    = 'breakfast'
  quickAddVisible.value = true
}

function confirmQuickAdd() {
  const food = quickFood.value
  if (!food) return
  const entry = {
    uid: genUid(), foodId: food.id, name: food.name,
    cal: food.cal, p: food.p, c: food.c, f: food.f,
    serving: servingText(food), servings: quickServings.value,
  }
  const log  = getDayLog(quickDate.value)
  const meal = log.meals[quickMeal.value as keyof typeof log.meals]
  meal.push(entry)
  saveData()
  quickAddVisible.value = false
  showToast(`已將 ${food.name} 加入 ${quickDate.value} ${MEAL_META.find(m => m.id === quickMeal.value)?.label}`)
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
.btn-primary { background: var(--ht-green); color: #fff; border-color: var(--ht-green); }
.btn-primary:hover  { opacity: 0.88; }
.btn-outline { background: none; border-color: var(--ht-border); color: var(--ht-text2); }
.btn-outline:hover  { background: var(--ht-surface2); }
.btn-sm { padding: 4px 10px; font-size: 12px; }

.card {
  background: var(--ht-surface);
  border: 1px solid var(--ht-border);
  border-radius: var(--ht-radius);
  padding: 18px;
  margin-bottom: 12px;
}

/* Filter */
.filter-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.search-input { flex: 1; min-width: 160px; }
.filter-select { font-size: 12px; }
.filter-check-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--ht-text2);
  cursor: pointer;
}
.filter-adv {
  background: var(--ht-surface2);
  border-radius: 6px;
  padding: 12px 14px;
  margin-bottom: 10px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: flex-end;
}
.filter-group { display: flex; flex-direction: column; gap: 4px; }
.filter-group-label {
  font-size: 10px;
  color: var(--ht-text2);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.filter-inline { display: flex; gap: 5px; align-items: center; }
.filter-op  { width: 50px; padding: 5px 4px; font-size: 12px; }
.filter-num { width: 70px; font-size: 12px; }

.add-food-section { margin-top: 8px; }
.section-divider { height: 1px; background: var(--ht-border); margin: 18px 0; }
.goals-section-title { font-size: 12px; font-weight: 600; color: var(--ht-text2); margin-bottom: 12px; }
.form-grid  { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-label { font-size: 11px; color: var(--ht-text2); font-weight: 500; }

/* Table */
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.data-table th {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 2px solid var(--ht-border);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--ht-text2);
  font-weight: 600;
  background: var(--ht-surface2);
  white-space: nowrap;
}
.data-table td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--ht-border);
  font-size: 11px;
  white-space: nowrap;
}
.data-table td.td-text { font-family: var(--font-body); font-size: 12px; white-space: normal; }
.data-table td.text-secondary { color: var(--ht-text2); }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #fafaf8; }
.th-sort { cursor: pointer; user-select: none; transition: background 0.12s; }
.th-sort:hover { background: var(--ht-border); }
.sort-icon { margin-left: 3px; font-size: 9px; color: var(--ht-text3); }
.sort-icon::after { content: ' ↕'; }
.sort-icon.active-asc::after  { content: ' ↑'; color: var(--ht-green); }
.sort-icon.active-desc::after { content: ' ↓'; color: var(--ht-green); }
.sort-icon.inactive::after    { content: ' ↕'; }
.empty-state { text-align: center; padding: 24px; color: var(--ht-text3); font-size: 13px; }

/* Tags */
.tag        { display: inline-block; padding: 1px 6px; border-radius: 20px; font-size: 10px; font-weight: 600; margin-left: 3px; }
.tag-custom { background: var(--ht-green-light); color: var(--ht-green); }
.tag-fav    { background: #fdf3e0; color: #9e7a28; }

/* Action icons */
.action-icons { display: flex; gap: 2px; align-items: center; }
.icon-btn {
  width: 28px; height: 28px;
  border: none; background: none; cursor: pointer;
  border-radius: 4px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 14px; color: var(--ht-text3);
  transition: background 0.13s, color 0.13s;
  padding: 0; flex-shrink: 0;
}
.icon-btn:hover        { background: var(--ht-surface2); color: var(--ht-text); }
.icon-btn.icon-danger:hover { background: #f5e5e2; color: var(--ht-danger); }
.icon-btn.icon-accent:hover { background: var(--ht-green-light); color: var(--ht-green); }
.icon-btn.icon-star-on { color: #c8a030; }
.icon-btn.icon-star-on:hover { background: #fdf3e0; }

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  padding: 14px 0 4px;
  border-top: 1px solid var(--ht-border);
  margin-top: 4px;
}
.page-btn {
  padding: 5px 14px;
  border: 1px solid var(--ht-border);
  border-radius: 4px;
  background: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  color: var(--ht-text2);
  transition: background 0.12s;
}
.page-btn:hover:not(:disabled) { background: var(--ht-surface2); }
.page-btn:disabled { opacity: 0.35; cursor: default; }
.page-info { font-size: 12px; color: var(--ht-text2); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
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
.modal-sm { width: 360px; }
.modal-title  { font-size: 15px; font-weight: 600; margin-bottom: 16px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--ht-border); }
.mb-12 { margin-bottom: 12px; }

.selected-food-panel {
  background: var(--ht-green-light);
  border-radius: 6px;
  padding: 12px 14px;
  margin-bottom: 12px;
}
.selected-food-name { font-weight: 500; margin-bottom: 3px; font-size: 13px; }
.selected-food-info { font-size: 11px; color: var(--ht-text2); }

.meal-radio-group { display: flex; gap: 10px; flex-wrap: wrap; }
.meal-radio-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 12px;
  border: 1px solid var(--ht-border);
  border-radius: 4px;
  transition: all 0.12s;
}
.meal-radio-label:hover { background: var(--ht-surface2); }
.meal-radio-label input[type="radio"] { display: none; }
.meal-radio-label.selected { border-color: var(--ht-green); background: var(--ht-green-light); color: var(--ht-green); }

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
