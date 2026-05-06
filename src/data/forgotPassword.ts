export class RateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number | undefined) {
    super('rate_limit')
    this.name = 'RateLimitError'
  }
}

//前端向後端發出http post請求，將使用者輸入的 email 以 JSON 格式送出，等待後端回應後再根據狀態碼決定是否拋出錯誤。
export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch('/api/auth/forgotpassword', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  })

  if (response.status === 429) {
    const data = await response.json().catch(() => ({}))
    throw new RateLimitError(data?.retryAfterSeconds)
  }

  if (!response.ok) {
    throw new Error('伺服器錯誤，請稍後再試')
  }
}
