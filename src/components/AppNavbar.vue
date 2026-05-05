<template>
  <!-- ========== NAVBAR ========== -->
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="container nav-inner">
      <!-- Logo -->
      <RouterLink to="/" class="nav-logo">
        <img src="/assets/logo.png" alt="Logo" class="logo-img" />
        My Fitness Coach
      </RouterLink>

      <!-- 桌面導覽連結(全部改為 RouterLink) -->
      <div class="nav-links">
        <RouterLink to="/AllInstructor">營養師團隊</RouterLink>
        <RouterLink to="/lesson">課程方案</RouterLink>
        <RouterLink to="/health-tracker/reports">健康追蹤</RouterLink>
        <RouterLink to="/store">健康商城</RouterLink>
      </div>

      <div class="nav-right-group">
        <template v-if="!isLoggedIn">
          <router-link :to="{ name: 'register' }" class="nav-cta">立即加入</router-link>
          <router-link :to="{ name: 'login' }" class="nav-cta nav-cta-ghost">會員登入</router-link>
        </template>
        <template v-else>
          <div class="user-menu" @click.stop="toggleDropdown">
            <img class="user-avatar" :src="imageUrl || NO_IMAGE" :alt="username" />
            <span class="user-name">{{ username }}</span>
            <span class="dropdown-arrow" :class="{ open: isDropdownOpen }">▾</span>
            <div class="user-dropdown" v-show="isDropdownOpen" @click.stop>
              <router-link :to="{ name: 'info' }" class="dropdown-item">修改個人資料</router-link>
              <router-link :to="{ name: 'changepwd' }" class="dropdown-item">修改密碼</router-link>
              <a href="#" class="dropdown-item">點數查詢</a>
              <router-link to="/reserveorders" class="dropdown-item">課程預約查詢</router-link>
              <router-link to="/coupons" class="dropdown-item">我的優惠券</router-link>
              <router-link to="/orders" class="dropdown-item">訂單查詢</router-link>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item dropdown-logout" @click="handleLogout">會員登出</button>
            </div>
          </div>
        </template>

        <!-- 購物車入口(訪客也可見,固定放在最右) -->
        <RouterLink to="/cart" class="nav-cart-link" aria-label="前往購物車">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span v-if="itemCount > 0" class="nav-cart-badge">{{ itemCount }}</span>
        </RouterLink>

        <!-- 手機漢堡按鈕 -->
        <button class="mobile-toggle" @click="toggleMenu" aria-label="Menu">☰</button>
      </div>
    </div>
  </nav>

  <!-- ========== 手機選單 ========== -->
  <div class="mobile-menu" :class="{ open: isMobileMenuOpen }">
    <RouterLink to="/AllInstructor" @click="closeMobileMenu">營養師團隊</RouterLink>
    <RouterLink to="/lesson" @click="closeMobileMenu">課程方案</RouterLink>
    <RouterLink to="/health-tracker/reports" @click="closeMobileMenu">健康追蹤</RouterLink>
    <RouterLink to="/store" @click="closeMobileMenu">健康商城</RouterLink>
    <template v-if="!isLoggedIn">
      <router-link :to="{ name: 'register' }" @click="closeMobileMenu">立即加入</router-link>
      <router-link :to="{ name: 'login' }" @click="closeMobileMenu">會員登入</router-link>
    </template>
    <template v-else>
      <div class="mobile-user-info">
        <img class="user-avatar" :src="imageUrl || NO_IMAGE" :alt="username" />
        <span class="user-name">{{ username }}</span>
      </div>
      <div class="dropdown-divider"></div>
      <router-link :to="{ name: 'info' }" @click="closeMobileMenu" class="mobile-menu-item">修改個人資料</router-link>
      <a href="#" class="mobile-menu-item">帳號安全</a>
      <a href="#" class="mobile-menu-item">點數查詢</a>
      <router-link to="/reserveorders" @click="closeMobileMenu" class="mobile-menu-item">課程預約查詢</router-link>
      <router-link to="/coupons" @click="closeMobileMenu" class="mobile-menu-item">我的優惠券</router-link>
      <router-link to="/orders" @click="closeMobileMenu" class="mobile-menu-item">訂單查詢</router-link>
      <button class="mobile-menu-item mobile-logout" @click="handleLogout">會員登出</button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useNavbar } from '@/composables/useNavbar'
import { useCart } from '@/composables/useCart'
import { logout } from '@/data/login'

const route = useRoute()
const router = useRouter()
const { isScrolled, isMobileMenuOpen, toggleMenu } = useNavbar()
const { itemCount } = useCart()

// 登入狀態(從 localStorage 讀取,與 MyFitnessCoach.vue 一致)
const NO_IMAGE = '/StaticFiles/images/NoImage.jpg'

