import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import NewChatPage from './pages/NewChatPage'
import ChatPage from './pages/ChatPage'
import AgentCenterPage from './pages/AgentCenterPage'
import SkillsCenterPage from './pages/SkillsCenterPage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import DocumentManagementPage from './pages/DocumentManagementPage'
import ColumnsPage from './pages/ColumnsPage'
import ColumnDetailPage from './pages/ColumnDetailPage'
import ColumnArticleDetailPage from './pages/ColumnArticleDetailPage'
// 数字员工模块
import PlazaPage from './pages/employees/PlazaPage'
import MyEmployeesPage from './pages/employees/MyEmployeesPage'
import CreateEmployeePage from './pages/employees/CreateEmployeePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/chat/new" replace />} />
        <Route path="chat/new" element={<NewChatPage />} />
        <Route path="chat/:id" element={<ChatPage />} />
        <Route path="agents" element={<AgentCenterPage />} />
        <Route path="skills" element={<SkillsCenterPage />} />
        {/* 数字员工模块 — 二级导航(员工广场 / 我的员工 / 创建员工) */}
        <Route path="employees" element={<Navigate to="/employees/plaza" replace />} />
        <Route path="employees/plaza" element={<PlazaPage />} />
        <Route path="employees/my" element={<MyEmployeesPage />} />
        <Route path="employees/create" element={<CreateEmployeePage />} />
        {/* 知识库模块 — 个人知识库 */}
        <Route path="knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="knowledge-base/:id/documents" element={<DocumentManagementPage />} />
        {/* 知识库模块 — 专栏订阅(整合:专栏市场 + 我的订阅,通过 ?tab= 切换) */}
        <Route path="columns" element={<ColumnsPage />} />
        <Route path="columns/:id/articles/:aid" element={<ColumnArticleDetailPage />} />
        <Route path="columns/:id" element={<ColumnDetailPage />} />
      </Route>
    </Routes>
  )
}

export default App
