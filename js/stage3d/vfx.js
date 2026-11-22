// Visual effects for the 3D stage: GPU particles, ribbon trails, projectiles (arrows,
// astras, boulders, serpents), shockwaves, lightning, auras and charge-ups.
import * as THREE from 'three';

const rand = (a, b) => a + Math.random() * (b - a);

/* ───────── procedural textures ───────── */
function canvasTex(size, draw) { const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
export const TEX = {};
export function makeTextures() {
  if (TEX.soft) return TEX;
  TEX.soft = canvasTex(128, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); });
  TEX.spark = canvasTex(64, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, '#fff'); g.addColorStop(.15, 'rgba(255,240,200,.9)'); g.addColorStop(.4, 'rgba(255,180,80,.2)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); });
  TEX.smoke = canvasTex(128, (x, s) => { for (let i = 0; i < 26; i++) { const r = rand(14, 38), px = s / 2 + rand(-26, 26), py = s / 2 + rand(-26, 26); const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,255,255,.16)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); } });
  TEX.petal = canvasTex(64, (x, s) => { x.translate(s / 2, s / 2); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(0, 0, s * .42, s * .2, .5, 0, 7); x.fill(); });
  TEX.ring = canvasTex(256, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, s * .3, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.75, 'rgba(255,255,255,.9)'); g.addColorStop(.85, 'rgba(255,255,255,.4)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); });
  TEX.flare = canvasTex(256, (x, s) => { const c = s / 2; const g = x.createRadialGradient(c, c, 0, c, c, c); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.08, 'rgba(255,255,255,.85)'); g.addColorStop(.25, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); x.globalCompositeOperation = 'lighter'; [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4].forEach((a, i) => { x.save(); x.translate(c, c); x.rotate(a); const l = x.createLinearGradient(-c, 0, c, 0); l.addColorStop(0, 'rgba(255,255,255,0)'); l.addColorStop(.5, `rgba(255,255,255,${i < 2 ? .7 : .3})`); l.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = l; x.fillRect(-c, -1.5, s, 3); x.restore(); }); });
  TEX.rune = canvasTex(512, (x, s) => { const c = s / 2; x.strokeStyle = '#fff'; x.lineWidth = 3; [.46, .4, .25].forEach(r => { x.beginPath(); x.arc(c, c, s * r, 0, 7); x.stroke(); }); for (let i = 0; i < 16; i++) { x.save(); x.translate(c, c); x.rotate(i / 16 * Math.PI * 2); x.beginPath(); x.moveTo(0, -s * .25); x.quadraticCurveTo(s * .06, -s * .33, 0, -s * .4); x.quadraticCurveTo(-s * .06, -s * .33, 0, -s * .25); x.stroke(); x.restore(); } x.font = `${s * .14}px "Tiro Devanagari Sanskrit", serif`; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ॐ', c, c + s * .02); });
  TEX.halo = canvasTex(512, (x, s) => {
    const c = s / 2;
    const g = x.createRadialGradient(c, c, 0, c, c, c); g.addColorStop(0, 'rgba(255,240,200,.55)'); g.addColorStop(.42, 'rgba(255,215,140,.28)'); g.addColorStop(.62, 'rgba(255,200,110,.1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, s, s);
    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 72; i++) { x.save(); x.translate(c, c); x.rotate(i / 72 * Math.PI * 2); const l = x.createLinearGradient(0, s * .2, 0, s * .49); l.addColorStop(0, 'rgba(255,230,170,.35)'); l.addColorStop(1, 'rgba(255,230,170,0)'); x.fillStyle = l; x.fillRect(-1.2, s * .2, 2.4, s * .29); x.restore(); }
    x.strokeStyle = 'rgba(255,236,190,.95)'; x.lineWidth = 3; x.beginPath(); x.arc(c, c, s * .36, 0, 7); x.stroke();
    x.lineWidth = 1.5; x.strokeStyle = 'rgba(255,236,190,.7)'; x.beginPath(); x.arc(c, c, s * .4, 0, 7); x.stroke();
    for (let i = 0; i < 24; i++) { x.save(); x.translate(c, c); x.rotate(i / 24 * Math.PI * 2); x.fillStyle = 'rgba(255,240,200,.9)'; x.beginPath(); x.moveTo(0, -s * .36); x.quadraticCurveTo(s * .018, -s * .41, 0, -s * .445); x.quadraticCurveTo(-s * .018, -s * .41, 0, -s * .36); x.fill(); x.restore(); }
  });
  return TEX;
}

/* ───────── real flame: a noise-driven flame shader on camera-facing cards ───────── */
const FLAME_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
const FLAME_FS = `uniform float time, seed, inten; varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)) + seed) * 43758.5453); }
  float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++){ s += a * n(p); p = p * 2.03 + 1.7; a *= .5; } return s; }
  void main(){
    vec2 uv = vUv; float x = (uv.x - .5) * 2., y = uv.y;
    float t = time * 1.9 + seed * 3.;
    float f = fbm(vec2(x * 1.6, y * 2.6 - t));
    float f2 = fbm(vec2(x * 3.2 + 4., y * 4.4 - t * 1.6));
    float w = (1. - y * .82);
    float shape = 1. - smoothstep(.0, 1., abs(x + (f - .5) * .5 * y) / max(.05, w * (.55 + .45 * f)));
    shape *= smoothstep(1.02, .2, y + (f2 - .5) * .45);
    shape *= smoothstep(0., .06, y);
    shape = clamp(shape * 1.35 - .12, 0., 1.);
    float core = pow(shape, 2.6) * smoothstep(.75, .0, y);
    vec3 col = mix(vec3(.55, .06, .01), vec3(1., .42, .05), smoothstep(.0, .55, shape));
    col = mix(col, vec3(1., .86, .5), smoothstep(.45, .95, shape));
    col = mix(col, vec3(1., .98, .9), core);
    gl_FragColor = vec4(col * inten * 1.7, shape * .92);
  }`;
function flameMaterial() {
  return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { time: { value: 0 }, seed: { value: Math.random() * 10 }, inten: { value: 1 } }, vertexShader: FLAME_VS, fragmentShader: FLAME_FS });
}

