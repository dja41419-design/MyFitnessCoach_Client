import { ref, onMounted } from 'vue'
import { fetchAllInstructors, type Instructor } from '@/data/instructors'

export function useInstructors() {
  const allInstructors = ref<Instructor[]>([])
  const filteredInstructors = ref<Instructor[]>([])
  const topThreeInstructors = ref<Instructor[]>([])
  const searchQuery = ref('')

  // 排名時間篩選 (預設為 2026 年 4 月)
  const selectedYear = ref(2026)
  const selectedMonth = ref(4)
  const yearOptions = [2024, 2025, 2026]

  const loadInstructors = async (name: string = '') => {
    // 將時間篩選傳入 fetchAllInstructors
    const data = await fetchAllInstructors(name, selectedYear.value, selectedMonth.value)
    
    if (name === '' && selectedYear.value === 2026 && selectedMonth.value === 4) {
      // 初始化或重置時，設定所有營養師與排名前三
      allInstructors.value = data
      topThreeInstructors.value = data.slice(0, 3)
      filteredInstructors.value = data
    } else if (name !== '') {
      // 僅搜尋名稱時，只更新過濾後的列表
      filteredInstructors.value = data
    } else {
      // 僅切換時間時，全量更新 (包含排名)
      allInstructors.value = data
      topThreeInstructors.value = data.slice(0, 3)
      filteredInstructors.value = data
    }
  }

  const handleSearch = () => {
    loadInstructors(searchQuery.value)
  }

  return {
    allInstructors,
    filteredInstructors,
    topThreeInstructors,
    searchQuery,
    selectedYear,
    selectedMonth,
    yearOptions,
    loadInstructors,
    handleSearch
  }
}
