<template>
  <div class="ht-reports">
    <!-- 日期範圍控制 -->
    <div class="card">
      <div class="date-range-bar">
        <div class="range-btns">
          <button
            v-for="d in PRESET_DAYS"
            :key="d"
            :class="['range-btn', { active: !isCustom && selectedRange === d }]"
            :disabled="loading"
            @click="setRange(d)"
          >{{ d }} 天</button>
        </div>
        <div class="custom-range-inputs">
          <input type="date" v-model="customStart" class="form-input" :max="customEnd" :disabled="loading" />
          <span class="range-sep">至</span>
          <input type="date" v-model="customEnd" class="form-input" :min="customStart" :disabled="loading" />
          <button
            :class="['range-btn', { active: isCustom }]"
            :disabled="loading || !customStart || !customEnd"
            @click="applyCustom"
          >套用</button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-area">
      <div class="spinner"></div>
      <div class="state-text">載入報表中…</div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-area">
      <div class="state-text state-error-text">{{ error }}</div>
      <button class="range-btn active" style="margin-top:10px" @click="loadReport">重試</button>
    </div>

    <!-- 有資料 -->
    <template v-else-if="report">

      <!-- Summary cards -->
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-num n-info">{{ fmt1(report.summary.latestWeight) }}</div>
          <div class="summary-label">目前體重</div>
          <div class="summary-sub">kg</div>
        </div>
        <div class="summary-item">
          <div class="summary-num n-warn">{{ fmt1(report.summary.latestBodyFat) }}</div>
          <div class="summary-label">體脂率</div>
          <div class="summary-sub">% <span class="dir-badge">{{ dirArrow(report.trends.bodyFatDirection) }}</span></div>
        </div>
        <div class="summary-item">
          <div class="summary-num n-green">{{ fmt1(report.summary.latestSkeletalMuscle) }}</div>
          <div class="summary-label">骨骼肌</div>
          <div class="summary-sub">kg <span class="dir-badge">{{ dirArrow(report.trends.skeletalMuscleDirection) }}</span></div>
        </div>
        <div class="summary-item">
          <div class="summary-num">{{ fmt1(report.summary.latestBmi) }}</div>
          <div class="summary-label">BMI</div>
          <div class="summary-sub">
            <span v-if="bmiInfo" :class="['badge', bmiInfo.cls]">{{ bmiInfo.text }}</span>
          </div>
        </div>
        <div class="summary-item">
          <div :class="['summary-num', weightChangeClass]">{{ weightChangeText }}</div>
          <div class="summary-label">區間體重變化</div>
          <div class="summary-sub">kg <span class="dir-badge">{{ dirArrow(report.trends.weightDirection) }}</span></div>
        </div>
        <div class="summary-item">
          <div class="summary-num">{{ fmt0(report.summary.avgCalories) }}</div>
          <div class="summary-label">平均熱量</div>
          <div class="summary-sub">kcal/日</div>
        </div>
      </div>

      <!-- 體態趨勢 + 熱量圖 -->
      <div class="chart-grid">
        <div class="card">
          <div class="card-title">體重 / 體脂 / 骨骼肌趨勢</div>
          <div class="chart-container">
            <canvas v-if="report.series.body.length > 0" ref="weightChartEl"></canvas>
            <div v-else class="empty-chart">此區間無體態紀錄</div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">每日熱量攝取 vs 目標</div>
          <div class="chart-container">
            <canvas v-if="nutDatesWithCal.length > 0" ref="calorieChartEl"></canvas>
            <div v-else class="empty-chart">此區間無飲食紀錄</div>
          </div>
        </div>
      </div>

      <!-- 巨量素 + 蛋白質/水分趨勢 -->
      <div class="chart-grid chart-grid-mixed">
        <div class="card">
          <div class="card-title">期間平均巨量素分配</div>
          <div class="chart-container">
            <canvas v-if="hasMacro" ref="macroChartEl"></canvas>
            <div v-else class="empty-chart">此區間無飲食紀錄</div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">蛋白質攝取趨勢 / 每日水分</div>
          <div class="chart-container">
            <canvas v-if="nutDatesWithProOrWater.length > 0" ref="proWaterChartEl"></canvas>
            <div v-else class="empty-chart">此區間無飲食或水分紀錄</div>
          </div>
        </div>
      </div>

      <div class="record-summary">
        已記錄體態 <strong>{{ report.summary.recordedBodyDays }}</strong> 天
        ／ 飲食 &amp; 水分 <strong>{{ report.summary.recordedDietDays }}</strong> 天
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  Chart,
  LineController, BarController, DoughnutController,
  LineElement, BarElement, ArcElement,
  PointElement, CategoryScale, LinearScale,
  Legend, Tooltip, Filler
} from 'chart.js'
import type { ChartConfiguration } from 'chart.js'
import { getHealthReport, type HealthReportResponse } from '@/data/healthReports'
import { bmiLabel } from '@/composables/useGoals'

