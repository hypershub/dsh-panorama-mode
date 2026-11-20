/**
 * dsh-panorama-mode — Host half.
 *
 * Two jobs, both narrow:
 *
 *  1. Publish the deployment defaults declared on this bundle's Loader row so
 *     the browser half can merge them with the user's local overrides.
 *  2. Support "open in a browser window": mint this Host's authenticated GUI
 *     address and remember, for one short window of time, which Session the
 *     newly opened window should show. The address carries the process launch
 *     token, which is exactly how the product's own browser-access setting
 *     works; it is returned to the requesting owner page only and is never
 *     logged, written to disk, or kept after its single use.
 *
 * All routes are exact, owner-only `connection.fetch` routes.
 */

/** Fields the browser half understands, with their deployment defaults. */
const DEFAULT_CONFIG = {
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

/** Exact paths below the shared `/api` channel. */
const CONFIG_PATH = '/api/panoramaMode/config'
const WINDOW_INTENT_PATH = '/api/panoramaMode/windowIntent'
const STATE_PATH = '/api/panoramaMode/state'

/** How long a freshly opened window may claim its Session intent. */
const INTENT_TTL_MS = 90_000

const ACCENTS = new Set(['auto', 'ember', 'aurora', 'mint', 'ice'])
const MOTIONS = new Set(['calm', 'normal', 'lively'])
const DENSITIES = new Set(['sparse', 'normal', 'dense'])

/**
 * @param {unknown} value - raw Loader row config.
 * @param {string} key - allowed enum set.
 * @param {Set<string>} allowed - enum members.
 * @param {string} fallback - value used for anything unrecognized.
 * @returns {string} a member of `allowed`.
 */
function pick(value, key, allowed, fallback) {
  return typeof value === 'string' && allowed.has(value) ? value : fallback
}

/**
 * @param {unknown} value - candidate free text.
 * @param {string} fallback - value used when empty or not a string.
 * @param {number} max - hard length bound, so a bad patch cannot bloat the payload.
 * @returns {string} bounded single-line text.
 */
function text(value, fallback, max) {
  if (typeof value !== 'string') return fallback
  const flat = value.replace(/\s+/g, ' ').trim().slice(0, max)
  return flat.length > 0 ? flat : fallback
}

/**
 * @param {unknown} value - candidate boolean.
 * @param {boolean} fallback - value used for a non-boolean.
 * @returns {boolean} the resolved flag.
 */
function flag(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}

/**
 * Normalize the Loader row config into the fixed payload the Client reads.
 * @param {unknown} raw - unresolved row config.
 * @returns {typeof DEFAULT_CONFIG} complete deployment defaults.
 */
export function normalizeConfig(raw) {
  const input = raw !== null && typeof raw === 'object' ? raw : {}
  return {
    brandName: text(input.brandName, DEFAULT_CONFIG.brandName, 32),
    accent: pick(input.accent, 'accent', ACCENTS, DEFAULT_CONFIG.accent),
    callsign: text(input.callsign, DEFAULT_CONFIG.callsign, 12).toUpperCase(),
    tagline: text(input.tagline, DEFAULT_CONFIG.tagline, 24).toUpperCase(),
    unit: text(input.unit, DEFAULT_CONFIG.unit, 12).toUpperCase(),
    motion: pick(input.motion, 'motion', MOTIONS, DEFAULT_CONFIG.motion),
    density: pick(input.density, 'density', DENSITIES, DEFAULT_CONFIG.density),
    showStream: flag(input.showStream, DEFAULT_CONFIG.showStream),
    showStats: flag(input.showStats, DEFAULT_CONFIG.showStats),
    showRecent: flag(input.showRecent, DEFAULT_CONFIG.showRecent),
  }
}

/**
 * One-shot handoff from the window that opens a browser window to the page that
 * boots inside it.
 *
 * The token-authenticated index request is redirected to `./`, so a query or
 * hash cannot carry the target Session. This store replaces that transport with
 * a single claim: the opener records the Session, the new page asks once and
 * receives it. In-process only, no persistence, and it expires.
 *
 * @param {() => number} now - clock, injectable for tests.
 * @returns {{ remember: (sessionId: string | null) => void, claim: () => string | null }} the store.
 */
export function createWindowIntent(now = () => Date.now()) {
  /* Keyed by an opaque id that travels in the URL fragment: the token redirect
     drops the query string, but a fragment is inherited across the redirect. */
  const pending = new Map()
  const live = () => {
    const at = now()
    for (const [id, entry] of pending) if (entry.expiresAt <= at) pending.delete(id)
    return pending
  }
  return {
    /**
     * @param {string | null} sessionId - Session the new window should show.
     * @returns {string} the id to carry in the fragment.
     */
    remember(sessionId) {
      const id = nonce()
      live().set(id, {
        sessionId: typeof sessionId === 'string' && sessionId.length > 0 ? sessionId : null,
        expiresAt: now() + INTENT_TTL_MS,
      })
      return id
    },
    /**
     * @param {string | null} id - id from the requesting window's fragment.
     * @returns {string | null} that window's Session, consumed once.
     */
    claim(id) {
      const queue = live()
      if (typeof id !== 'string' || id.length === 0) return null
      const entry = queue.get(id)
      queue.delete(id)
      return entry === undefined ? null : entry.sessionId
    },
    size() {
      return live().size
    },
  }
}

export const name = 'panorama-mode'

/* `connection` is required for the routes; `webApp`/`webServer` only supply the
   address to open, so their absence degrades a single feature, not the stage. */

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx - registrant context.
 * @param {unknown} config - this Loader row's config.
 * @returns {void}
 */
export function apply(ctx, config) {
  const payload = normalizeConfig(config)
  const intent = createWindowIntent()
  ctx.inject(['connection'], scope => {
    /* Read the service through the global store: `scope.<service>` is a
       topology-sensitive proxy, and a miss here used to leave both routes
       silently unregistered while the plugin still reported as applied. */
    const connection = scope.get('connection')
    if (connection === undefined) return
    scope.effect(() => () => {
      while (intent.claim() !== null) { /* drain queued intents on unload */ }
    }, 'panorama-mode: drop pending window intents')
    scope.effect(
      () =>
        connection.fetch.register({
          path: CONFIG_PATH,
          methods: ['GET'],
          requestBody: 'buffered',
          fetch: () =>
            Response.json(payload, {
              headers: { 'cache-control': 'no-store' },
            }),
        }),
      'panorama-mode: deployment defaults route',
    )
    scope.effect(
      () =>
        connection.fetch.register({
          path: WINDOW_INTENT_PATH,
          methods: ['GET', 'POST'],
          requestBody: 'buffered',
          fetch: async request => {
            if (request.method === 'GET') {
              const id = new URL(request.url).searchParams.get('id')
              return Response.json({ sessionId: intent.claim(id) }, { headers: { 'cache-control': 'no-store' } })
            }
            let body
            try {
              body = await request.json()
            } catch {
              return Response.json({ error: 'invalid-request' }, { status: 400 })
            }
            const sessionId = body !== null && typeof body === 'object' && typeof body.sessionId === 'string'
              ? body.sessionId
              : null
            /* The Desktop WebServer answers every ordinary browser request with
               'forbidden' unless browser access is enabled (compatibility mode),
               so refuse up front instead of opening an unusable page. */
            if (browserAccessState(scope) === 'disabled') {
              return Response.json({ error: 'browser-access-disabled' }, { status: 409, headers: { 'cache-control': 'no-store' } })
            }
            const base = authenticatedWindowBase(scope)
            /* Do not record an intent that no window can ever claim. */
            if (base === null) return Response.json({ error: 'address-unavailable' }, { status: 503 })
            const url = windowAddress(base, intent.remember(sessionId))
            return Response.json({ url }, { headers: { 'cache-control': 'no-store' } })
          },
        }),
      'panorama-mode: browser window route',
    )
    scope.effect(
      () =>
        connection.fetch.register({
          path: STATE_PATH,
          methods: ['GET'],
          requestBody: 'buffered',
          fetch: () =>
            Response.json(
              {
                browserAccess: browserAccessState(scope),
                address: authenticatedWindowBase(scope) !== null,
              },
              { headers: { 'cache-control': 'no-store' } },
            ),
        }),
      'panorama-mode: window capability route',
    )
  })
}

/** @returns {string} a fresh non-authoritative request marker. */
function nonce() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

/**
 * Whether an ordinary browser may reach this Host at all.
 *
 * The Desktop shell denies every non-renderer request in native mode and states
 * that browser access exists only in compatibility mode, so the stage reports
 * that requirement before the user opens a window that cannot load.
 *
 * @param {import('@deepseek-ai/cordis').Context} scope - context with the Desktop gate.
 * @returns {'unrestricted' | 'enabled' | 'disabled'} the current gate state.
 */
function browserAccessState(scope) {
  const access = scope.get('desktopBrowserAccess')
  if (access === undefined) return 'unrestricted'
  return access.ordinaryBrowserEnabled === true ? 'enabled' : 'disabled'
}

/**
 * The authenticated base address a second browser window should load.
 *
 * `authenticatedUrl` appends this process's launch token, which is how the
 * product's own "open in browser" affordance authenticates a window.
 *
 * @param {import('@deepseek-ai/cordis').Context} scope - context with `connection`.
 * @returns {string | null} absolute address, or null when no listener exists.
 */
function authenticatedWindowBase(scope) {
  let base
  try {
    base = scope.get('webApp')?.getAdvertisedUrl?.()
  } catch {
    base = undefined
  }
  if (typeof base !== 'string' || base.length === 0) {
    try {
      base = scope.get('webServer')?.getOrigin?.()
    } catch {
      base = undefined
    }
  }
  if (typeof base !== 'string' || base.length === 0) return null
  try {
    return scope.get('connection')?.authenticatedUrl(base) ?? null
  } catch {
    return null
  }
}

/**
 * Address one window so it can be told apart from every other window.
 *
 * The launch token is constant for the process and the token redirect drops the
 * query string, so two windows would otherwise end on the identical URL and a
 * browser may focus the existing tab instead of opening a window. A fragment is
 * inherited across that redirect, so it survives as the window's own address and
 * carries the intent id back to this Host.
 *
 * @param {string} base - authenticated base address.
 * @param {string} intentId - opaque id recorded for this window.
 * @returns {string} absolute address with the id in the fragment.
 */
function windowAddress(base, intentId) {
  const url = new URL(base)
  url.searchParams.set('window', intentId)
  url.hash = 'panorama-window=' + intentId
  return url.href
}
