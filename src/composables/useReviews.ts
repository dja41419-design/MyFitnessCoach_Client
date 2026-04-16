import { ref } from 'vue'
import { fetchLandingPageReviews, fetchAllReviews, type Review } from '@/data/reviews'

export function useReviews() {
  const reviewList = ref<Review[]>([])

  const loadReviews = async () => {
    reviewList.value = await fetchLandingPageReviews()
  }

  const loadAllReviews = async () => {
    reviewList.value = await fetchAllReviews()
  }

  return {
    reviewList,
    loadReviews,
    loadAllReviews
  }
}