Chart.register(
  LineController, BarController, DoughnutController,
  LineElement, BarElement, ArcElement,
  PointElement, CategoryScale, LinearScale,
  Legend, Tooltip, Filler,
)

const PRESET_DAYS = [7, 14, 30, 90, 180, 365]

// ── Date range ─────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0]
const selectedRange = ref(14)
const isCustom      = ref(false)
const customStart   = ref('')
const customEnd     = ref(todayStr())

function setRange(days: number) {
  selectedRange.value = days
  isCustom.value = false
  const end   = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days + 1)
  customEnd.value   = end.toISOString().split('T')[0]
  customStart.value = start.toISOString().split('T')[0]
  loadReport()
}

function applyCustom() {
  if (!customStart.value || !customEnd.value) return
  isCustom.value = true
  loadReport()
}

// ── API state ───────────────────────────────────────────────────────
const report  = ref<HealthReportResponse | null>(null)
const loading = ref(false)
const error   = ref<string | null>(null)

async function loadReport() {
  loading.value = true
  error.value   = null
  try {
    const params = isCustom.value
      ? { fromDate: customStart.value, toDate: customEnd.value }
      : { rangeDays: selectedRange.value }
    report.value = await getHealthReport(params)
  } catch {
    error.value  = '報表載入失敗，請稍後再試。'
    report.value = null
  } finally {
    loading.value = false
  }
}

// ── Computed display helpers ────────────────────────────────────────
const bmiInfo = computed(() => {
  const bmi = report.value?.summary.latestBmi
  return bmi != null && bmi > 0 ? bmiLabel(bmi) : null
})

const nutDatesWithCal = computed(() =>
  report.value?.series.nutrition.filter(n => n.calories != null) ?? []
)

const nutDatesWithProOrWater = computed(() =>
  report.value?.series.nutrition.filter(n => n.protein != null || n.water != null) ?? []
)

const hasMacro = computed(() =>
  (report.value?.series.nutrition ?? [])
    .some(n => (n.protein ?? 0) > 0 || (n.carbs ?? 0) > 0 || (n.fat ?? 0) > 0)
)

const weightChangeClass = computed(() => {
  const c = report.value?.summary.weightChange
  if (c == null) return ''
  return c > 0 ? 'n-warn' : c < 0 ? 'n-green' : ''
})

const weightChangeText = computed(() => {
  const c = report.value?.summary.weightChange
  if (c == null) return '—'
  return (c > 0 ? '+' : '') + Number(c).toFixed(1)
})

const fmt1 = (v: number | null | undefined) =>
  v != null ? Number(v).toFixed(1) : '—'

const fmt0 = (v: number | null | undefined) =>
  v != null ? Math.round(Number(v)).toString() : '—'

function dirArrow(dir: string): string {
  if (dir === 'up')   return '↑'
  if (dir === 'down') return '↓'
  if (dir === 'flat') return '→'
  return ''
}

