export interface LoginRequest {
  account: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: number
  username: string
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

export function logout(): void {
  localStorage.removeItem('token')
}
