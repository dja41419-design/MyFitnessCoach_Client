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
        <a href="#tracking"      @click.prevent="scrollTo('#tracking')">飲食追蹤</a>
        <a href="#shop"          @click.prevent="scrollTo('#shop')">健康商城</a>
      </div>

      <a href="#cta" class="nav-cta" @click.prevent="scrollTo('#cta')">立即加入</a>

      <!-- 手機漢堡按鈕 -->
      <button class="mobile-toggle" @click="toggleMenu" aria-label="Menu">☰</button>
    </div>
  </nav>

  <!-- ========== 手機選單 ========== -->
  <div class="mobile-menu" :class="{ open: isMobileMenuOpen }">
    <a href="#nutritionists" @click.prevent="menuScrollTo('#nutritionists')">營養師團隊</a>
    <a href="#pricing"       @click.prevent="menuScrollTo('#pricing')">課程方案</a>
    <a href="#tracking"      @click.prevent="menuScrollTo('#tracking')">飲食追蹤</a>
    <a href="#shop"          @click.prevent="menuScrollTo('#shop')">健康商城</a>
    <a href="#cta"           @click.prevent="menuScrollTo('#cta')">立即加入</a>
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
        v-for="(item, idx) in [...testimonials, ...testimonials]"
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
        <a href="#pricing" class="btn-outline reveal rd2" @click.prevent="scrollTo('#pricing')">課程套組方案</a>
      </div>

      <!-- 輪播軌道 -->
      <div class="nutri-track-wrap">
        <div class="nutri-track" ref="nutriTrackRef">
          <div
            v-for="(nutri, idx) in nutritionists"
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
              <a href="#" class="book-link">
                馬上預約
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </a>
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
      <div style="text-align:center;">
        <div class="scroll-label reveal">課程套組方案</div>
        <h2 class="pricing-title reveal rd1">選擇最適合你的方案</h2>
        <p class="pricing-subtitle reveal rd2">套組結帳後自動轉換為儲值點數，預約時可彈性扣抵使用</p>
      </div>

      <div class="pricing-grid">
        <div
          v-for="(plan, idx) in pricingPlans"
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
        <RouterLink to="/store" class="btn-outline reveal rd2">查看全部商品</RouterLink>
      </div>

      <!-- 分類 Tab -->
      <div class="shop-tabs reveal">
        <button
          v-for="tab in shopTabs"
          :key="tab"
          class="shop-tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <!-- 商品卡片 -->
      <div class="shop-grid">
        <div
          v-for="(product, idx) in shopProducts"
          :key="product.name"
          class="shop-card reveal"
          :class="`rd${idx}`"
        >
          <div class="shop-img-wrap">
            <span v-if="product.badge" class="shop-card-badge">{{ product.badge }}</span>
            <img :src="product.img" :alt="product.name" class="shop-img" />
          </div>
          <div class="shop-body">
            <div class="shop-category">{{ product.category }}</div>
            <h3>{{ product.name }}</h3>
            <div class="shop-price">
              {{ product.price }}
              <span v-if="product.original" class="original">{{ product.original }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="shop-more reveal">
        <a href="#" class="btn-outline">探索更多商品</a>
      </div>
    </div>
  </section>

  <!-- ========== 最終 CTA ========== -->
  <section class="final-cta reveal" id="cta">
    <h2>你的理想體態<br />從這裡開始</h2>
    <p>結合營養諮詢、飲食追蹤與健康商城，My Fitness Coach 陪你走每一步。</p>
    <a href="#" class="btn-dark">立即加入會員</a>
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

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

// ─────────────────────────────────────────────
// 【Navbar 捲動效果】
// 捲動超過 40px 時加上 .scrolled class，縮小 padding
// ─────────────────────────────────────────────
const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 40
}

// ─────────────────────────────────────────────
// 【手機選單開關】
// 開啟時鎖定 body 捲動，關閉時解鎖
// ─────────────────────────────────────────────
const isMobileMenuOpen = ref(false)

function toggleMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
}

/** 手機選單連結點擊：先關閉選單，再平滑捲動 */
function menuScrollTo(selector) {
  toggleMenu()
  scrollTo(selector)
}

