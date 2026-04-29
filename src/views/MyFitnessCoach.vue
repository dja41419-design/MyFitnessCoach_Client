<template>
  <!-- ========== NAVBAR ========== -->
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="container nav-inner">
      <!-- Logo：圖片路徑指向 public/assets/ -->
      <a href="#" class="nav-logo">
        <img src="/assets/logo.png" alt="Logo" class="logo-img" />
        My Fitness Coach
      </a>

      <!-- 桌面導覽連結 -->
      <div class="nav-links">
        <a href="#nutritionists" @click.prevent="scrollTo('#nutritionists')">營養師團隊</a>
        <a href="#pricing"       @click.prevent="scrollTo('#pricing')">課程方案</a>
        <RouterLink to="/bodyrecord">體態紀錄</RouterLink>
        <RouterLink to="/foodrecord">飲食紀錄</RouterLink>
        <a href="#shop"          @click.prevent="scrollTo('#shop')">健康商城</a>
      </div>

      <div class="d-flex align-items-center nav-right-group">
        <template v-if="!isLoggedIn">
          <router-link :to="{name:'register'}" class="nav-cta">立即加入</router-link>
          <router-link :to="{name:'login'}" class="nav-cta nav-cta-ghost">會員登入</router-link>
        </template>
        <template v-else>
          <div class="user-menu" @click.stop="toggleDropdown">
            <img class="user-avatar" :src="imageUrl || NO_IMAGE" :alt="username" />
            <span class="user-name">{{ username }}</span>
            <span class="dropdown-arrow" :class="{ open: isDropdownOpen }">▾</span>
            <div class="user-dropdown" v-show="isDropdownOpen" @click.stop>
              <router-link :to="{name:'info'}" class="dropdown-item">修改個人資料</router-link>
              <router-link :to="{name:'changepwd'}" class="dropdown-item">修改密碼</router-link>
              <router-link to="/points" class="dropdown-item">點數查詢</router-link>
              <router-link to="/reserveorders" class="dropdown-item">課程預約查詢</router-link>
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
    <a href="#nutritionists" @click.prevent="menuScrollTo('#nutritionists')">營養師團隊</a>
    <a href="#pricing"       @click.prevent="menuScrollTo('#pricing')">課程方案</a>
    <RouterLink to="/bodyrecord" @click="isMobileMenuOpen = false">體態紀錄</RouterLink>
    <RouterLink to="/foodrecord" @click="isMobileMenuOpen = false">飲食紀錄</RouterLink>
    <a href="#tracking"      @click.prevent="menuScrollTo('#tracking')">飲食追蹤</a>
    <a href="#shop"          @click.prevent="menuScrollTo('#shop')">健康商城</a>
    <template v-if="!isLoggedIn">
      <a href="#cta" @click.prevent="menuScrollTo('#cta')">立即加入</a>
      <router-link :to="{name:'login'}" @click="isMobileMenuOpen = false">會員登入</router-link>
    </template>
    <template v-else>
      <div class="mobile-user-info">
        <img class="user-avatar" :src="imageUrl || NO_IMAGE" :alt="username" />
        <span class="user-name">{{ username }}</span>
      </div>
      <div class="dropdown-divider"></div>
      <router-link to="/personalInfo" @click="isMobileMenuOpen = false" class="mobile-menu-item">修改個人資料</router-link>
      <a href="#" class="mobile-menu-item">帳號安全</a>
      <a href="#" class="mobile-menu-item">點數查詢</a>
      <router-link to="/reserveorders" @click="isMobileMenuOpen = false" class="mobile-menu-item">課程預約查詢</router-link>
      <router-link to="/orders" @click="isMobileMenuOpen = false" class="mobile-menu-item">訂單查詢</router-link>
      <button class="mobile-menu-item mobile-logout" @click="handleLogout">會員登出</button>
    </template>
  </div>

  <!-- ========== HERO ========== -->
  <section class="hero" id="hero">
    <!-- 背景影片：路徑指向 public/assets/ -->
    <video
      src="/assets/hero.mp4"
      class="hero-bg"
      autoplay loop muted playsinline
    ></video>
    <div class="hero-overlay"></div>

    <div class="hero-content">
      <div class="hero-badge reveal">體態管理整合平台</div>
      <h1 class="reveal rd1">吃得聰明<br /><span>活得漂亮</span></h1>
      <p class="hero-sub reveal rd2">
        結合專業營養諮詢、智慧飲食追蹤與健康食品商城，<br />
        打造屬於你的全方位體態管理方案
      </p>
      <div class="hero-actions reveal rd3">
        <a href="#nutritionists" class="btn-hero primary" @click.prevent="scrollTo('#nutritionists')">探索服務</a>
        <a href="#pricing"       class="btn-hero ghost"   @click.prevent="scrollTo('#pricing')">查看方案</a>
      </div>
    </div>
  </section>

  <!-- ========== 學員回饋（跑馬燈） ========== -->
  <section class="testimonials">
    <div class="scroll-label reveal">學員真實回饋</div>

    <!-- 渲染兩組達成 CSS 無縫循環效果 -->
    <div class="testimonial-track">
      <div
        v-for="(item, idx) in [...reviewList, ...reviewList]"
        :key="idx"
        class="testimonial-card"
      >
        <div class="testimonial-top">
          <img :src="item.avatar" :alt="item.name" class="testimonial-avatar" />
          <div class="testimonial-info">
            <h4>{{ item.name }}</h4>
            <p>{{ item.title }}</p>
          </div>
        </div>
        <div class="testimonial-stars">{{ item.stars }}</div>
        <p class="testimonial-text">{{ item.text }}</p>
      </div>
    </div>

    <div class="testimonial-more reveal">
      <RouterLink to="/AllReviews" class="btn-outline">查看所有評論</RouterLink>
    </div>
  </section>

  <!-- ========== 營養師團隊 ========== -->
  <section class="nutritionists" id="nutritionists">
    <div class="container">
      <div class="section-header">
        <div>
          <h2 class="reveal">專業營養師團隊</h2>
          <p class="reveal rd1">
            嚴選合格營養師，提供一對一線上諮詢。<br />
            自選營養師、自選時段，你的健康你做主。
          </p>
        </div>
        <div class="reveal rd2">
          <RouterLink to="/AllInstructor" class="btn-outline">顯示全部營養師</RouterLink>
          <a href="#pricing" class="btn-outline" @click.prevent="scrollTo('#pricing')">課程套組方案</a>
        </div>
      </div>

      <!-- 輪播軌道 -->
      <div class="nutri-track-wrap">
        <div class="nutri-track" ref="nutriTrackRef">
          <div
            v-for="(nutri, idx) in allInstructors"
            :key="nutri.name"
            class="nutri-card reveal"
            :class="`rd${idx}`"
          >
            <div class="nutri-img-wrap">
              <img :src="nutri.img" :alt="nutri.name" class="nutri-img" />
            </div>
            <div class="nutri-body">
              <div class="nutri-specialty">{{ nutri.specialty }}</div>
              <h3>{{ nutri.name }}</h3>
              <p>{{ nutri.bio }}</p>
              <div class="nutri-tags">
                <span v-for="tag in nutri.tags" :key="tag" class="nutri-tag">{{ tag }}</span>
              </div>
              <RouterLink :to="{ name: 'ReserveDetail', params: { id: nutri.id } }" target="_blank" class="book-link">
                馬上預約諮詢
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- 輪播前後按鈕 -->
      <div class="carousel-nav">
        <button class="carousel-btn" @click="slideNutri(-1)" aria-label="上一位">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button class="carousel-btn" @click="slideNutri(1)" aria-label="下一位">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  </section>

  <!-- ========== 課程方案 ========== -->
  <section class="pricing" id="pricing">
    <div class="container">
      <div class="pricing-header">
        <div style="text-align:center;">
          <div class="scroll-label reveal">課程套組方案</div>
          <h2 class="pricing-title reveal rd1">選擇最適合你的方案</h2>
          <p class="pricing-subtitle reveal rd2">套組結帳後自動轉換為儲值點數，預約時可彈性扣抵使用</p>
        </div>
        <RouterLink to="/lesson" class="btn-all-plans reveal rd2" aria-label="查看所有儲值方案">
          查看所有方案
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </RouterLink>
      </div>

      <div class="pricing-grid">
        <div
          v-for="(plan, idx) in plans"
          :key="plan.name"
          class="price-card reveal"
          :class="[plan.featured ? 'featured' : '', `rd${idx}`]"
        >
          <div v-if="plan.badge" class="price-badge">{{ plan.badge }}</div>
          <h3>{{ plan.name }}</h3>
          <p class="price-label">{{ plan.label }}</p>
          <div class="price-tag">{{ plan.price }} <small>/ {{ plan.unit }}</small></div>
          <p class="price-period" :style="plan.featured ? 'color:rgba(245,240,235,0.45)' : ''">{{ plan.period }}</p>
          <ul class="price-features">
            <li v-for="feat in plan.features" :key="feat">{{ feat }}</li>
          </ul>
          <a href="#" :class="`btn-price ${plan.btnStyle}`">{{ plan.btnText }}</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== 飲食追蹤 ========== -->
  <section class="tracking" id="tracking">
    <div class="container">
      <div class="tracking-inner reveal">
        <!-- 左側功能說明 -->
        <div>
          <h2>飲食 &amp; 體態紀錄</h2>
          <div v-for="item in trackingItems" :key="item.title" class="track-item">
            <div class="track-icon">{{ item.icon }}</div>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>

        <!-- 右側 Slogan + CTA -->
        <div class="tracking-right">
          <p class="slogan">「掌握數據，掌握改變的力量。」</p>
          <p class="slogan-sub">每一筆飲食紀錄，都是你邁向理想體態的一小步。啟用你的個人健康儀表板，讓數據為你說話。</p>
          <a href="#" class="btn-join">
            啟用服務，立即登入
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== CTA 橫幅 ========== -->
  <section class="cta-banner">
    <div class="container">
      <div class="cta-inner reveal">
        <img
          src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1400&h=700&fit=crop"
          alt="Healthy meal prep"
          class="cta-bg"
        />
        <div class="cta-overlay"></div>
        <div class="cta-content">
          <h2>從今天開始<br />好好吃飯</h2>
          <p>你的營養師已經準備好了。預約一次諮詢，開啟專屬於你的健康旅程。</p>
          <a href="#nutritionists" class="btn-light" @click.prevent="scrollTo('#nutritionists')">預約營養師</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== 健康商城 ========== -->
  <section class="shop" id="shop">
    <div class="container">
      <div class="section-header">
        <div>
          <h2 class="reveal">健康食品商城</h2>
          <p class="reveal rd1">官方直營、品質保證。嚴選優質健康食品，<br />讓你的飲食計畫更輕鬆執行。</p>
        </div>
        <RouterLink to="/store" target="_blank" class="btn-outline reveal rd2">查看全部商品</RouterLink>
      </div>

      <!-- 商品卡片 -->
      <div class="shop-grid">
        <div
          v-for="(product, idx) in landingProducts"
          :key="product.id"
          class="shop-card reveal"
          :class="`rd${idx}`"
        >
          <div class="shop-img-wrap">
            <span v-if="hasDiscount(product)" class="shop-card-badge">特價</span>
            <img
              :src="getProductImagePath(product.id)"
              :alt="product.name"
              class="shop-img"
            />
          </div>
          <div class="shop-body">
            <div class="shop-category">{{ product.categoryName }}</div>
            <h3>{{ product.name }}</h3>
            <div class="shop-price">
              {{ formatPrice(product.unitPrice) }}
              <span v-if="hasDiscount(product)" class="original">
                {{ formatPrice(product.originalPrice) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="shop-more reveal">
        <RouterLink to="/store" class="btn-outline">探索更多商品</RouterLink>
      </div>
    </div>
  </section>

  <!-- ========== 最終 CTA ========== -->
  <section class="final-cta reveal" id="cta">
    <h2>你的理想體態<br />從這裡開始</h2>
    <p>結合營養諮詢、飲食追蹤與健康商城，My Fitness Coach 陪你走每一步。</p>
    <router-link :to="{name:'register'}" class="btn-dark">立即加入會員</router-link>
  </section>

  <!-- ========== FOOTER ========== -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <!-- 品牌欄 -->
        <div class="footer-brand">
          <div class="footer-logo">
            <img src="/assets/logo.png" alt="Logo" class="logo-img" />
            My Fitness Coach
          </div>
          <p>全方位體態管理整合平台，結合專業營養師諮詢、智慧飲食追蹤與官方直營健康食品商城。</p>
        </div>

        <!-- 動態連結欄 -->
        <div v-for="col in footerCols" :key="col.title" class="footer-col">
          <h4>{{ col.title }}</h4>
          <a v-for="link in col.links" :key="link.label" :href="link.href">{{ link.label }}</a>
        </div>
      </div>

      <div class="footer-bottom">
        <span class="footer-copy">© 2025 My Fitness Coach. All rights reserved.</span>
        <a href="#hero" class="back-to-top" @click.prevent="scrollTo('#hero')">
          回到頂部
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="m18 15-6-6-6 6" />
          </svg>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useNavbar } from '@/composables/useNavbar'
import { useReveal } from '@/composables/useReveal'
import { useNutriCarousel } from '@/composables/useNutriCarousel'
import { useInstructors } from '@/composables/useInstructors'
import { useReviews } from '@/composables/useReviews'
import { useCart } from '@/composables/useCart'
import { plans } from '@/data/plans'
import { trackingItems } from '@/data/tracking'
import { footerCols } from '@/data/footer'
import { logout } from '@/data/login'
import { useProducts } from '@/composables/useProducts'
import { getProductImagePath, type Product } from '@/data/products'

const router = useRouter()
const { isScrolled, isMobileMenuOpen, toggleMenu, scrollTo, menuScrollTo } = useNavbar()
const { nutriTrackRef, slideNutri } = useNutriCarousel()
useReveal({ threshold: 0.08, rootMargin: '0px 0px -30px 0px' })

// // 登入狀態
// const username = ref(localStorage.getItem('username') || '')
// const isLoggedIn = ref(!!localStorage.getItem('token'))

// const NO_IMAGE = '/StaticFiles/images/NoImage.jpg'

// function toAvatarSrc(url: string): string {
//   if (!url) return NO_IMAGE
//   if (url.startsWith('http') || url.startsWith('/StaticFiles') || url.startsWith('/images')) return url
//   return `/StaticFiles${url}`
// }

// const imageUrl = ref(toAvatarSrc(localStorage.getItem('imageUrl') || ''))
// const isDropdownOpen = ref(false)

// function toggleDropdown() {
//   isDropdownOpen.value = !isDropdownOpen.value
// }

// function closeDropdown() {
//   isDropdownOpen.value = false
// }

// function handleLogout() {
//   logout()
//   localStorage.removeItem('username')
//   username.value = ''
//   imageUrl.value = toAvatarSrc('')
//   isLoggedIn.value = false
//   isDropdownOpen.value = false
// }

// onMounted(() => document.addEventListener('click', closeDropdown))
// onUnmounted(() => document.removeEventListener('click', closeDropdown))

// 登入狀態
const username = ref(localStorage.getItem('username') || '')
const isLoggedIn = ref(!!localStorage.getItem('token'))

const NO_IMAGE = '/StaticFiles/images/NoImage.jpg'

function toAvatarSrc(url: string): string {
  if (!url) return NO_IMAGE
  if (url.startsWith('http') || url.startsWith('/StaticFiles') || url.startsWith('/images')) return url
  return `/StaticFiles${url}`
}

const imageUrl = ref(toAvatarSrc(localStorage.getItem('imageUrl') || ''))
const isDropdownOpen = ref(false)

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function handleLogout() {
  logout()
  localStorage.removeItem('username')
  username.value = ''
  imageUrl.value = toAvatarSrc('')
  isLoggedIn.value = false
  isDropdownOpen.value = false
}

onMounted(() => document.addEventListener('click', closeDropdown))
onUnmounted(() => document.removeEventListener('click', closeDropdown))

const { allInstructors, loadInstructors } = useInstructors()
const { reviewList, loadReviews } = useReviews()
const { landingProducts, loadLandingProducts } = useProducts()
const { itemCount } = useCart()

onMounted(async () => {
  await Promise.all([
    loadInstructors(),
    loadReviews(),
    loadLandingProducts(4)
  ])
})

function formatPrice(n: number): string {
  return `NT$${Math.floor(n).toLocaleString()}`
}

function hasDiscount(p: Product): boolean {
  return p.originalPrice > p.unitPrice
}

// handleScroll 已由 useNavbar 處理，若無特殊用途可移除

function handleScroll() {
  isScrolled.value = window.scrollY > 40
}

</script>

<!--
  元件樣式說明：
  - 全域樣式（:root 變數、reset、body）已移至 src/styles/global.css，由 main.js 統一載入
  - 此處只保留 MyFitnessCoach 頁面專屬的元件樣式
  - 不使用 scoped：因為 Landing Page 佔整頁，不會與其他元件衝突
-->
<style>
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

.nav-right-group{
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
}

.nav-logo .logo-img { height: 60px; width: auto; object-fit: contain; }

.nav-links { display: flex; align-items: center; gap: 28px; }

.nav-links a {
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.3s;
  position: relative;
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
  font-size: 1.5rem;
  color: var(--text-primary);
}

/* ── HERO ─────────────────────────────────────── */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  z-index: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg,
    rgba(26,22,19,0.18) 0%,
    rgba(26,22,19,0.5) 50%,
    rgba(245,240,235,0.97) 93%,
    rgba(245,240,235,1) 100%);
}

