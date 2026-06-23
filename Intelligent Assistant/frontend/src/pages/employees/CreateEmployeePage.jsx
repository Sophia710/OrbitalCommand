/**
 * 创建员工页面 — 数字员工 / 创建员工
 *
 * 路由: /employees/create
 *
 * 功能:填写数字员工基础信息并提交创建。
 *      此为占位实现,后续接入 createEmployee API。
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'

export default function CreateEmployeePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState({
    name: '',
    role: '',
    description: '',
    tags: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      showToast('请填写员工名称', 'error')
      return
    }
    setSubmitting(true)
    // 模拟提交
    await new Promise((r) => setTimeout(r, 600))
    setSubmitting(false)
    showToast(`员工「${form.name}」创建成功`, 'success')
    navigate('/employees/my')
  }

  const fieldStyle = {
    backgroundColor: 'var(--color-surface-container-low)',
    border: '1px solid var(--color-surface-variant)',
    color: 'var(--color-on-surface)',
  }

  return (
    <div className="px-8 py-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-on-surface)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          创建员工
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          填写基础信息以快速生成一个可定制的数字员工
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-xl flex flex-col gap-5"
        style={{
          backgroundColor: 'var(--color-surface-container-low)',
          border: '1px solid var(--color-surface-variant)',
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium" style={{ color: 'var(--color-on-surface)' }}>
            员工名称 <span style={{ color: 'var(--color-error)' }}>*</span>
          </span>
          <input
            value={form.name}
            onChange={update('name')}
            placeholder="例如:小研 · 行业研究"
            className="px-3 py-2.5 rounded-lg text-sm outline-none transition-colors duration-200"
            style={fieldStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-surface-variant)')}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium" style={{ color: 'var(--color-on-surface)' }}>
            角色定位
          </span>
          <input
            value={form.role}
            onChange={update('role')}
            placeholder="例如:行业研究员 / 代码审查员"
            className="px-3 py-2.5 rounded-lg text-sm outline-none transition-colors duration-200"
            style={fieldStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-surface-variant)')}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium" style={{ color: 'var(--color-on-surface)' }}>
            能力描述
          </span>
          <textarea
            value={form.description}
            onChange={update('description')}
            rows={4}
            placeholder="一句话说明该员工擅长什么、能为用户做什么"
            className="px-3 py-2.5 rounded-lg text-sm outline-none resize-y transition-colors duration-200"
            style={fieldStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-surface-variant)')}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium" style={{ color: 'var(--color-on-surface)' }}>
            标签(逗号分隔)
          </span>
          <input
            value={form.tags}
            onChange={update('tags')}
            placeholder="例如:金融, 研究, 周报"
            className="px-3 py-2.5 rounded-lg text-sm outline-none transition-colors duration-200"
            style={fieldStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-surface-variant)')}
          />
        </label>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            style={{
              color: 'var(--color-on-surface-variant)',
              border: '1px solid var(--color-surface-variant)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-container)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-opacity duration-200 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            {submitting ? '创建中…' : '创建员工'}
          </button>
        </div>
      </form>
    </div>
  )
}
