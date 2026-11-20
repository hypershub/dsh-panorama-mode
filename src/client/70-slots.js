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

const WINDOW_INTENT_ROUTE = '/api/panoramaMode/windowIntent'
const WINDOW_STATE_ROUTE = '/api/panoramaMode/state'
const MENU_WIDTH = 236

/* ── locale ─────────────────────────────────────────────────────────────── */

const EN = {
  open: 'Panorama',
  openHint: 'Open Panorama mode — this window or a separate browser window',
  openHere: 'Open in this window',
  openHereHint: 'Covers this window; the lightest option.',
  openBrowser: 'Open in a browser window',
  openBrowserHint: 'Separate window; keep several, on any display.',
  browserAccessHint: 'Needs Settings → Browser and local network → Allow opening this Profile in a browser (compatibility mode).',
  addressHint: 'This Host exposes no browser address right now.',
  browserAccessDisabled: 'Browser access is off. In Settings, turn on "Allow opening this Profile in a browser" (compatibility mode), then retry. / 需要在设置中开启「允许在浏览器中打开」（兼容模式）。',
  claimMiss: 'This window could not claim its Session. Showing the current conversation; use the header to switch.',
  selectMiss: 'The requested conversation could not be selected; showing the current one.',
  popupBlocked: 'The browser blocked the window. Allow pop-ups and retry.',
  browserOpenFailed: 'Could not open the browser window.',
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
  presentedFile:'Presented file', fileCount:'files',
  resourceCount:'references',
  viewResult:'View result', resultReader:'Result',closeResult:'Close result',copyResult:'Copy Markdown',copied:'Copied',copyError:'Copy unavailable',
  fileUnavailable:'The native file opener is not mounted. Return to Chat and open this reference there.',
  fileReference:'File reference in reply',resultReferenceHint:'References do not prove files were generated or uploaded.',mediaError:'Media could not be loaded.',
  recent: 'Recent results',
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
  openHint: '打开全景模式：在当前窗口或独立浏览器窗口',
  openHere: '在当前窗口打开',
  openHereHint: '覆盖当前窗口，最轻。',
  openBrowser: '在浏览器中打开',
  openBrowserHint: '独立窗口，可多开、可拖到其他显示器。',
  browserAccessHint: '需在「设置 → 浏览器与局域网 → 允许在浏览器中打开」开启，并切换为兼容模式。',
  addressHint: '当前 Host 没有可用的浏览器地址。',
  browserAccessDisabled: '浏览器访问未开启：请到「设置 → 浏览器与局域网 → 允许在浏览器中打开」开启，并切换为兼容模式后重试。',
  claimMiss: '这个窗口没有认领到目标会话，先显示当前会话；可用头部切换。',
  selectMiss: '未能切换到目标会话，先显示当前会话。',
  popupBlocked: '浏览器拦截了弹窗，请允许后重试。',
  browserOpenFailed: '无法打开浏览器窗口。',
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
  presentedFile:'正式交付文件', fileCount:'个文件',
  resourceCount:'个引用',
  viewResult:'查看结果', resultReader:'输出结果',closeResult:'关闭结果',copyResult:'复制 Markdown',copied:'已复制',copyError:'无法复制，请检查剪贴板权限',
  fileUnavailable:'原生文件打开入口尚未挂载，请返回对话中打开该文件引用。',
  fileReference:'回复中的文件引用',resultReferenceHint:'文件引用不代表文件已生成或上传。',mediaError:'媒体加载失败。',
  recent: '最近结果',
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

/** Drop one Session's published model without closing the stage. */
function releaseFeed(target, sessionId) {
  const current = target.get()
  if (current.sessionId !== sessionId) return false
  target.set({ sessionId: null, model: null })
  return true
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
      /* Switching Sessions unmounts this feed, and the stage must survive it:
         a window that claims a Session necessarily switches to it. */
      releaseFeed(store, sessionId)
    }
  }, [sessionId])

  return null
}

/* ── header toggle ──────────────────────────────────────────────────────── */

/** Placement for the portal menu, clamped to the viewport. */
function menuPlacement(rect, viewportWidth, width = MENU_WIDTH, margin = 8) {
  const left = Math.max(margin, Math.min(Math.round(rect.right - width), viewportWidth - width - margin))
  return { top: Math.round(rect.bottom + 6), left }
}