.hero-content { position: relative; z-index: 2; padding: 140px 24px 100px; }

.hero-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: rgba(255,255,255,0.85);
  margin-bottom: 20px;
  border: 1px solid rgba(255,255,255,0.25);
  padding: 8px 22px;
  border-radius: 100px;
  backdrop-filter: blur(6px);
}

.hero h1 {
  font-family: var(--font-display);
  font-size: clamp(3rem, 7.5vw, 6.5rem);
  font-weight: 300;
  line-height: 1.05;
  letter-spacing: -0.03em;
  max-width: 880px;
  margin: 0 auto;
  color: #fff;
  text-shadow: 0 2px 40px rgba(0,0,0,0.15);
}

.hero h1 span { font-style: italic; font-weight: 400; }

.hero-sub {
  margin-top: 20px;
  font-size: 1.05rem;
  color: rgba(255,255,255,0.8);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
}

.hero-actions {
  margin-top: 32px;
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-hero {
  padding: 14px 32px;
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
  display: inline-block;
}

.btn-hero.primary { background: #fff; color: var(--bg-dark); }
.btn-hero.primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.btn-hero.ghost { border: 1.5px solid rgba(255,255,255,0.4); color: #fff; background: transparent; }
.btn-hero.ghost:hover { border-color: #fff; background: rgba(255,255,255,0.1); }

/* ── 捲動標籤 ─────────────────────────────────── */
.scroll-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-secondary);
  font-weight: 600;
  padding: 10px 20px;
  border: 1px solid var(--border);
  border-radius: 100px;
  display: inline-block;
}

/* ── 學員回饋（跑馬燈） ───────────────────────── */
.testimonials { padding: 80px 0; overflow: hidden; }

.testimonials .scroll-label {
  display: block;
  text-align: center;
  margin-bottom: 40px;
}

.testimonial-track {
  display: flex;
  gap: 24px;
  animation: scroll-left 45s linear infinite;
  width: max-content;
}

.testimonial-track:hover { animation-play-state: paused; }

.testimonial-card {
  flex: 0 0 380px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(212,204,194,0.5);
  transition: transform 0.3s, box-shadow 0.3s;
}

.testimonial-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(26,22,19,0.06); }

.testimonial-top { display: flex; align-items: center; gap: 14px; }

.testimonial-avatar {
  width: 50px; height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
}

.testimonial-info h4 { font-size: 0.9rem; font-weight: 600; }
.testimonial-info p  { font-size: 0.76rem; color: var(--text-secondary); }
.testimonial-stars   { color: var(--accent-dark); font-size: 0.82rem; letter-spacing: 2px; }
.testimonial-text    { font-size: 0.92rem; line-height: 1.65; color: var(--text-primary); flex: 1; }

@keyframes scroll-left {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.testimonial-more { text-align: center; margin-top: 40px; }

/* ── 營養師 ───────────────────────────────────── */
.nutritionists { padding: 100px 0; }

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 48px;
  flex-wrap: wrap;
  gap: 20px;
}

.section-header h2 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  line-height: 1.15;
}

