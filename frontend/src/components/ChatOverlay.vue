<template>
  <transition name="chat-fade">
    <div
      v-if="chat.open"
      class="chat-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="`与 ${chat.employee?.name || ''} 的对话`"
      @keydown.esc="chat.closeChat()"
      tabindex="-1"
      ref="overlay"
    >
      <!-- 左侧：历史任务 -->
      <aside class="chat-sidebar">
        <header class="chat-sidebar__head">
          <button class="iconbtn" aria-label="返回" @click="chat.closeChat()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="chat-sidebar__title">历史任务</div>
          <button
            class="iconbtn iconbtn--accent"
            aria-label="新建会话"
            title="新建会话"
            @click="chat.newSession()"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </header>

        <div class="chat-history">
          <div v-for="group in chat.history" :key="group.date" class="chat-history__group">
            <div class="chat-history__date">{{ group.date }}</div>
            <div
              v-for="it in group.items"
              :key="it.id"
              class="chat-history__item"
              :class="{ 'is-active': it.active }"
            >
              <div>{{ it.title }}</div>
              <div class="preview">{{ it.preview }}</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 主区：左对话 + 右面板 -->
      <section class="chat-main" :class="{ 'is-panel-open': panelOpen }">
        <!-- 左：对话内容 -->
        <div class="chat-content">
          <header class="chat-main__head">
            <div class="chat-main__agent">
              <div
                class="chat-main__agent-avatar"
                :style="agentAvatarStyle"
              >{{ agentInitial }}</div>
              <div>
                <div class="chat-main__agent-name">{{ chat.employee?.name || '' }}</div>
                <div class="chat-main__agent-status">● 在线 · 推理中</div>
              </div>
            </div>
            <div class="chat-main__actions">
              <button
                class="iconbtn"
                :class="{ 'is-active': panelOpen }"
                type="button"
                @click="togglePanel"
                :aria-label="panelOpen ? '关闭右侧面板' : '打开右侧面板'"
                :title="panelOpen ? '关闭面板' : '打开面板'"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </button>
            </div>
          </header>

          <!-- 消息流 -->
          <div ref="streamEl" class="chat-stream">
            <template v-for="m in chat.messages" :key="m.id">
              <!-- 智能体执行步骤卡（带 10/10 进度、计时、收起） -->
              <div v-if="m.who === 'process_card'" class="chat-process-card">
                <div class="chat-process-card__head">
                  <span class="chat-process-card__check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 11l3 3L22 4" />
                    </svg>
                  </span>
                  <span class="chat-process-card__title">{{ m.title }}</span>
                  <span class="chat-process-card__progress">{{ m.progress }}</span>
                </div>
                <ul class="chat-process-card__list" :class="{ 'is-collapsed': isCardCollapsed(m.id) }">
                  <li
                    v-for="s in (isCardCollapsed(m.id) ? m.steps.slice(0, 3) : m.steps)"
                    :key="s.id"
                    class="chat-process-card__row"
                    :class="['is-' + s.status, 'is-icon-' + s.icon]"
                  >
                    <span class="chat-process-card__icon">
                      <!-- think: 蓝色圆点 -->
                      <svg v-if="s.icon === 'think'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v4l2 2" />
                      </svg>
                      <!-- read/write: 紫色文档 -->
                      <svg v-else-if="s.icon === 'read' || s.icon === 'write'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <!-- exec: 终端方块 -->
                      <svg v-else-if="s.icon === 'exec'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M6 9l3 3-3 3M12 15h6" />
                      </svg>
                      <!-- verify: 蓝色对勾 -->
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 11l3 3L22 4" />
                      </svg>
                    </span>
                    <span class="chat-process-card__text">{{ s.text }}</span>
                    <span class="chat-process-card__time">{{ s.time }}</span>
                  </li>
                </ul>
                <button
                  v-if="m.steps.length > 3"
                  type="button"
                  class="chat-process-card__toggle"
                  @click="toggleCardCollapse(m.id)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'is-up': !isCardCollapsed(m.id) }">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                  {{ isCardCollapsed(m.id) ? `展开剩余 ${m.steps.length - 3} 个步骤` : '收起执行步骤' }}
                </button>
              </div>

              <!-- 输出结果：Markdown 富文本 -->
              <div v-else-if="m.who === 'markdown'" class="chat-md">
                <div class="chat-md__head">
                  <span class="chat-md__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="9" y1="13" x2="15" y2="13" />
                      <line x1="9" y1="17" x2="15" y2="17" />
                    </svg>
                  </span>
                  <span>{{ m.title }}</span>
                </div>
                <div class="chat-md__body">
                  <template v-for="(b, i) in m.blocks" :key="i">
                    <h2 v-if="b.kind === 'h2'" class="chat-md__h2">{{ b.text }}</h2>
                    <h3 v-else-if="b.kind === 'h3'" class="chat-md__h3">{{ b.text }}</h3>
                    <p v-else-if="b.kind === 'p'" class="chat-md__p" v-html="renderInline(b.text)" />
                    <pre v-else-if="b.kind === 'code'" class="chat-md__code"><code>{{ b.text }}</code></pre>
                    <ol v-else-if="b.kind === 'ol'" class="chat-md__ol">
                      <li v-for="(it, k) in b.items" :key="k" v-html="renderInline(it)" />
                    </ol>
                    <ul v-else-if="b.kind === 'ul'" class="chat-md__ul">
                      <li v-for="(it, k) in b.items" :key="k" v-html="renderInline(it)" />
                    </ul>
                  </template>
                </div>
                <div v-if="m.actions" class="chat-md__foot">
                  <div class="chat-md__actions">
                    <button type="button" class="chat-md__act" aria-label="点赞" title="有帮助">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9A2 2 0 0 0 19.66 9z" />
                      </svg>
                    </button>
                    <button type="button" class="chat-md__act" aria-label="点踩" title="不准确">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9A2 2 0 0 0 4.34 15z" />
                      </svg>
                    </button>
                  </div>
                  <button type="button" class="chat-md__regen" @click="chat.regenerateLast && chat.regenerateLast()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5M8 16H3v5" />
                    </svg>
                    重新生成
                  </button>
                </div>
                <span v-if="m.t" class="chat-msg__time chat-msg__time--inside">{{ m.t }}</span>
              </div>

              <!-- 步骤卡（执行流） -->
              <div v-else-if="m.who === 'step'" class="chat-step">
                <div class="chat-step__head">
                  <i>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 11l3 3L22 4" />
                    </svg>
                  </i>
                  {{ m.title }}
                </div>
                <div class="chat-step__body">{{ m.detail }}</div>
              </div>

              <!-- 普通消息 -->
              <div
                v-else
                class="chat-msg"
                :class="['chat-msg--' + m.who, chat.thinking && m === lastMessage ? 'chat-msg--thinking' : '']"
              >
                <div
                  class="chat-bubble"
                  v-html="m.text + (chat.thinking && m === lastMessage ? ' <span class=&quot;typing-dots&quot;><i></i><i></i><i></i></span>' : '')"
                />
                <span v-if="m.t" class="chat-msg__time">{{ m.t }}</span>
              </div>

              <!--
                建议提示词：与上面任意类型的消息块平级，是 chat-stream 的直接子元素
                渲染条件：消息带有 suggest 列表（普通 bot 回复 / markdown 回复 / 用户消息均可）
                移动端会自动换行；时间与建议都不再嵌在卡片内部，DOM 结构更清晰
              -->
              <div
                v-if="m.suggest && m.suggest.length"
                class="chat-suggest"
                :class="['chat-suggest--' + m.who]"
              >
                <button
                  v-for="s in m.suggest"
                  :key="s"
                  type="button"
                  @click="chat.suggestClick(s)"
                >{{ s }}</button>
              </div>
            </template>
          </div>

          <!-- 输入框 -->
          <form class="chat-input" @submit.prevent="onSend">
            <!-- 已上传文件预览列表 -->
            <div v-if="uploadedFiles.length" class="chat-input__files">
              <div
                v-for="f in uploadedFiles"
                :key="f.id"
                class="chat-input__file"
                :class="{
                  'is-uploading': f.status === 'uploading',
                  'is-done': f.status === 'done',
                  'is-error': f.status === 'error',
                }"
              >
                <span class="chat-input__file-icon">
                  <svg v-if="f.status === 'uploading'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <svg v-else-if="f.status === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </span>
                <span class="chat-input__file-info">
                  <span class="chat-input__file-name">{{ f.name }}</span>
                  <span class="chat-input__file-meta">
                    {{ formatSize(f.size) }}
                    <template v-if="f.status === 'uploading'">· 上传中 {{ f.progress }}%</template>
                    <template v-else-if="f.status === 'error'">· {{ f.error || '上传失败' }}</template>
                    <template v-else>· 已就绪</template>
                  </span>
                </span>
                <button
                  v-if="f.status !== 'uploading'"
                  type="button"
                  class="chat-input__file-remove"
                  aria-label="移除文件"
                  @click="removeFile(f.id)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <div v-if="f.status === 'uploading'" class="chat-input__file-bar">
                  <span :style="{ width: f.progress + '%' }" />
                </div>
              </div>
            </div>

            <div
              class="chat-input__box"
              :class="{
                'is-empty': !canSend,
                'is-recording': voiceState === 'recording',
                'is-focus': isInputFocus,
              }"
            >
              <div class="chat-input__tools">
                <button
                  type="button"
                  class="chat-input__tool"
                  :class="{ 'is-disabled': chat.thinking }"
                  :disabled="chat.thinking"
                  aria-label="上传文件"
                  title="上传文件"
                  @click="triggerFile"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>
                <input
                  ref="fileInputEl"
                  type="file"
                  class="chat-input__file-input"
                  multiple
                  :accept="ACCEPTED_EXTS.join(',')"
                  @change="onFilePick"
                />
                <button
                  type="button"
                  class="chat-input__tool"
                  :class="{
                    'is-recording': voiceState === 'recording',
                    'is-disabled': chat.thinking,
                  }"
                  :disabled="chat.thinking || !speechSupported"
                  :aria-label="voiceState === 'recording' ? '停止录音' : '语音输入'"
                  :title="!speechSupported ? '当前浏览器不支持语音识别' : (voiceState === 'recording' ? '停止录音' : '语音输入')"
                  @click="toggleVoice"
                >
                  <svg v-if="voiceState === 'recording'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                  </svg>
                  <span v-if="voiceState === 'recording'" class="chat-input__rec-pulse" />
                </button>
              </div>
              <div class="chat-input__field">
                <textarea
                  ref="textareaEl"
                  v-model="input"
                  rows="1"
                  :placeholder="placeholderText"
                  :disabled="chat.thinking"
                  :aria-label="chat.thinking ? 'AI 正在回复中' : '对话输入'"
                  @keydown.enter.exact.prevent="onSend"
                  @keydown.shift.enter.exact.stop
                  @input="onInput"
                  @focus="isInputFocus = true"
                  @blur="isInputFocus = false"
                />
                <!-- 录音中浮层 -->
                <div v-if="voiceState === 'recording'" class="chat-input__rec-overlay" role="status" aria-live="polite">
                  <span class="chat-input__rec-dot" />
                  正在聆听… {{ voiceDuration }}s
                  <button type="button" class="chat-input__rec-cancel" @click="cancelVoice" aria-label="取消录音">取消</button>
                </div>
                <!-- 语音处理中 -->
                <div v-if="voiceState === 'processing'" class="chat-input__rec-overlay" role="status">
                  <span class="chat-input__rec-dot is-processing" />
                  正在识别语音…
                </div>
              </div>
              <!-- 发送 / 终止 按钮 -->
              <button
                v-if="!chat.thinking"
                type="submit"
                class="chat-send"
                :class="{ 'is-disabled': !canSend }"
                :disabled="!canSend"
                :aria-label="canSend ? '发送' : '请先输入内容'"
                :title="canSend ? '发送' : '请先输入内容'"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
                </svg>
              </button>
              <button
                v-else
                type="button"
                class="chat-send chat-send--abort"
                aria-label="终止生成"
                title="终止生成"
                @click="onAbort"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="6" y="6" width="12" height="12" rx="1.5" />
                </svg>
              </button>
            </div>
            <div class="chat-input__foot">
              <span>当前员工 · {{ chat.employee?.name || '' }} · 知识库 12 份 · 工具 4 个</span>
              <span class="chat-input__hint">
                <template v-if="voiceState === 'recording'">录音中 · 单击麦克风结束</template>
                <template v-else-if="chat.thinking">生成中 · 可点 ■ 终止</template>
                <template v-else> Enter发送，Shift+Enter换行</template>
              </span>
            </div>
          </form>
        </div>

        <!-- 右：进程 / 文件 面板 -->
        <transition name="panel-slide">
          <aside v-if="panelOpen" class="chat-panel" :key="'panel'">
            <div class="chat-panel__head">
              <div class="chat-panel__tabs" role="tablist">
                <button
                  class="chat-panel__tab"
                  :class="{ 'is-active': activeTab === 'process' }"
                  role="tab"
                  :aria-selected="activeTab === 'process'"
                  @click="setTab('process')"
                >当前进程</button>
                <button
                  class="chat-panel__tab"
                  :class="{ 'is-active': activeTab === 'files' }"
                  role="tab"
                  :aria-selected="activeTab === 'files'"
                  @click="setTab('files')"
                >文件</button>
              </div>
              <button
                class="iconbtn"
                aria-label="关闭面板"
                title="关闭面板"
                @click="togglePanel"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- 当前进程面板 -->
            <div v-show="activeTab === 'process'" class="chat-panel__body chat-panel__process">
              <div class="process-list">
                <div
                  v-for="step in processSteps"
                  :key="step.id"
                  class="process-step"
                  :class="['is-' + step.status, 'is-type-' + step.type]"
                >
                  <div class="process-step__rail">
                    <span class="process-step__dot" />
                  </div>
                  <div class="process-step__body">
                    <div class="process-step__head">
                      <span
                        class="process-step__type"
                        :style="{ color: stepTypeMeta(step.type).color, borderColor: stepTypeMeta(step.type).color }"
                      >{{ stepTypeMeta(step.type).label }}</span>
                      <span class="process-step__time">{{ step.time }}</span>
                      <span
                        class="process-step__status"
                        :style="{ color: stepStatusMeta(step.status).color }"
                      >
                        <span class="process-step__status-dot" :style="{ background: stepStatusMeta(step.status).color }" />
                        {{ stepStatusMeta(step.status).label }}
                      </span>
                    </div>
                    <div class="process-step__title">{{ step.title }}</div>
                    <div v-if="step.path" class="process-step__path">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      <span>{{ step.path }}</span>
                    </div>
                    <div v-if="step.detail" class="process-step__detail">{{ step.detail }}</div>
                    <pre v-if="step.output" class="process-step__output">{{ step.output.join('\n') }}<span class="caret" /></pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- 文件面板 -->
            <div v-show="activeTab === 'files'" class="chat-panel__body chat-panel__files" :class="{ 'is-preview-closed': !previewOpen }">
              <div class="files-tree">
                <div class="files-tree__head">
                  <div class="files-tree__title">文件</div>
                  <div class="files-tree__head-actions">
                    <button
                      v-if="!previewOpen && selectedFile"
                      type="button"
                      class="files-tree__reopen"
                      :title="`预览 ${selectedFile}`"
                      @click="openPreview()"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      预览 {{ selectedFile }}
                    </button>
                    <button class="iconbtn iconbtn--xs" aria-label="刷新文件树">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5M8 16H3v5" />
                      </svg>
                    </button>
                  </div>
                </div>
                <input
                  class="files-tree__search"
                  type="text"
                  placeholder="搜索文件…"
                  aria-label="搜索文件"
                />
                <div class="files-tree__body">
                  <ul class="tree">
                    <TreeNode
                      v-for="node in fileTree"
                      :key="node.id"
                      :node="node"
                      :expanded="expandedFolders"
                      :selected="selectedFile"
                      @toggle="toggleFolder"
                      @select="selectFile"
                    />
                  </ul>
                </div>
              </div>
              <transition name="preview-slide">
                <div v-if="previewOpen" class="files-preview" :key="selectedFile || 'empty'">
                  <div class="files-preview__head">
                    <div class="files-preview__crumb">
                      <span class="files-preview__crumb-name" :title="selectedFile">{{ selectedFile || '未选择文件' }}</span>
                      <button
                        type="button"
                        class="iconbtn iconbtn--xs"
                        aria-label="关闭预览"
                        title="关闭预览"
                        @click="closePreview()"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div class="files-preview__meta">{{ activeFileMeta }}</div>
                  </div>
                  <div class="files-preview__body">
                    <div v-if="previewLoading" class="files-preview__loading">
                      <span class="files-preview__spinner" />
                      正在加载 {{ selectedFile }} …
                    </div>
                    <template v-else>
                      <p
                        v-for="(p, i) in activeFilePreview.paragraphs"
                        :key="i"
                        class="files-preview__p"
                      >{{ p }}</p>
                      <div v-if="!activeFilePreview.paragraphs.length" class="files-preview__empty">
                        该文件没有可预览内容。
                      </div>
                    </template>
                  </div>
                  <div class="files-preview__foot">
                    <span v-if="activeFilePreview.kind === 'csv'">共 {{ activeFilePreview.rows.toLocaleString() }} 行 · {{ activeFilePreview.size }}</span>
                    <span v-else-if="activeFilePreview.kind === 'md'">Markdown · {{ activeFilePreview.size }}</span>
                    <span v-else-if="activeFilePreview.kind === 'py'">Python · {{ activeFilePreview.size }}</span>
                    <span v-else>文件 · {{ activeFilePreview.size }}</span>
                    <span>·</span>
                    <span>只读预览</span>
                  </div>
                </div>
              </transition>
            </div>
          </aside>
        </transition>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import TreeNode from '@/components/TreeNode.vue'

