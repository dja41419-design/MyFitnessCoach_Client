<template>
  <div class="callback-container">
    <div v-if="loading" class="loading-box">
      <div class="spinner"></div>
      <p>正在與 Google 進行安全授權，請稍候...</p>
    </div>
    <div v-else-if="error" class="error-box">
      <p class="error-icon">⚠️</p>
      <p>{{ error }}</p>
      <button @click="goBack" class="btn-primary">回到個人設定</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  const code = route.query.code;
  if (!code) {
    error.value = "授權失敗：未取得授權碼";
    loading.value = false;
    return;
  }

  try {
    // 使用瀏覽器內建的 fetch，不依賴 axios
    const response = await fetch('https://localhost:7212/api/GoogleAuth/SaveToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        code: code,
        redirectUri: window.location.origin + '/google-callback'
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Google 日曆授權成功！以後您的預約將自動同步。');
      // 開啟 Google 日曆新分頁
      window.open('https://calendar.google.com/', '_blank');
      // 原分頁跳轉回個人中心
      router.push('/personalInfo'); 
    } else {
      error.value = data.message || "授權失敗";
    }
  } catch (err) {
    console.error(err);
    error.value = "與伺服器連線失敗，請檢查後端是否啟動";
  } finally {
    loading.value = false;
  }
});

const goBack = () => {
  router.push('/personalInfo');
};
</script>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  background-color: #f8f9fa;
  font-family: sans-serif;
}
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #4285f4;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.error-icon { font-size: 40px; margin-bottom: 10px; }
.error-box { color: #dc3545; }
.btn-primary {
  margin-top: 20px;
  padding: 10px 24px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
</style>
