// 飲食追蹤功能列表
// 之後改成 fetch API 時，直接在此檔替換 trackingItems 的來源即可

export interface TrackingItem {
  icon: string
  title: string
  desc: string
}

export const trackingItems: TrackingItem[] = [
  { icon: '🍽️', title: '每日飲食日誌',      desc: '輕鬆紀錄三餐與點心，系統自動加總當日攝取熱量並與目標比對。' },
  { icon: '📊', title: 'BMR / TDEE 智慧分析', desc: '自動抓取你的基礎代謝率與每日總消耗，給予精準的飲食建議。' },
  { icon: '📈', title: '體態可視化報表',      desc: '體重、體脂變化一目了然，追蹤你的每一步進展與成就。' },
]
