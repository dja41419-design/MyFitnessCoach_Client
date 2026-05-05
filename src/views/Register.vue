<template>
  <div class="register-page">
    <div class="register-photo" aria-hidden="true">
      <img src="/assets/loginPhoto.png" alt="" />
    </div>

    <div class="register-form-wrap">
      <router-link to="/" class="register-back">回首頁</router-link>

      <div class="register-card">
        <RegisterForm @success="onRegisterSuccess" />

        <p class="login-hint">
          已經有帳號？
          <router-link :to="{ name: 'login' }" class="login-link">前往登入</router-link>
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
  window.setTimeout(() => {
    router.push({ name: 'login' })
  }, 5000)
}
</script>

<style scoped>
.register-page {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
  font-family: var(--font-body);
}

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

.register-back:hover {
  color: var(--text-primary);
}

.register-card {
  width: 100%;
  max-width: 420px;
}

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

.login-link:hover {
  color: var(--text-primary);
}

@media (min-width: 768px) {
  .register-photo {
    display: block;
    position: sticky;
    top: 0;
    align-self: flex-start;
    height: 100vh;
  }
}
</style>
