# 专栏订阅模块 · 重构设计

> 状态:已批准 · 日期:2026-06-23 · 范围:frontend (Vue 3 + Pinia/Composition API)
> 目的:对"专栏订阅"模块做全量重构,解决单文件臃肿、状态层过载、缺专栏详情页等问题。

---

## 1. 背景与目标

**现状问题**
- `Columns.vue` 单文件 1400+ 行,三视图(市场/我的/近期)+ 工具栏 + Toast + 全套 CSS 混在一起,职责过载。
- `useColumnSubscriptions` 状态层携带 `notify` / `frequency` / `last_seen_at` / `last_article_at`,远超"订阅"语义,代码多处要 `markSeen` / `hasNew` 判断。
- 无独立的专栏详情页(专栏元信息 + 文章列表),用户进入已订阅专栏时只能直接跳到首篇文章。
- 订阅走 `KbSubscribeDialog` 弹窗,加重操作成本。
- 文章详情页有 unread 角标与 `markSeen` 副作用,与"只保留订阅状态"的目标冲突。

**目标**
1. 拆分 Columns.vue 为 layout + 三子组件,单文件 < 250 行。
2. 状态层收敛到"是否订阅 + 订阅时间",移除所有 unread / notify 字段。
3. 新增 `ColumnDetail.vue`(/columns/:id),承载专栏元信息 + 文章单列。
4. 订阅直接生效(无弹窗),乐观更新 + toast 反馈。
5. 保留现有 hero + 渐变视觉风格,与"知识库"等模块保持一致。

---

## 2. 范围

**做**
- 专栏市场页、我的订阅、近期更新页
- 专栏详情页(新)
- 文章详情页(微调:移除 unread)
- 状态层简化
- Mock / API 扩展(专栏文章列表)
- 路由表更新
- 面包屑

**不做**
- 知识库 / 智能体 / 任务等其他模块
- 引入新依赖(Vitest / Pinia 持久化插件等)
- 路由化拆分(本设计内不再多页路由化)
- 通知推送(钉钉/邮件/SSE)功能
- 收藏 / 点赞 / 分享的真正实现(继续走 ElMessage 占位)

---

## 3. 架构与文件结构

```
frontend/src/
├ views/
│  ├ Columns.vue                  # 仅 layout: hero + 视图 tab + toast
│  ├ columns/                     # 新建子目录
│  │  ├ ColumnsMarketView.vue     # 市场页
│  │  └ ColumnsMineView.vue       # 我的订阅 + 近期更新(二级 tab)
│  ├ ColumnDetail.vue             # /columns/:id  专栏详情(新)
│  └ ArticleDetail.vue            # 文章详情(微调)
├ composables/
│  └ useColumnSubscriptions.js    # 简化为 { store, list, ids, subscribe, ... }
├ components/
│  └ (KbSubscribeDialog.vue 标记废弃,移除引用)
├ api/
│  ├ smart-center.js              # 新增 GET /columns/:id/articles
│  └ mock-data.js                 # 扩展 buildArticleList
└ router/index.js                 # 新增 /columns/:id
```

**职责边界**
| 文件 | 输入 | 输出 |
|---|---|---|
| Columns.vue | route path | 切换 market / mine 视图, 全局 toast |
| ColumnsMarketView.vue | filters, store | 卡片列表, 触发订阅/进入专栏 |
| ColumnsMineView.vue | store | 二级 tab:订阅列表 / 近期更新 |
| ColumnDetail.vue | route.params.id | 专栏元信息 + 文章列表 + 订阅按钮 |
| ArticleDetail.vue | route.params.id | 单文章渲染(不变主体结构) |
| useColumnSubscriptions | localStorage | 订阅 id → 订阅时间 映射 |

---

## 4. 状态层:useColumnSubscriptions(v3)

**持久化**:localStorage `user:columns:subs:v3`

**结构**
```js
{
  __v: 3,
  'col-001': 1719132000000,   // subscribed_at
  'col-002': 1719132000000,
}
```

**API 形态**
```js
useColumnSubscriptions() => {
  store,           // Ref<Record<id, number>>  值为 subscribed_at
  list,            // ComputedRef<{id, subscribed_at}[]>  倒序
  count,           // ComputedRef<number>
  ids,             // ComputedRef<Set<id>>
  isSubscribed,    // (id) => boolean
  subscribe,       // (id) => void  乐观更新
  unsubscribe,     // (id) => void  乐观更新
  toggle,          // (id) => void
  batchSubscribe,  // (ids) => void
  batchUnsubscribe,// (ids) => void
  teardown,        // 卸载 storage listener
}
```

