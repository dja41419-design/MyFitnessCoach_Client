<template>
  <div class="register-page">
    <!-- 左側圖片 -->
    <div class="register-photo" aria-hidden="true">
      <img src="/assets/loginPhoto.png" alt="" />
    </div>

    <!-- 右側表單 -->
    <div class="register-form-wrap">
      <router-link to="/" class="register-back">← 回首頁</router-link>

      <div class="register-card">
        <RegisterForm @success="onRegisterSuccess" />

        <p class="login-hint">
          已有帳號？
          <router-link :to="{ name: 'login' }" class="login-link">立即登入</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import RegisterForm from '@/components/RegisterForm.vue'

const router = useRouter()

function onRegisterSuccess() {
  setTimeout(() => router.push({ name: 'login' }), 5000)
}
</script>

<style scoped>
.register-page {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
  font-family: var(--font-body);
}

/* 左側圖片 */
.register-photo {
  flex: 1;
  overflow: hidden;
  display: none;
}
.register-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 右側表單區 */
.register-form-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  position: relative;
}

.register-back {
  position: absolute;
  top: 32px;
  left: 32px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}
.register-back:hover { color: var(--text-primary); }

.register-card {
  width: 100%;
  max-width: 420px;
}

/* Logo */
.register-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
  transform: translateX(-10px);
}
.register-logo-img {
  height: 80px;
  object-fit: contain;
}
.register-logo-name {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

/* 標題 */
.register-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  margin: 0 0 8px;
}
.register-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 0 32px;
}

/* 表單 */
.register-form { display: flex; flex-direction: column; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 密碼欄位包裝層（顯示/隱藏按鈕） */
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-wrap .form-input {
  flex: 1;
  padding-right: 44px;
}

.eye-btn {
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
.eye-btn:hover { color: var(--text-primary); }
.eye-btn svg {
  width: 18px;
  height: 18px;
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
  width: 100%;
  box-sizing: border-box;
}
.form-input::placeholder { color: var(--text-secondary); opacity: 0.6; }
.form-input:focus { border-color: var(--accent); }
.form-input.is-error { border-color: #c0392b; }

.form-error {
  font-size: 0.78rem;
  color: #c0392b;
}

.pwd-feedback {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pwd-rules {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pwd-rules li {
  font-size: 0.78rem;
  transition: color 0.2s;
}
.rule-pass { color: #27ae60; font-weight: 600; }
.rule-fail { color: var(--text-secondary); }

.strength-row {
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

.form-api-error {
  padding: 12px 16px;
  border-radius: var(--radius);
  background: #fdf0ee;
  border: 1px solid #e8b4ae;
  color: #c0392b;
  font-size: 0.85rem;
  text-align: center;
}

/* 成功訊息 */
.form-success-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  border-radius: var(--radius);
  background: #f0f9f4;
  border: 1px solid #a8d5b8;
  color: #1e6b3e;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 24px;
}
.success-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  margin-top: 1px;
  color: #1e6b3e;
}

/* 按鈕列 */
.btn-row {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.clear-btn {
  flex: 1;
  padding: 14px;
  border: 1.5px solid var(--border);
  border-radius: 100px;
  background: transparent;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.clear-btn:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.submit-btn {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
.submit-btn:hover:not(:disabled) {
  background: #2d2620;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(26, 22, 19, 0.15);
}
.submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

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

/* 登入提示 */
.login-hint {
  margin-top: 24px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.login-link {
  color: var(--accent-dark);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}
.login-link:hover { color: var(--text-primary); }

/* RWD */
@media (min-width: 768px) {
  .register-photo { display: block; }
}
</style>
