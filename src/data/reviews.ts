// 學員回饋資料
// 完全透過 fetch API 從後端獲取

export interface Review {
  name: string
  title: string
  avatar: string
  stars: string
  text: string
  originalText?: string
  instructorId: number
  instructorName: string
  instructorAvatar: string
  instructorTitle: string
  createdAt: string
  likeCount: number
  reservationId: number
  isLiked: boolean
}

export interface PagedReview {
  reviews: Review[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export const fetchLandingPageReviews = async (): Promise<Review[]> => {
  try {
    const response = await fetch('/api/Review/LandingPage', { credentials: 'include' })
    if (!response.ok) throw new Error('無法獲取學員回饋')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

export const fetchAllReviews = async (): Promise<Review[]> => {
  try {
    const response = await fetch('/api/Review/All', { credentials: 'include' })
    if (!response.ok) throw new Error('無法獲取所有評論')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching all reviews:', error)
    return []
  }
}

export const fetchPagedReviews = async (page: number, pageSize: number): Promise<PagedReview | null> => {
  try {
    const response = await fetch(`/api/Review/Paged?page=${page}&pageSize=${pageSize}`, { credentials: 'include' })
    if (!response.ok) throw new Error('無法獲取分頁評論')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching paged reviews:', error)
    return null
  }
}
