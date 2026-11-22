// The field of the Dharma Yuddha & Great Duels — a living world-war painted battlefield:
// multi-layered war atmosphere (flickering horizon siege fires, rolling backlit war smoke, distant storm lightning,
// coordinated flaming arrow barrages, distant siege detonations, three-strata warring hosts with fluttering war banners,
// smoldering scorch craters, motion afterimages, Dharma Kavacha guard shields, shattering boulders & velocity-streaked
// sparks) drawn smoothly over the painted plates with js/astra-fx.js.
import { AstraFX } from './astra-fx.js';
import { dpr, LITE } from './calm.js';

const gsap = window.gsap;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const rgbOf = hex => { const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16); return `${n >> 16 & 255},${n >> 8 & 255},${n & 255}`; };
const M = 4.6;                              // at zoom 1 the screen's height spans 4.6 m of the field

/** a point in the field (metres: x along the field, y above the ground) */
export class V {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  clone() { return new V(this.x, this.y, this.z); }
  add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  setY(y) { this.y = y; return this; }
}

let MAN = null;
const plates = new Map(), arts = new Map();
const loadImg = src => new Promise(res => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
const GRADE = { dusk: ['255,176,128', .04], night: ['86,108,178', .14], war: ['255,156,114', .08], storm: ['36,48,76', .58], dawn: ['255,214,200', 0], day: null, gold: null };
const FLOOR = { field: .83, sky: .78 };

// Visually audited full-body side-profile cutouts & their true natural facing direction (1 = faces right, -1 = faces left).
// Fighters whose side cuts are cropped (sugriva) or absent (ravana on ground) use their crisp full-body front view.
const PROFILE = {
  rama:        { view: 'left',  dir:  1 },
  lakshmana:   { view: 'left',  dir:  1 },
  hanuman:     { view: 'left',  dir:  1 },
  angada:      { view: 'left',  dir:  1 },
  nila:        { view: 'right', dir:  1 },
  jatayu:      { view: 'left',  dir:  1 },
  indrajit:    { view: 'left',  dir:  1 },
  atikaya:     { view: 'left',  dir:  1 },
  kumbhakarna: { view: 'left',  dir: -1 },
  tataka:      { view: 'left',  dir:  1 },
  subahu:      { view: 'left',  dir:  1 },
  khara:       { view: 'right', dir:  1 },
  prahasta:    { view: 'left',  dir:  1 },
  vali:        { view: 'left',  dir:  1 },
  akshakumara: { view: 'left',  dir:  1 },
  mareecha:    { view: 'left',  dir:  1 },
  sugriva:     { view: 'front', dir:  1 },
  ravana:      { view: 'front', dir: -1 }
};

// Bespoke Unreal Engine 5 CGI multi-pose combat sprites (BiRefNet matte-cut full-body & aerial chariot units)
const COMBAT_ART = {
  lakshmana: {
    idle: { src: 'assets/characters/cut/lakshmana-combat.webp', dir:  1, hMul: 1.06 },
    draw: { src: 'assets/characters/cut/lakshmana-draw.webp',   dir:  1, hMul: 1.08 }
  },
  atikaya: {
    idle: { src: 'assets/characters/cut/atikaya-combat.webp',   dir: -1, hMul: 1.04 }
  },
  jatayu: {
    idle:   { src: 'assets/characters/cut/jatayu-fly.webp',     dir:  1, hMul: 1.18 },
    attack: { src: 'assets/characters/cut/jatayu-attack.webp',  dir:  1, hMul: 1.26 }
  },
  ravana: {
    air:    { src: 'assets/characters/cut/ravana-chariot.webp', dir: -1, hMul: 1.24 }
  }
};

// pre-rendered soft billowing battlefield smoke puff (zero per-frame gradient allocations)
function makeSmoke(rgb) {
  const c = document.createElement('canvas'); c.width = c.height = 160; const g = c.getContext('2d');
  for (const [cx, cy, r, a] of [[80, 80, 62, .55], [56, 72, 42, .4], [104, 74, 40, .38], [74, 96, 44, .34]]) {
    const gr = g.createRadialGradient(cx, cy, r * .1, cx, cy, r);
    gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(.55, `rgba(${rgb},${a * .45})`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
  }
  return c;
}

// jagged granite boulder sprite (shaded & cracked)
function makeRock() {
  const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d');
  g.translate(48, 48); g.beginPath();
  const pts = [[38, -4], [30, 24], [8, 36], [-22, 30], [-38, 10], [-34, -18], [-12, -36], [18, -32]];
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  const gr = g.createRadialGradient(-14, -16, 4, 0, 0, 42);
  gr.addColorStop(0, '#c8a87c'); gr.addColorStop(.45, '#7a5d42'); gr.addColorStop(1, '#261a12');
  g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(255,180,96,.45)'; g.lineWidth = 1.6; g.stroke();
  g.strokeStyle = 'rgba(20,10,5,.7)'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(-14, -18); g.lineTo(2, 0); g.lineTo(18, -6); g.moveTo(2, 0); g.lineTo(-6, 20); g.stroke();
  return c;
}

const SMOKE_DARK = makeSmoke('16,10,8');
const SMOKE_WARM = makeSmoke('64,34,18');
const SMOKE_STORM = makeSmoke('22,30,48');
const SMOKE_MIST = makeSmoke('74,92,126');
const ROCK_SPR = makeRock();

async function plate(key, time) {
  MAN = MAN || fetch('assets/backgrounds/manifest.json').then(r => r.json()).catch(() => ({}));
  const man = await MAN, { BACKDROPS } = await import('./data/backdrops.js');
  const exact = time && man[`${key}-${time}`], base = BACKDROPS[key]?.[0] || 'day';
  const name = exact ? `${key}-${time}` : key, want = exact ? null : (time && time !== base ? time : null);
  const id = `${name}/${want || ''}`;
  if (!plates.has(id)) plates.set(id, (async () => {
    const meta = man[name]; if (!meta) return null;
    const img = await loadImg(meta.src); if (!img) return null;
    const g = GRADE[want];
    if (!g) return { img, meta };
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const x = c.getContext('2d');
    x.drawImage(img, 0, 0); x.globalCompositeOperation = 'multiply'; x.fillStyle = `rgb(${g[0]})`; x.fillRect(0, 0, c.width, c.height);
    if (g[1]) { x.globalCompositeOperation = 'source-over'; x.fillStyle = `rgba(0,0,0,${g[1]})`; x.fillRect(0, 0, c.width, c.height); }
    return { img: c, meta };
  })());
  return plates.get(id);
}

// a warrior's art lit by the painting: multiplied by the painting's light, with a warm fire-rim light
async function lit(src, meta) {
  const id = src + '|' + (meta?.src || '');
  if (!arts.has(id)) arts.set(id, (async () => {
    const img = await loadImg(src); if (!img) return null;
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    const key = meta?.key || [1, .92, .8], amb = meta?.amb || [.5, .45, .4];
    const tone = key.map((k, i) => Math.round(255 * clamp(.62 * k + .55 * amb[i] + .12, .55, 1)));
    x.globalCompositeOperation = 'multiply'; x.fillStyle = `rgb(${tone})`; x.fillRect(0, 0, c.width, c.height);
    const side = (meta?.keyX ?? .5) < .5 ? 0 : c.width, rim = x.createLinearGradient(side, 0, c.width - side, 0);
    rim.addColorStop(0, `rgba(${key.map(k => Math.round(255 * k))},.42)`); rim.addColorStop(.38, 'rgba(0,0,0,0)');
    x.globalCompositeOperation = 'lighter'; x.fillStyle = rim; x.fillRect(0, 0, c.width, c.height);
    x.globalCompositeOperation = 'destination-in'; x.drawImage(img, 0, 0);
    return c;
  })());
  return arts.get(id);
}

// a warrior of the armies behind the duel: silhouetted in war-haze with an ember rim
async function shade(src, meta) {
  const id = 'shade|' + src + '|' + (meta?.src || '');
  if (!arts.has(id)) arts.set(id, (async () => {
    const img = await loadImg(src); if (!img) return null;
    const c = document.createElement('canvas'), k = 260 / img.naturalHeight; c.width = Math.round(img.naturalWidth * k); c.height = 260; const x = c.getContext('2d');
    x.drawImage(img, 0, 0, c.width, c.height);
    const haze = (meta?.haze || [.45, .36, .28]).map(v => Math.round(255 * v * .48));
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = `rgb(${haze})`; x.globalAlpha = .84; x.fillRect(0, 0, c.width, c.height);
    const rim = x.createLinearGradient(0, 0, c.width, 0); rim.addColorStop(0, 'rgba(255,176,92,.44)'); rim.addColorStop(.32, 'rgba(0,0,0,0)');
    x.globalAlpha = 1; x.fillStyle = rim; x.fillRect(0, 0, c.width, c.height);
    return c;
  })());
  return arts.get(id);
}

class Actor {
  constructor(stage, id, poseSpecs, x, sc) {
    this.stage = stage; this.id = id; this.height = 1.9; this.dir = 1; this.seed = Math.random() * 9;
    this.poses = {}; this.naturalDir = poseSpecs.idle?.dir || 1;
    this.ghosts = []; this.prevX = x; this.prevY = 0; this.ghostCd = 0;
    this.state = {
      x, y: 0, sc, lean: 0, squash: 1, glow: 0, flash: 0, tilt: 0, dissolve: 0,
      gait: 0, phase: 0, op: 0, guard: false, shaktiFull: false,
      weaponGlow: 0, weaponCol: null, aimArrow: 0, astraHalo: 0,
      fireAura: 0, fly: false, chariot: false, pose: 'idle', collapse: 0, victorious: false
    };
    const entries = Object.entries(poseSpecs).filter(([, v]) => v?.src);
    this.ready = Promise.all(entries.map(([k, spec]) =>
      lit(spec.src, stage.meta).then(c => {
        if (c) this.poses[k] = { img: c, dir: spec.dir || 1, hMul: spec.hMul || 1 };
      })
    )).then(() => {
      this.img = this.poses.idle?.img || Object.values(this.poses)[0]?.img || null;
      if (this.img) this.height = 1.9;
      gsap.to(this.state, { op: 1, duration: .5 });
    });
  }
  face(d) { this.dir = d === 'L' ? -1 : 1; }
  dispose() { this.gone = true; }
}

export class Stage2D {
  constructor(root, fxCanvas, { sound } = {}) {
    this.root = root; this.sound = sound;
    this.c = document.createElement('canvas'); this.c.className = 'fy-paint'; root.appendChild(this.c); this.x = this.c.getContext('2d');
    this.fx = new AstraFX(fxCanvas, { max: 1.5, onShake: (x, y) => { this.c.style.translate = `${x}px ${y}px`; } });
    this.cam = { x: 0, zoom: .85 };
    this.actors = new Map(); this.solids = []; this.motes = []; this.clouds = []; this.ranks = []; this.banners = []; this.scars = [];
    this.warCfg = { intensity: .65, storm: false, fires: true };
    this.warTimers = { volley: .9, boom: 1.8, storm: 2.5 };
    this.warFlash = 0; this.aberrPulse = 0; this.isAir = false;
    this.resize = () => { this.d = dpr(1.5); this.c.width = Math.round(this.c.clientWidth * this.d); this.c.height = Math.round(this.c.clientHeight * this.d); };
    addEventListener('resize', this.resize); this.resize();
    const fx = this.fx, self = this;

    // combat VFX bridged to AstraFX & battlefield ground
    this.vfx = {
      ambient: { petals: 0 },
      removeEmitter() { }, fire() { },
      slash(p, dir, color, size = 1, heavy = 0) {
        const [cx, cy] = self.toScreen(p), r = size * (heavy ? 1.48 : 1.18) * self.ppm, rgb = rgbOf(color);
        const a0 = dir > 0 ? -1.42 : Math.PI + 1.42, sweep = dir > 0 ? 2.75 : -2.75;
        const colKey = fx.key(color), isWarm = /#ff[4-9a-c]|#f[0-9a-f][4-8]/i.test(color);
        const outerRgb = isWarm ? '255,86,20' : rgb;
        fx.add((a, dt) => {
          const p2 = clamp(a / .13, 0, 1), fade = 1 - clamp((a - .1) / .28, 0, 1);
          const outer = [], main = [], inner = [];
          for (let i = 0; i <= 24; i++) {
            const u = i / 24 * p2, an = a0 + sweep * u, env = Math.sin(Math.PI * i / 24);
            const w = (1.6 + (heavy ? 18 : 11.5) * env) * fx.k * size;
            const wob = Math.sin(i * 1.1 - a * 34) * (heavy ? 7 : 3.5) * fx.k;
            const rx = Math.cos(an) * r, ry = Math.sin(an) * r * .76;
            outer.push([cx + rx * 1.08 + wob * .4, cy + ry * 1.08 - wob * .3, w * 1.65]);
            main.push([cx + rx, cy + ry, w]);
            inner.push([cx + rx * .84, cy + ry * .84, w * .42]);
          }
          fx.ribbon(outer, outerRgb, fade * .62, '255,214,120');
          fx.ribbon(main, rgb, fade * .95, '255,250,232');
          fx.ribbon(inner, '255,252,235', fade * .72);
          if (heavy && a < .2) {
            fx.anamorphic(cx + dir * r * .45, cy, 220 * fx.k * size, 8 * fx.k, rgb, (1 - a / .2) * .88);
            if (Math.random() < dt * 40) {
              const an = a0 + sweep * rnd(.2, .9);
              fx.smoke(cx + Math.cos(an) * r * .95, cy + Math.sin(an) * r * .72, dir * rnd(20, 70) * fx.k, rnd(-45, -10) * fx.k, .55, rnd(14, 24) * fx.k, { a: .34, ash: true });
            }
          }
        }, .4);
        for (let i = 0; i < (heavy ? 32 : 16); i++) {
          const an = a0 + sweep * rnd(.15, .98);
          fx.spark(cx + Math.cos(an) * r, cy + Math.sin(an) * r * .76, Math.cos(an) * rnd(210, 520) * fx.k, Math.sin(an) * rnd(210, 480) * fx.k - 55 * fx.k, rnd(.28, .65), rnd(1.8, 3.8) * fx.k, i % 3 === 0 ? 'white' : colKey, { g: 240 * fx.k, streak: 1.55 });
        }
      },
      clash(p, colA = '#ffd36b', colB = '#9fd7ff', scale = 1, violet = false) {
        const [cx, cy] = self.toScreen(p);
        fx.clash(cx, cy, { colA: rgbOf(colA), colB: rgbOf(colB), scale, floorY: self.isAir ? 0 : self.floorY, violet });
      },
      feathers(p, n = 16, speed = 240) {
        const [cx, cy] = self.toScreen(p);
        fx.featherBurst(cx, cy, n, speed);
      },
      burst(p, color, n = 40, speed = 4, o = {}) {
        const [x, y] = self.toScreen(p);
        fx.burst(x, y, Math.round(n * .95), speed * 85, [fx.key(color), 'white'], { g: o.gravity ? o.gravity * -95 * fx.k : 220 * fx.k, life: .95, streak: 1.35, floor: self.floorY });
        if (n >= 50) fx.smokeBurst(x, y, 7, 110, 26, .42, { ash: true });
      },
      flare(p, color, size = 2, dur = .42) {
        const [x, y] = self.toScreen(p), k = fx.key(color), rgb = rgbOf(color);
        fx.add(a => {
          const e = 1 - a / dur;
          fx.glow(x, y, size * 42 * fx.k * (1 + (1 - e) * .7), k, e);
          fx.glow(x, y, size * 16 * fx.k, 'white', e);
          if (size >= 2) fx.anamorphic(x, y, size * 85 * fx.k, 6 * fx.k, rgb, e * .85);
        }, dur);
      },
      charge(p, color, dur = .6) {
        const [x, y] = self.toScreen(p), k = fx.key(color), rgb = rgbOf(color);
        fx.add((a, dt) => {
          const e = a / dur;
          fx.glow(x, y, (14 + 54 * e) * fx.k, k, e);
          fx.mandala(x, y, (18 + 38 * e) * fx.k, rgb, e * .75, a * 2.2);
          if (Math.random() < dt * 110) {
            const an = rnd(0, TAU), r = rnd(70, 140) * fx.k;
            fx.spark(x + Math.cos(an) * r, y + Math.sin(an) * r, -Math.cos(an) * r * 3.2, -Math.sin(an) * r * 3.2, .28, rnd(1.5, 3.2) * fx.k, k, { drag: 1, streak: 1.2 });
          }
        }, dur);
      },
      shockwave(p, color, size = 5, dur = .82) {
        const rgb = rgbOf(color);
        self.scorch(p, color, size * .26);
        const [sx] = self.toScreen(p);
        fx.debris(sx, self.floorY - 6 * fx.k, Math.min(24, Math.round(size * 3.5)), 440, self.floorY);
        fx.smokeBurst(sx, self.floorY - 10 * fx.k, 10, 150, 30, .48, { ash: true });
        fx.add(a => {
          const q = a / dur, [x] = self.toScreen(p), r = size * self.ppm * .56 * (.14 + .86 * (1 - (1 - q) ** 3));
          fx.ring(x, self.floorY, r, rgb, 1 - q, 0, .24);
          if (q < .75) fx.shockRing(x, self.floorY - 24 * fx.k, r * .65, rgb, (1 - q / .75) * .65, 2.2);
        }, dur);
      },
      pillar(p, color, h = 20, dur = 1.25) {
        const k = fx.key(color), rgb = rgbOf(color);
        self.scorch(p, color, 1.9);
        fx.add(a => {
          const [x] = self.toScreen(p), y = self.floorY, e = Math.sin(Math.PI * Math.min(1, a / dur));
          const w = 44 * fx.k * e, top = -40;
          fx.ribbon([[x, y, w * .35], [x, (y + top) / 2, w], [x, top, w * .7]], rgb, e * .88);
          fx.glow(x, y, 120 * fx.k * e, k, e);
          fx.anamorphic(x, y - 30 * fx.k, 260 * fx.k * e, 10 * fx.k, rgb, e * .8);
        }, dur);
      },
      rune(p, color, size = 3, dur = 2) {
        const rgb = rgbOf(color);
        fx.add(a => {
          const [x] = self.toScreen(p), y = self.floorY, e = Math.min(1, a / .28) * (1 - Math.max(0, (a - dur + .5) / .5));
          fx.ring(x, y, size * self.ppm * .36, rgb, e, 16, .26, a * 1.1);
          fx.ring(x, y, size * self.ppm * .22, '255,244,210', e * .82, 8, .26, -a * 1.6);
        }, dur);
      },
      dust(p, n = 20, color = '#8a7258', size = 1.5) {
        const [x] = self.toScreen(p), y = self.floorY;
        fx.smokeBurst(x, y - 8 * fx.k, Math.min(16, Math.max(5, Math.round(n * .35))), 120 * size, 24 * size, .44, { ash: true });
        for (let i = 0; i < n * .45; i++) self.solids.push({ kind: 'dust', x: x + rnd(-34, 34) * fx.k * size, y: y - rnd(0, 10) * fx.k, vx: rnd(-85, 85) * fx.k * size, vy: rnd(-75, -14) * fx.k, r: rnd(16, 34) * fx.k * size, life: rnd(.7, 1.35), max: 1.35, c: color });
        self.wake();
      },
      projectile({ from, to, kind = 'arrow', color = '#ffe08a', dur, onHit }) {
        const T = dur || (kind === 'rock' ? .7 : .36), rgb = rgbOf(color), k = fx.key(color), trail = [];
        if (kind === 'rock') {
          const s = { kind: 'rock', x: 0, y: 0, r: 20 * fx.k, life: T, max: T, t: 0, rot: rnd(0, TAU), vr: rnd(-9, 9) };
          self.solids.push(s); self.wake();
          s.step = dt => {
            s.t += dt; s.rot += s.vr * dt;
            const u = Math.min(1, s.t / T), [ax, ay] = self.toScreen(from), [bx, by] = self.toScreen(to);
            s.x = ax + (bx - ax) * u; s.y = ay + (by - ay) * u - Math.sin(u * Math.PI) * 96 * fx.k;
            if (u < 1 && Math.random() < dt * 28) fx.smoke(s.x, s.y, rnd(-18, 18) * fx.k, rnd(-28, 8) * fx.k, .55, 13 * fx.k, { a: .32, ash: true });
            if (u >= 1 && !s.hit) {
              s.hit = true; s.life = 0;
              fx.debris(s.x, s.y, 14, 380, self.floorY);
              fx.smokeBurst(s.x, s.y, 8, 120, 26, .48, { ash: true });
              onHit?.(to.clone());
            }
          };
          return;
        }
        fx.add((a, dt) => {
          const u = Math.min(1, a / T), [ax, ay] = self.toScreen(from), [bx, by] = self.toScreen(to);
          const hx = ax + (bx - ax) * u, hy = ay + (by - ay) * u - Math.sin(u * Math.PI) * (kind === 'arrow' ? 24 : 52) * fx.k;
          trail.push([hx, hy]); if (trail.length > (kind === 'arrow' ? 9 : 14)) trail.shift();
          if (u < 1) {
            fx.ribbon(trail.map(([x, y], i) => [x, y, (kind === 'arrow' ? .7 + i * .42 : 1.4 + i * .72) * fx.k]), rgb, 1);
            fx.glow(hx, hy, (kind === 'arrow' ? 16 : 34) * fx.k, k, 1);
            if (Math.random() < dt * 36) fx.smoke(hx, hy, rnd(-15, 15) * fx.k, rnd(-25, -5) * fx.k, .45, 9 * fx.k, { a: .22, ash: true });
          } else if (!trail.hit) {
            trail.hit = true;
            if (kind === 'astra') fx.explosion(bx, by, { scale: .9, color: k, rgb, floorY: self.floorY, shake: .7, flare: true });
            onHit?.(to.clone());
          }
        }, T + .02);
      }
    };
  }

  get W() { return this.c.clientWidth || innerWidth; } get H() { return this.c.clientHeight || innerHeight; }
  get ppm() { return this.H * this.cam.zoom / M; }
  get floorY() { return this.H * (this.W < this.H ? .66 : (FLOOR[this.key] || .9)); }
  toScreen(v) { return [this.W / 2 + (v.x - this.cam.x) * this.ppm, this.floorY - v.y * this.ppm]; }
  shake(a) { this.fx.shake = Math.max(this.fx.shake, a * 1.05); this.fx.wake(); }
  flash(color, a) { this.fx.hit(a * .48, rgbOf(color), 0); }
  aberr(a) {
    this.aberrPulse = Math.max(this.aberrPulse, a);
    this.fx.hit(a * .18, '255,244,218', a * .5);
    const cx = this.W / 2, cy = this.H * .48;
    this.fx.add(t => { const q = t / .32; this.fx.shockRing(cx, cy, (40 + this.W * .42 * q), '255,220,160', (1 - q) * .45 * a, 2.5); }, .34);
  }

  /** configure ambient world-war intensity for the current battle */
  setWar({ intensity = .85, storm = false, fires = true } = {}) {
    this.warCfg = { intensity: clamp(intensity, 0, 1.3), storm, fires };
  }

  /** leave a glowing smoldering crater / scorch scar on the battlefield floor */
  scorch(p, color = '#ff6a2a', radius = 1.4) {
    if (this.scars.length > 14) this.scars.shift();
    this.scars.push({ x: p.x, r: radius, rgb: rgbOf(color), life: 9, max: 9 });
  }

  /** "arena/time | id@pct id@pct*scale | fx |" */
  async play({ script }) {
    const [bgPart = 'field', castPart = ''] = script.split('|').map(s => s.trim());
    const [key, time] = bgPart.split('/');
    if (`${key}/${time || ''}` !== this.envKey) {
      this.envKey = `${key}/${time || ''}`;
      const p = await plate(key, time);
      this.key = key; this.plate = p?.img || null; this.meta = p?.meta || null; this.time = time || 'gold';
      this.isAir = key === 'sky' && time === 'storm';
      this.motes = []; this.clouds = []; this.scars = [];
      // default war atmosphere per arena (callers can refine via setWar)
      const isField = key === 'field';
      const isDark = time === 'night' || time === 'dusk' || this.isAir;
      this.setWar({ intensity: this.isAir ? 1.05 : (isField ? 1 : (isDark ? .68 : .45)), storm: isDark || isField, fires: !this.isAir && (isField || isDark) });
    }
    const want = castPart.split(/\s+/).filter(Boolean).map(t => { const [id, rest = '50'] = t.split('@'); const [pct, sc] = rest.split('*'); return { id, x: (+pct / 100 - .5) * 10, sc: +(sc || 1) }; });
    for (const [k, a] of this.actors) if (!want.some(w => w.id === k)) { a.dispose(); this.actors.delete(k); }
    const art = this.art || {};
    for (const w of want) {
      const artId = art[w.id] ? w.id : this.proxy?.[w.id];
      const views = art[artId]?.views;
      const prof = PROFILE[artId] || { view: 'front', dir: 1 };
      const custom = COMBAT_ART[artId];
      const fallbackSrc = views?.[prof.view]?.src || views?.front?.src;
      const poseSpecs = {};
      if (this.isAir && custom?.air) {
        poseSpecs.idle = custom.air;
      } else if (custom?.idle) {
        poseSpecs.idle = custom.idle;
      } else if (fallbackSrc) {
        poseSpecs.idle = { src: fallbackSrc, dir: prof.dir, hMul: 1 };
      }
      if (custom?.attack) poseSpecs.attack = custom.attack;
      if (custom?.draw) poseSpecs.draw = custom.draw;
      if (!poseSpecs.idle) continue;
      const actor = new Actor(this, w.id, poseSpecs, w.x, w.sc);
      if (this.isAir && custom?.air) actor.state.chariot = true;
      this.actors.set(w.id, actor);
    }
    await Promise.all([...this.actors.values()].map(a => a.ready));
    this.start();
  }

  /** two armies at war behind the duel: three depth strata + fluttering war standards */
  async war(sides) {
    this.ranks = []; this.banners = []; this.warOn = !!sides; if (!sides) return;
    const art = this.art || {}, src = id => art[id]?.views?.front?.src;
    const perSide = LITE ? 22 : 36;
    const make = async (ids, side) => {
      const imgs = (await Promise.all(ids.filter(src).map(id => shade(src(id), this.meta)))).filter(Boolean);
      if (!imgs.length) return;
      for (let i = 0; i < perSide; i++) {
        const depth = .2 + Math.random() * .8;
        const x = side * (.35 + Math.random() * 7.8);
        this.ranks.push({ img: imgs[i % imgs.length], side, x, depth, flip: Math.random() < .42, sc: .85 + Math.random() * .3, ph: Math.random() * 9, rate: 1.6 + Math.random() * 2.4, lunge: 0, jump: 0 });
      }
      // distant painterly swallowtail war standards (dhvajas) sunken into the atmospheric haze
      for (let b = 0; b < 3; b++) {
        this.banners.push({
          side, x: side * (2.3 + b * 2.1 + rnd(-.35, .35)), depth: .62 + (b % 3) * .12,
          h: 2.35 + rnd(0, .55), ph: rnd(0, TAU),
          c1: side < 0 ? '#6e4212' : '#4a100c', c2: side < 0 ? '#c4832c' : '#8c1e16', trim: side < 0 ? 'rgba(255,214,132,.5)' : 'rgba(255,134,82,.42)'
        });
      }
    };
    await Promise.all([make(sides[0], -1), make(sides[1], 1)]);
    this.ranks.sort((a, b) => b.depth - a.depth);
    this.banners.sort((a, b) => b.depth - a.depth);
  }

  // ambient world-war sky & horizon action: flaming arrow barrages, siege artillery explosions, storm lightning, drifting smoke/clouds
  stepWarAmbience(t, dt) {
    const I = this.warCfg.intensity; if (I <= .05) return;
    const W = this.W, H = this.H, fx = this.fx, k = fx.k, air = this.isAir;
    // rolling backlit war-smoke clouds (or subtle drifting storm mist wisps over the photorealistic sky-storm plate)
    const maxClouds = air ? (LITE ? 7 : 11) : (LITE ? 10 : 18);
    if (this.clouds.length < maxClouds) {
      const far = Math.random() < (air ? .65 : .58);
      this.clouds.push({
        x: rnd(-W * .18, W * 1.18),
        y: air ? (far ? rnd(H * .08, H * .68) : rnd(H * .72, H * 1.02)) : (far ? rnd(H * .24, H * .72) : rnd(H * .68, H * .98)),
        vx: rnd(air ? 30 : 14, air ? 72 : 38) * (far ? .65 : 1.25), vy: air ? rnd(-4, 4) : rnd(-10, -2),
        r: rnd(air ? 140 : 110, air ? 260 : 240) * (far ? 1.15 : .85),
        a: rnd(air ? .12 : .14, air ? .26 : .32) * I * (far ? 1 : .78),
        rot: rnd(0, TAU), vr: rnd(-.08, .08), warm: air ? (Math.random() < .42) : (Math.random() < .42), far
      });
    }
    for (const c of this.clouds) {
      c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.vr * dt;
      if (c.x - c.r > W + 90) {
        c.x = -c.r - rnd(20, 140);
        c.y = air ? (c.far ? rnd(-H * .04, H * .75) : rnd(H * .66, H * 1.04)) : (c.far ? rnd(H * .24, H * .72) : rnd(H * .68, H * .98));
      }
    }

    if (!air) {
      // coordinated flaming arrow barrages streaking across the battlefield sky
      this.warTimers.volley -= dt * I;
      if (this.warTimers.volley <= 0) {
        this.warTimers.volley = rnd(1.1, 2.3);
        const fromLeft = Math.random() < .5;
        const sx = fromLeft ? rnd(-W * .04, W * .2) : rnd(W * .8, W * 1.04);
        const ex = fromLeft ? rnd(W * .56, W * .96) : rnd(W * .04, W * .44);
        const sy = rnd(H * .38, H * .66), ey = rnd(H * .58, this.floorY - 20 * k);
        fx.arrowVolley([sx, sy], [ex, ey], {
          count: LITE ? 4 : Math.round(rnd(5, 10)),
          color: fromLeft ? '255,214,132' : '255,108,52',
          glowCol: fromLeft ? 'gold' : 'fire',
          spread: 85, arc: rnd(95, 185), dur: rnd(.75, 1.15)
        });
      }

      // distant siege ordnance / boulder / firestorm impacts on the horizon & mid-ground
      this.warTimers.boom -= dt * I;
      if (this.warTimers.boom <= 0) {
        this.warTimers.boom = rnd(1.7, 3.4);
        const bx = rnd(W * .08, W * .92), by = rnd(H * .46, this.floorY - 35 * k);
        const sc = rnd(.42, .82);
        const fiery = Math.random() < .75;
        fx.explosion(bx, by, { scale: sc, color: fiery ? 'fire' : 'gold', rgb: fiery ? '255,102,28' : '255,210,118', floorY: by + 26 * k, shake: sc * .26, flare: sc > .64 });
        this.warFlash = Math.max(this.warFlash, sc * .32);
      }
    }

    // storm-cloud forked lightning on dusk / night / war / storm skies
    if (this.warCfg.storm) {
      this.warTimers.storm -= dt * I;
      if (this.warTimers.storm <= 0) {
        this.warTimers.storm = air ? rnd(.95, 2.2) : rnd(2.6, 5.8);
        const lx = rnd(W * .08, W * .92), ly = air ? rnd(H * .45, H * .88) : rnd(H * .28, H * .56);
        const bolt = fx.bolt(lx, -10, lx + rnd(-110, 110) * k, ly, .32, air ? 6 : 5);
        const mid = bolt[(bolt.length * .42) | 0] || bolt[4];
        const br = fx.bolt(mid[0], mid[1], mid[0] + rnd(-140, 140) * k, mid[1] + rnd(50, 150) * k, .36, 4);
        fx.add(a => { const fa = 1 - a / .22; fx.strokeBolt(bolt, air ? '196,226,255' : '180,210,255', (air ? 2.6 : 1.8) * k, fa * (air ? .92 : .75)); fx.strokeBolt(br, air ? '156,192,255' : '150,185,255', (air ? 1.5 : 1.0) * k, fa * .65); }, .23);
        this.warFlash = Math.max(this.warFlash, air ? .52 : .24);
      }
    }
    this.warFlash *= Math.pow(.04, dt);
    this.aberrPulse *= Math.pow(.01, dt);
  }

  drawRanks(t, dt) {
    const x = this.x, W = this.W, H = this.H, ppm = this.ppm, fx = this.fx;
    // painterly distant war standards (dhvajas) sunken into the haze
    for (const b of this.banners) {
      const sc = 1 - b.depth * .56;
      const sx = W / 2 + (b.x - this.cam.x * .6) * ppm * sc;
      const sy = this.floorY - b.depth * H * .14;
      const ph = b.h * ppm * sc, fw = ph * .24, fh = ph * .12;
      const wave = Math.sin(t * 5.2 + b.ph) * fw * .16, wave2 = Math.cos(t * 6.8 + b.ph) * fw * .14;
      const dir = b.side < 0 ? 1 : -1;
      x.save(); x.globalAlpha = .38 + (1 - b.depth) * .28;
      x.strokeStyle = 'rgba(34,20,10,.88)'; x.lineWidth = Math.max(1.2, 2.2 * sc);
      x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx, sy - ph); x.stroke();
      x.fillStyle = b.trim; x.beginPath(); x.arc(sx, sy - ph, 2.2 * sc, 0, TAU); x.fill();
      // shaded swallowtail pennant (fabric light-to-shadow gradient so it feels oil-painted, not flat vector)
      const gr = x.createLinearGradient(sx, sy - ph, sx + dir * fw, sy - ph + fh);
      gr.addColorStop(0, b.c2); gr.addColorStop(.55, b.c1); gr.addColorStop(1, '#221008');
      x.fillStyle = gr; x.beginPath();
      x.moveTo(sx, sy - ph + 2 * sc);
      x.quadraticCurveTo(sx + dir * fw * .55, sy - ph + fh * .15 + wave, sx + dir * fw, sy - ph + fh * .2 + wave2);
      x.lineTo(sx + dir * fw * .78, sy - ph + fh * .54 + wave2 * .6);
      x.lineTo(sx + dir * fw * .98, sy - ph + fh * .88 + wave2);
      x.quadraticCurveTo(sx + dir * fw * .48, sy - ph + fh * .92 - wave * .5, sx, sy - ph + fh);
      x.closePath(); x.fill();
      x.strokeStyle = b.trim; x.lineWidth = Math.max(.6, .9 * sc); x.stroke();
      x.restore();
    }

    // three-strata clashing warriors
    for (const r of this.ranks) {
      if (!r.img) continue;
      if (Math.random() < dt * .4) gsap.to(r, { lunge: 1, duration: .22, yoyo: true, repeat: 1, ease: 'power2.out' });
      if (r.side < 0 && Math.random() < dt * .14) gsap.to(r, { jump: 1, duration: .32, yoyo: true, repeat: 1, ease: 'power2.out' });
      const scale = 1 - r.depth * .56;
      const sx = W / 2 + (r.x - this.cam.x * .6 - r.side * r.lunge * .55) * ppm * scale;
      const sy = this.floorY - r.depth * H * .14 - r.jump * ppm * .45 * scale;
      const h = 1.9 * r.sc * ppm * scale * .92, w = h * r.img.width / r.img.height;
      x.save(); x.globalAlpha = .78 + (1 - r.depth) * .22; x.translate(sx, sy);
      x.rotate(Math.sin(t * r.rate + r.ph) * .08 + r.side * -r.lunge * .15);
      if (r.flip !== (r.side > 0)) x.scale(-1, 1);
      x.drawImage(r.img, -w / 2, -h, w, h); x.restore();
    }

    // fierce front-line clashes: arrows, weapon-clash spark bursts & miniature shock flashes
    if (Math.random() < dt * 8.5) {
      const a = this.ranks[(Math.random() * this.ranks.length) | 0];
      const b = this.ranks.find(q => q.side !== a?.side && Math.random() < .25) || this.ranks.find(q => q.side !== a?.side);
      if (a && b) {
        const pos = r => [W / 2 + (r.x - this.cam.x * .6) * ppm * (1 - r.depth * .56), this.floorY - r.depth * H * .14 - 1.15 * ppm * (1 - r.depth * .56)];
        const [ax, ay] = pos(a), [bx, by] = pos(b), trail = [];
        fx.add(u => {
          const q = Math.min(1, u / .46), hx = ax + (bx - ax) * q, hy = ay + (by - ay) * q - Math.sin(q * Math.PI) * 44 * fx.k;
          trail.push([hx, hy]); if (trail.length > 7) trail.shift();
          fx.ribbon(trail.map(([px, py], i) => [px, py, (.45 + i * .24) * fx.k]), a.side < 0 ? '255,214,132' : '255,116,64', .68 * (1 - q * .25));
        }, .48);
      }
    }
    if (Math.random() < dt * 5.5) {
      const zx = W / 2 + (rnd(-2.4, 2.4) - this.cam.x * .6) * ppm * .72;
      const zy = this.floorY - rnd(.22, .88) * H * .14 - ppm * .62;
      fx.burst(zx, zy, 18, 220, ['gold', 'ember', 'white'], { life: .48, size: .75, streak: 1.3 });
    }
  }

  start() { this.running = true; this.wake(); }
  stop() { this.running = false; this.fx.clear(); }
  wake() { if (!this.raf && this.running) { this.last = performance.now(); this.raf = requestAnimationFrame(t => this.frame(t)); } }

  frame(now) {
    this.raf = 0; if (!this.running || document.hidden) return;
    const dt = Math.min(.05, (now - this.last) / 1000); this.last = now; const t = now / 1000;
    const x = this.x, d = this.d, W = this.W, H = this.H, I = this.warCfg.intensity;
    if (this.c.width !== Math.round(W * d)) this.resize();
    this.stepWarAmbience(t, dt);

    x.setTransform(d, 0, 0, d, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
    // 1. painted battlefield plate with subtle dynamic battle-zoom punch
    const zoomPunch = 1 + this.aberrPulse * .025;
    if (this.plate) {
      const iw = this.plate.width, ih = this.plate.height, s = Math.max(W / iw, H / ih) * (1.08 + (this.cam.zoom - .85) * .06) * zoomPunch;
      const ox = clamp(-this.cam.x * this.ppm * .1, -(iw * s - W) / 2, (iw * s - W) / 2), oy = (H - ih * s) / 2 + (this.cam.zoom - .85) * H * .03;
      x.drawImage(this.plate, (W - iw * s) / 2 + ox, oy, iw * s, ih * s);
    } else { x.fillStyle = '#1a0f07'; x.fillRect(0, 0, W, H); }

    // 2. flickering distant siege-fires along the war horizon + sky storm/war-flash illumination
    if (this.warCfg.fires && I > .1) {
      x.globalCompositeOperation = 'lighter';
      const spots = [[.14, .66, .28], [.36, .62, .22], [.64, .63, .26], [.86, .66, .3]];
      for (let i = 0; i < spots.length; i++) {
        const [ux, uy, sr] = spots[i], flick = (.55 + .45 * Math.sin(t * (3.7 + i * 1.3) + i * 2.1) * Math.cos(t * 2.1 + i));
        const r = W * sr * (.85 + .15 * flick), cx = W * ux, cy = H * uy;
        const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r);
        gr.addColorStop(0, `rgba(255,112,32,${.22 * I * flick})`);
        gr.addColorStop(.45, `rgba(210,56,16,${.1 * I * flick})`);
        gr.addColorStop(1, 'rgba(180,30,0,0)');
        x.fillStyle = gr; x.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
      x.globalCompositeOperation = 'source-over';
    }
    if (this.warFlash > .01) {
      x.globalCompositeOperation = 'lighter';
      x.fillStyle = this.isAir ? `rgba(176,214,255,${this.warFlash * .34})` : `rgba(255,214,160,${this.warFlash * .28})`;
      x.fillRect(0, 0, W, H * (this.isAir ? 1 : .72));
      x.globalCompositeOperation = 'source-over';
    }

    // 3. far parallax war-smoke / brooding storm thunderclouds behind the armies
    const cDark = this.isAir ? SMOKE_STORM : SMOKE_DARK, cLit = this.isAir ? SMOKE_MIST : SMOKE_WARM;
    for (const c of this.clouds) if (c.far) {
      x.save(); x.globalAlpha = c.a * (this.isAir && this.warFlash > .06 ? 1 + this.warFlash * .6 : 1); x.translate(c.x, c.y); x.rotate(c.rot);
      x.drawImage(c.warm ? cLit : cDark, -c.r, -c.r, c.r * 2, c.r * 2); x.restore();
    }

    // 4. warring armies & banners
    if (this.ranks.length && !this.isAir) this.drawRanks(t, dt);

    // 5. smoldering ground scorch craters beneath the fighters (ground battles only)
    this.scars = this.scars.filter(s => (s.life -= dt) > 0);
    if (!this.isAir) for (const s of this.scars) {
      const [sx] = this.toScreen({ x: s.x, y: 0 }), f = s.life / s.max, rx = s.r * this.ppm * .75;
      x.save(); x.globalCompositeOperation = 'source-over';
      const dark = x.createRadialGradient(sx, this.floorY, 0, sx, this.floorY, rx);
      dark.addColorStop(0, `rgba(8,4,2,${.62 * f})`); dark.addColorStop(1, 'rgba(8,4,2,0)');
      x.translate(sx, this.floorY); x.scale(1, .24); x.translate(-sx, -this.floorY);
      x.fillStyle = dark; x.fillRect(sx - rx, this.floorY - rx, rx * 2, rx * 2);
      x.globalCompositeOperation = 'lighter';
      const hot = x.createRadialGradient(sx, this.floorY, 0, sx, this.floorY, rx * .72);
      const pulse = .75 + .25 * Math.sin(t * 7 + s.x);
      hot.addColorStop(0, `rgba(255,232,170,${.55 * f * f * pulse})`);
      hot.addColorStop(.45, `rgba(${s.rgb},${.45 * f * pulse})`);
      hot.addColorStop(1, `rgba(${s.rgb},0)`);
      x.fillStyle = hot; x.fillRect(sx - rx, this.floorY - rx, rx * 2, rx * 2);
      x.restore();
      if (f > .3 && Math.random() < dt * 4) this.fx.smoke(sx + rnd(-rx * .3, rx * .3), this.floorY - 4, rnd(-12, 12), rnd(-35, -14), 1.1, 18 * this.fx.k, { a: .26 * f });
    }

    // 6. main duelists / heroes
    x.globalCompositeOperation = 'source-over';
    const list = [...this.actors.values()].filter(a => a.img).sort((a, b) => a.state.y - b.state.y);
    for (const a of list) this.drawActor(a, t, dt);

    // 7. physical solids: dust, jagged rotating boulders, victory petals
    this.solids = this.solids.filter(s => { if (s.step) s.step(dt); s.life -= dt; return s.life > 0; });
    for (const s of this.solids) {
      if (s.kind === 'dust') {
        s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= .965; s.r *= 1 + dt * .85;
        x.save(); x.globalAlpha = Math.min(1, s.life / s.max * 1.4) * .38;
        x.drawImage(SMOKE_WARM, s.x - s.r, s.y - s.r, s.r * 2, s.r * 2); x.restore();
      } else if (s.kind === 'rock') {
        x.save(); x.translate(s.x, s.y); x.rotate(s.rot || t * 6);
        x.drawImage(ROCK_SPR, -s.r * 1.25, -s.r * 1.25, s.r * 2.5, s.r * 2.5); x.restore();
      }
    }
    if (this.vfx.ambient.petals > 0) {
      this.vfx.ambient.petals = Math.max(0, this.vfx.ambient.petals - dt * .12);
      if (Math.random() < dt * 36 * this.vfx.ambient.petals) this.solids.push({ kind: 'petal', x: rnd(0, W), y: -10, vx: rnd(-20, 20), vy: rnd(40, 80), life: 6, max: 6, rot: rnd(0, 6), c: Math.random() < .5 ? '#ffb347' : '#ff6f61' });
    }
    for (const s of this.solids) if (s.kind === 'petal') {
      s.x += (s.vx + Math.sin(t * 2 + s.rot) * 20) * dt; s.y += s.vy * dt; s.rot += dt * 2;
      x.save(); x.translate(s.x, s.y); x.rotate(s.rot); x.fillStyle = s.c; x.beginPath(); x.ellipse(0, 0, 5.5, 2.5, 0, 0, TAU); x.fill(); x.restore();
    }

    // 8. foreground rolling war-smoke / storm clouds + wind-whipped ember/rain streaks
    for (const c of this.clouds) if (!c.far) {
      x.save(); x.globalAlpha = c.a; x.translate(c.x, c.y); x.rotate(c.rot);
      x.drawImage(c.warm ? cLit : cDark, -c.r, -c.r, c.r * 2, c.r * 2); x.restore();
    }
    const maxMotes = Math.round((LITE ? 34 : 68) * (.45 + I * .75));
    while (this.motes.length < maxMotes) {
      if (this.isAir) {
        const ember = Math.random() < .26;
        this.motes.push(ember
          ? { x: rnd(-40, W + 40), y: rnd(H * .45, H + 30), vy: rnd(-85, -24), vx: rnd(40, 120), s: rnd(1.4, 3.2), a: rnd(.45, .9), hot: Math.random() < .4, rain: false }
          : { x: rnd(-80, W + 80), y: rnd(-40, H * .25), vy: rnd(420, 720), vx: rnd(-180, -90), s: rnd(.8, 1.4), a: rnd(.14, .34), hot: false, rain: true });
      } else {
        this.motes.push({ x: rnd(-40, W + 40), y: rnd(H * .6, H + 30), vy: rnd(-95, -28) * (.7 + I * .5), vx: rnd(18, 95) * (Math.random() < .82 ? 1 : -1), s: rnd(1.2, 3.2), a: rnd(.4, .95), hot: Math.random() < .38, rain: false });
      }
    }
    x.globalCompositeOperation = 'lighter';
    x.lineCap = 'round';
    for (const m of this.motes) {
      m.x += (m.vx + (m.rain ? 0 : Math.sin(t * 3 + m.y * .02) * 18)) * dt; m.y += m.vy * dt;
      const mul = m.rain ? .032 : .045, sx = m.vx * mul, sy = m.vy * mul;
      x.strokeStyle = m.rain ? `rgba(180,214,255,${m.a})` : (m.hot ? `rgba(255,228,150,${m.a})` : `rgba(255,126,38,${m.a * .88})`);
      x.lineWidth = m.s;
      x.beginPath(); x.moveTo(m.x, m.y); x.lineTo(m.x - sx, m.y - sy); x.stroke();
    }
    this.motes = this.motes.filter(m => m.rain ? (m.y < H + 40 && m.x > -120) : (m.y > -20 && m.x > -80 && m.x < W + 80));

    // 9. cinema depth vignette & lower atmosphere
    x.globalCompositeOperation = 'source-over';
    const v = x.createLinearGradient(0, H * .68, 0, H);
    v.addColorStop(0, this.isAir ? 'rgba(6,10,18,0)' : 'rgba(10,6,3,0)');
    v.addColorStop(1, this.isAir ? 'rgba(4,7,14,.68)' : 'rgba(8,4,2,.62)');
    x.fillStyle = v; x.fillRect(0, H * .68, W, H * .32);
    const vig = x.createRadialGradient(W / 2, H * .48, Math.min(W, H) * .36, W / 2, H * .48, Math.hypot(W, H) * .58);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, `rgba(6,3,2,${.42 + this.aberrPulse * .28})`);
    x.fillStyle = vig; x.fillRect(0, 0, W, H);

    this.raf = requestAnimationFrame(tt => this.frame(tt));
  }

  drawActor(a, t, dt) {
    const S = a.state, x = this.x, ppm = this.ppm;
    const P = (S.pose && a.poses?.[S.pose]) || a.poses?.idle;
    const img = P?.img || a.img; if (!img) return;
    const hMul = P?.hMul || 1;
    const h = a.height * S.sc * hMul * ppm, w = h * img.width / img.height;
    let bob = 0, sway = 0;
    if (S.fly) {
      bob = Math.sin(t * (S.chariot ? 2.4 : 3.2) + a.seed) * (S.chariot ? .085 : .14);
      sway = Math.cos(t * (S.chariot ? 2.0 : 2.8) + a.seed) * (S.chariot ? .028 : .055);
    } else if (S.gait) {
      bob = Math.abs(Math.sin(S.phase)) * .058;
      sway = Math.sin(S.phase) * .03;
    }
    const [fx, baseFy] = this.toScreen({ x: S.x, y: S.y + bob });
    const fy = baseFy + (S.collapse || 0) * h * .24;
    const alpha = clamp(S.op * (1 - S.dissolve), 0, 1); if (alpha <= .01) return;
    const flipX = (a.dir || 1) * (P?.dir || a.naturalDir || 1);
    const airTilt = !S.fly && S.y > .15 ? a.dir * clamp(S.y * .07, 0, .16) : 0;
    const rot = S.lean * (S.chariot ? .48 : .95) + sway + airTilt + S.tilt * a.dir;

    // 1. Heavenly golden Victory Sunbeam column & pulsing sacred ground halo (100% soft volumetric feathered god-rays, zero hard edges)
    if (S.victorious && alpha > .2) {
      const pulse = .86 + .14 * Math.sin(t * 3.4);
      x.save(); x.globalCompositeOperation = 'lighter';
      const bw = Math.max(w * 1.28, 155 * this.fx.k);
      // Soft feathered horizontal glow column (reaches alpha 0 strictly inside fill rect — zero geometric seams)
      const colGrad = x.createLinearGradient(fx - bw * 1.15, 0, fx + bw * 1.15, 0);
      colGrad.addColorStop(0, 'rgba(255,214,116,0)');
      colGrad.addColorStop(.2, `rgba(255,218,128,${.11 * pulse * alpha})`);
      colGrad.addColorStop(.38, `rgba(255,236,168,${.28 * pulse * alpha})`);
      colGrad.addColorStop(.5, `rgba(255,248,214,${.42 * pulse * alpha})`);
      colGrad.addColorStop(.62, `rgba(255,236,168,${.28 * pulse * alpha})`);
      colGrad.addColorStop(.8, `rgba(255,218,128,${.11 * pulse * alpha})`);
      colGrad.addColorStop(1, 'rgba(255,214,116,0)');
      x.fillStyle = colGrad;
      x.fillRect(fx - bw * 1.2, 0, bw * 2.4, this.floorY + 12);
      // Soft upper-heaven bloom & subtle inner volumetric shafts
      const topBloom = x.createRadialGradient(fx, this.floorY * .18, 0, fx, this.floorY * .26, bw * 1.3);
      topBloom.addColorStop(0, `rgba(255,250,224,${.34 * pulse * alpha})`);
      topBloom.addColorStop(.48, `rgba(255,214,118,${.15 * pulse * alpha})`);
      topBloom.addColorStop(1, 'rgba(255,196,86,0)');
      x.fillStyle = topBloom;
      x.fillRect(fx - bw * 1.35, 0, bw * 2.7, this.floorY + 12);
      for (const [off, rw, ra] of [[-.32, .26, .16], [0, .38, .22], [.3, .24, .14]]) {
        const rx = fx + bw * off, rg = x.createLinearGradient(rx - bw * rw, 0, rx + bw * rw, 0);
        rg.addColorStop(0, 'rgba(255,240,185,0)');
        rg.addColorStop(.5, `rgba(255,246,204,${ra * pulse * alpha})`);
        rg.addColorStop(1, 'rgba(255,240,185,0)');
        x.fillStyle = rg;
        x.fillRect(rx - bw * rw, 0, bw * rw * 2, this.floorY + 8);
      }
      // glowing golden sacred ground halo beneath the victor's feet
      const hr = Math.max(w * .82, 92 * this.fx.k);
      const hg = x.createRadialGradient(fx, this.floorY, 0, fx, this.floorY, hr);
      hg.addColorStop(0, `rgba(255,250,224,${.78 * pulse * alpha})`);
      hg.addColorStop(.45, `rgba(255,204,96,${.42 * pulse * alpha})`);
      hg.addColorStop(1, 'rgba(255,180,60,0)');
      x.save(); x.translate(fx, this.floorY); x.scale(1, .24); x.translate(-fx, -this.floorY);
      x.fillStyle = hg; x.fillRect(fx - hr, this.floorY - hr, hr * 2, hr * 2); x.restore();
      for (const [rr, lw, al] of [[hr * .86, 2.2, .72], [hr * .56, 1.5, .88]]) {
        x.strokeStyle = `rgba(255,232,156,${al * pulse * alpha})`; x.lineWidth = lw;
        x.beginPath(); x.ellipse(fx, this.floorY, rr, rr * .24, 0, 0, TAU); x.stroke();
      }
      x.restore();
      if (Math.random() < dt * 22) {
        this.fx.spark(fx + rnd(-bw * .45, bw * .45), rnd(this.floorY - h * 1.35, this.floorY), rnd(-14, 14) * this.fx.k, rnd(-90, -28) * this.fx.k, rnd(.7, 1.4), rnd(1.4, 3.0) * this.fx.k, 'sun', { a: .8 });
      }
    }

    // 2. kinetic motion-afterimage ghosts when moving rapidly, leaping, swooping, or lunging
    const moveSpeed = Math.hypot(S.x - a.prevX, S.y - a.prevY) / Math.max(.008, dt);
    a.prevX = S.x; a.prevY = S.y; a.ghostCd -= dt;
    if ((moveSpeed > 3.4 || Math.abs(S.lean) > .12 || (!S.fly && S.y > .4)) && a.ghostCd <= 0) {
      a.ghostCd = .045;
      a.ghosts.push({ img, fx, fy, w, h, rot, flipX, fly: S.fly, life: .22, max: .22 });
      if (a.ghosts.length > 5) a.ghosts.shift();
    }
    a.ghosts = a.ghosts.filter(g => (g.life -= dt) > 0);
    for (const g of a.ghosts) {
      x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = (g.life / g.max) * .26 * alpha;
      if (g.fly) { x.translate(g.fx, g.fy - g.h * .5); x.rotate(g.rot); x.scale(g.flipX, 1); x.drawImage(g.img, -g.w / 2, -g.h / 2, g.w, g.h); }
      else { x.translate(g.fx, g.fy); x.rotate(g.rot); x.scale(g.flipX, 1); x.drawImage(g.img, -g.w / 2, -g.h, g.w, g.h); }
      x.restore();
    }
    x.globalCompositeOperation = 'source-over';

    // 3. ground contact shadow (ground fighters only)
    if (!S.fly && !this.isAir) {
      const air = clamp(1 - S.y / 2.5, .22, 1), gy = this.floorY + 2;
      const sg = x.createRadialGradient(fx, gy, 0, fx, gy, w * (.52 + (S.collapse || 0) * .32) * air);
      sg.addColorStop(0, `rgba(6,3,1,${.68 * air * alpha})`); sg.addColorStop(1, 'rgba(6,3,1,0)');
      x.save(); x.translate(fx, gy); x.scale(1, .2); x.translate(-fx, -gy); x.fillStyle = sg; x.fillRect(fx - w * 1.4, gy - w * 1.4, w * 2.8, w * 2.8); x.restore();
    }

    // 4. fiery aerial chariot flame-wake behind Rāvaṇa's golden wheels & roaring war-fire trail
    if (S.fireAura > .02 && alpha > .1) {
      const fa = S.fireAura * (.84 + .16 * Math.sin(t * 11 + a.seed));
      x.save(); x.globalCompositeOperation = 'lighter';
      if (S.chariot) {
        // flames & roaring golden ember wake streaming from the golden chariot wheels & rear axle (matching reference video 00:10–00:17)
        const wheelX = fx - a.dir * w * .20, wheelY = fy - h * .15, tailDir = -a.dir;
        x.globalAlpha = fa * .88 * alpha;
        x.drawImage(this.fx.spr.fire, wheelX - w * .52, wheelY - h * .38, w * 1.12, h * .72);
        x.globalAlpha = fa * .64 * alpha;
        x.drawImage(this.fx.spr.gold, wheelX - w * .34, wheelY - h * .24, w * .72, h * .46);
        // roaring flame plume streaming behind the rear wheel
        const plume = x.createLinearGradient(wheelX - tailDir * w * .12, wheelY, wheelX + tailDir * w * .56, wheelY - h * .08);
        plume.addColorStop(0, `rgba(255,236,154,${.68 * fa * alpha})`);
        plume.addColorStop(.38, `rgba(255,112,26,${.52 * fa * alpha})`);
        plume.addColorStop(1, 'rgba(200,32,4,0)');
        x.globalAlpha = 1; x.fillStyle = plume;
        x.beginPath();
        x.moveTo(wheelX - tailDir * w * .1, wheelY - h * .11);
        x.quadraticCurveTo(wheelX + tailDir * w * .26, wheelY - h * (.14 + .03 * Math.sin(t * 16)), wheelX + tailDir * w * .56, wheelY - h * .05);
        x.quadraticCurveTo(wheelX + tailDir * w * .22, wheelY + h * (.09 + .03 * Math.cos(t * 14)), wheelX - tailDir * w * .1, wheelY + h * .09);
        x.closePath(); x.fill();
        // roaring flame stream behind wheels & hooves
        if (Math.random() < dt * 68 * fa) {
          this.fx.spark(wheelX + rnd(-w * .28, w * .26), wheelY + rnd(-h * .12, h * .08), tailDir * rnd(120, 310) * this.fx.k, rnd(-95, 22) * this.fx.k, rnd(.38, .85), rnd(2.4, 5.6) * this.fx.k, Math.random() < .42 ? 'gold' : 'fire', { streak: 1.7 });
        }
        if (Math.random() < dt * 18 * fa) {
          this.fx.smoke(wheelX + tailDir * rnd(0, w * .24), wheelY + rnd(-h * .08, h * .06), tailDir * rnd(60, 160) * this.fx.k, rnd(-60, 15) * this.fx.k, .85, rnd(20, 36) * this.fx.k, { a: .32 * fa, ash: true });
        }
      } else {
        x.globalAlpha = fa * .8 * alpha;
        x.drawImage(this.fx.spr.fire, fx - w * 1.15, fy - h * 1.08, w * 2.3, h * 1.38);
        x.globalAlpha = fa * .48 * alpha;
        x.drawImage(this.fx.spr.gold, fx - w * .85, fy - h * .82, w * 1.7, h * 1.02);
        if (Math.random() < dt * 36 * fa) {
          this.fx.spark(fx + rnd(-w * .45, w * .45), fy - rnd(0, h * .7), rnd(-50, 50) * this.fx.k, rnd(-220, -80) * this.fx.k, rnd(.35, .78), rnd(2.2, 4.6) * this.fx.k, Math.random() < .42 ? 'gold' : 'fire', { streak: 1.3 });
        }
      }
      x.restore();
    }
    // drifting dark eagle feathers while Jaṭāyu soars in storm sky
    if (S.fly && a.id === 'jatayu' && Math.random() < dt * 3.8) {
      this.fx.featherBurst(fx - a.dir * w * .22, fy - h * .52, 1, 115);
    }

    // 5. divine power aura & surging Shakti-ready sparks
    const glowAmt = Math.max(S.glow, S.shaktiFull ? .4 + .18 * Math.sin(t * 8) : 0);
    if (glowAmt > .02) {
      const k = this.fx.key(a.color || '#ffd36b');
      x.globalCompositeOperation = 'lighter'; x.globalAlpha = glowAmt * .86 * alpha;
      x.drawImage(this.fx.spr[k], fx - w * .92, fy - h * 1.05, w * 1.84, h * 1.24);
      x.globalCompositeOperation = 'source-over';
      if (S.shaktiFull && Math.random() < dt * 24) {
        this.fx.spark(fx + rnd(-w * .34, w * .34), fy - rnd(0, h * .3), rnd(-24, 24) * this.fx.k, rnd(-180, -80) * this.fx.k, .55, rnd(1.5, 3.2) * this.fx.k, k, { streak: 1.2 });
      }
    }

    // 6. warrior / aerial unit sprite (true facing flip + natural wing-beat / center-of-mass aerial pivot!)
    const wingBeat = (S.fly && !S.chariot) ? (1 + Math.sin(t * 5.4 + a.seed) * .04) : (1 + Math.sin(t * 1.8 + a.seed) * .006);
    const sy = S.squash * wingBeat, sx = 1 / Math.sqrt(S.squash);
    x.save(); x.globalAlpha = alpha;
    if (S.fly) {
      x.translate(fx, fy - h * .5); x.rotate(rot); x.scale(sx * flipX, sy);
      x.drawImage(img, -w / 2, -h / 2, w, h);
      if (S.flash > .02) { x.globalCompositeOperation = 'lighter'; x.globalAlpha = S.flash * .85 * alpha; x.drawImage(img, -w / 2, -h / 2, w, h); }
    } else {
      x.translate(fx, fy); x.rotate(rot); x.scale(sx * flipX, sy);
      x.drawImage(img, -w / 2, -h, w, h);
      if (S.flash > .02) { x.globalCompositeOperation = 'lighter'; x.globalAlpha = S.flash * .85 * alpha; x.drawImage(img, -w / 2, -h, w, h); }
    }
    x.restore();

    // 7. blazing Chandrahāsa sword flame on Rāvaṇa's aerial chariot + glowing forged weapon edge on melee attacks
    if (S.chariot && alpha > .2) {
      // live blazing orange-white sword flames wrapping Rāvaṇa's raised golden sword blade (upper-front of chariot)
      const swX = fx + a.dir * w * .045, swY = fy - h * .77, pulse = .85 + .15 * Math.sin(t * 15);
      x.save(); x.globalCompositeOperation = 'lighter';
      x.globalAlpha = .78 * pulse * alpha;
      x.drawImage(this.fx.spr.fire, swX - w * .15, swY - h * .24, w * .3, h * .46);
      x.globalAlpha = .68 * pulse * alpha;
      x.drawImage(this.fx.spr.gold, swX - w * .09, swY - h * .18, w * .18, h * .34);
      x.restore();
      if (Math.random() < dt * 30) {
        this.fx.spark(swX + rnd(-w * .03, w * .04), swY + rnd(-h * .16, h * .12), -a.dir * rnd(20, 80) * this.fx.k, rnd(-120, -35) * this.fx.k, rnd(.24, .52), rnd(1.8, 3.8) * this.fx.k, Math.random() < .45 ? 'white' : 'fire', { streak: 1.3 });
      }
    } else {
      const wGlow = S.weaponGlow || 0;
      if (wGlow > .04 && alpha > .2) {
        const col = S.weaponCol || a.color || '#ffd36b', rgb = rgbOf(col), wk = this.fx.key(col);
        const wx = fx + a.dir * w * .36, wy = fy - h * .56;
        x.save(); x.globalCompositeOperation = 'lighter';
        x.globalAlpha = wGlow * .72 * alpha;
        x.drawImage(this.fx.spr[wk], wx - w * .42, wy - h * .28, w * .84, h * .56);
        x.strokeStyle = `rgba(255,250,232,${wGlow * .82 * alpha})`; x.lineWidth = 2.2 * this.fx.k; x.lineCap = 'round';
        x.beginPath(); x.moveTo(wx - a.dir * w * .08, wy + h * .16); x.quadraticCurveTo(wx + a.dir * w * .2, wy, wx + a.dir * w * .04, wy - h * .22); x.stroke();
        x.strokeStyle = `rgba(${rgb},${wGlow * .65 * alpha})`; x.lineWidth = 7 * this.fx.k; x.stroke();
        x.restore();
      }
    }

    // 8. blazing pure-light drawn bow arrow & sacred Astra bow halo (aligned directly onto Lakṣmaṇa's drawn bow!)
    if ((S.aimArrow > .02 || S.astraHalo > .02) && alpha > .2) {
      const aa = Math.max(S.aimArrow || 0, S.astraHalo || 0);
      const col = S.weaponCol || a.color || '#ffd36b', rgb = rgbOf(col), wk = this.fx.key(col);
      const hasDraw = S.pose === 'draw' && !!a.poses?.draw;
      const by = fy - h * (hasDraw ? .665 : .62);
      const bx = fx + a.dir * w * (hasDraw ? .34 : .38);
      const tailX = hasDraw ? (fx - a.dir * w * .12) : (bx - a.dir * Math.max(w * .44, 46 * this.fx.k));
      const tipX = hasDraw ? (fx + a.dir * w * .50) : (bx + a.dir * Math.max(w * 1.12, 114 * this.fx.k));
      x.save(); x.globalCompositeOperation = 'lighter';
      // radiant bow-curve shimmer
      if (!hasDraw) {
        x.strokeStyle = `rgba(${rgb},${.62 * aa * alpha})`; x.lineWidth = 5 * this.fx.k; x.lineCap = 'round';
        x.beginPath(); x.moveTo(bx - a.dir * w * .06, by - h * .26); x.quadraticCurveTo(bx + a.dir * w * .24, by, bx - a.dir * w * .06, by + h * .26); x.stroke();
        x.strokeStyle = `rgba(255,252,235,${.92 * aa * alpha})`; x.lineWidth = 1.6 * this.fx.k; x.stroke();
      } else {
        x.globalAlpha = aa * .65 * alpha;
        x.drawImage(this.fx.spr[wk], bx - w * .32, by - h * .34, w * .64, h * .68);
        x.globalAlpha = 1;
      }
      // incandescent pure-light arrow shaft & glowing arrowhead
      for (const [lw, al, cStr] of [[12, .22, rgb], [4.8, .72, rgb], [2.0, 1, '255,252,240']]) {
        x.strokeStyle = `rgba(${cStr},${al * aa * alpha})`; x.lineWidth = lw * this.fx.k;
        x.beginPath(); x.moveTo(tailX, by); x.lineTo(tipX, by); x.stroke();
      }
      // blinding radiant arrowhead star flare
      x.fillStyle = `rgba(255,252,238,${aa * alpha})`;
      x.beginPath(); x.moveTo(tipX + a.dir * 16 * this.fx.k, by); x.lineTo(tipX - a.dir * 7 * this.fx.k, by - 7.5 * this.fx.k); x.lineTo(tipX - a.dir * 3 * this.fx.k, by); x.lineTo(tipX - a.dir * 7 * this.fx.k, by + 7.5 * this.fx.k); x.closePath(); x.fill();
      x.globalAlpha = aa * .96 * alpha;
      x.drawImage(this.fx.spr[wk], tipX - 46 * this.fx.k, by - 46 * this.fx.k, 92 * this.fx.k, 92 * this.fx.k);
      x.drawImage(this.fx.spr.white, tipX - 20 * this.fx.k, by - 20 * this.fx.k, 40 * this.fx.k, 40 * this.fx.k);
      // rotating golden sacred bow-halo during Astra activation
      if (S.astraHalo > .02) {
        const hr = Math.max(h * .28, 72 * this.fx.k) * (.85 + .15 * Math.sin(t * 9));
        x.save(); x.translate(bx + a.dir * w * .04, by); x.rotate(t * 1.9 * a.dir);
        x.strokeStyle = `rgba(${rgb},${.82 * S.astraHalo * alpha})`; x.lineWidth = 3.2 * this.fx.k;
        x.beginPath(); x.arc(0, 0, hr, 0, TAU); x.stroke();
        x.strokeStyle = `rgba(255,250,232,${.95 * S.astraHalo * alpha})`; x.lineWidth = 1.2 * this.fx.k;
        x.beginPath(); x.arc(0, 0, hr * .82, 0, TAU); x.stroke();
        for (let i = 0; i < 12; i++) {
          const an = i / 12 * TAU;
          x.beginPath(); x.moveTo(Math.cos(an) * hr * .82, Math.sin(an) * hr * .82); x.lineTo(Math.cos(an) * hr * 1.15, Math.sin(an) * hr * 1.15); x.stroke();
        }
        x.restore();
      }
      x.restore();
    }

    // 9. Dharma Kavacha guard shield arc when blocking
    if (S.guard && alpha > .5) {
      const rgb = rgbOf(a.color || '#9fd7ff');
      const sx2 = fx + a.dir * w * .4, sy2 = fy - h * .52, sr = h * .44;
      const a0 = a.dir > 0 ? -1.1 : Math.PI - 1.1, a1 = a.dir > 0 ? 1.1 : Math.PI + 1.1;
      x.save(); x.globalCompositeOperation = 'lighter';
      for (const [lw, al, col] of [[14, .14, rgb], [5, .48, rgb], [1.8, .92, '255,250,235']]) {
        x.strokeStyle = `rgba(${col},${al * (.85 + .15 * Math.sin(t * 14))})`; x.lineWidth = lw; x.lineCap = 'round';
        x.beginPath(); x.arc(sx2 - a.dir * sr * .45, sy2, sr, a0, a1); x.stroke();
      }
      x.restore();
    }
    x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
  }
}
