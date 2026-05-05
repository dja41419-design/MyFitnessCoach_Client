<template>
  <div class="result-page">
    <div class="container">
      <div class="result-card" :class="{ success: isSuccess, failure: !isSuccess }">
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

        <h1 class="status-title">{{ isSuccess ? '付款成功' : '付款失敗' }}</h1>

        <div class="status-details">
          <p class="status-msg">{{ statusMessage }}</p>
          <div class="info-row" v-if="tradeNo">
            <span class="label">交易編號：</span>
            <span class="value">{{ tradeNo }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="redirect-info">
          <p>系統將在 <span class="countdown">{{ countdown }}</span> 秒後自動跳轉</p>
          <button @click="goReserveOrders" class="btn-home">查看預約紀錄</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { fetchWithAuth } from '@/data/fetchWithAuth'

const router = useRouter()
const route = useRoute()
const countdown = ref(10)
const isGoogleConnected = ref(true) // 預設為 true 以免閃爍，Mounted 後檢查

const rawCode = (route.query.RtnCode as string) ?? ''
const isSuccess = computed(() => /^\d+$/.test(rawCode) && rawCode === '1')

const rawTrade = (route.query.MerchantTradeNo as string) ?? ''
const tradeNo = ref(/^MFR\d+$/.test(rawTrade) ? rawTrade : '')

const statusMessage = computed(() =>
  isSuccess.value
    ? '付款完成，您的預約已確認，我們將盡快與您聯繫。'
    : '交易未完成，請返回重試或聯絡客服。'
)

function goReserveOrders() {
  router.push('/reserveorders')
}

const checkGoogleStatus = async () => {
  try {
    if (!localStorage.getItem('username')) return
    const res = await fetchWithAuth('/api/GoogleAuth/CheckStatus')
    if (res.ok) {
      const data = await res.json()
      isGoogleConnected.value = data.isConnected
      
      // 如果沒連動，且付款成功，就跳出詢問
      if (!isGoogleConnected.value && isSuccess.value) {
        if (timer) clearInterval(timer) // 暫停倒數
        
        ElMessageBox.confirm(
          '付款成功！連結 Google 帳戶後可自動同步行事曆並發送預約通知信 (將一併綁定 Gmail)，是否現在同步？',
          '預約成功',
          {
            confirmButtonText: '同步 Google 服務',
            cancelButtonText: '暫不同步',
            type: 'success',
            distinguishCancelAndClose: true
          }
        ).then(() => {
          connectGoogleCalendar();
        }).catch(() => {
          goReserveOrders();
        });
      }
    }
  } catch (err) {
    console.error('Check Google status failed:', err)
  }
}

const connectGoogleCalendar = () => {
  const clientId = "365712091677-0sflrsk62c2lbk20icvdomibfns7etbg.apps.googleusercontent.com";
  const redirectUri = window.location.origin + "/google-callback";
  const scope = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.send";
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
    `client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&include_granted_scopes=true`;
  window.location.href = authUrl;
}

let timer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  if (isSuccess.value) {
    await checkGoogleStatus()
  }

  // 只有在還沒跳轉或沒跳出視窗時才開始/繼續倒數
  // 實際上 checkGoogleStatus 會處理彈窗。如果彈窗沒跳出(已連動)，則執行倒數
  if (isGoogleConnected.value || !isSuccess.value) {
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (timer) clearInterval(timer)
        goReserveOrders()
      }
    }, 1000)
  }
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
  gap: 4px;
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
