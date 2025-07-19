const artify_inject = getQueryParam("artify_inject");

const isElectron = !!window.electronAPI;

// if (artify_inject !== "readonly") {
//   loadWorkflow()
// }

window.addEventListener("load", function () {
  let timer = null;
  const global = window;

  if (artify_inject === "readonly") {
    loadCssCode(
      `.comfy-menu {
          display: none !important;
        }
        .comfyui-body-top {
          display: none !important;
        }
        .comfyui-body-left {
          display: none !important;
        }
        .comfy-menu-hamburger {
          display: none !important;
        }
        .workflow-tabs-container {
          display: none !important;
        }
        .actionbar {
          display: none !important;
        }

        .litemenu-entry.submenu.selected {
          color: yellow !important;
        }

        .litemenu-entry.submenu.selected-output {
          color: yellow !important;
        }

        rgthree-progress-bar {
          display: none !important;
        }

        .pysssss-image-feed {
          display: none !important;
        }
        .p-panel.p-component.selection-toolbox {
          display: none !important;
        }
      `,
      global
    );
  }

  let counter = 0;
  function loop() {
    counter++;
    clearTimeout(timer);
    if (counter > 100) {
      return;
    }
    timer = setTimeout(() => {
      const { LGraph, app } = global;
      if (LGraph && app) {
        if (artify_inject !== "readonly") {
          setButton()
          loadWorkflow(app)
          // loadCssCode(
          //   `.comfyui-body-top {
          //       display: none !important;
          //     }
          //   `,
          //   global
          // );
          return
        }

        handleComfyuiContext(global);
        console.log(global);
        const message = JSON.stringify({
          eventType: "onload",
        });
        window.parent.postMessage(message, "*");
      } else {
        loop();
      }
    }, 100);
  }

  loop();
});

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (a) =>
    (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
  );
}

function getRandomColor() {
  return `#${`00000${((Math.random() * 0x1000000) << 0).toString(16)}`.substr(
    -6
  )}`;
}

function serializer(replacer, cycleReplacer) {
  var stack = [],
    keys = [];

  if (cycleReplacer == null)
    cycleReplacer = function (key, value) {
      if (stack[0] === value) return "[Circular ~]";
      return (
        "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
      );
    };

  return function (key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this);
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value);
    } else stack.push(value);

    return replacer == null ? value : replacer.call(this, key, value);
  };
}

function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces);
}

function loadCssCode(code, window) {
  const { document } = window;
  const style = document.createElement("style");
  style.type = "text/css";
  style.rel = "stylesheet";
  style.appendChild(document.createTextNode(code));
  const head = document.getElementsByTagName("head")[0];
  head.appendChild(style);
}

