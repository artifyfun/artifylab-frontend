<template>
  <a-modal
    v-model:open="open"
    :title="t('templatesList')"
    :closable="true"
    :maskClosable="false"
    :keyboard="true"
    :width="800"
    @ok="handleClose"
    @cancel="handleClose"
    :okText="t('close')"
    :footer="null"
  >
    <div class="dialog-content">
      <!-- 空状态 -->
      <div
        v-if="!templates.length"
        class="empty-state"
      >
        <empty-outlined class="empty-icon" />
        <div class="empty-text">{{ t('noSavedTemplates') }}</div>
      </div>

      <!-- 模板列表 -->
      <div v-else class="templates-list">
        <div
          v-for="template in templates"
          :key="template.id"
          class="template-item"
        >
          <div class="template-header">
            <div class="template-name">{{ template.name }}</div>
            <div class="template-actions">
              <a-button
                type="primary"
                @click="() => handleLoadTemplate(template)"
                :title="t('loadTemplate')"
              >
                <template #icon><check-outlined /></template>
                <span class="load-text">{{ t('load') }}</span>
              </a-button>

              <a-dropdown :trigger="['click']">
                <a-button>
                  <template #icon><more-outlined /></template>
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="() => handleCopyTemplate(template)">
                      <copy-outlined class="icon-copy" />
                      <span class="menu-text">{{ t('copy') }}</span>
                    </a-menu-item>
                    <a-menu-item @click="() => handleDownloadTemplate(template)">
                      <download-outlined class="icon-download" />
                      <span class="menu-text">{{ t('download') }}</span>
                    </a-menu-item>
                    <a-menu-item
                      @click="() => handleDeleteTemplate(template)"
                      danger
                    >
                      <delete-outlined />
                      <span class="menu-text">{{ t('delete') }}</span>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>

          <div class="template-preview">
            <div class="preview-content" v-html="template.html"></div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>

  <!-- 删除确认对话框 -->
  <a-modal
    v-model:open="isDeleteConfirmVisible"
    :title="t('deleteConfirmTitle')"
    @ok="handleConfirmDelete"
    :okText="t('common.delete')"
    :cancelText="t('common.cancel')"
    okType="danger"
  >
    <p>{{ t('deleteConfirmMessage') }}</p>
  </a-modal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  FolderOpenOutlined,
  CopyOutlined,
  DownloadOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { indexedDBService } from '@/services/indexeddb'
import { t } from '@/utils/i18n'
import { showError, showSuccess } from '@/utils'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  onSelect: {
    type: Function,
    required: true
  },
})

const emit = defineEmits(['update:open', 'close', 'select'])

const templates = ref([])
const isLoading = ref(true)
const isDeleteConfirmVisible = ref(false)
const templateToDelete = ref(null)

// 加载模板列表
const loadTemplates = async () => {
  try {
    isLoading.value = true
    templates.value = await indexedDBService.getTemplates()
  } catch (error) {
    console.error('加载失败:', error)
    showError(t('loadFailed'))
  } finally {
    isLoading.value = false
  }
}

// 处理关闭
const handleClose = () => {
  emit('update:open', false)
  emit('close')
}

// 处理选择模板
const handleSelect = (template) => {
  emit('select', template.html)
  handleClose()
}

// 处理复制模板
const handleCopy = async (template) => {
  try {
    await navigator.clipboard.writeText(template.html)
    showSuccess(t('copySuccess'))
  } catch (error) {
    console.error('复制失败:', error)
    showError(t('copyFailed'))
  }
}

// 处理下载模板
const handleDownload = (template) => {
  try {
    const blob = new Blob([template.html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.title}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showSuccess(t('downloadSuccess'))
  } catch (error) {
    console.error('下载失败:', error)
    showError(t('downloadFailed'))
  }
}

// 处理删除模板
const handleDelete = (template) => {
  templateToDelete.value = template
  isDeleteConfirmVisible.value = true
}

// 处理确认删除
const handleConfirmDelete = async () => {
  if (!templateToDelete.value?.id) return

  try {
    await indexedDBService.deleteTemplate(templateToDelete.value.id)
    showSuccess(t('deleteSuccess'))
    await loadTemplates()
  } catch (error) {
    console.error('删除失败:', error)
    showError(t('deleteFailed'))
  } finally {
    isDeleteConfirmVisible.value = false
    templateToDelete.value = null
  }
}

// 组件挂载时加载模板列表
onMounted(() => {
  loadTemplates()
})
</script>
