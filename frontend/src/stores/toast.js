/**
 * Pinia · toast store
 * ---------------------------------------------------------------------- */
import { defineStore } from 'pinia'
import { uid } from '@/utils'

let TOAST_ID = 0

export const useToastStore = defineStore('toast', {
  state: () => ({
    list: [],
  }),

  actions: {
    push(message, type = 'info', duration = 3000) {
      const id = ++TOAST_ID
      this.list.push({ id, message, type, duration })
      if (duration > 0) {
        setTimeout(() => this.remove(id), duration)
      }
      return id
    },
    success(msg, dur) { return this.push(msg, 'success', dur) },
    error(msg, dur)   { return this.push(msg, 'error',   dur ?? 4500) },
    warning(msg, dur) { return this.push(msg, 'warning', dur) },
    info(msg, dur)    { return this.push(msg, 'info',    dur) },
    remove(id) {
      const i = this.list.findIndex((t) => t.id === id)
      if (i >= 0) this.list.splice(i, 1)
    },
    clear() { this.list = [] },
  },
})
