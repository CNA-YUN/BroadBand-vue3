<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <div class="logo-title">
            <img src="/logo.ico" alt="公司Logo" class="logo-img">
            <h3>注册报装账号</h3>
          </div>
          <el-button link @click="$router.push('/login')">已有账号？去登录</el-button>
        </div>
      </template>
      <!-- 操作指引详细卡片（展开状态，无折叠） -->
      <div class="guide-card">
        <div class="guide-title">📖 操作指引</div>
        <div class="guide-steps">
          <p>1. 填写手机号 → 获取验证码 → 设置密码 → 确认密码 → 点击【立即注册】。</p>
          <p>2. 注册成功后，前往登录页使用手机号和密码登录系统。</p>
          <p>3. 在套餐大厅选择适合的套餐，点击【立即办理】。</p>
          <p>4. 填写姓名、联系电话、详细装机地址，提交后工作人员将在30分钟内联系预约安装时间。</p>
        </div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="handleRegister">

        <!-- 1. 手机号 -->
        <el-form-item prop="phone" label="手机号码">
          <el-input v-model="form.phone" placeholder="请输入 11 位手机号" clearable />
        </el-form-item>

        <!-- 2. 短信验证码（带倒计时） -->
        <el-form-item prop="code" label="短信验证码">
          <div class="code-wrapper">
            <el-input v-model="form.code" placeholder="请输入 6 位验证码" clearable />
            <el-button class="code-btn" :disabled="counting" @click="sendCode">
              {{ counting ? `${countdown}s 后重发` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <!-- 3. 设置密码（需满足后端强密码要求） -->
        <el-form-item prop="password" label="设置密码">
          <el-input v-model="form.password" type="password" placeholder="至少 8 位，包含字母和数字" show-password clearable />
          <div class="hint">💡 密码需至少 8 位，且同时包含字母和数字</div>
        </el-form-item>

        <!-- 4. 确认密码 -->
        <el-form-item prop="confirm_password" label="确认密码">
          <el-input v-model="form.confirm_password" type="password" placeholder="请再次输入密码" show-password />
        </el-form-item>

        <!-- 5. 提交 -->
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleRegister" class="submit-btn">
            立即注册
          </el-button>
        </el-form-item>

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
const loading = ref(false)
const counting = ref(false)
const countdown = ref(60)
// let VITE_API_BASE = '172.31.253.115:8000'
// 📝 表单数据
const form = reactive({
  phone: '',
  code: '',
  password: '',
  confirm_password: ''
})

// ✅ 校验规则（前端先拦，不满足格式不发给后端）
const rules = {
  phone: [
    { required: true, message: '手机号不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为 6 位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        // 对齐后端 auth.py 的 is_strong_password 逻辑
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
        if (!regex.test(value)) {
          callback(new Error('密码至少 8 位，且必须包含字母和数字'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirm_password: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次密码输入不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 📲 发送验证码逻辑
const sendCode = async () => {
  // 1. 先校验手机号格式
  try {
    await formRef.value.validateField('phone')
  } catch (e) {
    return // 手机号不合法，不发请求
  }

  counting.value = true
  try {
    // 2. 请求后端
    // const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
    await axios.post(`/auth/send-code`, { phone: form.phone })

    ElMessage.success('✅ 验证码已发送，请查收短信')

    // 3. 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        counting.value = false
      }
    }, 1000)
  } catch (err) {
    const msg = err.response?.data?.detail || '发送失败'
    ElMessage.error(`❌ ${msg}`)
    counting.value = false // 失败则重置，允许重试
  }
}

// 🚀 注册提交逻辑
const handleRegister = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      // const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

      // 注意：后端 schemas.py 要求 is_admin 字段，默认注册为普通用户 false
      await axios.post(`/auth/register`, {
        phone: form.phone,
        code: form.code,
        password: form.password,
        is_admin: false
      })

      ElMessage.success('🎉 注册成功！正在跳转登录页...')
      setTimeout(() => {
        router.push('/login')
      }, 1000)

    } catch (err) {
      const msg = err.response?.data?.detail || '网络异常'
      ElMessage.error(`❌ ${msg}`)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.logo-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-img {
  width: 28px;
  height: 28px;
}

.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
}

.register-card {
  width: 450px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-wrapper {
  display: flex;
  gap: 10px;
}

.code-btn {
  width: 130px;
}

.hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.submit-btn {
  width: 100%;
}

.guide-card {
  background: #f0f9ff;
  border-left: 4px solid #409EFF;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.guide-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
  color: #303133;
}

.guide-steps p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}
</style>