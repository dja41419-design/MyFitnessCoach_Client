<template>
  <div class="user-layout">
    <div class="container">
      <router-link to="/" class="back-home">← 回首頁</router-link>
    </div>
    <div class="container layout-inner">
      <!-- 側邊導覽欄 -->
      <aside class="user-sidebar">
        <div class="sidebar-header">
          <div class="user-avatar-large">
            <img :src="imageUrl || NO_IMAGE" alt="User Avatar" />
          </div>
          <h3 class="user-display-name">{{ username }}</h3>
        </div>

        <nav class="sidebar-menu">
          <router-link to="/personalInfo" class="menu-item" active-class="active">
            <i class="mdi mdi-account-edit"></i> 修改個人資料
          </router-link>
          <router-link to="/changepassword" class="menu-item" active-class="active">
            <i class="mdi mdi-lock-reset"></i> 修改密碼
          </router-link>
          <router-link to="/points" class="menu-item" active-class="active">
            <i class="mdi mdi-rhombus"></i> 點數查詢
          </router-link>
          <router-link to="/reserveorders" class="menu-item" active-class="active">
            <i class="mdi mdi-calendar-check"></i> 課程預約查詢
          </router-link>
          <router-link to="/coupons" class="menu-item" active-class="active">
            <i class="mdi mdi-ticket-percent"></i> 我的優惠券
          </router-link>
          <router-link to="/orders" class="menu-item" active-class="active">
            <i class="mdi mdi-clipboard-text"></i> 訂單查詢
          </router-link>
          
          <div class="menu-divider"></div>
          
          <button class="menu-item logout-item" @click="handleLogout">
            <i class="mdi mdi-logout"></i> 會員登出
          </button>
        </nav>
      </aside>

      <!-- 主要內容區域 -->
      <main class="user-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/data/login'

const router = useRouter()
const username = ref(localStorage.getItem('username') || '會員')
const NO_IMAGE = '/StaticFiles/images/NoImage.jpg'

function toAvatarSrc(url: string | null): string {
  if (!url) return NO_IMAGE
  if (url.startsWith('http') || url.startsWith('/StaticFiles') || url.startsWith('/images') || url.startsWith('/img')) return url
  return `/StaticFiles${url}`
}

const imageUrl = ref(toAvatarSrc(localStorage.getItem('imageUrl')))

function handleProfileUpdated(e: Event) {
  const detail = (e as CustomEvent<{ userName?: string; imageUrl?: string }>).detail
  if (detail.userName) username.value = detail.userName
  if (detail.imageUrl) imageUrl.value = toAvatarSrc(detail.imageUrl)
}

onMounted(() => window.addEventListener('profile-updated', handleProfileUpdated))
onUnmounted(() => window.removeEventListener('profile-updated', handleProfileUpdated))

async function handleLogout() {
  await logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.user-layout {
  min-height: 100vh;
  background: var(--bg);
  padding: 120px 0 60px;
}

.back-home {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: 20px;
  transition: color 0.2s;
}
.back-home:hover { color: var(--accent-dark); }

.layout-inner {
  display: flex; /* 改為 flex 佈局 */
  align-items: flex-start; /* 關鍵：必須設為 flex-start 讓側欄不被拉伸，sticky 才能生效 */
  gap: 40px;
}

/* 側邊欄樣式 */
.user-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  padding: 32px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  
  /* 關鍵固定屬性 */
  position: sticky;
  top: 140px; /* 捲動時距離視窗頂部的距離，與 padding-top 保持一致 */
  z-index: 10;
}

.sidebar-header {
  padding: 0 32px 24px;
  text-align: center;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 12px;
  overflow: hidden;
  border: 3px solid var(--accent);
  box-shadow: 0 4px 12px rgba(196, 168, 130, 0.2);
}

.user-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-display-name {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
}

.menu-item {
  padding: 14px 32px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.3s;
  text-decoration: none;
  border-left: 4px solid transparent;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: var(--font-body);
}

.menu-item i {
  font-size: 1.2rem;
  color: var(--text-secondary);
  transition: color 0.3s;
}

.menu-item:hover {
  background: rgba(196, 168, 130, 0.05);
  color: var(--accent-dark);
}

.menu-item.active {
  background: rgba(196, 168, 130, 0.1);
  color: var(--accent-dark);
  border-left-color: var(--accent-dark);
  font-weight: 600;
}

.menu-item.active i {
  color: var(--accent-dark);
}

.menu-divider {
  height: 1px;
  background: var(--border);
  margin: 16px 32px;
}

.logout-item {
  color: #c0392b;
}

.logout-item i {
  color: #c0392b;
}

.logout-item:hover {
  background: #fdf0ee;
  color: #c0392b;
}

/* 主要內容區域 */
.user-content {
  flex: 1;
  min-width: 0;
}

/* 響應式調整 */
@media (max-width: 992px) {
  .layout-inner {
    flex-direction: column;
    align-items: stretch;
  }
  
  .user-sidebar {
    width: 100%;
    position: static;
    margin-bottom: 20px;
  }
}
</style>
