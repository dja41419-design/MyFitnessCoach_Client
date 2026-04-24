<template>
  <div class="reserve-detail" v-if="instructor">
    <!-- 頂部：營養師資訊 -->
    <div class="instructor-info">
      <div class="info-card-top">
        <div class="img-wrap-small">
          <img :src="instructor.img" :alt="instructor.name" />
        </div>
        <div class="details-top">
          <span class="specialty">{{ instructor.specialty }}</span>
          <h1>{{ instructor.name }}</h1>
          <div class="tags-small">
            <span v-for="tag in instructor.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 精簡會員狀態條 -->
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
        <span class="dot"></span> 預約系統已就緒
      </div>
    </div>

    <!-- 下方：預約表單 -->
    <div class="booking-form">
      <div class="form-header">
        <h2>預約諮詢時段</h2>
        <p class="subtitle">請選擇您方便的日期與時間，我們將盡快為您確認預約。</p>
      </div>

      <form @submit.prevent="handleReserve" class="reserve-form-layout">
        <div class="form-section main-section">
          <div class="form-group">
            <label>選擇日期</label>
            <div class="calendar-container large">
              <div class="calendar-header">
                <button type="button" class="month-nav" @click="prevMonth">&lt;</button>
                <span class="current-month">{{ currentYear }}年 {{ currentMonth + 1 }}月</span>
                <button type="button" class="month-nav" @click="nextMonth">&gt;</button>
              </div>
              
              <div class="calendar-weekdays">
                <span v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day">{{ day }}</span>
              </div>
              
              <div class="calendar-grid">
                <div 
                  v-for="blank in firstDayOfMonth" 
                  :key="'blank-'+blank" 
                  class="calendar-day empty"
                ></div>
                <button
                  type="button"
                  v-for="date in daysInMonth"
                  :key="date"
                  class="calendar-day"
                  :class="{ 
                    active: isSelected(date),
                    disabled: isPast(date),
                    today: isToday(date),
                    ...getDayClass(date)
                  }"
                  :disabled="isPast(date)"
                  @click="selectDate(date)"
                >
                  <span class="date-num">{{ date }}</span>
                </button>
              </div>

              <div class="calendar-status-legend">
                <div class="legend-item">
                  <span class="status-indicator available"></span>
                  <span class="status-text">可預約</span>
                </div>
                <div class="legend-item">
                  <span class="status-indicator reserved"></span>
                  <span class="status-text">已額滿</span>
                </div>
              </div>
            </div>
            <input type="hidden" v-model="form.date" required />
          </div>
        </div>

        <div class="form-section side-section">
          <div class="form-group">
            <label>選擇時段</label>
            <div class="time-grid">
              <button 
                type="button"
                v-for="item in filteredTimes" 
                :key="item.id"
                class="time-btn"
                :class="{ active: form.shiftId === item.id, 'is-reserved': item.isReserved }"
                :disabled="item.isReserved"
                @click="form.shiftId = item.id; form.time = item.time"
              >
                {{ item.time }}
              </button>
              <div v-if="filteredTimes.length === 0 && form.date" class="no-times">
                此日期無排班
              </div>
              <div v-if="!form.date" class="no-times">
                請先選擇日期
              </div>
            </div>
          </div>

          <div class="quick-fill-container" v-if="memberInfo">
            <button 
              type="button" 
              class="btn-quick-fill" 
              @click="fillMemberInfo"
              :disabled="!form.date || !form.time"
            >
              <i class="mdi mdi-account-edit-outline"></i> 帶入會員基本資料
            </button>
          </div>

          <div class="form-group form-floating">
            <input 
              type="text" 
              class="form-control" 
              id="floatName" 
              v-model="form.name" 
              placeholder="" 
              required 
              :disabled="!form.date || !form.time"
            />
            <label for="floatName" class="form-label">您的姓名</label>
          </div>

          <div class="form-group form-floating">
            <input 
              type="tel" 
              class="form-control" 
              id="floatPhone" 
              v-model="form.phone" 
              placeholder="" 
              required 
              :disabled="!form.date || !form.time"
            />
            <label for="floatPhone" class="form-label">聯絡電話</label>
          </div>

          <div class="form-group">
            <label>備註事項 (選填)</label>
            <textarea 
              v-model="form.note" 
              placeholder="如有特定想諮詢的問題..."
              :disabled="!form.date || !form.time"
            ></textarea>
          </div>

          <div class="booking-policy-note">
            <i class="mdi mdi-alert-circle-outline"></i>
            <span>預約須知：諮商開始前 40 分鐘內將無法取消預約，請確認您的行程後再行送出。</span>
          </div>

          <button type="submit" class="btn-submit" :disabled="!isFormValid">
            確認預約
          </button>
        </div>
      </form>
    </div>

    <!-- 付款方式選擇彈窗 -->
    <el-dialog
      v-model="paymentModalVisible"
      title="選擇付款方式"
      width="400px"
      align-center
      class="payment-dialog"
    >
      <div class="payment-selection">
        <p class="payment-info-text">您即將預約 {{ instructor.name }} 營養師於 {{ form.date }} {{ form.time }} 的諮詢。</p>
        
        <div class="payment-options">
          <div 
            class="payment-option" 
            :class="{ active: paymentMethod === 'Points' }"
            @click="paymentMethod = 'Points'"
          >
            <div class="option-icon"><i class="mdi mdi-rhombus"></i></div>
            <div class="option-text">
              <span class="option-title">點數扣款</span>
              <span class="option-desc">剩餘點數：{{ memberInfo?.points }} P</span>
            </div>
            <div class="option-check" v-if="paymentMethod === 'Points'"><i class="mdi mdi-check-circle"></i></div>
          </div>

          <div 
            class="payment-option" 
            :class="{ active: paymentMethod === 'CreditCard' }"
            @click="paymentMethod = 'CreditCard'"
          >
            <div class="option-icon"><i class="mdi mdi-credit-card-outline"></i></div>
            <div class="option-text">
              <span class="option-title">信用卡支付</span>
              <span class="option-desc">支援 Visa, Master, JCB</span>
            </div>
            <div class="option-check" v-if="paymentMethod === '信用卡'"><i class="mdi mdi-check-circle"></i></div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="paymentModalVisible = false">取消</el-button>
          <el-button type="primary" :disabled="!paymentMethod" @click="submitFinalReservation" :loading="submitting">
            確認支付並預約
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
  <div v-else class="no-selection">
    <p>請從側欄選擇一位營養師開始預約</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchAllInstructors, type Instructor, type Availability } from '@/data/instructors'
