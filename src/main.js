import { createApp } from 'vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// 全域樣式（CSS 變數、Reset、Fonts）— 必須在元件之前載入
import './styles/global.css'

//載入根組件App.vue
import App from './App.vue'
import router from './router/index.ts'

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.mount('#app')
