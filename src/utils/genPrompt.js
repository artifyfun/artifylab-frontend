const ARTIFY_LIB_NAME = "@artifyfun/artify-lib"

export const CDN_URLS = {
  VUE: "https://unpkg.com/vue@3/dist/vue.global.js",
  TAILWIND: "https://cdn.tailwindcss.com",
  ARTIFY_LIB: `https://unpkg.com/${ARTIFY_LIB_NAME}/index.global.js`,
  ARTIFY_LIB_DEV: `http://localhost:3001/index.global.js`,
  ARTIFY_LIB_CSS: `https://unpkg.com/${ARTIFY_LIB_NAME}/index.css`,
  ARTIFY_LIB_CSS_DEV: `http://localhost:3001/index.css`,
  FONT_AWESOME: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
};


const genMeta = (app) => {
  const { template } = app
  const { paramsNodes, prompt } = template
  const nodes = []
  const inputs = {}
  const outputs = {}
  for (const node of paramsNodes) {
    const { category, type, description, title, selectedWidget } = node

    const label = description || (selectedWidget.name ? `${title} - ${selectedWidget.name}` : title)
    const key = selectedWidget.name
    const inputValue = `workflow.state.inputs['${node.id}'].${selectedWidget.name}`

    switch (category) {
      case 'input': {
        if (!inputs[node.id]) {
          inputs[node.id] = { [selectedWidget.name]: prompt[node.id].inputs[selectedWidget.name] }
        }
        switch (selectedWidget.type) {
          case 'customtext':
          case 'string':
          case 'text': {
            nodes.push({
              id: node.id,
              componentName: 'form-item',
              props: {
                label,
                key,
                title
              },
              children: [
                {
                  componentName: 'textarea',
                  props: {
                    allowClear: true,
                    value: inputValue,
                  },
                },
              ],
            })
            break
          }
          case 'toggle': {
            nodes.push({
              id: node.id,
              componentName: 'form-item',
              props: {
                label,
                key,
                title
              },
              children: [
                {
                  componentName: 'switch',
                  props: {
                    value: inputValue,
                  },
                },
              ],
            })
            break
          }
          case 'slider': {
            nodes.push({
              id: node.id,
              componentName: 'form-item',
              props: {
                label,
                key,
                title
              },
              children: [
                {
                  componentName: 'slider',
                  props: {
                    value: inputValue,
                  },
                },
              ],
            })
            break
          }
          case 'number': {
            nodes.push({
              id: node.id,
              componentName: 'form-item',
              props: {
                label,
                key,
                title
              },
              children: [
                {
                  componentName: 'input-number',
                  props: {
                    min: selectedWidget.options?.min,
                    max: selectedWidget.options?.max,
                    precision: selectedWidget.options?.precision,
                    step: selectedWidget.options?.step,
                    allowClear: true,
                    value: inputValue,
                  },
                },
              ],
            })
            break
          }
          case 'combo': {
            if (type === 'LoadImage' && selectedWidget.name === 'image') {
              nodes.push({
                id: node.id,
                componentName: 'form-item',
                props: {
                  label,
                  key,
                  title
                },
                children: [
                  {
                    componentName: 'image-uploader',
                    props: {
                      value: `workflow.getImageUrl(${inputValue}, 'input')`,
                      onChange: `(e) => workflow.onUploadImageChange(e, '${node.id}')`,
                    },
                  },
                ],
              })
            } else {
              nodes.push({
                id: node.id,
                componentName: 'form-item',
                props: {
                  label,
                  key,
                  title
                },
                children: [
                  {
                    componentName: 'select',
                    props: {
                      allowClear: true,
                      value: inputValue,
                      options: selectedWidget.options.values.map((item) => {
                        return {
                          label: item,
                          value: item,
                        }
                      }),
                    },
                  },
                ],
              })
            }
            break
          }
          default: {
            // 未知控件
            nodes.push({
              id: node.id,
              componentName: 'form-item',
              props: {
                label,
                key,
                title
              },
              children: [
                {
                  componentName: selectedWidget.type,
                  props: {
                    value: inputValue,
                  },
                },
              ],
            })
            break
          }
        }
        break
      }
      case 'output': {
        outputs[node.id] = null
        switch (selectedWidget.type) {
          case 'SaveImage':
          case 'Save Images Mikey': {
            nodes.push({
              id: node.id,
              componentName: 'image-preview',
              props: {
                label,
                key,
                title
              },
              children: [
                {
                  componentName: 'post-image',
                  props: {
                    src: `workflow.getImageUrl(workflow.state.outputs['${node.id}'], 'output')`,
                  },
                },
              ],
            })
            break
          }
          default: {
            // 未知控件
            nodes.push({
              id: node.id,
              componentName: 'div',
              props: {
                label,
                key,
                title
              },
              children: [
                {
                  componentName: selectedWidget.type,
                  props: {
                    value: `workflow.state.outputs['${node.id}']`,
                  },
                },
              ],
            })
            break
          }
        }
        break
      }
    }
  }

  const controllers = [
    {
      componentName: 'button',
      props: {
        onClick: {
          value: 'workflow.start',
        },
        loading: {
          value: 'workflow.state.loading',
        },
      },
    },
    {
      componentName: 'button',
      props: {
        onClick: {
          value: 'workflow.stop',
        },
        disabled: {
          value: '!workflow.state.loading',
        },
      },
    },
  ]

  nodes.push(...controllers)

  const meta = {
    ...app,
    components: {
      componentName: 'form',
      children: nodes,
    },
    state: {
      inputs,
      outputs,
      clientId: null,
      promptId: null,
      config: {
        comfyHost: 'http://127.0.0.1:8188',
        serverHost: 'http://127.0.0.1:3888',
        lang: 'en',
      },
      history: [],
      loading: false,
      executing: false,
      done: false,
      progress: 0,
      pending: 0,
      showHistoryModal: false,
    },
  }
  return meta
}