.section-header p {
  font-size: 0.92rem;
  color: var(--text-secondary);
  max-width: 420px;
  margin-top: 10px;
}

.btn-outline {
  padding: 10px 24px;
  border-radius: 100px;
  border: 1.5px solid var(--border);
  font-size: 0.85rem;
  font-weight: 600;
  background: transparent;
  color: var(--text-primary);
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-outline:hover { background: var(--bg-dark); color: var(--text-light); border-color: var(--bg-dark); }

.nutri-track-wrap { overflow: hidden; position: relative; }

.nutri-track {
  display: flex;
  gap: 20px;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.nutri-card {
  flex: 0 0 calc(33.333% - 14px);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid rgba(212,204,194,0.5);
  transition: transform 0.4s, box-shadow 0.4s;
}

.nutri-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(26,22,19,0.08); }

.nutri-img-wrap { overflow: hidden; height: 300px; position: relative; }

.nutri-img { width: 100%; height: 100%; object-fit: cover; object-position: top; transition: transform 0.6s; }
.nutri-card:hover .nutri-img { transform: scale(1.04); }

.nutri-body { padding: 28px; }

.nutri-specialty {
  font-size: 0.76rem;
  color: var(--accent-dark);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.nutri-body h3 { font-family: var(--font-display); font-size: 1.45rem; font-weight: 500; margin-bottom: 8px; }
.nutri-body > p { font-size: 0.86rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px; }

.nutri-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }

.nutri-tag {
  background: var(--tag-bg);
  padding: 5px 14px;
  border-radius: 100px;
  font-size: 0.74rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.book-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
  transition: gap 0.3s, color 0.3s;
  border-bottom: 1.5px solid var(--text-primary);
  padding-bottom: 2px;
}

.book-link:hover { gap: 12px; color: var(--accent-dark); border-color: var(--accent-dark); }

.carousel-nav { display: flex; gap: 10px; justify-content: center; margin-top: 36px; }

.carousel-btn {
  width: 48px; height: 48px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-primary);
}

