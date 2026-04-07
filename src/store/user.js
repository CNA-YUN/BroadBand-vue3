import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    isAdmin: false,
    phone: ''
  }),
  getters: {
    isLogin: (state) => !!state.token
  },
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
      // 解码 Token 拿角色
      try {
        const decoded = jwtDecode(token)
        this.isAdmin = decoded.is_admin || false
        this.phone = decoded.sub
      } catch (e) {
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