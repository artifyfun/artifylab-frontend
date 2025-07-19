<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-content">
        <div class="error-number">404</div>
        <h1 class="error-title">{{ t('pageNotFound') }}</h1>
        <p class="error-description">
          {{ t('pageNotFoundDescription') }}
        </p>
        <div class="error-actions">
          <button @click="goHome" class="btn-primary">
            {{ t('backToHome') }}
          </button>
          <!-- <button @click="goBack" class="btn-secondary">
            {{ t('goBack') }}
          </button> -->
        </div>
        <div class="error-suggestions">
          <h3>{{ t('youCanTry') }}</h3>
          <ul>
            <li>{{ t('checkUrlSpelling') }}</li>
            <li>{{ t('useNavigationMenu') }}</li>
            <li>{{ t('contactAdmin') }}</li>
          </ul>
        </div>
      </div>
      <div class="error-illustration">
        <div class="artwork">
          <div class="canvas">
            <div class="brush-stroke"></div>
            <div class="brush-stroke"></div>
            <div class="brush-stroke"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18nInComponent } from '@/utils/i18n'

const router = useRouter()
const { t } = useI18nInComponent()

const goHome = () => {
  router.push({
    path: '/',
  })
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1f 0%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Exo 2', sans-serif;
}

.error-container {
  max-width: 1200px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.error-content {
  color: #e2e8f0;
}

.error-number {
  font-size: 120px;
  font-weight: 900;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: 20px;
}

.error-title {
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
}

.error-description {
  font-size: 18px;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 32px;
}

.error-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(6, 182, 212, 0.3);
}

.btn-secondary {
  padding: 12px 24px;
  background: rgba(148, 163, 184, 0.1);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(148, 163, 184, 0.2);
  transform: translateY(-2px);
}

.error-suggestions h3 {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
}

.error-suggestions ul {
  list-style: none;
  padding: 0;
}

.error-suggestions li {
  padding: 8px 0;
  color: #94a3b8;
  position: relative;
  padding-left: 20px;
}

.error-suggestions li::before {
  content: '•';
  color: #06b6d4;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.error-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
}

.artwork {
  width: 400px;
  height: 400px;
  position: relative;
}

.canvas {
  width: 100%;
  height: 100%;
  background: rgba(148, 163, 184, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  position: relative;
  overflow: hidden;
}

.brush-stroke {
  position: absolute;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  border-radius: 50px;
  opacity: 0.6;
  animation: float 6s ease-in-out infinite;
}

.brush-stroke:nth-child(1) {
  width: 120px;
  height: 20px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.brush-stroke:nth-child(2) {
  width: 80px;
  height: 15px;
  top: 50%;
  right: 20%;
  animation-delay: 2s;
}

.brush-stroke:nth-child(3) {
  width: 100px;
  height: 18px;
  bottom: 30%;
  left: 30%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(5deg);
  }
  66% {
    transform: translateY(10px) rotate(-5deg);
  }
}

@media (max-width: 768px) {
  .error-container {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }

  .error-number {
    font-size: 80px;
  }

  .error-title {
    font-size: 28px;
  }

  .error-description {
    font-size: 16px;
  }

  .error-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .artwork {
    width: 300px;
    height: 300px;
  }
}
</style>
