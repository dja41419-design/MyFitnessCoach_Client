import { ref } from 'vue'
import { fetchLandingPageReviews, fetchAllReviews, fetchPagedReviews, type Review } from '@/data/reviews'

// 簡單的關鍵字 API 串接 (假設後端有提供)
const fetchKeywords = async (): Promise<string[]> => {
  try {
    const response = await fetch('/api/Review/Keywords')
    if (response.ok) {
      const data = await response.json()
      return Array.isArray(data) ? data : []
    }
    return ['垃圾', '爛', '差', '死', '爛貨', '廢物', '幹']
  } catch (e) {
    console.error('Failed to fetch keywords', e)
    return ['垃圾', '爛', '差', '死', '爛貨', '廢物', '幹']
  }
}

export function useReviews() {
  const reviewList = ref<Review[]>([])
  const keywords = ref<string[]>([])
  const totalCount = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)

  const loadKeywords = async () => {
    keywords.value = await fetchKeywords()
  }

  const maskText = (text: string) => {
    if (!text) return ''
    if (!keywords.value.length) return text
    let masked = text
    keywords.value.forEach(word => {
      if (!word) return
      try {
        const regex = new RegExp(word, 'gi')
        masked = masked.replace(regex, '*'.repeat(word.length))
      } catch (e) {
        // 防止正則表達式特殊字元導致報錯
        masked = masked.split(word).join('*'.repeat(word.length))
      }
    })
    return masked
  }

  const loadReviews = async () => {
    try {
      await loadKeywords()
      const reviews = await fetchLandingPageReviews()
      reviewList.value = reviews.map(r => ({
        ...r,
        originalText: r.text, // 保存原始文字
        text: maskText(r.text)
      }))
    } catch (e) {
      console.error('Failed to load reviews', e)
    }
  }

  const loadAllReviews = async () => {
    try {
      await loadKeywords()
      const reviews = await fetchAllReviews()
      reviewList.value = reviews.map(r => ({
        ...r,
        originalText: r.text, // 保存原始文字
        text: maskText(r.text)
      }))
    } catch (e) {
      console.error('Failed to load all reviews', e)
    }
  }

  const loadPagedReviews = async (page: number, pageSize: number) => {
    try {
      await loadKeywords()
      const data = await fetchPagedReviews(page, pageSize)
      if (data) {
        reviewList.value = data.reviews.map(r => ({
          ...r,
          originalText: r.text,
          text: maskText(r.text)
        }))
        totalCount.value = data.totalCount
        totalPages.value = data.totalPages
        currentPage.value = data.currentPage
      }
    } catch (e) {
      console.error('Failed to load paged reviews', e)
    }
  }

  return {
    reviewList,
    keywords, // 導出關鍵字供組件使用
    totalCount,
    totalPages,
    currentPage,
    loadReviews,
    loadAllReviews,
    loadPagedReviews
  }
}
