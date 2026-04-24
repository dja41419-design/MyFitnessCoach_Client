import { computed, type Ref } from 'vue'

export function usePasswordQuality(password: Ref<string>) {
  const rules = computed(() => {
    const p = password.value
    return {
      minLen:    p.length >= 8,
      hasUpper:  /[A-Z]/.test(p),
      hasNumber: /[0-9]/.test(p),
      hasSymbol: /[^A-Za-z0-9]/.test(p),
    }
  })

  const noSurroundingSpace = computed(() => {
    const p = password.value
    return p.length === 0 || p === p.trim()
  })

  const isValid = computed(() => {
    const r = rules.value
    return r.minLen && r.hasUpper && r.hasNumber && r.hasSymbol && noSurroundingSpace.value
  })

  const firstFailureMessage = computed((): string => {
    const p = password.value
    if (!p) return '請輸入新密碼'
    if (!noSurroundingSpace.value) return '密碼前後不可包含空白'
    const r = rules.value
    if (!r.minLen) return '密碼至少需要 8 個字元'
    if (!r.hasUpper) return '密碼需包含至少一個大寫字母'
    if (!r.hasNumber) return '密碼需包含至少一個數字'
    if (!r.hasSymbol) return '密碼需包含至少一個特殊字元'
    return ''
  })

  const strength = computed((): number => {
    if (!password.value) return 0
    const passed = Object.values(rules.value).filter(Boolean).length
    if (passed <= 1) return 1
    if (passed <= 3) return 2
    return 3
  })

  const strengthText = computed(() => ['', '弱', '中等', '強'][strength.value])
  const strengthClass = computed(() => ['', 'text-weak', 'text-medium', 'text-strong'][strength.value])

  return { rules, isValid, firstFailureMessage, strength, strengthText, strengthClass }
}
