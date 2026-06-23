# OrbitalCommand · 数字员工平台

> 基于 **Vite 5 + Vue 3 + Element Plus** 重构的卫星互联网"超级数字员工"控制台前端。
> 完整的工程化实践：路由、状态管理、组件封装、本地 Mock 服务、响应式布局、深/浅主题。

---

## 一、项目简介

**OrbitalCommand** 是面向卫星运营商的运营与测试平台，核心叙事是"数字员工工作台"。

- **专业员工**：终端 / 星地链路 / 载荷 / 全链路编排 四大领域专家。
- **通用员工**：跨团队可用的横向能力助理（报告、洞察、任务编排、翻译等）。

本仓库 (`prototype/`) 是**完整前端工程化**版本，对比同目录下的原生 HTML/JS 原型：

| 维度 | 原生原型 | 本工程（Vue 3） |
| --- | --- | --- |
| 构建 | 无构建，CDN 引入 | Vite 5 工程化 |
| 视图 | 字符串拼接 | 10 个 SFC 组件 + 路由懒加载 |
| 状态 | 全局变量 | Pinia + localStorage 持久化 |
| UI | 自写组件 | Element Plus + 设计令牌覆盖 |
| 数据 | 内联对象 | 本地 Mock 引擎 + 参数校验 |
| 主题 | CSS 类切换 | `data-theme` 属性 + CSS 变量 |
| 响应式 | 媒体查询 | 320px – 1920px 全断点适配 |

---

## 二、技术栈

| 类别 | 选型 |
| --- | --- |
| 构建工具 | Vite 5 |
| 框架 | Vue 3.5（组合式 API） |
| 路由 | Vue Router 4（Hash 模式） |
| 状态管理 | Pinia 2 |
| UI 库 | Element Plus 2.8 |
| 图表 | ECharts 5 + vue-echarts |
| HTTP | Axios（拦截到本地 Mock） |
| 图标 | @element-plus/icons-vue |

---

## 三、目录结构

```
prototype/
├── index.html                 # 入口 HTML
├── package.json               # 依赖与脚本
├── vite.config.js             # Vite 配置（含别名 @）
├── README.md
├── public/                    # 静态资源
│   └── favicon.svg
└── src/
    ├── main.js                # 应用入口（注册插件、图标）
    ├── App.vue                # 根组件（背景 + 路由出口 + Toast）
    │
    ├── router/                # 路由
    │   └── index.js           # 10 业务页 + 404
    │
    ├── stores/                # Pinia
    │   ├── app.js             # 主题 / 侧边栏 / 移动端抽屉
    │   ├── user.js            # 用户信息 / 通知
    │   └── toast.js           # 全局通知
    │
    ├── styles/                # 设计系统
    │   ├── variables.css      # 颜色/字体/间距/圆角/阴影 CSS 变量
    │   ├── base.css           # 全局重置 + 排版基线
    │   ├── animations.css     # 关键帧与过渡
    │   └── element-overrides.css  # Element Plus 暗色覆盖
    │
    ├── api/                   # 数据层
    │   ├── index.js           # Axios 实例 + 拦截器
    │   ├── mock.js            # Mock 引擎（路由注册 / 参数校验 / 延迟）
    │   ├── mock-data.js       # 共享 Mock 数据池
    │   ├── dashboard.js       # 指挥中心 / 数据应用接口
    │   ├── employees.js       # 员工广场 / 我的 / 创建接口
    │   └── tasks-files.js     # 任务 / 文件 / 审核 / 审计 / 设置接口
    │
    ├── components/            # 通用 + 业务组件
    │   ├── AppLayout.vue      # 整体布局（侧边栏 + 顶栏 + 内容）
    │   ├── TopBar.vue         # 顶部栏（搜索/通知/用户菜单/主题切换）
    │   ├── Breadcrumb.vue     # 面包屑
    │   ├── KpiCard.vue        # KPI 卡片（含迷你折线图）
    │   ├── EmployeeCard.vue   # 员工卡片
    │   ├── SatHealthGrid.vue  # 卫星健康度矩阵
    │   ├── FilterBar.vue      # 通用筛选条
    │   ├── EmptyState.vue     # 空状态
    │   └── ToastContainer.vue # 全局 Toast 容器
    │
    ├── views/                 # 业务页面
    │   ├── Dashboard.vue      # 指挥中心
    │   ├── Plaza.vue          # 员工广场
    │   ├── MyEmployees.vue    # 我的员工
    │   ├── Create.vue         # 创建员工
    │   ├── DataView.vue       # 数据应用
    │   ├── Tasks.vue          # 任务监控
    │   ├── Files.vue          # 文件中心
    │   ├── Review.vue         # 审核中心
    │   ├── Audit.vue          # 审计日志
    │   ├── Settings.vue       # 系统设置
    │   └── NotFound.vue       # 404
    │
    └── utils/
        └── index.js           # 工具函数（格式化 / 防抖 / 类型判断）
```

