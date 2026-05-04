<script lang="ts" setup name="App">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { fetchCurrentUser } from '@/data/login'

// 啟動時以後端 cookie 為準同步登入狀態：
// 若 cookie 有效 → 以 server 回傳的 username / imageUrl 覆寫 localStorage
// 若 cookie 失效（401）→ 清掉可能被竄改的 localStorage，使 UI 顯示為未登入
onMounted(async () => {
  try {
    const me = await fetchCurrentUser()
    if (me) {
      localStorage.setItem('username', me.userName)
      localStorage.setItem('imageUrl', me.imageUrl ?? '')
      if (me.memberId != null) localStorage.setItem('memberId', String(me.memberId))
      else localStorage.removeItem('memberId')
    } else {
      localStorage.removeItem('username')
      localStorage.removeItem('imageUrl')
      localStorage.removeItem('memberId')
    }
  } catch {
    // 網路錯誤時維持現狀，避免誤踢使用者
  }
})
</script>

<template>
  <RouterView />
</template>
