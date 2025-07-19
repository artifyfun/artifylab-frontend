<template>
  <div class="about-modal">
    <div class="modal-mask">
      <div class="modal-container">
        <div class="close-btn" @click="handleClickClose">
          <i class="fas fa-times"></i>
        </div>

        <div class="modal-content">
          <div class="info-section">
            <h2>{{ t('aboutArtifyWorkshop') }}</h2>
            <p class="intro-text">
              {{ t('aboutIntro') }}
            </p>

            <div class="features">
              <div class="feature">
                <i class="fas fa-rocket"></i>
                <div>{{ t('dailyUpdates') }}</div>
              </div>
              <div class="feature">
                <i class="fas fa-cogs"></i>
                <div>{{ t('workflowAnalysis') }}</div>
              </div>
              <div class="feature">
                <i class="fas fa-palette"></i>
                <div>{{ t('professionalEffects') }}</div>
              </div>
              <div class="feature">
                <i class="fas fa-download"></i>
                <div>{{ t('exclusiveTemplates') }}</div>
              </div>
            </div>

            <div class="social-media">
              <!-- <a
                href="https://weibo.com/yourprofile"
                target="_blank"
                rel="noopener"
                title="Weibo"
                class="social-icon"
              >
                <i class="fab fa-weibo"></i>
              </a>
              <a
                href="https://twitter.com/yourprofile"
                target="_blank"
                rel="noopener"
                title="Twitter"
                class="social-icon"
              >
                <i class="fab fa-twitter"></i>
              </a> -->
              <a
                href="https://github.com/artifyfun"
                target="_blank"
                rel="noopener"
                title="GitHub"
                class="social-icon"
              >
                <i class="fab fa-github"></i>
              </a>
              <a
                href="https://space.bilibili.com/1584901"
                target="_blank"
                rel="noopener"
                title="Bilibili"
                class="social-icon"
              >
                <i class="fab fa-bilibili"></i>
              </a>
            </div>
          </div>

          <div class="qrcode-section">
            <div class="wechat-name">{{ t('artifyWorkshop') }}</div>
            <div class="qrcode-box">
              <div class="qrcode-inner">
                <div class="qrcode-placeholder">
                  <img src="./ArtifyLab.jpg" style="width: 140px; height: 140px" :alt="t('artifyWorkshop')" />
                </div>
                <div class="qrcode-label">{{ t('scanToFollow') }}</div>
                <div class="qrcode-subtitle">{{ t('getAIWorkflowResources') }}</div>
              </div>
            </div>
          </div>
          <div v-if="appInfo && appInfo.version" class="version-update-row">
            <div class="app-version">
              Version: {{ appInfo.version }}
            </div>
            <button @click="showUpdateModal = true" class="check-update-btn">
              <i class="fas fa-sync-alt"></i>
              <span>{{ t('checkForUpdates') }}</span>
            </button>
          </div>
          <div class="license-info" style="width: 100%; color: #aaaaff; font-size: 0.95rem; text-align: right; margin-top: 10px;">
            <span v-html="copyrightText"></span>
          </div>
        </div>
      </div>
    </div>
    <!-- 更新Modal组件 -->
    <UpdateModal v-if="appInfo && appInfo.version" v-model:show="showUpdateModal" :appInfo="appInfo" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { t } from '@/utils/i18n'
import { getAppInfo } from '@/utils'
import UpdateModal from './UpdateModal.vue'

const appInfo = ref({ name: 'Artify' })

const showUpdateModal = ref(false)

const emit = defineEmits(['clickClose'])

const handleClickClose = () => {
  emit('clickClose')
}

onMounted(async () => {
  appInfo.value = await getAppInfo()
})

const copyrightText = computed(() =>
  t('copyright', {
    license: `<a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" style="color: #40e0d0; text-decoration: underline;">${t('gplv3')}</a>`
  })
)
</script>

<script>
export default {
  name: 'AboutModal'
}
</script>