/* ───────── GPU point particles ───────── */
class Particles {
  constructor(scene, max, map, additive, opts = {}) {
    this.max = max; this.n = 0; this.items = [];
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(max * 3); this.col = new Float32Array(max * 3); this.size = new Float32Array(max); this.alpha = new Float32Array(max); this.rot = new Float32Array(max);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    g.setAttribute('size', new THREE.BufferAttribute(this.size, 1)); g.setAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1)); g.setAttribute('rot', new THREE.BufferAttribute(this.rot, 1));
    this.mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, fog: !additive,
      uniforms: { map: { value: map }, scale: { value: 600 }, ...(additive ? {} : THREE.UniformsLib.fog) },
      vertexShader: `attribute float size, alpha, rot; attribute vec3 color; varying vec3 vC; varying float vA, vR; uniform float scale;
        #include <fog_pars_vertex>
        void main(){ vC = color; vA = alpha; vR = rot; vec4 mvPosition = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * mvPosition; gl_PointSize = size * scale / -mvPosition.z;
        #include <fog_vertex>
        }`,
      fragmentShader: `uniform sampler2D map; varying vec3 vC; varying float vA, vR;
        #include <fog_pars_fragment>
        void main(){ vec2 p = gl_PointCoord - .5; float c = cos(vR), s = sin(vR); p = mat2(c,-s,s,c) * p + .5; vec4 t = texture2D(map, p); gl_FragColor = vec4(vC * t.rgb, t.a * vA); if (gl_FragColor.a < .003) discard;
        #include <fog_fragment>
        }`
    });
    if (!additive) this.mat.fog = true;
    this.points = new THREE.Points(g, this.mat); this.points.frustumCulled = false; scene.add(this.points);
    this.geo = g; this.opts = opts;
  }
  spawn(p) { // p: {x,y,z,vx,vy,vz,life,size,size1,color,alpha,gravity,drag,spin,turb}
    if (this.items.length >= this.max) this.items.shift();
    p.age = 0; p.size1 ??= p.size; p.alpha ??= 1; p.gravity ??= 0; p.drag ??= 0; p.spin ??= 0; p.r ??= rand(0, 6.28); p.c = new THREE.Color(p.color ?? '#fff');
    this.items.push(p); return p;
  }
  update(dt, t) {
    const it = this.items; let j = 0;
    for (let i = 0; i < it.length; i++) {
      const p = it[i]; p.age += dt; if (p.age >= p.life) continue;
      const k = p.age / p.life;
      p.vy -= p.gravity * dt; const d = Math.pow(1 - p.drag, dt * 60); p.vx *= d; p.vy *= d; p.vz *= d;
      if (p.turb) { p.vx += Math.sin(t * 2 + p.r * 10) * p.turb * dt; p.vz += Math.cos(t * 1.7 + p.r * 7) * p.turb * dt; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.r += p.spin * dt;
      if (p.floor != null && p.y < p.floor) { p.y = p.floor; p.vy *= -.3; p.vx *= .6; p.vz *= .6; }
      this.pos[j * 3] = p.x; this.pos[j * 3 + 1] = p.y; this.pos[j * 3 + 2] = p.z;
      this.col[j * 3] = p.c.r; this.col[j * 3 + 1] = p.c.g; this.col[j * 3 + 2] = p.c.b;
      this.size[j] = p.size + (p.size1 - p.size) * k;
      const fade = p.fadeIn ? Math.min(1, k / p.fadeIn) : 1;
      this.alpha[j] = p.alpha * fade * (p.flicker ? .6 + .4 * Math.sin(t * 20 + p.r * 30) : 1) * (1 - Math.pow(k, p.fadePow ?? 2));
      this.rot[j] = p.r; it[j++] = p;
    }
    it.length = j; this.geo.setDrawRange(0, j);
    ['position', 'color', 'size', 'alpha', 'rot'].forEach(a => { this.geo.attributes[a].needsUpdate = true; });
  }
  clear() { this.items.length = 0; this.geo.setDrawRange(0, 0); }
}

