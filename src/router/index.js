import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  { path: '/login', component: () => import('@/views/Login.vue') },
  { path: '/dashboard', component: () => import('@/views/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/admin/orders', component: () => import('@/views/AdminOrders.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/403', component: () => import('@/views/403.vue') } // 权限不足页
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🛡️ 全局前置守卫（每次跳转前执行）
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 1. 需要登录但没 Token → 踢去登录
  if (to.meta.requiresAuth && !userStore.isLogin) {
    return next('/login')
  }
  
  // 2. 需要管理员但不是管理员 → 踢去 403
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return next('/403')
  }
  
  // 3. 已登录却访问登录页 → 自动跳对应首页
  if (to.path === '/login' && userStore.isLogin) {
    return next(userStore.isAdmin ? '/admin/orders' : '/dashboard')
  }
  
  next() // 放行
})

export default router