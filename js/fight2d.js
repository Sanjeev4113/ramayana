// The field of the Dharma Yuddha, painted (2026-11-22): the battlefield of the reference film (~/Downloads/astra.mp4,
// assets/backgrounds/field.webp) or the story's own setting as a full painting, and on it the warriors as their own art,
// lit to match the painting, breathing, lunging, leaping and falling, with the light of every blow and astra drawn over
// them (js/astra-fx.js). It keeps the small interface the game was written against (actors with a `state`, `vfx`,
// `shake`, `flash`, a camera), so js/stage3d/fight.js plays on it unchanged in spirit — and it is far lighter than the
// 3D stage, so the game runs smoothly on a phone or a tablet.
import { AstraFX } from './astra-fx.js';
import { dpr } from './calm.js';

const gsap = window.gsap;
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
// the light of a time of day laid over a painting made at another time
const GRADE = { dusk: ['255,186,140', .0], night: ['92,112,176', .1], war: ['255,170,130', .05], dawn: ['255,214,200', 0], day: null, gold: null };
const FLOOR = { field: .86 };

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

// a warrior's art lit by the painting: multiplied by the painting's light, with a warm rim on the side the light comes
// from, so the figure stands in the scene instead of on it
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
    rim.addColorStop(0, `rgba(${key.map(k => Math.round(255 * k))},.34)`); rim.addColorStop(.35, 'rgba(0,0,0,0)');
    x.globalCompositeOperation = 'lighter'; x.fillStyle = rim; x.fillRect(0, 0, c.width, c.height);
    x.globalCompositeOperation = 'destination-in'; x.drawImage(img, 0, 0);        // keep the figure's own outline
    return c;
  })());
  return arts.get(id);
}

// a warrior of the armies far behind the duel: the figure's shape lit only at its rim, sunk into the painting's haze, so
// it reads as one of a host and never as a named hero
async function shade(src, meta) {
  const id = 'shade|' + src + '|' + (meta?.src || '');
  if (!arts.has(id)) arts.set(id, (async () => {
    const img = await loadImg(src); if (!img) return null;
    const c = document.createElement('canvas'), k = 260 / img.naturalHeight; c.width = Math.round(img.naturalWidth * k); c.height = 260; const x = c.getContext('2d');
    x.drawImage(img, 0, 0, c.width, c.height);
    const haze = (meta?.haze || [.45, .38, .3]).map(v => Math.round(255 * v * .55));
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = `rgb(${haze})`; x.globalAlpha = .82; x.fillRect(0, 0, c.width, c.height);
    const rim = x.createLinearGradient(0, 0, c.width, 0); rim.addColorStop(0, 'rgba(255,190,110,.35)'); rim.addColorStop(.3, 'rgba(0,0,0,0)');
    x.globalAlpha = 1; x.fillStyle = rim; x.fillRect(0, 0, c.width, c.height);
    return c;
  })());
  return arts.get(id);
}