// ─────────────────────────────────────────────
// 【平滑捲動】
// 由 Vue 統一處理 anchor 跳轉，避免原生跳轉閃爍
// ─────────────────────────────────────────────
function scrollTo(selector) {
  const target = document.querySelector(selector)
  if (target) target.scrollIntoView({ behavior: 'smooth' })
}

// ─────────────────────────────────────────────
// 【進場動畫 Intersection Observer】
// 元素進入視口時加上 .visible，觸發 CSS transition
// ─────────────────────────────────────────────
let revealObserver = null

function initReveal() {
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      })
    },
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  )
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el))
}

// ─────────────────────────────────────────────
// 【營養師輪播】
// ref 綁定 DOM，slideNutri 計算偏移並 transform
// ─────────────────────────────────────────────
const nutriTrackRef = ref(null)
let nutriIndex = 0

function slideNutri(dir) {
  const track = nutriTrackRef.value
  if (!track) return
  const cards = track.querySelectorAll('.nutri-card')
  if (!cards.length) return

  const cardWidth = cards[0].offsetWidth + 20  // 卡片寬度 + gap
  const maxIndex = Math.max(0, cards.length - Math.floor(track.parentElement.offsetWidth / cardWidth))

  nutriIndex = Math.max(0, Math.min(nutriIndex + dir, maxIndex))
  track.style.transform = `translateX(-${nutriIndex * cardWidth}px)`
}

// ─────────────────────────────────────────────
// 【生命週期】
// mounted 掛載事件；unmounted 清除，防止記憶體洩漏
// ─────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  initReveal()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  revealObserver?.disconnect()
})

// ─────────────────────────────────────────────
// 【靜態資料】
// 抽離為 JS 物件，未來可替換成 API 請求
// ─────────────────────────────────────────────

/** 學員回饋 */
const testimonials = [
  {
    name: '林小萱', title: '上班族・28 歲',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    stars: '★★★★★',
    text: '「營養師幫我量身制定了飲食計畫，三個月下來體脂降了 5%，而且完全不用挨餓！整個過程超有成就感。」',
  },
  {
    name: '陳柏翰', title: '健身愛好者・32 歲',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    stars: '★★★★★',
    text: '「飲食紀錄功能真的太方便了，每天花不到三分鐘就能記錄完，系統還會自動幫我算熱量跟 TDEE 比對。」',
  },
  {
    name: '王雅琪', title: '產後媽媽・35 歲',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    stars: '★★★★★',
    text: '「產後想恢復體態，營養師很有耐心地調整我的飲食，搭配商城買的即食雞胸肉，省時又健康，大推！」',
  },
  {
    name: '張志偉', title: '工程師・29 歲',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    stars: '★★★★☆',
    text: '「以前吃東西完全沒概念，用了平台之後才知道自己每天到底吃了什麼。體態報表看到進步很有動力。」',
  },
  {
    name: '李佳穎', title: '大學生・21 歲',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    stars: '★★★★★',
    text: '「套組方案超划算，買了之後變成點數，可以隨時約營養師，時間彈性很大，很適合學生族群！」',
  },
  {
    name: '黃建安', title: '業務主管・40 歲',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
    stars: '★★★★★',
    text: '「應酬多、外食多，營養師根據我的生活型態給了很實際的建議。每次諮詢前營養師都已經看過我的飲食紀錄了，效率超高。」',
  },
]

/** 營養師資料 */
const nutritionists = [
  {
    name: '蘇怡婷 營養師', specialty: '體重管理專家',
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&h=500&fit=crop&crop=face',
    bio: '擁有 8 年臨床經驗，專精於體重控制與代謝調理。曾輔導超過 500 位學員成功達標，擅長為外食族設計實際可執行的飲食方案。',
    tags: ['體重控制', '代謝調理', '外食規劃'],
  },
  {
    name: '陳宥翔 營養師', specialty: '運動營養顧問',
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&h=500&fit=crop&crop=face',
    bio: '前職業運動員背景，深諳運動營養學。專為健身族群、運動選手量身打造增肌減脂飲食策略，精確計算巨量營養素比例。',
    tags: ['增肌減脂', '運動營養', '巨量營養素'],
  },
  {
    name: '張雅芯 營養師', specialty: '孕期與產後調理',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop&crop=face',
    bio: '專注於孕期營養規劃與產後體態恢復，溫柔細膩的諮詢風格深受媽媽族群信賴。同時也擅長兒童飲食營養指導。',
    tags: ['孕期營養', '產後恢復', '兒童飲食'],
  },
  {
    name: '林柏勳 營養師', specialty: '慢性疾病飲食',
    img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&h=500&fit=crop&crop=face',
    bio: '擁有醫學中心 10 年臨床經驗，專精於三高、糖尿病等慢性疾病的飲食管理與衛教，幫助你吃出健康新生活。',
    tags: ['三高飲食', '糖尿病', '慢性病管理'],
  },
]

