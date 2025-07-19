<template>
  <a-modal
    :open="show"
    @update:open="handleModalUpdate"
    :title="currentStep === 'style' ? t('selectAppStyle') : t('appBuilding')"
    width="100%"
    :wrap-class-name="`full-modal ${currentStep === 'style' ? 'style-modal' : ''}`"
    destroyOnClose
    :maskClosable="false"
    @cancel="handleCancel"
  >
    <template #footer>
      <!-- 风格选择步骤的按钮 -->
      <div v-if="currentStep === 'style'">
        <a-button @click="handleCancel">{{ t('cancel') }}</a-button>
        <a-button type="primary" :loading="optimizePromptLoading" :disabled="!canProceed" @click="handleStyleConfirm">
          {{ t('confirm') }}
        </a-button>
      </div>

      <!-- 代码生成步骤的按钮 -->
      <div v-else>
        <a-button danger v-if="genLoading" @click="handleCancel">{{ t('stopBuilding') }}</a-button>
        <a-button
          v-if="!(genLoading || responseLoading || appStore.isLoading)"
          @click="handleRebuild"
          >{{ t('rebuildApp') }}</a-button
        >
        <a-button
          type="primary"
          :loading="genLoading || responseLoading || appStore.isLoading"
          @click="handleSave"
          >{{ t('save') }}</a-button
        >
      </div>
    </template>

    <!-- 风格选择步骤 -->
    <div v-if="currentStep === 'style'" class="style-selection-container">
      <div class="style-selection-content">
        <div class="style-selection-header">
          <h3 class="mb-2 text-xl font-bold text-white">{{ t('selectAppStyle') }}</h3>
          <p class="mb-6 text-slate-300">{{ t('styleSelectionDescription') }}</p>
        </div>

        <!-- Tab切换 -->
        <div class="style-tabs">
          <a-tabs v-model:activeKey="activeTab" class="style-tabs-container">
            <a-tab-pane key="preset" :tab="t('presetStyles')">
              <!-- 预设风格选择 -->
              <div v-if="appStore.isLoading" class="flex justify-center items-center py-12">
                <a-spin size="large" />
                <span class="ml-3 text-slate-300">{{ t('loadingStyles') }}</span>
              </div>

              <div v-else-if="appStore.buildStyles.length > 0" class="style-grid-container">
                <div class="style-grid">
                  <div
                    v-for="style in appStore.buildStyles"
                    :key="style.id"
                    @click="handleChangeBuildStyle(style)"
                    :class="[
                      'style-card',
                      selectedStyleId === style.id ? 'style-card-selected' : 'style-card-default',
                    ]"
                  >
                    <div class="style-image-container">
                      <img
                        :src="style.image"
                        :alt="style[`${appStore.config.lang}_name`]"
                        class="style-image"
                      />
                      <div class="style-overlay">
                        <div class="style-name">{{ style[`${appStore.config.lang}_name`] }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="py-12 text-center">
                <div class="mb-4 text-slate-400">
                  <i class="text-2xl fas fa-exclamation-triangle"></i>
                </div>
                <p class="text-slate-300">{{ t('noBuildStyles') }}</p>
              </div>
            </a-tab-pane>

            <a-tab-pane key="advanced" :disabled="!selectedStyleId">
              <template #tab>
                <span class="relative">
                  {{ t('advancedConfig') }}
                </span>
              </template>
              <!-- 高级配置 -->
              <div class="advanced-config-container">
                <div class="config-section">
                  <h4 class="config-title">{{ t('appStyle') }}</h4>
                  <p class="config-description">{{ t('appStyleDescription') }}</p>
                  <div class="code-editor-container">
                    <CodeEditor
                      :value="customStyleCode"
                      :language="'html'"
                      @change="customStyleCode = $event"
                    />
                  </div>
                  <div class="preview-container">
                    <h5 class="preview-title">{{ t('preview') }}</h5>
                    <div class="preview-frame">
                      <Preview
                        v-if="customStyleCode"
                        :html="customStyleCode"
                        :isAiWorking="false"
                        class="style-preview"
                      />
                      <div v-else class="preview-placeholder">
                        <i class="mb-2 text-2xl fas fa-eye text-slate-400"></i>
                        <span class="text-slate-400">{{ t('previewPlaceholder') }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="config-section">
                  <h4 class="config-title">{{ t('appFunction') }}</h4>
                  <p class="config-description">
                    <span>{{ t('appFunctionDescription') }}</span>
                    <!-- <a-button
                      type="primary"
                      class="ml-2"
                      :loading="optimizePromptLoading"
                      :disabled="optimizePromptLoading"
                      @click="handleOptimizePrompt"
                    >
                      {{ t('optimizePrompt') }}
                    </a-button> -->
                  </p>
                  <div class="code-editor-container">
                    <a-spin :tip="t('waitingAIResponse')" :spinning="optimizePromptLoading">
                      <CodeEditor
                        :value="customFunctionCode"
                        :language="'markdown'"
                        @change="customFunctionCode = $event"
                      />
                    </a-spin>
                  </div>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </div>

    <!-- 代码生成步骤 -->
    <div v-else-if="currentStep === 'generate'" class="editor-box">
      <a-spin :tip="t('waitingAIResponse')" :spinning="responseLoading || appStore.isLoading">
        <splitpanes class="default-theme">
          <pane>
            <CodeEditor ref="genEditorRef" :value="genApp.code" @change="$event => genApp.code = $event" />
          </pane>
          <pane>
            <Preview
              v-if="genApp.code.includes('<body>')"
              class="preview-iframe"
              :html="genHtml(genApp, appStore.config)"
              :isAiWorking="genLoading"
            />
            <div
              v-else-if="genLoading"
              class="flex flex-col justify-center items-center w-full h-full"
            >
              <a-spin />
              <span class="text-tech-blue">{{ t('aiBuilding') }}</span>
            </div>
          </pane>
        </splitpanes>
      </a-spin>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { App } from 'ant-design-vue'
import { t } from '@/utils/i18n'
import { showError } from '@/utils'
import { genHtml, genPrompt } from '@/utils/genPrompt.js'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import Preview from '@/components/Preview/index.vue'
import CodeEditor from '@/components/CodeEditor/index.vue'
import { useAppStore } from '@/stores/appStore'

const { modal } = App.useApp()

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  app: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:show', 'save'])

const genEditorRef = ref(null)
const genLoading = ref(false)
const responseLoading = ref(false)
const abortControllerRef = ref(null)
const currentStep = ref('style') // 'style' 或 'generate'
const selectedStyleId = ref('')
const activeTab = ref('preset')
const customStyleCode = ref('')
const customFunctionCode = ref('')
const optimizePromptLoading = ref(false)

const appStore = useAppStore()

// 计算是否可以继续
const canProceed = computed(() => {
  return !optimizePromptLoading.value && !!customStyleCode.value && !!customFunctionCode.value
})

// 生成应用数据
const genApp = ref(props.app)

const handleChangeBuildStyle = (style) => {
  selectedStyleId.value = style.id
  customStyleCode.value = style.html
  customFunctionCode.value = genPrompt(genApp.value, style, appStore.config).userPrompt
}

// 监听show变化，重置步骤
watch(
  () => props.show,
  async (newShow) => {
    if (newShow) {
      currentStep.value = 'style'
      selectedStyleId.value = ''
      activeTab.value = 'preset'
      customStyleCode.value = ''
      customFunctionCode.value = ''
      // 加载构建风格
      await appStore.loadBuildStyles()
      const style = appStore.buildStyles[0]
      handleChangeBuildStyle(style)
    }
  },
)

const handleModalUpdate = (value) => {
  emit('update:show', value)
}

const handleCancel = () => {
  if (currentStep.value === 'generate' && abortControllerRef.value) {
    abortControllerRef.value.abort()
  }
  genLoading.value = false
  responseLoading.value = false
  currentStep.value = 'style'
  selectedStyleId.value = ''
  activeTab.value = 'preset'
  customStyleCode.value = ''
  customFunctionCode.value = ''
  emit('update:show', false)
}

const handleStyleConfirm = async () => {
  if (activeTab.value === 'preset') {
    if (!selectedStyleId.value) {
      showError(t('pleaseSelectStyle'))
      return
    }
  } else {
    // 高级配置模式
    if (!customStyleCode.value || !customFunctionCode.value) {
      showError(t('pleaseInputStyleAndFunction'))
      return
    }
  }

  // 切换到代码生成步骤
  currentStep.value = 'generate'
  setTimeout(() => {
    genAppCode()
  })
}

const handleSave = () => {
  if (!genApp.value.code) {
    showError(t('pleaseBuildAppFirst'))
    return
  }
  emit('save', genApp.value)
  emit('update:show', false)
}

// 生成应用代码的方法
const genAppCode = async () => {
  if (responseLoading.value || genLoading.value) {
    return
  }
  const buildStyle = appStore.buildStyles.find((item) => item.id === selectedStyleId.value)
  const prompt = {
    ...genPrompt(genApp.value, buildStyle, appStore.config),
    assistantPrompt: customStyleCode.value,
    userPrompt: customFunctionCode.value,
  }
  genApp.value.code = ''
  abortControllerRef.value = new AbortController()
  const signal = abortControllerRef.value.signal
  responseLoading.value = true

  const setCode = (code) => {
    genApp.value.code = code
  }

  const handleFinalCode = (finalDoc) => {
    setCode(finalDoc)
    genLoading.value = false
  }

  let contentResponse = ''
  let lastRenderTime = 0

  try {
    const request = await fetch(`${appStore.config.serverHost}/api/generate-app`, {
      method: 'POST',
      body: JSON.stringify({
        max_tokens: appStore.config.max_tokens,
        temperature: appStore.config.temperature,
        api_key: appStore.config.api_key,
        base_url: appStore.config.base_url,
        model: appStore.config.model,
        prompt,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    })

    if (request && request.body) {
      if (!request.ok) {
        try {
          if (request.status === 429) {
            try {
              const rateLimitData = await request.json()
              if (rateLimitData.message) {
                showError(rateLimitData.message)
              } else if (rateLimitData.waitTimeMinutes) {
                showError(t('rateLimitWaitMinutes', { minutes: rateLimitData.waitTimeMinutes }))
              } else {
                showError(t('rateLimitExceeded'))
              }
            } catch (parseError) {
              showError(t('rateLimitExceeded'))
            }
            return
          }

          const res = await request.json()
          showError(res.message)
        } catch (parseError) {
          showError(t('processingResponseFailed'))
        }
        genLoading.value = false
        responseLoading.value = false
        return
      }

      responseLoading.value = false
      genLoading.value = true
      const reader = request.body.getReader()
      const decoder = new TextDecoder('utf-8')

      const read = async () => {
        try {
          const { done, value } = await reader.read()
          if (done) {
            const finalDoc = contentResponse.match(/<!DOCTYPE html>[\s\S]*<\/html>/)?.[0]
            if (finalDoc) {
              handleFinalCode(finalDoc)
            } else if (contentResponse.includes('<html') && contentResponse.includes('<body')) {
              let fixedHtml = contentResponse
              if (!fixedHtml.includes('</body>')) {
                fixedHtml += '\n</body>'
              }
              if (!fixedHtml.includes('</html>')) {
                fixedHtml += '\n</html>'
              }
              setCode(fixedHtml)
            }
            abortControllerRef.value = null
            return
          }

          const chunk = decoder.decode(value, { stream: true })
          contentResponse += chunk

          let newHtml = null
          const doctypeMatch = contentResponse.match(/<!DOCTYPE html>[\s\S]*/)
          if (doctypeMatch) {
            newHtml = doctypeMatch[0]
          } else {
            const htmlMatch = contentResponse.match(/<html[\s\S]*/)
            if (htmlMatch) {
              newHtml = htmlMatch[0]
            } else {
              const bodyMatch = contentResponse.match(/<body[\s\S]*/)
              if (bodyMatch) {
                newHtml = bodyMatch[0]
              }
            }
          }

          if (newHtml) {
            let partialDoc = newHtml
            if (!partialDoc.includes('</body>') && partialDoc.includes('<body')) {
              partialDoc += '\n</body>'
            }
            if (!partialDoc.includes('</html>')) {
              partialDoc += '\n</html>'
            }

            const now = Date.now()
            if (now - lastRenderTime > 1000) {
              setCode(partialDoc)
              lastRenderTime = now
            }
          }

          read()
        } catch (error) {
          if (error.name === 'AbortError') {
            if (contentResponse && contentResponse.includes('<html')) {
              let fixedHtml = contentResponse
              if (!fixedHtml.includes('</body>')) {
                fixedHtml += '\n</body>'
              }
              if (!fixedHtml.includes('</html>')) {
                fixedHtml += '\n</html>'
              }
              setCode(fixedHtml)
            }
          } else {
            showError(error.message || t('aiResponseError'))
          }
          abortControllerRef.value = null
          genLoading.value = false
        }
      }

      read()
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      // 用户取消，不显示错误
    } else {
      showError(error.message || t('aiRequestFailed'))
    }
    genLoading.value = false
    abortControllerRef.value = null
  }
}

const handleRebuild = () => {
  modal.confirm({
    title: t('rebuildApp'),
    content: t('rebuildAppTip'),
    okText: t('confirm'),
    cancelText: t('cancel'),
    onOk: () => {
      genAppCode()
    },
  })
}

const optimizePrompt = async () => {
  optimizePromptLoading.value = true
  try {
    const request = await fetch(`${appStore.config.serverHost}/api/optimize-prompt`, {
      method: 'POST',
      body: JSON.stringify({
        prompt: customFunctionCode.value,
        api_key: appStore.config.api_key,
        base_url: appStore.config.base_url,
        model: appStore.config.model,
        language: appStore.config.lang,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!request.ok) {
      const res = await request.json()
      showError(res.message || t('aiRequestFailed'))
      optimizePromptLoading.value = false
      return
    }
    const data = await request.json()
    if (data && data.optimizedPrompt) {
      customFunctionCode.value = data.optimizedPrompt
    } else {
      showError(t('aiResponseError'))
    }
  } catch (error) {
    showError(error.message || t('aiRequestFailed'))
  } finally {
    optimizePromptLoading.value = false
  }
}

const handleOptimizePrompt = () => {
  if (!customFunctionCode.value) {
    showError(t('pleaseInputStyleAndFunction'))
    return
  }
  modal.confirm({
    title: t('optimizePrompt'),
    content: t('optimizePromptConfirm'),
    okText: t('confirm'),
    cancelText: t('cancel'),
    async onOk() {
      optimizePrompt()
    },
  })
}
</script>

<style lang="less">
.full-modal {
  &.style-modal {
    .ant-modal {
      height: auto;
    }
  }
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    & > div {
      width: 100%;
      height: 100%;
    }
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh);
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(56, 70, 102, 0.4);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(2, 8, 32, 0.4);
  }
  .ant-modal-header {
    background: transparent;
    border-bottom: 1px solid rgba(56, 70, 102, 0.4);
    padding: 20px 24px;
  }
  .ant-modal-title {
    color: #e2e8f0;
    font-family: 'Orbitron', sans-serif;
    font-weight: 600;
  }
  .ant-modal-body {
    flex: 1;
    background: transparent;
    color: #e2e8f0;
    .editor-box {
      width: 100%;
      height: 100%;
      .preview-iframe {
        width: 100%;
        height: 100%;
        border: none;
        user-select: none;
        margin: 0;
      }
    }
  }
  .ant-modal-footer {
    background: transparent;
    border-top: 1px solid rgba(56, 70, 102, 0.4);
    padding: 16px 24px;
  }
}

// 风格选择样式
.style-selection-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.style-selection-content {
  width: 100%;
  max-width: 1200px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.style-selection-header {
  text-align: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.style-tabs {
  .style-tabs-container {
    .ant-tabs-nav {
      margin-bottom: 20px;
      .ant-tabs-nav-list {
        .ant-tabs-tab {
          color: #94a3b8;
          font-size: 1rem;
          font-weight: 500;
          &.ant-tabs-tab-active {
            color: #0ea5e9;
            font-weight: 600;
          }
        }
      }
    }
  }
}

.advanced-config-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-section {
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(56, 70, 102, 0.4);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.config-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.config-description {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 15px;
}

.code-editor-container {
  height: 400px;
  border: 1px solid rgba(56, 70, 102, 0.4);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  .code-editor {
    height: 100%;
  }
}

.preview-container {
  margin-top: 20px;
  .preview-title {
    font-size: 1rem;
    font-weight: 500;
    color: #e2e8f0;
    margin-bottom: 8px;
  }
  .preview-frame {
    width: 100%;
    height: 200px;
    border: 1px solid rgba(56, 70, 102, 0.4);
    border-radius: 12px;
    overflow: hidden;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    .style-preview {
      width: 100%;
      height: 100%;
      border: none;
      user-select: none;
    }
    .preview-placeholder {
      text-align: center;
      color: #94a3b8;
      .fas {
        margin-bottom: 8px;
      }
    }
  }
}

.style-grid-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;

  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(14, 165, 233, 0.3) transparent;
}

.style-grid-container::-webkit-scrollbar {
  width: 8px;
}

.style-grid-container::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.style-grid-container::-webkit-scrollbar-thumb {
  background: rgba(14, 165, 233, 0.3);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.style-grid-container::-webkit-scrollbar-thumb:hover {
  background: rgba(14, 165, 233, 0.5);
}

.style-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.style-card {
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(56, 70, 102, 0.4);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.style-card:hover {
  transform: translateY(-8px);
  border-color: rgba(14, 165, 233, 0.5);
  box-shadow: 0 12px 40px rgba(14, 165, 233, 0.2);
}

.style-card-selected {
  border-color: #0ea5e9;
  background: rgba(14, 165, 233, 0.1);
  box-shadow: 0 0 20px rgba(14, 165, 233, 0.3);
}

.style-card-default {
  border-color: rgba(56, 70, 102, 0.4);
}

.style-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.style-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.style-card:hover .style-image {
  transform: scale(1.05);
}

.style-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.style-card:hover .style-overlay {
  opacity: 1;
}

.style-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.style-description {
  font-size: 0.9rem;
  opacity: 0.9;
}

.style-info {
  padding: 20px;
}

.style-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.style-subtitle {
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.4;
}

// 响应式设计
@media (max-width: 768px) {
  .style-selection-container {
    padding: 10px;
  }

  .style-selection-content {
    max-width: 100%;
  }

  .style-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .style-image-container {
    height: 150px;
  }

  .style-grid-container {
    padding: 5px 0;
  }
}

@media (max-width: 480px) {
  .style-selection-header {
    margin-bottom: 15px;
  }

  .style-grid {
    gap: 12px;
  }

  .style-card {
    border-radius: 12px;
  }
}
</style>
