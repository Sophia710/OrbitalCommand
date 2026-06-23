/**
 * 智能中心 · 智能体 / 技能 / 知识库 / 专栏
 * ----------------------------------------------------------------------
 *  完整对齐后端 REST 接口：
 *    GET  /agents/list            -> getAgents (category | keyword | sort)
 *    GET  /agents/categories      -> 4 大分类汇总
 *    GET  /agents/detail          -> 智能体详情 + 关联技能
 *    GET  /skills/list            -> 技能列表
 *    GET  /skills/detail          -> 技能详情 + 关联智能体
 *    GET  /knowledge-bases/list   -> 知识库列表
 *    GET  /knowledge-bases/detail -> 知识库详情 + 文档列表
 *    GET  /knowledge-bases/stats  -> 知识库 / 文档 统计
 *    GET  /columns/list           -> 专栏列表
 *    GET  /columns/detail         -> 专栏详情 + 模拟文章列表
 *    POST /knowledge-bases        -> 创建知识库
 *    POST /documents              -> 上传文档(模拟)
 */
import http from './index'
import { registerRoute, MOCK, page, uid } from './mock'

/* ============================================================
 * 智能体 · Agents
 * ============================================================ */
registerRoute('GET /agents/list', {
  params: {
    category: ['string',  false],
    keyword:  ['string',  false],
    status:   ['string',  false],
    sort:     ['string',  false],
    pageNo:   ['number',  false],
    pageSize: ['number',  false],
  },
  handler: ({ params } = {}) => {
    let list = [...MOCK.agents]
    if (params?.category && params.category !== 'all') {
      list = list.filter((a) => a.category === params.category)
    }
    if (params?.status) {
      list = list.filter((a) => a.status === params.status)
    }
    if (params?.keyword) {
      const k = String(params.keyword).toLowerCase()
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(k) ||
          (a.description || '').toLowerCase().includes(k) ||
          (a.tags || []).some((t) => t.toLowerCase().includes(k)),
      )
    }
    if (params?.sort === 'usage')   list.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    else if (params?.sort === 'rating')  list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else if (params?.sort === 'newest')  list.sort((a, b) => b.createdAt - a.createdAt)
    return page(list, Number(params?.pageNo || 1), Number(params?.pageSize || 24))
  },
})

/* 4 大分类聚合,对应后端 categories 字段 */
registerRoute('GET /agents/categories', {
  handler: () => {
    const list = MOCK.agents
    const keys = MOCK.agentCategoryKeys
    const categories = keys.map((k) => ({
      key: k,
      name: MOCK.agentCategoryLabels[k],
      count: list.filter((a) => a.category === k).length,
    }))
    return {
      total: list.length,
      active:   list.filter((a) => a.status === 'active').length,
      maintenance: list.filter((a) => a.status === 'maintenance').length,
      draft:    list.filter((a) => a.status === 'draft').length,
      categories,
    }
  },
})

/* 智能体详情 + 关联技能 + 模拟最近对话 */
registerRoute('GET /agents/detail', {
  params: { id: ['string', true] },
  handler: ({ params } = {}) => {
    const a = MOCK.agents.find((x) => x.id === params.id)
    if (!a) throw new Error('智能体不存在')
    const linkedSkills = MOCK.skillsFull.filter((s) => s.category === a.category).slice(0, 3)
    return {
      ...a,
      linkedSkills,
      recentConversations: Array.from({ length: 4 }, (_, i) => ({
        id: `conv-${a.id}-${i + 1}`,
        title: ['链路异常诊断', '参数调优建议', '报告生成请求', '故障复盘'][i],
        updated_at: new Date(Date.now() - i * 3600_000).toISOString(),
      })),
    }
  },
})

/* ============================================================
 * 技能 · Skills
 * ============================================================ */
registerRoute('GET /skills/list', {
  params: {
    category: ['string',  false],
    keyword:  ['string',  false],
    sort:     ['string',  false],
    pageNo:   ['number',  false],
    pageSize: ['number',  false],
  },
  handler: ({ params } = {}) => {
    let list = [...MOCK.skillsFull]
    if (params?.category && params.category !== 'all') {
      list = list.filter((s) => s.category === params.category)
    }
    if (params?.keyword) {
      const k = String(params.keyword).toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(k) ||
          (s.description || '').toLowerCase().includes(k),
      )
    }
    if (params?.sort === 'usage')   list.sort((a, b) => b.usage_count - a.usage_count)
    else if (params?.sort === 'agents')  list.sort((a, b) => b.agents_count - a.agents_count)
    else if (params?.sort === 'newest')  list.sort((a, b) => b.createdAt - a.createdAt)
    return page(list, Number(params?.pageNo || 1), Number(params?.pageSize || 24))
  },
})

registerRoute('GET /skills/detail', {
  params: { id: ['string', true] },
  handler: ({ params } = {}) => {
    const s = MOCK.skillsFull.find((x) => x.id === params.id)
    if (!s) throw new Error('技能不存在')
    /* 关联智能体:同分类 + 部分匹配 */
    const linked = MOCK.agents
      .filter((a) => a.category === s.category || s.category === 'general')
      .slice(0, 6)
      .map((a) => ({
        id: a.id, name: a.name, category: a.category, color_theme: a.color_theme, usage_count: a.usage_count,
      }))
    return { ...s, linkedAgents: linked }
  },
})

