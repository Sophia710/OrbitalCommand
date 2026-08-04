/**
 * 员工 / 我的员工 / 创建
 * ---------------------------------------------------------------------- */
import http from './index'
import { registerRoute, MOCK, page } from './mock'

/* ------------ 员工广场 ------------ */
registerRoute('GET /employees/list', {
  params: {
    q:        ['string',  false],
    kind:     ['string',  false],
    domain:   ['string',  false],
    sort:     ['string',  false],
    pageNo:   ['number',  false],
    pageSize: ['number',  false],
  },
  handler: ({ params } = {}) => {
    let list = [...MOCK.employees]
    if (params?.kind) {
      // 兼容 kind 过滤：'super' / 'professional'
      list = list.filter((e) => e.kind === params.kind)
    }
    if (params?.domain) list = list.filter((e) => e.domain === params.domain)
    if (params?.q) {
      const k = String(params.q).toLowerCase()
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(k) ||
          (e.tags || []).some((t) => t.toLowerCase().includes(k)) ||
          (e.description || '').toLowerCase().includes(k),
      )
    }
    if (params?.sort === 'usage')        list.sort((a, b) => b.usage - a.usage)
    else if (params?.sort === 'rating')  list.sort((a, b) => b.rating - a.rating)
    else if (params?.sort === 'newest')  list.sort((a, b) => b.createdAt - a.createdAt)
    return page(list, Number(params?.pageNo || 1), Number(params?.pageSize || 24))
  },
})

registerRoute('GET /employees/detail', {
  params: { id: ['string', true] },
  handler: ({ params } = {}) => {
    const emp = MOCK.employees.find((e) => e.id === params.id)
    if (!emp) throw new Error('员工不存在')
    return emp
  },
})

/* ------------ 我的员工 ------------ */
registerRoute('GET /employees/my', {
  handler: () => ({
    list: MOCK.myEmployees,
    total: MOCK.myEmployees.length,
  }),
})

registerRoute('POST /employees/hire', {
  body: { id: ['string', true] },
  handler: ({ body } = {}) => {
    const emp = MOCK.employees.find((e) => e.id === body.id)
    if (!emp) throw new Error('员工不存在')
    if (!MOCK.myEmployees.find((e) => e.id === body.id)) {
      MOCK.myEmployees.unshift({ ...emp, hiredAt: Date.now(), source: 'subscribed' })
    }
    return { id: body.id, hiredAt: Date.now() }
  },
})

registerRoute('POST /employees/release', {
  body: { id: ['string', true] },
  handler: ({ body } = {}) => {
    const i = MOCK.myEmployees.findIndex((e) => e.id === body.id)
    if (i >= 0) MOCK.myEmployees.splice(i, 1)
    return { id: body.id, released: true }
  },
})

