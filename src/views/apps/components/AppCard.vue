<template>
  <div
    class="overflow-hidden relative p-5 rounded-xl cursor-pointer glass-card"
    @click="$emit('view-detail', app)"
  >
    <!-- 卡片光效 -->
    <div class="card-glow"></div>

    <!-- 封面图片 -->
    <div class="overflow-hidden relative mb-4 h-48 rounded-lg app-imageUrl">
      <div
        class="absolute inset-0 z-10 bg-gradient-to-t to-transparent from-tech-darker"
      ></div>

      <!-- 市场安装标记 -->
      <div v-if="app.isFromMarket" class="absolute top-3 left-3 z-20">
        <div class="flex items-center px-2 py-1 text-xs font-medium text-white bg-gradient-to-r rounded from-tech-green to-tech-cyan">
          <i class="mr-1 fas fa-store"></i>
          {{ t('fromMarket') }}
        </div>
      </div>

      <div
        class="absolute top-3 right-3 px-2 py-1 text-sm font-medium text-white rounded bg-tech-blue/80"
      >
        {{ t(app.category) }}
      </div>
      <img :src="app.imageUrl" :alt="app.name" class="object-cover w-full h-full" />
    </div>

    <!-- 应用信息 -->
    <div class="px-1">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-xl font-bold text-white">{{ app.name }}</h3>
        <span class="flex items-center text-sm text-tech-blue">
          <!-- <i class="mr-1 fas fa-star"></i> {{ app.rating }} -->
        </span>
      </div>

      <p class="overflow-hidden mb-3 h-12 text-sm text-slate-300">
        {{ app.description }}
      </p>

      <div class="flex justify-between items-center text-sm text-slate-400">
        <div class="flex items-center">
          <i class="mr-2 far fa-clock"></i>
          <span>{{ formatDate(app.createdAt) }}</span>
        </div>
        <div class="flex items-center space-x-1">
          <i class="fas fa-bolt text-tech-blue"></i>
          <span>{{ t(app.powerLevel) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/utils/i18n'

const props = defineProps({
  app: {
    type: Object,
    required: true
  },
})

defineEmits(['view-detail'])

// 格式化日期
function formatDate(date) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.glass-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(56, 70, 102, 0.4);
  box-shadow: 0 8px 32px rgba(2, 8, 32, 0.4);
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-8px);
  border-color: rgba(14, 165, 233, 0.5);
  box-shadow: 0 12px 40px rgba(14, 165, 233, 0.2);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  border-radius: 1rem;
  z-index: -1;
  background: radial-gradient(circle at center, rgba(14, 165, 233, 0.2) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.glass-card:hover .card-glow {
  opacity: 1;
}

.app-imageUrl {
  transition: transform 0.5s ease;
}

.glass-card:hover .app-imageUrl {
  transform: scale(1.05);
}
</style>
