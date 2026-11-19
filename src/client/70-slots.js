/* ── deployment defaults (shared, fetched once) ─────────────────────────── */

let deploymentPromise = null
const deploymentCache = { value: null }

/** @returns {Promise<object|null>} the Host row config, if this profile exposes it. */
function loadDeployment() {
  if (!deploymentPromise) {
    deploymentPromise = window
      .fetch(CONFIG_ROUTE, { credentials: 'include' })
      .then(response => (response.ok ? response.json() : null))
      .then(data => {
        if (data !== null && typeof data === 'object') deploymentCache.value = data
        return deploymentCache.value
      })
      .catch(() => null)
  }
  return deploymentPromise
}

/* ── locale ─────────────────────────────────────────────────────────────── */

const EN = {
  open: 'Panorama',
  openHint: 'Open Panorama mode (S for settings, Esc to exit)',
  stageLabel: 'Panorama mode',
  settings: 'Panorama settings',
  close: 'Close Panorama',
  done: 'Done',
  idleTitleA: 'Ready for the',
  idleTitleB: 'next brief.',
  idleBody: 'The stage mirrors this conversation live: steps, tool calls, tokens and the reply as it is written.',
  capPrompts: 'Turns',
  capTools: 'Tools',
  capTasks: 'Tasks',
  capTasksEmpty: 'no todo list',
  capTokens: 'Tokens',
  connected: 'observed',
  statusWaiting: 'Waiting for you',
  statusIdle: 'Standing by',
  statusWorking: 'Working',
  statusThinking: 'Thinking',
  statusDone: 'Delivered',
  statusError: 'Interrupted',
  idleSpeech: 'Send a brief — the stage follows along.',
  panelActive: 'Active task',
  panelInbox: 'Session',
  metaRunning: 'live run',
  metaLastTurn: 'last turn',
  metaWaiting: 'waiting for a prompt',
  tagReasoning: 'Reasoning',
  tagDelivered: 'Delivered',
  untitled: 'Untitled session',
  stepsEmptyA: 'No tool call in this turn yet.',
  stepsEmptyB: 'Reasoning is streaming into the panel.',
  drafting: 'drafting',
  delivered: 'delivered',
  previewEmpty: 'Waiting for the first token…',
  stepsWord: ' steps',
  running: 'running',
  replyReady: 'Reply ready',
  recent: 'Recent replies',
  today: 'today',
  recentEmpty: 'Nothing delivered in this window yet.',
  stream: 'Session stream',
  streamEmpty: 'No activity yet',
  statTurns: 'Turns',
  statTokens: 'Tokens',
  statCache: 'Cache hit',
  accentAuto: 'Auto',
  accentAutoHint: 'Ice: idle · Aurora: thinking · Ember: working/waiting/error · Mint: completed',
  accent: 'Accent',
  brandName: 'Brand name',
  callsign: 'Callsign',
  tagline: 'Tagline',
  unit: 'Unit',
  motion: 'Motion',
  density: 'Orb density',
  showStream: 'Footer stream',
  showStats: 'Token telemetry',
  showRecent: 'Recent replies',
  reset: 'Reset to defaults',
}