**对比旧版(v2 → v3 精简项)**
| 项 | 旧 (v2) | 新 (v3) |
|---|---|---|
| 字段 | subscribed_at / notify / frequency / last_seen_at / last_article_at | subscribed_at |
| 通知偏好 | `setNotifyPrefs` | 删除 |
| 未读判断 | `hasNew` / `markSeen` / `isUnseen` | 删除 |
| 跨 tab 同步 | `storage` 事件 | 保留 |
| schema 迁移 | v1 → v2 | v2 → v3(精简) |

**使用方影响**
- `ColumnsMarketView` / `ColumnsMineView`:不再用 `hasNew`,不再注入 `subscribed_at` 到列表项
- `ArticleDetail`:不再调 `markSeen`,不再渲染"新"徽标
- `TopBar.vue`:专栏入口的红色角标 `newArticleCount` 移除(基于 `hasNew`)

---

## 5. 视图层

### 5.1 Columns.vue (layout only)

```
<template>
  <div class="page page-columns">
    <section class="columns-hero">
      4 个 stat 块(总订阅 / 专家 / 累计阅读 / 文章数),保留现有渐变
    </section>

    <nav class="columns-view-tabs">
      <button :class="{ active: view === 'market' }" @click="view = 'market'">
        专栏市场 <span>{{ columnsTotal }}</span>
      </button>
      <button :class="{ active: view === 'mine' }" @click="view = 'mine'">
        我的订阅 <span>{{ subscribedCount }}</span>
      </button>
    </nav>

    <ColumnsMarketView v-if="view === 'market'" @toast="..." />
    <ColumnsMineView   v-else @toast="..." />

    <ToastContainer />
  </div>
</template>
```

**职责**:仅 hero / tab 切换 / 全局 toast;不持有业务状态,所有数据由子组件通过 `useColumnSubscriptions` 获取。

### 5.2 ColumnsMarketView.vue

**结构**
- 工具栏(纵向平铺):
  - 分类 chips(全部 / 终端 / 网络 / 载荷 / 全链路 / 运维运营 / AI 与算法),带计数
  - 搜索框(专栏 / 作者 / 标签),回车或失焦触发
  - 状态 tabs:全部 / 已订阅 / 未订阅,带计数
- 卡片网格(auto-fill, minmax(320px, 1fr)):
  - 封面头(渐变 + 分类 pill + 已订阅 pill)
  - 标题 / 作者
  - 最新文章 + 描述(2 行截断)
  - 标签 + 订阅数 / 文章数
  - 操作按钮:
    - 未订阅 → 「订阅」,点击直接订阅,按钮变为「已订阅·进入」
    - 已订阅 → 「已订阅·进入」,点击跳转 `/columns/:id`

### 5.3 ColumnsMineView.vue

**结构**:二级 tab(顶部 sub-tabs)
- 订阅列表:
  - 工具栏:批量管理(进入/退出) + 排序(最近更新 / 订阅时间 / 专栏名称)
    - 最近更新:按专栏最新文章 `published_at` 倒序(派生于 `COLUMNS.latest_article_at`)
    - 订阅时间:按 `subscribed_at` 倒序
    - 专栏名称:按 `title` 字母升序
  - 列表项:封面 + 标题/分类/订阅时间 + 指标(订阅/获赞) + 操作(进入/取消)
  - 空态:跳转市场按钮
- 近期更新:
  - 工具栏:排序(最近发布 / 最受欢迎)
  - 列表项:日期块 + 专栏 tag + 标题 + 摘要 + 元信息 + 箭头
  - 空态:订阅专栏才会有更新

**共享关注点**
- 三个视图通过 `useColumnSubscriptions()` 共享同一 store
- 跨视图"已订阅数 / 列表"自动同步
- 订阅/取消乐观更新,失败回滚 + toast

---

## 6. 专栏详情页:ColumnDetail.vue(新)

**路由**:`/columns/:id` (例: `/#/columns/col-001`)