/* ============================================================
 * 知识库 · Knowledge Bases (含个人知识库)
 * ============================================================ */
/* 知识库分类元数据(7 大分类,带 icon 与配色) */
registerRoute('GET /knowledge-bases/categories', {
  handler: () => ({
    list: MOCK.knowledgeBaseCategories || [],
    counts: (MOCK.knowledgeBaseCategories || []).map((c) => ({
      ...c,
      count: MOCK.knowledgeBases.filter((k) => k.category === c.key).length,
    })),
  }),
})

registerRoute('GET /knowledge-bases/list', {
  params: {
    visibility: ['string', false],
    keyword:    ['string', false],
    category:   ['string', false],
    tag:        ['string', false],
  },
  handler: ({ params } = {}) => {
    let list = [...MOCK.knowledgeBases]
    if (params?.visibility && params.visibility !== 'all') {
      list = list.filter((k) => k.visibility === params.visibility)
    }
    if (params?.category && params.category !== 'all') {
      list = list.filter((k) => k.category === params.category)
    }
    if (params?.tag) {
      list = list.filter((k) => (k.tags || []).includes(params.tag))
    }
    if (params?.keyword) {
      const k = String(params.keyword).toLowerCase()
      list = list.filter(
        (x) =>
          x.name.toLowerCase().includes(k) ||
          (x.description || '').toLowerCase().includes(k) ||
          (x.tags || []).some((t) => t.toLowerCase().includes(k)),
      )
    }
    return { list, total: list.length }
  },
})

registerRoute('GET /knowledge-bases/detail', {
  params: { id: ['string', true] },
  handler: ({ params } = {}) => {
    const kb = MOCK.knowledgeBases.find((x) => x.id === params.id)
    if (!kb) throw new Error('知识库不存在')
    const documents = MOCK.documents.filter((d) => d.knowledge_base_id === params.id)
    return { ...kb, documents }
  },
})

registerRoute('GET /knowledge-bases/stats', {
  handler: () => {
    const totalKBs = MOCK.knowledgeBases.length
    const docs = MOCK.documents
    const totalDocs = docs.length
    const totalSize = docs.reduce((s, d) => s + (d.size_bytes || 0), 0)
    /* 按 parse_status 分组 */
    const statusBreakdown = docs.reduce((acc, d) => {
      acc[d.parse_status] = (acc[d.parse_status] || 0) + 1
      return acc
    }, {})
    /* 按 visibility 分组 */
    const visibilityBreakdown = MOCK.knowledgeBases.reduce((acc, k) => {
      acc[k.visibility] = (acc[k.visibility] || 0) + 1
      return acc
    }, {})
    /* 各 KB 真实文档数 */
    const kbDocCounts = MOCK.knowledgeBases.map((kb) => {
      const own = docs.filter((d) => d.knowledge_base_id === kb.id)
      return {
        id: kb.id,
        name: kb.name,
        document_count: kb.document_count,
        actual_count: own.length,
        completed_count: own.filter((d) => d.parse_status === 'completed').length,
        visibility: kb.visibility,
      }
    })
    return {
      totalKnowledgeBases: totalKBs,
      totalDocuments:      totalDocs,
      totalSizeBytes:      totalSize,
      statusBreakdown,
      visibilityBreakdown,
      kbDocCounts,
    }
  },
})

/* 创建知识库 */
registerRoute('POST /knowledge-bases', {
  body: {
    name:        ['string', true],
    description: ['string', false],
    visibility:  ['string', false],
  },
  handler: ({ body } = {}) => {
    const id = `kb-${uid().slice(0, 8)}`
    const created = {
      id,
      name: body.name,
      description: body.description || '',
      visibility: body.visibility || 'private',
      document_count: 0,
      creator_name: 'Alex Chen',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
    }
    MOCK.knowledgeBases.unshift(created)
    return { id, message: '知识库创建成功' }
  },
})

/* 上传文档 */
registerRoute('POST /documents', {
  body: {
    knowledge_base_id: ['string', true],
    filename:          ['string', true],
    format:            ['string', true],
    size_bytes:        ['number', false],
  },
  handler: ({ body } = {}) => {
    const kb = MOCK.knowledgeBases.find((k) => k.id === body.knowledge_base_id)
    if (!kb) throw new Error('知识库不存在')
    const id = `doc-${uid().slice(0, 8)}`
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    const doc = {
      id,
      knowledge_base_id: body.knowledge_base_id,
      filename:          body.filename,
      format:            body.format,
      size_bytes:        body.size_bytes || Math.round(100_000 + Math.random() * 2_000_000),
      parse_status:      'pending',
      uploader_name:     'Alex Chen',
      upload_time:       now,
      last_modified:     now,
      modifier_name:     'Alex Chen',
      version:           '1.0.0',
      tags:              body.tags || [],
      share:             { mode: 'private', link: '' },
      shared_members:    [],
      content_index:     body.content_index || `新上传的 ${body.format} 文档,正在解析中...`,
      chunk_count:       Math.round(20 + (body.size_bytes || 200_000) / 50_000),
      token_count:       Math.round((body.size_bytes || 200_000) / 4),
    }
    MOCK.documents.unshift(doc)
    return { id, message: '文档已加入解析队列' }
  },
})

