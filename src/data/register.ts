export interface RegisterRequest {
  name: string
  account: string
  password: string
  email: string
  phone: string
}

export interface RegisterResponse {
  message: string
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (response.status === 409) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.message ?? '帳號或信箱已被使用')
  }

  if (!response.ok) {
    throw new Error('伺服器錯誤，請稍後再試')
  }

  return response.json()
}
