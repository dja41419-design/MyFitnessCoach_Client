import router from '@/router'

/**
 * 受保護 API 的 fetch 輔助函式
 *
 * 行為：
 * - 透過 credentials: 'include' 讓瀏覽器自動帶上 HttpOnly access_token cookie
 * - 收到 401 時清除前端使用者狀態、導向 /login 並帶 returnUrl
 * - 非 401 錯誤交給呼叫端自行處理（透過 res.ok）
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const res = await fetch(input, { ...init, credentials: 'include' })

  if (res.status === 401) {
    localStorage.removeItem('username')
    localStorage.removeItem('imageUrl')
    const currentPath = router.currentRoute.value.fullPath
    router.push({ name: 'login', query: { returnUrl: currentPath } })
  }

  return res
}