const genPrompt = (app, buildStyle, config) => {
  const meta = genMeta(app)
  return {
    meta,
    promptType: 'html',
    systemPrompt: genSystemPrompt(meta, buildStyle),
    userPrompt: config.lang === 'zh' ? genUserPrompt(meta, buildStyle) : genUserPromptEn(meta, buildStyle),
    assistantPrompt: genAssistantPrompt(meta, buildStyle),
  }
}

function genSystemPrompt(meta, buildStyle) {
  return `ONLY USE VUE 3 WITH HTML, CSS AND JAVASCRIPT.
Create a Vue 3 application using the CDN version (${CDN_URLS.VUE}).
Structure your code with Vue 3 components, reactivity, and proper Vue syntax.
Use as much as you can TailwindCSS for the CSS.
The page design uses a ${buildStyle.en_name} UI style.
DO NOT write any test code or mock data.
ALWAYS GIVE THE RESPONSE INTO A SINGLE HTML FILE`
}

function genUserPrompt(meta, buildStyle) {
  return `仅参考页面样式风格，不要参考页面元素，实际页面元素以我提供的为准，请补全以下页面代码，尽可能使用TailwindCSS，减少代码量，创建一个美观的${meta.name}Vue3 html页面，页面功能为${meta.description}，页面代码:
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Artify工坊 - ${meta.name}</title>
    <script src="${CDN_URLS.VUE}"></script>
    <script src="${CDN_URLS.ARTIFY_LIB}"></script>
    <link rel="stylesheet" href="${CDN_URLS.ARTIFY_LIB_CSS}">
    <script src="${CDN_URLS.TAILWIND}"></script>
    <link rel="stylesheet" href="${CDN_URLS.FONT_AWESOME}">
  </head>
  <body>
    <div id="app">
      <div class="container">
        TODO
        <!-- 历史记录弹窗 -->
        <history-modal
          v-if="workflow.state.showHistoryModal"
          :workflow="workflow"
        />
      </div>
    </div>
    <script>
      const { createApp, ref } = Vue;
      const { HistoryModal, PostImage, useWorkflow } = window.ArtifyLib
      const app = createApp({
        components: {
          'history-modal': HistoryModal,
          'post-image': PostImage
        },
        setup() {
          const workflow = useWorkflow()

          // i18n
          const t = (key) => {
            return {
              zh: {},
              en: {},
            }[workflow.state.config.lang][key]
          }

          return {
            workflow,
            t,
          }
        }
      })
      app.mount('#app');
    </script>
  </body>
</html>

ArtifyLib已经从CDN引入使用，生成的页面为最终页面，不要提供任何模拟数据和模拟代码！
workflow由ArtifyLib.useWorkflow提供，不需要实现任何workflow的状态和方法！

已知workflow.state的对象为：
${JSON.stringify(meta.state, null, 2)}

以下是需要你实现的页面元素：
  ${meta.components.children.filter(item => !['button'].includes(item.componentName)).map((item) => {
    if (item.componentName === 'form-item') {
      let prompt = ''
      if (item.children[0].componentName === 'image-uploader') {
        prompt = `图片上传：标签为"${item.props.label}"，原生组件为input type="file"，样式一定要display: none，@change绑定e => workflow.onUploadImageChange(e, '${item.id}')，展示的图片使用vue组件<post-image src="${item.children[0].props.value}"></post-image>，删除图片调用workflow.removeImage('${item.id}')`
      } else {
        prompt = `输入项：标签为"${item.props.label}"，原生组件为${item.children[0].componentName},属性为${JSON.stringify(item.children[0].props)}${item.children[0].props.value ? `，值绑定到${item.children[0].props.value}` : ''}`
      }

      return prompt
    }
    if (item.componentName === 'image-preview') {
      return `图片预览：标签为"${item.props.label}"，vue组件为${item.children[0].componentName}(和原生img用法一样，标签需要使用小写才能识别),属性为${JSON.stringify(item.children[0].props)},图片绑定到${item.children[0].props.src}，可全屏查看(直接调用workflow.previewImage('${item.id}'))，可下载(直接调用workflow.downloadImage('${item.id}'))`
    }
    if (item.componentName === 'div') {
      return `结果预览：标签为"${item.props.label}"，原生组件为${item.children[0].componentName},属性为${JSON.stringify(item.children[0].props)}${item.children[0].props.value ? `，值绑定到${item.children[0].props.value}` : ''}`
    }
  })}
  按钮：点击触发workflow.start，加载状态绑定到workflow.state.loading
  按钮：点击触发workflow.stop，禁用状态绑定到!workflow.state.loading
  按钮：点击触发workflow.toggleHistoryModal，用于打开历史弹窗
  进度条：显示百分比，值绑定到workflow.state.progress，同时显示数值%
  状态显示：内容绑定到\`状态: \${workflow.state.executing ? '生成中' : workflow.state.done ? '完成' : '空闲'} | 队列: \${workflow.state.pending}\`
  界面文字根据workflow.state.config.lang切换显示，只要实现中文(zh)和英文(en)两种语言，不需要任何切换按钮

其他要求：
  有图片上传的输入项时，生成的结果需要展示上传的图片作为对比
  生成结果需分配更大的空间，方便查看
  loading时禁止用户上传图片或其他输入操作

确保页面设计美观，配色和谐，页面元素以图标为主，文字为辅，使用${buildStyle.zh_name}UI风格，元素间距合理，并在移动设备上自适应布局`
}

