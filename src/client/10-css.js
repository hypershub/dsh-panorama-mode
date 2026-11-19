/* ── stylesheet ─────────────────────────────────────────────────────────── */

/* The stage is authored at the reference 1920×1080 frame and scaled as one
   unit, so the composition, type ramp and spacing keep the exact proportions
   of the original board at any window size. */
const FRAME_W = 1920
const FRAME_H = 1080

const CSS = `
@property --dvs-accent{syntax:'<color>';inherits:true;initial-value:#FF6B4A}
@property --dvs-amber{syntax:'<color>';inherits:true;initial-value:#FFB067}
@property --dvs-cool{syntax:'<color>';inherits:true;initial-value:#8AA2FF}
.dvs-root{transition:--dvs-accent 1.2s ease,--dvs-amber 1.2s ease,--dvs-cool 1.2s ease}
.dvs-root{position:fixed;inset:0;z-index:60;background:#05060A;color:#F3F5FA;overflow:hidden;pointer-events:auto;
  --a:var(--dvs-accent,#FF6B4A); --b:var(--dvs-amber,#FFB067); --c:var(--dvs-cool,#8AA2FF); --ok:#46E6B4;
  --ink:#F3F5FA; --ink2:rgba(243,245,250,.64); --ink3:rgba(243,245,250,.38); --ink4:rgba(243,245,250,.16);
  --line:rgba(255,255,255,.075); --line2:rgba(255,255,255,.12);
  --sans:"Inter","Segoe UI Variable Display","Segoe UI Variable Text","Segoe UI",system-ui,-apple-system,sans-serif;
  --mono:"JetBrains Mono","Cascadia Mono","Cascadia Code",Consolas,ui-monospace,monospace;
  --ease:cubic-bezier(.22,1,.36,1);
  font-family:var(--sans);-webkit-font-smoothing:antialiased;font-feature-settings:"tnum" 1,"cv11" 1;
  animation:dvs-in .8s var(--ease) both}
.dvs-root *{box-sizing:border-box;margin:0;padding:0}
.dvs-root.dvs-cursor-hidden,.dvs-root.dvs-cursor-hidden *{cursor:none!important}
@keyframes dvs-in{from{opacity:0;transform:scale(1.015)}to{opacity:1;transform:none}}

.dvs-frame{position:absolute;left:50%;top:50%;width:1920px;height:1080px;margin:-540px 0 0 -960px;
  transform-origin:50% 50%;will-change:transform}

/* ── background ───────────────────────────────────────────────────────── */
.dvs-bg,.dvs-bg>*{position:absolute;inset:0;pointer-events:none}
.dvs-aurora{filter:blur(90px);opacity:.5;transition:opacity 2.4s var(--ease)}
.dvs-aurora i{position:absolute;border-radius:50%;display:block}
.dvs-aurora .a1{width:900px;height:700px;left:90px;top:120px;background:radial-gradient(closest-side,color-mix(in srgb,var(--a) 38%,transparent),transparent);animation:dvs-drift1 26s ease-in-out infinite alternate}
.dvs-aurora .a2{width:760px;height:620px;left:360px;top:340px;background:radial-gradient(closest-side,color-mix(in srgb,var(--c) 20%,transparent),transparent);animation:dvs-drift2 31s ease-in-out infinite alternate}
.dvs-aurora .a3{width:1000px;height:520px;left:980px;top:-200px;background:radial-gradient(closest-side,color-mix(in srgb,var(--b) 10%,transparent),transparent);animation:dvs-drift1 38s ease-in-out infinite alternate-reverse}
.dvs-aurora .a4{width:820px;height:640px;left:150px;top:180px;background:radial-gradient(closest-side,rgba(70,230,180,.34),transparent);opacity:0;transition:opacity 1.8s var(--ease)}
.dvs-root[data-state=idle] .dvs-aurora{opacity:.38}
.dvs-root[data-state=working] .dvs-aurora{opacity:.62}
.dvs-root[data-state=done] .dvs-aurora .a4{opacity:1}
.dvs-root[data-state=done] .dvs-aurora .a1{opacity:.4}
@keyframes dvs-drift1{to{transform:translate(70px,-40px) scale(1.12)}}
@keyframes dvs-drift2{to{transform:translate(-60px,50px) scale(.9)}}
.dvs-vignette{background:radial-gradient(130% 100% at 30% 45%,transparent 45%,rgba(0,0,0,.65) 100%)}
.dvs-horizon{top:auto;bottom:0;height:38%;background:linear-gradient(180deg,transparent,rgba(0,0,0,.5))}
.dvs-grain{opacity:.055;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}

/* ── header ───────────────────────────────────────────────────────────── */
.dvs-header{position:absolute;left:64px;right:64px;top:44px;height:56px;display:flex;align-items:center;
  justify-content:space-between;z-index:6}
.dvs-brand{display:flex;align-items:center;gap:16px;min-width:0}
.dvs-mark{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;flex:none;
  background:linear-gradient(150deg,color-mix(in srgb,var(--b) 88%,#fff),var(--a) 55%,color-mix(in srgb,var(--a) 72%,#000));
  box-shadow:0 10px 30px -8px color-mix(in srgb,var(--a) 70%,transparent),inset 0 1px 0 rgba(255,255,255,.35)}
.dvs-mark svg{width:22px;height:22px;display:block}
.dvs-brand b{display:block;font-size:20px;font-weight:600;letter-spacing:-.01em;white-space:nowrap}
.dvs-brand small{display:block;font-family:var(--mono);font-size:10.5px;letter-spacing:.26em;color:var(--ink3);
  text-transform:uppercase;margin-top:3px;white-space:nowrap}

.dvs-hub{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  display:flex;align-items:center;gap:6px;padding:6px;border-radius:999px;border:1px solid var(--line);
  background:rgba(255,255,255,.025);backdrop-filter:blur(20px);white-space:nowrap}
.dvs-hub>span{font-family:var(--mono);font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink3);
  padding:8px 16px;border-radius:999px;display:flex;align-items:center;gap:10px}
.dvs-hub b{color:var(--ink);font-weight:500}
.dvs-hub .live{background:rgba(255,255,255,.04)}
.dvs-led{width:7px;height:7px;border-radius:50%;background:var(--ok);flex:none;
  box-shadow:0 0 0 0 rgba(70,230,180,.5);animation:dvs-led 2.4s ease-out infinite}
.dvs-root[data-state=working] .dvs-hub .dvs-led,.dvs-root[data-state=thinking] .dvs-hub .dvs-led{
  background:var(--a);box-shadow:0 0 12px var(--a);animation:dvs-blink 1.2s ease-in-out infinite}
@keyframes dvs-led{0%{box-shadow:0 0 0 0 rgba(70,230,180,.45)}80%,100%{box-shadow:0 0 0 9px rgba(70,230,180,0)}}
@keyframes dvs-blink{50%{opacity:.28}}

.dvs-head-right{display:flex;align-items:center;gap:22px;flex:none}
.dvs-clock{text-align:right}
.dvs-clock .t{font-size:34px;font-weight:300;letter-spacing:.02em;line-height:1;font-variant-numeric:tabular-nums}
.dvs-clock .t small{font-family:var(--mono);font-size:11px;letter-spacing:.2em;color:var(--ink3);margin-left:10px;vertical-align:middle}
.dvs-clock .d{font-family:var(--mono);font-size:11px;letter-spacing:.2em;color:var(--ink3);text-transform:uppercase;margin-top:8px}
.dvs-controls{display:flex;align-items:center;gap:8px}
.dvs-ctl{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;cursor:pointer;
  border:1px solid var(--line);background:rgba(255,255,255,.03);color:var(--ink2);
  transition:background .3s var(--ease),color .3s var(--ease),border-color .3s var(--ease)}
.dvs-ctl:hover{background:rgba(255,255,255,.08);color:var(--ink);border-color:var(--line2)}
.dvs-ctl svg{width:15px;height:15px;display:block}
.dvs-ctl.is-on{color:var(--a);border-color:color-mix(in srgb,var(--a) 40%,transparent);background:color-mix(in srgb,var(--a) 12%,transparent)}

/* ── left column: orb + identity ──────────────────────────────────────── */
.dvs-left{position:absolute;left:0;top:0;width:1080px;height:1080px}
.dvs-orb-wrap{position:absolute;inset:0;pointer-events:none}
.dvs-orb{position:absolute;left:0;top:0;width:1080px;height:1000px;display:block;
  -webkit-mask-image:radial-gradient(closest-side,#000 82%,transparent);mask-image:radial-gradient(closest-side,#000 82%,transparent)}
.dvs-orb-glow{position:absolute;left:540px;top:470px;width:560px;height:560px;margin:-280px 0 0 -280px;border-radius:50%;
  background:radial-gradient(closest-side,color-mix(in srgb,var(--a) 30%,transparent),transparent 70%);
  filter:blur(30px);opacity:.75;transition:background 1.6s var(--ease),opacity 1.6s var(--ease);
  animation:dvs-breathe 6s ease-in-out infinite}
.dvs-root[data-state=idle] .dvs-orb-glow{opacity:.45}
@keyframes dvs-breathe{50%{transform:scale(1.08)}}
.dvs-orb-fallback{position:absolute;left:540px;top:470px;width:330px;height:330px;margin:-165px;border-radius:50%;
  background:radial-gradient(circle at 35% 30%,color-mix(in srgb,var(--b) 70%,#fff),var(--a) 42%,#3a1208 78%);
  box-shadow:0 0 120px color-mix(in srgb,var(--a) 50%,transparent);animation:dvs-breathe 5s ease-in-out infinite}

.dvs-identity{position:absolute;left:140px;width:800px;top:826px;text-align:center;z-index:3}
.dvs-id-name{font-size:30px;font-weight:300;letter-spacing:.62em;margin-right:-.62em;line-height:1}
.dvs-id-meta{margin-top:14px;display:flex;justify-content:center;align-items:center;gap:14px;
  font-family:var(--mono);font-size:11.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink3);white-space:nowrap}
.dvs-id-meta .st{display:flex;align-items:center;gap:9px;color:var(--a);transition:color 1s var(--ease)}
.dvs-root[data-state=done] .dvs-id-meta .st{color:var(--ok)}
.dvs-id-meta .st .dvs-led{background:currentColor;animation:none;box-shadow:0 0 12px currentColor}
.dvs-root[data-state=working] .dvs-id-meta .st .dvs-led,.dvs-root[data-state=thinking] .dvs-id-meta .st .dvs-led{animation:dvs-blink 1.2s ease-in-out infinite}
.dvs-id-meta .sep{width:3px;height:3px;border-radius:50%;background:var(--ink4)}
.dvs-speech{margin-top:26px;height:30px;font-size:21px;font-weight:350;color:var(--ink2);letter-spacing:.005em;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ── right column: panel ──────────────────────────────────────────────── */
.dvs-panel{position:absolute;left:1080px;top:136px;width:776px;height:820px;z-index:4}
.dvs-sec{display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:11.5px;
  letter-spacing:.24em;text-transform:uppercase;color:var(--ink3);padding:0 6px 16px;white-space:nowrap}
.dvs-sec span:last-child{letter-spacing:.12em;text-transform:none}
.dvs-stage3d{position:relative;height:640px;perspective:1800px;perspective-origin:30% 50%}
.dvs-tilt{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform}
.dvs-card{position:absolute;inset:0;border-radius:30px;padding:38px 42px;overflow:hidden;
  background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.018) 60%,rgba(255,255,255,.03));
  border:1px solid var(--line);backdrop-filter:blur(28px) saturate(1.2);
  box-shadow:0 50px 100px -40px rgba(0,0,0,.85),inset 0 1px 0 rgba(255,255,255,.07);
  transform-origin:50% 100%;transition:opacity 1s var(--ease),transform 1.2s var(--ease),filter 1s var(--ease)}
.dvs-card::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:radial-gradient(600px 300px at var(--hx,30%) var(--hy,0%),rgba(255,255,255,.07),transparent 70%)}
.dvs-card::after{content:"";position:absolute;left:0;right:0;top:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent)}
.dvs-card.is-out{opacity:0;transform:translate3d(0,40px,-120px) rotateX(10deg);filter:blur(10px);pointer-events:none}
.dvs-card.is-out.up{transform:translate3d(0,-30px,-160px) rotateX(-8deg)}

/* idle card */
.dvs-idle h2{font-size:46px;font-weight:300;letter-spacing:-.02em;line-height:1.1}
.dvs-idle h2 em{font-style:normal;background:linear-gradient(90deg,var(--a),var(--b));-webkit-background-clip:text;background-clip:text;color:transparent}
.dvs-idle p{margin-top:16px;font-size:18px;color:var(--ink2);line-height:1.5;max-width:540px}
.dvs-caps{margin-top:36px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.dvs-cap{position:relative;padding:20px 22px;border-radius:18px;border:1px solid var(--line);
  background:rgba(255,255,255,.02);overflow:hidden;min-width:0}
.dvs-cap::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.06) 50%,transparent 60%);
  transform:translateX(-100%);animation:dvs-sheen 9s var(--ease) infinite;animation-delay:calc(var(--i) * .35s)}
@keyframes dvs-sheen{0%,70%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
.dvs-cap .k{font-family:var(--mono);font-size:11px;color:var(--ink3);letter-spacing:.1em;display:flex;justify-content:space-between;gap:8px}
.dvs-cap .k kbd{font-family:inherit;border:1px solid var(--line2);border-radius:5px;padding:1px 6px;color:var(--ink3)}
.dvs-cap b{display:block;margin-top:14px;font-size:19px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dvs-cap i{display:block;margin-top:5px;font-style:normal;font-size:14px;color:var(--ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dvs-tools{position:absolute;left:42px;right:42px;bottom:34px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.dvs-tools span{font-family:var(--mono);font-size:11.5px;color:var(--ink3);border:1px solid var(--line);
  border-radius:999px;padding:6px 12px;letter-spacing:.04em;white-space:nowrap;max-width:190px;overflow:hidden;text-overflow:ellipsis}
.dvs-tools .lbl{border:0;padding:0 6px 0 0;letter-spacing:.22em;text-transform:uppercase;font-size:10.5px}

/* task card */
.dvs-tc-top{display:flex;justify-content:space-between;align-items:center;gap:12px}
.dvs-tag{font-family:var(--mono);font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--a);
  padding:6px 12px;border-radius:999px;background:color-mix(in srgb,var(--a) 10%,transparent);
  border:1px solid color-mix(in srgb,var(--a) 25%,transparent);transition:all 1s var(--ease);
  white-space:nowrap;max-width:300px;overflow:hidden;text-overflow:ellipsis}
.dvs-root[data-state=done] .dvs-tag{color:var(--ok);background:rgba(70,230,180,.1);border-color:rgba(70,230,180,.25)}
.dvs-tid{font-family:var(--mono);font-size:12px;color:var(--ink3);letter-spacing:.1em;white-space:nowrap}
.dvs-task h2{margin-top:20px;font-size:29px;font-weight:450;letter-spacing:-.015em;line-height:1.22;max-width:600px;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dvs-from{margin-top:12px;font-size:15px;color:var(--ink3);display:flex;align-items:center;gap:8px;
  white-space:nowrap;overflow:hidden}
.dvs-from b{color:var(--ink2);font-weight:500;max-width:280px;overflow:hidden;text-overflow:ellipsis}
.dvs-from .sep{opacity:.5}
.dvs-tc-body{display:flex;gap:30px;margin-top:28px;height:auto}
.dvs-steps{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;justify-content:center;overflow:hidden}
.dvs-step{display:flex;align-items:center;gap:14px;height:34px;font-size:16px;color:var(--ink4);flex:none;min-width:0}
.dvs-step .sd{position:relative;width:20px;height:20px;flex:none}
.dvs-step .sd::before{content:"";position:absolute;inset:6px;border-radius:50%;background:var(--ink4);transition:all .6s var(--ease)}
.dvs-step svg{position:absolute;inset:0;width:20px;height:20px;overflow:visible}
.dvs-step .chk path{fill:none;stroke:var(--ok);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:20;stroke-dashoffset:20;transition:stroke-dashoffset .7s var(--ease) .1s}
.dvs-step .spin{opacity:0;transition:opacity .4s;animation:dvs-spin 1.1s linear infinite}
.dvs-step .spin circle{fill:none;stroke:var(--a);stroke-width:2;stroke-linecap:round;stroke-dasharray:14 60}
@keyframes dvs-spin{to{transform:rotate(360deg)}}
.dvs-step .sl{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dvs-step .sl b{font-weight:500;font-family:var(--mono);font-size:.9em;letter-spacing:.02em}
.dvs-step .sl i{font-style:normal;color:var(--ink3);margin-left:9px;font-size:.92em}
.dvs-step .st{margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--ink3);flex:none}
.dvs-step.done{color:var(--ink2)}
.dvs-step.done .sd::before{inset:0;background:rgba(70,230,180,.12)}
.dvs-step.done .chk path{stroke-dashoffset:0}
.dvs-step.error .sd::before{inset:0;background:rgba(255,90,80,.14)}
.dvs-step.error .chk path{stroke:#FF6B5A;stroke-dashoffset:0}
.dvs-step.error .st{color:#FF8A7A}
.dvs-step.active{color:var(--ink)}
.dvs-step.active .sd::before{inset:6px;background:var(--a);box-shadow:0 0 14px var(--a)}
.dvs-step.active .spin{opacity:1}
.dvs-step.active .sl{background:linear-gradient(90deg,var(--ink) 0%,var(--ink) 40%,#fff 50%,var(--ink) 60%,var(--ink) 100%);
  background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:dvs-shimmer 2.4s linear infinite}
@keyframes dvs-shimmer{from{background-position:100% 0}to{background-position:-150% 0}}
.dvs-steps-empty{font-family:var(--mono);font-size:12.5px;color:var(--ink3);line-height:1.9}

.dvs-preview{width:180px;flex:none;perspective:900px}
.dvs-paper{position:relative;width:180px;height:224px;border-radius:12px;overflow:hidden;background:#0B0F17;
  border:1px solid var(--line2);transform:rotateY(-14deg) rotateX(6deg);transform-style:preserve-3d;
  box-shadow:-20px 30px 60px -20px rgba(0,0,0,.8);animation:dvs-float 7s ease-in-out infinite;
  padding:13px 13px 14px;display:flex;flex-direction:column;gap:7px}
@keyframes dvs-float{50%{transform:rotateY(-8deg) rotateX(3deg) translateY(-6px)}}
.dvs-paper-head{font-family:var(--mono);font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink3);
  display:flex;justify-content:space-between;gap:6px}
.dvs-paper-text{font-size:9.5px;line-height:1.6;color:var(--ink2);flex:1;overflow:hidden;
  display:-webkit-box;-webkit-line-clamp:12;-webkit-box-orient:vertical}
.dvs-paper-foot{height:2px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;flex:none}
.dvs-paper-foot i{display:block;height:100%;background:linear-gradient(90deg,rgba(255,107,74,.3),var(--a));transition:width .5s linear}
.dvs-scan{position:absolute;left:0;right:0;height:46px;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--a) 28%,transparent));
  border-bottom:1px solid color-mix(in srgb,var(--b) 70%,transparent);box-shadow:0 6px 20px color-mix(in srgb,var(--a) 60%,transparent);
  transition:opacity .6s;pointer-events:none}
.dvs-paper::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(125deg,rgba(255,255,255,.14),transparent 35%)}
.dvs-pv-cap{margin-top:16px;text-align:center;font-family:var(--mono);font-size:11px;letter-spacing:.22em;
  text-transform:uppercase;color:var(--ink3);transition:color .8s;white-space:nowrap}
.dvs-root[data-state=done] .dvs-pv-cap{color:var(--ok)}
.dvs-root[data-state=done] .dvs-scan{opacity:0}

.dvs-log{position:absolute;left:42px;right:42px;bottom:118px;height:72px;overflow:hidden;
  font-family:var(--mono);font-size:12.5px;color:var(--ink3);transition:opacity .6s var(--ease);
  -webkit-mask-image:linear-gradient(180deg,transparent,#000 50%);mask-image:linear-gradient(180deg,transparent,#000 50%)}
.dvs-log-in{position:absolute;left:0;right:0;bottom:0}
.dvs-ll{height:24px;line-height:24px;white-space:nowrap;display:flex;gap:14px;overflow:hidden;animation:dvs-ll-in .7s var(--ease)}
.dvs-ll .t{color:var(--ink4);flex:none}
.dvs-ll b{color:var(--a);font-weight:400;flex:none}
.dvs-ll span{overflow:hidden;text-overflow:ellipsis}
@keyframes dvs-ll-in{from{opacity:0;filter:blur(4px)}}

.dvs-progress{position:absolute;left:42px;right:42px;bottom:34px;display:flex;align-items:flex-end;gap:26px;
  transition:opacity .8s var(--ease),transform .8s var(--ease)}
.dvs-pnum{font-size:64px;font-weight:200;line-height:.8;letter-spacing:-.03em;min-width:150px;font-variant-numeric:tabular-nums}
.dvs-pnum i{font-style:normal;font-size:22px;color:var(--ink3);margin-left:4px;font-weight:300}
.dvs-pnum em{font-style:normal;font-size:19px;color:var(--ink3);margin-left:6px;font-weight:300;letter-spacing:.05em}
.dvs-ptrack{flex:1;height:2px;background:rgba(255,255,255,.08);border-radius:2px;position:relative;margin-bottom:10px;min-width:0}
.dvs-pfill{position:absolute;top:0;bottom:0;left:0;border-radius:2px;
  background:linear-gradient(90deg,color-mix(in srgb,var(--a) 20%,transparent),var(--a) 60%,var(--b))}
@keyframes dvs-sweep{0%{left:-38%}100%{left:100%}}
@keyframes dvs-scan-active{from{transform:translateY(-46px)}to{transform:translateY(224px)}}
.dvs-progress-label{position:absolute;bottom:74px;left:0;font:11px var(--mono);color:var(--ink3);letter-spacing:.06em}
.dvs-ptrack{overflow:hidden}
.dvs-pfill,.dvs-phead{transition:width .6s ease,left .6s ease}
.dvs-step.stopped{color:var(--ink3)}
.dvs-phead{position:absolute;top:50%;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:#fff;
  box-shadow:0 0 0 4px color-mix(in srgb,var(--a) 25%,transparent),0 0 22px 4px color-mix(in srgb,var(--a) 80%,transparent)}
.dvs-eta{font-family:var(--mono);font-size:12px;color:var(--ink3);letter-spacing:.08em;margin-bottom:4px;
  min-width:90px;text-align:right;flex:none;white-space:nowrap}
.dvs-root[data-state=done] .dvs-progress{opacity:0;transform:translateY(16px)}
.dvs-root[data-state=done] .dvs-log{opacity:0}

.dvs-delivered{position:absolute;left:24px;right:24px;bottom:24px;height:100px;border-radius:20px;display:flex;
  align-items:center;gap:20px;padding:0 22px;background:linear-gradient(90deg,rgba(70,230,180,.13),rgba(70,230,180,.03));
  border:1px solid rgba(70,230,180,.22);opacity:0;transform:translateY(30px) scale(.98);pointer-events:none;
  transition:opacity .9s var(--ease) .15s,transform 1.1s var(--ease) .15s}
.dvs-root[data-state=done] .dvs-delivered{opacity:1;transform:none;pointer-events:auto}
.dvs-dv-ico{width:48px;height:48px;border-radius:50%;background:rgba(70,230,180,.15);display:grid;place-items:center;flex:none}
.dvs-dv-ico path{fill:none;stroke:var(--ok);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:24;stroke-dashoffset:24;transition:stroke-dashoffset .8s var(--ease) .5s}
.dvs-root[data-state=done] .dvs-dv-ico path{stroke-dashoffset:0}
.dvs-dv-body{min-width:0;flex:1}
.dvs-dv-t{font-size:19px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dvs-dv-m{margin-top:6px;font-family:var(--mono);font-size:12px;color:var(--ink3);letter-spacing:.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* recent deliveries */
.dvs-recent{margin-top:26px}
.dvs-rlist{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.dvs-ri{display:flex;align-items:center;gap:12px;height:68px;padding:0 14px 0 10px;min-width:0;border-radius:16px;
  border:1px solid var(--line);background:rgba(255,255,255,.018);overflow:hidden}
.dvs-ri-th{width:30px;height:38px;border-radius:5px;overflow:hidden;border:1px solid var(--line2);flex:none;
  background:linear-gradient(160deg,color-mix(in srgb,var(--a) 24%,#0b0f17),#0b0f17)}
.dvs-ri-th svg{width:100%;height:100%;display:block}
.dvs-ri-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}
.dvs-ri-n{font-size:13.5px;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dvs-ri-m{font-family:var(--mono);font-size:11px;color:var(--ink3);white-space:nowrap;display:flex;align-items:center;gap:7px}
.dvs-ri-m i{width:5px;height:5px;border-radius:50%;background:var(--ok);opacity:.8;flex:none}
.dvs-r-empty{font-size:15px;color:var(--ink3);padding:18px 6px}

/* ── footer ───────────────────────────────────────────────────────────── */
.dvs-footer{position:absolute;left:64px;right:64px;bottom:0;height:96px;display:flex;align-items:center;
  justify-content:space-between;z-index:5}
.dvs-stream{display:flex;align-items:center;gap:10px;height:40px;width:1100px;overflow:hidden;
  -webkit-mask-image:linear-gradient(90deg,#000 82%,transparent);mask-image:linear-gradient(90deg,#000 82%,transparent)}
.dvs-stream .lbl{font-family:var(--mono);font-size:10.5px;letter-spacing:.24em;text-transform:uppercase;color:var(--ink3);
  margin-right:10px;flex:none}
.dvs-chips{display:flex;gap:10px;min-width:0;overflow:hidden}
.dvs-evt{flex:none;font-family:var(--mono);font-size:12px;color:var(--ink3);padding:8px 14px;border-radius:999px;
  border:1px solid var(--line);background:rgba(255,255,255,.02);display:flex;gap:8px;align-items:center;
  white-space:nowrap;max-width:330px;overflow:hidden;text-overflow:ellipsis}
.dvs-evt i{width:5px;height:5px;border-radius:50%;background:var(--a);flex:none}
.dvs-evt.o i{background:var(--ok)}
.dvs-evt.e i{background:#FF6B5A}
.dvs-evt span{overflow:hidden;text-overflow:ellipsis}
.dvs-stats{display:flex;gap:44px;flex:none}
.dvs-stat{text-align:right;min-width:56px}
.dvs-stat b{display:block;font-size:26px;font-weight:300;letter-spacing:-.01em;line-height:1;font-variant-numeric:tabular-nums}
.dvs-stat small{display:block;margin-top:6px;font-family:var(--mono);font-size:10.5px;letter-spacing:.2em;
  text-transform:uppercase;color:var(--ink3);white-space:nowrap}

/* ── settings sheet ───────────────────────────────────────────────────── */
.dvs-sheet{position:absolute;right:64px;top:120px;width:340px;z-index:20;border-radius:22px;
  border:1px solid var(--line2);background:rgba(12,14,20,.88);backdrop-filter:blur(30px) saturate(1.2);
  box-shadow:0 40px 90px -30px rgba(0,0,0,.9);padding:18px;animation:dvs-sheet-in .45s var(--ease) both}
@keyframes dvs-sheet-in{from{opacity:0;transform:translateY(-10px) scale(.98)}}
.dvs-sheet h3{font-size:12px;font-family:var(--mono);letter-spacing:.2em;text-transform:uppercase;color:var(--ink3);
  font-weight:400;display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:14px}
.dvs-field{margin-bottom:14px}
.dvs-field label{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-family:var(--mono);
  font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink3);margin-bottom:7px}
.dvs-field input[type=text]{width:100%;height:32px;border-radius:9px;border:1px solid var(--line2);
  background:rgba(255,255,255,.03);color:var(--ink);font-family:var(--mono);font-size:12px;padding:0 10px;
  outline:none;letter-spacing:.08em}
.dvs-field input[type=text]:focus{border-color:color-mix(in srgb,var(--a) 55%,transparent);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--a) 14%,transparent)}
.dvs-row{display:flex;gap:6px;flex-wrap:wrap}
.dvs-opt{height:30px;padding:0 11px;border-radius:9px;border:1px solid var(--line2);background:transparent;
  color:var(--ink3);font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;
  cursor:pointer;transition:all .25s var(--ease)}
.dvs-opt:hover{color:var(--ink);background:rgba(255,255,255,.04)}
.dvs-opt.is-on{color:var(--ink);border-color:color-mix(in srgb,var(--a) 60%,transparent);
  background:color-mix(in srgb,var(--a) 16%,transparent)}
.dvs-swatch{width:26px;height:26px;border-radius:8px;border:1px solid var(--line2);cursor:pointer;padding:0}
.dvs-swatch.is-on{box-shadow:0 0 0 2px rgba(255,255,255,.18)}
.dvs-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:7px 0;
  font-size:12px;color:var(--ink2)}
.dvs-switch{width:38px;height:22px;border-radius:999px;border:1px solid var(--line2);background:rgba(255,255,255,.05);
  position:relative;cursor:pointer;flex:none;transition:background .25s}
.dvs-switch::after{content:"";position:absolute;left:2px;top:2px;width:16px;height:16px;border-radius:50%;
  background:rgba(255,255,255,.65);transition:transform .25s var(--ease),background .25s}
.dvs-switch.is-on{background:color-mix(in srgb,var(--a) 45%,transparent);border-color:color-mix(in srgb,var(--a) 55%,transparent)}
.dvs-switch.is-on::after{transform:translateX(16px);background:#fff}
.dvs-sheet-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:16px;
  padding-top:14px;border-top:1px solid var(--line)}
.dvs-hint{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink4)}
.dvs-link{background:none;border:0;color:var(--ink3);font-family:var(--mono);font-size:10px;letter-spacing:.14em;
  text-transform:uppercase;cursor:pointer;padding:4px}
.dvs-link:hover{color:var(--ink)}
.dvs-toast{position:absolute;left:50%;top:120px;transform:translate(-50%,-10px);z-index:30;
  font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink2);
  padding:10px 18px;border-radius:999px;background:rgba(20,22,30,.8);border:1px solid var(--line2);
  opacity:0;transition:all .45s var(--ease);pointer-events:none}
.dvs-toast.is-on{opacity:1;transform:translate(-50%,0)}

/* ── failure fallback ─────────────────────────────────────────────────── */
.dvs-root.dvs-crash{display:grid;place-items:center;padding:24px}
.dvs-crash-card{display:flex;flex-direction:column;gap:12px;align-items:flex-start;max-width:560px;
  padding:24px;border-radius:20px;border:1px solid var(--line2);background:rgba(18,20,28,.9)}
.dvs-crash-card b{font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink3)}
.dvs-crash-card span{font-family:var(--mono);font-size:12px;line-height:1.6;color:var(--ink2);word-break:break-word}

@media (prefers-reduced-motion:reduce){
  .dvs-root *,.dvs-root *::before,.dvs-root *::after{animation-duration:.001s!important;animation-iteration-count:1!important;transition-duration:.15s!important}
}
`
