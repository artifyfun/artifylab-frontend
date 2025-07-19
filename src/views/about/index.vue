<template>
  <div class="page-container">
    <div class="container">
      <div class="header">
        <h1>{{ t('aiPaintingWorkflowPlatform') }}</h1>
        <p class="subtitle">{{ t('exploreAICreationPossibilities') }}</p>
      </div>
      <button class="btn pulse" @click="handleToggleAboutModal">
        <i class="fas fa-qrcode"></i> {{ t('followOfficialAccountForWorkflows') }}
      </button>
    </div>

    <About v-if="state.showAboutModal" @clickClose="handleToggleAboutModal" />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import About from '@/components/About/index.vue'
import { t } from '@/utils/i18n'

const state = reactive({
  showAboutModal: false
})

const handleToggleAboutModal = () => {
  state.showAboutModal = !state.showAboutModal
}

</script>

<style lang="less" scoped>
.page-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #e0e0ff;
  padding: 20px;

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .container {
    max-width: 1000px;
    text-align: center;
  }

  .header {
    margin-bottom: 40px;
  }

  h1 {
    font-size: 3.5rem;
    background: linear-gradient(90deg, #00dbde, #fc00ff);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 15px rgba(128, 0, 255, 0.3);
    margin-bottom: 20px;
    letter-spacing: 2px;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #a0a0ff;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .btn {
    background: linear-gradient(45deg, #6a11cb, #2575fc);
    color: white;
    border: none;
    padding: 15px 40px;
    font-size: 1.2rem;
    border-radius: 30px;
    cursor: pointer;
    margin-top: 30px;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(37, 117, 252, 0.4);
    position: relative;
    overflow: hidden;
    letter-spacing: 1px;
    font-weight: 600;
  }

  .btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(37, 117, 252, 0.6);
  }

  .btn:active {
    transform: translateY(1px);
  }

  .btn::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -60%;
    width: 20px;
    height: 200%;
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(25deg);
    transition: all 0.6s;
  }

  .btn:hover::after {
    left: 120%;
  }
}
</style>
