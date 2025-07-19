
# Artify App Generator

<div align="center">

![Artify Logo](public/favicon.ico)

**Making AI applications accessible to everyone, letting everyone experience the charm of AI**

[![Vue](https://img.shields.io/badge/Vue-3.5.13-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Ant Design Vue](https://img.shields.io/badge/Ant%20Design%20Vue-4.2.6-1890FF?logo=ant-design&logoColor=white)](https://antdv.com/)
[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

[English](./README.En.md) | [中文](./README.md)

</div>

---

## 🌟 Project Overview

Artify App Generator is a Vue 3 and ComfyUI-based AI application generation platform, focusing on AI painting workflow research and high-quality application sharing. The platform publishes efficient and interesting AI painting applications daily and provides detailed analysis of core workflows.

This is the frontend project. The desktop application is published in another repository. Please download from: https://github.com/artifyfun/desktop/releases/latest

### 🎯 Core Values

- **Open Source**: Making AI applications accessible to everyone, letting everyone experience the charm of AI

## ✨ Key Features

### 🏠 AI Application Center
- **📱 App Management**: Create, edit, and delete AI applications
- **🔧 Workflow Editor**: Visual ComfyUI workflow editor
- **💾 Template System**: Save and load workflow templates
- **🔍 Search & Filter**: Intelligent search and category filtering
![home.png](docs%2Fhome.png)

### ⚡ Workflow-to-App Generation
- **🖱️ Simple Operation**: Visual operation, extract workflow variables with mouse clicks
- **🤖 Automation**: Use large language models, no need to input any prompts, automatically generate application interfaces
- **🚀 One-click Run**: No compilation needed, generate and run immediately
- **✏️ Edit Anytime**: Not satisfied with the interface? Modify source code anytime, real-time preview, AI-assisted modification
![app_detail.png](docs%2Fapp_detail.png)
![edit_workflow.png](docs%2Fedit_workflow.png)
![edit_output.png](docs%2Fedit_output.png)
![select_app_style.png](docs%2Fselect_app_style.png)
![bf.png](docs%2Fbf.png)
![source_code_edit.png](docs%2Fsource_code_edit.png)

### 🏪 Application Market
- **🖼️ App Browsing**: Grid layout display of AI applications
- **📥 One-click Install**: Install apps from market to personal center
- **🏷️ Category Filtering**: Filter apps by category and difficulty
![app_market.png](docs%2Fapp_market.png)

### 📊 Batch Processing
- **📈 Excel Import**: Support Excel file batch import
- **⚙️ Batch Generation**: Batch AI image generation
- **📈 Progress Tracking**: Real-time processing progress display
- **📋 Execution Logs**: View execution logs
![batch_mode.png](docs%2Fbatch_mode.png)
![batch_mode_drag.png](docs%2Fbatch_mode_drag.png)
![batch_mode_exec.png](docs%2Fbatch_mode_exec.png)
![batch_mode_error.png](docs%2Fbatch_mode_error.png)

### ⚙️ Local Configuration
- **🔑 Multi-model Support**: Universal API encapsulation, just fill in your API key to use
- **🔒 Data Security**: Data saved locally, no worries about leaks
![config.png](docs%2Fconfig.png)

### 🌐 Application Sharing
- **📡 Public Sharing**: Use ngrok for intranet penetration, enable application sharing, accessible from mobile devices
- **🔐 Permission Control**: Shared interfaces can only run, not modify, application links become invalid when closed
![share.png](docs%2Fshare.png)

### 🔄 Auto Updates
- **⬆️ One-click Update**: GitHub release hosting, worry-free application updates
- **📖 Open Source**: No backdoors, source code is open source
![check_update.png](docs%2Fcheck_update.png)
![about.png](docs%2Fabout.png)

### 🔄 Mode Switching
- **🔄 Seamless Switching**: One-click switch between app/workflow modes, automatically load app workflows, original functionality completely unchanged
![origin_mode.png](docs%2Forigin_mode.png)

### 🎨 Theme System
- **🌈 Multi-theme Support**: Tech, Modern, Classic, Minimal, and Gradio themes
- **🔄 Real-time Switching**: Support real-time theme switching
- **🎯 Custom Styling**: Customizable theme colors and styles

### 🌍 Internationalization
- **🌐 Bilingual Support**: Complete Chinese and English support
- **🔄 Dynamic Switching**: Runtime language switching
- **🏠 Localization**: Fully localized interface elements

## 🛠️ Technology Stack

### Frontend Framework
- **Vue 3.5.13**: Progressive JavaScript framework
- **Vite 6.2.4**: Next-generation frontend build tool
- **Vue Router 4.5.0**: Official router manager
- **Pinia 3.0.1**: State management library

### UI Component Library
- **Ant Design Vue 4.2.6**: Enterprise-level UI design language
- **Tailwind CSS 4.1.10**: Utility-first CSS framework
- **VXE Table 4.13.37**: High-performance table component

### Development Tools
- **ESLint**: Code quality checking
- **Prettier**: Code formatting
- **Monaco Editor**: Code editor
- **Less**: CSS preprocessor

### Core Dependencies
- **@artifyfun/comfy-ui-client**: ComfyUI client
- **Axios**: HTTP client
- **Day.js**: Date processing library
- **LocalForage**: Local storage library

## 🚀 Quick Start

### Requirements

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- ComfyUI server (optional, for AI features)

### Installation

```bash
# Clone the project
git clone https://github.com/artifyfun/artifylab-frontend.git
cd artifylab-frontend

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

### Production Build

```bash
# Build application
pnpm build

# Build library
pnpm build:lib
```

### Code Quality

```bash
# Code linting
pnpm lint

# Code formatting
pnpm format
```

## 📁 Project Structure

```
artifylab-frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Styles and resources
│   ├── components/        # Common components
│   │   ├── About/         # About page component
│   │   ├── CodeEditor/    # Code editor
│   │   ├── ComfyuiPlayground/  # ComfyUI playground
│   │   ├── ComfyuiWorkflowEditor/  # ComfyUI workflow editor
│   │   ├── Config/        # Configuration component
│   │   ├── HistoryModal/  # History modal
│   │   ├── MessageDemo/   # Message demo component
│   │   ├── ParamsManager/ # Parameter manager
│   │   ├── PostImage/     # Image posting component
│   │   ├── Preview/       # Preview component (from deepsite)
│   │   └── ThemeDemo/     # Theme demo component
│   ├── controller/        # Controllers
│   ├── router/            # Route configuration
│   ├── stores/            # State management
│   ├── utils/             # Utility functions
│   │   ├── comfyui-utils/ # ComfyUI utilities
│   │   └── styles/        # Theme styles
│   └── views/             # Page components
│       ├── apps/          # Application center
│       ├── market/        # Application market
│       ├── batch/         # Batch processing
│       └── web/           # Web pages
└── scripts/               # Build scripts
```

## 🎨 Theme Customization

### Theme Configuration

The project supports multiple preset themes, view and modify in `src/utils/styles/`:

- **Tech Theme**: Modern tech-inspired design
- **Modern Theme**: Clean modern design
- **Classic Theme**: Traditional classic design
- **Minimal Theme**: Minimalist design
- **Gradio Theme**: Gradio-style design

### Custom Themes

```javascript
// Configure theme colors in src/utils/theme-utils.js
export const themeColors = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d'
}
```

## 🌍 Internationalization

### Adding New Languages

1. Add translations in `src/utils/i18n.js`
2. Update language switching logic
3. Test all interface elements

### Translation Key Standards

```javascript
const translations = {
  zh: {
    // Common operations
    save: '保存',
    cancel: '取消',
    // App related
    app: '应用',
    center: '中心',
    // More translations...
  },
  en: {
    // Corresponding English translations
  }
}
```

## 🔧 Development Guide

### Component Development Standards

1. **File Naming**: Use PascalCase
2. **Component Structure**: Separate template, script, and styles
3. **Props Definition**: Clear types and default values
4. **Event Naming**: Use kebab-case

### State Management

Use Pinia for state management:

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

### API Integration

ComfyUI client integration:

```javascript
import { ComfyClient } from '@artifyfun/comfy-ui-client'

const client = new ComfyClient({
  serverAddress: 'http://localhost:8188'
})
```

## 🤝 Contributing

### Development Process

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Use ESLint and Prettier to maintain consistent code style
- Follow Vue 3 Composition API best practices
- Add appropriate comments and documentation
- Write unit tests (if applicable)

## 📄 License & Copyright
This project is licensed under the GNU General Public License v3.0 (GPLv3). You are free to use, modify, and distribute this project under the following terms:
- Attribution: Please retain original author and project source information in distributions and derivative works.
- Same License: Any modifications or distributions must use the same GPLv3 license.
- No Warranty: This project is provided "as is" without warranty of any kind.
- Copyright © 2025 ArtifyFun. All rights reserved.

## 🙏 Acknowledgments

- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - AI workflow engine
- [ComfyUI Desktop](https://github.com/Comfy-Org/desktop) - ComfyUI desktop application
- [Ant Design Vue](https://antdv.com/) - Enterprise-level UI component library
- [Vite](https://vitejs.dev/) - Next-generation frontend build tool
- [Deepsite](https://github.com/kiritoko1029/deepsite)

## 📞 Contact

- Project Homepage: [https://github.com/artifyfun/artifylab-frontend](https://github.com/artifyfun/artifylab-frontend)
- Issue Reports: [Issues](https://github.com/artifyfun/artifylab-frontend/issues)
- Feature Suggestions: [Discussions](https://github.com/artifyfun/artifylab-frontend/discussions)

---

<div align="center">

**Making AI creation simple, letting everyone become an artist**

⭐ If this project helps you, please give us a Star!

</div>

---