function genUserPromptEn(meta, buildStyle) {
  return `Only reference the page style, do not reference page elements. The actual page elements should be based on what I provide. Please complete the following page code, use TailwindCSS as much as possible, reduce code volume, and create a beautiful ${meta.name} Vue3 HTML page. The page function is: ${meta.description}. Page code:
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Artify Workshop - ${meta.name}</title>
    <script src="${CDN_URLS.VUE}"></script>
    <script src="${CDN_URLS.ARTIFY_LIB}"></script>
    <link rel="stylesheet" href="${CDN_URLS.ARTIFY_LIB_CSS}">
    <script src="${CDN_URLS.TAILWIND}"></script>
    <link rel="stylesheet" href="${CDN_URLS.FONT_AWESOME}">
  </head>
  <body>
    <div id="app">
      <div class="container">
        TODO
        <!-- History Modal -->
        <history-modal
          v-if="workflow.state.showHistoryModal"
          :workflow="workflow"
        />
      </div>
    </div>
    <script>
      const { createApp, ref } = Vue;
      const { HistoryModal, PostImage, useWorkflow } = window.ArtifyLib
      const app = createApp({
        components: {
          'history-modal': HistoryModal,
          'post-image': PostImage
        },
        setup() {
          const workflow = useWorkflow()

          // i18n
          const t = (key) => {
            return {
              zh: {},
              en: {},
            }[workflow.state.config.lang][key]
          }

          return {
            workflow,
            t,
          }
        }
      })
      app.mount('#app');
    </script>
  </body>
</html>

ArtifyLib has been imported from CDN and is ready to use. The generated page is the final page, do not provide any mock data or mock code!
The workflow is provided by ArtifyLib.useWorkflow, no need to implement any workflow states or methods!

Known workflow.state object:
${JSON.stringify(meta.state, null, 2)}

The following page elements need to be implemented:
  ${meta.components.children.filter(item => !['button'].includes(item.componentName)).map((item) => {
    if (item.componentName === 'form-item') {
      let prompt = ''
      if (item.children[0].componentName === 'image-uploader') {
        prompt = `Image upload: label is "${item.props.label}", native component is input type="file", style must be display: none, @change binding e => workflow.onUploadImageChange(e, '${item.id}'), display image using vue component <post-image src="${item.children[0].props.value}"></post-image>, delete image by calling workflow.removeImage('${item.id}')`
      } else {
        prompt = `Input field: label is "${item.props.label}", native component is ${item.children[0].componentName}, properties are ${JSON.stringify(item.children[0].props)}${item.children[0].props.value ? `, value bound to ${item.children[0].props.value}` : ''}`
      }

      return prompt
    }
    if (item.componentName === 'image-preview') {
      return `Image preview: label is "${item.props.label}", vue component is ${item.children[0].componentName} (same usage as native img, tag must be lowercase to be recognized), properties are ${JSON.stringify(item.children[0].props)}, image bound to ${item.children[0].props.src}, can view fullscreen (directly call workflow.previewImage('${item.id}')), can download (directly call workflow.downloadImage('${item.id}'))`
    }
    if (item.componentName === 'div') {
      return `Result preview: label is "${item.props.label}", native component is ${item.children[0].componentName}, properties are ${JSON.stringify(item.children[0].props)}${item.children[0].props.value ? `, value bound to ${item.children[0].props.value}` : ''}`
    }
  })}
  Button: click triggers workflow.start, loading state bound to workflow.state.loading
  Button: click triggers workflow.stop, disabled state bound to !workflow.state.loading
  Button: click triggers workflow.toggleHistoryModal, used to open history modal
  Progress bar: displays percentage, value bound to workflow.state.progress, and display percentage value
  Status display: content bound to \`Status: \${workflow.state.executing ? 'Generating' : workflow.state.done ? 'Complete' : 'Idle'} | Queue: \${workflow.state.pending}\`
  Interface text switches display based on workflow.state.config.lang, only implement Chinese (zh) and English (en) two languages, no switching button needed

Other requirements:
  When there are image upload input fields, the generated results need to display the uploaded images for comparison
  Generated results need to allocate larger space for easy viewing
  During loading, prohibit users from uploading images or other input operations

Ensure the page design is beautiful, color harmony, page elements mainly use icons with text as supplement, use ${buildStyle.en_name} UI style, reasonable element spacing, and responsive layout on mobile devices`
}

