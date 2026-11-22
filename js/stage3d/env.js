// 3D environments and props for the stage. Every place in the Rāmāyaṇa is assembled
// from a kit: atmospheric sky, terrain, mountains, forests, water, architecture.
import * as THREE from 'three';
import { addPlate } from './plate.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { Water } from 'three/addons/objects/Water.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { TEX, makeTextures } from './vfx.js';

const rnd = (seed) => { let a = seed >>> 0 || 1; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const noise1 = (r) => { const o = [...Array(5)].map((_, i) => ({ f: .02 * (i + 1) ** 1.7, p: r() * 10, a: 1 / (i + 1) })); return x => o.reduce((s, q) => s + Math.sin(x * q.f + q.p) * q.a, 0) / 2.28; };
const C = (c) => new THREE.Color(c);
const ni = (g) => (g.index ? g.toNonIndexed() : g);

/* ───────── time-of-day presets ───────── */
export const TIME = {
  dawn: { sky: 'atmo', elev: 3, az: -55, turb: 7, ray: 2.4, exp: .3, sun: '#ffb27a', sunI: 2.6, hs: '#a8b8dc', hg: '#5a3a2a', hi: .7, fog: '#d0a28a', fd: .02 },
  day: { sky: 'atmo', elev: 24, az: 35, turb: 4, ray: 1.4, exp: .24, sun: '#fff1da', sunI: 3.2, hs: '#c4daf2', hg: '#6a5a40', hi: 1, fog: '#a8bccc', fd: .007 },
  dusk: { sky: 'atmo', elev: 5, az: 68, turb: 8, ray: 2.6, exp: .46, sun: '#ffa868', sunI: 3.4, hs: '#b49ac0', hg: '#6a4a36', hi: 1.25, fog: '#a07868', fd: .012 },
  war: { sky: 'atmo', elev: 4, az: 75, turb: 14, ray: 3.5, exp: .36, sun: '#ff7a3a', sunI: 3.2, hs: '#b0644a', hg: '#4a2414', hi: .8, fog: '#7a3a24', fd: .011 },
  night: { sky: 'night', exp: 1.15, sun: '#a8c0ff', sunI: 1.9, hs: '#3a4a80', hg: '#141420', hi: .95, fog: '#101a36', fd: .018 },
  gold: { sky: 'grad', cols: ['#2a1206', '#b8642a', '#ffdca0'], exp: 1, sun: '#ffe2a8', sunI: 2.6, hs: '#ffe2b8', hg: '#8a5a2a', hi: 1.1, fog: '#e8b478', fd: .018 },
  storm: { sky: 'grad', cols: ['#08080e', '#24222e', '#4a4652'], exp: 1, sun: '#aab4cc', sunI: 1, hs: '#5a5a6a', hg: '#1a1a1a', hi: .55, fog: '#2a2a32', fd: .03 },
  cosmic: { sky: 'nebula', exp: .77, sun: '#d0baff', sunI: 1.4, hs: '#6a5aaa', hg: '#1a1030', hi: .7, fog: '#140a2a', fd: .01 }
};

/* ───────── procedural textures ───────── */
function canvas(size, fn) { const c = document.createElement('canvas'); c.width = c.height = size; fn(c.getContext('2d'), size); return c; }
const texCache = {};
function groundTex(type) {
  if (texCache[type]) return texCache[type];
  const P = { grass: ['#3e5a2c', '#2a4220', '#5a6a34'], earth: ['#6a5238', '#4a3a28', '#8a6a48'], sand: ['#cdb48a', '#a8906a', '#e0c8a0'], snow: ['#e8eef8', '#c8d4e8', '#ffffff'], rock: ['#7a6a5a', '#5a4a3e', '#9a8a78'], battle: ['#4a3020', '#2a1a10', '#6a4428'], cave: ['#2a201a', '#1a1410', '#3a2c22'], marble: ['#e8e0d0', '#d0c4b0', '#f4ece0'], gold: ['#8a5a18', '#5a3a10', '#c08a30'], cloud: ['#ffe8c0', '#e8c890', '#fff4e0'] }[type] || ['#6a5238', '#4a3a28', '#8a6a48'];
  const r = rnd(type.length * 97);
  const c = canvas(512, (x, s) => {
    x.fillStyle = P[0]; x.fillRect(0, 0, s, s);
    for (let i = 0; i < 2600; i++) { x.fillStyle = P[1 + (r() * 2 | 0)]; x.globalAlpha = r() * .35; const w = r() * 14 + 2; x.beginPath(); x.ellipse(r() * s, r() * s, w, w * (.4 + r() * .6), r() * 3, 0, 7); x.fill(); }
    if (type === 'marble' || type === 'gold') { x.globalAlpha = .35; x.strokeStyle = type === 'gold' ? '#3a2008' : '#a89a88'; x.lineWidth = 2; for (let i = 0; i <= s; i += s / 4) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, s); x.moveTo(0, i); x.lineTo(s, i); x.stroke(); } }
    if (type === 'grass') { x.globalAlpha = .5; for (let i = 0; i < 3000; i++) { x.strokeStyle = r() < .5 ? '#6a7a3a' : '#2a3a1a'; x.beginPath(); const px = r() * s, py = r() * s; x.moveTo(px, py); x.lineTo(px + r() * 3 - 1.5, py - r() * 6); x.stroke(); } }
    x.globalAlpha = 1;
  });
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return texCache[type] = t;
}
function waterNormals() {
  if (texCache.wn) return texCache.wn;
  const s = 256, h = new Float32Array(s * s), r = rnd(5);
  const waves = [...Array(10)].map(() => ({ kx: Math.round(r() * 8 - 4), ky: Math.round(r() * 8 - 4) || 1, p: r() * 6.28, a: r() * .5 + .2 }));
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) h[y * s + x] = waves.reduce((v, w) => v + Math.sin((w.kx * x + w.ky * y) / s * Math.PI * 2 + w.p) * w.a, 0);
  const c = canvas(s, (x) => { const img = x.createImageData(s, s); for (let y = 0; y < s; y++) for (let X = 0; X < s; X++) { const dx = h[y * s + (X + 1) % s] - h[y * s + (X - 1 + s) % s], dy = h[((y + 1) % s) * s + X] - h[((y - 1 + s) % s) * s + X]; const n = new THREE.Vector3(-dx, -dy, 1.2).normalize(); const i = (y * s + X) * 4; img.data[i] = (n.x * .5 + .5) * 255; img.data[i + 1] = (n.y * .5 + .5) * 255; img.data[i + 2] = (n.z * .5 + .5) * 255; img.data[i + 3] = 255; } x.putImageData(img, 0, 0); });
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return texCache.wn = t;
}

/* ───────── shared materials ───────── */
const M = {};
function mats() {
  if (M.gold) return M;
  M.gold = new THREE.MeshStandardMaterial({ color: '#d8a640', metalness: 1, roughness: .26 });
  M.goldDark = new THREE.MeshStandardMaterial({ color: '#8a5a18', metalness: .9, roughness: .4 });
  M.marble = new THREE.MeshStandardMaterial({ color: '#efe6d4', roughness: .42, metalness: 0 });
  M.sandstone = new THREE.MeshStandardMaterial({ color: '#d8a878', roughness: .7 });
  M.redstone = new THREE.MeshStandardMaterial({ color: '#a8402a', roughness: .65 });
  M.darkstone = new THREE.MeshStandardMaterial({ color: '#2a2220', roughness: .85 });
  M.stone = new THREE.MeshStandardMaterial({ color: '#8a7a68', roughness: .95, flatShading: true });
  M.wood = new THREE.MeshStandardMaterial({ color: '#5a3a1e', roughness: .85 });
  M.thatch = new THREE.MeshStandardMaterial({ color: '#b8964e', roughness: 1 });
  M.windowLit = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffb860').multiplyScalar(2.2) });
  M.windowDark = new THREE.MeshStandardMaterial({ color: '#3a2a20', roughness: 1 });
  M.cloth = new THREE.MeshStandardMaterial({ color: '#a81a22', roughness: .8, side: THREE.DoubleSide });
  M.saffron = new THREE.MeshStandardMaterial({ color: '#f08a1a', roughness: .8, side: THREE.DoubleSide });
  return M;
}

