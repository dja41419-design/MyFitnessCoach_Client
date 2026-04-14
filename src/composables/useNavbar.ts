import { ref, onMounted, onUnmounted } from 'vue'

// ─────────────────────────────────────────────
// 【Navbar】捲動效果 + 手機選單 + 平滑捲動
// ─────────────────────────────────────────────
export function useNavbar() {
  const isScrolled = ref(false)
  const isMobileMenuOpen = ref(false)

  function handleScroll(): void {
    isScrolled.value = window.scrollY > 40
  }

  /** 開啟時鎖定 body 捲動，關閉時解鎖 */
  function toggleMenu(): void {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
    document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
  }

  /** 平滑捲動至指定 selector */
  function scrollTo(selector: string): void {
    const target = document.querySelector(selector)
    if (target) target.scrollIntoView({ behavior: 'smooth' })
  }

  /** 手機選單連結點擊：先關閉選單，再平滑捲動 */
  function menuScrollTo(selector: string): void {
    toggleMenu()
    scrollTo(selector)
  }

  onMounted(() => window.addEventListener('scroll', handleScroll))
  onUnmounted(() => window.removeEventListener('scroll', handleScroll))

  return { isScrolled, isMobileMenuOpen, toggleMenu, scrollTo, menuScrollTo }
}
