/**
 * dsh-panorama-mode — Host half.
 *
 * The stage is a purely visual surface: it reads what the Session already
 * recorded and draws it. This half therefore owns no session state, registers
 * no tools and writes nothing. Its single job is to publish the deployment
 * defaults declared on this bundle's Loader row so the browser half can merge
 * them with the user's local overrides.
 *
 * The route is an exact, owner-only `connection.fetch` route: only the local
 * owner page can read it, and it returns a fixed, normalized object.
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

/** Exact path below the shared `/api` channel. */
const ROUTE_PATH = '/api/panorama-mode/config'

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

export const name = 'panorama-mode'

/* The route needs `connection`; without it (a Host with no browser channel)
   the Client half still runs and keeps its built-in defaults. */

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx - registrant context.
 * @param {unknown} config - this Loader row's config.
 * @returns {void}
 */
export function apply(ctx, config) {
  const payload = normalizeConfig(config)
  ctx.inject(['connection'], scope => {
    scope.effect(
      () =>
        scope.connection.fetch.register({
          path: ROUTE_PATH,
          methods: ['GET'],
          requestBody: 'buffered',
          fetch: () =>
            Response.json(payload, {
              headers: { 'cache-control': 'no-store' },
            }),
        }),
      'panorama-mode: deployment defaults route',
    )
  })
}
