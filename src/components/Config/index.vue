<template>
  <div class="config-modal">
    <transition name="fade">
      <div
        v-show="true"
        class="flex overflow-auto fixed inset-0 justify-center items-start p-4 z-500 bg-black/70"
      >
        <transition name="slide">
          <div v-show="true" class="p-6 w-full max-w-md rounded-xl glass-card">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-bold text-white">
                {{ t('settings') }}
              </h3>
              <button @click="handleClickCancel" class="text-slate-400 hover:text-white">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Tab 切换 -->
            <div class="flex mb-6 space-x-2">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                @click="activeTab = tab.key"
                :class="[
                  'px-4 py-2 rounded-t-lg font-medium transition-all',
                  activeTab === tab.key
                    ? 'bg-tech-cyan/80 text-white'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-600',
                ]"
              >
                {{ tab.label }}
              </button>
            </div>

            <div class="space-y-6">
              <!-- Tab1: 基础配置 -->
              <div v-if="activeTab === 'base'">
                <!-- 新增：供应商选择 - 图标按钮 -->
                <div>
                  <label class="block mb-3 text-slate-300">
                    {{ t('provider') }}
                  </label>
                  <div class="flex space-x-3">
                    <button
                      @click="setProvider('deepseek')"
                      :class="{
                        'bg-tech-blue/80': state.config.provider === 'deepseek',
                        'bg-slate-700/60 hover:bg-slate-600': state.config.provider !== 'deepseek',
                      }"
                      class="flex flex-col items-center p-3 w-full rounded-lg transition-all duration-300"
                    >
                      <i class="mb-1.5 text-xl fas fa-robot"></i>
                      <span>DeepSeek</span>
                    </button>
                    <button
                      @click="setProvider('openai')"
                      :class="{
                        'bg-tech-cyan/80': state.config.provider === 'openai',
                        'bg-slate-700/60 hover:bg-slate-600': state.config.provider !== 'openai',
                      }"
                      class="flex flex-col items-center p-3 w-full rounded-lg transition-all duration-300"
                    >
                      <i class="mb-1.5 text-xl fas fa-bolt"></i>
                      <span>OpenAI</span>
                    </button>
                  </div>
                </div>

                <!-- Base URL 输入 -->
                <div>
                  <label class="block mb-2 text-slate-300">{{ t('baseUrl') }}</label>
                  <input
                    v-model="state.config.base_url"
                    type="text"
                    class="px-4 py-2.5 w-full text-white rounded-lg tech-input focus:outline-none"
                    :placeholder="getDefaultBaseUrl()"
                  />
                </div>

                <!-- Max Tokens - 滑块 -->
                <div>
                  <div class="flex justify-between items-center mb-3">
                    <label class="text-slate-300">
                      {{ t('maxTokens') }}
                    </label>
                    <span class="font-bold text-tech-cyan">{{ state.config.max_tokens }}</span>
                  </div>
                  <input
                    v-model="state.config.max_tokens"
                    type="range"
                    min="1000"
                    max="128000"
                    step="1000"
                    class="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-600 accent-tech-cyan"
                  />
                  <div class="flex justify-between mt-1 text-xs text-slate-400">
                    <span>1K</span>
                    <span>64K</span>
                    <span>128K</span>
                  </div>
                </div>

                <!-- Temperature - 滑块 -->
                <div>
                  <div class="flex justify-between items-center mb-3">
                    <label class="text-slate-300">
                      {{ t('creativity') }}
                    </label>
                    <span class="font-bold text-tech-cyan">{{ state.config.temperature }}</span>
                  </div>
                  <input
                    v-model="state.config.temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    class="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-600 accent-tech-cyan"
                  />
                  <div class="flex justify-between mt-1 text-xs text-slate-400">
                    <span>{{ t('precise') }}</span>
                    <span>{{ t('balanced') }}</span>
                    <span>{{ t('creative') }}</span>
                  </div>
                </div>

                <!-- API Key - 带可见性切换 -->
                <div>
                  <label class="block mb-2 text-slate-300">{{ t('apiKey') }}</label>
                  <div class="relative">
                    <input
                      v-model="state.config.api_key"
                      :type="showApiKey ? 'text' : 'password'"
                      class="px-4 py-2.5 pr-12 w-full text-white rounded-lg tech-input focus:outline-none"
                      placeholder="sk-xxxxxxxxxxxxxxxx"
                    />
                    <button
                      @click="showApiKey = !showApiKey"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <i :class="showApiKey ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>

                <!-- 测试连接按钮 -->
                <div>
                  <button
                    @click="testConnection"
                    :disabled="isTesting"
                    class="flex justify-center items-center px-4 py-2.5 mt-3 w-full text-white rounded-lg transition-all duration-300"
                    :class="{
                      'bg-gradient-to-r from-tech-blue to-tech-cyan hover:opacity-90': !isTesting,
                      'bg-slate-600 cursor-not-allowed': isTesting,
                    }"
                  >
                    <i v-if="isTesting" class="mr-2 fas fa-spinner fa-spin"></i>
                    <i v-else class="mr-2 fas fa-plug"></i>
                    {{ isTesting ? t('testing') : t('testConnection') }}
                  </button>

                  <!-- 测试结果提示 -->
                  <div
                    v-if="testResult"
                    class="p-3 mt-3 text-sm rounded-lg"
                    :class="{
                      'bg-green-500/20 border border-green-500/30 text-green-400': testResult.ok,
                      'bg-red-500/20 border border-red-500/30 text-red-400': !testResult.ok,
                    }"
                  >
                    <div class="flex items-center">
                      <i
                        :class="testResult.ok ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"
                        class="mr-2"
                      ></i>
                      <span>{{ testResult.message }}</span>
                    </div>
                    <div v-if="testResult.response" class="mt-2 text-xs opacity-80">
                      {{ testResult.response }}
                    </div>
                  </div>
                </div>

                <!-- 模型选择 - 下拉菜单 + 自定义输入 -->
                <div>
                  <label class="block mb-2 text-slate-300">
                    {{ t('model') }}
                  </label>
                  <div class="relative">
                    <select
                      v-model="selectedModelType"
                      @change="handleModelTypeChange"
                      class="px-4 py-2.5 w-full text-white rounded-lg appearance-none tech-input focus:outline-none bg-slate-800/60"
                    >
                      <option value="preset">{{ t('presetModels') }}</option>
                      <option value="custom">{{ t('customModel') }}</option>
                    </select>
                    <div
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                    >
                      <i class="fas fa-chevron-down text-slate-400"></i>
                    </div>
                  </div>

                  <!-- 预设模型选择 -->
                  <div v-if="selectedModelType === 'preset'" class="mt-3">
                    <div class="relative">
                      <select
                        v-model="state.config.model"
                        class="px-4 py-2.5 w-full text-white rounded-lg appearance-none tech-input focus:outline-none bg-slate-800/60"
                      >
                        <option v-for="model in getModelList()" :key="model" :value="model">
                          {{ model }}
                        </option>
                      </select>
                      <div
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                      >
                        <i class="fas fa-chevron-down text-slate-400"></i>
                      </div>
                    </div>
                  </div>

                  <!-- 自定义模型输入 -->
                  <div v-if="selectedModelType === 'custom'" class="mt-3">
                    <input
                      v-model="state.config.model"
                      type="text"
                      class="px-4 py-2.5 w-full text-white rounded-lg tech-input focus:outline-none"
                      :placeholder="t('enterCustomModel')"
                    />
                  </div>
                </div>
              </div>

              <!-- Tab2: 构建配置 -->
              <div v-if="activeTab === 'build'">
                <div>
                  <label class="block mb-3 text-slate-300">{{ t('appStyle') }}</label>
                  <div v-if="appStore.isLoading" class="py-4 text-slate-400">
                    {{ t('loading') }}
                  </div>
                  <div v-if="appStore.buildStyles.length > 0" class="flex flex-col gap-4">
                    <button
                      v-for="style in appStore.buildStyles"
                      :key="style.id"
                      @click="state.config.buildStyleId = style.id"
                      :class="[
                        'flex flex-row items-center p-3 w-full rounded-lg border transition-all relative',
                        state.config.buildStyleId === style.id
                          ? 'border-tech-cyan bg-tech-cyan/10 text-tech-cyan'
                          : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-tech-cyan',
                      ]"
                      style="height: 160px"
                    >
                      <img
                        :src="style.image"
                        alt="style"
                        class="object-cover w-full h-full rounded"
                      />
                      <span
                        class="absolute bottom-4 left-1/2 text-lg font-medium text-green-400 backdrop-blur-sm -translate-x-1/2 text-shadow-lg/30"
                        >{{ style[`${state.config.lang}_name`] }}</span
                      >
                    </button>
                  </div>
                  <div v-else class="py-4 text-slate-400">{{ t('noBuildStyles') }}</div>
                </div>
              </div>

              <!-- Tab3: 分享配置 -->
              <div v-if="activeTab === 'share'">
                <div>
                  <label class="block mb-2 text-slate-300">{{ t('ngrokAuthtoken') }}</label>
                  <div class="relative">
                    <input
                      v-model="state.config.ngrokAuthtoken"
                      :type="showNgrokToken ? 'text' : 'password'"
                      class="relative px-4 py-2.5 pr-12 w-full text-white rounded-lg tech-input focus:outline-none"
                      :placeholder="t('enterNgrokAuthtoken')"
                    />
                    <button
                      @click="showNgrokToken = !showNgrokToken"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <i :class="showNgrokToken ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <button
                    @click="testNgrok"
                    :disabled="ngrokTestLoading"
                    class="flex items-center px-4 py-2.5 mt-3 mb-2 w-full text-white rounded-lg transition-all duration-300"
                    :class="
                      ngrokTestLoading
                        ? 'bg-slate-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-tech-blue to-tech-cyan hover:opacity-90'
                    "
                  >
                    <i v-if="ngrokTestLoading" class="mr-2 fas fa-spinner fa-spin"></i>
                    <i v-else class="mr-2 fas fa-plug"></i>
                    {{ ngrokTestLoading ? t('testingNgrok') : t('testNgrok') }}
                  </button>
                  <div
                    v-if="ngrokTestResult"
                    class="p-3 text-sm rounded-lg"
                    :class="
                      ngrokTestResult.ok
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                        : 'bg-red-500/20 border border-red-500/30 text-red-400'
                    "
                  >
                    <div class="flex items-center">
                      <i
                        :class="
                          ngrokTestResult.ok ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'
                        "
                        class="mr-2"
                      ></i>
                      <span>{{ ngrokTestResult.message }}</span>
                    </div>

                    <!-- 分享按钮 - 仅在测试成功且有分享URL时显示 -->
                    <div
                      v-if="ngrokTestResult.ok && shareUrl"
                      class="pt-3 mt-3 border-t border-green-500/30"
                    >
                      <div class="flex justify-between items-center">
                        <div class="flex-1 mr-3">
                          <div class="mb-1 text-xs text-green-300">{{ t('shareUrl') }}</div>
                          <div class="flex items-center text-xs text-green-400 break-all">
                            {{ shareUrl }}
                          </div>
                        </div>
                        <button
                          @click="copyShareUrl"
                          class="flex items-center px-3 py-1.5 text-xs font-medium text-green-400 rounded-lg border transition-all duration-200 bg-green-500/20 border-green-500/40 hover:bg-green-500/30"
                        >
                          <i class="mr-1 fas fa-copy"></i>
                          {{ t('copyLink') }}
                        </button>
                        <button
                          @click="showQr = true"
                          class="flex items-center px-2 py-2 ml-2 text-xs font-medium text-green-400 rounded-lg border transition-all duration-200 bg-green-500/20 border-green-500/40 hover:bg-green-500/30"
                        >
                          <i class="mr-1 fas fa-qrcode"></i>
                        </button>
                      </div>
                      <!-- 二维码弹窗 -->
                      <div
                        v-if="showQr"
                        class="flex fixed inset-0 justify-center items-center z-1000"
                        @click.self="showQr = false"
                      >
                        <div
                          class="relative p-4 bg-white rounded-lg shadow-lg"
                          style="width: 220px; height: 230px"
                        >
                          <img
                            :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`"
                            alt="QR Code"
                            class="mx-auto"
                            style="width: 200px; height: 200px"
                          />
                          <button
                            @click="showQr = false"
                            class="absolute top-1 right-1.5 text-slate-400 hover:text-slate-700"
                          >
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- 导出/导入应用功能 -->
                    <div class="flex gap-2 mt-6">
                      <button
                        @click="exportApps"
                        class="flex relative flex-1 justify-center items-center px-4 py-2.5 text-white bg-gradient-to-r rounded-lg transition-all duration-300 from-tech-blue to-tech-cyan hover:opacity-90"
                      >
                        <i class="mr-2 fas fa-download"></i>{{ t('exportApps') }}
                      </button>
                      <label
                        class="flex relative flex-1 justify-center items-center px-4 py-2.5 text-white bg-gradient-to-r rounded-lg transition-all duration-300 cursor-pointer from-tech-cyan to-tech-blue hover:opacity-90"
                      >
                        <i class="mr-2 fas fa-upload"></i>{{ t('importApps') }}
                        <input type="file" accept=".json" class="hidden" @change="importApps" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab4: 快捷操作 -->
              <div v-if="activeTab === 'quick'">
                <div class="space-y-4">
                  <div class="grid grid-cols-1 gap-3">
                    <button
                      @click="openRootFolder('')"
                      class="flex items-center px-4 py-3 text-white bg-gradient-to-r rounded-lg transition-all duration-300 from-tech-blue to-tech-cyan hover:opacity-90 hover:shadow-lg hover:shadow-tech-cyan/20"
                    >
                      <i class="mr-3 text-xl fas fa-folder-open"></i>
                      <span>{{ t('openRootFolder') }}</span>
                    </button>

                    <button
                      @click="openRootFolder('input')"
                      class="flex items-center px-4 py-3 text-white bg-gradient-to-r rounded-lg transition-all duration-300 from-tech-cyan to-tech-blue hover:opacity-90 hover:shadow-lg hover:shadow-tech-cyan/20"
                    >
                      <i class="mr-3 text-xl fas fa-upload"></i>
                      <span>{{ t('openInputFolder') }}</span>
                    </button>

                    <button
                      @click="openRootFolder('output')"
                      class="flex items-center px-4 py-3 text-white bg-gradient-to-r rounded-lg transition-all duration-300 from-tech-blue to-tech-cyan hover:opacity-90 hover:shadow-lg hover:shadow-tech-cyan/20"
                    >
                      <i class="mr-3 text-xl fas fa-download"></i>
                      <span>{{ t('openOutputFolder') }}</span>
                    </button>

                    <button
                      @click="openRootFolder('custom_nodes')"
                      class="flex items-center px-4 py-3 text-white bg-gradient-to-r rounded-lg transition-all duration-300 from-tech-cyan to-tech-blue hover:opacity-90 hover:shadow-lg hover:shadow-tech-cyan/20"
                    >
                      <i class="mr-3 text-xl fas fa-puzzle-piece"></i>
                      <span>{{ t('openPluginsFolder') }}</span>
                    </button>

                    <button
                      @click="openRootFolder('models')"
                      class="flex items-center px-4 py-3 text-white bg-gradient-to-r rounded-lg transition-all duration-300 from-tech-blue to-tech-cyan hover:opacity-90 hover:shadow-lg hover:shadow-tech-cyan/20"
                    >
                      <i class="mr-3 text-xl fas fa-cube"></i>
                      <span>{{ t('openModelsFolder') }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="pt-4" v-if="!['quick'].includes(activeTab)">
                <button
                  @click="handleClickConfirm"
                  class="py-3 w-full font-medium text-white bg-gradient-to-r rounded-lg transition-all cursor-pointer from-tech-blue to-tech-cyan hover:opacity-90 hover:shadow-lg hover:shadow-tech-cyan/20"
                >
                  {{ t('saveSettings') }}
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup name="ConfigModal">
import { reactive, onMounted, ref } from 'vue'
import { t } from '@/utils/i18n'
import { showError, showSuccess, uuidv4 } from '@/utils'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

// Tab相关
const tabs = [
  { key: 'base', label: t('baseConfig') },
  // { key: 'build', label: t('buildConfig') },
  { key: 'share', label: t('shareApps') },
  { key: 'quick', label: t('quickActions') },
]
const activeTab = ref('base')

const showApiKey = ref(false)
const showNgrokToken = ref(false)
const isTesting = ref(false)
const testResult = ref(null)
const selectedModelType = ref('preset')
const showQr = ref(false)

const state = reactive({
  config: {
    comfyHost: '',
    serverHost: '',
    lang: 'zh',
    theme: 'dark',
    activeAppId: '',
    max_tokens: 64000,
    temperature: 0,
    api_key: '',
    base_url: 'https://api.deepseek.com/v1',
    model: 'deepseek-reasoner',
    provider: 'deepseek', // 新增供应商字段
    buildStyleId: 'tech', // 新增构建风格ID
    ngrokAuthtoken: '', // 新增ngrok authtoken
  },
})

const emit = defineEmits(['cancel', 'confirm'])

const handleClickCancel = () => {
  emit('cancel')
}

const handleClickConfirm = () => {
  emit('confirm', state.config)
}

// 获取当前供应商的模型列表
const getModelList = () => {
  if (state.config.provider === 'deepseek') {
    return ['deepseek-reasoner', 'deepseek-coder', 'deepseek-chat']
  } else if (state.config.provider === 'openai') {
    return ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']
  }
  return []
}

// 获取默认的Base URL
const getDefaultBaseUrl = () => {
  if (state.config.provider === 'deepseek') {
    return 'https://api.deepseek.com/v1'
  } else if (state.config.provider === 'openai') {
    return 'https://api.openai.com/v1'
  }
  return ''
}

// 设置供应商
const setProvider = (provider) => {
  state.config.provider = provider
  // 自动设置对应的base_url
  state.config.base_url = getDefaultBaseUrl()
  // 重置模型为第一个选项
  const models = getModelList()
  if (models.length > 0) {
    state.config.model = models[0]
  }
  // 重置模型类型为预设
  selectedModelType.value = 'preset'
}

// 处理模型类型变化
const handleModelTypeChange = () => {
  if (selectedModelType.value === 'preset') {
    // 切换到预设模式时，设置为第一个预设模型
    const models = getModelList()
    if (models.length > 0) {
      state.config.model = models[0]
    }
  } else {
    // 切换到自定义模式时，清空模型名称
    state.config.model = ''
  }
}

// 测试连接
const testConnection = async () => {
  if (!state.config.api_key || !state.config.base_url || !state.config.model) {
    testResult.value = {
      ok: false,
      message: t('pleaseCompleteAllFields'),
    }
    return
  }

  isTesting.value = true
  testResult.value = null

  try {
    const response = await fetch(`${state.config.serverHost}/api/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: state.config.api_key,
        base_url: state.config.base_url,
        model: state.config.model,
      }),
    })

    const result = await response.json()

    if (response.status === 200 && result.ok) {
      testResult.value = {
        ok: true,
        message: t('connectionTestSuccessful'),
        response: result.response,
      }
    } else {
      testResult.value = {
        ok: false,
        message: result.message || t('connectionTestFailed'),
      }
    }
  } catch (error) {
    console.error('Test connection error:', error)
    testResult.value = {
      ok: false,
      message: t('connectionTestError'),
    }
  } finally {
    isTesting.value = false
  }
}

