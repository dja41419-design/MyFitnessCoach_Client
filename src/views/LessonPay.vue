<template>
  <div class="pay-page">
    <div class="container">
      <div class="pay-content">
        <div v-if="loading" class="loading-wrap">
          <div class="spinner"></div>
          <h2>訂單處理中</h2>
          <p>正在為您導向綠界安全支付頁面，請稍候...</p>
        </div>

        <div v-if="error" class="error-wrap">
          <div class="error-icon">!</div>
          <h2>發生錯誤</h2>
          <p>{{ error }}</p>
          <RouterLink to="/lesson-cart" class="btn-back">返回購物車</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { EcPayResponse } from '@/types/lesson'

const loading = ref(true)
const error = ref('')

async function startPayment() {
  const amount = sessionStorage.getItem('checkoutAmount')
  
  if (!amount || isNaN(Number(amount)) || parseInt(amount) <= 0) {
    error.value = '無效的結帳金額，請重新操作。'
    loading.value = false
    return
  }

  try {
    const planIds = sessionStorage.getItem('checkoutPlanIds') || ''
    const formData = new URLSearchParams()
    formData.append('totalAmount', amount)
    formData.append('planIds', planIds)

    const token = localStorage.getItem('token')
    if (!token) {
      error.value = '請先登入才能進行付款。'
      loading.value = false
      return
    }

    const response = await fetch('/api/Payment/SendToEcPay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const msg = response.status === 401 ? '登入已過期，請重新登入。' : `伺服器回應錯誤 (${response.status})`
      throw new Error(msg)
    }

    const data: EcPayResponse = await response.json()
    
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

  } catch (err: any) {
    error.value = '金流服務連線失敗：' + err.message
    loading.value = false
  }
}

onMounted(() => {
  startPayment()
})
</script>

<style scoped>
.pay-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fdfcfb;
}
.pay-content { text-align: center; max-width: 400px; }
.spinner {
  width: 50px; height: 50px;
  border: 4px solid rgba(26, 22, 19, 0.1);
  border-top-color: #2d2620;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}
@keyframes spin { to { transform: rotate(360deg); } }
h2 { font-size: 1.5rem; margin-bottom: 12px; }
p { color: #6a635a; margin-bottom: 32px; }
.error-icon {
  width: 60px; height: 60px; background: #c0392b; color: white;
  font-size: 32px; border-radius: 50%; display: flex;
  align-items: center; justify-content: center; margin: 0 auto 24px;
}
.btn-back {
  padding: 12px 32px; background: #2d2620; color: white;
  text-decoration: none; border-radius: 100px;
}
</style>
