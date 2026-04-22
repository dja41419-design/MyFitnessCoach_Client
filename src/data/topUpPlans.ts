// 儲值方案備用資料（結構與後端 TopUpPlanDto 一致，來源：MyFitnessCoachDb_0409.sql）
// API 正常回傳資料後此備用資料不會被使用

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
    planName: '單堂體驗方案',
    imageUrl: '/images/plans/plan_01.jpg',
    price: 1000,
    points: 1,
    description: '購買 1 點，適合初次體驗諮詢課程的學員。',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 2,
    planName: '雙效入門方案',
    imageUrl: '/images/plans/plan_02.jpg',
    price: 1800,
    points: 2,
    description: '購買 2 點，享 9 折優惠，適合有短期諮詢需求的你。',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 3,
    planName: '五星進階方案',
    imageUrl: '/images/plans/plan_03.jpg',
    price: 4000,
    points: 5,
    description: '購買 5 點，享 8 折優惠，單次諮詢低至 800 元！',
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 4,
    planName: '十分超值方案',
    imageUrl: '/images/plans/plan_04.jpg',
    price: 7000,
    points: 10,
    description: '購買 10 點，享 7 折優惠，穩定長期諮詢的最佳選擇。',
    isActive: true,
    sortOrder: 4,
  },
  {
    id: 5,
    planName: '尊榮鐵粉方案',
    imageUrl: '/images/plans/plan_05.jpg',
    price: 12000,
    points: 20,
    description: '購買 20 點，享 6 折最高優惠，單次只要 600 元，買到賺到！',
    isActive: true,
    sortOrder: 5,
  },
]
