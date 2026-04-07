/**
 * useReveal — 入場動畫 composable（選配）
 *
 * 使用方式：
 *   1. 在需要動畫的元素加上 class="reveal"（可搭配 .rd0~.rd4 延遲）
 *   2. 在元件 <script setup> 中呼叫 useReveal()
 *
 * 範例：
 *   import { useReveal } from '@/composables/useReveal'
 *   useReveal()                       // 觀察整個元件內的 .reveal
 *   useReveal({ threshold: 0.3 })     // 自訂觸發門檻
 *   useReveal({ root: sectionRef })   // 限定範圍（傳入 ref）
 *
 * CSS 定義在 global.css，元件內不需要重複寫 .reveal 樣式。
 */
import { onMounted, onUnmounted, unref } from 'vue'

export function useReveal(options = {}) {
  const { threshold = 0.15, root = null } = options
  let observer = null

  onMounted(() => {
    const scope = unref(root) || document
    const elements = scope.querySelectorAll('.reveal:not(.visible)')

    if (elements.length === 0) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold }
    )

    elements.forEach((el) => observer.observe(el))
  })

  onUnmounted(() => {
    observer?.disconnect()
  })
}