const chat = useChatStore()
const overlay = ref(null)
const streamEl = ref(null)
const textareaEl = ref(null)
const fileInputEl = ref(null)
const input = ref('')
const isInputFocus = ref(false)

/* ============ 文件上传 ============ */
const ACCEPTED_EXTS = [
  '.txt', '.md', '.json', '.csv', '.log', '.xml', '.yaml', '.yml',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.rar', '.7z',
]
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const uploadedFiles = ref([])
let _fileId = 1

function triggerFile() {
  if (chat.thinking) return
  fileInputEl.value?.click()
}
function formatSize(n) {
  if (n == null) return ''
  if (n < 1024) return n + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
  return (n / (1024 * 1024)).toFixed(2) + ' MB'
}
function onFilePick(e) {
  const files = Array.from(e.target.files || [])
  files.forEach(addFile)
  // 重置 input 以便重复选择同一文件
  e.target.value = ''
}
function addFile(raw) {
  // 校验
  const ext = '.' + (raw.name.split('.').pop() || '').toLowerCase()
  if (!ACCEPTED_EXTS.includes(ext)) {
    pushFile({ name: raw.name, size: raw.size, status: 'error', error: '不支持的格式', progress: 0 })
    return
  }
  if (raw.size > MAX_FILE_SIZE) {
    pushFile({ name: raw.name, size: raw.size, status: 'error', error: '超过 20MB 限制', progress: 0 })
    return
  }
  const id = 'file-' + (_fileId++)
  pushFile({ id, raw, name: raw.name, size: raw.size, status: 'uploading', progress: 0 })
  // 模拟上传进度
  let p = 0
  const tick = () => {
    p += Math.floor(8 + Math.random() * 18)
    if (p >= 100) {
      updateFile(id, { status: 'done', progress: 100 })
    } else {
      updateFile(id, { progress: p })
      setTimeout(tick, 90 + Math.random() * 120)
    }
  }
  setTimeout(tick, 80)
}
function pushFile(f) {
  if (!f.id) f.id = 'file-' + (_fileId++)
  uploadedFiles.value.push(f)
}
function updateFile(id, patch) {
  const idx = uploadedFiles.value.findIndex(f => f.id === id)
  if (idx >= 0) uploadedFiles.value[idx] = { ...uploadedFiles.value[idx], ...patch }
}
function removeFile(id) {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== id)
}

