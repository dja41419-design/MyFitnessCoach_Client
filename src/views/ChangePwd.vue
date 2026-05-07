<template>
  <AppNavbar />
  <div class="pwd-container">
    <div class="section-header">
      <h2 class="section-title">修改密碼</h2>
      <p class="section-desc">  請輸入舊密碼並設定新的帳戶密碼：</p>
    </div>

    <div class="pwd-card">
      <form class="reset-form" @submit.prevent="handleSubmit" novalidate>
        <!-- 舊密碼 -->
        <div class="form-group">
          <label for="oldPassword" class="form-label">舊密碼</label>
          <div class="pwd-input-wrap">
            <input
              id="oldPassword"
              v-model="form.oldPassword"
              :type="show.old ? 'text' : 'password'"
              class="form-input"
              :class="{ 'is-error': errors.oldPassword }"
              placeholder="請輸入舊密碼"
              autocomplete="current-password"
              maxlength="12"
            />
            <button type="button" class="pwd-toggle-btn" @click="show.old = !show.old" :aria-label="show.old ? '隱藏密碼' : '顯示密碼'">
              <svg v-if="show.old" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <span v-if="errors.oldPassword" class="form-error">{{ errors.oldPassword }}</span>
        </div>

        <!-- 新密碼 -->
        <div class="form-group">
          <label for="newPassword" class="form-label">新密碼</label>
          <div class="pwd-input-wrap">
            <input
              id="newPassword"
              v-model="form.newPassword"
              :type="show.new ? 'text' : 'password'"
              class="form-input"
              :class="{ 'is-error': errors.newPassword }"
              placeholder="請輸入新密碼（8-12 碼）"
              autocomplete="new-password"
              maxlength="12"
            />
            <button type="button" class="pwd-toggle-btn" @click="show.new = !show.new" :aria-label="show.new ? '隱藏密碼' : '顯示密碼'">
              <svg v-if="show.new" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <!-- 即時規則檢查 + 密碼強度 -->
          <div v-if="form.newPassword" class="pwd-feedback">
            <!-- 規則清單 -->
            <ul class="pwd-rules">
              <li :class="rules.minLen && rules.maxLen ? 'rule-pass' : 'rule-fail'">
                {{ rules.minLen && rules.maxLen ? '✓' : '✗' }} 長度 8-12 碼
              </li>
              <li :class="rules.hasUpper ? 'rule-pass' : 'rule-fail'">
                {{ rules.hasUpper ? '✓' : '✗' }} 包含大寫字母
              </li>
              <li :class="rules.hasNumber ? 'rule-pass' : 'rule-fail'">
                {{ rules.hasNumber ? '✓' : '✗' }} 包含數字
              </li>
              <li :class="rules.hasSymbol ? 'rule-pass' : 'rule-fail'">
                {{ rules.hasSymbol ? '✓' : '✗' }} 包含特殊字元
              </li>
              <li :class="rules.noKeyboardSeq ? 'rule-pass' : 'rule-fail'">
                {{ rules.noKeyboardSeq ? '✓' : '✗' }} 不含鍵盤連續字串
              </li>
            </ul>
            <!-- 強度條 -->
            <div class="strength-row">
              <div class="strength-bar-wrap" aria-hidden="true">
                <span class="strength-segment" :class="{ active: strength >= 1, weak: strength === 1, medium: strength === 2, strong: strength === 3 }"></span>
                <span class="strength-segment" :class="{ active: strength >= 2, medium: strength === 2, strong: strength === 3 }"></span>
                <span class="strength-segment" :class="{ active: strength >= 3, strong: strength === 3 }"></span>
              </div>
              <span class="strength-label" :class="strengthClass">{{ strengthText }}</span>
            </div>
          </div>
          <span v-if="errors.newPassword" class="form-error">{{ errors.newPassword }}</span>
        </div>

        <!-- 確認新密碼 -->
        <div class="form-group">
          <label for="confirmPassword" class="form-label">確認新密碼</label>
          <div class="pwd-input-wrap">
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="show.confirm ? 'text' : 'password'"
              class="form-input"
              :class="{ 'is-error': errors.confirmPassword }"
              placeholder="請再次輸入新密碼"
              autocomplete="new-password"
              maxlength="12"
            />
            <button type="button" class="pwd-toggle-btn" @click="show.confirm = !show.confirm" :aria-label="show.confirm ? '隱藏密碼' : '顯示密碼'">
              <svg v-if="show.confirm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <!-- 即時比對提示 -->
          <span v-if="form.confirmPassword && form.confirmPassword === form.newPassword" class="form-match">✓ 密碼相符</span>
          <span v-else-if="form.confirmPassword && form.confirmPassword !== form.newPassword" class="form-error">密碼不一致</span>
          <span v-if="errors.confirmPassword && !form.confirmPassword" class="form-error">{{ errors.confirmPassword }}</span>
        </div>

        <!-- 成功訊息 -->
        <div v-if="successMessage" class="form-success">{{ successMessage }}</div>

        <!-- 全域錯誤訊息 -->
        <div v-if="apiError" class="form-api-error">{{ apiError }}</div>

        <!-- 送出按鈕 -->
        <div class="form-actions">
          <button type="submit" class="reset-btn" :disabled="isLoading">
            <span v-if="isLoading" class="btn-spinner" aria-hidden="true"></span>
            {{ isLoading ? '變更中…' : '確認變更密碼' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { changePassword } from '@/data/changePassword'
import { usePasswordQuality } from '@/composables/usePasswordQuality'
import AppNavbar from '@/components/AppNavbar.vue'

const router = useRouter()

const form = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const errors = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const show = reactive({ old: false, new: false, confirm: false })
const apiError = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const { rules, isValid, firstFailureMessage, strength, strengthText, strengthClass } = usePasswordQuality(toRef(form, 'newPassword'))

watch(() => form.oldPassword, () => { errors.oldPassword = '' })
watch(() => form.newPassword, () => { errors.newPassword = '' })
watch(() => form.confirmPassword, () => { errors.confirmPassword = '' })

function validate(): boolean {
  errors.oldPassword = form.oldPassword ? '' : '請輸入舊密碼'
  if (!isValid.value) {
    errors.newPassword = firstFailureMessage.value
  } else if (form.newPassword === form.oldPassword) {
    errors.newPassword = '新密碼不可與舊密碼相同'
  } else {
    errors.newPassword = ''
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = '請確認新密碼'
  } else if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = '兩次輸入的密碼不一致'
  } else {
    errors.confirmPassword = ''
  }
  return !errors.oldPassword && !errors.newPassword && !errors.confirmPassword
}

async function handleSubmit() {
  apiError.value = ''
  successMessage.value = ''
  if (!validate()) return

  isLoading.value = true
  try {
    await changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword })
    successMessage.value = '密碼已成功修改，即將返回登入頁面…'
    setTimeout(() => router.push({ name: 'login' }), 3000)
  } catch (err) {
    apiError.value = err instanceof Error ? err.message : '修改失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.pwd-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.section-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.section-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
}

