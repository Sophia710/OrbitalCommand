# 专栏订阅模块 · 实施计划

> 关联 Spec:`docs/superpowers/specs/2026-06-23-columns-subscription-design.md` · 日期:2026-06-23
> 范围:仅 frontend, 8 步顺序实施, 每步可独立验证。

---

## 总览

| 步骤 | 目标 | 涉及文件 | 验证 |
|---|---|---|---|
| 1 | 状态层 v2 → v3 简化 | `composables/useColumnSubscriptions.js` | 单元手测 + 跨 tab 同步 |
| 2 | Mock + API 扩展 | `api/mock-data.js` · `api/smart-center.js` | 调用 `getColumnArticles` 验证 |
| 3 | 路由 + 面包屑 | `router/index.js` · `components/TopBar.vue` | `/columns/:id` 200, 面包屑 5 级 |
| 4 | ColumnDetail 新建 | `views/ColumnDetail.vue` | 加载 / 订阅 / 文章列表 / 空态 |
| 5 | ArticleDetail 微调 | `views/ArticleDetail.vue` | 移除 unread + 上下篇 + 返回专栏 |
| 6 | 拆分子组件 | `views/columns/ColumnsMarketView.vue` · `views/columns/ColumnsMineView.vue` | 视图与原行为一致 |
| 7 | Columns.vue 改造 | `views/Columns.vue` | 降至 < 250 行, 仅 layout |
| 8 | 全链路验收 | (不写新代码) | 验收清单逐条过 |

**总预计改动**:7 个文件新增 / 改造, 0 个依赖新增。

---

## 步骤 1:状态层 v2 → v3 简化

**目标**:`useColumnSubscriptions` 只保留订阅状态, 移除 unread / notify。

**改动文件**:`frontend/src/composables/useColumnSubscriptions.js`(整体重写)

**实施细节**

1. 修改 `STORAGE_KEY` 为 `'user:columns:subs:v3'`, `SCHEMA_VERSION = 3`
2. 修改 `readJSON` 兼容分支:
   - 旧 v1:subscribed_at 迁移
   - 旧 v2:丢弃 notify / frequency / last_seen_at / last_article_at, 仅保留 subscribed_at
   - 无 `__v` 时按 v1 处理
3. 重写 store 为 `Ref<Record<id, number>>`(值 = subscribed_at timestamp)
4. API 收敛:
   ```js
   {
     store, list, count, ids,
     isSubscribed, subscribe, unsubscribe, toggle,
     batchSubscribe, batchUnsubscribe,
     teardown,
   }
   ```
5. 删除 `setNotifyPrefs` / `markSeen` / `hasNew`
6. 保留 `watch` 持久化与 `storage` 事件跨 tab 同步
7. `ids` 实现为 `ComputedRef<Set<string>>` 供 O(1) 查询

**风险**:旧 v2 数据若未迁移会丢失订阅。**缓解**:兼容分支直接接受 v2 结构并裁剪字段。

**验证**
- 清空 localStorage → 刷新 → 订阅 col-001 → 控制台 `localStorage.getItem` 应见 `__v:3` 与 `col-001`
- A 标签订阅 → B 标签刷新 → 订阅状态可见
- 旧 v2 数据(本地写一份 stub) → 启动后被迁移为 v3

---

## 步骤 2:Mock + API 扩展

**目标**:为 ColumnDetail 提供文章列表数据。

### 2.1 mock-data.js

**改动文件**:`frontend/src/api/mock-data.js`

**实施细节**
- 已有 `ARTICLES_CONTENT` 池(3 条精校:`col-001-art-1/2/3`)保留
- 新增 `buildArticleList(columnId, limit = 20)`:
  1. 在 `ARTICLES_CONTENT` 找出 `key.startsWith(columnId + '-art-')` 的条目
  2. 不够用 `buildArticleContent` 兜底补齐到 `limit`
  3. 按 `published_at` 倒序
  4. 返回精简字段:`{ id, title, summary, published_at, reading_minutes, column_id, column_title, cover_color, author, author_title, category, tags }`
- 导出 `MOCK.buildArticleList`

### 2.2 smart-center.js

**改动文件**:`frontend/src/api/smart-center.js`