/* 文档详情(支持预览) */
registerRoute('GET /documents/detail', {
  params: { id: ['string', true] },
  handler: ({ params } = {}) => {
    const doc = MOCK.documents.find((d) => d.id === params.id)
    if (!doc) throw new Error('文档不存在')
    /* 生成可预览内容 */
    const ext = (doc.format || '').toLowerCase()
    const base = {
      ...doc,
      chunk_count: Math.round(20 + (doc.size_bytes || 0) / 50000),
      token_count: Math.round(((doc.size_bytes || 0) / 4)),
    }
    if (['md', 'markdown', 'txt'].includes(ext)) {
      base.preview_kind = 'markdown'
      base.preview_body = `# ${doc.filename}\n\n## 概述\n\n本文档是 **${doc.filename}** (${doc.format} / ${(doc.size_bytes/1024).toFixed(1)} KB) 的预览内容。\n\n## 关键章节\n\n- 第 1 章:背景与目标\n- 第 2 章:测试方法\n- 第 3 章:结果分析\n- 第 4 章:复盘与改进\n\n## 摘要\n\n> 这是文档的 Markdown 预览区域,完整 RAG 索引已就绪,可被任意智能体引用。\n\n\`\`\`text\n${doc.id} · 已被 ${Math.round(Math.random() * 12) + 3} 个智能体引用\n\`\`\`\n`
    } else if (ext === 'json') {
      base.preview_kind = 'code'
      base.preview_body = JSON.stringify({
        document_id: doc.id,
        knowledge_base_id: doc.knowledge_base_id,
        filename: doc.filename,
        size_bytes: doc.size_bytes,
        parse_status: doc.parse_status,
        metadata: {
          author: 'Alex Chen',
          version: '1.0.0',
          indexed_at: new Date().toISOString(),
          tags: ['protocol', 'test-case', 'satellite-internet'],
        },
        chunks: Array.from({ length: 5 }, (_, i) => ({
          id: `${doc.id}-chunk-${i}`,
          page: i + 1,
          tokens: 200 + i * 50,
          text: `这是第 ${i + 1} 个文本块的预览,描述该片段的语义内容...`,
        })),
      }, null, 2)
      base.preview_lang = 'json'
    } else if (['pdf'].includes(ext)) {
      base.preview_kind = 'pdf-mock'
      base.preview_body = `${doc.filename}\n\n— 共 ${Math.round((doc.size_bytes || 0) / 80_000)} 页 —\n\nPDF 文档已转为图片渲染,支持单页缩放与全屏阅读。\n左侧为目录大纲,右侧为内容主体。`
      base.preview_sections = {
        title: doc.filename,
        summary: '暂无解析内容。该文档尚未完成解析或失败。',
        sections: [
          {
            heading: '一、市场现状',
            paragraph: '随着 LLM 大模型技术的成熟,企业和组织对私域知识的高效管理需求日益凸显。传统的非结构化数据管理模式已无法满足 AI 时代的需求,检索增强生成(RAG)技术成为行业标准方案。',
            bullets: [
              '数据解析的准确度与分块策略(Chunking)',
              '多模态数据支持能力(PDF、Image、Text)',
              '与现有业务系统的集成便捷度',
            ],
          },
          {
            heading: '二、核心能力',
            paragraph: 'VLEO(Very Low Earth Orbit)系统面向低轨星座场景,在链路质量、时延与吞吐之间形成新一代行业标杆。本知识库沉淀相关协议、测试方法与故障复盘。',
            bullets: [
              '协议规范:ITU-R S.2172、3GPP NTN、DVB-S2X 等',
              '测试报告:星地链路、雨衰模型、误码率测试',
              '故障复盘:链路中断、闪断、参数漂移案例',
            ],
          },
          {
            heading: '三、应用场景',
            paragraph: '面向卫星互联网运营商、终端设备厂商和行业集成商,提供从协议解析、链路优化到智能问答的完整能力栈。',
            bullets: [
              '智能问答:基于知识库的协议规范自动答疑',
              '辅助决策:链路参数动态调优与异常告警',
              '培训演练:标准化教材与典型案例沉淀',
            ],
          },
        ],
      }
    } else if (['docx', 'doc'].includes(ext)) {
      base.preview_kind = 'word-mock'
      base.preview_body = `${doc.filename}\n\n这是一份 Word 文档,文字内容已通过解析器抽取并建立 RAG 索引。\n\n文档主要内容包括:\n1. 项目背景与目标\n2. 需求分析\n3. 测试方案\n4. 执行结果与复盘\n\n` + '正文段落示例 ... '.repeat(8)
    } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
      base.preview_kind = 'table-mock'
      const rows = Array.from({ length: 8 }, (_, i) => ({
        idx: i + 1,
        metric: ['丢包率', '时延(ms)', '抖动(ms)', '吞吐量(Mbps)'][i % 4],
        value: (Math.random() * 100).toFixed(2),
        target: '< 50',
        status: Math.random() > 0.7 ? '告警' : '正常',
      }))
      base.preview_body = JSON.stringify(rows, null, 2)
    } else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
      base.preview_kind = 'image-mock'
      base.preview_body = `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#5b8def"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><rect width="400" height="260" fill="url(#g)"/><text x="200" y="130" text-anchor="middle" fill="#fff" font-size="20" font-family="system-ui">${doc.filename}</text><text x="200" y="160" text-anchor="middle" fill="#fff" font-size="12" opacity="0.8">图片预览占位 · ${doc.format.toUpperCase()}</text></svg>`,
      )}`
    } else if (['mp4', 'mov', 'webm', 'avi'].includes(ext)) {
      base.preview_kind = 'video-mock'
      base.preview_body = `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270"><defs><linearGradient id="vg" x1="0" x2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#581c87"/></linearGradient></defs><rect width="480" height="270" fill="url(#vg)"/><circle cx="240" cy="135" r="36" fill="rgba(255,255,255,0.18)"/><polygon points="232,118 232,152 260,135" fill="#fff"/><text x="240" y="200" text-anchor="middle" fill="#fff" font-size="14" font-family="system-ui">${doc.filename}</text><text x="240" y="222" text-anchor="middle" fill="#a5b4fc" font-size="11">视频预览占位 · ${(doc.size_bytes/1048576).toFixed(1)} MB</text></svg>`,
      )}`
      base.preview_duration = Math.round((doc.size_bytes || 0) / 2_000_000)
    } else if (['py', 'js', 'ts', 'sh', 'yaml', 'yml'].includes(ext)) {
      base.preview_kind = 'code'
      base.preview_lang = ext
      const samples = {
        py: [
`# ${doc.filename}`,
`# 自动化测试脚本 · ${(doc.size_bytes/1024).toFixed(1)} KB`,
``,
`import time`,
`import requests`,
``,
`def check_link_quality(endpoint: str, timeout: int = 5):`,
`    """链路质量检测,返回 (rtt_ms, jitter_ms, loss_pct)"""`,
`    samples = []`,
`    for _ in range(10):`,
`        t0 = time.perf_counter()`,
`        try:`,
`            r = requests.get(endpoint, timeout=timeout)`,
`            samples.append((time.perf_counter() - t0) * 1000)`,
`        except requests.RequestException:`,
`            samples.append(None)`,
`    samples = [s for s in samples if s is not None]`,
`    avg = sum(samples) / len(samples) if samples else float("inf")`,
`    jitter = max(samples) - min(samples) if len(samples) > 1 else 0`,
`    loss = (10 - len(samples)) / 10 * 100`,
`    return avg, jitter, loss`,
``,
`if __name__ == "__main__":`,
`    rtt, jit, loss = check_link_quality("https://kb.aeros.dev/health")`,
`    print(f"rtt={rtt:.1f}ms  jitter={jit:.1f}ms  loss={loss:.0f}%")`,
        ].join('\n'),
        sh: [
`#!/usr/bin/env bash`,
`# ${doc.filename}`,
`set -euo pipefail`,
``,
`KB_BASE="\${KB_BASE:-https://kb.aeros.dev}"`,
`TOKEN="\${KB_TOKEN:?missing token}"`,
``,
`upload_file() {`,
`  local f="$1"`,
`  curl -fsSL -X POST "$KB_BASE/api/documents" \\`,
`    -H "Authorization: Bearer $TOKEN" \\`,
`    -F "file=@\${f}" | jq .id`,
`}`,
``,
`main() {`,
`  for f in "$@"; do`,
`    id=$(upload_file "$f")`,
`    echo "✓ uploaded \${f} -> \${id}"`,
`  done`,
`}`,
``,
`main "$@"`,
        ].join('\n'),
      }
      base.preview_body = samples[ext] || samples.py
    } else if (ext === 'zip') {
      base.preview_kind = 'archive-mock'
      base.preview_body = JSON.stringify({
        filename: doc.filename,
        total_size: doc.size_bytes,
        entry_count: 1245,
        entries: [
          { name: 'rainfall_2026Q1_01.csv',  size: 32_456 },
          { name: 'rainfall_2026Q1_02.csv',  size: 28_912 },
          { name: 'rainfall_2026Q1_03.csv',  size: 30_145 },
          { name: 'metadata.json',           size:  2_456 },
        ],
      }, null, 2)
    } else if (ext === 'bin') {
      base.preview_kind = 'binary-mock'
      base.preview_body = JSON.stringify({
        filename: doc.filename,
        format: doc.format,
        size_bytes: doc.size_bytes,
        sha256: 'a1b2c3d4e5f6789' + doc.id.slice(-4),
        tensor_shape: [1, 3, 640, 640],
        dtype: 'int8',
        layers: 245,
      }, null, 2)
    } else {
      base.preview_kind = 'unsupported'
      base.preview_body = `暂不支持 ${doc.format} 格式的在线预览,您可以下载后查看。`
    }
    return base
  },
})

