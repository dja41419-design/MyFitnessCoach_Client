import { fetchWithAuth } from './fetchWithAuth'

export interface BodyRecordDto {
  id: number
  measureDate: string           // 'yyyy-MM-dd'
  weight: number
  bodyFat: number | null
  skeletalMuscle: number | null
  waistCircumference: number | null
  hipCircumference: number | null
  note: string | null
  imageUrl: string | null
}

export interface CreateBodyRecordPayload {
  measureDate: string
  weight: number
  bodyFat?: number | null
  skeletalMuscle?: number | null
  waistCircumference?: number | null
  hipCircumference?: number | null
  note?: string | null
  photo?: File | null
}

export interface UpdateBodyRecordPayload extends CreateBodyRecordPayload {}

export interface BodyRecordConflictError extends Error {
  existingId: number
}

function toFormData(payload: CreateBodyRecordPayload | UpdateBodyRecordPayload): FormData {
  const form = new FormData()
  form.append('measureDate', payload.measureDate)
  form.append('weight', String(payload.weight))
  if (payload.bodyFat != null)           form.append('bodyFat',            String(payload.bodyFat))
  if (payload.skeletalMuscle != null)    form.append('skeletalMuscle',     String(payload.skeletalMuscle))
  if (payload.waistCircumference != null) form.append('waistCircumference', String(payload.waistCircumference))
  if (payload.hipCircumference != null)  form.append('hipCircumference',   String(payload.hipCircumference))
  if (payload.note != null)              form.append('note',               payload.note)
  if (payload.photo)                     form.append('photo',              payload.photo)
  // 不設定 Content-Type，讓瀏覽器自動帶 multipart boundary
  return form
}

export async function getBodyRecords(params?: {
  fromDate?: string
  toDate?: string
  take?: number
}): Promise<BodyRecordDto[]> {
  const query = new URLSearchParams()
  if (params?.fromDate) query.set('fromDate', params.fromDate)
  if (params?.toDate)   query.set('toDate',   params.toDate)
  if (params?.take)     query.set('take',     String(params.take))
  const res = await fetchWithAuth(`/api/BodyRecord?${query}`)
  if (!res.ok) throw new Error('載入體態紀錄失敗')
  return res.json()
}

export async function createBodyRecord(payload: CreateBodyRecordPayload): Promise<BodyRecordDto> {
  const res = await fetchWithAuth('/api/BodyRecord', {
    method: 'POST',
    body: toFormData(payload),
  })
  if (res.status === 409) {
    const body = await res.json()
    const err  = Object.assign(new Error(body.message ?? '此日期已有量測紀錄'), {
      existingId: body.existingId as number,
    }) as BodyRecordConflictError
    throw err
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as any).message ?? '新增體態紀錄失敗')
  }
  return res.json()
}

export async function updateBodyRecord(id: number, payload: UpdateBodyRecordPayload): Promise<BodyRecordDto> {
  const res = await fetchWithAuth(`/api/BodyRecord/${id}`, {
    method: 'PUT',
    body: toFormData(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as any).message ?? '更新體態紀錄失敗')
  }
  return res.json()
}

export async function deleteBodyRecord(id: number): Promise<void> {
  const res = await fetchWithAuth(`/api/BodyRecord/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('刪除體態紀錄失敗')
}
