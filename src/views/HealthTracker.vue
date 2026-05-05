<template>
  <AppNavbar />
  <div class="health-tracker">
    <div class="ht-tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :class="['ht-tab-btn', { active: route.name === tab.name }]"
        @click="router.push({ name: tab.name })"
      >
        {{ tab.label }}
      </button>
    </div>

    <main class="ht-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue';
import { RouterView, useRoute, useRouter } from 'vue-router'

const route  = useRoute()
const router = useRouter()

const tabs = [
  { name: 'daily-diet',   label: '今日飲食' },
  { name: 'body-metrics', label: '體態紀錄' },
  { name: 'food-library', label: '食物庫'   },
  { name: 'goals',        label: '目標設定'  },
  { name: 'reports',      label: '報表'      },
]
</script>

<style scoped>
/* Health-tracker 模組色彩 variables（cascade 到子元件） */
.health-tracker {
  --ht-surface:       #ffffff;
  --ht-surface2:      var(--bg);             /* #f5f0eb 暖米，對齊全域 */
  --ht-border:        var(--border);         /* #d4ccc2 對齊全域 */
  --ht-text:          var(--text-primary);   /* #1a1613 對齊全域 */
  --ht-text2:         var(--text-secondary); /* #6b5e52 對齊全域 */
  --ht-text3:         #9a8d80;
  --ht-green:         var(--accent-dark);    /* #a68b6b 金棕，取代墨綠 */
  --ht-green-light:   #ede8e0;              /* 暖米淡底，取代綠色淡底 */
  --ht-danger:        #b84f37;
  --ht-warn:          #a07828;
  --ht-info:          #4a7a9e;
  --ht-radius:        12px;

  min-height: 100vh;
  background: var(--bg);
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--ht-text);
  padding-top: 92px;
}

.ht-tab-nav {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 12px 24px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
}

.ht-tab-btn {
  padding: 7px 18px;
  border: none;
  border-radius: 5px;
  background: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
  transition: background var(--transition), color var(--transition);
}

.ht-tab-btn:hover {
  background: var(--bg);
  color: var(--text-primary);
}

.ht-tab-btn.active {
  background: var(--bg-dark);
  color: var(--text-light);
  font-weight: 600;
}

.ht-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 16px 60px;
}

@media (max-width: 768px) {
  .ht-tab-nav {
    padding-left: 12px;
    padding-right: 12px;
  }

  .ht-content {
    padding: 14px 10px 60px;
  }
}
</style>