/* ============ 语音输入 ============ */
const voiceState = ref('idle')        // 'idle' | 'recording' | 'processing'
const voiceDuration = ref(0)
const speechSupported = ref(false)
let _recognition = null
let _recTimer = null
let _voiceBase = ''  // 录音前的输入文本

if (typeof window !== 'undefined') {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  speechSupported.value = !!SR
  if (SR) {
    _recognition = new SR()
    _recognition.lang = 'zh-CN'
    _recognition.continuous = true
    _recognition.interimResults = true
    _recognition.onresult = (e) => {
      let finalText = ''
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finalText += r[0].transcript
        else interim += r[0].transcript
      }
      if (finalText) {
        // 将最终结果追加到 base
        input.value = (_voiceBase + (finalText + interim)).replace(/\s+/g, ' ').trim()
        _voiceBase = _voiceBase ? _voiceBase + finalText : finalText
      } else {
        // 临时结果直接显示
        input.value = (_voiceBase + interim).replace(/\s+/g, ' ').trim()
      }
      autoResizeDom()
    }
    _recognition.onerror = (e) => {
      stopVoice(false)
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        console.warn('[voice] permission denied')
      }
    }
    _recognition.onend = () => {
      if (voiceState.value === 'recording') {
        // 浏览器主动结束（超时/静音），自动 stop
        stopVoice(true)
      }
    }
  }
}

function toggleVoice() {
  if (!speechSupported.value || chat.thinking) return
  if (voiceState.value === 'recording') {
    stopVoice(true)
  } else {
    startVoice()
  }
}
function startVoice() {
  if (!_recognition) return
  try {
    _voiceBase = input.value ? input.value + ' ' : ''
    voiceState.value = 'recording'
    voiceDuration.value = 0
    _recTimer = setInterval(() => { voiceDuration.value += 1 }, 1000)
    _recognition.start()
  } catch (e) {
    voiceState.value = 'idle'
    if (_recTimer) { clearInterval(_recTimer); _recTimer = null }
  }
}
function stopVoice(commit) {
  try { _recognition?.stop() } catch (e) { /* noop */ }
  if (_recTimer) { clearInterval(_recTimer); _recTimer = null }
  if (voiceState.value === 'recording') {
    voiceState.value = 'processing'
    // 短暂处理态以提供视觉反馈
    setTimeout(() => { voiceState.value = 'idle' }, 350)
  } else {
    voiceState.value = 'idle'
  }
  if (commit === false) {
    // 取消：还原到录音前文本
    input.value = _voiceBase.trim()
    _voiceBase = ''
  }
}
function cancelVoice() {
  if (_recTimer) { clearInterval(_recTimer); _recTimer = null }
  try { _recognition?.abort() } catch (e) { /* noop */ }
  input.value = _voiceBase.trim()
  _voiceBase = ''
  voiceState.value = 'idle'
}

const placeholderText = computed(() => {
  if (chat.thinking) return 'AI 正在回复中…'
  if (voiceState.value === 'recording') return '请开始说话…'
  return '向员工发起一次问询…'
})

/* ============ 右侧进程 / 文件面板 ============ */
const panelOpen = ref(true)             // 右侧面板开关
const activeTab = ref('process')         // 'process' | 'files'
const expandedFolders = ref({            // 文件树展开状态
  'workspace': true,
  'workspace/scripts': true,
  'workspace/data': true,
  'workspace/docs': true,
})
const selectedFile = ref('leo_link_q1.csv')

/* ============ 进程卡片的收起/展开状态 ============ */
const collapsedCards = ref({}) // { [msgId]: true 表示收起 }
function isCardCollapsed(id) { return !!collapsedCards.value[id] }
function toggleCardCollapse(id) { collapsedCards.value[id] = !collapsedCards.value[id] }

/**
 * 行内 Markdown 渲染（最小实现）
 * 支持：**bold**、`code`、换行
 */
function renderInline(text) {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="chat-md__inline">$1</code>')
    .replace(/\n/g, '<br/>')
}

/* ---------- 模拟进程步骤（同步显示第 1 轮 FSPL 任务） ---------- */
const processSteps = ref([
  {
    id: 'ps1',
    time: '19:38:01',
    type: 'think',
    status: 'done',
    title: '解析任务需求',
    detail: '用户反馈 FSPL 出现负数，先读取脚本与样本数据，定位根因。',
  },
  {
    id: 'ps2',
    time: '19:38:02',
    type: 'read',
    status: 'done',
    title: '读取 FSPL 计算脚本',
    path: '/workspace/scripts/fspl_calc.py',
  },
  {
    id: 'ps3',
    time: '19:38:02',
    type: 'read',
    status: 'done',
    title: '读取链路损耗入口脚本',
    path: '/workspace/scripts/sat_link_loss.py',
  },
  {
    id: 'ps4',
    time: '19:38:03',
    type: 'read',
    status: 'done',
    title: '读取样本数据',
    path: '/workspace/data/leo_link_q1.csv',
  },
  {
    id: 'ps5',
    time: '19:38:05',
    type: 'think',
    status: 'done',
    title: '静态分析 + 运行样本数据',
    detail: '在 dist_km=0 处出现 log10(0)=NaN，被 min() 比较为极小负数。',
  },
  {
    id: 'ps6',
    time: '19:38:06',
    type: 'verify',
    status: 'done',
    title: '定位 Bug',
    detail: 'dist_km=0 行触发 NaN',
  },
  {
    id: 'ps7',
    time: '19:38:08',
    type: 'write',
    status: 'done',
    title: '修改 fspl_calc.py：过滤非法值 + max(0, fspl) 钳位',
    path: '/workspace/scripts/fspl_calc.py',
  },
  {
    id: 'ps8',
    time: '19:38:10',
    type: 'write',
    status: 'done',
    title: '修改 sat_link_loss.py：空值兜底 + 单位校验',
    path: '/workspace/scripts/sat_link_loss.py',
  },
  {
    id: 'ps9',
    time: '19:38:12',
    type: 'exec',
    status: 'done',
    title: '运行回归：python sat_link_loss.py --csv data/leo_link_q1.csv',
    path: '/workspace/scripts/sat_link_loss.py',
    output: [
      '$ python sat_link_loss.py --csv data/leo_link_q1.csv',
      '[INFO] 读取 500,000 行',
      '[INFO] 过滤 dist_km<=0: 23 行',
      '[INFO] FSPL min=82.4  max=148.7  mean=121.3',
      '[OK]   无非负异常，链路预算可继续。',
    ],
  },
  {
    id: 'ps10',
    time: '19:38:13',
    type: 'verify',
    status: 'done',
    title: '校验输出：无非负异常',
    detail: '修复后该列已无非负异常，可以直接进入下游的链路预算计算。',
  },
])