/** 課程方案 */
const pricingPlans = [
  {
    name: '單次體驗', label: '適合初次嘗試',
    price: 'NT$800', unit: '次', period: '單次線上刷卡付款',
    features: ['1 小時一對一諮詢', '自選營養師與時段', '基礎飲食建議報告', '線上刷卡支付'],
    btnStyle: 'light', btnText: '立即預約', featured: false, badge: null,
  },
  {
    name: '經典套組', label: '最多人選擇的方案',
    price: 'NT$3,600', unit: '組', period: '含 5 次諮詢點數（每次省 $80）',
    features: ['5 堂一對一諮詢點數', '完整飲食追蹤功能', 'BMR / TDEE 智慧分析', '個人體態報表', '商城 9 折優惠'],
    btnStyle: 'accent', btnText: '立即購買', featured: true, badge: '最受歡迎',
  },
  {
    name: '進階方案', label: '深度體態管理',
    price: 'NT$6,800', unit: '組', period: '含 10 次諮詢點數（每次省 $120）',
    features: ['10 堂一對一諮詢點數', '優先預約熱門營養師', '進階數據整合分析', '每月體態追蹤報告', '商城 85 折優惠'],
    btnStyle: 'light', btnText: '立即購買', featured: false, badge: null,
  },
]

/** 飲食追蹤功能列表 */
const trackingItems = [
  { icon: '🍽️', title: '每日飲食日誌',     desc: '輕鬆紀錄三餐與點心，系統自動加總當日攝取熱量並與目標比對。' },
  { icon: '📊', title: 'BMR / TDEE 智慧分析', desc: '自動抓取你的基礎代謝率與每日總消耗，給予精準的飲食建議。' },
  { icon: '📈', title: '體態可視化報表',     desc: '體重、體脂變化一目了然，追蹤你的每一步進展與成就。' },
]

/** 商城 Tab 與商品 */
const shopTabs = ['全部', '蛋白質', '輕食', '補給品', '零食']
const activeTab = ref('全部')

const shopProducts = [
  {
    name: '舒肥即食雞胸肉（5入）', category: '蛋白質',
    img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop',
    price: 'NT$399', original: 'NT$499', badge: '熱銷',
  },
  {
    name: '分離乳清蛋白粉 1kg', category: '補給品',
    img: 'https://images.unsplash.com/photo-1622484211148-3e0ab498b7d6?w=400&h=300&fit=crop',
    price: 'NT$1,280', original: null, badge: null,
  },
  {
    name: '低卡鮮蔬沙拉組合', category: '輕食',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    price: 'NT$199', original: null, badge: '新品',
  },
  {
    name: '無調味綜合堅果 300g', category: '零食',
    img: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=300&fit=crop',
    price: 'NT$320', original: 'NT$380', badge: null,
  },
]

/** Footer 連結欄位 */
const footerCols = [
  {
    title: '服務',
    links: [
      { label: '營養師諮詢', href: '#nutritionists' },
      { label: '課程套組',   href: '#pricing' },
      { label: '飲食追蹤',   href: '#tracking' },
      { label: '健康商城',   href: '#shop' },
    ],
  },
  {
    title: '關於我們',
    links: [
      { label: '品牌故事',   href: '#' },
      { label: '營養師招募', href: '#' },
      { label: '常見問題',   href: '#' },
      { label: '隱私政策',   href: '#' },
    ],
  },
  {
    title: '聯繫方式',
    links: [
      { label: 'contact@myfitcoach.tw', href: 'mailto:contact@myfitcoach.tw' },
      { label: '+886 2-1234-5678',      href: 'tel:+886212345678' },
      { label: 'Instagram',             href: '#' },
      { label: 'Facebook',              href: '#' },
    ],
  },
]
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

.nutri-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; }
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
