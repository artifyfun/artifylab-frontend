import "./assets/main.css";
import "./assets/antd-custom.css";
import "./assets/global.less";
import { createPinia } from "pinia";
import { createApp } from "vue";

import VxeUI from 'vxe-pc-ui'
import 'vxe-pc-ui/lib/style.css'
import VxeUITable from 'vxe-table'
import 'vxe-table/lib/style.css'
import { applyThemeColors } from '@/utils/theme-utils'

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// 应用主题色
applyThemeColors()

app.use(createPinia());
app.use(router);
app.use(VxeUI)
app.use(VxeUITable)

app.mount("#app");