/* ---------- 模拟文件树（FSPL 任务相关文件） ---------- */
const fileTree = ref([
  {
    id: 'workspace',
    name: 'workspace',
    type: 'folder',
    children: [
      {
        id: 'workspace/scripts',
        name: 'scripts',
        type: 'folder',
        children: [
          { id: 'fs1', name: 'fspl_calc.py',         type: 'file', size: '1.2 KB', icon: 'py' },
          { id: 'fs2', name: 'sat_link_loss.py',     type: 'file', size: '2.4 KB', icon: 'py' },
          { id: 'fs3', name: 'utils_vector.py',      type: 'file', size: '1.8 KB', icon: 'py' },
          { id: 'fs4', name: 'requirements.txt',     type: 'file', size: '48 B',  icon: 'doc' },
        ],
      },
      {
        id: 'workspace/data',
        name: 'data',
        type: 'folder',
        children: [
          { id: 'fd1', name: 'leo_link_q1.csv',      type: 'file', size: '38.6 MB', icon: 'csv', selected: true },
          { id: 'fd2', name: 'leo_link_q1.sample.csv', type: 'file', size: '420 KB', icon: 'csv' },
        ],
      },
      {
        id: 'workspace/docs',
        name: 'docs',
        type: 'folder',
        children: [
          { id: 'fdoc1', name: 'optimization_notes.md', type: 'file', size: '3.1 KB', icon: 'md' },
          { id: 'fdoc2', name: 'README.md',             type: 'file', size: '520 B',  icon: 'md' },
        ],
      },
    ],
  },
])

/* ---------- 文件预览开关 + 按文件名动态生成预览内容 ---------- */
const previewOpen = ref(true)         // 预览面板是否显示
const previewLoading = ref(false)     // 模拟加载状态
let _previewTimer = null               // 模拟加载定时器句柄（用于关闭/切换时清理）

/**
 * 根据文件 id / name 生成预览内容
 * 实际场景应异步从后端拉取；这里用同步 mock 模拟切换文件 + 加载态
 */
const FILE_PREVIEW_MAP = {
  'fspl_calc.py': {
    kind: 'py', size: '1.2 KB',
    paragraphs: [
      '"""FSPL = 自由空间路径损耗（Friis transmission equation）"""',
      'import math',
      'import pandas as pd',
      '',
      'def fspl_db(freq_mhz: float, dist_km: float) -> float:',
      '    """计算自由空间损耗，单位 dB。freq 单位 MHz，dist 单位 km。"""',
      '    if dist_km <= 0 or freq_mhz <= 0:',
      '        raise ValueError("freq / dist 必须 > 0")',
      '    return 32.45 + 20 * math.log10(freq_mhz) + 20 * math.log10(dist_km)',
      '',
      'def process_csv(path: str) -> pd.DataFrame:',
      '    df = pd.read_csv(path)',
      '    df = df[df["dist_km"] > 0]   # 过滤非法值',
      '    df["fspl_db"] = df.apply(',
      '        lambda r: fspl_db(r.freq_mhz, r.dist_km), axis=1',
      '    )',
      '    return df',
    ],
  },
  'sat_link_loss.py': {
    kind: 'py', size: '2.4 KB',
    paragraphs: [
      '"""卫星链路预算入口：调用 fspl_calc + 各种损耗模型"""',
      'import argparse',
      'from fspl_calc import process_csv',
      'from utils_vector import fspl_db_vec',
      '',
      'def main():',
      '    parser = argparse.ArgumentParser()',
      '    parser.add_argument("--csv", required=True)',
      '    args = parser.parse_args()',
      '',
      '    df = process_csv(args.csv)',
      '    print(f"读取 {len(df)} 行")',
      '    print(f"FSPL min={df.fspl_db.min():.1f}  max={df.fspl_db.max():.1f}")',
      '',
      'if __name__ == "__main__":',
      '    main()',
    ],
  },
  'utils_vector.py': {
    kind: 'py', size: '1.8 KB',
    paragraphs: [
      '"""numpy 向量化 + tqdm 进度条的重构版本"""',
      'import numpy as np',
      'import pandas as pd',
      'from tqdm import tqdm',
      '',
      'def fspl_db_vec(freq_mhz, dist_km):',
      '    freq_mhz = np.asarray(freq_mhz, dtype=np.float64)',
      '    dist_km = np.asarray(dist_km, dtype=np.float64)',
      '    mask = (freq_mhz > 0) & (dist_km > 0)',
      '    out = np.full_like(freq_mhz, np.nan, dtype=np.float64)',
      '    out[mask] = 32.45 + 20*np.log10(freq_mhz[mask]) + 20*np.log10(dist_km[mask])',
      '    return np.clip(out, 0.0, None)',
      '',
      'def process_csv(path, chunksize=100_000):',
      '    for df in tqdm(pd.read_csv(path, chunksize=chunksize), desc="Processing"):',
      '        df = df[df["dist_km"] > 0]',
      '        df["fspl_db"] = fspl_db_vec(df["freq_mhz"].values, df["dist_km"].values)',
      '        yield df',
    ],
  },
  'requirements.txt': {
    kind: 'txt', size: '48 B',
    paragraphs: ['numpy>=1.24', 'pandas>=2.0', 'tqdm>=4.65', ''],
  },
  'leo_link_q1.csv': {
    kind: 'csv', size: '38.6 MB', rows: 500000,
    paragraphs: [
      'time_utc,freq_mhz,dist_km,fspl_db,rx_power_dbm',
      '2026-01-02T00:00:00Z,12400.0,612.4,124.8,-92.3',
      '2026-01-02T00:00:01Z,12400.0,0.0,NaN,-110.0',
      '2026-01-02T00:00:02Z,12400.0,613.1,124.9,-91.9',
      '2026-01-02T00:00:03Z,12400.0,612.9,124.9,-92.0',
      '2026-01-02T00:00:04Z,12400.0,,NaN,-109.8',
      '2026-01-02T00:00:05Z,12400.0,613.5,125.0,-91.7',
      '2026-01-02T00:00:06Z,12400.0,614.0,125.0,-91.6',
      '2026-01-02T00:00:07Z,12400.0,613.8,125.0,-91.7',
      '2026-01-02T00:00:08Z,12400.0,614.2,125.0,-91.5',
    ],
  },
  'leo_link_q1.sample.csv': {
    kind: 'csv', size: '420 KB', rows: 5000,
    paragraphs: [
      'time_utc,freq_mhz,dist_km,fspl_db,rx_power_dbm',
      '2026-01-02T00:00:00Z,12400.0,612.4,124.8,-92.3',
      '2026-01-02T00:00:01Z,12400.0,0.0,NaN,-110.0',
      '2026-01-02T00:00:02Z,12400.0,613.1,124.9,-91.9',
    ],
  },
  'optimization_notes.md': {
    kind: 'md', size: '3.1 KB',
    paragraphs: [
      '# Optimization Notes · FSPL 链路损耗优化',
      '',
      '## 背景',
      '原 `fspl_calc.py` 在 50 万行 LEO 链路数据上耗时 ~18s，瓶颈在 `apply(axis=1)` 的逐行 Python 函数调用。',
      '',
      '## 方案',
      '1. `fspl_db_vec` 用 `numpy` 向量化，避免逐行 apply；',
      '2. `pd.read_csv(chunksize=10w)` 分块 + `tqdm` 进度条；',
      '3. 空值兜底：若 `fspl.isna().all()` 抛 `ValueError("无有效样本")`。',
      '',
      '## 基准',
      '| 数据量 | 原版 | 重构版 | 加速比 |',
      '| --- | --- | --- | --- |',
      '| 50 万行 | 18.2s | 2.3s | 7.9x |',
      '| 100 万行 | 36.7s | 4.6s | 7.9x |',
    ],
  },
  'README.md': {
    kind: 'md', size: '520 B',
    paragraphs: [
      '# LEO 链路预算工具',
      '',
      '基于 `fspl_calc.py` 的命令行链路预算工具，支持：',
      '- 多频段 FSPL 计算（MHz / GHz）',
      '- 50 万行级 CSV 流式处理',
      '- 进度条 + 性能基准',
      '',
      '## 快速开始',
      '```',
      'pip install -r requirements.txt',
      'python sat_link_loss.py --csv data/leo_link_q1.csv',
      '```',
    ],
  },
}

