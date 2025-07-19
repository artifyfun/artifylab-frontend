<template>
  <div class="relative h-full">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-center">
        <div class="mb-4 text-4xl text-tech-blue">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <p class="text-slate-300">{{ t('loading') }}</p>
      </div>
    </div>

    <!-- 网格视图 -->
    <div v-else-if="viewMode === 'grid' && filteredApps.length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <MarketAppCard
        v-for="app in filteredApps"
        :key="app.id"
        :app="app"
        @view-detail="$emit('view-detail', $event)"
        @install="$emit('install', $event)"
      />
    </div>

    <!-- 紧凑列表视图 -->
    <div v-else-if="viewMode === 'compact'" class="h-full">
      <MarketCompactListView
        :apps="apps"
        :search-query="searchQuery"
        :selected-category="selectedCategory"
        @view-detail="$emit('view-detail', $event)"
        @install="$emit('install', $event)"
        @clear-search="$emit('clear-search')"
        @clear-filter="$emit('clear-filter')"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="flex justify-center items-center h-64">
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

    <!-- 结果统计 -->
    <div v-if="filteredApps.length > 0 && viewMode === 'grid'" class="mt-6 text-sm text-center text-slate-400">
      {{ t('foundResults', { count: filteredApps.length }) }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/utils/i18n'
import MarketAppCard from './MarketAppCard.vue'
import MarketCompactListView from './MarketCompactListView.vue'

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
  loading: {
    type: Boolean,
    default: false
  },
  viewMode: {
    type: String,
    default: 'grid'
  }
})

defineEmits(['view-detail', 'install', 'clear-search', 'clear-filter'])

// 过滤应用
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
</script>
