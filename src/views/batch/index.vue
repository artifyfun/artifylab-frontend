<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">{{ t('batchMode') }}</h1>
      <p class="page-description">{{ t('batchModeDescription') }}</p>
    </div>
    <div class="flex justify-end mb-2">
      <a-button
        @click="openHistoryDialog"
        class="nav-btn"
      >
        📝 {{ t('viewExecutionHistory') }}
      </a-button>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 步骤指示器 -->
      <a-steps :current="currentStep" class="steps-container">
        <a-step :title="t('selectSource')" :description="t('selectSourceDesc')" />
        <a-step :title="t('mapData')" :description="t('mapDataDesc')" />
        <a-step :title="t('execute')" :description="t('executeDesc')" />
      </a-steps>

      <!-- 步骤1: 选择批量来源 -->
      <div v-if="currentStep === 0" class="step-content">
        <div class="source-selection">
          <h3 class="step-title">{{ t('selectBatchSource') }}</h3>

          <!-- 来源类型选择 -->
          <div class="source-types">
            <a-radio-group v-model:value="selectedSourceType" class="source-type-group">
              <a-radio-button value="directory" class="source-type-btn">
                <template #icon><FolderOpenOutlined /></template>
                {{ t('fileDirectory') }}
              </a-radio-button>
              <a-radio-button value="file" class="source-type-btn">
                <template #icon><FileTextOutlined /></template>
                {{ t('uploadFile') }}
              </a-radio-button>
              <a-radio-button value="json" class="source-type-btn">
                <template #icon><CodeOutlined /></template>
                {{ t('writeJSON') }}
              </a-radio-button>
            </a-radio-group>
          </div>

          <!-- 文件目录选择 -->
          <div v-if="selectedSourceType === 'directory'" class="source-config">
            <div class="config-item">
              <label class="config-label">{{ t('selectDirectory') }}</label>
              <div class="directory-selector">
                <a-input
                  v-model:value="directoryPath"
                  :placeholder="t('directoryPathPlaceholder')"
                  readonly
                  class="path-input"
                />
                <a-button type="primary" class="path-btn" @click="selectDirectory">
                  <template #icon><FolderOpenOutlined /></template>
                  {{ t('browse') }}
                </a-button>
              </div>
              <div v-if="directoryFiles.length > 0" class="file-preview">
                <div class="file-preview-header">
                  <h4>{{ t('foundFiles') }} ({{ filteredDirectoryFiles.length }})</h4>
                  <div class="file-filter">
                    <a-radio-group v-model:value="fileFilter" size="small">
                      <a-radio-button value="all">{{ t('all') }} ({{ directoryFiles.length }})</a-radio-button>
                      <a-radio-button
                        v-for="(count, type) in fileCounts"
                        :key="type"
                        :value="type"
                        v-show="count > 0"
                      >
                        {{ t(type + 'Only') }} ({{ count }})
                      </a-radio-button>
                    </a-radio-group>
                  </div>
                </div>
                <div class="file-list">
                  <div v-for="file in filteredDirectoryFiles.slice(0, 10)" :key="file.path" class="file-item">
                    <FileOutlined v-if="!file.isDirectory && !getFileTypeIcon(file.name)" />
                    <FolderOutlined v-else-if="file.isDirectory" />
                    <component :is="getFileTypeIcon(file.name)" v-else />
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-path">{{ file.relativePath }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  </div>
                  <div v-if="filteredDirectoryFiles.length > 10" class="more-files">
                    {{ t('andMoreFiles', { count: filteredDirectoryFiles.length - 10 }) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 文件上传 -->
          <div v-if="selectedSourceType === 'file'" class="source-config">
            <div class="config-item">
              <label class="config-label">{{ t('uploadFile') }}</label>
              <a-upload
                v-model:file-list="uploadedFiles"
                :before-upload="beforeFileUpload"
                :multiple="false"
                accept=".csv,.xlsx,.xls,.json"
                class="file-upload"
              >
                <a-button class="upload-btn" type="primary">
                  <template #icon><UploadOutlined /></template>
                  {{ t('selectFile') }}
                </a-button>
                <template #itemRender="{ file }">
                  <div class="uploaded-file">
                    <FileTextOutlined />
                    <span>{{ file.name }}</span>
                    <DeleteOutlined class="remove-file-btn" @click="removeFile(file)" />
                  </div>
                </template>
              </a-upload>
              <div class="file-format-hint">
                {{ t('supportedFormats') }}: CSV, Excel (.xlsx, .xls), JSON
              </div>
            </div>
          </div>

          <!-- JSON输入 -->
          <div v-if="selectedSourceType === 'json'" class="source-config">
            <div class="config-item">
              <label class="config-label">{{ t('inputJSON') }}</label>
              <div class="json-editor-container">
                <CodeEditor
                  ref="jsonEditorRef"
                  :value="jsonInput"
                  language="json"
                  @change="handleJsonChange"
                  class="json-editor"
                />
              </div>
              <div class="json-hint">
                {{ t('jsonFormatHint') }}
              </div>
            </div>
          </div>

          <!-- 数据预览 -->
          <div v-if="batchData.length > 0" class="data-preview">
            <h4>{{ t('dataPreview') }} ({{ batchData.length }} {{ t('items') }})</h4>
            <div class="preview-table">
              <a-table
                :columns="previewColumns"
                :data-source="batchData.slice(0, 5)"
                :pagination="false"
                size="small"
                class="preview-table-component"
              />
              <div v-if="batchData.length > 5" class="more-data">
                {{ t('andMoreItems', { count: batchData.length - 5 }) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤2: 数据映射 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="mapping-container">
          <div class="mapping-header">
            <h3 class="step-title" style="margin-bottom: 0;">{{ t('mapDataFields') }}</h3>
            <div class="drag-tip-inline">
              <InfoCircleOutlined class="drag-tip-icon" />
              <span class="drag-tip-text">{{ t('dragTip') }}</span>
            </div>
          </div>

          <div class="mapping-layout">
            <!-- 左侧：可映射的数据源 -->
            <div class="mapping-source">
              <h4 class="mapping-section-title">{{ t('availableData') }}</h4>
              <div class="data-source-list">
                <div
                  v-for="field in availableFields"
                  :key="field.key"
                  class="data-field-item"
                  :title="field.preview"
                  draggable="true"
                  @dragstart="handleDragStart($event, field)"
                  @dragend="handleDragEnd"
                >
                  <div class="field-icon">
                    <DatabaseOutlined />
                  </div>
                  <div class="field-info">
                    <div class="field-name">{{ field.name }}</div>
                    <div class="field-key">{{ field.key }}</div>
                  </div>
                  <div class="field-preview">{{ field.preview }}</div>
                </div>
              </div>
            </div>

            <!-- 中间：映射区域 -->
            <div class="mapping-center">
              <div class="mapping-arrow">
                <ArrowRightOutlined />
              </div>
            </div>

            <!-- 右侧：目标输入字段 -->
            <div class="mapping-target">
              <h4 class="mapping-section-title">{{ t('targetInputs') }}</h4>
              <div class="target-inputs-list">
                <div
                  v-for="input in state.inputs"
                  :key="input.id"
                  class="target-input-item"
                  :class="{ 'has-mapping': input.valueMap }"
                  @dragover="handleDragOver"
                  @drop="handleDrop($event, input)"
                >
                  <div class="input-header">
                    <div class="input-icon">
                      <EditOutlined />
                    </div>
                    <div class="input-info">
                      <div class="input-label">{{ input.label }}</div>
                      <div class="input-key">{{ input.key }}</div>
                    </div>
                  </div>

                  <!-- 映射显示 -->
                  <div v-if="input.valueMap" class="mapping-display">
                    <div class="mapped-field">
                      <DatabaseOutlined />
                      <span>{{ input.valueMap.name }}</span>
                      <a-button
                        type="text"
                        size="small"
                        @click="removeMapping(input)"
                        class="remove-mapping"
                      >
                        <template #icon><CloseOutlined /></template>
                      </a-button>
                    </div>
                  </div>

                  <!-- 拖拽提示 -->
                  <div v-else class="drop-zone">
                    <InboxOutlined />
                    <span>{{ t('dragFieldHere') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤3: 执行批量处理 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="execution-container">
          <h3 class="step-title">{{ t('executeBatchProcessing') }}</h3>

          <!-- 统计信息卡片 -->
          <div class="custom-stats-row">
            <div class="stat-card">
              <div class="stat-label">{{ t('totalItems') }}</div>
              <div class="stat-value">{{ executionProgress.total }}</div>
            </div>
            <div class="stat-card success">
              <div class="stat-label">{{ t('success') }}</div>
              <div class="stat-value">{{ executionProgress.success }}</div>
            </div>
            <div class="stat-card error">
              <div class="stat-label">{{ t('failed') }}</div>
              <div class="stat-value">{{ executionProgress.failed }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">{{ t('processed') }}</div>
              <div class="stat-value">{{ executionProgress.processed }}</div>
            </div>
          </div>

          <!-- 开始项选择拖动条（原生input） -->
          <div class="native-slider-row" v-if="batchData.length > 1">
            <label class="native-slider-label">{{ t('startFromItemLabel') }}</label>
            <input
              type="range"
              min="1"
              :max="batchData.length"
              v-model="startFromIndex"
              :disabled="isExecuting"
              class="native-slider"
            />
            <span class="native-slider-value">{{ startFromIndex }} / {{ batchData.length }}</span>
          </div>

          <!-- 自动关闭计算机配置 -->
          <div class="auto-shutdown-config">
            <div class="shutdown-toggle">
              <a-switch
                v-model:checked="autoShutdownEnabled"
                :disabled="isExecuting"
                class="shutdown-switch"
              />
              <div class="shutdown-info">
                <div class="shutdown-label">{{ t('autoShutdown') }}</div>
                <div class="shutdown-description">{{ t('autoShutdownDescription') }}</div>
                <div class="shutdown-note">
                  <InfoCircleOutlined class="shutdown-note-icon" />
                  <span>{{ t('autoShutdownNote') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="custom-progress-bar">
            <div class="custom-progress-inner" :style="{ width: executionProgress.percent + '%', background: executionProgress.strokeColor }"></div>
            <span class="custom-progress-text">{{ executionProgress.percent }}%</span>
          </div>
          <div class="eta-row" v-if="isExecuting && executionProgress.processed > 0 && executionProgress.processed < executionProgress.total">
            ⏳ {{ t('estimatedRemaining') }}: {{ estimatedRemainingText }}
          </div>

          <!-- 当前处理项高亮 -->
          <div class="current-item-highlight" v-if="executionProgress.currentItem">
            <span>{{ t('currentProcessingLabel') }}</span>
            <span class="current-item-content">{{ executionProgress.currentItem }}</span>
          </div>

          <!-- 日志列表 -->
          <ul class="custom-log-list" v-if="executionLogs.length > 0">
            <li v-for="(log, idx) in executionLogs" :key="idx" :class="log.type">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </li>
          </ul>

          <!-- 操作按钮 -->
          <div class="custom-actions">
            <button class="relative btn-primary" v-if="!isExecuting" @click="executeBatch">
              ▶️ {{ t('startBatchExecution') }}
            </button>
            <button class="btn-danger" v-else @click="stopExecution">
              ⏹️ {{ t('stopExecution') }}
            </button>
            <button class="btn-default" @click="openOutputDirectory">
              📂 {{ t('openOutputDirectory') }}
            </button>
            <button class="btn-default" v-if="executionLogs.length > 0" @click="clearLogs">
              🧹 {{ t('clearLogs') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 步骤导航 -->
      <div class="step-navigation">
        <a-button
          v-if="currentStep > 0"
          @click="previousStep"
          class="nav-btn"
        >
          <template #icon><LeftOutlined /></template>
          {{ t('previous') }}
        </a-button>

        <a-button
          v-if="currentStep < 2"
          type="primary"
          @click="nextStep"
          :disabled="!canProceed"
          class="nav-btn"
        >
          {{ t('next') }}
          <template #icon><RightOutlined /></template>
        </a-button>
      </div>
    </div>
  </div>

  <!-- 执行记录弹窗 -->
  <a-modal
    v-model:open="showHistoryDialog"
    :title="t('executionHistoryTitle')"
    width="820px"
    :footer="null"
  >
    <div class="history-dialog">
      <div v-if="historyRecords.length === 0" class="history-empty">{{ t('noExecutionRecords') }}</div>
      <div v-else class="history-list">
        <div class="history-item" v-for="rec in historyRecords" :key="rec.id">
          <div class="history-head">
            <div class="title">
              <span class="name">{{ rec.appName || t('app') }}</span>
              <span class="status" :class="rec.status">{{ getStatusText(rec.status) }}</span>
            </div>
            <div class="meta">
              <span>{{ t('createdAt') }}: {{ new Date(rec.createdAt).toLocaleString() }}</span>
              <span>{{ t('updatedAt') }}: {{ new Date(rec.updatedAt).toLocaleString() }}</span>
            </div>
          </div>
          <div class="history-body">
            <div class="row">
              <span>{{ t('totalCount') }}: {{ rec.total }}</span>
              <span>{{ t('successCount') }}: {{ rec.success }}</span>
              <span>{{ t('failedCount') }}: {{ rec.failed }}</span>
              <span>{{ t('progressPercent') }}: {{ rec.percent }}%</span>
              <span>{{ t('startIndex') }}: {{ rec.startFromIndex }}</span>
              <span>{{ t('lastCompleted') }}: {{ rec.lastIndexProcessed }}</span>
            </div>
            <div class="mini-progress">
              <div class="mini-progress-inner" :style="{ width: (rec.percent || 0) + '%' }"></div>
              <span class="mini-progress-text">{{ rec.percent }}%</span>
            </div>
            <div class="row logs" v-if="rec.logs && rec.logs.length">
              <span class="log" v-for="(lg, i) in rec.logs.slice(0, 3)" :key="i">
                [{{ lg.time }}] {{ lg.type }}: {{ lg.message }}
              </span>
              <span v-if="rec.logs.length > 3">…</span>
            </div>
          </div>
          <div class="history-actions">
            <a-button size="small" type="primary" @click="restoreFromRecord(rec)">{{ t('continueFromLast') }}</a-button>
            <a-button size="small" danger @click="deleteHistoryRecord(rec.id)">{{ t('deleteRecord') }}</a-button>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ComfyUIClient } from '@artifyfun/comfy-ui-client'
import { useAppStore } from '@/stores/appStore'
import { genMeta } from '@/utils/genPrompt'
import { t } from '@/utils/i18n'
import { showError, showSuccess, showInfo, uuidv4, getSeed } from '@/utils'
import CodeEditor from '@/components/CodeEditor/index.vue'
import { ExcelProcessor } from '@/utils/excel-utils'
import localforage from 'localforage'
import {
  FolderOpenOutlined,
  FileTextOutlined,
  CodeOutlined,
  UploadOutlined,
  DeleteOutlined,
  FileOutlined,
  DatabaseOutlined,
  EditOutlined,
  ArrowRightOutlined,
  InboxOutlined,
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  FolderOutlined,
  PictureOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'

const state = reactive({
  inputs: [],
  clientId: uuidv4(),
})

const appStore = useAppStore()

const currentApp = ref(null)

// 步骤控制
const currentStep = ref(0)

// 批量来源相关
const selectedSourceType = ref('directory')
const directoryPath = ref('')
const directoryFiles = ref([])
const fileFilter = ref('all') // 文件过滤选项
const uploadedFiles = ref([])
const jsonInput = ref('[]')
const jsonEditorRef = ref(null)

const client = ref(null)

const getClient = () => {
  if (!client.value) {
    client.value = new ComfyUIClient(appStore.config.comfyHost, state.clientId)
  }
  return client.value
}

// 批量数据
const batchData = ref([])
const availableFields = ref([])

// 映射相关
const draggedField = ref(null)

// 执行相关
const isExecuting = ref(false)
const startFromIndex = ref(1) // 新增：开始执行的位置
const autoShutdownEnabled = ref(false) // 新增：自动关闭计算机开关
const executionProgress = reactive({
  total: 0,
  processed: 0,
  success: 0,
  failed: 0,
  percent: 0,
  status: 'normal',
  strokeColor: '#10b981',
  currentItem: ''
})
const executionLogs = ref([]) // 新增：执行日志

// 预计剩余时间统计
const executionTimeStats = reactive({
  totalMs: 0,
  count: 0
})

const averageItemMs = computed(() => {
  return executionTimeStats.count > 0 ? executionTimeStats.totalMs / executionTimeStats.count : 0
})

const estimatedRemainingMs = computed(() => {
  const remaining = Math.max(executionProgress.total - executionProgress.processed, 0)
  return Math.round(remaining * averageItemMs.value)
})

const estimatedRemainingText = computed(() => formatDuration(estimatedRemainingMs.value))

function nowMs() {
  try {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now()
    }
  } catch (_) {}
  return Date.now()
}

function formatDuration(ms) {
  if (!ms || ms <= 0 || !Number.isFinite(ms)) return t('lessThanOneSecond')
  const totalSeconds = Math.max(1, Math.floor(ms / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = []
  if (days) parts.push(`${days}${t('dayUnit')}`)
  if (hours) parts.push(`${hours}${t('hourUnit')}`)
  if (minutes) parts.push(`${minutes}${t('minuteUnit')}`)
  if (seconds && parts.length < 3) parts.push(`${seconds}${t('secondUnit')}`)
  return parts.length ? parts.join(t('timeUnitSeparator')) : t('lessThanOneSecond')
}

// ===== 执行记录（localforage） =====
const showHistoryDialog = ref(false)
const historyRecords = ref([])
const currentHistoryRecordId = ref(null)
const historyLoadedKey = ref('')
const historyKey = computed(() => (currentApp.value && currentApp.value.id) ? `batch/history/${currentApp.value.id}` : '')

async function ensureHistoryLoaded() {
  if (!historyKey.value) {
    return
  }
  if (historyLoadedKey.value === historyKey.value && historyRecords.value.length) return
  try {
    const list = (await localforage.getItem(historyKey.value)) || []
    historyRecords.value = Array.isArray(list) ? list : []
    // 按更新时间倒序
    historyRecords.value.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    historyLoadedKey.value = historyKey.value
  } catch (error) {
    historyRecords.value = []
  }
}

async function saveHistory() {
  if (!historyKey.value) return
  try {
    await localforage.setItem(historyKey.value, JSON.parse(JSON.stringify(historyRecords.value)))
  } catch (_) {}
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

async function createNewHistoryRecord() {
  const newId = uuidv4()
  const now = new Date().toISOString()
  const record = {
    id: newId,
    appId: currentApp.value?.id,
    appName: currentApp.value?.name,
    createdAt: now,
    updatedAt: now,
    status: 'running',
    clientId: state.clientId,
    total: executionProgress.total,
    processed: 0,
    success: 0,
    failed: 0,
    percent: 0,
    startFromIndex: startFromIndex.value,
    lastIndexProcessed: startFromIndex.value - 1,
    inputsMapping: deepClone(state.inputs),
    batchSource: {
      type: selectedSourceType.value,
      directoryPath: directoryPath.value,
      fileFilter: fileFilter.value,
      uploadedFiles: deepClone(uploadedFiles.value?.map(f => ({ name: f.name, size: f.size }))) || [],
      jsonInput: jsonInput.value,
    },
    batchData: deepClone(batchData.value),
    logs: [],
    results: [],
  }
  historyRecords.value.unshift(record)
  await saveHistory()
  return newId
}

async function upsertHistoryRecord(update) {
  if (!update?.id) return
  const idx = historyRecords.value.findIndex(r => r.id === update.id)
  if (idx === -1) return
  const rec = historyRecords.value[idx]
  const merged = { ...rec, ...update }
  if (typeof update.processed === 'number') {
    merged.lastIndexProcessed = Math.max(rec.lastIndexProcessed || 0, update.processed + (rec.startFromIndex ? (rec.startFromIndex - 1) : 0))
  }
  if (Array.isArray(update.logs) && update.logs.length) {
    merged.logs = [...update.logs, ...(rec.logs || [])]
  }
  if (update.resultItem) {
    merged.results = [...(rec.results || []), update.resultItem]
    merged.lastIndexProcessed = Math.max(rec.lastIndexProcessed || 0, update.resultItem.index)
  }
  merged.updatedAt = new Date().toISOString()
  historyRecords.value.splice(idx, 1, merged)
  await saveHistory()
}

async function openHistoryDialog() {
  await ensureHistoryLoaded()
  showHistoryDialog.value = true
}

async function deleteHistoryRecord(id) {
  const idx = historyRecords.value.findIndex(r => r.id === id)
  if (idx > -1) {
    historyRecords.value.splice(idx, 1)
    await saveHistory()
  }
}

function restoreFromRecord(rec) {
  if (!rec) return
  // 恢复源与数据、映射
  selectedSourceType.value = rec.batchSource?.type || 'json'
  directoryPath.value = rec.batchSource?.directoryPath || ''
  fileFilter.value = rec.batchSource?.fileFilter || 'all'
  jsonInput.value = rec.batchSource?.jsonInput || '[]'
  batchData.value = Array.isArray(rec.batchData) ? deepClone(rec.batchData) : []
  state.inputs = Array.isArray(rec.inputsMapping) ? deepClone(rec.inputsMapping) : state.inputs
  updateAvailableFields()
  // 继续索引
  const nextIndex = Math.min((rec.lastIndexProcessed || 0), batchData.value.length)
  startFromIndex.value = Math.max(1, nextIndex)
  currentStep.value = 2
  showHistoryDialog.value = false
}

// 计算属性
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return batchData.value.length > 0
    case 1:
      return state.inputs.some(input => input.valueMap)
    default:
      return true
  }
})

// 文件计数统计
const fileCounts = computed(() => {
  const counts = {
    files: 0,
    directories: 0,
    images: 0,
    videos: 0,
    audios: 0,
    texts: 0,
    documents: 0
  }

  directoryFiles.value.forEach(file => {
    if (file.isDirectory) {
      counts.directories++
    } else {
      counts.files++

      const fileName = file.name.toLowerCase()
      if (fileTypes.images.some(ext => fileName.endsWith(ext))) {
        counts.images++
      } else if (fileTypes.videos.some(ext => fileName.endsWith(ext))) {
        counts.videos++
      } else if (fileTypes.audios.some(ext => fileName.endsWith(ext))) {
        counts.audios++
      } else if (fileTypes.texts.some(ext => fileName.endsWith(ext))) {
        counts.texts++
      } else if (fileTypes.documents.some(ext => fileName.endsWith(ext))) {
        counts.documents++
      }
    }
  })

  return counts
})

// 文件类型定义
const fileTypes = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tiff', '.tif'],
  videos: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v', '.3gp', '.ogv', '.ts', '.mts', '.m2ts', '.vob', '.asf', '.rm', '.rmvb', '.divx', '.xvid'],
  audios: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a', '.opus', '.aiff', '.au', '.ra', '.mid', '.midi', '.amr', '.ape', '.alac', '.wv'],
  texts: ['.txt', '.md', '.json', '.xml', '.html', '.htm', '.css', '.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.cpp', '.c', '.h', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.sql', '.sh', '.bat', '.ps1', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.log'],
  documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp', '.rtf', '.csv']
}

// 过滤后的文件列表
const filteredDirectoryFiles = computed(() => {
  if (fileFilter.value === 'all') {
    return directoryFiles.value
  }

  const filterMap = {
    files: (file) => !file.isDirectory,
    directories: (file) => file.isDirectory,
    images: (file) => !file.isDirectory && fileTypes.images.some(ext => file.name.toLowerCase().endsWith(ext)),
    videos: (file) => !file.isDirectory && fileTypes.videos.some(ext => file.name.toLowerCase().endsWith(ext)),
    audios: (file) => !file.isDirectory && fileTypes.audios.some(ext => file.name.toLowerCase().endsWith(ext)),
    texts: (file) => !file.isDirectory && fileTypes.texts.some(ext => file.name.toLowerCase().endsWith(ext)),
    documents: (file) => !file.isDirectory && fileTypes.documents.some(ext => file.name.toLowerCase().endsWith(ext))
  }

  const filterFn = filterMap[fileFilter.value]
  return filterFn ? directoryFiles.value.filter(filterFn) : directoryFiles.value
})



const previewColumns = computed(() => {
  if (batchData.value.length === 0) return []

  const firstItem = batchData.value[0]
  return Object.keys(firstItem).map(key => {
    const column = {
      title: key,
      dataIndex: key,
      key: key,
      ellipsis: true
    }

    // 根据字段类型设置不同的宽度和格式化
    switch (key) {
      case 'fileName':
        column.width = 200
        break
      case 'filePath':
        column.width = 300
        break
      case 'relativePath':
        column.width = 250
        break
      case 'fileSize':
        column.width = 100
        column.customRender = ({ text }) => formatFileSize(text)
        break
      case 'lastModified':
        column.width = 150
        column.customRender = ({ text }) => new Date(text).toLocaleString()
        break
      case 'isDirectory':
        column.width = 80
        column.customRender = ({ text }) => text ? 'true' : 'false'
        break
      case 'fileExtension':
        column.width = 80
        break
      case 'fileNameWithoutExt':
        column.width = 150
        break
      default:
        column.width = 120
    }

    return column
  })
})

// 初始化
async function init() {
  await appStore.initConfig()
  const app = await appStore.getAppById(appStore.config.activeAppId)
  currentApp.value = app
  const inputs = genMeta(currentApp.value).components.children.filter(node => ['form-item'].includes(node.componentName)).map(node => {
    return {
      id: node.id,
      key: node.props.key,
      label: node.props.label,
      valueMap: null
    }
  })

  state.inputs = inputs
  // 加载当前应用的执行记录
  await ensureHistoryLoaded()
}

// 选择目录
async function selectDirectory() {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.ArtifyLab.selectFile()
      if (!result) return

      directoryPath.value = result
      await scanDirectory(result)
    } else {
      showError('electronNotAvailable')
    }
  } catch (error) {
    console.error('选择目录失败:', error)
    showError('selectDirectoryFailed')
  }
}

// 扫描目录
async function scanDirectory(path) {
  try {
    if (window.electronAPI) {
      const files = await window.electronAPI.ArtifyLab.scanFolder(path)
      directoryFiles.value = files.map(file => ({
        name: file.fileName,
        path: file.fullPath,
        size: file.size,
        type: file.isDirectory ? 'directory' : 'file',
        extension: file.extension,
        isDirectory: file.isDirectory,
        lastModified: file.lastModified,
        relativePath: file.relativePath
      }))

      // 生成批量数据
      generateBatchDataFromFiles()
    }
  } catch (error) {
    console.error('扫描目录失败:', error)
    showError('scanDirectoryFailed')
  }
}

// 从文件生成批量数据
function generateBatchDataFromFiles() {
  batchData.value = filteredDirectoryFiles.value.map(file => ({
    fileName: file.name,
    filePath: file.path,
    fileSize: file.size,
    fileType: file.type,
    fileExtension: file.extension,
    fileNameWithoutExt: file.extension ? file.name.slice(0, -(file.extension.length + 1)) : file.name,
    isDirectory: file.isDirectory,
    lastModified: file.lastModified,
    relativePath: file.relativePath
  }))

  updateAvailableFields()
}

// 文件上传处理
function beforeFileUpload(file) {
  // 使用ExcelProcessor验证文件
  if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    const validation = ExcelProcessor.validateExcelFile(file)
    if (!validation.isValid) {
      showError(validation.errors[0])
      return false
    }
  } else {
    // 其他文件类型验证
    const isValidType = ['text/csv', 'application/json'].includes(file.type)
    if (!isValidType) {
      showError('unsupportedFileType')
      return false
    }

    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isLt10M) {
      showError('fileTooLarge')
      return false
    }
  }

  return false // 阻止自动上传，手动处理
}

// 处理文件上传
async function handleFileUpload(file) {
  try {
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // Excel文件处理
      await parseExcelFile(file)
    } else {
      // 其他文件处理
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target.result
        parseFileContent(content, file.name)
      }
      reader.readAsText(file)
    }
  } catch (error) {
    console.error('文件处理失败:', error)
    showError('fileProcessingFailed')
  }
}

// 解析文件内容
function parseFileContent(content, fileName) {
  try {
    let data = []

    if (fileName.endsWith('.json')) {
      data = JSON.parse(content)
    } else if (fileName.endsWith('.csv')) {
      data = parseCSV(content)
    } else {
      showError('unsupportedFileType')
      return
    }

    if (Array.isArray(data)) {
      batchData.value = data
      updateAvailableFields()
      showSuccess('fileParsedSuccessfully')
    } else {
      showError('invalidDataFormat')
    }
  } catch (error) {
    console.error('解析文件失败:', error)
    showError('fileParseFailed')
  }
}

// 解析Excel文件
async function parseExcelFile(file) {
  try {
    // 使用ExcelProcessor解析文件
    const result = await ExcelProcessor.parseExcelFile(file, {
      sheetIndex: 0, // 使用第一个工作表
      headerRow: 0, // 第一行作为表头
      dataStartRow: 1, // 从第二行开始读取数据
      maxRows: 10000, // 最大读取10000行
      includeEmptyRows: false, // 不包含空行
      dateFormat: 'YYYY-MM-DD', // 日期格式
      numberFormat: 'string' // 数字转换为字符串
    })

    batchData.value = result.data
    updateAvailableFields()
    showSuccess('excelFileParsedSuccessfully')

    // 显示文件信息
    console.log('Excel文件解析成功:', {
      sheetName: result.sheetName,
      totalRows: result.totalRows,
      headers: result.headers
    })

    return result.data
  } catch (error) {
    console.error('Excel文件解析失败:', error)
    showError('excelParseFailed')
    throw error
  }
}

// 解析CSV
function parseCSV(content) {
  const lines = content.split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const data = []

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.trim())
      const item = {}
      headers.forEach((header, index) => {
        item[header] = values[index] || ''
      })
      data.push(item)
    }
  }

  return data
}