const ZH = {
  open: '全景模式',
  openHint: '打开全景模式（S 设置，Esc 退出）',
  stageLabel: '全景模式',
  settings: '全景模式设置',
  close: '退出全景模式',
  done: '完成',
  idleTitleA: '随时准备',
  idleTitleB: '接下一份任务。',
  idleBody: '舞台实时映射这段对话：步骤、工具调用、token 与正在写出的回复。',
  capPrompts: '轮次',
  capTools: '工具',
  capTasks: '任务',
  capTasksEmpty: '暂无待办清单',
  capTokens: 'Token',
  connected: '观测中',
  statusWaiting: '等待你的确认',
  statusIdle: '待命中',
  statusWorking: '执行中',
  statusThinking: '思考中',
  statusDone: '已交付',
  statusError: '已中断',
  idleSpeech: '发一条任务，舞台会一路跟随。',
  panelActive: '进行中的任务',
  panelInbox: '会话',
  metaRunning: '实时运行',
  metaLastTurn: '最近一轮',
  metaWaiting: '等待新任务',
  tagReasoning: '推理中',
  tagDelivered: '已交付',
  untitled: '未命名会话',
  stepsEmptyA: '本轮还没有工具调用。',
  stepsEmptyB: '推理内容正在流入面板。',
  drafting: '草稿中',
  delivered: '已交付',
  previewEmpty: '等待第一个 token…',
  stepsWord: ' 步',
  running: '进行中',
  replyReady: '回复已就绪',
  recent: '最近回复',
  today: '今日',
  recentEmpty: '当前窗口内还没有完成回复。',
  stream: '会话流',
  streamEmpty: '暂无活动',
  statTurns: '轮次',
  statTokens: 'Token',
  statCache: '缓存命中',
  accentAuto: '自动',
  accentAutoHint: '冰蓝待命 · 紫蓝思考 · 暖橙执行/等待/失败 · 薄荷绿完成',
  accent: '主色',
  brandName: '品牌名称',
  callsign: '代号',
  tagline: '副标题',
  unit: '单元',
  motion: '动效',
  density: '光球密度',
  showStream: '底部会话流',
  showStats: 'Token 遥测',
  showRecent: '最近回复',
  reset: '恢复默认',
}

/* ── Session-scoped feed: snapshot → store ──────────────────────────────── */

