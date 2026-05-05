import type { CouponDto } from '@/data/coupon'

// 公開端點,不帶 token;失敗時回空陣列,不擋商城頁
export async function fetchCouponBanners(): Promise<CouponDto[]> {
  try {
    const res = await fetch('/api/CouponApi/public/banners')
    if (!res.ok) return []
    return (await res.json()) as CouponDto[]
  } catch {
    return []
  }
}
