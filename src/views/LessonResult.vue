<template>
  <div class="result-page">
    <div class="container">
      <div class="result-card" :class="{ 'success': isSuccess, 'failure': !isSuccess }">
        <!-- 圖示區 -->
        <div class="status-icon">
          <svg v-if="isSuccess" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke="#27ae60" />
            <path d="m9 12 2 2 4-4" stroke="#27ae60" />
          </svg>
          <svg v-else width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke="#c0392b" />
            <path d="m15 9-6 6M9 9l6 6" stroke="#c0392b" />
          </svg>
        </div>

        <h1 class="status-title">{{ isSuccess ? '交易成功' : '交易失敗' }}</h1>
        
        <div class="status-details">
          <p class="status-msg">{{ rtnMsg }}</p>
          <div class="info-row" v-if="tradeNo">
            <span class="label">訂單編號：</span>
            <span class="value">{{ tradeNo }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="redirect-info">
          <p>系統將在 <span class="countdown">{{ countdown }}</span> 秒後自動返回首頁</p>
          <button @click="goHome" class="btn-home">立即返回</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const countdown = ref(5)
const rtnCode = ref(route.query.RtnCode || '')
const rtnMsg = ref(route.query.RtnMsg || '交易處理完成')
const tradeNo = ref(route.query.MerchantTradeNo || '')

const isSuccess = computed(() => rtnCode.value === '1')

let timer = null

function goHome() {
  router.push('/')
}

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      goHome()
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fdfcfb;
  padding: 24px;
}

.result-card {
  background: white;
  padding: 48px 32px;
  border-radius: var(--radius-lg, 16px);
  box-shadow: 0 10px 40px rgba(26, 22, 19, 0.06);
  max-width: 440px;
  width: 100%;
  text-align: center;
  border-top: 6px solid #ddd;
}

.result-card.success { border-top-color: #27ae60; }
.result-card.failure { border-top-color: #c0392b; }

.status-icon { margin-bottom: 24px; }

.status-title {
  font-size: 1.8rem;
  color: #1a1613;
  margin-bottom: 16px;
}

.status-msg {
  font-size: 1.1rem;
  color: #6a635a;
  margin-bottom: 20px;
}

.status-details {
  background: #f9f7f5;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 32px;
}

.info-row {
  display: flex;
  justify-content: center;
  font-size: 0.9rem;
  color: #8a837a;
}

.divider {
  height: 1px;
  background: #eee;
  margin-bottom: 32px;
}

.redirect-info {
  color: #8a837a;
  font-size: 0.95rem;
}

.countdown {
  font-weight: 700;
  color: #2d2620;
  font-size: 1.1rem;
}

.btn-home {
  margin-top: 24px;
  display: block;
  width: 100%;
  padding: 14px;
  background: #2d2620;
  color: white;
  border: none;
  border-radius: 100px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-home:hover {
  background: #1a1613;
  transform: translateY(-2px);
}
</style>
