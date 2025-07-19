import { ref } from 'vue'
import { defineStore } from 'pinia'
import { VxeUI } from 'vxe-table'
import { useDark, useToggle } from '@vueuse/core'
import { showError, getElectronConfig, isElectron, APP_CATEGORIES, APP_POWER_LEVELS, getQueryParam } from '@/utils'
import defaultStyles from '@/utils/styles/styles.json'

const LOCAL_CONFIG_KEY = 'LOCAL_CONFIG_KEY'

const isDark = useDark({
  selector: 'body',
  attribute: 'color-scheme',
  valueDark: 'dark',
  valueLight: 'light',
})

// 设置暗色模式
const setDarkMode = (darkMode) => {
  isDark.value = darkMode
  useToggle(darkMode)
  VxeUI.setTheme(darkMode ? 'dark' : 'light')
}

setDarkMode(true)

const getDefaultConfig = () => {
  return {
    comfyHost: null,
    serverHost: null,
    lang: 'zh',
    theme: 'dark',
    activeAppId: '',
    max_tokens: 64000,
    temperature: 0,
    api_key: '',
    base_url: "https://api.deepseek.com/v1",
    model: 'deepseek-reasoner',
    provider: 'deepseek', // 新增供应商字段
    buildStyleId: 'tech', // 新增构建风格ID
    ngrokAuthtoken: '', // 新增ngrok authtoken
  }
}

