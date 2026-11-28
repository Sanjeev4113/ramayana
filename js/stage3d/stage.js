// The cinematic 3D stage beside the book. Plays the same scene scripts as the 2D stage
// (grammar in js/scene.js) with real lighting, shadows, atmosphere and VFX.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { VFX, TEX, makeTextures } from './vfx.js';
import { buildEnv, buildProp, QUALITY, setCut, envInfo } from './env.js';
import { specFor } from '../puppet.js';
import { VARIANT_BY_BOOK } from '../data/cast.js';
import { EXTRA, SHADOW, LIGHT, HALO } from '../data/proxies.js';
import { CHARACTERS, MINOR_NAMES } from '../data/characters.js';
import { Director, sentences } from './director.js';
import { findPlate, loadPlate } from './plate.js';
import { trSay, trName } from '../i18n.js';
import { isAwake, onBreath, offBreath, FPS, LITE } from '../calm.js';
// the paintings in HD (2720 px, tools/hd_ill.py) on a large, sharp screen with a good connection; else the 1360 px originals
const HD = (() => { const c = navigator.connection; return !LITE && (Math.max(screen.width, innerWidth) * (devicePixelRatio || 1)) >= 1800 && !(c && (c.saveData || /2g|3g/.test(c.effectiveType || ''))); })();

const gsap = window.gsap;
const NAME = Object.fromEntries(CHARACTERS.map(c => [c.id, c.name]));
const GENERIC = { citizen: 'Citizen', citizenf: 'Citizen', priest: 'Priest', soldier: 'Soldier', sage: 'Sage', hunter: 'Hunter', muniboy: 'Young ascetic', vanara: 'Vānara', rakshasa: 'Rākṣasa', rakshasi: 'Rākṣasī', gandharva: 'Gandharva', yajnapurusha: 'Divine being', krauncha: 'Krauñca' };
const nameOf = id => { const b = id.split('.')[0], g = b.replace(/\d+$/, ''); return NAME[b] || MINOR_NAMES[b] || NAME[g] || GENERIC[g] || g; };
const rand = (a, b) => a + Math.random() * (b - a);
const HUMAN_H = 2.05;
const X = x => (x - 50) / 50 * 4.6;

// Variants that should not reuse the base character's own art.
const OWN_ART = new Set(['hanuman.mendicant', 'ravana.mendicant', 'mareecha.deer', 'vishwamitra.king', 'dasharatha.young']);

// Proxy maps (extra / shadow / light) and halos live in data/proxies.js.
let ROTATE = 0;

/* ───────── character textures ───────── */
let CUT = null;
const texLoader = new THREE.TextureLoader(), texCache = new Map();
function loadTex(src) {
  if (!texCache.has(src)) texCache.set(src, new Promise(res => texLoader.load(src, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.generateMipmaps = true; res(t); }, undefined, () => res(null))));
  return texCache.get(src);
}
const FALLBACK = ['guha', 'sumantra', 'lakshmana', 'rama'];
const have = k => CUT && CUT[k] && CUT[k].views && Object.keys(CUT[k].views).length;
const firstHave = (...ks) => ks.flat().find(have) || FALLBACK.find(have);
export function artFor(id) {
  if (!CUT) return null;
  const base = id.split('.')[0].replace(/\d+$/, '');
  if (id.includes('.') && have(id)) return { key: id, mode: 'art' };
  if (!OWN_ART.has(id) && have(base)) return { key: base, mode: 'art' };
  if (SHADOW[id] || SHADOW[base]) { const k = firstHave(SHADOW[id] || SHADOW[base]); return k ? { key: k, mode: 'shadow' } : null; }
  if (LIGHT[base]) { const k = firstHave(LIGHT[base][0]); return k ? { key: k, mode: 'light', color: LIGHT[base][1] } : null; }
  if (EXTRA[base]) { const l = EXTRA[base].filter(have); const k = l.length ? l[(ROTATE++) % l.length] : firstHave(); return k ? { key: k, mode: 'extra' } : null; }
  const k = firstHave(); return k ? { key: k, mode: 'shadow' } : null;
}

/* ───────── billboard material: lit cut-out with rim light, dissolve, flash ───────── */
function figureMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: true, side: THREE.DoubleSide, fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      map: { value: null }, light: { value: new THREE.Color(1, 1, 1) }, rimCol: { value: new THREE.Color(1, .85, .6) }, rimK: { value: .55 }, rimSide: { value: 1 },
      texel: { value: new THREE.Vector2(1 / 256, 1 / 512) }, shade: { value: 1 }, desat: { value: 0 }, flash: { value: 0 }, flashCol: { value: new THREE.Color(1, 1, 1) },
      dissolve: { value: 0 }, dissCol: { value: new THREE.Color(1, .8, .3) }, opacity: { value: 1 }, time: { value: 0 }, mirror: { value: 0 }, breath: { value: 1 },
      glowCol: { value: new THREE.Color(0, 0, 0) }, mode: { value: 0 }, formCol: { value: new THREE.Color(1, .9, .6) }
    }]),
    vertexShader: `uniform float time, breath, mirror; varying vec2 vUv;
      #include <fog_pars_vertex>
      void main(){ vUv = vec2(mirror > .5 ? 1. - uv.x : uv.x, uv.y); vec3 p = position;
        p.y *= 1. + sin(time * 1.7) * .006 * breath; p.x += sin(time * .8) * .008 * p.y * breath;
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 light, rimCol, flashCol, dissCol, glowCol, formCol; uniform float rimK, rimSide, shade, desat, flash, dissolve, opacity, time, mode; uniform vec2 texel; varying vec2 vUv;
      #include <fog_pars_fragment>
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
      void main(){
        vec4 c = texture2D(map, vUv);
        if (c.a < .42) discard;
        float lum = dot(c.rgb, vec3(.299,.587,.114));
        vec3 col = mix(c.rgb, vec3(lum), desat) * light * shade;
        // rim light: alpha falls off on the lit side
        float side = texture2D(map, vUv + vec2(rimSide * texel.x * 3.5, texel.y * 1.5)).a;
        float edge = smoothstep(.2, 1., clamp(c.a - side, 0., 1.));
        float edge2 = smoothstep(.3, 1., clamp(c.a - texture2D(map, vUv + vec2(0., texel.y * 4.)).a, 0., 1.));
        float rim = edge * rimK + edge2 * rimK * .25;
        if (mode > 1.5) {               // divine body of light
          float shimmer = .85 + .15 * sin(time * 3. + vUv.y * 40.);
          col = formCol * (.55 + lum * 1.2) * shimmer + vec3(1.) * pow(lum, 2.5) * .7;
          rim *= 2.4;
        } else if (mode > .5) {          // rim-lit silhouette
          col = c.rgb * .13 * light;
          rim *= 2.6;
        }
        col += rimCol * light * rim * (.5 + lum);
        col += glowCol * .35;
        col = mix(col, flashCol, flash);
        // dissolve with a glowing burning edge
        float nz = n2(vUv * vec2(18., 36.)) * .7 + n2(vUv * 70.) * .3;
        if (nz < dissolve) discard;
        col += dissCol * smoothstep(dissolve + .08, dissolve, nz) * step(.001, dissolve) * 3.;
        gl_FragColor = vec4(col, opacity * (mode > 1.5 ? .94 : 1.));
        #include <fog_fragment>
      }`
  });
}

