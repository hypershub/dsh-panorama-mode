#!/usr/bin/env node
/**
 * Host-half test: route registration, the one-shot window intent, and address
 * minting, driven through mocks. No Harness process, no network, no profile.
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import assert from 'node:assert/strict'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const host = await import('../index.js')

/** Boot the plugin over mocked services and return the registered routes. */
function boot({ webApp, webServer, connection = true, desktopAccess } = {}) {
  const routes = new Map()
  const services = {
    connection: connection
      ? {
          fetch: {
            register: route => {
              assert.ok(!routes.has(route.path), 'route registered twice: ' + route.path)
              routes.set(route.path, route)
              return async () => routes.delete(route.path)
            },
          },
          authenticatedUrl: base => new URL(base).href + (new URL(base).search ? '&' : '?') + 'token=launch-token',
        }
      : undefined,
    webApp: webApp === undefined ? undefined : { getAdvertisedUrl: () => webApp },
    webServer: webServer === undefined ? undefined : { getOrigin: () => webServer },
    desktopBrowserAccess: desktopAccess,
  }
  const disposers = []
  const scope = {
    get: name => services[name],
    effect: callback => {
      disposers.push(callback())
    },
  }
  const ctx = { inject: (_deps, callback) => callback(scope), effect: scope.effect }
  host.apply(ctx, { brandName: 'Probe' })
  const call = async (requestPath, init = {}) => {
    const route = routes.get(requestPath.split('?')[0])
    if (!route) return { status: 404, body: null }
    if (init.method !== undefined && !route.methods.includes(init.method)) return { status: 405, body: null }
    const request = new Request('http://127.0.0.1:43120' + requestPath, init)
    const response = await route.fetch(request)
    const text = await response.text()
    let body = null
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
    return { status: response.status, body }
  }
  return { routes, call, disposers }
}

const CONFIG = '/api/panoramaMode/config'
const INTENT = '/api/panoramaMode/windowIntent'
const STATE = '/api/panoramaMode/state'

/* ── config ─────────────────────────────────────────────────────────────── */

{
  const { routes, call } = boot({ webApp: 'http://127.0.0.1:43120/' })
  assert.deepEqual([...routes.keys()].sort(), [CONFIG, INTENT, STATE].sort(), 'every route registers')
  assert.deepEqual(routes.get(CONFIG).methods, ['GET'])
  assert.deepEqual(routes.get(INTENT).methods, ['GET', 'POST'])
  const config = await call(CONFIG, { method: 'GET' })
  assert.equal(config.status, 200)
  assert.equal(config.body.brandName, 'Probe', 'the row config reaches the client')
}

/* ── intent + address minting ───────────────────────────────────────────── */

/** Post one window request and return its address and fragment id. */
async function requestWindow(call, sessionId) {
  const posted = await call(INTENT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  })
  assert.equal(posted.status, 200, 'the request is accepted')
  const url = new URL(posted.body.url)
  const id = url.hash.replace(/^#panorama-window=/, '')
  assert.ok(id.length > 0, 'the address carries a window id in its fragment')
  assert.equal(url.searchParams.get('window'), id, 'the id is also visible as a query parameter')
  return { url, id }
}

{
  const { call } = boot({ webApp: 'http://127.0.0.1:43120/' })
  const { url, id } = await requestWindow(call, 'session-a')
  assert.ok(url.href.startsWith('http://127.0.0.1:43120/'), 'the address is the advertised origin')
  assert.equal(url.searchParams.getAll('token').length, 1, 'exactly one token input')

  const claimed = await call(INTENT + '?id=' + encodeURIComponent(id), { method: 'GET' })
  assert.equal(claimed.body.sessionId, 'session-a', 'the addressed window receives its Session')
  const second = await call(INTENT + '?id=' + encodeURIComponent(id), { method: 'GET' })
  assert.equal(second.body.sessionId, null, 'a claim is single use')

  /* The main window and ordinary tabs carry no fragment, so they claim nothing. */
  assert.equal((await call(INTENT, { method: 'GET' })).body.sessionId, null, 'an unaddressed request claims nothing')

  const withoutSession = await requestWindow(call, null)
  assert.equal((await call(INTENT + '?id=' + withoutSession.id, { method: 'GET' })).body.sessionId, null,
    'a Session-less window is still allowed and claims an empty target')

  const invalid = await call(INTENT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' })
  assert.equal(invalid.status, 400, 'a malformed body is rejected')
}

/* ── every window is addressed distinctly ───────────────────────────────── */

{
  const { call } = boot({ webApp: 'http://127.0.0.1:43120/' })
  const first = await requestWindow(call, 's')
  const second = await requestWindow(call, 's')
  assert.notEqual(first.id, second.id, 'each window gets its own id')
  assert.notEqual(first.url.href, second.url.href,
    'identical addresses let a browser focus the existing tab instead of opening a window')
  assert.equal((await call(INTENT + '?id=' + encodeURIComponent(second.id), { method: 'GET' })).body.sessionId, 's',
    'the second window claims its own Session')
  assert.equal((await call(INTENT + '?id=' + encodeURIComponent(first.id), { method: 'GET' })).body.sessionId, 's',
    'the first window keeps its own Session')
}

/* ── address source order and absence ───────────────────────────────────── */

{
  const serverOnly = boot({ webServer: 'http://127.0.0.1:9999' })
  const posted = await serverOnly.call(INTENT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId: 's' }),
  })
  assert.ok(posted.body.url.startsWith('http://127.0.0.1:9999'), 'the listener origin is the fallback')

  const none = boot({})
  const unavailable = await none.call(INTENT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId: 's' }),
  })
  assert.equal(unavailable.status, 503, 'no address is reported, never a guessed one')
  assert.equal(unavailable.body.error, 'address-unavailable')
}

/* ── Desktop browser gate ───────────────────────────────────────────────── */

{
  const disabled = boot({ webApp: 'http://127.0.0.1:43120/', desktopAccess: { ordinaryBrowserEnabled: false } })
  const refused = await disabled.call(INTENT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId: 's' }),
  })
  assert.equal(refused.status, 409, 'a gate-closed Desktop refuses instead of opening an unusable page')
  assert.equal(refused.body.error, 'browser-access-disabled')
  assert.equal((await disabled.call(INTENT, { method: 'GET' })).body.sessionId, null, 'no intent is left behind')

  const enabled = boot({ webApp: 'http://127.0.0.1:43120/', desktopAccess: { ordinaryBrowserEnabled: true } })
  const allowed = await enabled.call(INTENT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId: 's' }),
  })
  assert.equal(allowed.status, 200, 'enabled browser access mints an address')

  const plainWeb = boot({ webApp: 'http://127.0.0.1:43120/' })
  assert.equal((await plainWeb.call(INTENT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId: 's' }),
  })).status, 200, 'a plain dsh web Host has no Desktop gate')
}

/* ── absent connection: the plugin must not throw ───────────────────────── */

{
  const { routes } = boot({ connection: false })
  assert.equal(routes.size, 0, 'no connection service means no routes, and no crash')
}

const source = await readFile(path.join(root, 'index.js'), 'utf8')
assert.ok(source.includes("scope.get('connection')"), 'the connection service is read from the global store')
assert.ok(!source.includes('scope.connection.'), 'the topology-sensitive scope proxy is not used for services')

console.log('panorama-mode host test passed')
