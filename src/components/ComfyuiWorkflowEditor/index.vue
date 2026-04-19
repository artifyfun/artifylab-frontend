<template>
  <div class="comfyui-workflow-editor">
    <ComfyuiPlayground
      ref="playground"
      @onload="onload"
      @updatePrompt="updatePrompt"
      @updateParamsNodes="updateParamsNodes"
    />
    <ParamsManager :paramsNodes="editorState.paramsNodes" @postMessage="postMessage" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'

import ComfyuiPlayground from '../ComfyuiPlayground/index.vue'
import ParamsManager from '../ParamsManager/index.vue'

const props = defineProps(['template', 'name'])
const emit = defineEmits(['onload'])

const editorState = reactive({
  loading: false,
  paramsNodes: props.template.paramsNodes,
  prompt: {},
  workflow: null
})
const playground = ref(null)

const postMessage = (message) => {
  playground.value.postMessage(message)
}

const updatePrompt = (data) => {
  editorState.prompt = data.output
  editorState.workflow = data.workflow
}

const updateParamsNodes = (nodes) => {
  editorState.paramsNodes = nodes
}

const onload = async () => {
  playground.value.updateParamsNodes(props.template.paramsNodes)
  await playground.value.loadGraphData(props.template.workflow, props.name)
  await playground.value.updatePrompt()
  emit('onload')
  editorState.loading = false
}

const getData = async () => {
  await playground.value.updatePrompt()
  return {
    prompt: editorState.prompt,
    paramsNodes: editorState.paramsNodes,
    workflow: editorState.workflow || props.template.workflow
  }
}

// 监听 props.template 变化，自动同步 paramsNodes
watch(
  () => props.template,
  (newTemplate) => {
    editorState.paramsNodes = newTemplate.paramsNodes
  },
  { deep: true }
)

onMounted(() => {
  editorState.loading = true
})

defineExpose({
  editorState,
  getData,
})
</script>

<style scoped lang="less">
.comfyui-workflow-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .comfyui-playground {
    width: 100%;
    height: 100%;
    flex: 1;
  }

  .params-manager {
    width: 100%;
    height: 260px;
  }
}
</style>
