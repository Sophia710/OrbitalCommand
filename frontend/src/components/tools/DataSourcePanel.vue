<template>
  <div class="ds-panel">
    <!-- 顶部 -->
    <div class="ds-panel__head">
      <button type="button" class="ds-panel__back" @click="$emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回
      </button>
      <div class="ds-panel__title">
        <svg class="ds-panel__title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        标讯数据源列表
        <span class="ds-panel__count">共 {{ filteredList.length }} 个站点</span>
      </div>
      <div class="ds-panel__search">
        <svg class="ds-panel__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model.trim="searchQuery"
          class="ds-panel__search-input"
          placeholder="搜索站点名称/分类/域名"
        />
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="ds-panel__body">
      <table class="ds-panel__table">
        <thead>
          <tr>
            <th class="ds-panel__col-num">#</th>
            <th class="ds-panel__col-cat">分类</th>
            <th class="ds-panel__col-subcat">子分类</th>
            <th class="ds-panel__col-name">站点名称</th>
            <th class="ds-panel__col-domain">域名</th>
            <th class="ds-panel__col-op">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(d, idx) in filteredList" :key="d.id">
            <td class="ds-panel__col-num">{{ idx + 1 }}</td>
            <td class="ds-panel__col-cat">
              <span class="ds-panel__tag" :class="catTagClass(d.category)">{{ d.category }}</span>
            </td>
            <td class="ds-panel__col-subcat">
              <span class="ds-panel__subcat">{{ d.subCategory }}</span>
            </td>
            <td class="ds-panel__col-name">{{ d.name }}</td>
            <td class="ds-panel__col-domain" :title="d.domain">{{ d.domain }}</td>
            <td class="ds-panel__col-op">
              <button type="button" class="ds-panel__op-link" @click="onVisit(d)">访问</button>
            </td>
          </tr>
          <tr v-if="!filteredList.length">
            <td colspan="6" class="ds-panel__empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              未找到匹配的数据源
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToastStore } from '@/stores/toast'

defineEmits(['close'])

const toast = useToastStore()
const searchQuery = ref('')

function catTagClass(cat) {
  const map = {
    '全国性官方标讯数据源': 'ds-panel__tag--national',
    '重点区域公共资源 / 政府': 'ds-panel__tag--regional',
  }
  return map[cat] || 'ds-panel__tag--default'
}

