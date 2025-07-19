<template>
  <div class="flex flex-col mt-1 space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 search-responsive">
    <!-- 搜索框 -->
    <div class="relative flex-1 sm:flex-none">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t('searchApps')"
        class="px-4 py-2 pl-10 w-full text-white rounded-lg sm:w-64 tech-input search-input focus:outline-none"
        @keyup.enter="handleSearch"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <i class="absolute left-3 top-1/2 transform -translate-y-1/2 fas fa-search text-slate-400"></i>
      <!-- 清除搜索按钮 -->
      <button
        v-if="searchQuery.trim()"
        @click="clearSearch"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
      >
        <i class="fas fa-times"></i>
      </button>
      
      <!-- 搜索历史下拉 -->
      <div 
        v-if="searchHistory.length > 0 && !searchQuery.trim() && showSearchHistory" 
        class="absolute right-0 left-0 top-full z-10 mt-1 rounded-lg border shadow-lg bg-tech-darker border-slate-600"
      >
        <div class="p-2">
          <div class="px-2 mb-2 text-xs text-slate-400">{{ t('searchHistory') }}</div>
          <div 
            v-for="(history, index) in searchHistory" 
            :key="index"
            @click="handleHistoryClick(history)"
            @contextmenu.prevent="deleteHistoryItem(index)"
            class="relative px-2 py-1 text-sm rounded cursor-pointer text-slate-300 hover:text-white hover:bg-slate-700 group"
          >
            <i class="mr-2 fas fa-history text-tech-blue"></i>
            {{ history }}
            <!-- 删除单个历史记录按钮 -->
            <button
              @click.stop="deleteHistoryItem(index)"
              class="absolute right-2 top-1/2 text-red-400 opacity-0 transition-opacity transform -translate-y-1/2 group-hover:opacity-100 hover:text-red-300"
              :title="t('deleteThisHistoryRecord')"
            >
              <i class="text-xs fas fa-times"></i>
            </button>
          </div>
          
          <!-- 分隔线 -->
          <div class="my-2 border-t border-slate-600"></div>
          
          <!-- 清除全部历史按钮 -->
          <div 
            @click="clearAllHistory"
            class="px-2 py-1.5 text-sm text-red-400 rounded transition-colors cursor-pointer hover:text-red-300 hover:bg-red-900/30"
          >
            <i class="mr-2 fas fa-trash-alt"></i>
            {{ t('clearAllHistory') }}
          </div>
        </div>
      </div>
      
      <!-- 无历史记录提示 -->
      <div 
        v-if="searchHistory.length === 0 && !searchQuery.trim() && showSearchHistory" 
        class="absolute right-0 left-0 top-full z-10 mt-1 rounded-lg border shadow-lg bg-tech-darker border-slate-600"
      >
        <div class="p-3 text-center">
          <i class="mb-2 text-lg fas fa-history text-slate-500"></i>
          <div class="text-sm text-slate-400">{{ t('noSearchHistory') }}</div>
          <div class="mt-1 text-xs text-slate-500">{{ t('searchHistoryTip') }}</div>
        </div>
      </div>
      
      <!-- 搜索建议下拉 -->
      <div 
        v-if="searchSuggestions.length > 0 && searchQuery.trim() && showSearchSuggestions" 
        class="absolute right-0 left-0 top-full z-10 mt-1 rounded-lg border shadow-lg bg-tech-darker border-slate-600"
      >
        <div class="p-2">
          <div class="px-2 mb-2 text-xs text-slate-400">{{ t('searchSuggestions') }}</div>
          <div 
            v-for="(suggestion, index) in searchSuggestions" 
            :key="index"
            @click="handleSuggestionClick(suggestion)"
            class="px-2 py-1 text-sm rounded cursor-pointer text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <i class="mr-2 fas fa-lightbulb text-tech-blue"></i>
            {{ suggestion }}
          </div>
        </div>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
      <span class="text-sm text-slate-300">{{ t('category') }}</span>
      <div class="flex flex-wrap gap-1 items-center category-buttons">
        <button
          @click="handleCategoryChange('')"
          :class="[
            'px-3 py-1 text-xs rounded-full transition-all',
            selectedCategory === '' 
              ? 'bg-tech-blue text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          ]"
        >
          {{ t('all') }}
        </button>
        <button
          v-for="category in availableCategories"
          :key="category"
          @click="handleCategoryChange(category)"
          :class="[
            'px-3 py-1 text-xs rounded-full transition-all',
            selectedCategory === category 
              ? 'bg-tech-blue text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          ]"
        >
          {{ t(category) }}
        </button>
      </div>
    </div>

    <!-- 搜索结果提示 -->
    <div v-if="searchQuery.trim() || selectedCategory" class="flex items-center text-sm text-slate-300">
      <i class="mr-2 fas fa-filter text-tech-blue"></i>
      <span>{{ t('foundResults', { count: filteredApps.length }) }}</span>
      <span v-if="filteredApps.length > 0" class="ml-2 text-xs text-slate-400">
        ({{ t('totalApps', { count: totalApps }) }})
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { t } from '@/utils/i18n'

