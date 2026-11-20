/* ── the stage shell ────────────────────────────────────────────────────── */

function useStageSettings() {
  const [settings, setSettings] = useState(() => resolveSettings(null))
  const apply = useCallback(patch => {
    setSettings(current => {
      const next = { ...current, ...patch }
      writeSettings(next)
      return next
    })
  }, [])
  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore unavailable storage */
    }
    setSettings(resolveSettings(null))
  }, [])
  useEffect(() => {
    let alive = true
    loadDeployment().then(data => {
      if (!alive || data === null) return
      setSettings(current => ({ ...current, ...resolveSettings(data) }))
    })
    return () => {
      alive = false
    }
  }, [])
  return { settings, apply, reset }
}

/** Keeps one failing region from blanking the whole surface. */
class StageBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('[panorama-mode] stage render failure:', error)
  }

  render() {
    const error = this.state.error
    if (!error) return this.props.children
    return h(
      'div',
      { className: 'dvs-root dvs-crash', role: 'alert' },
      h('div', { className: 'dvs-crash-card' },
        h('b', null, this.props.t('stageLabel')),
        h('span', null, String(error && error.message ? error.message : error)),
        h('button', { type: 'button', className: 'dvs-opt is-on', onClick: this.props.onClose }, this.props.t('close')),
      ),
    )
  }
}

