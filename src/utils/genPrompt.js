const ARTIFY_LIB_NAME = "@artifyfun/artify-lib"

const CDN_URLS = {
  VUE: "https://unpkg.com/vue@3/dist/vue.global.js",
  TAILWIND: "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4",
  ARTIFY_LIB: `https://unpkg.com/${ARTIFY_LIB_NAME}/index.global.js`,
  ARTIFY_LIB_CSS: `https://unpkg.com/${ARTIFY_LIB_NAME}/index.css`,
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

function genHtml(app, config) {
  const { code } = app
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

export {
  genMeta,
  genPrompt,
  genUserPromptEn,
  genHtml
}
