import { createApp } from 'vue'

// 全域樣式（CSS 變數、Reset、Fonts）— 必須在元件之前載入
import './styles/global.css'

import App from './App.vue'

createApp(App).mount('#app')
