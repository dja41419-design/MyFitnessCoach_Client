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
}

export const fetchLandingPageReviews = async (): Promise<Review[]> => {
  try {
    const response = await fetch('/api/Review/LandingPage')
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
    const response = await fetch('/api/Review/All')
    if (!response.ok) throw new Error('無法獲取所有評論')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching all reviews:', error)
    return []
  }
}
