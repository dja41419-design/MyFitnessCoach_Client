import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const CSP_META_TAG = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://accounts.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://accounts.google.com; frame-src https://accounts.google.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'" />`

function cspInjectPlugin() {
  return {
    name: 'csp-inject',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const replacement = ctx.server ? '' : CSP_META_TAG
        return html.replace('<!--CSP_PLACEHOLDER-->', replacement)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), cspInjectPlugin()],
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
