/**
 * Axios 实例 + 拦截器
 * ----------------------------------------------------------------------
 *  所有"请求"走本地 mock 引擎：拦截器在 request 阶段把请求改派到 dispatch
 *  业务侧代码完全是真实 axios 调用，可平滑替换为真实后端。
 */

import axios from 'axios'
import { ElMessage } from 'element-plus'
import { dispatch } from './mock'
// 确保 mock 路由（如 POST /auth/login）在拦截器使用前完成注册
import './auth'
import './ai'

const http = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

http.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toUpperCase()
  const path = config.url.startsWith('/api')
    ? config.url.slice(4)
    : config.url

  // 透传所有参数
  const payload = {
    params: config.params,
    body: config.data,
  }
  try {
    const result = await dispatch(method, path, payload)
    // 模拟 axios 响应结构
    config.adapter = () =>
      Promise.resolve({
        data: result,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      })
  } catch (e) {
    config.adapter = () =>
      Promise.reject({
        message: e?.message || 'mock dispatch 失败',
        config,
      })
  }
  return config
})

http.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 0) return body.data
      /* silent 选项：用于后台静默校验，不弹错误提示（避免误提示干扰用户）
       *  - 典型场景：bootstrap 期间后台调用 /auth/me 刷新用户信息
       *  - 此时失败不应弹 toast，更不应清空本地会话 */
      if (!res.config?.silent) {
        ElMessage.error(body.message || '请求失败')
      }
      return Promise.reject(new Error(body.message || 'mock fail'))
    }
    return body
  },
  (err) => {
    /* 同上：silent 模式下不弹网络异常提示 */
    if (!err?.config?.silent) {
      ElMessage.error(err?.message || '网络异常')
    }
    return Promise.reject(err)
  },
)

export default http