/* ───────── an actor on the stage (a lit cut-out of the 3D art) ───────── */
class Actor {
  constructor(stage, id, key) {
    this.stage = stage; this.id = id; this.key = key; this.spec = specFor(id);
    this.art = artFor(id);
    this.views = {}; this.view = 'front'; this.mirror = false;
    this.state = { x: 0, y: 0, z: 0, sc: 1, op: 0, lean: 0, tilt: 0, bob: 0, squash: 1, glow: 0, flash: 0, dissolve: 0, phase: 0, gait: 0, turn: 1, hover: 0 };
    this.pos = new THREE.Vector3();
    this.mat = figureMaterial();
    const geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, .5, 0);
    this.mesh = new THREE.Mesh(geo, this.mat); this.mesh.rotation.order = 'YXZ'; this.mesh.castShadow = true; this.mesh.visible = false;
    this.depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaTest: .5 }); this.mesh.customDepthMaterial = this.depth;
    stage.scene.add(this.mesh);
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: TEX.soft, color: '#000', transparent: true, opacity: .55, depthWrite: false }));
    this.blob.rotation.x = -Math.PI / 2; stage.scene.add(this.blob);
    const mode = this.art?.mode || 'shadow';
    const auraCol = new THREE.Color(this.art?.color || this.spec.aura || '#ffd27a');
    this.halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.soft, color: auraCol.clone().multiplyScalar(1.4), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
    stage.scene.add(this.halo);
    const base = id.split('.')[0].replace(/\d+$/, '');
    this.haloK = mode === 'light' ? 1 : (HALO[base] || 0);
    if (this.haloK) {
      this.ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.halo, color: auraCol.clone().lerp(new THREE.Color('#ffd27a'), .5).multiplyScalar(1.6), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
      stage.scene.add(this.ring);
    }
    const u = this.mat.uniforms;
    u.mode.value = mode === 'light' ? 2 : mode === 'shadow' ? 1 : 0;
    u.formCol.value.copy(auraCol);
    if (mode === 'extra') { u.shade.value = .78; u.desat.value = .3; }
    if (mode === 'light') u.rimCol.value.copy(auraCol);
    this.lowres = !!(this.art && CUT[this.art.key]?.lowres);
    this.isArt = mode === 'art';
    this.mode = mode;
    u.breath.value = this.spec.kind === 'bird' ? .3 : 1;
    this.height = HUMAN_H * (this.spec.scale || 1) * (this.spec.kind === 'bird' && !this.art ? .5 : 1);
    if (base === 'jatayu' || base === 'sampati' || base === 'garuda') this.height = HUMAN_H * 1.15;
    if (base === 'kumbhakarna') this.height = HUMAN_H * 1.9;
    if (base === 'tataka' || base === 'kabandha' || base === 'viradha' || base === 'atikaya') this.height = HUMAN_H * 1.4;
    if (base === 'lava' || base === 'kusha' || base === 'muniboy') this.height = HUMAN_H * .78;
    if (mode === 'light') stage.vfx.aura(this, auraCol);
    this.ready = this.load();
  }
  async load() {
    if (this.art && CUT[this.art.key]) {
      const v = CUT[this.art.key].views;
      await Promise.all(Object.entries(v).map(async ([name, m]) => { this.views[name] = { tex: await loadTex(m.src), w: m.w, h: m.h, face: m.face }; }));
    }
    if (!this.views.front) { const any = Object.keys(this.views)[0]; if (any) this.views.front = this.views[any]; }
    this.setView('front', false); this.mesh.visible = !!this.views.front;
  }
  setView(name, mirror) {
    const v = this.views[name] || this.views.front; if (!v) return;
    this.view = name; this.mirror = !!mirror;
    this.mat.uniforms.map.value = v.tex; this.depth.map = v.tex; this.depth.needsUpdate = true;
    this.mat.uniforms.mirror.value = mirror ? 1 : 0;
    this.mat.uniforms.texel.value.set(1 / v.w, 1 / v.h);
    this.aspect = v.w / v.h;
  }
  // Face screen-left, screen-right, the camera or away. Side views turn the way the art faces.
  face(dir) {
    if (!this.views.front) return;
    let view = 'front', mirror = false;
    if (dir === 'back') view = this.views.back ? 'back' : 'front';
    else if (dir === 'L' || dir === 'R') {
      const cands = ['left', 'right'].filter(v => this.views[v]);
      const f = v => this.views[v].face || (v === 'right' ? 'R' : 'L');
      if (cands.length) { const match = cands.find(v => f(v) === dir); if (match) view = match; else { view = cands[0]; mirror = true; } }
    }
    if (view === this.view && mirror === this.mirror) return;
    gsap.to(this.state, { turn: 0, duration: .16, ease: 'sine.in', onComplete: () => { this.setView(view, mirror); gsap.to(this.state, { turn: 1, duration: .22, ease: 'sine.out' }); } });
  }
  firePoint() { return new THREE.Vector3(this.pos.x - (this.mirror ? -1 : 1) * this.height * .2, this.pos.y + this.height * .45, this.pos.z + .05); }
  handPoint(dirX = 1) { return new THREE.Vector3(this.pos.x + dirX * this.height * .22, this.pos.y + this.height * .62, this.pos.z + .1); }
  center() { return new THREE.Vector3(this.pos.x, this.pos.y + this.height * .55, this.pos.z); }
  update(dt, t, cam, light, rimSide) {
    const S = this.state, h = this.height * S.sc;
    const step = Math.sin(S.phase), w = h * (this.aspect || .5);
    this.width = w;
    // A walk is a glide with the faint rise and fall of a real stride (about a centimetre), never a hop or a waddle:
    // a painted figure that bounces reads as a toy.
    this.pos.set(S.x, S.y + S.hover + (1 - Math.cos(S.phase * 2)) * .006 * S.gait + S.bob, S.z);
    const m = this.mesh; m.position.copy(this.pos);
    m.scale.set(w, h * S.squash, 1);
    m.rotation.y = Math.atan2(cam.position.x - S.x, cam.position.z - S.z);
    m.rotation.x = S.tilt; m.rotation.z = S.lean;
    const u = this.mat.uniforms; u.time.value = t; m.visible = S.op > .02 && !!this.views.front;
    // the shadow is cut from the same art as the figure; without it the whole card casts a grey rectangle
    if (this.depth.map !== u.map.value) { this.depth.map = u.map.value; this.depth.needsUpdate = true; }
    u.dissolve.value = S.dissolve; u.opacity.value = Math.min(1, S.op) * (.35 + .65 * S.turn);   // a turn dissolves between views
    u.flash.value = S.flash; u.light.value.copy(light); u.rimSide.value = rimSide * (this.mirror ? -1 : 1);
    u.glowCol.value.copy(this.halo.material.color).multiplyScalar(S.glow * .3);
    this.blob.position.set(S.x, .02, S.z + .02); this.blob.scale.set(w * 1.1, w * .5, 1); this.blob.material.opacity = (this.stage.env?.plate ? .3 : .5) * S.op * Math.max(0, 1 - S.y * .3) * (S.tilt ? .5 : 1) * (this.mode === 'light' ? .2 : 1);
    this.halo.position.set(S.x, this.pos.y + h * .58, S.z - .15); this.halo.scale.setScalar(h * 1.5); this.halo.material.opacity = (S.glow * .55 + (this.mode === 'light' ? .35 : 0)) * S.op;
    if (this.ring) {
      const k = this.haloK * S.op * (S.tilt ? 0 : 1);
      this.ring.position.set(S.x + Math.sin(S.lean) * -h * .3, this.pos.y + h * .855 * S.squash, S.z - .06);
      this.ring.scale.setScalar(h * .44 * (1 + Math.sin(t * 1.3) * .015)); this.ring.material.rotation = t * .08;
      this.ring.material.opacity = k * (.75 + Math.sin(t * 2) * .1);
    }
  }
  dispose() { const sc = this.stage.scene; sc.remove(this.mesh); sc.remove(this.blob); sc.remove(this.halo); if (this.ring) sc.remove(this.ring); this.mat.dispose(); this.mesh.geometry.dispose(); this.blob.geometry.dispose(); }
}

/* ───────── creatures built in 3D: the golden deer, birds, the serpent Surasā ───────── */
class ObjActor {
  constructor(stage, id, key) {
    this.stage = stage; this.id = id; this.key = key; this.spec = specFor(id); this.mode = 'obj'; this.isArt = true;
    this.state = { x: 0, y: 0, z: 0, sc: 1, op: 0, lean: 0, tilt: 0, bob: 0, squash: 1, glow: 0, flash: 0, dissolve: 0, phase: 0, gait: 0, turn: 1, hover: 0, flap: 0 };
    this.pos = new THREE.Vector3(); this.mirror = false; this.dir = 1;
    this.mesh = new THREE.Group(); this.parts = {}; this.mats = [];
    const kind = id === 'mareecha.deer' ? 'deer' : (this.spec.kind === 'serpent' || id === 'vasuki' || id === 'surasa') ? 'serpent' : 'bird';
    this.kind = kind;
    const M = (o) => { const m = new THREE.MeshStandardMaterial(o); this.mats.push(m); return m; };
    const add = (geo, mat, x = 0, y = 0, z = 0, parent = this.mesh) => { const mm = new THREE.Mesh(geo, mat); mm.position.set(x, y, z); mm.castShadow = true; parent.add(mm); return mm; };
    if (kind === 'deer') {
      const gold = M({ color: '#e8b030', metalness: .85, roughness: .22, emissive: '#7a4a08', emissiveIntensity: .7 });
      const silver = M({ color: '#fff8e8', emissive: '#fff2c0', emissiveIntensity: 1.2 });
      const sapph = M({ color: '#3a7aff', emissive: '#2a5aff', emissiveIntensity: 2.4, metalness: .3, roughness: .1 });
      const body = add(new THREE.CapsuleGeometry(.24, .78, 8, 16), gold, 0, 1.0); body.rotation.z = Math.PI / 2; body.scale.set(1, 1, .82);
      const neck = add(new THREE.CylinderGeometry(.09, .14, .55, 10), gold, .5, 1.3); neck.rotation.z = -.55;
      const head = add(new THREE.ConeGeometry(.12, .4, 12), gold, .72, 1.55); head.rotation.z = -Math.PI / 2 - .35;
      for (const s of [-1, 1]) {
        add(new THREE.ConeGeometry(.04, .16, 8), gold, .64, 1.68, s * .07).rotation.x = s * .5;
        const ant = new THREE.CatmullRomCurve3([new THREE.Vector3(.66, 1.66, s * .05), new THREE.Vector3(.6, 1.9, s * .12), new THREE.Vector3(.52, 2.1, s * .16), new THREE.Vector3(.58, 2.24, s * .2)]);
        add(new THREE.TubeGeometry(ant, 12, .016, 6), gold); add(new THREE.SphereGeometry(.04, 12, 8), sapph, .58, 2.25, s * .2);
      }
      this.parts.legs = [[.38, .14], [.38, -.14], [-.4, .14], [-.4, -.14]].map(([x, z]) => { const g = new THREE.Group(); g.position.set(x, .92, z); add(new THREE.CylinderGeometry(.035, .028, .9, 8), gold, 0, -.45, 0, g); add(new THREE.SphereGeometry(.04, 8, 6), sapph, 0, -.9, 0, g); this.mesh.add(g); return g; });
      for (let i = 0; i < 18; i++) add(new THREE.SphereGeometry(.03, 8, 6), silver, -.45 + Math.random() * .85, .9 + Math.random() * .25, (Math.random() < .5 ? -1 : 1) * .2);
      add(new THREE.ConeGeometry(.05, .2, 8), gold, -.58, 1.12).rotation.z = 2.2;
      this.height = 2.1;
    } else if (kind === 'bird') {
      const crow = this.spec.id === 'kakasura' || this.id === 'kakasura';
      const c = crow ? '#141418' : '#ecebe6';
      const mb = M({ color: c, roughness: .7 }), mw = M({ color: crow ? '#202028' : '#d8d8e0', roughness: .8, side: THREE.DoubleSide });
      const body = add(new THREE.SphereGeometry(.22, 16, 12), mb, 0, 1.2); body.scale.set(1.6, .8, .8);
      add(new THREE.SphereGeometry(.1, 12, 8), mb, .34, 1.36);
      const beak = add(new THREE.ConeGeometry(.03, .22, 8), M({ color: crow ? '#2a2a2a' : '#e0a030' }), .52, 1.36); beak.rotation.z = -Math.PI / 2;
      if (!crow) { add(new THREE.CylinderGeometry(.03, .03, .4, 8), mb, .24, 1.2).rotation.z = -.6; add(new THREE.SphereGeometry(.04, 8, 6), M({ color: '#c8202a', emissive: '#801010' }), .36, 1.44); }
      this.parts.wings = [1, -1].map(s => { const g = new THREE.Group(); g.position.set(0, 1.25, s * .1); const w = new THREE.Mesh(new THREE.PlaneGeometry(.7, .32), mw); w.position.set(-.05, 0, s * .35); w.rotation.x = -Math.PI / 2; g.add(w); this.mesh.add(g); g.userData.s = s; return g; });
      this.height = .8; this.isBird = true;
    } else {
      const scale = M({ color: '#2f6a4a', roughness: .35, metalness: .3 }), belly = M({ color: '#c8b070', roughness: .5 });
      const pts = [new THREE.Vector3(-3, .3, -1), new THREE.Vector3(-1.5, .4, .5), new THREE.Vector3(0, .5, -.6), new THREE.Vector3(.8, 1.4, 0), new THREE.Vector3(.5, 3, 0), new THREE.Vector3(.2, 4.2, .1)];
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, .38, 12), scale);
      const hood = add(new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), scale, .2, 4.3, 0); hood.scale.set(1.1, 1.1, .3); hood.rotation.x = Math.PI / 2;
      add(new THREE.SphereGeometry(.42, 16, 12), belly, .3, 4.3, .2).scale.set(1, 1.2, .6);
      for (const s of [-1, 1]) add(new THREE.SphereGeometry(.07, 10, 8), M({ color: '#ffe040', emissive: '#ffb000', emissiveIntensity: 3 }), .3 + s * .16, 4.45, .45);
      this.height = 4.6;
    }
    this.mesh.visible = true; stage.scene.add(this.mesh);
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: TEX.soft, color: '#000', transparent: true, opacity: .5, depthWrite: false })); this.blob.rotation.x = -Math.PI / 2; stage.scene.add(this.blob);
    this.width = 1.2; this.ready = Promise.resolve();
    if (kind === 'deer') { this.light = new THREE.PointLight('#ffc860', 6, 5, 1.6); this.mesh.add(this.light); this.light.position.set(0, 1.2, .6); }
  }
  face(dir) { if (dir === 'L') this.dir = -1; else if (dir === 'R') this.dir = 1; }
  firePoint() { return this.center(); }
  handPoint() { return this.center(); }
  center() { return new THREE.Vector3(this.pos.x, this.pos.y + this.height * .55, this.pos.z); }
  update(dt, t) {
    const S = this.state;
    this.pos.set(S.x, S.y + S.hover + S.bob, S.z);
    this.mesh.position.copy(this.pos); this.mesh.scale.setScalar(S.sc * (this.kind === 'bird' ? 1 : 1)); this.mesh.visible = S.op > .02;
    this.mesh.rotation.set(S.tilt ? 0 : 0, this.dir > 0 ? -.35 : Math.PI + .35, S.tilt ? -S.tilt * .9 : S.lean);
    this.mats.forEach(m => { m.transparent = S.op < 1; m.opacity = S.op; if (m.emissive && S.flash) m.emissiveIntensity = 1 + S.flash * 4; });
    if (this.parts.legs) this.parts.legs.forEach((g, i) => { g.rotation.z = Math.sin(S.phase + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * .55 * Math.min(1, S.gait + .02); });
    if (this.parts.wings) { const f = this.isBird ? Math.sin(t * 14) * .9 * Math.max(.25, Math.min(1, S.hover + S.y + S.flap + .2)) : 0; this.parts.wings.forEach(g => { g.rotation.x = g.userData.s * f; }); }
    if (this.kind === 'serpent') this.mesh.rotation.z = Math.sin(t * .9) * .05;
    this.blob.position.set(S.x, .02, S.z); this.blob.scale.set(2, .8, 1); this.blob.material.opacity = .45 * S.op * Math.max(0, 1 - S.y * .3);
  }
  dispose() { const sc = this.stage.scene; sc.remove(this.mesh); sc.remove(this.blob); this.mats.forEach(m => m.dispose()); this.mesh.traverse(o => o.geometry?.dispose()); }
}
const OBJ_IDS = new Set(['mareecha.deer', 'krauncha', 'kakasura', 'surasa', 'vasuki']);
function makeActor(stage, id, key) {
  const base = id.replace(/\d+$/, '');
  if (OBJ_IDS.has(id) || OBJ_IDS.has(base)) return new ObjActor(stage, base === 'krauncha' ? 'krauncha' : id, key);
  return new Actor(stage, id, key);
}

