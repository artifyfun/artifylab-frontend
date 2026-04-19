const artify_inject = getQueryParam('artify_inject')

const isElectron = !!window.electronAPI

window.addEventListener('load', function () {
  let timer = null

  if (artify_inject === 'readonly') {
    loadCssCode(
      `/* Hide main UI containers - use !important to override inline styles */
        body.litegraph .comfyui-body-top,
        body.litegraph .comfyui-body-left,
        body.litegraph .comfyui-body-right,
        body.litegraph .comfyui-body-bottom,
        body.litegraph .workflow-tabs-container,
        body.litegraph .workflow-tabs-container-desktop {
          display: none !important;
        }

        /* Hide side toolbars */
        body.litegraph .side-tool-bar-container,
        body.litegraph .floating-sidebar,
        body.litegraph .connected-sidebar {
          display: none !important;
        }

        /* Hide menu related elements */
        body.litegraph .comfy-menu-button-wrapper,
        body.litegraph .comfy-command-menu {
          display: none !important;
        }

        /* Hide selection toolbox */
        body.litegraph .selection-toolbox {
          display: none !important;
        }

        /* Hide rgthree and other extension elements */
        body.litegraph rgthree-progress-bar,
        body.litegraph .pysssss-image-feed {
          display: none !important;
        }
      `,
      window,
    )

    // Also use JavaScript to directly hide elements (in case CSS isn't enough)
    function hideReadonlyUI() {
      const selectors = [
        '.comfyui-body-top',
        '.comfyui-body-left',
        '.comfyui-body-right',
        '.comfyui-body-bottom',
        '.workflow-tabs-container',
        '.workflow-tabs-container-desktop',
        '.side-tool-bar-container',
        '.floating-sidebar',
        '.connected-sidebar',
        '.comfy-menu-button-wrapper',
        '.comfy-command-menu',
        '.selection-toolbox',
        'rgthree-progress-bar',
      ]

      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
          el.style.display = 'none'
        })
      })
    }

    // Run hiding immediately and then retry a few times
    hideReadonlyUI()
    setTimeout(hideReadonlyUI, 100)
    setTimeout(hideReadonlyUI, 500)
    setTimeout(hideReadonlyUI, 1000)
  }

  let counter = 0

  function checkComfyUIReady() {
    counter++
    clearTimeout(timer)

    if (counter > 200) {
      console.warn('[ArtifyInject] Timeout waiting for ComfyUI')
      return
    }

    // ComfyUI 0.19+ sets __COMFYUI_FRONTEND_VERSION__ when initialized
    // Also check for Vue app being mounted (has child nodes)
    const vueApp = document.querySelector('#vue-app')
    const hasVueApp = vueApp && vueApp.childNodes.length > 0
    const hasVersion = typeof window.__COMFYUI_FRONTEND_VERSION__ !== 'undefined'
    const hasLiteGraph = document.body && document.body.classList.contains('litegraph')

    if (hasVersion || (hasVueApp && hasLiteGraph)) {
      if (artify_inject !== 'readonly') {
        // Wait a bit more for the graph to fully initialize
        setTimeout(() => {
          setButton()
          loadWorkflow()
        }, 500)
      } else {
        // Wait for window.app to be set (GraphView mounts after version check)
        setTimeout(() => {
          console.log('[ArtifyInject] Timeout fired, about to call handleComfyuiContext')
          handleComfyuiContext(() => {
            // Only send onload AFTER eventBus.on is registered
            console.log('[ArtifyInject] About to send onload message')
            const message = JSON.stringify({ eventType: 'onload' })
            window.parent.postMessage(message, '*')
            console.log('[ArtifyInject] ComfyUI ready (readonly mode), onload sent at', Date.now())
            // Wait a bit and check if we received any messages
            setTimeout(() => {
              console.log('[ArtifyInject] Still no messages received after onload')
            }, 2000)
          })
        }, 500)
      }
      return
    }

    timer = setTimeout(checkComfyUIReady, 100)
  }

  checkComfyUIReady()
})

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (a) =>
    (a ^ ((Math.random() * 16) >> (a / 4))).toString(16),
  )
}

function getRandomColor() {
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

function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
}

function loadCssCode(code, win) {
  const { document } = win
  const style = document.createElement('style')
  style.type = 'text/css'
  style.rel = 'stylesheet'
  style.appendChild(document.createTextNode(code))
  const head = document.getElementsByTagName('head')[0]
  head.appendChild(style)
}