/* 文档内容全文搜索(跨知识库,支持高亮) */
registerRoute('GET /documents/search', {
  params: {
    keyword: ['string', true],
    kb_id:   ['string', false],
    tag:     ['string', false],
    format:  ['string', false],
    limit:   ['number', false],
  },
  handler: ({ params } = {}) => {
    const kw = String(params.keyword || '').toLowerCase().trim()
    if (!kw) return { list: [], total: 0 }
    let list = [...MOCK.documents]
    if (params?.kb_id && params.kb_id !== 'all') {
      list = list.filter((d) => d.knowledge_base_id === params.kb_id)
    }
    if (params?.tag) {
      list = list.filter((d) => (d.tags || []).includes(params.tag))
    }
    if (params?.format && params.format !== 'all') {
      list = list.filter((d) => (d.format || '').toLowerCase() === params.format.toLowerCase())
    }
    list = list.filter((d) => {
      const hay = [
        d.filename || '',
        (d.tags || []).join(' '),
        d.content_index || '',
      ].join(' ').toLowerCase()
      return hay.includes(kw)
    })
    const limit = Number(params?.limit || 20)
    const items = list.slice(0, limit).map((d) => {
      const text = d.content_index || ''
      const idx = text.toLowerCase().indexOf(kw)
      let snippet = ''
      if (idx >= 0) {
        const start = Math.max(0, idx - 32)
        const end = Math.min(text.length, idx + kw.length + 60)
        snippet = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
      } else {
        snippet = text.slice(0, 80) + (text.length > 80 ? '…' : '')
      }
      const kb = MOCK.knowledgeBases.find((k) => k.id === d.knowledge_base_id)
      return {
        ...d,
        content_snippet: snippet,
        kb_name: kb?.name || '—',
        kb_color: kb?.color_theme || '#5b8def',
        kb_category: kb?.category || 'custom',
      }
    })
    return { list: items, total: list.length, keyword: kw }
  },
})