import { ElMessageBox, ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const instructors = ref<Instructor[]>([])
const availability = ref<Availability[]>([])
const memberInfo = ref<{ name: string; avatar: string; points: number; phone?: string } | null>(null)
const instructorId = computed(() => Number(route.params.id))
const instructor = computed(() => instructors.value.find(i => i.id === instructorId.value))

const paymentModalVisible = ref(false)
const paymentMethod = ref('')
const submitting = ref(false)
const isGoogleConnected = ref(false)

const checkGoogleStatus = async () => {
  try {
    const res = await fetch('https://localhost:7212/api/GoogleAuth/CheckStatus', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    if (res.ok) {
      const data = await res.json()
      isGoogleConnected.value = data.isConnected
    }
  } catch (err) {
    console.error('Check Google status failed:', err)
  }
}

const connectGoogleCalendar = () => {
  const clientId = "365712091677-0sflrsk62c2lbk20icvdomibfns7etbg.apps.googleusercontent.com"; // <-- 記得換掉
  const redirectUri = window.location.origin + "/google-callback";
  const scope = "https://www.googleapis.com/auth/calendar.events";
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
    `client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&include_granted_scopes=true`;
  window.location.href = authUrl;
}

const form = ref({
  date: '',
  time: '',      
  shiftId: null as number | null,
  name: '',
  phone: '',
  note: ''
})

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

function fillMemberInfo() {
  if (memberInfo.value) {
    form.value.name = memberInfo.value.name
    form.value.phone = memberInfo.value.phone || ''
    ElMessage.success('已為您帶入基本資料')
  }
}

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

const fetchAvailabilityData = async (id: number) => {
  try {
    const res = await fetch(`/api/Instructor/Availability/${id}`)
    if (res.ok) {
      const data: Availability[] = await res.json()
      availability.value = data
    } else {
      availability.value = []
    }
  } catch (error) {
    console.error('Failed to fetch availability:', error)
    availability.value = []
  }
}

function getDayClass(dateNum: number) {
  const d = new Date(currentYear.value, currentMonth.value, dateNum)
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const dayAvailability = availability.value.filter(a => a.date.split('T')[0] === dateStr)
  if (dayAvailability.length === 0) return {}
  const allReserved = dayAvailability.every(a => a.isReserved)
  if (allReserved) return { 'status-reserved': true }
  return { 'status-available': true }
}

const filteredTimes = computed(() => {
  if (!form.value.date) return []
  return availability.value
    .filter(a => a.date.split('T')[0] === form.value.date)
    .map(a => ({
      id: a.shiftId,
      time: a.timeSlot,
      isReserved: a.isReserved
    }))
})

function prevMonth() {
  if (currentMonth.value === 0) {
    currentYear.value--
    currentMonth.value = 11
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentYear.value++
    currentMonth.value = 0
  } else {
    currentMonth.value++
  }
}

function selectDate(date: number) {
  const d = new Date(currentYear.value, currentMonth.value, date)
  form.value.date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  form.value.time = ''
  form.value.shiftId = null
}

function isSelected(date: number) {
  const d = new Date(currentYear.value, currentMonth.value, date)
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return form.value.date === dateStr
}

function isPast(date: number) {
  const d = new Date(currentYear.value, currentMonth.value, date)
  const compareDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return d < compareDate
}

function isToday(date: number) {
  const d = new Date(currentYear.value, currentMonth.value, date)
  return d.toDateString() === today.toDateString()
}

const isFormValid = computed(() => {
  return form.value.date && form.value.time && form.value.name && form.value.phone
})

// 第一步：點擊預約按鈕，顯示付款彈窗
function handleReserve() {
  paymentModalVisible.value = true
}

// 第二步：彈窗內確認，發送最終請求
async function submitFinalReservation() {
  if (!paymentMethod.value) return
  
  submitting.value = true
  try {
    const response = await fetch('/api/Reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instructorId: instructorId.value,
        date: form.value.date,
        time: form.value.time,
        name: form.value.name,
        phone: form.value.phone,
        note: form.value.note,
        paymentMethod: paymentMethod.value // 傳送選擇的付款方式
      })
    })

    if (response.ok) {
      paymentModalVisible.value = false
      
      if (isGoogleConnected.value) {
        // A. 已授權狀態
        ElMessageBox.confirm(
          '預約成功！行程已自動同步至您的 Google 日曆。',
          '預約成功',
          {
            confirmButtonText: '開啟google日曆',
            cancelButtonText: '查看預約紀錄',
            type: 'success',
            distinguishCancelAndClose: true
          }
        ).then(() => {
          // 點擊「開啟google日曆」
          window.open('https://calendar.google.com/', '_blank');
          router.push('/reserveorders');
        }).catch((action) => {
          // 點擊「查看預約紀錄」或關閉彈窗
          router.push('/reserveorders');
        });
      } else {
        // B. 尚未授權狀態
        ElMessageBox.confirm(
          '預約成功！連結 Google 日曆後可自動同步行程，是否現在同步？',
          '預約成功',
          {
            confirmButtonText: '同步google行事曆',
            cancelButtonText: '暫不同步',
            type: 'success',
            distinguishCancelAndClose: true
          }
        ).then(() => {
          // 點擊「同步google行事曆」
          connectGoogleCalendar();
        }).catch((action) => {
          // 點擊「暫不同步」或關閉彈窗
          router.push('/reserveorders');
        });
      }
    } else {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json()
        ElMessageBox.alert(errorData.message || '預約失敗，請稍後再試', '錯誤', { type: 'error' })
      } else {
        ElMessageBox.alert(`伺服器連線失敗 (HTTP ${response.status})`, '錯誤', { type: 'error' })
      }
    }
  } catch (error) {
    console.error('Reservation failed:', error)
    ElMessageBox.alert('網路錯誤，請稍後再試', '錯誤', { type: 'error' })
  } finally {
    submitting.value = false
  }
}

