import { ref } from 'vue'
import { fetchLandingPageReviews, type Review } from '@/data/reviews'

export function useReviews() {
  const reviewList = ref<Review[]>([])

  const loadReviews = async () => {
    reviewList.value = await fetchLandingPageReviews()
  }

  return {
    reviewList,
    loadReviews
  }
}