---

## 四、快速开始

### 1. 环境要求

- Node.js **≥ 18.0.0**
- npm **≥ 9** （或 pnpm / yarn）

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

默认地址：<http://127.0.0.1:5174/>（如端口占用 Vite 会自动递增）。

### 4. 生产构建

```bash
npm run build       # 输出到 dist/
npm run preview     # 本地预览构建产物（端口 4173）
```

### 5. 静态部署

`dist/` 目录可直接放到 Nginx / CDN / OSS 等任何静态托管：

```nginx
# Nginx 示例
location / {
    try_files $uri $uri/ /index.html;
}
```

> 路由使用 **Hash 模式**（`#/dashboard`），无需服务端额外配置即可刷新访问。

---

## 五、Mock 服务说明

`src/api/mock.js` 自研了一个轻量 Mock 引擎，业务侧代码使用**真实 Axios 调用**，仅在请求拦截器中改派到本地。

### 5.1 统一响应结构

```ts
interface MockResponse<T> {
  code:    number  // 0 成功 / 1 业务失败 / 400 参数错误 / 404 路由不存在 / 500 异常
  message: string
  data:    T
  ts:      number  // 时间戳
}
```

### 5.2 请求参数校验

每个 mock 路由可声明 `params`（query）和 `body` 规则：

```js
registerRoute('GET /employees/list', {
  params: {
    q:        ['string',  false],
    kind:     ['string',  false],
    pageNo:   ['number',  false],
    pageSize: ['number',  false],
  },
  handler: ({ params }) => { /* ... */ }
})
```

- 第 1 项：类型（`string|number|boolean|array|object`）
- 第 2 项：是否必填
- 第 3 项（可选）：自定义校验函数 `value => true | string`

校验失败抛出 `Error('[字段名] 原因')`，由拦截器转为 `code: 400`。

### 5.3 延迟模拟

```js
// src/api/mock.js
export const DEFAULT_LATENCY = 800
export const JITTER         = 350
```

每次请求 base 延迟 800ms + 0~350ms 随机抖动，模拟真实网络。

### 5.4 切换到真实后端

只需在 `src/api/index.js` 中注释掉 `request` 拦截器内的 `dispatch` 调用，恢复默认 Axios 行为即可，无需改动任何业务代码。

---

## 六、组件库

| 组件 | 说明 |
| --- | --- |
| `AppLayout` | 整体骨架；侧边栏（桌面固定 / 移动端抽屉） + 顶栏 + 内容区 |
| `TopBar` | 顶栏：菜单切换、全局搜索、主题切换、通知、用户菜单 |
| `Breadcrumb` | 自动从路由 `meta.title` 生成 |
| `KpiCard` | KPI 卡片，自带迷你折线图 + 趋势箭头 |
| `EmployeeCard` | 员工卡片（头像渐变 / 标签 / 统计 / 操作） |
| `SatHealthGrid` | 卫星健康度矩阵，支持切换 `8×8` / `16×4` 布局 |
| `FilterBar` | 通用筛选条：搜索 / 单选 / 下拉 / 操作区插槽 |
| `EmptyState` | 空状态：图标 + 标题 + 描述 + 自定义操作 |
| `ToastContainer` | 全局通知（成功 / 失败 / 信息） |

