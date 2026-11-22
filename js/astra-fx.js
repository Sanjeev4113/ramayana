// The divine astras & world-war VFX engine: a high-contrast cinema effects layer (2D canvas over the battlefield
// painting or fight stage) combining dark volumetric smoke/shrapnel (source-over) with blazing additive light
// (velocity-streaked sparks, anamorphic lens flares, supersonic shockwaves, sacred yantra seals, lightning storms):
//   Brahmāstra  — celestial yantra rings unfold, solar-lance beam with Mach rings, nuclear-sun burst & meteor fallout;
//   Āgneyāstra  — towering smoke-and-fire cyclone unwinds into a 3-strand magma torrent & thermobaric firestorm;
//   Aindrāstra  — storm-blackened sky, supercell forked lightning strikes, plasma rail-bolt & orbital thunder-pillar;
//   Nāga-pāśa   — bioluminescent venom-mist serpents coil & constrict, shattered by Garuḍa's golden wings & solar burst.
// Draws only while effects are alive: between effects it requests zero frames. Positions are CSS pixels on the canvas.
import { dpr } from './calm.js';

const TAU = Math.PI * 2;
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp01 = v => Math.max(0, Math.min(1, v));
const smooth = t => t * t * (3 - 2 * t);
const out3 = t => 1 - (1 - t) ** 3;
const PAL = {
  gold: '255,196,92', sun: '255,232,162', fire: '255,96,24', ember: '255,152,46',
  crimson: '255,48,36', lava: '255,78,18', blue: '104,164,255', ice: '196,232,255',
  violet: '214,120,255', green: '44,255,150', jade: '130,255,196', white: '255,248,232'
};