watch(instructorId, async (newId) => {
  if (newId) {
    await fetchAvailabilityData(newId)
    form.value = { date: '', time: '', shiftId: null, name: '', phone: '', note: '' }
  }
})

onMounted(async () => {
  fetchMemberInfo()
  checkGoogleStatus()
  instructors.value = await fetchAllInstructors()
  if (instructorId.value) {
    await fetchAvailabilityData(instructorId.value)
    if (!instructor.value) {
      ElMessageBox.alert('找不到該營養師資訊', '錯誤', {
        confirmButtonText: '確定',
        type: 'error',
        callback: () => { router.push('/reserve') }
      })
    }
  }
})
</script>

<style scoped>
/* JVID 風格會員狀態條 */
.user-status-bar {
  background: #fdfaf5;
  border: 1px solid rgba(196, 168, 130, 0.2);
  border-radius: 100px;
  padding: 10px 24px;
  margin: 20px 60px 0;
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
  align-items: center;
  gap: 4px;
  background: #fff;
  padding: 4px 12px;
  border-radius: 100px;
  border: 1px solid rgba(196, 168, 130, 0.3);
  margin-left: 8px;
}

.user-points-badge i {
  color: #d4b892;
  font-size: 1rem;
}

.points-count {
  font-weight: 700;
  color: var(--accent-dark);
  font-size: 0.9rem;
}