/* ───────── camera-facing ribbon trail ───────── */
class Trail {
  constructor(scene, color, width, length, opacity = 1) {
    this.len = length; this.hist = []; this.width = width;
    const n = length * 2, g = new THREE.BufferGeometry();
    this.pos = new Float32Array(n * 3); const uv = new Float32Array(n * 2), idx = [];
    for (let i = 0; i < length; i++) { uv[i * 4] = i / (length - 1); uv[i * 4 + 1] = 0; uv[i * 4 + 2] = i / (length - 1); uv[i * 4 + 3] = 1; if (i < length - 1) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    this.mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { color: { value: new THREE.Color(color).multiplyScalar(2.2) }, op: { value: opacity } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `uniform vec3 color; uniform float op; varying vec2 vUv; void main(){ float head = 1. - vUv.x; float edge = 1. - abs(vUv.y - .5) * 2.; float core = pow(edge, 3.); gl_FragColor = vec4(mix(color, vec3(1.), core * .6) , pow(head, 1.6) * (edge * .7 + core) * op); }` });
    this.mesh = new THREE.Mesh(g, this.mat); this.mesh.frustumCulled = false; scene.add(this.mesh);
    this.tmp = new THREE.Vector3(); this.side = new THREE.Vector3(); this.view = new THREE.Vector3();
  }
  push(p) { this.hist.unshift(p.clone()); if (this.hist.length > this.len) this.hist.pop(); }
  update(camera) {
    const h = this.hist; if (h.length < 2) return;
    for (let i = 0; i < this.len; i++) {
      const p = h[Math.min(i, h.length - 1)], q = h[Math.min(i + 1, h.length - 1)];
      this.tmp.subVectors(p, q); if (this.tmp.lengthSq() < 1e-8) this.tmp.set(1, 0, 0);
      this.view.subVectors(camera.position, p).normalize();
      this.side.crossVectors(this.tmp, this.view).normalize().multiplyScalar(this.width * (1 - i / this.len * .7));
      this.pos.set([p.x + this.side.x, p.y + this.side.y, p.z + this.side.z, p.x - this.side.x, p.y - this.side.y, p.z - this.side.z], i * 6);
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
  }
  dispose(scene) { scene.remove(this.mesh); this.mesh.geometry.dispose(); this.mat.dispose(); }
}

/* ───────── the effects director ───────── */
export class VFX {
  constructor(scene, camera, hooks = {}) {
    makeTextures();
    this.scene = scene; this.camera = camera; this.hooks = hooks; // hooks: shake(k), flash(color,k), aberr(k), sound(name)
    this.glow = new Particles(scene, 4000, TEX.spark, true);
    this.soft = new Particles(scene, 1200, TEX.soft, true);
    this.smoke = new Particles(scene, 900, TEX.smoke, false);
    this.petals = new Particles(scene, 700, TEX.petal, false);
    this.emitters = []; this.projectiles = []; this.oneShots = []; this.ambient = {};
    this.lights = [];
    this.v = new THREE.Vector3();
  }
  clearAll() {
    this.emitters.forEach(e => e.cards?.forEach(c => { this.scene.remove(c); c.material.dispose(); }));
    [this.glow, this.soft, this.smoke, this.petals].forEach(p => p.clear());
    this.emitters = []; this.ambient = {};
    this.projectiles.forEach(p => p.dispose()); this.projectiles = [];
    this.oneShots.forEach(o => o.dispose?.()); this.oneShots = [];
    this.lights.forEach(l => this.scene.remove(l)); this.lights = [];
  }

