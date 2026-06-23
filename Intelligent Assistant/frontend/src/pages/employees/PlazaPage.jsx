/**
 * 员工广场页面 — 数字员工 / 员工广场
 *
 * 路由: /employees/plaza
 *
 * 功能:展示平台所有可用的数字员工,用户可浏览、搜索并快速发起对话。
 *      此为占位实现,后续接入 useEmployees hook 与卡片网格。
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SAMPLE_EMPLOYEES = [
  { id: 'plaza-1', name: '财报分析师', desc: '专业解读上市公司财报与公告', tag: '金融' },
  { id: 'plaza-2', name: '产品需求助手', desc: '从一句话需求自动生成 PRD 草案', tag: '产品' },
  { id: 'plaza-3', name: '代码审查员', desc: '审查 PR 并给出改进建议', tag: '研发' },
  { id: 'plaza-4', name: '会议纪要官', desc: '实时转写会议并提炼待办', tag: '办公' },
  { id: 'plaza-5', name: '行业研究员', desc: '跟踪行业动态输出周报', tag: '研究' },
  { id: 'plaza-6', name: '翻译助理', desc: '多语种互译并保留专业术语', tag: '通用' },
]

export default function PlazaPage() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')

  const filtered = SAMPLE_EMPLOYEES.filter(
    (e) => e.name.includes(keyword) || e.tag.includes(keyword) || e.desc.includes(keyword)
  )

  return (
    <div className="px-8 py-6 max-w-6xl mx-auto">
      {/* 页头 */}
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-on-surface)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            员工广场
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            探索并启用工位上的 AI 数字员工,共 48 位就绪
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg w-72"
          style={{
            backgroundColor: 'var(--color-surface-container-low)',
            border: '1px solid var(--color-surface-variant)',
          }}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--color-outline)' }}>
            search
          </span>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索员工名称 / 标签"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--color-on-surface)' }}
          />
        </div>
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((emp) => (
          <div
            key={emp.id}
            className="p-5 rounded-xl transition-colors duration-200"
            style={{
              backgroundColor: 'var(--color-surface-container-low)',
              border: '1px solid var(--color-surface-variant)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-surface-variant)')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary-container)' }}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ color: 'var(--color-on-primary-container)' }}
                >
                  group
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>
                  {emp.name}
                </div>
                <div
                  className="text-[11px] mt-0.5 inline-block px-1.5 py-0.5 rounded"
                  style={{
                    color: 'var(--color-on-tertiary-container)',
                    backgroundColor: 'var(--color-tertiary-container)',
                  }}
                >
                  {emp.tag}
                </div>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-on-surface-variant)' }}>
              {emp.desc}
            </p>
            <button
              type="button"
              onClick={() => navigate('/chat/new')}
              className="mt-4 w-full py-2 rounded-lg text-sm font-medium transition-opacity duration-200 hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              启用并对话
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div
            className="col-span-full py-12 text-center text-sm"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            未找到匹配员工
          </div>
        )}
      </div>
    </div>
  )
}