.carousel-btn:hover { background: var(--bg-dark); color: var(--text-light); border-color: var(--bg-dark); }

/* ── 課程方案 ─────────────────────────────────── */
.pricing { padding: 100px 0; }

.pricing-header {
  position: relative;
  margin-bottom: 48px;
}

.btn-all-plans {
  position: absolute;
  top: 0;
  right: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 100px;
  font-size: 0.82rem;
  font-weight: 600;
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
  background: transparent;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-all-plans:hover {
  background: var(--bg-dark);
  color: var(--text-light);
  border-color: var(--bg-dark);
  gap: 10px;
}

/* inline style 替代：統一在 class 管理 */
.pricing-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  margin-top: 18px;
}

.pricing-subtitle {
  font-size: 0.92rem;
  color: var(--text-secondary);
  margin-top: 12px;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 48px;
}

.price-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 40px 32px;
  border: 1px solid rgba(212,204,194,0.5);
  transition: transform 0.4s, box-shadow 0.4s;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.price-card.featured { background: var(--bg-dark); color: var(--text-light); border-color: transparent; }
.price-card.featured .price-label,
.price-card.featured .price-features li { color: rgba(245,240,235,0.65); }
.price-card.featured .price-tag { color: var(--text-light); }
.price-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(26,22,19,0.08); }

