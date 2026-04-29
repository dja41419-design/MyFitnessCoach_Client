<template>
  <div class="body-metrics">
    <!-- 新增量測表單 -->
    <div class="card">
      <div class="section-header">
        <div class="section-title">新增體態紀錄</div>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">日期 *</label>
          <input type="date" v-model="form.date" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">體重 (kg)</label>
          <input type="number" v-model.number="form.weight" min="0" step="0.1" class="form-input" @input="updateBmiPreview" />
        </div>
        <div class="form-group">
          <label class="form-label">體脂率 (%)</label>
          <input type="number" v-model.number="form.bodyFat" min="0" max="100" step="0.1" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">肌肉量 (kg)</label>
          <input type="number" v-model.number="form.muscleMass" min="0" step="0.1" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">腰圍 (cm)</label>
          <input type="number" v-model.number="form.waist" min="0" step="0.1" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">臀圍 (cm)</label>
          <input type="number" v-model.number="form.hip" min="0" step="0.1" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">照片</label>
          <input type="file" accept="image/*" class="form-input" ref="photoInput" />
        </div>
        <div class="form-group bmi-group">
          <label class="form-label">BMI 預覽</label>
          <div class="bmi-preview">
            <template v-if="bmiPreview !== null">
              {{ bmiPreview }}
              <span :class="['badge', bmiInfo?.cls]">{{ bmiInfo?.text }}</span>
            </template>
            <span v-else class="text-muted">—</span>
          </div>
        </div>
      </div>
      <button class="btn btn-primary" @click="addLog">儲存紀錄</button>
    </div>

    <!-- 歷史紀錄 -->
    <div class="card">
      <div class="card-title">歷史紀錄</div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>體重(kg)</th>
              <th>體脂(%)</th>
              <th>肌肉量(kg)</th>
              <th>腰圍(cm)</th>
              <th>臀圍(cm)</th>
              <th>BMI</th>
              <th>照片</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!bodyLogs.length">
              <td colspan="9" class="empty-state">尚無紀錄</td>
            </tr>
            <tr
              v-for="log in bodyLogs.slice(0, 40)"
              :key="log.date"
              class="clickable-row"
              @click="openDetail(log.date)"
            >
              <td class="td-text">{{ log.date }}</td>
              <td>{{ log.weight ?? '—' }}</td>
              <td>{{ log.bodyFat != null ? log.bodyFat + '%' : '—' }}</td>
              <td>{{ log.muscleMass ?? '—' }}</td>
              <td>{{ log.waist ?? '—' }}</td>
              <td>{{ log.hip ?? '—' }}</td>
              <td>
                <template v-if="getBmi(log)">
                  {{ getBmi(log) }}
                  <span :class="['badge', getBmiInfo(log)?.cls]">{{ getBmiInfo(log)?.text }}</span>
                </template>
                <span v-else>—</span>
              </td>
              <td @click.stop>
                <img v-if="log.photo" :src="log.photo" class="body-thumb" />
                <div v-else class="body-thumb-placeholder">📷</div>
              </td>
              <td @click.stop>
                <div class="action-icons">
                  <button class="icon-btn icon-accent" @click="openEdit(log.date)" title="編輯">✏️</button>
                  <button class="icon-btn icon-danger" @click="deleteLog(log.date)" title="刪除">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── 編輯 Modal ── -->
    <div v-if="editVisible" class="modal-overlay" @click.self="editVisible = false">
      <div class="modal">
        <div class="modal-title">編輯體態紀錄 — {{ editForm.date }}</div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">體重 (kg)</label>
            <input type="number" v-model.number="editForm.weight" step="0.1" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">體脂率 (%)</label>
            <input type="number" v-model.number="editForm.bodyFat" step="0.1" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">肌肉量 (kg)</label>
            <input type="number" v-model.number="editForm.muscleMass" step="0.1" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">腰圍 (cm)</label>
            <input type="number" v-model.number="editForm.waist" step="0.1" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">臀圍 (cm)</label>
            <input type="number" v-model.number="editForm.hip" step="0.1" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">更換照片</label>
            <input type="file" accept="image/*" class="form-input" ref="editPhotoInput" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="editVisible = false">取消</button>
          <button class="btn btn-primary" @click="confirmEdit">儲存</button>
        </div>
      </div>
    </div>

    <!-- ── 詳細 Modal ── -->
    <div v-if="detailVisible && detailLog" class="modal-overlay" @click.self="detailVisible = false">
      <div class="modal detail-modal" @click.stop>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div class="modal-title" style="margin:0">體態紀錄 — {{ detailLog.date }}</div>
          <button class="icon-btn" @click="detailVisible = false" style="font-size:18px;color:var(--ht-text2)">✕</button>
        </div>

        <div class="photo-wrap" v-if="detailLog.photo">
          <img :src="detailLog.photo" class="detail-photo" />
        </div>
        <div class="no-photo" v-else>尚未上傳照片</div>

        <div class="detail-grid">
          <div class="detail-card">
            <div class="detail-card-label">體重</div>
            <div class="detail-card-val" style="color:var(--ht-info)">{{ detailLog.weight != null ? detailLog.weight + ' kg' : '—' }}</div>
          </div>
          <div class="detail-card">
            <div class="detail-card-label">體脂率</div>
            <div class="detail-card-val" style="color:var(--ht-warn)">{{ detailLog.bodyFat != null ? detailLog.bodyFat + '%' : '—' }}</div>
          </div>
          <div class="detail-card">
            <div class="detail-card-label">肌肉量</div>
            <div class="detail-card-val" style="color:var(--ht-green)">{{ detailLog.muscleMass != null ? detailLog.muscleMass + ' kg' : '—' }}</div>
          </div>
          <div class="detail-card">
            <div class="detail-card-label">BMI</div>
            <div class="detail-card-val">
              <template v-if="getBmi(detailLog)">
                {{ getBmi(detailLog) }}
                <span :class="['badge', getBmiInfo(detailLog)?.cls]">{{ getBmiInfo(detailLog)?.text }}</span>
              </template>
              <span v-else>—</span>
            </div>
          </div>
          <div class="detail-card">
            <div class="detail-card-label">腰圍</div>
            <div class="detail-card-val">{{ detailLog.waist != null ? detailLog.waist + ' cm' : '—' }}</div>
          </div>
          <div class="detail-card">
            <div class="detail-card-label">臀圍</div>
            <div class="detail-card-val">{{ detailLog.hip != null ? detailLog.hip + ' cm' : '—' }}</div>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--ht-border)">
          <button class="btn btn-outline" @click="detailVisible = false">關閉</button>
          <button class="btn btn-primary" @click="detailVisible = false; openEdit(detailLog!.date)">編輯此筆</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div :class="['toast', { show: toastVisible }]">{{ toastMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHealthTracker, type BodyLog } from '@/composables/useHealthTracker'
import { calcBMI, bmiLabel } from '@/composables/useGoals'

const { bodyLogs, goals, saveData, todayStr } = useHealthTracker()

// ── Add form ───────────────────────────────────────────────────
const photoInput = ref<HTMLInputElement | null>(null)
const form = ref({
  date: todayStr(),
  weight: null as number | null,
  bodyFat: null as number | null,
  muscleMass: null as number | null,
  waist: null as number | null,
  hip: null as number | null,
})

const bmiPreview = computed(() => calcBMI(form.value.weight, goals.value.height))
const bmiInfo    = computed(() => bmiPreview.value ? bmiLabel(bmiPreview.value) : null)

function updateBmiPreview() {} // reactivity handles it

function getBmi(log: BodyLog) {
  return calcBMI(log.weight, goals.value.height)
}
function getBmiInfo(log: BodyLog) {
  const b = getBmi(log)
  return b ? bmiLabel(b) : null
}

async function addLog() {
  if (!form.value.date) { showToast('請選擇日期'); return }
  if (!form.value.weight && !form.value.bodyFat) { showToast('請至少填入體重或體脂率'); return }

  const existing = bodyLogs.value.find(l => l.date === form.value.date)
  if (existing && !confirm(`${form.value.date} 已有紀錄，是否覆蓋？`)) return

  const photoData = await readPhoto(photoInput.value)
  const entry: BodyLog = {
    date: form.value.date,
    weight: form.value.weight,
    bodyFat: form.value.bodyFat,
    muscleMass: form.value.muscleMass,
    waist: form.value.waist,
    hip: form.value.hip,
    photo: photoData ?? existing?.photo ?? null,
  }
  bodyLogs.value = bodyLogs.value.filter(l => l.date !== form.value.date)
  bodyLogs.value.push(entry)
  bodyLogs.value.sort((a, b) => b.date.localeCompare(a.date))
  saveData()
  resetForm()
  showToast('體態紀錄已儲存')
}

function resetForm() {
  form.value = { date: todayStr(), weight: null, bodyFat: null, muscleMass: null, waist: null, hip: null }
  if (photoInput.value) photoInput.value.value = ''
}

function deleteLog(date: string) {
  if (!confirm(`確定刪除 ${date} 的紀錄？`)) return
  bodyLogs.value = bodyLogs.value.filter(l => l.date !== date)
  saveData()
  showToast('已刪除')
}

// ── Edit modal ─────────────────────────────────────────────────
const editVisible   = ref(false)
const editPhotoInput = ref<HTMLInputElement | null>(null)
const editForm = ref({
  date: '', weight: null as number | null,
  bodyFat: null as number | null, muscleMass: null as number | null,
  waist: null as number | null, hip: null as number | null,
})

function openEdit(date: string) {
  const log = bodyLogs.value.find(l => l.date === date)
  if (!log) return
  editForm.value = {
    date: log.date,
    weight: log.weight,
    bodyFat: log.bodyFat,
    muscleMass: log.muscleMass,
    waist: log.waist,
    hip: log.hip,
  }
  editVisible.value = true
}

async function confirmEdit() {
  const log = bodyLogs.value.find(l => l.date === editForm.value.date)
  if (!log) return
  const photoData = await readPhoto(editPhotoInput.value)
  log.weight     = editForm.value.weight
  log.bodyFat    = editForm.value.bodyFat
  log.muscleMass = editForm.value.muscleMass
  log.waist      = editForm.value.waist
  log.hip        = editForm.value.hip
  if (photoData) log.photo = photoData
  saveData()
  editVisible.value = false
  showToast('已更新 ' + editForm.value.date + ' 的紀錄')
}

// ── Detail modal ───────────────────────────────────────────────
const detailVisible = ref(false)
const detailLog     = ref<BodyLog | null>(null)

function openDetail(date: string) {
  detailLog.value     = bodyLogs.value.find(l => l.date === date) ?? null
  detailVisible.value = true
}

// ── Helpers ────────────────────────────────────────────────────
function readPhoto(input: HTMLInputElement | null): Promise<string | null> {
  return new Promise(resolve => {
    if (!input?.files?.[0]) { resolve(null); return }
    const reader = new FileReader()
    reader.onload = e => resolve(e.target?.result as string ?? null)
    reader.readAsDataURL(input.files[0])
  })
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
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.section-title { font-size: 15px; font-weight: 600; }

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-label { font-size: 11px; color: var(--ht-text2); font-weight: 500; }

.bmi-preview {
  padding: 8px 12px;
  background: var(--ht-surface2);
  border-radius: 4px;
  font-size: 13px;
  color: var(--ht-text2);
  display: flex;
  align-items: center;
  gap: 6px;
}
.text-muted { color: var(--ht-text3); }

/* Table */
.table-wrap  { overflow-x: auto; }
.data-table  { width: 100%; border-collapse: collapse; font-size: 12px; }
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
.data-table td.td-text { font-family: var(--font-body); font-size: 12px; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tbody tr.clickable-row { cursor: pointer; }
.data-table tbody tr.clickable-row:hover td { background: var(--ht-surface2); }
.empty-state { text-align: center; padding: 24px; color: var(--ht-text3); font-size: 13px; }

.body-thumb {
  width: 38px;
  height: 38px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--ht-border);
}
.body-thumb-placeholder {
  width: 38px;
  height: 38px;
  border: 1px dashed var(--ht-border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--ht-text3);
}
.action-icons { display: flex; gap: 2px; align-items: center; }
.icon-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--ht-text3);
  transition: background 0.13s, color 0.13s;
  padding: 0;
  flex-shrink: 0;
}
.icon-btn:hover { background: var(--ht-surface2); color: var(--ht-text); }
.icon-btn.icon-danger:hover { background: #f5e5e2; color: var(--ht-danger); }
.icon-btn.icon-accent:hover { background: var(--ht-green-light); color: var(--ht-green); }

/* Badge */
.badge { display: inline-block; padding: 2px 7px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-green  { background: var(--ht-green-light); color: var(--ht-green); }
.badge-yellow { background: #fdf3e0; color: #9e7a28; }
.badge-red    { background: #f5e5e2; color: var(--ht-danger); }

/* Modal */
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
.detail-modal { width: 480px; }
.modal-title  { font-size: 15px; font-weight: 600; margin-bottom: 16px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--ht-border); }

.detail-photo {
  width: 100%;
  max-height: 340px;
  object-fit: contain;
  border-radius: 6px;
  background: var(--ht-surface2);
  margin-bottom: 16px;
}
.no-photo {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ht-text3);
  font-size: 13px;
  border: 1px dashed var(--ht-border);
  border-radius: 6px;
  margin-bottom: 16px;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}
.detail-card {
  background: var(--ht-surface2);
  border-radius: 6px;
  padding: 12px 14px;
}
.detail-card-label {
  font-size: 10px;
  color: var(--ht-text3);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.detail-card-val {
  font-size: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

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
