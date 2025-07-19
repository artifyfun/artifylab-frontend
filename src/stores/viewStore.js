import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const VIEW_STORE_KEY = 'VIEW_STORE_KEY'

export const useViewStore = defineStore('view', () => {
  // 视图模式状态
  const viewMode = ref('grid') // 'grid' 或 'compact'

  // 从本地存储加载视图状态
  const loadViewState = () => {
    try {
      const savedState = localStorage.getItem(VIEW_STORE_KEY)
      if (savedState) {
        const state = JSON.parse(savedState)
        viewMode.value = state.viewMode || 'grid'
      }
    } catch (error) {
      console.warn('Failed to load view state from localStorage:', error)
      viewMode.value = 'grid'
    }
  }

  // 保存视图状态到本地存储
  const saveViewState = () => {
    try {
      const state = {
        viewMode: viewMode.value
      }
      localStorage.setItem(VIEW_STORE_KEY, JSON.stringify(state))
    } catch (error) {
      console.warn('Failed to save view state to localStorage:', error)
    }
  }

  // 更新视图模式
  const updateViewMode = (mode) => {
    if (mode === 'grid' || mode === 'compact') {
      viewMode.value = mode
    }
  }

  // 切换视图模式
  const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'grid' ? 'compact' : 'grid'
  }

  // 监听视图模式变化，自动保存到本地存储
  watch(viewMode, () => {
    saveViewState()
  }, { immediate: false })

  // 初始化时加载状态
  loadViewState()

  return {
    viewMode,
    updateViewMode,
    toggleViewMode,
    loadViewState,
    saveViewState
  }
})
