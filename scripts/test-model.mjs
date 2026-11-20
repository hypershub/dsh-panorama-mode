#!/usr/bin/env node
/**
 * Model-fold and render-function smoke test.
 *
 * Loads the real `client.js` bundle the way the Harness module loader does
 * (a factory registration), then exercises the pure snapshot fold and calls
 * every presentational component directly. No DOM, no React renderer and no
 * fake Harness: React is used only to build element trees.
 */
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import assert from 'node:assert/strict'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const requireLocal = createRequire(import.meta.url)
const React = requireLocal('react')
const { renderToStaticMarkup } = requireLocal('react-dom/server')

/* Minimal browser globals the bundle touches at definition time. */
const storage = new Map()
globalThis.window = {
  __AVA_STAGE_TEST__: true,
  localStorage: {
    getItem: key => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key),
  },
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  addEventListener() {},
  removeEventListener() {},
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: id => clearTimeout(id),
  fetch: async () => ({ ok: false, json: async () => null }),
  innerWidth: 1440,
  innerHeight: 900,
  devicePixelRatio: 2,
}
globalThis.document = { addEventListener() {}, removeEventListener() {}, head: { appendChild() {} }, createElement: () => ({}) }
globalThis.localStorage = window.localStorage
globalThis.performance = globalThis.performance || { now: () => Date.now() }

let registered = null
globalThis.window.__ModuleLoader__ = { load: definition => { registered = definition } }

const source = await readFile(path.join(root, 'client.js'), 'utf8')
new Function('window', 'document', source)(globalThis.window, globalThis.document)
assert.ok(registered, 'client bundle did not register a factory')
assert.equal(registered.id, '@hypershub/dsh-panorama-mode')

const ReactDOM = requireLocal('react-dom')
const api = registered.factory(name => {
  if (name === 'react') return React
  if (name === 'react-dom') return ReactDOM
  throw new Error('unexpected module request: ' + name)
})
assert.equal(api.name, 'dsh-panorama-mode-client')
assert.deepEqual(api.inject, ['slots', 'locale'])
assert.equal(typeof api.apply, 'function')

const { buildModel, EMPTY_MODEL } = globalThis.window.__AVA_STAGE_TEST_API
const t = key => key

