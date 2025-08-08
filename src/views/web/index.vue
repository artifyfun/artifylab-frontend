<template>
  <div class="page-container">
    <a-spin :spinning="appStore.isLoading">
      <Preview style="margin: 0;" v-bind="previewProps" />
    </a-spin>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import Preview from '@/components/Preview/index.vue'
import { genHtml } from '@/utils/genPrompt'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

const previewProps = reactive({
  html: '',
  showActions: false,
  lang: 'zh',
})

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

async function init() {
  await appStore.initConfig()
  const app = await appStore.getAppById(appStore.config.activeAppId)
  const fullCode = genHtml(app, app.code, appStore.config)
  previewProps.html = fullCode
  previewProps.lang = appStore.config.lang
  const lastAppId = sessionStorage.getItem('lastAppId')
  if (lastAppId && lastAppId !== appStore.config.activeAppId) {
    unloadModel()
  }
  sessionStorage.setItem('lastAppId', appStore.config.activeAppId)
}

init()
</script>

<style lang="less" scoped>
.page-container {
  height: 100%;
  width: 100%;
}
</style>