const ngrokTestLoading = ref(false)
const ngrokTestResult = ref(null)
const shareUrl = ref('')

const testNgrok = async () => {
  if (!state.config.ngrokAuthtoken) {
    ngrokTestResult.value = { ok: false, message: t('ngrokFillToken') }
    return
  }
  if (ngrokTestLoading.value) return // 防止重复点击
  ngrokTestLoading.value = true
  ngrokTestResult.value = null
  shareUrl.value = ''
  try {
    const res = await fetch(`${state.config.serverHost}/api/ngrok/url`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ngrokAuthtoken: state.config.ngrokAuthtoken,
      }),
    })
    const { ok, data, message } = await res.json()
    if (ok) {
      ngrokTestResult.value = {
        ok: true,
        message: t('ngrokSuccess'),
      }
      // 保存分享URL
      shareUrl.value = `${data.server_origin}/?comfy_origin=${encodeURIComponent(data.comfy_origin)}&server_origin=${encodeURIComponent(data.server_origin)}&lang=${state.config.lang}`
    } else {
      ngrokTestResult.value = {
        ok: false,
        message: message || t('ngrokFail') + ` (HTTP ${res.status})`,
      }
    }
  } catch (e) {
    ngrokTestResult.value = {
      ok: false,
      message: t('requestFail') + ': ' + (e.message || e.toString()),
    }
  } finally {
    ngrokTestLoading.value = false
  }
}

