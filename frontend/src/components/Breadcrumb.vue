<template>
  <nav class="crumb" aria-label="breadcrumb">
    <ol>
      <li>
        <router-link to="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>OrbitalCommand</span>
        </router-link>
      </li>
      <li v-for="(c, i) in crumbs" :key="i">
        <span class="crumb-sep">/</span>
        <router-link v-if="c.to && i < crumbs.length - 1" :to="c.to">{{ c.label }}</router-link>
        <span v-else class="crumb-current">{{ c.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'
import { MOCK } from '@/api/mock-data'

const route = useRoute()
const crumbs = computed(() => {
  const id = (route.name || '').toString().toLowerCase()
  const item = MOCK.nav.find((n) => n.id === id)
  if (!item) return [{ label: '未找到' }]
  return [{ label: item.label }]
})
</script>

<style scoped>
.crumbs { font-size: 13px; }
.crumb {
  padding: 14px var(--content-pad) 0;
  font-size: 12px;
  color: var(--color-text-mute);
}
.crumb ol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.crumb li { display: inline-flex; align-items: center; gap: 6px; }
.crumb a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-soft);
  transition: color var(--dur-fast) var(--ease);
}
.crumb a:hover { color: var(--color-primary-soft); }
.crumb-sep { color: var(--color-text-mute); }
.crumb-current { color: var(--color-text); font-weight: 500; }

@media (max-width: 480px) {
  .crumb { padding: 10px 12px 0; }
}
</style>