---

## 七、路由

```
/                 → 重定向到 /dashboard
/dashboard        指挥中心
/plaza            员工广场
/my-employees     我的员工
/create           创建员工
/data             数据应用
/tasks            任务监控
/files            文件中心
/review           审核中心
/audit            审计日志
/settings         系统设置
/:pathMatch(.*)*  404 信号丢失
```

---

## 八、状态管理（Pinia）

| Store | 职责 |
| --- | --- |
| `useAppStore` | 主题、侧边栏折叠、移动端抽屉、顶栏搜索；状态持久化到 `localStorage` |
| `useUserStore` | 当前用户、通知列表、未读计数 |
| `useToastStore` | 全局通知队列 |

---

## 九、响应式设计

| 断点 | 适配策略 |
| --- | --- |
| `≥ 1536px` | 完整布局，最大内容宽度 1640px |
| `1280 – 1535px` | Dashboard 双列变单列 |
| `1024 – 1279px` | 侧边栏可折叠 |
| `768 – 1023px` | 顶栏搜索收窄，KPI 卡片 2 列 |
| `480 – 767px` | 顶栏隐藏用户元信息，KPI 单列 |
| `320 – 479px` | 移动端布局：侧边栏转为抽屉、表格横向滚动、表单单列 |

所有自定义断点使用 CSS 变量集中维护，参见 `src/styles/variables.css`。

---

## 十、主题切换

- 默认 **深色** 主题；通过顶栏太阳 / 月亮图标切换。
- 切换时设置 `document.documentElement[data-theme]`，CSS 变量自动生效，**无闪烁**。
- 选择持久化到 `localStorage.oc_theme`，下次进入自动恢复。
- 浅色主题下 Element Plus 暗色覆盖层会自动失效，保证对比度。

---

## 十一、浏览器兼容

- Chrome / Edge **≥ 100**
- Firefox **≥ 100**
- Safari **≥ 15**（含 iOS Safari）

构建目标：`es2020` / `esnext`，未使用 Stage 3+ 实验性语法。

---

## 十二、代码风格

- **Composition API + `<script setup>`**
- 组件 `<style scoped>` + 主题色统一走 CSS 变量
- 业务 API 一律通过 `src/api/*` 暴露的方法调用，**视图不直接访问 mock**
- 工具函数集中 `src/utils/`，避免重复造轮子
- 路由 meta：`title / icon / group` 三段式

---

## 十三、测试脚本

仓库保留 3 个原生 JS 时期的 Node 端到端脚本（与 Vue 业务解耦）：

```bash
npm run test:filter     # 筛选逻辑
npm run test:plaza      # 员工广场集成
npm run test:regression # 回归
npm test                # 一键运行全部
```

> 这些脚本用于验证底层数据 / 工具函数的契约，**与 Vue 渲染无关**。

---

## 十四、常见问题

**Q1：npm install 慢怎么办？**
设置国内镜像：
```bash
npm config set registry https://registry.npmmirror.com
```

**Q2：Element Plus 中文乱码？**
`main.js` 已配置 `app.use(ElementPlus, { locale: zhCn })`，如需其他语言替换该对象。

**Q3：如何新增一个 mock 接口？**
1. 在 `src/api/` 对应模块的 `registerRoute('METHOD /path', { params, body, handler })`
2. 导出调用方法
3. 在视图中通过 `import { yourMethod } from '@/api/...'` 消费

**Q4：如何接入真实后端？**
将 `src/api/index.js` 中 `request` 拦截器内 `await dispatch(...)` 注释掉，Axios 将走真实网络。

---

## 十五、版本

`v2.0.0` —— Vue 3 + Vite + Element Plus 工程化重构版

---

> ⌬ OrbitalCommand · 卫星互联网数字员工平台 · 内部项目
