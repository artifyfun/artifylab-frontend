<template>
  <a-config-provider
    v-if="appStore.config"
    :locale="appStore.config.lang === 'zh' ? zhCN : enUS"
    :theme="createThemeConfig(appStore.config.theme !== 'light')"
    component-size="medium"
  >
    <a-app class="ant-app">
      <div class="app-container">
        <router-view />
        <a-float-button-group
          shape="square"
          :style="{
            right: '24px',
          }"
        >
          <a-tooltip v-if="router.currentRoute.value.path !== '/'">
            <template #title>{{ t('backToHome') }}</template>
            <a-float-button @click="backToHome">
              <template #icon>
                <HomeOutlined />
              </template>
            </a-float-button>
          </a-tooltip>
          <!-- <a-tooltip v-if="router.currentRoute.value.path === '/'">
            <template #title>{{ t('settings') }}</template>
            <a-float-button @click="state.showConfigModal = true">
              <template #icon>
                <SettingOutlined />
              </template>
            </a-float-button>
          </a-tooltip> -->
          <a-tooltip v-if="isElectron && appStore.config.comfyHost && router.currentRoute.value.path === '/'">
            <template #title>{{ t('comfyui') }}</template>
            <a-float-button @click="toComfyuiPage">
              <template #icon>
                <img src="/comfyui.png" alt="ComfyUI">
              </template>
            </a-float-button>
          </a-tooltip>
        </a-float-button-group>
        <Config
          v-if="state.showConfigModal"
          @cancel="state.showConfigModal = false"
          @confirm="handleUpdateConfig"
        />
      </div>
    </a-app>
  </a-config-provider>
</template>

<script setup>
import { reactive, provide, watch } from 'vue'
import { useRouter } from 'vue-router'
import { theme, Modal, notification, message } from 'ant-design-vue'
import { SettingOutlined, BulbOutlined, HomeOutlined } from '@ant-design/icons-vue'
import { useAppStore } from '@/stores/appStore'
import { isElectron } from '@/utils'
import { t, setLanguage, useI18n } from '@/utils/i18n'
import { createThemeConfig } from '@/utils/antd-theme'

import zhCN from 'ant-design-vue/es/locale/zh_CN'
import enUS from 'ant-design-vue/es/locale/en_US'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'

const router = useRouter()

const appStore = useAppStore()

const state = reactive({
  loading: false,
  showConfigModal: false,
})

// 提供i18n功能给子组件
const i18n = useI18n()
provide('i18n', i18n)

const initConfig = async () => {
  await appStore.initConfig()
  // 设置全局语言状态
  if (appStore.config && appStore.config.lang) {
    setLanguage(appStore.config.lang)
  }
}

// 监听语言变化
watch(() => appStore.config?.lang, (newLang) => {
  if (newLang) {
    dayjs.locale(appStore.config.lang === 'zh' ? 'zh-cn' : 'en')
    setLanguage(newLang)
  }
})

initConfig()

const handleUpdateConfig = async (config) => {
  await appStore.updateConfig(config)
  // 更新全局语言状态
  if (config.lang) {
    setLanguage(config.lang)
  }
  state.showConfigModal = false
}

const backToHome = () => {
  router.replace({
    path: '/',
  })
}

const toComfyuiPage = () => {
  window.electronAPI.ArtifyLab.loadComfyUI()
  // window.open(appStore.config.comfyHost)
}

</script>

<style>
#app {
  width: 100vw;
  height: 100vh;
}

.ant-app {
  width: 100%;
  height: 100%;
}

.app-container {
  width: 100%;
  height: 100%;
}
</style>
