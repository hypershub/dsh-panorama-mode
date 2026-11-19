/* ── glyphs ─────────────────────────────────────────────────────────────── */

const glyph = (paths, size, extra) =>
  h(
    'svg',
    { viewBox: '0 0 24 24', width: size || 16, height: size || 16, fill: 'none', 'aria-hidden': 'true', ...extra },
    paths.map((d, index) =>
      h('path', {
        key: index,
        d,
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
    ),
  )

const IconOrb = size =>
  h(
    'svg',
    { viewBox: '0 0 24 24', width: size || 20, height: size || 20, fill: 'none', 'aria-hidden': 'true' },
    h('circle', { cx: 12, cy: 12, r: 4.4, fill: 'currentColor', opacity: 0.92 }),
    h('circle', { cx: 12, cy: 12, r: 8.4, stroke: 'currentColor', strokeWidth: 1.4, opacity: 0.55 }),
    h('circle', { cx: 18.6, cy: 7.2, r: 1.15, fill: 'currentColor' }),
  )

const IconGear = () => h('svg', {viewBox:'0 0 24 24',width:18,height:18,fill:'none','aria-hidden':'true',preserveAspectRatio:'xMidYMid meet'},
  h('path',{d:"M12.000 4.700L13.756 3.173L15.444 3.685L16.056 5.930L17.162 6.838L19.483 7.000L20.315 8.556L19.160 10.576L19.300 12.000L20.827 13.756L20.315 15.444L18.070 16.056L17.162 17.162L17.000 19.483L15.444 20.315L13.424 19.160L12.000 19.300L10.244 20.827L8.556 20.315L7.944 18.070L6.838 17.162L4.517 17.000L3.685 15.444L4.840 13.424L4.700 12.000L3.173 10.244L3.685 8.556L5.930 7.944L6.838 6.838L7.000 4.517L8.556 3.685L10.576 4.840Z",stroke:'currentColor',strokeWidth:1.6,strokeLinejoin:'round'}),
  h('circle',{cx:12,cy:12,r:3,stroke:'currentColor',strokeWidth:1.6}))
const IconClose = () => glyph(['M6 6l12 12', 'M18 6L6 18'])
const IconCheck = () => h('path', { d: 'M5 10.5l3.3 3.3L15 7' })

/* ── header ─────────────────────────────────────────────────────────────── */

function StageClock() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  let zone = ''
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {
    zone = ''
  }
  const short = zone.includes('/') ? zone.split('/').pop().replace(/_/g, ' ') : zone
  return h(
    'div',
    { className: 'dvs-clock' },
    h('div', { className: 't' }, fmtClock(now), h('small', null, (short || 'LOCAL').toUpperCase())),
    h('div', { className: 'd' }, fmtDate(now)),
  )
}

function StageHeader(props) {
  const { model, settings, settingsOpen, onSettings, onClose } = props
  const t = asT(props.t)
  const turns = model ? model.stats.turns : 0
  const steps = model ? model.stats.steps : 0
  const todos = model ? model.todos : null
  return h(
    'header',
    { className: 'dvs-header' },
    h(
      'div',
      { className: 'dvs-brand' },
      h(
        'div',
        { className: 'dvs-mark' },
        h(
          'svg',
          { viewBox: '0 0 52 52', width: 26, height: 26, fill: 'none', 'aria-hidden': 'true' },
          h('path', { d: HYPER_MARK, fill: 'currentColor' }),
        ),
      ),
      h(
        'div',
        { style: { minWidth: 0 } },
        h('b', {title: settings?.brandName || DEFAULTS.brandName, style:{maxWidth:320,overflow:'hidden',textOverflow:'ellipsis'}}, settings?.brandName || DEFAULTS.brandName),
        h('small', null, 'digital employee · panorama'),
      ),
    ),
    h(
      'div',
      { className: 'dvs-hub' },
      h('span', { className: 'live' }, h('i', { className: 'dvs-led' }), 'Session ', h('b', null, model && model.running ? 'running' : 'live')),
      h('span', null, 'turns ', h('b', null, String(turns))),
      h('span', null, 'tools ', h('b', null, String(steps))),
      todos ? h('span', null, 'tasks ', h('b', null, todos.done + '/' + todos.total)) : null,
    ),
    h(
      'div',
      { className: 'dvs-head-right' },
      h(StageClock),
      h(
        'div',
        { className: 'dvs-controls' },
        h(
          'button',
          {
            type: 'button',
            className: 'dvs-ctl' + (settingsOpen ? ' is-on' : ''),
            onClick: onSettings,
            title: t('settings'),
            'aria-label': t('settings'),
          },
          IconGear(),
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'dvs-ctl',
            onClick: onClose,
            title: t('close'),
            'aria-label': t('close'),
          },
          IconClose(),
        ),
      ),
    ),
  )
}

