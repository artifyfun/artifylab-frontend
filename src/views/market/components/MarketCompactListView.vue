<template>
  <div class="compact-list-container">
    <!-- 虚拟滚动容器 -->
    <div
      v-show="filteredApps.length"
      ref="scrollContainer"
      class="virtual-scroll-container"
      @scroll="handleScroll"
    >
      <!-- 总高度占位 -->
      <div
        :style="{ height: totalHeight + 'px' }"
        class="virtual-scroll-spacer"
      ></div>

      <!-- 可见项目容器 -->
      <div
        :style="{ transform: `translateY(${offsetY}px)` }"
        class="virtual-items-container"
      >
        <transition-group name="card" tag="div" class="space-y-2">
          <div
            v-for="app in visibleApps"
            :key="app.id"
            class="compact-app-item"
            @click="$emit('view-detail', app)"
          >
            <!-- 应用图标 -->
            <div class="overflow-hidden flex-shrink-0 mr-4 w-12 h-12 rounded-lg bg-tech-darker">
              <img
                v-if="app.imageUrl"
                :src="app.imageUrl"
                :alt="app.name"
                class="object-cover w-full h-full"
              />
              <div
                v-else
                class="flex justify-center items-center w-full h-full text-tech-blue"
              >
                <i class="text-xl fas fa-robot"></i>
              </div>
            </div>

            <!-- 应用信息 -->
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center mb-1">
                <h3 class="text-sm font-semibold text-white truncate">
                  {{ app.name }}
                </h3>
                <div class="flex items-center space-x-2">
                  <!-- 分类标签 -->
                  <span class="px-2 py-1 text-xs font-medium rounded-full text-tech-blue bg-tech-blue/10">
                    {{ t(app.category) }}
                  </span>
                  <!-- 评分 -->
                  <div class="flex items-center text-yellow-400">
                    <i class="mr-1 text-xs fas fa-star"></i>
                    <span class="text-xs">{{ app.rating }}</span>
                  </div>
                </div>
              </div>

              <p class="text-xs text-slate-400 line-clamp-2">
                {{ app.description }}
              </p>

              <!-- 元数据 -->
              <div class="flex items-center mt-2 space-x-4 text-xs text-slate-500">
                <span class="flex items-center">
                  <i class="mr-1 fas fa-clock"></i>
                  {{ formatDate(app.createdAt) }}
                </span>
                <!-- <span class="flex items-center">
                  <i class="mr-1 fas fa-download"></i>
                  {{ app.downloads }}
                </span> -->
                <!-- <span class="flex items-center">
                  <i class="mr-1 fas fa-code"></i>
                  {{ app.powerLevel }}
                </span> -->
                <!-- <span v-if="app.author" class="flex items-center">
                  <i class="mr-1 fas fa-user"></i>
                  {{ app.author }}
                </span> -->
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center space-x-2">
              <button
                @click.stop="$emit('view-detail', app)"
                class="p-2 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-tech-darker"
                :title="t('viewDetail')"
              >
                <i class="fas fa-eye"></i>
              </button>
              <button
                @click.stop="$emit('install', app)"
                class="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r rounded-lg transition-all cursor-pointer from-tech-blue to-tech-cyan hover:opacity-90"
                :title="t('install')"
              >
                <i class="mr-1 fas fa-download"></i>
                {{ t('install') }}
              </button>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredApps.length === 0" class="flex justify-center items-center h-64">
      <div class="text-center">
        <div class="mb-4 text-6xl text-slate-500">
          <i class="fas fa-store"></i>
        </div>
        <h3 class="mb-2 text-xl font-semibold text-white">
          {{ getEmptyMessage() }}
        </h3>
        <p class="text-slate-400">
          {{ getEmptyDescription() }}
        </p>
        <div v-if="searchQuery || selectedCategory" class="mt-4 space-x-2">
          <button
            v-if="searchQuery"
            @click="$emit('clear-search')"
            class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors bg-tech-blue hover:bg-tech-blue/80"
          >
            {{ t('clearSearch') }}
          </button>
          <button
            v-if="selectedCategory"
            @click="$emit('clear-filter')"
            class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors bg-tech-purple hover:bg-tech-purple/80"
          >
            {{ t('clearFilter') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { t } from '@/utils/i18n'

const props = defineProps({
  apps: {
    type: Array,
    default: () => []
  },
  searchQuery: {
    type: String,
    default: ''
  },
  selectedCategory: {
    type: String,
    default: ''
  },
})

defineEmits(['view-detail', 'install', 'clear-search', 'clear-filter'])

// 虚拟滚动相关状态
const scrollContainer = ref(null)
const scrollTop = ref(0)
const containerHeight = ref(0)
const itemHeight = ref(80) // 紧凑列表项的高度
const bufferSize = ref(5) // 缓冲区大小
const resizeObserver = ref(null)

// 动态测量第一个compact-app-item高度
const measureItemHeight = () => {
  nextTick(() => {
    const item = document.querySelector('.virtual-items-container .compact-app-item')
    if (item) {
      // 取高度+margin-bottom（8px）
      itemHeight.value = item.offsetHeight + 8
    }
  })
}

// 计算属性：过滤后的应用列表
const filteredApps = computed(() => {
  let filtered = props.apps

  // 按搜索关键词过滤
  if (props.searchQuery) {
    const query = props.searchQuery.toLowerCase()
    filtered = filtered.filter(app =>
      app.name.toLowerCase().includes(query) ||
      app.description.toLowerCase().includes(query) ||
      app.category.toLowerCase().includes(query)
    )
  }

  // 按分类过滤
  if (props.selectedCategory) {
    filtered = filtered.filter(app => app.category === props.selectedCategory)
  }

  return filtered
})

// 计算总高度
const totalHeight = computed(() => {
  return filteredApps.value.length * itemHeight.value
})

// 计算可见范围
const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / itemHeight.value)
  const visibleItems = Math.ceil(containerHeight.value / itemHeight.value) + bufferSize.value * 2
  const end = Math.min(start + visibleItems, filteredApps.value.length)

  return {
    start: Math.max(0, start - bufferSize.value),
    end: Math.min(filteredApps.value.length, end + bufferSize.value)
  }
})

