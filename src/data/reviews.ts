// 學員回饋資料
// 之後改成 fetch API 時，直接在此檔替換 reviews 的來源即可

export interface Review {
  name: string
  title: string
  avatar: string
  stars: string
  text: string
}

export const fetchLandingPageReviews = async (): Promise<Review[]> => {
  try {
    const response = await fetch('/api/Review/LandingPage')
    if (!response.ok) throw new Error('無法獲取學員回饋')
    const data = await response.json()
    // 如果 API 回傳空的，則回傳預設的靜態資料
    return data.length > 0 ? data : reviews
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return reviews
  }
}
