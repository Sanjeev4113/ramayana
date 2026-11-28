// The opening. The gate of invocation stands over the first frame of the opening film (assets/theme/intro.mp4): the
// maṇḍala and ॐ among the stars, the verse of the Name, and an arch with Rāma's bow that is held to enter. Holding it
// fills a ring of gold and lights the diyas; then a bell rings and the film plays with its sound: the comet, the burst,
// the flight through the clouds, the land of temples and the golden name. On the film's last moment the live page,
// laid out exactly over it, takes its place, and the carved frame closes in around it.
import { loop as frames, ambient, dpr, LITE } from './calm.js';
import { fitFilm } from './film-fit.js';
const gsap = window.gsap;
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const CUT = 7.45;            // the moment in the film when the live page takes over (before the film's own frame appears)

const NOISE = `
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 7.1; a *= .5; } return v; }`;

// a painting with its depth: covers the screen like the film (centred), subtle 4-tap clarity sharpen, light rays, and optional war-fire glow
const LAND = `precision highp float; uniform sampler2D tCol, tDep; uniform vec2 uRes, uImg, uMouse, uLight; uniform float uTime, uZoom, uRays, uDrift, uWar; ${NOISE}
void main(){
  vec2 frag = gl_FragCoord.xy / uRes;
  vec2 s = uRes / uImg; float sc = max(s.x, s.y); vec2 size = uImg * sc; vec2 off = (uRes - size) * .5;
  vec2 uv = (gl_FragCoord.xy - off) / size; uv.y = 1. - uv.y;
  float z = uZoom + uDrift * .012 * (1. - cos(uTime * .11));
  uv = (uv - vec2(.5, .5)) / z + vec2(.5, .5);
  float d = texture2D(tDep, uv).r;
  uv += uMouse * vec2(.012, .008) * (d - .45) * uDrift;
  uv.x += uDrift * .0022 * sin(uTime * .3 + d * 3.) * (1. - d);
  // subtle heat shimmer on war plates
  if (uWar > .01) { uv.x += sin(uv.y * 42. + uTime * 3.8) * .00065 * uWar * smoothstep(.35, .85, uv.y); }
  vec2 cUv = clamp(uv, .002, .998);
  vec2 px = 1. / uImg;
  vec3 c0 = texture2D(tCol, cUv).rgb;
  // gentle 4-tap unsharp mask for crisp architectural & painterly clarity
  vec3 avg = (texture2D(tCol, clamp(cUv + vec2(px.x, 0.), .001, .999)).rgb + texture2D(tCol, clamp(cUv - vec2(px.x, 0.), .001, .999)).rgb
            + texture2D(tCol, clamp(cUv + vec2(0., px.y), .001, .999)).rgb + texture2D(tCol, clamp(cUv - vec2(0., px.y), .001, .999)).rgb) * .25;
  vec3 col = clamp(c0 + (c0 - avg) * .42, 0., 1.);
  // subtle filmic local contrast boost
  col = mix(col, col * col * (3. - 2. * col), .14);
  float asp = uRes.x / uRes.y;
  vec2 q = vec2(frag.x * asp, frag.y) - vec2(uLight.x * asp, 1. - uLight.y);
  float ang = atan(q.y, q.x), r = length(q);
  float rays = pow(fbm(vec2(ang * 5., uTime * .035)) * fbm(vec2(ang * 11. + 3., -uTime * .028)), 1.6) * 2.4;
  col += vec3(1., .86, .58) * (rays * smoothstep(1.45, 0., r) * .14 + exp(-r * 2.6) * .065) * uRays * (1. - d * .48);
  if (uWar > .01) {
    float flick = .55 + .45 * sin(uTime * 5.2 + frag.x * 4.) * cos(uTime * 3.1 - frag.x * 2.5);
    float band = smoothstep(.18, .55, 1. - frag.y) * smoothstep(.98, .48, 1. - frag.y);
    col += vec3(1., .38, .08) * band * flick * .16 * uWar;
  }
  gl_FragColor = vec4(clamp(col, 0., 1.), 1.);
}`;

function gl2d(canvas, frag, detail = () => 1.75) {
  // WebGL 2 where there is one: its textures can carry mipmaps at any size, so a 4K painting drawn smaller stays crisp
  // and never shimmers
  const opt = { antialias: false, alpha: false, powerPreference: 'high-performance' };
  const gl = canvas.getContext('webgl2', opt) || canvas.getContext('webgl', opt); if (!gl) return null;
  const mip = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }'));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, frag)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
  gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const at = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n);
  const resize = () => { const s = Math.min(devicePixelRatio || 1, LITE ? 1.25 : 2, Math.max(1, detail())); canvas.width = Math.round(canvas.clientWidth * s); canvas.height = Math.round(canvas.clientHeight * s); gl.viewport(0, 0, canvas.width, canvas.height); };
  resize(); addEventListener('resize', resize);
  const tex = (im, unit) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
    if (mip) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); };
  return { gl, U, tex, canvas };
}
const load = src => new Promise((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src; });