/** @returns {void} */
function StageShell(props) {
  const { onClose } = props
  const t = asT(props.t)
  const rootRef = useRef(null)
  const frameRef = useRef(null)
  const tiltRef = useRef(null)
  const [sheet, setSheet] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(0)
  const { settings, apply, reset } = useStageSettings()
  const model = React.useSyncExternalStore(store.subscribe, () => store.get().model, () => store.get().model)
  const notice = React.useSyncExternalStore(store.subscribe, () => store.get().notice, () => store.get().notice)
  const view = model || EMPTY_MODEL

  const flash = useCallback(message => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2200)
  }, [])


  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  /* A claim miss is stated once, in the stage, instead of failing silently. */
  useEffect(() => {
    if (notice === null) return
    store.set({ notice: null })
    flash(t(notice === 'select-miss' ? 'selectMiss' : 'claimMiss'))
  }, [notice, flash, t])

  /* The board is authored at 1920×1080; scale the whole frame so every
     proportion of the reference survives any window size. */
  useEffect(() => {
    const root = rootRef.current
    const frame = frameRef.current
    if (!root || !frame) return undefined
    const apply = () => {
      const rect = root.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const scale = Math.min(rect.width / FRAME_W, rect.height / FRAME_H)
      frame.style.transform = 'scale(' + Math.max(0.2, scale).toFixed(4) + ')'
    }
    apply()
    let observer = null
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(apply)
      observer.observe(root)
    } else {
      window.addEventListener('resize', apply)
    }
    return () => {
      if (observer) observer.disconnect()
      else window.removeEventListener('resize', apply)
    }
  }, [])

  /* The stage is modal: move focus into it so Escape and the shortcut keys
     never target the composer hidden underneath. */
  useEffect(() => {
    const root = rootRef.current
    if (root && typeof root.focus === 'function') root.focus({ preventScroll: true })
  }, [])

  /* keyboard: Esc closes, S settings */
  useEffect(() => {
    const onKeyDown = event => {
      if (event.defaultPrevented) return
      const target = event.target
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      if (event.key === 'Escape') {
        if (typing) {
          target.blur()
          event.stopPropagation()
          return
        }
        if (sheet) {
          setSheet(false)
          event.stopPropagation()
          return
        }
        event.stopPropagation()
        if(selectedResult){setSelectedResult(null);return}
        onClose()
        return
      }
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === 's' || event.key === 'S') {
        event.preventDefault()
        event.stopPropagation()
        setSheet(value => !value)
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [sheet, selectedResult, onClose])

  /* pointer parallax + auto-hidden cursor (scoped to the stage) */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const pointer = { x: 0, y: 0 }
    let hideTimer = 0
    let frame = 0
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const onMove = event => {
      pointer.x = event.clientX / Math.max(1, window.innerWidth) - 0.5
      pointer.y = event.clientY / Math.max(1, window.innerHeight) - 0.5
      root.classList.remove('dvs-cursor-hidden')
      window.clearTimeout(hideTimer)
      hideTimer = window.setTimeout(() => root.classList.add('dvs-cursor-hidden'), 2600)
    }
    const started = performance.now()
    const render = now => {
      frame = window.requestAnimationFrame(render)
      const tilt = tiltRef.current
      if (!tilt) return
      const elapsed = (now - started) / 1000
      const drift = reduced ? 0 : 1
      const rx = Math.sin(elapsed * 0.21) * 1.1 * drift + pointer.y * -2.5
      const ry = Math.sin(elapsed * 0.16 + 1.3) * 1.8 * drift + pointer.x * 3.5 - 2.5
      tilt.style.transform = 'rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg)'
      root.style.setProperty('--dvs-hx', 50 + ry * 9 + '%')
      root.style.setProperty('--dvs-hy', -10 - rx * 12 + '%')
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    frame = window.requestAnimationFrame(render)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.cancelAnimationFrame(frame)
      window.clearTimeout(hideTimer)
    }
  }, [])

  const palette = paletteFor(settings, view)
  const display = view.display
  const hasTurn = view.turn > 0
  const taskVisible = hasTurn && display !== 'idle'
  const meta = taskVisible ? (view.running ? t('metaRunning') : t('metaLastTurn')) : t('metaWaiting')
  const panelLabel = taskVisible ? t('panelActive') : t('panelInbox')

  return h(
    'div',
    {
      className: 'dvs-root',
      ref: rootRef,
      'data-state': display,
      style: {
        '--dvs-accent': palette.accent,
        '--dvs-amber': palette.amber,
        '--dvs-cool': palette.cool,
        '--hx': 'var(--dvs-hx, 30%)',
        '--hy': 'var(--dvs-hy, 0%)',
      },
      role: 'region',
      tabIndex: -1,
      'aria-label': t('stageLabel'),
    },
    h(
      'div',
      { className: 'dvs-bg', 'aria-hidden': 'true' },
      h('div', { className: 'dvs-aurora' }, h('i', { className: 'a1' }), h('i', { className: 'a2' }), h('i', { className: 'a3' }), h('i', { className: 'a4' })),
      h('div', { className: 'dvs-vignette' }),
      h('div', { className: 'dvs-horizon' }),
      h('div', { className: 'dvs-grain' }),
    ),
    h(
      'div',
      { className: 'dvs-frame', ref: frameRef },
      h(StageHeader, {
        model: view,
        settings,
        settingsOpen: sheet,
        onSettings: () => setSheet(value => !value),
        onClose,
        t,
      }),
      selectedResult ? h(ResultReader,{key:selectedResult.key,result:selectedResult,sessionId:view.sessionId,onClose:()=>setSelectedResult(null),t}) : h(StageOrbColumn, { model: view, settings, t }),
      h(
        'section',
        { className: 'dvs-panel' },
        h('div', { className: 'dvs-sec' }, h('span', null, panelLabel), h('span', null, meta)),
        h(
          'div',
          { className: 'dvs-stage3d' },
          h('div', { className: 'dvs-tilt', ref: tiltRef }, [
            h(StageIdleCard, { key: 'idle', model: view, settings, t, out: taskVisible }),
            h(StageTaskCard, { key: 'task', model: view, t, out: !taskVisible,onResult:setSelectedResult }),
          ]),
        ),
        settings.showRecent ? h(StageRecent, { model: view, t,onResult:setSelectedResult,selectedKey:selectedResult?.key }) : null,
      ),
      h(
        'footer',
        { className: 'dvs-footer' },
        settings.showStream ? h(StageStream, { model: view, t }) : h('div'),
        settings.showStats ? h(StageStats, { model: view, t }) : null,
      ),
      sheet ? h(StageSettings, { settings, onChange: apply, onReset: reset, onClose: () => setSheet(false), t }) : null,
      h('div', { className: 'dvs-toast' + (toast ? ' is-on' : '') }, toast),
    ),
  )
}
