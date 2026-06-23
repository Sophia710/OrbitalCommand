/**
 * Pinia · user store
 * ---------------------------------------------------------------------- */
import { defineStore } from 'pinia'
import { lsGet, lsSet } from '@/utils'
import { MOCK } from '@/api/mock-data'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: MOCK.user.id,
    name: MOCK.user.name,
    role: MOCK.user.role,
    title: MOCK.user.title,
    team: MOCK.user.team,
    avatar: MOCK.user.avatar,
    /** 通知未读数（演示用） */
    notifications: lsGet('oc_user_notifications', [
      { id: 'n1', title: '审核通知', desc: 'Ka 频段专项测试员 待审核', time: '14:22' },
      { id: 'n2', title: '系统告警', desc: '信关站 GW-03 出现高危告警', time: '14:18' },
      { id: 'n3', title: '任务完成', desc: '载荷健康度周报生成完成',  time: '13:36' },
    ]),
  }),

  getters: {
    initials: (s) => s.name?.slice(0, 1) || 'U',
  },

  actions: {
    setRole(role) {
      this.role = role
      lsSet('oc_user_role', role)
    },
    setName(name) {
      this.name = name
      lsSet('oc_user_name', name)
    },
    clearNotifications() {
      this.notifications = []
      lsSet('oc_user_notifications', [])
    },
  },
})
