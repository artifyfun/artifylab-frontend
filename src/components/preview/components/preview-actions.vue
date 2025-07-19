<template>
  <div class="actions-container" ref="menuRef">
    <!-- 主要按钮组 -->
    <div class="button-group">
      <!-- 返回编辑器按钮 - 只在移动端显示 -->
      <a-button
        class="back-button"
        type="default"
        @click="() => window.history.back()"
        :title="t('backToEditor')"
      >
        <template #icon><rollback-outlined /></template>
        <span class="back-text">{{ t('backToEditor') }}</span>
      </a-button>

      <!-- 保存模板按钮 -->
      <a-button
        type="primary"
        @click="handleOpenSaveDialog"
        :disabled="isDisabled"
        :title="t('saveTemplateTitle')"
      >
        <template #icon><save-outlined /></template>
        <span class="save-text">{{ t('saveTemplate') }}</span>
      </a-button>

      <!-- 更多按钮 -->
      <a-dropdown
        :trigger="['click']"
        v-model:open="isMenuExpanded"
        :disabled="isDisabled"
      >
        <a-button :type="isMenuExpanded ? 'primary' : 'default'">
          <template #icon><more-outlined /></template>
          <span class="more-text">{{ t('moreActions') }}</span>
        </a-button>
        <template #overlay>
          <a-menu class="dropdown-menu">
            <!-- 自动刷新切换按钮 -->
            <a-menu-item @click="handleToggleAutoRefresh">
              <div class="menu-item-content">
                <div class="icon-wrapper">
                  <sync-outlined :class="autoRefresh ? 'icon-active' : 'icon-inactive'" />
                </div>
                <span>{{ t('autoRefresh') }}</span>
                <a-badge v-if="autoRefresh" status="success" class="badge" />
              </div>
            </a-menu-item>

            <!-- 复制源代码按钮 -->
            <a-menu-item @click="handleCopyHtml">
              <code-outlined class="icon-copy" />
              <span class="menu-text">{{ t('copySourceCode') }}</span>
            </a-menu-item>

            <!-- 下载按钮 -->
            <a-menu-item @click="handleDownloadHtml">
              <download-outlined class="icon-download" />
              <span class="menu-text">{{ t('download') }}</span>
            </a-menu-item>

          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <!-- 对话框组件 -->
    <save-template-dialog
      ref="saveTemplateDialogRef"
      :html="html"
    />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  RollbackOutlined,
  SaveOutlined,
  MoreOutlined,
  SyncOutlined,
  CodeOutlined,
  DownloadOutlined,
} from '@ant-design/icons-vue'
import SaveTemplateDialog from './save-template-dialog.vue'
import { t } from '@/utils/i18n'
import { showError, showSuccess } from '@/utils'

const props = defineProps({
  html: {
    type: String,
    required: true
  },
  isDisabled: {
    type: Boolean,
    default: false
  },
  onLoadTemplate: {
    type: Function,
    required: true
  },
  isGenerating: {
    type: Boolean,
    default: false
  },
  autoRefresh: {
    type: Boolean,
    default: true
  },
  onToggleAutoRefresh: {
    type: Function,
    required: true
  },
})

const emit = defineEmits(['update:autoRefresh'])

const menuRef = ref(null)
const isMenuExpanded = ref(false)
const saveTemplateDialogRef = ref(null)

// 复制 HTML 到剪贴板
const handleCopyHtml = async () => {
  try {
    await navigator.clipboard.writeText(props.html)
    showSuccess('copySuccess')
    isMenuExpanded.value = false
  } catch (error) {
    console.error('复制失败:', error)
    showError('copyFailed')
  }
}

// 下载 HTML 文件
const handleDownloadHtml = async () => { try {
    const blob = new Blob([props.html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'deepsite-page.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showSuccess('downloadSuccess')
    isMenuExpanded.value = false
  } catch (error) {
    console.error('下载失败:', error)
    showError('downloadFailed')
  }
}

// 打开保存模板对话框
const handleOpenSaveDialog = () => {
  saveTemplateDialogRef.value.open()
  isMenuExpanded.value = false
}

// 加载选择的模板
const handleSelectTemplate = (templateHtml) => {
  if (props.onLoadTemplate) {
    props.onLoadTemplate(templateHtml)
  }
}

// 切换自动刷新状态
const handleToggleAutoRefresh = () => {
  if (props.onToggleAutoRefresh) {
    props.onToggleAutoRefresh()
    isMenuExpanded.value = false
  }
}
</script>

<style lang="less" scoped>
.actions-container {
  position: relative;
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

.back-text {
  display: none;
  white-space: nowrap;
  @media (min-width: 640px) {
    display: inline;
  }
}

.save-text,
.more-text {
  display: none;
  @media (min-width: 1024px) {
    display: inline;
  }
}

.dropdown-menu {
  min-width: 220px;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-wrapper {
  position: relative;
}

.icon-active {
  color: #4ade80;
}

.icon-inactive {
  color: #9ca3af;
}

.badge {
  margin-left: auto;
}

.icon-copy {
  color: #60a5fa;
}

.icon-download {
  color: #a855f7;
}

.icon-list {
  color: #f97316;
}

.menu-text {
  margin-left: 0.75rem;
}
</style>