/* Opens a second window and reports whether the attempt should be shown as a
   failure. The native shell denies popups and hands http(s) addresses to the
   system browser, so a null handle is success there. */
function openAddress(url, t, setNote, closeMenu) {
  // No `noopener` feature: it makes window.open return null, which would be
  // indistinguishable from a blocked popup. Detach the opener instead.
  const opened = window.open(url, '_blank')
  if (opened === null) {
    if (window.dshDesktop || window.dshDesktopActions) closeMenu()
    else setNote(t('popupBlocked'))
    return true
  }
  try {
    opened.opener = null
  } catch {
    /* A cross-origin handle cannot be touched; the window still opened. */
  }
  closeMenu()
  return true
}

/** Why the browser item cannot work here, or null when it can. */
function browserBlockedReason(state, t) {
  if (state === null || state === undefined) return null
  if (state.browserAccess === 'disabled') return t('browserAccessHint')
  if (state.address === false) return t('addressHint')
  return null
}

function StageToggle(props) {
  const { sessionId } = props
  const t = asT(props.t)
  const running = props.useSession ? props.useSession(snapshot => snapshot.running) : false
  const open = React.useSyncExternalStore(store.subscribe, () => store.get().open, () => store.get().open)
  const [menu, setMenu] = useState(null)
  const [note, setNote] = useState('')
  const [capability, setCapability] = useState(null)
  const buttonRef = useRef(null)
  const wrapRef = useRef(null)

  const closeMenu = useCallback(() => {
    setMenu(null)
    setNote('')
  }, [])

  useEffect(() => {
    if (menu === null) return undefined
    const onPointerDown = event => {
      const target = event.target
      if (wrapRef.current?.contains(target)) return
      if (target instanceof Element && target.closest('.dvs-open-menu') !== null) return
      closeMenu()
    }
    const onKeyDown = event => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      closeMenu()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [menu, closeMenu])

  const toggleMenu = useCallback(() => {
    if (menu !== null) {
      closeMenu()
      return
    }
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    setNote('')
    setCapability(null)
    setMenu(menuPlacement(rect, window.innerWidth))
    /* Ask before the item is used, so the requirement is visible up front. */
    window
      .fetch(WINDOW_STATE_ROUTE, { credentials: 'include' })
      .then(response => (response.ok ? response.json() : null))
      .then(payload => {
        if (payload !== null && typeof payload === 'object') setCapability(payload)
      })
      .catch(() => {
        /* No route: the item still tries, and reports its own failure. */
      })
  }, [menu, closeMenu])

  /* The in-window mode is unchanged: the stage covers this window's viewport. */
  const openHere = useCallback(() => {
    closeMenu()
    store.set({ open: true, sessionId })
  }, [closeMenu, sessionId])

  /* A second window is a real browser window: the Host mints its authenticated
     address, and this desktop hands that address to the system browser. */
  const openInBrowser = useCallback(async () => {
    setNote('')
    const blocked = browserBlockedReason(capability, t)
    if (blocked !== null) {
      setNote(blocked)
      return
    }
    try {
      const response = await window.fetch(WINDOW_INTENT_ROUTE, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId ?? null }),
      })
      if (response.status === 409) {
        /* Desktop blocks ordinary browsers outside compatibility mode. */
        setNote(t('browserAccessDisabled'))
        return
      }
      if (!response.ok) {
        setNote(t('browserOpenFailed') + ' · HTTP ' + response.status)
        return
      }
      const payload = await response.json()
      if (typeof payload?.url !== 'string') {
        /* No minted address (headless Host or no listener): a browser that has
           already used this GUI keeps its cookie, so this origin may still work. */
        if (payload?.error === 'address-unavailable' && openAddress(location.origin + '/', t, setNote, closeMenu)) return
        setNote(t('browserOpenFailed') + ' · ' + (payload?.error ?? 'no-address'))
        return
      }
      openAddress(payload.url, t, setNote, closeMenu)
    } catch (error) {
      setNote(t('browserOpenFailed') + ' · ' + (error instanceof Error ? error.message : 'error'))
    }
  }, [sessionId, t, closeMenu, capability])

  const item = (label, hint, onClick, blocked = null) =>
    h(
      'button',
      {
        type: 'button',
        role: 'menuitem',
        className: 'dvs-open-item' + (blocked === null ? '' : ' is-blocked'),
        onClick,
        title: blocked ?? undefined,
      },
      h('b', null, label, blocked === null ? null : h('i', { className: 'dvs-open-warn', 'aria-hidden': 'true' })),
      h('small', null, blocked ?? hint),
    )

  return h(
    'div',
    { className: 'dvs-open-wrap', ref: wrapRef },
    h(
      'button',
      {
        type: 'button',
        ref: buttonRef,
        className: 'dvs-open' + (running ? ' is-running' : '') + (open ? ' is-open' : ''),
        onClick: toggleMenu,
        title: t('openHint'),
        'aria-label': t('openHint'),
        'aria-haspopup': 'menu',
        'aria-expanded': menu === null ? 'false' : 'true',
      },
      h('span', { className: 'dvs-open-orb' }, IconOrb(13)),
      h('span', { className: 'dvs-open-label' }, t('open')),
      h('i', { className: 'dvs-open-dot', 'aria-hidden': 'true' }),
      h('span', { className: 'dvs-open-caret', 'aria-hidden': 'true' }, '▾'),
    ),
    menu === null
      ? null
      : createPortal(
          h(
            'div',
            {
              className: 'dvs-open-menu',
              role: 'menu',
              'aria-label': t('open'),
              style: { top: menu.top + 'px', left: menu.left + 'px' },
            },
            item(t('openHere'), t('openHereHint'), openHere),
            item(t('openBrowser'), t('openBrowserHint'), openInBrowser, browserBlockedReason(capability, t)),
            note === '' ? null : h('div', { className: 'dvs-open-note', role: 'alert' }, note),
          ),
          document.body,
        ),
  )
}

