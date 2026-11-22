// The divine astras, drawn as light: a cinematic effects layer (a 2D canvas over a painting or over the 3D battle),
// modelled on the reference film (~/Downloads/astra.mp4):
//   Brahmāstra  — the bow gathers light, an arrow of light, and a sun bursts: golden rays, rings, a falling of sparks;
//   Āgneyāstra  — a tornado of fire at the archer unwinds into a braided river of flame that bursts on the foe;
//   Aindrāstra  — the sky darkens, Indra's lightning forks down and runs along the ground, a crackling orb of plasma;
//   Nāga-pāśa   — glowing serpents fly out and coil around their targets, until Garuḍa's golden light frees them.
// Everything is additive light (a white-hot core inside a coloured glow). The layer draws only while an astra is in
// the air: between astras it requests no frames at all. Positions are CSS pixels on the canvas.
import { dpr } from './calm.js';

const TAU = Math.PI * 2;
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp01 = v => Math.max(0, Math.min(1, v));
const smooth = t => t * t * (3 - 2 * t);
const out3 = t => 1 - (1 - t) ** 3;
const PAL = { gold: '255,196,92', sun: '255,226,150', fire: '255,104,28', ember: '255,150,46', blue: '110,165,255', ice: '190,225,255',
  violet: '214,120,255', green: '40,255,150', jade: '120,255,190', white: '255,246,226' };

function glowSprite(rgb, core = '255,252,240') {
  const s = document.createElement('canvas'); s.width = s.height = 128; const g = s.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${core},1)`); gr.addColorStop(.16, `rgba(${rgb},.95)`); gr.addColorStop(.42, `rgba(${rgb},.32)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return s;
}

// the sun of the Brahmāstra, drawn once: long golden rays from a white-hot heart
function sunburst(n = 40) {
  const s = document.createElement('canvas'); s.width = s.height = 1024; const g = s.getContext('2d'), c = 512;
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const an = i / n * TAU + Math.sin(i * 7.3) * .09, l = c * (.55 + .45 * Math.abs(Math.sin(i * 3.7 + 1))), w = c * .035 * (.5 + .9 * Math.abs(Math.cos(i * 5.1)));
    const gr = g.createLinearGradient(c, c, c + Math.cos(an) * l, c + Math.sin(an) * l);
    gr.addColorStop(0, 'rgba(255,250,235,.95)'); gr.addColorStop(.18, 'rgba(255,214,120,.75)'); gr.addColorStop(.55, 'rgba(255,170,60,.28)'); gr.addColorStop(1, 'rgba(255,150,40,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(c, c);
    g.lineTo(c + Math.cos(an) * l + Math.cos(an + Math.PI / 2) * w, c + Math.sin(an) * l + Math.sin(an + Math.PI / 2) * w);
    g.lineTo(c + Math.cos(an) * l - Math.cos(an + Math.PI / 2) * w, c + Math.sin(an) * l - Math.sin(an + Math.PI / 2) * w); g.closePath(); g.fill();
  }
  const core = g.createRadialGradient(c, c, 0, c, c, c * .35); core.addColorStop(0, 'rgba(255,252,240,1)'); core.addColorStop(.3, 'rgba(255,224,150,.8)'); core.addColorStop(1, 'rgba(255,190,90,0)');
  g.fillStyle = core; g.fillRect(0, 0, 1024, 1024); return s;
}