// ── Chart refs & instances ─────────────────────────────────────────
const weightChartEl   = ref<HTMLCanvasElement | null>(null)
const calorieChartEl  = ref<HTMLCanvasElement | null>(null)
const macroChartEl    = ref<HTMLCanvasElement | null>(null)
const proWaterChartEl = ref<HTMLCanvasElement | null>(null)

let weightChart:   Chart | null = null
let calorieChart:  Chart | null = null
let macroChart:    Chart | null = null
let proWaterChart: Chart | null = null

const GRID = 'rgba(0,0,0,0.06)'
const FONT = { family: "'Noto Sans TC', sans-serif", size: 10 }

function destroyCharts() {
  weightChart?.destroy();   weightChart   = null
  calorieChart?.destroy();  calorieChart  = null
  macroChart?.destroy();    macroChart    = null
  proWaterChart?.destroy(); proWaterChart = null
}

function buildCharts() {
  destroyCharts()
  if (!report.value) return
  const { series } = report.value

  // ── 1. Body trend ─────────────────────────────────────────────
  if (weightChartEl.value && series.body.length > 0) {
    const labels   = series.body.map(p => p.date.slice(5))
    const weights  = series.body.map(p => p.weight)
    const bodyFats = series.body.map(p => p.bodyFat)
    const muscles  = series.body.map(p => p.skeletalMuscle)

    weightChart = new Chart(weightChartEl.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '體重(kg)', data: weights,
            borderColor: '#4a7a9e', backgroundColor: 'rgba(74,122,158,0.08)',
            tension: 0.3, spanGaps: false, yAxisID: 'y',
          },
          {
            label: '體脂(%)', data: bodyFats,
            borderColor: '#a07828', backgroundColor: 'transparent',
            tension: 0.3, spanGaps: false, borderDash: [4, 3], yAxisID: 'y1',
          },
          {
            label: '骨骼肌(kg)', data: muscles,
            borderColor: '#5c7a5c', backgroundColor: 'transparent',
            tension: 0.3, spanGaps: false, borderDash: [2, 2], yAxisID: 'y',
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { font: FONT, boxWidth: 12 } },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x:  { ticks: { font: FONT }, grid: { color: GRID } },
          y:  { type: 'linear', position: 'left',  ticks: { font: FONT }, grid: { color: GRID } },
          y1: { type: 'linear', position: 'right',
                ticks: { font: FONT, callback: v => v + '%' },
                grid: { drawOnChartArea: false } },
        },
      },
    } as ChartConfiguration)
  }

  // ── 2. Calorie bar chart ───────────────────────────────────────
  if (calorieChartEl.value && series.nutrition.length > 0) {
    const labels   = series.nutrition.map(p => p.date.slice(5))
    const calData  = series.nutrition.map(p => p.calories)
    const goalLine = series.nutrition.map(p => p.targetCalories)

    calorieChart = new Chart(calorieChartEl.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '攝取熱量(kcal)', data: calData,
            backgroundColor: 'rgba(92,122,92,0.65)',
            borderColor: '#5c7a5c', borderWidth: 1,
          },
          {
            type: 'line' as any,
            label: '目標熱量', data: goalLine,
            borderColor: '#b84f37', borderDash: [5, 3],
            borderWidth: 1.5, pointRadius: 0, fill: false,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
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

  // ── 3. Macro doughnut ─────────────────────────────────────────
  if (macroChartEl.value && hasMacro.value) {
    const nut    = series.nutrition
    const totalP = nut.reduce((s, n) => s + Number(n.protein ?? 0), 0)
    const totalC = nut.reduce((s, n) => s + Number(n.carbs   ?? 0), 0)
    const totalF = nut.reduce((s, n) => s + Number(n.fat     ?? 0), 0)
    const calP   = Math.round(totalP * 4)
    const calC   = Math.round(totalC * 4)
    const calF   = Math.round(totalF * 9)
    const total  = calP + calC + calF || 1

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
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { font: FONT, boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: ctx => {
                const val = ctx.raw as number
                return ` ${ctx.label}: ${val} kcal (${Math.round((val / total) * 100)}%)`
              },
            },
          },
        },
      },
    } as ChartConfiguration)
  }

  // ── 4. Protein + Water chart ───────────────────────────────────
  if (proWaterChartEl.value && nutDatesWithProOrWater.value.length > 0) {
    const labels    = series.nutrition.map(p => p.date.slice(5))
    const proData   = series.nutrition.map(p => p.protein)
    const waterData = series.nutrition.map(p => p.water)

    proWaterChart = new Chart(proWaterChartEl.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '蛋白質(g)', data: proData,
            borderColor: '#7a9aaa', backgroundColor: 'rgba(122,154,170,0.08)',
            tension: 0.3, spanGaps: false, yAxisID: 'y',
          },
          {
            label: '水分(ml)', data: waterData,
            borderColor: '#5a8aaa', backgroundColor: 'transparent',
            tension: 0.3, spanGaps: false, borderDash: [4, 3], yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { font: FONT, boxWidth: 12 } },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x:  { ticks: { font: FONT }, grid: { color: GRID } },
          y:  { type: 'linear', position: 'left',
                ticks: { font: FONT, callback: v => v + 'g' },
                grid: { color: GRID } },
          y1: { type: 'linear', position: 'right',
                ticks: { font: FONT, callback: v => v + 'ml' },
                grid: { drawOnChartArea: false } },
        },
      },
    } as ChartConfiguration)
  }
}

