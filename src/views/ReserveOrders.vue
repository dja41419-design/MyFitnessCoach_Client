<template>
  <div class="my-reservations">
    <header class="section-header">
      <div class="header-content">
        <h2 class="section-title">課程預約查詢</h2>
        <p class="section-desc">查看您過去與未來的營養諮詢預約</p>
        <div class="member-summary" v-if="memberInfo">
          <el-tag :type="memberInfo.cancelCount >= 3 ? 'danger' : 'info'" round effect="plain">
            <i class="mdi mdi-cancel mr-1"></i> 
            {{ memberInfo.cancelCount >= 3 ? '您的預約取消次數已達上限 (3/3)' : `您已累計取消：${memberInfo.cancelCount} 次` }}
          </el-tag>
        </div>
      </div>

      <!-- 取消政策提醒 -->
      <div class="cancellation-policy-notice">
        <i class="mdi mdi-alert-circle-outline"></i>
        <span v-if="memberInfo?.cancelCount >= 3" class="text-danger">您已取消預約 3 次，系統已暫時關閉您的取消功能，請聯繫客服。</span>
        <span v-else>取消預約請於諮商 <strong>40 分鐘前</strong> 辦理。</span>
      </div>
    </header>

    <div v-if="loading" class="status-box">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="reservations.length === 0" class="status-box no-data">
      <el-empty description="尚無預約紀錄">
        <el-button type="primary" @click="$router.push('/reserve')">立即預約</el-button>
      </el-empty>
    </div>

    <div v-else class="reservation-list">
      <div v-for="res in paginatedReservations" :key="res.id" class="reservation-card">
        <div class="card-header">
          <div class="instructor-info">
            <span class="instructor-name">{{ res.instructorName }} 營養師</span>
            <span class="status-badge" :class="getStatusClass(res.status)">{{ res.status }}</span>
          </div>
          <div class="reservation-time">
            <i class="mdi mdi-calendar"></i> {{ res.scheduleDate }} 
            <i class="mdi mdi-clock-outline ml-2"></i> {{ res.timeSlot }}
          </div>
        </div>
        
        <div class="card-body">
          <div class="info-item" v-if="res.target">
            <label>預約目標</label>
            <p>{{ res.target }}</p>
          </div>
          <div class="info-item" v-if="res.status === '待付款'">
            <label>付款剩餘時間</label>
            <p class="text-danger font-bold">{{ getCountdownText(res) }}</p>
          </div>
          <div class="info-item" v-if="res.memorandum">
            <label>營養師建議</label>
            <p class="suggestion">{{ res.memorandum }}</p>
          </div>
          <div class="payment-info">
            <span v-if="res.price">金額：${{ res.price }}</span>
            <span v-if="res.pointCost">點數：{{ res.pointCost }} P</span>
            <span class="method">支付方式：{{ res.paymentMethod }}</span>
          </div>
        </div>
        
        <div class="card-footer">
          <span class="create-at">預約於：{{ formatDate(res.createAt) }}</span>
          <div class="actions">
            <!-- 待付款：顯示立即付款按鈕 -->
            <el-button 
              v-if="res.status === '待付款'" 
              size="small" 
              type="primary" 
              @click="handlePayment(res)"
            >
              立即付款
            </el-button>

            <!-- 待預約/待付款：可以取消 -->
            <el-tooltip
              v-if="res.status === '已預約' || res.status === '待付款'"
              :content="memberInfo?.cancelCount >= 3 ? '取消次數已達 3 次上限，請洽客服' : (!isCancellable(res) ? '距離諮商開始不到 40 分鐘，無法取消' : '')"
              placement="top"
              :disabled="isCancellable(res) && memberInfo?.cancelCount < 3"
            >
              <span>
                <el-button 
                  size="small" 
                  type="danger" 
                  plain 
                  :disabled="!isCancellable(res) || memberInfo?.cancelCount >= 3"
                  @click="handleCancel(res)"
                >
                  取消預約
                </el-button>
              </span>
            </el-tooltip>
            
            <!-- 已完成：顯示評價按鈕 (需在 5 天內) -->
            <template v-if="res.status === '已完成' && isWithinReviewPeriod(res)">
              <el-button v-if="!res.hasReview" size="small" type="warning" plain @click="openReviewModal(res)">寫評價</el-button>
              <el-button v-else size="small" type="success" plain @click="openReviewModal(res, true)">修改評價</el-button>
            </template>
            <template v-else-if="res.status === '已完成'">
              <el-tag type="info" effect="plain" size="small">評價期已過</el-tag>
            </template>
            
            <el-button size="small" type="primary" plain @click="window.open(`/reserve/${res.instructorId}`, '_blank')">再次預約</el-button>
          </div>
        </div>
      </div>

      <!-- 分頁控制 -->
      <div class="pagination-wrapper" v-if="reservations.length > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="reservations.length"
          layout="prev, pager, next"
          background
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 評價彈窗 -->
    <el-dialog
      v-model="reviewModalVisible"
      :title="isEditing ? '修改諮詢評價' : '填寫諮詢評價'"
      width="450px"
      align-center
    >
      <div class="review-form" v-if="selectedRes">
        <div class="review-target">
          <p>您對 <strong>{{ selectedRes.instructorName }} 營養師</strong> 的諮詢滿意嗎？</p>
          <p class="res-time">{{ selectedRes.scheduleDate }} {{ selectedRes.timeSlot }}</p>
          <p class="review-deadline text-muted" style="font-size: 0.8rem;">
            評價期限：{{ getReviewDeadline(selectedRes) }} 前
          </p>
        </div>

        <div class="rating-section">
          <label>評分</label>
          <el-rate v-model="reviewForm.rating" :texts="['極差', '失望', '普通', '滿意', '極致推薦']" show-text />
        </div>

        <div class="comment-section">
          <div class="label-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label style="margin-bottom: 0;">心得建議</label>
            <span :class="{'text-danger': reviewForm.comment.length >= 100}" style="font-size: 0.8rem; color: #999;">
              {{ reviewForm.comment.length }}/100
            </span>
          </div>
          <el-input
            v-model="reviewForm.comment"
            type="textarea"
            :rows="4"
            maxlength="100"
            show-word-limit
            placeholder="請分享您的諮詢心得，您的回饋能幫助營養師提供更好的服務..."
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reviewModalVisible = false">取消</el-button>
          <el-button type="primary" :disabled="!reviewForm.rating" @click="submitReview" :loading="submitting">
            {{ isEditing ? '儲存修改' : '提交評價' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Reservation {
  id: number
  instructorId: number
  instructorName: string
  scheduleDate: string
  timeSlot: string
  status: string
  target: string | null
  memorandum: string | null
  price: number | null
  pointCost: number | null
  paymentMethod: string
  createAt: string
  hasReview: boolean
}

interface MemberInfo {
  username: string
  imageUrl: string
  points: number
  cancelCount: number
}

const reservations = ref<Reservation[]>([])
const memberInfo = ref<MemberInfo | null>(null)
const keywords = ref<string[]>([])
const loading = ref(true)
const nowRef = ref(new Date())

// 每秒更新一次現在時間，驅動倒數計時
let timerInterval: any = null
onMounted(() => {
  timerInterval = setInterval(() => {
    nowRef.value = new Date()
    
    // 檢查是否有「待付款」預約剛好過期
    const hasNewExpired = reservations.value.some(res => {
      if (res.status !== '待付款') return false
      const expireAt = new Date(new Date(res.createAt).getTime() + 10 * 1000) // 配合目前的 10 秒設定
      return nowRef.value.getTime() >= expireAt.getTime()
    })

    if (hasNewExpired) {
      // 觸發重新獲取，讓後端清理並回傳更新後的列表
      fetchReservations()
    }
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const getCountdownText = (res: Reservation) => {
  const createAt = new Date(res.createAt)
  const expireAt = new Date(createAt.getTime() + 10 * 1000) // 10 秒
  const diff = expireAt.getTime() - nowRef.value.getTime()

  if (diff <= 0) {
    // 這裡只負責顯示，實際取消由後端 API 觸發（當使用者重新整理或點擊時）
    return '已過期'
  }

  const mins = Math.floor(diff / 1000 / 60)
  const secs = Math.floor((diff / 1000) % 60)
  return `${mins} 分 ${secs} 秒`
}

// 分頁相關
const currentPage = ref(1)
const pageSize = ref(5) // 每頁顯示 5 筆

const paginatedReservations = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return reservations.value.slice(start, end)
})

const handlePageChange = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 評價相關
const reviewModalVisible = ref(false)
const submitting = ref(false)
const isEditing = ref(false)
const selectedRes = ref<Reservation | null>(null)
const reviewForm = ref({
  rating: 0,
  comment: ''
})

const fetchKeywords = async () => {
  try {
    const res = await fetch('/api/Review/Keywords')
    if (res.ok) {
      keywords.value = await res.json()
    }
  } catch (error) {
    console.error('Failed to fetch keywords:', error)
  }
}

const fetchMemberInfo = async () => {
  try {
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch('/api/Member/Info', { headers })
    if (res.ok) {
      memberInfo.value = await res.json()
    }
  } catch (error) {
    console.error('Failed to fetch member info:', error)
  }
}

const fetchReservations = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch('/api/Reservation/My', { headers })
    if (res.ok) {
      reservations.value = await res.json()
    } else {
      ElMessage.error('無法獲取預約紀錄')
    }
  } catch (error) {
    console.error('Failed to fetch reservations:', error)
    ElMessage.error('網路錯誤，請稍後再試')
  } finally {
    loading.value = false
  }
}

const isWithinReviewPeriod = (res: Reservation) => {
  if (!res || !res.scheduleDate) return false
  
  try {
    // 解析課程日期與結束時間
    let endTime = '23:59'
    if (res.timeSlot && res.timeSlot.includes('-')) {
      const parts = res.timeSlot.split('-')
      if (parts.length > 1) {
        endTime = parts[1].trim()
        if (endTime.includes('(')) {
          endTime = endTime.split('(')[0].trim()
        }
      }
    }
    
    // 補足分鐘
    if (endTime && !endTime.includes(':')) {
      endTime = `${endTime}:00`
    }

    const endDateTime = new Date(`${res.scheduleDate} ${endTime}`)
    if (isNaN(endDateTime.getTime())) return false

    const now = new Date()
    
    // 計算差距（毫秒轉天數）
    const diffDays = (now.getTime() - endDateTime.getTime()) / (1000 * 60 * 60 * 24)
    // 必須在結束後，且 5 天內
    return diffDays >= 0 && diffDays <= 5
  } catch (error) {
    console.error('Error in isWithinReviewPeriod:', error)
    return false
  }
}

const isCancellable = (res: Reservation) => {
  if (!res || (res.status !== '已預約' && res.status !== '待付款')) return false
  if (!res.scheduleDate || !res.timeSlot) return true

  try {
    // 解析開始時間，例如 "09-10(上午)" -> "09"
    let startTime = res.timeSlot.split('-')[0].trim()
    if (startTime.includes('(')) {
      startTime = startTime.split('(')[0].trim()
    }
    
    // 補足分鐘
    if (!startTime.includes(':')) {
      startTime = `${startTime}:00`
    }

    const startDateTime = new Date(`${res.scheduleDate} ${startTime}`)
    if (isNaN(startDateTime.getTime())) return true

    const now = new Date()
    
    // 計算差距（毫秒轉分鐘）
    const diffMinutes = (startDateTime.getTime() - now.getTime()) / (1000 * 60)
    
    return diffMinutes > 40
  } catch (error) {
    console.error('Error in isCancellable:', error)
    return true
  }
}

const getReviewDeadline = (res: Reservation) => {
  if (!res || !res.scheduleDate) return ''
  
  try {
    let endTime = '23:59'
    if (res.timeSlot && res.timeSlot.includes('-')) {
      const parts = res.timeSlot.split('-')
      if (parts.length > 1) {
        endTime = parts[1].trim()
        if (endTime.includes('(')) {
          endTime = endTime.split('(')[0].trim()
        }
      }
    }

    if (endTime && !endTime.includes(':')) {
      endTime = `${endTime}:00`
    }
    
    const endDateTime = new Date(`${res.scheduleDate} ${endTime}`)
    if (isNaN(endDateTime.getTime())) return ''

    const deadlineDate = new Date(endDateTime.getTime() + 5 * 24 * 60 * 60 * 1000)
    
    return deadlineDate.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error in getReviewDeadline:', error)
    return ''
  }
}

const openReviewModal = async (res: Reservation, edit = false) => {
  selectedRes.value = res
  isEditing.value = edit
  
  if (edit) {
    try {
      const response = await fetch(`/api/Review/Reservation/${res.id}`)
      if (response.ok) {
        const review = await response.json()
        reviewForm.value = { 
          rating: review.rating, 
          comment: review.text || review.comment || ''
        }
      } else {
        ElMessage.error('無法獲取原始評價內容')
        reviewForm.value = { rating: 5, comment: '' }
      }
    } catch (error) {
      console.error('Failed to fetch review:', error)
      reviewForm.value = { rating: 5, comment: '' }
    }
  } else {
    reviewForm.value = { rating: 5, comment: '' }
  }
  
  reviewModalVisible.value = true
}

const submitReview = async () => {
  if (!selectedRes.value) return
  
  // 敏感字檢查
  const foundKeywords = keywords.value.filter(word => reviewForm.value.comment.includes(word))
  if (foundKeywords.length > 0) {
    try {
      await ElMessageBox.confirm(
        `您的評論中包含敏感或負面詞彙（如：${foundKeywords.join('、')}），您確定要送出嗎？`,
        '內容檢查提醒',
        {
          confirmButtonText: '確定送出',
          cancelButtonText: '返回修改',
          type: 'warning'
        }
      )
    } catch {
      // 使用者點擊取消，中斷送出
      return
    }
  }

  submitting.value = true
  try {
    const method = isEditing.value ? 'PUT' : 'POST'
    const res = await fetch('/api/Review', {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservationId: selectedRes.value.id,
        rating: reviewForm.value.rating,
        comment: reviewForm.value.comment
      })
    })

    if (res.ok) {
      ElMessage.success(isEditing.value ? '評價修改成功！' : '感謝您的評價！')
      reviewModalVisible.value = false
      fetchReservations() // 重新整理列表，更新已評價狀態
    } else {
      ElMessage.error(isEditing.value ? '修改評價失敗' : '提交評價失敗')
    }
  } catch (error) {
    console.error('Failed to submit review:', error)
    ElMessage.error('網路錯誤，請稍後再試')
  } finally {
    submitting.value = false
  }
}

