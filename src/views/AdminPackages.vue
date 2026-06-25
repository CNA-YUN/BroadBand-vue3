<template>
  <div class="mobile-padding">
    <div class="header-flex">
      <h2>📦 套餐管理</h2>
      <div class="btn-group">
        <el-button type="primary" @click="router.push('/admin/orders')" class="mobile-btn">订单管理</el-button>
        <el-button type="primary" @click="router.push('/admin/users')" class="mobile-btn">用户管理</el-button>
        <el-button type="success" @click="openDialog()" class="mobile-btn">+ 新增套餐</el-button>
        <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
      </div>
    </div>
    <el-card>
      <div class="table-wrapper">
        <el-table :data="packages" stripe v-loading="loading" border class="responsive-table">
          <el-table-column prop="id" label="ID" width="60" align="center" />
          <el-table-column prop="name" label="套餐名称" width="150" />
          <el-table-column prop="description" label="套餐描述" min-width="150" show-overflow-tooltip />
          <el-table-column prop="price" label="费用" width="100" align="center">
            <template #default="{ row }">{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="is_active" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_active ? 'success' : 'info'">{{ row.is_active ? '已上架' : '已下架' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button size="small" @click="openDialog(row)" class="mobile-btn">编辑</el-button>
              <el-popconfirm title="确定删除该套餐吗？" @confirm="handleDelete(row.id)">
                <template #reference>
                  <el-button size="small" type="danger" class="mobile-btn">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 🟢 弹窗表单：手机端标签自动跑上方，输入框全宽 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑套餐' : '新增套餐'" width="90%" destroy-on-close
      :class="{ 'mobile-dialog': true }">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：100M极速宽带" clearable />
        </el-form-item>
        <el-form-item label="费用" prop="price">
          <el-input v-model="form.price" placeholder="例如：99元/月" clearable />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="套餐详情说明" clearable />
        </el-form-item>
        <el-form-item label="上架状态" prop="is_active">
          <el-switch v-model="form.is_active" active-text="上架" inactive-text="下架" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false" class="mobile-btn">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit" class="mobile-btn">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ref, reactive, onMounted } from 'vue'
import request from '../api/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const packages = ref([])
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const form = reactive({ id: null, name: '', price: '', description: '', is_active: true })
const rules = {
  name: [{ required: true, message: '套餐名称不能为空', trigger: 'blur' }],
  price: [{ required: true, message: '价格不能为空', trigger: 'blur' }],
  description: [{ required: true, message: '描述不能为空', trigger: 'blur' }]
}

const fetchPackages = async () => {
  loading.value = true
  try { packages.value = await request.get('/packages/?show_all=true') }
  catch { ElMessage.error('获取套餐列表失败') }
  finally { loading.value = false }
}

const openDialog = (row = null) => {
  isEdit.value = !!row
  if (row) Object.assign(form, { id: row.id, name: row.name, price: row.price, description: row.description, is_active: row.is_active })
  else Object.assign(form, { id: null, name: '', price: '', description: '', is_active: true })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEdit.value) await request.put(`/packages/${form.id}`, form)
      else await request.post('/packages/', form)
      ElMessage.success(isEdit.value ? '✅ 更新成功' : '✅ 创建成功')
      dialogVisible.value = false
      fetchPackages()
    } catch (err) { ElMessage.error(`❌ ${err.response?.data?.detail || '操作失败'}`) }
    finally { submitting.value = false }
  })
}

const handleLogout = () => {
  userStore.logout()
  router.replace('/login')
}
const handleDelete = async (id) => {
  try {
    await request.delete(`/packages/${id}`)
    ElMessage.success('✅ 删除成功')
    fetchPackages()
  } catch (err) { ElMessage.error(`❌ ${err.response?.data?.detail || '删除失败'}`) }
}

onMounted(fetchPackages)
</script>

<style scoped>
.btn-group {
  display: flex;
  gap: 10px;
}

.mobile-padding {
  padding: 10px;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.responsive-table {
  min-width: 600px;
}

@media (max-width: 768px) {
  .header-flex {
    flex-direction: column;
    gap: 10px;
  }

  .header-flex h2 {
    margin: 0;
    font-size: 18px;
  }

  .mobile-btn {
    width: 100%;
    height: 44px;
    
  }

  .btn-group {
    width: 100%;
    flex-direction: column;
  }
  .btn-group .el-button {
    width: 100%;
    margin: 0 !important;
  }
  .mobile-dialog .el-dialog__body {
    padding: 16px !important;
  }
}
</style>