# Development and verification / 开发与验证

## Local commands

```sh
npm ci
npm run build
npm test
npm pack --dry-run
```

Node.js 22+ is supported for this package's build/test commands. No postinstall or prepare script runs on installation. React 18.3.1 and React DOM are local dev-only SSR test dependencies; no application path or installed macOS app is needed to run tests.

开发测试不依赖本机应用安装路径，React 仅作为本地开发依赖。安装插件不执行 postinstall/prepare 脚本。

## Source layout

| File | Responsibility |
| --- | --- |
| `index.js` | Normalize deployment defaults; register owner-only local config route |
| `cordis.patch.yml` | Independent bundle row, default config |
| `src/client/00-head.js` | Appearance settings, palettes, helpers, presentation cache |
| `src/client/10-css.js` | 1920×1080 layout and UI artwork |
| `src/client/20-orb.js` | WebGL particle sphere, circular orbit and state transitions |
| `src/client/30-model.js` | Read published Chat wrappers, derive execution/progress presentation |
| `src/client/40-panels.js` | Header, tool/plan rows, preview, activity and reply cards |
| `src/client/50-settings.js` | Appearance controls |
| `src/client/60-shell.js` | Viewport frame, keyboard/close interaction |
| `src/client/70-slots.js` | Locale strings, Session feed and public Slot registrations |
| `src/client/brand-logo.js` | Inlined HypersHub brand mark (base64 data URI), provenance in third-party notices |
| `client.js` | Generated browser loader bundle; tracked for installation without a build |
| `scripts/build.mjs` | Assemble authored parts into the loader factory |
| `scripts/check.mjs` | Syntax, manifest, resource and translator-prop checks |
| `scripts/test-model.mjs` | Keyed Chat fixture tests, SSR and appearance persistence tests |

Edit source parts, then regenerate `client.js`. The factory requests only Harness-provided React; it must not import private client components. Host integration and frontend runtime imports have different requirements. Re-inspect public APIs before core upgrades.

## Execution data

`useChat` returns the published Chat snapshot, not `SessionSnapshot.chat`. The installed builder publishes fresh Chat snapshots as content changes. Read `chat.order` and `chat.nodes.get(key)` to access wrappers; a tool wrapper has `kind: tool-call`, `data.root`, and `location` that identifies the turn. The result payload has no turn field. Nested calls are read from `root.subCalls`.

状态来自公开 Chat 快照；不要读取不存在的 `SessionSnapshot.chat`，也不要根据工具结果自身猜测所属轮次。动画是界面状态，不写入会话记录。

A plan denominator is admitted only after an observed successful `todo_write` in the current turn. Its count is not a time estimate. A green successful turn requires a completed end reason, not merely an idle agent or a fully checked plan. A pending human interaction pauses the active scan.

## Automated coverage

- Realistic keyed wrapper fields, including results without a `turn` field.
- Stable call row identity from start to settlement.
- Current-turn filtering, nested calls and elapsed durations.
- Reasoning/reply streams and phase transitions.
- New-turn isolation from old plans; 100%-plan while still running.
- Completed, aborted/error and pending-human states.
- Full component tree SSR and missing translator regression checks.
- Automatic/fixed palettes and configurable brand/callsign persistence.
- Removed fullscreen APIs/setting and two-button header.

These are synthetic fixture and SSR checks, **not a real Loader/browser end-to-end run**. Do not report them as proof that WebGL pixels, client transport, HMR or native interaction work.

## Live acceptance checklist

1. Install via Plugin Manager in an authorized test Profile; reload the client.
2. Confirm the header button and localized plugin metadata, including icon.
3. Run a task with a todo list and several tool calls. Open Panorama during the run.
4. Observe reasoning → tool spinning → result/checkmark → next step → final reply.
5. Verify plan percentage is labelled, and a task without a plan has no fabricated percentage/ETA.
6. Test failure, user stop and pending approval; ensure these do not show successful delivery.
7. Confirm one-direction orbit continuity, no reverse movement at its seam.
8. Change automatic/fixed color, brand name and callsign; reload and verify persistence.
9. Close with Esc/settings/close controls; verify the original conversation is unchanged.
10. Disable the plugin, confirm all registrations disappear, then enable and reload.

视觉验收应使用真正安装的页面，不应使用模拟 HTML 截图代替。无浏览器控制时明确报告未验证的项目。

## Distribution

`npm pack --dry-run` checks the installable file roster. The package ships runtime, patch, metadata, icon, license and user docs; source and test files remain available in Git. Git push does not publish an npm package or register it in a market. Publish only on a separate explicit request, after checking notices and compatibility.
