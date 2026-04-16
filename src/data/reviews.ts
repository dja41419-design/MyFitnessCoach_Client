// 學員回饋資料
// 之後改成 fetch API 時，直接在此檔替換 reviews 的來源即可

export interface Review {
  name: string
  title: string
  avatar: string
  stars: string
  text: string
}

export const reviews: Review[] = [
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
    text: '「套組方案超劃算，買了之後變成點數，可以隨時約營養師，時間彈性很大，很適合學生族群！」',
  },
  {
    name: '黃建安', title: '業務主管・40 歲',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
    stars: '★★★★★',
    text: '「應酬多、外食多，營養師根據我的生活型態給了很實際的建議。每次諮詢前營養師都已經看過我的飲食紀錄了，效率超高。」',
  },
]

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
