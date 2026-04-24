import { fetchWithAuth } from './fetchWithAuth'

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export async function changePassword(payload: ChangePasswordRequest): Promise<void> {
  const response = await fetchWithAuth('/api/auth/ChangePassword', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (response.status === 401) {
    throw new Error('舊密碼不正確')
  }
  if (response.status === 400) {
    const data = await response.json().catch(() => ({}))
    throw new Error((data as { message?: string }).message ?? '密碼不符合規則')
  }
  if (!response.ok) {
    throw new Error('伺服器錯誤，請稍後再試')
  }
}