// 移除文件
function removeFile(file) {
  const index = uploadedFiles.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    uploadedFiles.value.splice(index, 1)
  }
}

// JSON输入处理
function handleJsonChange(value) {
  jsonInput.value = value
  try {
    const data = JSON.parse(value)
    if (Array.isArray(data)) {
      batchData.value = data
      updateAvailableFields()
    }
  } catch (error) {
    // JSON格式错误时不更新数据
  }
}

// 更新可用字段
function updateAvailableFields() {
  if (batchData.value.length === 0) {
    availableFields.value = []
    return
  }

  const firstItem = batchData.value[0]
  availableFields.value = Object.keys(firstItem).map(key => ({
    key: key,
    name: key,
    preview: String(firstItem[key]).substring(0, 128) + (String(firstItem[key]).length > 128 ? '...' : '')
  }))
}

// 拖拽处理
function handleDragStart(event, field) {
  draggedField.value = field
  event.dataTransfer.effectAllowed = 'move'
}

function handleDragEnd() {
  draggedField.value = null
}

function handleDragOver(event) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

function handleDrop(event, input) {
  event.preventDefault()
  if (draggedField.value) {
    input.valueMap = draggedField.value
    draggedField.value = null
  }
}

// 移除映射
function removeMapping(input) {
  input.valueMap = null
}

