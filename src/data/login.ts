export interface LoginRequest {
  account: string
  password: string
}

export interface LoginResponse {
  token?: string
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
    body: JSON.stringify(payload),
  })

  if (response.status === 401) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.message ?? '帳號或密碼錯誤')
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.message ?? err?.title ?? '登入失敗，請稍後再試')
  }

  return response.json()
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // Logout should still clear client state when the server request fails.
  }

  localStorage.removeItem('username')
  localStorage.removeItem('imageUrl')
  localStorage.removeItem('memberId')

  const cart = await import('@/composables/useCart')
  cart.clearCartOnLogout()
}

export interface CurrentUser {
  userId: number
  memberId?: number
  userName: string
  imageUrl?: string
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
  })

  if (response.status === 401) return null
  if (!response.ok) return null
  return response.json()
}
