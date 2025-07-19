<template>
    <div
      class="flex overflow-auto fixed inset-0 z-50 justify-center items-center p-4 bg-black/80"
    >
      <div class="relative p-6 w-full max-w-3xl rounded-xl glass-card">
        <button
          @click="$emit('close')"
          class="absolute top-6 right-6 text-xl text-slate-400 hover:text-white"
        >
          <i class="fas fa-times"></i>
        </button>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <div class="overflow-hidden h-72 rounded-lg">
              <img
                :src="app.imageUrl"
                :alt="app.name"
                class="object-cover w-full h-full"
              />
            </div>

            <div class="flex flex-wrap gap-2 mt-4">
              <span class="px-3 py-1 text-sm rounded-full bg-tech-blue/20 text-tech-blue">
                <i class="mr-1 fas fa-microchip"></i> {{ t(app.category) }}
              </span>
              <span class="px-3 py-1 text-sm rounded-full bg-tech-purple/20 text-tech-purple">
                <i class="mr-1 fas fa-bolt"></i> {{ t(app.powerLevel) }}
              </span>
              <!-- <span class="px-3 py-1 text-sm rounded-full bg-tech-green/20 text-tech-green">
                <i class="mr-1 fas fa-star"></i> {{ app.rating || '4.5' }}
              </span> -->
            </div>
          </div>

          <div class="flex flex-col">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <h3 class="text-2xl font-bold text-white">{{ app.name }}</h3>
                <div class="px-2 py-1 ml-3 text-xs font-medium text-white bg-gradient-to-r rounded from-tech-green to-tech-cyan">
                  <i class="mr-1 fas fa-store"></i>
                  {{ t('market') }}
                </div>
              </div>

              <div class="flex justify-between items-center mb-4 text-sm text-slate-400">
                <div>
                  <i class="mr-2 far fa-clock"></i>
                  <span>{{ t('createdOn', { date: formatDate(app.createdAt) }) }}</span>
                </div>
                <!-- <div class="flex items-center">
                  <span class="text-tech-green">
                    <i class="mr-1 fas fa-download"></i>
                    {{ app.downloads || '1.2k' }}
                  </span>
                </div> -->
              </div>

              <p class="mb-6 text-slate-300">
                {{ app.description }}
              </p>

              <!-- 应用特性 -->
              <div class="mb-6">
                <h4 class="mb-3 text-lg font-semibold text-white">{{ t('features') }}</h4>
                <div class="space-y-2">
                  <div v-for="feature in app.features || []" :key="feature" class="flex items-center text-sm text-slate-300">
                    <i class="mr-2 fas fa-check text-tech-green"></i>
                    <span>{{ feature }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                class="flex-1 py-3 font-medium text-white bg-gradient-to-r rounded-lg transition-all duration-300 cursor-pointer from-tech-green to-tech-cyan hover:from-tech-green/80 hover:to-tech-cyan/80"
                @click="$emit('install', app)"
              >
                <i class="mr-2 fas fa-download"></i>
                {{ t('install') }}
              </button>
              <!-- <button
                class="flex-1 py-3 font-medium text-white bg-gradient-to-r rounded-lg transition-all duration-300 cursor-pointer from-tech-blue to-tech-cyan hover:from-tech-blue/80 hover:to-tech-cyan/80"
                @click="$emit('launch', app)"
              >
                <i class="mr-2 fas fa-play"></i>
                {{ t('preview') }}
              </button> -->
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { t } from '@/utils/i18n'

defineProps({
  app: {
    type: Object,
    default: () => ({})
  },
})

defineEmits(['close', 'install', 'launch'])

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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