// 步骤导航
function nextStep() {
  if (currentStep.value < 2) {
    currentStep.value++
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function getPrompt(data) {
  const prompt = JSON.parse(JSON.stringify(currentApp.value.template.prompt))
  Object.keys(prompt).forEach((key) => {
    const item = prompt[key]
    if (typeof item.inputs?.seed === 'number') {
      item.inputs.seed = getSeed(15)
    }
  })
  state.inputs.forEach(node => {
    prompt[node.id].inputs[node.key] = data[node.valueMap?.key] || prompt[node.id].inputs[node.key]
  })
  return prompt
}

const getOutputs = async (prompt) => {
  try {
    const client = getClient()
    await client.connect()
    const result = await client.getResult(prompt)
    await client.disconnect()
    return result
  } catch (error) {
    console.log(error)
    throw error
  }
}

function interrupt() {
  const client = getClient()
  return client.interrupt()
}

// 执行批量处理
async function executeBatch() {
  if (batchData.value.length === 0) {
    showError('noDataToProcess')
    return
  }

  const mappedInputs = state.inputs.filter(input => input.valueMap)
  if (mappedInputs.length === 0) {
    showError('noMappedFields')
    return
  }

  isExecuting.value = true
  executionProgress.total = batchData.value.length
  executionProgress.processed = startFromIndex.value - 1
  executionProgress.success = 0
  executionProgress.failed = 0
  executionProgress.percent = 0
  executionProgress.status = 'normal'
  executionProgress.strokeColor = '#10b981'
  executionProgress.currentItem = ''
  executionLogs.value = []
  executionTimeStats.totalMs = 0
  executionTimeStats.count = 0

  try {
    // 添加开始日志
    executionLogs.value.unshift({
      time: new Date().toLocaleTimeString(),
      message: t('batchExecutionStarted'),
      type: 'info'
    })

    const startIndex = startFromIndex.value - 1
    const itemsToProcess = batchData.value.slice(startIndex)

    // 创建执行记录
    await ensureHistoryLoaded()
    const recordId = await createNewHistoryRecord()
    currentHistoryRecordId.value = recordId

    for (let i = 0; i < itemsToProcess.length; i++) {
      if (!isExecuting.value) {
        // 执行被停止
        break
      }

      const item = itemsToProcess[i]
      const currentIndex = startIndex + i + 1

      // 更新当前处理的项目
      executionProgress.currentItem = `${currentIndex}: ${JSON.stringify(item).substring(0, 100)}...`

      const prompt = getPrompt(item)
      let isSuccess = false
      let errorErrorMsg = ''
      const itemStart = nowMs()
      try {
        // await new Promise(resolve => setTimeout(resolve, 1000))
        const result = await getOutputs(prompt)
        if (result.status.completed) {
          isSuccess = true
        }
      } catch (err) {
        errorErrorMsg = err
      }
      const itemDuration = Math.max(0, nowMs() - itemStart)
      executionTimeStats.totalMs += itemDuration
      executionTimeStats.count += 1

      if (isSuccess) {
        executionProgress.success++
        executionLogs.value.unshift({
          time: new Date().toLocaleTimeString(),
          message: t('itemProcessedSuccessfully', { index: currentIndex }),
          type: 'success'
        })
      } else {
        executionProgress.failed++
        executionLogs.value.unshift({
          time: new Date().toLocaleTimeString(),
          message: errorErrorMsg,
          type: 'error'
        })
      }

      executionProgress.processed++
      executionProgress.percent = Math.round((executionProgress.processed / executionProgress.total) * 100)

      // 更新执行记录（逐条）
      await upsertHistoryRecord({
        id: recordId,
        processed: executionProgress.processed,
        success: executionProgress.success,
        failed: executionProgress.failed,
        percent: executionProgress.percent,
        currentItem: executionProgress.currentItem,
        logs: [
          {
            time: new Date().toLocaleTimeString(),
            type: isSuccess ? 'success' : 'error',
            message: isSuccess ? t('itemProcessedSuccessfully', { index: currentIndex }) : String(errorErrorMsg || 'error')
          }
        ],
        resultItem: {
          index: currentIndex,
          durationMs: itemDuration,
          success: isSuccess,
          error: isSuccess ? null : String(errorErrorMsg || 'error'),
          data: item
        }
      })
    }

    // 执行完成
    if (isExecuting.value) {
      executionProgress.status = 'success'
      executionProgress.currentItem = ''
      executionLogs.value.push({
        time: new Date().toLocaleTimeString(),
        message: t('batchExecutionCompleted', {
          total: executionProgress.total,
          success: executionProgress.success,
          failed: executionProgress.failed
        }),
        type: 'success'
      })
      showSuccess('batchExecutionCompleted', {
        total: executionProgress.total,
        success: executionProgress.success,
        failed: executionProgress.failed
      })

      // 结束记录
      await upsertHistoryRecord({
        id: currentHistoryRecordId.value,
        status: 'completed',
        currentItem: ''
      })

      unloadModel()

      // 检查是否需要自动关闭计算机
      if (autoShutdownEnabled.value) {
        await handleAutoShutdown()
      }
    }

  } catch (error) {
    console.error('批量执行失败:', error)
    executionProgress.status = 'exception'
    executionProgress.strokeColor = '#ef4444'
    executionProgress.currentItem = ''
    executionLogs.value.push({
      time: new Date().toLocaleTimeString(),
      message: t('batchExecutionFailed'),
      type: 'error'
    })
    showError('batchExecutionFailed')
    await upsertHistoryRecord({ id: currentHistoryRecordId.value, status: 'failed', currentItem: '' })
  } finally {
    isExecuting.value = false
  }
}

// 停止执行
async function stopExecution() {
  interrupt()
  unloadModel()
  // 立即设置停止状态，防止继续执行
  isExecuting.value = false

  showInfo('executionStopped')

  // 更新进度状态
  executionProgress.status = 'exception'
  executionProgress.strokeColor = '#ef4444'
  executionProgress.currentItem = ''

  // 添加停止日志
  executionLogs.value.unshift({
    time: new Date().toLocaleTimeString(),
    message: t('executionStoppedByUser'),
    type: 'info'
  })

  // 标记记录已停止
  await upsertHistoryRecord({ id: currentHistoryRecordId.value, status: 'stopped', currentItem: '' })
}

// 清除日志
function clearLogs() {
  executionLogs.value = []
}

// 获取文件类型图标
function getFileTypeIcon(fileName) {
  const ext = fileName.toLowerCase()
  if (fileTypes.images.some(type => ext.endsWith(type))) {
    return PictureOutlined
  } else if (fileTypes.videos.some(type => ext.endsWith(type))) {
    return VideoCameraOutlined
  } else if (fileTypes.audios.some(type => ext.endsWith(type))) {
    return SoundOutlined
  } else if (ext.endsWith('.pdf')) {
    return FilePdfOutlined
  } else if (ext.endsWith('.doc') || ext.endsWith('.docx')) {
    return FileWordOutlined
  } else if (ext.endsWith('.xls') || ext.endsWith('.xlsx')) {
    return FileExcelOutlined
  } else if (ext.endsWith('.ppt') || ext.endsWith('.pptx')) {
    return FilePptOutlined
  } else if (fileTypes.texts.some(type => ext.endsWith(type))) {
    return FileTextOutlined
  }
  return null
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    'running': t('statusRunning'),
    'completed': t('statusCompleted'),
    'failed': t('statusFailed'),
    'stopped': t('statusStopped')
  }
  return statusMap[status] || status
}

// 打开输出目录
async function openOutputDirectory() {
  try {
    if (window.electronAPI) {
      // 打开固定的输出目录，具体路径由后端实现
      await window.electronAPI.ArtifyLab.openOutputFolder()
    } else {
      showError('electronNotAvailable')
    }
  } catch (error) {
    console.error('打开输出目录失败:', error)
    showError('openOutputDirectoryFailed')
  }
}

// 处理自动关闭计算机
async function handleAutoShutdown() {
  try {
    // 添加关闭日志
    executionLogs.value.unshift({
      time: new Date().toLocaleTimeString(),
      message: t('shutdownInProgress'),
      type: 'info'
    })

    // 调用关闭API
    await shutdown()

    // 显示成功消息
    showSuccess('shutdownSuccess')

    // 添加成功日志
    executionLogs.value.unshift({
      time: new Date().toLocaleTimeString(),
      message: t('shutdownSuccess'),
      type: 'success'
    })
  } catch (error) {
    console.error('自动关闭计算机失败:', error)
    showError('shutdownFailed')
    executionLogs.value.unshift({
      time: new Date().toLocaleTimeString(),
      message: t('shutdownFailed'),
      type: 'error'
    })
  }
}

async function shutdown() {
  const response = await fetch(`${appStore.config.serverHost}/api/shutdown`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      delay: 30,
      force: true
    }),
  })

  if (!response.ok) {
    throw new Error('Shutdown request failed')
  }

  return response.json()
}

