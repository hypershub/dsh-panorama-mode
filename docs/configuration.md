# Configuration / 配置

[README](../README.md) · [中文说明](../README.zh-CN.md)

## Settings layers / 设置层级

The gear panel (shortcut S) stores appearance overrides in browser localStorage. These override the defaults from the bundle's Loader row. Existing settings from the former `dsh-ava-stage` package continue to use `dsh-ava-stage.settings.v1`; no user data is included in this repository.

齿轮设置面板（S）将外观覆盖值保存到浏览器 localStorage，并优先于插件行的部署默认值。旧版保留 `dsh-ava-stage.settings.v1` 存储 key，改包名不清除原设置。仓库不包含用户配置。

| Field | Default | Meaning / 含义 |
| --- | --- | --- |
| `brandName` | `Hypers Work` | Top-left name / 左上角品牌名称，32 字符，保留大小写 |
| `callsign` | `AVA` | Role name / 角色代号，12 字符，保存后规范为大写 |
| `tagline` | `DIGITAL EMPLOYEE` | Identity subtitle / 角色副标题，24 字符 |
| `unit` | `APAC-01` | Identity unit / 单元，12 字符 |
| `accent` | `auto` | `auto`, `ember`, `aurora`, `mint`, `ice` |
| `motion` | `normal` | `calm`, `normal`, `lively` |
| `density` | `normal` | `sparse`, `normal`, `dense` |
| `showStream` | `true` | Footer activity / 底部执行流 |
| `showStats` | `true` | Settled token accounting / Token 结算统计 |
| `showRecent` | `true` | Recent replies / 最近回复 |

Empty brand/callsign text resolves to its default when settings are read again. Names are rendered as React text, not HTML. Long brand names use ellipsis and a title tooltip. Logo artwork is not configurable.

品牌/代号为空时，重新读取会回到默认值。名称使用 React 文本渲染，不执行 HTML；长品牌名省略显示并通过标题提示展示全名。Logo 图形暂不支持配置。

## Automatic palette / 自动主题

| Execution state / 执行状态 | Palette / 配色 |
| --- | --- |
| Idle / 待命 | Ice / 冰蓝 |
| Thinking or response generation / 思考或生成回复 | Aurora / 紫蓝 |
| Active tool execution / 工具执行 | Ember / 暖橙 |
| Waiting for a human / 等待确认 | Ember / 暖橙 |
| Error or interruption / 错误或中断 | Ember / 暖橙，同时保留明确文字状态 |
| Completed turn / 本轮完成 | Mint / 薄荷绿 |

Shader colors ease toward their targets; CSS theme colors transition over 1.2 seconds. Fixed palette choices are not overwritten by execution state. The animated orbit head is independent of the task completion ratio.

光球颜色平滑逼近目标，界面主色在 1.2 秒内过渡。固定配色不随执行状态改变。外圈亮点动画和待办完成比例独立。

## Deployment example / 部署示例

The distributed bundle declares defaults in `cordis.patch.yml`. For a managed Profile use Harness configuration editing rather than manually rewriting Profile files. A matching Loader config override replaces the whole config object, so preserve other desired fields.

```yaml
config:
  brandName: Hypers Work
  callsign: AVA
  tagline: DIGITAL EMPLOYEE
  unit: APAC-01
  accent: auto
  motion: normal
  density: normal
  showStream: true
  showStats: true
  showRecent: true
```

The removed `defaultFullscreen` field is ignored. Panorama itself does not manage browser fullscreen.

已移除的 `defaultFullscreen` 字段不再读取，全景模式不控制浏览器全屏。
