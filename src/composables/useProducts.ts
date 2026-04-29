import { ref } from 'vue'
import { fetchLandingPageProducts, type Product } from '@/data/products'

export function useProducts() {
  const landingProducts = ref<Product[]>([])

  const loadLandingProducts = async (limit: number = 4) => {
    landingProducts.value = await fetchLandingPageProducts(limit)
  }

  return {
    landingProducts,
    loadLandingProducts,
  }
}
