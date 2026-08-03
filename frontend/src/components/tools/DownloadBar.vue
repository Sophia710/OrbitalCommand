﻿<template>
  <div v-if="actions && actions.length" class="download-bar">
    <span class="download-bar__label">导出报告：</span>
    <button
      v-for="(a, i) in actions"
      :key="i"
      type="button"
      class="download-bar__btn"
      :class="['is-' + (a.type || 'file')]"
      :disabled="busy"
      @click="onDownload(a)"
    >
      <span class="download-bar__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </span>
      <span>{{ a.label || (a.type === 'word' ? '下载 Word' : '下载 Excel') }}</span>
    </button>
    <span v-if="busy" class="download-bar__busy">正在生成…</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useToastStore } from '@/stores/toast'

defineProps({
  actions: { type: Array, default: () => [] },
  /* 关联的 markdown / result_list 消息（用于在下载时收集正文） */
  source:  { type: Object, default: null },
})

const chat = useChatStore()
const toast = useToastStore()
const busy = ref(false)

function buildFileName(type) {
  const emp = chat.employee?.name || '市场商机分析员'
  const now = new Date()
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const hm  = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
  return `${emp}-${ymd}-${hm}.${type === 'word' ? 'doc' : 'xls'}`
}

function buildMarkdown() {
  /* 简化：把所有 markdown + result_list + 图表描述 拼成 Markdown 文本 */
  const parts = []
  parts.push(`# ${chat.employee?.name || '市场商机分析'} · 市场商机分析报告`)
  parts.push(`生成时间：${new Date().toLocaleString('zh-CN')}`)
  parts.push('')
  ;(chat.messages || []).forEach((m) => {
    if (m.who === 'markdown' && Array.isArray(m.blocks)) {
      m.blocks.forEach((b) => {
        if (b.kind === 'h2') parts.push(`## ${b.text}`)
        else if (b.kind === 'h3') parts.push(`### ${b.text}`)
        else if (b.kind === 'p')  parts.push(b.text.replace(/<[^>]+>/g, ''))
        else if (b.kind === 'ol') b.items?.forEach((it) => parts.push(`- ${it.replace(/<[^>]+>/g, '')}`))
        else if (b.kind === 'ul') b.items?.forEach((it) => parts.push(`- ${it.replace(/<[^>]+>/g, '')}`))
      })
      parts.push('')
    } else if (m.who === 'result_list' && Array.isArray(m.items)) {
      parts.push(`## ${m.title}`)
      m.items.forEach((it, i) => {
        parts.push(`${i + 1}. **${it.title}**`)
        parts.push(`   - ${it.meta}`)
        parts.push(`   - ${it.summary}`)
      })
      parts.push('')
    } else if (m.who === 'chart') {
      parts.push(`## ${m.title}`)
      parts.push(`> ${m.desc || ''}`)
      if (m.chartType === 'pie' && Array.isArray(m.data)) {
        m.data.forEach((d) => parts.push(`- ${d.name}: ${d.value}`))
      } else if ((m.chartType === 'bar' || m.chartType === 'radar') && m.data?.series) {
        m.data.series.forEach((s) => parts.push(`- ${s.name}: ${(s.value || s.data || []).join(', ')}`))
      }
      parts.push('')
    }
  })
  return parts.join('\n')
}

function buildExcel() {
  /* 简化：CSV 文本（用 .xls 扩展名可直接用 Excel 打开） */
  const lines = []
  lines.push(['序号', '标题', '元数据', '摘要', '标签'].join(','))
  ;(chat.messages || []).forEach((m) => {
    if (m.who === 'result_list' && Array.isArray(m.items)) {
      m.items.forEach((it, i) => {
        const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
        lines.push([i + 1, cell(it.title), cell(it.meta), cell(it.summary), cell(it.tag || '')].join(','))
      })
    }
  })
  if (lines.length === 1) lines.push('0,暂无数据,,,')
  return lines.join('\n')
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function onDownload(a) {
  if (busy.value) return
  busy.value = true
  try {
    if (a.type === 'word') {
      const md = buildMarkdown()
      const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office'
        xmlns:w='urn:schemas-microsoft-com:office:word'
        xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>市场商机分析报告</title></head>
        <body>${md.replace(/\n/g, '<br/>').replace(/## (.*?)(<br\/>)/g, '<h2>$1</h2>')}</body></html>`
      const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
      triggerDownload(blob, buildFileName('word'))
      toast.success('Word 报告已开始下载')
    } else if (a.type === 'excel') {
      const csv = buildExcel()
      const blob = new Blob(['\ufeff', csv], { type: 'application/vnd.ms-excel' })
      triggerDownload(blob, buildFileName('excel'))
      toast.success('Excel 数据已开始下载')
    } else {
      toast.info('未知导出类型')
    }
  } catch (e) {
    toast.error('下载失败：' + (e?.message || '未知错误'))
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.download-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 12px;
  margin-top: 8px;
  background: linear-gradient(120deg, rgba(139, 92, 246, 0.08), transparent);
  border: 1px dashed rgba(139, 92, 246, 0.3);
  border-radius: 8px;
}
.download-bar__label {
  font-size: 11.5px;
  color: var(--ink-3, #94a3b8);
  font-family: var(--font-mono, monospace);
  letter-spacing: 0.04em;
}
.download-bar__btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 500;
  background: var(--surface, #1e293b);
  color: var(--ink, #e2e8f0);
  border: 1px solid var(--line, rgba(148, 163, 184, 0.25));
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.download-bar__btn:hover:not(:disabled) {
  border-color: var(--accent, #8b5cf6);
  color: var(--accent, #a78bfa);
  background: rgba(139, 92, 246, 0.1);
}
.download-bar__btn:disabled { opacity: 0.5; cursor: not-allowed; }
.download-bar__btn.is-word:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.1);
}
.download-bar__btn.is-excel:hover:not(:disabled) {
  border-color: #10b981;
  color: #34d399;
  background: rgba(16, 185, 129, 0.1);
}
.download-bar__icon {
  display: inline-flex;
  width: 13px;
  height: 13px;
}
.download-bar__icon svg { width: 100%; height: 100%; }
.download-bar__busy {
  font-size: 11px;
  color: var(--ink-3, #94a3b8);
  font-family: var(--font-mono, monospace);
  margin-left: auto;
}
</style>