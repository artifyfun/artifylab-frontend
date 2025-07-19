<template>
  <div class="theme-demo">
    <a-card title="主题色演示" class="demo-card">
      <template #extra>
        <a-switch v-model:checked="isDark" @change="toggleTheme">
          <template #checkedChildren>🌙</template>
          <template #unCheckedChildren>☀️</template>
        </a-switch>
      </template>
      
      <div class="demo-section">
        <h3>按钮样式</h3>
        <div class="button-group">
          <a-button type="primary" class="tech-glow">主要按钮</a-button>
          <a-button type="primary" ghost>幽灵按钮</a-button>
          <a-button type="default">默认按钮</a-button>
          <a-button type="dashed">虚线按钮</a-button>
          <a-button type="text">文本按钮</a-button>
          <a-button type="link">链接按钮</a-button>
        </div>
      </div>

      <div class="demo-section">
        <h3>表单控件</h3>
        <div class="form-group">
          <a-input v-model:value="inputValue" placeholder="请输入内容" />
          <a-select v-model:value="selectValue" placeholder="请选择" style="width: 200px">
            <a-select-option value="option1">选项1</a-select-option>
            <a-select-option value="option2">选项2</a-select-option>
            <a-select-option value="option3">选项3</a-select-option>
          </a-select>
          <a-date-picker v-model:value="dateValue" />
        </div>
      </div>

      <div class="demo-section">
        <h3>数据展示</h3>
        <a-table :columns="columns" :data-source="dataSource" :pagination="false" />
      </div>

      <div class="demo-section">
        <h3>反馈组件</h3>
        <div class="feedback-group">
          <a-button @click="showMessage">消息提示</a-button>
          <a-button @click="showNotification">通知提醒</a-button>
          <a-button @click="showModal">模态框</a-button>
          <a-button @click="showDrawer">抽屉</a-button>
        </div>
      </div>

      <div class="demo-section">
        <h3>导航组件</h3>
        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="1" tab="标签页1">
            <p>标签页1的内容</p>
          </a-tab-pane>
          <a-tab-pane key="2" tab="标签页2">
            <p>标签页2的内容</p>
          </a-tab-pane>
          <a-tab-pane key="3" tab="标签页3">
            <p>标签页3的内容</p>
          </a-tab-pane>
        </a-tabs>
      </div>

      <div class="demo-section">
        <h3>数据输入</h3>
        <div class="input-group">
          <a-slider v-model:value="sliderValue" :min="0" :max="100" />
          <a-progress :percent="progressValue" />
          <a-switch v-model:checked="switchValue" />
        </div>
      </div>
    </a-card>

    <!-- 模态框 -->
    <a-modal
      v-model:open="modalVisible"
      title="主题色模态框"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <p>这是一个使用项目主题色的模态框</p>
    </a-modal>

    <!-- 抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      title="主题色抽屉"
      placement="right"
      width="400"
    >
      <p>这是一个使用项目主题色的抽屉</p>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message, notification } from 'ant-design-vue'
import { THEME_COLORS } from '@/utils/theme-utils'

// 响应式数据
const isDark = ref(false)
const inputValue = ref('')
const selectValue = ref('')
const dateValue = ref(null)
const activeTab = ref('1')
const sliderValue = ref(50)
const progressValue = ref(75)
const switchValue = ref(true)
const modalVisible = ref(false)
const drawerVisible = ref(false)

// 表格数据
const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
  },
]

const dataSource = [
  {
    key: '1',
    name: '张三',
    age: 32,
    address: '北京市朝阳区',
  },
  {
    key: '2',
    name: '李四',
    age: 42,
    address: '上海市浦东新区',
  },
  {
    key: '3',
    name: '王五',
    age: 28,
    address: '广州市天河区',
  },
]

// 方法
const toggleTheme = (checked) => {
  isDark.value = checked
  // 这里可以触发主题切换
  console.log('主题切换:', checked ? '暗色' : '亮色')
}

const showMessage = () => {
  message.success('这是一个成功消息！')
}

const showNotification = () => {
  notification.success({
    message: '成功',
    description: '这是一个成功通知！',
  })
}

const showModal = () => {
  modalVisible.value = true
}

const showDrawer = () => {
  drawerVisible.value = true
}

const handleModalOk = () => {
  modalVisible.value = false
  message.success('模态框已确认')
}

const handleModalCancel = () => {
  modalVisible.value = false
}
</script>

<style scoped>
.theme-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-card {
  margin-bottom: 20px;
}

.demo-section {
  margin-bottom: 30px;
}

.demo-section h3 {
  margin-bottom: 16px;
  color: var(--theme-primary);
  font-weight: 600;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.feedback-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-demo {
    padding: 16px;
  }
  
  .button-group,
  .form-group,
  .feedback-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-group > * {
    width: 100%;
  }
}
</style> 