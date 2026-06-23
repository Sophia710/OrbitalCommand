/**
 * Pinia · chat store
 * 全局对话抽屉状态：被员工广场 / 我的员工 / 指挥中心 卡片调用
 * ---------------------------------------------------------------------- */
import { defineStore } from 'pinia'

let _id = 1
const newId = () => `msg-${Date.now().toString(36)}-${_id++}`

/* ============ Mock 数据（与 prototype copy 的 CHAT_MESSAGES / CHAT_HISTORY 字段一致） ============ */
const MOCK_HISTORY = [
  {
    date: '今天',
    items: [
      { id: 'h1', title: '北斗-A2 链路诊断', preview: '检测到相位噪声超阈值 3.2dB…', active: true },
      { id: 'h2', title: '干扰源初筛',     preview: '识别 3 个候选源，置信度 0.83…' },
      { id: 'h3', title: '周报生成',         preview: '本周告警 142 起，已起草报告…' },
    ],
  },
  {
    date: '昨天',
    items: [
      { id: 'h4', title: '信关站健康评估', preview: '7 站全部在线，温度 41℃ 正常…' },
      { id: 'h5', title: '载荷遥测',         preview: '12 项指标采样完成…' },
    ],
  },
  {
    date: '本周',
    items: [
      { id: 'h6', title: '异常数据导出',   preview: '导出 4.2GB 到对象存储…' },
      { id: 'h7', title: '训练数据预处理', preview: '清洗 128 万条遥测记录…' },
    ],
  },
]

function buildInitialMessages(emp) {
  return [
    { id: newId(), who: 'bot', text: `你好，我是「${emp.name}」。${emp.description || ''}你可以直接描述任务，我会调用工具与知识库辅助完成。`, t: '19:36:52' },
    // { id: newId(), who: 'bot', text: '你可以直接描述任务，我会调用工具与知识库辅助完成。', t: '刚刚', suggest: ['发起一次链路诊断', '列出本周告警', '生成本日报告'] },
  ]
}

/**
 * 多轮对话 mock 数据
 * 包含：
 *   - user  : 用户消息
 *   - bot   : 普通 bot 消息
 *   - process_card : 智能体执行步骤卡（带 10/10 进度、计时、收起展开）
 *   - markdown : 输出结果（含代码块、列表、标题等富文本）
 */
