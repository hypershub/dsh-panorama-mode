#!/usr/bin/env node
/**
 * Cheap structural checks that need no Harness runtime: JavaScript syntax for
 * both halves, manifest shape, patch shape, locale JSON, and the icon.
 */
import { readFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []

const check = (condition, message) => {
  if (!condition) failures.push(message)
}

for (const file of ['index.js', 'client.js']) {
  try {
    execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'pipe' })
  } catch (error) {
    failures.push(`${file}: ${String(error.stderr || error.message).split('\n').slice(0, 4).join(' ')}`)
  }
}

const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
check(manifest.type === 'module', 'package.json: type must be module')
check(Boolean(manifest.dsh?.bundle?.patch), 'package.json: dsh.bundle.patch is missing')
check(manifest.dsh?.client?.platform === 'web', 'package.json: dsh.client.platform must be web')
check(manifest.exports?.['./client'] === './client.js', 'package.json: ./client export is missing')
check(manifest.exports?.['./locale/*.json'] === './locale/*.json', 'package.json: locale export is missing')
check(manifest.exports?.['./icon'] === './icon.svg', 'package.json: icon export is missing')
for (const file of ['index.js', 'client.js', 'cordis.patch.yml', 'icon.svg']) {
  check(manifest.files.includes(file), `package.json: files must include ${file}`)
}

const patch = await readFile(path.join(root, 'cordis.patch.yml'), 'utf8')
check(patch.includes('name: \'@hypershub/dsh-panorama-mode\''), 'cordis.patch.yml: bundle row must name dsh-panorama-mode')
check(patch.includes('id: panorama-mode'), 'cordis.patch.yml: row id panorama-mode is missing')

for (const locale of ['en', 'zh']) {
  const data = JSON.parse(await readFile(path.join(root, 'locale', `${locale}.json`), 'utf8'))
  check(Boolean(data.meta?.title), `locale/${locale}.json: meta.title is missing`)
  check(Boolean(data.meta?.description), `locale/${locale}.json: meta.description is missing`)
}

const icon = await readFile(path.join(root, 'icon.svg'), 'utf8')
check(icon.trimStart().startsWith('<svg'), 'icon.svg: not an SVG document')
check((await stat(path.join(root, 'icon.svg'))).size < 256 * 1024, 'icon.svg: exceeds 256 KiB')

const client = await readFile(path.join(root, 'client.js'), 'utf8')
check(client.includes("id: '@hypershub/dsh-panorama-mode'"), 'client.js: loader id must be dsh-panorama-mode')
check(client.includes("return { name: 'dsh-panorama-mode-client'"), 'client.js: client export is missing')

/* Exact connection.fetch routes: the Harness rejects any path segment outside
   [A-Za-z0-9_$.-], and a rejected registration leaves the route silently absent. */
const SEGMENT = /^[A-Za-z0-9_$.-]+$/
const routeSources = { 'index.js': await readFile(path.join(root, 'index.js'), 'utf8'), 'client.js': client }
for (const [file, text] of Object.entries(routeSources)) {
  for (const match of text.matchAll(/['"`](\/api\/[^'"`]*)['"`]/g)) {
    const route = match[1]
    const segments = route.slice('/api/'.length).split('/')
    const valid = segments.every(segment => segment !== '' && segment !== '.' && segment !== '..' && SEGMENT.test(segment))
    check(valid, `${file}: Fetch route ${route} would be rejected by the Harness segment pattern`)
  }
}

/* Element-props lint: a component that reads `t` must be handed one.
   Without browser control this is the cheapest stand-in for a rendered
   tree walk over the composer the unit test cannot execute (StageShell). */
const T_USERS = new Set([
  'StageHeader', 'StageIdentity', 'StageCaps', 'StageIdleCard', 'StageTaskCard',
  'StagePreview', 'StageProgress', 'StageDelivered', 'StageRecent', 'StageStream',
  'StageStats', 'StageSettings', 'StageOrbColumn',
])

const readObject = start => {
  let depth = 0
  for (let i = start; i < client.length; i++) {
    const char = client[i]
    if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) return client.slice(start, i + 1)
    }
  }
  return ''
}

const elementPattern = /h\((Stage[A-Za-z]+), \{/g
let match
while ((match = elementPattern.exec(client)) !== null) {
  const name = match[1]
  if (!T_USERS.has(name)) continue
  const props = readObject(match.index + match[0].length - 1)
  check(/(^|[{,])\s*t\s*[,}]/.test(props.slice(1)), `${name} is rendered without a translator prop`)
}

if (failures.length > 0) {
  console.error('panorama-mode check failed:')
  for (const failure of failures) console.error(' - ' + failure)
  process.exitCode = 1
} else {
  console.log('panorama-mode check passed')
}