const ALL_SOURCES = [
  { id: 's1',  category: '全国性官方标讯数据源', subCategory: '全国官方平台', name: '全国公共资源交易平台',     domain: 'www.ggzy.gov.cn' },
  { id: 's2',  category: '全国性官方标讯数据源', subCategory: '全国官方平台', name: '中国政府采购网',           domain: 'www.ccgp.gov.cn' },
  { id: 's3',  category: '全国性官方标讯数据源', subCategory: '全国官方平台', name: '中央政府采购网',           domain: 'www.zycg.gov.cn' },
  { id: 's4',  category: '全国性官方标讯数据源', subCategory: '全国官方平台', name: '中国招标投标公共服务平台',   domain: 'cebpubservice.com' },
  { id: 's5',  category: '全国性官方标讯数据源', subCategory: '全国官方平台', name: '军队采购网',               domain: 'www.plap.mil.cn' },
  { id: 's6',  category: '全国性官方标讯数据源', subCategory: '全国官方平台', name: '中共中央直属机关采购中心',   domain: 'www.zccg.gov.cn' },
  { id: 's7',  category: '重点区域公共资源 / 政府', subCategory: '北京', name: '北京市公共资源交易服务平台',   domain: 'ggzyfw.beijing.gov.cn' },
  { id: 's8',  category: '重点区域公共资源 / 政府', subCategory: '北京', name: '北京市政府采购电子交易平台',     domain: 'zhcg-bjzc.zhongcy.com' },
  { id: 's9',  category: '重点区域公共资源 / 政府', subCategory: '河北', name: '河北省公共资源交易中心',       domain: 'sg.hebei.gov.cn' },
  { id: 's10', category: '重点区域公共资源 / 政府', subCategory: '河北', name: '河北省公共资源交易服务平台',     domain: 'sgj.hebei.gov.cn' },
  { id: 's11', category: '重点区域公共资源 / 政府', subCategory: '河北', name: '中国河北政府采购网',           domain: 'www.ccgp-hebei.gov.cn' },
  { id: 's12', category: '重点区域公共资源 / 政府', subCategory: '天津', name: '天津市公共资源交易平台',         domain: 'ggzy.tianjin.gov.cn' },
  { id: 's13', category: '重点区域公共资源 / 政府', subCategory: '天津', name: '天津市政府采购中心',             domain: 'cgzx.tianjin.gov.cn' },
  { id: 's14', category: '重点区域公共资源 / 政府', subCategory: '天津', name: '天津市政府采购网',               domain: 'tjgp.zuofwb.tj.gov.cn' },
  { id: 's15', category: '重点区域公共资源 / 政府', subCategory: '上海', name: '上海市建设工程交易服务中心',     domain: 'www.shcpc.cn' },
  { id: 's16', category: '重点区域公共资源 / 政府', subCategory: '上海', name: '上海政府采购网',                 domain: 'www.zfcg.sh.gov.cn' },
  { id: 's17', category: '重点区域公共资源 / 政府', subCategory: '上海', name: '上海市政府采购中心',             domain: 'cgzx.jg.sh.gov.cn' },
  { id: 's18', category: '重点区域公共资源 / 政府', subCategory: '江苏', name: '江苏省公共资源交易平台',         domain: 'jsggzy.jiangsu.gov.cn' },
  { id: 's19', category: '重点区域公共资源 / 政府', subCategory: '江苏', name: '江苏省政府采购网',               domain: 'www.ccgp-jiangsu.gov.cn' },
  { id: 's20', category: '重点区域公共资源 / 政府', subCategory: '江苏', name: '南京市公共资源交易中心',         domain: 'njggzy.nanjing.gov.cn' },
  { id: 's21', category: '重点区域公共资源 / 政府', subCategory: '浙江', name: '浙江省公共资源交易中心',         domain: 'www.zjggzy.cn' },
  { id: 's22', category: '重点区域公共资源 / 政府', subCategory: '浙江', name: '浙江省政府采购网',               domain: 'www.zjzfcg.gov.cn' },
  { id: 's23', category: '重点区域公共资源 / 政府', subCategory: '浙江', name: '杭州市公共资源交易中心',         domain: 'ggzy.hangzhou.gov.cn' },
  { id: 's24', category: '重点区域公共资源 / 政府', subCategory: '广东', name: '广东省公共资源交易中心',         domain: 'www.gdggzy.org.cn' },
  { id: 's25', category: '重点区域公共资源 / 政府', subCategory: '广东', name: '广东省政府采购网',               domain: 'www.gdgpo.gov.cn' },
  { id: 's26', category: '重点区域公共资源 / 政府', subCategory: '广东', name: '广州市公共资源交易中心',         domain: 'www.gzggzy.cn' },
  { id: 's27', category: '重点区域公共资源 / 政府', subCategory: '福建', name: '福建省公共资源交易中心',         domain: 'www.fjggzy.gov.cn' },
  { id: 's28', category: '重点区域公共资源 / 政府', subCategory: '福建', name: '福建省政府采购网',               domain: 'www.ccgp-fujian.gov.cn' },
  { id: 's29', category: '重点区域公共资源 / 政府', subCategory: '福建', name: '厦门市公共资源交易中心',         domain: 'ggzy.xm.gov.cn' },
  { id: 's30', category: '重点区域公共资源 / 政府', subCategory: '四川', name: '四川省公共资源交易中心',         domain: 'www.scggzy.cn' },
  { id: 's31', category: '重点区域公共资源 / 政府', subCategory: '四川', name: '四川省政府采购网',               domain: 'www.ccgp-sichuan.gov.cn' },
  { id: 's32', category: '重点区域公共资源 / 政府', subCategory: '四川', name: '成都市公共资源交易中心',         domain: 'ggzy.chengdu.gov.cn' },
  { id: 's33', category: '重点区域公共资源 / 政府', subCategory: '湖北', name: '湖北省公共资源交易中心',         domain: 'www.hbggzy.cn' },
  { id: 's34', category: '重点区域公共资源 / 政府', subCategory: '湖北', name: '湖北省政府采购网',               domain: 'www.ccgp-hubei.gov.cn' },
  { id: 's35', category: '重点区域公共资源 / 政府', subCategory: '湖北', name: '武汉市公共资源交易中心',         domain: 'ggzy.wuhan.gov.cn' },
  { id: 's36', category: '重点区域公共资源 / 政府', subCategory: '陕西', name: '陕西省公共资源交易中心',         domain: 'www.sxggzy.cn' },
  { id: 's37', category: '重点区域公共资源 / 政府', subCategory: '陕西', name: '陕西省政府采购网',               domain: 'www.ccgp-shaanxi.gov.cn' },
  { id: 's38', category: '重点区域公共资源 / 政府', subCategory: '陕西', name: '西安市公共资源交易中心',         domain: 'ggzy.xa.gov.cn' },
  { id: 's39', category: '重点区域公共资源 / 政府', subCategory: '山东', name: '山东省公共资源交易中心',         domain: 'www.sdggzy.cn' },
  { id: 's40', category: '重点区域公共资源 / 政府', subCategory: '山东', name: '山东省政府采购网',               domain: 'www.ccgp-shandong.gov.cn' },
  { id: 's41', category: '重点区域公共资源 / 政府', subCategory: '山东', name: '济南市公共资源交易中心',         domain: 'ggzy.jinan.gov.cn' },
  { id: 's42', category: '重点区域公共资源 / 政府', subCategory: '河南', name: '河南省公共资源交易中心',         domain: 'www.hnggzy.cn' },
  { id: 's43', category: '重点区域公共资源 / 政府', subCategory: '河南', name: '河南省政府采购网',               domain: 'www.ccgp-henan.gov.cn' },
  { id: 's44', category: '重点区域公共资源 / 政府', subCategory: '河南', name: '郑州市公共资源交易中心',         domain: 'ggzy.zhengzhou.gov.cn' },
  { id: 's45', category: '重点区域公共资源 / 政府', subCategory: '重庆', name: '重庆市公共资源交易中心',         domain: 'www.cqggzy.cn' },
  { id: 's46', category: '重点区域公共资源 / 政府', subCategory: '重庆', name: '重庆市政府采购网',               domain: 'www.ccgp-chongqing.gov.cn' },
  { id: 's47', category: '重点区域公共资源 / 政府', subCategory: '湖南', name: '湖南省公共资源交易中心',         domain: 'www.hnggzy.com' },
  { id: 's48', category: '重点区域公共资源 / 政府', subCategory: '湖南', name: '湖南省政府采购网',               domain: 'www.ccgp-hunan.gov.cn' },
  { id: 's49', category: '重点区域公共资源 / 政府', subCategory: '安徽', name: '安徽省公共资源交易中心',         domain: 'www.ahggzy.cn' },
  { id: 's50', category: '重点区域公共资源 / 政府', subCategory: '安徽', name: '安徽省政府采购网',               domain: 'www.ccgp-anhui.gov.cn' },
  { id: 's51', category: '重点区域公共资源 / 政府', subCategory: '辽宁', name: '辽宁省公共资源交易中心',         domain: 'www.lnggzy.cn' },
  { id: 's52', category: '重点区域公共资源 / 政府', subCategory: '辽宁', name: '辽宁省政府采购网',               domain: 'www.ccgp-liaoning.gov.cn' },
  { id: 's53', category: '重点区域公共资源 / 政府', subCategory: '贵州', name: '贵州省公共资源交易中心',         domain: 'www.gzggzy.cn' },
]

