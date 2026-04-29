// 商品資料
// 透過 fetch API 從後端獲取(對應 /api/StoreApi/products)

export interface Product {
  id: number
  categoryId: number
  name: string
  imageUrl: string
  originalPrice: number
  unitPrice: number
  description: string
  sortOrder: number
  isActive: boolean
  categoryName: string
}

/**
 * 取得商品圖片路徑
 * @param productId 商品 ID
 * @returns 圖片 URL
 */
export const getProductImagePath = (productId: number): string => {
  return `/api/StoreApi/ProductImage/${productId}`
}

/**
 * 抓首頁精選商品(依後端 sortOrder 排序,截取前 N 筆)
 * 後端 /api/StoreApi/products 已過濾 isActive 且 OrderBy sortOrder
 * @param limit 要取幾筆(預設 4)
 */
export const fetchLandingPageProducts = async (limit: number = 4): Promise<Product[]> => {
  try {
    const res = await fetch('/api/StoreApi/products')
    if (!res.ok) throw new Error('無法獲取商品資料')
    const data: Product[] = await res.json()
    return data.slice(0, limit)
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}
