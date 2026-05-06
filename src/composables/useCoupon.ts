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
// 紀錄目前是否在「自動挑券」模式;true 時 Cart 的小計 watcher 會重跑 pickBestCoupon,
// false 時只重試算當前已選的券(尊重使用者手動選擇)。
const wasAutoPicked    = ref(false)

function isLoggedIn(): boolean {
  return !!localStorage.getItem('username')
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

  /** 一鍵領取目前清單裡所有可領取的優惠券 — 全部結束後才重整一次清單 */
  async function claimAll(): Promise<{
    ok: number
    failed: { code: string; message: string }[]
  }> {
    const codes = availableCoupons.value.map((c) => c.code)
    if (codes.length === 0) return { ok: 0, failed: [] }

    const results = await Promise.allSettled(
      codes.map((code) => apiClaimCoupon(code)),
    )

    let ok = 0
    const failed: { code: string; message: string }[] = []
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        ok++
      } else {
        const message =
          r.reason instanceof Error ? r.reason.message : '領取失敗'
        failed.push({ code: codes[i], message })
      }
    })

    await Promise.all([loadAvailable(), loadMyCoupons()])
    return { ok, failed }
  }

  /** 套用優惠券試算（手動模式：呼叫此函式代表使用者明確選了某張券） */
  async function applyCoupon(memberCouponId: number, subtotal: number): Promise<void> {
    wasAutoPicked.value = false
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

  /** 取消選用優惠券（同時離開自動模式） */
  function clearCoupon(): void {
    wasAutoPicked.value = false
    selectedMemberCouponId.value = null
    discountPreview.value = null
  }

  /**
   * 自動挑選目前最划算的一張優惠券：
   * - 對 usableMyCoupons 全部並行呼叫 previewDiscount
   * - 挑 isValid && discountAmount 最大者
   * - 同折扣時優先挑「最快到期」的(用掉快過期的)
   * - 沒有任何可用券時清空選擇並回 null
   */
  async function pickBestCoupon(
    subtotal: number,
  ): Promise<MemberCouponDto | null> {
    // 一進函式就標記:使用者意圖是「我要自動模式」,即使這次沒挑到券,
    // 下次小計變動仍要繼續幫忙挑(例如進購物車時小計太低、所有券 invalid)。
    wasAutoPicked.value = true

    if (subtotal <= 0 || usableMyCoupons.value.length === 0) {
      return null
    }

    const candidates = usableMyCoupons.value.slice()
    const previews = await Promise.all(
      candidates.map(async (mc) => {
        try {
          const result = await previewDiscount(mc.id, subtotal)
          return { mc, result }
        } catch {
          return { mc, result: null as DiscountPreviewResultDto | null }
        }
      }),
    )

    // 把「快到期程度」量化成數字(越小越快過期):
    //   visibleOnlyOnDayOfMonth(DAY22 等今日券) → 0  最優先
    //   有 expiresAt → 距今天的毫秒數
    //   都沒有 → Number.MAX_SAFE_INTEGER  排最後
    function expiryRank(mc: MemberCouponDto): number {
      if (mc.coupon.visibleOnlyOnDayOfMonth) return 0
      if (mc.expiresAt) return new Date(mc.expiresAt).getTime() - Date.now()
      return Number.MAX_SAFE_INTEGER
    }

    const valid = previews.filter(
      (p): p is { mc: MemberCouponDto; result: DiscountPreviewResultDto } =>
        p.result !== null && p.result.isValid && p.result.discountAmount > 0,
    )
    if (valid.length === 0) {
      // 沒任何可用券:清空當前選擇與試算結果,但保留 wasAutoPicked=true,
      // 讓下次小計變動(例如使用者再加商品)仍會自動嘗試挑選。
      selectedMemberCouponId.value = null
      discountPreview.value = null
      return null
    }

    valid.sort((a, b) => {
      // 1. 折扣金額 DESC
      if (b.result.discountAmount !== a.result.discountAmount) {
        return b.result.discountAmount - a.result.discountAmount
      }
      // 2. 同折扣 → 快過期的優先(rank 小的先)
      return expiryRank(a.mc) - expiryRank(b.mc)
    })

    const best = valid[0]
    selectedMemberCouponId.value = best.mc.id
    discountPreview.value = best.result
    return best.mc
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
    wasAutoPicked,

    // actions
    loadAvailable,
    loadMyCoupons,
    claim,
    claimAll,
    applyCoupon,
    clearCoupon,
    pickBestCoupon,
  }
}