<style lang="less" scoped>
.about-modal {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #e0e0ff;
  padding: 20px;

  /* 弹窗样式 */
  .modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 20, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    backdrop-filter: blur(8px);
    overflow: hidden;
  }

  .modal-container {
    width: 90%;
    max-width: 800px;
    background: linear-gradient(145deg, #0d0b1f, #171236);
    border-radius: 20px;
    border: 1px solid rgba(64, 224, 208, 0.3);
    box-shadow:
      0 0 40px rgba(100, 100, 255, 0.2),
      inset 0 0 20px rgba(0, 255, 255, 0.1);
    position: relative;
    overflow: auto;
    padding: 40px;
    max-height: 100%;
  }

  .modal-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #00dbde, #fc00ff);
    box-shadow: 0 0 15px rgba(128, 0, 255, 0.7);
  }

  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(64, 224, 208, 0.3);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #40e0d0;
    font-size: 1.2rem;
    transition: all 0.3s ease;
  }

  .close-btn:hover {
    background: rgba(255, 0, 85, 0.3);
    transform: rotate(90deg);
  }

  .modal-content {
    display: flex;
    flex-wrap: wrap;
    gap: 40px;
    margin-top: 20px;
  }

  .info-section {
    flex: 1;
    min-width: 300px;
    text-align: left;
    padding: 20px;
  }

  .qrcode-section {
    flex: 0 0 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  h2 {
    font-size: 2.2rem;
    margin-bottom: 20px;
    background: linear-gradient(90deg, #00dbde, #fc00ff);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 10px rgba(128, 0, 255, 0.3);
  }

  .intro-text {
    line-height: 1.8;
    font-size: 1.1rem;
    color: #d0d0ff;
    margin-bottom: 30px;
    position: relative;
    padding-left: 20px;
  }

  .intro-text::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background: linear-gradient(180deg, #00dbde, #fc00ff);
    border-radius: 2px;
  }

  .highlight {
    color: #40e0d0;
    font-weight: 600;
  }

  .wechat-name {
    font-size: 1.8rem;
    font-weight: 700;
    color: #40e0d0;
    margin: 20px 0;
    text-align: center;
    text-shadow: 0 0 10px rgba(64, 224, 208, 0.7);
    letter-spacing: 1px;
  }

  .qrcode-box {
    width: 280px;
    height: 280px;
    background: linear-gradient(135deg, #0f0c29, #302b63);
    border: 1px solid rgba(64, 224, 208, 0.5);
    border-radius: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 30px rgba(64, 224, 208, 0.3);
  }

  .qrcode-box::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(transparent, #00dbde, transparent 30%);
    animation: rotate 4s linear infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  .qrcode-inner {
    position: relative;
    z-index: 2;
    background: #0d0b1f;
    width: 260px;
    height: 260px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 15px;
  }

  .qrcode-placeholder {
    width: 150px;
    height: 150px;
    background:
      linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%),
      linear-gradient(45deg, #1a1a1a 25%, #0a0a0a 25%, #0a0a0a 75%, #1a1a1a 75%);
    background-size: 10px 10px;
    background-position:
      0 0,
      5px 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #40e0d0;
    font-size: 1.5rem;
  }

  .qrcode-label {
    font-size: 1.3rem;
    color: #fff;
    text-align: center;
    font-weight: 600;
  }

  .qrcode-subtitle {
    color: #a0a0ff;
    font-size: 1rem;
  }

  .features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-top: 20px;
  }

  .feature {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .feature i {
    color: #00dbde;
    font-size: 1.2rem;
    margin-top: 3px;
  }

  .pulse {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(64, 224, 208, 0.7);
    }
    70% {
      box-shadow: 0 0 0 15px rgba(64, 224, 208, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(64, 224, 208, 0);
    }
  }

  .social-media {
    display: flex;
    gap: 20px;
    margin: 30px 0 0 0;
    justify-content: flex-start;

    .social-icon {
      color: #40e0d0;
      font-size: 2rem;
      transition: color 0.2s, transform 0.2s;
      text-decoration: none;

      &:hover {
        color: #fc00ff;
        transform: scale(1.15) rotate(-8deg);
      }
    }
  }

  .check-update-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 15px;
    background: linear-gradient(135deg, rgba(64, 224, 208, 0.2), rgba(252, 0, 255, 0.2));
    border: 1px solid rgba(64, 224, 208, 0.5);
    border-radius: 20px;
    color: #40e0d0;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  }

  .check-update-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  .check-update-btn:hover {
    background: linear-gradient(135deg, rgba(64, 224, 208, 0.3), rgba(252, 0, 255, 0.3));
    border-color: rgba(64, 224, 208, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(64, 224, 208, 0.3);
  }

  .check-update-btn:hover::before {
    left: 100%;
  }

  .check-update-btn i {
    font-size: 0.9rem;
    transition: transform 0.3s ease;
  }

  .check-update-btn:hover i {
    transform: rotate(180deg);
  }

  .check-update-btn span {
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  .version-update-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    margin: 15px 0;
    gap: 15px;
  }

  .app-version {
    color: #40e0d0;
    font-size: 1rem;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .modal-content {
      flex-direction: column;
    }

    .info-section,
    .qrcode-section {
      width: 100%;
    }

    h1 {
      font-size: 2.5rem;
    }

    .features {
      grid-template-columns: 1fr;
    }
  }
}
</style>
