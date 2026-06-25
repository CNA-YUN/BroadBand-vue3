import axios from 'axios'
import { ElMessage } from 'element-plus' // ✅ 换掉原生 alert

const request = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE,
  baseURL: '', // ✅ 改成空字符串，让请求走 Vite 代理
  timeout: 10000
})

// 🔑 请求拦截：自动带 Token
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 🌐 响应拦截：统一兜底
request.interceptors.response.use(
  response => response.data,
  error => {
    // 1. Token 过期/无效 → 清缓存 + 强退登录页（replace 不留历史记录）
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.replace('/login')
    }
    // 2. 权限不足 → 优雅提示，不卡页面
    if (error.response?.status === 403) {
      ElMessage.error('❌ 权限不足，该操作仅管理员可用')
    }
    return Promise.reject(error)
  }
)

export default request