const MOCK_DIALOG = [
  /* ============ 第 1 轮：FSPL 负数排查 ============ */
  {
    id: newId(), who: 'user',
    text: '我有一个处理卫星链路的 CSV 数据的 Python 脚本，运行后部分的"自由空间损耗(FSPL)"会算成负数，帮我排查一下。脚本和示例数据我已经放到 workspace 里。',
    t: '19:38:01',
  },
  {
    id: newId(),
    who: 'process_card',
    title: '智能体执行完成',
    progress: '10/10',
    steps: [
      { id: 'p1s1', icon: 'think', text: '正在解析任务需求…', time: '0.6s', status: 'done' },
      { id: 'p1s2', icon: 'read',  text: '已完成文件读取: /workspace/scripts/fspl_calc.py',     time: '0.1s', status: 'done' },
      { id: 'p1s3', icon: 'read',  text: '已完成文件读取: /workspace/scripts/sat_link_loss.py',   time: '0.1s', status: 'done' },
      { id: 'p1s4', icon: 'read',  text: '已完成文件读取: /workspace/data/leo_link_q1.csv',      time: '0.2s', status: 'done' },
      { id: 'p1s5', icon: 'think', text: '已完成:静态分析 + 运行样本数据',                       time: '0.4s', status: 'done' },
      { id: 'p1s6', icon: 'think', text: '已完成:定位 Bug(dist_km=0 行触发 NaN)',                time: '0.3s', status: 'done' },
      { id: 'p1s7', icon: 'write', text: '已完成文件修改: /workspace/scripts/fspl_calc.py',      time: '0.4s', status: 'done' },
      { id: 'p1s8', icon: 'write', text: '已完成文件修改: /workspace/scripts/sat_link_loss.py',    time: '0.4s', status: 'done' },
      { id: 'p1s9', icon: 'exec',  text: '已完成命令执行: python sat_link_loss.py --csv data/leo_link_q1.csv', time: '1.4s', status: 'done' },
      { id: 'p1s10', icon: 'verify', text: '已完成:运行结果无非负异常',                          time: '0.2s', status: 'done' },
    ],
    t: '19:38:42',
  },
  {
    id: newId(),
    who: 'markdown',
    title: '输出结果',
    blocks: [
      { kind: 'h2', text: '排查结果' },
      { kind: 'p',  text: '我已经定位到 Bug 并给出修复方案。' },
      { kind: 'h3', text: '根因分析' },
      { kind: 'p',  text: '`fspl_calc.py` 中使用了' },
      { kind: 'code', lang: 'python', text: 'fspl = 32.45 + 20*log10(freq_mhz) + 20*log10(dist_km)\n...' },
      { kind: 'p',  text: '**问题 1**：未做单位换算，直接传入的 `freq_mhz` 与 `dist_km` 与公式期望的 **MHz** 和 **km** 一致，看似没问题；' },
      { kind: 'p',  text: '**问题 2**：当 `dist_km <= 0`（CSV 中存在 0 / 空值）时，`log10(0)` 返回 `NaN`，在累加到 FSPL 列表后被 `min()` 比较时变成极小负数。' },
      { kind: 'h3', text: '修复方案' },
      { kind: 'ol', items: [
        '**过滤非法值**：在读取 CSV 后，丢掉 `dist_km <= 0` 的行；',
        '**加钳位**：对 `fspl` 做 `max(0, fspl)` 钳位，避免异常值；',
        '**空值兜底**：若 `fspl.isna().all()` 直接抛 `ValueError("无有效样本")`。',
      ] },
      { kind: 'h3', text: '修改后的核心代码' },
      { kind: 'code', lang: 'python', text: 'def fspl_db(freq_mhz: float, dist_km: float) -> float:\n    if dist_km <= 0 or freq_mhz <= 0:\n        raise ValueError("freq / dist 必须 > 0")\n    return 32.45 + 20 * math.log10(freq_mhz) + 20 * math.log10(dist_km)\n\ndf = df[df["dist_km"] > 0]\ndf["fspl_db"] = df.apply(lambda r: fspl_db(r.freq_mhz, r.dist_km), axis=1)\n...' },
      { kind: 'p',  text: '修复后该列已无非负异常，可以直接进入下游的链路预算计算。' },
    ],
    actions: ['like', 'dislike', 'regenerate'],
    t: '19:38:55',
  },

  /* ============ 第 2 轮：函数封装 + 进度条 ============ */
  {
    id: newId(), who: 'user',
    text: '明白了。那能不能把 FSPL 计算和 CSV 处理都封装成可复用的函数，顺便加个简单的进度条？数据量大概 50 万行。',
    t: '19:40:12',
  },
  {
    id: newId(),
    who: 'process_card',
    title: '智能体执行完成',
    progress: '10/10',
    steps: [
      { id: 'p2s1', icon: 'think', text: '正在理解重构需求…',                  time: '0.4s', status: 'done', detail: '把 FSPL 计算与 CSV 处理拆分，加入 numpy 向量化与 tqdm 进度条。' },
      { id: 'p2s2', icon: 'read',  text: '已完成文件读取: /workspace/scripts/fspl_calc.py',  time: '0.1s', status: 'done' },
      { id: 'p2s3', icon: 'read',  text: '已完成文件读取: /workspace/scripts/sat_link_loss.py', time: '0.1s', status: 'done' },
      { id: 'p2s4', icon: 'write', text: '已完成文件创建: /workspace/scripts/utils_vector.py', time: '0.8s', status: 'done' },
      { id: 'p2s5', icon: 'write', text: '已完成文件修改: /workspace/scripts/fspl_calc.py',     time: '0.8s', status: 'done' },
      { id: 'p2s6', icon: 'write', text: '已完成文件修改: /workspace/scripts/sat_link_loss.py', time: '0.5s', status: 'done' },
      { id: 'p2s7', icon: 'exec',  text: '已完成命令执行: pip install numpy tqdm',  time: '1.6s', status: 'done' },
      { id: 'p2s8', icon: 'exec',  text: '已完成命令执行: python sat_link_loss.py --csv data/leo_link_q1.csv', time: '2.3s', status: 'done' },
      { id: 'p2s9', icon: 'verify', text: '已完成:性能提升 8x',                    time: '0.2s', status: 'done' },
      { id: 'p2s10', icon: 'write', text: '已完成文件创建: /workspace/optimization_notes.md', time: '0.2s', status: 'done' },
    ],
    t: '19:40:48',
  },
  {
    id: newId(),
    who: 'markdown',
    title: '输出结果',
    blocks: [
      { kind: 'h2', text: '重构完成' },
      { kind: 'p',  text: '我把 FSPL 计算与 CSV 处理都抽到了 `utils_vector.py`，并用 `numpy` 做向量化 + `tqdm` 加进度条，50 万行从原来的 ~18s 降到 ~2.3s。' },
      { kind: 'h3', text: '新增模块：utils_vector.py' },
      { kind: 'code', lang: 'python', text: 'import numpy as np\nfrom tqdm import tqdm\n\ndef fspl_db_vec(freq_mhz: np.ndarray, dist_km: np.ndarray) -> np.ndarray:\n    freq_mhz = np.asarray(freq_mhz, dtype=np.float64)\n    dist_km  = np.asarray(dist_km,  dtype=np.float64)\n    mask = (freq_mhz > 0) & (dist_km > 0)\n    out = np.full_like(freq_mhz, np.nan, dtype=np.float64)\n    out[mask] = 32.45 + 20*np.log10(freq_mhz[mask]) + 20*np.log10(dist_km[mask])\n    return np.clip(out, 0.0, None)  # 钳位到非负\n\ndef process_csv(path: str, chunksize: int = 100_000):\n    chunks = pd.read_csv(path, chunksize=chunksize)\n    for i, df in enumerate(tqdm(chunks, desc="Processing CSV")):\n        df = df[df["dist_km"] > 0]\n        df["fspl_db"] = fspl_db_vec(df["freq_mhz"].values, df["dist_km"].values)\n        yield df' },
      { kind: 'h3', text: '重构后入口' },
      { kind: 'code', lang: 'python', text: 'from utils_vector import process_csv\n\nfor chunk in process_csv("data/leo_link_q1.csv"):\n    # 写入下游 / 入库 / 落盘\n    ...' },
      { kind: 'p',  text: '详细性能对比与基准测试已写入 `optimization_notes.md`，可随时打开查看。' },
    ],
    actions: ['like', 'dislike', 'regenerate'],
    t: '19:40:53',
    suggest: ['把链路预算也向量化', '生成性能对比图', '导出优化报告'],
  },
]

