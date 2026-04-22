export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export async function changePassword(payload: ChangePasswordRequest): Promise<void> {
  const token = localStorage.getItem('token') ?? ''
  const response = await fetch('/api/auth/password/change', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })

  if (response.status === 401) {
    throw new Error('舊密碼不正確')
  }
  if (!response.ok) {
    throw new Error('伺服器錯誤，請稍後再試')
  }
}
