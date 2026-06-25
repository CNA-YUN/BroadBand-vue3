<template>
  <div class="not-found">
    <el-result icon="warning" title="404 页面走丢啦" sub-title="你访问的页面不存在">
      <template #extra>
        <el-button type="primary" @click="router.replace('/login')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.not-found {
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; background: #f5f7fa;
}
</style>