async function unloadModel() {
  const response = await fetch(`${appStore.config.comfyHost}/free`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "unload_models": true,
      "free_memory": true
    })
  })

  if (!response.ok) {
    throw new Error('UnloadModel failed')
  }
}

// 监听文件上传变化
watch(uploadedFiles, (files) => {
  if (files.length > 0) {
    const file = files[0]
    handleFileUpload(file.originFileObj)
  }
})

// 监听文件过滤变化
watch(fileFilter, () => {
  if (directoryFiles.value.length > 0) {
    // 如果当前选择的过滤器类型没有文件，自动切换到"all"
    if (fileFilter.value !== 'all' && fileCounts.value[fileFilter.value] === 0) {
      fileFilter.value = 'all'
    }
    generateBatchDataFromFiles()
  }
})

onMounted(() => {
  init()
})

// 离开页面前自动停止执行
onBeforeUnmount(() => {
  if (isExecuting.value) {
    // 页面离开时静默停止，不显示提示信息
    isExecuting.value = false
    executionProgress.status = 'exception'
    executionProgress.strokeColor = '#ef4444'
    executionProgress.currentItem = ''

    // 如果有electronAPI，尝试停止后端执行
    if (window.electronAPI) {
      window.electronAPI.ArtifyLab.stopExecution().catch(error => {
        console.error('页面离开时停止执行失败:', error)
      })
    }
  }
})