**实施细节**
- 新增路由注册:
  ```js
  registerRoute('GET /columns/:id/articles', {
    params: { id: ['string', true], limit: ['number', false] },
    handler: ({ params }) => {
      const col = MOCK.columns.find(c => c.id === params.id)
      if (!col) throw new Error('专栏不存在')
      return MOCK.buildArticleList(params.id, params.limit || 20)
    },
  })
  ```
- 新增导出:
  ```js
  export const getColumnArticles = (id, limit) =>
    http.get(`/columns/${id}/articles`, { params: { limit } })
  ```
- 在文件末尾加注释,说明 mock 路由族(`/columns/list` / `/columns/recent` / `/columns/:id/articles` / `/columns/article-detail`)

**验证**
- 控制台: `await http.get('/columns/col-001/articles')` 返回 ≥ 1 条
- `await http.get('/columns/nonexistent/articles')` 抛错

---

## 步骤 3:路由 + 面包屑

**目标**:新增 `/columns/:id` 路由, TopBar 面包屑支持。

### 3.1 router/index.js

**改动文件**:`frontend/src/router/index.js`

**实施细节**
- 在 `routeImports` 中新增:
  ```js
  '/columns/:id': () => import('@/views/ColumnDetail.vue'),
  ```
- 在 `routes` 数组中追加:
  ```js
  {
    path: '/columns/:id',
    name: 'ColumnDetail',
    component: () => import('@/views/ColumnDetail.vue'),
    meta: { title: '专栏详情', group: 'main', icon: 'Reading', hidden: true },
  },
  ```

### 3.2 components/TopBar.vue

**改动文件**:`frontend/src/components/TopBar.vue`

**实施细节**
- 在 `breadcrumbTrail` computed 中, `/columns/article/:id` 分支之前插入:
  ```js
  // 0.4) 特殊处理:专栏详情 (ColumnDetail 路由)
  //    归到 智能中心 → 知识库 → 专栏订阅 → 专栏详情
  //    注意: 须排除 /columns/article/:id(已由分支 0.5 处理)
  if (
    name === 'columndetail' ||
    (path.startsWith('columns/') &&
     !path.startsWith('columns/article/') &&
     path !== 'columns')
  ) {
    return [
      { id: 'smart-center', label: '智能中心', clickable: true },
      { id: 'knowledge',    label: '知识库',   clickable: true },
      { id: 'columns',      label: '专栏订阅', clickable: true },
      { id: 'column',       label: '专栏详情', clickable: false },
    ]
  }
  ```

**验证**
- 访问 `/#/columns/col-001` 渲染 ColumnDetail
- 面包屑显示 `智能中心 / 知识库 / 专栏订阅 / 专栏详情`

---

## 步骤 4:ColumnDetail.vue 新建

**目标**:专栏详情页(独立路由, 承载元信息 + 文章列表 + 订阅按钮)。

**新增文件**:`frontend/src/views/ColumnDetail.vue`

**实施细节**

1. **基础骨架**(`<script setup>`):
   - `useRoute()` 取 `params.id`
   - `useColumnSubscriptions()` 取订阅 store
   - `onMounted` 拉专栏 + 文章列表
   - `loading` / `column` / `articles` / `error` 四个 ref
   - `getColumnArticles(id, 20)` 拉数据

2. **模板**:
   - 顶部工具条:返回按钮 + 面包屑占位(由 TopBar 注入)
   - 专栏头(渐变 160px):分类 pill + 标题 + 描述
   - 元信息条:文章数 · 订阅数 · 标签 · 订阅按钮(主/次)
   - 分割线
   - 文章列表(单列时间倒序):每行 日期块 + 标题/摘要/元信息 + 箭头
   - 三态:loading / empty(专栏不存在)/ error

3. **交互**:
   - 订阅按钮:点击直接 `subscribe(id)`, toast `已订阅「<title>」`
   - 取消按钮:点击 → `ElMessageBox.confirm` → 确认后 `unsubscribe(id)` + toast
   - 文章项点击 → `router.push('/columns/article/' + id)`
   - 列表项 hover 动效(沿用样式)

4. **样式**:
   - 沿用现有 `--accent` / `--ink` / `--surface` 变量
   - 复用 Columns 中已存在的 `.column-xxx` 类名命名空间
   - 渐变背景按 `cover_color` 计算