/** @returns {string | null} the window id the opener put in the URL fragment. */
function windowIntentId() {
  const marker = 'panorama-window='
  const hash = typeof window.location?.hash === 'string' ? window.location.hash.replace(/^#/, '') : ''
  if (!hash.startsWith(marker)) return null
  const id = hash.slice(marker.length)
  return id.length > 0 ? id : null
}

/** The key the workspace service persists the current selection under. */
const CURRENT_SESSION_KEY = 'dsh.sessions.current'

/** @returns {string | null} the selection another window may have persisted. */
function persistedSessionId() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CURRENT_SESSION_KEY) ?? 'null')
    return parsed !== null && typeof parsed === 'object' && typeof parsed.sessionId === 'string' ? parsed.sessionId : null
  } catch {
    return null
  }
}

/**
 * Select a Session in a freshly opened window and keep trying until it sticks.
 *
 * A new window restores the *shared* persisted selection first, and the Session
 * list is still loading when the intent arrives, so one immediate call can be
 * dropped. This retries until the persisted selection is the requested one.
 *
 * @param {string} sessionId - Session the opener asked for.
 * @param {object} io - injected dependencies.
 * @param {() => boolean} io.select - attempt one selection; false while unavailable.
 * @param {() => string | null} io.current - read the current selection.
 * @param {(callback: () => void, ms: number) => unknown} io.later - scheduling seam.
 * @param {number} [io.attempts] - maximum attempts.
 * @returns {Promise<boolean>} whether the requested Session became current.
 */
function claimSession(sessionId, io) {
  const attempts = io.attempts ?? 40
  return new Promise(resolve => {
    let left = attempts
    const step = () => {
      left -= 1
      let selected = false
      try {
        selected = io.select() === true
      } catch {
        selected = false
      }
      if (selected && io.current() === sessionId) {
        resolve(true)
        return
      }
      if (left <= 0) {
        resolve(false)
        return
      }
      io.later(step, selected ? 150 : 250)
    }
    step()
  })
}

/* ── root-scoped overlay ───────────────────────────────────────────────── */

