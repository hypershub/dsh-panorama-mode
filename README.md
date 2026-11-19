# Panorama mode

[简体中文](README.zh-CN.md) · [Configuration](docs/configuration.md) · [Development](docs/development.md) · [Changelog](CHANGELOG.md)

**A live, cinematic view of AI execution inside DeepSeek Harness / Hypers Work.**

Panorama adds a button to the conversation header. Open it to follow reasoning, tool execution, task progress and replies through a particle orb, activity list and live preview. It is an independent Cordis bundle that integrates through public extension points without modifying the agent loop.

## Features

- Live reasoning and response text from the current conversation.
- Tool execution rows with stable identities, completion/error states and elapsed time; nested calls are included.
- Current-turn todo progress when available; an indeterminate activity indicator otherwise.
- State-driven automatic colors: ice for idle, aurora for thinking, ember for execution/waiting/error, mint for completed turns.
- A continuous, one-direction orbit head, separate from actual task progress.
- Configurable brand name, callsign (default **AVA**), subtitle, unit, palette, motion and particle density.
- Recent replies and provider-reported token accounting.
- English/Chinese entry labels and a WebGL fallback.

## Install

The repository includes the built `client.js`; installing the bundle does not require a build script.

```sh
git clone https://github.com/simonguo/dsh-panorama-mode.git
```

In your Harness conversation, ask the agent to install the cloned directory using the **Plugin Manager** tool:

```text
Install this bundle using plugin_manager:
action: install_bundle
target: /absolute/path/to/dsh-panorama-mode
```

Use the absolute clone path on your own machine. `plugin_manager` is a Harness tool, **not a shell command**. Installation applies to the current Profile. Do not manually edit Profile manifests or copy the plugin into the application installation.

An npm publication/market catalog entry is not established by this GitHub repository. Do not assume `npm install dsh-panorama-mode` is available until a release is published.

## Use

1. Open a conversation with content and click **Panorama** (Chinese: **全景模式**) in the top-right header utilities.
2. Use the gear button or **S** to open settings. Changes apply immediately and persist in local browser storage.
3. Use **Esc** or the close button to return to the conversation. When settings are open, Esc closes settings first; in a text field it first leaves editing.

Panorama covers the current app viewport. It does **not** request or exit browser/native fullscreen. Use the application's native window controls for fullscreen.

After changing an installed local bundle, rebuild it and reload the client window. A refreshed Host/plugin activation is not proof that an already-open client is using new JavaScript.

## Progress is not a timer simulation

The original reference demo advances predefined steps using predefined durations. Real AI execution does not know its future tool count or elapsed time, so Panorama does not fabricate a countdown.

| Situation | Display |
| --- | --- |
| A successful `todo_write` belongs to this turn | Completed items / total items, labelled **todo completion progress** |
| No current-turn plan | Observed tool count and indeterminate activity; no percentage or ETA |
| Todo list reaches 100% while AI continues | Plan is complete, but the turn stays active |
| Turn ends with `reason.kind === completed` | Completed-turn feedback |
| Approval/question is pending | Waiting state; active scan pauses |
| Abort/error/interruption | Stopped/error state, never a success delivery |

Counts reflect the **loaded Chat window**, not guaranteed full-session history. Tokens are settled provider accounting, not a live token estimate. Recent items are replies, not proof that files were uploaded or published.

## Compatibility and privacy

The API integration was inspected against the installed **DSH core 0.2.2-rc.1**. It uses public `conversation.session.header.utilities` / `shell.overlay` slots, `useChat`, `useSession`, `useProjection` and the optional Session status hook. Later core versions require rechecking their Chat and Slot APIs; universal version/platform compatibility is not claimed.

The Host owns a single authenticated, owner-only read endpoint: `GET /api/panorama-mode/config`. The plugin registers no agent tools, changes no prompts, writes no Session events and adds no external telemetry or CDN resources. Appearance settings are stored locally. Conversation snippets shown on the screen may contain private task text; take care when screen-sharing.

## Development

```sh
npm ci
npm run build
npm test
```

Node.js 22+ is used for package development; the Harness runtime must satisfy its own version requirements. React is a dev-only test dependency; the browser uses the Harness-provided React instance.

See [development and verification](docs/development.md) for source organization, replay fixtures, packaging and live acceptance checks.

## Known limitations

- The host hides header utilities for blank conversations; the button appears after content is present.
- The desktop layout is authored at 1920×1080 and scaled as a unit. Small/mobile layouts are not optimized.
- State/data testing and SSR do not validate WebGL pixels, browser transport or actual window interaction.
- Whole-Chat subscriptions and loaded-window folding are intentionally simple; very long loaded conversations may need a future incremental projection.
- Some secondary operational labels remain Chinese/code-oriented even with an English locale.
- Appearance storage is browser/origin-local, not account/cloud synchronization. The historical storage key is retained for upgrade compatibility.

## License and attribution

The plugin code is distributed under the [MIT license](LICENSE). See [third-party notices](THIRD_PARTY_NOTICES.md) for the Hypers mark, provided reference artwork/code and shader attribution limitations. Bundled brand artwork does not imply a trademark grant.