// 在应用ID变更后自动加载对应历史记录
watch(historyKey, (newKey) => {
  if (newKey) {
    ensureHistoryLoaded()
  }
})
</script>

<style lang="less" scoped>
.page-container {
  width: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100vh;
  padding: 24px;
  color: #e2e8f0;
}

.page-header {
  text-align: center;
  margin-bottom: 10px;

  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 12px;
    font-family: 'Orbitron', sans-serif;
  }

  .page-description {
    font-size: 1.1rem;
    color: #94a3b8;
    max-width: 600px;
    margin: 0 auto;
  }
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.steps-container {
  margin-bottom: 40px;

  :deep(.ant-steps-item-title) {
    color: #e2e8f0;
  }

  :deep(.ant-steps-item-description) {
    color: #94a3b8;
  }

  :deep(.ant-steps-item-process .ant-steps-item-icon) {
    background: #0ea5e9;
    border-color: #0ea5e9;
  }

  :deep(.ant-steps-item-finish .ant-steps-item-icon) {
    background: #10b981;
    border-color: #10b981;
  }
}

.step-content {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(56, 70, 102, 0.4);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: #e2e8f0;
}

// 来源选择样式
.source-selection {
  .source-types {
    margin-bottom: 32px;

    .source-type-group {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .source-type-btn {
      flex: 1;
      min-width: 200px;
      height: 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(15, 23, 42, 0.8);
      border: 2px solid rgba(56, 70, 102, 0.6);
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        border-color: #0ea5e9;
        background: rgba(14, 165, 233, 0.1);
      }

      &.ant-radio-button-wrapper-checked {
        border-color: #0ea5e9;
        background: rgba(14, 165, 233, 0.2);
        color: #0ea5e9;
      }
    }
  }
}