function getComfyUIApp() {
  // Try window.app first (set by ComfyUI after GraphView mounts)
  let app = window.app

  // Try Vue internal - __vue_app__ on the mounted element
  if (!app) {
    const vueAppEl = document.querySelector('#vue-app')
    if (vueAppEl && vueAppEl.__vue_app__) {
      // Vue 3 app instance - the actual app is usually the root component
      const vueApp = vueAppEl.__vue_app__
      // Try to get the app from the root component
      if (vueApp._instance) {
        app = vueApp._instance.proxy
      }
    }
  }

  // Try to get LiteGraph/LGraph from window (always set by ComfyUI)
  let LiteGraph = window.LiteGraph || window.LGraph
  if (!LiteGraph) {
    for (const key of Object.keys(window)) {
      if (key === 'LiteGraph' || key === 'LGraph') {
        LiteGraph = window[key]
        break
      }
    }
  }

  return { app, LiteGraph }
}

function handleComfyuiContext(onReady) {
  const { app, LiteGraph } = getComfyUIApp()

  if (!app || !LiteGraph) {
    // Retry after a short delay - window.app might not be set yet
    setTimeout(() => {
      const { app: retryApp, LiteGraph: retryLiteGraph } = getComfyUIApp()
      if (!retryApp || !retryLiteGraph) {
        console.warn('[ArtifyInject] Could not find ComfyUI app instance after retry')
        return
      }
      doHandleComfyuiContext(retryApp, retryLiteGraph, onReady)
    }, 1000)
    return
  }

  doHandleComfyuiContext(app, LiteGraph, onReady)
}

