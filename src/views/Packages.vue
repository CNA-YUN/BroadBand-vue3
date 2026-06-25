<template>
  <div class="packages-page">
    <!-- 头部区域：加了渐变背景 -->
    <div class="header-area">
      <h2>🚀 宽带套餐大厅</h2>
      <el-button @click="router.push('/dashboard')" class="btn-back">
        <el-icon><Back /></el-icon> 我的订单
      </el-button>
    </div>

    <el-row :gutter="20" v-loading="loading" class="grid-wrapper">
      <el-col :xs="24" :sm="12" :md="8" v-for="(pkg, index) in packages" :key="pkg.id">
        <el-card 
          shadow="hover" 
          class="pkg-card" 
          :class="['border-color-' + (index % 4)]" 
          @click="router.push(`/packages/${pkg.id}`)"
        >
          <div class="card-content">
            <h3 class="pkg-name">{{ pkg.name }}</h3>
            
            <div class="price-block">
              <span class="symbol"></span>
              <span class="price-value">{{ pkg.price }}</span>
            </div>
            
            <p class="desc">{{ pkg.description }}</p>
            
            <el-button type="primary" size="default" class="btn-action" block>
              ⚡ 立即办理
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/api/request'
import { Back } from '@element-plus/icons-vue' // 引入返回图标

const router = useRouter()
const packages = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  packages.value = await request.get('/packages/')
  loading.value = false
})
</script>

<style scoped>
/* 🌍 全局背景：淡淡的渐变，让页面不单调 */
.packages-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 20px;
}

/* 📢 头部区域 */
.header-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 15px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.header-area h2 {
  margin: 0;
  font-size: 22px;
  /* 渐变文字 */
  background: linear-gradient(45deg, #409EFF, #9370DB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
}

.btn-back {
  background-color: #f4f4f5;
  color: #909399;
  border: none;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.grid-wrapper {
  padding: 0 4px;
}

/* 🎴 卡片设计 */
.pkg-card {
  cursor: pointer;
  margin-bottom: 20px;
  border-radius: 16px;
  border: none; /* 去掉默认边框 */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  position: relative;
}

/* 🌈 顶部彩色条：自动轮播 4 种颜色 */
.pkg-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
}

.border-color-0 { --accent: #409EFF; --accent-light: #79bbff; } /* 蓝 */
.border-color-1 { --accent: #E6A23C; --accent-light: #eebe77; } /* 橙 */
.border-color-2 { --accent: #67C23A; --accent-light: #95d475; } /* 绿 */
.border-color-3 { --accent: #9370DB; --accent-light: #b187d9; } /* 紫 */

/* 🚀 悬停微交互 */
.pkg-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12) !important;
}

.card-content {
  text-align: center;
  padding: 10px;
}

.pkg-name {
  margin: 10px 0 0;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.price-block {
  margin: 15px 0;
  color: #F56C6C;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.price-block .symbol {
  font-size: 20px;
  margin-top: 5px;
  opacity: 0.8;
}

.price-block .price-value {
  font-size: 32px;
  font-weight: 900;
  line-height: 1;
}

.desc {
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 20px;
  min-height: 40px;
  white-space: pre-wrap;   /* 保留换行符 */
  word-break: break-word;  /* 防止长文本溢出 */
  text-align: left;        /* 靠左对齐 */
}

/* ✨ 渐变按钮 */
.btn-action {
  background-image: linear-gradient(to right, #409EFF, #79bbff);
  border: none;
  border-radius: 20px;
  font-weight: bold;
  letter-spacing: 1px;
  transition: opacity 0.2s;
}

.btn-action:hover {
  opacity: 0.9;
}
</style>