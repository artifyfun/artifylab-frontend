<template>
  <div class="comfyui-playground">
    <iframe v-if="state.url" ref="iframe" style="width: 100%; height: 100%" :src="state.url" frameborder="0"></iframe>
  </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted, ref } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { uuidv4, getRenderComponent } from '@/utils'

const emit = defineEmits(['onload', 'updateParamsNodes'])

const appStore = useAppStore()

const state = reactive({
  url: null
})

const iframe = ref(null)

const init = async () => {
  await appStore.initConfig()
  state.url = `${appStore.config.comfyHost}?artify_inject=readonly`
}
init()

const postMessage = (message) => {
  iframe.value.contentWindow.postMessage(message, '*')
}

const loadGraphData = (graphData) => {
  const message = JSON.stringify({
    eventType: 'loadGraphData',
    data: graphData
  })
  postMessage(message)
  return new Promise((resolve) => {
    const handler = (event) => {
      const { eventType } = JSON.parse(event.data)
      if (eventType === 'loadGraphData') {
        resolve()
        window.removeEventListener('message', handler)
      }
    }
    window.addEventListener('message', handler)
  })
}

const updatePrompt = () => {
  const message = JSON.stringify({
    eventType: 'updatePrompt'
  })
  postMessage(message)
  return new Promise((resolve) => {
    const handler = (event) => {
      const { eventType, data } = JSON.parse(event.data)
      if (eventType === 'updatePrompt') {
        resolve(data)
        window.removeEventListener('message', handler)
      }
    }
    window.addEventListener('message', handler)
  })
}

const updateParamsNodes = (paramsNodes) => {
  const message = JSON.stringify({
    eventType: 'updateParamsNodes',
    data: paramsNodes
  })
  postMessage(message)
}

const handleMessage = (event) => {
  const { eventType, data } = JSON.parse(event.data)
  if (eventType === 'updateParamsNodes') {
    const paramsNodes = data.map((node) => {
      return {
        ...node,
        description: node.description || '',
        renderComponent: node.renderComponent || getRenderComponent(node),
        key: node.key || uuidv4()
      }
    })
    emit('updateParamsNodes', paramsNodes)
  }
  if (eventType === 'updatePrompt') {
    emit('updatePrompt', data.output)
  }
  if (eventType === 'onload') {
    emit('onload')
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})

defineExpose({
  postMessage,
  loadGraphData,
  updatePrompt,
  updateParamsNodes
})
</script>

<style scoped lang="less">
.comfyui-playground {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