.pwd-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 40px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  max-width: 540px;
}

.reset-form { display: flex; flex-direction: column; gap: 24px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.pwd-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.pwd-input-wrap .form-input {
  width: 100%;
  padding-right: 44px;
}

.pwd-toggle-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  transition: color 0.2s;
}
.pwd-toggle-btn:hover { color: var(--text-primary); }
.pwd-toggle-btn svg { width: 18px; height: 18px; }

.form-input {
  padding: 12px 16px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  background: #fff;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
}
.form-input::placeholder { color: var(--text-secondary); opacity: 0.6; }
.form-input:focus { border-color: var(--accent); }
.form-input.is-error { border-color: #c0392b; }

.form-error { font-size: 0.78rem; color: #c0392b; margin-top: 4px; }
.form-match { font-size: 0.78rem; color: #27ae60; font-weight: 600; margin-top: 4px; }

.pwd-feedback { display: flex; flex-direction: column; gap: 12px; }
.pwd-rules { list-style: none; display: flex; flex-direction: column; gap: 6px; }
.pwd-rules li { font-size: 0.78rem; }
.rule-pass { color: #27ae60; font-weight: 600; }
.rule-fail { color: var(--text-secondary); }

.strength-row { display: flex; align-items: center; gap: 12px; }
.strength-bar-wrap { display: flex; gap: 6px; }
.strength-segment { width: 40px; height: 6px; border-radius: 3px; background: var(--border); transition: background 0.3s; }
.strength-segment.active.weak   { background: #c0392b; }
.strength-segment.active.medium { background: #e67e22; }
.strength-segment.active.strong { background: #27ae60; }
.strength-label { font-size: 0.78rem; font-weight: 600; }
.text-weak   { color: #c0392b; }
.text-medium { color: #e67e22; }
.text-strong { color: #27ae60; }

.form-success {
  padding: 14px 18px;
  border-radius: var(--radius);
  background: #edf7ee;
  border: 1px solid #a8d5ab;
  color: #27ae60;
  font-size: 0.9rem;
  text-align: center;
}

.form-api-error {
  padding: 14px 18px;
  border-radius: var(--radius);
  background: #fdf0ee;
  border: 1px solid #e8b4ae;
  color: #c0392b;
  font-size: 0.9rem;
  text-align: center;
}

.form-actions { margin-top: 8px; }
.reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 40px;
  border: none;
  border-radius: 100px;
  background: var(--bg-dark);
  color: var(--text-light);
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}
.reset-btn:hover:not(:disabled) {
  background: #2d2620;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(26, 22, 19, 0.15);
}
.reset-btn:disabled { opacity: 0.65; cursor: not-allowed; }

.btn-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(245, 240, 235, 0.4);
  border-top-color: var(--text-light);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>