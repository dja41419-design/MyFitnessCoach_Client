//Vue 的官方套件中取出一個叫 createApp 的功能，作用是「建立一個新的網頁應用程式」
import { createApp } from 'vue'

// 全域樣式（CSS 變數、Reset、Fonts）— 必須在元件之前載入
import './styles/global.css'

//載入根組件App.vue
//把你自己寫的網頁內容（通常在 App.vue 這個檔案裡）拿進來，然後放在 createApp 裡面，最後把它掛載到網頁上 id 是 app 的地方
import App from './App.vue'
import router from './router/index.ts'

//createApp(App)：拿著剛才的藍圖（App），建立一個 Vue 實例。
//可拆成兩段
// 1.建立 Vue 實例 :const app = createApp(App)
// 2.掛載到 HTML 標籤 .mount('#app'):
//把剛才建立好vue app物件，塞進 index.html 檔案中 Id 叫作 app 的那個盒子裡。
createApp(App).use(router).mount('#app')