/* Real published Chat wrapper fixtures. Settled ToolResult has NO turn. */
const timeline = (turn,status,startTime,endTime,reason='completed') => ({turnOrder:[turn],turns:new Map([[turn,{turn,status,start:{time:startTime},end:endTime?{time:endTime,data:{reason:{kind:reason}}}:undefined,steps:[]}]])})
const wrapper=(key,kind,data,turn=3,seq=1)=>({key,kind,data,anchorSeq:seq,location:{kind:'step',turn:{turn},step:{step:1}}})
const chatOf=(rows,status='open',reason='completed',turn=3)=>({order:rows.map(r=>r.key),nodes:{get:key=>rows.find(r=>r.key===key)},timeline:timeline(turn,status,1000,status==='closed'?9000:null,reason)})
const call=(id,name='read')=>({callId:id,name,time:2000,turn:3,step:1,phase:'start',argsRaw:'{"path":"/tmp/a.txt"}',subCalls:[]})
const result=(id,name='read',error=false)=>({kind:'tool-result',callId:id,name,time:3200,callTime:2000,call:{name,argsRaw:'{"path":"/tmp/a.txt"}'},isError:error,content:[],subCalls:[]})
const asst=(status,text)=>({status,turn:3,step:1,time:4000,blocks:[{kind:'text',text}]})
const base={sessionId:'s1',now:5000}
const empty=buildModel({...base,running:false,chat:{order:[],nodes:{get:()=>undefined},timeline:{turnOrder:[],turns:new Map()}}})
assert.equal(empty.display,'idle')
const thinking=buildModel({...base,running:true,chat:chatOf([wrapper('a','assistant-step',{status:'running',time:1900,blocks:[{kind:'reasoning',text:'Inspecting the input'}]})])})
assert.equal(thinking.display,'thinking');assert.equal(thinking.progress,null);assert.equal(thinking.indeterminate,true)
assert.ok(thinking.previewText.includes('Inspecting'))
const started=buildModel({...base,running:true,chat:chatOf([wrapper('tool','tool-call',{root:call('c1')})])})
assert.equal(started.steps[0].state,'active')
const finishedTool=buildModel({...base,running:true,chat:chatOf([wrapper('tool','tool-call',{root:result('c1')})])})
assert.equal(finishedTool.steps[0].state,'done')
assert.equal(finishedTool.steps[0].key,started.steps[0].key,'tool row keeps its identity at settlement')
assert.equal(finishedTool.steps[0].duration,1200)
assert.equal(finishedTool.stepTotal,1,'turnless result is counted through wrapper location')
const todoResult=wrapper('plan','tool-call',{root:result('todo','todo_write')})
const plan=[{content:'Inspect',status:'completed'},{content:'Patch',status:'in_progress'}]
const running=buildModel({...base,running:true,todos:plan,chat:chatOf([todoResult,wrapper('tool','tool-call',{root:call('c2')}),wrapper('a','assistant-step',asst('running','Reading the file now'))])})
assert.equal(running.progress,.5);assert.equal(running.progressBasis,'plan');assert.equal(running.steps[0].name,'Inspect')
assert.equal(running.steps[1].state,'active');assert.equal(running.todos.done,1)
const stale=buildModel({...base,running:true,todos:plan.map(x=>({...x,status:'completed'})),chat:chatOf([wrapper('tool','tool-call',{root:call('new')})])})
assert.equal(stale.progress,null,'prior plan cannot grant a new turn 100%')
const allPlanned=buildModel({...base,running:true,todos:plan.map(x=>({...x,status:'completed'})),chat:chatOf([todoResult,wrapper('a','assistant-step',asst('running','Finishing the explanation'))])})
assert.equal(allPlanned.progress,1);assert.notEqual(allPlanned.display,'done','100% plan is not turn completion')
const done=buildModel({...base,running:false,chat:chatOf([wrapper('tool','tool-call',{root:result('c1')}),wrapper('a','assistant-step',asst('settled','Done.'))],'closed'),usage:{uncachedInputTokens:1000,cacheReadTokens:3000,cacheWriteTokens:0,outputTokens:500},stats:{turns:4,steps:9}})
assert.equal(done.display,'done');assert.equal(done.progress,1);assert.equal(done.deliverable.text,'Done.')
assert.equal(done.tokens.total,4500);assert.equal(done.tokens.cacheHit,75)
const failed=buildModel({...base,running:false,chat:chatOf([wrapper('tool','tool-call',{root:result('bad','read',true)})],'closed','error')})
assert.equal(failed.display,'error');assert.equal(failed.progress,null);assert.equal(failed.deliverable,null)
const waiting=buildModel({...base,running:true,pendingInteraction:{kind:'approval'},chat:chatOf([wrapper('tool','tool-call',{root:call('pending')})])})
assert.equal(waiting.display,'waiting');assert.equal(waiting.indeterminate,false)
const nested=result('root','workflow');nested.subCalls=[result('child')]
assert.equal(buildModel({...base,running:true,chat:chatOf([wrapper('ptc','tool-call',{root:nested})])}).stepTotal,2)
const older=wrapper('old','tool-call',{root:result('older')},2)
assert.equal(buildModel({...base,running:true,chat:chatOf([older,wrapper('t','tool-call',{root:call('new')})])}).stepTotal,1)
const interrupted=buildModel({...base,running:false,chat:chatOf([wrapper('t','tool-call',{root:call('new')})],'closed','aborted')})
assert.equal(interrupted.steps[0].state,'stopped');assert.equal(interrupted.deliverable,null)

/* ── presentational smoke: every component with every model ─────────────── */

