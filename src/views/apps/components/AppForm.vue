<template>
  <div class="flex overflow-auto fixed inset-0 justify-center items-start p-4 z-500 bg-black/70">
    <div class="p-6 w-full max-w-md rounded-xl glass-card">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-xl font-bold text-white">
            {{ currentApp.id ? t('editApp') : t('addNewAppTitle') }}
          </h3>
          <!-- 市场应用提示 -->
          <div
            v-if="currentApp.isFromMarket"
            class="flex items-center mt-1 text-sm text-tech-green"
          >
            <i class="mr-1 fas fa-store"></i>
            {{ t('fromMarket') }}
          </div>
        </div>
        <button @click="handleClose" class="text-slate-400 hover:text-white">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block mb-2 text-slate-300">{{ t('appName') }}</label>
          <input
            v-model="currentApp.name"
            type="text"
            class="px-4 py-2.5 w-full text-white rounded-lg tech-input focus:outline-none"
            :placeholder="t('appNamePlaceholder')"
          />
        </div>

        <div>
          <label class="block mb-2 text-slate-300">{{ t('appDescription') }}</label>
          <textarea
            v-model="currentApp.description"
            class="px-4 py-2.5 w-full h-24 text-white rounded-lg tech-input focus:outline-none"
            :placeholder="t('appDescriptionPlaceholder')"
          ></textarea>
        </div>

        <div>
          <label class="block mb-2 text-slate-300">{{ t('coverImageUrl') }}</label>
          <div v-if="currentApp.imageUrl" class="relative mb-2 group">
            <img
              :src="currentApp.imageUrl"
              alt="preview"
              class="w-full max-w-full h-[120px] object-cover rounded shadow transition-all duration-200"
            />
            <button
              class="absolute top-2 right-2 p-1 text-white rounded-full opacity-0 transition-opacity bg-black/60 group-hover:opacity-100"
              @click="handleRemoveImage"
              type="button"
              :title="t('delete')"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <a-upload
            v-if="!currentApp.imageUrl"
            :showUploadList="false"
            :before-upload="handleImageUpload"
            accept="image/*"
          >
            <a-button type="primary">{{ t('uploadImage') }}</a-button>
          </a-upload>
        </div>

        <div>
          <label class="block mb-2 text-slate-300">{{ t('appCategory') }}</label>
          <select
            v-model="currentApp.category"
            class="px-4 py-2.5 w-full text-white rounded-lg tech-input focus:outline-none"
          >
            <option value="imageGeneration">{{ t('imageGeneration') }}</option>
            <option value="textProcessing">{{ t('textProcessing') }}</option>
            <option value="speechRecognition">{{ t('speechRecognition') }}</option>
            <option value="dataAnalysis">{{ t('dataAnalysis') }}</option>
            <option value="intelligentAssistant">{{ t('intelligentAssistant') }}</option>
          </select>
        </div>

        <div>
          <label class="block mb-2 text-slate-300">{{ t('workflow') }}</label>
          <template v-if="currentApp.template.workflow">
            <a-button class="mr-2" type="primary" @click="handleEditWorkflow">
              {{ t('editWorkflow') }}
            </a-button>
            <a-button class="mr-2" @click="handleExportWorkflow">
              {{ t('exportWorkflow') }}
            </a-button>
          </template>
          <a-upload
            ref="upload"
            :file-list="fileList"
            :showUploadList="false"
            :before-upload="beforeUpload"
            @change="handleChange"
          >
            <a-button :type="currentApp.template.workflow ? 'default' : 'primary'">
              {{ currentApp.template.workflow ? t('reuploadWorkflow') : t('uploadWorkflow') }}
            </a-button>
          </a-upload>
        </div>

        <div v-if="currentApp.code">
          <label class="block mb-2 text-slate-300">{{ t('sourceCode') }}</label>
          <a-button type="primary" @click="handleEditCode">{{ t('editSourceCode') }}</a-button>
          <a-button class="ml-2" @click="handleRebuild">{{ t('rebuildApp') }}</a-button>
        </div>

        <div class="pt-4">
          <button
            @click="handleSave"
            class="py-3 w-full font-medium text-white bg-gradient-to-r rounded-lg transition-opacity cursor-pointer from-tech-blue to-tech-cyan hover:opacity-90"
          >
            {{ currentApp.id ? t('saveApp') : t('createApp') }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 工作流编辑器模态框 -->
  <WorkflowModal
    :show="showWorkflowModal"
    :template="currentApp.template"
    @update:show="showWorkflowModal = $event"
    @save="handleWorkflowSave"
  />

  <!-- 代码编辑器模态框 -->
  <CodeModal
    :show="showCodeModal"
    :app="currentApp"
    @update:show="showCodeModal = $event"
    @save="handleCodeSave"
  />

  <!-- 生成模态框 -->
  <GenModal
    ref="genModalRef"
    :show="showGenModal"
    :app="currentApp"
    @update:show="showGenModal = $event"
    @save="handleGenSave"
  />
</template>

<script setup>
import { ref } from 'vue'
import { t } from '@/utils/i18n'
import { handleFile } from '@/utils/comfyui-utils/index.js'
import { downloadJSON, showError } from '@/utils'
import WorkflowModal from './WorkflowModal.vue'
import CodeModal from './CodeModal.vue'
import GenModal from './GenModal.vue'

const props = defineProps({
  app: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['close', 'save'])

// 内部状态
const currentApp = ref(props.app)
const fileList = ref([])

// 模态框状态
const showWorkflowModal = ref(false)
const showCodeModal = ref(false)
const showGenModal = ref(false)

// 引用
const genModalRef = ref(null)

// 处理关闭
const handleClose = () => {
  emit('close')
}

// 处理保存
const handleSave = () => {
  if (!currentApp.value.name) {
    return showError(t('pleaseEnterAppName'))
  }
  if (!currentApp.value.description) {
    return showError(t('pleaseEnterAppDescription'))
  }
  if (!Object.keys(currentApp.value.template.prompt).length) {
    return showError(t('pleaseUploadWorkflow'))
  }

  emit('save', JSON.parse(JSON.stringify(currentApp.value)))
  handleClose()
}

// 处理编辑工作流
const handleEditWorkflow = () => {
  showWorkflowModal.value = true
}

// 处理导出工作流
const handleExportWorkflow = () => {
  downloadJSON(currentApp.value.template.workflow, `${currentApp.value.name}_workflow.json`)
}

// 处理编辑代码
const handleEditCode = () => {
  showCodeModal.value = true
}

// 处理重建应用
const handleRebuild = () => {
  showGenModal.value = true
}

// 处理工作流保存
const handleWorkflowSave = ({ prompt, paramsNodes }) => {
  currentApp.value.template.prompt = prompt
  currentApp.value.template.paramsNodes = paramsNodes
  showWorkflowModal.value = false
}

// 处理代码保存
const handleCodeSave = (code) => {
  currentApp.value.code = code
  showCodeModal.value = false
}

// 处理生成保存
const handleGenSave = (genApp) => {
  currentApp.value = JSON.parse(JSON.stringify(genApp))
  showGenModal.value = false
}

// 文件上传前处理
const beforeUpload = (file) => {
  fileList.value = [...fileList.value, file]
  return false
}

// 处理文件上传变化
const handleChange = async ({ file }) => {
  let workflow
  try {
    const data = await handleFile(file)
    if (data.nodes) {
      workflow = data
    }
  } catch (e) {
    console.log(e)
  }
  if (!workflow) {
    handleError(t('cannotReadWorkflowInfo'))
  } else {
    if (!currentApp.value.template) {
      currentApp.value.template = {}
    }
    currentApp.value.template.workflow = workflow
    showWorkflowModal.value = true
  }
}

// 处理错误
const handleError = (error) => {
  showError(error)
}

// 图片上传与压缩
const handleImageUpload = async (file) => {
  try {
    const base64 = await compressImageToBase64(file, 0.7, 512)
    currentApp.value.imageUrl = base64
  } catch (e) {
    showError(t('cannotReadImage'))
  }
  return false // 阻止自动上传
}

const handleRemoveImage = () => {
  currentApp.value.imageUrl = ''
}

function compressImageToBase64(file, quality = 0.7, maxSize = 512) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        // 计算缩放比例
        let w = img.width
        let h = img.height
        if (w > maxSize || h > maxSize) {
          if (w > h) {
            h = Math.round(h * (maxSize / w))
            w = maxSize
          } else {
            w = Math.round(w * (maxSize / h))
            h = maxSize
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
</script>

<style scoped>
.glass-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(56, 70, 102, 0.4);
  box-shadow: 0 8px 32px rgba(2, 8, 32, 0.4);
  transition: all 0.3s ease;
}
</style>
