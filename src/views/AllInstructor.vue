<template>
  <div class="all-instructors-page">
    <!-- 簡單導航 / 返回按鈕 -->
    <nav class="page-nav">
      <div class="container">
        <RouterLink to="/" class="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
          返回首頁
        </RouterLink>
      </div>
    </nav>

    <header class="page-header">
      <div class="container">
        <div class="scroll-label">Our Team</div>
        <h1>專業營養師團隊</h1>
        <p class="subtitle">嚴選合格證照營養師，為您的健康與體態提供最專業的守護。</p>
      </div>
    </header>

    <!-- 人氣前三名領獎台 (不受搜尋影響) -->
    <section class="podium-section">
      <div class="container">
        <div class="podium-container">
          <div class="podium">
            <!-- 第二名 -->
            <div v-if="TopThreeInstructors[1]" class="podium-item rank-2">
               <div class="podium-card">
                  <RouterLink :to="{ name: 'ReserveDetail', params: { id: TopThreeInstructors[1].id } }" target="_blank" class="podium-img-link">
                    <div class="podium-img-wrap">
                       <img :src="TopThreeInstructors[1].img" :alt="TopThreeInstructors[1].name" />
                    </div>
                  </RouterLink>
                  <div class="podium-info">
                     <h3>{{ TopThreeInstructors[1].name }}</h3>
                     <div class="podium-specialty">{{ TopThreeInstructors[1].specialty }}</div>
                  </div>
               </div>
               <div class="podium-base base-2" data-rank="2"></div>
            </div>
            
            <!-- 第一名 -->
            <div v-if="TopThreeInstructors[0]" class="podium-item rank-1">
               <div class="podium-card">
                  <RouterLink :to="{ name: 'ReserveDetail', params: { id: TopThreeInstructors[0].id } }" target="_blank" class="podium-img-link">
                    <div class="podium-img-wrap">
                       <div class="crown">👑</div>
                       <img :src="TopThreeInstructors[0].img" :alt="TopThreeInstructors[0].name" />
                    </div>
                  </RouterLink>
                  <div class="podium-info">
                     <h3>{{ TopThreeInstructors[0].name }}</h3>
                     <div class="podium-specialty">{{ TopThreeInstructors[0].specialty }}</div>
                  </div>
               </div>
               <div class="podium-base base-1" data-rank="1"></div>
            </div>
            
            <!-- 第三名 -->
            <div v-if="TopThreeInstructors[2]" class="podium-item rank-3">
               <div class="podium-card">
                  <RouterLink :to="{ name: 'ReserveDetail', params: { id: TopThreeInstructors[2].id } }" target="_blank" class="podium-img-link">
                    <div class="podium-img-wrap">
                       <img :src="TopThreeInstructors[2].img" :alt="TopThreeInstructors[2].name" />
                    </div>
                  </RouterLink>
                  <div class="podium-info">
                     <h3>{{ TopThreeInstructors[2].name }}</h3>
                     <div class="podium-specialty">{{ TopThreeInstructors[2].specialty }}</div>
                  </div>
               </div>
               <div class="podium-base base-3" data-rank="3"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

        <!-- 搜尋與篩選區 -->
        <div class="search-section">
          <div class="container">
            <div class="filter-controls">
              <!-- 日期選擇 -->
              <div class="date-filters">
                <select v-model="selectedYear" @change="handleSearch">
                  <option v-for="y in yearOptions" :key="y" :value="y">{{ y }} 年</option>
                </select>
                <select v-model="selectedMonth" @change="handleSearch">
                  <option :value="0">全年排名</option>
                  <option v-for="m in 12" :key="m" :value="m">{{ m }} 月</option>
                </select>
              </div>

              <!-- 搜尋框 -->
              <div class="search-box">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="搜尋營養師名稱..." 
                  @input="handleSearch"
                />
              </div>
            </div>
          </div>
        </div>

    <section class="instructors-grid-section" id="all-list">
      <div class="container">
        <div class="instructors-grid">
          <div
            v-for="nutri in FilteredInstructors"
            :key="nutri.id"
            class="nutri-card"
          >
            <div class="nutri-img-wrap">
              <img :src="nutri.img" :alt="nutri.name" class="nutri-img" />
            </div>
            <div class="nutri-body">
              <div class="nutri-specialty">{{ nutri.specialty }}</div>
              <h3>{{ nutri.name }}</h3>
              <p>{{ nutri.bio }}</p>
              <div class="nutri-tags">
                <span v-for="tag in nutri.tags" :key="tag" class="nutri-tag">{{ tag }}</span>
              </div>
              <RouterLink :to="{ name: 'ReserveDetail', params: { id: nutri.id } }" class="book-link">
                馬上預約諮詢
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部簡單 Footer -->
    <footer class="simple-footer">
      <div class="container">
        <p>© 2025 My Fitness Coach. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchAllInstructors } from '@/data/instructors'

const AllInstructors = ref([])
const FilteredInstructors = ref([])
const TopThreeInstructors = ref([])
const searchQuery = ref('')

// 排名時間篩選 (預設為 2026 年 4 月)
const selectedYear = ref(2026)
const selectedMonth = ref(4)
const yearOptions = [2024, 2025, 2026]

