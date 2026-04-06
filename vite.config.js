import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/auth': { target: 'http://localhost:8000', changeOrigin: true },
      '/packages': { target: 'http://localhost:8000', changeOrigin: true },
      '/orders': { target: 'http://localhost:8000', changeOrigin: true }
    }
  }
})