const filteredList = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return ALL_SOURCES
  return ALL_SOURCES.filter((d) =>
    d.name.toLowerCase().includes(q) ||
    d.category.toLowerCase().includes(q) ||
    d.subCategory.toLowerCase().includes(q) ||
    d.domain.toLowerCase().includes(q)
  )
})

function onVisit(d) {
  const url = d.domain.startsWith('http') ? d.domain : `https://${d.domain}`
  window.open(url, '_blank', 'noopener,noreferrer')
  toast.info(`已在新窗口打开「${d.name}」`)
}
</script>

<style scoped>
.ds-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ---------- 顶部栏 ---------- */
.ds-panel__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  flex-shrink: 0;
}
.ds-panel__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  padding: 4px 10px;
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  border-radius: 6px;
  background: var(--surface, #0f172a);
  color: var(--ink, #e2e8f0);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  white-space: nowrap;
}
.ds-panel__back svg {
  width: 14px;
  height: 14px;
}
.ds-panel__back:hover {
  border-color: var(--accent, #8b5cf6);
  color: var(--accent, #a78bfa);
}
.ds-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink, #e2e8f0);
  flex: 1;
}
.ds-panel__title-icon {
  width: 18px;
  height: 18px;
  color: var(--ink-2, #cbd5e1);
}
.ds-panel__count {
  font-size: 12px;
  font-weight: 400;
  color: var(--accent, #8b5cf6);
  background: var(--accent-soft, rgba(139, 92, 246, 0.12));
  padding: 2px 8px;
  border-radius: 999px;
  font-family: var(--font-mono, monospace);
}
.ds-panel__search {
  position: relative;
  display: flex;
  align-items: center;
}
.ds-panel__search-icon {
  position: absolute;
  left: 10px;
  width: 14px;
  height: 14px;
  color: var(--ink-3, #94a3b8);
  pointer-events: none;
}
.ds-panel__search-input {
  width: 200px;
  padding: 6px 12px 6px 32px;
  font-size: 12.5px;
  border: 1px solid var(--line, rgba(148, 163, 184, 0.2));
  border-radius: 6px;
  background: var(--surface, #0f172a);
  color: var(--ink, #e2e8f0);
  font-family: inherit;
  outline: 0;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.ds-panel__search-input::placeholder { color: var(--ink-3, #94a3b8); }
.ds-panel__search-input:focus {
  border-color: var(--accent, #8b5cf6);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
}

/* ---------- 表格容器 ---------- */
.ds-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}
.ds-panel__body::-webkit-scrollbar { width: 5px; }
.ds-panel__body::-webkit-scrollbar-thumb {
  background: var(--line, rgba(148, 163, 184, 0.2));
  border-radius: 999px;
}

/* ---------- 表格 ---------- */
.ds-panel__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}
.ds-panel__table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}
.ds-panel__table thead th {
  text-align: left;
  padding: 10px 16px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-3, #94a3b8);
  background: var(--surface-2, rgba(30, 41, 59, 0.95));
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.12));
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.ds-panel__table tbody td {
  padding: 9px 16px;
  border-bottom: 1px solid var(--line, rgba(148, 163, 184, 0.08));
  color: var(--ink-2, #cbd5e1);
  vertical-align: middle;
}
.ds-panel__table tbody tr:last-child td { border-bottom: none; }
.ds-panel__table tbody tr:hover td { background: rgba(139, 92, 246, 0.04); }

/* 列宽 */
.ds-panel__col-num    { width: 48px;  text-align: center; color: var(--ink-3, #94a3b8); font-family: var(--font-mono, monospace); font-size: 11.5px; }
.ds-panel__col-cat    { width: 170px; }
.ds-panel__col-subcat { width: 110px; }
.ds-panel__col-name   { }
.ds-panel__col-domain { width: 180px; font-family: var(--font-mono, monospace); font-size: 11px; color: var(--ink-3, #94a3b8); }
.ds-panel__col-op     { width: 60px; text-align: center; }

/* 分类标签 */
.ds-panel__tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.ds-panel__tag--national { background: rgba(139, 92, 246, 0.1); color: #a78bfa; }
.ds-panel__tag--regional { background: rgba(56, 189, 248, 0.1); color: #7dd3fc; }
.ds-panel__tag--default  { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }

.ds-panel__subcat { font-size: 11.5px; color: var(--ink-2, #cbd5e1); }

/* 操作链接 */
.ds-panel__op-link {
  font-size: 12px;
  color: var(--accent, #8b5cf6);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}
.ds-panel__op-link:hover { opacity: 0.75; text-decoration: underline; }

/* 空状态 */
.ds-panel__empty {
  text-align: center;
  padding: 40px 16px !important;
  color: var(--ink-3, #94a3b8);
  font-size: 13px;
}
.ds-panel__empty svg { width: 28px; height: 28px; margin-bottom: 8px; opacity: 0.4; }
</style>