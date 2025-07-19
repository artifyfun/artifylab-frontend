<template>
  <a-modal
    v-model:open="visible"
    :title="t('saveAsTemplate')"
    :closable="true"
    :maskClosable="false"
    :keyboard="true"
    :width="500"
    @ok="handleSave"
    @cancel="handleCancel"
    :okText="t('save')"
    :cancelText="t('cancel')"
  >
    <div class="dialog-content">
      <div class="input-section">
        <div class="label">{{ t('templateName') }}</div>
        <a-input
          v-model:value="templateName"
          :placeholder="t('templateNamePlaceholder')"
          :maxLength="50"
          class="template-input"
          ref="templateNameInput"
        />
      </div>

      <div class="preview-section">
        <div class="label">{{ t('preview') }}</div>
        <div class="preview-container">
          <div class="empty-content" v-if="!htmlContent">
            {{ t('noContent') }}
          </div>
          <div class="preview-content" v-else v-html="htmlContent"></div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { t } from '@/utils/i18n'
import { showError, showSuccess } from '@/utils'
// import { indexedDBService } from '@/services/indexeddb'

const props = defineProps({
  html: {
    type: String,
    required: true
  },
})

const visible = ref(false)
const title = ref('')
const isSaving = ref(false)

// 重置表单
const resetForm = () => {
  title.value = ''
  isSaving.value = false
}

// 处理关闭
const handleClose = () => {
  resetForm()
  visible.value = false
}

// 处理保存
const handleSave = async () => {
  if (!title.value.trim()) {
    showError(t('pleaseEnterTemplateName'))
    return
  }

  try {
    isSaving.value = true
    // await indexedDBService.saveTemplate({
    //   title: title.value.trim(),
    //   html: props.html,
    //   createdAt: new Date()
    // })
    showSuccess(t('templateSaveSuccess'))
    handleClose()
  } catch (error) {
    console.error('模板保存失败:', error)
    showError(t('templateSaveFailed'))
  } finally {
    isSaving.value = false
  }
}
</script>

<style lang="less" scoped>
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-section,
.preview-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  color: #4b5563;
}

.template-input {
  width: 100%;
}

.preview-container {
  width: 100%;
  height: 200px;
  overflow: auto;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
  padding: 1rem;
}

.empty-content {
  color: #9ca3af;
  font-size: 0.875rem;
}

.preview-content {
  max-width: none;
  :deep(h1) {
    font-size: 2em;
    margin-bottom: 0.5em;
  }
  :deep(h2) {
    font-size: 1.5em;
    margin-bottom: 0.5em;
  }
  :deep(p) {
    margin-bottom: 1em;
  }
  :deep(ul), :deep(ol) {
    padding-left: 1em;
    margin-bottom: 1em;
  }
  :deep(li) {
    margin-bottom: 0.5em;
  }
  :deep(code) {
    background-color: #f3f4f6;
    padding: 0.2em 0.4em;
    border-radius: 0.25em;
  }
  :deep(pre) {
    background-color: #f3f4f6;
    padding: 1em;
    border-radius: 0.5em;
    margin-bottom: 1em;
    overflow-x: auto;
  }
}
</style>
