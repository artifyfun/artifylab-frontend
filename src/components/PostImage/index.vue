<template>
  <img
    v-bind="$attrs"
    :src="imageUrl"
    @load="handleLoad"
    @error="handleError"
  />
</template>

<script setup>
import { ref, watch, onUnmounted, defineEmits, defineProps } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: String,
  // 用于 POST 请求的数据
  postData: {
    type: [Object, null],
    default: () => ({})
  }
})

const emit = defineEmits(['load', 'error'])

const imageUrl = ref('')
const objectUrl = ref(null)

// 创建图像 URL（支持 POST 请求）
const createImageUrl = async () => {
  // 清理之前的 Object URL
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }

  try {
    const response = await fetch(props.src, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(props.postData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const blob = await response.blob()
    objectUrl.value = URL.createObjectURL(blob)
    imageUrl.value = objectUrl.value
  } catch (error) {
    console.error('Image load failed:', error)
    emit('error', error)
  }
}

// 监听 src 和 postData 的变化
watch(
  [() => props.src, () => props.postData],
  () => {
    createImageUrl()
  },
  { immediate: true }
)

// 处理加载事件
const handleLoad = (e) => {
  emit('load', e)
}

// 处理错误事件
const handleError = (e) => {
  emit('error', e)
}

// 组件卸载时清理资源
onUnmounted(() => {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
  }
})
</script>