// 复制分享链接
const copyShareUrl = async () => {
  if (!shareUrl.value) return

  try {
    await navigator.clipboard.writeText(shareUrl.value)
    // 可以添加一个临时的成功提示
    const originalMessage = ngrokTestResult.value.message
    ngrokTestResult.value.message = t('copySuccess')
    setTimeout(() => {
      ngrokTestResult.value.message = originalMessage
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 导出应用
const exportApps = async () => {
  const data = appStore.apps ? appStore.apps : []
  if (data.length === 0) {
    showError('noAppsToExport')
    return
  }
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `artifylab-apps-(${data.length})-${new Date().toLocaleDateString()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
// 导入应用
const importApps = (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 检查文件类型
  if (!file.name.toLowerCase().endsWith('.json')) {
    showError('onlyJsonFilesAllowed')
    e.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = async (event) => {
    try {
      const data = JSON.parse(event.target.result)

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
      const validApps = appsToImport.filter((app) => {
        return app && typeof app === 'object' && app.name && app.template && app.template.prompt
      })

      if (validApps.length === 0) {
        showError('noValidAppsFound')
        return
      }

      // 为每个应用生成新的ID并导入
      const appsWithNewIds = validApps.map((app) => ({ ...app, id: uuidv4() }))
      await appStore.mergeApps(appsWithNewIds)

      showSuccess('importSuccess', { count: validApps.length })
    } catch (error) {
      console.error('导入应用失败:', error)
      showError('importAppsError')
    }
  }
  reader.readAsText(file)
  // 清空input以便连续导入
  e.target.value = ''
}

const openRootFolder = async (path) => {
  try {
    if (window.electronAPI) {
      await window.electronAPI.ArtifyLab.openRootFolder(path)
    } else {
      showError('electronNotAvailable')
    }
  } catch (error) {
    console.error('打开目录失败:', error)
    showError('openFolderError')
  }
}

onMounted(async () => {
  state.config = JSON.parse(JSON.stringify(appStore.config))

  // 初始化provider（如果未设置）
  if (!state.config.provider) {
    // 根据base_url推断provider
    if (state.config.base_url && state.config.base_url.includes('openai')) {
      state.config.provider = 'openai'
    } else {
      state.config.provider = 'deepseek'
    }
  }

  // 确保model在当前供应商的模型列表中
  const models = getModelList()
  if (!models.includes(state.config.model)) {
    // 如果当前模型不在预设列表中，设置为自定义模式
    selectedModelType.value = 'custom'
  } else {
    selectedModelType.value = 'preset'
  }
})
</script>

<style lang="less" scoped>
.config-modal {
  height: 100%;
  width: 100%;
  font-family: 'Exo 2', sans-serif;
  // background: linear-gradient(135deg, #0a0f1f 0%, #0f172a 100%);
  min-height: 100vh;
  color: #e2e8f0;
  overflow-x: hidden;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 1000;

  .tech-font {
    font-family: 'Orbitron', sans-serif;
  }

  .glass-card {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(56, 70, 102, 0.4);
    box-shadow: 0 8px 32px rgba(2, 8, 32, 0.4);
    transition: all 0.3s ease;
  }

  .glass-card:hover {
    transform: translateY(-8px);
    border-color: rgba(14, 165, 233, 0.5);
    box-shadow: 0 12px 40px rgba(14, 165, 233, 0.2);
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    border-radius: 1rem;
    z-index: -1;
    background: radial-gradient(circle at center, rgba(14, 165, 233, 0.2) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .glass-card:hover .card-glow {
    opacity: 1;
  }

  .app-imageUrl {
    transition: transform 0.5s ease;
  }

  .glass-card:hover .app-imageUrl {
    transform: scale(1.05);
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

  .neon-text {
    text-shadow: 0 0 5px rgba(14, 165, 233, 0.7);
  }

  .tech-input {
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(56, 70, 102, 0.6);
    transition: all 0.3s ease;
  }

  .tech-input:focus {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .slide-enter-active {
    transition: all 0.3s ease-out;
  }

  .slide-leave-active {
    transition: all 0.3s ease-in;
  }

  .slide-enter-from,
  .slide-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }

  .card-enter-active {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .card-enter-from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
}
</style>

<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Exo+2:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Exo 2', sans-serif;
  background: linear-gradient(135deg, #0a0f1f 0%, #0f172a 100%);
  min-height: 100vh;
  color: #e2e8f0;
  overflow-x: hidden;
}

.tech-font {
  font-family: 'Orbitron', sans-serif;
}

.glass-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(56, 70, 102, 0.4);
  box-shadow: 0 8px 32px rgba(2, 8, 32, 0.4);
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-8px);
  border-color: rgba(14, 165, 233, 0.5);
  box-shadow: 0 12px 40px rgba(14, 165, 233, 0.2);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  border-radius: 1rem;
  z-index: -1;
  background: radial-gradient(circle at center, rgba(14, 165, 233, 0.2) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.glass-card:hover .card-glow {
  opacity: 1;
}

.app-imageUrl {
  transition: transform 0.5s ease;
}

.glass-card:hover .app-imageUrl {
  transform: scale(1.05);
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

.neon-text {
  text-shadow: 0 0 5px rgba(14, 165, 233, 0.7);
}

.tech-input {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(56, 70, 102, 0.6);
  transition: all 0.3s ease;
}

.tech-input:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active {
  transition: all 0.3s ease-out;
}

.slide-leave-active {
  transition: all 0.3s ease-in;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.card-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}
</style>
