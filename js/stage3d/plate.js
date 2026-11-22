// Cinematic background plates (assets/backgrounds): a painted/AI-rendered setting rebuilt as a 3D
// surface from its depth map, so the stage camera can dolly and arc through it with real parallax,
// the figures stand on its ground, take its light, and cast shadows onto it.
import * as THREE from 'three';
import { BACKDROPS } from '../data/backdrops.js';

let MAN = null;
const cache = new Map();
export function plateManifest() {
  if (!MAN) MAN = fetch('assets/backgrounds/manifest.json').then(r => r.ok ? r.json() : {}).catch(() => ({}));
  return MAN;
}
const ALIAS = { 'shore-army': 'shore' };
// the plate for a setting at a time of day: an exact time plate, else the setting's main plate (graded)
export async function findPlate(env, time) {
  const m = await plateManifest(); const id = ALIAS[env] || env;
  const t0 = BACKDROPS[id]?.[0];
  if (time && m[`${id}-${time}`]) return { name: `${id}-${time}`, meta: m[`${id}-${time}`], id, time, base: time };
  if (m[id]) return { name: id, meta: m[id], id, time: time || t0, base: t0 };
  return null;
}
export function loadPlate(p) {
  if (!p) return Promise.resolve(null);
  if (!cache.has(p.name)) cache.set(p.name, Promise.all([
    new Promise(res => new THREE.TextureLoader().load(p.meta.src, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; res(t); }, undefined, () => res(null))),
    new Promise(res => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, im.width, im.height).data, f = new Float32Array(im.width * im.height); for (let i = 0; i < f.length; i++) f[i] = d[i * 4] / 255; res({ f, w: im.width, h: im.height }); }; im.onerror = () => res(null); im.src = p.meta.depth; })
  ]).then(([tex, depth]) => tex && depth ? { ...p, tex, depth } : null));
  return cache.get(p.name);
}

// colour grade between times of day, for a plate painted at another time
const G = { day: [1, 1, 1, 1], dawn: [1.03, .9, .86, .95], dusk: [1.07, .8, .62, 1], night: [.34, .42, .7, .62], war: [1.02, .74, .58, .92], gold: [1.08, .97, .74, 1.02], storm: [.6, .64, .72, .55], cosmic: [1, 1, 1, 1] };
function grade(from, to) {
  if (!from || !to || from === to) return [1, 1, 1, 1];
  const a = G[from] || G.day, b = G[to] || G.day;
  return [b[0] / a[0], b[1] / a[1], b[2] / a[2], b[3] / a[3]];
}

let shaftTex = null;
function shafts() {
  if (shaftTex) return shaftTex;
  const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 64, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 256);
  x.globalCompositeOperation = 'destination-in'; const v = x.createLinearGradient(0, 0, 0, 256); v.addColorStop(0, 'rgba(0,0,0,.9)'); v.addColorStop(.6, 'rgba(0,0,0,.35)'); v.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = v; x.fillRect(0, 0, 64, 256);
  shaftTex = new THREE.CanvasTexture(c); return shaftTex;
}

/**
 * Add the plate to an environment group.
 * base: the stage's base camera {y, z, ly}; returns light info for the figures.
 */
