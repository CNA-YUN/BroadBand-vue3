<template>
  <div class="mobile-padding">
    <div class="header-flex">
      <h2>订单管理</h2>
      <div class="btn-group">
        <el-button type="primary" @click="router.push('/admin/packages')" class="mobile-btn">套餐管理</el-button>
        <el-button type="primary" @click="router.push('/admin/users')" class="mobile-btn">用户管理</el-button>
        <el-button type="success" plain @click="handleExport" class="mobile-btn">导出 Excel</el-button>
        <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
      </div>
    </div>
    <!-- 筛选区：加宽 -->
    <el-form :inline="true" class="filter-bar">
      <el-row :gutter="16" style="width: 100%">
        <el-col :xs="24" :sm="12">
          <el-form-item label="筛选状态" class="wide-filter">
            <el-select v-model="filterStatus" placeholder="全部" clearable @change="handleFilterChange"
              style="width: 200px">
              <el-option label="待安装" value="待安装" />
              <el-option label="已安装" value="已安装" />
              <el-option label="已取消" value="已取消" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 📊 表格 -->
    <div class="table-wrapper">
      <el-table :data="tableData" stripe v-loading="loading" border class="responsive-table">
        <el-table-column prop="id" label="ID" width="60" align="center" />

        <!-- ✅ 修复：用插槽访问 owner.phone -->
        <el-table-column label="注册手机号" width="120" align="center">
          <template #default="{ row }">
            {{ row.owner?.phone || '未知' }}
          </template>
        </el-table-column>

        <el-table-column prop="customer_name" label="客户" width="80" align="center" />
        <el-table-column prop="contact_phone" label="联系电话" width="120" align="center" />
        <el-table-column prop="address" label="安装地址" min-width="150" show-overflow-tooltip />

        <!-- ✅ 修复：用插槽访问 package.name -->
        <el-table-column label="套餐" width="100" align="center">
          <template #default="{ row }">
            {{ row.package?.name || '已删除' }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="tagColor(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="提交时间" width="160" align="center">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140" fixed="right" align="center">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => updateStatus(row.id, cmd)">
              <el-button size="small" type="primary" class="mobile-btn action-btn">改状态▾</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="待安装" :disabled="row.status === '待安装'">待安装</el-dropdown-item>
                  <el-dropdown-item command="已安装" :disabled="row.status === '已安装'">已安装</el-dropdown-item>
                  <el-dropdown-item command="已取消" :disabled="row.status === '已取消'" divided>已取消</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-popconfirm title="确定删除该订单？删除后不可恢复！" @confirm="handleDelete(row.id)" width="220px">
              <template #reference>
                <el-button size="small" type="danger" class="mobile-btn action-btn">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 📄 分页 -->
    <div class="pagination-box">
      <el-pagination v-model:current-page="page" v-model:page-size="limit" :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next" :total="total" @size-change="fetchData" @current-change="fetchData" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../api/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'


const router = useRouter()
const userStore = useUserStore()
const tableData = ref([])
const loading = ref(false)
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const filterStatus = ref('')

const tagColor = (s) => s === '待安装' ? 'warning' : s === '已安装' ? 'success' : 'info'

const fetchData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, limit: limit.value }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await request.get('/orders/', { params })

    if (Array.isArray(res)) {
      tableData.value = res
      total.value = res.length
    } else {
      tableData.value = res.data || res.items || []
      total.value = res.total || 0
    }
  } catch { ElMessage.error('数据加载失败') } finally { loading.value = false }
}

const updateStatus = async (id, newStatus) => {
  try {
    await ElMessageBox.confirm(`确定改为"${newStatus}"吗？`, '提示', { type: 'warning' })
    await request.put(`/orders/${id}`, { status: newStatus })
    ElMessage.success('状态已更新')
    fetchData()
  } catch (e) { if (e !== 'cancel') ElMessage.error('更新失败') }
}

const handleExport = async () => {
  try {
    const res = await request.get('/orders/export', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `订单导出_${new Date().toLocaleDateString()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url) // ✅ 释放内存，防卡顿
    ElMessage.success('导出成功！')
  } catch { ElMessage.error('导出失败，请重试或联系管理员') }
}

const handleLogout = () => {
  userStore.logout()
  router.replace('/login')
}
const handleFilterChange = () => { page.value = 1; fetchData() }
const handleDelete = async (id) => {
  try {
    await request.delete(`/orders/${id}`)
    ElMessage.success('✅ 订单已删除')
    fetchData() // 刷新列表
  } catch (e) {
    ElMessage.error(e.response?.data?.detail || '❌ 删除失败')
  }
}
onMounted(fetchData)
</script>

<style scoped>
.mobile-padding {
  padding: 10px;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-bar {
  margin-bottom: 16px;
}

/* ✅ 加宽筛选框 */
.wide-filter .el-select {
  width: 200px !important;
}

.full-width-item .el-select {
  width: 100%;
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.pagination-box {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.btn-group {
  display: flex;
  gap: 10px;
}

/* .mobile-btn {
  width: 100%;
  height: 44px;
} */

.action-btn {
  min-width: 72px;
  /* 固定最小宽度 */
  /* padding: 8px 12px; */
  /* 统一内边距 */
  font-size: 12px;
  /* 统一字号 */
  margin: 2px 0;
  /* 统一外边距 */
}

/* 📱 手机端专属优化 */
@media (max-width: 768px) {
  .action-btn {
    width: 100%;
    /* 手机端全宽 */
    height: 44px;
    /* 和 .mobile-btn 一样高 */
    margin: 4px 0;
    /* 按钮之间留点空隙 */
  }

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

  .responsive-table {
    min-width: 600px;
  }

  .wide-filter .el-select {
    width: 100% !important;
  }

  /* 手机上全宽 */
  .el-pagination {
    justify-content: center;
  }

  .btn-group {
    width: 100%;
    flex-direction: column;
  }

  .el-button {
    width: 100%;
    margin: 0 !important;
  }
}
</style>