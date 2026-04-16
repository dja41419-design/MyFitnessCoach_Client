// 儲值方案備用資料（結構與後端 TopUpPlanDto 一致）
// API 正常回傳後此資料不會被使用

export interface TopUpPlanDto {
  id: number
  planName: string
  imageUrl: string | null
  price: number
  points: number
  description: string | null
  isActive: boolean
  sortOrder: number
}

export const topUpPlans: TopUpPlanDto[] = [
  {
    id: 1,
    planName: '單次體驗',
    imageUrl: null,
    price: 800,
    points: 1,
    description: '適合初次嘗試的你。享受一次完整的一對一諮詢，由營養師為你量身規劃基礎飲食建議。',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 2,
    planName: '經典套組',
    imageUrl: null,
    price: 3600,
    points: 5,
    description: '最多人選擇的方案，含 5 點諮詢點數（每點省 $80）。解鎖完整飲食追蹤功能與 BMR / TDEE 智慧分析。',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 3,
    planName: '進階方案',
    imageUrl: null,
    price: 6800,
    points: 10,
    description: '深度體態管理首選，含 10 點諮詢點數（每點省 $120）。優先預約熱門營養師，獲取進階數據整合分析與每月體態追蹤報告。',
    isActive: true,
    sortOrder: 3,
  },
]
