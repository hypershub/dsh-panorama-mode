/* ── in-stage settings ──────────────────────────────────────────────────── */

const ACCENT_LABEL = { ember: 'Ember', aurora: 'Aurora', mint: 'Mint', ice: 'Ice' }
const MOTION_LABEL = { calm: 'Calm', normal: 'Normal', lively: 'Lively' }
const DENSITY_LABEL = { sparse: 'Sparse', normal: 'Normal', dense: 'Dense' }

function StageSettings(props) {
  const { settings, onChange, onReset, onClose } = props
  const t = asT(props.t)

  const text = (key, maxLength, placeholder) =>
    h('input', {
      type: 'text',
      value: settings[key],
      maxLength,
      spellCheck: false,
      'aria-label': t(key),
      placeholder,
      onChange: event => onChange({ [key]: event.target.value }),
    })

  const row = (key, options, labels) =>
    h(
      'div',
      { className: 'dvs-row', role: 'group', 'aria-label': t(key) },
      Object.keys(options).map(value =>
        h(
          'button',
          {
            type: 'button',
            key: value,
            className: 'dvs-opt' + (settings[key] === value ? ' is-on' : ''),
            onClick: () => onChange({ [key]: value }),
            'aria-pressed': settings[key] === value,
          },
          labels[value] || value,
        ),
      ),
    )

  const toggle = (key, label) =>
    h(
      'div',
      { className: 'dvs-toggle' },
      h('span', null, label),
      h('button', {
        type: 'button',
        className: 'dvs-switch' + (settings[key] ? ' is-on' : ''),
        role: 'switch',
        'aria-checked': settings[key] ? 'true' : 'false',
        'aria-label': label,
        onClick: () => onChange({ [key]: !settings[key] }),
      }),
    )

  return h(
    'aside',
    { className: 'dvs-sheet', role: 'dialog', 'aria-label': t('settings'), onMouseDown: event => event.stopPropagation() },
    h('h3', null, h('span', null, t('settings')), h('button', { type: 'button', className: 'dvs-link', onClick: onClose }, t('done'))),
    h(
      'div',
      { className: 'dvs-field' },
      h('label', null, h('span', null, t('accent'))),
      h(
        'div',
        { className: 'dvs-row' },
        h('button', {type:'button',className:'dvs-opt' + (settings.accent === 'auto' ? ' is-on' : ''),
          onClick:()=>onChange({accent:'auto'}),'aria-pressed':settings.accent === 'auto',title:t('accentAutoHint')},t('accentAuto')),
        ACCENT_ORDER.map(value =>
          h('button', {
            type: 'button',
            key: value,
            className: 'dvs-swatch' + (settings.accent === value ? ' is-on' : ''),
            style: {
              background: 'radial-gradient(circle at 35% 30%,' + PALETTES[value].b + ',' + PALETTES[value].a + ' 62%,#20100c)',
            },
            title: ACCENT_LABEL[value],
            'aria-label': ACCENT_LABEL[value],
            'aria-pressed': settings.accent === value,
            onClick: () => onChange({ accent: value }),
          }),
        ),
      ),
    ),
    h('div', { className: 'dvs-field' }, h('label', null, h('span', null, t('brandName'))), text('brandName', 32, 'Hypers Work')),
    h('div', { className: 'dvs-field' }, h('label', null, h('span', null, t('callsign'))), text('callsign', 12, 'AVA')),
    h('div', { className: 'dvs-field' }, h('label', null, h('span', null, t('tagline'))), text('tagline', 24, 'DIGITAL EMPLOYEE')),
    h('div', { className: 'dvs-field' }, h('label', null, h('span', null, t('unit'))), text('unit', 12, 'APAC-01')),
    h('div', { className: 'dvs-field' }, h('label', null, h('span', null, t('motion'))), row('motion', MOTION_RATE, MOTION_LABEL)),
    h('div', { className: 'dvs-field' }, h('label', null, h('span', null, t('density'))), row('density', DENSITY_COUNT, DENSITY_LABEL)),
    toggle('showStream', t('showStream')),
    toggle('showStats', t('showStats')),
    toggle('showRecent', t('showRecent')),
    h(
      'div',
      { className: 'dvs-sheet-foot' },
      h('button', { type: 'button', className: 'dvs-link', onClick: onReset }, t('reset')),
      h('span', { className: 'dvs-hint' }, 'S · ESC'),
    ),
  )
}