const settings = { accent: 'ember', callsign: 'AVA', tagline: 'DIGITAL EMPLOYEE', unit: 'APAC-01', motion: 'normal', density: 'normal', showStream: true, showStats: true, showRecent: true }
const noop = () => {}
const components = Object.entries({
  StageHeader: { model: done, settingsOpen: false, onSettings: noop, onClose: noop, t },
  StageIdentity: { model: running, settings, t },
  StageIdleCard: { model: empty, settings, t, out: true },
  StageTaskCard: { model: running, t, out: false },
  StageRecent: { model: done, t },
  StageStream: { model: running, t },
  StageStats: { model: done, t },
  StageProgress: { model: running, t },
  StageSettings: { settings, onChange: noop, onReset: noop, onClose: noop, t },
})

for (const [name, props] of components) {
  const component = globalThis.window.__AVA_STAGE_TEST_API[name]
  assert.equal(typeof component, 'function', name + ' is not exported for testing')
  for (const model of [EMPTY_MODEL, empty, running, done, failed, thinking]) {
    const merged = { ...props, model }
    assert.doesNotThrow(() => component(merged), name + ' threw for display=' + model.display)
  }
}

/* ── composition contract: every translator consumer gets a function ────── */

const T_USERS = new Set([
  'StageHeader', 'StageIdentity', 'StageCaps', 'StageIdleCard', 'StageTaskCard', 'StagePreview',
  'StageProgress', 'StageDelivered', 'StageRecent', 'StageStream', 'StageStats', 'StageSettings',
])

const childrenOf = props => {
  const children = props && props.children
  if (children === undefined || children === null) return []
  return Array.isArray(children) ? children.flat() : [children]
}

const walkTree = (node, trail) => {
  if (node === null || node === undefined || typeof node !== 'object') return
  if (Array.isArray(node)) {
    node.forEach(child => walkTree(child, trail))
    return
  }
  if (!('props' in node) || node.$$typeof === undefined) return
  const type = node.type
  const name = typeof type === 'function' ? type.name : ''
  if (typeof type === 'function' && T_USERS.has(name)) {
    assert.equal(typeof node.props.t, 'function', name + ' renders without a translator (via ' + trail + ')')
  }
  for (const child of childrenOf(node.props)) walkTree(child, trail + ' > ' + (name || String(type)))
}

const stageApi = globalThis.window.__AVA_STAGE_TEST_API
const roots = [
  ['StageOrbColumn', { model: running, settings, t }],
  ['StageHeader', { model: done, settingsOpen: false, onSettings: noop, onClose: noop, t }],
  ['StageIdleCard', { model: empty, settings, t, out: false }],
  ['StageTaskCard', { model: running, t, out: false }],
  ['StageRecent', { model: done, t }],
  ['StageStream', { model: running, t }],
  ['StageStats', { model: done, t }],
  ['StageSettings', { settings, onChange: noop, onReset: noop, onClose: noop, t }],
]
for (const [name, props] of roots) {
  const element = stageApi[name](props)
  walkTree(element, name)
}

/* A leaf rendered without `t` must degrade to its key, never throw. */
const keyOnly = stageApi.StageIdentity({ model: running, settings })
assert.ok(keyOnly, 'StageIdentity must render with the fallback translator')
const flattened = JSON.stringify(keyOnly, (key, value) => (typeof value === 'function' ? '[fn]' : value))
assert.ok(flattened.includes('statusWorking'), 'fallback translator must yield the raw key')

/* A settings payload with unknown enum values must not break the sheet. */
assert.doesNotThrow(() =>
  globalThis.window.__AVA_STAGE_TEST_API.StageSettings({ settings: { ...settings, accent: 'nope', motion: 'nope' }, onChange: noop, onReset: noop, onClose: noop, t }),
)

/* ── feed wiring: the chat snapshot comes from the useChat standard hook ── */
/* SessionSnapshot carries lifecycle state only; reading `snapshot.chat`
   silently produced an empty stage. This locks the correct hook. */