const props = defineProps({
  apps: {
    type: Array,
    default: () => []
  },
  selectedCategory: {
    type: String,
    default: ''
  },
  searchHistory: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:searchQuery',
  'update:selectedCategory',
  'search',
  'history-click',
  'suggestion-click',
  'clear-history',
  'delete-history-item'
])

const searchQuery = ref('')
const showSearchHistory = ref(false)
const showSearchSuggestions = ref(false)

// 计算属性：搜索建议
const searchSuggestions = computed(() => {
  if (!searchQuery.value.trim()) {
    return []
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  const suggestions = new Set()
  
  props.apps.forEach(app => {
    // 添加匹配的应用名称
    if (app.name.toLowerCase().includes(query)) {
      suggestions.add(app.name)
    }
    // 添加匹配的类别
    if (app.category.toLowerCase().includes(query)) {
      suggestions.add(app.category)
    }
  })
  
  return Array.from(suggestions).slice(0, 5)
})

// 计算属性：可用分类
const availableCategories = computed(() => {
  const categories = new Set()
  props.apps.forEach(app => {
    categories.add(app.category)
  })
  return Array.from(categories).sort()
})

// 计算属性：过滤后的应用数量
const filteredApps = computed(() => {
  if (!searchQuery.value.trim() && !props.selectedCategory) {
    return props.apps
  }
  
  const query = searchQuery.value.toLowerCase().trim()
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

const totalApps = computed(() => props.apps.length)

// 监听搜索查询变化
watch(searchQuery, (newValue) => {
  emit('update:searchQuery', newValue)
})

// 处理搜索
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value)
  }
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
  emit('update:searchQuery', '')
}

// 处理失焦事件
const handleBlur = () => {
  handleSearch()
  // 延迟隐藏搜索历史，让用户有时间点击历史项
  setTimeout(() => {
    showSearchHistory.value = false
    showSearchSuggestions.value = false
  }, 200)
}

// 处理聚焦事件
const handleFocus = () => {
  showSearchHistory.value = true
  showSearchSuggestions.value = true
}

// 处理历史点击
const handleHistoryClick = (history) => {
  searchQuery.value = history
  emit('history-click', history)
  showSearchHistory.value = false
  showSearchSuggestions.value = false
}

// 处理建议点击
const handleSuggestionClick = (suggestion) => {
  searchQuery.value = suggestion
  emit('suggestion-click', suggestion)
  showSearchSuggestions.value = false
}

// 处理分类变化
const handleCategoryChange = (category) => {
  emit('update:selectedCategory', category)
}

// 清除所有历史
const clearAllHistory = () => {
  emit('clear-history')
  showSearchHistory.value = false
}

// 删除历史项
const deleteHistoryItem = (index) => {
  emit('delete-history-item', index)
}
</script>

<style scoped>
.tech-input {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(56, 70, 102, 0.6);
  transition: all 0.3s ease;
}

.tech-input:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
}

/* 搜索区域自适应样式 */
.search-responsive {
  @media (max-width: 640px) {
    .search-input {
      width: 100%;
      min-width: 200px;
    }
  }
  
  @media (max-width: 768px) {
    .category-buttons {
      flex-wrap: wrap;
      gap: 0.25rem;
    }
  }
}

/* 确保搜索框在小屏幕上不会过窄 */
@media (max-width: 480px) {
  .tech-input {
    font-size: 14px;
    padding: 0.5rem 0.75rem;
  }
}
</style> 