function genAssistantPrompt(meta, buildStyle) {
  return `The current code is:
${buildStyle.html}
`
}

function genHtml(app, code, config) {
  const meta = genMeta(app)
  const appTemplate = {
    ...meta,
    config: {
      comfyHost: config.comfyHost,
      serverHost: config.serverHost,
      lang: config.lang,
    },
    code: undefined,
    components: undefined,
  }

  const fullCode = code.replace('<head>', `<head>
  <script>
    window.appTemplate = ${JSON.stringify(appTemplate)}
  </script>
`)
  return fullCode
}

// 本地生成HTML的核心渲染函数
function renderComponent(item, meta) {
  // 只处理常见类型，后续可扩展
  if (item.componentName === 'form-item') {
    const child = item.children[0]
    const label = item.props.label
    const id = item.id
    const disabled = `:disabled="workflow.state.loading"`
    switch (child.componentName) {
      case 'textarea':
        return `
          <div class="mb-8">
            <label class="block mb-2 font-medium text-textSecondary">${label}</label>
            <textarea
              v-model="${child.props.value}"
              ${disabled}
              rows="6"
              class="px-4 py-3 w-full text-base rounded-xl text-input"
              :placeholder="t('promptPlaceholder')"
            ></textarea>
          </div>
        `
      case 'select':
        // 选项
        const options = (child.props.options || []).map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')
        return `
          <div class="mb-6">
            <label class="block mb-2 font-medium text-textSecondary">${label}</label>
            <select
              v-model="${child.props.value}"
              ${disabled}
              class="px-4 py-3 w-full text-base rounded-xl select-input"
            >
              ${options}
            </select>
          </div>
        `
      case 'input-number':
        return `
          <div class="mb-6">
            <label class="block mb-2 font-medium text-textSecondary">${label}</label>
            <input
              type="number"
              v-model="${child.props.value}"
              ${disabled}
              min="${child.props.min ?? ''}"
              max="${child.props.max ?? ''}"
              step="${child.props.step ?? ''}"
              class="px-4 py-3 w-full text-base rounded-xl text-input"
            />
          </div>
        `
      case 'slider':
        return `
          <div class="mb-6">
            <label class="block mb-2 font-medium text-textSecondary">${label}</label>
            <input
              type="range"
              v-model="${child.props.value}"
              ${disabled}
              min="${child.props.min ?? ''}"
              max="${child.props.max ?? ''}"
              step="${child.props.step ?? ''}"
              class="w-full"
            />
          </div>
        `
      case 'switch':
        return `
          <div class="flex gap-2 items-center mb-6">
            <label class="font-medium text-textSecondary">${label}</label>
            <input type="checkbox" v-model="${child.props.value}" ${disabled} />
          </div>
        `
      case 'image-uploader':
        return `
          <div class="mb-6">
            <label class="block mb-2 font-medium text-textSecondary">${label}</label>
            <input type="file" style="display:none" :disabled="workflow.state.loading" @change="e => workflow.onUploadImageChange(e, '${id}')" :id="'upload-${id}'" />
            <button type="button" class="px-4 py-2 rounded btn-secondary" @click="handleUploadImage('${id}')" :disabled="workflow.state.loading">{{ t('upload') }}</button>
            <post-image v-if="workflow.state.inputs['${id}'].image" :src="workflow.getImageUrl(workflow.state.inputs['${id}'].image, 'input')" class="object-contain mt-2 w-full h-48" />
            <button v-if="workflow.state.inputs['${id}'].image" type="button" class="px-2 py-1 mt-2 rounded btn-secondary" @click="() => workflow.removeImage('${id}')">{{ t('remove') }}</button>
          </div>
        `
      default:
        return ''
    }
  }
  if (item.componentName === 'image-preview') {
    const id = item.id
    return `
      <div class="flex overflow-hidden relative flex-1 justify-center items-center rounded-xl image-preview">
        <post-image
          v-if="workflow.state.outputs['${id}']"
          :src="workflow.getImageUrl(workflow.state.outputs['${id}'], 'output')"
          class="object-contain w-full h-full"
        />
        <div v-else class="p-6 text-center text-textSecondary">
          <i class="mb-4 text-6xl opacity-30 fas fa-image"></i>
          <p class="text-xl">{{ t('noImage') }}</p>
        </div>
      </div>
      <div class="flex gap-3 mt-4 image-preview-button">
        <button
          v-if="workflow.state.outputs['${id}']"
          @click="workflow.previewImage('${id}')"
          class="flex-1 px-4 py-2 rounded-full btn-secondary"
        >
          <i class="mr-2 fas fa-expand"></i>{{ t('preview') }}
        </button>
        <button
          v-if="workflow.state.outputs['${id}']"
          @click="workflow.downloadImage('${id}')"
          class="flex-1 px-4 py-2 rounded-full btn-primary"
        >
          <i class="mr-2 fas fa-download"></i>{{ t('download') }}
        </button>
      </div>
    `
  }
  return ''
}

