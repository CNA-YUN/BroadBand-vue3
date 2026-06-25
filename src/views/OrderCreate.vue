<template>
  <div class="order-container">
    <el-card class="order-card">
      <template #header>
        <div class="card-header">
          <h2>📝 办理新宽带</h2>
          <el-button @click="router.push('/dashboard')">我的订单</el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <!-- 1️⃣ 选套餐 - 卡片式选择 -->
        <el-form-item label="1. 选择套餐" prop="package_id">
          <div class="package-grid">
            <div 
              v-for="pkg in packages" 
              :key="pkg.id" 
              class="package-card"
              :class="{ 
                'selected': form.package_id === pkg.id,
                // 'recommended': pkg.name.includes('300M') 
              }"
              @click="form.package_id = pkg.id"
            >
              <div class="package-header">
                <h3>{{ pkg.name }}</h3>
                <!-- <el-tag v-if="pkg.name.includes('300M')" type="danger" size="small">推荐</el-tag> -->
              </div>
              
              <div class="package-price">
                <span class="currency"></span>
                <span class="amount">{{ pkg.price }}</span>
                <span class="unit"></span>
              </div>
              
              <div class="package-desc">{{ pkg.description }}</div>
              
              <div class="package-footer">
                <el-radio :model-value="form.package_id" :label="pkg.id">
                  选择此套餐
                </el-radio>
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- 2️⃣ 填信息 -->
        <el-form-item label="客户姓名" prop="customer_name">
          <el-input 
            v-model="form.customer_name" 
            placeholder="请填写真实姓名" 
            prefix-icon="User"
            clearable 
          />
        </el-form-item>

        <el-form-item label="联系电话" prop="contact_phone">
          <el-input 
            v-model="form.contact_phone" 
            placeholder="安装师傅将用此号码联系您" 
            prefix-icon="Phone"
            clearable 
          />
        </el-form-item>

        <el-form-item label="安装地址" prop="address">
          <el-input 
            v-model="form.address" 
            type="textarea" 
            :rows="3" 
            placeholder="详细到门牌号，例如：阳光小区3栋2单元501室" 
            clearable 
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            @click="submitOrder" 
            class="submit-btn" 
            size="large"
          >
            提交订单
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../api/request'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const packages = ref([])

const form = reactive({
  package_id: null,
  customer_name: '',
  contact_phone: '',
  address: ''
})

const rules = {
  package_id: [{ required: true, message: '请先选择一个套餐', trigger: 'change' }],
  customer_name: [{ required: true, message: '请填写姓名', trigger: 'blur' }],
  contact_phone: [
    { required: true, message: '请填写联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请填写详细安装地址', trigger: 'blur' }]
}

const fetchPackages = async () => {
  try {
    packages.value = await request.get('/packages/')
  } catch (err) {
    ElMessage.error('获取套餐失败，请稍后重试')
  }
}

const submitOrder = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      await request.post('/orders/', form)
      ElMessage.success('🎉 提交成功！安装师傅将尽快联系您')
      router.push('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || '网络异常，提交失败'
      ElMessage.error(`❌ ${msg}`)
    } finally {
      loading.value = false
    }
  })
}

onMounted(fetchPackages)
</script>

<style scoped>
.order-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 0 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
}

/* 📦 核心修改：改用 Flex 布局，强制卡片横向排列 */
.package-grid {
  display: flex;        /* ✅ 开启弹性盒子 */
  flex-wrap: wrap;      /* ✅ 允许换行（手机上会自动折行） */
  gap: 15px;            /* ✅ 卡片间距 */
  width: 100%;
}

.package-card {
  /* ✅ 核心魔法：自动平分空间，最小宽度 220px */
  flex: 1 1 220px; 
  
  border: 1px solid #e4e7ed; /* ✅ 边框细一点更精致 */
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fff;
  position: relative;
  box-sizing: border-box; /* ✅ 防止内边距撑破布局 */
  display: flex; /* 内部也垂直排列 */
  flex-direction: column;
  justify-content: space-between;
}

.package-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.package-card.selected {
  border-color: #409eff;
  background-color: #ecf5ff; /* ✅ 选中淡蓝背景 */
  box-shadow: 0 0 0 1px #409eff; /* ✅ 外发光效果 */
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.package-header h3 {
  margin: 0;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}

.package-price {
  margin: 8px 0;
  color: #f56c6c;
  font-weight: 400;
}

.package-price .amount {
  font-size: 20px; /* ✅ 价格适中 */
}

.package-desc {
  font-size: 16px;
  color: #909399;
  line-height: 1.5;
  margin-bottom: 10px;
}

.package-footer {
  margin-top: 10px;
  border-top: 1px solid #eee;
  padding-top: 8px;
  text-align: center;
}

/* 单选框隐藏掉圆圈，只保留文字，或者让父级 div 看起来像按钮 */
/* 如果你想让点击整个卡片都能选中，可以在 CSS 里隐藏原生的 radio */
.el-radio.is-checked .package-card {
  border-color: #409eff;
  background-color: #ecf5ff;
}

</style>