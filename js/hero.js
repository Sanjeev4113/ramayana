import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const gsap = window.gsap;

function glowTexture(inner = 'rgba(255,240,200,1)', mid = 'rgba(255,160,50,.55)', size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner); g.addColorStop(.18, mid); g.addColorStop(.5, 'rgba(255,90,20,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function omTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '360px "Tiro Devanagari Sanskrit", "Noto Serif Devanagari", serif';
  x.shadowColor = 'rgba(255,180,60,1)'; x.shadowBlur = 40;
  const g = x.createLinearGradient(0, 80, 0, 440);
  g.addColorStop(0, '#fff8e0'); g.addColorStop(.5, '#ffd479'); g.addColorStop(1, '#e08a1e');
  x.fillStyle = g; x.fillText('ॐ', 256, 290);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function smokeTexture() {
  const s = 256, c = document.createElement('canvas'); c.width = c.height = s;
  const x = c.getContext('2d');
  for (let i = 0; i < 40; i++) {
    const r = Math.random() * 70 + 30, px = s / 2 + (Math.random() - .5) * 110, py = s / 2 + (Math.random() - .5) * 110;
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, s, s);
  }
  return new THREE.CanvasTexture(c);
}

/* Card material: fades image edges into the darkness and adds a slow golden light-sweep. */
function cardMaterial(tex, tint) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { map: { value: tex }, uTime: { value: 0 }, uTint: { value: new THREE.Color(tint) }, uOpacity: { value: 0 }, uSweep: { value: Math.random() * 10 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `
      uniform sampler2D map; uniform float uTime, uOpacity, uSweep; uniform vec3 uTint; varying vec2 vUv;
      void main(){
        vec4 c = texture2D(map, vUv);
        float edge = smoothstep(0., .26, vUv.x) * smoothstep(1., .74, vUv.x) * smoothstep(0., .16, vUv.y) * smoothstep(1., .86, vUv.y);
        float lum = dot(c.rgb, vec3(.299,.587,.114));
        edge *= mix(smoothstep(.04, .2, lum), 1., smoothstep(.5, .3, abs(vUv.x-.5)));
        float sweep = smoothstep(.06, 0., abs(vUv.x + vUv.y*.35 - mod(uTime*.12 + uSweep, 2.6) + .4));
        vec3 col = c.rgb * uTint + sweep * vec3(1., .78, .4) * .28 * edge;
        gl_FragColor = vec4(col, edge * uOpacity);
        #include <colorspace_fragment>
      }`
  });
}

