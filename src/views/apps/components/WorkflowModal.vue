<template>
  <a-modal
    :open="show"
    @update:open="handleModalUpdate"
    :title="t('editWorkflow')"
    width="100%"
    wrap-class-name="full-modal workflow-modal"
    destroyOnClose
    :maskClosable="false"
    :okText="t('save')"
    @ok="handleSave"
    @cancel="handleCancel"
  >
    <div class="editor-box">
      <ComfyuiWorkflowEditor
        ref="editorRef"
        style="height: 800px"
        :template="template"
        @onload="workflowLoading = false"
      />
    </div>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { t } from '@/utils/i18n'
import { showError } from '@/utils'
import ComfyuiWorkflowEditor from '@/components/ComfyuiWorkflowEditor/index.vue'


const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  template: {
    type: Object,
    default: () => ({})
  },
})

const emit = defineEmits(['update:show', 'save'])

const editorRef = ref(null)
const workflowLoading = ref(true)

const handleModalUpdate = (value) => {
  emit('update:show', value)
}

const handleCancel = () => {
  emit('update:show', false)
}

const handleSave = async () => {
  try {
    const { prompt = {}, paramsNodes = [], workflow } = await editorRef.value.getData()
    if (!paramsNodes.length) {
      return showError(t('pleaseAddParams'))
    }
    emit('save', { prompt, paramsNodes, workflow })
    emit('update:show', false)
  } catch (e) {
    showError(t('workflowSaveFailed', { error: e }))
  }
}
</script>

<style lang="less">
.full-modal {
  &.workflow-modal {
    .ant-modal-content {
      height: unset;
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
      }
    }
  }
  .ant-modal-footer {
    background: transparent;
    border-top: 1px solid rgba(56, 70, 102, 0.4);
    padding: 16px 24px;
  }
}
</style>
