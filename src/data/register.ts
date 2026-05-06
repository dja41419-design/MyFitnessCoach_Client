export interface RegisterRequest {
  userName: string
  account: string
  password: string
  email: string
  mobile: string
  gender: 'M' | 'F'
  dateOfBirth: string
}

export interface RegisterResponse {
  message: string
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  if (response.status === 409) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.message ?? '帳號或電子信箱已被使用')
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const firstFieldError =
      err?.errors && typeof err.errors === 'object'
        ? (Object.values(err.errors as Record<string, string[]>).flat()[0] as string | undefined)
        : undefined

    throw new Error(err?.message ?? firstFieldError ?? err?.title ?? '註冊失敗，請確認輸入資料')
  }

  return response.json()
}