**布局(单列布局,无侧栏)**
```
┌─ 顶部工具条:返回按钮 / 面包屑
└─ 主体
   ┌─ 专栏头(渐变封面区, 160px)
   │  ├ 分类 pill
   │  └ 标题 + 描述(描述完整显示, 不截断)
   ├─ 元信息条
   │  ├ 文章数 + 订阅数 + 标签
   │  └ 订阅按钮(右侧)
   ├─ 分割线
   └─ 文章列表(单列时间倒序)
      ├ 列表项
      │  ├ 左侧:日期块(日 / 年月)
      │  ├ 中部:标题 + 摘要 + 元信息(分类/阅读时长)
      │  └ 右侧:箭头
      └ 点击进入 /columns/article/:id
```

**订阅按钮**
- 未订阅 → 「订阅」(主按钮, 点击即生效, 乐观更新 + toast)
- 已订阅 → 「已订阅」+「取消订阅」(取消二次确认 `ElMessageBox`)

**派生数据**
- 文章列表从 `smart-center.js` 新 API `GET /columns/:id/articles` 拉取
- 复用现有 `ARTICLES_CONTENT` 池;每条 `col-XXX-art-N` 落到内容池即填充, 无内容则用占位

---

## 7. 文章详情页:ArticleDetail.vue 微调

**保留**:摘要 + 分节 + 关联阅读 + 点赞/收藏/分享 + 面包屑

**移除**:
- `markSeen` 调用(进入页面不再更新已读时间)
- `isUnseen` 判断与"新"徽标
- `recent-item--unseen` / `mine-item--new-badge` 样式(已不引用)

**新增**:
- 顶部工具条:「← 返回专栏」跳到 `/columns/:column_id`(已知 column_id 由 article_id 解析)
- 文章底部:`上一篇 / 下一篇` 控件(从同专栏文章列表派生)

**不动**:
- 摘要/分节/正文结构
- 点赞/收藏/分享交互(只调 `ElMessage`)
- 关联阅读 2-3 篇派生逻辑

**改动文件**:仅 `ArticleDetail.vue`(预计 < 100 行净增/删)

---

## 8. Mock / API 扩展

### 8.1 mock-data.js

**保持**:`COLUMNS`(7 条)、`ARTICLES_CONTENT`(3 条精校)、`buildArticleContent` 兜底

**扩展**:`buildArticleList(columnId, limit)`
```js
function buildArticleList(columnId, limit = 20) {
  // 1) 从 ARTICLES_CONTENT 抽出属于该 column 的条目
  // 2) 不够的用 buildArticleContent 兜底补齐
  // 3) 按 published_at 倒序
  // 4) 返回 [{ id, title, summary, published_at, reading_minutes, ... }]
}
```

导出到 `MOCK.buildArticleList`。

### 8.2 smart-center.js

**新增路由**:
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

**保留**:现有 `GET /columns/article-detail` / `GET /columns/recent` / `GET /columns/list` / 订阅相关路由

**新增导出**:
```js
export const getColumnArticles = (id, limit) =>
  http.get(`/columns/${id}/articles`, { params: { limit } })
```

### 8.3 路由表(router/index.js)

```js
{
  path: '/columns/:id',
  name: 'ColumnDetail',
  component: () => import('@/views/ColumnDetail.vue'),
  meta: { title: '专栏详情', group: 'main', icon: 'Reading', hidden: true },
},
```

### 8.4 面包屑(TopBar.vue)

```js
if (name === 'columndetail' || (path.startsWith('columns/') && !path.startsWith('columns/article/'))) {
  return [
    { id: 'smart-center', label: '智能中心', clickable: true },
    { id: 'knowledge',    label: '知识库',   clickable: true },
    { id: 'columns',      label: '专栏订阅', clickable: true },
    { id: 'column',       label: '专栏详情', clickable: false },
  ]
}
```

---

## 9. 错误处理 & 反馈

### 9.1 订阅 / 取消订阅
- **乐观更新**:点击立即变更 `store` + UI
- **请求失败**:回滚 store + `ElMessage.error('订阅失败,请稍后重试')`
- **成功**:toast 飘字(`已订阅「<title>」` / `已取消订阅「<title>」`)
- **批量取消**:逐条调用 unsubscribe,**失败项计数显示**, `成功 X 项, 失败 Y 项`(默认并发数 3,避免 UI 抖动)
- **loading 态**:按钮内 spinner, 期间禁用(单条 1.2s 模拟延迟)

