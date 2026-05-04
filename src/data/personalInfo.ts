import { fetchWithAuth } from './fetchWithAuth'

export interface PersonalInfoDto {
  userId: number
  memberId: number
  userName: string
  email: string
  mobile: string
  gender: 'M' | 'F' | null
  dateOfBirth: string | null  // 'YYYY-MM-DD'
  imageUrl: string | null
}

export interface UpdatePersonalInfoRequest {
  userName: string
  gender: 'M' | 'F'
  dateOfBirth: string  // 'YYYY-MM-DD'
}

export interface AvatarUploadResponse {
  imageUrl: string
}

export async function getPersonalInfo(): Promise<PersonalInfoDto> {
  const res = await fetchWithAuth('/api/Member/personal-info')
  if (!res.ok) throw new Error('載入個人資料失敗')
  return res.json()
}

export async function updatePersonalInfo(dto: UpdatePersonalInfoRequest): Promise<PersonalInfoDto> {
  const res = await fetchWithAuth('/api/Member/personal-info', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })
  if (res.status === 409) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message ?? '資料已被其他帳號使用')
  }
  if (!res.ok) throw new Error('更新個人資料失敗')
  return res.json()
}

export async function uploadAvatar(file: File): Promise<AvatarUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetchWithAuth('/api/Member/avatar', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message ?? '頭像上傳失敗')
  }
  return res.json()
}
