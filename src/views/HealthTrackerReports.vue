<template>
  <div class="ht-reports">
    <!-- 摘要統計 -->
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-num n-info">{{ latestWeight ?? '—' }}</div>
        <div class="summary-label">目前體重</div>
        <div class="summary-sub">kg</div>
      </div>
      <div class="summary-item">
        <div class="summary-num n-warn">{{ latestBodyFat ?? '—' }}</div>
        <div class="summary-label">體脂率</div>
        <div class="summary-sub">%</div>
      </div>
      <div class="summary-item">
        <div class="summary-num n-green">{{ latestMuscle ?? '—' }}</div>
        <div class="summary-label">肌肉量</div>
        <div class="summary-sub">kg</div>
      </div>
      <div class="summary-item">
        <div class="summary-num">{{ latestBmi ?? '—' }}</div>
        <div class="summary-label">BMI</div>
        <div class="summary-sub">
          <span v-if="latestBmiInfo" :class="['badge', latestBmiInfo.cls]">{{ latestBmiInfo.text }}</span>
        </div>
      </div>
      <div class="summary-item">
        <div :class="['summary-num', weightDiff != null && weightDiff > 0 ? 'n-warn' : weightDiff != null && weightDiff < 0 ? 'n-green' : '']">
          {{ weightDiff != null ? (weightDiff > 0 ? '+' : '') + weightDiff : '—' }}
        </div>
        <div class="summary-label">距目標差距</div>
        <div class="summary-sub">kg</div>
      </div>
    </div>

    <!-- 日期範圍控制 -->
    <div class="card">
      <div class="date-range-bar">
        <div class="range-btns">
          <button
            v-for="d in [7, 14, 30, 90, 180, 365]"
            :key="d"
            :class="['range-btn', { active: reportRange === d && !customRange }]"
            @click="setRange(d)"
          >{{ d }} 天</button>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="date" v-model="customStart" class="form-input" style="font-size:12px" @change="onCustomRange" />
          <span style="font-size:12px;color:var(--ht-text3)">至</span>
          <input type="date" v-model="customEnd" class="form-input" style="font-size:12px" @change="onCustomRange" />
        </div>
      </div>
    </div>

    <!-- 圖表 -->
    <div class="chart-grid">
      <!-- 體重趨勢 -->
      <div class="card">
        <div class="card-title">體重 / 體脂 / 肌肉量趨勢</div>
        <div class="chart-container">
          <canvas ref="weightChartEl"></canvas>
        </div>
      </div>

      <!-- 熱量圖 -->
      <div class="card">
        <div class="card-title">每日熱量攝取 vs 目標</div>
        <div class="chart-container">
          <canvas ref="calorieChartEl"></canvas>
        </div>
      </div>
    </div>

    <!-- 巨量素分配 -->
    <div class="card" style="max-width:420px">
      <div class="card-title">期間平均巨量素分配</div>
      <div class="chart-container">
        <canvas ref="macroChartEl"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  Chart,
  LineController, BarController, DoughnutController,
  LineElement, BarElement, ArcElement,
  PointElement, CategoryScale, LinearScale,
  Legend, Tooltip, Filler,
  type ChartConfiguration,
} from 'chart.js'
import { useHealthTracker, calcBMI, bmiLabel, r1, r0 } from '@/composables/useHealthTracker'

Chart.register(
  LineController, BarController, DoughnutController,
  LineElement, BarElement, ArcElement,
  PointElement, CategoryScale, LinearScale,
  Legend, Tooltip, Filler,
)

const { bodyLogs, dietLogs, goals, todayStr, prevDay } = useHealthTracker()

// ── Date range ─────────────────────────────────────────────────
const reportRange = ref(14)
const customRange = ref(false)
const customStart = ref('')
const customEnd   = ref(todayStr())

function setRange(days: number) {
  reportRange.value = days
  customRange.value = false
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days + 1)
  customStart.value = start.toISOString().split('T')[0]
  customEnd.value   = end.toISOString().split('T')[0]
}

function onCustomRange() {
  customRange.value = true
}