.status-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #27ae60;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(39, 174, 96, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); }
}

/* 快速填寫按鈕樣式 */
.quick-fill-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.btn-quick-fill {
  background: none;
  border: 1px solid var(--accent);
  color: var(--accent-dark);
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-quick-fill:hover {
  background: var(--accent);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(196, 168, 130, 0.2);
}

.btn-quick-fill i {
  font-size: 1.1rem;
}

/* 預約須知提醒 */
.booking-policy-note {
  margin-top: 20px;
  background-color: #fff8f1;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border-left: 4px solid #ff9800;
}

.booking-policy-note i {
  color: #ff9800;
  font-size: 1.2rem;
  margin-top: 2px;
}

.booking-policy-note span {
  font-size: 0.85rem;
  color: #856404;
  line-height: 1.5;
}

/* 付款彈窗樣式 */
.payment-info-text {
  margin-bottom: 20px;
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 0.9rem;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.payment-option:hover {
  border-color: var(--accent);
  background: #fdfaf5;
}

.payment-option.active {
  border-color: var(--accent-dark);
  background: #fdfaf5;
}

.option-icon {
  font-size: 1.5rem;
  margin-right: 15px;
  color: var(--text-secondary);
}

.payment-option.active .option-icon {
  color: var(--accent-dark);
}

.option-text {
  display: flex;
  flex-direction: column;
}

.option-title {
  font-weight: 600;
  color: var(--text-primary);
}

.option-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.option-check {
  margin-left: auto;
  color: var(--accent-dark);
  font-size: 1.2rem;
}

.no-selection { padding: 100px; text-align: center; color: var(--text-secondary); font-size: 1.2rem; }

.instructor-info {
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 30px 60px 40px;
  border-bottom: 1px solid var(--border);
}

.info-card-top { display: flex; align-items: center; gap: 30px; }

.img-wrap-small {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--accent);
  flex-shrink: 0;
}

.img-wrap-small img { width: 100%; height: 100%; object-fit: cover; object-position: top; }

.details-top h1 {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.tags-small { display: flex; gap: 8px; flex-wrap: wrap; }
.tags-small .tag { background: var(--tag-bg); padding: 4px 12px; border-radius: 100px; font-size: 0.75rem; }
.booking-form { padding: 60px; }
.form-header { margin-bottom: 40px; }
.reserve-form-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; align-items: start; }
.specialty { color: var(--accent); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.85rem; display: block; }
.calendar-container.large { border: 1px solid var(--border); border-radius: 16px; padding: 30px; background: #fff; }
.calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.current-month { font-weight: 700; font-size: 1.4rem; font-family: var(--font-display); }
.month-nav { background: none; border: 1px solid var(--border); border-radius: 50%; width: 40px; height: 40px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.calendar-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: 600; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 15px; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); }
.calendar-day { aspect-ratio: 1.2; display: flex; flex-direction: column; align-items: center; justify-content: center; border: none; background: #fff; cursor: pointer; font-size: 1.1rem; transition: all 0.2s; position: relative; }
.date-num { z-index: 2; }
.calendar-day:hover:not(.disabled):not(.empty) { background: rgba(196, 168, 130, 0.1); }
.calendar-day.active { background: var(--bg-dark) !important; color: #fff; }
.calendar-day.today { color: var(--accent-dark); font-weight: 800; }
.calendar-day.today::after { content: 'Today'; font-size: 0.6rem; position: absolute; bottom: 8px; }
.calendar-day.disabled { color: #eee; background: #fafafa; cursor: not-allowed; }
.calendar-day.empty { background: #fdfdfd; cursor: default; }
.calendar-day.status-available { background-color: rgba(46, 204, 113, 0.15); color: #27ae60; font-weight: 700; }
.calendar-day.status-reserved { background-color: rgba(231, 76, 60, 0.15); color: #c0392b; }
.calendar-status-legend { display: flex; justify-content: flex-end; gap: 20px; margin-top: 15px; padding: 0 5px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-secondary); }
.status-indicator { width: 12px; height: 12px; border-radius: 3px; }
.status-indicator.available { background-color: rgba(46, 204, 113, 0.2); border: 1px solid #27ae60; }
.status-indicator.reserved { background-color: rgba(231, 76, 60, 0.2); border: 1px solid #c0392b; }
.form-group { margin-bottom: 30px; }
.form-floating { position: relative; margin-bottom: 20px; }
.form-floating > .form-control { height: calc(3.5rem + 2px); padding: 1.625rem 0.75rem 0.625rem; line-height: 1.25; }
.form-floating > label { position: absolute; top: 0; left: 0; width: 100%; height: 100%; padding: 1rem 0.75rem; overflow: hidden; text-align: start; text-overflow: ellipsis; white-space: nowrap; pointer-events: none; border: 1px solid transparent; transform-origin: 0 0; transition: opacity .1s ease-in-out, transform .1s ease-in-out; color: var(--text-secondary); font-weight: 400; margin-bottom: 0; }
.form-floating > .form-control:focus ~ label, .form-floating > .form-control:not(:placeholder-shown) ~ label { opacity: .65; transform: scale(.85) translateY(-.5rem) translateX(.15rem); }
.form-group label { display: block; font-weight: 600; margin-bottom: 15px; font-size: 1rem; color: var(--text-primary); }
.form-control, input[type="text"], input[type="tel"], textarea { width: 100%; padding: 14px 18px; border-radius: 12px; border: 1.5px solid var(--border); font-size: 1rem; transition: all 0.3s; background: var(--bg); }
input:focus, textarea:focus { outline: none; border-color: var(--accent-dark); background: #fff; box-shadow: 0 0 0 4px rgba(196, 168, 130, 0.1); }
.time-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.time-btn { padding: 12px; border-radius: 10px; border: 1.5px solid var(--border); background: transparent; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
.time-btn:hover { border-color: var(--text-primary); }
.time-btn.active { background: var(--bg-dark); color: #fff; border-color: var(--bg-dark); }
.time-btn.is-reserved { background-color: #f2f2f2; color: #ccc; text-decoration: line-through; cursor: not-allowed; border-color: #eee; }
.no-times { grid-column: span 3; text-align: center; padding: 20px; color: var(--text-secondary); font-style: italic; font-size: 0.9rem; }
textarea { height: 120px; resize: none; }
.btn-submit { width: 100%; padding: 18px; border-radius: 100px; background: var(--bg-dark); color: #fff; font-size: 1.1rem; font-weight: 600; border: none; cursor: pointer; transition: all 0.3s; margin-top: 20px; }
.btn-submit:hover:not(:disabled) { background: #2d2620; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(26, 22, 19, 0.15); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
@media (max-width: 1024px) { .reserve-form-layout { grid-template-columns: 1fr; } }
@media (max-width: 768px) {
  .user-status-bar { margin: 10px 20px; padding: 10px 15px; }
  .info-card-top { flex-direction: column; text-align: center; gap: 15px; }
  .time-grid { grid-template-columns: repeat(2, 1fr); }
  .calendar-day { aspect-ratio: 1; font-size: 0.9rem; }
}
</style>