.price-badge {
  position: absolute;
  top: 20px; right: 20px;
  background: var(--accent);
  color: var(--bg-dark);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 5px 12px;
  border-radius: 100px;
}

.price-card h3 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 500; margin-bottom: 8px; }
.price-label   { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 20px; }

.price-tag {
  font-family: var(--font-display);
  font-size: 2.8rem;
  font-weight: 600;
  margin-bottom: 4px;
  line-height: 1;
}

.price-tag small { font-size: 1rem; font-weight: 400; opacity: 0.6; }
.price-period    { font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 24px; }

.price-features { list-style: none; margin-bottom: 32px; flex: 1; }

.price-features li {
  font-size: 0.86rem;
  color: var(--text-secondary);
  padding: 8px 0;
  border-bottom: 1px solid rgba(212,204,194,0.3);
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-features li::before { content: '✓'; color: var(--accent-dark); font-weight: 700; font-size: 0.85rem; }
.price-card.featured .price-features li { border-color: rgba(245,240,235,0.1); }
.price-card.featured .price-features li::before { color: var(--accent); }

.btn-price {
  display: block;
  text-align: center;
  padding: 14px;
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-price.light { background: var(--bg-dark); color: var(--text-light); }
.btn-price.light:hover { background: #2d2620; }
.btn-price.accent { background: var(--accent); color: var(--bg-dark); }
.btn-price.accent:hover { background: #d4b892; }

/* ── 飲食追蹤 ─────────────────────────────────── */
.tracking { padding: 100px 0; }

.tracking-inner {
  background: var(--bg-dark);
  border-radius: 32px;
  padding: 80px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  color: var(--text-light);
  position: relative;
  overflow: hidden;
}

.tracking-inner::before {
  content: '';
  position: absolute;
  top: -100px; right: -100px;
  width: 400px; height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(196,168,130,0.12) 0%, transparent 70%);
}

.tracking h2 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 3.5vw, 2.8rem);
  font-weight: 400;
  line-height: 1.2;
  margin-bottom: 36px;
}

.track-item { margin-bottom: 24px; display: flex; align-items: flex-start; gap: 16px; }

.track-icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  flex-shrink: 0;
  background: rgba(196,168,130,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.track-item h3 { font-family: var(--font-display); font-size: 1.3rem; font-weight: 500; margin-bottom: 4px; }
.track-item p  { font-size: 0.86rem; color: rgba(245,240,235,0.55); line-height: 1.55; }

.tracking-right { position: relative; z-index: 1; }

.tracking-right .slogan {
  font-family: var(--font-display);
  font-size: 1.55rem;
  font-style: italic;
  font-weight: 400;
  line-height: 1.5;
  color: rgba(245,240,235,0.85);
  margin-bottom: 12px;
}

.tracking-right .slogan-sub {
  font-size: 0.92rem;
  color: rgba(245,240,235,0.45);
  margin-bottom: 32px;
  line-height: 1.65;
}

.btn-join {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--accent);
  color: var(--bg-dark);
  padding: 14px 32px;
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 700;
  transition: all 0.3s;
}

.btn-join:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(196,168,130,0.3); }

