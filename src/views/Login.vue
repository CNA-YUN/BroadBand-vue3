<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>📡 宽带预约系统 - 登录</h2>
      
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        label-width="0"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" prefix-icon="Phone" clearable />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="Lock" 
            show-password 
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="links">
        <router-link to="/register">注册新账号</router-link>
        <router-link to="/forgot-password">忘记密码？</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

// 📝 表单数据
const form = reactive({
  phone: '',
  password: ''
})

// ✅ 校验规则（前端先拦一道，省得白跑后端）
const rules = {
  phone: [
    { required: true, message: '手机号不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ]
}

// 🚀 登录核心逻辑
const handleLogin = async () => {
  if (!formRef.value) return
  
  // 1. 先过前端校验
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      // 2. 呼叫后端接口
      const res = await axios.post('/auth/login', form)
      const { access_token } = res.data
      
      // 3. 存好“电子通行证”（后续请求自动带上）
			userStore.setToken(access_token) // 存 Token + 自动解码角色

			ElMessage.success('🎉 登录成功！')
			// 按角色跳转
			router.push(userStore.isAdmin ? '/admin/orders' : '/dashboard')
      
    } catch (error) {
      // 4. 后端报错统一抓 detail 字段
      const msg = error.response?.data?.detail || '网络异常，请稍后重试'
      ElMessage.error(`❌ ${msg}`)
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
}
.login-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}
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