// 计算偏移量
const offsetY = computed(() => {
  return Math.max(0, visibleRange.value.start * itemHeight.value)
})

// 可见的应用列表
const visibleApps = computed(() => {
  return filteredApps.value.slice(visibleRange.value.start, visibleRange.value.end)
})

// 防抖函数
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString()
}

// 处理滚动事件
const handleScroll = debounce(() => {
  if (scrollContainer.value) {
    scrollTop.value = scrollContainer.value.scrollTop
  }
}, 16) // 约60fps

// 监听容器大小变化
const updateContainerHeight = () => {
  if (scrollContainer.value) {
    containerHeight.value = scrollContainer.value.clientHeight
  }
  measureItemHeight() // 容器变化时重新测量高度
}

// 监听窗口大小变化
const handleResize = () => {
  updateContainerHeight()
}

// 监听过滤结果变化，重置滚动位置
watch(filteredApps, () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
    scrollTop.value = 0
  }
})

// 获取空状态消息
function getEmptyMessage() {
  if (props.searchQuery) {
    return t('noAppsFoundWithQuery', { query: props.searchQuery })
  }
  if (props.selectedCategory) {
    return t('noAppsInCategory', { category: props.selectedCategory })
  }
  return t('noAppsAvailable')
}

// 获取空状态描述
function getEmptyDescription() {
  if (props.searchQuery || props.selectedCategory) {
    return t('tryOtherKeywords')
  }
  return t('marketEmptyDescription')
}

onMounted(() => {
  nextTick(() => {
    updateContainerHeight()
    handleResize()
    window.addEventListener('resize', handleResize)
    measureItemHeight() // 初始测量高度
    if (scrollContainer.value) {
      resizeObserver.value = new ResizeObserver(() => {
        updateContainerHeight()
        measureItemHeight() // 容器变化时重新测量高度
      })
      resizeObserver.value.observe(scrollContainer.value)
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
})
</script>

<style scoped>
.compact-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.virtual-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  min-height: 0; /* 重要：确保flex子元素可以收缩 */
}

.virtual-scroll-spacer {
  position: relative;
}

.virtual-items-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.compact-app-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(51, 65, 85, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.compact-app-item:last-child {
  margin-bottom: 0;
}

.compact-app-item:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(14, 165, 233, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* 自定义滚动条 */
.virtual-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.virtual-scroll-container::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.3);
  border-radius: 3px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(14, 165, 233, 0.5);
  border-radius: 3px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(14, 165, 233, 0.7);
}
</style>