function StageFeed(props) {
  const { sessionId } = props
  const session = props.useSession ? props.useSession(snapshot => snapshot) : null
  /* The chat snapshot is its own standard hook on this slot; SessionSnapshot
     carries lifecycle state only and has no `chat` field. */
  const chat = props.useChat ? props.useChat(snapshot => snapshot) : null
  const todos = props.useProjection ? props.useProjection('todos') : null
  const usage = props.useProjection ? props.useProjection('tokenUsage') : null
  const stats = props.useProjection ? props.useProjection('sessionStats') : null
  const status = props.useSessionStatus ? props.useSessionStatus(map => map.get(sessionId)) : null
  const summary = props.useSessions ? props.useSessions(list => (list && list.byId ? list.byId[sessionId] : undefined)) : null
  const publisher = useRef(null)
  if (publisher.current === null) publisher.current = createPublisher()
  const latest = useRef(null)
  latest.current = { session, chat, todos, usage, stats, summary, status }

  const derive = useCallback(() => {
    const source = latest.current
    if (!source || !source.session) return null
    return buildModel({
      sessionId,
      running: source.session.running === true,
      pendingCount: Array.isArray(source.session.pendingSubmissions) ? source.session.pendingSubmissions.length : 0,
      chat: source.chat,
      todos: source.todos,
      usage: source.usage,
      stats: source.stats,
      summary: source.summary,
      pendingInteraction: source.status?.pendingInteraction,
    })
  }, [sessionId])

  useEffect(() => {
    const next = derive()
    if (next) publisher.current.push(next)
  }, [derive, session, chat, todos, usage, stats, summary, status])

  /* Elapsed time keeps counting while a tool runs without producing events. */
  useEffect(() => {
    if (!session || session.running !== true) return undefined
    const timer = window.setInterval(() => {
      const next = derive()
      if (next) publisher.current.push(next)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [derive, session])

  useEffect(() => {
    loadDeployment()
    store.set({ sessionId })
    return () => {
      publisher.current.dispose()
      const current = store.get()
      if (current.sessionId === sessionId) store.set({ open: false, sessionId: null, model: null })
    }
  }, [sessionId])

  return null
}

/* ── header toggle ──────────────────────────────────────────────────────── */

function StageToggle(props) {
  const { sessionId } = props
  const t = asT(props.t)
  const running = props.useSession ? props.useSession(snapshot => snapshot.running) : false
  const open = React.useSyncExternalStore(store.subscribe, () => store.get().open, () => store.get().open)
  const label = t('open')

  const onClick = useCallback(() => {
    store.set({ open: true, sessionId })
  }, [sessionId])

  return h(
    'button',
    {
      type: 'button',
      className: 'dvs-open' + (running ? ' is-running' : '') + (open ? ' is-open' : ''),
      onClick,
      title: t('openHint'),
      'aria-label': t('openHint'),
      'aria-pressed': open ? 'true' : 'false',
    },
    h('span', { className: 'dvs-open-orb' }, IconOrb(13)),
    h('span', { className: 'dvs-open-label' }, label),
    h('i', { className: 'dvs-open-dot', 'aria-hidden': 'true' }),
  )
}

/* ── root-scoped overlay ───────────────────────────────────────────────── */

function StageOverlay(props) {
  const t = asT(props.t)
  const open = React.useSyncExternalStore(store.subscribe, () => store.get().open, () => store.get().open)
  if (!open) return null
  const close = () => {
    store.set({ open: false })
  }
  return h(StageBoundary, { t, onClose: close }, h(StageShell, { t, onClose: close }))
}

/* ── client plugin ──────────────────────────────────────────────────────── */

const CLIENT_CSS = `
.dvs-open{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 9px 0 8px;border-radius:7px;
  border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);
  font:inherit;font-size:11px;line-height:1;cursor:pointer;white-space:nowrap;
  transition:background .18s ease,color .18s ease,border-color .18s ease}
.dvs-open:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}
.dvs-open:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dvs-open-orb{display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-brand-primary);flex:none}
.dvs-open-label{max-width:12ch;overflow:hidden;text-overflow:ellipsis}
.dvs-open-dot{width:5px;height:5px;border-radius:50%;flex:none;background:var(--dsw-alias-state-success-primary);opacity:.85}
.dvs-open.is-running .dvs-open-dot{background:var(--dsw-alias-brand-primary);animation:dvs-open-pulse 1.4s ease-in-out infinite}
.dvs-open.is-open{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary)}
@keyframes dvs-open-pulse{50%{opacity:.25}}
@media (max-width:900px){.dvs-open-label{display:none}}
`

function apply(ctx) {
  ctx.effect(() => {
    const style = document.createElement('style')
    style.id = 'dsh-panorama-mode-style'
    style.textContent = CSS + CLIENT_CSS
    document.head.appendChild(style)
    return () => style.remove()
  }, 'panorama-mode: stylesheet')

  ctx.locale.register('avaStage', { en: EN, zh: ZH })

  ctx.slots.inject('conversation.session.header.utilities', () =>
    ctx.slots.register(
      {
        name: 'conversation.session.header.utilities',
        id: 'panorama-mode.toggle',
        order: 92,
        locale: 'avaStage',
      },
      StageToggle,
    ),
  )

  /* The feed renders nothing; it exists so a Session-scoped component can
     observe the snapshot and publish it to the root-scoped overlay. */
  ctx.slots.inject('conversation.session.header.utilities', () =>
    ctx.slots.register(
      {
        name: 'conversation.session.header.utilities',
        id: 'panorama-mode.feed',
        order: 93,
        locale: 'avaStage',
      },
      StageFeed,
    ),
  )

  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register(
      {
        name: 'shell.overlay',
        id: 'panorama-mode.overlay',
        order: 900,
        locale: 'avaStage',
      },
      StageOverlay,
    ),
  )
}

/* Local test hook used by scripts/test-model.mjs; inert at runtime. */
if (typeof window !== 'undefined' && window.__AVA_STAGE_TEST__ === true) {
  window.__AVA_STAGE_TEST_API = {
    buildModel,
    EMPTY_MODEL,
    store,
    resolveSettings,
    paletteFor,
    PALETTES,
    briefOf,
    fmtDuration,
    fmtTokens,
    StageHeader,
    StageIdentity,
    StageOrbColumn,
    StageCaps,
    StageIdleCard,
    StageTaskCard,
    StageStepRow,
    StagePreview,
    StageLog,
    StageDelivered,
    StageRecent,
    StageStream,
    StageStats,
    StageProgress,
    StageSettings,
    StageFeed,
    StageShell,
    StageOverlay,
  }
}

return { name: 'dsh-panorama-mode-client', inject: ['slots', 'locale'], apply }