export async function land(canvas, meta) {
  const [img, dep] = await Promise.all([load(meta.src), load(meta.depth)]).catch(() => []);
  if (!img) return null;
  // image pixels per CSS pixel where the plate covers the canvas, with a little room for the slow zoom
  const g = gl2d(canvas, LAND, () => 1.1 * Math.min(img.width / (canvas.clientWidth || innerWidth), img.height / (canvas.clientHeight || innerHeight))); if (!g) return null;
  const { gl, U } = g; g.tex(img, 0); g.tex(dep, 1);
  gl.uniform1i(U('tCol'), 0); gl.uniform1i(U('tDep'), 1); gl.uniform2f(U('uImg'), img.width, img.height); gl.uniform2f(U('uLight'), ...(meta.light || [.5, .25]));
  const st = { zoom: 1, rays: 1, drift: 1, war: meta.war || 0, m: [0, 0], mouse: [0, 0], visible: true };
  addEventListener('pointermove', e => { st.mouse = [e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1)]; }, { passive: true });
  const t0 = performance.now();
  // the painting breathes slowly (a drift, light rays, the pointer's parallax): thirty frames a second look the same as
  // sixty and leave the GPU free to draw it at the screen's full sharpness
  frames(canvas, () => {
    st.m[0] += (st.mouse[0] - st.m[0]) * .08; st.m[1] += (st.mouse[1] - st.m[1]) * .08;
    gl.uniform2f(U('uRes'), canvas.width, canvas.height); gl.uniform2f(U('uMouse'), st.m[0], st.m[1]);
    gl.uniform1f(U('uTime'), (performance.now() - t0) / 1000); gl.uniform1f(U('uZoom'), st.zoom); gl.uniform1f(U('uRays'), st.rays); gl.uniform1f(U('uDrift'), st.drift); gl.uniform1f(U('uWar'), st.war || 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3); }, { fps: 30 });
  canvas.style.background = 'none';
  return st;
}