/* ───────── wind sway for foliage ───────── */
const WIND = { value: 0 };
export const QUALITY = { low: false };
let CUTM = null;
export function setCut(m) { CUTM = m; }
function windy(mat, k = .06) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = WIND;
    sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      #ifdef USE_INSTANCING
        float ph = instanceMatrix[3].x * .37 + instanceMatrix[3].z * .23;
      #else
        float ph = 0.;
      #endif
      transformed.x += sin(uTime * 1.3 + ph) * ${k.toFixed(3)} * max(position.y, 0.);
      transformed.z += cos(uTime * 1.1 + ph) * ${(k * .6).toFixed(3)} * max(position.y, 0.);`);
  };
  return mat;
}

/* ───────── kit: sky ───────── */
function buildSky(g, T, sunDir, renderer) {
  if (T.sky === 'atmo') {
    const sky = new Sky(); sky.scale.setScalar(1800);
    const u = sky.material.uniforms; u.turbidity.value = T.turb; u.rayleigh.value = T.ray; u.mieCoefficient.value = .005; u.mieDirectionalG.value = .82;
    const phi = THREE.MathUtils.degToRad(90 - T.elev), theta = THREE.MathUtils.degToRad(T.az);
    sunDir.setFromSphericalCoords(1, phi, theta); u.sunPosition.value.copy(sunDir);
    g.add(sky); return sky;
  }
  const geo = new THREE.SphereGeometry(900, 48, 24);
  let mat;
  if (T.sky === 'night' || T.sky === 'nebula') {
    mat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { neb: { value: T.sky === 'nebula' ? 1 : 0 } },
      vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `uniform float neb; varying vec3 vP;
        float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }
        float n3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
        float fbm(vec3 p){ float s = 0., a = .5; for(int i=0;i<5;i++){ s += a * n3(p); p *= 2.03; a *= .5; } return s; }
        void main(){ float y = vP.y; vec3 c = mix(vec3(.02,.03,.08), vec3(.004,.006,.02), smoothstep(-.05,.6,y));
          c += vec3(.06,.08,.16) * pow(1. - abs(y), 6.);
          float m = fbm(vP * 3.); c += neb * (vec3(.35,.12,.55) * pow(m, 3.) * 2. + vec3(.1,.25,.6) * pow(fbm(vP * 5. + 7.), 4.) * 2.5);
          float milky = pow(1. - abs(dot(vP, normalize(vec3(.3,.8,.5)))), 12.) * fbm(vP * 8.); c += vec3(.25,.25,.35) * milky * (1. - neb * .5);
          gl_FragColor = vec4(c, 1.); }` });
    // stars
    const N = 2400, pos = new Float32Array(N * 3), r = rnd(3);
    for (let i = 0; i < N; i++) { const v = new THREE.Vector3(r() * 2 - 1, r() * .95 + .02, r() * 2 - 1).normalize().multiplyScalar(800); pos.set([v.x, v.y, v.z], i * 3); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#ffffff', size: 1.6, sizeAttenuation: false, transparent: true, opacity: .85, fog: false, depthWrite: false })));
    if (T.sky === 'night') {
      sunDir.set(-.45, .5, -.75).normalize();
      const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.soft, color: C('#e8eeff').multiplyScalar(1.6), fog: false, depthWrite: false })); moon.position.copy(sunDir).multiplyScalar(600); moon.scale.setScalar(120); g.add(moon);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(16, 48), new THREE.MeshBasicMaterial({ color: C('#f4f6ff').multiplyScalar(1.4), fog: false })); disc.position.copy(sunDir).multiplyScalar(590); disc.lookAt(0, 0, 0); g.add(disc);
    } else sunDir.set(.2, .6, -.8).normalize();
  } else {
    const [a, b, c2] = T.cols.map(C);
    mat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { a: { value: a }, b: { value: b }, c: { value: c2 } },
      vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `uniform vec3 a,b,c; varying vec3 vP; void main(){ float y = vP.y; vec3 col = mix(c, b, smoothstep(0., .25, y)); col = mix(col, a, smoothstep(.25, .9, y)); gl_FragColor = vec4(col,1.); }` });
    sunDir.set(.1, .55, -.82).normalize();
  }
  const m = new THREE.Mesh(geo, mat); m.renderOrder = -10; g.add(m); return m;
}

/* ───────── kit: terrain ───────── */
function ground(g, type, size = 260, rep = 40) {
  const t = groundTex(type); t.repeat.set(rep, rep);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ map: t, roughness: type === 'marble' ? .25 : .96, metalness: type === 'gold' ? .6 : 0 }));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true; g.add(m); return m;
}
function ridge(g, { z = -120, width = 700, height = 40, color = '#6a7a8a', seed = 1, snow = 0, base = 0, rough = 1 }) {
  const n = noise1(rnd(seed)), N = 220, rows = 10, pos = [], col = [], idx = [];
  const c0 = C(color), cs = C('#f2f6ff');
  for (let i = 0; i <= N; i++) {
    const x = -width / 2 + width * i / N, top = height * (.35 + .65 * Math.max(0, n(x * rough) * .5 + .5)) + Math.abs(n(x * 3.3 * rough)) * height * .18;
    for (let j = 0; j <= rows; j++) { const y = base + top * j / rows; pos.push(x, y, z - Math.sin(i * .7) * 6); const k = j / rows; const cc = snow && k > 1 - snow ? cs : c0.clone().multiplyScalar(.7 + .3 * k); col.push(cc.r, cc.g, cc.b); }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < rows; j++) { const a = i * (rows + 1) + j, b = a + rows + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide })); g.add(m); return m;
}

/* ───────── kit: vegetation ───────── */
function blob(r, sx = 1, sy = 1, sz = 1, x = 0, y = 0, z = 0, seed = 1) {
  const geo = new THREE.IcosahedronGeometry(r, 1); const p = geo.attributes.position, rr = rnd(seed);
  for (let i = 0; i < p.count; i++) { const f = .82 + rr() * .3; p.setXYZ(i, p.getX(i) * f * sx + x, p.getY(i) * f * sy + y, p.getZ(i) * f * sz + z); }
  geo.computeVertexNormals(); return geo;
}
function colorize(geo, c) { const n = geo.attributes.position.count, a = new Float32Array(n * 3), col = C(c); for (let i = 0; i < n; i++) { const k = .75 + (geo.attributes.position.getY(i) % 1) * .1; a.set([col.r * k, col.g * k, col.b * k], i * 3); } geo.setAttribute('color', new THREE.BufferAttribute(a, 3)); return geo; }
const TREE_GEO = {};
function leafTex(kind) {
  const key = 'leaf-' + kind; if (texCache[key]) return texCache[key];
  const pal = { round: ['#2c4a1e', '#3e6226', '#567a30', '#1e3416'], ashoka: ['#1e3a16', '#2c5020', '#3a6428', '#16280e'], sal: ['#2e4c1c', '#44682a', '#5a7c34', '#20361a'], pine: ['#1a3424', '#264a32', '#305a3a', '#12261a'] }[kind] || ['#2c4a1e', '#3e6226', '#567a30', '#1e3416'];
  const r = rnd(kind.length * 31);
  const c = canvas(256, (x, s) => {
    const n = kind === 'pine' ? 700 : 520;
    for (let i = 0; i < n; i++) {
      const a = r() * 6.28, d = Math.pow(r(), .6) * s * .44, px = s / 2 + Math.cos(a) * d, py = s / 2 + Math.sin(a) * d * .9;
      x.save(); x.translate(px, py); x.rotate(r() * 6.28); x.fillStyle = pal[(r() * 4) | 0]; x.globalAlpha = .85 + r() * .15;
      if (kind === 'pine') { x.fillRect(-1, -7, 2, 14); } else { x.beginPath(); x.ellipse(0, 0, 7 + r() * 4, 3 + r() * 1.6, 0, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,220,.12)'; x.beginPath(); x.ellipse(-1, -1, 4, 1.2, 0, 0, 7); x.fill(); }
      x.restore();
    }
    if (kind === 'ashoka') { for (let i = 0; i < 70; i++) { const a = r() * 6.28, d = r() * s * .42; x.fillStyle = r() < .5 ? '#ff5a2a' : '#ffb02a'; x.beginPath(); x.arc(s / 2 + Math.cos(a) * d, s / 2 + Math.sin(a) * d, 2.5 + r() * 2, 0, 7); x.fill(); } }
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return texCache[key] = t;
}
function frondTex() {
  if (texCache.frond) return texCache.frond;
  const c = canvas(256, (x, s) => { x.strokeStyle = '#4a5a24'; x.lineWidth = 3; x.beginPath(); x.moveTo(s / 2, 0); x.lineTo(s / 2, s); x.stroke(); for (let i = 0; i < 40; i++) { const y = i / 40 * s, l = s * .45 * Math.sin((i / 40) * Math.PI) + 8; for (const d of [-1, 1]) { x.strokeStyle = i % 3 ? '#3e6a26' : '#557c30'; x.lineWidth = 3.2; x.beginPath(); x.moveTo(s / 2, y); x.quadraticCurveTo(s / 2 + d * l * .5, y + 6, s / 2 + d * l, y + 18); x.stroke(); } } });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return texCache.frond = t;
}
// A tree is two instanced meshes: bark trunk + leaf cards (normals point out of the canopy for soft light).
function treeParts(type) {
  if (TREE_GEO[type]) return TREE_GEO[type];
  const r = rnd(type.length * 13 + 5), cards = [];
  const card = (w, cx, cy, cz, ctr) => { const p = new THREE.PlaneGeometry(w, w); p.rotateX((r() - .5) * 1.2); p.rotateY(r() * Math.PI); p.translate(cx, cy, cz); const pos = p.attributes.position, nor = p.attributes.normal; for (let i = 0; i < pos.count; i++) { const v = new THREE.Vector3(pos.getX(i) - ctr.x, pos.getY(i) - ctr.y, pos.getZ(i) - ctr.z).normalize(); nor.setXYZ(i, v.x, v.y, v.z); } cards.push(p); };
  let trunk;
  if (type === 'palm') {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(.4, 2, 0), new THREE.Vector3(.55, 4, 0), new THREE.Vector3(.25, 5.6, 0)]);
    trunk = new THREE.TubeGeometry(curve, 12, .15, 7);
    for (let i = 0; i < 11; i++) { const f = new THREE.PlaneGeometry(.9, 3.2, 1, 8); const pos = f.attributes.position; for (let k = 0; k < pos.count; k++) { const y = pos.getY(k) + 1.6; pos.setY(k, y); pos.setZ(k, -Math.pow(y / 3.2, 2) * 1.6); } f.rotateX(-Math.PI / 2 + .5); f.rotateY(i / 11 * Math.PI * 2); f.translate(.25, 5.6, 0); f.computeVertexNormals(); cards.push(f); }
  } else if (type === 'sal' || type === 'pine') {
    trunk = new THREE.CylinderGeometry(.12, .22, 7, 8); trunk.translate(0, 3.5, 0);
    for (let i = 0; i < 12; i++) { const y = 3 + i * .38, w = (type === 'pine' ? 2.6 : 2.4) * (1 - i / 14); card(w, (r() - .5) * .5, y, (r() - .5) * .5, new THREE.Vector3(0, y - .3, 0)); }
  } else {
    const tall = type === 'ashoka';
    trunk = new THREE.CylinderGeometry(.14, .3, tall ? 5 : 3.4, 8); trunk.translate(0, (tall ? 5 : 3.4) / 2, 0);
    const ctr = new THREE.Vector3(0, tall ? 4.2 : 4, 0);
    for (let i = 0; i < (tall ? 12 : 16); i++) { const a = r() * 6.28, d = r() * (tall ? .9 : 1.7); card(tall ? 2 : 2.8, Math.cos(a) * d, ctr.y + (r() - .3) * (tall ? 3 : 1.6), Math.sin(a) * d, ctr); }
  }
  return TREE_GEO[type] = { trunk, leaves: mergeGeometries(cards.map(ni)) };
}
function treeObject(type, tint = '#ffffff') {
  const p = treeParts(type), g = new THREE.Group();
  const t = new THREE.Mesh(p.trunk, new THREE.MeshStandardMaterial({ color: '#4a3424', roughness: 1 }));
  const l = new THREE.Mesh(p.leaves, windy(new THREE.MeshStandardMaterial({ map: type === 'palm' ? frondTex() : leafTex(type), alphaTest: .42, side: THREE.DoubleSide, roughness: .85, color: tint }), .03));
  [t, l].forEach(m => { m.castShadow = m.receiveShadow = true; g.add(m); }); return g;
}
function treeGeo(type) { const p = treeParts(type); return mergeGeometries([ni(p.trunk), p.leaves].map(g => { const q = g.clone(); ['uv', 'normal'].forEach(k => { if (!q.attributes[k]) q.computeVertexNormals(); }); return q; })); }
function forest(g, { count = 80, types = ['round', 'sal', 'palm'], zMin = -60, zMax = -8, xSpan = 60, clear = 7, tint = '#ffffff', scale = [1, 1.8], seed = 7, flowers = false }) {
  const r = rnd(seed), byType = {};
  for (let i = 0; i < count; i++) {
    const type = types[(r() * types.length) | 0]; const z = zMin + r() * (zMax - zMin); let x = (r() * 2 - 1) * xSpan;
    if (z > -14 && Math.abs(x) < clear) x = Math.sign(x || 1) * (clear + r() * 6);
    (byType[type] ||= []).push({ x, z, s: scale[0] + r() * (scale[1] - scale[0]), ry: r() * 6.28, c: .75 + r() * .35 });
  }
  const dummy = new THREE.Object3D(), tc = C(tint);
  const bark = new THREE.MeshStandardMaterial({ color: '#4a3424', roughness: 1 });
  for (const [type, list] of Object.entries(byType)) {
    const parts = treeParts(type);
    const leafMat = windy(new THREE.MeshStandardMaterial({ map: type === 'palm' ? frondTex() : leafTex(type), alphaTest: .42, side: THREE.DoubleSide, roughness: .85 }), .03);
    const tr = new THREE.InstancedMesh(parts.trunk, bark, list.length), lv = new THREE.InstancedMesh(parts.leaves, leafMat, list.length);
    [tr, lv].forEach(m => { m.castShadow = true; m.receiveShadow = true; });
    list.forEach((t, i) => { dummy.position.set(t.x, 0, t.z); dummy.rotation.y = t.ry; dummy.scale.setScalar(t.s); dummy.updateMatrix(); tr.setMatrixAt(i, dummy.matrix); lv.setMatrixAt(i, dummy.matrix); lv.setColorAt(i, tc.clone().multiplyScalar(t.c)); });
    g.add(tr, lv);
    const im = lv;
    if (type === 'ashoka' || flowers) {
      const fp = []; list.forEach(t => { for (let k = 0; k < 40; k++) fp.push(t.x + (Math.random() - .5) * 1.6 * t.s, (2.6 + Math.random() * 3) * t.s, t.z + (Math.random() - .5) * 1.6 * t.s); });
      const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3));
      g.add(new THREE.Points(fg, new THREE.PointsMaterial({ color: '#ff3a2a', size: .12, map: TEX.soft, transparent: true, depthWrite: false })));
    }
  }
}
function grass(g, { color = '#4a6a2a', count = 9000, zMin = -10, zMax = 5, xSpan = 16 }) {
  // Each blade is two one-sided triangles (one per face) whose normals point up, so grass takes the light of the
  // ground it grows from. A double-sided blade with its own face normal turns black whenever it is seen from behind.
  const blade = new THREE.BufferGeometry();
  blade.setAttribute('position', new THREE.Float32BufferAttribute([-.018, 0, 0, .018, 0, 0, .01, .26, 0, .018, 0, 0, -.018, 0, 0, .01, .26, 0], 3));
  blade.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, .2, .98, 0, 0, 1, 0, 0, 1, 0, .2, .98, 0], 3));
  const mat = windy(new THREE.MeshStandardMaterial({ color, roughness: 1, emissive: C(color).multiplyScalar(.22) }), .25);
  if (QUALITY.low) count = Math.round(count * .3);
  const im = new THREE.InstancedMesh(blade, mat, count), d = new THREE.Object3D(), r = rnd(11), c = C(color);
  for (let i = 0; i < count; i++) { d.position.set((r() * 2 - 1) * xSpan, 0, zMin + r() * (zMax - zMin)); d.rotation.set((r() - .5) * .4, r() * 6.28, 0); d.scale.set(.8 + r() * .7, .4 + r() * .8, 1); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, c.clone().multiplyScalar(.8 + r() * .4)); }
  im.receiveShadow = true; g.add(im);
}
function rocks(g, { count = 30, zMin = -50, zMax = -6, xSpan = 40, size = [1, 4], color = '#9a7a5a', clear = 7, seed = 21, piles = false }) {
  const geo = blob(1, 1, .75, 1, 0, 0, 0, 77); const mat = new THREE.MeshStandardMaterial({ color, roughness: .95, flatShading: true });
  const im = new THREE.InstancedMesh(geo, mat, count), d = new THREE.Object3D(), r = rnd(seed);
  for (let i = 0; i < count; i++) {
    let x = (r() * 2 - 1) * xSpan, z = zMin + r() * (zMax - zMin); if (z > -12 && Math.abs(x) < clear) x = Math.sign(x || 1) * (clear + r() * 8);
    const s = size[0] + r() * (size[1] - size[0]); d.position.set(x, s * .45 + (piles && r() < .4 ? s * .9 : 0), z); d.rotation.set(r() * 3, r() * 3, r() * 3); d.scale.set(s, s * (.7 + r() * .4), s); d.updateMatrix(); im.setMatrixAt(i, d.matrix);
    im.setColorAt(i, C(color).multiplyScalar(.75 + r() * .4));
  }
  im.castShadow = im.receiveShadow = true; g.add(im);
}

/* ───────── kit: water ───────── */
function water(g, env, { z0 = -4, z1 = -300, color = '#1a4a6a', distortion = 3.2, width = 800 }) {
  const h = Math.abs(z1 - z0);
  const w = new Water(new THREE.PlaneGeometry(width, h), { textureWidth: 512, textureHeight: 512, waterNormals: waterNormals(), sunDirection: env.sunDir.clone(), sunColor: C(env.T.sun), waterColor: C(color), distortionScale: distortion, fog: true });
  w.rotation.x = -Math.PI / 2; w.position.set(0, .03, (z0 + z1) / 2); g.add(w); env.water = w; return w;
}

/* ───────── kit: architecture ───────── */
function pushMesh(list, geo, x, y, z, ry = 0) { const gg = ni(geo); gg.rotateY(ry); gg.translate(x, y, z); list.push(gg); }
function shikhara(r, h) { const pts = []; for (let i = 0; i <= 12; i++) { const k = i / 12; pts.push(new THREE.Vector2(r * (1 - Math.pow(k, 1.6)) * (1 + .08 * Math.sin(k * 30)), h * k)); } return new THREE.LatheGeometry(pts, 12); }
function dome(r) { return new THREE.SphereGeometry(r, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2); }
function city(g, style, env, { z = -40, spread = 70, count = 22, hill = 0 }) {
  const m = mats(), r = rnd(style.length * 13);
  const walls = [], golds = [], wins = [], accents = [];
  if (!M.goldLit) { M.goldLit = M.gold.clone(); M.goldLit.emissive = C('#c08020'); M.goldLit.emissiveIntensity = 1.3; M.goldDarkLit = M.goldDark.clone(); M.goldDarkLit.color = C('#a87a2a'); M.goldDarkLit.emissive = C('#7a4a10'); M.goldDarkLit.emissiveIntensity = 1; }
  const glowGold = style === 'lanka';
  const wallMat = style === 'lanka' ? (glowGold ? M.goldDarkLit : m.goldDark) : style === 'mithila' ? m.sandstone : m.marble;
  const night = env.time === 'night';
  for (let i = 0; i < count; i++) {
    const x = (r() * 2 - 1) * spread, zz = z - r() * 40, w = 3.5 + r() * 5, h = (style === 'lanka' ? 6 : 4) + r() * (style === 'lanka' ? 9 : 7), base = hill ? Math.max(0, hill * (1 - Math.abs(x) / spread)) : 0;
    if (style === 'lanka') for (let b = 1; b <= 3; b++) pushMesh(golds, new THREE.BoxGeometry(w * 1.04, .22, w * 1.04), x, base + h * b / 3.2, zz);
    pushMesh(walls, new THREE.BoxGeometry(w, h, w), x, base + h / 2, zz);
    pushMesh(walls, new THREE.BoxGeometry(w * .7, h * .35, w * .7), x, base + h + h * .175, zz);
    const top = base + h * 1.35;
    if (style === 'lanka' || r() < .5) { pushMesh(golds, shikhara(w * .38, w * (style === 'lanka' ? 2.2 : 1.6)), x, top, zz); }
    else { pushMesh(style === 'mithila' ? accents : walls, dome(w * .36), x, top, zz); pushMesh(golds, new THREE.ConeGeometry(.2, .9, 6), x, top + w * .36 + .4, zz); }
    for (const sx of [-1, 1]) { pushMesh(golds, dome(w * .12), x + sx * w * .4, base + h + .02, zz + w * .4); }
    // windows
    for (let k = 0; k < Math.floor(h / 2.2); k++) for (let j = -1; j <= 1; j++) if (r() < .55) { const ws = 1 + Math.abs(zz) / 45; pushMesh(wins, new THREE.PlaneGeometry(.35 * ws, .7 * ws), x + j * w * .25, base + 1.2 + k * 2.2, zz + w / 2 + .02); }
  }
  // fortification wall
  const wallL = spread * 2.4;
  pushMesh(walls, new THREE.BoxGeometry(wallL, 3, 1.2), 0, 1.5 + hill * .2, z + 4);
  for (let x = -wallL / 2; x < wallL / 2; x += 2.2) pushMesh(walls, new THREE.BoxGeometry(1, .9, 1.25), x, 3.4 + hill * .2, z + 4);
  const add = (list, mat) => { if (!list.length) return; const mm = new THREE.Mesh(mergeGeometries(list.map(q => { q.deleteAttribute?.('uv'); return q; })), mat); mm.castShadow = true; mm.receiveShadow = true; g.add(mm); };
  add(walls, wallMat); add(golds, glowGold ? M.goldLit : m.gold); add(accents, m.redstone);
  add(wins, night || style === 'lanka' ? m.windowLit : m.windowDark);
  if (night || style === 'lanka') {
    const l = new THREE.PointLight('#ffb050', 120, 160, 1.1); l.position.set(0, 14 + hill, z - 6); g.add(l);
    for (let i = 0; i < 5; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.soft, color: C('#ffa040').multiplyScalar(.55), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); sp.position.set((i - 2) * spread * .45, 8 + hill, z - 20); sp.scale.setScalar(spread * .9); g.add(sp); }
  }
  // flags
  const fr = rnd(99); const flagGeo = new THREE.PlaneGeometry(1.4, .8, 8, 1); flagGeo.translate(.7, 0, 0);
  const flagMat = new THREE.MeshStandardMaterial({ color: '#f07a1a', side: THREE.DoubleSide, roughness: .8 });
  flagMat.onBeforeCompile = sh => { sh.uniforms.uTime = WIND; sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed.z += sin(uTime * 6. + position.x * 4.) * .15 * position.x;'); };
  for (let i = 0; i < 10; i++) { const f = new THREE.Mesh(flagGeo, flagMat); f.position.set((fr() * 2 - 1) * spread * .8, 10 + fr() * 10 + hill * .5, z - fr() * 30); g.add(f); const pole = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 2), m.wood); pole.position.copy(f.position).y -= .6; g.add(pole); }
}
// painted textures for halls: a sunlit garden seen through an arch, and carved stone panels
const _ht = {};
function archView(golden, dark) {
  const k = `a${golden}${dark}`; if (_ht[k]) return _ht[k];
  const c = document.createElement('canvas'); c.width = 128; c.height = 256; const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 0, 256);
  if (dark) { gr.addColorStop(0, '#0a0d1e'); gr.addColorStop(.6, '#141a32'); gr.addColorStop(1, '#05060c'); }
  else { gr.addColorStop(0, '#fff6dc'); gr.addColorStop(.35, golden ? '#ffd58a' : '#ffe2b0'); gr.addColorStop(.62, '#c9c08a'); gr.addColorStop(.78, '#6f8a4a'); gr.addColorStop(1, '#2f4426'); }
  x.fillStyle = gr; x.fillRect(0, 0, 128, 256);
  // distant trees and a temple spire, softly out of focus
  x.filter = 'blur(3px)'; x.fillStyle = dark ? 'rgba(0,0,0,.6)' : 'rgba(40,70,30,.75)';
  for (let i = 0; i < 9; i++) { x.beginPath(); x.ellipse(i * 16 + Math.sin(i * 7) * 6, 170 + Math.sin(i * 3) * 10, 14, 26, 0, 0, 7); x.fill(); }
  x.fillStyle = dark ? 'rgba(20,20,40,.7)' : 'rgba(150,110,60,.55)'; x.beginPath(); x.moveTo(78, 175); x.lineTo(90, 110); x.lineTo(102, 175); x.fill();
  x.filter = 'none';
  if (dark) { x.fillStyle = 'rgba(230,236,255,.9)'; x.beginPath(); x.arc(40, 50, 9, 0, 7); x.fill(); }
  const t = _ht[k] = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function carvedWall(base) {
  if (_ht[base]) return _ht[base];
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, 256, 256);
  const shade = (a) => `rgba(0,0,0,${a})`, lite = (a) => `rgba(255,220,160,${a})`;
  // panel frame, a lotus medallion, a frieze of small arches
  x.strokeStyle = shade(.45); x.lineWidth = 6; x.strokeRect(14, 14, 228, 228); x.strokeStyle = lite(.18); x.lineWidth = 2; x.strokeRect(20, 20, 216, 216);
  x.save(); x.translate(128, 120);
  for (let i = 0; i < 16; i++) { x.rotate(Math.PI / 8); x.fillStyle = i % 2 ? shade(.25) : lite(.14); x.beginPath(); x.ellipse(0, -42, 11, 30, 0, 0, 7); x.fill(); }
  x.fillStyle = lite(.22); x.beginPath(); x.arc(0, 0, 16, 0, 7); x.fill(); x.restore();
  for (let i = 0; i < 8; i++) { x.strokeStyle = shade(.35); x.lineWidth = 3; x.beginPath(); x.arc(30 + i * 28, 228, 11, Math.PI, 0); x.stroke(); }
  for (let i = 0; i < 2600; i++) { x.fillStyle = Math.random() < .5 ? shade(.05) : lite(.04); x.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); }
  const t = _ht[base] = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function hall(g, env, { golden = false, dark = false, throne = false }) {
  const m = mats();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ map: groundTex(golden ? 'gold' : 'marble'), roughness: golden ? .25 : .18, metalness: golden ? .5 : 0, color: dark ? '#4a3a30' : '#ffffff' }));
  floor.material.map.repeat.set(10, 10); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);
  const wallMat = new THREE.MeshStandardMaterial({ map: carvedWall(dark ? '#2a1c16' : golden ? '#8a5a26' : '#9a6440'), roughness: .75 });
  wallMat.map.repeat.set(10, 3);
  const back = new THREE.Mesh(new THREE.BoxGeometry(60, 18, 1), wallMat); back.position.set(0, 9, -14); g.add(back);
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(60, 1, 40), wallMat); ceil.position.set(0, 12, -2); g.add(ceil);
  // arches on the back wall
  for (let i = -3; i <= 3; i++) {
    const s = new THREE.Shape(); s.moveTo(-1.6, 0); s.lineTo(-1.6, 4); s.quadraticCurveTo(0, 6.6, 1.6, 4); s.lineTo(1.6, 0); s.lineTo(-1.6, 0);
    const ag = new THREE.ShapeGeometry(s); { const P = ag.attributes.position, U = ag.attributes.uv; for (let v = 0; v < P.count; v++) U.setXY(v, (P.getX(v) + 1.6) / 3.2, P.getY(v) / 5.3); }
    const a = new THREE.Mesh(ag, new THREE.MeshBasicMaterial({ map: archView(golden, dark || env.time === 'night'), color: C('#ffffff').multiplyScalar(dark ? .6 : 1.25) }));
    a.position.set(i * 5, 0, -13.4); g.add(a);
    // carved gold frame around the arch
    const fr = new THREE.CurvePath(); fr.add(new THREE.LineCurve3(new THREE.Vector3(-1.6, 0, 0), new THREE.Vector3(-1.6, 4, 0))); fr.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-1.6, 4, 0), new THREE.Vector3(0, 6.6, 0), new THREE.Vector3(1.6, 4, 0))); fr.add(new THREE.LineCurve3(new THREE.Vector3(1.6, 4, 0), new THREE.Vector3(1.6, 0, 0)));
    const frame = new THREE.Mesh(new THREE.TubeGeometry(fr, 48, .16, 8), golden ? m.gold : m.goldDark); frame.position.set(i * 5, 0, -13.3); g.add(frame);
    if (!dark) { const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.6, 2.4, 14, 16, 1, true), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { c: { value: C(golden ? '#ffc870' : '#ffd8a0') } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }', fragmentShader: 'uniform vec3 c; varying vec2 vUv; void main(){ gl_FragColor = vec4(c, .07 * vUv.y); }' })); shaft.position.set(i * 5, 6, -9); shaft.rotation.x = -.5; g.add(shaft); }
  }
  // pillars (lathe profile with gold capitals)
  const prof = [[.55, 0], [.55, .4], [.42, .5], [.38, 1], [.34, 5.5], [.42, 6], [.6, 6.4], [.7, 6.8], [.7, 7]].map(([x, y]) => new THREE.Vector2(x, y));
  const pGeo = new THREE.LatheGeometry(prof, 16); const pMat = golden ? m.gold : new THREE.MeshStandardMaterial({ color: dark ? '#3a2a24' : '#d8c4a8', roughness: .5 });
  for (const z of [-10, -4, 2]) for (const x of [-9, -5.5, 5.5, 9]) { const p = new THREE.Mesh(pGeo, pMat); p.position.set(x, 0, z); p.scale.y = 1.6; p.castShadow = true; p.receiveShadow = true; g.add(p); }
  // carpet
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 40), new THREE.MeshStandardMaterial({ color: dark ? '#3a0a0a' : '#8a1018', roughness: .9 }));
  carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, .01, -2); carpet.receiveShadow = true; g.add(carpet);
  // the royal court: a stepped dais and the lion throne under a canopy, at the far end of the carpet
  if (throne) {
    for (let k = 0; k < 3; k++) { const st = new THREE.Mesh(new THREE.BoxGeometry(7 - k * 1.6, .28, 3 - k * .6), k === 2 ? m.gold : new THREE.MeshStandardMaterial({ map: groundTex('marble'), color: '#b8a080', roughness: .3 })); st.position.set(0, .14 + k * .28, -11.5); st.receiveShadow = st.castShadow = true; g.add(st); }
    const th = buildProp('throne'); th.position.set(0, .84, -11.8); th.scale.setScalar(1.25); g.add(th);
    const can = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, .3, 24), m.gold); can.position.set(0, 6.4, -11.6); g.add(can);
    for (const sx of [-1.9, 1.9]) { const po = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, 5.6, 10), m.gold); po.position.set(sx, 3.6, -11); g.add(po); }
    const sil = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#8a1018', roughness: .7, side: THREE.DoubleSide })); sil.position.set(0, 7, -11.6); g.add(sil);
  }
  // lamps
  const lamps = [];
  const spots = dark ? [[-3.5, 1, -1]] : [[-7, 7, -6], [7, 7, -6], [-7, 7, 0], [7, 7, 0], [0, 8.5, -10]];
  for (const [x, y, z] of spots) {
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(.25, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), m.gold); bowl.position.set(x, y, z); g.add(bowl);
    if (y > 2) { const chain = new THREE.Mesh(new THREE.CylinderGeometry(.01, .01, 12 - y), m.gold); chain.position.set(x, y + (12 - y) / 2, z); g.add(chain); }
    const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.flare, color: C('#ffb050').multiplyScalar(2.5), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); flame.scale.setScalar(.9); flame.position.set(x, y + .2, z); g.add(flame);
    const l = new THREE.PointLight('#ffa040', dark ? 14 : 10, dark ? 12 : 16, 1.6); l.position.set(x, y + .3, z); g.add(l); lamps.push({ l, flame, base: l.intensity });
  }
  env.onUpdate.push((dt, t) => lamps.forEach((o, i) => { const f = .85 + Math.sin(t * 13 + i) * .07 + Math.random() * .08; o.l.intensity = o.base * f; o.flame.scale.setScalar(.8 + f * .2); }));
}
function hutMesh() {
  const m = mats(), h = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 1.8, 14), M.wood); wall.position.y = .9; h.add(wall);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2, 14), m.thatch); roof.position.y = 2.7; h.add(roof);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(.7, 1.2), new THREE.MeshBasicMaterial({ color: '#120a04' })); door.position.set(0, .6, 1.68); h.add(door);
  h.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); return h;
}
function clouds(g, { y = -1, count = 70, color = '#fff0d8', spread = 60, size = [8, 18], seed = 3, z = [-80, 6] }) {
  const r = rnd(seed), list = [];
  for (let i = 0; i < count; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.smoke, color: C(color).multiplyScalar(.9 + r() * .3), transparent: true, depthWrite: false, opacity: .9 }));
    const sc = size[0] + r() * (size[1] - size[0]); s.scale.set(sc * 1.6, sc, 1); s.position.set((r() * 2 - 1) * spread, y + r() * 2.5, z[0] + r() * (z[1] - z[0])); g.add(s); list.push(s);
  }
  return list;
}
/* ── armies of real warriors: instanced billboards cut from the 3D art ── */
const atlasCache = new Map();
function atlas(ids) {
  const key = ids.join(','); if (atlasCache.has(key)) return atlasCache.get(key);
  const frames = [];
  ids.forEach(id => { const v = CUTM?.[id]?.views; if (v) ['front', 'left', 'right'].forEach(k => { if (v[k]) frames.push({ src: v[k].src, face: v[k].face || (k === 'right' ? 'R' : k === 'left' ? 'L' : 'F') }); }); });
  const p = !frames.length ? Promise.resolve(null) : Promise.all(frames.map(f => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = f.src; }))).then(imgs => {
    const CW = 160, CH = 320, cols = Math.min(8, frames.length), rows = Math.ceil(frames.length / cols);
    const c = document.createElement('canvas'); c.width = cols * CW; c.height = rows * CH; const x = c.getContext('2d');
    const cells = [];
    imgs.forEach((im, i) => { if (!im) return; const col = i % cols, row = (i / cols) | 0, k = Math.min(CW / im.width, CH / im.height), w = im.width * k, h = im.height * k; x.drawImage(im, col * CW + (CW - w) / 2, row * CH + (CH - h), w, h); cells.push({ u: col / cols, v: 1 - (row + 1) / rows, du: 1 / cols, dv: 1 / rows, face: frames[i].face }); });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return { tex: t, cells, aspect: CW / CH };
  });
  atlasCache.set(key, p); return p;
}
function spriteArmy(g, env, { ids, side = -1, count = 900, x0 = 4, x1 = 42, z0 = -9, z1 = -60, scale = 2.05, tint = '#ffffff', surge = .35 }) {
  atlas(ids).then(A => {
    if (!A || !g.parent) return;
    const geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, .5, 0);
    const n = QUALITY.low ? Math.round(count * .4) : count, r = rnd(side > 0 ? 77 : 78);
    const fr = new Float32Array(n * 4), seed = new Float32Array(n), mir = new Float32Array(n);
    const im = new THREE.InstancedMesh(geo, null, n), d = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const cell = A.cells[(r() * A.cells.length) | 0];
      fr.set([cell.u, cell.v, cell.du, cell.dv], i * 4); seed[i] = r();
      // face the enemy: side -1 stands on the left and must face right
      const want = side < 0 ? 'R' : 'L'; mir[i] = cell.face === 'F' ? (r() < .5 ? 1 : 0) : (cell.face === want ? 0 : 1);
      const z = z0 + (z1 - z0) * Math.pow(r(), .8), spread = x1 - x0, x = side * (x0 + spread * r() * (.6 + .4 * (z - z0) / (z1 - z0)));
      d.position.set(x, 0, z); d.scale.setScalar(scale * (.88 + r() * .24)); d.updateMatrix(); im.setMatrixAt(i, d.matrix);
    }
    geo.setAttribute('aFrame', new THREE.InstancedBufferAttribute(fr, 4)); geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 1)); geo.setAttribute('aMir', new THREE.InstancedBufferAttribute(mir, 1));
    const light = C(env.T.sun).multiplyScalar(.35).add(C(env.T.hs).multiplyScalar(.55)); const mx = Math.max(light.r, light.g, light.b); light.multiplyScalar(1 / mx).multiplyScalar(.82).multiply(C(tint));
    im.material = new THREE.ShaderMaterial({ fog: true, transparent: false, side: THREE.DoubleSide,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { map: { value: A.tex }, time: { value: 0 }, side: { value: side }, surge: { value: surge }, aspect: { value: A.aspect }, light: { value: light } }]),
      vertexShader: `attribute vec4 aFrame; attribute float aSeed, aMir; uniform float time, side, surge, aspect; varying vec2 vUv; varying float vShade;
        #include <fog_pars_vertex>
        void main(){
          vec3 c = (modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.)).xyz; float s = length((instanceMatrix * vec4(0., 1., 0., 0.)).xyz);
          float ph = time * (1.6 + aSeed) + aSeed * 40.;
          c.x += -side * (sin(ph * .35) * .5 + .5) * surge * 2.2; c.y += abs(sin(ph * 2.2)) * .07 * s / 2.;
          vec3 right = normalize(vec3(viewMatrix[0][0], 0., viewMatrix[2][0]));
          float lean = sin(ph * .7) * .05;
          vec3 p = c + right * (position.x + position.y * lean) * s * aspect + vec3(0., 1., 0.) * position.y * s;
          vec4 mvPosition = viewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mvPosition;
          vUv = aFrame.xy + vec2(aMir > .5 ? 1. - uv.x : uv.x, uv.y) * aFrame.zw; vShade = .82 + aSeed * .3;
          #include <fog_vertex>
        }`,
      fragmentShader: `uniform sampler2D map; uniform vec3 light; varying vec2 vUv; varying float vShade;
        #include <fog_pars_fragment>
        void main(){ vec4 c = texture2D(map, vUv); if (c.a < .5) discard; gl_FragColor = vec4(c.rgb * light * vShade, 1.);
          #include <fog_fragment>
        }` });
    im.frustumCulled = false; g.add(im);
    env.onUpdate.push((dt, t) => { im.material.uniforms.time.value = t; });
  });
}
const VANARA_IDS = ['nala', 'nila', 'sushena', 'angada', 'sugriva', 'jambavan'];
const RAKSHASA_IDS = ['khara', 'dushana', 'subahu', 'prahasta'];
function armies(g, env) {
  if (CUTM && VANARA_IDS.some(i => CUTM[i])) {
    spriteArmy(g, env, { ids: VANARA_IDS, side: -1, count: 1100 });
    spriteArmy(g, env, { ids: RAKSHASA_IDS, side: 1, count: 1100, scale: 2.25 });
    return;
  }
  legacyArmies(g, env);
}
function legacyArmies(g, env) {
  const strip = (geo) => { const q = ni(geo); ['uv'].forEach(k => q.deleteAttribute(k)); return q; };
  const vanara = mergeGeometries([new THREE.CapsuleGeometry(.24, .55, 3, 8).translate(0, .62, 0), new THREE.SphereGeometry(.2, 10, 8).translate(.04, 1.2, 0), new THREE.TorusGeometry(.35, .04, 5, 10, Math.PI * 1.2).rotateY(Math.PI / 2).translate(-.25, .8, 0), new THREE.DodecahedronGeometry(.16).translate(.3, 1.5, 0)].map(strip));
  const raksha = mergeGeometries([new THREE.CapsuleGeometry(.28, .7, 3, 8).translate(0, .72, 0), new THREE.SphereGeometry(.21, 10, 8).translate(0, 1.42, 0), new THREE.ConeGeometry(.05, .26, 6).rotateZ(-.4).translate(.12, 1.66, 0), new THREE.ConeGeometry(.05, .26, 6).rotateZ(.4).translate(-.12, 1.66, 0), new THREE.CylinderGeometry(.025, .025, 2.6).translate(.36, 1.2, 0), new THREE.ConeGeometry(.07, .3, 6).translate(.36, 2.6, 0)].map(strip));
  const list = [];
  const make = (geo, n, side, cols) => {
    const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: .75, metalness: side > 0 ? .3 : 0 }), n), d = new THREE.Object3D(), r = rnd(side > 0 ? 3 : 4), data = [];
    for (let i = 0; i < n; i++) { const p = { x: side * (5 + r() * 42), z: -18 - r() * 44, s: .85 + r() * .4, ph: r() * 6.28 }; data.push(p); d.position.set(p.x, 0, p.z); d.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; d.scale.setScalar(p.s); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, C(cols[(r() * cols.length) | 0])); }
    im.castShadow = true; g.add(im); list.push({ im, data, side });
  };
  make(vanara, 700, -1, ['#c8913a', '#a8742a', '#d6a24a', '#7a5432', '#3a3036']); make(raksha, 700, 1, ['#4a1a1a', '#3a1424', '#5a2a1a', '#2a1418']);
  // the hosts surge and clash in place
  const d = new THREE.Object3D();
  env.onUpdate.push((dt, t) => { for (const L of list) { L.data.forEach((p, i) => { if (i % 3) return; d.position.set(p.x + Math.sin(t * 2 + p.ph) * .25 * -L.side, Math.abs(Math.sin(t * 6 + p.ph)) * .12, p.z); d.rotation.y = L.side > 0 ? -Math.PI / 2 : Math.PI / 2; d.scale.setScalar(p.s); d.updateMatrix(); L.im.setMatrixAt(i, d.matrix); }); L.im.instanceMatrix.needsUpdate = true; } });
}

/* ───────── environment catalogue ───────── */
const ENV = {
  ayodhya: { time: 'day', sound: 'city', fx: { motes: 1 }, build(g, e) { ground(g, 'sand'); ridge(g, { z: -220, height: 50, color: '#8a9ab8', seed: 4 }); city(g, 'ayodhya', e, { z: -32 }); forest(g, { count: 34, types: ['palm', 'round'], zMin: -60, zMax: -36, xSpan: 80, clear: 16 }); } },
  palace: { time: 'day', sound: 'palace', interior: true, fx: { motes: 1 }, build(g, e) { hall(g, e, {}); } },
  court: { time: 'day', sound: 'palace', interior: true, fx: { motes: 1 }, build(g, e) { hall(g, e, { golden: true, throne: true }); } },
  chamber: { time: 'night', sound: 'night-in', interior: true, fx: {}, build(g, e) { hall(g, e, { dark: true }); } },
  'lanka-court': { time: 'night', sound: 'palace', interior: true, fx: { embers: .3 }, build(g, e) { hall(g, e, { golden: true, throne: true }); const l = new THREE.PointLight('#ff4a2a', 30, 30, 1.4); l.position.set(0, 4, -8); g.add(l); } },
  mithila: { time: 'day', sound: 'city', fx: { motes: 1 }, build(g, e) { ground(g, 'sand'); ridge(g, { z: -220, height: 30, color: '#9aa4b8', seed: 8 }); city(g, 'mithila', e, { z: -30 }); forest(g, { count: 26, types: ['round', 'palm'], zMin: -26, zMax: -12 }); } },
  yajna: { time: 'dawn', sound: 'yajna', fx: { smoke: .6, motes: 1 }, build(g, e) { ground(g, 'earth'); ridge(g, { z: -200, height: 45, color: '#6a7488', seed: 9 }); forest(g, { count: 70, zMin: -50, zMax: -12 }); grass(g, { color: '#5a6a30', count: 2500 }); } },
  river: { time: 'day', sound: 'river', fx: { motes: 1 }, build(g, e) { ground(g, 'grass'); water(g, e, { z0: -5, z1: -40, color: '#1a5070' }); ridge(g, { z: -160, height: 40, color: '#6a8aa0', seed: 6 }); forest(g, { count: 70, zMin: -80, zMax: -42, xSpan: 90 }); grass(g, { color: '#4a6a2a', count: 3000, zMin: -4 }); } },
  ganga: { time: 'dawn', sound: 'river', fx: { mist: 1 }, build(g, e) { ground(g, 'sand'); water(g, e, { z0: -3, z1: -260, color: '#3a5a6a', distortion: 2 }); forest(g, { count: 50, types: ['palm', 'round'], zMin: -120, zMax: -90, xSpan: 140, scale: [1.5, 2.5] }); } },
  forest: { time: 'day', sound: 'forest', fx: { motes: 1 }, build(g, e) { ground(g, 'grass'); ridge(g, { z: -200, height: 60, color: '#6a8a9a', seed: 2 }); forest(g, { count: 160, zMin: -70, zMax: -6 }); grass(g, { color: '#4a6a2a' }); } },
  dandaka: { time: 'dusk', sound: 'forest-night', fx: { mist: 1, fireflies: 1 }, build(g, e) { ground(g, 'earth'); forest(g, { count: 170, types: ['sal', 'round', 'sal'], zMin: -60, zMax: -9, clear: 8, tint: '#a8b898', scale: [1.4, 2.4] }); grass(g, { color: '#5e7032' }); } },
  ashram: { time: 'dawn', sound: 'forest', fx: { smoke: .4, motes: 1 }, build(g, e) { ground(g, 'earth'); ridge(g, { z: -200, height: 55, color: '#7a8aa0', seed: 31 }); forest(g, { count: 90, zMin: -60, zMax: -10 }); grass(g, { color: '#5a6a30', count: 3000 }); const h = hutMesh(); h.position.set(7, 0, -6); h.rotation.y = -.5; g.add(h); const h2 = hutMesh(); h2.position.set(-9, 0, -10); g.add(h2); } },
  chitrakoot: { time: 'day', sound: 'river', fx: { motes: 1 }, build(g, e) { ground(g, 'grass'); water(g, e, { z0: -7, z1: -26, color: '#2a5a5a' }); ridge(g, { z: -70, height: 40, color: '#4a6a4a', seed: 41, rough: 2 }); ridge(g, { z: -160, height: 70, color: '#6a7a8a', seed: 42 }); forest(g, { count: 70, zMin: -60, zMax: -28 }); grass(g, { color: '#4a6a2a', count: 3000, zMin: -6 }); const h = hutMesh(); h.position.set(-7, 0, -3); g.add(h); } },
  panchavati: { time: 'day', sound: 'forest', fx: { motes: 1 }, build(g, e) { ground(g, 'grass'); water(g, e, { z0: -9, z1: -22, color: '#2a5a6a' }); ridge(g, { z: -170, height: 60, color: '#6a8a8a', seed: 51 }); forest(g, { count: 90, types: ['round', 'palm'], zMin: -70, zMax: -24 }); forest(g, { count: 14, types: ['round'], zMin: -8, zMax: -4, clear: 8, seed: 52 }); grass(g, { color: '#4a6a2a', zMin: -8 }); const h = hutMesh(); h.position.set(8, 0, -5); h.rotation.y = -.6; g.add(h); } },
  pampa: { time: 'day', sound: 'river', fx: { motes: 1 }, build(g, e) { ground(g, 'rock'); water(g, e, { z0: -5, z1: -40, color: '#2a5a6a' }); rocks(g, { count: 60, zMin: -90, zMax: -40, xSpan: 90, size: [3, 9], piles: true }); const lp = new THREE.InstancedMesh(new THREE.CircleGeometry(.45, 12), new THREE.MeshStandardMaterial({ color: '#2a6a3a' }), 70), d = new THREE.Object3D(), r = rnd(5); for (let i = 0; i < 70; i++) { d.position.set((r() * 2 - 1) * 24, .06, -6 - r() * 30); d.rotation.set(-Math.PI / 2, 0, r() * 6); d.updateMatrix(); lp.setMatrixAt(i, d.matrix); } g.add(lp); const fl = []; for (let i = 0; i < 40; i++) fl.push((r() * 2 - 1) * 24, .2, -6 - r() * 30); const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(fl, 3)); g.add(new THREE.Points(fg, new THREE.PointsMaterial({ color: '#ff8ab8', size: .35, map: TEX.soft, transparent: true, depthWrite: false }))); } },
  rocks: { time: 'day', sound: 'wind', fx: { motes: 1 }, build(g, e) { ground(g, 'rock'); ridge(g, { z: -200, height: 70, color: '#9a8a7a', seed: 71, rough: 1.5 }); rocks(g, { count: 90, size: [1.5, 6], piles: true }); grass(g, { color: '#7a7a3a', count: 1500 }); } },
  kishkindha: { time: 'day', sound: 'wind', fx: { motes: 1 }, build(g, e) { ENV.rocks.build(g, e); const gate = new THREE.Mesh(new THREE.TorusGeometry(4, .7, 10, 24, Math.PI), mats().gold); gate.position.set(0, 0, -22); g.add(gate); const glow = new THREE.Mesh(new THREE.CircleGeometry(3.6, 24, 0, Math.PI), new THREE.MeshBasicMaterial({ color: C('#ffb860').multiplyScalar(1.6) })); glow.position.set(0, 0, -22.3); g.add(glow); } },
  cave: { time: 'night', sound: 'cave', fx: { mist: .5, motes: 1 }, build(g, e) { ground(g, 'cave'); const geo = blob(30, 1.4, .5, 1.2, 0, 0, -10, 13); const dome2 = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#3a2c22', roughness: 1, side: THREE.BackSide, flatShading: true })); g.add(dome2); rocks(g, { count: 40, color: '#4a3a2c', size: [1, 3] }); const cr = new THREE.InstancedMesh(new THREE.OctahedronGeometry(.4), new THREE.MeshBasicMaterial({ color: C('#ffc870').multiplyScalar(1.8) }), 30), d = new THREE.Object3D(), r = rnd(4); for (let i = 0; i < 30; i++) { d.position.set((r() * 2 - 1) * 16, r() * 3, -8 - r() * 20); d.scale.set(1, 2 + r() * 2, 1); d.rotation.z = (r() - .5) * .6; d.updateMatrix(); cr.setMatrixAt(i, d.matrix); } g.add(cr); const l = new THREE.PointLight('#ffb050', 40, 40, 1.4); l.position.set(0, 5, -10); g.add(l); } },
  shore: { time: 'day', sound: 'ocean', fx: {}, build(g, e) { ground(g, 'sand', 120, 30); water(g, e, { z0: -6, z1: -500, color: '#1a5a7a', distortion: 4 }); forest(g, { count: 16, types: ['palm'], zMin: -2, zMax: 6, xSpan: 24, clear: 9 }); } },
  'shore-army': { time: 'day', sound: 'ocean', fx: { dust: .4 }, build(g, e) { ground(g, 'sand', 160, 30); water(g, e, { z0: -40, z1: -500, color: '#1a5a7a', distortion: 4 }); if (CUTM) spriteArmy(g, e, { ids: VANARA_IDS, side: -1, count: 1300, x0: -30, x1: 30, z0: -8, z1: -38, surge: .05 }); forest(g, { count: 10, types: ['palm'], zMin: -2, zMax: 6, xSpan: 26, clear: 11 }); } },
  ocean: { time: 'day', sound: 'ocean', fx: {}, camY: 4, build(g, e) { water(g, e, { z0: 60, z1: -600, color: '#12486a', distortion: 4.5 }); clouds(g, { y: 30, count: 30, color: '#ffffff', spread: 200, size: [30, 60], z: [-300, -60] }); } },
  setu: { time: 'day', sound: 'ocean', fx: {}, camY: 3, build(g, e) { water(g, e, { z0: 60, z1: -600, color: '#12486a', distortion: 4 }); const st = new THREE.InstancedMesh(blob(1, 1, .5, 1, 0, 0, 0, 5), mats().stone, 600), d = new THREE.Object3D(), r = rnd(9); for (let i = 0; i < 600; i++) { const k = i / 600; d.position.set(Math.sin(k * 3) * 4 + (r() - .5) * 4, .1 + r() * .3, 8 - k * 420); d.scale.set(1 + r(), .6 + r() * .4, 1 + r()); d.rotation.y = r() * 6; d.updateMatrix(); st.setMatrixAt(i, d.matrix); } st.receiveShadow = true; g.add(st); } },
  sky: { time: 'day', sound: 'wind', fx: {}, camY: 2, noGround: true, build(g, e) { clouds(g, { y: -4, count: 90, color: '#ffffff', spread: 90, size: [10, 24], z: [-150, 10] }); } },
  lanka: { time: 'night', sound: 'city-night', fx: { embers: .3 }, build(g, e) { ground(g, 'rock'); ridge(g, { z: -110, height: 30, color: '#2a221e', seed: 111, rough: .8 }); city(g, 'lanka', e, { z: -112, spread: 60, count: 34, hill: 26 }); rocks(g, { count: 30, color: '#3a3028', size: [1, 3] }); } },
  'lanka-street': { time: 'night', sound: 'city-night', fx: { embers: .4 }, build(g, e) { ground(g, 'gold', 120, 30); city(g, 'lanka', e, { z: -14, spread: 40, count: 30 }); } },
  ashoka: { time: 'night', sound: 'night', fx: { fireflies: 1, mist: .5 }, build(g, e) { ground(g, 'grass'); city(g, 'lanka', e, { z: -110, spread: 70, count: 24, hill: 14 }); forest(g, { count: 80, types: ['ashoka'], zMin: -60, zMax: -6, clear: 8, tint: '#9aa88a' }); const big = treeObject('round', '#c8d4b8'); big.position.set(4, 0, -9); big.scale.setScalar(2.6); g.add(big); grass(g, { color: '#2a3a1a' }); } },
  // the battlefield of the reference film (a plate): its light and the sounds and air of battle
  field: { time: 'gold', sound: 'battle', fx: { embers: 1, dust: 1, smoke: 1 }, build(g, e) { ENV.battle.build(g, e); } },
  battle: { time: 'war', sound: 'battle', fx: { embers: 1, dust: 1, smoke: 1 }, build(g, e) { ground(g, 'battle'); ridge(g, { z: -150, height: 34, color: '#3a2018', seed: 133, rough: .7 }); city(g, 'lanka', e, { z: -150, spread: 60, count: 30, hill: 26 }); armies(g, e); const r = rnd(4); for (let i = 0; i < 8; i++) e.fires.push([(r() * 2 - 1) * 26, -14 - r() * 30, 1 + r() * 1.5]); } },
  himalaya: { time: 'night', sound: 'wind', fx: { snow: 1 }, build(g, e) { ground(g, 'snow'); ridge(g, { z: -60, height: 30, color: '#8a9ab8', seed: 141, snow: .6, rough: 2 }); ridge(g, { z: -180, height: 110, color: '#6a7a9a', seed: 142, snow: .5, rough: 1.3 }); forest(g, { count: 60, types: ['pine'], zMin: -50, zMax: -8, tint: '#c8d8e8' }); } },
  kailasa: { time: 'dusk', sound: 'wind', fx: { snow: .5, divine: 1 }, build(g, e) { ground(g, 'snow'); const peak = new THREE.Mesh(new THREE.ConeGeometry(60, 110, 4, 6), new THREE.MeshStandardMaterial({ color: '#e8eef8', roughness: .7, flatShading: true })); peak.position.set(0, 50, -170); peak.rotation.y = .6; g.add(peak); ridge(g, { z: -90, height: 30, color: '#8a9ab8', seed: 151, snow: .5 }); const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.soft, color: C('#bfe0ff').multiplyScalar(.8), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); halo.position.set(0, 100, -175); halo.scale.setScalar(160); g.add(halo); } },
  heaven: { time: 'gold', sound: 'divine', fx: { divine: 1, petals: .3, motes: 1 }, noGround: true, build(g, e) { clouds(g, { y: -1.5, count: 110, color: '#ffe6c0', spread: 70, size: [6, 16], z: [-120, 8] }); const tor = new THREE.Group(); const m = mats(); for (const x of [-9, 9]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.6, .7, 16, 12), m.gold); p.position.set(x, 6, -40); tor.add(p); } const beam = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 1.2), m.gold); beam.position.set(0, 14, -40); tor.add(beam); g.add(tor); } },
  cosmic: { time: 'cosmic', sound: 'divine', fx: { motes: 1 }, build(g, e) { water(g, e, { z0: 40, z1: -600, color: '#d8d0e8', distortion: 1.5 }); // a soft aureole behind the Lord: kept small so it glows around Him without washing out the whole frame
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.soft, color: C('#ffe8b0').multiplyScalar(.36), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); halo.position.set(0, 6, -20); halo.scale.setScalar(20); g.add(halo); } },
  sarayu: { time: 'dusk', sound: 'river', fx: { mist: .6 }, build(g, e) { ground(g, 'sand'); water(g, e, { z0: -4, z1: -60, color: '#4a3a4a', distortion: 2 }); city(g, 'ayodhya', e, { z: -70 }); for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(40, .25, 1), mats().sandstone); s.position.set(0, .12 - i * .25, -1.5 - i * .6); s.receiveShadow = true; g.add(s); } const dp = [], r = rnd(6); for (let i = 0; i < 60; i++) dp.push((r() * 2 - 1) * 20, .1, -6 - r() * 40); const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3)); g.add(new THREE.Points(dg, new THREE.PointsMaterial({ color: C('#ffb050').multiplyScalar(2), size: .3, map: TEX.spark, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))); } },
  naimisha: { time: 'day', sound: 'yajna', fx: { smoke: .4, motes: 1 }, build(g, e) { ENV.forest.build(g, e); const m = mats(); for (const x of [-6, -2, 2, 6]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.18, .2, 5, 8), m.wood); p.position.set(x, 2.5, -9); g.add(p); } const roof = new THREE.Mesh(new THREE.ConeGeometry(9, 2.4, 4), m.cloth); roof.position.set(0, 6.2, -9); roof.rotation.y = Math.PI / 4; g.add(roof); } }
};

export function envInfo(name) { const d = ENV[name]; return d ? { sound: d.sound, time: d.time, interior: !!d.interior, camY: d.camY || 0 } : {}; }

/* ───────── build ───────── */
export function buildEnv(name, time, { renderer, pmrem, plate, base }) {
  makeTextures(); mats();
  const def = ENV[name] || ENV.forest;
  const t = time || def.time, T = TIME[t] || TIME.day;
  const g = new THREE.Group();
  const env = { name, time: t, T, def, group: g, sunDir: new THREE.Vector3(), water: null, fires: [], onUpdate: [], amb: { ...(def.fx || {}) }, sound: def.sound, interior: !!def.interior, camY: def.camY };
  if (t === 'night' && !def.interior) env.amb.stars = 1;
  // sky
  const skyObj = def.interior || plate ? null : buildSky(g, T, env.sunDir, renderer);
  if (def.interior) env.sunDir.set(.3, .8, .5).normalize();
  // environment map for reflections (gold, water, marble)
  if (skyObj && pmrem) { const sc = new THREE.Scene(); const clone = skyObj.clone(); sc.add(clone); env.envMap = pmrem.fromScene(sc, 0, .1, 2000).texture; }
  // lights
  const hemi = new THREE.HemisphereLight(T.hs, T.hg, T.hi * (def.interior ? 1.1 : 1)); g.add(hemi);
  if (def.interior) { g.add(new THREE.AmbientLight('#ffd8a8', name === 'chamber' ? .6 : .9)); const key = new THREE.SpotLight('#ffe2b8', 60, 30, .7, .6, 1.2); key.position.set(-3, 8, 8); key.target.position.set(0, 1, 0); g.add(key, key.target); }
  const sun = new THREE.DirectionalLight(T.sun, T.sunI * (def.interior ? .7 : 1));
  sun.position.copy(env.sunDir).multiplyScalar(40); if (sun.position.y < 6) sun.position.y = 6;
  sun.castShadow = true; sun.shadow.mapSize.set(QUALITY.low ? 1024 : 2048, QUALITY.low ? 1024 : 2048); const sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 12; sc.bottom = -6; sc.near = 1; sc.far = 120; sun.shadow.bias = -.0004; sun.shadow.normalBias = .02;
  g.add(sun); g.add(sun.target);
  env.sun = sun;
  // a cool rim light from behind to separate figures from the backdrop
  const rim = new THREE.DirectionalLight(t === 'night' ? '#6a8aff' : t === 'war' ? '#ff6a3a' : '#ffe2c0', def.interior ? .6 : 1.1); rim.position.set(-6, 8, -14); g.add(rim);
  env.fog = new THREE.FogExp2(T.fog, def.interior ? T.fd * .6 : T.fd);
  env.exposure = T.exp;
  if (!def.noGround && !def.interior && name !== 'ocean' && name !== 'setu' && name !== 'cosmic') { /* ground created inside builders */ }
  // a cinematic plate replaces the modelled world (its light then drives the figures)
  if (plate) { env.plateLight = addPlate(g, env, plate, base); if (pmrem && plate.tex) env.envMap = pmrem.fromEquirectangular(plate.tex).texture; }
  else def.build(g, env);
  env.update = (dt, time2) => {
    WIND.value = time2;
    if (env.water) env.water.material.uniforms.time.value += dt * .45;
    env.onUpdate.forEach(f => f(dt, time2));
  };
  return env;
}

/* ───────── 3D props ───────── */
export function buildProp(name) {
  const m = mats(), gp = new THREE.Group(); gp.userData.name = name;
  const add = (mesh, x = 0, y = 0, z = 0) => { mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; gp.add(mesh); return mesh; };
  switch (name) {
    case 'altar': add(new THREE.Mesh(new THREE.BoxGeometry(1.6, .35, 1.6), m.sandstone), 0, .18); add(new THREE.Mesh(new THREE.BoxGeometry(1.2, .3, 1.2), m.sandstone), 0, .5); add(new THREE.Mesh(new THREE.BoxGeometry(.8, .25, .8), m.redstone), 0, .77); gp.userData.fire = new THREE.Vector3(0, .9, 0); break;
    case 'pyre': for (let i = 0; i < 6; i++) { const l = add(new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, 2.6, 6), m.wood), 0, .1 + i * .17, 0); l.rotation.z = Math.PI / 2; l.rotation.y = (i % 2 ? .5 : -.5) + (i * .12); } gp.userData.fire = new THREE.Vector3(0, 1, 0); break;
    case 'bow': {
      add(new THREE.Mesh(new THREE.BoxGeometry(4.6, .6, 1), m.wood), 0, .3); add(new THREE.Mesh(new THREE.BoxGeometry(4.7, .08, 1.05), m.gold), 0, .62);
      const half = (s) => { const c = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 1.05, 0), new THREE.Vector3(s * 1.6, 1.55, 0), new THREE.Vector3(s * 3.4, 1.1, 0)); const h = new THREE.Group(); const t = new THREE.Mesh(new THREE.TubeGeometry(c, 24, .07, 8), m.goldDark); t.castShadow = true; h.add(t); const band = new THREE.Mesh(new THREE.TorusGeometry(.09, .03, 6, 12), m.gold); band.position.set(s * 1.6, 1.42, 0); band.rotation.y = Math.PI / 2; h.add(band); gp.add(h); return h; };
      gp.userData.halves = [half(-1), half(1)];
      const str = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, 6.8, 4), new THREE.MeshBasicMaterial({ color: '#f0e6c8' })); str.rotation.z = Math.PI / 2; str.position.y = 1.1; gp.add(str); gp.userData.string = str;
      break;
    }
    case 'boat': { const pts = [[0, 0], [.9, .05], [1.3, .4], [1.4, .6]].map(([x, y]) => new THREE.Vector2(x, y)); const hull = add(new THREE.Mesh(new THREE.LatheGeometry(pts, 16, 0, Math.PI), m.wood), 0, 0); hull.scale.set(1, 1, 3); hull.rotation.x = Math.PI; hull.position.y = .6; add(new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 3), m.wood), 0, 2); const sail = add(new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2), new THREE.MeshStandardMaterial({ color: '#e8d8b0', side: THREE.DoubleSide })), .8, 2.2); sail.rotation.y = Math.PI / 2; break; }
    case 'hut': gp.add(hutMesh()); break;
    case 'throne': add(new THREE.Mesh(new THREE.BoxGeometry(1.8, .5, 1.2), m.gold), 0, .25); add(new THREE.Mesh(new THREE.BoxGeometry(1.4, .3, 1), m.cloth), 0, .62); { const s = new THREE.Shape(); s.moveTo(-.8, 0); s.lineTo(-.8, 1.6); s.quadraticCurveTo(0, 2.6, .8, 1.6); s.lineTo(.8, 0); add(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: .15, bevelEnabled: true, bevelSize: .05, bevelThickness: .05 }), m.gold), 0, .5, -.6); } break;
    case 'chariot': { add(new THREE.Mesh(new THREE.BoxGeometry(2.2, .9, 1.4), m.gold), 0, 1.1); for (const z of [-.8, .8]) { const w = add(new THREE.Mesh(new THREE.TorusGeometry(.65, .07, 8, 24), m.goldDark), -.3, .7, z); for (let i = 0; i < 6; i++) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 1.3), m.goldDark); sp.rotation.z = i / 6 * Math.PI; w.add(sp); } } add(new THREE.Mesh(new THREE.ConeGeometry(.9, 1.4, 8), m.cloth), 0, 2.6); add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 1.6), m.gold), .8, 2); break; }
    case 'pushpaka': { add(new THREE.Mesh(new THREE.CylinderGeometry(3.4, 2.6, .6, 24), m.gold), 0, 0); [[2.6, 1.4], [1.9, 1.2], [1.2, 1]].reduce((y, [r, h]) => { add(new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.05, h, 20), m.goldDark), 0, y + h / 2); return y + h; }, .3); add(new THREE.Mesh(shikhara(1, 2.4), m.gold), 0, 3.9); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(new THREE.Mesh(dome(.45), m.gold), Math.cos(a) * 2.8, .3, Math.sin(a) * 2.8); } const l = new THREE.PointLight('#ffd070', 20, 18, 1.4); l.position.y = -1; gp.add(l); gp.userData.glow = true; break; }
    case 'mountain': { add(new THREE.Mesh(blob(2.2, 1.3, 1, 1.1, 0, 1.2, 0, 61), new THREE.MeshStandardMaterial({ color: '#4a5a4a', flatShading: true, roughness: 1 }))); const pts = []; for (let i = 0; i < 40; i++) { const v = new THREE.Vector3(Math.random() - .5, Math.random() * .8 + .2, Math.random() - .5).normalize().multiplyScalar(2.6); pts.push(v.x, v.y + 1, v.z); } const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); gp.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: C('#8affa0').multiplyScalar(2), size: .4, map: TEX.spark, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }))); const l = new THREE.PointLight('#7aff9a', 18, 12, 1.4); l.position.y = 2; gp.add(l); break; }
    case 'tree': { const tr = treeObject('round'); tr.scale.setScalar(1.8); gp.add(tr); break; }
    case 'sala': for (let i = 0; i < 7; i++) { const tr = treeObject('sal'); tr.scale.setScalar(1.3); tr.position.set((i - 3) * 1.8, 0, -i * .4); gp.add(tr); } break;
    case 'sandals': for (const x of [-.18, .18]) { const s = add(new THREE.Mesh(new THREE.CapsuleGeometry(.12, .3, 4, 8), m.gold), x, .06); s.rotation.x = Math.PI / 2; s.scale.y = .4; add(new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), new THREE.MeshBasicMaterial({ color: '#ff2a3a' })), x, .14, -.15); } gp.userData.glow = true; break;
    case 'lamp': add(new THREE.Mesh(new THREE.SphereGeometry(.18, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), m.gold), 0, .2); gp.userData.fire = new THREE.Vector3(0, .26, 0); gp.userData.fireSize = .25; break;
    case 'pot': add(new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.3, .05], [.42, .3], [.3, .55], [.18, .62], [.22, .7]].map(([x, y]) => new THREE.Vector2(x, y)), 20), m.gold)); gp.userData.glow = true; break;
    case 'cradle': case 'twins': add(new THREE.Mesh(new THREE.CylinderGeometry(.9, .7, .5, 20, 1, false, 0, Math.PI), m.gold), 0, .5).rotation.z = Math.PI / 2; gp.userData.glow = true; break;
    case 'ring': { const r = add(new THREE.Mesh(new THREE.TorusGeometry(.18, .04, 12, 32), m.gold), 0, 0); add(new THREE.Mesh(new THREE.OctahedronGeometry(.07), new THREE.MeshBasicMaterial({ color: C('#4ab0ff').multiplyScalar(2) })), 0, .2); gp.userData.spin = r; gp.userData.glow = true; break; }
    case 'jewel': add(new THREE.Mesh(new THREE.OctahedronGeometry(.18), new THREE.MeshStandardMaterial({ color: '#ff2a4a', emissive: '#a0102a', emissiveIntensity: 2, metalness: .5, roughness: .1 }))); gp.userData.glow = true; gp.userData.spin = gp.children[0]; break;
    case 'gate': for (const x of [-3, 3]) add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 7, 1.2), m.sandstone), x, 3.5); add(new THREE.Mesh(new THREE.TorusGeometry(3, .5, 8, 24, Math.PI), m.gold), 0, 7); break;
    case 'bed': add(new THREE.Mesh(new THREE.BoxGeometry(3, .5, 1.6), m.cloth), 0, .5); for (const x of [-1.4, 1.4]) for (const z of [-.7, .7]) add(new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .5), m.gold), x, .25, z); break;
    case 'rock': add(new THREE.Mesh(blob(1.4, 1.2, .9, 1, 0, 1, 0, 3), m.stone)); break;
    case 'skeleton': for (let i = 0; i < 9; i++) { const b = add(new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 1.2), new THREE.MeshStandardMaterial({ color: '#e8e0cc' })), -2 + i * .5, .3, 0); b.rotation.z = .3; } add(new THREE.Mesh(new THREE.SphereGeometry(.5, 12, 8), new THREE.MeshStandardMaterial({ color: '#e8e0cc' })), 2.6, .5, 0); break;
    default: add(new THREE.Mesh(new THREE.SphereGeometry(.2, 12, 8), m.gold), 0, .2);
  }
  return gp;
}
