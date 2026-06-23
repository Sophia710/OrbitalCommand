# OrbitalCommand · 数字员工（原生 JavaScript 原型）

零构建、无框架的 **OrbitalCommand** 卫星互联网"超级数字员工"平台交互原型。本目录下全部内容均为纯 HTML、CSS 和原生 JavaScript，无需任何工具链即可在浏览器中运行。

> 配套项目 **prototype-vue/** 使用 Vue 3 + Element Plus + Vite 重新实现了相同的产品概念。本原生原型适合用于快速 UX 迭代、低保真演示，以及作为底层数据模型的参考实现。

---

## 1. 项目概述

**OrbitalCommand** 是面向卫星运营商的运营与测试平台，以"数字员工"工作台的形式呈现。本原型完整演示了终端用户体验：指挥中心仪表盘、员工广场、员工创建、数据应用、文件中心、任务监控、审核 / 审计以及统一的系统设置面板。

产品叙事围绕两类员工展开：

- **专业员工** —— 按四大领域分组的领域专家：*终端*、*星地链路*、*载荷*、*全链路编排*。
- **通用员工** —— 跨团队可用的横向能力助理（翻译、日程、知识库等）。

本原型的目标是 **视觉与交互保真度**，而非生产级后端。所有数据均由客户端的 Mock 数据模块生成。

### 亮点

- 单页应用，仅由一个 `index.html` 加上三个 JS / CSS 文件即可运行。
- 10 个完整路由的视图（dashboard、plaza、my、create、data、files、tasks、review、audit、settings）。
- 自研设计系统（CSS 自定义属性），支持 **深色 / 浅色主题切换**，且刷新页面时无闪烁。
- 可复用的 **筛选栏** 组件（标签 + 搜索 + 下拉 + 日期 + 重置），状态持久化到 `sessionStorage`。
- **模态框栈**，支持焦点陷阱、ESC 关闭以及带动画的进入 / 离开。
- **Toast** 通知系统、**Tooltip**、面包屑导航、可折叠的持久侧边栏以及系统状态卡片。
- 集成 **Chart.js 4**（折线、柱状、环形、热力图），用于仪表盘和数据应用页。
- 3 个轻量级基于 Node 的测试脚本，无需任何测试框架即可验证筛选逻辑。

---

## 2. 安装说明

本项目没有 `package.json`，也不需要构建步骤。唯一的运行时依赖是 **Chart.js 4**，通过公共 CDN 加载。

### 前置条件

- 任意现代浏览器（Chromium 100+、Firefox 100+、Safari 15+）。
- *（可选）* 一个本地静态 HTTP 服务器，用于模拟真实部署环境（建议使用 —— 部分浏览器会限制 `file://` 下的模块行为）。

### 快速开始

```bash
# 方式一：直接打开文件
# （双击 index.html，或）
xdg-open index.html   # Linux
open index.html       # macOS
start index.html      # Windows
```

```bash
# 方式二：使用小型静态服务器启动目录
# 任选一个已安装的即可：
python -m http.server 8080
#   或
npx --yes http-server -p 8080 .
#   或
npx --yes serve .
```

随后访问 <http://localhost:8080/>。

> **提示：** 由于路由基于 `location.hash`（例如 `#dashboard`、`#plaza`），深度链接在任何静态托管下开箱即用。

---

## 3. 使用指南

### 导航

| 元素                  | 操作                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| 侧边栏                | 点击路由切换视图，当前路由会高亮。                                          |
| 侧边栏折叠按钮        | 左上角汉堡按钮切换侧边栏宽度（仅图标模式）。                                |
| 顶栏搜索框            | `⌘K` / `Ctrl+K` 聚焦搜索输入框（仅 UI 形式，本原型中未启用实际功能）。       |
| 主题切换              | 右上角太阳 / 月亮图标，在深色与浅色主题间切换。                              |
| 面包屑                | 反映当前路由；点击父级片段可返回上级。                                       |
| 帮助 / 设置 / 退出     | 右上角图标按钮 —— 打开包含上下文信息的模态框。                              |
| ESC                  | 关闭最顶层的模态框（并恢复焦点）。                                          |
| Tab / Shift+Tab      | 在打开的模态框内被焦点陷阱限制。                                            |

### 路由（基于 Hash）

```
#dashboard   指挥中心：KPI、流量、告警、卫星健康度等。
#plaza       员工广场：发现并订阅数字员工。
#my          我的员工：已创建或已订阅的，快速访问。
#create      创建员工（零代码向导）。
#data        数据应用：KPI、热力图、图表、自助分析。
#files       文件中心：知识库、文档树、上传。
#tasks       任务监控：端到端任务追踪。
#review      审核中心：员工上架审核。
#audit       审计日志：运营与合规审计。
#settings    系统设置：主题、模型、权限。
```

### Mock 数据速览

所有数据通过 `data.js` 暴露为全局 `window.MOCK`。可以在浏览器控制台中直接访问，例如：

```js
MOCK.EMPLOYEES.length                // → 12
MOCK.KPIS[0].label                   // → "在轨卫星"
MOCK.SAT_HEALTH.filter(s => s.state === 'warn').length
```

### 运行测试

源代码旁有 3 个基于 Node 的测试脚本：

```bash
node __test_matchfilter.js        # matchFilter 单元测试
node __test_plaza_integration.js  # 集成测试：matchFilter + 真实 Mock 数据
node __test_regression.js         # 回归测试：筛选变体（select / date / chip / search）
```

每个脚本都会输出 `PASS/FAIL` 汇总，并在失败时返回非零退出码，可直接接入 CI 钩子。

---

## 4. 核心功能

| 区域                | 功能说明                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **指挥中心**        | 4 张 KPI 卡片（含迷你折线图）、流量折线图、波束负载柱状图、64 颗卫星健康度矩阵、告警列表。     |
| **员工广场**        | 推荐 / 热门 / 最新员工、筛选标签、搜索、员工详情模态框。                                       |
| **我的员工**        | 分标签页查看自创建与已订阅员工，附带用量统计。                                                  |
| **创建员工**        | 可视化画布（工作流编辑器）支持节点拖拽，另有向导式配置表单。                                   |
| **数据应用**        | KPI 网格、地区 × 时间热力图、环形图 + 折线图、可下钻的表格。                                    |
| **文件中心**        | 双栏文件树 + 文档列表、上传区、文档解析状态展示。                                              |
| **任务监控**        | 实时任务列表，含进度条、状态标签和单任务的上下文菜单。                                          |
| **审核中心**        | 审批 / 驳回提交上架的员工，附带审核备注。                                                      |
| **审计日志**        | 仅追加的事件日志，含严重级别、来源、操作用户与时间戳。                                          |
| **系统设置**        | 主题、语言、模型选择、角色与权限开关。                                                          |
| **横切能力**        | 筛选栏、模态框栈、Toast、面包屑、可折叠侧边栏、系统状态卡片。                                  |

---

## 5. 目录结构

```
prototype/
├── index.html              # 应用外壳：侧边栏、顶栏、内容根、模态框 / Toast 根节点
├── app.js                  # 约 1,900 行的 IIFE：路由、渲染、组件、状态
├── data.js                 # Mock 数据：NAV、USER、KPIS、TASKS、EMPLOYEES、SKILLS、KB 等
├── styles.css              # 设计系统 + 布局 + 组件样式（约 1,400 行）
├── assets/
│   └── fonts.css           # Google Fonts 引入 + 离线安全字体栈
├── __test_matchfilter.js   # matchFilter 辅助函数的单元测试
├── __test_plaza_integration.js # 基于真实 MOCK.EMPLOYEES 的集成测试
└── __test_regression.js    # 筛选变体的回归测试
```

### 分层架构

1. **标记层** —— `index.html` 提供静态外壳（侧边栏、顶栏、模态框 / Toast 根节点）。视图内容由 JS 渲染到 `#content` 中。
2. **数据层** —— `data.js` 暴露 `window.MOCK`，可视为屏幕与演示的唯一真实数据源。
3. **应用层** —— `app.js` 是一个 IIFE，串联起路由、状态与各视图的渲染函数。每个视图对应一个 `renderXxx(root)` 函数。
4. **样式层** —— `styles.css` 定义设计令牌、动画化的深空背景、布局栅格与组件样式。`assets/fonts.css` 提供 CDN 优先、离线兜底的字体加载策略。

### 状态模型

```js
const state = {
  route:    'dashboard' | 'plaza' | 'my' | 'create' | ...,
  theme:    'dark' | 'light',     // 持久化到 localStorage 的 'oc_theme'
  chatOpen: boolean,
  charts:   { [canvasId]: Chart } // 跟踪所有图表实例，便于在重新渲染时销毁
};
```

### 新增视图

1. 在 `data.js → NAV` 中新增 `{ id, label, icon, group, count? }` 条目。
2. 如需短链，在 `app.js → routeAlias(id)` 中补充映射。
3. 实现 `renderXxx(root)`，并在 `render()` 内部的 `map` 中注册。

---

## 6. 开发环境搭建

### 推荐工具

- **编辑器**：VS Code，安装 *ESLint*、*Prettier*、*HTML CSS Support* 扩展。
- **浏览器**：Chrome / Edge，打开 DevTools。即使没有 source map，*Sources* 面板也能在 `app.js` 中打断点。
- **热更新**（可选）：使用 VS Code *Live Server* 扩展，或运行监听器：

  ```bash
  npx --yes live-server --port=8080 .
  ```

### 可选：类型检查与代码风格检查

本项目未配置工具链，但代码本身是纯 ES2020。如需最小化的本地配置：

```bash
npm init -y                       # 仅在需要本地开发外壳时执行
npm i -D eslint prettier
```

可将起步配置文件复制到项目根目录以启用严格校验。

### 编码约定

- 所有 JS 都在 `app.js` 的一个 IIFE 中；除非迁移到支持模块的工程，否则不要引入 `import` 语句。
- 复用现有辅助函数（`$`、`$$`、`el`、`SVG`、`btn`、`pageHead`、`panel`、`legend`、`chartBase`），不要重复造轮子。
- 颜色与间距一律从 `styles.css` 顶部定义的 CSS 自定义属性中取（如 `var(--accent)`、`var(--ink-2)`）。
- 新的 Mock 数据统一放入 `data.js`，不要在渲染函数中硬编码夹具。

---

## 7. 贡献指南

1. **分支命名**：`feat/<scope>`、`fix/<scope>`、`chore/<scope>`。
2. **提交**：简短祈使句标题（≤ 72 字符），例如 `feat(plaza): add domain filter chip`。
3. **Pull Request** 必须满足：
   - 在描述中引用对应的 PRD 章节 / 用户故事。
   - 任何视觉变更需提供修改前 / 修改后的截图。
   - 新增 Mock 实体时同步更新 `data.js`，并运行全部 3 个 `__test_*.js` 脚本以保证一致性。
4. **编码风格**：
   - 2 空格缩进、单引号、语句结尾带分号（与现有文件保持一致）。
   - 函数保持短小；渲染函数应委托给更小的辅助函数。
   - 避免引入新的运行时依赖。如确实必要，需在 PR 中说明理由。
5. **测试**：任何对 `matchFilter` 或筛选栏配置的修改必须扩展对应的 `__test_*.js`。导致测试失败即为阻塞性变更。
6. **可访问性**：所有交互元素必须支持键盘操作，模态框必须保持焦点陷阱正常工作。

---

## 8. 许可证信息

本原型 **为内部专有、保密项目**。仅授权给经过批准的协作者使用，仅用于评估 OrbitalCommand 产品概念。

- **版权**：© 2026 OrbitalCommand / 数字员工团队。保留所有权利。
- **允许用途**：在所属组织内部进行本地执行、内部演示、设计评审与学术参考。
- **禁止用途**：再发布、公开展示、商业部署、训练第三方模型，或在未经项目所有者书面许可的情况下用于上述范围之外的任何场景。

本原型使用的第三方资源：

| 资源                            | 来源                                                  | 许可证            |
| ------------------------------ | ----------------------------------------------------- | ----------------- |
| **Chart.js 4.4.1**             | `https://cdn.jsdelivr.net/npm/chart.js@4.4.1`         | MIT               |
| **Sora / Manrope / JetBrains Mono** | Google Fonts                                       | SIL Open Font 1.1 |

如需在组织外发布本原型的衍生版本，请将 CDN 加载的 Chart.js 替换为自托管版本，并按照发布策略审查 Google Fonts 的使用情况。


python -m http.server 8080