const activeFilePreview = computed(() => {
  const fp = FILE_PREVIEW_MAP[selectedFile.value]
  return fp || { kind: 'file', size: '—', paragraphs: [] }
})
const activeFileMeta = computed(() => {
  if (!selectedFile.value) return 'workspace/'
  // 根据文件路径推断父目录
  const map = {
    'fspl_calc.py': 'workspace/scripts/fspl_calc.py',
    'sat_link_loss.py': 'workspace/scripts/sat_link_loss.py',
    'utils_vector.py': 'workspace/scripts/utils_vector.py',
    'requirements.txt': 'workspace/scripts/requirements.txt',
    'leo_link_q1.csv': 'workspace/data/leo_link_q1.csv',
    'leo_link_q1.sample.csv': 'workspace/data/leo_link_q1.sample.csv',
    'optimization_notes.md': 'workspace/docs/optimization_notes.md',
    'README.md': 'workspace/docs/README.md',
  }
  return map[selectedFile.value] || `workspace/${selectedFile.value}`
})

const agentInitial = computed(() => (chat.employee?.name || '?').slice(0, 1))
const agentAvatarStyle = computed(() => ({
  '--c1': chat.employee?.avatar || 'var(--accent)',
  '--c2': chat.employee?.accent || 'var(--accent-2)',
  background: `linear-gradient(135deg, ${chat.employee?.avatar || 'var(--accent)'}, ${chat.employee?.accent || 'var(--accent-2)'})`,
}))
const lastMessage = computed(() => chat.messages[chat.messages.length - 1])

/* ---------- 交互方法 ---------- */
function togglePanel() {
  panelOpen.value = !panelOpen.value
}
function setTab(tab) {
  activeTab.value = tab
}
function toggleFolder(id) {
  expandedFolders.value[id] = !expandedFolders.value[id]
}
function isFolderOpen(id) {
  return !!expandedFolders.value[id]
}

/**
 * 点击文件树节点 → 打开预览并模拟加载
 * 通过 :key="selectedFile" 强制重建预览节点，触发 fade 动画；
 * previewLoading 模拟从后端拉取内容的耗时
 */
function selectFile(file) {
  if (!file) return
  selectedFile.value = file.name
  // 打开预览 + 模拟加载
  previewOpen.value = true
  previewLoading.value = true
  if (_previewTimer) { clearTimeout(_previewTimer); _previewTimer = null }
  _previewTimer = setTimeout(() => {
    previewLoading.value = false
    _previewTimer = null
  }, 240)
}

/**
 * 关闭预览：清理加载定时器、释放动画期间占用的资源
 * 关闭后右侧仅显示文件树（files-tree 自动占满空间）
 */
function closePreview() {
  if (_previewTimer) { clearTimeout(_previewTimer); _previewTimer = null }
  previewLoading.value = false
  previewOpen.value = false
}

/**
 * 重新打开预览：若已有选中文件，则恢复预览
 */
function openPreview() {
  if (!selectedFile.value) return
  previewOpen.value = true
  previewLoading.value = true
  if (_previewTimer) { clearTimeout(_previewTimer); _previewTimer = null }
  _previewTimer = setTimeout(() => {
    previewLoading.value = false
    _previewTimer = null
  }, 220)
}

/* 关闭对话时一并释放预览相关资源 */
function disposePreview() {
  if (_previewTimer) { clearTimeout(_previewTimer); _previewTimer = null }
  previewOpen.value = true
  previewLoading.value = false
}
function iconFor(type) {
  return {
    folder: 'folder',
    file:   'doc',
  }[type] || 'doc'
}
function stepTypeMeta(type) {
  return {
    think:  { label: '思考', color: 'var(--accent)',  icon: 'think' },
    read:   { label: '读取', color: 'var(--info)',    icon: 'read' },
    write:  { label: '写入', color: 'var(--ok)',      icon: 'write' },
    exec:   { label: '执行', color: 'var(--warn)',    icon: 'exec' },
    verify: { label: '校验', color: 'var(--magenta)', icon: 'verify' },
  }[type] || { label: type, color: 'var(--ink-3)', icon: 'exec' }
}
function stepStatusMeta(status) {
  return {
    pending:  { label: '等待', color: 'var(--ink-3)' },
    running:  { label: '执行中', color: 'var(--warn)' },
    done:     { label: '完成', color: 'var(--ok)' },
    error:    { label: '失败', color: 'var(--danger)' },
  }[status] || { label: status, color: 'var(--ink-3)' }
}

function scrollToBottom() {
  nextTick(() => {
    if (streamEl.value) streamEl.value.scrollTop = streamEl.value.scrollHeight
  })
}

/* 发送按钮可用：仅当有内容且不在生成中 */
const canSend = computed(() => input.value.trim().length > 0 && !chat.thinking)

function onSend() {
  if (!canSend.value) return
  const text = input.value.trim()
  // 附带已上传文件标记
  const fileNames = uploadedFiles.value
    .filter(f => f.status === 'done')
    .map(f => f.name)
  const payload = fileNames.length ? `${text}\n[附件] ${fileNames.join(', ')}` : text
  chat.send(payload)
  input.value = ''
  if (textareaEl.value) textareaEl.value.style.height = '24px'
  // 发送后清空文件列表（已合并到消息中）
  uploadedFiles.value = []
  scrollToBottom()
}

function onAbort() {
  chat.abort()
  scrollToBottom()
}

function onInput(e) {
  autoResize(e)
}

function autoResize(e) {
  const el = e?.target || textareaEl.value
  if (!el) return
  el.style.height = '24px'
  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
}
function autoResizeDom() {
  nextTick(() => autoResize())
}

watch(() => chat.open, (v) => {
  if (v) {
    nextTick(() => {
      overlay.value?.focus()
      scrollToBottom()
    })
  } else {
    // 关闭时清理录音状态、文件列表、文件预览资源
    cancelVoice()
    uploadedFiles.value = []
    disposePreview()
  }
})

watch(() => chat.messages.length, () => scrollToBottom())
</script>

<style scoped>
/* ============================================================
 * OrbitalCommand · Chat Overlay
 * 设计语言：Mission Control Workstation
 *   - 抽屉淡入：280ms 缓动
 *   - 主区左右分屏：左对话 | 右进程/文件
 *   - 进程面板：步骤时间线 + 终端输出
 *   - 文件面板：可展开文件树 + 文档预览
 *   - 响应式：≤1024 进程面板变底部抽屉，≤900 隐藏历史侧栏
 * ============================================================ */

/* ---------- 抽屉过渡：fade + slide ---------- */
.chat-fade-enter-active,
.chat-fade-leave-active {
  transition: opacity 240ms var(--ease, cubic-bezier(.4,0,.2,1));
}
.chat-fade-enter-active .chat-sidebar,
.chat-fade-leave-active .chat-sidebar,
.chat-fade-enter-active .chat-main,
.chat-fade-leave-active .chat-main {
  transition: transform 280ms var(--ease, cubic-bezier(.4,0,.2,1));
}
.chat-fade-enter-from,
.chat-fade-leave-to { opacity: 0; }
.chat-fade-enter-from .chat-sidebar,
.chat-fade-leave-to .chat-sidebar { transform: translateX(-24px); }
.chat-fade-enter-from .chat-main,
.chat-fade-leave-to .chat-main     { transform: translateX(24px); }

/* ---------- Overlay 容器 ---------- */
.chat-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--bg);
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: 100vh;
  outline: none;
  overflow: hidden;
  animation: chatZoom 280ms cubic-bezier(.4,0,.2,1);
}
@keyframes chatZoom {
  from { opacity: 0; transform: scale(0.985); }
  to   { opacity: 1; transform: none; }
}

/* ---------- 左侧历史侧栏 ---------- */
.chat-sidebar {
  background: var(--surface);
  border-right: 1px solid var(--line);
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.chat-sidebar__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 10px 20px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 16px;
}
.chat-sidebar__title { font-size: 14px; font-weight: 600; color: var(--ink); flex: 1; }
.chat-history { flex: 1; overflow-y: auto; }
.chat-history__group { margin-bottom: 16px; }
.chat-history__date {
  font-size: 11px;
  color: var(--ink-3);
  padding: 0 10px;
  margin-bottom: 6px;
  letter-spacing: 0.04em;
  font-family: var(--font-mono);
}
.chat-history__item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12.5px;
  color: var(--ink-2);
  margin-bottom: 2px;
  transition: background 160ms var(--ease), color 160ms var(--ease);
}
.chat-history__item:hover { background: var(--surface-2); color: var(--ink); }
.chat-history__item.is-active { background: var(--accent-soft); color: var(--accent); }
.chat-history__item .preview {
  color: var(--ink-3);
  font-size: 11px;
  margin-top: 2px;
  font-family: var(--font-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ============================================================
 * 主区：左对话 + 右面板（左右分屏）
 * ============================================================ */
.chat-main {
  display: flex;
  flex-direction: row;
  min-width: 0;
  min-height: 0;
  height: 100%;
  background: var(--bg);
  position: relative;
  overflow: hidden;
}

/* ---------- 左：对话内容 ---------- */
.chat-content {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  overflow: hidden;
}
.chat-main__head {
  padding: 16px 28px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--surface);
  flex-shrink: 0;
}
.chat-main__agent { display: flex; align-items: center; gap: 12px; min-width: 0; }
.chat-main__agent-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-family: var(--font-display);
  background: linear-gradient(135deg, var(--c1), var(--c2));
  box-shadow: 0 4px 12px var(--accent-glow);
  flex-shrink: 0;
}
.chat-main__agent-name { font-size: 15px; font-weight: 600; color: var(--ink); }
.chat-main__agent-status { font-size: 11.5px; color: var(--ok); font-family: var(--font-mono); }
.chat-main__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.btn.is-active {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: rgba(139, 92, 246, 0.35);
}
.iconbtn.is-active {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: rgba(139, 92, 246, 0.35);
}

