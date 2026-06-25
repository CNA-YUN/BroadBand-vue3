<template>
  <div class="forbidden-container">
    <el-result icon="warning" title="403 权限不足" sub-title="您没有访问该页面的权限">
      <template #extra>
        <el-button type="primary" @click="goLogin">返回登录页</el-button>
        <!-- <el-button @click="goBack">返回上一页</el-button> -->
      </template>
    </el-result>
  </div>
</template>

<script setup>

import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const goLogin = () => {
  userStore.logout()
  router.replace('/login') // ✅ 交给守卫自动分流
}

const goBack = () => router.back()

</script>

<style scoped>
.forbidden-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
}
</style>