/* ------------ 创建员工 ------------ */
registerRoute('POST /employees/create', {
  body: {
    name:        ['string', true],
    kind:        ['string', true],
    domain:      ['string', true],
    description: ['string', true],
  },
  handler: ({ body } = {}) => {
    const id = uid('draft')
    const newOne = {
      id,
      kind: body.kind,
      name: body.name,
      avatar: body.avatar || '#8b5cf6',
      accent: body.accent || '#a78bfa',
      domain: body.domain,
      tags: body.tags || [],
      description: body.description,
      skills: body.skills || [],
      publisher: '当前用户',
      status: body.action === 'submit' ? 'pending' : 'draft',
      activated: false,
      version: '0.1.0',
      usage: 0,
      rating: 0,
      reviews: 0,
      systemPrompt: body.systemPrompt || '',
      greeting: body.greeting || '',
      kb: body.kb || [],
      tools: body.tools || [],
      model: body.model || 'qwen3-235b',
      source: 'mine',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    MOCK.myDrafts.unshift(newOne)
    return newOne
  },
})

/* ------------ 我的员工草稿 ------------ */
registerRoute('GET /employees/my-drafts', {
  params: {
    status: ['string', false],
  },
  handler: ({ params } = {}) => {
    let list = [...MOCK.myDrafts]
    if (params?.status) list = list.filter(d => d.status === params.status)
    return { list, total: list.length }
  },
})

registerRoute('GET /employees/my-drafts/:id', {
  handler: ({ pathParams } = {}) => {
    const emp = MOCK.myDrafts.find(e => e.id === pathParams.id)
    if (!emp) throw new Error('员工不存在')
    return emp
  },
})

/* ------------ 更新员工草稿 ------------ */
registerRoute('POST /employees/update', {
  body: {
    id:          ['string', true],
    name:        ['string', false],
    domain:      ['string', false],
    description: ['string', false],
  },
  handler: ({ body } = {}) => {
    const i = MOCK.myDrafts.findIndex(e => e.id === body.id)
    if (i < 0) throw new Error('员工不存在')
    const allowed = ['name', 'domain', 'description', 'tags', 'skills', 'visibility', 'systemPrompt', 'greeting', 'kb', 'tools', 'model']
    for (const k of allowed) {
      if (k in body) MOCK.myDrafts[i][k] = body[k]
    }
    MOCK.myDrafts[i].updatedAt = Date.now()
    return MOCK.myDrafts[i]
  },
})

/* ------------ 提交发布 / 激活 ------------ */
registerRoute('POST /employees/:id/submit', {
  handler: ({ pathParams } = {}) => {
    const i = MOCK.myDrafts.findIndex(e => e.id === pathParams.id)
    if (i < 0) throw new Error('员工不存在')
    MOCK.myDrafts[i].status = 'pending'
    MOCK.myDrafts[i].updatedAt = Date.now()
    return MOCK.myDrafts[i]
  },
})

registerRoute('POST /employees/:id/activate', {
  handler: ({ pathParams } = {}) => {
    const i = MOCK.myDrafts.findIndex(e => e.id === pathParams.id)
    if (i < 0) throw new Error('员工不存在')
    MOCK.myDrafts[i].status = 'published'
    MOCK.myDrafts[i].activated = true
    MOCK.myDrafts[i].updatedAt = Date.now()
    return MOCK.myDrafts[i]
  },
})

/* ------------ 下架（已发布 → 已下架） ------------ */
registerRoute('POST /employees/:id/takedown', {
  handler: ({ pathParams } = {}) => {
    const i = MOCK.myDrafts.findIndex(e => e.id === pathParams.id)
    if (i < 0) throw new Error('员工不存在')
    if (MOCK.myDrafts[i].status !== 'published') {
      throw new Error('仅已发布状态的员工可下架')
    }
    MOCK.myDrafts[i].status = 'offline'
    MOCK.myDrafts[i].updatedAt = Date.now()
    return MOCK.myDrafts[i]
  },
})

/* ------------ 删除草稿 ------------ */
registerRoute('POST /employees/my-drafts/delete', {
  body: { id: ['string', true] },
  handler: ({ body } = {}) => {
    const i = MOCK.myDrafts.findIndex(e => e.id === body.id)
    if (i >= 0) MOCK.myDrafts.splice(i, 1)
    return { id: body.id, deleted: true }
  },
})

registerRoute('GET /employees/skills', {
  handler: () => MOCK.skills,
})

/* ------------ 暴露给视图的方法 ------------ */
export function listEmployees(params)    { return http.get('/employees/list', { params }) }
export function getEmployee(id)          { return http.get('/employees/detail', { params: { id } }) }
export function listMyEmployees()        { return http.get('/employees/my') }
export function hireEmployee(id)         { return http.post('/employees/hire', { id }) }
export function releaseEmployee(id)      { return http.post('/employees/release', { id }) }
export function createEmployee(payload)  { return http.post('/employees/create', payload) }
export function listMyDrafts(params)     { return http.get('/employees/my-drafts', { params }) }
export function getMyDraft(id)           { return http.get(`/employees/my-drafts/${id}`) }
export function updateEmployee(payload)  { return http.post('/employees/update', payload) }
export function submitEmployee(id)       { return http.post(`/employees/${id}/submit`) }
export function activateEmployee(id)     { return http.post(`/employees/${id}/activate`) }
export function takedownEmployee(id)     { return http.post(`/employees/${id}/takedown`) }
export function deleteMyDraft(id)        { return http.post('/employees/my-drafts/delete', { id }) }
export function listSkills()             { return http.get('/employees/skills') }
export function listSuperSeries()        { return Promise.resolve(MOCK.superSeries || []) }