/* ---------- 消息流 ---------- */
.chat-stream {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  scroll-behavior: smooth;
}
.chat-msg {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: msgIn 280ms cubic-bezier(.4,0,.2,1) both;
}
@keyframes msgIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}
.chat-msg--user { align-self: flex-end; align-items: flex-end; }
.chat-msg--bot  { align-self: flex-start; align-items: flex-start; }
.chat-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--ink);
  word-break: break-word;
}
.chat-msg--user .chat-bubble {
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px var(--accent-glow);
}
.chat-msg--bot .chat-bubble {
  background: var(--surface);
  border: 1px solid var(--line);
  border-bottom-left-radius: 4px;
}
.chat-msg__time {
  font-size: 10.5px;
  color: var(--ink-3);
  font-family: var(--font-mono);
  padding: 0 4px;
}
.chat-msg--thinking .chat-bubble { font-style: italic; color: var(--ink-2); }

.chat-step {
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: 4px;
  font-size: 12px;
  align-self: flex-start;
  max-width: 80%;
  animation: msgIn 280ms cubic-bezier(.4,0,.2,1) both;
}
.chat-step__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  color: var(--ink-2);
  font-weight: 500;
}
.chat-step__head i {
  color: var(--accent);
  display: inline-flex;
  align-items: center;
}
.chat-step__head svg { width: 14px; height: 14px; }
.chat-step__body { font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); }

.chat-suggest { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.chat-suggest button {
  padding: 6px 12px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 12px;
  color: var(--ink-2);
  transition: all 160ms var(--ease);
  cursor: pointer;
}
.chat-suggest button:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}

/* ============================================================
 * 智能体执行步骤卡（聊天流内联版，与右侧 process-step 区分）
 * ============================================================ */
.chat-process-card {
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px 16px 12px;
  align-self: stretch;
  max-width: 90%;
  margin: 4px 0 2px;
  animation: msgIn 320ms cubic-bezier(.4,0,.2,1) both;
}
.chat-process-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line);
}
.chat-process-card__check {
  width: 18px; height: 18px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff;
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.chat-process-card__check svg { width: 11px; height: 11px; }
.chat-process-card__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: 0.01em;
}
.chat-process-card__progress {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  padding: 2px 8px;
  border-radius: 999px;
  font-family: var(--font-mono);
}
.chat-process-card__list {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}
.chat-process-card__list::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 8px;
  bottom: 8px;
  width: 1.5px;
  background: var(--line);
}
.chat-process-card__row {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  padding-left: 0;
  font-size: 12.5px;
  color: var(--ink-2);
  line-height: 1.4;
  animation: msgIn 240ms cubic-bezier(.4,0,.2,1) both;
}
.chat-process-card__icon {
  width: 20px; height: 20px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1.5px solid var(--line);
  border-radius: 50%;
  color: var(--ink-3);
  position: relative;
  z-index: 1;
}
.chat-process-card__icon svg { width: 11px; height: 11px; }
.chat-process-card__row.is-icon-think .chat-process-card__icon { color: var(--info);   border-color: color-mix(in srgb, var(--info)   50%, transparent); }
.chat-process-card__row.is-icon-read  .chat-process-card__icon { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 50%, transparent); }
.chat-process-card__row.is-icon-write .chat-process-card__icon { color: var(--ok);     border-color: color-mix(in srgb, var(--ok)     50%, transparent); }
.chat-process-card__row.is-icon-exec  .chat-process-card__icon { color: var(--warn);   border-color: color-mix(in srgb, var(--warn)   50%, transparent); background: color-mix(in srgb, var(--warn) 10%, var(--surface)); }
.chat-process-card__row.is-icon-verify .chat-process-card__icon { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }
.chat-process-card__row.is-icon-verify .chat-process-card__icon svg { stroke-width: 2.6; }
.chat-process-card__text { flex: 1; min-width: 0; }
.chat-process-card__time {
  flex-shrink: 0;
  font-size: 10.5px;
  color: var(--ink-3);
  font-family: var(--font-mono);
  padding: 1px 6px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 4px;
  letter-spacing: 0.02em;
}
.chat-process-card__toggle {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  background: transparent;
  border: 0;
  color: var(--ink-3);
  font-size: 11.5px;
  cursor: pointer;
  transition: color 160ms var(--ease);
}
.chat-process-card__toggle:hover { color: var(--accent); }
.chat-process-card__toggle svg { width: 12px; height: 12px; transition: transform 200ms var(--ease); }
.chat-process-card__toggle svg.is-up { transform: rotate(180deg); }

/* ============================================================
 * 输出结果：Markdown 富文本
 * ============================================================ */
.chat-md {
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px 18px 12px;
  align-self: stretch;
  max-width: 90%;
  margin: 4px 0 2px;
  animation: msgIn 360ms cubic-bezier(.4,0,.2,1) both;
}
.chat-md__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 12px;
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
}
.chat-md__head .chat-md__icon {
  width: 18px; height: 18px;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--accent);
  background: var(--accent-soft);
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
}
.chat-md__head .chat-md__icon svg { width: 11px; height: 11px; }
.chat-md__body { font-size: 12.5px; color: var(--ink-2); line-height: 1.7; }
.chat-md__h2 {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  margin: 14px 0 6px;
  letter-spacing: 0.01em;
}
.chat-md__h3 {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  margin: 12px 0 4px;
  letter-spacing: 0.01em;
}
.chat-md__p { margin: 4px 0; }
.chat-md__p strong { color: var(--ink); font-weight: 600; }
.chat-md__inline {
  font-family: var(--font-mono);
  font-size: 0.92em;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--accent);
}
.chat-md__code {
  font-family: var(--font-mono);
  font-size: 11.5px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 10px 12px;
  margin: 6px 0;
  overflow-x: auto;
  line-height: 1.55;
  color: var(--ink-2);
  white-space: pre;
  scrollbar-width: thin;
}
.chat-md__code code { font-family: inherit; }
.chat-md__ol, .chat-md__ul { margin: 4px 0 4px 22px; padding: 0; }
.chat-md__ol li, .chat-md__ul li { margin: 2px 0; line-height: 1.6; }
.chat-md__ol li::marker { color: var(--accent); font-weight: 600; }
.chat-md__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--line);
}
.chat-md__actions { display: flex; gap: 4px; }
.chat-md__act {
  width: 28px; height: 28px;
  display: inline-flex; align-items: center; justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--ink-3);
  cursor: pointer;
  transition: all 160ms var(--ease);
}
.chat-md__act:hover { color: var(--accent); background: var(--accent-soft); border-color: color-mix(in srgb, var(--accent) 30%, transparent); }
.chat-md__act svg { width: 14px; height: 14px; }
.chat-md__regen {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--ink-2);
  padding: 4px 10px;
  font-size: 11.5px;
  cursor: pointer;
  transition: all 160ms var(--ease);
}
.chat-md__regen:hover { color: var(--accent); border-color: var(--accent); }
.chat-md__regen svg { width: 12px; height: 12px; }

/* ---------- 输入框 ---------- */
.chat-input {
  /* 始终可见：禁止任何隐藏/显示控制 */
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px 28px;
  border-top: 1px solid var(--line);
  background: var(--surface);
  flex-shrink: 0;
  flex-grow: 0;
  flex-basis: auto;
  box-sizing: border-box;
  visibility: visible !important;
  position: relative;
  z-index: 5;
  box-shadow: 0 -1px 0 var(--line);
}
/* aside 打开时，form 宽度自适应，跟随对话区收缩 */
.chat-main.is-panel-open .chat-input {
  width: auto;
}
.chat-input__box {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px 14px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 14px;
  transition: border-color 160ms var(--ease), box-shadow 160ms var(--ease);
}
.chat-input__box:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.chat-input__box textarea {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  resize: none;
  min-height: 24px;
  max-height: 160px;
  font-size: 14px;
  color: var(--ink);
  line-height: 1.5;
  padding: 4px 0;
  font-family: inherit;
}
.chat-input__box textarea::placeholder { color: var(--ink-3); }
.chat-input__tools {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-bottom: 2px;
}
.chat-input__tools button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--ink-3);
  background: transparent;
  border: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 160ms var(--ease);
}
.chat-input__tools button:hover { color: var(--ink); background: var(--surface-3); }
.chat-input__tools svg { width: 18px; height: 18px; }
.chat-send {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff;
  border: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 160ms var(--ease), box-shadow 160ms var(--ease),
              opacity 160ms var(--ease), filter 160ms var(--ease);
  box-shadow: 0 4px 14px var(--accent-glow);
  flex-shrink: 0;
  position: relative;
}
.chat-send:hover:not(:disabled) { transform: scale(1.05); }
.chat-send:active:not(:disabled) { transform: scale(0.95); }
.chat-send:disabled,
.chat-send.is-disabled {
  cursor: not-allowed;
  background: var(--surface-3);
  color: var(--ink-3);
  box-shadow: none;
  filter: grayscale(0.4);
  opacity: 0.6;
}
/* 终止按钮：危险色，脉动提示 */
.chat-send--abort {
  background: linear-gradient(135deg, var(--danger), #fca5a5);
  animation: abortPulse 1.4s ease-in-out infinite;
}
.chat-send--abort::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 14px;
  border: 2px solid var(--danger);
  opacity: 0.4;
  animation: abortRipple 1.4s ease-out infinite;
}
@keyframes abortPulse {
  0%, 100% { box-shadow: 0 4px 14px rgba(248, 113, 113, 0.5); }
  50%      { box-shadow: 0 4px 22px rgba(248, 113, 113, 0.8); }
}
@keyframes abortRipple {
  0%   { transform: scale(0.9); opacity: 0.6; }
  100% { transform: scale(1.3); opacity: 0; }
}
.chat-send svg { width: 18px; height: 18px; }