/* ───────── cinematic post (grade, vignette, grain, chromatic aberration) ───────── */
const CinematicShader = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, aberr: { value: 0 }, sat: { value: 1.08 }, contrast: { value: 1.06 }, tint: { value: new THREE.Color(1, 1, 1) }, vig: { value: .9 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float time, aberr, sat, contrast, vig; uniform vec3 tint; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + time) * 43758.5453); }
    void main(){ vec2 d = (vUv - .5); float ca = .0018 + aberr * .012;
      vec3 c = vec3(texture2D(tDiffuse, vUv - d * ca).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv + d * ca).b);
      float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat); c = (c - .5) * contrast + .5; c *= tint;
      c *= 1. - vig * pow(length(d) * 1.25, 2.4);
      c += (h(vUv * 800.) - .5) * .018;
      gl_FragColor = vec4(c, 1.); }`
};

// Focus pull: everything outside the subject's ellipse falls into a soft, bright-weighted bokeh.
const FocusShader = {
  uniforms: { tDiffuse: { value: null }, center: { value: new THREE.Vector2(.5, .5) }, radius: { value: new THREE.Vector2(.3, .4) }, k: { value: 0 }, texel: { value: new THREE.Vector2(1 / 900, 1 / 760) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 center, radius, texel; uniform float k; varying vec2 vUv;
    void main(){ vec4 base = texture2D(tDiffuse, vUv);
      float r = length((vUv - center) / radius);
      float b = smoothstep(.9, 2.1, r) * k;
      if (b < .02) { gl_FragColor = base; return; }
      vec3 acc = vec3(0.); float ws = 0.;
      for (int i = 0; i < 24; i++) { float fi = float(i); float a = fi * 2.39996; float rr = sqrt(fi + .5) / 4.9;
        vec3 s = texture2D(tDiffuse, vUv + vec2(cos(a), sin(a)) * rr * b * 15. * texel).rgb;
        float w = 1. + pow(dot(s, vec3(.3,.59,.11)), 2.) * 4.; acc += s * w; ws += w; }
      gl_FragColor = vec4(mix(base.rgb, acc / ws, min(1., b * 1.6)), 1.); }`
};

