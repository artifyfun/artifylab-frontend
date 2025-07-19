<template>
  <div class="history-modal">
    <transition name="fade">
      <div class="history-modal-mask" @click.self="handleClickClose">
        <transition name="slide">
          <div class="history-modal-card" v-if="props.workflow">
            <div class="history-modal-header">
              <h3 class="history-modal-title">
                {{ t('history') }}
              </h3>
              <button @click="handleClickClose" class="history-modal-close">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="history-modal-content">
              <div class="history-scroll-container">
                <div v-if="props.workflow.state.history.length === 0" class="empty-history">
                  <i class="empty-icon fas fa-inbox"></i>
                  <p>{{ t('noHistoryRecords') }}</p>
                </div>

                <div v-else class="history-grid">
                  <div
                    v-for="(item, index) in props.workflow.state.history"
                    :key="index"
                    class="history-item"
                  >
                    <div class="history-item-container">
                      <PostImage
                        :src="getHistoryUrl(item)"
                        alt="History output"
                        class="history-image"
                        @click="handleClickItem(item)"
                      />
                      <div class="history-item-actions">
                        <button
                          @click="handleRemoveItem(item)"
                          class="delete-button"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div class="history-item-meta">
                      <div class="history-date">
                        {{ item.createTime }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import PostImage from '@/components/PostImage/index.vue'

const props = defineProps({
  workflow: {
    type: Object
  }
})

const t = (key) => {
  return {
    zh: {
      history: '历史记录',
      noHistoryRecords: '暂无数据'
    },
    en: {
      history: 'history',
      noHistoryRecords: 'empty'
    },
  }[props.workflow.state.config.lang][key]
}

const handleClickClose = () => {
  props.workflow.toggleHistoryModal()
}

const handleClickItem = (item) => {
  props.workflow.onHistoryItemSelect(item)
}

const handleRemoveItem = (item) => {
  props.workflow.removeHistory(item)
}

const getHistoryUrl = (item) => {
  const imageKey = Object.keys(item.outputs).find(key => {
    if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].some(subfix => item.outputs[key]?.endsWith?.(subfix))) {
      return true
    }
    return false
  }) || Object.keys(item.outputs)[0]
  return props.workflow.getImageUrl(item.outputs[imageKey], 'output')
}

</script>

<style lang="less">
.history-modal {
  height: 100%;
  width: 100%;
  font-family: 'Exo 2', sans-serif;
  background: linear-gradient(135deg, #0a0f1f 0%, #0f172a 100%);
  min-height: 100vh;
  color: #e2e8f0;
  overflow-x: hidden;

  &-mask {
    display: flex;
    overflow: auto;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    z-index: 500;
    background-color: rgba(0, 0, 0, 0.7);
  }

  &-card {
    padding: 1.5rem;
    width: 100%;
    border-radius: 0.75rem;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(56, 70, 102, 0.4);
    box-shadow: 0 8px 32px rgba(2, 8, 32, 0.4);
    transition: all 0.3s ease;
    max-width: 90vw;
  }

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  &-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    margin: 0;
  }

  &-close {
    color: #94a3b8;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    transition: color 0.2s;

    &:hover {
      color: white;
    }
  }

  &-content {
    .history-scroll-container {
      padding: 1rem;
      overflow-y: auto;
      max-height: calc(90vh - 120px);
    }
  }

  .empty-history {
    padding: 3rem 0;
    text-align: center;
    color: #64748b;

    .empty-icon {
      font-size: 2.25rem;
      margin-bottom: 1rem;
      display: block;
    }
  }

  .history-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 1rem;

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 768px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .history-item {
    overflow: hidden;
    border-radius: 0.5rem;
    border: 1px solid #4b5563;
    transition: border-color 0.3s;
    background-color: rgba(55, 65, 81, 0.5);

    &:hover {
      border-color: #3b82f6;
    }
  }

  .history-item-container {
    position: relative;
  }
  .history-item-container:hover {
    .history-item-actions {
      opacity: 1;
    }
  }

  .history-image {
    object-fit: cover;
    width: 100%;
    height: 12rem;
    cursor: pointer;
  }

  .history-item-actions {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .delete-button {
    width: 1.5rem;
    height: 1.5rem;
    background-color: #ef4444;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #dc2626;
    }

    .fas {
      font-size: 0.75rem;
      color: white;
    }
  }

  .history-item-meta {
    padding: 0.75rem;
  }

  .history-date {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  // 动画效果
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .slide-enter-active {
    transition: all 0.3s ease-out;
  }

  .slide-leave-active {
    transition: all 0.3s ease-in;
  }

  .slide-enter-from,
  .slide-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }
}
</style>