/* ---------- 工具按钮（文件 / 语音）---------- */
.chat-input__tool {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--ink-3);
  background: transparent;
  border: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 160ms var(--ease);
}
.chat-input__tool:hover:not(:disabled) {
  color: var(--ink);
  background: var(--surface-3);
}
.chat-input__tool:disabled,
.chat-input__tool.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.chat-input__tool svg { width: 18px; height: 18px; }
.chat-input__tool.is-recording {
  color: var(--danger);
  background: rgba(248, 113, 113, 0.12);
}
.chat-input__rec-pulse {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: var(--danger);
  border-radius: 50%;
  animation: recPulse 1s ease-in-out infinite;
}
@keyframes recPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.4); opacity: 0.5; }
}
.chat-input__file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  clip: rect(0, 0, 0, 0);
}

/* ---------- 字段容器（用于浮层）---------- */
.chat-input__field {
  flex: 1;
  position: relative;
  min-width: 0;
  display: flex;
  align-items: center;
}

/* ---------- 录音中 / 处理中 浮层 ---------- */
.chat-input__rec-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
  font-size: 12.5px;
  color: var(--ink-2);
  background: linear-gradient(90deg, var(--surface-2), transparent);
  border-radius: 8px;
  pointer-events: auto;
  animation: fadeIn 200ms var(--ease);
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.chat-input__rec-dot {
  width: 8px;
  height: 8px;
  background: var(--danger);
  border-radius: 50%;
  flex-shrink: 0;
  animation: recPulse 1s ease-in-out infinite;
}
.chat-input__rec-dot.is-processing {
  background: var(--warn);
  animation: recPulse 0.6s ease-in-out infinite;
}
.chat-input__rec-cancel {
  margin-left: auto;
  padding: 2px 10px;
  font-size: 11px;
  color: var(--ink-2);
  background: var(--surface-3);
  border: 1px solid var(--line);
  border-radius: 999px;
  cursor: pointer;
  transition: all 160ms var(--ease);
}
.chat-input__rec-cancel:hover {
  color: var(--danger);
  border-color: var(--danger);
}

/* ---------- 焦点态容器 ---------- */
.chat-input__box.is-recording {
  border-color: rgba(248, 113, 113, 0.45);
  box-shadow: 0 0 0 4px rgba(248, 113, 113, 0.12);
}

/* ---------- 已上传文件预览列表 ---------- */
.chat-input__files {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}
.chat-input__file {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 8px 10px 8px 12px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  transition: border-color 200ms var(--ease), background 200ms var(--ease);
  animation: fileIn 220ms var(--ease) both;
}
@keyframes fileIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.chat-input__file.is-uploading { border-color: rgba(139, 92, 246, 0.35); }
.chat-input__file.is-done     { border-color: rgba(52, 211, 153, 0.35); background: linear-gradient(180deg, rgba(52, 211, 153, 0.06), var(--surface-2)); }
.chat-input__file.is-error    { border-color: rgba(248, 113, 113, 0.4); background: linear-gradient(180deg, rgba(248, 113, 113, 0.08), var(--surface-2)); }
.chat-input__file-icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-2);
  flex-shrink: 0;
}
.chat-input__file.is-uploading .chat-input__file-icon { color: var(--accent); }
.chat-input__file.is-done     .chat-input__file-icon { color: var(--ok); }
.chat-input__file.is-error    .chat-input__file-icon { color: var(--danger); }
.chat-input__file-icon svg { width: 16px; height: 16px; }
.chat-input__file-info { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.chat-input__file-name {
  font-size: 12.5px;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.chat-input__file-meta {
  font-size: 10.5px;
  color: var(--ink-3);
  font-family: var(--font-mono);
}
.chat-input__file.is-error .chat-input__file-meta { color: var(--danger); }
.chat-input__file-remove {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: transparent;
  border: 0;
  color: var(--ink-3);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 160ms var(--ease);
}
.chat-input__file-remove:hover { color: var(--danger); background: rgba(248, 113, 113, 0.1); }
.chat-input__file-remove svg { width: 12px; height: 12px; }
.chat-input__file-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--line);
  overflow: hidden;
}
.chat-input__file-bar > span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  transition: width 120ms linear;
}

/* ---------- 旋转动画 ---------- */
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ---------- 底部提示 ---------- */
.chat-input__hint {
  transition: color 200ms var(--ease);
}
.chat-input__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 4px;
  font-size: 10.5px;
  color: var(--ink-3);
  font-family: var(--font-mono);
}

/* ============================================================
 * 右：进程 / 文件 面板
 * ============================================================ */
.chat-panel {
  width: 380px;
  flex-shrink: 0;
  background: var(--surface);
  border-left: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  overflow: hidden;
}
.chat-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, transparent, var(--accent-glow), transparent);
  opacity: 0.5;
  pointer-events: none;
}

/* ---------- 面板头：tabs + 关闭 ---------- */
.chat-panel__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 10px 16px;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.chat-panel__tabs {
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
  position: relative;
}
.chat-panel__tab {
  position: relative;
  padding: 8px 14px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink-3);
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: color 160ms var(--ease);
  font-family: var(--font-body);
}
.chat-panel__tab:hover { color: var(--ink-2); }
.chat-panel__tab.is-active {
  color: var(--accent);
}
.chat-panel__tab.is-active::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: -1px;
  height: 1.5px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  border-radius: 1.5px;
}
.chat-panel__head .iconbtn { width: 26px; height: 26px; }
.chat-panel__head .iconbtn svg { width: 14px; height: 14px; }

/* ---------- 面板内容区 ---------- */
.chat-panel__body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* ============================================================
 * 当前进程：时间线步骤
 * ============================================================ */
.process-list {
  padding: 14px 12px 32px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.process-step {
  position: relative;
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 10px;
  padding-bottom: 16px;
  animation: stepIn 320ms var(--ease) both;
}
@keyframes stepIn {
  from { opacity: 0; transform: translateX(6px); }
  to   { opacity: 1; transform: none; }
}
.process-step:last-child { padding-bottom: 0; }

/* 左侧时间线（rail + dot）*/
.process-step__rail {
  position: relative;
  display: flex;
  justify-content: center;
  padding-top: 6px;
}
.process-step__rail::before {
  content: '';
  position: absolute;
  top: 18px;
  bottom: -16px;
  left: 50%;
  width: 1px;
  background: var(--line);
  transform: translateX(-50%);
}
.process-step:last-child .process-step__rail::before { display: none; }
.process-step__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ink-3);
  border: 2px solid var(--bg);
  z-index: 1;
  transition: all 220ms var(--ease);
}
.process-step.is-done .process-step__dot {
  background: var(--ok);
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.18);
}
.process-step.is-running .process-step__dot {
  background: var(--warn);
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.22);
  animation: pulse 1.4s ease-in-out infinite;
}
.process-step.is-error .process-step__dot {
  background: var(--danger);
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.22);
}
.process-step.is-pending .process-step__dot {
  background: var(--surface-3);
  border: 1.5px dashed var(--ink-3);
  width: 9px;
  height: 9px;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.22); }
  50%      { box-shadow: 0 0 0 7px rgba(251, 191, 36, 0.05); }
}