/* ── left column ────────────────────────────────────────────────────────── */

function StageIdentity(props) {
  const { model, settings } = props
  const t = asT(props.t)
  const display = model ? model.display : 'idle'
  const statusText =
    display === 'done'
      ? t('statusDone')
      : display === 'working'
        ? t('statusWorking')
        : display === 'thinking'
          ? t('statusThinking')
          : display === 'error'
            ? t('statusError')
            : (display === 'waiting' ? t('statusWaiting') : t('statusIdle'))
  const idleSpeech = t('idleSpeech')
  const speech = model && model.speech ? model.speech : display === 'idle' ? idleSpeech : ''
  return h(
    'div',
    { className: 'dvs-identity' },
    h('div', { className: 'dvs-id-name' }, settings.callsign),
    h(
      'div',
      { className: 'dvs-id-meta' },
      h('span', null, settings.tagline),
      h('i', { className: 'sep' }),
      h('span', null, settings.unit),
      h('i', { className: 'sep' }),
      h('span', { className: 'st' }, h('i', { className: 'dvs-led' }), h('span', null, statusText)),
    ),
    h('div', { className: 'dvs-speech', title: speech || undefined }, speech),
  )
}

function StageOrbColumn(props) {
  const { model, settings } = props
  const t = asT(props.t)
  const palette = paletteFor(settings, model)
  const display = model ? model.display : 'idle'
  return h(
    'div',
    { className: 'dvs-left' },
    h(
      'div',
      { className: 'dvs-orb-wrap' },
      h('div', { className: 'dvs-orb-glow' }),
      h(OrbCanvas, {
        display,
        progress: model && model.progress !== null ? model.progress : 0,
        indeterminate: model ? model.indeterminate : false,
        motion: settings.motion,
        density: settings.density,
        palette,
        activityKey: model?.activityKey,
      }),
    ),
    h(StageIdentity, { model, settings, t }),
  )
}

/* ── panel pieces ───────────────────────────────────────────────────────── */

function StageCaps(props) {
  const { model, settings } = props
  const t = asT(props.t)
  const usage = model ? model.tokens : { total: 0, cacheHit: null }
  const caps = [
    { no: '01', title: t('capPrompts'), meta: (model ? model.stats.turns : 0) + ' turns' },
    { no: '02', title: t('capTools'), meta: (model ? model.tools.length : 0) + ' in window' },
    {
      no: '03',
      title: t('capTasks'),
      meta: model && model.todos ? model.todos.done + '/' + model.todos.total + ' done' : t('capTasksEmpty'),
    },
    {
      no: '04',
      title: t('capTokens'),
      meta: fmtTokens(usage.total) + (usage.cacheHit !== null ? ' · ' + usage.cacheHit + '% cache' : ''),
    },
  ]
  return h(
    'div',
    { className: 'dvs-caps' },
    caps.map((cap, index) =>
      h(
        'div',
        { className: 'dvs-cap', style: { '--i': index }, key: cap.no },
        h('div', { className: 'k' }, h('span', null, cap.no), h('kbd', null, String(index + 1))),
        h('b', null, cap.title),
        h('i', null, cap.meta),
      ),
    ),
  )
}

function StageIdleCard(props) {
  const { model, settings, out } = props
  const t = asT(props.t)
  const tools = model && model.tools.length ? model.tools : ['chat', 'tools', 'plan', 'deliverables']
  return h(
    'div',
    { className: 'dvs-card dvs-idle' + (out ? ' is-out up' : ''), 'aria-hidden': out ? 'true' : undefined },
    h('h2', null, t('idleTitleA'), h('br'), h('em', null, t('idleTitleB'))),
    h('p', null, t('idleBody')),
    h(StageCaps, { model, settings, t }),
    h(
      'div',
      { className: 'dvs-tools' },
      h('span', { className: 'lbl' }, t('connected')),
      tools.map((name, index) => h('span', { key: name + index, title: name }, name)),
    ),
  )
}

function StageStepRow(props) {
  const { step } = props
  return h(
    'div',
    { className: 'dvs-step ' + step.state, title: step.brief || step.name },
    h(
      'span',
      { className: 'sd' },
      h('svg', { className: 'chk', viewBox: '0 0 20 20' }, IconCheck()),
      h('svg', { className: 'spin', viewBox: '0 0 24 24' }, h('circle', { cx: 12, cy: 12, r: 10 })),
    ),
    h('span', { className: 'sl' }, h('b', null, step.name), step.brief ? h('i', null, step.brief) : null),
    step.duration > 0 ? h('span', { className: 'st' }, fmtDuration(step.duration)) : null,
  )
}

