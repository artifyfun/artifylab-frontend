import HistoryModal from '@/components/HistoryModal/index.vue'
import PostImage from '@/components/PostImage/index.vue'
import useWorkflow from '@/controller/useWorkflow.js'

// 为组件添加install方法
HistoryModal.install = (app) => {
  app.component('HistoryModal', HistoryModal)
}

PostImage.install = (app) => {
  app.component('PostImage', PostImage)
}

// 创建Vue插件
const ArtifyLib = {
  install(app) {
    app.component('HistoryModal', HistoryModal)
    app.component('PostImage', PostImage)
  }
}

// 导出插件作为默认导出
export default ArtifyLib

// 导出单个组件和composables
export {
  HistoryModal,
  PostImage,
  useWorkflow
}

// 导出插件安装方法
export { ArtifyLib }
