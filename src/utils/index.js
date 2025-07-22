import { message } from 'ant-design-vue'
import { t } from '@/utils/i18n'

export async function getElectronConfig() {
  let config
  try {
    config = await window.electronAPI.ArtifyLab.getConfig()
  } catch (_e) {
    // console.log(_e)
  }
  return config
}

export const isElectron = !!window.electronAPI

export const getAppInfo = async () => {
  let appInfo
  try {
    appInfo = await window.electronAPI.ArtifyLab.getAppInfo()
  } catch (_e) {
    // console.log(_e)
  }
  return appInfo
}

export function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (a) =>
    (a ^ ((Math.random() * 16) >> (a / 4))).toString(16),
  )
}

export function getRandomColor() {
  return `#${`00000${((Math.random() * 0x1000000) << 0).toString(16)}`.substr(-6)}`
}

function serializer(replacer, cycleReplacer) {
  var stack = [],
    keys = []

  if (cycleReplacer == null)
    cycleReplacer = function (key, value) {
      if (stack[0] === value) return '[Circular ~]'
      return '[Circular ~.' + keys.slice(0, stack.indexOf(value)).join('.') + ']'
    }

  return function (key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this)
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
    } else stack.push(value)

    return replacer == null ? value : replacer.call(this, key, value)
  }
}

export function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
}

export function loadCssCode(code, window) {
  const { document } = window
  const style = document.createElement('style')
  style.type = 'text/css'
  style.rel = 'stylesheet'
  style.appendChild(document.createTextNode(code))
  const head = document.getElementsByTagName('head')[0]
  head.appendChild(style)
}

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  message.success(t('copySuccess'))
}

