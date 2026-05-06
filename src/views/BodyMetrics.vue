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
          <label class="form-label">體重 (kg) *</label>
          <input type="number" v-model.number="form.weight" min="0" step="0.1" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">體脂率 (%)</label>
          <input type="number" v-model.number="form.bodyFat" min="0" max="100" step="0.1" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">骨骼肌量 (kg)</label>
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
      <button class="btn btn-primary" :disabled="isSaving" @click="addLog">
        {{ isSaving ? '儲存中…' : '儲存紀錄' }}
      </button>
    </div>

    <!-- 歷史紀錄 -->
    <div class="card">
      <div class="card-title">歷史紀錄</div>
      <div v-if="isLoading" class="empty-state">載入中…</div>
      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>體重(kg)</th>
              <th>體脂(%)</th>
              <th>骨骼肌(kg)</th>
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
              v-for="log in bodyLogs"
              :key="log.id"
              class="clickable-row"
              @click="openDetail(log.id)"
            >
              <td class="td-text">{{ log.measureDate }}</td>
              <td>{{ log.weight ?? '—' }}</td>
              <td>{{ log.bodyFat != null ? log.bodyFat + '%' : '—' }}</td>
              <td>{{ log.skeletalMuscle ?? '—' }}</td>
              <td>{{ log.waistCircumference ?? '—' }}</td>
              <td>{{ log.hipCircumference ?? '—' }}</td>
              <td>
                <template v-if="getBmi(log)">
                  {{ getBmi(log) }}
                  <span :class="['badge', getBmiInfo(log)?.cls]">{{ getBmiInfo(log)?.text }}</span>
                </template>
                <span v-else>—</span>
              </td>
              <td @click.stop>
                <img v-if="log.imageUrl" :src="log.imageUrl" class="body-thumb" />
                <div v-else class="body-thumb-placeholder">📷</div>
              </td>
              <td @click.stop>
                <div class="action-icons">
                  <button class="icon-btn icon-accent" @click="openEdit(log.id)" title="編輯">✏️</button>
                  <button class="icon-btn icon-danger" @click="deleteLog(log.id)" title="刪除">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── 409 覆蓋確認 Dialog ── -->
    <div v-if="conflictDialogVisible" class="modal-overlay">
      <div class="modal" style="max-width:380px">
        <div class="modal-title">此日期已有量測紀錄</div>
        <p style="font-size:13px;color:var(--ht-text2);margin:0 0 16px">
          是否覆蓋原有的紀錄？
        </p>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="cancelOverwrite">取消</button>
          <button class="btn btn-primary" :disabled="isSaving" @click="confirmOverwrite">
            {{ isSaving ? '更新中…' : '確認覆蓋' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── 編輯 Modal ── -->
    <div v-if="editVisible" class="modal-overlay" @click.self="editVisible = false">
      <div class="modal">
        <div class="modal-title">編輯體態紀錄 — {{ editForm.measureDate }}</div>
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
            <label class="form-label">骨骼肌量 (kg)</label>
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
          <button class="btn btn-primary" :disabled="isSaving" @click="confirmEdit">
            {{ isSaving ? '更新中…' : '儲存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── 詳細 Modal ── -->
    <div v-if="detailVisible && detailLog" class="modal-overlay" @click.self="detailVisible = false">
      <div class="modal detail-modal" @click.stop>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div class="modal-title" style="margin:0">體態紀錄 — {{ detailLog.measureDate }}</div>
          <button class="icon-btn" @click="detailVisible = false" style="font-size:18px;color:var(--ht-text2)">✕</button>
        </div>

        <div class="photo-wrap" v-if="detailLog.imageUrl">
          <img :src="detailLog.imageUrl" class="detail-photo" />
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
            <div class="detail-card-label">骨骼肌量</div>
            <div class="detail-card-val" style="color:var(--ht-green)">{{ detailLog.skeletalMuscle != null ? detailLog.skeletalMuscle + ' kg' : '—' }}</div>
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
            <div class="detail-card-val">{{ detailLog.waistCircumference != null ? detailLog.waistCircumference + ' cm' : '—' }}</div>
          </div>
          <div class="detail-card">
            <div class="detail-card-label">臀圍</div>
            <div class="detail-card-val">{{ detailLog.hipCircumference != null ? detailLog.hipCircumference + ' cm' : '—' }}</div>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--ht-border)">
          <button class="btn btn-outline" @click="detailVisible = false">關閉</button>
          <button class="btn btn-primary" @click="detailVisible = false; openEdit(detailLog!.id)">編輯此筆</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div :class="['toast', { show: toastVisible }]">{{ toastMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBodyRecords, type BodyRecordConflictError, type CreateBodyRecordPayload } from '@/composables/useBodyRecords'
import { useHealthTracker, todayStr } from '@/composables/useHealthTracker'
import { calcBMI, bmiLabel } from '@/composables/useGoals'
import type { BodyRecordDto } from '@/data/bodyRecords'

const { bodyLogs, isLoading, isSaving, loadBodyRecords, createBodyLog, updateBodyLog, deleteBodyLog } = useBodyRecords()
const { goals } = useHealthTracker()

onMounted(() => loadBodyRecords({ take: 40 }))

// ── BMI helpers ────────────────────────────────────────────────
function getBmi(log: BodyRecordDto) {
  return calcBMI(log.weight, goals.value.height)
}
function getBmiInfo(log: BodyRecordDto) {
  const b = getBmi(log)
  return b ? bmiLabel(b) : null
}

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

// ── 409 覆蓋 Dialog ────────────────────────────────────────────
const conflictDialogVisible = ref(false)
const conflictExistingId    = ref<number | null>(null)
let   pendingPayload: CreateBodyRecordPayload | null = null

async function addLog() {
  if (!form.value.date)   { showToast('請選擇日期'); return }
  if (!form.value.weight) { showToast('請填入體重'); return }

  const payload: CreateBodyRecordPayload = {
    measureDate:        form.value.date,
    weight:             form.value.weight,
    bodyFat:            form.value.bodyFat,
    skeletalMuscle:     form.value.muscleMass,
    waistCircumference: form.value.waist,
    hipCircumference:   form.value.hip,
    photo:              photoInput.value?.files?.[0] ?? null,
  }

  try {
    await createBodyLog(payload)
    resetForm()
    showToast('體態紀錄已儲存')
  } catch (err) {
    const conflictErr = err as BodyRecordConflictError
    if (conflictErr.existingId) {
      conflictExistingId.value    = conflictErr.existingId
      pendingPayload              = payload
      conflictDialogVisible.value = true
    } else {
      showToast((err as Error).message || '儲存失敗')
    }
  }
}

async function confirmOverwrite() {
  if (conflictExistingId.value === null || !pendingPayload) return
  conflictDialogVisible.value = false
  try {
    await updateBodyLog(conflictExistingId.value, pendingPayload)
    resetForm()
    showToast('體態紀錄已覆蓋更新')
  } catch (err) {
    showToast((err as Error).message || '更新失敗')
  } finally {
    conflictExistingId.value = null
    pendingPayload           = null
  }
}

function cancelOverwrite() {
  conflictDialogVisible.value = false
  conflictExistingId.value    = null
  pendingPayload              = null
}

function resetForm() {
  form.value = { date: todayStr(), weight: null, bodyFat: null, muscleMass: null, waist: null, hip: null }
  if (photoInput.value) photoInput.value.value = ''
}

async function deleteLog(id: number) {
  if (!confirm('確定刪除此筆紀錄？')) return
  try {
    await deleteBodyLog(id)
    showToast('已刪除')
  } catch (err) {
    showToast((err as Error).message || '刪除失敗')
  }
}

// ── Edit modal ─────────────────────────────────────────────────
const editVisible    = ref(false)
const editPhotoInput = ref<HTMLInputElement | null>(null)
const editForm = ref({
  id: 0, measureDate: '',
  weight: null as number | null,
  bodyFat: null as number | null, muscleMass: null as number | null,
  waist: null as number | null,   hip: null as number | null,
})

function openEdit(id: number) {
  const log = bodyLogs.value.find(l => l.id === id)
  if (!log) return
  editForm.value = {
    id:          log.id,
    measureDate: log.measureDate,
    weight:      log.weight,
    bodyFat:     log.bodyFat !== null     ? Number(log.bodyFat)            : null,
    muscleMass:  log.skeletalMuscle !== null ? Number(log.skeletalMuscle) : null,
    waist:       log.waistCircumference !== null ? Number(log.waistCircumference) : null,
    hip:         log.hipCircumference !== null  ? Number(log.hipCircumference)   : null,
  }
  editVisible.value = true
}

async function confirmEdit() {
  if (!editForm.value.id || !editForm.value.weight) return
  try {
    await updateBodyLog(editForm.value.id, {
      measureDate:        editForm.value.measureDate,
      weight:             editForm.value.weight,
      bodyFat:            editForm.value.bodyFat,
      skeletalMuscle:     editForm.value.muscleMass,
      waistCircumference: editForm.value.waist,
      hipCircumference:   editForm.value.hip,
      photo:              editPhotoInput.value?.files?.[0] ?? null,
    })
    editVisible.value = false
    showToast('已更新 ' + editForm.value.measureDate + ' 的紀錄')
  } catch (err) {
    showToast((err as Error).message || '更新失敗')
  }
}

// ── Detail modal ───────────────────────────────────────────────
const detailVisible = ref(false)
const detailLog     = ref<BodyRecordDto | null>(null)

function openDetail(id: number) {
  detailLog.value     = bodyLogs.value.find(l => l.id === id) ?? null
  detailVisible.value = true
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
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary { background: var(--ht-green); color: #fff; border-color: var(--ht-green); }
.btn-primary:hover:not(:disabled) { opacity: 0.88; }
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
