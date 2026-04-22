import { fetchWithAuth } from '@/data/fetchWithAuth'

// ----- DTO 型別（對應後端） ----------------------------------------------

export interface CouponDto {
  id: number
  code: string
  name: string
  description: string | null
  /** 1 = 固定金額；2 = 百分比 */
  discountType: number
  discountValue: number
  minSpend: number
  maxDiscount: number | null
  startAt: string
  endAt: string
  remainingQuota: number | null
  bannerImageUrl: string | null
  /** 1-31:此券只在每月該日顯示。null=隨時可見 */
  visibleOnlyOnDayOfMonth: number | null
}

export interface MemberCouponDto {
  id: number                  // MemberCoupon.Id（試算 / 結帳用這個）
  claimedAt: string
  expiresAt: string | null    // 個人到期日(由 Coupon.ValidDaysAfterClaim 推算)
  usedAt: string | null
  isUsed: boolean
  coupon: CouponDto
}

export interface DiscountPreviewResultDto {
  isValid: boolean
  discountAmount: number
  finalTotal: number
  message: string | null
}

// ----- API wrappers --------------------------------------------------------

/** GET 可領取的優惠券（已過濾掉本人領過的） */
export async function fetchAvailableCoupons(): Promise<CouponDto[]> {
  const res = await fetchWithAuth('/api/CouponApi/available')
  if (!res.ok) throw new Error('讀取可領取優惠券失敗')
  return (await res.json()) as CouponDto[]
}

/** GET 我的優惠券（含已使用） */
export async function fetchMyCoupons(): Promise<MemberCouponDto[]> {
  const res = await fetchWithAuth('/api/CouponApi/my')
  if (!res.ok) throw new Error('讀取我的優惠券失敗')
  return (await res.json()) as MemberCouponDto[]
}

/** POST 領取優惠券（用代碼） */
export async function claimCoupon(code: string): Promise<MemberCouponDto> {
  const res = await fetchWithAuth('/api/CouponApi/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.message ?? '領取失敗')
  }
  return (await res.json()) as MemberCouponDto
}

/** POST 試算折扣（不寫 DB） */
export async function previewDiscount(
  memberCouponId: number,
  subtotal: number,
): Promise<DiscountPreviewResultDto> {
  const res = await fetchWithAuth('/api/CouponApi/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberCouponId, subtotal }),
  })
  if (!res.ok) throw new Error('試算失敗')
  return (await res.json()) as DiscountPreviewResultDto
}
