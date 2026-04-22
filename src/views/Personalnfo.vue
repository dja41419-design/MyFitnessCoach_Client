<template>
  <div class="info-page">
    <div class="info-card">
      <h2 class="info-title">個人資料</h2>

      <button class="logout-btn" @click="handleLogout">登出</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { logout } from '@/data/login'

const router = useRouter()

function handleLogout(): void {
  logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.info-page {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  font-family: var(--font-body);
}

.info-card {
  width: 100%;
  max-width: 480px;
  padding: 48px 40px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 24px rgba(26, 22, 19, 0.08);
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.info-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.logout-btn {
  align-self: flex-start;
  padding: 10px 28px;
  border: 1.5px solid var(--border);
  border-radius: 100px;
  background: transparent;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.logout-btn:hover {
  border-color: #c0392b;
  color: #c0392b;
  background: #fdf0ee;
}
</style>
