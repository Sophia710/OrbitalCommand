/**
 * AI 辅助 · Mock API
 * ----------------------------------------------------------------------
 *  - POST /ai/enhance-prompt  增强提示词
 */
import http from './index'
import { registerRoute, delay } from './mock'

/* ------------ 增强提示词 ------------ */
registerRoute('POST /ai/enhance-prompt', {
  body: {
    text: ['string', true],
  },
  handler: async ({ body }) => {
    await delay(600, 300)
    const text = String(body.text).trim()
    if (!text) throw new Error('请输入提示词')
    const enhanced = `请根据以下需求，详细、清晰地完成分析任务：

背景与目标：
${text}

要求：
1. 请分步骤、有条理地进行分析
2. 提供数据支撑和具体案例
3. 输出结构化的结论
4. 如有多种方案，请对比分析优缺点
5. 最后给出明确的建议`
    return { enhanced }
  },
})

export function enhancePrompt(text) {
  return http.post('/ai/enhance-prompt', { text })
}