<template>
  <div class="reset-page">
    <!-- 左側圖片 -->
    <div class="reset-photo" aria-hidden="true">
      <img src="/assets/loginPhoto.png" alt="" />
    </div>

    <!-- 右側表單 -->
    <div class="reset-form-wrap">
      <router-link to="/" class="reset-back">← 回首頁</router-link>

      <div class="reset-card">
        <div class="reset-logo">
          <img src="/assets/logo.png" alt="My Fitness Coach" class="reset-logo-img" />
          <span class="reset-logo-name">MyFitnessCoach</span>
        </div>

        <h1 class="reset-title">修改密碼</h1>
        <p class="reset-subtitle">請輸入舊密碼並設定新的帳戶密碼</p>

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
                placeholder="請輸入新密碼（至少 8 個字元）"
                autocomplete="new-password"
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
            <!-- 密碼強度 -->
            <div v-if="form.newPassword" class="strength-wrap">
              <div class="strength-bar-wrap" aria-hidden="true">
                <span class="strength-segment" :class="{ active: strength >= 1, weak: strength === 1, medium: strength === 2, strong: strength === 3 }"></span>
                <span class="strength-segment" :class="{ active: strength >= 2, medium: strength === 2, strong: strength === 3 }"></span>
                <span class="strength-segment" :class="{ active: strength >= 3, strong: strength === 3 }"></span>
              </div>
              <span class="strength-label" :class="strengthClass">密碼強度：{{ strengthText }}</span>
            </div>
            <p class="pwd-hint">至少要有 8 個字元。請勿使用與其他網站帳戶相同的密碼，或是任何容易破解的密碼（例如寵物的名字）。</p>
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
            <span v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</span>
          </div>

          <!-- 成功訊息 -->
          <div v-if="successMessage" class="form-success">{{ successMessage }}</div>

          <!-- 全域錯誤訊息 -->
          <div v-if="apiError" class="form-api-error">{{ apiError }}</div>

          <!-- 送出按鈕 -->
          <button type="submit" class="reset-btn" :disabled="isLoading">
            <span v-if="isLoading" class="btn-spinner" aria-hidden="true"></span>
            {{ isLoading ? '變更中…' : '變更密碼' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { resetPassword } from '@/data/resetPassword'

const router = useRouter()

const form = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const errors = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const show = reactive({ old: false, new: false, confirm: false })
const apiError = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const strength = computed((): number => {
  const p = form.newPassword
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) score++
  return Math.max(1, score) as 1 | 2 | 3
})

const strengthText = computed(() => ['', '弱', '中等', '強'][strength.value])
const strengthClass = computed(() => ['', 'text-weak', 'text-medium', 'text-strong'][strength.value])

function validate(): boolean {
  errors.oldPassword = form.oldPassword ? '' : '請輸入舊密碼'
  if (!form.newPassword) {
    errors.newPassword = '請輸入新密碼'
  } else if (form.newPassword.length < 8) {
    errors.newPassword = '密碼至少需要 8 個字元'
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
    await resetPassword({ oldPassword: form.oldPassword, newPassword: form.newPassword })
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
.reset-page {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
  font-family: var(--font-body);
}

/* 左側圖片 */
.reset-photo {
  flex: 1;
  overflow: hidden;
  display: none;
}
.reset-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 右側表單區 */
.reset-form-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  position: relative;
}

.reset-back {
  position: absolute;
  top: 32px;
  left: 32px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}
.reset-back:hover { color: var(--text-primary); }

.reset-card {
  width: 100%;
  max-width: 420px;
}

/* Logo */
.reset-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
  transform: translateX(-10px);
}
.reset-logo-img {
  height: 80px;
  object-fit: contain;
}
.reset-logo-name {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

/* 標題 */
.reset-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  margin: 0 0 8px;
}
.reset-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 0 36px;
}

/* 表單 */
.reset-form { display: flex; flex-direction: column; gap: 20px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 密碼輸入框容器（眼睛按鈕） */
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
.pwd-toggle-btn svg {
  width: 18px;
  height: 18px;
}

/* 表單輸入框 */
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

.form-error {
  font-size: 0.78rem;
  color: #c0392b;
}

/* 密碼提示文字 */
.pwd-hint {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 密碼強度 */
.strength-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.strength-bar-wrap {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.strength-segment {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--border);
  transition: background 0.3s;
}
.strength-segment.active.weak   { background: #c0392b; }
.strength-segment.active.medium { background: #e67e22; }
.strength-segment.active.strong { background: #27ae60; }

.strength-label {
  font-size: 0.78rem;
  font-weight: 600;
}
.text-weak   { color: #c0392b; }
.text-medium { color: #e67e22; }
.text-strong { color: #27ae60; }

/* 成功訊息 */
.form-success {
  padding: 12px 16px;
  border-radius: var(--radius);
  background: #edf7ee;
  border: 1px solid #a8d5ab;
  color: #27ae60;
  font-size: 0.85rem;
  text-align: center;
}

/* 全域錯誤訊息 */
.form-api-error {
  padding: 12px 16px;
  border-radius: var(--radius);
  background: #fdf0ee;
  border: 1px solid #e8b4ae;
  color: #c0392b;
  font-size: 0.85rem;
  text-align: center;
}

/* 送出按鈕 */
.reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 100px;
  background: var(--bg-dark);
  color: var(--text-light);
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
  transition: all 0.3s;
}
.reset-btn:hover:not(:disabled) {
  background: #2d2620;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(26, 22, 19, 0.15);
}
.reset-btn:disabled { opacity: 0.65; cursor: not-allowed; }

/* Loading spinner */
.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(245, 240, 235, 0.4);
  border-top-color: var(--text-light);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* RWD */
@media (min-width: 768px) {
  .reset-photo { display: block; }
}
</style>
