// 商城資料（分頁 + 商品）
// 之後改成 fetch API 時，直接在此檔替換 shopProducts 的來源即可

export interface ShopProduct {
  name: string
  category: string
  img: string
  price: string
  original: string | null
  badge: string | null
}

export const shopTabs: string[] = ['全部', '蛋白質', '輕食', '補給品', '零食']

export const shopProducts: ShopProduct[] = [
  {
    name: '舒肥即食雞胸肉（5入）', category: '蛋白質',
    img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop',
    price: 'NT$399', original: 'NT$499', badge: '熱銷',
  },
  {
    name: '分離乳清蛋白粉 1kg', category: '補給品',
    img: 'https://images.unsplash.com/photo-1693996045899-7cf0ac0229c7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    price: 'NT$1,280', original: null, badge: null,
  },
  {
    name: '低卡鮮蔬沙拉組合', category: '輕食',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    price: 'NT$199', original: null, badge: '新品',
  },
  {
    name: '無調味綜合堅果 300g', category: '零食',
    img: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=300&fit=crop',
    price: 'NT$320', original: 'NT$380', badge: null,
  },
]