/* ───────── golden dust and sparkles ───────── */
export class Sparks {
  constructor(canvas, { rise = 0 } = {}) {
    this.c = canvas; this.x = canvas.getContext('2d'); this.p = []; this.emit = []; this.rise = rise;
    const s = document.createElement('canvas'); s.width = s.height = 48; const g = s.getContext('2d');
    const gr = g.createRadialGradient(24, 24, 0, 24, 24, 24);
    gr.addColorStop(0, 'rgba(255,250,230,1)'); gr.addColorStop(.2, 'rgba(255,214,130,.9)'); gr.addColorStop(1, 'rgba(255,150,40,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 48, 48); this.sprite = s;
    this.resize = () => { this.dpr = dpr(1.5); canvas.width = canvas.clientWidth * this.dpr; canvas.height = canvas.clientHeight * this.dpr; };
    this.resize(); addEventListener('resize', this.resize);
    this.on = true;
    this.run = frames(canvas, (t, dt) => this.frame(dt, t / 1000));
  }
  add(x, y, vx, vy, life, size, drag = .985) { const d = this.dpr; this.p.push({ x: x * d, y: y * d, vx: vx * d, vy: vy * d, life, max: life, s: size * d, drag }); }
  frame(dt, t) {
    const { x: c } = this; c.clearRect(0, 0, this.c.width, this.c.height); c.globalCompositeOperation = 'lighter';
    for (const e of this.emit) e(dt, t, this);
    this.p = this.p.filter(p => (p.life -= dt) > 0);
    for (const p of this.p) {
      p.vx *= p.drag; p.vy = p.vy * p.drag - this.rise * dt * this.dpr; p.x += p.vx * dt; p.y += p.vy * dt;
      const k = p.life / p.max; c.globalAlpha = Math.min(1, k * 1.6, (p.max - p.life) * 4);
      const s = p.s * (.4 + .6 * k); c.drawImage(this.sprite, p.x - s * 2, p.y - s * 2, s * 4, s * 4);
    }
  }
  stop() { this.on = false; this.run.stop(); this.x.clearRect(0, 0, this.c.width, this.c.height); }
}

/* ───────── the hero's live layer, laid out as the film's last frame ───────── */
function fitHero() {
  const word = $('.hs-word'), t = $('.hs-word .hw-gold');
  try { const b = t.getBBox(); if (b.width) word.setAttribute('viewBox', `${b.x - 16} ${b.y - 24} ${b.width + 32} ${b.height + 48}`); } catch { }
  const en = $('.hs-en'); en.style.fontSize = '';
  const want = $('.hs').clientWidth * .356, have = en.getBoundingClientRect().width && en.scrollWidth;
  if (have) en.style.fontSize = (parseFloat(getComputedStyle(en).fontSize) * want / have) + 'px';
}
function heroAmbient() {
  const sheen = gsap.timeline({ repeat: -1, repeatDelay: 5.5, delay: 1.5 }).fromTo('#hwSheen', { attr: { x1: -300, x2: -60 } }, { attr: { x1: 1700, x2: 1940 }, duration: 2.8, ease: 'power2.inOut' });
  const [top, bot] = $$('.hs-ring textPath');
  let ring = null;
  // the verse slides round the ring by under half a pixel a tenth of a second: ten steps a second look the same as
  // sixty, and each step re-lays out the glowing text
  if (top && !reduced) { const st = { o: 0 }; let at = 0; ring = gsap.to(st, { o: 1, duration: 90, ease: 'none', repeat: -1, onUpdate: () => { const now = performance.now(); if (now - at < 100) return; at = now; top.setAttribute('startOffset', (-st.o * 50) + '%'); bot.setAttribute('startOffset', (-50 + st.o * 50) + '%'); } }); }
  ambient($('#hero'), [sheen, ring]);
  const sp = new Sparks($('#hero-sparks'), { rise: 14 });
  sp.emit.push((dt, t, S) => {
    const r = $('.hs-word').getBoundingClientRect(); if (r.bottom < 0) return;
    if (Math.random() < dt * 22) S.add(r.left + r.width * (.88 + Math.random() * .1), r.top + r.height * (.12 + Math.random() * .22), 20 + Math.random() * 50, -14 - Math.random() * 34, 1.2 + Math.random() * 1.8, .6 + Math.random() * 1.6, .99);
  });
}

/* ───────── the gate ───────── */
function gate(sound) {
  return new Promise(resolve => {
    const btn = $('#g-enter'), prog = $('.ga-prog'), diyas = $('.ga-diyas');
    const spots = [[24, 190], [24, 140], [50, 90], [92, 62], [168, 62], [210, 90], [236, 140], [236, 190]];
    diyas.innerHTML = spots.map(([x, y]) => `<g transform="translate(${x} ${y})"><path class="dy" d="M-8 4 Q0 10 8 4 L6 0 L-6 0Z"/><path class="fl" d="M0 0 C-5 -5 -2 -10 0 -15 C2 -10 5 -5 0 0Z"/></g>`).join('');
    const fl = $$('.fl', diyas);
    const st = { p: 0 }; let tw = null, done = false;
    const draw = () => { prog.style.strokeDashoffset = 1 - st.p; fl.forEach((f, i) => f.classList.toggle('lit', st.p > (i + .5) / fl.length || i === 0 || i === fl.length - 1)); btn.style.setProperty('--p', st.p); };
    const dust = new Sparks($('#gate-dust'), { rise: 10 });
    // twinkling celestial starfield + occasional golden shooting comets + radiant temple-arch aura
    const stars = Array.from({ length: LITE ? 45 : 95 }, () => ({ x: Math.random(), y: Math.random() * .78, r: .6 + Math.random() * 1.4, ph: Math.random() * 6.28, sp: 1.2 + Math.random() * 2.8, warm: Math.random() < .6 }));
    let comets = [], cometCd = 1.6;
    dust.emit.push((dt, t, S) => {
      const c = S.x, W = S.c.width, H = S.c.height, d = S.dpr;
      c.save(); c.globalCompositeOperation = 'lighter';
      // subtle twinkling stars across the cosmos
      for (const s of stars) {
        const a = .22 + .78 * (.5 + .5 * Math.sin(t * s.sp + s.ph));
        c.fillStyle = s.warm ? `rgba(255,232,175,${a * .75})` : `rgba(210,230,255,${a * .65})`;
        c.beginPath(); c.arc(s.x * W, s.y * H, s.r * d, 0, 6.283); c.fill();
      }
      // occasional golden shooting star / comet streaking through the heavens
      cometCd -= dt;
      if (cometCd <= 0) {
        cometCd = 2.6 + Math.random() * 4.2;
        const fromL = Math.random() < .5;
        comets.push({ x: (fromL ? .08 + Math.random() * .35 : .55 + Math.random() * .38) * W, y: (.06 + Math.random() * .26) * H, vx: (fromL ? 1 : -1) * (420 + Math.random() * 260) * d, vy: (110 + Math.random() * 110) * d, life: .75, max: .75 });
      }
      comets = comets.filter(m => (m.life -= dt) > 0);
      for (const m of comets) {
        m.x += m.vx * dt; m.y += m.vy * dt;
        const f = m.life / m.max, tx = m.x - m.vx * .14, ty = m.y - m.vy * .14;
        const gr = c.createLinearGradient(m.x, m.y, tx, ty);
        gr.addColorStop(0, `rgba(255,252,235,${f})`); gr.addColorStop(.3, `rgba(255,214,126,${f * .7})`); gr.addColorStop(1, 'rgba(255,160,60,0)');
        c.strokeStyle = gr; c.lineWidth = 2.2 * d; c.lineCap = 'round';
        c.beginPath(); c.moveTo(m.x, m.y); c.lineTo(tx, ty); c.stroke();
      }
      // gentle breathing sacred aura centered behind the temple arch
      const r = btn.getBoundingClientRect();
      if (r.width) {
        const ax = (r.left + r.width / 2) * d, ay = (r.top + r.height * .45) * d;
        const ar = (120 + 20 * Math.sin(t * 2.1) + st.p * 140) * d;
        const gr = c.createRadialGradient(ax, ay, 0, ax, ay, ar);
        gr.addColorStop(0, `rgba(255,222,140,${.18 + st.p * .36})`);
        gr.addColorStop(.45, `rgba(255,168,64,${.07 + st.p * .16})`);
        gr.addColorStop(1, 'rgba(255,140,40,0)');
        c.fillStyle = gr; c.fillRect(ax - ar, ay - ar, ar * 2, ar * 2);
      }
      c.restore();
      if (Math.random() < dt * (LITE ? 18 : 34)) S.add(Math.random() * innerWidth, innerHeight + 10, (Math.random() - .5) * 16, -34 - Math.random() * 58, 5.5 + Math.random() * 5.5, .7 + Math.random() * 2.0, .998);
    });
    const burstArch = () => {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height * .44;
      for (let i = 0; i < 65; i++) {
        const an = Math.random() * 6.283, sp = 70 + Math.random() * 260;
        dust.add(cx, cy, Math.cos(an) * sp, Math.sin(an) * sp - 30, .7 + Math.random() * .9, 1.2 + Math.random() * 2.8, .96);
      }
    };
    const finish = () => { if (done) return; done = true; tw?.kill(); st.p = 1; draw(); btn.classList.add('opened'); burstArch(); resolve(); };
    // one press opens the gate: the ring of gold fills by itself and the diyas light one by one (nothing to hold)
    const open = () => { if (done || tw) return; sound?.start(); btn.classList.add('holding'); tw = gsap.to(st, { p: 1, duration: .7, ease: 'power1.inOut', onUpdate: draw, onComplete: finish }); };
    btn.addEventListener('click', e => { e.preventDefault(); open(); });
    btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(); } });
    btn.addEventListener('contextmenu', e => e.preventDefault());
    draw();
    gsap.timeline({ delay: .2 })
      .from('.g-sloka p', { opacity: 0, y: 16, filter: 'blur(6px)', duration: 1.15, stagger: .25, ease: 'power3.out' })
      .from('.g-tr, .g-en', { opacity: 0, y: 10, duration: .95, stagger: .16 }, '-=.7')
      .from(btn, { opacity: 0, y: 20, scale: .95, duration: 1.0, ease: 'power3.out' }, '-=.55');
    $('.gate').__dust = dust;
  });
}