class Actor {
  constructor(stage, id, src, x, sc) {
    this.stage = stage; this.id = id; this.height = 1.9; this.dir = 1; this.seed = Math.random() * 9;
    this.state = { x, y: 0, sc, lean: 0, squash: 1, glow: 0, flash: 0, tilt: 0, dissolve: 0, gait: 0, phase: 0, op: 0 };
    this.ready = lit(src, stage.meta).then(c => { this.img = c; if (c) this.height = 1.9; gsap.to(this.state, { op: 1, duration: .5 }); });
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
    this.actors = new Map(); this.solids = []; this.motes = []; this.ranks = []; this.warOn = false;
    this.resize = () => { this.d = dpr(1.5); this.c.width = Math.round(this.c.clientWidth * this.d); this.c.height = Math.round(this.c.clientHeight * this.d); };
    addEventListener('resize', this.resize); this.resize();
    const fx = this.fx, self = this;
    // the effects the game asks for, drawn in light
    this.vfx = {
      ambient: { petals: 0 },
      removeEmitter() { }, fire() { },
      slash(p, dir, color, size = 1) {
        const [cx, cy] = self.toScreen(p), r = size * .95 * self.ppm, rgb = rgbOf(color), a0 = dir > 0 ? -1.15 : Math.PI + 1.15, sweep = dir > 0 ? 2.3 : -2.3;
        fx.add(a => { const p2 = clamp(a / .14, 0, 1), fade = 1 - clamp((a - .1) / .22, 0, 1), pts = [];
          for (let i = 0; i <= 18; i++) { const u = i / 18 * p2, an = a0 + sweep * u; pts.push([cx + Math.cos(an) * r, cy + Math.sin(an) * r * .8, (1 + 7 * Math.sin(Math.PI * i / 18)) * fx.k * size]); }
          fx.ribbon(pts, rgb, fade * .85); }, .34);
      },
      burst(p, color, n = 40, speed = 4, o = {}) { const [x, y] = self.toScreen(p); fx.burst(x, y, Math.round(n * .8), speed * 70, fx.key(color), { g: o.gravity ? o.gravity * -90 * fx.k : 140 * fx.k, life: .9 }); },
      flare(p, color, size = 2, dur = .4) { const [x, y] = self.toScreen(p), k = fx.key(color); fx.add(a => { const e = 1 - a / dur; fx.glow(x, y, size * 34 * fx.k * (1 + (1 - e) * .6), k, e); fx.glow(x, y, size * 12 * fx.k, 'white', e); }, dur); },
      charge(p, color, dur = .6) {
        const [x, y] = self.toScreen(p), k = fx.key(color);
        fx.add((a, dt) => { const e = a / dur; fx.glow(x, y, (10 + 46 * e) * fx.k, k, e);
          if (Math.random() < dt * 90) { const an = rnd(0, 6.283), r = rnd(60, 120) * fx.k; fx.spark(x + Math.cos(an) * r, y + Math.sin(an) * r, -Math.cos(an) * r * 3, -Math.sin(an) * r * 3, .3, rnd(1.5, 3) * fx.k, k, { drag: 1 }); } }, dur);
      },
      shockwave(p, color, size = 5, dur = .8) { const rgb = rgbOf(color); fx.add(a => { const q = a / dur, [x] = self.toScreen(p); fx.ring(x, self.floorY, size * self.ppm * .5 * (.15 + .85 * (1 - (1 - q) ** 3)), rgb, 1 - q, 0, .22); }, dur); },
      pillar(p, color, h = 20, dur = 1.2) {
        const k = fx.key(color), rgb = rgbOf(color);
        fx.add(a => { const [x] = self.toScreen(p), y = self.floorY, e = Math.sin(Math.PI * Math.min(1, a / dur)); const w = 34 * fx.k * e, top = -40;
          fx.ribbon([[x, y, w * .3], [x, (y + top) / 2, w], [x, top, w * .6]], rgb, e * .8); fx.glow(x, y, 90 * fx.k * e, k, e); }, dur);
      },
      rune(p, color, size = 3, dur = 2) { const rgb = rgbOf(color); fx.add(a => { const [x] = self.toScreen(p), y = self.floorY, e = Math.min(1, a / .3) * (1 - Math.max(0, (a - dur + .5) / .5)); fx.ring(x, y, size * self.ppm * .32, rgb, e, 12, .26, a * .9); fx.ring(x, y, size * self.ppm * .2, rgb, e * .7, 0, .26); }, dur); },
      dust(p, n = 20, color = '#8a7258', size = 1.5) {
        const [x] = self.toScreen(p), y = self.floorY;
        for (let i = 0; i < n * .6; i++) self.solids.push({ kind: 'dust', x: x + rnd(-30, 30) * fx.k * size, y: y - rnd(0, 8) * fx.k, vx: rnd(-70, 70) * fx.k * size, vy: rnd(-60, -10) * fx.k, r: rnd(14, 30) * fx.k * size, life: rnd(.7, 1.3), max: 1.3, c: color });
        self.wake();
      },
      projectile({ from, to, kind = 'arrow', color = '#ffe08a', dur, onHit }) {
        const T = dur || (kind === 'rock' ? .7 : .38), rgb = rgbOf(color), k = fx.key(color), trail = [];
        if (kind === 'rock') {
          const s = { kind: 'rock', x: 0, y: 0, r: 16 * fx.k, life: T, max: T, t: 0 };
          self.solids.push(s); self.wake();
          s.step = dt => { s.t += dt; const u = Math.min(1, s.t / T), [ax, ay] = self.toScreen(from), [bx, by] = self.toScreen(to);
            s.x = ax + (bx - ax) * u; s.y = ay + (by - ay) * u - Math.sin(u * Math.PI) * 90 * fx.k;
            if (u >= 1 && !s.hit) { s.hit = true; s.life = 0; onHit?.(to.clone()); } };
          return;
        }
        fx.add(a => {
          const u = Math.min(1, a / T), [ax, ay] = self.toScreen(from), [bx, by] = self.toScreen(to);
          const hx = ax + (bx - ax) * u, hy = ay + (by - ay) * u - Math.sin(u * Math.PI) * (kind === 'arrow' ? 22 : 50) * fx.k;
          trail.push([hx, hy]); if (trail.length > (kind === 'arrow' ? 7 : 12)) trail.shift();
          if (u < 1) { fx.ribbon(trail.map(([x, y], i) => [x, y, (kind === 'arrow' ? .6 + i * .35 : 1 + i * .6) * fx.k]), rgb, 1); fx.glow(hx, hy, (kind === 'arrow' ? 12 : 26) * fx.k, k, 1); }
          else if (!trail.hit) { trail.hit = true; onHit?.(to.clone()); }
        }, T + .02);
      }
    };
  }
  get W() { return this.c.clientWidth || innerWidth; } get H() { return this.c.clientHeight || innerHeight; }
  get ppm() { return this.H * this.cam.zoom / M; }
  // on a screen held upright the warriors stand higher, above the touch buttons
  get floorY() { return this.H * (this.W < this.H ? .66 : (FLOOR[this.key] || .9)); }
  toScreen(v) { return [this.W / 2 + (v.x - this.cam.x) * this.ppm, this.floorY - v.y * this.ppm]; }
  shake(a) { this.fx.shake = Math.max(this.fx.shake, a * .9); this.fx.wake(); }
  flash(color, a) { this.fx.hit(a * .45, rgbOf(color), 0); }
  aberr(a) { this.fx.hit(a * .12, '255,255,255', 0); }

