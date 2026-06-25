<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="logo-title">
        <img src="/logo.ico" alt="公司Logo" class="logo-img">
        <h3>宽带报装预约系统 - 登录</h3>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" @keyup.enter="handleLogin">
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" prefix-icon="Phone" clearable />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="links">
        <router-link to="/register">注册新账号</router-link>
        <router-link to="/reset-password">忘记密码？</router-link>
      </div>
      <div style="font-size: 13px;color: gray;text-align: center;">人工客服电话:4000083299</div>
      <div style="font-size: 13px;color: gray;text-align: center;">工作时间:9:00-22:00</div>
    </el-card>
    
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({ phone: '', password: '' })
const rules = {
  phone: [
    { required: true, message: '手机号不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码至少 8 位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await axios.post('/auth/login', form)
      // 1. 存状态（同步完成，守卫立刻能读到）
      userStore.setToken(res.data.access_token)

      ElMessage.success('🎉 登录成功！')
     
      // 2. 决定跳哪
      // const targetPath = userStore.isAdmin ? '/admin/orders' : '/dashboard'
      const targetPath = userStore.isAdmin ? '/admin/orders' : '/packages'
      // console.log('🚀 准备跳转至:', targetPath, 'isAdmin:', userStore.isAdmin)
      // 3. 执行跳转（加 await 和 catch 捕获可能的导航错误）
      try {
        await router.replace(targetPath)
        // console.log('✅ 跳转成功')
      } catch (navError) {
        // console.error('❌ 跳转失败:', navError)
        ElMessage.error('跳转出错，请手动刷新')
      }
    } catch (error) {
      const msg = error.response?.data?.detail || '网络异常，请稍后重试'
      ElMessage.error(`❌ ${msg}`)
      console.error('登录请求失败:', error) // 打印具体错误
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 420px;
  padding: 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  /* ✅ 加个半透明白底，卡片才看得见 */
}
.logo-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}
.logo-img {
  width: 36px;
  height: 36px;
}
.login-card h2 {
  margin: 0;
  /* 移除原有的 margin-bottom，因为已在父容器控制 */
}
/* .login-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
} */

.login-btn {
  width: 100%;
  margin-top: 10px;
}

.links {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  font-size: 14px;
}

.links a {
  color: #409eff;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style>