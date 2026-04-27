<template>
  <div class="health-tracker">
    <!-- Navbar placeholder — 待接 LandingPage navbar -->
    <nav class="ht-topbar">
      <span class="ht-brand">健康紀錄</span>
    </nav>

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
  --ht-surface2:      #f0efeb;
  --ht-border:        #e2dfd9;
  --ht-text:          #1c1b18;
  --ht-text2:         #76746e;
  --ht-text3:         #aaa79f;
  --ht-green:         #5c7a5c;
  --ht-green-light:   #eef3ee;
  --ht-danger:        #b84f37;
  --ht-warn:          #a07828;
  --ht-info:          #4a7a9e;
  --ht-radius:        8px;

  min-height: 100vh;
  background: var(--bg);
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--ht-text);
}

.ht-topbar {
  display: flex;
  align-items: center;
  padding: 14px 24px;
  background: var(--ht-surface);
  border-bottom: 1px solid var(--ht-border);
}

.ht-brand {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.ht-tab-nav {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding: 12px 24px;
  background: var(--ht-surface);
  border-bottom: 1px solid var(--ht-border);
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
  color: var(--ht-text2);
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}

.ht-tab-btn:hover {
  background: var(--ht-surface2);
  color: var(--ht-text);
}

.ht-tab-btn.active {
  background: var(--ht-green);
  color: #fff;
  font-weight: 600;
}

.ht-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 16px 60px;
}

@media (max-width: 768px) {
  .ht-topbar,
  .ht-tab-nav {
    padding-left: 12px;
    padding-right: 12px;
  }

  .ht-content {
    padding: 14px 10px 60px;
  }
}
</style>
