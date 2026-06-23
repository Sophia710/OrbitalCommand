/**
 * Pinia · app store
 * ---------------------------------------------------------------------- */
import { defineStore } from 'pinia'
import { lsGet, lsSet } from '@/utils'

export const useAppStore = defineStore('app', {
  state: () => ({
    /** 'dark' | 'light' */
    theme: 'dark',
    /** 侧边栏折叠状态 */
    sidebarCollapsed: false,
    /** 移动端抽屉是否打开 */
    mobileDrawerOpen: false,
    /** 顶栏搜索 */
    topbarQuery: '',
  }),

  actions: {
    initTheme() {
      const t = lsGet('oc_theme', 'dark')
      this.theme = t
      this.applyTheme()
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      this.applyTheme()
      lsSet('oc_theme', this.theme)
    },
    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.theme)
    },

    initSidebar() {
      this.sidebarCollapsed = lsGet('oc_sidebar_collapsed', false)
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
      lsSet('oc_sidebar_collapsed', this.sidebarCollapsed)
    },
    setSidebar(v) {
      this.sidebarCollapsed = !!v
      lsSet('oc_sidebar_collapsed', this.sidebarCollapsed)
    },

    openMobileDrawer()  { this.mobileDrawerOpen = true },
    closeMobileDrawer() { this.mobileDrawerOpen = false },

    setTopbarQuery(v)   { this.topbarQuery = v },
  },
})
