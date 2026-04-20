<template>
  <div class="my-reservations">
    <!-- 精簡會員狀態條 (JVID 風格) -->
    <div class="user-status-bar" v-if="memberInfo">
      <div class="user-info-group">
        <div class="user-avatar-mini">
          <img :src="memberInfo.avatar || '/assets/logo.png'" alt="User" />
        </div>
        <span class="user-name">{{ memberInfo.name }}</span>
        <div class="user-points-badge">
          <i class="mdi mdi-rhombus"></i>
          <span class="points-count">{{ memberInfo.points }}</span>
        </div>
      </div>
      <div class="status-label">
        <i class="mdi mdi-history"></i> 預約管理中心
      </div>
    </div>

    <div class="header">
      <h1>我的預約紀錄</h1>
      <p class="subtitle">查看您過去與未來的營養諮詢預約</p>
    </div>

    <div v-if="loading" class="status-box">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="reservations.length === 0" class="status-box no-data">
      <el-empty description="尚無預約紀錄">
        <el-button type="primary" @click="$router.push('/reserve')">立即預約</el-button>
      </el-empty>
    </div>

    <div v-else class="reservation-list">
      <div v-for="res in reservations" :key="res.id" class="reservation-card">
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
            <!-- 待諮詢/已預約：可以取消 -->
            <el-button v-if="res.status === '已預約'" size="small" type="danger" plain @click="handleCancel(res.id)">取消預約</el-button>
            
            <!-- 已完成：顯示評價按鈕 -->
            <template v-if="res.status === '已完成'">
              <el-button v-if="!res.hasReview" size="small" type="warning" plain @click="openReviewModal(res)">寫評價</el-button>
              <el-tag v-else type="success" effect="plain" size="small">已評價</el-tag>
            </template>
            
            <el-button size="small" type="primary" plain @click="$router.push(`/reserve/${res.instructorId}`)">再次預約</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 評價彈窗 -->
    <el-dialog
      v-model="reviewModalVisible"
      title="填寫諮詢評價"
      width="450px"
      align-center
    >
      <div class="review-form" v-if="selectedRes">
        <div class="review-target">
          <p>您對 <strong>{{ selectedRes.instructorName }} 營養師</strong> 的諮詢滿意嗎？</p>
          <p class="res-time">{{ selectedRes.scheduleDate }} {{ selectedRes.timeSlot }}</p>
        </div>

        <div class="rating-section">
          <label>評分</label>
          <el-rate v-model="reviewForm.rating" :texts="['極差', '失望', '普通', '滿意', '極致推薦']" show-text />
        </div>

        <div class="comment-section">
          <label>心得建議</label>
          <el-input
            v-model="reviewForm.comment"
            type="textarea"
            :rows="4"
            placeholder="請分享您的諮詢心得，您的回饋能幫助營養師提供更好的服務..."
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reviewModalVisible = false">取消</el-button>
          <el-button type="primary" :disabled="!reviewForm.rating" @click="submitReview" :loading="submitting">
            提交評價
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Reservation {
  id: number
  memberId: number
  instructorId: number
  instructorName: string
  scheduleDate: string
  timeSlot: string
  status: string
  target?: string
  memorandum?: string
  price?: number
  pointCost?: number
  paymentMethod: string
  createAt: string
  hasReview: bool
}

interface MemberInfo {
  name: string
  avatar: string
  points: number
}

const reservations = ref<Reservation[]>([])
const memberInfo = ref<MemberInfo | null>(null)
const loading = ref(true)

// 評價相關
const reviewModalVisible = ref(false)
const submitting = ref(false)
const selectedRes = ref<Reservation | null>(null)
const reviewForm = ref({
  rating: 0,
  comment: ''
})

const fetchMemberInfo = async () => {
  try {
    const res = await fetch('/api/Member/Info')
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
    const res = await fetch('/api/Reservation/My')
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

const openReviewModal = (res: Reservation) => {
  selectedRes.value = res
  reviewForm.value = { rating: 5, comment: '' }
  reviewModalVisible.value = true
}

const submitReview = async () => {
  if (!selectedRes.value) return
  
  submitting.value = true
  try {
    const res = await fetch('/api/Review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservationId: selectedRes.value.id,
        rating: reviewForm.value.rating,
        comment: reviewForm.value.comment
      })
    })

    if (res.ok) {
      ElMessage.success('感謝您的評價！')
      reviewModalVisible.value = false
      fetchReservations() // 重新整理列表，更新已評價狀態
    } else {
      ElMessage.error('提交評價失敗')
    }
  } catch (error) {
    console.error('Failed to submit review:', error)
    ElMessage.error('網路錯誤，請稍後再試')
  } finally {
    submitting.value = false
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case '已預約': return 'status-pending'
    case '已完成': return 'status-completed'
    case '已取消': return 'status-cancelled'
    default: return ''
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleCancel = (id: number) => {
  ElMessageBox.confirm('確定要取消此預約嗎？\n取消後該時段將釋出供他人預約。', '取消確認', {
    confirmButtonText: '確定取消',
    cancelButtonText: '保留預約',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await fetch(`/api/Reservation/${id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        ElMessage.success('預約已成功取消')
        fetchReservations()
      } else {
        const error = await res.json()
        ElMessage.error(error.message || '取消失敗')
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
})
</script>

<style scoped>
.my-reservations {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 20px;
  min-height: 80vh;
}

.user-status-bar {
  background: #fdfaf5;
  border: 1px solid rgba(196, 168, 130, 0.2);
  border-radius: 100px;
  padding: 10px 24px;
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}

.user-info-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-mini {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid var(--accent);
}

.user-avatar-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.user-points-badge {
  display: flex;
  align-items: center; gap: 4px;
  background: #fff;
  padding: 4px 12px;
  border-radius: 100px;
  border: 1px solid rgba(196, 168, 130, 0.3);
  margin-left: 8px;
}

.user-points-badge i { color: #d4b892; font-size: 1rem; }
.points-count { font-weight: 700; color: var(--accent-dark); font-size: 0.9rem; }

.status-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.header {
  margin-bottom: 40px;
  text-align: center;
}

.header h1 {
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.subtitle { color: var(--text-secondary); font-size: 1.1rem; }

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

.status-pending { background: #fff8e1; color: #f57c00; }
.status-completed { background: #e8f5e9; color: #2e7d32; }
.status-cancelled { background: #ffeea; color: #c62828; }

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
.actions { display: flex; gap: 10px; }

/* 評價彈窗樣式 */
.review-form { display: flex; flex-direction: column; gap: 20px; }
.review-target { text-align: center; margin-bottom: 10px; }
.res-time { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.review-form label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem; }

.ml-2 { margin-left: 8px; }

@media (max-width: 768px) {
  .user-status-bar { flex-direction: column; border-radius: 20px; gap: 10px; text-align: center; }
  .card-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .card-footer { flex-direction: column; gap: 15px; align-items: flex-start; }
  .actions { width: 100%; display: flex; justify-content: flex-end; }
}
</style>
