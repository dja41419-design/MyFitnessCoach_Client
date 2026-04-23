<template>
  <div class="activate-page">
    <div class="activate-wrap">
      <div class="activate-card">
        <div class="activate-logo">
          <img src="/assets/logo.png" alt="My Fitness Coach" class="activate-logo-img" />
          <span class="activate-logo-name">MyFitnessCoach</span>
        </div>

        <!-- 載入中 -->
        <template v-if="status === 'loading'">
          <div class="activate-spinner" aria-label="驗證中"></div>
          <p class="activate-subtitle">驗證中，請稍候…</p>
        </template>

        <!-- 成功 -->
        <template v-else-if="status === 'success'">
          <div class="activate-icon success-icon">✓</div>
          <h1 class="activate-title">帳號啟用成功</h1>
          <p class="activate-desc">
            您的帳號已成功啟用，請
            <router-link to="/login" class="activate-link">登入</router-link>
            使用我們的服務。
          </p>
          <p class="activate-countdown">{{ countdown }} 秒後自動跳轉至登入頁面…</p>
        </template>

        <!-- 連結過期 -->
        <template v-else-if="status === 'expired'">
          <div class="activate-icon error-icon">!</div>
          <h1 class="activate-title">驗證連結已過期</h1>
          <p class="activate-desc">驗證連結已過期，請輸入您的 Email 重新取得連結。</p>

          <form class="activate-form" @submit.prevent="handleResend" novalidate>
            <div class="form-group">
              <label for="resend-email" class="form-label">Email</label>
              <input
                id="resend-email"
                v-model="resendEmail"
                type="email"
                class="form-input"
                :class="{ 'is-error': resendEmailError }"
                placeholder="請輸入註冊時的 Email"
                autocomplete="email"
              />
              <span v-if="resendEmailError" class="form-error">{{ resendEmailError }}</span>
            </div>

            <div v-if="resendSuccess" class="form-success">{{ resendSuccess }}</div>
            <div v-if="resendApiError" class="form-api-error">{{ resendApiError }}</div>

            <button type="submit" class="activate-btn" :disabled="isResending || resendCountdown > 0">
              <span v-if="isResending" class="btn-spinner" aria-hidden="true"></span>
              <span v-if="isResending">寄送中…</span>
              <span v-else-if="resendCountdown > 0">{{ resendCountdown }} 秒後可重新發送</span>
              <span v-else>重新取得連結</span>
            </button>
          </form>
        </template>

        <!-- 連結無效 / 已啟用 -->
        <template v-else-if="status === 'invalid'">
          <div class="activate-icon error-icon">✕</div>
          <h1 class="activate-title">連結無效</h1>
          <p class="activate-desc">
            連結無效或該帳號已完成驗證。若帳號未啟用，請重新註冊。
          </p>
          <router-link to="/register" class="activate-btn-link">前往註冊</router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { activateAccount, ActivationError } from '@/data/activateAccount'
import { resendActivation, ResendRateLimitError } from '@/data/resendActivation'

type Status = 'loading' | 'success' | 'expired' | 'invalid'

const route  = useRoute()
const router = useRouter()

const status   = ref<Status>('loading')
const countdown = ref(30)
const resendEmail      = ref('')
const resendEmailError = ref('')
const resendSuccess    = ref('')
const resendApiError   = ref('')
const isResending      = ref(false)
const resendCountdown  = ref(0)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

let countdownId: ReturnType<typeof setInterval> | null = null
let resendCountdownId: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  const token = (route.query.token as string) ?? ''

  if (!token) {
    router.replace({ name: 'register' })
    return
  }

  try {
    await activateAccount(token)
    status.value = 'success'
    countdownId = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownId!)
        router.push({ name: 'login' })
      }
    }, 1000)
  } catch (err) {
    if (err instanceof ActivationError) {
      status.value = err.errorCode === 'TOKEN_EXPIRED' ? 'expired' : 'invalid'
    } else {
      status.value = 'invalid'
    }
  }
})

onUnmounted(() => {
  if (countdownId) clearInterval(countdownId)
  if (resendCountdownId) clearInterval(resendCountdownId)
})

function validateResendEmail(): boolean {
  if (!resendEmail.value) {
    resendEmailError.value = '請輸入 Email'
    return false
  }
  if (!EMAIL_REGEX.test(resendEmail.value)) {
    resendEmailError.value = 'Email 格式不正確'
    return false
  }
  resendEmailError.value = ''
  return true
}

async function handleResend() {
  resendSuccess.value  = ''
  resendApiError.value = ''
  if (!validateResendEmail()) return

  isResending.value = true
  try {
    await resendActivation(resendEmail.value)
    resendSuccess.value = '若此信箱尚未完成驗證，啟用信已重新寄出，請至信箱查收。'
    startResendCountdown(60)
  } catch (err) {
    if (err instanceof ResendRateLimitError) {
      const seconds = err.retryAfterSeconds ?? 60
      startResendCountdown(seconds)
      resendApiError.value = `請求過於頻繁，請 ${seconds} 秒後再試。`
    } else {
      resendApiError.value = err instanceof Error ? err.message : '伺服器錯誤，請稍後再試'
    }
  } finally {
    isResending.value = false
  }
}

function startResendCountdown(seconds: number) {
  resendCountdown.value = seconds
  resendCountdownId = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) {
      clearInterval(resendCountdownId!)
      resendCountdownId = null
    }
  }, 1000)
}
</script>

<style scoped>
.activate-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
  font-family: var(--font-body);
  padding: 0 24px 48px;
}

.activate-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activate-card {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.activate-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
}
.activate-logo-img  { height: 80px; object-fit: contain; }
.activate-logo-name {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.activate-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

.activate-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 20px;
}
.success-icon { background: #edf7ee; color: #27ae60; }
.error-icon   { background: #fdf0ee; color: #c0392b; }

.activate-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px;
}
.activate-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 8px 0 0;
}
.activate-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 24px;
}
.activate-countdown {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-top: 8px;
}
.activate-link {
  color: var(--accent-dark);
  font-weight: 600;
  text-decoration: underline;
}

/* Form (resend) */
.activate-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
  margin-top: 8px;
}
.form-group  { display: flex; flex-direction: column; gap: 6px; }
.form-label  { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
.form-input  {
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
.form-input:focus        { border-color: var(--accent); }
.form-input.is-error     { border-color: #c0392b; }
.form-error  { font-size: 0.78rem; color: #c0392b; }
.form-success {
  padding: 12px 16px;
  border-radius: var(--radius);
  background: #edf7ee;
  border: 1px solid #a8d5ab;
  color: #27ae60;
  font-size: 0.85rem;
}
.form-api-error {
  padding: 12px 16px;
  border-radius: var(--radius);
  background: #fdf0ee;
  border: 1px solid #e8b4ae;
  color: #c0392b;
  font-size: 0.85rem;
}

.activate-btn {
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
  transition: all 0.3s;
}
.activate-btn:hover:not(:disabled) {
  background: #2d2620;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(26, 22, 19, 0.15);
}
.activate-btn:disabled { opacity: 0.65; cursor: not-allowed; }

.activate-btn-link {
  display: inline-block;
  padding: 14px 32px;
  border-radius: 100px;
  background: var(--bg-dark);
  color: var(--text-light);
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
}
.activate-btn-link:hover {
  background: #2d2620;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(26, 22, 19, 0.15);
}

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