/* 文档版本历史 */
registerRoute('GET /documents/versions', {
  params: { id: ['string', true] },
  handler: ({ params } = {}) => {
    const doc = MOCK.documents.find((d) => d.id === params.id)
    if (!doc) throw new Error('文档不存在')
    const baseVer = doc.version || '1.0.0'
    const parts = baseVer.split('.').map((p) => Number(p) || 0)
    const [maj, min, patch] = parts
    const versions = []
    versions.push({
      version: baseVer,
      author: doc.modifier_name || doc.uploader_name,
      modified_at: doc.last_modified || doc.upload_time,
      changelog: '当前版本 · 已建立 RAG 索引,可被智能体引用',
      size_bytes: doc.size_bytes,
      is_current: true,
    })
    const past = [
      { v: `${maj}.${min}.${Math.max(0, patch - 1)}`, day: 18, msg: '修正若干错别字与图表编号,优化结论表述' },
      { v: `${maj}.${Math.max(0, min - 1)}.0`,         day: 45, msg: '补充第 4 章复盘与改进结论' },
      { v: `${Math.max(1, maj - 1)}.0.0`,              day: 92, msg: '初版发布,完成主要章节草稿' },
    ]
    past.forEach(({ v, day, msg }) => {
      if (v === baseVer) return
      const t = new Date(Date.now() - day * 86400_000)
      versions.push({
        version: v,
        author: ['Alex Chen', '李工', '陈博士', '王工'][Math.floor(Math.random() * 4)],
        modified_at: t.toISOString().slice(0, 16).replace('T', ' '),
        changelog: msg,
        size_bytes: Math.round((doc.size_bytes || 200_000) * (0.7 + Math.random() * 0.25)),
        is_current: false,
      })
    })
    return { id: doc.id, filename: doc.filename, versions }
  },
})

/* 更新文档元数据(tags / 提交新版本) */
registerRoute('PUT /documents', {
  body: {
    id:           ['string',  true],
    tags:         ['array',   false],
    bump_version: ['boolean', false],
    changelog:    ['string',  false],
  },
  handler: ({ body } = {}) => {
    const doc = MOCK.documents.find((d) => d.id === body.id)
    if (!doc) throw new Error('文档不存在')
    if (Array.isArray(body.tags)) doc.tags = body.tags
    if (body.bump_version) {
      const parts = (doc.version || '1.0.0').split('.').map((p) => Number(p) || 0)
      parts[2] = (parts[2] || 0) + 1
      doc.version = parts.join('.')
      doc.last_modified = new Date().toISOString().replace('T', ' ').slice(0, 16)
      MOCK.documentVersions[doc.id] = doc.version
    }
    return { id: doc.id, version: doc.version, tags: doc.tags, last_modified: doc.last_modified }
  },
})