const goToReserve = (instructorId: number) => {
  window.open(`/reserve/${instructorId}`, '_blank')
}

const handlePayment = async (res: Reservation) => {
  try {
    const token = localStorage.getItem('token')
    const formData = new URLSearchParams()
    formData.append('reservationId', res.id.toString())

    const payHeaders: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' }
    if (token) payHeaders['Authorization'] = `Bearer ${token}`

    const response = await fetch('/api/Payment/ReservationSendToEcPay', {
      method: 'POST',
      headers: payHeaders,
      body: formData
    })

    if (response.ok) {
      const data = await response.json()
      
      // 建立隱藏表單並提交到綠界
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = data.action

      for (const key in data.parameters) {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = data.parameters[key]
        form.appendChild(input)
      }

      document.body.appendChild(form)
      form.submit()
    } else {
      ElMessage.error('無法啟動支付流程，請稍後再試')
    }
  } catch (error) {
    console.error('Payment error:', error)
    ElMessage.error('支付請求失敗')
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case '待付款': return 'status-waiting'
    case '已預約': return 'status-pending'
    case '已完成': return 'status-completed'
    case '已取消': return 'status-cancelled'
    default: return ''
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleCancel = (res: Reservation) => {
  if (!res) return
  
  if (!isCancellable(res)) {
    ElMessage.warning('距離諮商開始不到 40 分鐘，無法取消預約')
    return
  }

  ElMessageBox.confirm('確定要取消此預約嗎？\n取消後該時段將釋出供他人預約。', '取消確認', {
    confirmButtonText: '確定取消',
    cancelButtonText: '保留預約',
    type: 'warning'
  }).then(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/Reservation/${res.id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      
      if (response.ok) {
        ElMessage.success('預約已成功取消')
        fetchReservations() // 刷新預約列表
        fetchMemberInfo()   // 即時更新累計取消次數
      } else {
        try {
          const error = await response.json()
          ElMessage.error(error.message || '取消失敗')
        } catch {
          ElMessage.error(`取消失敗（${response.status}）`)
        }
      }
    } catch (error) {
      console.error('Failed to cancel reservation:', error)
      ElMessage.error('網路錯誤，請稍後再試')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchMemberInfo()
  fetchReservations()
  fetchKeywords()
})
</script>

<style scoped>
.my-reservations {
  padding: 0; 
  min-height: 80vh;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.section-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.section-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
}

.member-summary {
  margin-top: 12px;
}

/* 優化提醒框樣式 */
.cancellation-policy-notice {
  background-color: #fff;
  border: 1px solid #ffd599;
  border-left: 4px solid #ff9800;
  border-radius: 8px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #663c00;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.05);
}

.cancellation-policy-notice i {
  font-size: 1.1rem;
  color: #ff9800;
}

.cancellation-policy-notice strong {
  color: #d32f2f;
  text-decoration: underline;
}

.status-box {
  padding: 40px;
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.reservation-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reservation-card {
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.reservation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.card-header {
  padding: 20px 25px;
  background: var(--bg-card);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.instructor-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-right: 15px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-waiting   { background: #fce4ec; color: #c2185b; }
.status-pending   { background: #fff8e1; color: #f57c00; }
.status-completed { background: #e8f5e9; color: #2e7d32; }
.status-cancelled { background: #fdf0ee; color: #c62828; }

.reservation-time { color: var(--text-secondary); font-size: 0.95rem; }

.card-body { padding: 25px; }

.info-item { margin-bottom: 15px; }
.info-item label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 5px; font-weight: 600; }
.info-item p { color: var(--text-primary); line-height: 1.6; }

.suggestion {
  padding: 12px;
  background: #f9f7f5;
  border-left: 4px solid var(--accent);
  border-radius: 4px;
  font-style: italic;
}

.payment-info {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed var(--border);
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.card-footer {
  padding: 15px 25px;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border);
}

.create-at { font-size: 0.8rem; color: #999; }
.actions { display: flex; gap: 10px; align-items: center; }
.actions :deep(.el-tooltip__trigger) { display: inline-flex; }

.pagination-wrapper {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

/* 評價彈窗樣式 */
.review-form { display: flex; flex-direction: column; gap: 20px; }
.review-target { text-align: center; margin-bottom: 10px; }
.res-time { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.review-form label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem; }

.ml-2 { margin-left: 8px; }

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .cancellation-policy-notice {
    width: 100%;
  }

  .card-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .card-footer { flex-direction: column; gap: 15px; align-items: flex-start; }
  .actions { width: 100%; display: flex; justify-content: flex-end; }
}
</style>
