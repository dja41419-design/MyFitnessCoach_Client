<template>
  <div class="reserve-page">
    <div class="container">
      <div class="reserve-container reveal visible">
        <!-- 頂部：營養師資訊 -->
        <div class="instructor-info" v-if="instructor">
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
                <!-- 自定義放大版月曆 -->
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
                        today: isToday(date)
                      }"
                      :disabled="isPast(date)"
                      @click="selectDate(date)"
                    >
                      <span class="date-num">{{ date }}</span>
                    </button>
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
                    v-for="time in availableTimes" 
                    :key="time"
                    class="time-btn"
                    :class="{ active: form.time === time }"
                    @click="form.time = time"
                  >
                    {{ time }}
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>您的姓名</label>
                <input type="text" v-model="form.name" placeholder="請輸入姓名" required />
              </div>

              <div class="form-group">
                <label>聯絡電話</label>
                <input type="tel" v-model="form.phone" placeholder="請輸入電話" required />
              </div>

              <div class="form-group">
                <label>備註事項 (選填)</label>
                <textarea v-model="form.note" placeholder="如有特定想諮詢的問題..."></textarea>
              </div>

              <button type="submit" class="btn-submit" :disabled="!isFormValid">
                確認預約
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { instructors } from '@/data/instructors'

const route = useRoute()
const router = useRouter()

const instructorId = Number(route.query.id)
const instructor = computed(() => instructors.find(i => i.id === instructorId))

const minDate = new Date().toISOString().split('T')[0]

const availableTimes = [
  '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00'
]

const form = ref({
  date: '',
  time: '',
  name: '',
  phone: '',
  note: ''
})

// 月曆邏輯
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
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
  form.value.date = d.toISOString().split('T')[0]
}

function isSelected(date: number) {
  const d = new Date(currentYear.value, currentMonth.value, date).toISOString().split('T')[0]
  return form.value.date === d
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

function handleReserve() {
  alert(`預約成功！\n\n營養師：${instructor.value?.name}\n時間：${form.value.date} ${form.value.time}\n我們將會撥打 ${form.value.phone} 與您連繫。`)
  window.close() // 如果是新視窗開啟，可以嘗試關閉
  // 如果是在同一個分頁，則導回首頁
  router.push('/')
}

onMounted(() => {
  if (!instructor.value) {
    alert('找不到該營養師資訊')
    router.push('/')
  }
})
</script>

<style scoped>
.reserve-page {
  padding: 80px 0;
  min-height: 100vh;
  background: var(--bg);
}

.reserve-container {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 20px 80px rgba(26, 22, 19, 0.08);
  border: 1px solid var(--border);
}

/* 頂部資訊樣式 */
.instructor-info {
  background: var(--bg-dark);
  color: #fff;
  padding: 40px 60px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.info-card-top {
  display: flex;
  align-items: center;
  gap: 30px;
}

.img-wrap-small {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.img-wrap-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.details-top h1 {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: #fff;
}

.tags-small {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tags-small .tag {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.75rem;
}

/* 表單佈局 */
.booking-form {
  padding: 60px;
}

.form-header {
  margin-bottom: 40px;
}

.reserve-form-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 40px;
  align-items: start;
}

.specialty {
  color: var(--accent);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.85rem;
  display: block;
}

/* 放大版月曆樣式 */
.calendar-container.large {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 30px;
  background: #fff;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.current-month {
  font-weight: 700;
  font-size: 1.4rem;
  font-family: var(--font-display);
}

.month-nav {
  background: none;
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 15px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px; /* 這裡改為 1px 配合邊框呈現格線 */
  background: var(--border); /* 背景色做為格線 */
  border: 1px solid var(--border);
}

.calendar-day {
  aspect-ratio: 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: none;
  background: #fff;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
  position: relative;
}

.date-num {
  z-index: 2;
}

.calendar-day:hover:not(.disabled):not(.empty) {
  background: rgba(196, 168, 130, 0.1);
}

.calendar-day.active {
  background: var(--bg-dark) !important;
  color: #fff;
}

.calendar-day.today {
  color: var(--accent-dark);
  font-weight: 800;
}

.calendar-day.today::after {
  content: 'Today';
  font-size: 0.6rem;
  position: absolute;
  bottom: 8px;
}

.calendar-day.disabled {
  color: #eee;
  background: #fafafa;
  cursor: not-allowed;
}

.calendar-day.empty {
  background: #fdfdfd;
  cursor: default;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 15px;
  font-size: 1rem;
  color: var(--text-primary);
}

input[type="text"],
input[type="tel"],
textarea {
  width: 100%;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  font-size: 1rem;
  transition: all 0.3s;
  background: var(--bg);
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--accent-dark);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(196, 168, 130, 0.1);
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.time-btn {
  padding: 12px;
  border-radius: 10px;
  border: 1.5px solid var(--border);
  background: transparent;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.time-btn:hover {
  border-color: var(--text-primary);
}

.time-btn.active {
  background: var(--bg-dark);
  color: #fff;
  border-color: var(--bg-dark);
}

textarea {
  height: 120px;
  resize: none;
}

.btn-submit {
  width: 100%;
  padding: 18px;
  border-radius: 100px;
  background: var(--bg-dark);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
}

.btn-submit:hover:not(:disabled) {
  background: #2d2620;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(26, 22, 19, 0.15);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .reserve-form-layout {
    grid-template-columns: 1fr;
  }
  .instructor-info {
    padding: 30px 40px;
  }
  .booking-form {
    padding: 40px;
  }
}

@media (max-width: 768px) {
  .reserve-page {
    padding: 40px 0;
  }
  .reserve-container {
    border-radius: 20px;
  }
  .info-card-top {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  .time-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .calendar-day {
    aspect-ratio: 1;
    font-size: 0.9rem;
  }
}
</style>
