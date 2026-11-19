/* ── particle orb ───────────────────────────────────────────────────────── */

const ORB_VS = `
precision highp float;
attribute vec4 aD; attribute float aK;
uniform float uT,uE,uBurst,uRip,uProg,uRing,uDone,uYaw,uBreath,uPR,uPhase;
uniform vec3 uA,uB,uC,uOk,uRDir; uniform vec2 uS;
varying vec3 vC; varying float vA;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 tis(vec4 r){return 1.79284291400159-.85373472095314*r;}
float sn(vec3 v){
 const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.);
 vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
 vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
 vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
 i=mod289(i);
 vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
 float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx;
 vec4 j=p-49.*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_);
 vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.-abs(x)-abs(y);
 vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
 vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.));
 vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
 vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
 vec4 nm=tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
 p0*=nm.x;p1*=nm.y;p2*=nm.z;p3*=nm.w;
 vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.); m=m*m;
 return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
vec3 rY(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
vec3 rX(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);}
vec3 rZ(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}
void main(){
 vec3 p; vec3 col; float al; float sz; float rnd=aD.w;
 if(aK<.5){
  vec3 n=aD.xyz;
  float sp=.55+uE*1.1;
  float n1=sn(n*1.35+vec3(0.,uT*.16*sp,uT*.07*sp));
  float n2=sn(n*3.1-vec3(uT*.22*sp));
  float r=1.+n1*(.035+.17*uE)+n2*(.008+.035*uE);
  float d=acos(clamp(dot(n,uRDir),-1.,1.));
  r+=.22*(1.-uRip)*exp(-pow((d-uRip*3.4)*3.2,2.))*step(.001,uRip)*step(uRip,.999);
  r*=uBreath;
  r+=uBurst*(.25+rnd*rnd*2.4);
  p=rX(rY(n*r,uYaw),.32);
  vec3 wn=rX(rY(n,uYaw),.32);
  col=mix(uA,uB,smoothstep(-.5,.9,wn.y+n1*.7));
  col=mix(col,uC,smoothstep(.0,1.,-wn.x*.7-wn.y*.4)*.6);
  col=mix(col,uOk,uDone*(.75+.25*n1));
  float rim=pow(1.-abs(wn.z),2.2);
  al=(.16+.6*rim+.35*max(n1,0.))*(.6+.4*rnd);
  al*=mix(.3,1.,smoothstep(-1.,1.,p.z));
  al*=1.-uBurst*.55;
  sz=1.3+2.2*rnd*rnd+uE*.5;
 } else if(aK<1.5){
  float ang=aD.x, ring=aD.y;
  if(ring<.5){
   float R=1.72+aD.z*.025;
   float a=1.5707963-ang;
   p=rX(vec3(cos(a)*R,sin(a)*R,aD.z*.03),.10);
   float fr=ang/6.2831853;
   float on=step(fr,uProg);
   // Circular distance keeps the orbit head continuous through 1 → 0.
   float gap=abs(fr-fract(uPhase));
   float hd=exp(-pow(min(gap,1.-gap)*70.,2.));
   col=mix(uA,uB,fr); col=mix(col,uOk,uDone);
   col=mix(col,vec3(1.),hd*.6);
   al=uRing*(.06+.75*on*(.55+.45*rnd))+hd*1.6*uRing;
   sz=1.6+1.2*rnd+hd*6.;
  } else {
   bool r1=ring<1.5;
   float R=r1?2.02:1.40;
   float a=ang+uT*(r1?.10:-.17)*(.5+uE);
   p=vec3(cos(a)*R,aD.z*.02,sin(a)*R);
   p=rZ(rX(p,r1?1.22:1.38),r1?.38:-.52); p=rY(p,uYaw*.35);
   float seg=smoothstep(.45,.55,fract(ang*(r1?7.:3.)/6.2831853));
   col=r1?uC:uB; col=mix(col,uOk,uDone*.8);
   al=(.05+.32*seg)*(.35+.65*uRing)*(.6+.4*rnd);
   al*=mix(.25,1.,smoothstep(-1.5,1.5,p.z));
   sz=1.2+rnd*1.2;
  }
 } else {
  vec3 q=rY(aD.xyz,uT*(.02+.04*rnd)+uYaw*.2);
  q.y+=sin(uT*.25+rnd*40.)*.12;
  q*=1.+uBurst*.35*rnd;
  p=q;
  col=mix(uB,uC,rnd); col=mix(col,uOk,uDone*.6);
  al=.22*(.5+.5*sin(uT*(.4+rnd)+rnd*60.));
  sz=1.+rnd*2.2;
 }
 float persp=4.6/(4.6-p.z);
 gl_Position=vec4(p.x*persp*uS.x,p.y*persp*uS.y,0.,1.);
 gl_PointSize=sz*persp*uPR;
 vC=col; vA=al;
}`

