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
        <!-- 排序控制 -->
        <div v-if="reviewList.length > 0" class="reviews-filter">
          <div class="filter-info">共 {{ reviewList.length }} 則評價</div>
          <div class="sort-controls">
            <span class="sort-label">排序方式：</span>
            <div 
              class="sort-badge"
              @wheel.prevent="handleWheel"
              title="使用滾輪切換排序"
            >
              {{ currentSortLabel }}
              <div class="scroll-hint">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div v-if="sortedReviewList.length > 0" class="reviews-grid">
          <div
            v-for="(item, idx) in sortedReviewList"
            :key="idx"
            class="testimonial-card clickable"
            @click="openReview(item)"
          >
            <div class="testimonial-top">
              <img :src="item.avatar" :alt="item.name" class="testimonial-avatar" />
              <div class="testimonial-info">
                <div class="name-row">
                  <h4>{{ item.name }}</h4>
                  <span class="review-date">{{ formatDate(item.createdAt) }}</span>
                </div>
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

    <!-- 評價詳情 Modal (使用 Vuetify) -->
    <v-dialog
      v-model="isModalOpen"
      max-width="650"
      transition="fade-transition"
      class="review-modal-dialog"
      scrim="#1a1613"
    >
      <v-card v-if="selectedReview" class="review-detail-card">
        <v-btn
          icon="mdi-close"
          variant="tonal"
          class="close-btn"
          @click="isModalOpen = false"
          density="comfortable"
        ></v-btn>

        <div class="modal-body">
          <div class="modal-header">
            <v-avatar size="90" class="modal-avatar-box">
              <v-img :src="selectedReview.avatar" cover></v-img>
            </v-avatar>
            <div class="modal-user-info">
              <div class="modal-name-row">
                <h3>{{ selectedReview.name }}</h3>
                <span class="modal-time">{{ formatDate(selectedReview.createdAt, true) }}</span>
              </div>
              <p>{{ selectedReview.title }}</p>
            </div>
          </div>

          <div class="modal-meta">
            <div class="modal-stars">{{ selectedReview.stars }}</div>
            <!-- 營養師名片樣式 (加入點擊跳轉) -->
            <div 
              class="instructor-mini-card clickable"
              @click="goToReservation(selectedReview.instructorId)"
              title="前往預約"
            >
              <v-avatar size="48" class="instructor-avatar">
                <v-img :src="selectedReview.instructorAvatar" cover></v-img>
              </v-avatar>
              <div class="instructor-info">
                <span class="label">指導營養師 (點擊預約)</span>
                <div class="details">
                  <span class="name">{{ selectedReview.instructorName }}</span>
                  <span class="title">{{ selectedReview.instructorTitle }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-text-container">
            <p class="modal-text">
              <template v-for="(seg, i) in textSegments" :key="i">
                <span 
                  v-if="seg.isSensitive" 
                  class="sensitive-segment"
                  :class="seg.revealed ? 'text-success' : 'text-danger'"
                  @click="toggleSegment(seg)"
                  :title="seg.revealed ? '點擊遮罩' : '點擊顯示'"
                >
                  {{ seg.text }}
                </span>
                <template v-else>{{ seg.text }}</template>
              </template>
            </p>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <!-- 底部簡單 Footer -->
    <footer class="simple-footer">
      <div class="container">
        <p>© 2025 My Fitness Coach. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useReviews } from '@/composables/useReviews'
import type { Review } from '@/data/reviews'

const router = useRouter()
const { reviewList, keywords, loadAllReviews } = useReviews()

const sortOrder = ref('default')
const sortOptions = ['default', 'high-to-low', 'low-to-high']

// Modal 相關
const isModalOpen = ref(false)
const selectedReview = ref<Review | null>(null)

// 敏感字片段狀態
interface TextSegment {
  text: string
  original: string
  masked: string
  isSensitive: boolean
  revealed: boolean
}
const textSegments = ref<TextSegment[]>([])

onMounted(async () => {
  await loadAllReviews()
})

const openReview = (review: Review) => {
  selectedReview.value = review
  prepareSegments(review.originalText || review.text)
  isModalOpen.value = true
}

const goToReservation = (instructorId: number) => {
  if (!instructorId) return
  router.push({ name: 'ReserveDetail', params: { id: instructorId.toString() } })
}

const prepareSegments = (rawText: string) => {
  if (!rawText) {
    textSegments.value = []
    return
  }

  // 如果沒有關鍵字，就當作一般片段
  if (!keywords.value.length) {
    textSegments.value = [{
      text: rawText,
      original: rawText,
      masked: rawText,
      isSensitive: false,
      revealed: false
    }]
    return
  }

  // 構建正則表達式來切分文字
  const pattern = keywords.value.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')
  
  const parts = rawText.split(regex)
  textSegments.value = parts.filter(p => p !== '').map(part => {
    const isSensitive = keywords.value.some(k => k.toLowerCase() === part.toLowerCase())
    const masked = '*'.repeat(part.length)
    return {
      text: isSensitive ? masked : part,
      original: part,
      masked: masked,
      isSensitive,
      revealed: false
    }
  })
}

const toggleSegment = (segment: TextSegment) => {
  if (!segment.isSensitive) return
  segment.revealed = !segment.revealed
  segment.text = segment.revealed ? segment.original : segment.masked
}