/* 文档分享设置(创建 / 更新) */
registerRoute('POST /documents/share', {
  body: {
    id:   ['string', true],
    mode: ['string', true],   /* private / link / public */
    link: ['string', false],
  },
  handler: ({ body } = {}) => {
    const doc = MOCK.documents.find((d) => d.id === body.id)
    if (!doc) throw new Error('文档不存在')
    const mode = body.mode
    if (!['private', 'link', 'public'].includes(mode)) {
      throw new Error('非法的分享模式')
    }
    let link = body.link || ''
    if (mode === 'link' && !link) {
      link = `https://kb.aeros.dev/s/${doc.id}-${Math.random().toString(36).slice(2, 6)}`
    }
    doc.share = { mode, link }
    MOCK.documentShares[doc.id] = doc.share
    return { id: doc.id, share: doc.share }
  },
})

/* 删除文档 */
registerRoute('DELETE /documents', {
  params: { id: ['string', true] },
  handler: ({ params } = {}) => {
    const idx = MOCK.documents.findIndex((d) => d.id === params.id)
    if (idx < 0) throw new Error('文档不存在')
    const [removed] = MOCK.documents.splice(idx, 1)
    delete MOCK.documentVersions[removed.id]
    delete MOCK.documentShares[removed.id]
    return { id: removed.id, message: '已删除' }
  },
})

/* 批量上传文档 */
registerRoute('POST /documents/batch', {
  body: {
    knowledge_base_id: ['string', true],
    files:             ['array',  true], // [{ filename, format, size_bytes }]
  },
  handler: ({ body } = {}) => {
    const kb = MOCK.knowledgeBases.find((k) => k.id === body.knowledge_base_id)
    if (!kb) throw new Error('知识库不存在')
    if (!Array.isArray(body.files) || body.files.length === 0) {
      throw new Error('未提供文件')
    }
    const created = []
    for (const f of body.files) {
      const id = `doc-${uid().slice(0, 8)}`
      const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
      const doc = {
        id,
        knowledge_base_id: body.knowledge_base_id,
        filename:          f.filename,
        format:            f.format,
        size_bytes:        f.size_bytes || Math.round(100_000 + Math.random() * 2_000_000),
        parse_status:      'pending',
        uploader_name:     'Alex Chen',
        upload_time:       now,
        last_modified:     now,
        modifier_name:     'Alex Chen',
        version:           '1.0.0',
        tags:              f.tags || [],
        share:             { mode: 'private', link: '' },
        shared_members:    [],
        content_index:     f.content_index || `批量上传的 ${f.format} 文档,正在解析中...`,
        chunk_count:       Math.round(20 + (f.size_bytes || 200_000) / 50_000),
        token_count:       Math.round((f.size_bytes || 200_000) / 4),
      }
      MOCK.documents.unshift(doc)
      created.push({ id, filename: f.filename, ok: true })
    }
    return { created, count: created.length, message: `成功上传 ${created.length} 个文件` }
  },
})

/* 批量删除文档 */
registerRoute('POST /documents/batch-delete', {
  body: { ids: ['array', true] },
  handler: ({ body } = {}) => {
    const ids = body.ids || []
    const results = []
    for (const id of ids) {
      const idx = MOCK.documents.findIndex((d) => d.id === id)
      if (idx >= 0) {
        const [removed] = MOCK.documents.splice(idx, 1)
        delete MOCK.documentVersions[removed.id]
        delete MOCK.documentShares[removed.id]
        results.push({ id, ok: true })
      } else {
        results.push({ id, ok: false, error: '文档不存在' })
      }
    }
    return { results, count: results.filter((r) => r.ok).length }
  },
})

/* 重新解析文档 */
registerRoute('POST /documents/reparse', {
  body: { id: ['string', true] },
  handler: ({ body } = {}) => {
    const doc = MOCK.documents.find((d) => d.id === body.id)
    if (!doc) throw new Error('文档不存在')
    doc.parse_status = 'pending'
    doc.last_modified = new Date().toISOString().replace('T', ' ').slice(0, 16)
    return { id: doc.id, parse_status: doc.parse_status, message: '已重新加入解析队列' }
  },
})

/* 更新知识库(重命名/修改描述/调整可见性) */
registerRoute('PUT /knowledge-bases', {
  body: {
    id:          ['string', true],
    name:        ['string', false],
    description: ['string', false],
    visibility:  ['string', false],
  },
  handler: ({ body } = {}) => {
    const kb = MOCK.knowledgeBases.find((k) => k.id === body.id)
    if (!kb) throw new Error('知识库不存在')
    if (body.name !== undefined) {
      if (!String(body.name).trim()) throw new Error('名称不能为空')
      kb.name = String(body.name).trim()
    }
    if (body.description !== undefined) kb.description = body.description
    if (body.visibility !== undefined) {
      if (!['private', 'organization', 'public'].includes(body.visibility)) {
        throw new Error('非法的可见性选项')
      }
      kb.visibility = body.visibility
    }
    kb.updated_at = new Date().toISOString().replace('T', ' ').slice(0, 16)
    return { id: kb.id, name: kb.name, description: kb.description, visibility: kb.visibility, updated_at: kb.updated_at }
  },
})

