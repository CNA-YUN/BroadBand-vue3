<template>
  <div class="mobile-padding">
    <div class="header-flex">
      <h2>👋 欢迎回来，{{ userStore.phone || '用户' }}</h2>
      <div class="btn-group">
        <el-button type="primary" @click="router.push('/packages')" class="mobile-btn">+ 新建订单</el-button>
        <el-button type="danger" plain class="mobile-btn" @click="handleLogout">退出登录</el-button>
      </div>
    </div>


    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12"><el-card shadow="hover"><el-statistic title="📦 我的总订单"
            :value="orders.length" /></el-card></el-col>
      <el-col :span="12"><el-card shadow="hover"><el-statistic title="🚧 进行中" :value="activeCount" /></el-card></el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="header-flex">
          <span>📋 近期订单</span>
          <el-button text @click="fetchOrders">🔄 刷新</el-button>
        </div>
      </template>

      <el-table :data="orders" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="package.name" label="套餐" width="120" />
        <el-table-column prop="customer_name" label="姓名" width="80" />
        <el-table-column prop="address" label="安装地址" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="tagColor(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" width="160">
          <template #default="{ row }">{{ row.created_at.slice(0, 10) }}</template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && orders.length === 0" description="暂无订单，快去办理吧！" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import request from '@/api/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const orders = ref([])
const loading = ref(false)

const activeCount = computed(() => orders.value.filter(o => !['已取消', '已安装'].includes(o.status)).length)
const tagColor = (status) => status === '待安装' ? 'warning' : status === '已安装' ? 'success' : 'info'

const fetchOrders = async () => {
  loading.value = true
  try { orders.value = await request.get('/orders/my') }
  catch { ElMessage.error('获取订单失败，请检查网络') }
  finally { loading.value = false }
}

const handleLogout = () => {
  userStore.logout()
  router.replace('/login') // 清缓存 + 踢回，不留返回记录
}

onMounted(fetchOrders)
</script>

<style scoped>
.mobile-padding {
  padding: 20px;
}

.mobile-btn {
  width: 100%;
  height: 44px;
  margin-bottom: 8px;
}

.btn-group {
  display: flex;
  gap: 10px;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
</style>