function handleComfyuiContext(window) {
  const eventBus = {
    callbacks: [],
    send: (message) => {
      window.parent.postMessage(message, "*");
    },
    on: (cb) => {
      eventBus.callbacks.push(cb);
    },
  };

  window.addEventListener("message", (event) => {
    for (const i in eventBus.callbacks) {
      eventBus.callbacks[i](event.data);
    }
  });

  const { app, LiteGraph } = window;

  app.canvas.allow_dragnodes = false;
  app.canvas.allow_reconnect_links = false;
  app.canvas.allow_searchbox = false;
  // app.canvas.read_only = true
  app.ui.menuContainer.click();
  app.ui.menuContainer.style.display = "none";
  app.ui.menuContainer.remove();

  app.handleFile = () => { };

  let paramsNodes = [];
  const origin_drawNodeShape = app.canvas.drawNodeShape;
  app.canvas.drawNodeShape = function (
    node,
    ctx,
    size,
    fgcolor,
    bgcolor,
    selected
  ) {
    const isSelected = paramsNodes.some((item) => item.id === node.id);
    const outputNode = paramsNodes.find(
      (item) => item.id === node.id && ["output"].includes(item.category)
    );
    fgcolor = outputNode ? outputNode.color : fgcolor;
    bgcolor = outputNode ? outputNode.color : bgcolor;
    selected = isSelected;
    const res = origin_drawNodeShape.call(
      this,
      node,
      ctx,
      size,
      fgcolor,
      bgcolor,
      selected
    );
    return res;
  };

  app.canvas.drawNodeWidgets = function (node, posY, ctx, active_widget) {
    if (!node.widgets || !node.widgets.length) {
      return 0;
    }
    const width = node.size[0];
    const widgets = node.widgets;
    posY += 2;
    const H = LiteGraph.NODE_WIDGET_HEIGHT;
    const show_text = this.ds.scale > 0.5;
    ctx.save();
    ctx.globalAlpha = this.editor_alpha;
    const outline_color = LiteGraph.WIDGET_OUTLINE_COLOR;
    let background_color = LiteGraph.WIDGET_BGCOLOR;
    const text_color = LiteGraph.WIDGET_TEXT_COLOR;
    const secondary_text_color = LiteGraph.WIDGET_SECONDARY_TEXT_COLOR;
    const margin = 15;

    for (let i = 0; i < widgets.length; ++i) {
      const w = widgets[i];
      const current = paramsNodes.find(
        (item) => item.id === node.id && item.selectedWidget.name === w.name
      );
      if (current) {
        background_color = current.color;
      } else {
        background_color = LiteGraph.WIDGET_BGCOLOR;
      }
      let y = posY;
      if (w.y) {
        y = w.y;
      }
      w.last_y = y;
      ctx.strokeStyle = outline_color;
      ctx.fillStyle = "#222";
      ctx.textAlign = "left";
      //ctx.lineWidth = 2;
      if (w.disabled) ctx.globalAlpha *= 0.5;
      const widget_width = w.width || width;

      switch (w.type) {
        case "button":
          ctx.fillStyle = background_color;
          if (w.clicked) {
            ctx.fillStyle = "#AAA";
            w.clicked = false;
            this.dirty_canvas = true;
          }
          ctx.fillRect(margin, y, widget_width - margin * 2, H);
          if (show_text && !w.disabled)
            ctx.strokeRect(margin, y, widget_width - margin * 2, H);
          if (show_text) {
            ctx.textAlign = "center";
            ctx.fillStyle = text_color;
            ctx.fillText(w.label || w.name, widget_width * 0.5, y + H * 0.7);
          }
          break;
        case "toggle":
          ctx.textAlign = "left";
          ctx.strokeStyle = outline_color;
          ctx.fillStyle = background_color;
          ctx.beginPath();
          if (show_text)
            ctx.roundRect(margin, y, widget_width - margin * 2, H, [H * 0.5]);
          else ctx.rect(margin, y, widget_width - margin * 2, H);
          ctx.fill();
          if (show_text && !w.disabled) ctx.stroke();
          ctx.fillStyle = w.value ? "#89A" : "#333";
          ctx.beginPath();
          ctx.arc(
            widget_width - margin * 2,
            y + H * 0.5,
            H * 0.36,
            0,
            Math.PI * 2
          );
          ctx.fill();
          if (show_text) {
            ctx.fillStyle = secondary_text_color;
            const label = w.label || w.name;
            if (label != null) {
              ctx.fillText(label, margin * 2, y + H * 0.7);
            }
            ctx.fillStyle = w.value ? text_color : secondary_text_color;
            ctx.textAlign = "right";
            ctx.fillText(
              w.value ? w.options.on || "true" : w.options.off || "false",
              widget_width - 40,
              y + H * 0.7
            );
          }
          break;
        case "slider": {
          ctx.fillStyle = background_color;
          ctx.fillRect(margin, y, widget_width - margin * 2, H);
          const range = w.options.max - w.options.min;
          let nvalue = (w.value - w.options.min) / range;
          if (nvalue < 0.0) nvalue = 0.0;
          if (nvalue > 1.0) nvalue = 1.0;
          ctx.fillStyle = Object.prototype.hasOwnProperty.call(
            w.options,
            "slider_color"
          )
            ? w.options.slider_color
            : active_widget === w
              ? "#89A"
              : "#678";
          ctx.fillRect(margin, y, nvalue * (widget_width - margin * 2), H);
          if (show_text && !w.disabled)
            ctx.strokeRect(margin, y, widget_width - margin * 2, H);
          if (w.marker) {
            let marker_nvalue = (w.marker - w.options.min) / range;
            if (marker_nvalue < 0.0) marker_nvalue = 0.0;
            if (marker_nvalue > 1.0) marker_nvalue = 1.0;
            ctx.fillStyle = Object.prototype.hasOwnProperty.call(
              w.options,
              "marker_color"
            )
              ? w.options.marker_color
              : "#AA9";
            ctx.fillRect(
              margin + marker_nvalue * (widget_width - margin * 2),
              y,
              2,
              H
            );
          }
          if (show_text) {
            ctx.textAlign = "center";
            ctx.fillStyle = text_color;
            ctx.fillText(
              w.label ||
              `${w.name}  ${Number(w.value).toFixed(
                w.options.precision != null ? w.options.precision : 3
              )}`,
              widget_width * 0.5,
              y + H * 0.7
            );
          }
          break;
        }
        case "number":
        case "combo":
          ctx.textAlign = "left";
          ctx.strokeStyle = outline_color;
          ctx.fillStyle = background_color;
          ctx.beginPath();
          if (show_text)
            ctx.roundRect(margin, y, widget_width - margin * 2, H, [H * 0.5]);
          else ctx.rect(margin, y, widget_width - margin * 2, H);
          ctx.fill();
          if (show_text) {
            if (!w.disabled) ctx.stroke();
            ctx.fillStyle = text_color;
            if (!w.disabled) {
              ctx.beginPath();
              ctx.moveTo(margin + 16, y + 5);
              ctx.lineTo(margin + 6, y + H * 0.5);
              ctx.lineTo(margin + 16, y + H - 5);
              ctx.fill();
              ctx.beginPath();
              ctx.moveTo(widget_width - margin - 16, y + 5);
              ctx.lineTo(widget_width - margin - 6, y + H * 0.5);
              ctx.lineTo(widget_width - margin - 16, y + H - 5);
              ctx.fill();
            }
            ctx.fillStyle = secondary_text_color;
            ctx.fillText(w.label || w.name, margin * 2 + 5, y + H * 0.7);
            ctx.fillStyle = text_color;
            ctx.textAlign = "right";
            if (w.type === "number") {
              ctx.fillText(
                Number(w.value).toFixed(
                  w.options.precision !== undefined ? w.options.precision : 3
                ),
                widget_width - margin * 2 - 20,
                y + H * 0.7
              );
            } else {
              let v = w.value;
              if (w.options.values) {
                let values = w.options.values;
                if (values.constructor === Function) values = values();
                if (values && values.constructor !== Array) v = values[w.value];
              }
              ctx.fillText(v, widget_width - margin * 2 - 20, y + H * 0.7);
            }
          }
          break;
        case "customtext":
          w.element.style.background = background_color;
          if (w.draw) {
            w.draw(ctx, node, widget_width, y, H);
          }
          break;
        case "string":
        case "text":
          ctx.textAlign = "left";
          ctx.strokeStyle = outline_color;
          ctx.fillStyle = background_color;
          ctx.beginPath();
          if (show_text)
            ctx.roundRect(margin, y, widget_width - margin * 2, H, [H * 0.5]);
          else ctx.rect(margin, y, widget_width - margin * 2, H);
          ctx.fill();
          if (show_text) {
            if (!w.disabled) ctx.stroke();
            ctx.save();
            ctx.beginPath();
            ctx.rect(margin, y, widget_width - margin * 2, H);
            ctx.clip();

            //ctx.stroke();
            ctx.fillStyle = secondary_text_color;
            const label = w.label || w.name;
            if (label != null) {
              ctx.fillText(label, margin * 2, y + H * 0.7);
            }
            ctx.fillStyle = text_color;
            ctx.textAlign = "right";
            ctx.fillText(
              String(w.value).substr(0, 30),
              widget_width - margin * 2,
              y + H * 0.7
            ); //30 chars max
            ctx.restore();
          }
          break;
        default:
          if (w.draw) {
            w.draw(ctx, node, widget_width, y, H);
          }
          break;
      }
      posY += (w.computeSize ? w.computeSize(widget_width)[1] : H) + 4;
      ctx.globalAlpha = this.editor_alpha;
    }
    ctx.restore();
    ctx.textAlign = "left";
  };

  const origin_getNodeMenuOptions = app.canvas.getNodeMenuOptions;
  app.canvas.getNodeMenuOptions = function (...res) {
    const node = res[0];
    const options = origin_getNodeMenuOptions.call(this, ...res);
    options.splice(0, options.length);

    if (node.widgets) {
      const selectedWidgets = node.widgets.filter((widget) => {
        const isSelected = paramsNodes.some(
          (item) =>
            item.id === node.id && item.selectedWidget.name === widget.name
        );
        return isSelected;
      });

      const input = {
        content: `提取输入「Pick as input」 [${selectedWidgets.length}/${node.widgets.length}]`,
        has_submenu: true,
        submenu: {
          options: node.widgets.map((widget) => {
            const isSelected = paramsNodes.some(
              (item) =>
                item.id === node.id && item.selectedWidget.name === widget.name
            );
            return {
              content: isSelected ? `${widget.name} ✓` : widget.name,
              className: isSelected ? "selected" : "",
              callback: () => {
                if (isSelected) {
                  paramsNodes = paramsNodes.filter(
                    (item) =>
                      item.id !== node.id ||
                      (item.id === node.id &&
                        item.selectedWidget.name !== widget.name)
                  );
                } else {
                  const color = getRandomColor();
                  paramsNodes.push({
                    ...node,
                    graph: undefined,
                    color,
                    category: "input",
                    name: widget.name,
                    selectedWidget: widget,
                  });
                }
                eventBus.send(
                  stringify({
                    eventType: "updateParamsNodes",
                    data: paramsNodes,
                  })
                );
              },
            };
          }),
        },
      };

      options.push(input);
    }

    const isSelected = paramsNodes.some(
      (item) => item.id === node.id && ["output"].includes(item.category)
    );
    const output = {
      content: isSelected ? "提取为输出节点「Pick as output」 ✓" : "提取为输出节点「Pick as output」",
      className: isSelected ? "selected-output" : "",
      has_submenu: false,
      callback: () => {
        if (isSelected) {
          const index = paramsNodes.findIndex(
            (item) => item.id === node.id && item.selectedWidget.id === node.id
          );
          paramsNodes.splice(index, 1);
        } else {
          const color = getRandomColor();
          paramsNodes.push({
            ...node,
            graph: undefined,
            color,
            category: "output",
            name: node.title,
            selectedWidget: { ...node, graph: undefined },
          });
        }
        eventBus.send(
          stringify({
            eventType: "updateParamsNodes",
            data: paramsNodes,
          })
        );
      },
    };

    options.push(output);

    return options;
  };

  app.canvas.getCanvasMenuOptions = () => [];

  app.canvas.centerOnNode = function (node) {
    const parent = this.canvas.parentNode;
    const width = parent.offsetWidth;
    const height = parent.offsetHeight;
    this.ds.offset[0] =
      -node.pos[0] - node.size[0] * 0.5 + (width * 0.5) / this.ds.scale;
    this.ds.offset[1] =
      -node.pos[1] - node.size[1] * 0.5 + (height * 0.5) / this.ds.scale;
    this.setDirty(true, true);
  };

  eventBus.on(async (message) => {
    const { eventType, data } = JSON.parse(message);
    if (eventType === "updateParamsNodes") {
      paramsNodes = data;
      eventBus.send(
        stringify({
          eventType: "updateParamsNodes",
          data: paramsNodes,
        })
      );
    }
    if (eventType === "centerOnNode") {
      const node = app.graph.getNodeById(data.id);
      app.canvas.centerOnNode(node);
    }
    if (eventType === "loadGraphData") {
      await app.loadGraphData(data);
      setTimeout(() => {
        const node = app.graph.getNodeById(data.nodes[0].id);
        app.canvas.centerOnNode(node);
        eventBus.send(
          stringify({
            eventType: "loadGraphData",
          })
        );
      });
    }
    if (eventType === "updatePrompt") {
      const res = await app.graphToPrompt();
      eventBus.send(
        stringify({
          eventType: "updatePrompt",
          data: res,
        })
      );
    }
  });
}

