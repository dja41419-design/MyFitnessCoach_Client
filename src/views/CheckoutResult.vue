<template>
  <div class="result-page">
    <div class="container">
      <div class="result-card" :class="{ success: isSuccess, failure: !isSuccess }">

        <div class="status-icon">
          <svg v-if="isSuccess" width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#27ae60" stroke-width="2" />
            <path d="m9 12 2 2 4-4" stroke="#27ae60" stroke-width="2" />
          </svg>
          <svg v-else width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#c0392b" stroke-width="2" />
            <path d="m15 9-6 6M9 9l6 6" stroke="#c0392b" stroke-width="2" />
          </svg>
        </div>

        <h1 class="status-title">{{ isSuccess ? '付款成功' : '交易失敗' }}</h1>

        <div class="status-details">
          <p class="status-msg">{{ statusMessage }}</p>
          <div v-if="tradeNo" class="info-row">
            <span class="label">交易編號：</span>
            <span class="value">{{ tradeNo }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="redirect-info">
          <p>系統將在 <span class="countdown">{{ countdown }}</span> 秒後自動跳轉</p>
          <button class="btn-action" @click="goNext">
            {{ isSuccess ? '查看訂單' : '返回商城' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const countdown = ref(5)

const rawCode = (route.query.RtnCode as string) ?? ''
const rtnCode = /^\d+$/.test(rawCode) ? rawCode : ''

const rawTrade = (route.query.MerchantTradeNo as string) ?? ''
// MFP + 17 位數字
const tradeNo = ref(/^MFP\d{17}$/.test(rawTrade) ? rawTrade : '')

const isSuccess = computed(() => rtnCode === '1')
const statusMessage = computed(() =>
  isSuccess.value
    ? '訂單已成立，我們將盡快為您處理出貨！'
    : '交易未完成，請返回重試或聯絡客服。'
)

function goNext(): void {
  // TODO: 等訂單列表頁完成後，成功時改導向訂單列表
  router.push(isSuccess.value ? '/store' : '/store')
}

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (timer) clearInterval(timer)
      goNext()
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
  background: var(--bg);
  padding: 24px;
}

.result-card {
  background: var(--bg-card);
  padding: 48px 32px;
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 40px rgba(26, 22, 19, 0.06);
  max-width: 440px;
  width: 100%;
  text-align: center;
  border-top: 6px solid var(--border);
}

.result-card.success { border-top-color: #27ae60; }
.result-card.failure { border-top-color: #c0392b; }

.status-icon { margin-bottom: 24px; }

.status-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.status-details {
  background: var(--bg);
  padding: 16px;
  border-radius: var(--radius);
  margin-bottom: 32px;
}

.status-msg {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: center;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.divider {
  height: 1px;
  background: var(--border);
  margin-bottom: 32px;
}

.redirect-info {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.countdown {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.btn-action {
  margin-top: 20px;
  display: block;
  width: 100%;
  padding: 14px;
  background: var(--bg-dark);
  color: var(--text-light);
  border: none;
  border-radius: 100px;
  font-weight: 600;
  font-family: var(--font-body);
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.3s;
}
.btn-action:hover { opacity: 0.85; }
</style>
