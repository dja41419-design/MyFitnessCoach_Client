<template>
  <div class="point-check-container">
    <div class="section-header">
      <h2 class="section-title">點數查詢</h2>
      <p class="section-desc">查看您的剩餘點數與歷史點數紀錄</p>
    </div>

    <!-- 點數概覽卡片 -->
    <div class="balance-card">
      <div class="balance-info">
        <span class="balance-label">當前可用點數</span>
        <div class="balance-value-wrap">
          <span class="balance-value">{{ balance }}</span>
          <span class="balance-unit">Points</span>
        </div>
      </div>
      <div class="balance-action">
        <router-link to="/lesson" class="top-up-btn">
          <i class="mdi mdi-plus-circle-outline"></i> 購買點數
        </router-link>
      </div>
    </div>

    <!-- 累積統計：3 張小卡 -->
    <div class="summary-grid">
      <div class="summary-card summary-earn">
        <i class="mdi mdi-arrow-up-bold-circle-outline"></i>
        <div class="summary-info">
          <span class="summary-label">累積儲值</span>
          <span class="summary-value">+{{ summary.totalEarned }}</span>
        </div>
      </div>
      <div class="summary-card summary-spend">
        <i class="mdi mdi-arrow-down-bold-circle-outline"></i>
        <div class="summary-info">
          <span class="summary-label">累積消費</span>
          <span class="summary-value">-{{ summary.totalSpent }}</span>
        </div>
      </div>
      <div class="summary-card summary-refund">
        <i class="mdi mdi-cash-refund"></i>
        <div class="summary-info">
          <span class="summary-label">累積退回</span>
          <span class="summary-value">+{{ summary.totalRefunded }}</span>
        </div>
      </div>
    </div>

    <!-- 紀錄清單 -->
    <div class="records-card">
      <div class="records-header">
        <h3 class="card-subtitle">點數異動紀錄</h3>
        <div class="filter-tabs">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            class="filter-tab"
            :class="{ active: filter === tab.value }"
            @click="changeFilter(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
      
      <div v-if="loading" class="state-container">
        <p>讀取中...</p>
      </div>

      <div v-else-if="errorMsg" class="state-container error-state">
        <p>⚠ {{ errorMsg }}</p>
      </div>

      <div v-else-if="records.length === 0" class="state-container">
        <div class="empty-icon">
          <i class="mdi mdi-rhombus-outline"></i>
        </div>
        <p>目前尚無點數異動紀錄</p>
      </div>

      <div v-else class="table-responsive">
        <table class="points-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>項目</th>
              <th style="text-align: center;">異動</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id">
              <td class="date-cell">{{ formatDate(record.date) }}</td>
              <td>{{ record.description }}</td>
              <td :class="['amount-cell', record.amount >= 0 ? 'positive' : 'negative']" style="text-align: center;">
                {{ record.amount >= 0 ? '+' : '' }}{{ record.amount }}
              </td>
              <td>
                <span class="status-badge">{{ record.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 分頁元件 -->
        <div class="pagination-container" v-if="totalPages > 1">
          <v-pagination
            v-model="page"
            :length="totalPages"
            :total-visible="7"
            @update:model-value="handlePageChange"
            color="var(--accent-dark)"
            rounded="circle"
            density="comfortable"
          ></v-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface PointRecord {
  id: number
  date: string
  description: string
  amount: number
  status: string
  type: 'recharge' | 'spend' | 'refund' | 'other'
}

interface PointSummary {
  totalEarned: number
  totalSpent: number
  totalRefunded: number
}

const balance  = ref(0)
const summary  = ref<PointSummary>({ totalEarned: 0, totalSpent: 0, totalRefunded: 0 })
const loading  = ref(true)
const errorMsg = ref('')
const records  = ref<PointRecord[]>([])

// 分頁相關
const page = ref(1)
const pageSize = 10
const totalPages = ref(1)

// 篩選
type Filter = 'all' | 'recharge' | 'spend' | 'refund'
const filter = ref<Filter>('all')
const filterTabs: { value: Filter; label: string }[] = [
  { value: 'all',      label: '全部' },
  { value: 'recharge', label: '儲值' },
  { value: 'spend',    label: '消費' },
  { value: 'refund',   label: '退回' },
]
function changeFilter(f: Filter) {
  if (filter.value === f) return
  filter.value = f
  fetchPointData(1)
}

// 格式化日期
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 獲取真實資料
async function fetchPointData(targetPage = 1) {
  loading.value = true
  errorMsg.value = ''
  try {
    const token = localStorage.getItem('token')
    const url = `/api/Points/my-points?page=${targetPage}&pageSize=${pageSize}&filter=${filter.value}`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token ?? ''}`
      }
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(`HTTP ${response.status}：${body?.error ?? '無法取得點數資料'}`)
    }

    const data = await response.json()
    balance.value    = Math.floor(data.balance)
    summary.value    = data.summary ?? { totalEarned: 0, totalSpent: 0, totalRefunded: 0 }
    totalPages.value = data.totalPages
    page.value       = data.currentPage

    records.value = data.history.map((r: any) => ({
      id:          r.id,
      date:        r.date,
      description: r.description,
      amount:      r.amount,
      status:      r.status,
      type:        r.type ?? 'other'
    }))
  } catch (err: any) {
    errorMsg.value = err.message ?? '發生未知錯誤'
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
  }
}

function handlePageChange(newPage: number) {
  fetchPointData(newPage)
  // 捲動回紀錄頂部
  const card = document.querySelector('.records-card')
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  fetchPointData()
})
</script>

<style scoped>
.point-check-container {
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

/* 點數概覽卡片 */
.balance-card {
  background: linear-gradient(135deg, var(--bg-dark) 0%, #2c2420 100%);
  border-radius: var(--radius-lg);
  padding: 32px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.balance-label {
  font-size: 0.9rem;
  opacity: 0.8;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 8px;
}

.balance-value-wrap {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.balance-value {
  font-family: var(--font-display);
  font-size: 3.5rem;
  font-weight: 600;
  line-height: 1;
}

.balance-unit {
  font-size: 1.1rem;
  opacity: 0.7;
}

.top-up-btn {
  background: var(--accent);
  color: var(--text-primary);
  padding: 12px 24px;
  border-radius: 100px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.top-up-btn:hover {
  background: var(--accent-dark);
  transform: translateY(-2px);
}

/* 累積統計卡 */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.summary-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}
.summary-card .mdi {
  font-size: 2.2rem;
  flex-shrink: 0;
}
.summary-earn   .mdi { color: #27ae60; }
.summary-spend  .mdi { color: #e74c3c; }
.summary-refund .mdi { color: var(--accent-dark); }
.summary-info { display: flex; flex-direction: column; gap: 4px; }
.summary-label {
  font-size: 0.82rem;
  color: var(--text-secondary);
  letter-spacing: 0.04em;
}
.summary-value {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}
.summary-earn   .summary-value { color: #27ae60; }
.summary-spend  .summary-value { color: #e74c3c; }
.summary-refund .summary-value { color: var(--accent-dark); }

/* 紀錄卡片標頭 + 篩選 */
.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.records-header .card-subtitle { margin-bottom: 0; }
.filter-tabs {
  display: flex;
  gap: 6px;
  background: var(--bg);
  padding: 4px;
  border-radius: 100px;
}
.filter-tab {
  padding: 6px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 100px;
  transition: all 0.2s;
}
.filter-tab.active {
  background: var(--bg-dark);
  color: var(--text-light);
}
.filter-tab:hover:not(.active) {
  color: var(--text-primary);
}

/* 紀錄卡片 */
.records-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 32px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.card-subtitle {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 24px;
}

.state-container {
  text-align: center;
  padding: 60px 0;
  color: var(--text-secondary);
}

.error-state {
  color: #c0392b;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.3;
}

/* 表格樣式 */
.table-responsive {
  overflow-x: auto;
}

.points-table {
  width: 100%;
  border-collapse: collapse;
}

.points-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  font-weight: 600;
}

.points-table td {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  font-size: 0.95rem;
}

.date-cell {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.amount-cell {
  font-weight: 700;
  font-family: var(--font-display);
  font-size: 1.25rem !important;
  letter-spacing: -0.02em;
}

.amount-cell.positive {
  color: #27ae60;
}

.amount-cell.negative {
  color: #e74c3c;
}

.status-badge {
  background: var(--bg);
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.pagination-container {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .balance-card {
    flex-direction: column;
    gap: 24px;
    text-align: center;
    padding: 24px;
  }

  .balance-value {
    font-size: 2.8rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .records-header {
    align-items: flex-start;
  }
  .filter-tabs {
    overflow-x: auto;
  }
}
</style>
