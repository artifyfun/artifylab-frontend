<template>
  <div
    ref="previewRef"
    class="preview-container"
    @click="handleClick"
  >
    <iframe
      ref="iframeRef"
      title="output"
      :class="[
        'preview-iframe',
        { 'pointer-events-none': isAiWorking }
      ]"
      :srcDoc="formattedHtml"
    />
    <template v-if="showActions && !isAiWorking">
      <div class="preview-actions">
        <div class="button-group">
          <a-button
            class="back-button"
            type="primary"
            ghost
            @click="() => setView('editor')"
          >
            <template #icon><laptop-outlined /></template>
            {{ t('backToEditor') }}
          </a-button>
          <a-button
            :type="autoRefresh ? 'primary' : 'default'"
            @click="handleRefreshIframe"
            :title="!autoRefresh ? t('autoRefreshDisabled') : t('refreshPreviewTitle')"
          >
            <template #icon><reload-outlined /></template>
            {{ t('refreshPreview') }}
          </a-button>
        </div>
        <preview-actions
          :html="html"
          :is-disabled="isAiWorking"
          :on-load-template="handleLoadTemplate"
          :is-generating="isAiWorking"
          :auto-refresh="autoRefresh"
          :on-toggle-auto-refresh="toggleAutoRefresh"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, computed } from 'vue'
import { LaptopOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import PreviewActions from './components/preview-actions.vue'
import { t } from '@/utils/i18n'
import { showSuccess, showWarning, showInfo } from '@/utils'
import { CDN_URLS } from '@/utils/genPrompt'

const props = defineProps({
  html: {
    type: String,
    required: true
  },
  isAiWorking: {
    type: Boolean,
    required: false
  },
  setView: {
    type: Function,
    required: false
  },
  setHtml: {
    type: Function,
    required: false
  },
  showActions: {
    type: Boolean,
    required: false,
    default: false
  },
})

const isDevMode = import.meta.env.DEV

const emit = defineEmits(['click'])

const previewRef = ref(null)
const iframeRef = ref(null)
const throttledHtml = ref(props.html)
const lastUpdateTimeRef = ref(Date.now())
const autoRefresh = ref(true)
const previousIsAiWorkingRef = ref(props.isAiWorking)
const htmlRef = ref(props.html)
const timerId = ref(0)

const formattedHtml = computed(() => {
  if (isDevMode) {
    return throttledHtml.value.replace(CDN_URLS.ARTIFY_LIB, CDN_URLS.ARTIFY_LIB_DEV).replace(CDN_URLS.ARTIFY_LIB_CSS, CDN_URLS.ARTIFY_LIB_CSS_DEV)
  }
  return throttledHtml.value
})

// 当HTML内容改变时保存到ref中
watch(() => props.html, (newHtml) => {
  htmlRef.value = newHtml
})

// 监测AI生成过程的结束
watch(() => props.isAiWorking, (newIsAiWorking) => {
  if (previousIsAiWorkingRef.value && !newIsAiWorking) {
    throttledHtml.value = htmlRef.value
    console.log('AI工作结束')
  }
  previousIsAiWorkingRef.value = newIsAiWorking
})

// 防止过于频繁刷新iframe
watch([() => props.html, () => props.isAiWorking, () => autoRefresh.value], ([newHtml, newIsAiWorking, newAutoRefresh]) => {
  if (!newAutoRefresh) return

  const throttleTime = newIsAiWorking ? 2000 : 1000
  const now = Date.now()

  if (now - lastUpdateTimeRef.value >= throttleTime) {
    throttledHtml.value = newHtml
    lastUpdateTimeRef.value = now
  } else {
    timerId.value = setTimeout(() => {
      throttledHtml.value = newHtml
      lastUpdateTimeRef.value = Date.now()
    }, throttleTime - (now - lastUpdateTimeRef.value))
  }
})

// 处理点击事件
const handleClick = (e) => {
  if (props.isAiWorking) {
    e.preventDefault()
    e.stopPropagation()
    showWarning(t('aiWorking'))
  }
}

// 手动刷新iframe
const handleRefreshIframe = () => {
  throttledHtml.value = props.html

  if (iframeRef.value) {
    const iframe = iframeRef.value
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.location.reload()
      } else {
        const content = iframe.srcdoc
        iframe.srcdoc = ''
        setTimeout(() => {
          iframe.srcdoc = content
        }, 10)
      }
    } catch (error) {
      console.error('刷新失败:', error)
      const content = props.html
      iframe.srcdoc = ''
      setTimeout(() => {
        iframe.srcdoc = content
      }, 10)
    }
  }

      console.log('手动刷新预览')
  showInfo(t('refreshPreviewMessage'))
}

// 切换自动刷新状态
const toggleAutoRefresh = () => {
  const newState = !autoRefresh.value
  autoRefresh.value = newState

  if (newState) {
    throttledHtml.value = props.html
  }

  showInfo(newState ? t('autoRefreshEnabled') : t('autoRefreshDisabled'))
}

// 处理加载模板
const handleLoadTemplate = (templateHtml) => {
  if (props.setHtml) {
    props.setHtml(templateHtml)
    showSuccess(t('templateLoadSuccess'))
    throttledHtml.value = templateHtml
  }
}

onUnmounted(() => clearTimeout(timerId.value))

</script>

<style lang="less" scoped>
.preview-container {
  width: 100%;
  height: 100%;
  background-color: white;
  position: relative;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  user-select: none;
}

.preview-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  left: 0.75rem;
  @media (min-width: 1024px) {
    bottom: 1.25rem;
    right: 1.25rem;
    left: auto;
  }
}

.button-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-button {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>
