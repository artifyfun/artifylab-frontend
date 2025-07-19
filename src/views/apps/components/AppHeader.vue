<template>
  <header class="relative px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
    <div class="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <!-- 左侧标题 -->
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-3 cursor-pointer" @click="toggleAboutModal">
          <div class="flex justify-center items-center w-10 h-10 rounded-lg">
            <img src="/favicon_rmbg.png" alt="" />
          </div>
          <h1 class="text-2xl font-bold text-white tech-font">
            Artify<span class="text-tech-blue">{{ currentLang === 'zh' ? '工坊' : 'Lab' }}</span>
          </h1>
        </div>
      </div>

      <!-- 右侧操作 -->
      <div class="flex items-center space-x-4">
        <!-- 桌面端导航 -->
        <nav class="flex space-x-6" v-if="isElectron">
          <router-link
            to="/market"
            class="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            <i class="mr-2 fas fa-store"></i>
            {{ t('market') }}
          </router-link>
        </nav>
        <!-- 语言切换 -->
        <button
          v-if="isElectron"
          @click="toggleLanguage"
          class="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 text-slate-300 hover:text-white hover:bg-slate-800/50"
        >
          <i class="mr-2 fas fa-globe"></i>
          {{ currentLang === 'zh' ? 'EN' : '中文' }}
        </button>

        <!-- 关于按钮 -->
        <button
          @click="toggleAboutModal"
          class="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 text-slate-300 hover:text-white hover:bg-slate-800/50"
        >
          <i class="mr-2 fas fa-info-circle"></i>
          {{ t('about') }}
        </button>

        <!-- 设置按钮 -->
        <button
          v-if="isElectron"
          @click="toggleConfigModal"
          class="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 text-slate-300 hover:text-white hover:bg-slate-800/50"
        >
          <i class="mr-2 fas fa-cog"></i>
          {{ t('settings') }}
        </button>
      </div>
    </div>

    <!-- About 组件 -->
    <About v-if="showAboutModal" @clickClose="toggleAboutModal" />

    <!-- 配置组件 -->
    <Config
      v-if="showConfigModal"
      @cancel="toggleConfigModal"
      @confirm="handleUpdateConfig"
    />
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useI18nInComponent } from '@/utils/i18n'
import { useAppStore } from '@/stores/appStore'
import About from '@/components/About/index.vue'
import Config from '@/components/Config/index.vue'
import { isElectron } from '@/utils'

const { t, currentLang } = useI18nInComponent()
const appStore = useAppStore()

// 模态框状态
const showAboutModal = ref(false)
const showConfigModal = ref(false)

// 切换关于模态框
const toggleAboutModal = () => {
  showAboutModal.value = !showAboutModal.value
}

// 切换配置模态框
const toggleConfigModal = () => {
  showConfigModal.value = !showConfigModal.value
}

// 切换语言
const toggleLanguage = () => {
  const newLang = appStore.config.lang === 'zh' ? 'en' : 'zh'
  appStore.updateConfig({ lang: newLang })
}

// 处理配置更新
const handleUpdateConfig = async (config) => {
  await appStore.updateConfig(config)
  showConfigModal.value = false
}
</script>

<style scoped>
.tech-font {
  font-family: 'Orbitron', sans-serif;
}
</style>