export class AstraFX {
  /** canvas: the layer; onShake(px, s): the host shakes its scene; onFlash: optional */
  constructor(canvas, { max = 1.5, onShake } = {}) {
    this.c = canvas; this.x = canvas.getContext('2d'); this.max = max; this.onShake = onShake;
    this.spr = Object.fromEntries(Object.keys(PAL).map(k => [k, glowSprite(PAL[k])])); this.sun = sunburst();
    this.parts = []; this.items = []; this.raf = 0; this.flash = { a: 0, c: PAL.white }; this.tint = { a: 0, c: '6,14,40' }; this.shake = 0;
    this.resize = () => { this.d = dpr(this.max); canvas.width = Math.max(1, Math.round(canvas.clientWidth * this.d)); canvas.height = Math.max(1, Math.round(canvas.clientHeight * this.d)); };
    this.resize(); addEventListener('resize', this.resize);
  }
  get W() { return this.c.clientWidth; } get H() { return this.c.clientHeight; }
  /** a glow sprite for any colour ('#ffd36b'), made once */
  key(hex) {
    if (this.spr[hex]) return hex;
    const h = hex.replace('#', ''), n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16);
    this.spr[hex] = glowSprite(`${n >> 16 & 255},${n >> 8 & 255},${n & 255}`); return hex;
  }
  get k() { return this.H / 720; }                           // sizes are designed for a 720 px tall scene
  /* ── the frame loop: runs only while something is alive ── */
  wake() { if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(t => this.frame(t)); } }
  frame(now) {
    const dt = Math.min(.05, (now - this.last) / 1000); this.last = now; this.t = now / 1000;
    const x = this.x, d = this.d; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, this.c.width, this.c.height);
    if (this.tint.a > .002) { x.globalCompositeOperation = 'source-over'; x.fillStyle = `rgba(${this.tint.c},${this.tint.a})`; x.fillRect(0, 0, this.c.width, this.c.height); }
    x.globalCompositeOperation = 'lighter'; x.setTransform(d, 0, 0, d, 0, 0);
    // (an effect may start others as it plays — a burst on impact — and those must not be lost with this frame's list)
    const cur = this.items; this.items = [];
    const kept = cur.filter(it => { it.age += dt; return it.step(it.age, dt, it) !== false && it.age < it.life; });
    this.items = kept.concat(this.items);
    this.parts = this.parts.filter(p => (p.life -= dt) > 0);
    for (const p of this.parts) {
      p.vx *= p.drag; p.vy = p.vy * p.drag + p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      const f = p.life / p.max, a = Math.min(1, f * 1.8, (p.max - p.life) * 8) * p.a, s = p.s * (p.grow ? 1 + (1 - f) * p.grow : .35 + .65 * f);
      x.globalAlpha = a; x.drawImage(this.spr[p.c], p.x - s, p.y - s, s * 2, s * 2);
    }
    x.globalAlpha = 1;
    if (this.flash.a > .002) { x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = `rgba(${this.flash.c},${this.flash.a})`; x.fillRect(0, 0, this.c.width, this.c.height); this.flash.a *= Math.pow(.02, dt); }
    this.tint.a += ((this.tint.want || 0) - this.tint.a) * (1 - Math.pow(.05, dt));
    if (this.shake > .01) { this.onShake?.(rnd(-1, 1) * this.shake * 14 * this.k, rnd(-1, 1) * this.shake * 9 * this.k); this.shake *= Math.pow(.004, dt); if (this.shake <= .01) this.onShake?.(0, 0); }
    const alive = this.items.length || this.parts.length || this.flash.a > .002 || Math.abs(this.tint.a - (this.tint.want || 0)) > .002 || this.shake > .01;
    this.raf = alive ? requestAnimationFrame(t => this.frame(t)) : 0;
    if (!alive) { x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, this.c.width, this.c.height); }
  }
  add(step, life) { this.items.push({ step, life, age: 0 }); this.wake(); }
  at(sec, fn) { this.add((a, dt, it) => { if (!it.fired && a >= sec) { it.fired = true; fn(); } }, sec + .01); }
  spark(x, y, vx, vy, life, s, c = 'gold', o = {}) { this.parts.push({ x, y, vx, vy, life, max: life, s, c, drag: o.drag ?? .965, g: o.g ?? 0, a: o.a ?? 1, grow: o.grow || 0 }); }
  burst(x, y, n, speed, c, o = {}) {
    for (let i = 0; i < n; i++) { const a = rnd(0, TAU), v = speed * this.k * Math.pow(Math.random(), o.pow ?? .55);
      this.spark(x, y, Math.cos(a) * v, Math.sin(a) * v * (o.flat ?? 1) - (o.up || 0) * this.k, rnd(.5, 1.4) * (o.life || 1), rnd(1.5, 4.5) * this.k * (o.size || 1), Array.isArray(c) ? c[i % c.length] : c, o); }
    this.wake();
  }
  hit(flash = .6, c = PAL.white, shake = 1) { this.flash.a = Math.max(this.flash.a, flash); this.flash.c = c; this.shake = Math.max(this.shake, shake); this.wake(); }

  /* ── primitives ── */
  // a tapered ribbon of light through pts [[x, y, w]], drawn as a glow, a halo and a white-hot core
  ribbon(pts, rgb, alpha = 1, core = PAL.white) {
    if (pts.length < 2) return;
    const x = this.x, L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)];
      let nx = -(q[1] - o[1]), ny = q[0] - o[0]; const n = Math.hypot(nx, ny) || 1; nx /= n; ny /= n;
      L.push([p[0], p[1], nx, ny, p[2]]);
    }
    for (const [mul, a, col] of [[5, .07, rgb], [2.3, .22, rgb], [1, .75, rgb], [.38, 1, core]]) {
      x.fillStyle = `rgba(${col},${a * alpha})`; x.beginPath();
      L.forEach(([px, py, nx, ny, w], i) => { const ww = w * mul; i ? x.lineTo(px + nx * ww, py + ny * ww) : x.moveTo(px + nx * ww, py + ny * ww); });
      for (let i = L.length - 1; i >= 0; i--) { const [px, py, nx, ny, w] = L[i], ww = w * mul; x.lineTo(px - nx * ww, py - ny * ww); }
      x.closePath(); x.fill();
    }
  }
  // a forked bolt: midpoint displacement, with side branches
  bolt(x0, y0, x1, y1, rough = .32, depth = 6) {
    let pts = [[x0, y0], [x1, y1]];
    for (let k = 0; k < depth; k++) {
      const next = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1], len = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / (len || 1), ny = (bx - ax) / (len || 1), off = rnd(-1, 1) * len * rough;
        next.push([(ax + bx) / 2 + nx * off, (ay + by) / 2 + ny * off], pts[i + 1]);
      }
      pts = next;
    }
    return pts;
  }
  strokeBolt(pts, rgb, w, alpha = 1) {
    const x = this.x; x.lineCap = 'round'; x.lineJoin = 'round';
    for (const [mul, a, col] of [[7, .08, rgb], [3, .25, rgb], [1.2, .8, rgb], [.45, 1, PAL.white]]) {
      x.strokeStyle = `rgba(${col},${a * alpha})`; x.lineWidth = w * mul; x.beginPath(); pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); x.stroke();
    }
  }
  glow(x, y, r, c, a = 1) { const g = this.x; g.globalAlpha = a; g.drawImage(this.spr[c], x - r, y - r, r * 2, r * 2); g.globalAlpha = 1; }
  // a ring of light on the ground (an ellipse), optionally with lotus petals
  ring(x, y, r, rgb, a, petals = 0, flat = .32, rot = 0) {
    const g = this.x;
    for (const [w, al] of [[10, .1], [4, .3], [1.6, .9]]) {
      g.strokeStyle = `rgba(${rgb},${al * a})`; g.lineWidth = w * this.k;
      g.beginPath(); g.ellipse(x, y, r, r * flat, 0, 0, TAU); g.stroke();
      if (petals) { g.beginPath(); for (let i = 0; i < petals; i++) { const t0 = rot + i / petals * TAU, t1 = rot + (i + 1) / petals * TAU, tm = (t0 + t1) / 2;
        g.moveTo(x + Math.cos(t0) * r * .72, y + Math.sin(t0) * r * .72 * flat);
        g.quadraticCurveTo(x + Math.cos(tm) * r * 1.18, y + Math.sin(tm) * r * 1.18 * flat, x + Math.cos(t1) * r * .72, y + Math.sin(t1) * r * .72 * flat); } g.stroke(); }
    }
  }
  sunAt(x, y, r, a, rot) { const g = this.x; g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(rot); g.drawImage(this.sun, -r, -r, r * 2, r * 2); g.restore(); }
  // rays of a sun bursting from (x, y)
  rays(x, y, n, len, width, rgb, a, rot) {
    const g = this.x;
    for (let i = 0; i < n; i++) {
      const an = rot + i / n * TAU + Math.sin(i * 7.3) * .12, l = len * (.55 + .45 * Math.abs(Math.sin(i * 3.7 + 1))), w = width * (.5 + .5 * Math.abs(Math.cos(i * 5.1)));
      const gr = g.createLinearGradient(x, y, x + Math.cos(an) * l, y + Math.sin(an) * l);
      gr.addColorStop(0, `rgba(255,250,235,${a})`); gr.addColorStop(.25, `rgba(${rgb},${a * .7})`); gr.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(x + Math.cos(an + Math.PI / 2) * w * .1, y + Math.sin(an + Math.PI / 2) * w * .1);
      g.lineTo(x + Math.cos(an) * l + Math.cos(an + Math.PI / 2) * w, y + Math.sin(an) * l + Math.sin(an + Math.PI / 2) * w);
      g.lineTo(x + Math.cos(an) * l - Math.cos(an + Math.PI / 2) * w, y + Math.sin(an) * l - Math.sin(an + Math.PI / 2) * w);
      g.lineTo(x - Math.cos(an + Math.PI / 2) * w * .1, y - Math.sin(an + Math.PI / 2) * w * .1); g.closePath(); g.fill();
    }
  }

  /* ── the astras: each returns a promise that resolves when it has struck (onHit) ── */
  play(kind, from, to, opt = {}) {
    const f = { brahmastra: this.brahmastra, agneyastra: this.agneyastra, aindrastra: this.aindrastra, nagapasha: this.nagapasha, fireball: this.fireball }[kind];
    return new Promise(res => (f || this.brahmastra).call(this, from, to, { ...opt, onHit: () => { opt.onHit?.(); res(); } }));
  }

  // Brahmāstra: the bow gathers the light of the worlds; an arrow of light; a sun bursts on the foe
  brahmastra([fx, fy], [tx, ty], { onHit } = {}) {
    const k = this.k, CH = .95, FLY = .32;
    this.add((a, dt) => {                                  // gathering
      const p = clamp01(a / CH);
      this.ring(fx, fy + 70 * k, (60 + 40 * p) * k, PAL.gold, p * (1 - clamp01((a - CH) / .4)), 12, .3, a * .8);
      this.glow(fx, fy, (18 + 60 * p * p) * k, 'sun', p);
      if (a < CH && Math.random() < dt * 140) { const an = rnd(0, TAU), r = rnd(110, 220) * k; this.spark(fx + Math.cos(an) * r, fy + Math.sin(an) * r * .7, -Math.cos(an) * r * 2.2, -Math.sin(an) * r * 1.6, .45, rnd(1.5, 3.5) * k, 'gold', { drag: 1 }); }
    }, CH + .45);
    const trail = [];
    this.add(a => {                                        // the arrow of light
      if (a < CH) return; const p = clamp01((a - CH) / FLY), e = smooth(p);
      const hx = fx + (tx - fx) * e, hy = fy + (ty - fy) * e - Math.sin(e * Math.PI) * 40 * k;
      trail.push([hx, hy]); if (trail.length > 16) trail.shift();
      const pts = trail.map(([x, y], i) => [x, y, (1 + i / trail.length * 5) * k]);
      this.ribbon(pts, PAL.gold, 1 - clamp01((a - CH - FLY) / .15)); this.glow(hx, hy, 34 * k, 'sun', 1);
      if (p < 1) for (let i = 0; i < 3; i++) this.spark(hx, hy, rnd(-60, 60) * k, rnd(-60, 60) * k, .5, rnd(1.5, 3) * k, 'gold');
    }, CH + FLY + .16);
    this.at(CH + FLY, () => {                               // the sun bursts
      onHit?.(); this.hit(.38, '255,226,160', 1.6);
      this.burst(tx, ty, 300, 980, ['gold', 'sun', 'white'], { g: 240 * k, life: 1.5, size: 1.3 });
      const rot = rnd(0, TAU), R = Math.hypot(this.W, this.H) * .95;
      this.add(a => {
        const e = out3(clamp01(a / .5)), fade = 1 - clamp01((a - .7) / 1.6);
        this.sunAt(tx, ty, R * (.35 + .75 * e), fade, rot + a * .1);
        this.sunAt(tx, ty, R * (.25 + .4 * e), fade * .7, -rot - a * .16);
        this.glow(tx, ty, (60 + 130 * e) * k, 'sun', fade * .8);
        for (let i = 0; i < 3; i++) { const q = clamp01((a - i * .16) / 1.4); if (q > 0 && q < 1) this.ring(tx, ty, (40 + 520 * out3(q)) * k, PAL.sun, (1 - q) * .9, i === 1 ? 16 : 0, .62, a * .3); }
      }, 2.4);
    });
  }

  // Āgneyāstra: a tornado of fire at the archer, then a braided river of flame, and the foe is engulfed
  agneyastra([fx, fy], [tx, ty], { onHit } = {}) {
    const k = this.k, TW = 1.05, FLOW = .8;
    this.add((a, dt) => {                                  // the tornado
      const grow = clamp01(a / .5), fade = 1 - clamp01((a - TW) / .5);
      for (let s = 0; s < 4; s++) {
        const pts = [];
        for (let i = 0; i <= 40; i++) {
          const u = i / 40, y = fy + 60 * k - u * 230 * k * grow, r = (12 + 70 * u * u) * k * grow, an = s * TAU / 4 + u * 9 - a * 9;
          pts.push([fx + Math.cos(an) * r, y + Math.sin(an) * r * .25, (1.2 + 3.2 * u) * k * (.6 + .4 * (Math.sin(an) + 1) / 2)]);
        }
        this.ribbon(pts.map(q => [q[0], q[1], q[2] * 2.6]), s % 2 ? PAL.fire : PAL.ember, .75 * fade, '255,236,170');
      }
      // the body of the fire: flames whirling up the funnel
      for (let i = 0; i < 9 * fade; i++) { const u = Math.random(), an = rnd(0, TAU), r = (12 + 70 * u * u) * k * grow;
        this.spark(fx + Math.cos(an) * r, fy + 60 * k - u * 230 * k * grow, -Math.sin(an) * 90 * k, rnd(-140, -60) * k, rnd(.25, .5), rnd(7, 16) * k * (.5 + u), Math.random() < .55 ? 'fire' : 'ember', { drag: .96, grow: .5, a: .55 }); }
      if (Math.random() < dt * 90 * fade) this.spark(fx + rnd(-40, 40) * k, fy + rnd(-140, 40) * k, rnd(-40, 40) * k, rnd(-160, -60) * k, rnd(.6, 1.2), rnd(1.5, 3.5) * k, 'ember', { drag: .99, g: -20 * k });
    }, TW + .5);
    this.add((a, dt) => {                                  // the river of flame, two braided streams
      if (a < TW * .7) return; const p = clamp01((a - TW * .7) / FLOW), fade = 1 - clamp01((a - TW * .7 - FLOW) / .5);
      for (let s = 0; s < 2; s++) {
        const pts = [], n = 46;
        for (let i = 0; i <= n; i++) {
          const u = i / n * p, x = fx + (tx - fx) * u, base = fy + (ty - fy) * u - Math.sin(u * Math.PI) * 70 * k;
          const wob = Math.sin(u * 14 - a * 10 + s * Math.PI) * 26 * k * (1 - u * .4);
          pts.push([x, base + wob, (5 + 11 * Math.sin(Math.PI * i / n)) * k]);
        }
        this.ribbon(pts, s ? PAL.fire : PAL.gold, fade * .9, '255,240,190');
        // flames licking along the river
        for (let j = 0; j < 6 * fade; j++) { const q = pts[(Math.random() * pts.length) | 0]; this.spark(q[0], q[1], rnd(-30, 30) * k, rnd(-90, -20) * k, rnd(.2, .45), rnd(8, 18) * k, Math.random() < .5 ? 'fire' : 'ember', { drag: .95, grow: .6, a: .5 }); }
      }
      const hx = fx + (tx - fx) * p, hy = fy + (ty - fy) * p - Math.sin(p * Math.PI) * 70 * k;
      this.glow(hx, hy, 46 * k, 'fire', fade);
      if (p < 1 && Math.random() < dt * 160) this.spark(hx, hy, rnd(-80, 80) * k, rnd(-120, 20) * k, rnd(.5, 1), rnd(2, 4) * k, 'ember', { g: 120 * k });
    }, TW * .7 + FLOW + .55);
    this.at(TW * .7 + FLOW, () => {                         // engulfed
      onHit?.(); this.hit(.55, '255,170,90', 1.2);
      this.burst(tx, ty, 340, 820, ['fire', 'ember', 'gold'], { g: -40 * k, life: 1.4, size: 1.7 });
      this.add((a, dt) => {
        const fade = 1 - clamp01((a - .4) / 1.1);
        this.glow(tx, ty, (130 + 200 * out3(clamp01(a / .3))) * k, 'fire', fade);
        for (let i = 0; i < 5 * fade; i++) this.spark(tx + rnd(-110, 110) * k, ty + rnd(-30, 90) * k, rnd(-25, 25) * k, rnd(-240, -100) * k, rnd(.5, 1.1), rnd(8, 20) * k, Math.random() < .5 ? 'fire' : 'ember', { drag: .985, g: -30 * k, grow: .7, a: .6 });
      }, 1.6);
    });
  }

  // Aindrāstra: Indra's sky darkens, lightning forks down and races along the ground, an orb of plasma bursts
  aindrastra([fx, fy], [tx, ty], { onHit } = {}) {
    const k = this.k, W = this.W, H = this.H, GO = .7, FLY = .45;
    this.tint.want = .42; this.tint.c = '4,10,34';
    let bolts = [], next = 0;
    this.add((a, dt) => {                                   // the storm
      if (a > next) {
        next = a + rnd(.12, .3);
        const x = rnd(.05, .95) * W, end = [x + rnd(-120, 120) * k, rnd(.55, .9) * H];
        const main = this.bolt(x, -10, ...end, .3, 6), br = [];
        for (let b = 0; b < 2; b++) { const s = main[(Math.random() * main.length * .7) | 0]; br.push(this.bolt(s[0], s[1], s[0] + rnd(-160, 160) * k, s[1] + rnd(60, 180) * k, .35, 4)); }
        bolts.push({ pts: [main, ...br], t: a }); this.flash.a = Math.max(this.flash.a, .12); this.flash.c = PAL.ice;
      }
      bolts = bolts.filter(b => a - b.t < .16);
      for (const b of bolts) b.pts.forEach((p, i) => this.strokeBolt(p, PAL.blue, (i ? 1.2 : 2.4) * k, 1 - (a - b.t) / .16));
      if (a > 2.9) { this.tint.want = 0; return false; }
    }, 3);
    this.add((a, dt) => {                                   // the orb gathers at the archer and flies
      const p = clamp01((a - GO) / FLY), e = smooth(p), hx = fx + (tx - fx) * e, hy = fy + (ty - fy) * e;
      this.glow(fx, fy, (20 + 40 * clamp01(a / GO)) * k, 'ice', 1 - p);
      if (a >= GO) { this.glow(hx, hy, 50 * k, 'blue', 1); this.glow(hx, hy, 22 * k, 'white', 1); this.strokeBolt(this.bolt(fx, fy, hx, hy, .22, 5), PAL.ice, 1.6 * k, .9); }
    }, GO + FLY);
    this.at(GO + FLY, () => {                                // the plasma bursts; lightning runs along the ground
      onHit?.(); this.hit(.32, PAL.ice, 1.4);
      this.burst(tx, ty, 220, 760, ['ice', 'blue', 'violet', 'white'], { life: 1, size: 1 });
      const gy = Math.min(H * .92, ty + 120 * k);
      this.add(a => {
        const fade = 1 - clamp01((a - .9) / .7), R = (110 + 40 * Math.sin(a * 30)) * k * out3(clamp01(a / .25));
        this.glow(tx, ty, R * 2.2, 'violet', fade * .7); this.glow(tx, ty, R * 1.4, 'blue', fade); this.glow(tx, ty, R * .6, 'white', fade);
        for (let i = 0; i < 7; i++) { const an = rnd(0, TAU); this.strokeBolt(this.bolt(tx, ty, tx + Math.cos(an) * R * 1.2, ty + Math.sin(an) * R * 1.2, .4, 3), i % 2 ? PAL.violet : PAL.ice, 1 * k, fade); }
        if (a < 1.3 && ((a * 24) | 0) % 2 === 0) for (let g2 = 0; g2 < 2; g2++) this.strokeBolt(this.bolt(0, gy + rnd(-40, 30) * k, W, gy + rnd(-50, 40) * k, .14, 7), g2 ? PAL.violet : PAL.blue, 2.4 * k, fade);
        if (a < 1.2 && Math.random() < .5) { const an = rnd(-Math.PI, 0); this.strokeBolt(this.bolt(tx, ty, tx + Math.cos(an) * 420 * k, ty + Math.sin(an) * 300 * k, .3, 5), PAL.ice, 1.6 * k, fade); }
      }, 1.6);
    });
  }

  // Nāga-pāśa: serpents of green light fly out and coil around their targets; then Garuḍa's golden light frees them
  nagapasha([fx, fy], targets, { onHit, free = true } = {}) {
    const k = this.k, list = Array.isArray(targets[0]) ? targets : [targets], FLY = .9, COIL = 1.5;
    const snakes = Array.from({ length: list.length * 3 }, (_, i) => {
      const t = list[i % list.length];
      return { s: [fx + rnd(-60, 60) * k, fy + rnd(-60, 40) * k], t: [t[0] + rnd(-12, 12) * k, t[1]], ph: i * 2.1, delay: i * .07, h: rnd(110, 160) * k, r: rnd(44, 62) * k, body: [] };
    });
    let freed = false;
    this.add((a, dt) => {
      const gone = free ? clamp01((a - FLY - COIL) / .35) : 0;
      for (const S of snakes) {
        const u = a - S.delay; if (u <= 0) continue;
        let hx, hy, depth = 1;
        if (u < FLY) { const p = smooth(u / FLY); hx = S.s[0] + (S.t[0] - S.s[0]) * p + Math.sin(p * 9 + S.ph) * 40 * k * (1 - p); hy = S.s[1] + (S.t[1] - S.s[1]) * p - Math.sin(p * Math.PI) * 120 * k; }
        else { const q = u - FLY, an = S.ph + q * 7, rise = Math.min(1, q / COIL); hx = S.t[0] + Math.cos(an) * S.r * (1 - rise * .3); hy = S.t[1] + S.h * .5 - rise * S.h + Math.sin(an) * S.r * .28; depth = (Math.sin(an) + 1.4) / 2.4; }
        S.body.push([hx, hy, depth]); if (S.body.length > 44) S.body.shift();
        const n = S.body.length, pts = S.body.map(([x, y, dp], i) => [x, y, (1.2 + 8.5 * Math.sin(Math.PI * Math.min(1, (i / n) * 1.15))) * k * (.5 + .5 * dp)]);
        this.ribbon(pts, PAL.green, (1 - gone) * .95, '190,255,220');
        this.glow(hx, hy, 30 * k, 'jade', (1 - gone) * .9); this.glow(hx, hy, 12 * k, 'white', (1 - gone) * .8);   // the head
        if (Math.random() < dt * 40) { const q = pts[(Math.random() * n) | 0]; this.spark(q[0], q[1], rnd(-20, 20) * k, rnd(-40, 0) * k, rnd(.5, 1), rnd(6, 12) * k, 'green', { grow: .7, a: .35 }); }
      }
      if (!freed && a > FLY + .2) { freed = true; onHit?.(); this.hit(.25, '120,255,180', .5); }
      if (free && a > FLY + COIL && !snakes.done) {           // Garuḍa: a golden radiance; the serpents dissolve
        snakes.done = true; this.hit(.6, '255,230,160', .8);
        for (const t of list) { this.burst(t[0], t[1], 120, 520, ['gold', 'sun', 'green', 'jade'], { life: 1.1 }); }
        this.add(b => { const e = out3(clamp01(b / .5)), fade = 1 - clamp01((b - .4) / .9); for (const t of list) this.rays(t[0], t[1] - 30 * k, 22, 360 * k * e, 18 * k, PAL.gold, .45 * fade, b * .2); }, 1.4);
      }
    }, FLY + COIL + (free ? .9 : .6) + snakes.length * .07);
  }

  // a fireball (the lesser fire of a rakshasa or of Nīla): a comet of flame
  fireball([fx, fy], [tx, ty], { onHit } = {}) {
    const k = this.k, FLY = .55, trail = [];
    this.add((a, dt) => {
      const p = clamp01(a / FLY), e = smooth(p), hx = fx + (tx - fx) * e, hy = fy + (ty - fy) * e - Math.sin(e * Math.PI) * 50 * k;
      trail.push([hx, hy]); if (trail.length > 14) trail.shift();
      this.ribbon(trail.map(([x, y], i) => [x, y, (1 + i / trail.length * 6) * k]), PAL.fire, 1 - clamp01((a - FLY) / .12), '255,236,170');
      this.glow(hx, hy, 30 * k, 'fire', 1); if (Math.random() < dt * 120) this.spark(hx, hy, rnd(-50, 50) * k, rnd(-80, 10) * k, .5, rnd(1.5, 3) * k, 'ember', { g: 100 * k });
    }, FLY + .12);
    this.at(FLY, () => { onHit?.(); this.hit(.25, '255,160,80', .6); this.burst(tx, ty, 120, 420, ['fire', 'ember', 'gold'], { g: 60 * k, life: .9 }); });
  }
  clear() { this.items = []; this.parts = []; this.tint.want = 0; }
}
