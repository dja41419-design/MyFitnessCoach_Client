<template>
  <div class="login-page">
    <!-- 左側圖片 -->
    <div class="login-photo" aria-hidden="true">
      <img src="/assets/loginPhoto.png" alt="" />
    </div>

    <!-- 右側表單 -->
    <div class="login-form-wrap">
      <router-link to="/" class="login-back">← 回首頁</router-link>

      <div class="login-card">
        <div class="login-logo">
          <img src="/assets/logo.png" alt="My Fitness Coach" class="login-logo-img" />
          <span class="login-logo-name">MyFitnessCoach</span>
        </div>

        <h1 class="login-title">會員登入</h1>
        <p class="login-subtitle">歡迎回來，繼續您的健康旅程</p>

        <form class="login-form" @submit.prevent="handleSubmit" novalidate>
          <!-- 帳號 -->
          <div class="form-group">
            <label for="account" class="form-label">帳號</label>
            <input
              id="account"
              v-model="form.account"
              type="text"
              class="form-input"
              :class="{ 'is-error': errors.account }"
              placeholder="請輸入帳號"
              autocomplete="username"
            />
            <span v-if="errors.account" class="form-error">{{ errors.account }}</span>
          </div>

          <!-- 密碼 -->
          <div class="form-group">
            <div class="form-label-row">
              <label for="password" class="form-label">密碼</label>
              <router-link :to="{name:'forgotpwd'}" class="forgot-link">忘記密碼？</router-link>
            </div>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-input"
              :class="{ 'is-error': errors.password }"
              placeholder="請輸入密碼"
              autocomplete="current-password"
            />
            <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
          </div>

          <!-- 全域錯誤訊息 -->
          <div v-if="apiError" class="form-api-error">{{ apiError }}</div>

          <!-- 登入按鈕 -->
          <button type="submit" class="login-btn" :disabled="isLoading">
            <span v-if="isLoading" class="btn-spinner" aria-hidden="true"></span>
            {{ isLoading ? '登入中…' : '會員登入' }}
          </button>
        </form>

        <!-- 分隔線 -->
        <div class="divider"><span>或</span></div>

        <!-- Google 登入 -->
        <button class="google-btn" @click="handleGoogleLogin" type="button">
          <svg class="google-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          使用 Google 帳號登入
        </button>

        <p class="register-hint">
          還沒有帳號？
          <router-link to="/register" class="register-link">加入會員</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '@/data/login'



const router = useRouter()
const route = useRoute()

const form = reactive({ account: '', password: '' })
const errors = reactive({ account: '', password: '' })
const apiError = ref('')
const isLoading = ref(false)

function validate(): boolean {
  errors.account  = form.account.trim() ? '' : '請輸入帳號'
  errors.password = form.password ? '' : '請輸入密碼'
  return !errors.account && !errors.password
}

async function handleSubmit() {
  apiError.value = ''
  if (!validate()) return

  isLoading.value = true
  try {
    const res = await login({ account: form.account.trim(), password: form.password })
    localStorage.setItem('token', res.token)
    localStorage.setItem('username', res.userName)
    localStorage.setItem('imageUrl', res.imageUrl ?? '')
    const returnUrl = route.query.returnUrl as string
    router.push(returnUrl || { name: 'home' })
  } catch (err) {
    apiError.value = err instanceof Error ? err.message : '登入失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

function handleGoogleLogin() {
  window.location.href = '/api/auth/google'
}
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
  font-family: var(--font-body);
}

/* 左側圖片 */
.login-photo {
  flex: 1;
  overflow: hidden;
  display: none;
}
.login-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 右側表單區 */
.login-form-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  position: relative;
}

.login-back {
  position: absolute;
  top: 32px;
  left: 32px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}
.login-back:hover { color: var(--text-primary); }

.login-card {
  width: 100%;
  max-width: 420px;
}

/* Logo */
.login-logo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 32px;
  transform: translate(-10px, -0px);
  
}
.login-logo-img {
  height: 80px;
  object-fit: contain;
}
.login-logo-name {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

/* 標題 */
.login-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  margin: 0 0 8px;
}
.login-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 0 36px;
}

/* 表單 */
.login-form { display: flex; flex-direction: column; gap: 20px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

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

.form-api-error {
  padding: 12px 16px;
  border-radius: var(--radius);
  background: #fdf0ee;
  border: 1px solid #e8b4ae;
  color: #c0392b;
  font-size: 0.85rem;
  text-align: center;
}

.forgot-link {
  font-size: 0.8rem;
  color: var(--accent-dark);
  text-decoration: none;
  transition: color 0.2s;
}
.forgot-link:hover { color: var(--text-primary); }

/* 登入按鈕 */
.login-btn {
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
.login-btn:hover:not(:disabled) {
  background: #2d2620;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(26, 22, 19, 0.15);
}
.login-btn:disabled { opacity: 0.65; cursor: not-allowed; }

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

/* 分隔線 */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  color: var(--text-secondary);
  font-size: 0.8rem;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

/* Google 登入按鈕 */
.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  border: 1.5px solid var(--border);
  border-radius: 100px;
  background: #fff;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}
.google-btn:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(26, 22, 19, 0.08);
}
.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* 註冊提示 */
.register-hint {
  margin-top: 24px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.register-link {
  color: var(--accent-dark);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}
.register-link:hover { color: var(--text-primary); }

/* RWD */
@media (min-width: 768px) {
  .login-photo { display: block; }
}
</style>