**验证**
- 访问 `/#/columns/col-001` 正常显示
- 点击订阅按钮:store 出现 col-001 + 按钮态切换 + toast
- 点击文章:跳转 `/columns/article/col-001-art-1`
- 访问 `/#/columns/col-999` 显示未找到 + 返回按钮

---

## 步骤 5:ArticleDetail.vue 微调

**目标**:移除 unread 逻辑, 新增"返回专栏"与"上下篇"控件。

**改动文件**:`frontend/src/views/ArticleDetail.vue`

**实施细节**

1. **移除**:
   - `<script>` 中 `markSeen` 调用(整段 onMounted 副作用)
   - 模板中 `isUnseen(a)` 相关判断与 `recent-item--unseen` / `mine-item--new-badge` class
   - 移除 `useColumnSubscriptions` 中未用到的 `markSeen` / `hasNew` 引用

2. **新增**:
   - 顶部工具条 "← 返回专栏" 按钮:从 article id 解析 column_id, `router.push('/columns/' + column_id)`
   - 文章底部 `上一篇 / 下一篇` 控件:
     - 从 `article.related` 派生(或调 `getColumnArticles(column_id)` 拉一次)
     - 边界处理:首篇禁用"上一篇", 末篇禁用"下一篇"
     - 点击 → `router.push('/columns/article/' + nextId)`

3. **不动**:
   - 摘要 / 分节 / 关联阅读(2-3 篇卡片, 现有)
   - 点赞 / 收藏 / 分享(继续走 `ElMessage` 占位)

**验证**
- 访问 `/#/columns/article/col-001-art-1`: 顶部显示"返回专栏"按钮, 底部显示上下篇
- 点击"返回专栏": 跳到 `/#/columns/col-001`
- 无 unread 角标(已确认无 `isUnseen` 调用)

---

## 步骤 6:拆分子组件

**目标**:把 Columns.vue 的市场页 / 我的订阅 + 近期更新 拆为两个独立组件。

### 6.1 新建 `views/columns/ColumnsMarketView.vue`

**从 Columns.vue 抽出**:
- `<section class="columns-toolbar">`(分类 / 搜索 / 状态 tabs)
- `<section class="market-grid">`(卡片网格)
- 关联 computed: `filteredColumns`, `categoryCount`, `statusCount`
- 关联方法: `onCardClick`, `quickSubscribe`, `quickUnsubscribe`
- 关联 data: `filter` reactive

**实施细节**
- 创建 `frontend/src/views/columns/` 目录
- 把市场页相关 template + script + style 整体搬入
- 不持有订阅 store, 通过 `useColumnSubscriptions()` 直接获取
- 触发订阅 / 取消后, emit `toast` 事件给 Columns.vue(Columns 接住后调 ElMessage)
- 或:子组件内直接用 `ElMessage.success`(不 emit),Columns.vue 不再关心
- **决策**:子组件直接用 `ElMessage` + `useToast`, 更解耦

### 6.2 新建 `views/columns/ColumnsMineView.vue`

**从 Columns.vue 抽出**:
- 二级 tab(订阅列表 / 近期更新)
- 订阅列表:工具栏(批量 + 排序) + 列表 + 空态
- 近期更新:工具栏(排序) + 列表 + 加载 / 空态

**实施细节**
- 把 `mineTab` / `batchMode` / `selectedIds` / `pulsingId` / `pendingId` 等本地状态搬入
- 排序逻辑搬入
- 共享的 `subscribedList` / `recentList` computed 各自重新生成
- 子组件内 `useColumnSubscriptions` + `useToast` + `useToast`(直接用) 取代 emit

**验证**
- 视图与原 Columns.vue 行为一致(肉眼 + 关键路径手测)
- 跨视图订阅同步(在市场订阅 → 切到我的订阅 → 列表出现)
- 批量取消仍工作(并发 3 + 成功/失败计数)

---

## 步骤 7:Columns.vue 改造

**目标**:Columns.vue 降为 layout only, 仅承载 hero + tab 切换 + 全局 toast。

**改动文件**:`frontend/src/views/Columns.vue`

**实施细节**