{
  const calls = []
  const fixtureChat = {
    order: [],
    nodes: { get: () => undefined, source: () => ({ getSnapshot: () => undefined, subscribe: () => () => {} }), bottomSource: () => ({ getSnapshot: () => false, subscribe: () => () => {} }), turnDataSource: () => ({ getSnapshot: () => [], subscribe: () => () => {} }), processSource: () => ({ getSnapshot: () => undefined, subscribe: () => () => {} }), values: () => [] },
    locations: { getTurn: () => [], getStep: () => [] },
    navigation: { items: () => [] },
    timeline: timeline(2, 'open', Date.now() - 3000),
    legacy: { nodes: [], runningCalls: [], partial: null },
  }
  const lifecycle = { running: true, pendingSubmissions: [], blank: false }
  const feedProps = {
    sessionId: 's1',
    t,
    useSession: selector => {
      calls.push('useSession')
      const value = selector(lifecycle)
      assert.equal(value && value.chat, undefined, 'SessionSnapshot must not be the chat source')
      return value
    },
    useChat: selector => {
      calls.push('useChat')
      const value = selector(fixtureChat)
      assert.ok(value && value.legacy, 'useChat must expose the ChatSnapshot')
      return value
    },
    useProjection: () => null,
    useSessions: selector => selector({ byId: { s1: { displayTitle: 'Demo', cwd: '/work' } } }),
  }
  const markup = renderToStaticMarkup(React.createElement(stageApi.StageFeed, feedProps))
  assert.equal(markup, '', 'the feed renders nothing')
  assert.ok(calls.includes('useChat'), 'the feed must subscribe to the chat snapshot through useChat')
}

/* ── full-tree SSR render (real React, real components) ────────────────── */
/* Effects do not run here, so this exercises every render path — hooks,
   hooks ordering, prop composition and element types — without a DOM. */

for (const model of [EMPTY_MODEL, empty, running, done, failed, thinking]) {
  stageApi.store.set({ open: true, model })
  const html = renderToStaticMarkup(React.createElement(stageApi.StageShell, { t, onClose: noop }))
  assert.ok(html.includes('class="dvs-root"'), 'shell markup is missing its root')
  assert.ok(html.includes('dvs-frame'), 'shell markup is missing the 1920×1080 frame')
  assert.ok(html.includes('data:image/png;base64,'), 'shell markup is missing the inlined HypersHub mark')
  assert.ok(html.includes('class="dvs-mark"'), 'shell markup is missing the brand mark container')
  if (!globalThis.__logoChecked) {
    globalThis.__logoChecked = true
    const uri = html.match(/src="(data:image\/png;base64,[^"]+)"/)?.[1]
    assert.ok(uri, 'brand mark is not an inlined PNG data URI')
    const png = Buffer.from(uri.split(',')[1], 'base64')
    assert.equal(png.subarray(1, 4).toString(), 'PNG', 'brand mark bytes are not a PNG')
    assert.equal(png.readUInt32BE(16), 76, 'brand mark width changed')
    assert.equal(png.readUInt32BE(20), 88, 'brand mark height changed')
  }
  assert.ok(html.includes('dvs-panel'), 'shell markup is missing the right-hand panel')
  assert.ok(html.includes('dvs-identity'), 'shell markup is missing the identity block')
  assert.ok(html.includes(settings.callsign), 'shell markup is missing the callsign')
  assert.ok(html.includes('dvs-card'), 'shell markup is missing the panel cards')
  assert.ok(!html.includes('is not a function'), 'a translator or callback was missing at render time')
  const overlay = renderToStaticMarkup(React.createElement(stageApi.StageOverlay, { t }))
  assert.ok(overlay.includes('dvs-root'), 'overlay did not render while open')
  if (process.env.AVA_STAGE_DUMP) {
    const { writeFileSync } = await import('node:fs')
    writeFileSync(process.env.AVA_STAGE_DUMP + '-' + model.display + '.html', html)
  }
}

stageApi.store.set({ open: false })
assert.equal(renderToStaticMarkup(React.createElement(stageApi.StageOverlay, { t })), '', 'closed overlay must render nothing')