function toAvatarSrc(url: string): string {
  if (!url) return NO_IMAGE
  if (url.startsWith('http') || url.startsWith('/StaticFiles') || url.startsWith('/images')) return url
  return `/StaticFiles${url}`
}

const username = ref(localStorage.getItem('username') || '')
const isLoggedIn = ref(!!localStorage.getItem('token'))
const imageUrl = ref(toAvatarSrc(localStorage.getItem('imageUrl') || ''))
const isDropdownOpen = ref(false)

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

function handleLogout() {
  logout()
  localStorage.removeItem('username')
  username.value = ''
  imageUrl.value = toAvatarSrc('')
  isLoggedIn.value = false
  isDropdownOpen.value = false
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''

  // 若當前路由需登入,登出後踢回登入頁
  if (route.meta.requiresAuth) {
    router.push({ name: 'login' })
  }
}

onMounted(() => document.addEventListener('click', closeDropdown))
onUnmounted(() => document.removeEventListener('click', closeDropdown))
</script>

<style scoped>
/* 共用 container(與 MyFitnessCoach.vue 同寬) */
.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── NAVBAR ──────────────────────────────────── */
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  padding: 16px 0;
  background: rgba(245, 240, 235, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(212, 204, 194, 0.4);
  transition: var(--transition);
}

.navbar.scrolled {
  padding: 10px 0;
  box-shadow: 0 2px 30px rgba(26, 22, 19, 0.06);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-right-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-right-group .nav-cta {
  margin-right: 0;
}

/* ── 購物車入口(navbar 內嵌版) ─────────────── */
.nav-cart-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  color: var(--text-primary);
  background: transparent;
  transition: all 0.3s;
  flex-shrink: 0;
  text-decoration: none;
}

.nav-cart-link:hover {
  border-color: var(--text-primary);
  background: rgba(26, 22, 19, 0.06);
}

.nav-cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--bg-dark);
  color: var(--text-light);
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.nav-logo {
  font-family: var(--font-display);
  font-size: 1.55rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-primary);
  text-decoration: none;
}

.nav-logo .logo-img {
  height: 60px;
  width: auto;
  object-fit: contain;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav-links a {
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.3s;
  position: relative;
  text-decoration: none;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -4px; left: 0;
  width: 0; height: 1.5px;
  background: var(--text-primary);
  transition: width 0.3s;
}

.nav-links a:hover { color: var(--text-primary); }
.nav-links a:hover::after { width: 100%; }

.nav-cta {
  background: var(--bg-dark);
  color: var(--text-light);
  padding: 10px 24px;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s;
  display: inline-block;
  text-decoration: none;
}

.nav-cta:hover {
  background: #2d2620;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(26, 22, 19, 0.15);
}

.nav-cta.nav-cta-ghost {
  background: transparent;
  color: var(--text-primary);
  border: 1.5px solid var(--text-primary);
  box-shadow: none;
}

.nav-cta.nav-cta-ghost:hover {
  background: rgba(26, 22, 19, 0.06);
  transform: translateY(-1px);
  box-shadow: none;
}

/* ── USER MENU ──────────────────────────────── */
.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 100px;
  transition: background 0.2s;
  user-select: none;
}

.user-menu:hover { background: rgba(26, 22, 19, 0.06); }

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1.5px solid var(--border);
}

.user-name {
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-primary);
}

.dropdown-arrow {
  font-size: 0.75rem;
  color: var(--text-secondary);
  transition: transform 0.2s;
  line-height: 1;
}

.dropdown-arrow.open { transform: rotate(180deg); }

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 8px 32px rgba(26, 22, 19, 0.12);
  overflow: hidden;
  z-index: 200;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 11px 16px;
  font-size: 0.88rem;
  color: var(--text-primary);
  text-decoration: none;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
  font-family: var(--font-body);
}

.dropdown-item:hover { background: var(--bg-card); }

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}

.dropdown-logout { color: #c0392b; }
.dropdown-logout:hover { background: #fdf0ee; }

/* ── MOBILE MENU USER ITEMS ─────────────────── */
.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0 8px;
}

.mobile-logout {
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  font-family: var(--font-body);
  cursor: pointer;
  color: #c0392b;
}

.mobile-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-primary);
  cursor: pointer;
}

/* ── 手機選單 ─────────────────────────────────── */
.mobile-menu {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 999;
  background: var(--bg);
  padding: 100px 32px 32px;
  flex-direction: column;
  transform: translateY(-100%);
  transition: transform 0.5s cubic-bezier(0.77, 0, 0.175, 1);
}

.mobile-menu.open {
  display: flex;
  transform: translateY(0);
}

.mobile-menu a {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 400;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
  display: block;
  color: var(--text-primary);
  text-decoration: none;
}

/* ── Responsive ───────────────────────────────── */
@media (max-width: 768px) {
  .nav-links { display: none; }
  .mobile-toggle { display: block; }
}
</style>