const loadInstructors = async (name = '') => {
  // 將時間篩選傳入 fetchAllInstructors
  const data = await fetchAllInstructors(name, selectedYear.value, selectedMonth.value)
  
  if (name === '' && selectedYear.value === 2026 && selectedMonth.value === 4) {
    // 初始化或重置時，設定所有營養師與排名前三
    AllInstructors.value = data
    TopThreeInstructors.value = data.slice(0, 3)
    FilteredInstructors.value = data
  } else if (name !== '') {
    // 僅搜尋名稱時，只更新過濾後的列表
    FilteredInstructors.value = data
  } else {
    // 僅切換時間時，全量更新 (包含排名)
    AllInstructors.value = data
    TopThreeInstructors.value = data.slice(0, 3)
    FilteredInstructors.value = data
  }
}

const handleSearch = () => {
  loadInstructors(searchQuery.value)
}

onMounted(() => {
  loadInstructors()
})
</script>

<style scoped>
.all-instructors-page {
  background-color: var(--bg);
  min-height: 100vh;
  padding-top: 80px;
}

.search-section {
  margin-top: -40px; 
  margin-bottom: 40px;
}

.filter-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.date-filters {
  display: flex;
  gap: 12px;
}

.date-filters select {
  padding: 10px 20px;
  border-radius: 100px;
  border: 1.5px solid var(--border);
  background: white;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.date-filters select:focus {
  border-color: var(--accent);
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 15px 20px 15px 55px;
  border-radius: 100px;
  border: 1.5px solid var(--border);
  background: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}

.search-box input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(212, 184, 146, 0.1);
}

.page-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  padding: 20px 0;
  background: rgba(245, 240, 235, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  transition: transform 0.3s;
}

.back-link:hover {
  transform: translateX(-4px);
  color: var(--accent-dark);
}

.page-header {
  padding: 60px 0 40px;
  text-align: center;
}

.page-header h1 {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 400;
  margin: 16px 0;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 32px;
}

.btn-outline {
  padding: 12px 28px;
  border-radius: 100px;
  border: 1.5px solid var(--border);
  font-size: 0.9rem;
  font-weight: 600;
  background: transparent;
  color: var(--text-primary);
  transition: all 0.3s;
  cursor: pointer;
  text-decoration: none;
}

.btn-outline:hover {
  background: var(--bg-dark);
  color: #fff;
  border-color: var(--bg-dark);
}

/* 領獎台樣式 */
.podium-section {
  padding: 40px 0 80px;
}

.podium-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  min-height: 480px;
}

.podium {
  display: flex;
  align-items: flex-end;
  gap: 15px;
  width: 100%;
  max-width: 900px;
}

.podium-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rank-2 { order: 1; }
.rank-1 { order: 2; z-index: 2; }
.rank-3 { order: 3; }

.podium-card {
  width: 100%;
  max-width: 240px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px 15px;
  margin-bottom: 12px;
  box-shadow: 0 10px 30px rgba(26, 22, 19, 0.08);
  text-align: center;
  border: 1px solid rgba(212, 204, 194, 0.4);
  transition: transform 0.3s ease;
}

.podium-item:hover .podium-card {
  transform: translateY(-8px);
}

.podium-img-wrap {
  width: 90px;
  height: 90px;
  margin: 0 auto 16px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  position: relative;
}

.rank-1 .podium-img-wrap {
  width: 120px;
  height: 120px;
  border-color: var(--accent);
}

.podium-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.crown {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%) rotate(-10deg);
  font-size: 2rem;
  z-index: 3;
}

.podium-info h3 {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.podium-specialty {
  font-size: 0.78rem;
  color: var(--accent-dark);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.podium-base {
  width: 100%;
  border-radius: 12px 12px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.4s ease;
}

.podium-base::after {
  content: attr(data-rank);
  font-family: var(--font-display);
  font-size: 3.5rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.6);
}

.base-1 { 
  height: 200px; 
  background: linear-gradient(180deg, #d4b892 0%, #bf9f77 100%); 
  box-shadow: 0 10px 25px rgba(191, 159, 119, 0.3);
}

.base-2 { 
  height: 140px; 
  background: linear-gradient(180deg, #e6cdac 0%, #d4b892 100%); 
  box-shadow: 0 10px 20px rgba(169, 135, 94, 0.15);
}

.base-3 { 
  height: 100px; 
  background: linear-gradient(180deg, #f5e4d0 0%, #e6cdac 100%); 
  box-shadow: 0 10px 15px rgba(212, 184, 146, 0.2);
}

/* 網格佈局 */
.instructors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  padding-bottom: 100px;
}

/* 複用原本的卡片樣式並稍作微調 */
.nutri-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid rgba(212,204,194,0.5);
  transition: transform 0.4s, box-shadow 0.4s;
}

.nutri-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 50px rgba(26,22,19,0.08);
}

.nutri-img-wrap {
  height: 320px;
  overflow: hidden;
}

.nutri-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  transition: transform 0.6s;
}

.nutri-card:hover .nutri-img {
  transform: scale(1.05);
}

.nutri-body {
  padding: 30px;
}

.nutri-specialty {
  font-size: 0.76rem;
  color: var(--accent-dark);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.nutri-body h3 {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 500;
  margin-bottom: 12px;
}

.nutri-body p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 20px;
}

.nutri-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.nutri-tag {
  background: var(--tag-bg);
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.book-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--text-primary);
  padding-bottom: 4px;
  transition: all 0.3s;
}

.book-link:hover {
  gap: 12px;
  color: var(--accent-dark);
  border-color: var(--accent-dark);
}

.simple-footer {
  padding: 40px 0;
  text-align: center;
  border-top: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .instructors-grid {
    grid-template-columns: 1fr;
  }
}
</style>
