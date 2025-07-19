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
      <MarketAppHeader />

      <!-- 主内容区 -->
      <main class="relative px-4 mx-auto mt-4 max-w-7xl sm:px-6 lg:px-8">
        <div class="flex items-center mb-2 space-x-4">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 text-2xl text-tech-blue">
              <i class="fas fa-store"></i>
            </div>
            <h1 class="text-xl font-bold text-white tech-font">
              {{ t('market') }}
            </h1>
          </div>
        </div>

        <!-- 操作区域 -->
        <AppActions
          :show-create="false"
          :apps="appStore.marketApps"
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
        />

        <!-- 应用网格 -->
        <div class="h-[calc(100vh-300px)]">
          <MarketAppGrid
            :apps="appStore.marketApps"
            :search-query="searchQuery"
            :selected-category="selectedCategory"
            :loading="appStore.isLoading"
            :view-mode="viewMode"
            @view-detail="viewAppDetail"
            @install="handleInstallApp"
            @clear-search="searchQuery = ''"
            @clear-filter="selectedCategory = ''"
          />
        </div>
      </main>

      <!-- 应用详情 -->
      <transition name="fade">
        <MarketAppDetail
          v-if="!!selectedApp"
          :app="selectedApp"
          @close="selectedApp = null"
          @install="handleInstallApp"
          @launch="handlePreviewApp"
        />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showError, showSuccess, showInfo } from '@/utils'
import { useAppStore } from '@/stores/appStore'
import { useViewStore } from '@/stores/viewStore'
import { t } from '@/utils/i18n'
import { MarketAppHeader, MarketAppGrid, MarketAppDetail } from './components'
import { AppActions } from '../apps/components'

const router = useRouter()

const appStore = useAppStore()
const viewStore = useViewStore()

// 搜索相关
const searchQuery = ref('')
const searchHistory = ref([])

// 分类筛选
const selectedCategory = ref('')

// 选中的应用
const selectedApp = ref(null)

// 视图模式 - 使用 viewStore 中的状态
const viewMode = computed(() => viewStore.viewMode)

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

// 处理历史点击
const handleHistoryClick = (history) => {
  searchQuery.value = history
}

// 处理建议点击
const handleSuggestionClick = (suggestion) => {
  searchQuery.value = suggestion
}

// 清除所有历史
const clearAllHistory = () => {
  searchHistory.value = []
}

// 删除历史项
const deleteHistoryItem = (index) => {
  searchHistory.value.splice(index, 1)
}

// 查看应用详情
const viewAppDetail = (app) => {
  selectedApp.value = JSON.parse(JSON.stringify(app))
}

// 安装应用
const handleInstallApp = async (app) => {
  try {
    await installApp(app)
  } catch (error) {
    console.log('Failed to install app:', error)
    showError(t('installFailed'))
  }
}

// 安装应用的具体实现
const installApp = async (app) => {
  try {
    const newApp = {
      ...appStore.getAppSchema(),
      ...app,
      installedAt: new Date(),
      isFromMarket: true, // 标记为来自市场
    }

    await appStore.addApp(newApp)
    showSuccess(t('installSuccess', { name: app.name }))

    selectedApp.value = null
  } catch (error) {
    showError(t('installFailed'))
  }
}

// 预览应用
const handlePreviewApp = async (app) => {
  if (app.code) {
    await appStore.updateConfig({ activeAppId: app.id })
    router.push({
      path: '/web',
    })
  } else {
    showInfo(t('previewNotAvailable'))
  }
}

const init = async () => {
  await appStore.loadMarketApps()
}

onMounted(() => {
  init()
})
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