function doHandleComfyuiContext(app, LiteGraph, onReady) {
  console.log('[ArtifyInject] doHandleComfyuiContext START')
  // Known ArtifyLab event types - only process these
  const ARTIFY_EVENT_TYPES = ['updateParamsNodes', 'centerOnNode', 'loadGraphData', 'updatePrompt']

  const eventBus = {
    callbacks: [],
    send: (message) => {
      window.parent.postMessage(message, '*')
    },
    on: (cb) => {
      eventBus.callbacks.push(cb)
      console.log(
        '[ArtifyInject] eventBus.on registered, total callbacks:',
        eventBus.callbacks.length,
      )
    },
  }

  console.log('[ArtifyInject] About to register window.addEventListener("message")')
  window.addEventListener('message', (event) => {
    console.log('[ArtifyInject] ===== Message received =====')
    console.log('[ArtifyInject] origin:', event.origin)
    console.log('[ArtifyInject] data type:', typeof event.data)
    console.log('[ArtifyInject] data:', event.data)
    // Only process messages that are ArtifyLab messages
    let data = event.data

    // If data is already an object, use it directly
    // If it's a string, try to parse as JSON
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
        console.log('[ArtifyInject] Parsed string to object:', data)
      } catch {
        // Not valid JSON, ignore
        console.log('[ArtifyInject] String not valid JSON, ignoring')
        return
      }
    }

    console.log(
      '[ArtifyInject] Checking eventType:',
      data && data.eventType,
      'in',
      ARTIFY_EVENT_TYPES,
    )
    // Only process if it's our message format
    if (data && data.eventType && ARTIFY_EVENT_TYPES.includes(data.eventType)) {
      console.log(
        '[ArtifyInject] Matched! Calling callbacks, callback count:',
        eventBus.callbacks.length,
      )
      for (const i in eventBus.callbacks) {
        eventBus.callbacks[i](data)
      }
    } else {
      console.log('[ArtifyInject] NOT matched - eventType or ARTIFY_EVENT_TYPES issue')
    }
  })

  app.canvas.allow_dragnodes = false
  app.canvas.allow_reconnect_links = false
  app.canvas.allow_searchbox = false
  app.handleFile = () => {}

  let paramsNodes = []
  const origin_drawNodeShape = app.canvas.drawNodeShape
  app.canvas.drawNodeShape = function (node, ctx, size, fgcolor, bgcolor, selected) {
    const isSelected = paramsNodes.some((item) => item.id === node.id)
    const outputNode = paramsNodes.find((item) => item.id === node.id && item.category === 'output')
    if (outputNode) {
      console.log(`[ArtifyInject] Node ${node.id}: matched outputNode, color=${outputNode.color}`)
    } else if (paramsNodes.some((item) => item.id === node.id)) {
      const item = paramsNodes.find((item) => item.id === node.id)
      console.log(
        `[ArtifyInject] Node ${node.id}: found in paramsNodes but category=${item.category} not "output"`,
      )
    }
    fgcolor = outputNode ? outputNode.color : fgcolor
    bgcolor = outputNode ? outputNode.color : bgcolor
    selected = isSelected
    const res = origin_drawNodeShape.call(this, node, ctx, size, fgcolor, bgcolor, selected)
    return res
  }

  app.canvas.drawNodeWidgets = function (node, posY, ctx, active_widget) {
    if (!node.widgets || !node.widgets.length) {
      return 0
    }
    const width = node.size[0]
    const widgets = node.widgets
    posY += 2
    const H = (LiteGraph || window.LiteGraph || window.LGraph).NODE_WIDGET_HEIGHT
    const show_text = this.ds.scale > 0.5
    ctx.save()
    ctx.globalAlpha = this.editor_alpha
    const outline_color = (LiteGraph || window.LiteGraph || window.LGraph).WIDGET_OUTLINE_COLOR
    let background_color = (LiteGraph || window.LiteGraph || window.LGraph).WIDGET_BGCOLOR
    const text_color = (LiteGraph || window.LiteGraph || window.LGraph).WIDGET_TEXT_COLOR
    const secondary_text_color = (LiteGraph || window.LiteGraph || window.LGraph)
      .WIDGET_SECONDARY_TEXT_COLOR
    const margin = 15

    for (let i = 0; i < widgets.length; ++i) {
      const w = widgets[i]
      // First check for input category node (applies to all widgets of this node)
      const inputNode = paramsNodes.find((item) => item.id === node.id && item.category === 'input')
      if (inputNode) {
        background_color = inputNode.color
        console.log(
          `[ArtifyInject] Widget ${w.name} on node ${node.id}: matched inputNode, color=${inputNode.color}`,
        )
      } else if (paramsNodes.some((item) => item.id === node.id)) {
        const item = paramsNodes.find((item) => item.id === node.id)
        console.log(
          `[ArtifyInject] Widget ${w.name} on node ${node.id}: found in paramsNodes but category=${item.category} not "input"`,
        )
      } else {
        // Then check for specific widget match
        const current = paramsNodes.find(
          (item) => item.id === node.id && item.selectedWidget.name === w.name,
        )
        if (current) {
          background_color = current.color
        } else {
          background_color = (LiteGraph || window.LiteGraph || window.LGraph).WIDGET_BGCOLOR
        }
      }
      let y = posY
      if (w.y) {
        y = w.y
      }
      w.last_y = y
      ctx.strokeStyle = outline_color
      ctx.fillStyle = '#222'
      ctx.textAlign = 'left'
      if (w.disabled) ctx.globalAlpha *= 0.5
      const widget_width = w.width || width

      switch (w.type) {
        case 'button':
          ctx.fillStyle = background_color
          if (w.clicked) {
            ctx.fillStyle = '#AAA'
            w.clicked = false
            this.dirty_canvas = true
          }
          ctx.fillRect(margin, y, widget_width - margin * 2, H)
          if (show_text && !w.disabled) ctx.strokeRect(margin, y, widget_width - margin * 2, H)
          if (show_text) {
            ctx.textAlign = 'center'
            ctx.fillStyle = text_color
            ctx.fillText(w.label || w.name, widget_width * 0.5, y + H * 0.7)
          }
          break
        case 'toggle':
          ctx.textAlign = 'left'
          ctx.strokeStyle = outline_color
          ctx.fillStyle = background_color
          ctx.beginPath()
          if (show_text) ctx.roundRect(margin, y, widget_width - margin * 2, H, [H * 0.5])
          else ctx.rect(margin, y, widget_width - margin * 2, H)
          ctx.fill()
          if (show_text && !w.disabled) ctx.stroke()
          ctx.fillStyle = w.value ? '#89A' : '#333'
          ctx.beginPath()
          ctx.arc(widget_width - margin * 2, y + H * 0.5, H * 0.36, 0, Math.PI * 2)
          ctx.fill()
          if (show_text) {
            ctx.fillStyle = secondary_text_color
            const label = w.label || w.name
            if (label != null) {
              ctx.fillText(label, margin * 2, y + H * 0.7)
            }
            ctx.fillStyle = w.value ? text_color : secondary_text_color
            ctx.textAlign = 'right'
            ctx.fillText(
              w.value ? w.options.on || 'true' : w.options.off || 'false',
              widget_width - 40,
              y + H * 0.7,
            )
          }
          break
        case 'slider': {
          ctx.fillStyle = background_color
          ctx.fillRect(margin, y, widget_width - margin * 2, H)
          const range = w.options.max - w.options.min
          let nvalue = (w.value - w.options.min) / range
          if (nvalue < 0.0) nvalue = 0.0
          if (nvalue > 1.0) nvalue = 1.0
          ctx.fillStyle = Object.prototype.hasOwnProperty.call(w.options, 'slider_color')
            ? w.options.slider_color
            : active_widget === w
              ? '#89A'
              : '#678'
          ctx.fillRect(margin, y, nvalue * (widget_width - margin * 2), H)
          if (show_text && !w.disabled) ctx.strokeRect(margin, y, widget_width - margin * 2, H)
          if (w.marker) {
            let marker_nvalue = (w.marker - w.options.min) / range
            if (marker_nvalue < 0.0) marker_nvalue = 0.0
            if (marker_nvalue > 1.0) marker_nvalue = 1.0
            ctx.fillStyle = Object.prototype.hasOwnProperty.call(w.options, 'marker_color')
              ? w.options.marker_color
              : '#AA9'
            ctx.fillRect(margin + marker_nvalue * (widget_width - margin * 2), y, 2, H)
          }
          if (show_text) {
            ctx.textAlign = 'center'
            ctx.fillStyle = text_color
            ctx.fillText(
              w.label ||
                `${w.name}  ${Number(w.value).toFixed(
                  w.options.precision != null ? w.options.precision : 3,
                )}`,
              widget_width * 0.5,
              y + H * 0.7,
            )
          }
          break
        }
        case 'number':
        case 'combo':
          ctx.textAlign = 'left'
          ctx.strokeStyle = outline_color
          ctx.fillStyle = background_color
          ctx.beginPath()
          if (show_text) ctx.roundRect(margin, y, widget_width - margin * 2, H, [H * 0.5])
          else ctx.rect(margin, y, widget_width - margin * 2, H)
          ctx.fill()
          if (show_text) {
            if (!w.disabled) ctx.stroke()
            ctx.fillStyle = text_color
            if (!w.disabled) {
              ctx.beginPath()
              ctx.moveTo(margin + 16, y + 5)
              ctx.lineTo(margin + 6, y + H * 0.5)
              ctx.lineTo(margin + 16, y + H - 5)
              ctx.fill()
              ctx.beginPath()
              ctx.moveTo(widget_width - margin - 16, y + 5)
              ctx.lineTo(widget_width - margin - 6, y + H * 0.5)
              ctx.lineTo(widget_width - margin - 16, y + H - 5)
              ctx.fill()
            }
            ctx.fillStyle = secondary_text_color
            ctx.fillText(w.label || w.name, margin * 2 + 5, y + H * 0.7)
            ctx.fillStyle = text_color
            ctx.textAlign = 'right'
            if (w.type === 'number') {
              ctx.fillText(
                Number(w.value).toFixed(
                  w.options.precision !== undefined ? w.options.precision : 3,
                ),
                widget_width - margin * 2 - 20,
                y + H * 0.7,
              )
            } else {
              let v = w.value
              if (w.options.values) {
                let values = w.options.values
                if (values.constructor === Function) values = values()
                if (values && values.constructor !== Array) v = values[w.value]
              }
              ctx.fillText(v, widget_width - margin * 2 - 20, y + H * 0.7)
            }
          }
          break
        case 'customtext':
          w.element.style.background = background_color
          if (w.draw) {
            w.draw(ctx, node, widget_width, y, H)
          }
          break
        case 'string':
        case 'text':
          ctx.textAlign = 'left'
          ctx.strokeStyle = outline_color
          ctx.fillStyle = background_color
          ctx.beginPath()
          if (show_text) ctx.roundRect(margin, y, widget_width - margin * 2, H, [H * 0.5])
          else ctx.rect(margin, y, widget_width - margin * 2, H)
          ctx.fill()
          if (show_text) {
            if (!w.disabled) ctx.stroke()
            ctx.save()
            ctx.beginPath()
            ctx.rect(margin, y, widget_width - margin * 2, H)
            ctx.clip()
            ctx.fillStyle = secondary_text_color
            const label = w.label || w.name
            if (label != null) {
              ctx.fillText(label, margin * 2, y + H * 0.7)
            }
            ctx.fillStyle = text_color
            ctx.textAlign = 'right'
            ctx.fillText(String(w.value).substr(0, 30), widget_width - margin * 2, y + H * 0.7)
            ctx.restore()
          }
          break
        default:
          if (w.draw) {
            w.draw(ctx, node, widget_width, y, H)
          }
          break
      }
      posY += (w.computeSize ? w.computeSize(widget_width)[1] : H) + 4
      ctx.globalAlpha = this.editor_alpha
    }
    ctx.restore()
    ctx.textAlign = 'left'
  }

  const origin_getNodeMenuOptions = app.canvas.getNodeMenuOptions
  app.canvas.getNodeMenuOptions = function (...res) {
    const node = res[0]
    const options = origin_getNodeMenuOptions.call(this, ...res)
    options.splice(0, options.length)

    if (node.widgets) {
      const selectedWidgets = node.widgets.filter((widget) => {
        const isSelected = paramsNodes.some(
          (item) => item.id === node.id && item.selectedWidget.name === widget.name,
        )
        return isSelected
      })

      const input = {
        content: `提取输入「Pick as input」 [${selectedWidgets.length}/${node.widgets.length}]`,
        has_submenu: true,
        submenu: {
          options: node.widgets.map((widget) => {
            const isSelected = paramsNodes.some(
              (item) => item.id === node.id && item.selectedWidget.name === widget.name,
            )
            return {
              content: isSelected ? `${widget.name} ✓` : widget.name,
              className: isSelected ? 'selected' : '',
              callback: () => {
                if (isSelected) {
                  paramsNodes = paramsNodes.filter(
                    (item) =>
                      item.id !== node.id ||
                      (item.id === node.id && item.selectedWidget.name !== widget.name),
                  )
                } else {
                  const color = getRandomColor()
                  // Store essential data plus parent's enriched fields
                  paramsNodes.push({
                    id: node.id,
                    type: node.type, // needed for getRenderComponent
                    color,
                    category: 'input',
                    name: widget.name,
                    selectedWidget: { name: widget.name, type: widget.type },
                    // These will be filled by parent's handleMessage
                    description: '',
                    renderComponent: '',
                    key: '',
                  })
                }
                eventBus.send(
                  stringify({
                    eventType: 'updateParamsNodes',
                    data: paramsNodes,
                  }),
                )
              },
            }
          }),
        },
      }

      options.push(input)
    }

    const isSelected = paramsNodes.some(
      (item) => item.id === node.id && ['output'].includes(item.category),
    )
    const output = {
      content: isSelected
        ? '提取为输出节点「Pick as output」 ✓'
        : '提取为输出节点「Pick as output」',
      className: isSelected ? 'selected-output' : '',
      has_submenu: false,
      callback: () => {
        if (isSelected) {
          paramsNodes = paramsNodes.filter(
            (item) => item.id !== node.id || item.category !== 'output',
          )
        } else {
          const color = getRandomColor()
          // Store essential data plus parent's enriched fields
          paramsNodes.push({
            id: node.id,
            type: node.type, // needed for getRenderComponent
            color,
            category: 'output',
            name: node.title,
            selectedWidget: { id: node.id },
            // These will be filled by parent's handleMessage
            description: '',
            renderComponent: '',
            key: '',
          })
        }
        eventBus.send(
          stringify({
            eventType: 'updateParamsNodes',
            data: paramsNodes,
          }),
        )
      },
    }

    options.push(output)

    return options
  }

  app.canvas.getCanvasMenuOptions = () => []

  app.canvas.centerOnNode = function (node) {
    const parent = this.canvas.parentNode
    const width = parent.offsetWidth
    const height = parent.offsetHeight
    this.ds.offset[0] = -node.pos[0] - node.size[0] * 0.5 + (width * 0.5) / this.ds.scale
    this.ds.offset[1] = -node.pos[1] - node.size[1] * 0.5 + (height * 0.5) / this.ds.scale
    this.setDirty(true, true)
  }

  eventBus.on(async (message) => {
    // message is already parsed (either string was parsed in window.addEventListener, or it came as object)
    const msgData = typeof message === 'string' ? JSON.parse(message) : message
    const { eventType, data } = msgData
    if (eventType === 'updateParamsNodes') {
      paramsNodes = data
      console.log('[ArtifyInject] updateParamsNodes received:', paramsNodes.length, 'nodes')
      paramsNodes.forEach((n) => {
        console.log(
          `  Node ${n.id}: category=${n.category}, color=${n.color}, name=${n.name}, selectedWidget=`,
          n.selectedWidget,
        )
      })
      // Debug: check if nodes exist in graph
      if (app && app.graph) {
        paramsNodes.forEach((n) => {
          const node = app.graph.getNodeById(n.id)
          console.log(`  Graph node ${n.id}:`, node ? 'found' : 'NOT FOUND')
        })
      }
      eventBus.send(
        stringify({
          eventType: 'updateParamsNodes',
          data: paramsNodes,
        }),
      )
    }
    if (eventType === 'centerOnNode') {
      const node = app.graph.getNodeById(data.id)
      app.canvas.centerOnNode(node)
    }
    if (eventType === 'loadGraphData') {
      await app.loadGraphData(data)
      setTimeout(() => {
        const node = app.graph.getNodeById(data.nodes[0].id)
        app.canvas.centerOnNode(node)
        eventBus.send(
          stringify({
            eventType: 'loadGraphData',
          }),
        )
      })
    }
    if (eventType === 'updatePrompt') {
      const res = await app.graphToPrompt()
      eventBus.send(
        stringify({
          eventType: 'updatePrompt',
          data: res,
        }),
      )
    }
  })

  console.log('[ArtifyInject] ComfyUI context initialized')
  // Now notify parent that we're ready (eventBus.on is registered)
  if (onReady) {
    console.log('[ArtifyInject] Calling onReady callback')
    onReady()
  }
}