// ── Computed date list ─────────────────────────────────────────
const reportDates = computed<string[]>(() => {
  const start = new Date(customStart.value || (() => {
    const d = new Date(); d.setDate(d.getDate() - reportRange.value + 1); return d.toISOString().split('T')[0]
  })())
  const end = new Date(customEnd.value || todayStr())
  const dates: string[] = []
  const cur = new Date(start)
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  return dates
})

// ── Summary stats ──────────────────────────────────────────────
const latestLog = computed(() => bodyLogs.value[0])
const latestWeight  = computed(() => latestLog.value?.weight ?? null)
const latestBodyFat = computed(() => latestLog.value?.bodyFat ?? null)
const latestMuscle  = computed(() => latestLog.value?.muscleMass ?? null)
const latestBmi     = computed(() => calcBMI(latestWeight.value, goals.value.height))
const latestBmiInfo = computed(() => latestBmi.value ? bmiLabel(latestBmi.value) : null)
const weightDiff    = computed(() => {
  if (latestWeight.value == null) return null
  return r1(latestWeight.value - goals.value.targetWeight)
})

// ── Chart refs ─────────────────────────────────────────────────
const weightChartEl  = ref<HTMLCanvasElement | null>(null)
const calorieChartEl = ref<HTMLCanvasElement | null>(null)
const macroChartEl   = ref<HTMLCanvasElement | null>(null)

let weightChart:  Chart | null = null
let calorieChart: Chart | null = null
let macroChart:   Chart | null = null

const GRID  = 'rgba(0,0,0,0.06)'
const FONT  = { family: "'Noto Sans TC', sans-serif", size: 10 }

function destroyCharts() {
  weightChart?.destroy();  weightChart  = null
  calorieChart?.destroy(); calorieChart = null
  macroChart?.destroy();   macroChart   = null
}

function buildCharts() {
  destroyCharts()
  const dates = reportDates.value

  // ── Weight trend chart ──────────────────────────────────────
  const bodyData = dates.map(d => bodyLogs.value.find(l => l.date === d))
  const weights      = bodyData.map(l => l?.weight ?? null)
  const bodyFats     = bodyData.map(l => l?.bodyFat ?? null)
  const muscles      = bodyData.map(l => l?.muscleMass ?? null)
  const labels       = dates.map(d => d.slice(5)) // MM-DD

  if (weightChartEl.value) {
    weightChart = new Chart(weightChartEl.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '體重(kg)',
            data: weights,
            borderColor: '#4a7a9e',
            backgroundColor: 'rgba(74,122,158,0.08)',
            tension: 0.3,
            spanGaps: true,
            yAxisID: 'y',
          },
          {
            label: '體脂(%)',
            data: bodyFats,
            borderColor: '#a07828',
            backgroundColor: 'transparent',
            tension: 0.3,
            spanGaps: true,
            borderDash: [4, 3],
            yAxisID: 'y1',
          },
          {
            label: '肌肉(kg)',
            data: muscles,
            borderColor: '#5c7a5c',
            backgroundColor: 'transparent',
            tension: 0.3,
            spanGaps: true,
            borderDash: [2, 2],
            yAxisID: 'y',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { font: FONT, boxWidth: 12 } },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { ticks: { font: FONT }, grid: { color: GRID } },
          y: {
            type: 'linear', position: 'left',
            ticks: { font: FONT },
            grid: { color: GRID },
          },
          y1: {
            type: 'linear', position: 'right',
            ticks: { font: FONT, callback: v => v + '%' },
            grid: { drawOnChartArea: false },
          },
        },
      },
    } as ChartConfiguration)
  }

  // ── Calorie bar chart ───────────────────────────────────────
  const calData = dates.map(d => {
    const log = dietLogs.value[d]
    if (!log) return null
    let cal = 0
    for (const items of Object.values(log.meals)) {
      for (const it of items) cal += it.cal * it.servings
    }
    return r0(cal)
  })
  const goalLine = dates.map(() => goals.value.calories)

  if (calorieChartEl.value) {
    calorieChart = new Chart(calorieChartEl.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '攝取熱量(kcal)',
            data: calData,
            backgroundColor: 'rgba(92,122,92,0.65)',
            borderColor: '#5c7a5c',
            borderWidth: 1,
          },
          {
            type: 'line' as any,
            label: '目標熱量',
            data: goalLine,
            borderColor: '#b84f37',
            borderDash: [5, 3],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { font: FONT, boxWidth: 12 } },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { ticks: { font: FONT }, grid: { color: GRID } },
          y: { ticks: { font: FONT }, grid: { color: GRID } },
        },
      },
    } as ChartConfiguration)
  }

  // ── Macro doughnut ──────────────────────────────────────────
  let totalP = 0, totalC = 0, totalF = 0
  for (const d of dates) {
    const log = dietLogs.value[d]
    if (!log) continue
    for (const items of Object.values(log.meals)) {
      for (const it of items) {
        totalP += it.p * it.servings
        totalC += it.c * it.servings
        totalF += it.f * it.servings
      }
    }
  }
  const calP = r0(totalP * 4)
  const calC = r0(totalC * 4)
  const calF = r0(totalF * 9)
  const total = calP + calC + calF || 1

  if (macroChartEl.value) {
    macroChart = new Chart(macroChartEl.value, {
      type: 'doughnut',
      data: {
        labels: ['蛋白質', '碳水化合物', '脂肪'],
        datasets: [{
          data: [calP, calC, calF],
          backgroundColor: ['#7a9aaa', '#a49a6a', '#aa7a7a'],
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { font: FONT, boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: ctx => {
                const val = ctx.raw as number
                return ` ${ctx.label}: ${val} kcal (${r0((val / total) * 100)}%)`
              },
            },
          },
        },
      },
    } as ChartConfiguration)
  }
}

