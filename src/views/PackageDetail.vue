<template>
    <div class="mobile-padding" v-loading="loading">
        <el-card v-if="pkg" class="detail-card">
            <h2>{{ pkg.name }}</h2>
            <p class="price">{{ pkg.price }}</p>
            <p class="desc-pre">{{ pkg.description }}</p>
            <el-divider />
            <h3>填写报装信息</h3>
            <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
                <el-form-item label="客户姓名" prop="customer_name"><el-input v-model="form.customer_name"
                        placeholder="真实姓名" /></el-form-item>
                <el-form-item label="联系电话" prop="contact_phone"><el-input v-model="form.contact_phone"
                        placeholder="以便安装师傅联系" /></el-form-item>
                <el-form-item label="安装地址" prop="address"><el-input v-model="form.address" type="textarea" rows="3"
                        placeholder="详细到门牌号" /></el-form-item>
                <el-button type="success" :loading="submitting" @click="submitOrder" block size="large">
                    提交订单</el-button>
                <el-button type="primary" :loading="submitting" @click="router.push('/packages')" block size="large">
                    返回</el-button>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/api/request'

const route = useRoute()
const router = useRouter()
const pkg = ref(null)
const loading = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({ package_id: null, customer_name: '', contact_phone: '', address: '' })
const rules = {
    customer_name: [{ required: true, message: '必填', trigger: 'blur' }],
    contact_phone: [{ required: true, message: '必填', trigger: 'blur' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号错误', trigger: 'blur' }],
    address: [{ required: true, message: '必填', trigger: 'blur' }]
}

onMounted(async () => {
    loading.value = true
    pkg.value = await request.get(`/packages/${route.params.id}`)
    form.package_id = pkg.value.id
    loading.value = false
})

const submitOrder = async () => {
    await formRef.value.validate(async (valid) => {
        if (!valid) return
        submitting.value = true
        try {
            await request.post('/orders/', form)
            ElMessage.success('🎉 提交成功！')
            router.push('/dashboard')
        } catch (e) { ElMessage.error(e.response?.data?.detail || '提交失败') }
        finally { submitting.value = false }
    })
}
</script>

<style scoped>
.desc-pre {
  text-align: left;
  white-space: pre-wrap;    /* 保留换行符 */
  word-break: break-word;   /* 防止长单词/URL 撑破容器 */
  line-height: 1.6;         /* 适当行高，更易阅读（可选） */
}
.detail-card {
    max-width: 600px;
    margin: 20px auto;
}
.detail-card h2,
.detail-card .price {
    text-align: center;
}

.price {
    color: #f56c6c;
    font-size: 28px;
    font-weight: bold;
}
</style>