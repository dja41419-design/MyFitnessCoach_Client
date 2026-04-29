import { ref, computed } from 'vue'
import {
  fetchAvailableCoupons,
  fetchMyCoupons,
  claimCoupon as apiClaimCoupon,
  previewDiscount,
  type CouponDto,
  type MemberCouponDto,
  type DiscountPreviewResultDto,
} from '@/data/coupon'

// ----- Module-level state ---------------------------------------------------
// 採用 useCart.ts 同樣的單例模式：所有頁面共用同一份 state
// （購物車頁試算的選擇 → 結帳頁、其他頁可直接讀取）

const availableCoupons = ref<CouponDto[]>([])
const myCoupons        = ref<MemberCouponDto[]>([])
const selectedMemberCouponId = ref<number | null>(null)
const discountPreview  = ref<DiscountPreviewResultDto | null>(null)

function isLoggedIn(): boolean {
  return !!localStorage.getItem('token')
}

// ----- Exported API ---------------------------------------------------------

export function useCoupon() {
  /** 重新載入「可領取」清單 */
  async function loadAvailable(): Promise<void> {
    if (!isLoggedIn()) {
      availableCoupons.value = []
      return
    }
    try {
      availableCoupons.value = await fetchAvailableCoupons()
    } catch {
      availableCoupons.value = []
    }
  }

  /** 重新載入「我的優惠券」清單 */
  async function loadMyCoupons(): Promise<void> {
    if (!isLoggedIn()) {
      myCoupons.value = []
      return
    }
    try {
      myCoupons.value = await fetchMyCoupons()
    } catch {
      myCoupons.value = []
    }
  }

  /** 領取優惠券（用代碼）— 成功後重整兩個清單 */
  async function claim(code: string): Promise<MemberCouponDto> {
    const result = await apiClaimCoupon(code)
    await Promise.all([loadAvailable(), loadMyCoupons()])
    return result
  }

  /** 套用優惠券試算 */
  async function applyCoupon(memberCouponId: number, subtotal: number): Promise<void> {
    if (subtotal <= 0) {
      discountPreview.value = {
        isValid: false,
        discountAmount: 0,
        finalTotal: 0,
        message: '購物車金額為 0',
      }
      return
    }
    try {
      const result = await previewDiscount(memberCouponId, subtotal)
      discountPreview.value = result
      selectedMemberCouponId.value = result.isValid ? memberCouponId : null
    } catch {
      discountPreview.value = {
        isValid: false,
        discountAmount: 0,
        finalTotal: 0,
        message: '試算失敗',
      }
      selectedMemberCouponId.value = null
    }
  }

  /** 取消選用優惠券 */
  function clearCoupon(): void {
    selectedMemberCouponId.value = null
    discountPreview.value = null
  }

  /** 在購物車頁要顯示的「可選用」清單：自己領的、且未使用 */
  const usableMyCoupons = computed<MemberCouponDto[]>(() =>
    myCoupons.value.filter((mc) => !mc.isUsed),
  )

  return {
    // state
    availableCoupons,
    myCoupons,
    usableMyCoupons,
    selectedMemberCouponId,
    discountPreview,

    // actions
    loadAvailable,
    loadMyCoupons,
    claim,
    applyCoupon,
    clearCoupon,
  }
}
