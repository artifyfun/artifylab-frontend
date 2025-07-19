import { reactive, ref, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import localforage from 'localforage'
import { ComfyUIClient } from '@artifyfun/comfy-ui-client'
import { getQueryParam, downloadJSON, previewImageFullscreen, uuidv4, getSeed, postImage } from '@/utils'

export default function useWorkflow() {
  const app = window.appTemplate
  const LAST_STATE_KEY = `workflows/state/${app.id}`

  const state = reactive({
    inputs: app.state.inputs,
    outputs: app.state.outputs,
    clientId: null,
    promptId: null,
    config: {
      ...app.config,
      serverHost: getQueryParam('server_origin') || app.config?.serverHost,
      comfyHost: getQueryParam('comfy_origin') || app.config?.comfyHost,
    },
    history: [],
    loading: false,
    executing: false,
    done: false,
    progress: 0,
    pending: 0,
    showHistoryModal: false,
  })

  const fetchOption = reactive({
    host: state.config.serverHost,
    method: 'post'
  })

  const loopGetStateTimerId = ref(0)

  const emitError = (message) => {
    state.loading = false
    state.executing = false
    state.progress = 0
    state.done = false
  }

  const nodes = Object.keys(app.template.prompt)
  const finishedNodes = ref([])

  const eventEmitter = (type, data) => {
    if (type === 'message') {
      const message = JSON.parse(data.toString())
      if (message.type === 'execution_start') {
        finishedNodes.value = []
        state.progress = 1
        state.promptId = message.data.prompt_id
      }
      if (message.type === 'execution_cached') {
        state.progress = Math.floor((message.data.nodes.length / nodes.length) * 100)
        finishedNodes.value.push(...message.data.nodes)
      }
      if (message.type === 'executing') {
        if (message.data.node === null) {
          state.progress = 100
        } else {
          if (!finishedNodes.value.some(item => item.id === message.data.node.id)) {
            finishedNodes.value.push(message.data.node)
            state.progress = Math.floor((finishedNodes.value.length / nodes.length) * 100)
          }
        }
      }
      if (message.type === 'progress') {
        const step =
          ((message.data.value / message.data.max) * 100 * 1) / nodes.length / message.data.max
        state.progress = Number((state.progress + step).toFixed(2))
      }
      state.executing = true
      state.done = false
    } else if (type === 'error') {
      emitError()
    }
  }

  const client = ref(null)

  const getClient = () => {
    if (!client.value) {
      client.value = new ComfyUIClient(state.config.comfyHost, state.clientId, eventEmitter)
    }
    return client.value
  }

  const uploadImage = (file) => {
    const client = getClient()
    return client.uploadImage(file, file.name, true)
  }

  function getQueueState() {
    const client = getClient()
    return client.getQueue(fetchOption)
  }

  function deleteQueue() {
    const client = getClient()
    return client.deleteQueue(state.promptId)
  }

  function interrupt() {
    const client = getClient()
    return client.interrupt()
  }

  function getHistoryByPromptId() {
    const client = getClient()
    return client.getHistory(fetchOption, state.promptId)
  }

  function getImageUrl(data, type) {
    if (type === 'output') {
      const { filename, subfolder } = data || {}
      return filename ? `${state.config.serverHost}/view?type=${type}&filename=${filename}&subfolder=${subfolder || ''}` : null
    }
    return data ? `${state.config.serverHost}/view?type=${type}&filename=${data}` : null
  }

  const getState = async () => {
    const res = await getQueueState()
    state.pending = res.queue_pending.length
    state.running = res.queue_running.length
  }

  const getOutputs = (prompt) => {
    return new Promise(async (resolve, reject) => {
      try {
        const client = getClient()
        await client.connect()
        const result = await client.getResult(fetchOption, prompt)
        resolve(result)
        await client.disconnect()
      } catch (error) {
        console.log(error)
        reject(error)
      }
    })
  }

  const handleSaveState = (e) => {
    const lastState = JSON.parse(JSON.stringify(state))
    localforage.setItem(LAST_STATE_KEY, lastState)
  }

  const handleResult = (res) => {
    const { outputs } = res
    const outputKeys = Object.keys(app.state.outputs)
    const response = {}
    Object.keys(outputs).forEach((key) => {
      if (outputKeys.includes(key)) {
        const imageUrls =
          outputs[key]?.images.filter((item) => item.type === 'output') || [];
        response[key] = imageUrls.length ? imageUrls[imageUrls.length - 1] : outputs[key]
      }
    })
    return response
  }

  const start = async () => {
    state.loading = true
    let response = null
    try {
      Object.keys(app.template.prompt).forEach((key) => {
        const item = app.template.prompt[key]
        if (typeof item.inputs?.seed === 'number') {
          item.inputs.seed = getSeed(15)
        }
      })
      Object.keys(state.inputs).forEach((key) => {
        Object.assign(app.template.prompt[key].inputs, state.inputs[key])
      })
      finishedNodes.value = []
      const res = await getOutputs(app.template.prompt)
      response = handleResult(res)
    } catch (e) {
      const message = `工作流执行失败: ${e.message}`
      emitError(message)
      throw new Error(message)
    }

    if (!response) {
      const message = '工作流执行失败: 未获取到输出数据'
      emitError(message)
      throw new Error(message)
    }
    // 缓存历史数据
    const newItem = JSON.parse(
      JSON.stringify({
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        inputs: state.inputs,
        outputs: response,
      }),
    )
    state.history.unshift(newItem)

    if (Object.keys(response).length) {
      Object.assign(state.outputs, response)
      state.progress = 100
    } else {
      state.progress = 0
    }
    state.executing = false
    state.loading = false
    state.done = true

    handleSaveState()

    return response
  }

  const stop = () => {
    const callback = () => {
      Object.assign(state, {
        loading: false,
        executing: false,
        progress: 0,
      })
    }
    if (state.promptId && state.executing) {
      interrupt().finally(callback)
    } else {
      deleteQueue().finally(callback)
    }
  }

  const getLastState = async () => {
    const lastState = (await localforage.getItem(LAST_STATE_KEY))
    if (lastState) {
      const needAssignKeys = ['promptId', 'clientId', 'inputs', 'outputs', 'history']
      needAssignKeys.forEach(key => {
        if (state[key] && typeof state[key] === 'object') {
          Object.assign(state[key], lastState[key])
        } else {
          state[key] = lastState[key]
        }
      })
    }

    state.clientId = state.clientId || uuidv4()

    if (state.promptId) {
      const lastHistoryResult = await getHistoryByPromptId()
      const res = lastHistoryResult[state.promptId] || { outputs: [] }
      const outputs = handleResult(res)
      if (Object.keys(outputs).length) {
        state.outputs = outputs
      }
    }
  }

  const removeHistory = async (item) => {
    const history = state.history
    const index = history.indexOf(item)
    if (index > -1) {
      history.splice(index, 1)
    }
  }

  // 处理图片上传
  const onUploadImageChange = async (event, id) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('文件大小不能超过10MB')
        return
      }
      const res = await uploadImage(file)
      state.inputs[id].image = res.name
    }
  }

  // 移除图片
  const removeImage = (id) => {
    state.inputs[id].image = ''
  }

  const downloadImage = (id) => {
    const data = state.outputs[id]
    const url = getImageUrl(data, 'output')
    postImage(url, data.filename)
  }

  const previewImage = async (id) => {
    const data = state.outputs[id]
    const url = getImageUrl(data, 'output')
    await previewImageFullscreen(url)
  }

  // 切换历史记录弹窗
  const toggleHistoryModal = () => {
    state.showHistoryModal = !state.showHistoryModal
  }

  // 处理历史记录项点击
  const onHistoryItemSelect = (item) => {
    Object.assign(state.inputs, item.inputs)
    Object.assign(state.outputs, item.outputs)
    state.showHistoryModal = false
  }

  const downloadWorkflow = () => {
    downloadJSON(app.template.workflow, app.name)
  }

  const loopGetState = async () => {
    clearTimeout(loopGetStateTimerId.value)
    getState()
    loopGetStateTimerId.value = setTimeout(() => {
      loopGetState()
    }, 5000)
  }

  const init = async () => {
    await getLastState()
    loopGetState()
    window.addEventListener('beforeunload', handleSaveState)
  }

  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    stop()
    clearTimeout(loopGetStateTimerId.value)
    handleSaveState()
    window.removeEventListener('beforeunload', handleSaveState)
  })

  return {
    state,
    onUploadImageChange,
    getImageUrl,
    downloadImage,
    previewImage,
    start,
    stop,
    removeImage,
    toggleHistoryModal,
    onHistoryItemSelect,
    removeHistory,
    downloadWorkflow,
  }
}