const formatDate = (dateStr: string, detailed = false) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (detailed) {
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const handleWheel = (event: WheelEvent) => {
  const currentIndex = sortOptions.indexOf(sortOrder.value)
  if (event.deltaY > 0) {
    // 往下捲動：下一個選項
    const nextIndex = (currentIndex + 1) % sortOptions.length
    sortOrder.value = sortOptions[nextIndex]
  } else {
    // 往上捲動：上一個選項
    const prevIndex = (currentIndex - 1 + sortOptions.length) % sortOptions.length
    sortOrder.value = sortOptions[prevIndex]
  }
}

const getRatingValue = (stars: string) => {
  return (stars.match(/★/g) || []).length
}

const currentSortLabel = computed(() => {
  switch (sortOrder.value) {
    case 'high-to-low': return '評價由高到低'
    case 'low-to-high': return '評價由低到高'
    default: return '預設排序'
  }
})

const sortedReviewList = computed(() => {
  const list = [...reviewList.value]
  if (sortOrder.value === 'high-to-low') {
    return list.sort((a, b) => getRatingValue(b.stars) - getRatingValue(a.stars))
  } else if (sortOrder.value === 'low-to-high') {
    return list.sort((a, b) => getRatingValue(a.stars) - getRatingValue(b.stars))
  }
  return list
})
</script>

<style scoped>
.all-reviews-page {
  background-color: var(--bg) !important;
  min-height: 100vh;
  padding-top: 80px;
}

.page-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  padding: 20px 0;
  background: rgba(245, 240, 235, 0.85) !important;
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

/* 排序控制樣式 */
.reviews-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0 4px;
}

.filter-info {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.sort-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: ns-resize; /* 指示上下捲動 */
  transition: all 0.3s ease;
  user-select: none;
}

.sort-badge:hover {
  border-color: var(--accent-dark);
  background: var(--bg);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.scroll-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-dark);
  opacity: 0.6;
  transition: opacity 0.3s;
}

.sort-badge:hover .scroll-hint {
  opacity: 1;
  animation: bounce-vertical 1.5s infinite;
}

@keyframes bounce-vertical {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

/* 核心需求：三個排一排，讓內容更醒目 */
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

/* 複用 testimonial-card 樣式並全面加大 */
.testimonial-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid rgba(212,204,194,0.5);
  transition: transform 0.3s, box-shadow 0.3s;
}

.testimonial-card.clickable {
  cursor: pointer;
}

.testimonial-card:hover { 
  transform: translateY(-6px); 
  box-shadow: 0 20px 50px rgba(26,22,19,0.08); 
}

.testimonial-top { display: flex; align-items: center; gap: 16px; }

.testimonial-avatar {
  width: 56px; height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
}

.testimonial-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.name-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.testimonial-info h4 { font-size: 1.05rem; font-weight: 600; margin: 0; color: var(--text-primary); }
.testimonial-info p  { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }

.review-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.7;
  font-weight: 400;
  white-space: nowrap;
}

.testimonial-stars   { color: var(--accent-dark); font-size: 0.95rem; letter-spacing: 2px; }
.testimonial-text    { 
  font-size: 1.1rem; 
  line-height: 1.7; 
  color: var(--text-primary); 
  flex: 1;
  font-style: italic;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Modal 樣式優化 */
:deep(.v-overlay__content) {
  border-radius: 32px !important; /* 強制超大圓角 */
  overflow: hidden;
}

.review-detail-card {
  border-radius: 32px !important;
  background: #ffffff !important;
  border: 1px solid rgba(0,0,0,0.05);
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 10;
  border-radius: 16px !important;
  background: rgba(0,0,0,0.03) !important;
}

.modal-body {
  padding: 56px;
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}

.modal-avatar-box {
  border: 4px solid var(--bg);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.modal-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-name-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
}

.modal-user-info h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.modal-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
  opacity: 0.6;
  font-weight: 400;
}

.modal-user-info p {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.modal-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 16px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.modal-stars {
  font-size: 1.2rem;
  color: var(--accent-dark);
  letter-spacing: 2px;
}

/* 營養師名片樣式 */
.instructor-mini-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 20px;
  min-width: 240px;
  transition: all 0.3s ease;
}

.instructor-mini-card.clickable {
  cursor: pointer;
}

.instructor-mini-card.clickable:hover {
  border-color: var(--accent-dark);
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
}

.instructor-avatar {
  border: 2px solid #ffffff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.instructor-info {
  display: flex;
  flex-direction: column;
}

.instructor-info .label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  font-weight: 700;
  margin-bottom: 2px;
}

.instructor-info .details {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.instructor-info .name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}

.instructor-info .title {
  font-size: 0.75rem;
  color: var(--accent-dark);
  font-weight: 600;
}

.modal-text-container {
  margin-bottom: 24px;
}

.modal-text {
  font-size: 1.25rem;
  line-height: 1.8;
  color: var(--text-primary);
  font-style: italic;
  white-space: pre-line;
}

.sensitive-segment {
  cursor: pointer;
  padding: 0 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-style: dashed;
}

.text-danger {
  color: #ff5252 !important; /* Vuetify red */
  background: rgba(255, 82, 82, 0.05);
}

.text-success {
  color: #4caf50 !important; /* Vuetify green */
  background: rgba(76, 175, 80, 0.05);
}

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
  .reviews-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
}

@media (max-width: 768px) {
  .reviews-grid { grid-template-columns: 1fr; }
  .testimonial-card { padding: 24px; }
  .modal-body { padding: 32px; }
  .modal-text { font-size: 1.1rem; }
}
</style>