export function downloadJSON(data, filename) {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function formatDate(date) {
  if (!date) return ''

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function throttle(func, limit) {
  let inThrottle
  return function () {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validateUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function generateRandomId() {
  return Math.random().toString(36).substr(2, 9)
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map((item) => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

export function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search)
  return params.get(key)
}

// 应用分类枚举
export const APP_CATEGORIES = {
  IMAGE_GENERATION: 'imageGeneration',
  TEXT_PROCESSING: 'textProcessing',
  SPEECH_RECOGNITION: 'speechRecognition',
  DATA_ANALYSIS: 'dataAnalysis',
  INTELLIGENT_ASSISTANT: 'intelligentAssistant',
}

// 应用级别枚举
export const APP_POWER_LEVELS = {
  BASIC: 'basic',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  PROFESSIONAL: 'professional',
}

// 通用错误提示函数，支持i18n
export function showError(key, params = {}) {
  message.error(t(key, params))
}

// 通用成功提示函数，支持i18n
export function showSuccess(key, params = {}) {
  message.success(t(key, params))
}

// 通用警告提示函数，支持i18n
export function showWarning(key, params = {}) {
  message.warning(t(key, params))
}

// 通用信息提示函数，支持i18n
export function showInfo(key, params = {}) {
  message.info(t(key, params))
}

/*
使用示例：

// 基本错误提示
showError('networkError')
showError('serverError')
showError('unknownError')

// 带参数的错误提示
showError('workflowSaveFailed', { error: '连接超时' })

// 成功提示
showSuccess('saveSuccess')
showSuccess('importSuccess', { count: 5 })

// 警告提示
showWarning('permissionDenied')

// 信息提示
showInfo('loading')

// 在组件中使用
import { showError, showSuccess } from '@/utils'

// 在方法中调用
try {
  // 某些操作
  showSuccess('saveSuccess')
} catch (error) {
  showError('operationFailed')
}
*/

export const getRenderComponent = (node) => {
  const { category, type, selectedWidget } = node

  switch (category) {
    case 'input': {
      switch (selectedWidget.type) {
        case 'customtext':
        case 'string':
        case 'text': {
          return 'textarea'
        }
        case 'toggle': {
          return 'switch'
        }
        case 'slider': {
          return 'slider'
        }
        case 'number': {
          return 'input-number'
        }
        case 'combo': {
          if (type === 'LoadImage' && selectedWidget.name === 'image') {
            return 'image-uploader'
          } else if (type === 'LoadAudio' && selectedWidget.name === 'audio') {
            return 'audio-uploader'
          } else if (type === 'LoadVideo' && selectedWidget.name === 'file') {
            return 'video-uploader'
          } else {
            return 'select'
          }
        }
        default: {
          return null
        }
      }
    }
    case 'output': {
      switch (selectedWidget.type) {
        case 'SaveImage':
        case 'Save Images Mikey': {
          return 'post-image'
        }
        case 'SaveAudio': {
          return 'audio'
        }
        case 'SaveVideo': {
          return 'video'
        }
        default: {
          return 'text'
        }
      }
    }
  }
}

// 创建图像 URL（支持 POST 请求）
const createImageUrl = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Image load failed:', error)
  }
}

export async function previewImageFullscreen(url) {
  const imageUrl = await createImageUrl(url)
  // 检查是否已存在预览层
  if (document.getElementById('fullscreen-preview')) {
    return;
  }

  // 创建样式（如果尚未添加）
  if (!document.getElementById('fullscreen-preview-styles')) {
    const style = document.createElement('style');
    style.id = 'fullscreen-preview-styles';
    style.textContent = `
          .fullscreen-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.95);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10000;
              cursor: pointer;
              opacity: 0;
              animation: fadeIn 0.3s forwards;
          }

          @keyframes fadeIn {
              to { opacity: 1; }
          }

          .fullscreen-image-container {
              max-width: 95%;
              max-height: 95%;
              position: relative;
              cursor: default;
          }

          .fullscreen-image {
              max-width: 100%;
              max-height: 90vh;
              object-fit: contain;
              box-shadow: 0 5px 30px rgba(0,0,0,0.5);
              border-radius: 8px;
              transform: scale(0.95);
              animation: zoomIn 0.4s 0.2s forwards;
          }

          @keyframes zoomIn {
              to { transform: scale(1); }
          }

          .close-button {
              position: fixed;
              top: 25px;
              right: 25px;
              width: 50px;
              height: 50px;
              background: rgba(255, 255, 255, 0.15);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              z-index: 10001;
              transition: all 0.3s;
              backdrop-filter: blur(5px);
              border: 1px solid rgba(255,255,255,0.1);
          }

          .close-button:hover {
              background: rgba(255, 255, 255, 0.25);
              transform: rotate(90deg);
          }

          .close-button::before,
          .close-button::after {
              content: '';
              position: absolute;
              width: 25px;
              height: 2px;
              background: white;
          }

          .close-button::before {
              transform: rotate(45deg);
          }

          .close-button::after {
              transform: rotate(-45deg);
          }

          @media (max-width: 768px) {
              .close-button {
                  top: 15px;
                  right: 15px;
                  width: 40px;
                  height: 40px;
              }

              .close-button::before,
              .close-button::after {
                  width: 20px;
              }
          }
      `;
    document.head.appendChild(style);
  }

  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.id = 'fullscreen-preview';
  overlay.className = 'fullscreen-overlay';

  // 创建图片容器
  const imageContainer = document.createElement('div');
  imageContainer.className = 'fullscreen-image-container';

  // 创建图片元素
  const image = new Image();
  image.src = imageUrl;
  image.className = 'fullscreen-image';
  image.alt = 'preview';

  // 创建关闭按钮
  const closeButton = document.createElement('div');
  closeButton.className = 'close-button';
  closeButton.title = 'close';

  // 组装元素
  imageContainer.appendChild(image);
  overlay.appendChild(imageContainer);
  overlay.appendChild(closeButton);
  document.body.appendChild(overlay);

  // 添加滚动锁定
  document.body.style.overflow = 'hidden';

  // 关闭函数
  const closePreview = () => {
    overlay.style.animation = 'none';
    overlay.style.opacity = '1';
    overlay.style.animation = 'fadeOut 0.3s forwards';

    // 添加淡出动画
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.textContent = `
          @keyframes fadeOut {
              to { opacity: 0; }
          }
      `;
    document.head.appendChild(fadeOutStyle);

    setTimeout(() => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
      document.head.removeChild(fadeOutStyle);

      // 移除事件监听器
      closeButton.removeEventListener('click', closePreview);
      overlay.removeEventListener('click', handleOverlayClick);
      window.removeEventListener('keydown', handleKeyDown);
    }, 300);
  };

  // 点击遮罩层关闭（排除图片和按钮）
  const handleOverlayClick = (e) => {
    if (e.target === overlay) {
      closePreview();
    }
  };

  // 键盘支持（ESC键关闭）
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      closePreview();
    }
  };

  // 添加事件监听
  closeButton.addEventListener('click', closePreview);
  overlay.addEventListener('click', handleOverlayClick);
  window.addEventListener('keydown', handleKeyDown);

  // 移动端滑动关闭支持
  let startY = 0;
  overlay.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  }, { passive: true });

  overlay.addEventListener('touchend', (e) => {
    const endY = e.changedTouches[0].clientY;
    const diffY = endY - startY;
    // 快速向下滑动关闭（超过50px）
    if (diffY > 50) {
      closePreview();
    }
  }, { passive: true });
}

