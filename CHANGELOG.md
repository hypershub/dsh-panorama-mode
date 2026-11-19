# Changelog

## 0.1.0 — 2026-11-19

Initial repository release / 首次仓库版本。

- Independent Cordis bundle named `dsh-panorama-mode`; display name 全景模式 / Panorama mode.
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