.source-config {
  .config-item {
    margin-bottom: 24px;

    .config-label {
      display: block;
      font-weight: 500;
      margin-bottom: 8px;
      color: #e2e8f0;
    }
  }
}

.directory-selector {
  display: flex;
  gap: 12px;
  align-items: center;

  .path-input {
    flex: 1;
  }
  .path-btn {
    display: flex;
    align-items: center;
  }
}



.file-preview {
  margin-top: 16px;

    .file-preview-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    gap: 16px;

    h4 {
      margin: 0;
      color: #e2e8f0;
      flex-shrink: 0;
    }

    .file-filter {
      flex: 1;
      min-width: 0;

      :deep(.ant-radio-group) {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;

        .ant-radio-button-wrapper {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(56, 70, 102, 0.6);
          color: #94a3b8;
          border-radius: 6px;
          margin-right: 0;
          font-size: 0.8rem;
          min-width: auto;

          &:hover {
            color: #e2e8f0;
            border-color: #0ea5e9;
          }

          &.ant-radio-button-wrapper-checked {
            background: rgba(14, 165, 233, 0.2);
            border-color: #0ea5e9;
            color: #0ea5e9;
          }
        }
      }
    }
  }

  .file-list {
    max-height: 200px;
    overflow-y: auto;
    background: rgba(15, 23, 42, 0.4);
    border-radius: 8px;
    padding: 12px;
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 6px;
    margin-bottom: 4px;

    &:hover {
      background: rgba(14, 165, 233, 0.1);
    }

    .anticon {
      font-size: 1.1rem;

            // 图片文件图标颜色
      &.anticon-picture {
        color: #10b981;
      }

      // 视频文件图标颜色
      &.anticon-video-camera {
        color: #ef4444;
      }

      // 音频文件图标颜色
      &.anticon-sound {
        color: #8b5cf6;
      }

      // PDF文件图标颜色
      &.anticon-file-pdf {
        color: #ef4444;
      }

      // Word文件图标颜色
      &.anticon-file-word {
        color: #3b82f6;
      }

      // Excel文件图标颜色
      &.anticon-file-excel {
        color: #10b981;
      }

      // PowerPoint文件图标颜色
      &.anticon-file-ppt {
        color: #f59e0b;
      }

      // 文本文件图标颜色
      &.anticon-file-text {
        color: #8b5cf6;
      }

      // 普通文件图标颜色
      &.anticon-file {
        color: #94a3b8;
      }

      // 文件夹图标颜色
      &.anticon-folder {
        color: #f59e0b;
      }
    }

    .file-name {
      font-weight: 500;
      color: #e2e8f0;
      min-width: 120px;
    }

    .file-path {
      color: #94a3b8;
      font-size: 0.9rem;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-size {
      color: #64748b;
      font-size: 0.8rem;
      min-width: 60px;
      text-align: right;
    }
  }

  .more-files {
    text-align: center;
    color: #94a3b8;
    font-style: italic;
    padding: 8px;
  }
}

.file-upload {
  .uploaded-file {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: rgba(15, 23, 42, 0.4);
    border-radius: 6px;
    margin-top: 8px;
    .remove-file-btn {
      &:hover {
        color: #ef4444;
        cursor: pointer;
      }
    }
  }
  .upload-btn {
    display: flex;
    align-items: center;
  }
}

.file-format-hint {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 0.9rem;
}

.json-editor-container {
  height: 300px;
  border: 1px solid rgba(56, 70, 102, 0.6);
  border-radius: 8px;
  overflow: hidden;

  .json-editor {
    height: 100%;
  }
}

.json-hint {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 0.9rem;
}

.data-preview {
  margin-top: 24px;

  h4 {
    margin-bottom: 12px;
    color: #e2e8f0;
  }

  .preview-table {
    background: rgba(15, 23, 42, 0.4);
    border-radius: 8px;
    overflow: hidden;
  }

  .preview-table-component {
    :deep(.ant-table) {
      background: transparent;
    }

    :deep(.ant-table-thead > tr > th) {
      background: rgba(15, 23, 42, 0.8);
      color: #e2e8f0;
      border-bottom: 1px solid rgba(56, 70, 102, 0.6);
    }

    :deep(.ant-table-tbody > tr > td) {
      background: transparent;
      color: #e2e8f0;
      border-bottom: 1px solid rgba(56, 70, 102, 0.3);
    }

    :deep(.ant-table-tbody > tr:hover > td) {
      background: rgba(14, 165, 233, 0.1);
    }
  }

  .more-data {
    text-align: center;
    color: #94a3b8;
    font-style: italic;
    padding: 12px;
  }
}

// 映射样式
.mapping-container {
  .mapping-layout {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 32px;
    align-items: start;
  }

  .mapping-section-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: #e2e8f0;
  }
}

.mapping-source {
  .data-source-list {
    max-height: 500px;
    overflow-y: auto;
  }

  .data-field-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(56, 70, 102, 0.4);
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: grab;
    transition: all 0.3s ease;

    &:hover {
      border-color: #0ea5e9;
      background: rgba(14, 165, 233, 0.1);
    }

    &:active {
      cursor: grabbing;
    }

    .field-icon {
      color: #0ea5e9;
      font-size: 1.2rem;
    }

    .field-info {
      flex: 1;

      .field-name {
        font-weight: 500;
        color: #e2e8f0;
      }

      .field-key {
        font-size: 0.9rem;
        color: #94a3b8;
      }
    }

    .field-preview {
      font-size: 0.8rem;
      color: #64748b;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.mapping-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
}

.mapping-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 16px;
}

