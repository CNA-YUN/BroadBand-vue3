import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 10000  // 10 秒超时
})

// 🔁 请求拦截：自动带上 Token
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 🔁 响应拦截：统一处理错误
request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Token 失效 → 踢回登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    if (error.response?.status === 403) {
      alert('❌ 权限不足，只有管理员能操作')
    }
    return Promise.reject(error)
  }
)

export default request