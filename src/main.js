import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import ElementPlus from 'element-plus'          // ✅ 确保拼写是 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 挂载顺序：状态库 → 路由 → UI库
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')

// 🔧 开发环境调试用（生产环境自动不生效）
if (import.meta.env.DEV) {
  window.$router = router
}