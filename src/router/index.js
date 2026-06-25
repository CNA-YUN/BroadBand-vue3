import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  { path: '/', redirect: '/register' }, // 🧭 默认入口
  { path: '/login', component: () => import('@/views/Login.vue') },
  { path: '/register', component: () => import('@/views/Register.vue') },
  { path: '/reset-password', component: () => import('@/views/ResetPassword.vue') },
  { path: '/packages', component: () => import('@/views/Packages.vue'), meta: { requiresAuth: true } },
  { path: '/packages/:id', component: () => import('@/views/PackageDetail.vue'), meta: { requiresAuth: true } },
  { path: '/admin/users', component: () => import('@/views/AdminUsers.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  // { path: '/create-order', component: () => import('@/views/OrderCreate.vue'), meta: { requiresAuth: true } },
  { path: '/dashboard', component: () => import('@/views/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/admin/orders', component: () => import('@/views/AdminOrders.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/packages', component: () => import('@/views/AdminPackages.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/403', component: () => import('@/views/403.vue') },
  { path: '/:pathMatch(.*)*', component: () => import('@/views/404.vue') } // 🛡️ 兜底
]

const router = createRouter({ history: createWebHashHistory(), routes })

// 🛡️ 激活守卫（取消注释）
router.beforeEach((to) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLogin) return '/login'
  if (to.meta.requiresAdmin && !userStore.isAdmin) return '/403'

  const publicPages = ['/login', '/register', '/reset-password']
  if (publicPages.includes(to.path) && userStore.isLogin) {
    return userStore.isAdmin ? '/admin/orders' : '/dashboard'
  }

  return true
})

export default router