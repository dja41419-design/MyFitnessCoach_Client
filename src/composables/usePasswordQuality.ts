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

  const strength = computed((): number => {
    if (!password.value) return 0
    const passed = Object.values(rules.value).filter(Boolean).length
    if (passed <= 1) return 1
    if (passed <= 3) return 2
    return 3
  })

  const strengthText = computed(() => ['', '弱', '中等', '強'][strength.value])
  const strengthClass = computed(() => ['', 'text-weak', 'text-medium', 'text-strong'][strength.value])

  return { rules, strength, strengthText, strengthClass }
}