onMounted(() => {
  setRange(reportRange.value)
  buildCharts()
})

onUnmounted(destroyCharts)

watch(reportDates, () => buildCharts())
</script>

<style scoped>
.form-input {
  font-family: var(--font-body);
  font-size: 13px;
  border: 1px solid var(--ht-border);
  border-radius: 4px;
  padding: 6px 9px;
  background: var(--ht-surface);
  color: var(--ht-text);
  outline: none;
  transition: border-color 0.15s;
}
.form-input:focus { border-color: var(--ht-green); }

.card {
  background: var(--ht-surface);
  border: 1px solid var(--ht-border);
  border-radius: var(--ht-radius);
  padding: 18px;
  margin-bottom: 12px;
}
.card-title {
  font-size: 10px;
  font-weight: 600;
  color: var(--ht-text3);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}
@media (max-width: 640px) { .summary-grid { grid-template-columns: repeat(3, 1fr); } }

.summary-item {
  background: var(--ht-surface);
  border: 1px solid var(--ht-border);
  border-radius: var(--ht-radius);
  padding: 13px 8px;
  text-align: center;
}
.summary-num {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 3px;
  line-height: 1;
}
.n-green { color: var(--ht-green); }
.n-info  { color: var(--ht-info); }
.n-warn  { color: var(--ht-warn); }
.summary-label { font-size: 11px; color: var(--ht-text2); }
.summary-sub   { font-size: 10px; color: var(--ht-text3); margin-top: 1px; }

.badge        { display: inline-block; padding: 2px 7px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-green  { background: var(--ht-green-light); color: var(--ht-green); }
.badge-yellow { background: #fdf3e0; color: #9e7a28; }
.badge-red    { background: #f5e5e2; color: var(--ht-danger); }

.date-range-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.range-btns { display: flex; gap: 6px; }
.range-btn {
  padding: 5px 13px;
  border: 1px solid var(--ht-border);
  border-radius: 4px;
  background: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  color: var(--ht-text2);
  transition: all 0.15s;
}
.range-btn.active { background: var(--ht-green); border-color: var(--ht-green); color: #fff; }
.range-btn:hover:not(.active) { background: var(--ht-surface2); }

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 640px) { .chart-grid { grid-template-columns: 1fr; } }

.chart-container {
  position: relative;
  height: 210px;
}
</style>