### 9.2 列表加载
- **网络错误**:inline empty state(图标 + 重试按钮),不弹 Modal
- **加载中**:spinner 居中(用现有 `.columns-loading`)
- **空态**:
  - 市场无结果:`没有匹配的专栏, 试试调整关键词或切换其他分类`
  - 我的订阅无订阅:`还没有订阅任何专栏, 前往专栏市场` + 跳转按钮
  - 近期更新无更新:`暂无更新, 订阅的专栏有新文章时会自动汇总`
  - 专栏不存在:ColumnDetail 显示 `未找到该专栏, 可能已下架` + 返回按钮

### 9.3 路由
- `/columns/:id` 专栏不存在 → 渲染 empty state, 不跳 404(保持单页内引导)
- `/columns/article/:id` 文章不存在 → 同上(已有)

### 9.4 持久化
- 写入失败(quota exceeded):toast 提示 + 控制台 warn, 不阻塞 UI
- 跨 tab 同步:监听 `storage` 事件, v3 schema 直接覆盖

---

## 10. 测试策略

**范围**:仅前端(项目当前无测试基建, 做最小可用)
- 核心逻辑:`useColumnSubscriptions`(纯函数多, 易单测)
- 组件渲染:ColumnsMarketView / ColumnDetail 关键交互路径(手动 + dev server 验证)

**不做**
- 不引入 Vitest / Jest(避免基建扩张)
- 不写 E2E(项目无 Playwright 基建)
- 视觉回归以肉眼 + dev server 截图为准

**必测项**
| 项 | 类型 | 验证 |
|---|---|---|
| 订阅 → 写入 localStorage | 手动 | 订阅后 store 出现 id; 刷新页面仍在 |
| 取消订阅 → 持久化 | 手动 | 同上反向 |
| 跨 tab 同步 | 手动 | A 标签订阅, B 标签可见 |
| 失败回滚 | 手动 | mock 接口返回 500, UI 回滚 + toast |
| 批量取消 | 手动 | 勾选 3 条 → 批量取消 → 列表清空 |
| 专栏详情文章列表 | 手动 | `/columns/col-001` 应出现 N 条 |
| 路由跳转 | 手动 | 卡片 / 列表 / 文章间导航无白屏 |
| 构建 | 命令行 | `npm run build` 通过 |

**验收清单**
- [ ] `npm run build` 成功
- [ ] dev server 启动, 主页 200
- [ ] 市场 / 我的订阅 / 近期更新 / 专栏详情 / 文章详情 五个页面渲染正常
- [ ] 订阅 / 取消 / 批量 / 跨 tab 同步 路径手动验证
- [ ] 视觉与现有 hero + 渐变一致

---

## 11. 风险与回退

| 风险 | 缓解 |
|---|---|
| v2 → v3 schema 迁移失败 | 启动时 try/catch;失败则回退空 store |
| useColumnSubscriptions 单测覆盖不足 | 写代码时优先保持函数纯(无副作用)便于后续补测 |
| ColumnDetail 新路由面包屑误判 | 路径匹配 `columns/X` 排除 `columns/article/X`,用 startsWith 严格判断 |
| Columns.vue 拆分后样式丢失 | 三个子组件沿用原 SCSS 变量与 class 名, 渐变/动画按需复制 |
| ArticleDetail 移除 markSeen 后引用报错 | 搜索并清理 `recent-item--unseen` / `mine-item--new-badge` / `isUnseen` / `hasNew` |

**回退方案**:`useColumnSubscriptions` 保留 v2 兼容分支(读取旧数据时迁移),新逻辑 v3;若 v3 出问题,回退到 v2 即可恢复。

---

## 12. 实施顺序(供 writing-plans 参考)

1. 状态层:v2 → v3 简化(包含 schema 迁移)
2. mock + API:新增 `buildArticleList` + `GET /columns/:id/articles`
3. router + TopBar:新增 `/columns/:id` 路由 + 面包屑
4. ColumnDetail.vue(新):静态骨架 → 数据拉取 → 订阅按钮 → 文章列表
5. ArticleDetail.vue:移除 unread + 新增"返回专栏" + 上下篇
6. Columns.vue 拆分:抽出 `ColumnsMarketView` + `ColumnsMineView`
7. Columns.vue 改造为 layout only
8. 全链路验收清单逐条过

---

## 13. 不在范围(已确认 YAGNI)

- 付费专栏 / 会员体系
- 推送渠道(钉钉/邮件/SSE)
- 评论 / 站内 IM
- 全文搜索(检索引擎接入)
- 多语言 i18n
- 移动端布局专门优化
