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

async function init() {
  await appStore.initConfig()
  const app = await appStore.getAppById(appStore.config.activeAppId)
  const fullCode = genHtml(app, appStore.config)
  previewProps.html = fullCode
  previewProps.lang = appStore.config.lang
}

init()
</script>

<style lang="less" scoped>
.page-container {
  height: 100%;
  width: 100%;
}
</style>
