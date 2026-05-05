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
        <LoginForm @success="onLoginSuccess" />

        <p class="register-hint">
          還沒有帳號？
          <router-link to="/register" class="register-link">加入會員</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import LoginForm from '@/components/LoginForm.vue'

const router = useRouter()
const route = useRoute()

function onLoginSuccess() {
  const returnUrl = route.query.returnUrl as string
  router.push(returnUrl || { name: 'home' })
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