  /** "arena/time | id@pct id@pct*scale | fx |" */
  async play({ script }) {
    const [bgPart = 'field', castPart = ''] = script.split('|').map(s => s.trim());
    const [key, time] = bgPart.split('/');
    if (`${key}/${time || ''}` !== this.envKey) {
      this.envKey = `${key}/${time || ''}`;
      const p = await plate(key, time);
      this.key = key; this.plate = p?.img || null; this.meta = p?.meta || null; this.time = time || 'gold';
      this.motes = [];
    }
    const want = castPart.split(/\s+/).filter(Boolean).map(t => { const [id, rest = '50'] = t.split('@'); const [pct, sc] = rest.split('*'); return { id, x: (+pct / 100 - .5) * 10, sc: +(sc || 1) }; });
    for (const [k, a] of this.actors) if (!want.some(w => w.id === k)) { a.dispose(); this.actors.delete(k); }
    const art = this.art || {};
    for (const w of want) {
      const src = art[w.id]?.views?.front?.src || art[this.proxy?.[w.id]]?.views?.front?.src;
      if (!src) continue;
      this.actors.set(w.id, new Actor(this, w.id, src, w.x, w.sc));
    }
    await Promise.all([...this.actors.values()].map(a => a.ready));
    this.start();
  }
  /** two armies at war behind the duel: ids of the art whose shapes make the hosts of each side */
  async war(sides) {
    this.ranks = []; this.warOn = !!sides; if (!sides) return;
    const art = this.art || {}, src = id => art[id]?.views?.front?.src;
    const make = async (ids, side) => {
      const imgs = (await Promise.all(ids.filter(src).map(id => shade(src(id), this.meta)))).filter(Boolean);
      for (let i = 0; i < 26; i++) {
        const depth = .25 + Math.random() * .75, x = side * (.4 + Math.random() * 7.2);
        this.ranks.push({ img: imgs[i % imgs.length], side, x, depth, flip: Math.random() < .5, sc: .9 + Math.random() * .25, ph: Math.random() * 9, rate: 1.4 + Math.random() * 2, lunge: 0 });
      }
    };
    await Promise.all([make(sides[0], -1), make(sides[1], 1)]);
    this.ranks.sort((a, b) => b.depth - a.depth);
  }
  drawRanks(t, dt) {
    const x = this.x, W = this.W, H = this.H, ppm = this.ppm, fx = this.fx;
    for (const r of this.ranks) {
      if (!r.img) continue;
      if (Math.random() < dt * .25) gsap.to(r, { lunge: 1, duration: .25, yoyo: true, repeat: 1, ease: 'power2.out' });
      const scale = 1 - r.depth * .55, sx = W / 2 + (r.x - this.cam.x * .6 - r.side * r.lunge * .5) * ppm * scale, sy = this.floorY - r.depth * H * .13;
      const h = 1.9 * r.sc * ppm * scale * .92, w = h * r.img.width / r.img.height;
      x.save(); x.globalAlpha = .82 + (1 - r.depth) * .18; x.translate(sx, sy); x.rotate(Math.sin(t * r.rate + r.ph) * .07 + r.side * -r.lunge * .12);
      if (r.flip !== (r.side > 0)) x.scale(-1, 1);
      x.drawImage(r.img, -w / 2, -h, w, h); x.restore();
    }
    // the battle between them: arrows across the field, the flash of blades where the lines meet
    if (Math.random() < dt * 5) {
      const a = this.ranks[(Math.random() * this.ranks.length) | 0], b = this.ranks.find(q => q.side !== a.side && Math.random() < .2) || this.ranks.find(q => q.side !== a.side);
      if (a && b) {
        const pos = r => [W / 2 + (r.x - this.cam.x * .6) * ppm * (1 - r.depth * .55), this.floorY - r.depth * H * .13 - 1.2 * ppm * (1 - r.depth * .55)];
        const [ax, ay] = pos(a), [bx, by] = pos(b), trail = [];
        fx.add(u => { const q = Math.min(1, u / .5), hx = ax + (bx - ax) * q, hy = ay + (by - ay) * q - Math.sin(q * Math.PI) * 40 * fx.k;
          trail.push([hx, hy]); if (trail.length > 6) trail.shift();
          fx.ribbon(trail.map(([px, py], i) => [px, py, (.4 + i * .2) * fx.k]), a.side < 0 ? '255,214,140' : '255,150,90', .55 * (1 - q * .3)); }, .52);
      }
    }
    if (Math.random() < dt * 3) { const zx = W / 2 + (rnd(-1.5, 1.5) - this.cam.x * .6) * ppm * .7, zy = this.floorY - rnd(.3, .9) * H * .13 - ppm * .7; fx.burst(zx, zy, 14, 160, 'gold', { life: .5, size: .6 }); }
  }
  start() { this.running = true; this.wake(); }
  stop() { this.running = false; this.fx.clear(); }
  wake() { if (!this.raf && this.running) { this.last = performance.now(); this.raf = requestAnimationFrame(t => this.frame(t)); } }
  frame(now) {
    this.raf = 0; if (!this.running || document.hidden) return;
    const dt = Math.min(.05, (now - this.last) / 1000); this.last = now; const t = now / 1000;
    const x = this.x, d = this.d, W = this.W, H = this.H;
    if (this.c.width !== Math.round(W * d)) this.resize();
    x.setTransform(d, 0, 0, d, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
    // the painting: covering the screen, drawn a little larger and moving gently against the camera (parallax)
    if (this.plate) {
      const iw = this.plate.width, ih = this.plate.height, s = Math.max(W / iw, H / ih) * (1.08 + (this.cam.zoom - .85) * .06);
      const ox = clamp(-this.cam.x * this.ppm * .1, -(iw * s - W) / 2, (iw * s - W) / 2), oy = (H - ih * s) / 2 + (this.cam.zoom - .85) * H * .03;
      x.drawImage(this.plate, (W - iw * s) / 2 + ox, oy, iw * s, ih * s);
    } else { x.fillStyle = '#1a0f07'; x.fillRect(0, 0, W, H); }
    // embers drifting up across the field
    if (this.motes.length < 26) this.motes.push({ x: rnd(0, W), y: H + 10, vy: rnd(-40, -16), vx: rnd(-8, 8), s: rnd(1, 2.6), a: rnd(.3, .8) });
    x.globalCompositeOperation = 'lighter';
    for (const m of this.motes) { m.x += m.vx * dt; m.y += m.vy * dt; const g = x.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.s * 3); g.addColorStop(0, `rgba(255,190,110,${m.a})`); g.addColorStop(1, 'rgba(255,120,40,0)'); x.fillStyle = g; x.fillRect(m.x - m.s * 3, m.y - m.s * 3, m.s * 6, m.s * 6); }
    this.motes = this.motes.filter(m => m.y > -10);
    x.globalCompositeOperation = 'source-over';
    if (this.ranks.length) this.drawRanks(t, dt);
    // the warriors
    const list = [...this.actors.values()].filter(a => a.img).sort((a, b) => a.state.y - b.state.y);
    for (const a of list) this.drawActor(a, t, dt);
    // dust and stones (painted, not light)
    this.solids = this.solids.filter(s => { if (s.step) s.step(dt); s.life -= dt; return s.life > 0; });
    for (const s of this.solids) {
      if (s.kind === 'dust') { s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= .97; s.r *= 1 + dt * .9; const al = Math.min(1, s.life / s.max * 1.5) * .32;
        const g = x.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r); g.addColorStop(0, `rgba(${rgbOf(s.c)},${al})`); g.addColorStop(1, `rgba(${rgbOf(s.c)},0)`); x.fillStyle = g; x.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2); }
      else if (s.kind === 'rock') { const g = x.createRadialGradient(s.x - s.r * .35, s.y - s.r * .35, s.r * .1, s.x, s.y, s.r); g.addColorStop(0, '#a8916e'); g.addColorStop(1, '#3d2f22'); x.fillStyle = g; x.beginPath(); x.ellipse(s.x, s.y, s.r, s.r * .86, t * 6, 0, 6.283); x.fill(); }
    }
    // the petals of victory
    if (this.vfx.ambient.petals > 0) {
      this.vfx.ambient.petals = Math.max(0, this.vfx.ambient.petals - dt * .12);
      if (Math.random() < dt * 30 * this.vfx.ambient.petals) this.solids.push({ kind: 'petal', x: rnd(0, W), y: -10, vx: rnd(-20, 20), vy: rnd(40, 80), life: 6, max: 6, rot: rnd(0, 6), c: Math.random() < .5 ? '#ffb347' : '#ff6f61' });
    }
    for (const s of this.solids) if (s.kind === 'petal') { s.x += (s.vx + Math.sin(t * 2 + s.rot) * 20) * dt; s.y += s.vy * dt; s.rot += dt * 2; x.save(); x.translate(s.x, s.y); x.rotate(s.rot); x.fillStyle = s.c; x.beginPath(); x.ellipse(0, 0, 5, 2.4, 0, 0, 6.283); x.fill(); x.restore(); }
    // depth: the field's foreground darkens toward the bottom, its far edges into shadow
    const v = x.createLinearGradient(0, H * .7, 0, H); v.addColorStop(0, 'rgba(10,6,3,0)'); v.addColorStop(1, 'rgba(10,6,3,.5)'); x.fillStyle = v; x.fillRect(0, H * .7, W, H * .3);
    this.raf = requestAnimationFrame(tt => this.frame(tt));
  }
  drawActor(a, t, dt) {
    const S = a.state, x = this.x, ppm = this.ppm, img = a.img;
    const h = a.height * S.sc * ppm, w = h * img.width / img.height;
    let bob = 0, sway = 0;
    if (S.gait) { bob = Math.abs(Math.sin(S.phase)) * .05; sway = Math.sin(S.phase) * .025; }
    const [fx, fy] = this.toScreen({ x: S.x, y: S.y + bob });
    const alpha = clamp(S.op * (1 - S.dissolve), 0, 1); if (alpha <= .01) return;
    // the shadow on the ground (smaller and fainter in the air)
    const air = clamp(1 - S.y / 2.5, .25, 1), gy = this.floorY + 2;
    const sg = x.createRadialGradient(fx, gy, 0, fx, gy, w * .62 * air);
    sg.addColorStop(0, `rgba(8,4,2,${.55 * air * alpha})`); sg.addColorStop(1, 'rgba(8,4,2,0)');
    x.save(); x.translate(fx, gy); x.scale(1, .2); x.translate(-fx, -gy); x.fillStyle = sg; x.fillRect(fx - w, gy - w, w * 2, w * 2); x.restore();
    // the aura of a warrior gathering divine power
    if (S.glow > .02) { const k = this.fx.key(a.color || '#ffd36b'); x.globalCompositeOperation = 'lighter'; x.globalAlpha = S.glow * .9 * alpha; x.drawImage(this.fx.spr[k], fx - w * 1.1, fy - h * 1.05, w * 2.2, h * 1.2); x.globalCompositeOperation = 'source-over'; }
    const breath = 1 + Math.sin(t * 1.8 + a.seed) * .006;
    const sy = S.squash * breath, sx = 1 / Math.sqrt(S.squash);
    x.save(); x.globalAlpha = alpha; x.translate(fx, fy); x.rotate(S.lean * .9 + sway + S.tilt * a.dir); x.scale(sx, sy);
    x.drawImage(img, -w / 2, -h, w, h);
    if (S.flash > .02) { x.globalCompositeOperation = 'lighter'; x.globalAlpha = S.flash * .75 * alpha; x.drawImage(img, -w / 2, -h, w, h); }
    x.restore(); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
  }
}
