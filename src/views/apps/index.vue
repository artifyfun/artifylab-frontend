<template>
  <div class="page-container bg-tech-dark">
    <div id="app" class="pb-20 min-h-screen">
      <!-- 网格背景 -->
      <div class="fixed inset-0 grid-lines"></div>

      <!-- 装饰元素 -->
      <div
        class="fixed top-10 left-10 w-64 h-64 rounded-full opacity-10 blur-3xl bg-tech-purple"
      ></div>
      <div
        class="fixed right-10 bottom-20 w-80 h-80 rounded-full opacity-10 blur-3xl bg-tech-cyan"
      ></div>

      <!-- 顶部导航 -->
      <AppHeader />

      <!-- 主内容区 -->
      <main class="relative px-4 mx-auto mt-4 max-w-7xl sm:px-6 lg:px-8">
        <!-- 标题区域 -->
        <div class="mb-10 text-center">
          <h2 class="mb-4 text-4xl font-bold text-white tech-font md:text-5xl">
            <span class="text-tech-blue">{{ t('app') }}</span> {{ t('center') }}
          </h2>
          <p class="mx-auto max-w-2xl text-xl text-slate-300">
            {{ t('exploreFrontierAI') }}
          </p>
        </div>

        <!-- 操作区域 -->
        <AppActions
          :apps="appStore.apps"
          :search-query="searchQuery"
          :selected-category="selectedCategory"
          :search-history="searchHistory"
          :view-mode="viewMode"
          @update:search-query="searchQuery = $event"
          @update:selected-category="selectedCategory = $event"
          @update:view-mode="viewStore.updateViewMode"
          @search="handleSearch"
          @history-click="handleHistoryClick"
          @suggestion-click="handleSuggestionClick"
          @clear-history="clearAllHistory"
          @delete-history-item="deleteHistoryItem"
          @create-new="handleShowAppForm"
          @import-app="handleAppUploadChange"
        />

        <!-- 应用网格 -->
        <div class="h-[calc(100vh-400px)]">
          <a-spin :spinning="appStore.isLoading">
            <AppGrid
              :apps="appStore.apps"
              :search-query="searchQuery"
              :selected-category="selectedCategory"
              :view-mode="viewMode"
              @view-detail="viewAppDetail"
              @edit="handleShowAppForm"
              @delete="removeApp"
              @clear-search="searchQuery = ''"
              @clear-filter="selectedCategory = ''"
            />
          </a-spin>
        </div>
      </main>

      <!-- 添加应用表单 -->
      <AppForm
        v-if="showAppForm"
        :app="currentApp"
        @close="showAppForm = false"
        @save="saveApp"
      />

      <!-- 应用详情 -->
      <AppDetail
        v-if="!!selectedApp"
        :app="selectedApp"
        @close="selectedApp = null"
        @edit="handleShowAppForm"
        @delete="removeApp"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { uuidv4, showError, showSuccess, showWarning } from '@/utils'
import { useAppStore } from '@/stores/appStore'
import { useViewStore } from '@/stores/viewStore'
import { t } from '@/utils/i18n'
import AppHeader from './components/AppHeader.vue'
import AppActions from './components/AppActions.vue'
import AppGrid from './components/AppGrid.vue'
import AppForm from './components/AppForm.vue'
import AppDetail from './components/AppDetail.vue'

const appStore = useAppStore()
const viewStore = useViewStore()

// 新增应用表单状态
const showAppForm = ref(false)
const selectedApp = ref(null)

// 搜索相关
const searchQuery = ref('')
const searchHistory = ref([])

// 分类筛选
const selectedCategory = ref('')

// 视图模式 - 使用 viewStore 中的状态
const viewMode = computed(() => viewStore.viewMode)

// 新应用数据模型
const currentApp = ref(null)

// 添加搜索历史
const addToSearchHistory = (query) => {
  if (query.trim() && !searchHistory.value.includes(query.trim())) {
    searchHistory.value.unshift(query.trim())
    // 限制历史记录数量
    if (searchHistory.value.length > 5) {
      searchHistory.value = searchHistory.value.slice(0, 5)
    }
  }
}

// 处理搜索
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    addToSearchHistory(searchQuery.value)
  }
}

async function init() {
  await appStore.loadApps()
}

init()

// 添加新应用
async function saveApp(app) {
  if (app.id) {
    await appStore.updateApp(app)
    selectedApp.value = JSON.parse(JSON.stringify(app))
  } else {
    const newItem = {
      ...app,
    }
    await appStore.addApp(newItem)
  }
  showAppForm.value = false
}

function handleShowAppForm(app) {
  if (app) {
    currentApp.value = JSON.parse(JSON.stringify(app))
  } else {
    const defaultData = appStore.getAppSchema()
    currentApp.value = JSON.parse(JSON.stringify(defaultData))
  }
  showAppForm.value = true
}

function removeApp(app) {
  appStore.removeApp(app.id)
  selectedApp.value = null
}

// 查看应用详情
function viewAppDetail(app) {
  selectedApp.value = JSON.parse(JSON.stringify(app))
}

async function handleAppUploadChange({ file }) {
  // 检查文件类型
  if (!file.name.toLowerCase().endsWith('.json')) {
    showError('onlyJsonFilesAllowed')
    return
  }

  try {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result)

        // 判断数据类型：如果是对象，视为单个应用；如果是数组，视为多个应用
        let appsToImport = []

        if (Array.isArray(data)) {
          // 数组：多个应用
          appsToImport = data
        } else if (typeof data === 'object' && data !== null) {
          // 对象：单个应用
          appsToImport = [data]
        } else {
          throw new Error('Invalid data format')
        }

        // 验证应用数据结构
        const validApps = appsToImport.filter(app => {
          return app &&
                 typeof app === 'object' &&
                 app.name &&
                 app.template &&
                 app.template.prompt
        })

        if (validApps.length === 0) {
          showError('noValidAppsFound')
          return
        }

        // 为每个应用生成新的ID并导入
        const appsWithNewIds = validApps.map(app => ({...app, id: uuidv4()}))
        await appStore.mergeApps(appsWithNewIds)

        showSuccess('importSuccess', { count: validApps.length })
      } catch (error) {
        console.error('导入应用失败:', error)
        showError('importAppsError')
      }
    }
    reader.readAsText(file)
  } catch (error) {
    console.error('文件读取失败:', error)
    showError('importAppsError')
  }
}

function handleHistoryClick(history) {
  searchQuery.value = history
}

function handleSuggestionClick(suggestion) {
  searchQuery.value = suggestion
}

function clearAllHistory() {
  searchHistory.value = []
}

function deleteHistoryItem(index) {
  searchHistory.value.splice(index, 1)
}
</script>

<style lang="less" scoped>
.page-container {
  height: 100%;
  width: 100%;
  font-family: 'Exo 2', sans-serif;
  background: linear-gradient(135deg, #0a0f1f 0%, #0f172a 100%);
  min-height: 100vh;
  color: #e2e8f0;
  overflow-x: hidden;

  .tech-font {
    font-family: 'Orbitron', sans-serif;
  }

  .grid-lines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      linear-gradient(rgba(56, 70, 102, 0.2) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56, 70, 102, 0.2) 1px, transparent 1px);
    background-size: 30px 30px;
    z-index: -2;
  }
}
</style>