export function addPlate(g, env, plate, base) {
  const { tex, depth, meta } = plate;
  const air = !!BACKDROPS[plate.id]?.[2];
  const A = meta.w / meta.h, PF = 40, tanV = Math.tan(THREE.MathUtils.degToRad(PF / 2)), tanH = tanV * A;
  const cam = new THREE.PerspectiveCamera(PF, A, .1, 2000);
  cam.position.set(0, base.y, base.z); cam.lookAt(0, base.ly, 0); cam.updateMatrixWorld(true);
  const rot = new THREE.Matrix4().extractRotation(cam.matrixWorld);
  const D = (u, v) => { // bilinear depth at plate uv (v = 0 at the bottom)
    const x = Math.min(1, Math.max(0, u)) * (depth.w - 1), y = (1 - Math.min(1, Math.max(0, v))) * (depth.h - 1);
    const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(depth.w - 1, x0 + 1), y1 = Math.min(depth.h - 1, y0 + 1), fx = x - x0, fy = y - y0, f = depth.f, w = depth.w;
    return (f[y0 * w + x0] * (1 - fx) + f[y0 * w + x1] * fx) * (1 - fy) + (f[y1 * w + x0] * (1 - fx) + f[y1 * w + x1] * fx) * fy;
  };
  const dir = new THREE.Vector3();
  // calibrate relative depth to metres: the lower part of the plate is ground (y = 0) by construction
  let a = 0, b = 0;
  if (!air) {
    const xs = [], ys = [];
    for (let v = .03; v < .3; v += .025) for (let u = .12; u < .9; u += .05) {
      dir.set((2 * u - 1) * tanH, (2 * v - 1) * tanV, -1).applyMatrix4(rot);
      if (dir.y > -.01) continue;
      const Z = -base.y / dir.y; xs.push(D(u, v)); ys.push(1 / Z);
    }
    const fit = (X, Y) => { const n = X.length, mx = X.reduce((s, x) => s + x, 0) / n, my = Y.reduce((s, y) => s + y, 0) / n; let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (X[i] - mx) * (Y[i] - my); sxx += (X[i] - mx) ** 2; } const k = sxx ? sxy / sxx : 0; return [k, my - k * mx]; };
    if (xs.length > 8) {
      [a, b] = fit(xs, ys);
      const res = xs.map((x, i) => Math.abs(a * x + b - ys[i])), cut = [...res].sort((p, q) => p - q)[Math.floor(res.length * .75)];
      const keep = res.map(r => r <= cut); [a, b] = fit(xs.filter((_, i) => keep[i]), ys.filter((_, i) => keep[i]));
      // trust the fit near the camera, but the far distance must stay far (sky, mountains, the far hall)
      const dNear = [...xs].sort((p, q) => p - q)[Math.floor(xs.length * .9)];
      const invNear = Math.min(1 / 2.5, Math.max(1 / 14, a * dNear + b));
      if (!(a > 0) || b > 1 / 220 || b < 0) { b = 1 / 450; a = (invNear - b) / Math.max(.05, dNear); }
    }
  }
  if (!(a > 0)) { // fallback: nearest pixel ~5 m, farthest ~400 m (also for plates seen from the air)
    const near = air ? 1 / 40 : 1 / 5, far = 1 / 450; a = near - far; b = far;
  }
  b = Math.max(b, 1 / 1400);
  // the surface, extended well past the frame edges (the picture mirrored there, never smeared) so the camera's moves
  // never reveal its border
  const NX = 240, NY = Math.round(NX / A), U0 = -.35, U1 = 1.35, V0 = -.3, V1 = 1.2;
  const geo = new THREE.PlaneGeometry(1, 1, NX, NY), pos = geo.attributes.position, uv = geo.attributes.uv;
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const u = U0 + uv.getX(i) * (U1 - U0), v = V0 + uv.getY(i) * (V1 - V0);
    const Z = Math.min(1400, Math.max(2.2, 1 / Math.max(1e-4, a * D(u, v) + b)));
    p.set((2 * u - 1) * tanH * Z, (2 * v - 1) * tanV * Z, -Z).applyMatrix4(cam.matrixWorld);
    pos.setXYZ(i, p.x, p.y, p.z); uv.setXY(i, u, v);
  }
  geo.computeBoundingSphere();
  const gr = grade(plate.base, plate.time);
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: tex }, tint: { value: new THREE.Vector3(gr[0], gr[1], gr[2]) }, sat: { value: gr[3] }, time: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `uniform sampler2D map; uniform vec3 tint; uniform float sat, time; varying vec2 vUv;
      void main(){ vec2 m = clamp(abs(mod(vUv + 1., 2.) - 1.), vec2(.001), vec2(.999)); vec3 c = texture2D(map, m).rgb; float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat) * tint; gl_FragColor = vec4(c, 1.); }`,
    depthWrite: true, fog: false
  });
  const mesh = new THREE.Mesh(geo, mat); mesh.renderOrder = -1; mesh.frustumCulled = false; g.add(mesh);
  env.plateMesh = mesh; env.plate = plate;

  // light, measured from the plate
  const k = new THREE.Color().setRGB(...meta.key), am = new THREE.Color().setRGB(...meta.amb), hz = new THREE.Color().setRGB(...meta.haze);
  [k, am, hz].forEach(c => { c.r *= gr[0]; c.g *= gr[1]; c.b *= gr[2]; });
  const lumOf = c => c.r * .299 + c.g * .587 + c.b * .114;
  const meanL = lumOf(am);
  const fig = k.clone().lerp(am.clone().multiplyScalar(1 / Math.max(.05, meanL)), .45);
  const target = Math.min(1.06, Math.max(.7, .58 + meanL * 1.3));
  fig.multiplyScalar(target / Math.max(.05, lumOf(fig)));
  // the key light: from the bright part of the plate, behind the figures, casting soft shadows forward
  const kx = (meta.keyX - .5) * 2, ky = 1 - meta.keyY;
  env.sunDir.set(kx * .8, .35 + ky * .5, -.75).normalize();
  if (env.sun) { env.sun.color.copy(k).multiplyScalar(1 / Math.max(.2, Math.max(k.r, k.g, k.b))); env.sun.position.copy(env.sunDir).multiplyScalar(40); env.sun.position.y = Math.max(8, env.sun.position.y); }
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: plate.time === 'night' ? .22 : .32 }));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = .01; catcher.receiveShadow = true; if (!air) g.add(catcher);
  // light shafts from the plate's light source (day, dawn, dusk, gold; through haze)
  if (!air && meta.keyY < .55 && !['night', 'storm', 'cosmic'].includes(plate.time)) {
    const sm = new THREE.MeshBasicMaterial({ map: shafts(), color: k.clone().multiplyScalar(1.1), transparent: true, opacity: .1, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
    const src = new THREE.Vector3((2 * meta.keyX - 1) * tanH * 60, (2 * (1 - meta.keyY) - 1) * tanV * 60, -60).applyMatrix4(cam.matrixWorld);
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(5 + i * 2, 70), sm.clone());
      const to = new THREE.Vector3((i - 1.5) * 5, 0, -8 - i * 6);
      m.position.copy(src).lerp(to, .5); m.lookAt(cam.position); m.rotation.z = Math.atan2(src.x - to.x, src.y - to.y) * -1;
      m.userData.ph = Math.random() * 6; g.add(m);
      env.onUpdate.push((dt, t) => { m.material.opacity = (.07 + .05 * Math.sin(t * .3 + m.userData.ph)) * (i % 2 ? .8 : 1); });
    }
  }
  env.fog = new THREE.FogExp2(hz.clone().lerp(am, .3), air ? 0 : .006);
  return { light: fig, rimCol: k.clone().lerp(new THREE.Color(1, 1, 1), .35), rimSide: meta.keyX >= .5 ? 1 : -1 };
}
