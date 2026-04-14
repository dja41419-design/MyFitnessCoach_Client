import { ref } from 'vue'

// ─────────────────────────────────────────────
// 【營養師輪播】ref 綁定 DOM，計算偏移並 transform
// ─────────────────────────────────────────────
export function useNutriCarousel() {
  const nutriTrackRef = ref<HTMLElement | null>(null)
  let nutriIndex = 0

  function slideNutri(dir: number): void {
    const track = nutriTrackRef.value
    if (!track) return

    const cards = track.querySelectorAll<HTMLElement>('.nutri-card')
    if (!cards.length) return

    const cardWidth = cards[0].offsetWidth + 20 // 卡片寬度 + gap
    const maxIndex = Math.max(
      0,
      cards.length - Math.floor(track.parentElement!.offsetWidth / cardWidth),
    )

    nutriIndex = Math.max(0, Math.min(nutriIndex + dir, maxIndex))
    track.style.transform = `translateX(-${nutriIndex * cardWidth}px)`
  }

  return { nutriTrackRef, slideNutri }
}
