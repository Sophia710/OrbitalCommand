import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router, { startRoutePreload } from './router'

// 引入设计系统
import './styles/variables.css'
import './styles/base.css'
import './styles/animations.css'
import './styles/element-overrides.css'

const app = createApp(App)
const pinia = createPinia()

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(ElementPlus, { locale: zhCn })
app.use(router)
app.mount('#app')

// 首屏渲染完成后，在浏览器空闲时段预加载其他路由
startRoutePreload()