// ── Lifecycle ──────────────────────────────────────────────────────
onMounted(() => setRange(selectedRange.value))
onUnmounted(destroyCharts)

// Rebuild charts after DOM updates following report change
watch(report, buildCharts, { flush: 'post' })
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
.form-input:focus  { border-color: var(--ht-green); }
.form-input:disabled { opacity: 0.5; cursor: not-allowed; }

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

/* Date range bar */
.date-range-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.range-btns { display: flex; gap: 6px; flex-wrap: wrap; }
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
.range-btn:hover:not(.active):not(:disabled) { background: var(--ht-surface2); }
.range-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.custom-range-inputs { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.range-sep { font-size: 12px; color: var(--ht-text3); }

/* Summary grid */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}
@media (max-width: 900px) { .summary-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 480px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }

.summary-item {
  background: var(--ht-surface);
  border: 1px solid var(--ht-border);
  border-radius: var(--ht-radius);
  padding: 13px 8px;
  text-align: center;
}
.summary-num   { font-size: 20px; font-weight: 500; margin-bottom: 3px; line-height: 1; }
.n-green { color: var(--ht-green); }
.n-info  { color: var(--ht-info); }
.n-warn  { color: var(--ht-warn); }
.summary-label { font-size: 11px; color: var(--ht-text2); }
.summary-sub   { font-size: 10px; color: var(--ht-text3); margin-top: 1px; }
.dir-badge     { font-size: 12px; margin-left: 2px; }

.badge        { display: inline-block; padding: 2px 7px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-green  { background: var(--ht-green-light); color: var(--ht-green); }
.badge-yellow { background: #fdf3e0; color: #9e7a28; }
.badge-red    { background: #f5e5e2; color: var(--ht-danger); }

/* Chart grid */
.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.chart-grid-mixed { grid-template-columns: 1fr 1.5fr; }
@media (max-width: 640px) {
  .chart-grid, .chart-grid-mixed { grid-template-columns: 1fr; }
}

.chart-container {
  position: relative;
  height: 210px;
}
.empty-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 13px;
  color: var(--ht-text3);
}

/* Loading / error */
.state-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}
.state-text      { font-size: 14px; color: var(--ht-text2); }
.state-error-text { color: var(--ht-danger); }
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--ht-border);
  border-top-color: var(--ht-green);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Record summary footer */
.record-summary {
  font-size: 12px;
  color: var(--ht-text3);
  text-align: right;
  padding: 4px 2px 8px;
}
</style>
