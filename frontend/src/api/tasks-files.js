/**
 * 任务 / 文件 / 审核 / 审计 / 设置
 * ---------------------------------------------------------------------- */
import http from './index'
import { registerRoute, MOCK, page, uid } from './mock'

/* ------------ 任务监控 ------------ */
registerRoute('GET /tasks/list', {
  params: {
    status:   ['string',  false],
    priority: ['string',  false],
    pageNo:   ['number',  false],
    pageSize: ['number',  false],
  },
  handler: ({ params } = {}) => {
    let list = [...MOCK.tasks]
    if (params?.status)   list = list.filter((t) => t.status === params.status)
    if (params?.priority) list = list.filter((t) => t.priority === params.priority)
    return page(list, Number(params?.pageNo || 1), Number(params?.pageSize || 20))
  },
})

registerRoute('POST /tasks/cancel', {
  body: { id: ['string', true] },
  handler: ({ body } = {}) => {
    const t = MOCK.tasks.find((x) => x.id === body.id)
    if (t) t.status = 'cancelled'
    return t || {}
  },
})

registerRoute('POST /tasks/reassign', {
  body: { id: ['string', true] },
  handler: ({ body } = {}) => {
    const t = MOCK.tasks.find((x) => x.id === body.id)
    if (t) { t.status = 'queued'; t.progress = 0; t.time = '-' }
    return t || {}
  },
})

/* ------------ 文件中心 ------------ */
registerRoute('GET /files/tree', {
  handler: () => MOCK.files,
})

registerRoute('GET /files/kb', {
  handler: () => MOCK.kb,
})

registerRoute('POST /files/upload', {
  body: { name: ['string', true] },
  handler: ({ body } = {}) => ({
    id: uid('f'),
    name: body.name,
    size: body.size || '0 KB',
    type: body.type || 'doc',
    uploadedAt: new Date().toISOString().slice(0, 10),
  }),
})

/* ------------ 审核中心 ------------ */
registerRoute('GET /review/list', {
  params: {
    status:   ['string',  false],
    q:        ['string',  false],
    pageNo:   ['number',  false],
    pageSize: ['number',  false],
  },
  handler: ({ params } = {}) => {
    let list = [...MOCK.reviews]
    if (params?.status) list = list.filter((r) => r.status === params.status)
    if (params?.q) {
      const k = String(params.q).toLowerCase()
      list = list.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(k) ||
          r.submitter.toLowerCase().includes(k) ||
          (r.description || '').toLowerCase().includes(k),
      )
    }
    return page(list, Number(params?.pageNo || 1), Number(params?.pageSize || 20))
  },
})

registerRoute('GET /review/pending', {
  handler: () => {
    const list = MOCK.reviews.filter((r) => r.status === 'pending')
    return { list, total: list.length }
  },
})

registerRoute('POST /review/approve', {
  body: { id: ['string', true] },
  handler: ({ body } = {}) => {
    const r = MOCK.reviews.find((x) => x.id === body.id)
    if (!r) throw new Error('审核项不存在')
    r.status = 'approved'
    r.decidedAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
    return r
  },
})

registerRoute('POST /review/reject', {
  body: {
    id:     ['string', true],
    reason: ['string', true],
  },
  handler: ({ body } = {}) => {
    const r = MOCK.reviews.find((x) => x.id === body.id)
    if (!r) throw new Error('审核项不存在')
    r.status = 'rejected'
    r.decidedAt = new Date().toISOString().toString().slice(0, 16).replace('T', ' ')
    r.reason = body.reason
    return r
  },
})

/* ------------ 审计日志 ------------ */
registerRoute('GET /audit/list', {
  params: {
    q:        ['string',  false],
    action:   ['string',  false],
    pageNo:   ['number',  false],
    pageSize: ['number',  false],
  },
  handler: ({ params } = {}) => {
    let list = [...MOCK.audits]
    if (params?.q) {
      const k = String(params.q).toLowerCase()
      list = list.filter(
        (a) =>
          a.user.toLowerCase().includes(k) ||
          a.action.toLowerCase().includes(k) ||
          a.resource.toLowerCase().includes(k),
      )
    }
    if (params?.action) list = list.filter((a) => a.action === params.action)
    return page(list, Number(params?.pageNo || 1), Number(params?.pageSize || 30))
  },
})

/* ------------ 暴露给视图的方法 ------------ */
export function listTasks(params)        { return http.get('/tasks/list', { params }) }
export function cancelTask(id)           { return http.post('/tasks/cancel', { id }) }
export function reassignTask(id)         { return http.post('/tasks/reassign', { id }) }
export function getFileTree()            { return http.get('/files/tree') }
export function getKb()                  { return http.get('/files/kb') }
export function uploadFile(payload)      { return http.post('/files/upload', payload) }
export function listReviews(params)      { return http.get('/review/list', { params }) }
export function listReviewsPending()     { return http.get('/review/pending') }
export function approveReview(id)        { return http.post('/review/approve', { id }) }
export function rejectReview(id, reason) { return http.post('/review/reject', { id, reason }) }
export function listAudits(params)       { return http.get('/audit/list', { params }) }