function StagePreview(props) {
  const { model } = props
  const t = asT(props.t)
  const done = model.display === 'done'
  const pct = model.progress !== null ? Math.round(model.progress * 100) : null
  const text = model.previewText || model.speech || (model.deliverable ? model.deliverable.text : '')
  const caption = done ? t('replyReady') : (model.phase || t('drafting')) + (model.progressBasis === 'plan' ? ' · ' + pct + '% 待办完成' : '')
  return h(
    'div',
    { className: 'dvs-preview' },
    h(
      'div',
      { className: 'dvs-paper' },
      h('div', { className: 'dvs-paper-head' }, h('span', null, done ? 'reply' : 'stream'), h('span', null, done ? 'done' : 'live')),
      h('div', { className: 'dvs-paper-text' }, text || t('previewEmpty')),
      h('div', { className: 'dvs-paper-foot' }, h('i', { style: { width: (pct === null ? (done ? 100 : 22) : pct) + '%' } })),
      h('div', { className: 'dvs-scan', style: { top: '0%', animation: model.running && model.display !== 'waiting' ? 'dvs-scan-active 3s linear infinite' : 'none', opacity: model.running && model.display !== 'waiting' ? 1 : 0 } }),
    ),
    h('div', { className: 'dvs-pv-cap' }, caption),
  )
}

function StageLog(props) {
  const { model } = props
  const rows = model.logs
  return h(
    'div',
    { className: 'dvs-log', 'aria-hidden': 'true' },
    h(
      'div',
      { className: 'dvs-log-in' },
      rows.map((row, index) =>
        h(
          'div',
          { className: 'dvs-ll', key: row.key || row.time + ':' + index },
          h('span', { className: 't' }, fmtClock(row.time)),
          h('b', null, '›'),
          h('span', null, row.text),
        ),
      ),
    ),
  )
}

function StageProgress(props) {
  const { model } = props
  const t = asT(props.t)
  const pct = model.progress !== null ? Math.round(model.progress * 100) : null
  const big =
    pct !== null
      ? h(React.Fragment, null, String(pct), h('i', null, '%'))
      : h(React.Fragment, null, String(model.stepTotal), h('em', null, t('stepsWord')))
  const eta = model.display === 'waiting' ? t('statusWaiting') : model.elapsed !== null ? '已用 ' + fmtDuration(model.elapsed) : model.running ? t('running') : '—'
  return h(
    'div',
    { className: 'dvs-progress' },
    h('div', { className: 'dvs-progress-label' }, model.progressLabel),
    h('div', { className: 'dvs-pnum' }, big),
    h(
      'div',
      { className: 'dvs-ptrack' },
      h('div', {
        className: 'dvs-pfill',
        style: model.indeterminate
          ? { width: '38%', animation: 'dvs-sweep 2.4s ease-in-out infinite' }
          : { width: (pct === null ? (model.display === 'done' ? 100 : 0) : pct) + '%' },
      }),
      !model.indeterminate
        ? h('div', { className: 'dvs-phead', style: { left: (pct === null ? (model.display === 'done' ? 100 : 0) : pct) + '%' } })
        : null,
    ),
    h('div', { className: 'dvs-eta' }, eta),
  )
}

function StageDelivered(props) {
  const { model } = props
  const t = asT(props.t)
  const item = model.deliverable
  if (!item) return null
  return h(
    'div',
    { className: 'dvs-delivered' },
    h(
      'div',
      { className: 'dvs-dv-ico' },
      h('svg', { width: 22, height: 22, viewBox: '0 0 24 24' }, h('path', { d: 'M5 12.5l4.5 4.5L19 7' })),
    ),
    h(
      'div',
      { className: 'dvs-dv-body' },
      h('div', { className: 'dvs-dv-t', title: item.text }, item.text),
      h('div', { className: 'dvs-dv-m' }, item.meta || t('replyReady')),
    ),
  )
}

