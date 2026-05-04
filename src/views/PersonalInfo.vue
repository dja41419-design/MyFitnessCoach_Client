<template>
  <div class="personal-info">
    <div class="section-header">
      <h2 class="section-title">個人資料</h2>
      <p class="section-desc">管理您的基本資料與聯絡資訊</p>
    </div>

    <div v-if="initLoading" class="info-card loading-state">載入中…</div>

    <template v-else>
      <!-- 頭像區塊 -->
      <div class="info-card avatar-card">
        <div class="avatar-wrap">
          <img :src="avatarSrc" alt="頭像" class="avatar-img" />
          <label class="avatar-upload-btn" :class="{ disabled: avatarUploading }">
            <input type="file" accept="image/jpeg,image/png,image/webp" @change="handleAvatarChange" :disabled="avatarUploading" />
            {{ avatarUploading ? '上傳中…' : '更換頭像' }}
          </label>
        </div>
        <div v-if="avatarError" class="field-error">{{ avatarError }}</div>
        <p class="avatar-hint">支援 JPG、PNG、WebP，最大 2MB</p>
      </div>

      <!-- 基本資料表單 -->
      <div class="info-card">
        <div class="form-grid">
          <!-- 姓名 -->
          <div class="form-group">
            <label class="form-label">姓名 <span class="required">*</span></label>
            <input
              v-model="form.userName"
              type="text"
              class="form-input"
              :class="{ 'is-error': errors.userName }"
              maxlength="50"
              @blur="onBlur('userName')"
              @input="onInput('userName')"
            />
            <span v-if="errors.userName" class="field-error">{{ errors.userName }}</span>
          </div>

          <!-- 電子信箱 -->
          <div class="form-group">
            <label class="form-label">電子信箱</label>
            <div class="locked-field">
              <input
                v-model="form.email"
                type="email"
                class="form-input locked-input"
                maxlength="100"
                readonly
                aria-readonly="true"
              />
              <span class="lock-badge">已鎖定</span>
            </div>
            <span class="field-hint">若需更換 Email，須重新完成信箱驗證。</span>
          </div>

          <!-- 手機 -->
          <div class="form-group">
            <label class="form-label">手機</label>
            <div class="locked-field">
              <input
                v-model="form.mobile"
                type="tel"
                class="form-input locked-input"
                maxlength="10"
                readonly
                aria-readonly="true"
              />
              <span class="lock-badge">已鎖定</span>
            </div>
            <span class="field-hint">手機為註冊聯絡資料，目前不可於個人資料頁修改。</span>
          </div>

          <!-- 性別 -->
          <div class="form-group">
            <label class="form-label">性別 <span class="required">*</span></label>
            <div class="gender-row">
              <label class="gender-option" :class="{ selected: form.gender === 'M', 'is-error': errors.gender }">
                <input type="radio" name="pi-gender" value="M" v-model="form.gender" @change="onBlur('gender')" />
                男性
              </label>
              <label class="gender-option" :class="{ selected: form.gender === 'F', 'is-error': errors.gender }">
                <input type="radio" name="pi-gender" value="F" v-model="form.gender" @change="onBlur('gender')" />
                女性
              </label>
            </div>
            <span v-if="errors.gender" class="field-error">{{ errors.gender }}</span>
          </div>

          <!-- 出生日期 -->
          <div class="form-group">
            <label class="form-label">出生日期 <span class="required">*</span></label>
            <input
              v-model="form.dateOfBirth"
              type="date"
              class="form-input"
              :class="{ 'is-error': errors.dateOfBirth }"
              :max="maxDob"
              :min="minDob"
              @blur="onBlur('dateOfBirth')"
              @input="onInput('dateOfBirth')"
            />
            <span v-if="errors.dateOfBirth" class="field-error">{{ errors.dateOfBirth }}</span>
          </div>
        </div>

        <div v-if="apiError" class="api-error">{{ apiError }}</div>

        <button class="save-btn" :disabled="saving" @click="handleSave">
          <span v-if="saving" class="btn-spinner"></span>
          {{ saving ? '儲存中…' : '儲存個人資料' }}
        </button>
      </div>
    </template>

    <!-- Toast -->
    <div :class="['toast', { show: toastVisible }]">{{ toastMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  getPersonalInfo, updatePersonalInfo, uploadAvatar,
  type UpdatePersonalInfoRequest,
} from '@/data/personalInfo'
import { hasHtmlSpecialChar, NAME_MAX_LENGTH } from '@/utils/validators'

// ── State ──────────────────────────────────────────────────────
const initLoading    = ref(true)
const saving         = ref(false)
const avatarUploading = ref(false)
const avatarError    = ref('')
const apiError       = ref('')
const currentImageUrl = ref<string | null>(null)

const form = reactive({
  userName:    '',
  email:       '',
  mobile:      '',
  gender:      '' as 'M' | 'F' | '',
  dateOfBirth: '',
})

const errors = reactive({
  userName:    '',
  gender:      '',
  dateOfBirth: '',
})

const touched = reactive({
  userName:    false,
  gender:      false,
  dateOfBirth: false,
})

// ── Computed ────────────────────────────────────────────────────
const NO_IMAGE = '/StaticFiles/images/NoImage.jpg'

function toAvatarSrc(url: string | null): string {
  if (!url) return NO_IMAGE
  if (url.startsWith('http') || url.startsWith('/StaticFiles') || url.startsWith('/images')) return url
  return `/StaticFiles${url}`
}

const avatarSrc = computed(() => toAvatarSrc(currentImageUrl.value))

const today = new Date()
const maxDob = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate()).toISOString().split('T')[0]
const minDob = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate()).toISOString().split('T')[0]