export async function runIntro({ sound, embers, skip = false } = {}) {
  const man = await fetch('assets/theme/manifest.json').then(r => r.json()).catch(() => ({}));
  const intro = $('#intro'), body = document.body, video = $('#intro-video');
  fitFilm(video);                                                // the whole opening film on an upright phone
  if (man.mandala) { document.documentElement.style.setProperty('--mandala', `url("${new URL(man.mandalaMask || man.mandala, location.href).href}")`); const y = $('.dh-yantra img'); if (y) y.src = man.mandala; }
  const heroP = man.plate ? land($('#hero-canvas'), { src: man.plate, depth: man.plateDepth || man.plate, light: man.plateLight || [.3, .15] }) : Promise.resolve(null);
  await document.fonts.load('200px "Tiro Devanagari Sanskrit"', 'रामायण').catch(() => { });
  await document.fonts.ready; fitHero(); addEventListener('resize', fitHero);
  let landedOnce = false;
  const landed = () => { if (landedOnce) return; landedOnce = true; body.classList.remove('in-intro'); if (embers) gsap.to(embers, { alpha: 1, duration: 2 }); window.ScrollTrigger?.refresh(); heroAmbient(); };
  if (skip || reduced) { intro.remove(); landed(); return; }
  if (embers) embers.alpha = 0;

  const ready = new Promise(res => { if (video.readyState >= 2) res(true); video.addEventListener('loadeddata', () => res(true), { once: true }); video.addEventListener('error', () => res(false), { once: true }); setTimeout(() => res(video.readyState >= 2), 9000); });
  const ok = await ready;
  if (!ok) { intro.remove(); landed(); return; }
  let handed = false, was = null, restored = false;
  const restore = () => { if (restored || !was) return; restored = true; setTimeout(() => sound?.setMusic?.(true), 400); };
  const handOver = async (instant = false) => {
    if (handed) return; handed = true;
    intro.style.pointerEvents = 'none';
    gsap.killTweensOf('.gate, .g-sloka p, .g-tr, .g-en, #g-enter');
    const gateEl = $('.gate');
    if (gateEl) { gateEl.__dust?.stop(); if (instant) { gateEl.style.display = 'none'; } else { gsap.to(gateEl, { opacity: 0, duration: .25, overwrite: true }); } }
    if (!instant) await heroP;
    const gone = () => { video.pause(); $('.gate')?.__dust?.stop(); intro.remove(); if (!video.muted) restore(); };
    gsap.to(intro, { opacity: 0, duration: instant ? .35 : .7, ease: 'power1.inOut', onComplete: () => { if (instant) gone(); } });
    landed();
    gsap.fromTo('.fr-pillar.l, .fr-medal.l, .fr-corner.tl, .fr-frieze.bl', { x: '-110%' }, { x: '0%', duration: 1.1, ease: 'power3.out', delay: .2, clearProps: 'transform' });
    gsap.fromTo('.fr-pillar.r, .fr-medal.r, .fr-corner.tr, .fr-frieze.br', { x: '110%' }, { x: '0%', duration: 1.1, ease: 'power3.out', delay: .2, clearProps: 'transform' });
    gsap.fromTo('#nav', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 1, delay: .5, clearProps: 'transform' });   // (a transform left on the bar would trap the phone menu's full-screen panel inside it)
    if (!instant) {
      if (video.muted || video.ended) setTimeout(gone, 900); else { video.addEventListener('ended', gone, { once: true }); setTimeout(gone, 4200); }
    }
  };
  $('.in-skip').addEventListener('click', e => { e.stopPropagation(); handOver(true); });
  await gate(sound);
  if (handed) return;
  sound?.bell?.(.7);
  gsap.to('.gate', { opacity: 0, y: 20, duration: .7, ease: 'power2.in', onComplete: () => { $('.gate')?.__dust?.stop(); $('.gate')?.remove(); } });
  gsap.to('#gate-dust', { opacity: 0, duration: 1 });
  // the film starts once enough of it has arrived to play through (on a slow line it waits a moment on its first frame)
  if (video.readyState < 4) await new Promise(r => { video.addEventListener('canplaythrough', r, { once: true }); setTimeout(r, 2500); });
  video.muted = false; video.volume = .85;
  try { await video.play(); } catch { video.muted = true; await video.play().catch(() => handOver()); }
  was = sound?.musicOn;
  if (!video.muted) sound?.setMusic?.(false);                     // the film carries its own music for these seconds
  video.addEventListener('ended', () => { if (!video.muted) restore(); }, { once: true });
  // a film that stalls on the way (a slow connection) never holds the page: after a moment of waiting, the page takes over
  let stall = 0;
  video.addEventListener('waiting', () => { clearTimeout(stall); stall = setTimeout(() => { if (!handed && video.readyState < 3) handOver(); }, 1400); });
  video.addEventListener('playing', () => clearTimeout(stall));
  // a film that does not move (no audio device, a stalled decoder) plays muted, and failing that the page takes over
  setTimeout(() => { if (!handed && video.currentTime < .2) { video.muted = true; video.play().catch(() => { }); setTimeout(() => { if (!handed && video.currentTime < .2) handOver(); }, 1600); } }, 1500);
  const tick = () => { if (handed) return; if (video.currentTime >= CUT || video.ended) handOver(); else requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
