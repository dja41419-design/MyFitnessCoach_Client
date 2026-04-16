<template>
  <div class="all-reviews-page">
    <!-- 簡單導航 / 返回按鈕 -->
    <nav class="page-nav">
      <div class="container">
        <RouterLink to="/" class="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
          返回首頁
        </RouterLink>
      </div>
    </nav>

    <header class="page-header">
      <div class="container">
        <div class="scroll-label">Reviews</div>
        <h1>學員真實回饋</h1>
        <p class="subtitle">聽聽學員們怎麼說！分享他們在 My Fitness Coach 的成長與改變。</p>
      </div>
    </header>

    <section class="reviews-grid-section">
      <div class="container">
        <div v-if="reviewList.length > 0" class="reviews-grid">
          <div
            v-for="(item, idx) in reviewList"
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
        <div v-else class="no-reviews">
          <p>目前尚無評價資料</p>
        </div>
      </div>
    </section>

    <!-- 底部簡單 Footer -->
    <footer class="simple-footer">
      <div class="container">
        <p>© 2025 My Fitness Coach. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useReviews } from '@/composables/useReviews'

const { reviewList, loadAllReviews } = useReviews()

onMounted(async () => {
  await loadAllReviews()
})
</script>

<style scoped>
.all-reviews-page {
  background-color: var(--bg);
  min-height: 100vh;
  padding-top: 80px;
}

.page-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  padding: 20px 0;
  background: rgba(245, 240, 235, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  transition: transform 0.3s;
}

.back-link:hover {
  transform: translateX(-4px);
  color: var(--accent-dark);
}

.page-header {
  padding: 60px 0 40px;
  text-align: center;
}

.page-header h1 {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 400;
  margin: 16px 0;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 32px;
}

/* 捲動標籤 (與首頁一致) */
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

.reviews-grid-section {
  padding-bottom: 100px;
}

/* 核心需求：四個排一排 */
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* 複用 testimonial-card 樣式並微調 */
.testimonial-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(212,204,194,0.5);
  transition: transform 0.3s, box-shadow 0.3s;
}

.testimonial-card:hover { 
  transform: translateY(-4px); 
  box-shadow: 0 12px 40px rgba(26,22,19,0.06); 
}

.testimonial-top { display: flex; align-items: center; gap: 12px; }

.testimonial-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
}

.testimonial-info h4 { font-size: 0.88rem; font-weight: 600; margin: 0; }
.testimonial-info p  { font-size: 0.74rem; color: var(--text-secondary); margin: 2px 0 0; }
.testimonial-stars   { color: var(--accent-dark); font-size: 0.8rem; letter-spacing: 1px; }
.testimonial-text    { font-size: 0.88rem; line-height: 1.6; color: var(--text-primary); flex: 1; }

.no-reviews {
  text-align: center;
  padding: 100px 0;
  color: var(--text-secondary);
  font-style: italic;
}

.simple-footer {
  padding: 40px 0;
  text-align: center;
  border-top: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.85rem;
}

/* 響應式調整 */
@media (max-width: 1200px) {
  .reviews-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 992px) {
  .reviews-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 576px) {
  .reviews-grid { grid-template-columns: 1fr; }
}
</style>