// ── Load ───────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const data = await getPersonalInfo()
    form.userName    = data.userName
    form.email       = data.email
    form.mobile      = data.mobile
    form.gender      = data.gender ?? ''
    form.dateOfBirth = data.dateOfBirth ?? ''
    currentImageUrl.value = data.imageUrl
  } catch {
    apiError.value = '載入個人資料失敗，請重新整理'
  } finally {
    initLoading.value = false
  }
})

// ── Validation ─────────────────────────────────────────────────
function validateOne(field: keyof typeof errors): string {
  switch (field) {
    case 'userName': {
      const n = form.userName.trim()
      if (!n) return '請輸入姓名'
      if (n.length > NAME_MAX_LENGTH) return `姓名不可超過 ${NAME_MAX_LENGTH} 字`
      if (hasHtmlSpecialChar(n)) return '姓名不可包含特殊符號'
      return ''
    }
    case 'gender':
      return form.gender ? '' : '請選擇性別'
    case 'dateOfBirth': {
      if (!form.dateOfBirth) return '請輸入出生日期'
      const dob = new Date(form.dateOfBirth)
      if (dob > new Date(maxDob)) return '年齡須為 10 歲以上'
      if (dob < new Date(minDob)) return '請輸入有效的出生日期'
      return ''
    }
  }
}

function onBlur(field: keyof typeof errors) {
  touched[field] = true
  errors[field] = validateOne(field)
}

function onInput(field: keyof typeof errors) {
  if (!touched[field]) return
  errors[field] = validateOne(field)
}

function validateAll(): boolean {
  const fields = Object.keys(errors) as (keyof typeof errors)[]
  fields.forEach(f => {
    touched[f] = true
    errors[f] = validateOne(f)
  })
  return fields.every(f => !errors[f])
}

// ── Save ───────────────────────────────────────────────────────
async function handleSave() {
  apiError.value = ''
  if (!validateAll()) return

  saving.value = true
  try {
    const dto: UpdatePersonalInfoRequest = {
      userName:    form.userName.trim(),
      gender:      form.gender as 'M' | 'F',
      dateOfBirth: form.dateOfBirth,
    }
    const updated = await updatePersonalInfo(dto)
    form.userName    = updated.userName
    form.email       = updated.email
    form.mobile      = updated.mobile
    form.gender      = updated.gender ?? form.gender
    form.dateOfBirth = updated.dateOfBirth ?? form.dateOfBirth
    currentImageUrl.value = updated.imageUrl

    localStorage.setItem('username', updated.userName)
    if (updated.imageUrl) localStorage.setItem('imageUrl', updated.imageUrl)

    window.dispatchEvent(new CustomEvent('profile-updated', {
      detail: { userName: updated.userName, imageUrl: updated.imageUrl }
    }))

    showToast('個人資料已儲存')
  } catch (e: unknown) {
    apiError.value = (e instanceof Error ? e.message : '儲存失敗，請稍後再試')
  } finally {
    saving.value = false
  }
}