/* ── CTA 橫幅 ─────────────────────────────────── */
.cta-banner { padding: 80px 0; }

.cta-inner {
  position: relative;
  border-radius: 32px;
  overflow: hidden;
  min-height: 480px;
  display: flex;
  align-items: center;
}

.cta-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }

.cta-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(26,22,19,0.72) 0%, rgba(26,22,19,0.3) 100%);
  z-index: 1;
}

.cta-content {
  position: relative;
  z-index: 2;
  padding: 60px 80px;
  color: var(--text-light);
  max-width: 600px;
}

.cta-content h2 {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  font-weight: 400;
  line-height: 1.1;
  margin-bottom: 16px;
}

.cta-content p { font-size: 1rem; color: rgba(245,240,235,0.8); margin-bottom: 28px; line-height: 1.6; }

.btn-light {
  display: inline-block;
  padding: 14px 32px;
  border-radius: 100px;
  background: var(--text-light);
  color: var(--bg-dark);
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-light:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }

/* ── 商城 ─────────────────────────────────────── */
.shop { padding: 100px 0; }

.shop-tabs { display: flex; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; }

.shop-tab {
  padding: 8px 20px;
  border-radius: 100px;
  font-size: 0.82rem;
  font-weight: 600;
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.shop-tab.active { background: var(--bg-dark); color: var(--text-light); border-color: var(--bg-dark); }
.shop-tab:hover:not(.active) { border-color: var(--text-secondary); }

.shop-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

.shop-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid rgba(212,204,194,0.5);
  transition: transform 0.4s, box-shadow 0.4s;
  cursor: pointer;
}

