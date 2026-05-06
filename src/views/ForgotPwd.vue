<template>
  <div class="forgot-page">
    <router-link to="/login" class="forgot-back">← 返回登入</router-link>

    <div class="forgot-form-wrap">
      <div class="forgot-card">
        <div class="forgot-logo">
          <img src="/assets/logo.png" alt="My Fitness Coach" class="forgot-logo-img" />
          <span class="forgot-logo-name">MyFitnessCoach</span>
        </div>

        <h1 class="forgot-title">忘記密碼</h1>
        <p class="forgot-subtitle">輸入您的 Email，我們將寄送重設連結</p>

        <form class="forgot-form" @submit.prevent="handleSubmit" novalidate>
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              :class="{ 'is-error': emailError }"
              placeholder="請輸入註冊時的 Email"
              autocomplete="email"
              maxlength="100"
            />
            <span v-if="emailError" class="form-error">{{ emailError }}</span>
          </div>

          <div v-if="successMessage" class="form-success">{{ successMessage }}</div>
          <div v-if="apiError" class="form-api-error">{{ apiError }}</div>

          <button type="submit" class="forgot-btn" :disabled="isLoading || countdown > 0">
            <span v-if="isLoading" class="btn-spinner" aria-hidden="true"></span>
            <span v-if="isLoading">發送中…</span>
            <span v-else-if="countdown > 0">{{ countdown }} 秒後可重新發送</span>
            <span v-else>發送重設連結</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { forgotPassword, RateLimitError } from '@/data/forgotPassword'
import { EMAIL_REGEX } from '@/utils/validators'

const COOLDOWN_KEY = 'forgotpwd_cooldown_until'

const email = ref('')
const emailError = ref('')
const apiError = ref('')
const successMessage = ref('')
const isLoading = ref(false)
const countdown = ref(0)
let intervalId: ReturnType<typeof setInterval> | null = null

function startCountdown(seconds: number) {
  countdown.value = seconds
  localStorage.setItem(COOLDOWN_KEY, String(Date.now() + seconds * 1000))
  intervalId = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(intervalId!)
      intervalId = null
      localStorage.removeItem(COOLDOWN_KEY)
    }
  }, 1000)
}

//lock button for 60 seconds after request, even if user refreshes the page
onMounted(() => {
  //頁面掛載時，從 localStorage 讀取 forgotpwd_cooldown_until 這個 key
  const stored = localStorage.getItem(COOLDOWN_KEY)
  if (stored) {
    //計算剩餘秒數
    const remaining = Math.ceil((Number(stored) - Date.now()) / 1000)
    //若剩餘 > 0：直接把 countdown.value 設為剩餘秒數，並啟動 setInterval 繼續倒數，直到歸零後清除 localStorage
    if (remaining > 0) {
      countdown.value = remaining
      intervalId = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(intervalId!)
          intervalId = null
          localStorage.removeItem(COOLDOWN_KEY)
        }
      }, 1000)
    } else {
      //直接刪除 localStorage 的殘留資料，不啟動倒數
      localStorage.removeItem(COOLDOWN_KEY)
    }
  }
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

function validate(): boolean {
  const v = email.value.trim()
  if (!v) {
    emailError.value = '請輸入 Email'
    return false
  }
  if (v.length > 100) {
    emailError.value = 'Email 長度不可超過 100 碼'
    return false
  }
  if (!EMAIL_REGEX.test(v)) {
    emailError.value = '請輸入有效的 Email 格式'
    return false
  }
  emailError.value = ''
  return true
}

async function handleSubmit() {
  apiError.value = ''
  successMessage.value = ''
  if (!validate()) return

  isLoading.value = true
  try {
    //呼叫後方api
    await forgotPassword(email.value)
    successMessage.value = '若此帳號存在，系統已將重設郵件寄出'
    startCountdown(60)
  } catch (err) {
    //
    if (err instanceof RateLimitError) {
      const secs = err.retryAfterSeconds
      apiError.value = secs
        ? `請於 ${secs} 秒後重新嘗試`
        : '系統已發送通知，請稍後再試'
      if (secs) startCountdown(secs)
    } else {
      apiError.value = err instanceof Error ? err.message : '伺服器錯誤，請稍後再試'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.forgot-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
  font-family: var(--font-body);
  padding: 0 24px 48px;
}

.forgot-back {
  align-self: flex-start;
  margin: 32px 0 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}
.forgot-back:hover { color: var(--text-primary); }

.forgot-form-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.forgot-card {
  width: 100%;
  max-width: 420px;
}

.forgot-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
  transform: translateX(-10px);
}
.forgot-logo-img {
  height: 80px;
  object-fit: contain;
}
.forgot-logo-name {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.forgot-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  margin: 0 0 8px;
}
.forgot-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 0 36px;
}

.forgot-form { display: flex; flex-direction: column; gap: 20px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

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

.form-success {
  padding: 12px 16px;
  border-radius: var(--radius);
  background: #edf7ee;
  border: 1px solid #a8d5ab;
  color: #27ae60;
  font-size: 0.85rem;
  text-align: center;
}

.form-api-error {
  padding: 12px 16px;
  border-radius: var(--radius);
  background: #fdf0ee;
  border: 1px solid #e8b4ae;
  color: #c0392b;
  font-size: 0.85rem;
  text-align: center;
}

.forgot-btn {
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
.forgot-btn:hover:not(:disabled) {
  background: #2d2620;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(26, 22, 19, 0.15);
}
.forgot-btn:disabled { opacity: 0.65; cursor: not-allowed; }

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
</style>