// ── Avatar upload ──────────────────────────────────────────────
async function handleAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  avatarError.value = ''
  if (file.size > 2 * 1024 * 1024) { avatarError.value = '圖片不得超過 2MB'; return }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    avatarError.value = '僅支援 JPG、PNG、WebP 格式'
    return
  }

  avatarUploading.value = true
  try {
    const result = await uploadAvatar(file)
    currentImageUrl.value = result.imageUrl
    localStorage.setItem('imageUrl', result.imageUrl)
    window.dispatchEvent(new CustomEvent('profile-updated', {
      detail: { imageUrl: result.imageUrl }
    }))
    showToast('頭像已更新')
  } catch (err: unknown) {
    avatarError.value = err instanceof Error ? err.message : '上傳失敗'
  } finally {
    avatarUploading.value = false
    ;(e.target as HTMLInputElement).value = ''
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
.personal-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-header { margin-bottom: 4px; }
.section-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px;
}
.section-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

.info-card {
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 28px 32px;
}

.loading-state {
  color: var(--text-secondary);
  text-align: center;
  padding: 48px;
}

/* ── Avatar ── */
.avatar-card { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.avatar-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.avatar-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--accent);
  box-shadow: 0 4px 12px rgba(196, 168, 130, 0.2);
}
.avatar-upload-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  border: 1.5px solid var(--accent-dark);
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-dark);
  cursor: pointer;
  transition: all 0.2s;
}
.avatar-upload-btn:not(.disabled):hover {
  background: var(--accent-dark);
  color: #fff;
}
.avatar-upload-btn.disabled { opacity: 0.6; cursor: not-allowed; }
.avatar-upload-btn input { display: none; }
.avatar-hint { font-size: 0.78rem; color: var(--text-secondary); margin: 0; }

/* ── Form ── */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
.required { color: #c0392b; margin-left: 2px; }

.form-input {
  padding: 11px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  background: #fff;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}
.form-input:focus { border-color: var(--accent); }
.form-input.is-error { border-color: #c0392b; }
.form-input[readonly] {
  background: #f7f8f6;
  color: var(--text-secondary);
  cursor: default;
}

.locked-field {
  position: relative;
}

.locked-input {
  padding-right: 76px;
}

.lock-badge {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  padding: 3px 8px;
  border-radius: 999px;
  background: #e8f3ee;
  color: #28724f;
  font-size: 0.72rem;
  font-weight: 700;
  pointer-events: none;
}

.field-error { font-size: 0.78rem; color: #c0392b; }
.field-hint { font-size: 0.76rem; color: var(--text-secondary); }

/* ── Gender ── */
.gender-row { display: flex; gap: 10px; }
.gender-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: all 0.2s;
}
.gender-option input[type="radio"] { accent-color: var(--accent-dark); width: 15px; height: 15px; }
.gender-option.selected { border-color: var(--accent-dark); background: #fdf8f3; color: var(--text-primary); font-weight: 600; }
.gender-option.is-error { border-color: #c0392b; }

/* ── Save button ── */
.api-error {
  padding: 10px 14px;
  border-radius: var(--radius);
  background: #fdf0ee;
  border: 1px solid #e8b4ae;
  color: #c0392b;
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border: none;
  border-radius: 100px;
  background: var(--bg-dark);
  color: var(--text-light);
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}
.save-btn:hover:not(:disabled) {
  background: #2d2620;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(26, 22, 19, 0.15);
}
.save-btn:disabled { opacity: 0.65; cursor: not-allowed; }

.btn-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(245, 240, 235, 0.4);
  border-top-color: var(--text-light);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #2a2a28;
  color: #fff;
  padding: 10px 22px;
  border-radius: 6px;
  font-size: 0.88rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s, transform 0.25s;
  z-index: 999;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
</style>