for (const [state,key] of Object.entries({idle:'ice',thinking:'aurora',working:'ember',waiting:'ember',error:'ember',done:'mint'})) {
  assert.equal(stageApi.paletteFor({accent:'auto'},{display:state}),stageApi.PALETTES[key])
  assert.equal(stageApi.paletteFor({accent:'ice'},{display:state}),stageApi.PALETTES.ice,'manual choice remains fixed')
}
assert.equal(stageApi.resolveSettings({accent:'auto'}).accent,'auto')
assert.ok(!source.includes('requestFullscreen'), 'Panorama must not request browser fullscreen')
assert.ok(!source.includes('exitFullscreen'), 'closing Panorama must not exit native fullscreen')
assert.ok(!source.includes('defaultFullscreen'), 'removed setting must not be exposed')
const headerMarkup = renderToStaticMarkup(React.createElement(stageApi.StageHeader,{model:empty,settingsOpen:false,onSettings:noop,onClose:noop,t}))
assert.equal((headerMarkup.match(/<button/g)||[]).length,2,'header has only settings and close')
assert.ok(headerMarkup.includes('preserveAspectRatio="xMidYMid meet"'),'gear keeps square proportions')
storage.set('dsh-ava-stage.settings.v1',JSON.stringify({callsign:'NOVA',accent:'mint',defaultFullscreen:true}))
assert.equal(stageApi.resolveSettings(null).callsign,'NOVA','rename preserves callsign')
assert.equal(stageApi.resolveSettings(null).accent,'mint','rename preserves fixed palette')
assert.ok(!('defaultFullscreen' in stageApi.resolveSettings(null)),'legacy fullscreen flag is ignored')
assert.equal(stageApi.resolveSettings(null).brandName,'Hypers Work','old settings gain the default brand name')
storage.set('dsh-ava-stage.settings.v1',JSON.stringify({brandName:'星辰 Studio',callsign:'NOVA'}))
const customSettings = stageApi.resolveSettings(null)
assert.equal(customSettings.brandName,'星辰 Studio')
const brandedHeader = renderToStaticMarkup(React.createElement(stageApi.StageHeader,{model:empty,settings:customSettings,settingsOpen:false,onSettings:noop,onClose:noop,t}))
assert.ok(brandedHeader.includes('星辰 Studio'),'custom brand appears in the header')
const {normalizeConfig} = await import('../index.js')
assert.equal(normalizeConfig({brandName:'  星辰  Studio  '}).brandName,'星辰 Studio')
assert.equal(normalizeConfig({brandName:'   '}).brandName,'Hypers Work')
for(const bad of ['javascript:alert(1)','data:text/html,x','//example.com','https://user:password@example.com'])assert.equal(stageApi.safeTarget(bad),null)
assert.equal(stageApi.plainMarkdown('## Done **now** [site](https://example.com)'),'Done now site')
const mixed='## Result\n\nHello **world**.\n\n[Video](https://example.com/a.mp4) [Report](./report.pdf) ![Image](https://example.com/a.png)\n\n<script>alert(1)</script>'
assert.deepEqual(stageApi.resultResources(mixed).map(x=>x.resourceKind),['video','document','image'])
const renderedResult=renderToStaticMarkup(React.createElement(stageApi.ResultMarkdown,{text:mixed,onOpen:noop}))
assert.ok(renderedResult.includes('<strong>world</strong>'))
assert.ok(!renderedResult.includes('<script>'))
assert.ok(!renderedResult.includes('<img'),'media cannot load until user clicks')
const twoReplies=buildModel({...base,running:false,chat:chatOf([wrapper('early','assistant-step',asst('settled','Earlier update')),wrapper('final','assistant-step',asst('settled',mixed))],'closed')})
assert.equal(twoReplies.recent.length,1,'one final result per turn')
assert.equal(twoReplies.recent[0].markdown,mixed)
const readerHtml=renderToStaticMarkup(React.createElement(stageApi.ResultReader,{result:twoReplies.recent[0],sessionId:'s1',onClose:noop,t}))
assert.ok(readerHtml.includes('dvs-reader'));assert.ok(readerHtml.includes('report.pdf'));assert.ok(!readerHtml.includes('<video'))
assert.equal(stageApi.safeTarget(' javascript:alert(1)'),null)
let clickedResult=null
const clickable=stageApi.StageDelivered({model:twoReplies,t,onResult:item=>{clickedResult=item}})
assert.equal(clickable.type,'button')
clickable.props.onClick()
assert.equal(clickedResult.markdown,mixed,'completion card opens its full result rather than clipped summary')
const fileChat=chatOf([wrapper('answer','assistant-step',asst('settled','The deck is ready.'))],'closed')
fileChat.timeline.turns.get(3).data={get:key=>key==='deliverables'?{presented:[
 {path:'/work/deck.pptx',description:'Exported deck',seq:40,index:0},
 {path:'/work/deck.univer',description:'Editable source',seq:40,index:1},
 {path:'/work/contact.png',description:'Preview',seq:40,index:2}]}:undefined}
