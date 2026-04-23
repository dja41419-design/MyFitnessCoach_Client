import router from '@/router'

/**
 * 帶 JWT token 的 fetch 輔助函式
 *
 * 行為：
 * - 自動從 localStorage 讀取 token，塞進 Authorization header（若呼叫端未自帶）
 * - 收到 401 時自動清除登入資訊、導向 /login 並帶 returnUrl
 * - 非 401 錯誤交給呼叫端自行處理（透過 res.ok）
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('token')
  const headers = new Headers(init.headers)

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(input, { ...init, headers })

  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('imageUrl')
    const currentPath = router.currentRoute.value.fullPath
    router.push({ name: 'login', query: { returnUrl: currentPath } })
  }

  return res
}