export function getSeed(n) {
  let num = ''
  for (let i = 0; i < n; i++) {
    if (i === 0) {
      num += Math.floor(Math.random() * 9 + 1)
    } else {
      num += Math.floor(Math.random() * 10)
    }
  }
  return Number(num)
}

export function getFile(url, filename) {
  fetchFile({ url, filename, method: 'GET' })
}

export function postFile(url, filename) {
  fetchFile({ url, filename, method: 'POST' })
}

export async function fetchFile({ url, filename, method }) {
  try {
    // 1. 使用fetch发送POST请求
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json' // 根据实际API调整
      },
      body: method === 'POST' ? JSON.stringify({}) : undefined // 如果API需要参数，在此处添加
    });

    // 2. 检查请求是否成功
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }

    // 3. 获取Blob数据
    const blob = await response.blob();

    // 4. 创建临时下载链接
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'download.jpg'; // 默认文件名

    // 5. 触发下载
    document.body.appendChild(link);
    link.click();

    // 6. 清理资源
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error('图片下载失败:', error);
    throw error; // 可根据需求改为友好提示
  }
}

// 提示框生成函数
export function createGlassAlert(message, title = '提示') {
  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      animation: fadeIn 0.4s forwards;
      backdrop-filter: blur(4px);
  `;

  // 创建玻璃拟态弹窗
  const alertBox = document.createElement('div');
  alertBox.style.cssText = `
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(12px);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(2, 8, 32, 0.4);
      width: 90%;
      max-width: 500px;
      overflow: hidden;
      border: 1px solid rgba(56, 70, 102, 0.4);
      transform: translateY(20px);
      opacity: 0;
      animation: slideIn 0.4s 0.1s forwards;
  `;

  // 创建标题栏
  const header = document.createElement('div');
  header.style.cssText = `
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(56, 70, 102, 0.4);
  `;

  const titleEl = document.createElement('h3');
  titleEl.style.cssText = `
      font-size: 1.4rem;
      color: #f8fafc;
      font-weight: 600;
      margin: 0;
  `;
  titleEl.textContent = title;

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = ``;
  closeBtn.style.cssText = `
      background: rgba(56, 70, 102, 0.5);
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      color: #94a3b8;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
  `;
  closeBtn.onmouseenter = () => {
    closeBtn.style.background = 'rgba(239, 68, 68, 0.8)';
    closeBtn.style.color = 'white';
  };
  closeBtn.onmouseleave = () => {
    closeBtn.style.background = 'rgba(56, 70, 102, 0.5)';
    closeBtn.style.color = '#94a3b8';
  };

  // 创建内容区域
  const content = document.createElement('div');
  content.style.cssText = `
      padding: 30px 20px;
      font-size: 1.1rem;
      line-height: 1.6;
      color: #e2e8f0;
      text-align: center;
  `;
  content.textContent = message;

  // 创建操作按钮
  const actions = document.createElement('div');
  actions.style.cssText = `
      padding: 20px;
      display: flex;
      justify-content: center;
      border-top: 1px solid rgba(56, 70, 102, 0.4);
  `;

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Ok';
  confirmBtn.style.cssText = `
      background: linear-gradient(to right, #0ea5e9, #6366f1);
      color: white;
      border: none;
      padding: 12px 40px;
      font-size: 1rem;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
      font-weight: 500;
  `;
  confirmBtn.onmouseenter = () => {
    confirmBtn.style.transform = 'translateY(-2px)';
    confirmBtn.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.6)';
  };
  confirmBtn.onmouseleave = () => {
    confirmBtn.style.transform = 'translateY(0)';
    confirmBtn.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.4)';
  };

  // 添加关闭功能
  const closeAlert = () => {
    alertBox.style.animation = 'slideOut 0.3s forwards';
    overlay.style.animation = 'fadeOut 0.3s forwards';

    setTimeout(() => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
    }, 300);
  };

  closeBtn.onclick = closeAlert;
  confirmBtn.onclick = closeAlert;

  // 组装元素
  header.appendChild(titleEl);
  header.appendChild(closeBtn);
  actions.appendChild(confirmBtn);

  alertBox.appendChild(header);
  alertBox.appendChild(content);
  alertBox.appendChild(actions);
  overlay.appendChild(alertBox);

  // 添加全局样式
  if (!document.getElementById('glass-alert-styles')) {
    const style = document.createElement('style');
    style.id = 'glass-alert-styles';
    style.textContent = `
          @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
          }
          @keyframes fadeOut {
              from { opacity: 1; }
              to { opacity: 0; }
          }
          @keyframes slideIn {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideOut {
              from { transform: translateY(0); opacity: 1; }
              to { transform: translateY(20px); opacity: 0; }
          }
      `;
    document.head.appendChild(style);
  }

  // 添加到文档并阻止背景滚动
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}
