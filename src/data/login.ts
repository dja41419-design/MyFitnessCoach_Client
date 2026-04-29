export interface LoginRequest {
  account: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: number
  memberId?: number
  userName: string
  imageUrl?: string
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  })

  if (response.status === 401) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.message ?? '帳號或密碼錯誤')
  }

  if (!response.ok) {
    throw new Error('伺服器錯誤，請稍後再試')
  }

  return response.json()
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
  } catch {
    // 呼叫失敗仍繼續清前端狀態，避免 UI 卡住
  }
  localStorage.removeItem('username')
  localStorage.removeItem('imageUrl')
  localStorage.removeItem('memberId')
  // 清空前端購物車 state + localStorage,避免下一個訪客看到前一位使用者的商品
  // 動態 import 避免循環依賴(useCart 會 import fetchWithAuth,fetchWithAuth 會 import router)
  const m = await import('@/composables/useCart')
  m.clearCartOnLogout()
}

export interface CurrentUser {
  userId: number
  userName: string
  imageUrl?: string
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include'
  })
  if (response.status === 401) return null
  if (!response.ok) return null
  return response.json()
}