function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function setButton() {
  // 创建浮动按钮的样式
  const style = document.createElement('style');
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
          z-index: 10000; /* 确保在最上层 */
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
  `;
  document.head.appendChild(style);
  // 创建按钮元素
  const floatingBtn = document.createElement('button');
  floatingBtn.id = 'floating-btn';
  floatingBtn.title = 'ArtifyLab';
  floatingBtn.ariaLabel = 'ArtifyLab';

  // 添加到body
  document.body.appendChild(floatingBtn);

  // 点击事件处理
  floatingBtn.addEventListener('click', () => {
    window.electronAPI.ArtifyLab.loadArtifyLab()
  });
}

async function getElectronConfig() {
  let config
  try {
    config = await window.electronAPI.ArtifyLab.getConfig()
  } catch (_e) {
    // console.log(_e)
  }
  return config
}

// API 请求工具函数
async function apiRequest(endpoint, options = {}) {
  let baseUrl
  if (isElectron) {
    const electronConfig = await getElectronConfig()
    baseUrl = electronConfig.server_origin
  } else if (getQueryParam('server_origin')) {
    baseUrl = getQueryParam('server_origin')
  } else {
    baseUrl = config.value.serverHost
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

// 根据ID获取应用 - 调用后端接口
async function getAppById(appId) {
  const response = await apiRequest(`/api/apps/detail`, {
    method: 'post',
    body: JSON.stringify({
      id: appId
    })
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

async function loadWorkflow(app) {
  const config = await getConfig()
  if (!config.activeAppId) {
    return
  }
  const currentApp = await getAppById(config.activeAppId)
  if (!currentApp) {
    return
  }
  const { workflow } = currentApp.template
  await app.loadGraphData(workflow);
}
