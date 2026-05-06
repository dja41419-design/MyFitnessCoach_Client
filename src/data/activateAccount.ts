export class ActivationError extends Error {
  constructor(public readonly errorCode: string) {
    super(errorCode)
    this.name = 'ActivationError'
  }
}

export async function activateAccount(token: string): Promise<void> {
  const response = await fetch(`/api/auth/activate?token=${encodeURIComponent(token)}`, {
    credentials: 'include'
  })

  if (response.ok) return

  if (response.status === 400) {
    const body = await response.json().catch(() => ({}))
    throw new ActivationError(body.error_code ?? 'UNKNOWN')
  }

  if (response.status === 404) {
    throw new ActivationError('NOT_FOUND')
  }

  throw new ActivationError('SERVER_ERROR')
}
