<template>
  <div class="virtual-grid-container">
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
        <transition-group name="card" tag="div" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <MarketAppCard
            v-for="app in visibleApps"
            :key="app.id"
            :app="app"
            @view-detail="$emit('view-detail', $event)"
            @install="$emit('install', $event)"
          />
        </transition-group>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredApps.length === 0" class="py-20 text-center">
      <div class="inline-block p-6 mb-6 rounded-full bg-tech-darker">
        <i class="text-5xl fas fa-store text-tech-blue"></i>
      </div>
      <h3 class="mb-2 text-2xl font-bold text-white">
        {{ searchQuery.trim() || selectedCategory ? t('noAppsFound') : t('noAppsAvailable') }}
      </h3>
      <p class="mx-auto mb-6 max-w-md text-slate-400">
        {{ searchQuery.trim()
          ? t('noAppsFoundWithQuery', { query: searchQuery })
          : selectedCategory
          ? t('noAppsInCategory', { category: selectedCategory })
          : t('marketEmptyDescription')
        }}
      </p>
      <div class="flex justify-center space-x-2">
        <button
          v-if="searchQuery.trim()"
          @click="$emit('clear-search')"
          class="px-6 py-2 font-medium text-white bg-gradient-to-r rounded-lg transition-all cursor-pointer from-tech-blue to-tech-cyan hover:opacity-90"
        >
          {{ t('clearSearch') }}
        </button>
        <button
          v-if="selectedCategory"
          @click="$emit('clear-filter')"
          class="px-6 py-2 font-medium text-white bg-gradient-to-r rounded-lg transition-all cursor-pointer from-tech-blue to-tech-cyan hover:opacity-90"
        >
          {{ t('clearFilter') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { t } from '@/utils/i18n'
import MarketAppCard from './MarketAppCard.vue'

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
const itemHeight = ref(320) // 默认高度（包含间距）
const itemsPerRow = ref(3) // 每行显示的卡片数量
const bufferSize = ref(3) // 缓冲区大小
const resizeObserver = ref(null)

// 动态测量第一个卡片高度
const measureItemHeight = () => {
  nextTick(() => {
    const card = document.querySelector('.virtual-items-container .grid > *')
    if (card) {
      itemHeight.value = card.offsetHeight + 24
    }
  })
}

// 计算属性：过滤后的应用列表
const filteredApps = computed(() => {
  if (!props.searchQuery.trim() && !props.selectedCategory) {
    return props.apps
  }
  const query = props.searchQuery.toLowerCase().trim()
  const categoryFilter = props.selectedCategory
  return props.apps.filter(app => {
    const nameMatch = app.name.toLowerCase().includes(query)
    const categoryMatch = app.category.toLowerCase().includes(query)
    const descriptionMatch = app.description.toLowerCase().includes(query)
    const matchesQuery = !query || nameMatch || categoryMatch || descriptionMatch
    const matchesCategory = categoryFilter ? app.category === categoryFilter : true
    return matchesQuery && matchesCategory
  })
})

// 计算总高度
const totalHeight = computed(() => {
  const rows = Math.ceil(filteredApps.value.length / itemsPerRow.value)
  return rows * itemHeight.value
})

// 计算可见范围
const visibleRange = computed(() => {
  const total = filteredApps.value.length
  const visibleRows = Math.ceil(containerHeight.value / itemHeight.value)
  let startRow = Math.floor(scrollTop.value / itemHeight.value) - bufferSize.value
  startRow = Math.max(0, startRow)
  let endRow = startRow + visibleRows + bufferSize.value * 2
  endRow = Math.min(Math.ceil(total / itemsPerRow.value), endRow)
  const start = startRow * itemsPerRow.value
  const end = Math.min(total, endRow * itemsPerRow.value)
  return { start, end }
})

// 计算偏移量
const offsetY = computed(() => {
  return Math.max(0, Math.floor(visibleRange.value.start / itemsPerRow.value) * itemHeight.value)
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

// 处理滚动事件
const handleScroll = debounce(() => {
  if (scrollContainer.value) {
    scrollTop.value = scrollContainer.value.scrollTop
  }
}, 16)

// 监听容器大小变化
const updateContainerHeight = () => {
  if (scrollContainer.value) {
    containerHeight.value = scrollContainer.value.clientHeight
  }
  measureItemHeight()
}

// 监听窗口大小变化
const handleResize = () => {
  updateContainerHeight()
  if (window.innerWidth >= 1280) {
    itemsPerRow.value = 4
  } else if (window.innerWidth >= 1024) {
    itemsPerRow.value = 3
  } else if (window.innerWidth >= 640) {
    itemsPerRow.value = 2
  } else {
    itemsPerRow.value = 1
  }
}

// 监听过滤结果变化，重置滚动位置
watch(filteredApps, () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
    scrollTop.value = 0
  }
})

onMounted(() => {
  nextTick(() => {
    updateContainerHeight()
    handleResize()
    window.addEventListener('resize', handleResize)
    measureItemHeight()
    if (scrollContainer.value && window.ResizeObserver) {
      resizeObserver.value = new ResizeObserver(() => {
        updateContainerHeight()
        handleResize()
        measureItemHeight()
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
.virtual-grid-container {
  height: 100%;
  width: 100%;
}

.virtual-scroll-container {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.virtual-scroll-spacer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
}

.virtual-items-container {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
}

.card-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
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
