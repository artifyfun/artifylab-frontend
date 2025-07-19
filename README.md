# Artify App Generator

<div align="center">

![Artify Logo](public/favicon.ico)

**让天下没有难做的AI应用，每个人都能体验AI的魅力**

[![Vue](https://img.shields.io/badge/Vue-3.5.13-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Ant Design Vue](https://img.shields.io/badge/Ant%20Design%20Vue-4.2.6-1890FF?logo=ant-design&logoColor=white)](https://antdv.com/)
[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

[English](./README.En.md) | [中文](#artifylab-frontend-1)

</div>

---

## 🌟 项目简介

Artify App Generator 是一个基于 Vue 3 和 ComfyUI 的 AI 应用生成平台，专注于 AI 绘画工作流研究和高质量应用分享。平台每日发布高效有趣的 AI 绘画应用，并详细解析其核心工作流程。

这里是该项目的前端工程，项目发布在我另一个仓库，请移步下载：https://github.com/artifyfun/desktop/releases/latest

### 🎯 核心价值

- **开源**: 让天下没有难做的AI应用，每个人都能体验AI的魅力

## ✨ 主要功能

### 🏠 AI 应用中心
- **📱 应用管理**: 创建、编辑、删除 AI 应用
- **🔧 工作流编辑**: 可视化 ComfyUI 工作流编辑器
- **💾 模板系统**: 保存和加载工作流模板
- **🔍 搜索筛选**: 智能搜索和分类筛选
![home.png](docs%2Fhome.png)

### ⚡ 工作流生成App
- **🖱️ 操作简单**: 可视化操作，鼠标点击提取工作流变量
- **🤖 自动化**: 使用大模型，不需要输入任何提示词，自动生成应用界面
- **🚀 一键运行**: 不用编译，生成即可运行
- **✏️ 随时修改**: 对界面不满意？随时修改源码，实时预览，AI辅助修改
![app_detail.png](docs%2Fapp_detail.png)
![edit_workflow.png](docs%2Fedit_workflow.png)
![edit_output.png](docs%2Fedit_output.png)
![select_app_style.png](docs%2Fselect_app_style.png)
![bf.png](docs%2Fbf.png)
![source_code_edit.png](docs%2Fsource_code_edit.png)


### 🏪 应用市场
- **🖼️ 应用浏览**: 网格布局展示 AI 应用
- **📥 一键安装**: 从市场安装应用到个人中心
- **🏷️ 分类筛选**: 按分类和难度筛选应用
![app_market.png](docs%2Fapp_market.png)

### 📊 批量处理
- **📈 Excel 导入**: 支持 Excel 文件批量导入
- **⚙️ 批量生成**: 批量处理 AI 图像生成
- **📈 进度跟踪**: 实时显示处理进度
- **📋 执行日志**: 查看执行日志
![batch_mode.png](docs%2Fbatch_mode.png)
![batch_mode_drag.png](docs%2Fbatch_mode_drag.png)
![batch_mode_exec.png](docs%2Fbatch_mode_exec.png)
![batch_mode_error.png](docs%2Fbatch_mode_error.png)

### ⚙️ 配置本地化
- **🔑 支持多种模型**: 通用的api封装，只需填入你的apiKey即可使用
- **🔒 数据安全**: 数据保存在本地，不担心泄露
![config.png](docs%2Fconfig.png)

### 🌐 应用分享
- **📡 公网分享**: 使用ngrok内网穿透，实现应用分享，手机也能访问
- **🔐 权限分配**: 分享出去的界面，只能运行，不能修改，关闭应用链接即刻失效
![share.png](docs%2Fshare.png)

### 🔄 自动更新
- **⬆️ 一键更新**: github release托管，应用更新无忧
- **📖 源码开源**: 无后门，源码开源
![check_update.png](docs%2Fcheck_update.png)
![about.png](docs%2Fabout.png)

### 🔄 模式切换
- **🔄 无缝切换**: 一键切换应用/工作流模式，自动加载应用工作流，原始功能完全不变
![origin_mode.png](docs%2Forigin_mode.png)

### 🎨 主题系统
- **🌈 多主题支持**: 科技风、现代风、经典风等多种主题
- **🔄 实时切换**: 支持主题实时切换
- **🎯 自定义样式**: 可自定义主题色彩和样式

### 🌍 国际化
- **🌐 中英文支持**: 完整的中英文双语支持
- **🔄 动态切换**: 运行时语言切换
- **🏠 本地化**: 界面元素完全本地化

## 🛠️ 技术栈

### 前端框架
- **Vue 3.5.13**: 渐进式 JavaScript 框架
- **Vite 6.2.4**: 下一代前端构建工具
- **Vue Router 4.5.0**: 官方路由管理器
- **Pinia 3.0.1**: 状态管理库

### UI 组件库
- **Ant Design Vue 4.2.6**: 企业级 UI 设计语言
- **Tailwind CSS 4.1.10**: 实用优先的 CSS 框架
- **VXE Table 4.13.37**: 高性能表格组件

### 开发工具
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Monaco Editor**: 代码编辑器
- **Less**: CSS 预处理器

### 核心依赖
- **@artifyfun/comfy-ui-client**: ComfyUI 客户端
- **Axios**: HTTP 客户端
- **Day.js**: 日期处理库
- **LocalForage**: 本地存储库

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- ComfyUI 服务器（可选，用于 AI 功能）

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/artifyfun/artifylab-frontend.git
cd artifylab-frontend

# 安装依赖
pnpm install
```

### 开发模式

```bash
# 启动开发服务器
pnpm dev
```

### 生产构建

```bash
# 构建应用
pnpm build

# 构建库文件
pnpm build:lib

```

### 代码质量

```bash
# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

## 📁 项目结构

```
artifylab-frontend/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 样式和资源文件
│   ├── components/        # 通用组件
│   │   ├── About/         # 关于页面组件
│   │   ├── CodeEditor/    # 代码编辑器
│   │   ├── ComfyuiPlayground/  # ComfyUI 游乐场
│   │   ├── Config/        # 配置组件
│   │   ├── HistoryModal/  # 历史记录模态框
│   │   ├── ParamsManager/ # 参数管理器
│   │   ├── PostImage/     # 图片发布组件
│   │   └── Preview/       # 预览组件 借鉴 deepsite
│   ├── controller/        # 控制器
│   ├── router/            # 路由配置
│   ├── stores/            # 状态管理
│   ├── utils/             # 工具函数
│   │   ├── comfyui-utils/ # ComfyUI 相关工具
│   │   └── styles/        # 主题样式
│   └── views/             # 页面组件
│       ├── apps/          # 应用中心
│       ├── market/        # 应用市场
│       ├── batch/         # 批量处理
│       └── web/           # Web 页面
└── scripts/               # 构建脚本
```

## 🎨 主题定制

### 主题配置

项目支持多种预设主题，可在 `src/utils/styles/` 目录下查看和修改：

- **科技风 (tech)**: 现代科技感设计
- **现代风 (modern)**: 简洁现代设计
- **经典风 (classic)**: 传统经典设计
- **极简风 (minimal)**: 极简主义设计
- **Gradio风 (gradio)**: Gradio 风格设计

### 自定义主题

```javascript
// 在 src/utils/theme-utils.js 中配置主题色
export const themeColors = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d'
}
```

## 🌍 国际化

### 添加新语言

1. 在 `src/utils/i18n.js` 中添加翻译
2. 更新语言切换逻辑
3. 测试所有界面元素

### 翻译键规范

```javascript
const translations = {
  zh: {
    // 通用操作
    save: '保存',
    cancel: '取消',
    // 应用相关
    app: '应用',
    center: '中心',
    // 更多翻译...
  },
  en: {
    // 对应英文翻译
  }
}
```

## 🔧 开发指南

### 组件开发规范

1. **文件命名**: 使用 PascalCase
2. **组件结构**: 模板、脚本、样式分离
3. **Props 定义**: 明确类型和默认值
4. **事件命名**: 使用 kebab-case

### 状态管理

使用 Pinia 进行状态管理：

```javascript
// stores/appStore.js
export const useAppStore = defineStore('app', {
  state: () => ({
    apps: [],
    currentApp: null
  }),
  actions: {
    addApp(app) {
      this.apps.push(app)
    }
  }
})
```

### API 集成

ComfyUI 客户端集成：

```javascript
import { ComfyClient } from '@artifyfun/comfy-ui-client'

const client = new ComfyClient({
  serverAddress: 'http://localhost:8188'
})
```

## 🤝 贡献指南

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- 使用 ESLint 和 Prettier 保持代码风格一致
- 遵循 Vue 3 Composition API 最佳实践
- 添加适当的注释和文档
- 编写单元测试（如果适用）


## 📄 开源协议与版权
- 本项目采用 GNU 通用公共许可证 v3.0 (GPLv3) 进行开源，您可以自由使用、修改和分发本项目，但需遵守以下条款：
- 署名：请在分发和衍生作品中保留原作者及项目来源信息。
- 相同协议：若修改或分发本项目，必须采用与本项目相同的 GPLv3 协议。
- 无担保：本项目以"按现状"方式提供，不对任何用途做出担保。
- 版权所有 © 2025 ArtifyFun。保留所有权利。

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - AI 工作流引擎
- [ComfyUI Desktop](https://github.com/Comfy-Org/desktop) - ComfyUI 桌面应用
- [Ant Design Vue](https://antdv.com/) - 企业级 UI 组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Deepsite](https://github.com/kiritoko1029/deepsite)

## 📞 联系我们

- 项目主页: [https://github.com/artifyfun/artifylab-frontend](https://github.com/artifyfun/artifylab-frontend)
- 问题反馈: [Issues](https://github.com/artifyfun/artifylab-frontend/issues)
- 功能建议: [Discussions](https://github.com/artifyfun/artifylab-frontend/discussions)

---

<div align="center">

**让 AI 创作变得简单，让每个人都能成为艺术家**

⭐ 如果这个项目对你有帮助，请给我们一个 Star！

</div>

---
