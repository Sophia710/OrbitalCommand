/**
 * 指挥中心 / 数据应用
 * ---------------------------------------------------------------------- */
import http from './index'
import { registerRoute, MOCK, page } from './mock'

/* ------------ 指挥中心 ------------ */
registerRoute('GET /dashboard/overview', {
  handler: () => ({
    kpis: MOCK.kpis,
    alarms: MOCK.alarms,
    tasks: MOCK.tasks,
    trafficHours: MOCK.trafficHours,
    lines: MOCK.lines,
    beamLoad: MOCK.beamLoad,
    beamLabels: MOCK.beamLabels,
    satHealth: MOCK.satHealth,
  }),
})

registerRoute('GET /dashboard/kpi', {
  handler: () => MOCK.kpis,
})

registerRoute('GET /dashboard/alarms', {
  params: { pageNo: ['number', false], pageSize: ['number', false] },
  handler: ({ params } = {}) => page(MOCK.alarms, Number(params?.pageNo || 1), Number(params?.pageSize || 20)),
})

registerRoute('GET /dashboard/tasks', {
  params: { status: ['string', false] },
  handler: ({ params } = {}) => {
    let list = [...MOCK.tasks]
    if (params?.status) list = list.filter((t) => t.status === params.status)
    return list
  },
})

/* ------------ 数据应用 ------------ */
registerRoute('GET /data/overview', {
  handler: () => ({
    kpis: MOCK.kpis,
    coverage: MOCK.coverage,
    regions: MOCK.regions,
    coverageDays: MOCK.coverageDays,
    domainDist: [
      { name: '宽带互联网', value: 4120, percent: 38 },
      { name: 'IPTV',      value: 2390, percent: 22 },
      { name: '应急/海事', value: 1956, percent: 18 },
      { name: '政企专线',  value: 1518, percent: 14 },
      { name: '物联网',    value: 866,  percent: 8 },
    ],
    sla: [
      { metric: '宽带可用率',    value: 99.92 },
      { metric: 'IPTV 频道建立',  value: 99.55 },
      { metric: '链路切换时延',   value: 99.78 },
      { metric: '终端在线率',    value: 99.34 },
      { metric: '客服响应',      value: 99.99 },
    ],
  }),
})

registerRoute('GET /data/coverage', {
  handler: () => ({
    coverage: MOCK.coverage,
    regions: MOCK.regions,
    days: MOCK.coverageDays,
  }),
})

/* ------------ 暴露给视图的方法 ------------ */
export function getOverview()        { return http.get('/dashboard/overview') }
export function getKpi()             { return http.get('/dashboard/kpi') }
export function getAlarms(params)    { return http.get('/dashboard/alarms', { params }) }
export function getTasks(params)     { return http.get('/dashboard/tasks', { params }) }
export function getDataOverview()    { return http.get('/data/overview') }
export function getCoverage()        { return http.get('/data/coverage') }