function glowSprite(rgb, core = '255,252,240') {
  const s = document.createElement('canvas'); s.width = s.height = 128; const g = s.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${core},1)`);
  gr.addColorStop(.15, `rgba(${rgb},.96)`);
  gr.addColorStop(.4, `rgba(${rgb},.34)`);
  gr.addColorStop(.72, `rgba(${rgb},.08)`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return s;
}

// soft volumetric billowing smoke puff (drawn in source-over behind fire for real explosive contrast)
function smokeSprite(rgb = '18,12,10') {
  const s = document.createElement('canvas'); s.width = s.height = 128; const g = s.getContext('2d');
  const puffs = [[64, 64, 46, .75], [46, 56, 32, .5], [82, 58, 30, .48], [58, 78, 32, .45], [74, 46, 26, .42]];
  for (const [cx, cy, r, a] of puffs) {
    const gr = g.createRadialGradient(cx, cy, r * .1, cx, cy, r);
    gr.addColorStop(0, `rgba(${rgb},${a})`);
    gr.addColorStop(.55, `rgba(${rgb},${a * .48})`);
    gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
  }
  return s;
}

// the sun of the Brahmāstra, drawn once: razor-crisp golden corona rays from a white-hot heart
function sunburst(n = 48) {
  const s = document.createElement('canvas'); s.width = s.height = 1024; const g = s.getContext('2d'), c = 512;
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const an = i / n * TAU + Math.sin(i * 7.3) * .08;
    const l = c * (.52 + .48 * Math.abs(Math.sin(i * 3.7 + 1)));
    const w = c * .03 * (.45 + .95 * Math.abs(Math.cos(i * 5.1)));
    const gr = g.createLinearGradient(c, c, c + Math.cos(an) * l, c + Math.sin(an) * l);
    gr.addColorStop(0, 'rgba(255,252,240,.98)');
    gr.addColorStop(.16, 'rgba(255,216,124,.8)');
    gr.addColorStop(.52, 'rgba(255,166,56,.3)');
    gr.addColorStop(1, 'rgba(255,140,32,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(c, c);
    g.lineTo(c + Math.cos(an) * l + Math.cos(an + Math.PI / 2) * w, c + Math.sin(an) * l + Math.sin(an + Math.PI / 2) * w);
    g.lineTo(c + Math.cos(an) * l - Math.cos(an + Math.PI / 2) * w, c + Math.sin(an) * l - Math.sin(an + Math.PI / 2) * w);
    g.closePath(); g.fill();
  }
  const core = g.createRadialGradient(c, c, 0, c, c, c * .36);
  core.addColorStop(0, 'rgba(255,255,248,1)');
  core.addColorStop(.26, 'rgba(255,232,162,.88)');
  core.addColorStop(.62, 'rgba(255,186,78,.28)');
  core.addColorStop(1, 'rgba(255,160,50,0)');
  g.fillStyle = core; g.fillRect(0, 0, 1024, 1024);
  return s;
}

export class AstraFX {
  /** canvas: the layer; onShake(px, py): the host shakes its scene */
  constructor(canvas, { max = 1.5, onShake } = {}) {
    this.c = canvas; this.x = canvas.getContext('2d'); this.max = max; this.onShake = onShake;
    this.spr = Object.fromEntries(Object.keys(PAL).map(k => [k, glowSprite(PAL[k])]));
    this.smokeSpr = smokeSprite('16,11,9');
    this.ashSpr = smokeSprite('54,34,22');
    this.sun = sunburst();
    this.parts = []; this.darks = []; this.items = []; this.bgItems = [];
    this.raf = 0; this.flash = { a: 0, c: PAL.white }; this.tint = { a: 0, want: 0, c: '6,14,40' }; this.shake = 0;
    this.resize = () => { this.d = dpr(this.max); canvas.width = Math.max(1, Math.round(canvas.clientWidth * this.d)); canvas.height = Math.max(1, Math.round(canvas.clientHeight * this.d)); };
    this.resize(); addEventListener('resize', this.resize);
  }
  get W() { return this.c.clientWidth; } get H() { return this.c.clientHeight; }
  /** a glow sprite for any colour ('#ffd36b'), made once */
  key(hex) {
    if (this.spr[hex]) return hex;
    const h = hex.replace('#', ''), n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16);
    this.spr[hex] = glowSprite(`${n >> 16 & 255},${n >> 8 & 255},${n & 255}`);
    return hex;
  }
  get k() { return (this.H || 720) / 720; }

  /* ── the frame loop: runs only while something is alive ── */
  wake() { if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(t => this.frame(t)); } }
  frame(now) {
    const dt = Math.min(.05, (now - this.last) / 1000); this.last = now; this.t = now / 1000;
    const x = this.x, d = this.d;
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, this.c.width, this.c.height);
    if (this.tint.a > .002) { x.globalCompositeOperation = 'source-over'; x.fillStyle = `rgba(${this.tint.c},${this.tint.a})`; x.fillRect(0, 0, this.c.width, this.c.height); }
    x.setTransform(d, 0, 0, d, 0, 0);

    // Pass 1 (source-over): billowing dark war-smoke & flying charred debris (gives fire & explosions true film weight)
    x.globalCompositeOperation = 'source-over';
    const curBg = this.bgItems; this.bgItems = [];
    this.bgItems = curBg.filter(it => { it.age += dt; return it.step(it.age, dt, it) !== false && it.age < it.life; }).concat(this.bgItems);

    this.darks = this.darks.filter(p => (p.life -= dt) > 0);
    for (const p of this.darks) {
      p.vx *= p.drag; p.vy = p.vy * p.drag + p.g * dt;
      if (p.kind === 'feather') {
        p.x += (p.vx + Math.sin(this.t * 5.2 + p.ph) * 48 * this.k) * dt;
        p.y += p.vy * dt; p.rot += Math.cos(this.t * 4.4 + p.ph) * 2.2 * dt;
      } else {
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      }
      if (p.floor && p.y > p.floor) { p.y = p.floor; p.vy *= -.32; p.vx *= .72; }
      const f = p.life / p.max;
      if (p.kind === 'debris') {
        x.save(); x.globalAlpha = Math.min(1, f * 2.5) * p.a; x.translate(p.x, p.y); x.rotate(p.rot);
        x.fillStyle = p.hot && f > .45 ? '#5a240e' : '#1b120d';
        x.fillRect(-p.s, -p.s * .65, p.s * 2, p.s * 1.3);
        if (p.hot && f > .35) { x.fillStyle = `rgba(255,140,48,${(f - .35) * 1.2})`; x.fillRect(-p.s * .6, -p.s * .35, p.s * 1.2, p.s * .7); }
        x.restore();
      } else if (p.kind === 'feather') {
        const a = Math.min(1, f * 2.4, (p.max - p.life) * 6) * p.a;
        x.save(); x.globalAlpha = a; x.translate(p.x, p.y); x.rotate(p.rot);
        const tw = Math.max(.22, Math.abs(Math.cos(this.t * 4.6 + p.ph)));
        x.scale(1, tw);
        const L = p.s * 2.6, W = p.s * .78;
        x.fillStyle = p.c || '#2b1e16';
        x.beginPath(); x.moveTo(-L, 0); x.quadraticCurveTo(-L * .2, -W, L, 0); x.quadraticCurveTo(-L * .1, W * .85, -L, 0); x.fill();
        x.strokeStyle = 'rgba(218,176,120,.45)'; x.lineWidth = Math.max(.7, p.s * .14);
        x.beginPath(); x.moveTo(-L * 1.08, 0); x.lineTo(L * .86, 0); x.stroke();
        x.restore();
      } else {
        const a = Math.min(1, f * 1.6, (p.max - p.life) * 3.5) * p.a;
        const s = p.s * (1 + (1 - f) * p.grow);
        x.save(); x.globalAlpha = a; x.translate(p.x, p.y); x.rotate(p.rot);
        x.drawImage(p.ash ? this.ashSpr : this.smokeSpr, -s, -s, s * 2, s * 2);
        x.restore();
      }
    }

    // Pass 2 (lighter): additive cinematic light, lightning, astras, velocity-streaked sparks & anamorphic flares
    x.globalCompositeOperation = 'lighter';
    const cur = this.items; this.items = [];
    const kept = cur.filter(it => { it.age += dt; return it.step(it.age, dt, it) !== false && it.age < it.life; });
    this.items = kept.concat(this.items);

    this.parts = this.parts.filter(p => (p.life -= dt) > 0);
    for (const p of this.parts) {
      p.vx *= p.drag; p.vy = p.vy * p.drag + p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.floor && p.y > p.floor) { p.y = p.floor; p.vy *= -.42; p.vx *= .78; }
      const f = p.life / p.max, a = Math.min(1, f * 1.8, (p.max - p.life) * 8) * p.a;
      const s = p.s * (p.grow ? 1 + (1 - f) * p.grow : .35 + .65 * f);
      if (p.streak) {
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 28) {
          const len = Math.min(s * 7.5, sp * .038) * p.streak;
          const dx = p.vx / sp * len, dy = p.vy / sp * len;
          const rgb = PAL[p.c] || PAL.gold;
          x.lineCap = 'round';
          x.strokeStyle = `rgba(${rgb},${a * .65})`; x.lineWidth = s * 1.15;
          x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x - dx, p.y - dy); x.stroke();
          x.strokeStyle = `rgba(255,250,235,${a * .95})`; x.lineWidth = s * .42;
          x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x - dx * .65, p.y - dy * .65); x.stroke();
          continue;
        }
      }
      x.globalAlpha = a;
      x.drawImage(this.spr[p.c] || this.spr.gold, p.x - s, p.y - s, s * 2, s * 2);
    }
    x.globalAlpha = 1;

    if (this.flash.a > .002) {
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.fillStyle = `rgba(${this.flash.c},${this.flash.a})`;
      x.fillRect(0, 0, this.c.width, this.c.height);
      this.flash.a *= Math.pow(.015, dt);
    }
    this.tint.a += ((this.tint.want || 0) - this.tint.a) * (1 - Math.pow(.05, dt));
    if (this.shake > .01) {
      this.onShake?.(rnd(-1, 1) * this.shake * 16 * this.k, rnd(-1, 1) * this.shake * 11 * this.k);
      this.shake *= Math.pow(.004, dt);
      if (this.shake <= .01) this.onShake?.(0, 0);
    }
    const alive = this.items.length || this.bgItems.length || this.parts.length || this.darks.length || this.flash.a > .002 || Math.abs(this.tint.a - (this.tint.want || 0)) > .002 || this.shake > .01;
    this.raf = alive ? requestAnimationFrame(t => this.frame(t)) : 0;
    if (!alive) { x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, this.c.width, this.c.height); }
  }

  add(step, life) { this.items.push({ step, life, age: 0 }); this.wake(); }
  addBg(step, life) { this.bgItems.push({ step, life, age: 0 }); this.wake(); }
  at(sec, fn) { this.add((a, dt, it) => { if (!it.fired && a >= sec) { it.fired = true; fn(); } }, sec + .01); }
  spark(x, y, vx, vy, life, s, c = 'gold', o = {}) {
    if (this.parts.length > 900) return;
    this.parts.push({ x, y, vx, vy, life, max: life, s, c, drag: o.drag ?? .965, g: o.g ?? 0, a: o.a ?? 1, grow: o.grow || 0, streak: o.streak || 0, floor: o.floor || 0 });
  }
  smoke(x, y, vx, vy, life, s, o = {}) {
    if (this.darks.length > 320) return;
    this.darks.push({ kind: 'smoke', x, y, vx, vy, life, max: life, s, drag: o.drag ?? .96, g: o.g ?? -22 * this.k, a: o.a ?? .52, grow: o.grow ?? 1.5, rot: rnd(0, TAU), vr: rnd(-.8, .8), ash: !!o.ash });
    this.wake();
  }
  smokeBurst(x, y, n = 14, speed = 130, size = 34, alpha = .55, o = {}) {
    const k = this.k;
    for (let i = 0; i < n; i++) {
      const a = rnd(0, TAU), v = rnd(.25, 1) * speed * k;
      this.smoke(x + rnd(-16, 16) * k, y + rnd(-16, 16) * k, Math.cos(a) * v, Math.sin(a) * v * .7 - rnd(15, 65) * k, rnd(1.1, 2.4) * (o.life || 1), rnd(.7, 1.35) * size * k, { a: alpha * rnd(.7, 1), grow: o.grow ?? 1.65, ash: o.ash && i % 2 === 0 });
    }
  }
  debris(x, y, n = 20, speed = 460, floorY = 0) {
    const k = this.k;
    for (let i = 0; i < n; i++) {
      if (this.darks.length > 320) break;
      const a = rnd(-Math.PI, 0), v = rnd(.35, 1.15) * speed * k;
      this.darks.push({ kind: 'debris', x: x + rnd(-10, 10) * k, y: y + rnd(-10, 10) * k, vx: Math.cos(a) * v * 1.15, vy: Math.sin(a) * v - rnd(40, 140) * k, life: rnd(.8, 1.7), max: 1.7, s: rnd(2.2, 6.2) * k, drag: .985, g: 720 * k, a: .92, rot: rnd(0, TAU), vr: rnd(-11, 11), hot: Math.random() < .45, floor: floorY });
    }
    this.wake();
  }
  featherBurst(x, y, n = 14, speed = 220) {
    const k = this.k, cols = ['#241710', '#3a261a', '#1b1412', '#4c321f'];
    for (let i = 0; i < n; i++) {
      if (this.darks.length > 320) break;
      const a = rnd(0, TAU), v = rnd(.3, 1) * speed * k;
      this.darks.push({ kind: 'feather', x: x + rnd(-22, 22) * k, y: y + rnd(-22, 22) * k, vx: Math.cos(a) * v * 1.2, vy: Math.sin(a) * v * .7 - rnd(15, 75) * k, life: rnd(1.5, 3.0), max: 3.0, s: rnd(4.5, 8.8) * k, drag: .975, g: 38 * k, a: .92, rot: rnd(0, TAU), vr: 0, ph: rnd(0, TAU), c: cols[i % cols.length] });
    }
    this.wake();
  }
  burst(x, y, n, speed, c, o = {}) {
    const streak = o.streak ?? 1;
    for (let i = 0; i < n; i++) {
      const a = rnd(0, TAU), v = speed * this.k * Math.pow(Math.random(), o.pow ?? .52);
      const isStreak = streak && (i % 3 !== 0) && v > 120 * this.k;
      this.spark(x, y, Math.cos(a) * v, Math.sin(a) * v * (o.flat ?? 1) - (o.up || 0) * this.k, rnd(.45, 1.4) * (o.life || 1), rnd(1.6, 4.6) * this.k * (o.size || 1), Array.isArray(c) ? c[i % c.length] : c, { ...o, streak: isStreak ? streak : 0 });
    }
    this.wake();
  }
  hit(flash = .6, c = PAL.white, shake = 1) { this.flash.a = Math.max(this.flash.a, flash); this.flash.c = c; this.shake = Math.max(this.shake, shake); this.wake(); }

  /* ── cinema VFX primitives ── */
  ribbon(pts, rgb, alpha = 1, core = PAL.white) {
    if (pts.length < 2) return;
    const x = this.x, L = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)];
      let nx = -(q[1] - o[1]), ny = q[0] - o[0]; const n = Math.hypot(nx, ny) || 1; nx /= n; ny /= n;
      L.push([p[0], p[1], nx, ny, p[2]]);
    }
    for (const [mul, a, col] of [[5.4, .08, rgb], [2.4, .24, rgb], [1, .8, rgb], [.36, 1, core]]) {
      x.fillStyle = `rgba(${col},${a * alpha})`; x.beginPath();
      L.forEach(([px, py, nx, ny, w], i) => { const ww = w * mul; i ? x.lineTo(px + nx * ww, py + ny * ww) : x.moveTo(px + nx * ww, py + ny * ww); });
      for (let i = L.length - 1; i >= 0; i--) { const [px, py, nx, ny, w] = L[i], ww = w * mul; x.lineTo(px - nx * ww, py - ny * ww); }
      x.closePath(); x.fill();
    }
  }
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
    for (const [mul, a, col] of [[7.5, .09, rgb], [3.2, .28, rgb], [1.25, .85, rgb], [.45, 1, PAL.white]]) {
      x.strokeStyle = `rgba(${col},${a * alpha})`; x.lineWidth = w * mul; x.beginPath(); pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); x.stroke();
    }
  }
  glow(x, y, r, c, a = 1) { const g = this.x; g.globalAlpha = a; g.drawImage(this.spr[c] || this.spr.gold, x - r, y - r, r * 2, r * 2); g.globalAlpha = 1; }
  // horizontal anamorphic cinema lens flare streak across massive impacts
  anamorphic(x, y, w, h, rgb, alpha = 1) {
    if (alpha <= .01) return;
    const g = this.x;
    const gr = g.createLinearGradient(x - w, y, x + w, y);
    gr.addColorStop(0, `rgba(${rgb},0)`);
    gr.addColorStop(.25, `rgba(${rgb},${alpha * .32})`);
    gr.addColorStop(.46, `rgba(255,252,240,${alpha * .92})`);
    gr.addColorStop(.5, `rgba(255,255,255,${alpha})`);
    gr.addColorStop(.54, `rgba(255,252,240,${alpha * .92})`);
    gr.addColorStop(.75, `rgba(${rgb},${alpha * .32})`);
    gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr;
    g.beginPath(); g.ellipse(x, y, w, h, 0, 0, TAU); g.fill();
  }
  // expanding supersonic blast-wave ring
  shockRing(x, y, r, rgb, alpha = 1, lw = 3) {
    if (alpha <= .01) return;
    const g = this.x;
    for (const [m, a, col] of [[4.2, .14, rgb], [1.8, .48, rgb], [.65, .95, PAL.white]]) {
      g.strokeStyle = `rgba(${col},${a * alpha})`; g.lineWidth = lw * m * this.k;
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
    }
  }
  // sacred geometric yantra summoning seal (concentric rings + 8-point star + lotus petals)
  mandala(x, y, r, rgb, alpha = 1, rot = 0) {
    if (alpha <= .01) return;
    const g = this.x; g.save(); g.translate(x, y);
    g.strokeStyle = `rgba(${rgb},${alpha * .85})`; g.lineWidth = 1.6 * this.k;
    g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
    g.strokeStyle = `rgba(${rgb},${alpha * .45})`; g.lineWidth = 5 * this.k;
    g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
    // counter-rotating squares forming an 8-point sacred star
    for (let q = 0; q < 2; q++) {
      g.save(); g.rotate(rot * (q ? -1 : 1) + q * Math.PI / 4);
      const s = r * .72;
      g.strokeStyle = `rgba(255,244,210,${alpha * .78})`; g.lineWidth = 1.4 * this.k;
      g.strokeRect(-s, -s, s * 2, s * 2);
      g.restore();
    }
    // outer lotus petals
    g.save(); g.rotate(rot * .6);
    g.strokeStyle = `rgba(${rgb},${alpha * .7})`; g.lineWidth = 1.3 * this.k;
    const n = 12; g.beginPath();
    for (let i = 0; i < n; i++) {
      const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, am = (a0 + a1) / 2;
      g.moveTo(Math.cos(a0) * r, Math.sin(a0) * r);
      g.quadraticCurveTo(Math.cos(am) * r * 1.24, Math.sin(am) * r * 1.24, Math.cos(a1) * r, Math.sin(a1) * r);
    }
    g.stroke(); g.restore(); g.restore();
  }
  // radiant 12-petal sacred golden lotus-mandala shockwave (blooming full-screen on Brahmāstra detonation)
  lotusMandala(x, y, r, rgb = PAL.gold, alpha = 1, rot = 0) {
    if (alpha <= .01 || r < 4) return;
    const g = this.x, k = this.k;
    g.save(); g.translate(x, y); g.rotate(rot);
    // luminous double outer petals
    for (let layer = 0; layer < 2; layer++) {
      const n = 12, rr = r * (layer ? .78 : 1), off = layer ? Math.PI / n : 0;
      g.save(); g.rotate(off);
      for (let i = 0; i < n; i++) {
        const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, am = (a0 + a1) / 2;
        const tipX = Math.cos(am) * rr * 1.32, tipY = Math.sin(am) * rr * 1.32;
        const p0x = Math.cos(a0) * rr * .52, p0y = Math.sin(a0) * rr * .52;
        const p1x = Math.cos(a1) * rr * .52, p1y = Math.sin(a1) * rr * .52;
        const c0x = Math.cos(a0 + .08) * rr * 1.05, c0y = Math.sin(a0 + .08) * rr * 1.05;
        const c1x = Math.cos(a1 - .08) * rr * 1.05, c1y = Math.sin(a1 - .08) * rr * 1.05;
        g.beginPath(); g.moveTo(p0x, p0y); g.quadraticCurveTo(c0x, c0y, tipX, tipY); g.quadraticCurveTo(c1x, c1y, p1x, p1y); g.closePath();
        g.fillStyle = `rgba(${rgb},${alpha * (layer ? .22 : .16)})`; g.fill();
        g.strokeStyle = `rgba(${rgb},${alpha * .78})`; g.lineWidth = (layer ? 2.6 : 3.4) * k; g.stroke();
        g.strokeStyle = `rgba(255,250,230,${alpha * .95})`; g.lineWidth = 1.2 * k; g.stroke();
      }
      g.restore();
    }
    // inner concentric sacred rings & 8-point yantra
    for (const [rad, lw, col] of [[r * .56, 3.2, rgb], [r * .56, 1.1, PAL.white], [r * .88, 2.2, rgb], [r * .32, 2, PAL.white]]) {
      g.strokeStyle = `rgba(${col},${alpha * .88})`; g.lineWidth = lw * k;
      g.beginPath(); g.arc(0, 0, rad, 0, TAU); g.stroke();
    }
    for (let q = 0; q < 2; q++) {
      g.save(); g.rotate(-rot * 1.4 + q * Math.PI / 4);
      const s = r * .42;
      g.strokeStyle = `rgba(255,248,220,${alpha * .85})`; g.lineWidth = 1.6 * k;
      g.strokeRect(-s, -s, s * 2, s * 2);
      g.restore();
    }
    g.restore();
  }
  ring(x, y, r, rgb, a, petals = 0, flat = .32, rot = 0) {
    const g = this.x;
    for (const [w, al] of [[10, .12], [4, .34], [1.6, .92]]) {
      g.strokeStyle = `rgba(${rgb},${al * a})`; g.lineWidth = w * this.k;
      g.beginPath(); g.ellipse(x, y, r, r * flat, 0, 0, TAU); g.stroke();
      if (petals) {
        g.beginPath();
        for (let i = 0; i < petals; i++) {
          const t0 = rot + i / petals * TAU, t1 = rot + (i + 1) / petals * TAU, tm = (t0 + t1) / 2;
          g.moveTo(x + Math.cos(t0) * r * .72, y + Math.sin(t0) * r * .72 * flat);
          g.quadraticCurveTo(x + Math.cos(tm) * r * 1.18, y + Math.sin(tm) * r * 1.18 * flat, x + Math.cos(t1) * r * .72, y + Math.sin(t1) * r * .72 * flat);
        }
        g.stroke();
      }
    }
  }
  sunAt(x, y, r, a, rot) { const g = this.x; g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(rot); g.drawImage(this.sun, -r, -r, r * 2, r * 2); g.restore(); }
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

  /** full realistic war-ordnance detonation (billowing dark smoke + blazing fire core + shockwave + shrapnel) */
  explosion(x, y, { scale = 1, color = 'fire', rgb = PAL.fire, floorY = 0, shake = .45, flare = true } = {}) {
    const k = this.k * scale;
    this.smokeBurst(x, y, Math.round(12 * scale), 150 * scale, 36 * scale, .56, { ash: true });
    this.debris(x, y, Math.round(14 * scale), 420 * scale, floorY || y + 40 * this.k);
    this.burst(x, y, Math.round(64 * scale), 560 * scale, [color, 'ember', 'gold', 'white'], { g: 240 * this.k, life: .95, size: 1.15 * scale, streak: 1.3, floor: floorY });
    if (shake > 0) this.shake = Math.max(this.shake, shake);
    this.add(a => {
      const e = out3(clamp01(a / .24)), fade = 1 - clamp01((a - .12) / .68);
      this.glow(x, y, (45 + 115 * e) * k, color, fade * .95);
      this.glow(x, y, (24 + 46 * e) * k, 'white', Math.max(0, 1 - a / .28));
      const sr = clamp01(a / .48);
      if (sr < 1) this.shockRing(x, y, (14 + 145 * out3(sr)) * k, rgb, (1 - sr) * .85, 2.4 * scale);
      if (flare && a < .32) this.anamorphic(x, y, 220 * k * (1 - a / .32 * .3), 10 * k, rgb, (1 - a / .32) * .78);
    }, .85);
  }

  /** coordinated war-sky barrage of flaming arrows arcing between two sides */
  arrowVolley([x0, y0], [x1, y1], { count = 7, color = '255,212,130', glowCol = 'gold', spread = 90, arc = 120, dur = .85, onLand } = {}) {
    const k = this.k;
    for (let i = 0; i < count; i++) {
      const delay = i * rnd(.03, .075);
      const sx = x0 + rnd(-spread, spread) * k, sy = y0 + rnd(-spread * .4, spread * .4) * k;
      const ex = x1 + rnd(-spread, spread) * k, ey = y1 + rnd(-spread * .35, spread * .35) * k;
      const h = (arc + rnd(-30, 45)) * k, T = dur * rnd(.88, 1.16);
      const trail = []; let landed = false;
      this.add((a, dt) => {
        const u = a - delay; if (u < 0) return;
        const p = clamp01(u / T);
        const hx = sx + (ex - sx) * p, hy = sy + (ey - sy) * p - Math.sin(p * Math.PI) * h;
        trail.push([hx, hy]); if (trail.length > 9) trail.shift();
        if (p < 1) {
          this.ribbon(trail.map(([px, py], j) => [px, py, (.45 + j * .26) * k]), color, .82);
          this.glow(hx, hy, 11 * k, glowCol, .9);
          if (Math.random() < dt * 22) this.smoke(hx, hy, rnd(-12, 12) * k, rnd(-25, -8) * k, .55, 7 * k, { a: .2, grow: 1.4 });
        } else if (!landed) {
          landed = true;
          this.burst(ex, ey, 8, 170, [glowCol, 'ember'], { life: .42, size: .65, g: 240 * k, streak: 1 });
          onLand?.(ex, ey);
        }
      }, delay + T + .05);
    }
  }

  /** blazing center weapon/aerial clash: white-gold detonation, sky-to-ground golden/blue lightning & radial sparks */
  clash(x, y, { colA = PAL.gold, colB = PAL.ice, scale = 1, floorY = 0, violet = false } = {}) {
    const k = this.k * scale;
    this.hit(.42 * Math.min(1.2, scale), '255,244,210', 1.15 * scale);
    this.burst(x, y, Math.round(110 * scale), 760 * scale, ['gold', 'sun', 'white', violet ? 'violet' : 'ember'], { g: 220 * this.k, life: 1.05, size: 1.2 * scale, streak: 1.65, floor: floorY });
    const skyBolt = this.bolt(x + rnd(-70, 70) * k, -18, x, y, .26, 6);
    const groundBolt = floorY ? this.bolt(x, y, x + rnd(-60, 60) * k, floorY, .28, 5) : null;
    const rads = Array.from({ length: 6 }, (_, i) => {
      const an = i / 6 * TAU + rnd(-.3, .3), L = rnd(140, 290) * k;
      return this.bolt(x, y, x + Math.cos(an) * L, y + Math.sin(an) * L, .34, 4);
    });
    this.add(a => {
      const e = out3(clamp01(a / .18)), fade = 1 - clamp01((a - .06) / .48);
      this.glow(x, y, (72 + 125 * e) * k, 'sun', fade * .98);
      this.glow(x, y, (34 + 48 * e) * k, 'white', Math.max(0, 1 - a / .24));
      this.anamorphic(x, y, 360 * k * (.6 + .5 * e), 13 * k, colA, fade * .95);
      if (a < .38) {
        const bf = 1 - a / .38;
        this.strokeBolt(skyBolt, colA, 3.2 * k, bf);
        if (groundBolt) this.strokeBolt(groundBolt, violet ? PAL.violet : colB, 2.4 * k, bf * .9);
        rads.forEach((b, i) => this.strokeBolt(b, i % 2 ? (violet ? PAL.violet : colB) : colA, 1.8 * k, bf * .9));
      }
      const sr = clamp01(a / .44);
      if (sr < 1) this.shockRing(x, y, (18 + 210 * out3(sr)) * k, colA, (1 - sr) * .9, 2.6 * scale);
    }, .58);
  }

  /** diagonal flaming meteor boulders raining down from the upper sky across the battlefield */
  meteorShower(tx, floorY, { count = 7, dir = 1 } = {}) {
    const k = this.k, W = this.W;
    for (let i = 0; i < count; i++) {
      const delay = .08 + i * rnd(.07, .14);
      const ex = clamp01((tx + rnd(-280, 220) * k) / W) * W;
      const ey = floorY - rnd(0, 48) * k;
      const sx = ex - dir * rnd(240, 420) * k, sy = -rnd(40, 140) * k;
      const T = rnd(.36, .56), sc = rnd(.55, 1.05), trail = [];
      let hit = false;
      this.add((a, dt) => {
        const u = a - delay; if (u < 0) return;
        const p = clamp01(u / T);
        const hx = sx + (ex - sx) * p, hy = sy + (ey - sy) * p;
        trail.push([hx, hy]); if (trail.length > 14) trail.shift();
        if (p < 1) {
          this.ribbon(trail.map(([px, py], j) => [px, py, (1.2 + j / trail.length * 7.5 * sc) * k]), PAL.fire, .95, '255,244,196');
          this.glow(hx, hy, 28 * k * sc, 'fire', 1);
          this.glow(hx, hy, 12 * k * sc, 'white', .95);
          if (Math.random() < dt * 36) this.smoke(hx, hy, rnd(-20, 20) * k, rnd(-45, -10) * k, .7, rnd(14, 24) * k * sc, { a: .42, ash: true });
          if (Math.random() < dt * 95) this.spark(hx, hy, rnd(-70, 70) * k, rnd(-70, 40) * k, .45, rnd(1.5, 3.2) * k, 'ember', { g: 160 * k, streak: 1.2 });
        } else if (!hit) {
          hit = true;
          this.explosion(ex, ey, { scale: sc * .78, color: 'fire', rgb: PAL.fire, floorY, shake: .38 * sc, flare: i % 2 === 0 });
        }
      }, delay + T + .06);
    }
  }

  /* ── the astras: each returns a promise that resolves when it has struck (onHit) ── */
  play(kind, from, to, opt = {}) {
    const f = { brahmastra: this.brahmastra, agneyastra: this.agneyastra, aindrastra: this.aindrastra, nagapasha: this.nagapasha, fireball: this.fireball }[kind];
    return new Promise(res => (f || this.brahmastra).call(this, from, to, { ...opt, onHit: () => { opt.onHit?.(); res(); } }));
  }

  // Brahmāstra: celestial yantra rings unfold, solar-lance beam with Mach rings, colossal golden lotus-mandala, sky-meteor rain & lightning
  brahmastra([fx, fy], [tx, ty], { onHit } = {}) {
    const k = this.k, CH = .95, FLY = .32, floorY = Math.min(this.H * .92, ty + 110 * k);
    const dir = tx >= fx ? 1 : -1;
    this.tint.want = .44; this.tint.c = '14,8,4';
    this.add((a, dt) => {                                  // celestial summoning & gathering
      const p = clamp01(a / CH), fade = 1 - clamp01((a - CH) / .42);
      this.ring(fx, fy + 76 * k, (64 + 54 * p) * k, PAL.gold, p * fade, 16, .28, a * 1.1);
      this.mandala(fx, fy, (34 + 68 * out3(p)) * k, PAL.sun, p * fade * .92, a * 1.3);
      this.glow(fx, fy, (24 + 86 * p * p) * k, 'sun', p * fade);
      this.anamorphic(fx, fy, (90 + 210 * p) * k, 7 * k, PAL.gold, p * fade * .72);
      if (a < CH && Math.random() < dt * 200) {
        const an = rnd(0, TAU), r = rnd(120, 260) * k;
        this.spark(fx + Math.cos(an) * r, fy + Math.sin(an) * r * .75, -Math.cos(an) * r * 2.5, -Math.sin(an) * r * 1.9, .42, rnd(1.8, 3.8) * k, Math.random() < .4 ? 'white' : 'gold', { drag: 1, streak: 1.2 });
      }
    }, CH + .45);
    const trail = [];
    this.add(a => {                                        // the solar lance with Mach shock rings
      if (a < CH) return; const p = clamp01((a - CH) / FLY), e = smooth(p);
      const hx = fx + (tx - fx) * e, hy = fy + (ty - fy) * e - Math.sin(e * Math.PI) * 38 * k;
      trail.push([hx, hy]); if (trail.length > 20) trail.shift();
      const fade = 1 - clamp01((a - CH - FLY) / .18);
      this.ribbon(trail.map(([x, y], i) => [x, y, (1.5 + i / trail.length * 8.5) * k]), PAL.gold, fade);
      this.glow(hx, hy, 52 * k, 'sun', fade);
      this.anamorphic(hx, hy, 160 * k, 6 * k, PAL.sun, fade * .8);
      if (p < 1) {
        for (let i = 0; i < 5; i++) this.spark(hx, hy, rnd(-120, 120) * k, rnd(-120, 120) * k, .55, rnd(1.8, 3.8) * k, i % 2 ? 'sun' : 'gold', { streak: 1.3 });
        if (Math.random() < .45) this.shockRing(hx, hy, rnd(18, 36) * k, PAL.sun, .65, 1.5);
      }
    }, CH + FLY + .2);
    this.at(CH + FLY, () => {                              // colossal golden lotus-mandala + meteor rain + clash lightning
      onHit?.(); this.hit(.64, '255,238,186', 2.2);
      this.smokeBurst(tx, ty + 20 * k, 24, 240, 56, .64, { ash: true, life: 1.4 });
      this.debris(tx, ty, 36, 640, floorY);
      this.burst(tx, ty, 420, 1180, ['gold', 'sun', 'white', 'ember'], { g: 260 * k, life: 1.7, size: 1.45, streak: 1.65, floor: floorY });
      this.meteorShower(tx, floorY, { count: 7, dir });
      const rot = rnd(0, TAU), R = Math.hypot(this.W, this.H) * 1.05;
      const mx = (fx + tx * 1.35) / 2.35, my = ty - 28 * k;
      const skyBolts = [
        this.bolt(tx - 95 * k, -20, tx - 35 * k, floorY, .24, 6),
        this.bolt(tx + 80 * k, -20, tx + 25 * k, floorY, .26, 6),
        this.bolt(mx, my, tx + 110 * k, ty - 50 * k, .32, 5)
      ];
      this.add(a => {
        const e = out3(clamp01(a / .42)), fade = 1 - clamp01((a - .95) / 1.75);
        // sky-piercing golden solar pillar
        const pw = (42 + 90 * e) * k * fade;
        this.ribbon([[tx, floorY, pw * .5], [tx, ty, pw], [tx, -60, pw * .8]], PAL.gold, fade * .62, PAL.white);
        this.sunAt(tx, ty, R * (.38 + .72 * e), fade * .9, rot + a * .12);
        this.sunAt(tx, ty, R * (.26 + .42 * e), fade * .72, -rot - a * .18);
        // colossal 12-petal golden sacred lotus-mandala blossoming across the clash center
        const lm = out3(clamp01(a / .55)), lFade = 1 - clamp01((a - .85) / 1.25);
        if (lFade > .01) this.lotusMandala(mx, my, (46 + 245 * lm) * k, PAL.gold, lFade * .95, a * .32);
        // crackling blue & violet sky-to-ground counter-lightning
        if (a < .85) {
          const lf = 1 - a / .85;
          this.strokeBolt(skyBolts[0], PAL.ice, 3.2 * k, lf * .9);
          this.strokeBolt(skyBolts[1], PAL.blue, 2.6 * k, lf * .8);
          this.strokeBolt(skyBolts[2], PAL.violet, 2.4 * k, lf * .85);
        }
        this.glow(tx, ty, (85 + 175 * e) * k, 'sun', fade * .95);
        this.anamorphic(tx, ty, this.W * (.55 + .45 * e), (18 + 14 * (1 - e)) * k, PAL.sun, fade * .95);
        // expanding supersonic spherical + ground shockwaves
        for (let i = 0; i < 3; i++) {
          const q = clamp01((a - i * .12) / 1.25);
          if (q > 0 && q < 1) {
            this.shockRing(tx, ty, (30 + 520 * out3(q)) * k, PAL.sun, (1 - q) * .85, 3.2 - i * .6);
            this.ring(tx, floorY, (50 + 580 * out3(q)) * k, PAL.gold, (1 - q) * .9, i === 1 ? 16 : 0, .28, a * .35);
          }
        }
        if (a > 2.2) this.tint.want = 0;
      }, 2.7);
    });
  }

  // Āgneyāstra: dark-smoke & fire cyclone unwinds into a 3-strand magma torrent & thermobaric firestorm
  agneyastra([fx, fy], [tx, ty], { onHit } = {}) {
    const k = this.k, TW = 1.0, FLOW = .78, floorY = Math.min(this.H * .92, ty + 110 * k);
    this.tint.want = .34; this.tint.c = '26,6,2';
    this.add((a, dt) => {                                  // roaring fire-and-smoke cyclone
      const grow = clamp01(a / .45), fade = 1 - clamp01((a - TW) / .48);
      if (Math.random() < dt * 28 * fade) this.smoke(fx + rnd(-45, 45) * k, fy + 40 * k - rnd(0, 180) * k * grow, rnd(-45, 45) * k, rnd(-110, -40) * k, 1.3, rnd(26, 46) * k, { a: .48 * fade, ash: true });
      for (let s = 0; s < 5; s++) {
        const pts = [];
        for (let i = 0; i <= 40; i++) {
          const u = i / 40, y = fy + 66 * k - u * 255 * k * grow, r = (14 + 84 * u * u) * k * grow, an = s * TAU / 5 + u * 9.5 - a * 10.5;
          pts.push([fx + Math.cos(an) * r, y + Math.sin(an) * r * .25, (1.4 + 3.8 * u) * k * (.6 + .4 * (Math.sin(an) + 1) / 2)]);
        }
        this.ribbon(pts.map(q => [q[0], q[1], q[2] * 2.8]), s % 2 ? PAL.fire : PAL.lava, .82 * fade, '255,240,180');
      }
      this.ring(fx, fy + 66 * k, (42 + 65 * grow) * k, PAL.fire, fade * .85, 12, .26, -a * 2.2);
      for (let i = 0; i < 12 * fade; i++) {
        const u = Math.random(), an = rnd(0, TAU), r = (12 + 80 * u * u) * k * grow;
        this.spark(fx + Math.cos(an) * r, fy + 64 * k - u * 245 * k * grow, -Math.sin(an) * 110 * k, rnd(-180, -70) * k, rnd(.28, .55), rnd(7, 18) * k * (.5 + u), Math.random() < .55 ? 'fire' : 'ember', { drag: .96, grow: .55, a: .62 });
      }
      if (Math.random() < dt * 130 * fade) this.spark(fx + rnd(-50, 50) * k, fy + rnd(-160, 40) * k, rnd(-60, 60) * k, rnd(-210, -80) * k, rnd(.6, 1.3), rnd(2, 4.2) * k, 'ember', { drag: .99, g: -25 * k, streak: 1.2 });
    }, TW + .5);
    this.add((a, dt) => {                                  // 3-strand braided magma dragon torrent
      if (a < TW * .68) return; const p = clamp01((a - TW * .68) / FLOW), fade = 1 - clamp01((a - TW * .68 - FLOW) / .5);
      for (let s = 0; s < 3; s++) {
        const pts = [], n = 48;
        for (let i = 0; i <= n; i++) {
          const u = i / n * p, x = fx + (tx - fx) * u, base = fy + (ty - fy) * u - Math.sin(u * Math.PI) * 76 * k;
          const wob = Math.sin(u * 15 - a * 12 + s * TAU / 3) * 32 * k * (1 - u * .35);
          pts.push([x, base + wob, (6 + 13 * Math.sin(Math.PI * i / n)) * k]);
        }
        this.ribbon(pts, s === 0 ? PAL.gold : s === 1 ? PAL.fire : PAL.crimson, fade * .92, '255,244,196');
        for (let j = 0; j < 7 * fade; j++) { const q = pts[(Math.random() * pts.length) | 0]; this.spark(q[0], q[1], rnd(-45, 45) * k, rnd(-115, -25) * k, rnd(.22, .48), rnd(9, 20) * k, Math.random() < .5 ? 'fire' : 'ember', { drag: .95, grow: .65, a: .55 }); }
      }
      const hx = fx + (tx - fx) * p, hy = fy + (ty - fy) * p - Math.sin(p * Math.PI) * 76 * k;
      this.glow(hx, hy, 64 * k, 'fire', fade);
      if (p < 1 && Math.random() < dt * 36) this.smoke(hx, hy, rnd(-30, 30) * k, rnd(-80, -25) * k, 1.1, rnd(22, 36) * k, { a: .42, ash: true });
      if (p < 1 && Math.random() < dt * 200) this.spark(hx, hy, rnd(-120, 120) * k, rnd(-150, 30) * k, rnd(.5, 1.1), rnd(2, 4.5) * k, 'ember', { g: 160 * k, streak: 1.4 });
    }, TW * .68 + FLOW + .55);
    this.at(TW * .68 + FLOW, () => {                       // thermobaric firestorm eruption
      onHit?.(); this.hit(.65, '255,164,82', 1.8);
      this.smokeBurst(tx, ty, 30, 260, 58, .66, { ash: true, life: 1.55 });
      this.debris(tx, ty, 34, 600, floorY);
      this.burst(tx, ty, 420, 980, ['fire', 'ember', 'gold', 'crimson'], { g: 120 * k, up: 160, life: 1.55, size: 1.75, streak: 1.5, floor: floorY });
      this.add((a, dt) => {
        const e = out3(clamp01(a / .28)), fade = 1 - clamp01((a - .55) / 1.35);
        this.glow(tx, ty, (160 + 250 * e) * k, 'fire', fade);
        this.glow(tx, ty, (70 + 95 * e) * k, 'gold', fade * .85);
        this.anamorphic(tx, ty, this.W * .58 * e, 16 * k, PAL.fire, fade * .88);
        const sr = clamp01(a / .75);
        if (sr < 1) {
          this.shockRing(tx, ty, (24 + 340 * out3(sr)) * k, PAL.ember, (1 - sr) * .85, 3);
          this.ring(tx, floorY, (40 + 460 * out3(sr)) * k, PAL.fire, (1 - sr) * .95, 0, .25);
        }
        // billowing roaring fire column & ground flame-waves
        for (let i = 0; i < 8 * fade; i++) this.spark(tx + rnd(-150, 150) * k, ty + rnd(-40, 100) * k, rnd(-40, 40) * k, rnd(-290, -110) * k, rnd(.5, 1.15), rnd(10, 24) * k, Math.random() < .5 ? 'fire' : 'ember', { drag: .985, g: -35 * k, grow: .75, a: .64 });
        if (Math.random() < dt * 20 * fade) this.smoke(tx + rnd(-90, 90) * k, ty - rnd(20, 120) * k, rnd(-25, 25) * k, rnd(-130, -60) * k, 1.5, rnd(34, 58) * k, { a: .48 * fade });
        if (a > 1.7) this.tint.want = 0;
      }, 2.0);
    });
  }

  // Aindrāstra: storm-blackened sky, supercell forked lightning, plasma rail-bolt & orbital thunder-pillar
  aindrastra([fx, fy], [tx, ty], { onHit } = {}) {
    const k = this.k, W = this.W, H = this.H, GO = .68, FLY = .38, floorY = Math.min(H * .92, ty + 115 * k);
    this.tint.want = .58; this.tint.c = '4,10,36';
    let bolts = [], next = 0;
    this.add((a, dt) => {                                   // supercell lightning storm
      if (a > next) {
        next = a + rnd(.09, .22);
        const x = rnd(.04, .96) * W, end = [x + rnd(-140, 140) * k, rnd(.55, .92) * H];
        const main = this.bolt(x, -15, ...end, .32, 6), br = [];
        for (let b = 0; b < 3; b++) { const s = main[(Math.random() * main.length * .72) | 0]; br.push(this.bolt(s[0], s[1], s[0] + rnd(-190, 190) * k, s[1] + rnd(60, 210) * k, .36, 4)); }
        bolts.push({ pts: [main, ...br], t: a, end });
        this.flash.a = Math.max(this.flash.a, .16); this.flash.c = PAL.ice;
        this.burst(end[0], end[1], 14, 240, ['ice', 'blue'], { life: .45, size: .75, g: 200 * k, streak: 1.2 });
      }
      bolts = bolts.filter(b => a - b.t < .18);
      for (const b of bolts) {
        const fa = 1 - (a - b.t) / .18;
        b.pts.forEach((p, i) => this.strokeBolt(p, i ? PAL.violet : PAL.blue, (i ? 1.3 : 2.8) * k, fa));
        this.glow(b.end[0], b.end[1], 36 * k, 'ice', fa * .8);
      }
      if (a > 3.1) { this.tint.want = 0; return false; }
    }, 3.2);
    this.add(a => {                                         // plasma sphere & ionized rail-bolt
      const p = clamp01((a - GO) / FLY), e = smooth(p), hx = fx + (tx - fx) * e, hy = fy + (ty - fy) * e;
      this.mandala(fx, fy, (26 + 52 * clamp01(a / GO)) * k, PAL.ice, (1 - p) * .8, -a * 2.2);
      this.glow(fx, fy, (26 + 52 * clamp01(a / GO)) * k, 'ice', 1 - p);
      if (a < GO && Math.random() < .6) this.strokeBolt(this.bolt(fx, fy, fx + rnd(-110, 110) * k, fy + rnd(-90, 90) * k, .38, 4), PAL.blue, 1.1 * k, .7);
      if (a >= GO) {
        this.glow(hx, hy, 64 * k, 'blue', 1); this.glow(hx, hy, 28 * k, 'white', 1);
        this.strokeBolt(this.bolt(fx, fy, hx, hy, .2, 6), PAL.ice, 2.4 * k, .95);
        this.strokeBolt(this.bolt(fx, fy, hx, hy, .3, 5), PAL.violet, 1.4 * k, .75);
      }
    }, GO + FLY);
    this.at(GO + FLY, () => {                               // orbital sky-strike & plasma cataclysm
      onHit?.(); this.hit(.55, PAL.ice, 2.0);
      this.smokeBurst(tx, ty + 20 * k, 20, 220, 48, .55, { life: 1.3 });
      this.debris(tx, ty, 28, 600, floorY);
      this.burst(tx, ty, 320, 940, ['ice', 'blue', 'violet', 'white'], { g: 180 * k, life: 1.25, size: 1.25, streak: 1.7, floor: floorY });
      const skyStrike = this.bolt(tx + rnd(-40, 40) * k, -20, tx, floorY, .18, 7);
      this.add(a => {
        const e = out3(clamp01(a / .2)), fade = 1 - clamp01((a - .95) / .85);
        const R = (130 + 46 * Math.sin(a * 34)) * k * e;
        if (a < .55) {
          const sf = 1 - a / .55;
          this.strokeBolt(skyStrike, PAL.ice, 5.2 * k, sf);
          this.strokeBolt(this.bolt(tx, -20, tx, floorY, .24, 6), PAL.violet, 2.6 * k, sf * .85);
        }
        this.glow(tx, ty, R * 2.5, 'violet', fade * .75); this.glow(tx, ty, R * 1.6, 'blue', fade); this.glow(tx, ty, R * .75, 'white', fade);
        this.anamorphic(tx, ty, this.W * .65 * e, 14 * k, PAL.ice, fade * .95);
        const sr = clamp01(a / .7);
        if (sr < 1) {
          this.shockRing(tx, ty, (28 + 420 * out3(sr)) * k, PAL.ice, (1 - sr) * .9, 2.8);
          this.ring(tx, floorY, (36 + 500 * out3(sr)) * k, PAL.blue, (1 - sr) * .95, 12, .26, a * 1.4);
        }
        for (let i = 0; i < 9; i++) { const an = rnd(0, TAU); this.strokeBolt(this.bolt(tx, ty, tx + Math.cos(an) * R * 1.45, ty + Math.sin(an) * R * 1.45, .42, 4), i % 2 ? PAL.violet : PAL.ice, 1.2 * k, fade); }
        if (a < 1.45 && ((a * 26) | 0) % 2 === 0) for (let g2 = 0; g2 < 2; g2++) this.strokeBolt(this.bolt(0, floorY + rnd(-45, 25) * k, W, floorY + rnd(-55, 35) * k, .15, 7), g2 ? PAL.violet : PAL.blue, 2.8 * k, fade);
        if (a < 1.3 && Math.random() < .65) { const an = rnd(-Math.PI, 0); this.strokeBolt(this.bolt(tx, ty, tx + Math.cos(an) * 480 * k, ty + Math.sin(an) * 340 * k, .32, 5), PAL.ice, 1.8 * k, fade); }
      }, 1.85);
    });
  }

  // Nāga-pāśa: venom-mist celestial serpents coil & constrict; Garuḍa's golden wings & solar shockwave free them
  nagapasha([fx, fy], targets, { onHit, free = true } = {}) {
    const k = this.k, list = Array.isArray(targets[0]) ? targets : [targets], FLY = .85, COIL = 1.45;
    this.tint.want = .34; this.tint.c = '2,22,14';
    const snakes = Array.from({ length: list.length * 4 }, (_, i) => {
      const t = list[i % list.length];
      return { s: [fx + rnd(-70, 70) * k, fy + rnd(-70, 40) * k], t: [t[0] + rnd(-16, 16) * k, t[1]], ph: i * 1.75, delay: i * .06, h: rnd(120, 175) * k, r: rnd(46, 68) * k, body: [] };
    });
    let freed = false;
    this.add((a, dt) => {
      const gone = free ? clamp01((a - FLY - COIL) / .32) : 0;
      for (const S of snakes) {
        const u = a - S.delay; if (u <= 0) continue;
        let hx, hy, depth = 1;
        if (u < FLY) {
          const p = smooth(u / FLY);
          hx = S.s[0] + (S.t[0] - S.s[0]) * p + Math.sin(p * 10 + S.ph) * 46 * k * (1 - p);
          hy = S.s[1] + (S.t[1] - S.s[1]) * p - Math.sin(p * Math.PI) * 135 * k;
        } else {
          const q = u - FLY, an = S.ph + q * 7.8, rise = Math.min(1, q / COIL);
          hx = S.t[0] + Math.cos(an) * S.r * (1 - rise * .28);
          hy = S.t[1] + S.h * .5 - rise * S.h + Math.sin(an) * S.r * .28;
          depth = (Math.sin(an) + 1.4) / 2.4;
        }
        S.body.push([hx, hy, depth]); if (S.body.length > 46) S.body.shift();
        const n = S.body.length, pts = S.body.map(([x, y, dp], i) => [x, y, (1.4 + 9.5 * Math.sin(Math.PI * Math.min(1, (i / n) * 1.15))) * k * (.5 + .5 * dp)]);
        this.ribbon(pts, PAL.green, (1 - gone) * .95, '210,255,232');
        this.glow(hx, hy, 34 * k, 'jade', (1 - gone) * .95); this.glow(hx, hy, 14 * k, 'white', (1 - gone) * .9);
        if (Math.random() < dt * 26 * (1 - gone)) this.smoke(hx, hy, rnd(-18, 18) * k, rnd(-30, -8) * k, .8, rnd(14, 24) * k, { a: .28 });
        if (Math.random() < dt * 52 * (1 - gone)) { const q = pts[(Math.random() * n) | 0]; this.spark(q[0], q[1], rnd(-35, 35) * k, rnd(-55, 10) * k, rnd(.45, .95), rnd(5, 12) * k, 'green', { grow: .65, a: .42, streak: .8 }); }
      }
      if (!freed && a > FLY + .18) { freed = true; onHit?.(); this.hit(.3, '120,255,180', .8); }
      if (free && a > FLY + COIL && !snakes.done) {           // Garuḍa's golden wings descend; serpents shatter
        snakes.done = true; this.hit(.68, '255,238,175', 1.2); this.tint.want = 0;
        for (const t of list) this.burst(t[0], t[1], 180, 680, ['gold', 'sun', 'white', 'green', 'jade'], { life: 1.25, streak: 1.4 });
        const cx = list.reduce((s, p) => s + p[0], 0) / list.length, cy = list.reduce((s, p) => s + p[1], 0) / list.length;
        this.add(b => {
          const e = out3(clamp01(b / .45)), fade = 1 - clamp01((b - .45) / 1.05);
          // twin soaring golden wing-arcs of Garuḍa sweeping down from heaven
          for (const side of [-1, 1]) {
            const wing = [];
            for (let i = 0; i <= 18; i++) {
              const u = i / 18;
              const wx = cx + side * (24 + u * 310 * e) * k;
              const wy = cy - (110 + Math.sin(u * Math.PI * .9) * 140 * e - u * 40 * e) * k;
              wing.push([wx, wy, (3 + 12 * Math.sin(u * Math.PI)) * k * fade]);
            }
            this.ribbon(wing, PAL.gold, fade * .92, PAL.white);
          }
          this.anamorphic(cx, cy - 40 * k, this.W * .5 * e, 14 * k, PAL.gold, fade * .88);
          for (const t of list) {
            this.rays(t[0], t[1] - 30 * k, 28, 420 * k * e, 20 * k, PAL.gold, .52 * fade, b * .24);
            this.shockRing(t[0], t[1], (20 + 260 * e) * k, PAL.sun, fade * .8, 2.2);
          }
        }, 1.55);
      }
      if (!free && a > FLY + COIL + .3) this.tint.want = 0;
    }, FLY + COIL + (free ? 1.15 : .65) + snakes.length * .06);
  }

  // blazing comet fireball with smoke trail, molten shrapnel & explosive shockwave
  fireball([fx, fy], [tx, ty], { onHit } = {}) {
    const k = this.k, FLY = .52, trail = [], floorY = Math.min(this.H * .92, ty + 100 * k);
    this.add((a, dt) => {
      const p = clamp01(a / FLY), e = smooth(p), hx = fx + (tx - fx) * e, hy = fy + (ty - fy) * e - Math.sin(e * Math.PI) * 56 * k;
      trail.push([hx, hy]); if (trail.length > 16) trail.shift();
      const fade = 1 - clamp01((a - FLY) / .14);
      this.ribbon(trail.map(([x, y], i) => [x, y, (1.4 + i / trail.length * 8) * k]), PAL.fire, fade, '255,244,190');
      this.glow(hx, hy, 40 * k, 'fire', fade); this.glow(hx, hy, 18 * k, 'white', fade);
      if (p < 1 && Math.random() < dt * 32) this.smoke(hx, hy, rnd(-25, 25) * k, rnd(-55, -15) * k, .85, rnd(14, 24) * k, { a: .36, ash: true });
      if (p < 1 && Math.random() < dt * 160) this.spark(hx, hy, rnd(-90, 90) * k, rnd(-100, 20) * k, .55, rnd(1.8, 3.6) * k, 'ember', { g: 130 * k, streak: 1.2 });
    }, FLY + .15);
    this.at(FLY, () => {
      onHit?.();
      this.hit(.36, '255,168,84', 1.0);
      this.explosion(tx, ty, { scale: 1.15, color: 'fire', rgb: PAL.fire, floorY, shake: .9, flare: true });
    });
  }

  clear() { this.items = []; this.bgItems = []; this.parts = []; this.darks = []; this.tint.want = 0; }
}
