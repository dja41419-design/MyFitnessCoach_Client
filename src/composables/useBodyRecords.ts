import { ref, computed } from 'vue'
import {
  getBodyRecords,
  createBodyRecord,
  updateBodyRecord,
  deleteBodyRecord,
  type BodyRecordDto,
  type CreateBodyRecordPayload,
  type UpdateBodyRecordPayload,
  type BodyRecordConflictError,
} from '@/data/bodyRecords'
import { calcBMI, bmiLabel } from '@/composables/useGoals'

export type { BodyRecordDto, CreateBodyRecordPayload, UpdateBodyRecordPayload, BodyRecordConflictError }

// ── Module-level singleton state ────────────────────────────────
const bodyLogs = ref<BodyRecordDto[]>([])
const isLoading = ref(false)
const isSaving  = ref(false)

// ── Public composable ───────────────────────────────────────────
export function useBodyRecords() {
  const latestLog     = computed(() => bodyLogs.value[0] ?? null)
  const currentWeight = computed(() => latestLog.value?.weight ?? null)

  async function loadBodyRecords(params?: { fromDate?: string; toDate?: string; take?: number }) {
    isLoading.value = true
    try {
      bodyLogs.value = await getBodyRecords(params)
    } finally {
      isLoading.value = false
    }
  }

  async function createBodyLog(payload: CreateBodyRecordPayload): Promise<BodyRecordDto> {
    isSaving.value = true
    try {
      const dto = await createBodyRecord(payload)
      bodyLogs.value = [dto, ...bodyLogs.value.filter(l => l.measureDate !== dto.measureDate)]
        .sort((a, b) => b.measureDate.localeCompare(a.measureDate))
      return dto
    } finally {
      isSaving.value = false
    }
  }

  async function updateBodyLog(id: number, payload: UpdateBodyRecordPayload): Promise<BodyRecordDto> {
    isSaving.value = true
    try {
      const dto = await updateBodyRecord(id, payload)
      bodyLogs.value = bodyLogs.value
        .map(l => l.id === id ? dto : l)
        .sort((a, b) => b.measureDate.localeCompare(a.measureDate))
      return dto
    } finally {
      isSaving.value = false
    }
  }

  async function deleteBodyLog(id: number): Promise<void> {
    isSaving.value = true
    try {
      await deleteBodyRecord(id)
      bodyLogs.value = bodyLogs.value.filter(l => l.id !== id)
    } finally {
      isSaving.value = false
    }
  }

  // height 由呼叫端傳入（來自 goals.value.height）
  function calcBodyBmi(weight: number, height: number): number | null {
    return calcBMI(weight, height)
  }

  function getBmiInfo(bmi: number | null): { text: string; cls: string } | null {
    return bmi ? bmiLabel(bmi) : null
  }

  return {
    bodyLogs,
    isLoading,
    isSaving,
    latestLog,
    currentWeight,
    loadBodyRecords,
    createBodyLog,
    updateBodyLog,
    deleteBodyLog,
    calcBodyBmi,
    getBmiInfo,
  }
}
