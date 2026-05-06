export class ResendRateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number | undefined) {
    super('Too many requests')
    this.name = 'ResendRateLimitError'
  }
}

export async function resendActivation(email: string): Promise<void> {
  const response = await fetch('/api/auth/resend-activation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email })
  })

  if (response.ok) return

  if (response.status === 429) {
    const body = await response.json().catch(() => ({}))
    throw new ResendRateLimitError(body.retryAfterSeconds)
  }

  throw new Error('伺服器錯誤，請稍後再試')
}