/* ───────── the stage ───────── */
export class Stage3D {
  constructor(root, { sound, filmOnly = false, covers = null } = {}) {
    this.root = root; this.sound = sound; this.filmOnly = filmOnly; this.covers = covers;
    root.classList.add('stage', 'stage3d');
    root.innerHTML = `<canvas class="s3-canvas"></canvas><div class="s3-media"></div><div class="stg-flash"></div><div class="s3-bars"></div><div class="stg-title"></div><div class="stg-dialog"><b></b><span></span></div><div class="s3-fade"></div>`;
    this.canvas = root.querySelector('canvas'); this.mediaEl = root.querySelector('.s3-media');
    this.media = fetch('assets/scenes/manifest.json').then(r => r.ok ? r.json() : {}).catch(() => ({}));
    // living paintings (tools/build_layers.py): figure and background masks, on every device that is not a modest one
    if (!LITE && !matchMedia('(prefers-reduced-motion: reduce)').matches) fetch('assets/scenes/layers/index.json').then(r => r.ok ? r.json() : {}).catch(() => ({})).then(x => { this.layers = x; });
    if (HD) fetch('assets/scenes/hd/index.json').then(r => r.ok ? r.json() : {}).catch(() => ({})).then(x => { this.hd = x; }); this.flashEl = root.querySelector('.stg-flash'); this.titleEl = root.querySelector('.stg-title'); this.dialog = root.querySelector('.stg-dialog'); this.fadeEl = root.querySelector('.s3-fade');
    const r = this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
    // Lighter rendering on phones and low-memory devices.
    QUALITY.low = matchMedia('(max-width: 760px)').matches || (navigator.deviceMemory && navigator.deviceMemory <= 4);
    r.setPixelRatio(Math.min(devicePixelRatio, QUALITY.low ? 1 : 1.6)); r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = .5;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 900 / 760, .1, 3000);
    this.pmrem = new THREE.PMREMGenerator(r);
    makeTextures();
    this.composer = new EffectComposer(r);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.focusPass = new ShaderPass(FocusShader); this.focusPass.enabled = false; this.composer.addPass(this.focusPass);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), .4, .55, .92); this.composer.addPass(this.bloom);
    this.cine = new ShaderPass(CinematicShader); this.composer.addPass(this.cine);
    this.composer.addPass(new OutputPass());
    this.vfx = new VFX(this.scene, this.camera, { flash: (c, k) => this.flash(c, k), shake: k => this.shake(k), sound: n => this.sound?.sfx(n) });
    this.actors = new Map(); this.props = new Map(); this.timers = []; this.env = null; this.envKey = '';
    this.cam = { x: 0, y: 1.8, z: 9.5, lx: 0, ly: 1.4, lz: 0, shake: 0 };
    this.light = new THREE.Color(1, 1, 1); this.rimSide = 1;
    this.clock = new THREE.Clock(); this.visible = true; this.running = false;
    this.ready = CUT ? Promise.resolve(setCut(CUT)) : fetch('assets/characters/cut/manifest.json').then(r => r.ok ? r.json() : {}).catch(() => ({})).then(m => { CUT = m; setCut(m); });
    const ro = new ResizeObserver(() => this.resize()); ro.observe(root); this.resize();
    // out of view, the stage stops drawing and the painting's slow camera move waits where it is
    this._io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; this.cutEl?._tw?.[this.visible ? 'resume' : 'pause'](); this.kick(); }); this._io.observe(root);
    this._breath = onBreath(() => this.kick());
  }
  resize() {
    const w = this.root.clientWidth || 900, h = this.root.clientHeight || 760;
    this.renderer.setSize(w, h, false); this.composer.setSize(w, h); this.bloom.resolution.set(w, h);
    const pr = this.renderer.getPixelRatio(); this.focusPass?.uniforms.texel.value.set(1 / (w * pr), 1 / (h * pr));
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    const el = this.cutEl; if (el?._img && el._st) requestAnimationFrame(() => this.reframeStill(el));
  }
  // The frame changed size (full screen, a turned phone): the camera's move is worked out afresh for the new frame and
  // carries on from the same point of the sentence, so a picture is never left zoomed for a smaller (or larger) frame.
  reframeStill(el) {
    const img = el._img, tw = el._tw; if (!img) return;
    if (!tw || !el._moveArgs) { this.placeStill(img, el._st); return; }
    const t = tw.progress(), left = tw.duration() * (1 - t), was = tw.paused();
    const [from, to] = this.stillMoves(img, ...el._moveArgs), st = el._st;
    const lerp = (a, b) => a + (b - a) * gsap.parseEase('sine.inOut')(t);
    Object.assign(st, { z: lerp(from.z, to.z), cx: lerp(from.cx, to.cx), cy: lerp(from.cy, to.cy), dir: Math.sign(to.z - from.z) });
    tw.kill(); this.placeStill(img, st);
    el._tw = gsap.to(st, { z: to.z, cx: to.cx, cy: to.cy, p: 1, duration: Math.max(.5, left), ease: 'sine.out', onUpdate: () => this.placeStill(img, st), paused: was });
  }

  /* ── environment ── */
  setEnv(key, time, plate = null) {
    const k = `${key}/${time || ''}`; if (k === this.envKey) return false;
    this.envKey = k;
    if (this.env) { this.scene.remove(this.env.group); this.env.group.traverse(o => { if (o.isMesh || o.isPoints || o.isSprite) { o.geometry?.dispose?.(); if (o.material && !o.material.userData?.shared) { [].concat(o.material).forEach(m => m.dispose?.()); } } }); this.env.envMap?.dispose(); }
    this.vfx.clearAll();
    const info = envInfo(key), cy0 = info.camY || 0;
    const base0 = { y: 1.6 + cy0, z: info.interior ? 7 : 7.4, ly: 1.3 + cy0 * .85 };
    const env = this.env = buildEnv(key, time, { renderer: this.renderer, pmrem: this.pmrem, plate, base: base0 });
    // a painted plate is shown as it was rendered: no film tone curve over it
    // AgX keeps skin and saturated silks truer than ACES; a painted plate is shown untouched
    this.renderer.toneMapping = env.plate ? THREE.NoToneMapping : THREE.AgXToneMapping;
    this.bloom.threshold = env.plate ? .96 : .92;
    this.scene.add(env.group); this.scene.fog = env.fog; this.scene.environment = env.envMap || null; this.scene.environmentIntensity = env.interior ? .3 : .8;
    this.renderer.toneMappingExposure = env.exposure * 1.45;
    this.vfx.ambient = { ...env.amb };
    env.fires.forEach(([x, z, s], i) => this.vfx.fire(new THREE.Vector3(x, 0, z), s, 'envfire' + i));
    // light reaching the figures: sun + sky, normalised and toned
    const T = env.T, l = new THREE.Color(T.sun).multiplyScalar(T.sunI * .22).add(new THREE.Color(T.hs).multiplyScalar(T.hi * .55));
    const mx = Math.max(l.r, l.g, l.b); this.light.copy(l.multiplyScalar(Math.min(1.25, 1.05 / mx) * (env.time === 'night' ? .72 : env.interior ? .95 : 1.02)));
    if (env.time === 'night' && !env.plate) this.light.lerp(new THREE.Color(.62, .7, 1), .35);
    // never let the figures sink into silhouette
    const lum = this.light.r * .3 + this.light.g * .59 + this.light.b * .11; const minL = env.time === 'night' ? .92 : 1.04; if (lum < minL) this.light.multiplyScalar(minL / lum);
    this.rimSide = env.sunDir.x >= 0 ? 1 : -1;
    let rimC = new THREE.Color(T.sun).lerp(new THREE.Color('#fff'), .3);
    if (env.plateLight) { this.light.copy(env.plateLight.light); this.rimSide = env.plateLight.rimSide; rimC = env.plateLight.rimCol; } this.actors.forEach(a => { if (a.mat && a.mode !== 'light') a.mat.uniforms.rimCol.value.copy(rimC); }); this.rimCol = rimC;
    const grade = { dawn: [1.04, .98, .92], dusk: [1.06, .94, .88], war: [1.04, .95, .9], night: [.9, .96, 1.08], gold: [1.06, 1, .9], cosmic: [.96, .94, 1.08] }[env.time] || [1, 1, 1];
    this.cine.uniforms.tint.value.setRGB(...(env.plate ? [1, 1, 1] : grade));
    this.sound?.ambience(env.sound || null);
    const cy = env.camY || 0;
    this.base = { x: 0, y: 1.6 + cy, z: env.interior ? 7 : 7.4, lx: 0, ly: 1.3 + cy * .85, lz: 0 };
    Object.assign(this.cam, this.base);
    return true;
  }

  clearCast() {
    for (const a of this.actors.values()) { gsap.killTweensOf(a.state); a.dispose(); }
    this.actors.clear();
    for (const p of this.props.values()) { this.scene.remove(p.obj); this.vfx.removeEmitter('prop' + p.key); }
    this.props.clear();
  }

  parseCast(tok, book) {
    const m = tok.match(/^(#?[\w.-]+)@(-?[\d.]+)(?:\^([\d.]+))?(?:\*([\d.]+))?(?::(\w+))?([<>])?$/);
    if (!m) return null;
    let [, id, x, alt, sc, pose, face] = m;
    if (!id.startsWith('#') && !id.includes('.') && VARIANT_BY_BOOK[book]?.[id]) id = VARIANT_BY_BOOK[book][id];
    const s = sc ? +sc : 1;
    return { id, key: id.startsWith('#') ? id : id.split('.')[0], x: X(+x), y: alt ? +alt / 100 * 6.5 : 0, z: s < .85 ? -(1 - s) * 4 : 0, sc: s, pose, face: face === '<' ? 'L' : face === '>' ? 'R' : null };
  }

  placeActor(c) {
    let a = this.actors.get(c.key);
    if (a && a.id !== c.id) { gsap.killTweensOf(a.state); a.dispose(); this.actors.delete(c.key); a = null; }
    const faceDir = c.face || 'front';
    if (!a) {
      a = makeActor(this, c.id, c.key); this.actors.set(c.key, a);
      if (this.rimCol && a.mat && a.mode !== 'light') a.mat.uniforms.rimCol.value.copy(this.rimCol);
      Object.assign(a.state, { x: c.x, y: c.y, z: c.z, sc: c.sc, op: 0, dissolve: 0 });
      a.ready.then(() => { if (c.face) a.face(c.face); });
      if (c.pose !== 'hidden') gsap.to(a.state, { op: 1, duration: .9, delay: .15 });
      if (a.spec.aura && ['vishnu', 'shiva', 'brahma', 'indra', 'agni', 'surya', 'garuda', 'samudra', 'bhudevi', 'saraswati', 'yajnapurusha', 'gandharva'].includes(a.spec.id)) a.state.glow = .6;
      if (a.state.glow) this.vfx.aura(a, a.spec.aura || '#ffd27a');
    } else {
      gsap.killTweensOf(a.state, 'x,y,z,sc,lean,tilt,gait,squash,hover');
      const dist = Math.abs(a.state.x - c.x);
      if (dist > .4) this.move(a, c.x, dist > 4 ? 'run' : 'walk', () => a.face(faceDir));
      else a.face(faceDir);
      gsap.to(a.state, { y: c.y, z: c.z, sc: c.sc, op: c.pose === 'hidden' ? 0 : 1, tilt: 0, duration: .8 });
    }
    this.applyPose(a, c.pose);
    return a;
  }

  applyPose(a, pose) {
    const S = a.state;
    const P = { sit: { lean: .02 }, kneel: { lean: .05 }, lie: { tilt: -1.45 }, bow: { lean: .1 }, pray: { glow: .8 }, weep: { lean: .08 }, bless: { glow: .9 }, lift: {}, fly: { hover: 0 }, glow: { glow: 1 }, talk: {}, sad: { lean: .05 }, aim: {} }[pose] || {};
    if (pose === 'hidden') { S.op = 0; return; }
    gsap.to(S, { squash: 1, lean: 0, tilt: 0, ...P, duration: .7 });
    if (P.glow) this.vfx.aura(a, a.spec.aura || '#ffe2a0');
    if (pose === 'fly' && (a.spec.kind === 'bird')) a.face('R');
  }

  placeProp(c) {
    let p = this.props.get(c.key);
    if (!p) {
      const name = c.key.slice(1).replace(/\d+$/, ''), obj = buildProp(name);
      obj.traverse(o => { if (o.material?.envMapIntensity !== undefined) o.material.envMapIntensity = 1; });
      this.scene.add(obj); p = { key: c.key, name, obj }; this.props.set(c.key, p);
      obj.scale.setScalar(c.sc);
      if (obj.userData.fire) this.vfx.fire(obj.userData.fire.clone().multiplyScalar(c.sc).add(new THREE.Vector3(c.x, c.y, c.z - .5)), (obj.userData.fireSize || 1) * c.sc, 'prop' + c.key);
      if (obj.userData.glow) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.soft, color: new THREE.Color('#ffd27a').multiplyScalar(1.2), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: .6 })); s.scale.setScalar(name === 'pushpaka' ? 12 : 1.4); obj.add(s); }
    }
    p.obj.position.set(c.x, c.y, c.z - .5); p.obj.rotation.y = name0(p.name) === 'boat' ? Math.PI / 2 : 0;
    return p;
  }

  move(a, toX, mode = 'walk', done) {
    const S = a.state, dir = toX > S.x ? 'R' : 'L'; a.face(dir);
    // a person's pace (about 1.3 m/s walking, 3.5 m/s running), easing into and out of the stride
    const dist = Math.abs(toX - S.x), fast = mode === 'run', dur = Math.max(1, dist / (fast ? 3.5 : 1.3) + (fast ? .4 : .7));
    const isBird = a.spec.kind === 'bird' || a.spec.kind === 'crow';
    const tl = gsap.timeline({ onComplete: done });
    tl.to(S, { gait: isBird ? 0 : fast ? 1.6 : 1, lean: (dir === 'R' ? -1 : 1) * (fast ? .045 : .015), duration: .5, ease: 'sine.inOut' })
      .to(S, { x: toX, phase: `+=${dur * (fast ? 9 : 6.3)}`, duration: dur, ease: 'power1.inOut', onUpdate: () => { if (!isBird && fast && Math.random() < .12) this.vfx.dust(new THREE.Vector3(S.x, 0, S.z), 2, '#8a7a62', .3); } }, 0)
      .to(S, { gait: 0, lean: 0, duration: .6, ease: 'sine.inOut' }, '>-.5');
    if (isBird) tl.to(S, { hover: .6, duration: dur / 2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0);
    this.sound?.sfx(isBird ? 'whoosh' : 'steps');
    return tl;
  }

  /* ── one beat ── */
  // Scene changes are queued so rapid clicks never interleave environment rebuilds.
  play(beat) { this.queue = (this.queue || Promise.resolve()).then(() => this._play(beat)).catch(e => console.error(e)); return this.queue; }
  async _play(beat) {
    await this.ready;
    // A cinematic image or video supplied for this paragraph takes the place of the real-time scene.
    const mediaKey = beat.id ? beat.id.replace(/:/g, '-') : null, media = mediaKey ? (await this.media)[mediaKey] : null;
    // a list of clips is a set of filmed shots, one per sentence; when every sentence has its shot, the paragraph
    // plays as film (no 3D set at all), otherwise the clips cut in over the living scene
    if (this.filmOnly) {
      if (!this._unveiled) { this._unveiled = true; gsap.to(this.fadeEl, { opacity: 0, duration: 1.2, delay: .2 }); this.root.classList.add('katha'); }
      if (!this.director) this.director = new Director(this);         // it measures the film's bars
      // a different paragraph: the subtitles of the last one stop (a narrated one starts its own right after)
      if (this.director?.active && this.director.beat?.id !== beat.id) this.director.stop(true);
      this.root.classList.add('katha');                               // the film's bars stay: heading above, subtitles below
      // the reader shows only the paintings: a sentence without its own picture holds the last one, a page without
      // a paragraph (a Kāṇḍa's title page, the cover) shows the Kāṇḍa's own painting; the 3D set is never shown
      if (Array.isArray(media) && media.length) return this.playFilm(beat, media);
      const cover = beat.cover || (beat.book && this.covers?.[beat.book]);
      if (cover && !(this.filming && !beat.cover && beat.id)) return this.playFilm(beat, [{ src: cover, at: 0, still: true }]);
      this.titleEl.innerHTML = `<small>${beat.kanda || ''}</small>${beat.title || ''}${beat.place ? `<i>${beat.place}</i>` : ''}`;
      return;
    }
    if (Array.isArray(media) && this.coversAll(media, beat)) return this.playFilm(beat, media);
    this.endCut(true);
    if (this.filming) { this.filming = null; this.root.classList.remove('filming'); }
    if (typeof media === 'string') return this.playMedia(beat, media);
    if (this.mediaMode) { this.mediaMode = false; gsap.to(this.mediaEl, { opacity: 0, duration: .8, onComplete: () => { this.mediaEl.innerHTML = ''; } }); }
    const { script = 'forest', book, title, kanda, place } = beat;
    this.timers.forEach(t => t.kill()); this.timers = []; this.hideDialog();
    if (this.director?.active) { this.director.stop(true); clearTimeout(this._kt); this._kt = setTimeout(() => { if (!this.director.active) this.root.classList.remove('katha'); }, 900); }
    const [bgPart = 'forest', castPart = '', fxPart = '', actPart = ''] = script.split('|').map(s => s.trim());
    const [bgKey, time] = bgPart.split('/');
    const changing = `${bgKey}/${time || ''}` !== this.envKey;
    if (changing) {
      await new Promise(res => gsap.to(this.fadeEl, { opacity: 1, duration: this.env ? .35 : 0, onComplete: res }));
      const plate = await loadPlate(await findPlate(bgKey, time));
      this.clearCast(); this.setEnv(bgKey, time, plate);
      gsap.to(this.fadeEl, { opacity: 0, duration: 1.1, delay: .1 });
    }
    this.titleEl.innerHTML = `<small>${kanda || ''}</small>${title || ''}${place ? `<i>${place}</i>` : ''}`;
    const tokens = castPart.split(/\s+/).filter(Boolean).map(t => this.parseCast(t, book)).filter(Boolean);
    const keep = new Set(tokens.map(t => t.key));
    for (const [k, a] of this.actors) if (!keep.has(k)) { gsap.killTweensOf(a.state); gsap.to(a.state, { op: 0, duration: .6, onComplete: () => a.dispose() }); this.actors.delete(k); this.vfx.emitters = this.vfx.emitters.filter(e => e.actor !== a); }
    for (const [k, p] of this.props) if (!keep.has(k)) { this.scene.remove(p.obj); this.vfx.removeEmitter('prop' + k); this.props.delete(k); }
    tokens.forEach(t => t.key.startsWith('#') ? this.placeProp(t) : this.placeActor(t));
    fxPart.split(/\s+/).filter(Boolean).forEach(f => this.startFx(f));
    this.cameraMove(changing, tokens.filter(t => !t.key.startsWith('#')));
    (actPart.match(/(?:[^;"]|"[^"]*")+/g) || []).map(s => s.trim()).filter(Boolean).forEach(a => {
      const m = a.match(/^([\d.]+)\s+(\S+)\s+(\S+)(?:\s+"(.*)")?$/); if (!m) return;
      const [, t, who, verb, text] = m;
      this.timers.push(gsap.delayedCall(+t + (changing ? .9 : .3), () => this.doAct(who, verb, text)));
    });
    if (!this.running) { this.running = true; this.kick(); }
  }

  playMedia(beat, file) {
    this.timers.forEach(t => t.kill()); this.timers = []; this.hideDialog();
    this.mediaMode = true;
    const src = `assets/scenes/${file}`, video = /\.(mp4|webm)$/i.test(file);
    const el = document.createElement(video ? 'video' : 'img');
    if (video) Object.assign(el, { src, muted: true, loop: true, autoplay: true, playsInline: true }); else el.src = src;
    el.className = 's3-media-item'; el.style.opacity = 0; this.mediaEl.appendChild(el); this.mediaEl.style.opacity = 1;
    const old = [...this.mediaEl.children].filter(c => c !== el);
    gsap.to(el, { opacity: 1, duration: 1.1, ease: 'power2.out', onComplete: () => old.forEach(o => o.remove()) });
    if (!video) gsap.fromTo(el, { scale: 1.12, xPercent: Math.random() < .5 ? -2 : 2 }, { scale: 1.02, xPercent: 0, duration: 16, ease: 'sine.out' });
    const [bgPart = '', , fxPart = '', actPart = ''] = (beat.script || '').split('|').map(s => s.trim());
    const info = envInfo(bgPart.split('/')[0]); this.sound?.ambience(info.sound || null);
    this.titleEl.innerHTML = `<small>${beat.kanda || ''}</small>${beat.title || ''}${beat.place ? `<i>${beat.place}</i>` : ''}`;
    (actPart.match(/(?:[^;"]|"[^"]*")+/g) || []).map(s => s.trim()).forEach(a => {
      const m = a.match(/^([\d.]+)\s+(\S+)\s+(\S+)(?:\s+"(.*)")?$/); if (!m) return;
      const [, t, who, verb, text] = m;
      if (verb === 'say') this.timers.push(gsap.delayedCall(+t + .8, () => this.say(who.split('.')[0], trSay(text))));
      if (who === 'fx' && verb === 'conch') this.timers.push(gsap.delayedCall(+t + .8, () => this.sound?.sfx('conch')));
    });
  }

  // Motion clips (assets/scenes/manifest.json: "<book>-<ep>-<k>": [{ "src": "x.mp4", "at": <sentence> }, …]) are real
  // filmed action (an arrow loosed, a leap across the sea, cranes in flight) generated from the scene itself. Each one
  // cuts in as the narrator reaches its sentence, plays once, and dissolves back into the living scene.
  async onSentence(beat, i, dur) {
    if (!beat?.id) return;
    const list = (await this.media)[beat.id.replace(/:/g, '-')];
    if (!Array.isArray(list)) return;
    if (this.filming) {
      if (i === this.filmAt) { if (dur && this.cutEl) this.paceCut(this.cutEl, dur); return; }   // the first shot started on the page turn
      this.filmAt = i;
    }
    const clip = list.find(c => (c.at ?? 0) === i);
    if (clip && this.cutEl?.dataset.src === clip.src) return;      // already on screen (shown early, for a sentence without its own)
    if (clip) this.playCut(clip, !!this.filming, dur);
  }
  // A short shot fills a long sentence by easing into slow motion (never below 0.6×, where motion stays fluid);
  // whatever time is left, it holds its last frame and the slow push-in carries on.
  paceCut(el, dur) {
    if (el.tagName === 'IMG') return;
    const set = () => { if (el.dataset.fixedRate) return; el.playbackRate = Math.max(.6, Math.min(1, el.duration / Math.max(1, dur - .8))); };
    if (el.readyState >= 1) set(); else el.addEventListener('loadedmetadata', set, { once: true });
  }
  coversAll(list, beat) {
    const n = sentences(beat.en || beat.text || '').length, at = new Set(list.flatMap(c => c.covers || [c.at ?? 0]));
    for (let i = 0; i < n; i++) if (!at.has(i)) return false;
    return n > 0;
  }
  // A fully filmed paragraph: the film takes the stage, the first shot starts at once (a page turn alone shows it),
  // and the narration cuts on to each sentence's shot.
  playFilm(beat, list) {
    this.timers.forEach(t => t.kill()); this.timers = []; this.hideDialog();
    this.mediaMode = true; this.filming = list; this.filmAt = 0;
    this.root.classList.add('filming'); gsap.killTweensOf(this.mediaEl); this.mediaEl.style.opacity = 1;
    const [bgPart = ''] = (beat.script || '').split('|').map(s => s.trim());
    this.sound?.ambience(envInfo(bgPart.split('/')[0]).sound || null);
    this.titleEl.innerHTML = `<small>${beat.kanda || ''}</small>${beat.title || ''}${beat.place ? `<i>${beat.place}</i>` : ''}`;
    const first = list.find(c => (c.at ?? 0) === 0) || (this.filmOnly && [...list].sort((a, b) => (a.at ?? 0) - (b.at ?? 0))[0]);
    if (first) this.playCut(first, true);
    if (!this.running) { this.running = true; this.kick(); }
  }
  // In film, a shot dissolves over the last one and, once played, holds its final frame with a slow push-in until the
  // next sentence's shot arrives; over the living scene, a clip plays once and dissolves back into it.
  playCut(clip, film = false, dur = 0) {
    if (clip.still || /\.(webp|jpe?g|png|avif)$/i.test(clip.src)) return this.playStill(clip, film, dur);
    const prev = this.cutEl;
    if (!film) this.endCut(true);
    const el = document.createElement('video');
    Object.assign(el, { src: `assets/scenes/${clip.src}`, muted: true, playsInline: true, autoplay: true, preload: 'auto' });
    el.className = 's3-media-item s3-cut'; el.style.opacity = 0;
    this.mediaEl.appendChild(el); this.mediaEl.style.opacity = 1; this.cutEl = el;
    el.playbackRate = clip.rate || (film ? .9 : 1);
    if (clip.audio) el.dataset.fixedRate = '1';                    // a clip with its own sound keeps its speed
    else if (dur) this.paceCut(el, dur);
    // a clip made with its own sound (Veo) plays it softly beneath the narration, if effects are on
    if (clip.audio && this.sound?.sfxOn) { el.muted = false; el.volume = this.sound?.narrateOn ? .28 : .6; }
    el.addEventListener('playing', () => {
      gsap.to(el, { opacity: 1, duration: film ? .9 : .45, ease: 'power2.inOut', onComplete: () => { if (film && prev && prev !== el) { gsap.killTweensOf(prev); prev.remove(); } } });
      if (film) gsap.fromTo(el, { scale: 1.0, xPercent: 0 }, { scale: 1.09, xPercent: (Math.random() < .5 ? -1 : 1) * 1.2, duration: 14, ease: 'sine.out' });
    }, { once: true });
    const out = () => { if (this.cutEl === el && !this.filming) this.endCut(); };
    el.addEventListener('ended', out, { once: true }); el.addEventListener('error', out, { once: true });
    if (clip.sfx) this.sound?.sfx(clip.sfx);
  }
  // An illustration of the sentence: it dissolves in over the last picture and the camera drifts slowly across it
  // (a gentle push toward its centre of interest) for as long as the narrator speaks the line.
  playStill(clip, film = false, dur = 0) {
    const prev = this.cutEl;
    if (!film) this.endCut(true);
    // the whole painting is shown (no one is cropped out of frame), over a soft, darkened, blurred copy of itself
    const el = document.createElement('div'), img = document.createElement('img');
    el.className = 's3-media-item s3-cut s3-still'; el.style.opacity = 0; el.dataset.src = clip.src;
    const url = `assets/scenes/${clip.src}${clip.v ? `?v=${clip.v}` : ''}`;
    // an HD file only when it was made from this very version of the painting
    const id = /^ill\/(.+)\.webp$/.exec(clip.src)?.[1], hd = id && clip.v && this.hd?.[id] === clip.v ? `assets/scenes/hd/${id}.webp?v=${clip.v}` : null;
    // an absolute address: a url() handed to a stylesheet through a custom property resolves against the stylesheet
    // (the soft, blurred copy behind the painting needs no more than the original)
    el.style.setProperty('--still', `url("${new URL(url, location.href).href}")`);
    img.decoding = 'async'; img.alt = ''; img.src = hd || url; el.appendChild(img);
    // a living painting: beneath, the clean plate (the world with its figures taken out); the background with a hole where the figures stand; and the
    // figures on their own layer, which moves a little more than the background as the camera drifts. No figure is
    // ever stretched: every layer is the painting itself, moved whole.
    if (id && clip.v && this.layers?.[id] === clip.v) {
      const lay = (cls, mask) => { const i = document.createElement('img'); i.decoding = 'async'; i.alt = ''; i.className = cls; i.src = img.src;
        if (mask) { const m = `url("assets/scenes/layers/${id}.${mask}.webp?v=${clip.v}")`; i.style.webkitMaskImage = i.style.maskImage = m; }
        return i; };
      const base = lay('s3-l0'); base.src = `assets/scenes/layers/${id}.p.webp?v=${clip.v}`; img.classList.add('s3-l1'); img.style.webkitMaskImage = img.style.maskImage = `url("assets/scenes/layers/${id}.h.webp?v=${clip.v}")`;
      el.insertBefore(base, img); el.appendChild(lay('s3-l2', 'f')); el.classList.add('s3-living'); el._box = clip.box;
    }
    this.mediaEl.appendChild(el); this.mediaEl.style.opacity = 1; this.cutEl = el;
    const hold = Math.max(6, dur || 9) + 2;
    const show = () => {
      if (this.cutEl !== el) return;
      gsap.to(el, { opacity: 1, duration: film ? 1.2 : .7, ease: 'power2.inOut', onComplete: () => { if (prev && prev !== el) { gsap.killTweensOf(prev); prev._tw?.kill(); prev.remove(); } } });
      // the camera eases toward the figures (clip.box, found by tools/finish_ill.py) and never crops any of them;
      // shots alternate between a slow push in and a slow pull back, so a run of pictures breathes like a film
      el._moveArgs = [clip.box, clip.move || ((this._stillN = (this._stillN || 0) + 1) % 2 ? 'in' : 'out')];
      const [from, to] = this.stillMoves(img, ...el._moveArgs);
      const st = { ...from, p: 0, dir: Math.sign(to.z - from.z) }, put = () => this.placeStill(img, st);
      el._img = img; el._st = st;                                   // re-placed if the screen changes size
      put(); el._tw = gsap.to(st, { ...to, p: 1, duration: hold, ease: 'sine.inOut', onUpdate: put, paused: !this.visible });
    };
    if (img.complete && img.naturalWidth) show(); else { img.addEventListener('load', show, { once: true }); img.addEventListener('error', () => { if (this.cutEl === el && !this.filming) this.endCut(true); }, { once: true }); }
    // over the living scene a picture stays for its sentence, then dissolves back
    if (!film) this.timers.push(gsap.delayedCall(hold - 1, () => { if (this.cutEl === el && !this.filming) this.endCut(); }));
    if (clip.sfx) this.sound?.sfx(clip.sfx);
  }
  // The picture's window on the stage: the letterboxed 16:9 film frame, or the whole stage over the living scene.
  stillFrame() {
    const R = this.root, w = R.clientWidth || 900, h = R.clientHeight || 760;
    // on the book's page the painting fills its frame; the film's bars appear only when it is shown full screen
    const bar = R.classList.contains('katha') && !R.closest('.pg-art:not(.is-max)') ? parseFloat(R.style.getPropertyValue('--bar')) || 0 : 0;
    return { y: bar, w, h: Math.max(1, h - 2 * bar) };
  }
  // A camera state is { z, cx, cy }: zoom over the whole-picture fit, and the point of the painting held at the frame's
  // centre. It is clamped so the painting always covers the frame wherever it is wide or tall enough to.
  stillView(img, s) {
    const F = this.stillFrame(), ar = (img.naturalWidth || 16) / (img.naturalHeight || 9);
    const cw = Math.min(F.w, F.h * ar), ch = cw / ar, dw = cw * s.z, dh = ch * s.z;
    const lim = (c, d, f) => d <= f ? .5 : Math.min(1 - f / 2 / d, Math.max(f / 2 / d, c));
    const cx = lim(s.cx, dw, F.w), cy = lim(s.cy, dh, F.h);
    return { F, cw, ch, dw, dh, left: F.w / 2 - cx * dw, top: F.y + F.h / 2 - cy * dh, cx, cy };
  }
  placeStill(img, s) {
    const v = this.stillView(img, s);
    const el = img.parentElement, all = el?.classList.contains('s3-living') ? el.querySelectorAll('img') : [img];
    const base = `translate3d(${v.left.toFixed(2)}px, ${v.top.toFixed(2)}px, 0) scale(${s.z.toFixed(4)})`;
    for (const i of all) {
      i.style.width = `${v.cw}px`; i.style.height = `${v.ch}px`;
      if (!i.classList.contains('s3-l2')) { i.style.transform = base; continue; }
      // the figures are nearer than their world, so as the camera moves in they grow a little faster than it (and
      // shrink faster as it pulls back) — about their feet, which stand on the ground at its own depth and never slide
      const [x0, y0, x1, y1] = Array.isArray(el._box) && el._box.length === 4 ? el._box : [.3, .2, .7, .9];
      // at most ~6 px of difference at the top of the figures, on any screen: depth you feel, never a gap you see
      const reach = Math.max(.012, Math.min(.03, 6 / Math.max(1, (y1 - y0) * v.dh)));
      const k = 1 + reach * (s.p ?? 0) * (s.dir || 0), fx = v.left + (x0 + x1) / 2 * v.dw, fy = v.top + Math.min(.99, y1) * v.dh;
      i.style.transform = `translate3d(${(fx - k * (fx - v.left)).toFixed(2)}px, ${(fy - k * (fy - v.top)).toFixed(2)}px, 0) scale(${(s.z * k).toFixed(4)})`;
    }
  }
  // The start and end of a still's slow camera move. The figures' box [x0, y0, x1, y1] (fractions of the painting)
  // keeps a clear margin on the left, right and above (crowns and raised hands are never cut); only the feet may
  // leave the frame, and only a little, in the tightest part of a push in.
  stillMoves(img, box, move) {
    const [x0, y0, x1, y1] = Array.isArray(box) && box.length === 4 ? box : [.1, .08, .9, .96];
    const bx = (x0 + x1) / 2, by = y0 + (y1 - y0) * .46, m = .04, feet = (y1 - y0) * .035;
    const inset = (s) => {
      const v = this.stillView(img, s), { F } = v, L = v.left + x0 * v.dw, R = v.left + x1 * v.dw;
      const T = v.top - F.y + y0 * v.dh, B = v.top - F.y + (y1 - feet) * v.dh;
      return [L / F.w, 1 - R / F.w, T / F.h, 1 - B / F.h];
    };
    // what the whole-picture view already shows of the figures: a tighter view may never show less
    const base = inset({ z: 1, cx: .5, cy: .5 }).map(i => Math.min(m, i) - .002);
    const fits = (s) => inset(s).every((i, k) => i >= base[k]);
    const { F, cw, ch } = this.stillView(img, { z: 1, cx: .5, cy: .5 });
    const cover = Math.max(F.w / cw, F.h / ch);
    const tight = (lo, hi) => { for (let z = hi; z > lo; z -= .005) { const s = { z, cx: bx, cy: by }; if (fits(s)) return s; } return { z: lo, cx: bx, cy: by }; };
    // the opening view fills the frame where the figures allow it; the closer view moves in on them by up to a fifth
    // on the book's page the painting always fills its frame, centred on the figures, and breathes slowly
    if (this.root.closest('.pg-art:not(.is-max)')) {
      // the full height of the painting stays in view (only the sides are trimmed), so no face or crown is ever cut
      const top = Math.max(.42, Math.min(.5, y0 + (y1 - y0) * .4));
      const w0 = { z: cover, cx: bx, cy: .5 }, c0 = { z: cover * 1.06, cx: bx, cy: top };
      return move === 'out' ? [c0, w0] : [w0, c0];
    }
    const wide = tight(1, cover), close = tight(wide.z, Math.min(wide.z * 1.2, 1.34));
    if (close.z - wide.z < .025) close.z = wide.z + .025;   // always a little breath of movement
    return move === 'out' ? [close, wide] : [wide, close];
  }
  endCut(now) {
    const el = this.cutEl; if (!el) return; this.cutEl = null;
    gsap.killTweensOf(el);
    if (now) { el._tw?.kill(); el.remove(); return; }
    gsap.to(el, { opacity: 0, duration: .9, ease: 'power2.inOut', onComplete: () => { el._tw?.kill(); el.remove(); } });
  }

  // Direct a narrated paragraph like a film: one shot per sentence, subtitles in the reader's language.
  direct(beat, handle) {
    if (!beat) return;
    if (!this.director) this.director = new Director(this);
    const d = this.director;
    // over a video clip only the subtitles and chapter card run; the clip has its own camera
    (this.queue || Promise.resolve()).then(() => d.start(beat, handle, { camera: !this.mediaMode }));
  }
  cameraMove(changed, cast) {
    if (this.manualCam) return;
    gsap.killTweensOf(this.cam);
    const B = this.base; const xs = cast.map(c => c.x); const mid = xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 0;
    const spread = xs.length ? Math.max(...xs) - Math.min(...xs) : 0;
    const avgY = cast.length ? cast.reduce((s, c) => s + c.y, 0) / cast.length : 0;
    const target = { lx: mid * .6, ly: B.ly + Math.min(1.2, avgY * .35), lz: 0 };
    const half = Math.max(2.6, xs.length ? Math.max(...xs.map(x => Math.abs(x - mid * .6))) + 1.3 : 3);
    const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.aspect);
    const zoom = Math.max(.72, Math.min(2.1, half / Math.tan(hfov / 2) / B.z));
    const moves = [
      { from: { x: mid * .4 - 1.2, z: B.z * zoom + .6 }, to: { x: mid * .4 + 1.2, z: B.z * zoom } },         // truck
      { from: { x: mid * .5, z: B.z * zoom + 1.6, y: B.y + .6 }, to: { x: mid * .5, z: B.z * zoom - .3, y: B.y } }, // push-in crane
      { from: { x: mid * .5 + 2, z: B.z * zoom - .4 }, to: { x: mid * .5 - .6, z: B.z * zoom + .2 } },      // arc
      { from: { x: mid * .5, z: B.z * zoom + .3, y: B.y - .45 }, to: { x: mid * .5, z: B.z * zoom - .4, y: B.y - .2 } } // low heroic
    ];
    const mv = moves[(Math.random() * moves.length) | 0];
    this.wide = { target, mv, B };
    if (changed) Object.assign(this.cam, { y: B.y, ...mv.from });
    gsap.to(this.cam, { ...target, duration: changed ? .01 : 1.6, ease: 'power2.inOut' });
    gsap.to(this.cam, { y: B.y, ...mv.to, duration: 14, ease: 'sine.inOut', delay: changed ? 0 : .2 });
  }
  // Push in on whoever speaks, then ease back out to the wide shot.
  closeUp(a, hold = 4.5) {
    if (!a || !a.pos || this.manualCam) return;
    if (this.director?.active) { this.director.onSay(a, hold); return; }
    if (a.lowres || a.mode === 'shadow' || a.mode === 'extra') { this.focus(a, .4); return; }   // low-res art stays at a distance until sharp art is imported
    const d = (a.lowres ? 6.2 : 4.7) * Math.sqrt(a.height / HUMAN_H), headY = a.pos.y + a.height * .78;
    gsap.killTweensOf(this.cam);
    gsap.to(this.cam, { x: a.state.x * .9 + (a.state.x > this.cam.x ? -.35 : .35), z: a.state.z + d, y: headY - .1, lx: a.state.x, ly: headY - .18, duration: 1.5, ease: 'power3.inOut' });
    clearTimeout(this._wideT);
    this._wideT = setTimeout(() => { const W = this.wide; if (!W) return; gsap.to(this.cam, { ...W.target, y: W.B.y, ...W.mv.to, duration: 2.4, ease: 'power2.inOut' }); }, hold * 1000);
  }
  focus(a, k = .35) { if (!a || this.director?.active) return; gsap.to(this.cam, { lx: this.cam.lx + (a.state.x - this.cam.lx) * k, duration: 1.2, ease: 'power2.inOut' }); }

  doAct(who, verb, text) {
    const v3 = THREE.Vector3;
    if (who === 'fx') return this.startFx(verb);
    if (who === 'cam') { if (verb === 'shake') this.shake(1); if (verb === 'zoom' && !this.director?.active) gsap.to(this.cam, { z: this.cam.z - 2.5, duration: 2.2, ease: 'power2.inOut' }); if (verb === 'flash') this.flash('#fff', 1); return; }
    if (who.startsWith('#')) return this.propAct(who, verb);
    const key = who.split('.')[0], a = this.actors.get(key); if (!a) return;
    if (verb === 'say') { this.say(key, trSay(text)); a.face('front'); this.closeUp(a, 3.4 + (text || '').length * .045); return; }
    const [v, target] = verb.split('>');
    const tA = target && isNaN(+target.split('^')[0]) ? (this.actors.get(target) || null) : null;
    const tP = target && !tA && isNaN(+target.split('^')[0]) ? this.props.get('#' + target) : null;
    const num = target && !isNaN(+target.split('^')[0]) ? target.split('^').map(Number) : null;
    const tX = num ? X(num[0]) : tA ? tA.state.x : tP ? tP.obj.position.x : undefined;
    const tY = num && num[1] != null ? num[1] / 100 * 6.5 : undefined;
    const S = a.state, dirX = tX != null ? Math.sign(tX - S.x) || 1 : 1;
    const targetPoint = () => tA ? tA.center() : tP ? tP.obj.position.clone().add(new v3(0, 1, 0)) : new v3(tX ?? S.x + dirX * 6, (tY ?? 1.2), 0);
    const hit = (p, col, big) => {
      this.vfx.burst(p, col, big ? 160 : 50, big ? 9 : 4); this.vfx.flare(p, col, big ? 6 : 2, big ? .8 : .35);
      if (tA) { gsap.fromTo(tA.state, { flash: 1 }, { flash: 0, duration: .45 }); gsap.to(tA.state, { x: tA.state.x + dirX * (big ? .5 : .15), duration: .15, yoyo: true, repeat: 1 }); }
      this.sound?.sfx(big ? 'boom' : 'impact'); if (big) { this.shake(1.4); this.aberr(1); } else this.shake(.35);
    };
    switch (v) {
      case 'walk': case 'run': this.timers.push(this.move(a, tX ?? S.x + 2, v)); break;
      case 'turn': a.face(a.mirror ? 'R' : 'L'); break;
      case 'shoot': {
        a.face(dirX > 0 ? 'R' : 'L'); this.sound?.sfx('draw');
        const tl = gsap.timeline(); this.timers.push(tl);
        tl.to(S, { lean: -dirX * .03, duration: .5 }).call(() => {
          const from = a.handPoint(dirX), col = text || (a.spec.id === 'indrajit' ? '#7aff9a' : '#ffe08a');
          this.sound?.sfx('twang');
          this.vfx.projectile({ from, to: targetPoint(), kind: 'arrow', color: col, onHit: p => hit(p, col, false) });
        }).to(S, { lean: dirX * .02, duration: .12 }).to(S, { lean: 0, duration: .5 });
        break;
      }
      case 'astra': {
        a.face(dirX > 0 ? 'R' : 'L'); const col = text || '#ffd870';
        const hp = a.handPoint(dirX);
        this.vfx.rune(new v3(S.x, 0, S.z), col, 3.4, 2.6); this.vfx.charge(hp, col, 1.2); this.sound?.sfx('astra');
        gsap.to(S, { glow: 1, duration: .8 }); this.focus(a, .5);
        this.timers.push(gsap.delayedCall(1.2, () => {
          this.sound?.sfx('twang'); this.flash(col, .35);
          this.vfx.projectile({ from: hp, to: targetPoint(), kind: 'astra', color: col, onHit: p => {
            hit(p, col, true); this.vfx.shockwave(p, col, 9); this.vfx.pillar(p, col, 40, 1.8); this.vfx.dust(p, 30, '#a08060', 2.5); this.flash(col, .9);
            gsap.to(S, { glow: a.spec.aura ? .4 : 0, duration: 1.5 });
          } });
          this.timers.push(gsap.delayedCall(.2, () => this.focus(tA || a, .6)));
        }));
        break;
      }
      case 'strike': case 'throw': {
        if (tX != null) a.face(dirX > 0 ? 'R' : 'L');
        const x0 = S.x, lunge = v === 'strike' && tX != null ? (tX - x0) * .55 : 0; this.sound?.sfx('swing');
        const tl = gsap.timeline(); this.timers.push(tl);
        tl.to(S, { lean: dirX * .035, duration: .3, ease: 'sine.inOut' }).to(S, { x: x0 + lunge, lean: -dirX * .05, duration: .22, ease: 'power2.in' }).call(() => {
          if (v === 'throw') { const from = a.handPoint(dirX).add(new v3(0, .4, 0)); this.vfx.projectile({ from, to: targetPoint(), kind: 'rock', onHit: p => { hit(p, '#e0c8a0', false); this.vfx.dust(p, 14, '#8a7258', 1.2); } }); }
          else { const p = tA ? tA.center() : a.handPoint(dirX).add(new v3(dirX * .6, 0, 0)); hit(p, '#ffd8a0', false); this.vfx.burst(p, '#ffffff', 30, 6); }
        }).to(S, { x: v === 'throw' ? x0 : x0 + lunge, lean: 0, duration: .7, ease: 'sine.out' }, '+=.15');
        break;
      }
      case 'fly': case 'leap': {
        // Flight is a long, smooth glide with the body leaning into the direction of travel and settling as it
        // arrives; a leap is one powerful ballistic arc. No squash-and-stretch: on a painted figure it reads as a toy.
        const toX = tX ?? S.x + dirX * 4, toY = tY ?? (tA ? tA.state.y : S.y), x0 = S.x, y0 = S.y, dx = toX - x0;
        const leap = v === 'leap', dur = leap ? 1.6 : Math.max(2.4, Math.abs(dx) * .32), rise = leap ? Math.min(3.2, .9 + Math.abs(dx) * .22) : Math.max(.35, Math.abs(dx) * .06);
        a.face(toX > x0 ? 'R' : 'L'); this.sound?.sfx('whoosh');
        const o = { k: 0 }, tl = gsap.timeline(); this.timers.push(tl);
        if (leap) tl.to(S, { lean: Math.sign(dx) * -.05, duration: .35, ease: 'sine.inOut' }).call(() => this.vfx.dust(new v3(S.x, 0, S.z), 16, '#8a7258', 1.4));
        tl.to(S, { lean: Math.sign(dx) * -(leap ? .1 : .14), duration: leap ? .3 : .8, ease: 'sine.out' }, leap ? '>' : 0);
        tl.to(o, { k: 1, duration: dur, ease: leap ? 'none' : 'power1.inOut', onUpdate: () => {
          const k = o.k;
          S.x = x0 + dx * k;
          S.y = y0 + (toY - y0) * k + (leap ? 4 * k * (1 - k) * rise : Math.sin(k * Math.PI) * rise);
          if (Math.random() < .4) this.vfx.glow.spawn({ x: S.x - dx * .02, y: S.y + a.height * .5, z: S.z, vx: -dx * .25, vy: 0, vz: 0, life: .6, size: .06, color: a.spec.aura || '#ffe0a0' });
        } }, leap ? '<' : .2);
        tl.to(S, { lean: 0, duration: .9, ease: 'sine.inOut' }, '-=.5').call(() => { if (S.y < .2) this.vfx.dust(new v3(S.x, 0, S.z), 12); });
        break;
      }
      case 'fall': {
        const tl = gsap.timeline(); this.timers.push(tl);
        tl.to(S, { flash: 1, duration: .06 }).to(S, { flash: 0, duration: .3 }).to(S, { tilt: -1.45, y: 0, duration: .75, ease: 'power3.in' }, '<').call(() => { this.vfx.dust(new v3(S.x, 0, S.z - .4), 26, '#7a6a52', 1.6); this.sound?.sfx('thud'); this.shake(.4); });
        break;
      }
      case 'rise': this.timers.push(gsap.to(S, { tilt: 0, op: 1, squash: 1, duration: 1.2, ease: 'power2.out' })); this.vfx.burst(a.center(), '#fff2c0', 40, 2); break;
      case 'hit': gsap.fromTo(S, { flash: 1 }, { flash: 0, duration: .4 }); this.vfx.burst(a.center(), '#ffd8a0', 30, 3); this.sound?.sfx('impact'); break;
      case 'appear': S.op = 0; S.dissolve = 1; gsap.to(S, { op: 1, dissolve: 0, duration: 1.6, ease: 'power2.out' }); gsap.to(S, { glow: Math.max(S.glow, .7), duration: 1 }); this.vfx.burst(a.center(), a.spec.aura || '#fff2c0', 70, 2.5, { gravity: -.5 }); this.vfx.flare(a.center(), a.spec.aura || '#fff2c0', 4, 1); this.sound?.sfx('chime'); break;
      case 'vanish': gsap.to(S, { dissolve: 1, glow: 1, duration: 1.6, ease: 'power2.in' }); this.vfx.burst(a.center(), a.spec.aura || '#ffe2a0', 90, 2.5, { gravity: -1 }); this.sound?.sfx('chime'); break;
      case 'glow': case 'pray': case 'bless': gsap.to(S, { glow: 1, duration: .9 }); this.vfx.aura(a, a.spec.aura || '#ffe2a0'); if (v !== 'glow') this.sound?.sfx('chime'); if (v === 'bless') this.vfx.flare(a.handPoint(1), '#fff2c0', 1.6, 1.2); break;
      case 'grow': this.timers.push(gsap.to(S, { sc: S.sc * 1.8, duration: 1.8, ease: 'power2.inOut' })); this.vfx.burst(new v3(S.x, .2, S.z), a.spec.aura || '#ffb040', 80, 4, { gravity: -1 }); this.sound?.sfx('swell'); this.shake(.6); break;
      case 'shrink': this.timers.push(gsap.to(S, { sc: S.sc * .35, duration: 1, ease: 'power2.inOut' })); this.vfx.burst(a.center(), '#ffe2a0', 30, 2); break;
      case 'roar': gsap.timeline().to(S, { lean: -.04, duration: .35, ease: 'sine.out' }).to(S, { lean: 0, duration: .9, ease: 'sine.inOut' }); this.shake(.8); this.vfx.dust(new v3(S.x, 0, S.z), 20, '#6a5a4a', 2); this.sound?.sfx('roar'); this.focus(a, .4); break;
      case 'weep': case 'sad': gsap.to(S, { lean: .07, duration: 1 }); break;
      case 'kneel': gsap.to(S, { lean: .06, duration: .7 }); break;
      case 'sit': gsap.to(S, { lean: .02, duration: .8 }); break;
      case 'stand': gsap.to(S, { squash: 1, lean: 0, tilt: 0, duration: .7 }); break;
      case 'bow': case 'namaste': gsap.timeline().to(S, { lean: .12, duration: .5 }).to(S, { lean: 0, duration: .6 }, '+=.6'); break;
      case 'talk': break;
      case 'lift': gsap.timeline().to(S, { lean: -.03, duration: .6, ease: 'sine.inOut' }).to(S, { lean: 0, duration: .8, ease: 'sine.inOut' }, '+=.4'); break;
      case 'flap': gsap.to(S, { hover: .5, duration: .4, yoyo: true, repeat: 3 }); this.sound?.sfx('whoosh'); break;
      case 'fire': case 'burn': this.vfx.fire(a.firePoint(), .55, 'burn-' + key, a); this.sound?.sfx('fire'); break;
    }
  }

  propAct(who, verb) {
    const p = this.props.get(who); if (!p) return;
    const o = p.obj;
    if (verb === 'break' && o.userData.halves) {
      const [l, r] = o.userData.halves; if (o.userData.string) o.userData.string.visible = false;
      gsap.to(l.rotation, { z: .5, duration: .5, ease: 'power4.out' }); gsap.to(l.position, { x: -.4, y: -.3, duration: .5 });
      gsap.to(r.rotation, { z: -.5, duration: .5, ease: 'power4.out' }); gsap.to(r.position, { x: .4, y: -.3, duration: .5 });
      const pt = o.position.clone().add(new THREE.Vector3(0, 1.5 * o.scale.y, 0));
      this.vfx.burst(pt, '#ffe2a0', 220, 9); this.vfx.flare(pt, '#ffe2a0', 5, 1); this.vfx.shockwave(o.position, '#ffd27a', 10); this.flash('#fff6dc', .7); this.shake(2); this.aberr(1); this.sound?.sfx('thunder'); this.sound?.sfx('boom');
      return;
    }
    if (verb === 'burn') { this.vfx.fire(o.position.clone().add(new THREE.Vector3(0, .9, 0)), 2.2, 'prop' + who); this.sound?.sfx('fire'); return; }
    const mv = verb.match(/^(fly|move)>(-?[\d.]+)(?:\^([\d.]+))?$/);
    if (mv) { gsap.to(o.position, { x: X(+mv[2]), y: mv[3] ? +mv[3] / 100 * 6.5 : 0, duration: mv[1] === 'fly' ? 3 : 1.6, ease: 'sine.inOut' }); if (mv[1] === 'fly') this.sound?.sfx('whoosh'); return; }
    if (verb === 'appear') { o.scale.setScalar(.001); gsap.to(o.scale, { x: 1, y: 1, z: 1, duration: 1, ease: 'back.out(2)' }); this.vfx.burst(o.position.clone().add(new THREE.Vector3(0, .6, 0)), '#fff2c0', 70, 3, { gravity: -.5 }); this.vfx.flare(o.position.clone().add(new THREE.Vector3(0, .6, 0)), '#ffe8b0', 3, 1); this.sound?.sfx('chime'); }
    if (verb === 'vanish') gsap.to(o.scale, { x: .001, y: .001, z: .001, duration: .8 });
  }

  startFx(f) {
    const [name, arg] = f.split('@'); const x = arg ? X(+arg) : 0, V = THREE.Vector3;
    switch (name) {
      case 'fire': this.vfx.fire(new V(x, 0, -.6), 1.3, 'fx' + f); this.sound?.sfx('fire'); break;
      case 'burn': for (let i = 0; i < 12; i++) this.vfx.fire(new V(rand(-24, 24), rand(2, 10), rand(-40, -18)), rand(2, 4), 'burn' + i); this.vfx.ambient.embers = 2; this.vfx.ambient.smoke = 2; this.sound?.sfx('blaze'); break;
      case 'flash': this.flash('#fff', 1); break;
      case 'shake': this.shake(1); break;
      case 'lightning': this.vfx.lightning(new V(rand(-4, 4), 0, rand(-12, -4))); break;
      case 'ring': this.vfx.shockwave(new V(x, 0, 0), '#ffd870', 6); this.vfx.rune(new V(x, 0, 0), '#ffd870'); break;
      case 'nagapasha': for (let i = 0; i < 14; i++) setTimeout(() => { const to = new V(rand(-5, 0), rand(.5, 1.8), rand(-1, 1)); this.vfx.projectile({ from: new V(rand(4, 8), rand(5, 7), -2), to, kind: 'serpent', color: '#5dff9a', onHit: p => this.vfx.burst(p, '#5dff9a', 26, 2.5) }); }, i * 110); this.sound?.sfx('hiss'); break;
      case 'conch': this.sound?.sfx('conch'); break;
      case 'stars': break;
      case 'rays': this.vfx.ambient.motes = 1.5; break;
      default: this.vfx.ambient[name] = (this.vfx.ambient[name] || 0) + 1; if (name === 'petals') this.sound?.sfx('petals'); if (name === 'rain') this.sound?.ambience('rain');
    }
  }

  say(key, text) {
    if (!text) return;
    const d = this.dialog; d.querySelector('b').textContent = trName(key.replace(/\d+$/, ''), nameOf(key));
    const span = d.querySelector('span'); span.textContent = ''; d.classList.add('on');
    const chars = [...text]; let i = 0; this._typer?.kill();
    this._typer = gsap.to({}, { duration: Math.min(3, chars.length * .028), onUpdate() { const n = Math.floor(this.progress() * chars.length); if (n !== i) { i = n; span.textContent = chars.slice(0, n).join(''); } }, onComplete: () => { span.textContent = text; } });
    clearTimeout(this._dlgT); this._dlgT = setTimeout(() => this.hideDialog(), 3400 + text.length * 55);
  }
  hideDialog() { this.dialog.classList.remove('on'); }
  flash(col = '#fff', k = 1) { const dim = this.env?.interior ? .5 : 1; this.flashEl.style.background = col; gsap.fromTo(this.flashEl, { opacity: .5 * k * dim }, { opacity: 0, duration: .8, ease: 'power2.out' }); this.bloom.strength = .4 + .8 * k * dim; gsap.to(this.bloom, { strength: .4, duration: 1.1 }); }
  shake(k = 1) { this.cam.shake = Math.max(this.cam.shake, k); }
  aberr(k = 1) { gsap.fromTo(this.cine.uniforms.aberr, { value: k }, { value: 0, duration: 1.1, ease: 'power2.out' }); }

  // one frame loop at a time; it stops when the stage is out of view, stopped, or the page is at rest
  kick() { if (!this._raf) this.loop(); }
  destroy() { this.running = false; this._io.disconnect(); offBreath(this._breath); cancelAnimationFrame(this._raf); this._raf = 0; this.composer?.dispose?.(); this.renderer.dispose(); this.renderer.forceContextLoss?.(); }
  loop() {
    this._raf = 0;
    if (!this.running || !this.visible || !isAwake()) return;
    this._raf = requestAnimationFrame(() => this.loop());
    const now = performance.now(); if (now - (this._last || 0) < 1000 / FPS - 2) return; this._last = now;   // at most 60 a second on a 120 Hz screen
    const dt = Math.min(this.clock.getDelta(), .05), t = this.clock.elapsedTime;
    this.director?.update();
    const F = this.director?.focus;
    if (this.focusPass) { const k = F && !QUALITY.low ? F.k : 0; this.focusPass.enabled = k > .02; if (k > .02) { const u = this.focusPass.uniforms; u.k.value = k; u.center.value.set(F.x, F.y); u.radius.value.set(F.rx, F.ry); } }
    const c = this.cam, sh = c.shake; c.shake *= .9;
    this.camera.position.set(c.x + (Math.random() - .5) * sh * .25, c.y + (Math.random() - .5) * sh * .2, c.z);
    this.camera.lookAt(c.lx, c.ly, c.lz);
    this.env?.update(dt, t);
    for (const a of this.actors.values()) {
      // figures standing close to a fire take on its glow
      let l = this.light;
      for (const e of this.vfx.emitters) if (e.type === 'fire' && !e.follow) { const d = Math.hypot(e.pos.x - a.state.x, e.pos.z - a.state.z); if (d < 4.5) { l = l.clone().lerp(new THREE.Color(1.25, .82, .5), (1 - d / 4.5) * .45); } }
      a.update(dt, t, this.camera, l, this.rimSide);
    }
    for (const p of this.props.values()) { const u = p.obj.userData; if (u.spin) u.spin.rotation.y += dt * 1.5; if (p.name === 'pushpaka' || p.name === 'mountain') p.obj.position.y += Math.sin(t * 1.4) * .002; }
    this.vfx.update(dt, t);
    this.cine.uniforms.time.value = t;
    if (!this.mediaMode) this.composer.render();
  }
}
function name0(n) { return n; }
