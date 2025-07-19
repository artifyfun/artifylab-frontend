<template>
  <div class="message-demo">
    <h2>错误提示函数演示</h2>
    
    <div class="demo-section">
      <h3>错误提示</h3>
      <div class="button-group">
        <a-button @click="showNetworkError" type="primary" danger>网络错误</a-button>
        <a-button @click="showServerError" type="primary" danger>服务器错误</a-button>
        <a-button @click="showUnknownError" type="primary" danger>未知错误</a-button>
        <a-button @click="showOperationFailed" type="primary" danger>操作失败</a-button>
      </div>
    </div>

    <div class="demo-section">
      <h3>应用相关错误提示</h3>
      <div class="button-group">
        <a-button @click="showConfigLoadFailed" type="primary" danger>配置加载失败</a-button>
        <a-button @click="showConfigSaveFailed" type="primary" danger>配置保存失败</a-button>
        <a-button @click="showAppsLoadFailed" type="primary" danger>应用列表加载失败</a-button>
        <a-button @click="showAddAppFailed" type="primary" danger>添加应用失败</a-button>
        <a-button @click="showRemoveAppFailed" type="primary" danger>删除应用失败</a-button>
        <a-button @click="showUpdateAppFailed" type="primary" danger>更新应用失败</a-button>
        <a-button @click="showImportAppsFailed" type="primary" danger>导入应用失败</a-button>
        <a-button @click="showGetAppFailed" type="primary" danger>获取应用失败</a-button>
      </div>
    </div>

    <div class="demo-section">
      <h3>成功提示</h3>
      <div class="button-group">
        <a-button @click="showSaveSuccess" type="primary">保存成功</a-button>
        <a-button @click="showCopySuccess" type="primary">复制成功</a-button>
        <a-button @click="showDownloadSuccess" type="primary">下载成功</a-button>
      </div>
    </div>

    <div class="demo-section">
      <h3>警告提示</h3>
      <div class="button-group">
        <a-button @click="showPermissionDenied" type="primary" ghost>权限不足</a-button>
        <a-button @click="showTimeoutError" type="primary" ghost>请求超时</a-button>
      </div>
    </div>

    <div class="demo-section">
      <h3>信息提示</h3>
      <div class="button-group">
        <a-button @click="showLoading" type="primary" ghost>加载中</a-button>
        <a-button @click="showAiWorking" type="primary" ghost>AI工作中</a-button>
      </div>
    </div>

    <div class="demo-section">
      <h3>带参数的提示</h3>
      <div class="button-group">
        <a-button @click="showWorkflowSaveFailed" type="primary" danger>工作流保存失败</a-button>
        <a-button @click="showImportSuccess" type="primary">导入成功</a-button>
      </div>
    </div>

    <div class="demo-section">
      <h3>测试所有提示</h3>
      <div class="button-group">
        <a-button @click="runAllTests" type="primary">运行所有测试</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { showError, showSuccess, showWarning, showInfo } from '@/utils'
import { runAllTests } from '@/utils/message-test'

// 错误提示演示
const showNetworkError = () => {
  showError('networkError')
}

const showServerError = () => {
  showError('serverError')
}

const showUnknownError = () => {
  showError('unknownError')
}

const showOperationFailed = () => {
  showError('operationFailed')
}

// 应用相关错误提示演示
const showConfigLoadFailed = () => {
  showError('configLoadFailed', { error: '网络连接超时' })
}

const showConfigSaveFailed = () => {
  showError('configSaveFailed', { error: '服务器拒绝访问' })
}

const showAppsLoadFailed = () => {
  showError('appsLoadFailed', { error: 'API 接口异常' })
}

const showAddAppFailed = () => {
  showError('addAppFailed', { error: '应用名称已存在' })
}

const showRemoveAppFailed = () => {
  showError('removeAppFailed', { error: '应用正在运行中' })
}

const showUpdateAppFailed = () => {
  showError('updateAppFailed', { error: '权限不足' })
}

const showImportAppsFailed = () => {
  showError('importAppsFailed', { error: '文件格式不支持' })
}

const showGetAppFailed = () => {
  showError('getAppFailed', { error: '应用不存在' })
}

// 成功提示演示
const showSaveSuccess = () => {
  showSuccess('saveSuccess')
}

const showCopySuccess = () => {
  showSuccess('copySuccess')
}

const showDownloadSuccess = () => {
  showSuccess('downloadSuccess')
}

// 警告提示演示
const showPermissionDenied = () => {
  showWarning('permissionDenied')
}

const showTimeoutError = () => {
  showWarning('timeoutError')
}

// 信息提示演示
const showLoading = () => {
  showInfo('loading')
}

const showAiWorking = () => {
  showInfo('aiWorking')
}

// 带参数的提示演示
const showWorkflowSaveFailed = () => {
  showError('workflowSaveFailed', { error: '连接超时' })
}

const showImportSuccess = () => {
  showSuccess('importSuccess', { count: 5 })
}

// 运行所有测试
const runAllTests = () => {
  runAllTests()
}
</script>

<style lang="less" scoped>
.message-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: 30px;
  
  h3 {
    margin-bottom: 15px;
    color: #333;
    font-size: 18px;
  }
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  
  .ant-btn {
    margin-bottom: 10px;
  }
}
</style> 