.shop-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(26,22,19,0.06); }

.shop-img-wrap { overflow: hidden; height: 200px; position: relative; }

.shop-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; }
.shop-card:hover .shop-img { transform: scale(1.04); }

.shop-card-badge {
  position: absolute;
  top: 12px; left: 12px;
  z-index: 2;
  background: var(--bg-dark);
  color: var(--text-light);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 100px;
}

.shop-body { padding: 20px; }

.shop-category {
  font-size: 0.72rem;
  color: var(--accent-dark);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.shop-body h3 { font-size: 0.95rem; font-weight: 600; margin-bottom: 6px; line-height: 1.3; }

.shop-price { font-family: var(--font-display); font-size: 1.2rem; font-weight: 600; color: var(--text-primary); }

.shop-price .original {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-decoration: line-through;
  margin-left: 8px;
  font-weight: 400;
}

.shop-more { text-align: center; margin-top: 40px; }

/* ── 最終 CTA ─────────────────────────────────── */
.final-cta {
  text-align: center;
  padding: 120px 24px;
  background: linear-gradient(180deg, var(--bg) 0%, rgba(234,228,220,0.6) 100%);
}

.final-cta h2 {
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 5vw, 3.8rem);
  font-weight: 400;
  line-height: 1.1;
  max-width: 650px;
  margin: 0 auto 16px;
}

.final-cta p { font-size: 1rem; color: var(--text-secondary); margin-bottom: 32px; }

