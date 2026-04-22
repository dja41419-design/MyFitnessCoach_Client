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

    <!-- 紀錄清單 -->
    <div class="records-card">
      <h3 class="card-subtitle">點數異動紀錄</h3>
      
      <div v-if="loading" class="state-container">
        <p>讀取中...</p>
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
              <th>異動</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id">
              <td class="date-cell">{{ formatDate(record.date) }}</td>
              <td>{{ record.description }}</td>
              <td :class="['amount-cell', record.amount >= 0 ? 'positive' : 'negative']">
                {{ record.amount >= 0 ? '+' : '' }}{{ record.amount }}
              </td>
              <td>
                <span class="status-badge">{{ record.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
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
}

const balance = ref(0)
const loading = ref(true)
const records = ref<PointRecord[]>([])

// 格式化日期
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 獲取真實資料
async function fetchPointData() {
  loading.value = true
  try {
    const response = await fetch('/api/Points/my-points', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) throw new Error('無法取得點數資料')
    
    const data = await response.json()
    balance.value = Math.floor(data.balance) // 轉換為整數顯示
    records.value = data.history.map((r: any) => ({
      id: r.id,
      date: r.date,
      description: r.description,
      amount: r.amount,
      status: r.status
    }))
  } catch (err) {
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
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
  font-size: 2rem !important;
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
}
</style>