/* 用于取消正在进行的 AI 回复（持有 setTimeout 句柄） */
const _pendingTimers = new Set()
function _pushTimer(id) { _pendingTimers.add(id); return id }
function _clearAllTimers() {
  for (const id of _pendingTimers) clearTimeout(id)
  _pendingTimers.clear()
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    /** 是否打开 */
    open: false,
    /** 当前员工（EMPLOYEES 数据中的某项） */
    employee: null,
    /** 消息流 */
    messages: [],
    /** 历史任务列表（左侧栏） */
    history: MOCK_HISTORY,
    /** 思考中（用于打字 dots） */
    thinking: false,
  }),

  actions: {
    openChat(emp) {
      if (!emp) return
      this.employee = emp
      // 加载多轮对话 mock：保留初始问候，再追加典型业务对话
      this.messages = [
        ...buildInitialMessages(emp),
        ...MOCK_DIALOG,
      ]
      this.open = true
      // 锁滚动 + esc 关闭
      try { document.body.style.overflow = 'hidden' } catch (e) { /* noop */ }
    },
    send(text) {
      const value = String(text || '').trim()
      if (!value) return
      this.messages.push({ id: newId(), who: 'user', text: value, t: '刚刚' })
      // 模拟员工回复
      this.thinking = true
      const t1 = setTimeout(() => {
        _pendingTimers.delete(t1)
        this.thinking = false
        this.messages.push({
          id: newId(),
          who: 'bot',
          text: '已收到指令，正在调用遥测接口与分析引擎…',
          t: '刚刚',
        })
        const t2 = setTimeout(() => {
          _pendingTimers.delete(t2)
          this.messages.push({
            id: newId(),
            who: 'step',
            title: '任务执行：链路诊断',
            detail: '调用 telemetry.query() · 命中 12 项指标 · 1.84s',
          })
          this.messages.push({
            id: newId(),
            who: 'bot',
            text: '诊断完成。本次共识别 2 个高风险项，建议优先处理 A2 链路的相位噪声问题。',
            t: '刚刚',
            suggest: ['查看详细指标', '生成处理建议', '导出诊断报告'],
          })
        }, 900)
        _pendingTimers.add(t2)
      }, 700)
      _pendingTimers.add(t1)
    },
    abort() {
      if (!this.thinking && !_pendingTimers.size) return
      _clearAllTimers()
      this.thinking = false
      this.messages.push({
        id: newId(),
        who: 'bot',
        text: '已终止当前任务。',
        t: '刚刚',
      })
    },
    suggestClick(text) {
      this.send(text)
    },
    /* 重新生成最近一次 bot 消息（重新添加一份示例回答） */
    regenerateLast() {
      this.messages.push({
        id: newId(),
        who: 'bot',
        text: '已基于最新上下文重新生成。',
        t: '刚刚',
      })
    },
    newSession() {
      if (this.employee) this.messages = buildInitialMessages(this.employee)
    },
    closeChat() {
      _clearAllTimers()
      this.thinking = false
      this.open = false
      try { document.body.style.overflow = '' } catch (e) { /* noop */ }
    },
  },
})