const ORB_FS = `
precision mediump float;
varying vec3 vC; varying float vA;
void main(){
 vec2 c=gl_PointCoord-.5; float d=length(c);
 float a=smoothstep(.5,0.,d); a*=a;
 float core=smoothstep(.18,0.,d);
 vec3 col=vC+core*.35;
 gl_FragColor=vec4(col*a*vA,a*vA);
}`

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(log || 'shader compile failed')
  }
  return shader
}

function hexRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ]
}

/**
 * The reference orb: a simplex-noise particle sphere, a progress ring, two
 * orbit rings and a dust halo. Every input is a smoothed target, so state
 * changes ease instead of snapping.
 */
function OrbCanvas({ display, progress, indeterminate, motion, density, palette, activityKey }) {
  const canvasRef = useRef(null)
  const [unavailable, setUnavailable] = useState(false)
  const live = useRef({ display, progress, indeterminate, motion, palette, activityKey })
  live.current = { display, progress, indeterminate, motion, palette, activityKey }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true })
    if (!gl) {
      setUnavailable(true)
      return undefined
    }

    let program
    try {
      program = gl.createProgram()
      gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, ORB_VS))
      gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, ORB_FS))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'link failed')
    } catch (error) {
      console.error('[panorama-mode] orb shader unavailable:', error)
      setUnavailable(true)
      return undefined
    }
    gl.useProgram(program)

    /* geometry: fibonacci sphere + two orbit rings + progress ring + dust */
    const sphere = DENSITY_COUNT[density] || DENSITY_COUNT.normal
    const data = []
    const kind = []
    const GA = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < sphere; i++) {
      const y = 1 - (i / (sphere - 1)) * 2
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const th = GA * i
      data.push(Math.cos(th) * r, y, Math.sin(th) * r, Math.random())
      kind.push(0)
    }
    const addRing = (count, index) => {
      for (let i = 0; i < count; i++) {
        data.push((i / count) * Math.PI * 2, index, Math.random() * 2 - 1, Math.random())
        kind.push(1)
      }
    }
    addRing(Math.round(1100 * (sphere / 16000)), 0)
    addRing(Math.round(700 * (sphere / 16000)), 1)
    addRing(Math.round(420 * (sphere / 16000)), 2)
    const dust = Math.round(700 * (sphere / 16000))
    for (let i = 0; i < dust; i++) {
      const u = Math.random() * 2 - 1
      const t = Math.random() * Math.PI * 2
      const s = Math.sqrt(Math.max(0, 1 - u * u))
      const radius = 2.2 + Math.pow(Math.random(), 0.7) * 0.75
      data.push(Math.cos(t) * s * radius, u * radius * 0.8, Math.sin(t) * s * radius, Math.random())
      kind.push(2)
    }
    const count = kind.length
    const buffer1 = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer1)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    const aD = gl.getAttribLocation(program, 'aD')
    gl.enableVertexAttribArray(aD)
    gl.vertexAttribPointer(aD, 4, gl.FLOAT, false, 0, 0)
    const buffer2 = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer2)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(kind), gl.STATIC_DRAW)
    const aK = gl.getAttribLocation(program, 'aK')
    gl.enableVertexAttribArray(aK)
    gl.vertexAttribPointer(aK, 1, gl.FLOAT, false, 0, 0)

    const U = {}
    for (const name of ['uT', 'uE', 'uBurst', 'uRip', 'uProg', 'uRing', 'uDone', 'uYaw', 'uBreath', 'uPR', 'uPhase', 'uA', 'uB', 'uC', 'uOk', 'uRDir', 'uS']) {
      U[name] = gl.getUniformLocation(program, name)
    }
    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE)

    let pr = 1
    let cssW = 0
    let cssH = 0
    let needsResize = true
    const resize = () => {
      if (!needsResize) return
      needsResize = false
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      if (width === cssW && height === cssH) return
      cssW = width
      cssH = height
      pr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * pr)
      canvas.height = Math.round(height * pr)
      gl.viewport(0, 0, canvas.width, canvas.height)
      /* 0.165 keeps the sphere at the reference radius: UNIT 165 on a 1080-wide canvas. */
      const unit = Math.min(width, height) * 0.165
      gl.uniform2f(U.uS, unit / (width / 2), unit / (height / 2))
      gl.uniform1f(U.uPR, pr)
    }
    resize()

    const markResize = () => { needsResize = true }
    let observer = null
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(markResize)
      observer.observe(canvas)
    } else {
      window.addEventListener('resize', markResize)
    }

    const smooth = {
      energy: { value: 0.12, rate: 1.4 },
      ring: { value: 0.25, rate: 2 },
      done: { value: 0, rate: 1.6 },
      prog: { value: 0, rate: 5 },
      spin: { value: 0.07, rate: 0.8 },
    }
    const colors = Object.fromEntries(['a','b','c','ok'].map(key => [key,hexRgb(palette[key])]))
    let clock = 0
    let yaw = 0
    let burstAt = -1
    let rippleAt = -1
    let rippleDir = [0.6, 0.3, 0.74]
    let lastDisplay = display
    let lastActivity = activityKey
    let frame = 0
    let ticks = 0
    let stopped = false
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const throttle = reduced ? 2 : 1
    const started = performance.now()
    let previous = started

    const render = now => {
      if (stopped) return
      frame = window.requestAnimationFrame(render)
      ticks += 1
      if (throttle > 1 && ticks % throttle !== 0) return
      const dt = Math.min(0.05, (now - previous) / 1000)
      previous = now
      const target = live.current
      const rate = MOTION_RATE[target.motion] || 1

      const mood = target.display
      const wants = mood === 'done'
        ? { energy: 0.3, ring: 1, done: 1, spin: 0.12 }
        : mood === 'working' || mood === 'thinking'
          ? { energy: 0.62, ring: 1, done: 0, spin: 0.24 }
          : { energy: 0.12, ring: 0.22, done: 0, spin: 0.07 }
      if (lastDisplay !== mood) {
        if (mood === 'done') burstAt = clock
        if (mood === 'working' && (lastDisplay === 'idle' || lastDisplay === 'ready')) {
          rippleAt = clock
          rippleDir = [0.85, 0.15, 0.5]
        }
        lastDisplay = mood
      }
      if (target.activityKey !== lastActivity) {
        if (mood === 'working' || mood === 'thinking') rippleAt = clock
        lastActivity = target.activityKey
      }
      for (const key of ['energy', 'ring', 'done', 'spin']) {
        const s = smooth[key]
        s.value += (wants[key] - s.value) * (1 - Math.exp(-s.rate * rate * dt))
      }
      // The fill reports real progress; the orbit head has its own unwrapped
      // phase, never a smoothed sawtooth that travels backwards at the seam.
      const progressTarget = target.indeterminate ? 0 : clamp(target.progress || 0, 0, 1)
      smooth.prog.value += (progressTarget - smooth.prog.value) * (1 - Math.exp(-5 * dt))

      clock += dt * rate
      yaw += dt * smooth.spin.value * (0.5 + smooth.energy.value)

      let burst = 0
      if (burstAt >= 0) {
        const elapsed = clock - burstAt
        if (elapsed < 0.35) burst = easeOutCubic(elapsed / 0.35)
        else if (elapsed < 2.6) burst = 1 - easeInOutCubic((elapsed - 0.35) / 2.25)
        else burstAt = -1
        burst *= 0.55
      }
      let ripple = 0
      if (rippleAt >= 0) {
        const elapsed = (clock - rippleAt) / 1.5
        if (elapsed < 1) ripple = elapsed
        else rippleAt = -1
      }

      const paletteNow = target.palette || PALETTES.ember
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      for (const [key, uniform] of [['a','uA'],['b','uB'],['c','uC'],['ok','uOk']]) {
        const goal = hexRgb(paletteNow[key])
        const alpha = 1 - Math.exp(-2 * dt)
        colors[key] = colors[key].map((value,index) => value + (goal[index] - value) * alpha)
        gl.uniform3fv(U[uniform], colors[key])
      }
      gl.uniform1f(U.uT, clock)
      gl.uniform1f(U.uE, smooth.energy.value)
      gl.uniform1f(U.uBurst, burst)
      gl.uniform1f(U.uRip, ripple)
      gl.uniform1f(U.uPhase, clock * 0.16)
      gl.uniform1f(U.uProg, clamp(smooth.prog.value, 0, 1))
      gl.uniform1f(U.uRing, smooth.ring.value)
      gl.uniform1f(U.uDone, smooth.done.value)
      gl.uniform1f(U.uYaw, yaw)
      gl.uniform1f(U.uBreath, 1 + Math.sin(clock * 1.1) * 0.012)
      gl.uniform3fv(U.uRDir, rippleDir)
      resize()
      gl.drawArrays(gl.POINTS, 0, count)
    }
    frame = window.requestAnimationFrame(render)

    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
      if (observer) observer.disconnect()
      else window.removeEventListener('resize', markResize)
      gl.deleteBuffer(buffer1)
      gl.deleteBuffer(buffer2)
      gl.useProgram(null)
      gl.deleteProgram(program)
      const lose = gl.getExtension('WEBGL_lose_context')
      if (lose) lose.loseContext()
    }
  }, [density])

  if (unavailable) return h('div', { className: 'dvs-orb-fallback', 'aria-hidden': 'true' })
  return h('canvas', { ref: canvasRef, className: 'dvs-orb', 'aria-hidden': 'true' })
}
