<template>
  <div class="mb-8">
    <!-- 搜索和筛选区域 -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <!-- 搜索框 -->
      <div class="flex-1 max-w-md">
        <div class="relative">
          <input
            :value="searchQuery"
            @input="$emit('update:search-query', $event.target.value)"
            @keyup.enter="$emit('search')"
            type="text"
            :placeholder="t('searchApps')"
            class="px-4 py-3 pl-12 w-full text-white rounded-lg border backdrop-blur-sm transition-all duration-300 bg-slate-800/50 border-slate-600 focus:border-tech-blue focus:ring-2 focus:ring-tech-blue/20"
          />
          <i class="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 fas fa-search"></i>
          <button
            v-if="searchQuery"
            @click="$emit('update:search-query', '')"
            class="absolute right-4 top-1/2 transition-colors transform -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- 分类筛选 -->
      <div class="flex gap-2 items-center">
        <span class="text-sm font-medium text-slate-300">{{ t('category') }}:</span>
        <select
          :value="selectedCategory"
          @change="$emit('update:selected-category', $event.target.value)"
          class="px-4 py-2 text-white rounded-lg border backdrop-blur-sm transition-all duration-300 bg-slate-800/50 border-slate-600 focus:border-tech-blue focus:ring-2 focus:ring-tech-blue/20"
        >
          <option value="">{{ t('all') }}</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
    </div>

    <!-- 搜索历史和搜索建议 -->
    <div v-if="searchHistory.length > 0" class="p-4 mt-4 rounded-lg border backdrop-blur-sm bg-slate-800/30 border-slate-700">
      <!-- 搜索历史 -->
      <div v-if="searchHistory.length > 0" class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <h4 class="text-sm font-medium text-slate-300">
            <i class="mr-2 fas fa-history"></i>
            {{ t('searchHistory') }}
          </h4>
          <button
            @click="$emit('clear-history')"
            class="text-xs transition-colors text-slate-400 hover:text-white"
          >
            {{ t('clearAllHistory') }}
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(history, index) in searchHistory"
            :key="index"
            @click="$emit('history-click', history)"
            class="px-3 py-1 text-xs rounded-full transition-colors text-slate-300 bg-slate-700/50 hover:bg-slate-600/50"
          >
            {{ history }}
            <button
              @click.stop="$emit('delete-history-item', index)"
              class="ml-2 text-slate-400 hover:text-red-400"
            >
              <i class="fas fa-times"></i>
            </button>
          </button>
        </div>
      </div>

      <!-- 搜索建议 -->
      <div v-if="searchSuggestions.length > 0">
        <h4 class="mb-2 text-sm font-medium text-slate-300">
          <i class="mr-2 fas fa-lightbulb"></i>
          {{ t('searchSuggestions') }}
        </h4>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="suggestion in searchSuggestions"
            :key="suggestion"
            @click="$emit('suggestion-click', suggestion)"
            class="px-3 py-1 text-xs rounded-full transition-colors text-tech-blue bg-tech-blue/20 hover:bg-tech-blue/30"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="flex justify-between items-center mt-4 text-sm text-slate-400">
      <div class="flex items-center space-x-4">
        <span>
          <i class="mr-1 fas fa-store"></i>
          {{ t('totalApps', { count: apps.length }) }}
        </span>
        <span v-if="searchQuery || selectedCategory">
          <i class="mr-1 fas fa-filter"></i>
          {{ t('filteredResults', { count: filteredCount }) }}
        </span>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-tech-green">
          <i class="mr-1 fas fa-download"></i>
          {{ t('totalDownloads', { count: totalDownloads }) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
  searchHistory: {
    type: Array,
    default: () => []
  },
})

defineEmits([
  'update:search-query',
  'update:selected-category',
  'search',
  'history-click',
  'suggestion-click',
  'clear-history',
  'delete-history-item'
])

// 获取所有分类
const categories = computed(() => {
  const categorySet = new Set()
  props.apps.forEach(app => {
    if (app.category) {
      categorySet.add(app.category)
    }
  })
  return Array.from(categorySet).sort()
})

// 搜索建议
const searchSuggestions = computed(() => {
  if (!props.searchQuery) return []
  
  const suggestions = []
  const query = props.searchQuery.toLowerCase()
  
  // 从应用名称中提取建议
  props.apps.forEach(app => {
    if (app.name.toLowerCase().includes(query) && app.name !== props.searchQuery) {
      suggestions.push(app.name)
    }
  })
  
  // 从分类中提取建议
  categories.value.forEach(category => {
    if (category.toLowerCase().includes(query) && category !== props.searchQuery) {
      suggestions.push(category)
    }
  })
  
  return [...new Set(suggestions)].slice(0, 5)
})

// 过滤后的应用数量
const filteredCount = computed(() => {
  let filtered = props.apps
  
  if (props.searchQuery) {
    const query = props.searchQuery.toLowerCase()
    filtered = filtered.filter(app => 
      app.name.toLowerCase().includes(query) ||
      app.description.toLowerCase().includes(query) ||
      app.category.toLowerCase().includes(query)
    )
  }
  
  if (props.selectedCategory) {
    filtered = filtered.filter(app => app.category === props.selectedCategory)
  }
  
  return filtered.length
})

// 总下载量
const totalDownloads = computed(() => {
  return props.apps.reduce((total, app) => {
    const downloads = parseInt(app.downloads?.replace(/[kK]/g, '000') || '0')
    return total + downloads
  }, 0)
})
</script> 