function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search)
  return params.get(key)
}

function setButton() {
  const style = document.createElement('style')
  style.innerHTML = `
      #floating-btn {
          position: fixed;
          bottom: 205px;
          right: 10px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          border: none;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 10000;
      }

      #floating-btn:hover {
          transform: scale(1.1) rotate(15deg);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      }

      #floating-btn:active {
          transform: scale(0.95);
      }

      #floating-btn::after {
          content: "🎨";
          font-size: 18px;
      }
  `
  document.head.appendChild(style)
  const floatingBtn = document.createElement('button')
  floatingBtn.id = 'floating-btn'
  floatingBtn.title = 'ArtifyLab'
  floatingBtn.ariaLabel = 'ArtifyLab'
  document.body.appendChild(floatingBtn)

  floatingBtn.addEventListener('click', () => {
    window.electronAPI.ArtifyLab.loadArtifyLab()
  })
}

async function getElectronConfig() {
  let config
  try {
    config = await window.electronAPI.ArtifyLab.getConfig()
  } catch (_e) {
    // Ignore errors
  }
  return config
}

async function apiRequest(endpoint, options = {}) {
  let baseUrl
  if (isElectron) {
    const electronConfig = await getElectronConfig()
    baseUrl = electronConfig.server_origin
  } else if (getQueryParam('server_origin')) {
    baseUrl = getQueryParam('server_origin')
  } else {
    baseUrl = 'http://localhost:3000'
  }

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...defaultOptions,
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(errorData.message || `HTTP ${response.status}`)
  }

  return response.json()
}

async function getAppById(appId) {
  const response = await apiRequest(`/api/apps/detail`, {
    method: 'post',
    body: JSON.stringify({
      id: appId,
    }),
  })
  if (response.ok) {
    return response.data
  }
}

async function getConfig() {
  const response = await apiRequest(`/api/config`, {
    method: 'post',
  })
  if (response.ok) {
    return response.data
  }
}

async function loadWorkflow() {
  const { app } = getComfyUIApp()

  if (!app || !app.loadGraphData) {
    // Wait a bit more for app to be ready
    setTimeout(() => loadWorkflow(), 500)
    return
  }

  const config = await getConfig()
  if (!config || !config.activeAppId) {
    return
  }
  const currentApp = await getAppById(config.activeAppId)
  if (!currentApp) {
    return
  }
  const { workflow } = currentApp.template
  await app.loadGraphData(workflow)
}
