<template>
  <div class="flex flex-col mb-8 space-y-4">
    <div class="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
      <!-- 左侧：新增应用按钮 -->
      <div class="flex items-center space-x-4" v-if="isElectron && props.showCreate">
        <a-dropdown :trigger="['click']">
          <button
            class="flex items-center px-5 py-3 space-x-2 font-semibold text-white bg-gradient-to-r rounded-lg transition-all cursor-pointer floating-btn from-tech-blue to-tech-cyan hover:opacity-90"
          >
            <i class="fas fa-plus"></i>
            <span>{{ t('addNewApp') }}</span>
          </button>
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <span @click="$emit('create-new')">{{ t('createNew') }}</span>
              </a-menu-item>
              <a-menu-item>
                <a-upload
                  ref="upload"
                  :file-list="fileList"
                  :showUploadList="false"
                  :before-upload="beforeUpload"
                  accept=".json"
                  @change="handleAppUploadChange"
                >
                  <span>{{ t('importApp') }}</span>
                </a-upload>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>

      <!-- 中间：搜索和筛选区域 -->
      <div class="flex-1 lg:mx-8">
        <AppSearch
          :apps="apps"
          :selected-category="selectedCategory"
          :search-history="searchHistory"
          @update:search-query="$emit('update:searchQuery', $event)"
          @update:selected-category="$emit('update:selectedCategory', $event)"
          @search="$emit('search', $event)"
          @history-click="$emit('history-click', $event)"
          @suggestion-click="$emit('suggestion-click', $event)"
          @clear-history="$emit('clear-history')"
          @delete-history-item="$emit('delete-history-item', $event)"
        />
      </div>

      <!-- 右侧：视图切换按钮 -->
      <div class="flex items-center justify-end lg:justify-end">
        <div class="flex items-center p-1 space-x-1 bg-tech-darker rounded-lg">
          <button
            @click="$emit('update:viewMode', 'grid')"
            :class="[
              'flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md transition-all',
              viewMode === 'grid'
                ? 'text-white bg-tech-blue shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-tech-darker'
            ]"
            :title="t('gridView')"
          >
            <i class="fas fa-th-large"></i>
          </button>
          <button
            @click="$emit('update:viewMode', 'compact')"
            :class="[
              'flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md transition-all',
              viewMode === 'compact'
                ? 'text-white bg-tech-blue shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-tech-darker'
            ]"
            :title="t('compactView')"
          >
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="flex items-center space-x-2">
      <div class="pulse-dot"></div>
      <span class="font-medium text-tech-blue">
        {{ (searchQuery.trim() || selectedCategory) && filteredApps.length !== totalApps
          ? `${filteredApps.length}/${totalApps}`
          : filteredApps.length
        }} {{ t('appsOnline') }}
      </span>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { t } from '@/utils/i18n'
import AppSearch from './AppSearch.vue'
import { isElectron } from '@/utils'

const props = defineProps({
  apps: {
    type: Array,
    default: () => []
  },
  showCreate: {
    type: Boolean,
    default: true
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
  viewMode: {
    type: String,
    default: 'grid'
  },
})

const emit = defineEmits([
  'update:searchQuery',
  'update:selectedCategory',
  'update:viewMode',
  'search',
  'history-click',
  'suggestion-click',
  'clear-history',
  'delete-history-item',
  'create-new',
  'import-app'
])

const fileList = ref([])

// 计算属性：过滤后的应用数量
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

const totalApps = computed(() => props.apps.length)

// 文件上传前处理
const beforeUpload = (file) => {
  fileList.value = [...fileList.value, file]
  return false
}

// 处理应用上传变化
const handleAppUploadChange = ({ file }) => {
  emit('import-app', { file })
}
</script>

<style scoped>
.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0ea5e9;
  animation: pulse-slow 2s infinite;
}

.floating-btn {
  box-shadow: 0 0 20px rgba(14, 165, 233, 0.5);
  animation: float 4s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