/* 删除知识库(级联删除其下文档) */
registerRoute('DELETE /knowledge-bases', {
  params: { id: ['string', true] },
  handler: ({ params } = {}) => {
    const idx = MOCK.knowledgeBases.findIndex((k) => k.id === params.id)
    if (idx < 0) throw new Error('知识库不存在')
    const [removed] = MOCK.knowledgeBases.splice(idx, 1)
    /* 级联删除文档 */
    let removedDocs = 0
    for (let i = MOCK.documents.length - 1; i >= 0; i--) {
      if (MOCK.documents[i].knowledge_base_id === removed.id) {
        const [d] = MOCK.documents.splice(i, 1)
        delete MOCK.documentVersions[d.id]
        delete MOCK.documentShares[d.id]
        removedDocs += 1
      }
    }
    return { id: removed.id, message: '已删除', removed_documents: removedDocs }
  },
})

/* ============================================================
 * 专栏 · Columns
 * ============================================================ */
registerRoute('GET /columns/list', {
  params: {
    category: ['string', false],
    keyword:  ['string', false],
  },
  handler: ({ params } = {}) => {
    let list = [...MOCK.columns]
    if (params?.category && params.category !== 'all') {
      list = list.filter((c) => c.category === params.category)
    }
    if (params?.keyword) {
      const k = String(params.keyword).toLowerCase()
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(k) ||
          c.author.toLowerCase().includes(k) ||
          (c.tags || []).some((t) => t.toLowerCase().includes(k)),
      )
    }
    return { list, total: list.length }
  },
})

registerRoute('GET /columns/detail', {
  params: { id: ['string', true] },
  handler: ({ params } = {}) => {
    const c = MOCK.columns.find((x) => x.id === params.id)
    if (!c) throw new Error('专栏不存在')
    /* 模拟文章列表 */
    const articles = Array.from({ length: Math.min(8, c.articles_count) }, (_, i) => ({
      id: `${c.id}-art-${i + 1}`,
      title: i === 0 ? c.latest_title : `${c.latest_title} · 番外 ${i}`,
      published_at: new Date(Date.now() - i * 7 * 86400_000).toISOString().slice(0, 10),
      reading_minutes: 6 + (i * 3) % 12,
      likes: Math.round(50 + (i * 37) % 380),
    }))
    return { ...c, articles }
  },
})

/* 订阅/取消订阅专栏 */
registerRoute('POST /columns/subscribe', {
  body: { id: ['string', true] },
  handler: ({ body } = {}) => {
    const c = MOCK.columns.find((x) => x.id === body.id)
    if (!c) throw new Error('专栏不存在')
    c.subscribers = (c.subscribers || 0) + 1
    return { id: body.id, subscribed: true, subscribers: c.subscribers }
  },
})
registerRoute('POST /columns/unsubscribe', {
  body: { id: ['string', true] },
  handler: ({ body } = {}) => {
    const c = MOCK.columns.find((x) => x.id === body.id)
    if (!c) throw new Error('专栏不存在')
    c.subscribers = Math.max(0, (c.subscribers || 0) - 1)
    return { id: body.id, subscribed: false, subscribers: c.subscribers }
  },
})

/* 批量订阅(订阅整个分类时使用) */
registerRoute('POST /columns/batch-subscribe', {
  body: { ids: ['array', true] },
  handler: ({ body } = {}) => {
    const ids = body.ids || []
    const results = []
    for (const id of ids) {
      const c = MOCK.columns.find((x) => x.id === id)
      if (c) {
        c.subscribers = (c.subscribers || 0) + 1
        results.push({ id, ok: true, subscribers: c.subscribers })
      } else {
        results.push({ id, ok: false, error: '专栏不存在' })
      }
    }
    return { results, count: results.filter((r) => r.ok).length }
  },
})

/* 设置订阅偏好(通知/频率) */
registerRoute('POST /columns/prefs', {
  body: {
    id:        ['string',  true],
    notify:    ['boolean', false],
    frequency: ['string',  false],
  },
  handler: ({ body } = {}) => {
    const c = MOCK.columns.find((x) => x.id === body.id)
    if (!c) throw new Error('专栏不存在')
    return {
      id: body.id,
      notify: body.notify !== false,
      frequency: body.frequency || 'realtime',
    }
  },
})

/* 获取已订阅专栏的最新文章聚合(供"我的订阅 / 近期更新"使用) */
registerRoute('GET /columns/recent', {
  params: {
    limit:   ['number',  false],
    sort:    ['string',  false], // latest | popular
  },
  handler: ({ params } = {}) => {
    const idsParam = (() => {
      try {
        const raw = (typeof window !== 'undefined' && window.location) || null
        /* axios 传数组到 query 时, 框架会自动拼成 ids[]=… 我们直接信任 params */
        return params?.ids
      } catch { return null }
    })()
    const idList = Array.isArray(idsParam) ? idsParam : []
    const idSet = new Set(idList)
    const limit = params?.limit || 20
    const sort = params?.sort || 'latest'
    const items = []
    for (const c of MOCK.columns) {
      if (idSet.size && !idSet.has(c.id)) continue
      const articleCount = Math.min(3, c.articles_count || 1)
      for (let i = 0; i < articleCount; i++) {
        const ts = new Date(Date.now() - i * 7 * 86400_000).getTime()
        items.push({
          id: `${c.id}-art-${i + 1}`,
          column_id: c.id,
          column_title: c.title,
          author: c.author,
          author_title: c.author_title,
          cover_color: c.cover_color,
          title: i === 0 ? c.latest_title : `${c.latest_title} · 番外 ${i}`,
          published_at: new Date(ts).toISOString(),
          reading_minutes: 6 + (i * 3) % 12,
          likes: Math.round(50 + (i * 37) % 380),
        })
      }
    }
    items.sort((a, b) => {
      if (sort === 'popular') return (b.likes || 0) - (a.likes || 0)
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    })
    return { items: items.slice(0, limit), total: items.length }
  },
})

