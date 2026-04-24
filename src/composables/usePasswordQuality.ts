import { computed, type Ref } from 'vue'
import { hasKeyboardSequence, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '@/utils/validators'

export function usePasswordQuality(password: Ref<string>) {
  const rules = computed(() => {
    const p = password.value
    return {
      minLen:        p.length >= PASSWORD_MIN_LENGTH,
      maxLen:        p.length > 0 && p.length <= PASSWORD_MAX_LENGTH,
      hasUpper:      /[A-Z]/.test(p),
      hasNumber:     /[0-9]/.test(p),
      hasSymbol:     /[^A-Za-z0-9]/.test(p),
      noKeyboardSeq: p.length === 0 || !hasKeyboardSequence(p),
    }
  })

  const noSurroundingSpace = computed(() => {
    const p = password.value
    return p.length === 0 || p === p.trim()
  })

  const isValid = computed(() => {
    const r = rules.value
    return r.minLen && r.maxLen && r.hasUpper && r.hasNumber && r.hasSymbol && r.noKeyboardSeq && noSurroundingSpace.value
  })

  const firstFailureMessage = computed((): string => {
    const p = password.value
    if (!p) return '請輸入新密碼'
    if (!noSurroundingSpace.value) return '密碼前後不可包含空白'
    const r = rules.value
    if (!r.minLen) return `密碼至少需要 ${PASSWORD_MIN_LENGTH} 個字元`
    if (!r.maxLen) return `密碼長度不可超過 ${PASSWORD_MAX_LENGTH} 個字元`
    if (!r.hasUpper) return '密碼需包含至少一個大寫字母'
    if (!r.hasNumber) return '密碼需包含至少一個數字'
    if (!r.hasSymbol) return '密碼需包含至少一個特殊字元'
    if (!r.noKeyboardSeq) return '密碼不可包含鍵盤連續字串（如 asdfgh、qwerty、123456）'
    return ''
  })

  const strength = computed((): number => {
    if (!password.value) return 0
    const r = rules.value
    const passed = [r.minLen && r.maxLen, r.hasUpper, r.hasNumber, r.hasSymbol, r.noKeyboardSeq].filter(Boolean).length
    if (passed <= 2) return 1
    if (passed <= 4) return 2
    return 3
  })

  const strengthText = computed(() => ['', '弱', '中等', '強'][strength.value])
  const strengthClass = computed(() => ['', 'text-weak', 'text-medium', 'text-strong'][strength.value])

  return { rules, isValid, firstFailureMessage, strength, strengthText, strengthClass }
}