function StageOverlay(props) {
  const t = asT(props.t)
  const selectSession = props.selectSession
  const open = React.useSyncExternalStore(store.subscribe, () => store.get().open, () => store.get().open)
  const claimed = useRef(false)

  /* A freshly opened browser window claims the Session the opener recorded.
     The token redirect cannot carry a query, so the opener addresses the window
     through the inherited fragment instead. A page without that marker (the
     main window, or an ordinary tab) claims nothing and never steals an intent. */
  useEffect(() => {
    if (claimed.current) return undefined
    claimed.current = true
    const id = windowIntentId()
    if (id === null) return undefined
    let alive = true
    const ask = attempt =>
      window
        .fetch(WINDOW_INTENT_ROUTE + '?id=' + encodeURIComponent(id), { credentials: 'include' })
        .then(response => (response.ok ? response.json() : null))
        .then(async payload => {
          const sessionId = payload?.sessionId
          /* A claim is single use, so a retry only helps before the first answer;
             later attempts resolve to null and are not repeated. */
          if (!alive || typeof sessionId !== 'string') {
            if (attempt === 0) window.setTimeout(() => { if (alive) void ask(1) }, 800)
            else if (alive) store.set({ notice: 'claim-miss' })
            return
          }
        /* Show the stage first so the window is never blank, then make the
           requested Session current; a dropped early attempt is retried. */
        store.set({ open: true, sessionId })
          if (typeof selectSession !== 'function') return
          const selected = await claimSession(sessionId, {
            select: () => selectSession(sessionId),
            current: persistedSessionId,
            later: (callback, ms) => window.setTimeout(callback, ms),
          })
          if (alive && !selected) store.set({ notice: 'select-miss' })
        })
    void ask(0)
      .catch(() => {
        /* No pending intent, or no route: the window opens as an ordinary one. */
      })
    return () => {
      alive = false
    }
  }, [selectSession])

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
.dvs-open-wrap{display:inline-flex;position:relative}
.dvs-open-caret{margin-left:1px;font-size:9px;opacity:.6;line-height:1}
.dvs-open-menu{position:fixed;z-index:2147483000;width:236px;padding:6px;border-radius:10px;display:flex;flex-direction:column;gap:2px;
  border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-overlay);
  box-shadow:0 18px 40px -18px rgba(0,0,0,.65)}
.dvs-open-item{display:flex;flex-direction:column;gap:3px;align-items:flex-start;padding:8px 10px;border:0;border-radius:7px;
  background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:1.35;cursor:pointer;text-align:left}
.dvs-open-item:hover{background:var(--dsw-alias-bg-layer-2)}
.dvs-open-item:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.dvs-open-item b{font-weight:500}
.dvs-open-item small{font-size:11px;color:var(--dsw-alias-label-secondary)}
.dvs-open-note{padding:6px 10px 2px;font-size:11px;color:var(--dsw-alias-state-error-primary)}
.dvs-open-item.is-blocked small{color:var(--dsw-alias-state-warn-primary)}
.dvs-open-warn{display:inline-block;width:5px;height:5px;margin-left:6px;border-radius:50%;
  background:var(--dsw-alias-state-warn-primary);vertical-align:middle}
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

  ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
    name:'conversation.chat.turnTail',id:'panorama-mode.file-opener',locale:'avaStage',
  },ResultFileBridge))

  /* A browser window opened for Panorama claims its Session through the public
     workspace service; a missing service leaves the ordinary window. */
  const selectSession = sessionId => {
    try {
      const workspace = ctx.get('uiWorkspace')
      if (workspace?.openSession === undefined) return false
      workspace.openSession(sessionId)
      return true
    } catch {
      /* Selection failure must not break the stage; the caller retries. */
      return false
    }
  }
  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register(
      {
        name: 'shell.overlay',
        id: 'panorama-mode.overlay',
        order: 900,
        locale: 'avaStage',
      },
      props => h(StageOverlay, { ...props, selectSession }),
    ),
  )
}

/* Local test hook used by scripts/test-model.mjs; inert at runtime. */
if (typeof window !== 'undefined' && window.__AVA_STAGE_TEST__ === true) {
  window.__AVA_STAGE_TEST_API = {
    buildModel,
    menuPlacement,
    openAddress,
    browserBlockedReason,
    claimSession,
    releaseFeed,
    windowIntentId,
    persistedSessionId,
    StageToggle,
    safeTarget, plainMarkdown, resultResources, ResultMarkdown, ResultReader,
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