/* 文章详情(完整页) - 配合 /columns/article/:id 路由 */
registerRoute('GET /columns/article-detail', {
  params: { id: ['string', true] },
  handler: ({ params } = {}) => {
    const articleId = String(params.id)
    /* 解析 column_id:约定为 ${column_id}-art-${n+1} */
    const m = articleId.match(/^(col-\d+)-art-(\d+)$/)
    const columnId = m ? m[1] : null
    const seq = m ? parseInt(m[2], 10) : 1
    const col = columnId ? MOCK.columns.find((x) => x.id === columnId) : null
    if (!col) throw new Error('文章不存在')
    /* 构造基础元数据 */
    const base = {
      id: articleId,
      column_id: col.id,
      column_title: col.title,
      category: col.category,
      author: col.author,
      author_title: col.author_title,
      cover_color: col.cover_color,
      column_tags: col.tags || [],
      published_at: new Date(Date.now() - (seq - 1) * 7 * 86400_000).toISOString(),
      reading_minutes: 6 + (seq * 3) % 12,
      likes: Math.round(50 + (seq * 37) % 380),
      views: 1200 + (seq * 233) % 6000,
    }
    /* 内容池(摘要+分节) */
    const content = MOCK.buildArticleContent(articleId, col.id)
    /* 关联阅读:同专栏的其他 2-3 篇文章 */
    const relatedIds = [2, 3].map((n) => `${col.id}-art-${seq + n}`)
    const related = relatedIds.map((rid) => {
      const c2 = MOCK.buildArticleContent(rid, col.id)
      return {
        id: rid,
        title: c2.title,
        reading_minutes: 6 + ((seq + 1) * 3) % 12,
        summary: c2.summary,
      }
    })
    return { ...base, ...content, related }
  },
})

/* ============================================================
 * 导出给视图层使用的方法
 * ============================================================ */
export const listAgents       = (params) => http.get('/agents/list', { params })
export const getAgentCategories = ()    => http.get('/agents/categories')
export const getAgentDetail   = (id)    => http.get('/agents/detail', { params: { id } })
export const listSkills       = (params) => http.get('/skills/list', { params })
export const getSkillDetail   = (id)    => http.get('/skills/detail', { params: { id } })
export const listKnowledgeBases = (params) => http.get('/knowledge-bases/list', { params })
export const getKnowledgeBaseDetail = (id) => http.get('/knowledge-bases/detail', { params: { id } })
export const getKnowledgeBaseStats  = ()    => http.get('/knowledge-bases/stats')
export const getKnowledgeBaseCategories = () => http.get('/knowledge-bases/categories')
export const createKnowledgeBase    = (body) => http.post('/knowledge-bases', body)
export const updateKnowledgeBase    = (body) => http.put('/knowledge-bases', body)
export const deleteKnowledgeBase    = (id)    => http.delete('/knowledge-bases', { params: { id } })
export const uploadDocument         = (body) => http.post('/documents', body)
export const batchUploadDocuments   = (body) => http.post('/documents/batch', body)
export const batchDeleteDocuments   = (ids)  => http.post('/documents/batch-delete', { ids })
export const reparseDocument        = (id)    => http.post('/documents/reparse', { id })
export const getDocumentDetail      = (id)    => http.get('/documents/detail', { params: { id } })
export const updateDocument         = (body) => http.put('/documents', body)
export const deleteDocument         = (id)    => http.delete('/documents', { params: { id } })
export const searchDocuments        = (params) => http.get('/documents/search', { params })
export const getDocumentVersions    = (id)    => http.get('/documents/versions', { params: { id } })
export const setDocumentShare       = (body) => http.post('/documents/share', body)
export const listColumns        = (params) => http.get('/columns/list', { params })
export const getColumnDetail    = (id)    => http.get('/columns/detail', { params: { id } })
export const subscribeColumn    = (id)    => http.post('/columns/subscribe', { id })
export const unsubscribeColumn  = (id)    => http.post('/columns/unsubscribe', { id })
export const batchSubscribeColumns = (ids) => http.post('/columns/batch-subscribe', { ids })
export const setColumnPrefs     = (body)  => http.post('/columns/prefs', body)
export const getRecentArticles  = (params)=> http.get('/columns/recent', { params })
export const getArticleDetail   = (id)    => http.get('/columns/article-detail', { params: { id } })