  /* ── continuous emitters ── */
  fire(pos, size = 1, key, follow) {
    const light = new THREE.PointLight('#ff8a3a', 6 * size, 9 * size, 1.6); light.position.copy(pos).y += .6 * size; this.scene.add(light); this.lights.push(light);
    const cards = [];
    const geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, .5, 0);
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(geo, flameMaterial()); m.renderOrder = 5; m.frustumCulled = false;
      const w = size * (i === 0 ? 1.15 : rand(.55, .85)), h = size * (i === 0 ? 2.1 : rand(1.3, 1.9));
      m.userData = { w, h, ox: i === 0 ? 0 : rand(-.35, .35) * size, oz: rand(-.12, .12) * size }; m.scale.set(w, h, 1);
      this.scene.add(m); cards.push(m);
    }
    const e = { key, type: 'fire', pos: pos.clone(), size, light, follow, cards }; this.emitters.push(e); return e;
  }
  removeEmitter(key) { this.emitters = this.emitters.filter(e => { if (e.key === key) { if (e.light) this.scene.remove(e.light); e.cards?.forEach(c => { this.scene.remove(c); c.material.dispose(); }); return false; } return true; }); }
  // A weapon's arc of light: the sweep of a mace, a sword or a bow-stroke.
  slash(pos, dir = 1, color = '#ffe2a0', size = 1.1, up = 0) {
    const geo = new THREE.RingGeometry(size * .55, size, 40, 1, 0, Math.PI * .95);
    const uv = geo.attributes.uv, P = geo.attributes.position;
    for (let i = 0; i < P.count; i++) { const a = Math.atan2(P.getY(i), P.getX(i)); uv.setXY(i, a / Math.PI, (Math.hypot(P.getX(i), P.getY(i)) - size * .55) / (size * .45)); }
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { c: { value: new THREE.Color(color).multiplyScalar(2.4) }, k: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: 'uniform vec3 c; uniform float k; varying vec2 vUv; void main(){ float head = smoothstep(k - .55, k, vUv.x) * step(vUv.x, k); float edge = pow(vUv.y, 2.); gl_FragColor = vec4(mix(c, vec3(1.), edge * .6), head * (edge * .9 + .1)); }' });
    const m = new THREE.Mesh(geo, mat); m.position.copy(pos); m.rotation.set(0, 0, dir > 0 ? -.4 + up : Math.PI + .4 - up); if (dir < 0) m.scale.x = -1; this.scene.add(m);
    const o = { t: 0, update: (dt) => { o.t += dt; mat.uniforms.k.value = Math.min(1.5, o.t / .14); if (o.t > .14) mat.uniforms.c.value.multiplyScalar(.88); return o.t < .34; }, dispose: () => { this.scene.remove(m); geo.dispose(); mat.dispose(); } };
    this.oneShots.push(o);
  }
  aura(actor, color) { const e = { key: 'aura-' + actor.key, type: 'aura', actor, color: new THREE.Color(color) }; this.emitters.push(e); return e; }

  /* ── one-shot bursts ── */
  burst(pos, color = '#ffd27a', n = 60, speed = 4, opts = {}) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, 6.28), b = Math.acos(rand(-1, 1)), s = rand(.3, 1) * speed;
      this.glow.spawn({ x: pos.x, y: pos.y, z: pos.z, vx: Math.sin(b) * Math.cos(a) * s, vy: Math.abs(Math.cos(b)) * s * (opts.up ?? 1), vz: Math.sin(b) * Math.sin(a) * s, life: rand(.4, 1.1), size: rand(.08, .22), size1: 0, color, gravity: opts.gravity ?? 6, drag: .02, floor: 0.02 });
    }
  }
  dust(pos, n = 18, color = '#8a7258', spread = 1.2) {
    for (let i = 0; i < n; i++) { const a = rand(0, 6.28), s = rand(.5, 2) * spread; this.smoke.spawn({ x: pos.x, y: .15, z: pos.z, vx: Math.cos(a) * s, vy: rand(.2, .8), vz: Math.sin(a) * s * .5, life: rand(1.2, 2.4), size: rand(.6, 1.2), size1: rand(1.8, 3), color, alpha: .55, drag: .04, spin: rand(-.5, .5) }); }
  }
  flare(pos, color, size = 3, life = .5) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.flare, color: new THREE.Color(color).multiplyScalar(2), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    m.position.copy(pos); m.scale.setScalar(size); this.scene.add(m);
    const o = { t: 0, life, update: (dt) => { o.t += dt; const k = o.t / life; m.material.opacity = Math.max(0, 1 - k); m.scale.setScalar(size * (1 + k * .6)); return k < 1; }, dispose: () => { this.scene.remove(m); m.material.dispose(); } };
    this.oneShots.push(o);
  }
  shockwave(pos, color, radius = 6, life = 1.1) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: TEX.ring, color: new THREE.Color(color).multiplyScalar(2), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(pos.x, .05, pos.z); this.scene.add(m);
    const o = { t: 0, update: (dt) => { o.t += dt; const k = o.t / life; m.scale.setScalar(.2 + radius * 2 * Math.pow(k, .6)); m.material.opacity = Math.max(0, 1 - k); return k < 1; }, dispose: () => { this.scene.remove(m); m.geometry.dispose(); m.material.dispose(); } };
    this.oneShots.push(o);
  }
  pillar(pos, color, height = 40, life = 2.2) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(.6, 1.6, height, 32, 1, true), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { c: { value: new THREE.Color(color).multiplyScalar(2) }, a: { value: 1 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `uniform vec3 c; uniform float a; varying vec2 vUv; void main(){ gl_FragColor = vec4(c, pow(1. - vUv.y, 1.4) * a * .9); }` }));
    m.position.set(pos.x, height / 2, pos.z); this.scene.add(m);
    const o = { t: 0, update: (dt) => { o.t += dt; const k = o.t / life; m.material.uniforms.a.value = Math.max(0, 1 - k); m.scale.set(1 + k * 2, 1, 1 + k * 2); return k < 1; }, dispose: () => { this.scene.remove(m); m.geometry.dispose(); m.material.dispose(); } };
    this.oneShots.push(o);
  }
  rune(pos, color, size = 3.2, life = 2.4) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: TEX.rune, color: new THREE.Color(color).multiplyScalar(1.8), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(pos.x, .04, pos.z); this.scene.add(m);
    const o = { t: 0, update: (dt) => { o.t += dt; const k = o.t / life; m.rotation.z += dt * .8; m.scale.setScalar(size * Math.min(1, k * 4)); m.material.opacity = k < .7 ? 1 : Math.max(0, (1 - k) / .3); return k < 1; }, dispose: () => { this.scene.remove(m); m.geometry.dispose(); m.material.dispose(); } };
    this.oneShots.push(o);
  }
  lightning(to, color = '#cfe0ff') {
    const pts = []; let p = new THREE.Vector3(to.x + rand(-4, 4), 22, to.z + rand(-3, 1));
    for (let i = 0; i < 18; i++) { pts.push(p.clone()); p.lerp(to, 1 / (18 - i)); p.x += rand(-.9, .9); p.z += rand(-.4, .4); }
    pts.push(to.clone());
    const tr = new Trail(this.scene, color, .12, pts.length, 1); pts.slice().reverse().forEach(q => tr.push(q)); tr.update(this.camera);
    const light = new THREE.PointLight(color, 60, 40, 1.4); light.position.copy(to).y += 3; this.scene.add(light);
    const o = { t: 0, update: (dt) => { o.t += dt; const on = o.t < .35 && Math.random() > .25; tr.mat.uniforms.op.value = on ? 1 : .1; light.intensity = on ? 60 : 0; return o.t < .45; }, dispose: () => { tr.dispose(this.scene); this.scene.remove(light); } };
    this.oneShots.push(o); this.hooks.flash?.('#dfe8ff', .6); this.hooks.sound?.('thunder');
  }
  // energy converging into a point before an astra is released
  charge(pos, color, dur = 1.1) {
    for (let i = 0; i < 70; i++) {
      const a = rand(0, 6.28), r = rand(1.4, 3), b = rand(-1, 1);
      const p = this.glow.spawn({ x: pos.x + Math.cos(a) * r, y: pos.y + b * r * .6, z: pos.z + Math.sin(a) * r, vx: 0, vy: 0, vz: 0, life: dur * rand(.7, 1), size: rand(.06, .14), size1: .02, color });
      p.vx = (pos.x - p.x) / p.life; p.vy = (pos.y - p.y) / p.life; p.vz = (pos.z - p.z) / p.life;
    }
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.flare, color: new THREE.Color(color).multiplyScalar(2), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    s.position.copy(pos); this.scene.add(s);
    const light = new THREE.PointLight(color, 0, 8, 1.5); light.position.copy(pos); this.scene.add(light);
    const o = { t: 0, update: (dt) => { o.t += dt; const k = Math.min(1, o.t / dur); s.scale.setScalar(.2 + k * 1.6 + Math.sin(o.t * 40) * .08); light.intensity = k * 18; return o.t < dur; }, dispose: () => { this.scene.remove(s); s.material.dispose(); this.scene.remove(light); } };
    this.oneShots.push(o);
  }

  /* ── projectiles ── */
  projectile({ from, to, kind = 'arrow', color = '#ffd27a', dur, arc, onHit }) {
    const scene = this.scene, big = kind === 'astra';
    dur ??= kind === 'astra' ? .75 : kind === 'rock' ? 1 : kind === 'serpent' ? .9 : .45;
    arc ??= kind === 'rock' ? 2.6 : kind === 'arrow' ? .5 : kind === 'serpent' ? 1.2 : .3;
    const g = new THREE.Group(); scene.add(g);
    let body;
    if (kind === 'arrow' || kind === 'astra') {
      body = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .9, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(big ? 3 : 1.6) }));
      shaft.rotation.z = Math.PI / 2; body.add(shaft);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(.035, .14, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff').multiplyScalar(2) })); tip.rotation.z = -Math.PI / 2; tip.position.x = .5; body.add(tip);
    } else if (kind === 'rock') {
      const geo = new THREE.IcosahedronGeometry(.34, 3), P = geo.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const n = 1 + Math.sin(v.x * 9.1) * .08 + Math.sin(v.y * 13.7 + v.z * 5.3) * .07 + Math.sin(v.z * 17.9) * .05; v.multiplyScalar(n); v.y *= .82; P.setXYZ(i, v.x, v.y, v.z); }
      geo.computeVertexNormals();
      body = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#5e4e3e', roughness: .95, metalness: .05 })); body.castShadow = true;
    } else {
      body = new THREE.Mesh(new THREE.SphereGeometry(.08, 8, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2) }));
    }
    g.add(body);
    const glowS = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.flare, color: new THREE.Color(color).multiplyScalar(2), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    glowS.scale.setScalar(big ? 2.6 : kind === 'rock' ? 0 : .7); g.add(glowS);
    const light = new THREE.PointLight(color, big ? 30 : kind === 'rock' ? 0 : 5, big ? 14 : 5, 1.6); g.add(light);
    const trail = kind === 'rock' ? null : new Trail(scene, color, big ? .32 : kind === 'serpent' ? .09 : .05, big ? 40 : 22);
    const p = { t: 0, from: from.clone(), to: to.clone(), dur, arc, kind, color, onHit, g, trail, prev: from.clone(), cur: new THREE.Vector3(),
      dispose: () => { scene.remove(g); trail?.dispose(scene); } };
    this.projectiles.push(p);
    return p;
  }

  /* ── per-frame update ── */
  update(dt, t) {
    const R = Math.random;
    // ambient spawners (configured per environment / fx tokens)
    const a = this.ambient, cam = this.camera.position;
    const box = (w = 14, d = 10) => ({ x: cam.x + rand(-w, w), z: rand(-d, 3) });
    if (a.embers && R() < .5 * a.embers) { const b = box(); this.glow.spawn({ x: b.x, y: rand(0, .5), z: b.z, vx: rand(-.2, .2), vy: rand(.6, 1.6), vz: 0, life: rand(3, 6), size: rand(.04, .09), color: R() < .5 ? '#ff8a3a' : '#ffc060', turb: 1.2, flicker: true }); }
    if (a.petals && R() < .45 * a.petals) { const b = box(10, 6); this.petals.spawn({ x: b.x, y: rand(6, 8), z: b.z, vx: rand(-.3, .3), vy: -rand(.5, 1), vz: rand(-.1, .1), life: 9, size: rand(.12, .2), color: ['#ff6a96', '#ffd860', '#ff8a2a', '#fff2f2', '#e8303a'][R() * 5 | 0], spin: rand(-2, 2), turb: .8, fadePow: 8 }); }
    if (a.snow && R() < .8 * a.snow) { const b = box(14, 12); this.soft.spawn({ x: b.x, y: rand(6, 9), z: b.z, vx: rand(-.2, .2), vy: -rand(.4, .9), vz: 0, life: 12, size: rand(.04, .09), color: '#e8f0ff', alpha: .9, turb: .6, fadePow: 8 }); }
    if (a.rain) for (let i = 0; i < 6; i++) { const b = box(12, 10); this.soft.spawn({ x: b.x, y: rand(5, 8), z: b.z, vx: -.6, vy: -14, vz: 0, life: .6, size: .035, color: '#a8c0e0', alpha: .7, floor: 0, fadePow: 8 }); }
    if (a.fireflies && this.glow.items.length < 3000 && R() < .25) { const b = box(10, 8); this.glow.spawn({ x: b.x, y: rand(.3, 2.5), z: b.z, vx: 0, vy: 0, vz: 0, life: rand(4, 7), size: .07, color: '#d8ff8a', turb: 1, flicker: true, fadeIn: .2 }); }
    if (a.dust && R() < .25 * a.dust) { const b = box(12, 8); this.smoke.spawn({ x: b.x, y: rand(.1, .6), z: b.z, vx: rand(.2, .6), vy: rand(0, .1), vz: 0, life: 6, size: rand(1.5, 3), size1: 4, color: '#9a7a5a', alpha: .22, fadeIn: .3 }); }
    if (a.mist && R() < .12 * a.mist) { const b = box(14, 10); this.smoke.spawn({ x: b.x - 6, y: rand(.2, 1.2), z: b.z, vx: rand(.3, .6), vy: 0, vz: 0, life: 12, size: rand(3, 5), size1: 7, color: '#c8d0dc', alpha: .2, fadeIn: .3 }); }
    if (a.smoke && R() < .08 * a.smoke) { const b = box(16, 14); this.smoke.spawn({ x: b.x, y: .2, z: b.z - 8, vx: .2, vy: rand(.5, 1), vz: 0, life: 10, size: 2, size1: 7, color: '#6a6058', alpha: .35, fadeIn: .2 }); }
    if (a.motes && R() < .3) { const b = box(8, 6); this.soft.spawn({ x: b.x, y: rand(.5, 4), z: b.z, vx: 0, vy: rand(.05, .2), vz: 0, life: rand(5, 8), size: rand(.03, .06), color: '#fff2c8', alpha: .7, turb: .3, fadeIn: .3 }); }
    if (a.divine && R() < .4) { const b = box(8, 6); this.glow.spawn({ x: b.x, y: rand(0, 1), z: b.z, vx: 0, vy: rand(.4, 1), vz: 0, life: 4, size: rand(.05, .1), color: '#ffe6a0', turb: .4, fadeIn: .3 }); }

    // continuous emitters
    for (const e of this.emitters) {
      if (e.type === 'fire') {
        if (e.follow) { e.pos.copy(e.follow.firePoint()); e.light.position.copy(e.pos).y += .4; }
        const s = e.size;
        if (e.cards) e.cards.forEach((c, i) => { const u = c.userData; c.position.set(e.pos.x + u.ox, e.pos.y - .05 * s, e.pos.z + u.oz); c.rotation.y = Math.atan2(cam.x - c.position.x, cam.z - c.position.z); c.material.uniforms.time.value = t; c.scale.set(u.w * (.92 + Math.sin(t * 7 + i) * .06), u.h * (.9 + Math.sin(t * 5.3 + i * 2) * .1), 1); });
        if (R() < .5 * s) this.glow.spawn({ x: e.pos.x + rand(-.2, .2) * s, y: e.pos.y + .3 * s, z: e.pos.z, vx: rand(-.2, .2), vy: rand(1.2, 2.2) * Math.sqrt(s), vz: 0, life: rand(.3, .6), size: rand(.25, .45) * s, size1: .02, color: '#ff7a2a', turb: 2, alpha: .35 });
        if (R() < .25 * s) this.smoke.spawn({ x: e.pos.x, y: e.pos.y + .8 * s, z: e.pos.z, vx: rand(-.1, .2), vy: rand(.6, 1.2), vz: 0, life: 4, size: .6 * s, size1: 3 * s, color: '#3a3430', alpha: .35, fadeIn: .2 });
        if (R() < .3) this.glow.spawn({ x: e.pos.x, y: e.pos.y + .3, z: e.pos.z, vx: rand(-.5, .5), vy: rand(1.5, 3), vz: rand(-.3, .3), life: rand(1, 2), size: .04, color: '#ffb050', turb: 2, flicker: true });
        e.light.intensity = 6 * s * (.8 + Math.sin(t * 17 + e.pos.x) * .12 + R() * .15);
      } else if (e.type === 'aura') {
        const A = e.actor; if (!A.mesh.visible || A.state.op < .1) continue;
        if (R() < .6) { const w = A.width * .5; this.glow.spawn({ x: A.pos.x + rand(-w, w), y: A.pos.y + rand(0, A.height), z: A.pos.z - .05, vx: 0, vy: rand(.3, .8), vz: 0, life: rand(1.2, 2), size: rand(.04, .09), color: e.color, turb: .5, fadeIn: .2 }); }
      }
    }

    // projectiles
    for (const p of this.projectiles) {
      p.t += dt; const k = Math.min(1, p.t / p.dur);
      const e = p.kind === 'rock' ? k : 1 - Math.pow(1 - k, 1.4);
      p.cur.lerpVectors(p.from, p.to, e); p.cur.y += Math.sin(e * Math.PI) * p.arc;
      if (p.kind === 'serpent') { p.cur.x += Math.sin(e * 22) * .25 * (1 - e); p.cur.y += Math.cos(e * 19) * .2 * (1 - e); }
      p.g.position.copy(p.cur);
      this.v.subVectors(p.cur, p.prev); if (this.v.lengthSq() > 1e-6) { const ang = Math.atan2(this.v.y, this.v.x); p.g.children[0].rotation.set(0, 0, p.kind === 'rock' ? p.t * 9 : ang); if (Math.abs(this.v.z) > .001 && p.kind !== 'rock') p.g.children[0].rotation.y = -Math.atan2(this.v.z, Math.hypot(this.v.x, this.v.y)); }
      p.prev.copy(p.cur);
      if (p.trail) { p.trail.push(p.cur); p.trail.update(this.camera); }
      if (p.kind === 'rock' && R() < .6) this.smoke.spawn({ x: p.cur.x, y: p.cur.y, z: p.cur.z, vx: 0, vy: .2, vz: 0, life: .9, size: .3, size1: 1, color: '#8a7258', alpha: .35 });
      if (p.kind === 'astra' && R() < .9) this.glow.spawn({ x: p.cur.x, y: p.cur.y, z: p.cur.z, vx: rand(-.6, .6), vy: rand(-.6, .6), vz: rand(-.6, .6), life: rand(.3, .7), size: rand(.08, .2), size1: 0, color: p.color });
      if (k >= 1) { p.done = true; p.onHit?.(p.cur.clone()); }
    }
    this.projectiles = this.projectiles.filter(p => { if (p.done) { p.dispose(); return false; } return true; });
    this.oneShots = this.oneShots.filter(o => { const alive = o.update(dt); if (!alive) o.dispose?.(); return alive; });
    [this.glow, this.soft, this.smoke, this.petals].forEach(p => p.update(dt, t));
  }
}