.drag-tip-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  animation: dragTipFadeIn 1.2s ease;
  margin-left: 16px;
}
.drag-tip-icon {
  font-size: 1rem;
  color: #38bdf8;
  animation: dragTipPulse 1.5s infinite;
}
.drag-tip-text {
  color: #38bdf8;
  font-size: 0.9rem;
  font-weight: 500;
  text-shadow: 0 1px 4px #0004;
}
@keyframes dragTipPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@keyframes dragTipFadeIn {
  from { opacity: 0; transform: translateY(10px);}
  to { opacity: 1; transform: translateY(0);}
}

.mapping-target {
  .target-inputs-list {
    max-height: 500px;
    overflow-y: auto;
  }

  .target-input-item {
    padding: 16px;
    background: rgba(15, 23, 42, 0.6);
    border: 2px dashed rgba(56, 70, 102, 0.4);
    border-radius: 8px;
    margin-bottom: 12px;
    transition: all 0.3s ease;
    min-height: 80px;

    &.has-mapping {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }

    .input-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .input-icon {
        color: #f59e0b;
        font-size: 1.2rem;
      }

      .input-info {
        flex: 1;

        .input-label {
          font-weight: 500;
          color: #e2e8f0;
        }

        .input-key {
          font-size: 0.9rem;
          color: #94a3b8;
        }
      }
    }

    .mapping-display {
      .mapped-field {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(16, 185, 129, 0.2);
        border: 1px solid rgba(16, 185, 129, 0.4);
        border-radius: 6px;
        color: #10b981;

        .remove-mapping {
          margin-left: auto;
          color: #ef4444;

          &:hover {
            background: rgba(239, 68, 68, 0.1);
          }
        }
      }
    }

    .drop-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #94a3b8;
      font-size: 0.9rem;
      height: 60px;
      border: 2px dashed rgba(56, 70, 102, 0.4);
      border-radius: 6px;

      .anticon {
        font-size: 1.5rem;
      }
    }
  }
}

// 执行样式
.execution-container {


  .execution-preview {
    margin-bottom: 32px;

    h4 {
      margin-bottom: 16px;
      color: #e2e8f0;
    }

    .preview-summary {
      background: rgba(15, 23, 42, 0.4);
      border-radius: 8px;
      padding: 16px;

      .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(56, 70, 102, 0.3);

        &:last-child {
          border-bottom: none;
        }

        .summary-label {
          color: #94a3b8;
        }

        .summary-value {
          font-weight: 500;
          color: #e2e8f0;
        }
      }
    }
  }

  .execution-settings {
    margin-bottom: 32px;

    h4 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 16px;
      color: #e2e8f0;
    }

    .settings-form {
      .setting-item {
        display: flex;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 16px;

        .setting-label {
          font-weight: 500;
          color: #e2e8f0;
          min-width: 150px;
        }

        .slider-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;

          .start-index-slider {
            :deep(.ant-slider) {
              .ant-slider-rail {
                background: rgba(56, 70, 102, 0.3);
              }

              .ant-slider-track {
                background: #0ea5e9;
              }

              .ant-slider-handle {
                border-color: #0ea5e9;
                background: #0ea5e9;

                &:hover {
                  border-color: #0284c7;
                  background: #0284c7;
                }

                &:focus {
                  border-color: #0284c7;
                  background: #0284c7;
                  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
                }
              }

              &.ant-slider-disabled {
                .ant-slider-rail {
                  background: rgba(56, 70, 102, 0.1);
                }

                .ant-slider-track {
                  background: #64748b;
                }

                .ant-slider-handle {
                  border-color: #64748b;
                  background: #64748b;
                }
              }
            }

            :deep(.ant-slider-tooltip) {
              .ant-tooltip-inner {
                background: rgba(15, 23, 42, 0.9);
                color: #e2e8f0;
                border: 1px solid rgba(56, 70, 102, 0.6);
              }

              .ant-tooltip-arrow::before {
                background: rgba(15, 23, 42, 0.9);
                border: 1px solid rgba(56, 70, 102, 0.6);
              }
            }
          }

          .slider-info {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            font-size: 0.9rem;
            color: #e2e8f0;

            .slider-value {
              font-weight: 600;
              color: #0ea5e9;
            }

            .slider-separator {
              color: #94a3b8;
            }

            .slider-total {
              color: #94a3b8;
            }
          }
        }

        .setting-hint {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-left: 10px;
        }
      }
    }
  }

  .execution-progress {
    margin-bottom: 32px;

    h4 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 16px;
      color: #e2e8f0;
    }

    .progress-container {
      background: rgba(15, 23, 42, 0.4);
      border-radius: 8px;
      padding: 16px;
    }

    .progress-bar {
      margin-bottom: 16px;

      :deep(.ant-progress) {
        .ant-progress-outer {
          // background: rgba(56, 70, 102, 0.3);
          border-radius: 5px;
        }

        .ant-progress-inner {
          background: rgba(56, 70, 102, 0.3);
          border-radius: 5px;
        }

        .ant-progress-bg {
          border-radius: 5px;
        }

        .ant-progress-text {
          color: #e2e8f0;
          font-weight: 500;
        }
      }
    }

    .progress-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
      color: #e2e8f0;
      font-size: 0.9rem;

      .progress-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        padding: 12px 0;
        border-bottom: 1px solid rgba(56, 70, 102, 0.3);

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;

          .stat-label {
            color: #94a3b8;
            font-size: 0.8rem;
            margin-bottom: 4px;
          }

          .stat-value {
            font-weight: 600;
            font-size: 1.1rem;

            &.success {
              color: #10b981;
            }
            &.error {
              color: #ef4444;
            }
          }
        }
      }

      .progress-current {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;

        .current-label {
          color: #94a3b8;
          font-weight: 500;
        }

        .current-value {
          font-weight: 500;
          color: #e2e8f0;
          max-width: 60%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .execution-logs {
    margin-bottom: 32px;

    h4 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 16px;
      color: #e2e8f0;
    }

    .logs-container {
      background: rgba(15, 23, 42, 0.4);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(56, 70, 102, 0.4);

      .logs-header {
        display: flex;
        justify-content: flex-end;
        padding: 12px 16px;
        background: rgba(15, 23, 42, 0.8);
        border-bottom: 1px solid rgba(56, 70, 102, 0.6);

        .clear-logs-btn {
          color: #94a3b8;
          font-size: 0.9rem;

          &:hover {
            color: #e2e8f0;
          }
        }
      }

      .logs-content {
        max-height: 300px;
        overflow-y: auto;
        padding: 12px 16px;
      }

      .log-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 0;
        font-size: 0.9rem;
        color: #e2e8f0;

        &.info {
          color: #94a3b8;
        }
        &.success {
          color: #10b981;
        }
        &.error {
          color: #ef4444;
        }

        .log-time {
          font-weight: 500;
          color: #94a3b8;
        }

        .log-message {
          flex: 1;
          word-break: break-all;
        }
      }
    }
  }

  .execution-actions {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;

    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    .output-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      padding-top: 16px;
      border-top: 1px solid rgba(56, 70, 102, 0.3);
      width: 100%;
    }

    .execute-btn {
      height: 48px;
      padding: 0 32px;
      font-size: 1.1rem;
      font-weight: 500;
      display: flex;
      align-items: center;
    }

    .stop-btn {
      height: 48px;
      padding: 0 32px;
      font-size: 1.1rem;
      font-weight: 500;
      display: flex;
      align-items: center;
    }

    .open-output-btn {
      height: 48px;
      padding: 0 32px;
      font-size: 1.1rem;
      font-weight: 500;
      display: flex;
      align-items: center;
    }
  }
}

// 步骤导航
.step-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;

  .nav-btn {
    min-width: 120px;
    display: flex;
    align-items: center;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }

  .page-title {
    font-size: 2rem;
  }

  .mapping-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .mapping-center {
    display: none;
  }

  .source-type-group {
    flex-direction: column;
  }

  .source-type-btn {
    min-width: auto;
  }

    .file-preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .file-filter {
      width: 100%;

      :deep(.ant-radio-group) {
        justify-content: flex-start;
        gap: 2px;

        .ant-radio-button-wrapper {
          font-size: 0.75rem;
          padding: 2px 6px;
        }
      }
    }
  }

  .execution-progress {
    .progress-details {
      .progress-stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .progress-current {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;

        .current-value {
          max-width: 100%;
        }
      }
    }
  }

  .execution-settings {
    .settings-form {
      .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;

        .setting-label {
          min-width: auto;
        }

        .slider-container {
          width: 100%;
        }
      }
    }
  }

  .auto-shutdown-config {
    .shutdown-toggle {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .shutdown-switch {
      align-self: flex-start;
    }
  }

  .execution-actions {
    .action-buttons {
      flex-direction: column;
      width: 100%;
    }

    .output-actions {
      width: 100%;
    }

    .execute-btn,
    .stop-btn,
    .open-output-btn {
      width: 100%;
    }
  }
}

