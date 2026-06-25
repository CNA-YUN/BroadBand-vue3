import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'  // ← 加这行导入 path
let VITE_API_BASE='http://localhost:8000'
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')  // ← 关键！让 @ 代表 src 目录
    }
  },
  server: {
    proxy: {
      '/auth': { target: VITE_API_BASE, changeOrigin: true },
      '/packages': { target: VITE_API_BASE, changeOrigin: true },
      '/orders': { target: VITE_API_BASE, changeOrigin: true },
      '/users': { target: VITE_API_BASE, changeOrigin: true }
    }
  }
})