function genLocalHtml(app, config) {
  const meta = genMeta(app)
  // CDN变量
  const VUE_CDN = CDN_URLS.VUE
  const ARTIFY_LIB_CDN = CDN_URLS.ARTIFY_LIB
  const ARTIFY_LIB_CSS_CDN = CDN_URLS.ARTIFY_LIB_CSS
  const FONT_AWESOME_CDN = CDN_URLS.FONT_AWESOME
  const TAILWIND_CDN = CDN_URLS.TAILWIND
  // 输入区
  const inputHtml = meta.components.children
    .filter(item => item.componentName === 'form-item')
    .map(item => renderComponent(item, meta))
    .join('\n')
  // 输出区
  const outputHtml = meta.components.children
    .filter(item => item.componentName === 'image-preview' || item.componentName === 'div')
    .map(item => renderComponent(item, meta))
    .join('\n')
  // 按钮区
  const buttonHtml = `
    <div class="flex flex-wrap gap-3">
      <button
        @click="workflow.start"
        :disabled="workflow.state.loading"
        class="flex-1 min-w-[120px] px-4 py-3 rounded-full font-semibold btn-primary transition-all duration-300 flex items-center justify-center"
      >
        <span v-if="workflow.state.loading" class="loader"></span>
        {{ workflow.state.loading ? t('generating') : t('generate') }}
      </button>
      <button
        @click="workflow.stop"
        :disabled="!workflow.state.loading"
        class="px-4 py-3 font-semibold rounded-full transition-all duration-300 btn-secondary"
      >
        <i class="mr-2 fas fa-stop"></i>{{ t('stop') }}
      </button>
    </div>
  `
  // 进度条
  const progressHtml = `
    <div class="p-6 rounded-2xl shadow-xl glass-card">
      <div class="flex justify-between mb-2">
        <span class="font-medium text-textSecondary">{{ t('progress') }}</span>
        <span class="font-bold text-primary">{{ workflow.state.progress }}%</span>
      </div>
      <div class="overflow-hidden rounded-full progress-bar">
        <div
          class="rounded-full progress-fill"
          :style="{ width: workflow.state.progress + '%' }"
        ></div>
      </div>
    </div>
  `
  // 顶部导航
  const headerHtml = `
    <header class="flex flex-col justify-between items-center py-6 mb-8 border-b md:flex-row border-blue-200/10">
      <div class="flex gap-3 items-center mb-6 text-2xl font-bold md:mb-0">
        <i class="fas fa-palette text-primary"></i>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Artify工坊</span>
      </div>
      <div class="flex gap-4 items-center">
        <div class="text-sm font-medium text-textSecondary">
          {{ t('status') }}:
          <span class="text-primary">
            {{ workflow.state.executing ? t('generating') : workflow.state.done ? t('completed') : t('idle') }}
          </span> |
          {{ t('queue') }}: {{ workflow.state.pending }}
        </div>
        <button
          @click="workflow.toggleHistoryModal"
          class="px-4 py-2 rounded-full transition-all duration-300 btn-secondary"
        >
          <i class="mr-2 fas fa-history"></i>{{ t('history') }}
        </button>
      </div>
    </header>
  `
  // 主体拼接
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Artify工坊 - ${meta.name}</title>
  <script src="${VUE_CDN}"></script>
  <script src="${ARTIFY_LIB_CDN}"></script>
  <link rel="stylesheet" href="${ARTIFY_LIB_CSS_CDN}">
  <link rel="stylesheet" href="${FONT_AWESOME_CDN}">
  <script src="${TAILWIND_CDN}"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#0ff',
            secondary: '#9d4edd',
            dark: '#0a0a14',
            darker: '#06060d',
            card: 'rgba(20, 20, 40, 0.7)',
            text: '#e0e0ff',
            textSecondary: '#a0a0c0',
          },
          boxShadow: {
            'glow': '0 0 15px rgba(0, 255, 255, 0.3)',
            'glow-hover': '0 5px 20px rgba(0, 255, 255, 0.5)',
          }
        }
      }
    }
  </script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif; }
    body { background: #06060d; background-image: radial-gradient(circle at 10% 20%, rgba(45, 9, 77, 0.3) 0%, transparent 30%), radial-gradient(circle at 90% 80%, rgba(0, 68, 77, 0.3) 0%, transparent 30%); color: #e0e0ff; min-height: 100vh; overflow-x: hidden; line-height: 1.6; }
    .tech-element { position: absolute; z-index: -1; }
    .circle { width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(45, 9, 77, 0.3) 0%, transparent 70%); position: fixed; top: 10%; left: 5%; }
    .circle-2 { width: 200px; height: 200px; top: 60%; left: 85%; background: radial-gradient(circle, rgba(0, 68, 77, 0.3) 0%, transparent 70%); }
    .grid-line { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(rgba(100, 200, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 200, 255, 0.03) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; z-index: -1; }
    .glass-card { background: rgba(20, 20, 40, 0.7); border: 1px solid rgba(100, 200, 255, 0.1); backdrop-filter: blur(10px); }
    .btn-primary { background: linear-gradient(90deg, #0ff, #9d4edd); color: #06060d; box-shadow: 0 0 15px rgba(0, 255, 255, 0.3); }
    .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(0, 255, 255, 0.5); }
    .btn-secondary { background: transparent; color: #0ff; border: 1px solid #0ff; }
    .btn-secondary:hover { background: rgba(0, 255, 255, 0.1); }
    .loader { display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(0, 255, 255, 0.3); border-radius: 50%; border-top: 3px solid #0ff; animation: spin 1s linear infinite; margin-right: 10px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .progress-bar { background: rgba(10, 15, 30, 0.6); border: 1px solid rgba(100, 200, 255, 0.2); height: 1.5rem; }
    .progress-fill { background: linear-gradient(90deg, #0ff, #9d4edd); height: 100%; transition: width 0.3s ease; }
    .text-input { background: rgba(10, 15, 30, 0.6); border: 1px solid rgba(100, 200, 255, 0.2); color: #e0e0ff; }
    .text-input:focus { outline: none; border-color: #0ff; box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.2); }
    .select-input { background: rgba(10, 15, 30, 0.6); border: 1px solid rgba(100, 200, 255, 0.2); color: #e0e0ff; }
    .select-input:focus { outline: none; border-color: #0ff; box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.2); }
    .image-preview { background: linear-gradient(45deg, #1a1a2e, #16213e, #0f3460); position: relative; }
    .image-preview::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, transparent 0%, rgba(0, 255, 255, 0.05) 100%); }
    .image-preview-button+.image-preview { margin-top: 1rem; }
  </style>
</head>
<body>
  <div id="app">
    <div class="tech-element circle"></div>
    <div class="tech-element circle-2"></div>
    <div class="tech-element grid-line"></div>
    <div class="container px-4 py-8 mx-auto max-w-6xl">
      ${headerHtml}
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-1">
          <div class="p-6 rounded-2xl shadow-xl glass-card">
            <h2 class="flex gap-2 items-center mb-6 text-xl font-semibold">
              <i class="fas fa-sliders-h text-primary"></i>
              {{ t('modelSettings') }}
            </h2>
            ${inputHtml}
            ${buttonHtml}
          </div>
          ${progressHtml}
        </div>
        <div class="lg:col-span-2">
          <div class="p-6 h-full rounded-2xl shadow-xl glass-card">
            <h2 class="flex gap-2 items-center mb-6 text-xl font-semibold">
              <i class="fas fa-image text-primary"></i>
              {{ t('result') }}
            </h2>
            <div class="flex flex-col">
              ${outputHtml}
            </div>
          </div>
        </div>
      </div>
    </div>
    <history-modal v-if="workflow.state.showHistoryModal" :workflow="workflow" />
  </div>
  <script>
    const { createApp } = Vue;
    const { HistoryModal, PostImage, useWorkflow } = window.ArtifyLib;
    const app = createApp({
      components: {
        'history-modal': HistoryModal,
        'post-image': PostImage
      },
      setup() {
        const workflow = useWorkflow();
        // 国际化翻译函数
        const t = (key) => {
          const translations = {
            zh: {
              status: '状态', generating: '生成中', completed: '完成', idle: '空闲', queue: '队列', history: '历史记录', modelSettings: '模型设置', checkpointLoader: '模型选择', prompt: '提示词', promptPlaceholder: '输入您想要生成的画面描述...', generate: '生成图像', stop: '停止', progress: '生成进度', result: '生成结果', noImage: '等待生成图像...', preview: '全屏预览', download: '下载图像', upload: '上传图片', remove: '删除图片'
            },
            en: {
              status: 'Status', generating: 'Generating', completed: 'Completed', idle: 'Idle', queue: 'Queue', history: 'History', modelSettings: 'Model Settings', checkpointLoader: 'Checkpoint', prompt: 'Prompt', promptPlaceholder: 'Enter your prompt here...', generate: 'Generate Image', stop: 'Stop', progress: 'Progress', result: 'Result', noImage: 'Waiting for image generation...', preview: 'Preview', download: 'Download', upload: 'Upload Image', remove: 'Remove Image'
            }
          };
          return translations[workflow.state.config.lang][key] || key;
        };
        const handleUploadImage = (id) => {
          document.getElementById(\`upload-\${id}\`).click();
        };
        return { workflow, t, handleUploadImage };
      }
    });
    app.mount('#app');
  </script>
</body>
</html>
`
}

export {
  genMeta,
  genPrompt,
  genUserPromptEn,
  genHtml,
  genLocalHtml
}
