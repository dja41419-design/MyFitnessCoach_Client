//這裡的token是從使用者點擊忘記密碼郵件中的連結獲取的https://example.com/reset-password?token=xxxxxxxx
// 使用者點擊信件連結，前端從 route.query.token 讀取 URL 上的 token，使用者輸入新密碼後，resetPassword(token, newPassword) 將這個 token 連同新密碼送回後端驗證
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const response = await fetch('/api/auth/resetpassword', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token, newPassword }),
  })

  if (response.status === 400) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data?.message ?? '連結已失效或過期，請重新申請')
  }

  if (!response.ok) {
    throw new Error('伺服器錯誤，請稍後再試')
  }
}