const withFiles=buildModel({...base,running:false,chat:fileChat})
assert.deepEqual(withFiles.deliverable.presented.map(x=>x.extension),['pptx','univer','png'])
assert.equal(withFiles.deliverable.resources.length,3,'present files appear even when absent from reply Markdown')
assert.equal(withFiles.recent[0].presented.length,3,'historical result retains presented files')
const fileReader=renderToStaticMarkup(React.createElement(stageApi.ResultReader,{result:withFiles.deliverable,sessionId:'s1',onClose:noop,t}))
for(const name of ['deck.pptx','deck.univer','contact.png'])assert.ok(fileReader.includes(name))
assert.ok(!fileReader.includes('<img'),'local image does not bypass the native file opener')

/* ── browser window: one-shot Session handoff and menu placement ───────── */

{
  const host = await import('../index.js')
  let clock = 1000
  const intent = host.createWindowIntent(() => clock)
  const firstId = intent.remember('session-a')
  assert.ok(firstId.length > 0, 'each window request mints an id')
  assert.equal(intent.claim(null), null, 'an unaddressed page claims nothing')
  assert.equal(intent.claim('unknown-id'), null, 'an unknown id claims nothing')
  assert.equal(intent.claim(firstId), 'session-a', 'the addressed window claims its Session')
  assert.equal(intent.claim(firstId), null, 'a claim is single use')

  const secondId = intent.remember('session-b')
  assert.notEqual(secondId, firstId, 'two windows are addressed differently')
  clock += 90_000
  assert.equal(intent.claim(secondId), null, 'an expired intent is not delivered')
  assert.equal(intent.size(), 0, 'expired intents are dropped')

  assert.equal(host.normalizeConfig({}).brandName, 'Hypers Work')
  const hostSource = await readFile(path.join(root, 'index.js'), 'utf8')
  assert.ok(hostSource.includes("'/api/panoramaMode/windowIntent'"), 'the intent route uses Harness-valid segments')
  assert.ok(!/\/api\/panorama-mode\//.test(hostSource + source), 'hyphenated route segments are rejected by the Harness')
}

assert.deepEqual(stageApi.menuPlacement({ right: 300, bottom: 40 }, 1200, 236, 8), { top: 46, left: 64 })
assert.deepEqual(stageApi.menuPlacement({ right: 1190, bottom: 40 }, 1200, 236, 8), { top: 46, left: 954 }, 'menu right-aligns to the trigger and stays inside the viewport')
assert.deepEqual(stageApi.menuPlacement({ right: 200, bottom: 20 }, 200, 236, 8), { top: 26, left: 8 }, 'narrow viewport clamps to the left margin')

{
  const calls = []
  const previousOpen = window.open
  try {
    window.open = (url, target) => { calls.push([url, target]); return { opener: 'opener' } }
    const codes = []
    const closes = []
    stageApi.openAddress('http://127.0.0.1:1/?token=t', l => l, c => codes.push(c), () => closes.push('closed'))
    assert.deepEqual(calls, [['http://127.0.0.1:1/?token=t', '_blank']], 'a window opens at the minted address')
    assert.equal(closes.length, 1, 'success closes the menu')
    window.open = () => null
    const blocked = []
    stageApi.openAddress('http://127.0.0.1:1/', l => l, c => blocked.push(c), () => {})
    assert.deepEqual(blocked, ['popupBlocked'], 'a blocked popup is reported')
    window.dshDesktop = { protocolVersion: 1 }
    const shellCloses = []
    stageApi.openAddress('http://127.0.0.1:1/', l => l, c => blocked.push(c), () => shellCloses.push('closed'))
    assert.equal(shellCloses.length, 1, 'the native shell handing off to the system browser counts as success')
    delete window.dshDesktop
  } finally {
    window.open = previousOpen
  }
}

/* The window id travels in the fragment, which survives the token redirect. */
{
  const previous = globalThis.window.location
  const read = hash => {
    globalThis.window.location = { hash }
    return stageApi.windowIntentId()
  }
  try {
    assert.equal(read(''), null, 'an ordinary tab has no window id')
    assert.equal(read('#'), null)
    assert.equal(read('#session=abc'), null, 'an unrelated fragment is ignored')
    assert.equal(read('#panorama-window='), null, 'an empty id is ignored')
    assert.equal(read('#panorama-window=k3x9'), 'k3x9', 'the id is read from the fragment')
  } finally {
    globalThis.window.location = previous
  }
}

/* A Session switch must not close the stage a new window just opened. */
{
  const target = { state: { open: true, sessionId: 'a', model: { display: 'done' }, notice: null },
    get() { return this.state },
    set(patch) { this.state = { ...this.state, ...patch } } }
  const released = stageApi.releaseFeed(target, 'a')
  assert.equal(released, true, 'the departing feed releases its model')
  assert.equal(target.state.open, true, 'the stage stays open across a Session switch')
  assert.equal(target.state.model, null, 'only the model is dropped')
  assert.equal(stageApi.releaseFeed(target, 'b'), false, 'another Session cannot release this feed')
}

/* A new window retries until the requested Session is actually current. */
{
  let current = 'session-old'
  let attempts = 0
  const ok = await stageApi.claimSession('session-new', {
    attempts: 5,
    select: () => {
      attempts += 1
      if (attempts < 3) return false
      current = 'session-new'
      return true
    },
    current: () => current,
    later: callback => callback(),
  })
  assert.equal(ok, true, 'the claim resolves once the Session becomes current')
  assert.equal(attempts, 3, 'an unavailable selection is retried')

  const stolen = await stageApi.claimSession('session-a', {
    attempts: 3,
    select: () => true,
    current: () => 'session-b',
    later: callback => callback(),
  })
  assert.equal(stolen, false, 'a selection that never sticks reports failure')
}

/* The menu states the requirement before the item is used. */
const tr = key => key
assert.equal(stageApi.browserBlockedReason(null, tr), null, 'unknown capability adds no hint')
assert.equal(stageApi.browserBlockedReason({ browserAccess: 'unrestricted', address: true }, tr), null)
assert.equal(stageApi.browserBlockedReason({ browserAccess: 'enabled', address: true }, tr), null)
assert.equal(stageApi.browserBlockedReason({ browserAccess: 'disabled', address: true }, tr), 'browserAccessHint')
assert.equal(stageApi.browserBlockedReason({ browserAccess: 'unrestricted', address: false }, tr), 'addressHint')

const toggleMarkup = renderToStaticMarkup(React.createElement(stageApi.StageToggle, { sessionId: 's1', t: l => l, useSession: selector => selector({ running: false }) }))
assert.ok(toggleMarkup.includes('aria-haspopup="menu"'), 'toggle advertises its menu')
assert.ok(toggleMarkup.includes('aria-expanded="false"'), 'menu starts closed')
assert.ok(!toggleMarkup.includes('dvs-open-menu'), 'closed toggle portals no menu')
assert.ok(toggleMarkup.includes('dvs-open-caret'), 'toggle shows the disclosure caret')

console.log('panorama-mode model/render test passed')
