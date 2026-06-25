<template>
  <!-- 1. 加上 el-card，保持和套餐页一致的结构 -->
  <el-card class="mobile-padding">
    <template #header>
      <div class="header-flex">
        <h2>👥 用户管理</h2>
        <div class="btn-group">
          <el-button type="primary" @click="router.push('/admin/packages')" class="mobile-btn">套餐管理</el-button>
          <el-button type="primary" @click="router.push('/admin/orders')" class="mobile-btn">订单管理</el-button>
          <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
        </div>
      </div>
    </template>

    <div class="table-wrapper">
      <el-table :data="users" stripe v-loading="loading" border class="responsive-table">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <!-- <el-table-column prop="reg_ip" label="注册 IP" width="130" /> -->
        <el-table-column prop="last_password_change" label="上次改密时间" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <!-- 如果是管理员且不是当前登录用户，显示降级按钮 -->
            <el-button v-if="row.is_admin && row.phone !== userStore.phone" size="small" type="info"
              @click="handleDemote(row.id)">
              降为普通用户
            </el-button>
            <!-- 如果是普通用户，显示升级按钮 -->
            <el-button v-else-if="!row.is_admin" size="small" type="warning" @click="handlePromote(row.id)">
              设管理员
            </el-button>
            <!-- 如果是管理员自己，不显示任何升/降按钮（或显示“自己”文本） -->
            <span v-else-if="row.is_admin && row.phone === userStore.phone" style="font-size:12px; color:#909399;">
              (当前账号)
            </span>

            <!-- 删除按钮（管理员不可删除） -->
            <el-popconfirm title="确定删除该用户？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button size="small" type="danger" :disabled="row.is_admin">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// import { ElMessage } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus' // 加上 ElMessageBox
import request from '@/api/request'
import { useRouter } from 'vue-router'
// 2. 引入 userStore
import { useUserStore } from '@/store/user'

const users = ref([])
const loading = ref(false)
const router = useRouter()
// 3. 初始化 userStore
const userStore = useUserStore()

const fetchData = async () => {
  loading.value = true
  try {
    // 建议加上错误处理，防止后端报错导致前端白屏
    const res = await request.get('/users/')
    // 1. 正常情况：后端返回 { data: [...] } 或直接返回 [...]
    // 2. 异常情况：后端没启动/路径错，返回了 HTML 字符串
    if (typeof res === 'string' && res.includes('<!doctype')) {
      throw new Error('接口返回了网页 HTML，请检查后端是否启动或代理配置')
    }

    users.value = Array.isArray(res) ? res : (res.data || [])
  } catch (error) {
    console.error('获取用户失败:', error)
    ElMessage.error('❌ 获取用户列表失败，请检查后端服务')
    users.value = []
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await request.delete(`/users/${id}`)
    ElMessage.success('✅ 删除成功')
    fetchData()
  } catch (error) {
    ElMessage.error('❌ 删除失败')
  }
}
// 提升管理员
const handlePromote = async (id) => {
  try {
    await ElMessageBox.confirm('确定将该用户提升为管理员吗？', '权限升级', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.put(`/users/${id}/promote`)
    ElMessage.success('✅ 已提升为管理员')
    fetchData() // 刷新列表
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.response?.data?.detail || '❌ 提升失败')
  }
}
// 降级管理员为普通用户
const handleDemote = async (id) => {
  try {
    await ElMessageBox.confirm('确定将该管理员降为普通用户吗？', '权限降级', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.put(`/users/${id}/demote`)
    ElMessage.success('✅ 已降为普通用户')
    fetchData() // 刷新列表
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.response?.data?.detail || '❌ 降级失败')
  }
}
const handleLogout = () => {
  userStore.logout()
  router.replace('/login')
}

onMounted(fetchData)
</script>

<style scoped>
/* 保持和 AdminPackages 一致的样式 */
.admin-container {
  min-height: 100vh;
}

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
}
</style>