function StageTaskCard(props) {
  const { model, out } = props
  const t = asT(props.t)
  const done = model.display === 'done'
  const tag = model.activeStep && model.running ? model.activeStep.name : done ? t('tagDelivered') : t('tagReasoning')
  const from = model.modelName || model.workspace || 'session'
  return h(
    'div',
    { className: 'dvs-card dvs-task' + (out ? ' is-out' : ''), 'aria-hidden': out ? 'true' : undefined },
    h(
      'div',
      { className: 'dvs-tc-top' },
      h('span', { className: 'dvs-tag' }, tag),
      h('span', { className: 'dvs-tid' }, model.turn ? 'TURN ' + pair(model.turn) : 'SESSION'),
    ),
    h('h2', { title: model.title }, model.title || t('untitled')),
    h(
      'div',
      { className: 'dvs-from' },
      h('b', null, from),
      model.workspace ? h('span', { className: 'sep' }, '·') : null,
      model.workspace ? h('span', null, model.workspace) : null,
      h('span', { className: 'sep' }, '·'),
      h('span', null, 'via DSH'),
    ),
    h(
      'div',
      { className: 'dvs-tc-body' },
      h(
        'div',
        { className: 'dvs-steps' },
        model.steps.length === 0
          ? h('div', { className: 'dvs-steps-empty' }, t('stepsEmptyA'), h('br'), t('stepsEmptyB'))
          : model.steps.map(step => h(StageStepRow, { key: step.key, step })),
      ),
      h(StagePreview, { model, t }),
    ),
    h(StageLog, { model }),
    done ? null : h(StageProgress, { model, t }),
    done ? h(StageDelivered, { model, t }) : null,
  )
}

function StageRecent(props) {
  const { model } = props
  const t = asT(props.t)
  const rows = model ? model.recent : []
  return h(
    'div',
    { className: 'dvs-recent' },
    h(
      'div',
      { className: 'dvs-sec' },
      h('span', null, t('recent')),
      h('span', null, rows.length ? rows.length + ' ' + t('today') : ''),
    ),
    rows.length === 0
      ? h('div', { className: 'dvs-r-empty' }, t('recentEmpty'))
      : h(
          'div',
          { className: 'dvs-rlist' },
          rows.map((row, index) =>
            h(
              'div',
              { className: 'dvs-ri', key: row.time + ':' + index, title: row.text },
              h(
                'div',
                { className: 'dvs-ri-th' },
                h(
                  'svg',
                  { viewBox: '0 0 30 38', 'aria-hidden': 'true' },
                  h('rect', { x: 3, y: 4, width: 24, height: 30, rx: 2, fill: 'rgba(255,255,255,.10)' }),
                  h('rect', { x: 6, y: 8, width: 11, height: 2, rx: 1, fill: 'var(--a)', opacity: '.85' }),
                  h('rect', { x: 6, y: 13, width: 18, height: 1.4, rx: 0.7, fill: 'rgba(255,255,255,.28)' }),
                  h('rect', { x: 6, y: 16, width: 15, height: 1.4, rx: 0.7, fill: 'rgba(255,255,255,.20)' }),
                  h('rect', { x: 6, y: 24, width: 5, height: 6, rx: 1, fill: 'var(--b)', opacity: '.55' }),
                  h('rect', { x: 13, y: 24, width: 5, height: 6, rx: 1, fill: 'var(--c)', opacity: '.45' }),
                  h('rect', { x: 20, y: 26, width: 4, height: 4, rx: 1, fill: 'rgba(255,255,255,.25)' }),
                ),
              ),
              h(
                'div',
                { className: 'dvs-ri-body' },
                h('div', { className: 'dvs-ri-n' }, row.text),
                h(
                  'div',
                  { className: 'dvs-ri-m' },
                  h('i', null),
                  h('span', null, fmtClock(row.time) + ' · turn ' + String(row.turn)),
                ),
              ),
            ),
          ),
        ),
  )
}

/* ── footer ─────────────────────────────────────────────────────────────── */

function StageStream(props) {
  const { model } = props
  const t = asT(props.t)
  const rows = model ? model.stream : []
  return h(
    'div',
    { className: 'dvs-stream' },
    h('span', { className: 'lbl' }, t('stream')),
    h(
      'div',
      { className: 'dvs-chips' },
      rows.length === 0
        ? h('span', { className: 'dvs-evt' }, h('i', null), h('span', null, t('streamEmpty')))
        : rows.map((row, index) =>
            h(
              'span',
              { className: 'dvs-evt ' + (row.kind || ''), key: row.time + ':' + index, title: row.text },
              h('i', null),
              h('span', null, row.text),
            ),
          ),
    ),
  )
}

function StageStats(props) {
  const { model } = props
  const t = asT(props.t)
  const stats = model ? model.stats : { turns: 0, steps: 0, avgStepMs: 0 }
  const tokens = model ? model.tokens : { total: 0, cacheHit: null }
  return h(
    'div',
    { className: 'dvs-stats' },
    h('div', { className: 'dvs-stat' }, h('b', null, String(stats.turns)), h('small', null, t('statTurns'))),
    h('div', { className: 'dvs-stat' }, h('b', null, fmtTokens(tokens.total)), h('small', null, t('statTokens'))),
    h('div', { className: 'dvs-stat' }, h('b', null, tokens.cacheHit === null ? '—' : tokens.cacheHit + '%'), h('small', null, t('statCache'))),
  )
}
