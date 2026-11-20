# Changelog

## 0.2.0 — 2026-11-20

- The header button now opens a menu with two destinations: **Open in this window** (unchanged viewport overlay) and **Open in a browser window**.
- A browser window is a real second client: the Host mints its authenticated address through `connection.authenticatedUrl` and the desktop hands that address to the system browser, so windows can live on different displays and run side by side.
- One-shot Session handoff keyed by that fragment id (single use, 90-second expiry): a token redirect cannot carry a query, so each opener records its Session and each new page claims one, in order (90-second TTL, consumed on first claim, in-process only, never logged or persisted).
- The claiming window selects its Session through the public `uiWorkspace.openSession` service before covering the viewport.
- Popup denial (native shell) is treated as success; a blocked popup in a plain browser and a missing address surface an inline message instead of failing silently.
- Detect the Desktop browser-access gate on the Host and answer `409 browser-access-disabled`: in native mode the shell returns `forbidden` to every ordinary browser, and browser access exists only in compatibility mode. The menu now explains the requirement instead of opening an unusable page.
- Each window is now addressed by an **inherited URL fragment** (`#panorama-window=<id>`). The token redirect drops the query string, so every window used to land on the identical `/` address and a browser could focus the existing tab instead of opening a window. The fragment survives that redirect, keeps addresses distinct, and tells the Host which intent this window claims — the main window and ordinary tabs carry no fragment and claim nothing.
- Fix: switching Sessions unmounted the feed and its cleanup closed the stage, so a freshly opened window lost the panorama the moment it claimed its Session. Releasing a feed now drops only that Session's model.
- A window that cannot claim or select its Session says so once inside the stage instead of showing an unexplained ordinary page.
- A second window now retries and verifies its Session selection. The workspace service persists the current selection in `localStorage['dsh.sessions.current']`, which every new window restores first; a single early `openSession` call was dropped while the Session list loaded, so both windows ended on the same conversation. The claim now retries until that persisted selection is the requested one.
- Ask the Host for its window capability when the menu opens (`/api/panoramaMode/state`), so the browser item shows a warning dot and the exact setting requirement before it is selected, instead of failing afterwards.
- Read the `connection` service through the global store (`ctx.get`), because the topology-sensitive `scope.<service>` proxy left both routes silently unregistered.
- New menu, placement clamping, intent-store and permissionless-SSR regressions.

### Scope

In-window mode is unchanged and remains the default. A browser window carries browser chrome, shares the same appearance storage, and cannot be opened from the compatibility shell, which denies popups without handing them to the system browser.
## 0.1.3 — 2026-11-20

- Replace the header mark with the HypersHub brand logo supplied by the owner, inlined as a 2x PNG data URI so no runtime request reaches the Hub origin.
- Drop the generated gradient tile: brand artwork renders at its own shape and color, unaffected by the accent palette.
- Move the mark into `src/client/brand-logo.js`; update provenance notices, development docs and the inline-PNG integrity regression.
## 0.1.2 — 2026-11-19

- Click completed/recent result cards to open a flat glass reading panel on the left while execution information remains visible.
- Render complete Markdown as React elements; clean card summaries and keep the last settled reply per turn.
- Merge DSH `deliverables.presented` files with reply links, including PPTX, Univer and PNG absent from reply text; distinguish presented files from prose references.
- Open local files with the native Session file-opening callback when mounted, with an explicit fallback message otherwise.
- Load images/videos only after a user gesture; never autoplay video or accept unsafe link schemes.
- Preserve bundled Marked license and add result/card/attachment regression coverage.
- Live browser media and native-file interaction acceptance remains separate from fixture/SSR tests.

## 0.1.1 — 2026-11-19

- Add GitHub Actions `publish.yml` using npm OIDC trusted publishing and provenance, without npm token secrets.
- Run identity checks, clean dependency installation, build, tests and artifact consistency before publication.
- Trigger only from stable version tags or explicit manual runs on main; serialize releases without cancelling in-flight publication.
- Document publisher setup and release operation. No visual runtime changes.

## 0.1.0 — 2026-11-19

Initial repository release / 首次仓库版本。

- Independent Cordis bundle named `@hypershub/dsh-panorama-mode`; repository transferred to `hypershub/dsh-panorama-mode`; display name 全景模式 / Panorama mode.
- Local folder stays `dsh-panorama-mode`; older unscoped development installs must be removed before installing the scoped bundle to avoid duplicate entries. Local appearance storage remains compatible.
- Live current-turn reasoning, tool execution, nested calls, reply preview and settled token accounting.
- Real todo completion progress; indeterminate activity when no current-turn plan is available.
- Distinct completion, waiting, error and interruption states.
- Automatic state-driven palettes and four fixed colors; continuous forward orbit animation.
- Configurable brand name, AVA callsign, identity subtitle, unit, motion, particle density and visibility flags.
- Browser fullscreen control removed; viewport coverage and S/Esc controls retained.
- Corrected centered settings gear and preserved earlier local appearance settings.
- Keyed Chat execution fixtures, SSR tests, rename/control and configuration regressions.

### Verification scope

Checked against installed DSH core 0.2.2-rc.1 APIs. Automated fixture/SSR checks do not establish universal core compatibility, browser transport, WebGL pixel or native-window acceptance. This GitHub release does not imply npm publication.
