/* ══════════════════════════════════════════════════════════════════════════
   dsh-panorama-mode · client half
   ──────────────────────────────────────────────────────────────────────────
   A cinematic, full-screen view of the running conversation.

     · a header button in `conversation.session.header.utilities` opens it
     · the stage lives in `shell.overlay`, above every column, and can go
       viewport-covering presentation without changing window fullscreen
     · every figure on screen is derived from the Session's own projections
       and Chat snapshot — nothing is simulated, nothing is persisted

   Data flow: the header feed component (Session-scoped) folds the snapshot
   into a compact `model` and publishes it into a module store; the overlay
   (root-scoped) renders that model. Publications are coalesced to ~8 fps so
   live token streaming never turns into a 60 fps React render storm; the
   orb itself animates at display refresh from smoothed targets.
   ══════════════════════════════════════════════════════════════════════════ */
const { useState, useEffect, useRef, useMemo, useCallback } = React

/**
 * Fallback translator. Every component resolves `t` through this so a missing
 * prop degrades to the key instead of throwing inside a slot entry.
 * @param {unknown} value - candidate translator.
 * @returns {(key: string) => string} a usable translator.
 */
const asT = value => (typeof value === 'function' ? value : key => key)

const DEFAULTS = {
  brandName: 'Hypers Work',
  accent: 'auto',
  callsign: 'AVA',
  tagline: 'DIGITAL EMPLOYEE',
  unit: 'APAC-01',
  motion: 'normal',
  density: 'normal',
  showStream: true,
  showStats: true,
  showRecent: true,
}

// Preserve existing appearance choices across the package rename.
const STORAGE_KEY = 'dsh-ava-stage.settings.v1'
const CONFIG_ROUTE = '/api/panorama-mode/config'

/** Accent palettes: same role split as the reference art (core, warm, cool, success). */
const PALETTES = {
  ember: { a: '#FF5A3C', b: '#FFB067', c: '#7F95FF', ok: '#46E6B4', accent: '#FF6B4A', amber: '#FFB067', cool: '#8AA2FF' },
  aurora: { a: '#6C7BFF', b: '#8AA2FF', c: '#C9A6FF', ok: '#46E6B4', accent: '#8AA2FF', amber: '#B7C4FF', cool: '#C9A6FF' },
  mint: { a: '#2ED3A6', b: '#8DF2D2', c: '#7F95FF', ok: '#46E6B4', accent: '#46E6B4', amber: '#9EF0D2', cool: '#8AA2FF' },
  ice: { a: '#5FB8FF', b: '#A9DCFF', c: '#8AA2FF', ok: '#46E6B4', accent: '#5FB8FF', amber: '#A9DCFF', cool: '#8AA2FF' },
}

const MOTION_RATE = { calm: 0.55, normal: 1, lively: 1.6 }
const DENSITY_COUNT = { sparse: 9000, normal: 16000, dense: 24000 }

const ACCENT_ORDER = ['ember', 'aurora', 'mint', 'ice']

/** Automatic colors follow actual execution state, never tool-name guesses. */
function paletteFor(settings, model) {
  if (settings.accent !== 'auto') return PALETTES[settings.accent] || PALETTES.ember
  const state = model?.display || 'idle'
  const key = state === 'done' ? 'mint' : state === 'thinking' ? 'aurora'
    : ['working', 'waiting', 'error'].includes(state) ? 'ember' : 'ice'
  return PALETTES[key]
}

/* ── small pure helpers ─────────────────────────────────────────────────── */

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
const lerp = (a, b, t) => a + (b - a) * t
const easeOutCubic = t => 1 - Math.pow(1 - t, 3)
const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function clip(text, max) {
  const value = typeof text === 'string' ? text : ''
  const flat = value.replace(/\s+/g, ' ').trim()
  return flat.length > max ? flat.slice(0, max - 1).trimEnd() + '…' : flat
}

function pair(n) {
  return n < 10 ? '0' + n : String(n)
}

function fmtClock(time) {
  const date = time === undefined ? new Date() : new Date(time)
  return pair(date.getHours()) + ':' + pair(date.getMinutes()) + ':' + pair(date.getSeconds())
}

function fmtDate(time) {
  const date = time === undefined ? new Date() : new Date(time)
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return days[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear()
}

function fmtDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '—'
  const seconds = ms / 1000
  if (seconds < 10) return seconds.toFixed(1) + 's'
  if (seconds < 60) return Math.round(seconds) + 's'
  const minutes = Math.floor(seconds / 60)
  const rest = Math.round(seconds % 60)
  return minutes + 'm ' + pair(rest) + 's'
}

function fmtTokens(count) {
  const value = Number(count)
  if (!Number.isFinite(value) || value <= 0) return '0'
  if (value < 1000) return String(Math.round(value))
  if (value < 1000000) return (value / 1000).toFixed(value < 10000 ? 1 : 0) + 'k'
  return (value / 1000000).toFixed(1) + 'm'
}

