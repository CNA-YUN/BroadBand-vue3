<template>
  <div class="reset-container">
    <el-card class="reset-card">
      <template #header>
        <div class="logo-title">
          <img src="/logo.ico" alt="公司Logo" class="logo-img">
          <h2>重置密码</h2>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="handleReset">
        <el-form-item label="注册手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入已注册的手机号" clearable />
        </el-form-item>

        <el-form-item label="短信验证码" prop="code">
          <div class="code-wrapper">
            <el-input v-model="form.code" placeholder="请输入6位验证码" clearable />
            <el-button class="code-btn" :disabled="counting" :loading="sendingCode" @click="sendResetCode">
              {{ counting ? `${countdown}s 后重发` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="新密码" prop="new_password">
          <el-input v-model="form.new_password" type="password" placeholder="至少8位，需含字母和数字" show-password clearable />
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirm_password">
          <el-input v-model="form.confirm_password" type="password" placeholder="请再次输入新密码" show-password clearable />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" class="submit-btn" @click="handleReset">确认重置</el-button>
        </el-form-item>

        <div class="back-link">
          <router-link to="/login">← 返回登录页</router-link>
        </div>
      </el-form>
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
const counting = ref(false)
const countdown = ref(60)
const sendingCode = ref(false)
const submitting = ref(false)

const form = reactive({
  phone: '',
  code: '',
  new_password: '',
  confirm_password: ''
})

// ✅ 校验规则（严格对齐后端 auth.py 的 is_strong_password）
const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
        if (!regex.test(value)) callback(new Error('密码至少8位，且必须包含字母和数字'))
        else callback()
      }, trigger: 'blur'
    }
  ],
  confirm_password: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.new_password) callback(new Error('两次密码不一致'))
        else callback()
      }, trigger: 'blur'
    }
  ]
}

// 📲 发送重置验证码
const sendResetCode = async () => {
  // 1. 先校验手机号格式
  try { await formRef.value.validateField('phone') } catch { return }

  sendingCode.value = true
  try {
    // const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
    await axios.post(`/auth/send-reset-code`, { phone: form.phone })
    ElMessage.success('✅ 验证码已发送')

    // 开始倒计时
    counting.value = true
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) { clearInterval(timer); counting.value = false }
    }, 1000)
  } catch (err) {
    ElMessage.error(`❌ ${err.response?.data?.detail || '发送失败'}`)
  } finally { sendingCode.value = false }
}

// 🚀 提交重置
const handleReset = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      // const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
      await axios.post(`/auth/reset-password`, {
        phone: form.phone,
        code: form.code,
        new_password: form.new_password
      })
      ElMessage.success('🎉 密码重置成功！请使用新密码登录')
      setTimeout(() => router.push('/login'), 1000)
    } catch (err) {
      ElMessage.error(`❌ ${err.response?.data?.detail || '重置失败'}`)
    } finally { submitting.value = false }
  })
}
</script>

<style scoped>
.logo-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.logo-img {
  width: 32px;
  height: 32px;
}

.reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
}

.reset-card {
  width: 450px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.reset-card h2 {
  text-align: center;
  margin: 0;
}

.code-wrapper {
  display: flex;
  gap: 10px;
}

.code-btn {
  width: 130px;
}

.submit-btn {
  width: 100%;
  margin-top: 10px;
}

.back-link {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}

.back-link a {
  color: #409eff;
  text-decoration: none;
}
</style>