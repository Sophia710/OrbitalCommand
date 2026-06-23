/**
 * 我的员工页面 — 数字员工 / 我的员工
 *
 * 路由: /employees/my
 *
 * 功能:展示当前用户已绑定 / 收藏的数字员工列表,支持快速进入对话。
 *      此为占位实现,后续接入 useMyEmployees hook 与 useCustomAgents。
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'

const MY_EMPLOYEES = [
  { id: 'me-1', name: '小研 · 行业研究', lastUsed: '2 小时前', status: 'online' },
  { id: 'me-2', name: '小码 · 代码审查', lastUsed: '昨天', status: 'online' },
  { id: 'me-3', name: '小财 · 财报解读', lastUsed: '3 天前', status: 'offline' },
  { id: 'me-4', name: '小记 · 会议纪要', lastUsed: '上周', status: 'online' },
]

export default function MyEmployeesPage() {
  const navigate = useNavigate()

  return (
    <div className="px-8 py-6 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-on-surface)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            我的员工
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            已收藏 12 位员工 · 最近活跃优先排序
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/employees/create')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity duration-200 hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          新建员工
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {MY_EMPLOYEES.map((emp) => (
          <li
            key={emp.id}
            className="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors duration-200"
            style={{
              backgroundColor: 'var(--color-surface-container-low)',
              border: '1px solid var(--color-surface-variant)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-surface-variant)')}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary-container)' }}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ color: 'var(--color-on-primary-container)' }}
              >
                star
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>
                {emp.name}
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
                最近使用 {emp.lastUsed}
              </div>
            </div>
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: emp.status === 'online' ? '#22c55e' : 'var(--color-outline)' }}
              title={emp.status === 'online' ? '在线' : '离线'}
            />
            <button
              type="button"
              onClick={() => navigate('/chat/new')}
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-200"
              style={{
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-container)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              发起对话
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