/* 步骤体 */
.process-step__body {
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 9px 11px 10px;
  font-size: 12px;
  transition: border-color 200ms var(--ease);
}
.process-step.is-running .process-step__body {
  border-color: rgba(251, 191, 36, 0.35);
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.04), var(--surface-2));
}
.process-step.is-done .process-step__body {
  border-color: rgba(52, 211, 153, 0.22);
}
.process-step.is-pending .process-step__body {
  opacity: 0.7;
}
.process-step__head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  flex-wrap: wrap;
}
.process-step__type {
  font-size: 9.5px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
  border: 1px solid currentColor;
  background: transparent;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.process-step__time {
  color: var(--ink-3);
  font-size: 10.5px;
}
.process-step__status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  margin-left: auto;
  font-weight: 500;
}
.process-step__status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
.process-step__title {
  font-size: 12.5px;
  color: var(--ink);
  font-weight: 500;
  margin-bottom: 4px;
  line-height: 1.5;
}
.process-step__path {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--ink-3);
  padding: 4px 7px;
  background: rgba(0, 0, 0, 0.18);
  border-radius: 4px;
  margin-bottom: 4px;
  word-break: break-all;
}
.process-step__path svg { width: 11px; height: 11px; flex-shrink: 0; }
.process-step__detail {
  font-size: 11.5px;
  color: var(--ink-2);
  line-height: 1.55;
  font-family: var(--font-mono);
}
.process-step__output {
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.55;
  color: #cbe7c2;
  background: #0a0c14;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 9px 11px;
  margin: 6px 0 0;
  white-space: pre-wrap;
  word-break: break-all;
  position: relative;
  overflow: hidden;
}
.process-step__output .caret {
  display: inline-block;
  width: 6px;
  height: 12px;
  background: var(--accent);
  margin-left: 2px;
  vertical-align: middle;
  animation: blink 1s steps(2) infinite;
}
@keyframes blink {
  0%, 50%   { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* ============================================================
 * 文件面板：文件树 + 预览
 * ============================================================ */
.chat-panel__files {
  display: grid;
  grid-template-rows: minmax(0, 45%) minmax(0, 1fr);
  height: 100%;
  min-height: 0;
}
.files-tree {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--line);
  background: var(--surface-2);
  min-height: 0;
}
.files-tree__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 6px;
  flex-shrink: 0;
  gap: 6px;
}
.files-tree__head-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.files-tree__reopen {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  background: var(--accent-soft);
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  border-radius: 6px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 160ms var(--ease);
  animation: msgIn 240ms cubic-bezier(.4,0,.2,1) both;
}
.files-tree__reopen:hover {
  background: color-mix(in srgb, var(--accent) 18%, var(--accent-soft));
  border-color: var(--accent);
}
.files-tree__reopen svg { width: 12px; height: 12px; flex-shrink: 0; }
.files-tree__title {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-3);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.files-tree__search {
  margin: 0 10px 8px;
  padding: 6px 10px;
  font-size: 12px;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 6px;
  outline: none;
  font-family: var(--font-mono);
  transition: border-color 160ms var(--ease);
  flex-shrink: 0;
}
.files-tree__search::placeholder { color: var(--ink-3); }
.files-tree__search:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.files-tree__body {
  flex: 1;
  overflow-y: auto;
  padding: 0 6px 12px;
  min-height: 0;
}
.tree { list-style: none; margin: 0; padding: 0; }

/* 文件预览 */
.files-preview {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  /* 进入 / 离开过渡由 preview-slide-* class 控制 */
  will-change: transform, opacity;
}
.files-preview__head {
  padding: 10px 14px 8px;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
  flex-shrink: 0;
}
.files-preview__crumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ink);
  font-weight: 500;
  margin-bottom: 3px;
  min-width: 0;
}
.files-preview__crumb-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--ink);
}
.files-preview__crumb-ext {
  color: var(--ink-3);
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 400;
}
.files-preview__crumb .iconbtn { margin-left: auto; }
.files-preview__meta {
  font-size: 10.5px;
  color: var(--ink-3);
  font-family: var(--font-mono);
  word-break: break-all;
  line-height: 1.5;
}
.files-preview__body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px 16px;
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%);
}
.files-preview__p {
  font-size: 12.5px;
  line-height: 1.85;
  color: var(--ink-2);
  margin: 0 0 10px;
  text-indent: 2em;
  text-align: justify;
}
.files-preview__p:last-child { margin-bottom: 0; }
.files-preview__loading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--ink-2);
  padding: 20px 4px;
}
.files-preview__spinner {
  width: 14px; height: 14px;
  flex-shrink: 0;
  border: 2px solid var(--line);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 720ms linear infinite;
}
.files-preview__empty {
  text-align: center;
  font-size: 12px;
  color: var(--ink-3);
  padding: 30px 10px;
}
.files-preview__foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-top: 1px solid var(--line);
  font-size: 10.5px;
  color: var(--ink-3);
  font-family: var(--font-mono);
  background: var(--surface);
  flex-shrink: 0;
}

/* ============================================================
 * 文件预览开关过渡
 *   进入：上滑 + 淡入
 *   离开：下滑 + 淡出
 *   files-tree 在关闭态时占满空间
 * ============================================================ */
.preview-slide-enter-active,
.preview-slide-leave-active {
  transition: opacity 220ms var(--ease), transform 240ms var(--ease);
  overflow: hidden;
}
.preview-slide-enter-from {
  opacity: 0;
  transform: translateY(8px) scaleY(0.98);
  transform-origin: top center;
}
.preview-slide-enter-to,
.preview-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scaleY(1);
}
.preview-slide-leave-to {
  opacity: 0;
  transform: translateY(6px) scaleY(0.98);
  transform-origin: top center;
}

/* 关闭态：files-tree 占据整个高度，文件预览完全隐藏 */
.chat-panel__files.is-preview-closed {
  grid-template-rows: minmax(0, 1fr);
}
.chat-panel__files.is-preview-closed .files-tree {
  border-bottom: 0;
}

/* ============================================================
 * 通用：iconbtn / panel 滑动
 * ============================================================ */
.iconbtn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--ink-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 160ms var(--ease);
  flex-shrink: 0;
}
.iconbtn:hover { color: var(--ink); border-color: var(--line-2); }
.iconbtn svg { width: 16px; height: 16px; }
.iconbtn--xs { width: 22px; height: 22px; border-radius: 5px; }
.iconbtn--xs svg { width: 12px; height: 12px; }
.iconbtn--accent {
  color: var(--accent);
  border-color: var(--accent-soft);
  background: var(--accent-soft);
}
.iconbtn--accent:hover {
  color: #fff;
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 280ms var(--ease), opacity 220ms var(--ease);
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* ============================================================
 * 打字 dots（注入到 .chat-bubble 内）
 * ============================================================ */
:deep(.typing-dots) {
  display: inline-flex;
  gap: 3px;
  margin-left: 6px;
  vertical-align: middle;
}
:deep(.typing-dots i) {
  width: 5px;
  height: 5px;
  background: var(--accent);
  border-radius: 50%;
  animation: typing 1.2s ease-in-out infinite;
  display: inline-block;
}
:deep(.typing-dots i:nth-child(2)) { animation-delay: 0.15s; }
:deep(.typing-dots i:nth-child(3)) { animation-delay: 0.3s; }
@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
  30% { opacity: 1; transform: scale(1.2); }
}

/* ============================================================
 * 响应式
 * ============================================================ */
/* 中等屏幕：进程面板变窄 */
@media (max-width: 1280px) {
  .chat-panel { width: 340px; }
}
/* 小屏：进程面板变底部抽屉 */
@media (max-width: 1024px) {
  .chat-overlay { grid-template-columns: 240px 1fr; }
  .chat-main { flex-direction: column; }
  .chat-panel {
    width: 100%;
    border-left: 0;
    border-top: 1px solid var(--line);
    max-height: 45%;
  }
  .chat-panel::before {
    top: 0; left: 0; right: 0; bottom: auto;
    width: auto; height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-glow), transparent);
  }
  .chat-input { padding: 14px 18px; }
  .chat-main__head { padding: 12px 18px; }
  .chat-stream { padding: 18px; }
}
/* 移动端：隐藏历史侧栏，进程面板全宽 */
@media (max-width: 900px) {
  .chat-overlay { grid-template-columns: 1fr; }
  .chat-sidebar { display: none; }
  .chat-main__actions .btn span { display: none; }
}
@media (max-width: 640px) {
  .chat-panel__head { padding: 8px 10px; }
  .chat-panel__tab { padding: 8px 10px; font-size: 12px; }
  .files-tree { max-height: 38%; }
  .chat-msg { max-width: 90%; }
  .chat-input { padding: 12px 14px; }
  .chat-input__box { padding: 10px 12px; border-radius: 12px; }
  .chat-input__box textarea { font-size: 13px; }
  .chat-input__tool { width: 28px; height: 28px; }
  .chat-input__tool svg { width: 16px; height: 16px; }
  .chat-send { width: 32px; height: 32px; }
  .chat-input__foot { font-size: 10px; flex-wrap: wrap; gap: 4px; }
  .chat-input__file { padding: 6px 8px 6px 10px; }
  .chat-input__file-name { font-size: 11.5px; }
  .chat-input__file-meta { font-size: 10px; }
  .chat-input__rec-overlay { font-size: 11.5px; }
}
</style>
