<template>
  <div class="code-editor">
    <div ref="editorContainerRef" class="editor-container"></div>
  </div>
</template>

<script setup>
import { debounce } from 'lodash'
const monaco = ref(null)
import { ref, toRaw, onMounted, onBeforeUnmount, watch } from 'vue'

const emit = defineEmits(['change'])

const props = defineProps({
  value: {
    type: String,
  },
  language: {
    type: String,
    default: 'html',
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
})
const editorContainerRef = ref(null)
const editor = ref(null)

onMounted(async () => {
  monaco.value = await import('monaco-editor/esm/vs/editor/editor.main.js')
  editor.value = monaco.value.editor.create(editorContainerRef.value, {
    value: props.value,
    readOnly: props.readOnly,
    language: props.language,
    theme: 'vs-dark',
    selectOnLineNumbers: true,
    automaticLayout: true,
    renderSideBySide: false,
  })

  editor.value.onDidChangeModelContent(() => {
    emit('change', getEditorValue())
  })
})

// 监听 value 属性变化
watch(() => props.value, (newValue) => {
  if (editor.value && newValue !== getEditorValue()) {
    setEditorValue(newValue)
    if (props.readOnly) {
      scrollToBottom()
    }
  }
})

function getEditorValue() {
  return toRaw(editor.value).getValue()
}

const debounceSetValue = debounce(setEditorValue, 500)

function setEditorValue(code) {
  toRaw(editor.value).setValue(code)
}

function scrollToBottom() {
  toRaw(editor.value).revealLine(toRaw(editor.value).getModel()?.getLineCount() ?? 0)
}

defineExpose({
  getEditorValue,
  setEditorValue,
  debounceSetValue,
  scrollToBottom,
})

onBeforeUnmount(() => {
  if (editor.value) {
    toRaw(editor.value).dispose()
  }
})
</script>

<style lang="less" scoped>
.code-editor {
  width: 100%;
  height: 100%;
}
.editor-container {
  width: 100%;
  height: 100%;
}
</style>