.btn-dark {
  display: inline-block;
  padding: 14px 36px;
  border-radius: 100px;
  background: var(--bg-dark);
  color: var(--text-light);
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-dark:hover { background: #2d2620; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,22,19,0.15); }

/* ── FOOTER ───────────────────────────────────── */
.footer {
  background: var(--bg-dark);
  color: var(--text-light);
  border-radius: 32px 32px 0 0;
  padding: 80px 0 32px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 60px;
}

.footer-brand .footer-logo {
  font-family: var(--font-display);
  font-size: 1.55rem;
  font-weight: 600;
  margin-bottom: 14px;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.footer-brand .footer-logo .logo-img { height: 54px; width: auto; object-fit: contain; }
.footer-brand p { font-size: 0.86rem; color: rgba(245,240,235,0.5); max-width: 280px; line-height: 1.6; }

.footer-col h4 {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(245,240,235,0.35);
  margin-bottom: 20px;
  font-weight: 600;
}

.footer-col a { display: block; font-size: 0.86rem; color: rgba(245,240,235,0.6); margin-bottom: 12px; transition: color 0.3s; }
.footer-col a:hover { color: var(--text-light); }

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 32px;
  border-top: 1px solid rgba(245,240,235,0.08);
}

.footer-copy { font-size: 0.82rem; color: rgba(245,240,235,0.3); }

.back-to-top {
  font-size: 0.82rem;
  color: rgba(245,240,235,0.45);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.3s;
}

.back-to-top:hover { color: var(--text-light); }

/* ── 進場動畫 ─────────────────────────────────── */
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.reveal.visible { opacity: 1; transform: translateY(0); }

.rd1 { transition-delay: 0.1s; }
.rd2 { transition-delay: 0.2s; }
.rd3 { transition-delay: 0.3s; }
.rd4 { transition-delay: 0.4s; }

/* ── 領獎台 (Kahoot 樣式) ───────────────────────── */
.podium-container {
  margin-top: 60px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  min-height: 480px;
  padding-bottom: 20px;
}

.podium {
  display: flex;
  align-items: flex-end;
  gap: 15px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.podium-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 排序：2, 1, 3 */
.rank-2 { order: 1; }
.rank-1 { order: 2; z-index: 2; }
.rank-3 { order: 3; }

.podium-card {
  width: 100%;
  max-width: 240px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px 15px;
  margin-bottom: 12px;
  box-shadow: 0 10px 30px rgba(26, 22, 19, 0.08);
  text-align: center;
  border: 1px solid rgba(212, 204, 194, 0.4);
  transition: transform 0.3s ease;
}

.podium-item:hover .podium-card {
  transform: translateY(-8px);
}

.podium-img-wrap {
  width: 90px;
  height: 90px;
  margin: 0 auto 16px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  position: relative;
}

.rank-1 .podium-img-wrap {
  width: 120px;
  height: 120px;
  border-color: var(--accent);
}

.podium-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.crown {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%) rotate(-10deg);
  font-size: 2rem;
  z-index: 3;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.podium-info h3 {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.podium-specialty {
  font-size: 0.78rem;
  color: var(--accent-dark);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.podium-base {
  width: 100%;
  border-radius: 12px 12px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.4s ease;
}

.podium-base::after {
  content: attr(data-rank);
  font-family: var(--font-display);
  font-size: 3.5rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.6);
}

.base-1 { 
  height: 200px; 
  background: linear-gradient(180deg, var(--accent) 0%, var(--accent-dark) 100%); 
  box-shadow: 0 10px 25px rgba(196, 168, 130, 0.3);
}
.base-2 { 
  height: 140px; 
  background: linear-gradient(180deg, #bdc3c7 0%, #7f8c8d 100%); 
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}
.base-3 { 
  height: 100px; 
  background: linear-gradient(180deg, #d35400 0%, #a04000 100%); 
  box-shadow: 0 10px 15px rgba(211, 84, 0, 0.2);
}

/* 響應式調整 */
@media (max-width: 768px) {
  .podium-container { min-height: 400px; padding: 0 10px; }
  .podium { gap: 8px; }
  .podium-card { padding: 15px 8px; }
  .podium-img-wrap { width: 60px; height: 60px; }
  .rank-1 .podium-img-wrap { width: 80px; height: 80px; }
  .podium-info h3 { font-size: 0.95rem; }
  .podium-specialty { font-size: 0.65rem; }
  .podium-base::after { font-size: 2.2rem; }
  .base-1 { height: 140px; }
  .base-2 { height: 100px; }
  .base-3 { height: 70px; }
  .crown { font-size: 1.4rem; top: -10px; }
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

.mobile-menu.open { display: flex; transform: translateY(0); }

.mobile-menu a {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 400;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
  display: block;
}

/* ── Responsive ───────────────────────────────── */
@media (max-width: 1024px) {
  .nutri-card { flex: 0 0 calc(50% - 10px); }
  .pricing-grid { grid-template-columns: 1fr; max-width: 420px; margin-left: auto; margin-right: auto; }
  .tracking-inner { grid-template-columns: 1fr; padding: 60px 40px; }
  .shop-grid { grid-template-columns: repeat(2, 1fr); }
  .footer-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 768px) {
  .nav-links { display: none; }
  .mobile-toggle { display: block; }
  .nutri-card { flex: 0 0 85vw; }
  .section-header { flex-direction: column; align-items: flex-start; }
  .shop-grid { grid-template-columns: 1fr; }
  .cta-content { padding: 40px 28px; }
  .footer-grid { grid-template-columns: 1fr; gap: 28px; }
  .footer-bottom { flex-direction: column; gap: 14px; text-align: center; }
  .tracking-inner { padding: 48px 24px; }
}
</style>