export function initHero(canvas, characters) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#050307');
  scene.fog = new THREE.FogExp2('#0a0507', .045);
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
  camera.position.set(0, .6, 10);

  /* ── Sūrya Maṇḍala ── */
  const mandala = new THREE.Group();
  mandala.position.set(0, 4.4, -8);
  scene.add(mandala);
  const gold = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.5, .55), transparent: true, opacity: .9 });
  const goldDim = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, .8, .3), transparent: true, opacity: .55 });

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  glow.scale.set(14, 14, 1); mandala.add(glow);

  const rays = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uTime; varying vec2 vUv;
      void main(){ vec2 p=vUv-.5; float r=length(p); float a=atan(p.y,p.x);
        float k = pow(.5+.5*sin(a*24.+uTime*.25),6.) + .6*pow(.5+.5*sin(a*12.-uTime*.18),8.);
        float f = k * smoothstep(.5,.06,r) * smoothstep(.02,.12,r);
        gl_FragColor = vec4(vec3(1.,.62,.22)*f*.55, f*.55); }`
  }));
  rays.position.z = -.2; mandala.add(rays);

  const rings = new THREE.Group(); mandala.add(rings);
  [[2.2, .02, gold], [2.42, .008, goldDim], [3.25, .014, gold], [3.45, .006, goldDim], [1.05, .016, gold]].forEach(([r, t, m]) => {
    rings.add(new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 180), m));
  });
  const spokes = new THREE.Group(); rings.add(spokes);
  for (let i = 0; i < 24; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(.012, 1.12, .01), i % 2 ? goldDim : gold);
    const a = (i / 24) * Math.PI * 2;
    s.position.set(Math.cos(a) * 1.64, Math.sin(a) * 1.64, 0); s.rotation.z = a - Math.PI / 2;
    spokes.add(s);
  }
  // Lotus petals between rings
  const petals = new THREE.Group(); mandala.add(petals);
  const petalPts = [];
  for (let k = 0; k <= 40; k++) { const t = k / 40; const w = Math.sin(t * Math.PI) * .34; petalPts.push(new THREE.Vector3(w, 2.45 + t * .75, 0)); }
  for (let k = 40; k >= 0; k--) { const t = k / 40; const w = Math.sin(t * Math.PI) * .34; petalPts.push(new THREE.Vector3(-w, 2.45 + t * .75, 0)); }
  const petalGeo = new THREE.BufferGeometry().setFromPoints(petalPts);
  const petalMat = new THREE.LineBasicMaterial({ color: new THREE.Color(1.8, 1.15, .45), transparent: true, opacity: .8 });
  for (let i = 0; i < 16; i++) { const l = new THREE.Line(petalGeo, petalMat); l.rotation.z = (i / 16) * Math.PI * 2; petals.add(l); }
  // Om at the heart of the sun
  const om = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial({ map: omTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(1.6, 1.3, 1) }));
  om.position.z = .05; mandala.add(om);

  /* ── Character panels ── */
  const loader = new THREE.TextureLoader();
  const byId = Object.fromEntries(characters.map(c => [c.id, c]));
  const layout = [
    { id: 'hanuman', x: -4.7, y: -.15, z: -1.4, h: 4.3, ry: .42, tint: '#ffe0b0', op: 1 },
    { id: 'lakshmana', x: -2.35, y: -.05, z: -.55, h: 4.4, ry: .22, tint: '#ffe8c8', op: 1 },
    { id: 'sita', x: 2.35, y: -.1, z: -.55, h: 4.3, ry: -.22, tint: '#ffe8c8', op: 1 },
    { id: 'rama', x: 0, y: .1, z: .35, h: 4.8, ry: 0, tint: '#fff2dc', op: 1 }
  ];
  const cards = [];
  layout.forEach((L, i) => {
    const c = byId[L.id]; if (!c?.views) return;
    const tex = loader.load(c.views[0], t => {
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      const aspect = t.image.width / t.image.height;
      mesh.scale.set(L.h * aspect, L.h, 1);
    });
    const mat = cardMaterial(tex, L.tint);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    mesh.position.set(L.x, L.y, L.z); mesh.rotation.y = L.ry;
    mesh.userData = { base: mesh.position.clone(), phase: i * 1.3, op: L.op };
    scene.add(mesh); cards.push(mesh);
    // soft halo behind each figure
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('rgba(255,210,140,.5)', 'rgba(255,140,40,.18)'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
    halo.scale.set(L.h * .9, L.h * .9, 1); halo.position.set(L.x, L.y + L.h * .22, L.z - .3);
    if (L.id === 'ravana') halo.material.color.set('#ff3020');
    scene.add(halo); mesh.userData.halo = halo;
  });

  /* ── Embers ── */
  const N = 1800;
  const pos = new Float32Array(N * 3), spd = new Float32Array(N), ph = new Float32Array(N), sz = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - .5) * 26; pos[i * 3 + 1] = Math.random() * 14 - 4; pos[i * 3 + 2] = Math.random() * -16 + 5;
    spd[i] = Math.random() * .5 + .15; ph[i] = Math.random() * 6.28; sz[i] = Math.random() * 1.6 + .4;
  }
  const eg = new THREE.BufferGeometry();
  eg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  eg.setAttribute('aSpeed', new THREE.BufferAttribute(spd, 1));
  eg.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
  eg.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
  const embers = new THREE.Points(eg, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPR: { value: renderer.getPixelRatio() } },
    vertexShader: `attribute float aSpeed, aPhase, aSize; uniform float uTime, uPR; varying float vF;
      void main(){ vec3 p = position; p.y = mod(p.y + 4. + uTime*aSpeed, 14.) - 4.; p.x += sin(uTime*.5 + aPhase)*.4;
        vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv;
        vF = (.55+.45*sin(uTime*6.+aPhase*5.)) * smoothstep(10., 4., p.y);
        gl_PointSize = aSize * uPR * 34. / -mv.z; }`,
    fragmentShader: `varying float vF; void main(){ float d = length(gl_PointCoord-.5); float a = smoothstep(.5,0.,d);
      gl_FragColor = vec4(mix(vec3(1.,.35,.06), vec3(1.,.85,.5), a*a) * 1.6, a*vF); }`
  }));
  scene.add(embers);

  /* ── Low smoke ── */
  const smokeTex = smokeTexture();
  const smokes = [];
  for (let i = 0; i < 14; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: .5, color: i % 3 ? '#7a4a2a' : '#4a2a20' }));
    const k = 6 + Math.random() * 6; s.scale.set(k * 1.6, k, 1);
    s.position.set((Math.random() - .5) * 22, -2.6 + Math.random() * 1.2, -Math.random() * 8 + 1.5);
    s.userData.v = (Math.random() - .5) * .15; scene.add(s); smokes.push(s);
  }

  /* ── Post ── */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .85, .7, .72);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h;
    // pull back on narrow screens so the darbar fits
    camera.userData.baseZ = w / h < 1 ? 15.5 : w / h < 1.4 ? 12 : 10;
    camera.updateProjectionMatrix();
  };
  resize(); addEventListener('resize', resize);

  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; }, { passive: true });

  // Intro choreography
  mandala.scale.setScalar(.01);
  gsap.to(mandala.scale, { x: 1, y: 1, z: 1, duration: 3.2, ease: 'expo.out' });
  cards.forEach((m, i) => {
    gsap.to(m.material.uniforms.uOpacity, { value: m.userData.op, duration: 2.4, delay: .5 + i * .28, ease: 'power2.out' });
    gsap.to(m.userData.halo.material, { opacity: m.userData.op * .6, duration: 3, delay: .8 + i * .28 });
    gsap.from(m.userData.base, { y: m.userData.base.y - 1.2, duration: 2.6, delay: .5 + i * .28, ease: 'expo.out' });
  });

  let running = true, raf = null;
  const clock = new THREE.Clock();
  const tick = () => {
    if (!running) { raf = null; return; }
    const t = clock.getElapsedTime();
    const sp = Math.min(1, scrollY / innerHeight);
    rings.rotation.z = t * .05; spokes.rotation.z = -t * .03; petals.rotation.z = -t * .02;
    rays.material.uniforms.uTime.value = t; embers.material.uniforms.uTime.value = t;
    glow.material.opacity = .85 + Math.sin(t * 1.3) * .1;
    om.material.opacity = .85 + Math.sin(t * 2) * .15;
    cards.forEach(m => {
      m.material.uniforms.uTime.value = t;
      m.position.y = (m.userData.base.y) + Math.sin(t * .8 + m.userData.phase) * .06;
    });
    smokes.forEach(s => { s.position.x += s.userData.v * .02; if (s.position.x > 13) s.position.x = -13; if (s.position.x < -13) s.position.x = 13; });
    const bz = camera.userData.baseZ || 10;
    camera.position.x += (mouse.x * 1.4 - camera.position.x) * .04;
    camera.position.y += ((.6 - mouse.y * .6 + sp * 1.5) - camera.position.y) * .04;
    camera.position.z += ((bz - sp * 3.5) - camera.position.z) * .06;
    camera.lookAt(0, 1.5 + sp * .8, -1);
    composer.render();
    raf = requestAnimationFrame(tick);
  };
  tick();

  return {
    pause() { running = false; },
    resume() { if (!running) { running = true; if (!raf) tick(); } }
  };
}