1. **保留**:
   - `<section class="columns-hero">`(4 个 stat 块)
   - `<nav class="columns-view-tabs">`(市场 / 我的订阅)
   - `view` ref + tab 切换逻辑
   - hero stat 数据(基于 `MOCK.columns` / `MOCK.columns` 长度 / `useColumnSubscriptions` 计数)

2. **删除**:
   - 工具栏 / 卡片网格 / 列表 / 近期更新页相关 template / script / style
   - `filteredColumns` / `categoryCount` / `statusCount` / `quickSubscribe` / `quickUnsubscribe` / `sortSubscribed` / `loadRecent` 等函数
   - `mineTab` / `batchMode` / `selectedIds` / `pulsingId` / `pendingId` 等本地状态

3. **新增**:
   - import `ColumnsMarketView` / `ColumnsMineView`
   - `<ColumnsMarketView v-if="view === 'market'" />`
   - `<ColumnsMineView   v-else />`

4. **目标行数**:Columns.vue < 250 行(原 1400+)

**验证**
- 切换市场 / 我的订阅 tab 正常
- hero 数据正确
- 全局 toast 正常
- 切换路由离开再回来无状态丢失(若有, 在 `onActivated` 重置)

---

## 步骤 8:全链路验收

**目标**:逐条过 Spec 第 10 节验收清单 + 风险表回退演练。

**验收清单**(逐条勾选)

- [ ] `npm run build` 成功
- [ ] dev server 启动, 主页 200
- [ ] 市场 / 我的订阅 / 近期更新 / 专栏详情 / 文章详情 五个页面渲染正常
- [ ] 订阅 / 取消 / 批量 / 跨 tab 同步 路径手动验证
- [ ] 视觉与现有 hero + 渐变一致

**手测脚本**(以 dev server 跑)

1. 主页 → 智能中心 → 专栏订阅:看到 hero + 市场页
2. 市场:点击"订阅"按钮 → toast 出现 + 按钮态变 "已订阅·进入"
3. 点击"已订阅·进入" → 跳到 `/columns/col-XXX` 详情页
4. 详情页:看到文章列表 ≥ 1 条
5. 点击文章 → `/columns/article/col-XXX-art-N` 详情页
6. 文章详情:顶部"返回专栏"按钮工作
7. 文章详情:底部上下篇工作
8. 返回 → 详情页 → 取消订阅 → 二次确认 → 列表空
9. 切到"我的订阅" → 列表空 + 空态
10. 重新订阅 3 个 → 我的订阅 3 条
11. 批量管理 → 勾选 3 → 批量取消 → 3 条都消失
12. 切到"近期更新" → 看到 3 个专栏的文章流
13. F12 → Application → LocalStorage → `user:columns:subs:v3` 数据正常
14. 开新 tab 同步

**回退演练**(可选, 仅在 9 出现异常时做)
- 修改 mock API 返回 500 → 验证订阅按钮 loading + 回滚 + toast

---

## 风险与回退(执行期监控)

| 风险 | 触发条件 | 缓解 | 回退 |
|---|---|---|---|
| v2 数据未迁移 | 旧 localStorage 存在但无 v3 | 兼容分支裁剪 | 不裁剪, 仍按 v2 结构读 |
| `Columns.vue` 拆完样式丢失 | 卡片渐变不显示 | 子组件沿用原 class | 回退到单文件, 改用更细粒度 composable |
| 路由冲突 | `/columns/:id` 误匹配 `/columns/article/:id` | 路由顺序(article 优先)+ 面包屑 startsWith 严格判断 | 显式 redirect |
| `mock.js` 路由模式不识别 `GET /columns/:id/articles` | 老版 mock | 查阅 mock 路由注册规范, 可能要单独写 handler | 改为 `/columns/articles?id=` |
| `useColumnSubscriptions` 跨 tab 同步时机错 | storage 事件回写冲突 | 仅在 storage 事件中覆盖 store, 不写回 localStorage | 移除 storage 监听 |

---

## 不在范围(确认 YAGNI)

- 付费 / 会员
- 推送渠道
- 评论 / IM
- 全文搜索
- i18n
- 移动端专门优化
- 单元测试基建(Vitest)
- E2E 基建(Playwright)