export const useAppStore = defineStore('app', () => {
  // 响应式状态
  const config = ref(getDefaultConfig())
  const apps = ref([])
  const marketApps = ref([])
  const buildStyles = ref([])
  const isLoading = ref(false)

  // API 请求工具函数
  const apiRequest = async (endpoint, options = {}) => {
    let baseUrl
    if (isElectron) {
      const electronConfig = await getElectronConfig()
      baseUrl = electronConfig.server_origin
    } else if (getQueryParam('server_origin')) {
      baseUrl = getQueryParam('server_origin')
    } else {
      baseUrl = config.value.serverHost
    }

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...defaultOptions,
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // 初始化配置 - 调用后端接口
  const initConfig = async () => {
    isLoading.value = true
    try {
      if (isElectron) {
        const response = await apiRequest('/api/config', {
          method: 'post'
        })
        if (response.ok && response.data) {
          let updatedConfig = { ...response.data }

          config.value = updatedConfig
          setDarkMode(config.value.theme === 'dark')
        } else {
          throw new Error(response.message || '配置加载失败')
        }
      } else {
        const localConfig = localStorage.getItem(LOCAL_CONFIG_KEY)
        if (localConfig) {
          const configObj = JSON.parse(localConfig)
          config.value = {
            ...configObj,
            comfyHost: getQueryParam('comfy_origin') || configObj.comfyHost,
            serverHost: getQueryParam('server_origin') || configObj.serverHost,
            lang: getQueryParam('lang') || configObj.lang,
          }
        } else {
          config.value = {
            ...getDefaultConfig(),
            comfyHost: getQueryParam('comfy_origin'),
            serverHost: getQueryParam('server_origin'),
            lang: getQueryParam('lang'),
          }
        }
        localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(config.value))
        if (!config.value.serverHost) {
          if (window.location.pathname !== '/about') {
            window.location.href = '/about'
          }
        }
      }
    } catch (error) {
      showError('configLoadFailed', { error: error.message })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 更新配置 - 调用后端接口
  const updateConfig = async (newConfig = {}) => {
    const updatedConfig = {
      ...config.value,
      ...newConfig
    }
    try {
      if (isElectron) {
        await apiRequest('/api/config/update', {
          method: 'POST',
          body: JSON.stringify(updatedConfig)
        })
      } else {
        localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(updatedConfig))
      }
      config.value = updatedConfig
      setDarkMode(config.value.theme === 'dark')
    } catch (error) {
      showError('configSaveFailed', { error: error.message })
      throw error
    }
  }

  // 获取应用列表 - 调用后端接口
  const loadApps = async () => {
    isLoading.value = true
    try {
      const response = await apiRequest('/api/apps', {
        method: 'post'
      })
      if (response.ok) {
        apps.value = (response.data || []).filter(app => isElectron ? true : !!app.code)
      } else {
        throw new Error(response.message || '应用列表加载失败')
      }
    } catch (error) {
      showError('appsLoadFailed', { error: error.message })
      apps.value = []
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const loadMarketApps = async () => {
    isLoading.value = true
    try {
      const response = await apiRequest('/api/market/apps', {
        method: 'post'
      })
      if (response.ok) {
        marketApps.value = response.data || []
      } else {
        throw new Error(response.message || '市场应用列表加载失败')
      }
    } catch (error) {
      showError('appsLoadFailed', { error: error.message })
      marketApps.value = []
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const loadBuildStyles = async () => {
    isLoading.value = true
    try {
      const response = await apiRequest('/api/build/styles', {
        method: 'post'
      })
      if (response.ok) {
        buildStyles.value = response.data || []
      } else {
        buildStyles.value = defaultStyles
        throw new Error(response.message)
      }
    } catch (error) {
      buildStyles.value = defaultStyles
      showError('buildStylesLoadFailed', { error: error.message })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 添加应用 - 调用后端接口
  const addApp = async (appData) => {
    isLoading.value = true
    try {
      const newApp = { ...getAppSchema(), ...appData }
      const response = await apiRequest('/api/apps/create', {
        method: 'POST',
        body: JSON.stringify(newApp)
      })

      if (response.ok) {
        // 重新加载应用列表以获取最新数据
        await loadApps()
        return response.data
      } else {
        throw new Error(response.message || '添加应用失败')
      }
    } catch (error) {
      showError('addAppFailed', { error: error.message })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 删除应用 - 调用后端接口
  const removeApp = async (appId) => {
    isLoading.value = true
    try {
      const response = await apiRequest('/api/apps/remove', {
        method: 'POST',
        body: JSON.stringify({ id: appId })
      })

      if (response.ok) {
        // 重新加载应用列表以获取最新数据
        await loadApps()
        return true
      } else {
        throw new Error(response.message || '删除应用失败')
      }
    } catch (error) {
      showError('removeAppFailed', { error: error.message })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 更新应用 - 调用后端接口
  const updateApp = async (updates) => {
    isLoading.value = true
    try {
      const response = await apiRequest('/api/apps/update', {
        method: 'POST',
        body: JSON.stringify({
          ...updates
        })
      })

      if (response.ok) {
        // 重新加载应用列表以获取最新数据
        await loadApps()
        return response.data
      } else {
        throw new Error(response.message || '更新应用失败')
      }
    } catch (error) {
      showError('updateAppFailed', { error: error.message })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 合并应用列表 - 调用后端接口
  const mergeApps = async (newApps) => {
    isLoading.value = true
    try {
      const response = await apiRequest('/api/apps/import', {
        method: 'POST',
        body: JSON.stringify({ apps: newApps })
      })

      if (response.ok) {
        // 重新加载应用列表以获取最新数据
        await loadApps()
        return response.data
      } else {
        throw new Error(response.message || '导入应用失败')
      }
    } catch (error) {
      showError('importAppsFailed', { error: error.message })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 根据ID获取应用 - 调用后端接口
  const getAppById = async (appId) => {
    isLoading.value = true
    try {
      const response = await apiRequest(`/api/apps/detail`, {
        method: 'post',
        body: JSON.stringify({
          id: appId
        })
      })
      if (response.ok) {
        return response.data
      } else {
        throw new Error(response.message || '获取应用失败')
      }
    } catch (error) {
      showError('getAppFailed', { error: error.message })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 获取默认数据
  const getAppSchema = () => {
    return {
      version: __APP_VERSION__,
      id: null,
      description: '', // 功能简介
      name: '', // 应用名称
      imageUrl: '', // 封面
      createdAt: '',
      category: APP_CATEGORIES.IMAGE_GENERATION,
      powerLevel: APP_POWER_LEVELS.ADVANCED,
      code: '', // 代码
      template: {
        workflow: null,
        paramsNodes: [],
        prompt: {},
      },
    }
  }

  return {
    // 状态
    config,
    apps,
    marketApps,
    buildStyles,
    isLoading,

    // 方法
    initConfig,
    updateConfig,
    loadApps,
    loadMarketApps,
    loadBuildStyles,
    addApp,
    removeApp,
    updateApp,
    mergeApps,
    getAppById,
    getAppSchema,
    apiRequest,
  }
})