/* 新增美化样式 */
.custom-stats-row {
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
}
.stat-card {
  flex: 1;
  background: rgba(30,41,59,0.7);
  border-radius: 10px;
  padding: 16px 0;
  text-align: center;
  box-shadow: 0 2px 8px #0002;
}
.stat-label {
  color: #94a3b8;
  font-size: 0.95rem;
  margin-bottom: 6px;
}
.stat-value {
  font-size: 1.6rem;
  font-weight: bold;
  color: #e2e8f0;
}
.stat-card.success .stat-value { color: #10b981; }
.stat-card.error .stat-value { color: #ef4444; }

.custom-progress-bar {
  position: relative;
  height: 28px;
  background: linear-gradient(90deg, #334155 0%, #64748b 100%);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 18px;
}
.custom-progress-inner {
  height: 100%;
  transition: width 0.4s cubic-bezier(.4,2,.6,1);
  border-radius: 14px 0 0 14px;
}
.custom-progress-text {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  color: #fff;
  font-weight: bold;
  line-height: 28px;
  font-size: 1.1rem;
  text-shadow: 0 1px 4px #0008;
}

.current-item-highlight {
  background: linear-gradient(90deg, #0ea5e9 0%, #8b5cf6 100%);
  color: #fff;
  border-radius: 8px;
  padding: 10px 18px;
  margin-bottom: 18px;
  font-weight: 500;
  font-size: 1.05rem;
  box-shadow: 0 2px 8px #0002;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.current-item-content {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  margin-left: 8px;
}

.custom-log-list {
  list-style: none;
  padding: 0;
  margin: 0 0 18px 0;
  max-height: 220px;
  overflow-y: auto;
  background: rgba(30,41,59,0.5);
  border-radius: 8px;
  box-shadow: 0 2px 8px #0001;
}
.custom-log-list li {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 14px;
  font-size: 0.98rem;
  border-bottom: 1px solid #33415544;
}
.custom-log-list li:last-child { border-bottom: none; }
.custom-log-list .log-time { color: #94a3b8; font-size: 0.92em; min-width: 60px; }
.custom-log-list .log-message { flex: 1; }
.custom-log-list .info { color: #38bdf8; }
.custom-log-list .success { color: #10b981; }
.custom-log-list .error { color: #ef4444; }

.custom-actions {
  display: flex;
  gap: 18px;
  margin-top: 18px;
  justify-content: center;
}
.btn-primary, .btn-danger, .btn-default {
  border: none;
  border-radius: 8px;
  padding: 12px 28px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px #0002;
}
.btn-primary {
  background: linear-gradient(90deg, #0ea5e9 0%, #8b5cf6 100%);
  color: #fff;
}
.btn-primary:hover { background: linear-gradient(90deg, #0284c7 0%, #7c3aed 100%); }
.btn-danger {
  background: linear-gradient(90deg, #ef4444 0%, #f59e42 100%);
  color: #fff;
}
.btn-danger:hover { background: linear-gradient(90deg, #dc2626 0%, #fbbf24 100%); }
.btn-default {
  background: #334155;
  color: #e2e8f0;
}
.btn-default:hover { background: #475569; }

.native-slider-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 18px 0 24px 0;
  padding: 12px 10px;
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
}

.native-slider-label {
  font-weight: 500;
  color: #38bdf8;
  font-size: 1.08rem;
  min-width: 100px;
}

.native-slider {
  flex: 1;
  accent-color: #38bdf8;
  height: 4px;
  border-radius: 4px;
  background: linear-gradient(90deg, #38bdf8 0%, #8b5cf6 100%);
  outline: none;
  transition: background 0.3s;
  margin: 0 8px;
}
.native-slider:disabled {
  opacity: 0.5;
  background: #64748b;
  accent-color: #64748b;
  cursor: not-allowed;
}
.native-slider-value {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  color: #8b5cf6;
  font-size: 1.08rem;
  min-width: 80px;
  text-align: right;
}

/* 自动关闭计算机配置样式 */
.auto-shutdown-config {
  margin: 18px 0 24px 0;
  padding: 16px 18px;
  background: rgba(255,255,255,0.04);
  border-radius: 12px;
  border: 1px solid rgba(56, 70, 102, 0.3);
}

.shutdown-toggle {
  display: flex;
  align-items: center;
  gap: 16px;
}

.shutdown-switch {
  :deep(.ant-switch) {
    background: rgba(56, 70, 102, 0.6);
    border-color: rgba(56, 70, 102, 0.8);
  }

  :deep(.ant-switch-checked) {
    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
    border-color: #10b981;
  }

  :deep(.ant-switch-handle) {
    background: #e2e8f0;
    border-radius: 50%;
  }

  :deep(.ant-switch-checked .ant-switch-handle) {
    background: #ffffff;
  }
}

.shutdown-info {
  flex: 1;
}

.shutdown-label {
  font-weight: 600;
  color: #e2e8f0;
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.shutdown-description {
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.4;
}

.shutdown-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 10px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  color: #f59e0b;
  font-size: 0.85rem;
  line-height: 1.3;
}

.shutdown-note-icon {
  font-size: 0.9rem;
  flex-shrink: 0;
}

.shutdown-status {
  margin-top: 12px;
  display: flex;
  align-items: center;
}

.shutdown-status-tag {
  :deep(.ant-tag) {
    background: rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.4);
    color: #10b981;
    font-weight: 500;
    padding: 4px 12px;
    border-radius: 6px;
  }
}

/* 执行记录弹窗美化 */
.history-dialog {
  .history-empty {
    color: #94a3b8;
    text-align: center;
    padding: 24px 0;
  }
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .history-item {
    background: rgba(30,41,59,0.65);
    border: 1px solid rgba(56, 70, 102, 0.5);
    border-radius: 12px;
    padding: 14px;
    box-shadow: 0 4px 10px #0003;
    transition: border-color .2s, transform .2s;
    &:hover {
      border-color: #0ea5e9;
      transform: translateY(-1px);
    }
  }
  .history-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    .title {
      display: flex;
      align-items: center;
      gap: 10px;
      .name {
        font-weight: 600;
        color: #e2e8f0;
        font-size: 1.02rem;
      }
      .status {
        padding: 2px 8px;
        border-radius: 20px;
        font-size: 12px;
        text-transform: capitalize;
        border: 1px solid transparent;
        &.running { background: rgba(14,165,233,0.15); color: #38bdf8; border-color: #38bdf833; }
        &.completed { background: rgba(16,185,129,0.15); color: #10b981; border-color: #10b98133; }
        &.failed { background: rgba(239,68,68,0.15); color: #ef4444; border-color: #ef444433; }
        &.stopped { background: rgba(245,158,11,0.15); color: #f59e0b; border-color: #f59e0b33; }
      }
    }
    .meta {
      display: flex;
      gap: 12px;
      color: #94a3b8;
      font-size: 12px;
    }
  }
  .history-body {
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      color: #cbd5e1;
      font-size: 13px;
      margin-bottom: 8px;
    }
    .logs {
      background: rgba(15,23,42,0.45);
      border: 1px solid rgba(56, 70, 102, 0.5);
      border-radius: 8px;
      padding: 8px;
      .log { color: #94a3b8; }
    }
  }
  .mini-progress {
    position: relative;
    height: 8px;
    background: rgba(51,65,85,0.6);
    border-radius: 6px;
    overflow: hidden;
    margin: 6px 0 10px 0;
    .mini-progress-inner {
      height: 100%;
      background: linear-gradient(90deg, #0ea5e9 0%, #8b5cf6 100%);
      transition: width .35s ease;
    }
    .mini-progress-text {
      position: absolute;
      right: 8px;
      top: -18px;
      font-size: 12px;
      color: #94a3b8;
    }
  }
  .history-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 10px;
  }
}
</style>
