<template>
  <a-modal
    :open="show"
    @update:open="handleModalUpdate"
    :title="t('sourceCode')"
    width="100%"
    wrap-class-name="full-modal"
    destroyOnClose
    :maskClosable="false"
    :okText="t('save')"
    @ok="handleSave"
    @cancel="handleCancel"
  >
    <div class="source-editor-box" v-if="show">
      <div class="ai-edit-box">
        <a-textarea
          v-model:value="aiPrompt"
          :placeholder="t('aiEditPlaceholder')"
          :auto-size="{ minRows: 2, maxRows: 4 }"
          class="ai-edit-textarea"
        />
        <a-button type="primary" :loading="aiLoading" @click="handleAiEdit" style="margin-left: 8px;">{{ t('aiEdit') }}</a-button>
        <a-button type="default" :disabled="!aiLoading" @click="handleAiEditStop" style="margin-left: 8px;">{{ t('aiEditStop') }}</a-button>
        <span v-if="aiLoading" style="margin-left: 12px; color: #888;">{{ t('aiEditRunning') }}</span>
      </div>
      <splitpanes class="default-theme">
        <pane>
          <a-spin :tip="t('waitingAIResponse')" :spinning="aiLoading">
            <CodeEditor
              ref="codeEditorRef"
              :value="realtimeCode"
              @change="handleCodeChange"
            />
          </a-spin>
        </pane>
        <pane>
          <Preview
            class="preview-iframe"
            :html="previewHtml"
            :isAiWorking="false"
          />
        </pane>
      </splitpanes>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { showError, showSuccess, showInfo } from '@/utils'
import { genHtml } from '@/utils/genPrompt.js'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import Preview from '@/components/Preview/index.vue'
import CodeEditor from '@/components/CodeEditor/index.vue'
import { useAppStore } from '@/stores/appStore'
import { t } from '@/utils/i18n'

const appStore = useAppStore()

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  app: {
    type: Object,
    default: () => ({})
  },
})

const emit = defineEmits(['update:show', 'save'])

const codeEditorRef = ref(null)
const realtimeCode = ref('')

// 计算预览HTML，优先使用实时编辑的代码
const previewHtml = computed(() => {
  const code = realtimeCode.value || props.app.code || ''
  return genHtml({ ...props.app, code }, code, appStore.config)
})

// 监听模态框显示状态，初始化代码内容
watch(() => props.show, (newShow) => {
  if (newShow) {
    // 模态框打开时，初始化实时代码内容
    realtimeCode.value = props.app.code || ''
  } else {
    // 模态框关闭时，清空实时代码内容
    realtimeCode.value = ''
  }
})

const handleModalUpdate = (value) => {
  emit('update:show', value)
}

const handleCodeChange = (newCode) => {
  realtimeCode.value = newCode
}

const handleSave = () => {
  const code = realtimeCode.value || codeEditorRef.value.getEditorValue()
  if (!code) {
    showError(t('pleaseEnterCode'))
    return
  }
  emit('save', code)
  emit('update:show', false)
}

const aiPrompt = ref('')
const aiLoading = ref(false)
let aiController = null

const handleAiEdit = async () => {
  if (!aiPrompt.value) {
    showError(t('aiEditPlaceholder'))
    return
  }
  aiLoading.value = true
  aiController = new AbortController()
  try {
    const res = await fetch(`${appStore.config.serverHost}/api/modify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        max_tokens: appStore.config.max_tokens,
        temperature: appStore.config.temperature,
        api_key: appStore.config.api_key,
        base_url: appStore.config.base_url,
        model: appStore.config.model,
        prompt: `请你协助我修改我的页面代码，${aiPrompt.value}，返回结果不要带有任何解释，不要有多余内容，只需要返回修改后的代码，确保代码可以直接运行，我的页面代码为：${realtimeCode.value}`
      }),
      signal: aiController.signal
    })
    if (!res.ok) throw new Error('network')
    const data = await res.json()
    if (data.code) {
      if (data.code.startsWith('```html')) {
        realtimeCode.value = data.code.replace('```html', '').slice(0, -3)
      } else {
        realtimeCode.value = data.code
      }
      showSuccess(t('aiEditSuccess'))
    } else {
      showError(t('aiEditFailed'))
    }
  } catch (e) {
    if (e.name === 'AbortError') {
      showInfo(t('generationStopped'))
    } else {
      showError(t('aiEditFailed'))
    }
  } finally {
    aiLoading.value = false
    aiController = null
  }
}

const handleAiEditStop = () => {
  if (aiController) {
    aiController.abort()
  }
}

const handleCancel = () => {
  handleAiEditStop()
  emit('update:show', false)
}
</script>

<style lang="less">
.full-modal {
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
    .source-editor-box {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
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
.ai-edit-box {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  .ai-edit-textarea {
    flex: 1;
    min-width: 0;
    margin-right: 8px;
  }
}
</style>
