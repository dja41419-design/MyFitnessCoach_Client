<template>
  <div class="reserve-layout">
    <div class="container">
      <div class="layout-wrapper">
        <!-- 側邊欄：營養師列表 -->
        <aside class="reserve-sidebar">
          <h3 class="sidebar-title">選擇營養師</h3>
          <div class="instructor-list">
            <router-link
              v-for="item in instructors"
              :key="item.id"
              :to="{ name: 'ReserveDetail', params: { id: item.id } }"
              class="instructor-item"
              active-class="active"
            >
              <img :src="item.img" :alt="item.name" class="mini-avatar" />
              <div class="item-info">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-specialty">{{ item.specialty }}</span>
              </div>
            </router-link>
          </div>
        </aside>

        <!-- 主內容區：渲染子路由 -->
        <main class="reserve-main">
          <router-view></router-view>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { instructors } from '@/data/instructors'
</script>

<style scoped>
.reserve-layout {
  padding: 80px 0;
  min-height: 100vh;
  background: var(--bg);
}

.layout-wrapper {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
  align-items: start;
}

.reserve-sidebar {
  background: var(--bg-card);
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--border);
  position: sticky;
  top: 100px;
}

.sidebar-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border);
}

.instructor-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.instructor-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s;
  color: var(--text-primary);
  text-decoration: none;
  border: 1px solid transparent;
}

.instructor-item:hover {
  background: var(--tag-bg);
  border-color: var(--border);
  font-weight: 600;
}

.instructor-item.active {
  background: var(--tag-bg);
  border-color: var(--border);
  font-weight: 600;
}

.mini-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 600;
}

.item-specialty {
  font-size: 0.75rem;
  opacity: 0.7;
}

.reserve-main {
  background: #fff;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 20px 80px rgba(116, 110, 104, 0.08);
  border: 1px solid var(--border);
}

@media (max-width: 1024px) {
  .layout-wrapper {
    grid-template-columns: 1fr;
  }
  .reserve-sidebar {
    position: static;
  }
  .instructor-list {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 10px;
  }
  .instructor-item {
    flex-shrink: 0;
    min-width: 200px;
  }
}
</style>