function bytesOf(text) {
  return typeof text === 'string' ? text.length : 0
}

/** @returns {string} the latest non-empty text block of an assistant block list. */
function textOfBlocks(blocks) {
  if (!Array.isArray(blocks)) return ''
  let out = ''
  for (const block of blocks) {
    if (block && block.kind === 'text' && typeof block.text === 'string') out += block.text
  }
  return out.trim()
}

/** @returns {string} the latest reasoning text of an assistant block list. */
function reasoningOfBlocks(blocks) {
  if (!Array.isArray(blocks)) return ''
  let out = ''
  for (const block of blocks) {
    if (block && block.kind === 'reasoning' && typeof block.text === 'string') out += block.text
  }
  return out.trim()
}

/** @returns {string} concatenated text of a generic ContentBlock list. */
function contentText(blocks) {
  if (!Array.isArray(blocks)) return ''
  let out = ''
  for (const block of blocks) {
    if (block && block.type === 'text' && typeof block.text === 'string') out += block.text
  }
  return out.trim()
}

const BRIEF_KEYS = ['command', 'description', 'prompt', 'query', 'pattern', 'url', 'path', 'file_path', 'filename', 'name', 'skill', 'title', 'path_or_url']

/** @returns {string} a one-line argument summary for a tool call. */
function briefOf(argsRaw) {
  if (typeof argsRaw !== 'string' || argsRaw.length === 0) return ''
  let args
  try {
    args = JSON.parse(argsRaw)
  } catch {
    return clip(argsRaw, 64)
  }
  if (args === null || typeof args !== 'object') return clip(String(args), 64)
  for (const key of BRIEF_KEYS) {
    const value = args[key]
    if (typeof value === 'string' && value.trim()) return clip(value, 64)
  }
  for (const key of Object.keys(args)) {
    const value = args[key]
    if (typeof value === 'string' && value.trim() && value.length < 160) return clip(value, 64)
  }
  return ''
}

/** @returns {string} the last path segment of a workspace path. */
function basename(path) {
  if (typeof path !== 'string' || !path) return ''
  const parts = path.split(/[\\/]+/).filter(Boolean)
  return parts.length ? parts[parts.length - 1] : path
}

function readSettings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed !== null && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeSettings(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    /* Private mode or storage pressure: the stage keeps working in memory. */
  }
}

/** Resolve one setting against local overrides and then deployment defaults. */
function resolveSettings(deployment) {
  const local = readSettings()
  const merged = { ...DEFAULTS, ...(deployment || {}) }
  for (const key of Object.keys(DEFAULTS)) {
    const value = local[key]
    if (value === undefined) continue
    if (typeof DEFAULTS[key] === 'boolean') {
      if (typeof value === 'boolean') merged[key] = value
    } else if (typeof DEFAULTS[key] === 'string') {
      if (typeof value === 'string' && value.length <= 64) merged[key] = value
    }
  }
  if (merged.accent !== 'auto' && !PALETTES[merged.accent]) merged.accent = DEFAULTS.accent
  if (!(merged.motion in MOTION_RATE)) merged.motion = DEFAULTS.motion
  if (!(merged.density in DENSITY_COUNT)) merged.density = DEFAULTS.density
  merged.brandName = clip(merged.brandName, 32) || DEFAULTS.brandName
  merged.callsign = clip(merged.callsign, 12).toUpperCase() || DEFAULTS.callsign
  merged.tagline = clip(merged.tagline, 24).toUpperCase() || DEFAULTS.tagline
  merged.unit = clip(merged.unit, 12).toUpperCase() || DEFAULTS.unit
  return merged
}

/* ── module store ───────────────────────────────────────────────────────── */

/**
 * Minimal observable store shared by the Session-scoped feed and the
 * root-scoped overlay. One instance per Client module load.
 */
function createStore(initial) {
  let state = initial
  const listeners = new Set()
  return {
    get: () => state,
    set(patch) {
      let changed = false
      for (const key of Object.keys(patch)) {
        if (state[key] !== patch[key]) {
          changed = true
          break
        }
      }
      if (!changed) return
      state = { ...state, ...patch }
      for (const listener of listeners) listener()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

const store = createStore({
  open: false,
  sessionId: null,
  model: null,
})

/** Coalesces model publications: at most one React update per 120 ms. */
function createPublisher() {
  let last = 0
  let timer = 0
  let pending = null
  const flush = () => {
    timer = 0
    last = Date.now()
    if (pending) {
      store.set({ model: pending })
      pending = null
    }
  }
  return {
    push(model) {
      pending = model
      if (timer) return
      const wait = 120 - (Date.now() - last)
      if (wait <= 0) flush()
      else timer = window.setTimeout(flush, wait)
    },
    flush() {
      if (timer) {
        window.clearTimeout(timer)
        flush()
      }
    },
    dispose() {
      if (timer) window.clearTimeout(timer)
      timer = 0
      pending = null
    },
  }
}
