import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // 允許 ngrok 的主機存取，解決結帳後導回被阻擋的問題
    // allowedHosts: [
    //   'worshiper-episode-purse.ngrok-free.dev'
    // ],
    proxy: {
      '/api': {
        target: 'https://localhost:7212',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      '/StaticFiles': {
        target: 'https://localhost:7212',
        changeOrigin: true,
        secure: false
      },
      '/images': {
        target: 'https://localhost:7212',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
