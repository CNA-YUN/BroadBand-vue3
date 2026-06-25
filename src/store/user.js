import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useUserStore = defineStore('user', {
  state: () => {
    const token = localStorage.getItem('token')
    let isAdmin = false
    let phone = ''

    if (token) {
      try {
        const decoded = jwtDecode(token)
        isAdmin = decoded.is_admin || false
        phone = decoded.sub || ''
      } catch (e) {
        // token 无效或已过期，清除
        localStorage.removeItem('token')
      }
    }

    return {
      token: token || null,
      isAdmin,
      phone
    }
  },
  getters: {
    isLogin: (state) => !!state.token
  },
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
      try {
        const decoded = jwtDecode(token)
        this.isAdmin = decoded.is_admin || false
        this.phone = decoded.sub
      } catch (e) {
        console.warn('Token 解析失败，已自动登出', e)
        this.logout()
      }
    },
    logout() {
      this.token = null
      this.isAdmin = false
      this.phone = ''
      localStorage.removeItem('token')
    }
  }
})