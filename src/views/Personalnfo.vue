<template>
  <div class="info-container">
    <div class="section-header">
      <h2 class="section-title">個人資料</h2>
      <p class="section-desc">管理您的基本資料與聯絡資訊</p>
    </div>

    <div class="info-card">
      <!-- 這裡之後可以加入表單內容 -->
      <p style="color: var(--text-secondary); text-align: center; padding: 40px 0;">
        (此處為個人資料編輯表單預留空間)
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 已移至 UserLayout 處理登出
</script>

<style scoped>
.info-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  margin-bottom: 8px;
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

.info-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 40px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
</style>
