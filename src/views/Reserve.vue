<template>
  <div class="reserve-page">
    <div class="container">
      <div class="reserve-container reveal visible">
        <!-- 左側：營養師資訊 -->
        <div class="instructor-info" v-if="instructor">
          <div class="info-card">
            <div class="img-wrap">
              <img :src="instructor.img" :alt="instructor.name" />
            </div>
            <div class="details">
              <span class="specialty">{{ instructor.specialty }}</span>
              <h1>{{ instructor.name }}</h1>
              <p class="bio">{{ instructor.bio }}</p>
              <div class="tags">
                <span v-for="tag in instructor.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右側：預約表單 -->
        <div class="booking-form">
          <h2>預約諮詢時段</h2>
          <p class="subtitle">請選擇您方便的日期與時間，我們將盡快為您確認預約。</p>

          <form @submit.prevent="handleReserve">
            <div class="form-group">
              <label>選擇日期</label>
              <input type="date" v-model="form.date" :min="minDate" required />
            </div>

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
              <textarea v-model="form.note" placeholder="如有特定想諮詢的問題，可以先告訴營養師..."></textarea>
            </div>

            <button type="submit" class="btn-submit" :disabled="!isFormValid">
              確認預約
            </button>
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
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 60px;
  background: #fff;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 20px 80px rgba(26, 22, 19, 0.08);
  border: 1px solid var(--border);
}

/* 左側資訊 */
.instructor-info {
  background: var(--bg-dark);
  color: #fff;
  padding: 60px;
}

.img-wrap {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 32px;
  border: 4px solid rgba(255, 255, 255, 0.1);
}

.img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.specialty {
  color: var(--accent);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 12px;
}

h1 {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 500;
  margin-bottom: 24px;
}

.bio {
  font-size: 1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 32px;
}

.tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tag {
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 0.85rem;
}

/* 右側表單 */
.booking-form {
  padding: 60px;
}

h2 {
  font-family: var(--font-display);
  font-size: 2rem;
  margin-bottom: 12px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 40px;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 28px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: var(--text-primary);
}

input[type="date"],
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
  height: 100px;
  resize: none;
}

.btn-submit {
  width: 100%;
  padding: 16px;
  border-radius: 100px;
  background: var(--bg-dark);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
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
  .reserve-container {
    grid-template-columns: 1fr;
  }
  .instructor-info {
    padding: 40px;
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
  .time-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
