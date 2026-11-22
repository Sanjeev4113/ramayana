import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const rand = (a, b) => a + Math.random() * (b - a);

function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.2, 'rgba(255,220,150,.8)'); r.addColorStop(.5, 'rgba(255,120,40,.2)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}
function groundTex() {
  const s = 1024, c = document.createElement('canvas'); c.width = c.height = s; const g = c.getContext('2d');
  g.fillStyle = '#1d140e'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? '90,60,35' : '0,0,0'},${Math.random() * .18})`; const r = Math.random() * 6 + 1; g.beginPath(); g.arc(Math.random() * s, Math.random() * s, r, 0, 7); g.fill(); }
  for (let i = 0; i < 40; i++) { const x = Math.random() * s, y = Math.random() * s, r = Math.random() * 60 + 20; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 4); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function vanaraGeometry() {
  const body = new THREE.CapsuleGeometry(.3, .62, 4, 8); body.translate(0, .62, 0);
  const head = new THREE.SphereGeometry(.24, 10, 8); head.translate(.04, 1.3, 0);
  const tail = new THREE.TorusGeometry(.42, .045, 5, 12, Math.PI * 1.1); tail.rotateY(Math.PI / 2); tail.translate(-.32, .8, 0);
  const rock = new THREE.DodecahedronGeometry(.2); rock.translate(.32, 1.55, 0);
  return mergeGeometries([body, head, tail, rock].map(g => (g.index ? g.toNonIndexed() : g)));
}
function rakshasaGeometry() {
  const body = new THREE.CapsuleGeometry(.36, .8, 4, 8); body.translate(0, .76, 0);
  const head = new THREE.SphereGeometry(.26, 10, 8); head.translate(0, 1.56, 0);
  const h1 = new THREE.ConeGeometry(.06, .3, 6); h1.rotateZ(-.4); h1.translate(.14, 1.84, 0);
  const h2 = new THREE.ConeGeometry(.06, .3, 6); h2.rotateZ(.4); h2.translate(-.14, 1.84, 0);
  const spear = new THREE.BoxGeometry(.05, 2.2, .05); spear.translate(.42, 1.1, 0);
  const tip = new THREE.ConeGeometry(.08, .28, 6); tip.translate(.42, 2.3, 0);
  return mergeGeometries([body, head, h1, h2, spear, tip].map(g => (g.index ? g.toNonIndexed() : g)));
}

export function initWar(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#2a0f0a', .0105);
  const camera = new THREE.PerspectiveCamera(45, 1, .1, 400);
  camera.position.set(-16, 30, 54);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(12, 2, -6); controls.enableDamping = true; controls.enableZoom = false; controls.enablePan = false;
  controls.autoRotate = true; controls.autoRotateSpeed = .25; controls.maxPolarAngle = 1.22; controls.minPolarAngle = .75;

  /* ── Sky dome with low blood-red sun behind Laṅkā ── */
  const sky = new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uSun: { value: new THREE.Vector3(1, .08, -.35).normalize() } },
    vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 uSun; varying vec3 vP;
      void main(){ float h = vP.y; vec3 top = vec3(.02,.01,.03), hor = vec3(.55,.16,.05), low = vec3(.12,.03,.02);
        vec3 c = mix(hor, top, smoothstep(0., .45, h)); c = mix(low, c, smoothstep(-.1, .02, h));
        float s = max(dot(vP, uSun), 0.); c += vec3(1.,.35,.1)*pow(s, 180.)*3. + vec3(1.,.3,.08)*pow(s, 12.)*.5;
        gl_FragColor = vec4(c,1.); }`
  }));
  scene.add(sky);

  scene.add(new THREE.HemisphereLight('#ff9a6a', '#1a0a06', .9));
  const sunL = new THREE.DirectionalLight('#ff8a4a', 2.4); sunL.position.set(60, 18, -20); scene.add(sunL);
  const fill = new THREE.DirectionalLight('#6a7aff', .35); fill.position.set(-40, 20, 30); scene.add(fill);

  /* ── Ground, sea and setu ── */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 140), new THREE.MeshStandardMaterial({ map: groundTex(), roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(120, 200), new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } }, transparent: true,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uTime; varying vec2 vUv; void main(){ float w = sin(vUv.x*90.+uTime)*sin(vUv.y*70.-uTime*.7);
      vec3 c = vec3(.02,.05,.09) + vec3(.9,.35,.12)*pow(max(w,0.),12.)*.6; gl_FragColor = vec4(c, smoothstep(1.,.92,vUv.x)); }`
  }));
  sea.rotation.x = -Math.PI / 2; sea.position.set(-108, .05, 0); scene.add(sea);
  const setuN = 120, setu = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1), new THREE.MeshStandardMaterial({ color: '#5a4a3a', roughness: .9 }), setuN);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sv = new THREE.Vector3(), pv = new THREE.Vector3();
  for (let i = 0; i < setuN; i++) {
    pv.set(-50 - (i / setuN) * 110 + rand(-1, 1), rand(-.2, .4), rand(-5, 5));
    e.set(rand(0, 3), rand(0, 3), rand(0, 3)); q.setFromEuler(e); sv.setScalar(rand(.8, 1.8));
    setu.setMatrixAt(i, m4.compose(pv, q, sv));
  }
  scene.add(setu);

  /* ── Laṅkā on Trikūṭa ── */
  const lanka = new THREE.Group(); lanka.position.set(54, 0, -12); scene.add(lanka);
  const rockMat = new THREE.MeshStandardMaterial({ color: '#2a1a14', roughness: 1, flatShading: true });
  const hill = new THREE.Mesh(new THREE.ConeGeometry(30, 14, 9, 3), rockMat); hill.position.y = 3; lanka.add(hill);
  [[-14, 8, 20, 22], [12, -10, 16, 26]].forEach(([x, z, r, h]) => { const p = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7, 2), rockMat); p.position.set(x, h / 2 - 4, z - 20); lanka.add(p); });
  const goldMat = new THREE.MeshStandardMaterial({ color: '#d4a03a', metalness: .9, roughness: .3, emissive: '#4a2a00', emissiveIntensity: .6 });
  const wallMat = new THREE.MeshStandardMaterial({ color: '#8a6a2a', metalness: .6, roughness: .5, emissive: '#2a1500' });
  const winMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.6, .5) });
  for (let i = 0; i < 18; i++) {
    const a = -Math.PI * .55 + (i / 17) * Math.PI * 1.1, R = 17;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(6.4, 4, 1.2), wallMat);
    wall.position.set(-Math.cos(a) * R, 9, Math.sin(a) * R); wall.lookAt(0, 9, 0); lanka.add(wall);
    if (i % 3 === 0) {
      const tw = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 9, 10), wallMat); tw.position.set(-Math.cos(a) * R, 11, Math.sin(a) * R); lanka.add(tw);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.8, 3.6, 10), goldMat); roof.position.set(tw.position.x, 17.3, tw.position.z); lanka.add(roof);
      const w = new THREE.Mesh(new THREE.BoxGeometry(.5, 1, .2), winMat); w.position.set(tw.position.x * .93, 13, tw.position.z * .93); w.lookAt(-60, 13, 0); lanka.add(w);
    }
  }
  // the palace of Rāvaṇa
  const palace = new THREE.Group(); palace.position.set(2, 10, 0); lanka.add(palace);
  [[10, 6, 10], [7, 5, 7], [4.5, 4, 4.5], [2.4, 3, 2.4]].reduce((y, [w, h, d]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), goldMat); b.position.y = y + h / 2; palace.add(b); return y + h; }, 0);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 7, 8), goldMat); spire.position.y = 21.5; palace.add(spire);
  for (let i = 0; i < 40; i++) { const w = new THREE.Mesh(new THREE.BoxGeometry(.35, .7, .1), winMat); const lv = Math.floor(rand(0, 3)); const W = [10, 7, 4.5][lv] / 2 + .06; w.position.set(-W, [3, 8.5, 13][lv] + rand(-1, 1), rand(-W + .5, W - .5)); w.rotation.y = Math.PI / 2; palace.add(w); }

  /* ── Armies ── */
  const N = innerWidth < 700 ? 900 : 1800;
  const vMat = new THREE.MeshStandardMaterial({ roughness: .8, metalness: .1 });
  const rMat = new THREE.MeshStandardMaterial({ roughness: .6, metalness: .3, emissive: '#200000' });
  const armies = [
    { mesh: new THREE.InstancedMesh(vanaraGeometry(), vMat, N), side: -1, colors: ['#c8913a', '#b07a2a', '#d6a24a', '#8a5a2a', '#5a4030'] },
    { mesh: new THREE.InstancedMesh(rakshasaGeometry(), rMat, N), side: 1, colors: ['#5a1010', '#3a0a14', '#6a2a1a', '#2a0a0a', '#4a1a2a'] }
  ];
  const col = new THREE.Color();
  armies.forEach(A => {
    A.d = [];
    for (let i = 0; i < N; i++) {
      // vānaras: a loose host; bears (darker, bigger) mixed in
      const hx = A.side * rand(15, 40), hz = rand(-26, 26);
      A.d.push({ hx, hz, x: hx, z: hz, sp: rand(.8, 1.2), ph: rand(0, 6.28), s: rand(.85, 1.2) * (A.side < 0 && Math.random() < .12 ? 1.35 : 1), fall: 0 });
      col.set(A.colors[Math.floor(Math.random() * A.colors.length)]); A.mesh.setColorAt(i, col);
    }
    A.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(A.mesh);
  });

  /* ── Rāma & Lakṣmaṇa / Rāvaṇa beacons ── */
  const gt = glowTex();
  const ramaPos = new THREE.Vector3(-26, 3.2, 2);
  const ravanaPos = new THREE.Vector3(30, 3.5, -3);
  const mkGlow = (p, c, s) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, color: c, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); sp.position.copy(p); sp.scale.setScalar(s); scene.add(sp); return sp; };
  const mound = new THREE.Mesh(new THREE.CylinderGeometry(3, 4.5, 2.2, 10), rockMat); mound.position.set(ramaPos.x, 1.1, ramaPos.z); scene.add(mound);
  const ramaGlow = mkGlow(ramaPos, '#ffd36b', 7);
  const ramaLight = new THREE.PointLight('#ffcf7a', 30, 30, 2); ramaLight.position.copy(ramaPos).add(new THREE.Vector3(0, 2, 0)); scene.add(ramaLight);
  const chariot = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 2), goldMat); chariot.position.set(ravanaPos.x, 1.2, ravanaPos.z); scene.add(chariot);
  mkGlow(ravanaPos.clone().setY(4.5), '#ff3a2a', 6);

  /* ── Fires & torches ── */
  const fires = [];
  for (let i = 0; i < 26; i++) {
    const p = new THREE.Vector3(rand(-35, 40), rand(.6, 1.4), rand(-30, 30));
    if (i < 8) p.set(54 + rand(-16, 16), rand(10, 14), -12 + rand(-12, 12));
    fires.push({ s: mkGlow(p, i % 2 ? '#ff7a2a' : '#ffae3a', rand(2, 4)), base: rand(2, 4), ph: rand(0, 6) });
  }
  [-8, 12].forEach(xx => { const l = new THREE.PointLight('#ff6a2a', 40, 40, 2); l.position.set(xx, 4, 0); scene.add(l); fires.push({ light: l, ph: rand(0, 6) }); });

  /* ── Projectiles: rākṣasa arrows, vānara boulders, Rāma's arrows ── */
  const AN = 260, arrows = new THREE.InstancedMesh(new THREE.BoxGeometry(.05, .05, 1.4), new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), AN);
  const RN = 90, rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.45), new THREE.MeshStandardMaterial({ color: '#6a5a4a', roughness: 1, flatShading: true }), RN);
  scene.add(arrows, rocks);
  const shots = (n, kind) => Array.from({ length: n }, () => ({ kind, t0: -99, dur: 1, a: new THREE.Vector3(), b: new THREE.Vector3(), h: 4 }));
  const arrowD = shots(AN, 'arrow'), rockD = shots(RN, 'rock');
  const launch = (s, t, from, to, h, dur) => { s.t0 = t; s.dur = dur; s.a.copy(from); s.b.copy(to); s.h = h; };
  for (let i = 0; i < AN; i++) { col.set(i % 5 === 0 ? '#ffe08a' : '#ff6a3a'); arrows.setColorAt(i, col); }

  /* ── Astra effects ── */
  const BURST = 1400;
  const bPos = new Float32Array(BURST * 3), bVel = new Float32Array(BURST * 3), bLife = new Float32Array(BURST), bCol = new Float32Array(BURST * 3);
  const bGeo = new THREE.BufferGeometry();
  bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3)); bGeo.setAttribute('aLife', new THREE.BufferAttribute(bLife, 1)); bGeo.setAttribute('aCol', new THREE.BufferAttribute(bCol, 3));
  const burst = new THREE.Points(bGeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aLife; attribute vec3 aCol; varying float vL; varying vec3 vC; void main(){ vL=aLife; vC=aCol; vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize = (6.+aLife*16.) * 30. / -mv.z; }`,
    fragmentShader: `varying float vL; varying vec3 vC; void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,d)*vL; gl_FragColor=vec4(vC*2.5, a); }`
  }));
  burst.frustumCulled = false; scene.add(burst);
  let bIdx = 0;
  const emit = (p, c, n, speed, up = 0) => {
    col.set(c);
    for (let i = 0; i < n; i++) {
      const k = bIdx++ % BURST;
      bPos[k * 3] = p.x; bPos[k * 3 + 1] = p.y; bPos[k * 3 + 2] = p.z;
      const th = rand(0, 6.28), ph = Math.acos(rand(-1, 1)), sp = rand(.3, 1) * speed;
      bVel[k * 3] = Math.sin(ph) * Math.cos(th) * sp; bVel[k * 3 + 1] = Math.abs(Math.cos(ph)) * sp + up; bVel[k * 3 + 2] = Math.sin(ph) * Math.sin(th) * sp;
      bLife[k] = 1; bCol[k * 3] = col.r; bCol[k * 3 + 1] = col.g; bCol[k * 3 + 2] = col.b;
    }
  };
  const waves = [];
  const wave = (p, c, size, dur = 1.4) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1, .12, 8, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(3), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.rotation.x = Math.PI / 2; m.position.copy(p).setY(.4); scene.add(m); waves.push({ m, t0: clock.getElapsedTime(), size, dur });
  };
  const pillars = [];
  const pillar = (p, c, h = 60) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.4, h, 24, 1, true), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uC: { value: new THREE.Color(c) }, uA: { value: 1 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform vec3 uC; uniform float uA; varying vec2 vUv; void main(){ gl_FragColor = vec4(uC*1.7, pow(1.-vUv.y,1.5)*uA*.8); }`
    }));
    m.position.copy(p).setY(h / 2); scene.add(m); pillars.push({ m, t0: clock.getElapsedTime() });
  };
  const bolts = [];
  const lightning = (p, c) => {
    for (let k = 0; k < 5; k++) {
      const pts = []; let cur = p.clone().add(new THREE.Vector3(rand(-6, 6), 40, rand(-6, 6)));
      for (let i = 0; i < 14; i++) { pts.push(cur.clone()); cur = cur.clone().lerp(p, 1 / (14 - i)).add(new THREE.Vector3(rand(-1.5, 1.5), 0, rand(-1.5, 1.5))); }
      pts.push(p.clone());
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: new THREE.Color(c).multiplyScalar(4), transparent: true }));
      scene.add(l); bolts.push({ l, t0: clock.getElapsedTime() + k * .06 });
    }
  };
  const flash = new THREE.PointLight('#fff', 0, 120, 1.5); scene.add(flash);
  const astras = [];
  let shake = 0;

  function knockdown(A, p, r) {
    const t = clock.getElapsedTime();
    A.d.forEach(d => { if (!d.fall && (d.x - p.x) ** 2 + (d.z - p.z) ** 2 < r * r) d.fall = t + rand(0, .2); });
  }

  function impact(a) {
    const p = a.to, c = a.color;
    flash.position.copy(p).setY(6); flash.color.set(c); flash.intensity = a.id === 'brahmastra' ? 2600 : 1300;
    shake = a.id === 'brahmastra' ? 1.6 : .9;
    emit(p, c, a.id === 'brahmastra' ? 700 : 380, a.id === 'brahmastra' ? 1.1 : .7, .25);
    wave(p, c, a.id === 'brahmastra' ? 34 : 18);
    if (a.id === 'brahmastra') { pillar(p, c); wave(p, '#ffffff', 22, 1); }
    if (a.id === 'agneyastra') { for (let i = 0; i < 6; i++) setTimeout(() => emit(p.clone().add(new THREE.Vector3(rand(-5, 5), 0, rand(-5, 5))), i % 2 ? '#ff4a1a' : '#ffae3a', 120, .35, .3), i * 140); }
    if (a.id === 'aindrastra') lightning(p, c);
    knockdown(a.target === 'vanara' ? armies[0] : armies[1], p, a.id === 'brahmastra' ? 14 : 8);
  }

  function fireAstra(id, color) {
    const t = clock.getElapsedTime();
    if (id === 'nagapasha') {
      // Indrajit, invisible in the clouds, rains serpent-arrows on the vānara host
      for (let i = 0; i < 18; i++) {
        const from = new THREE.Vector3(rand(10, 25), 30, rand(-10, 10));
        const to = new THREE.Vector3(rand(-24, -6), .5, rand(-14, 14));
        astras.push(makeAstra({ id, color, from, to, t0: t + i * .07, dur: 1.1, target: 'vanara', wiggle: true, small: true }));
      }
      return;
    }
    const to = new THREE.Vector3(rand(8, 22), .5, rand(-10, 10));
    if (id === 'brahmastra') to.copy(ravanaPos).setY(.5);
    astras.push(makeAstra({ id, color, from: ramaPos.clone().add(new THREE.Vector3(0, 1.5, 0)), to, t0: t, dur: id === 'brahmastra' ? 1.5 : 1.1, target: 'rakshasa' }));
    emit(ramaPos.clone().add(new THREE.Vector3(0, 1.5, 0)), color, 80, .4);
  }

  function makeAstra(o) {
    const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, color: o.color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    head.scale.setScalar(o.small ? 1.4 : o.id === 'brahmastra' ? 5 : 3); head.visible = false; scene.add(head);
    const TR = 40, trailPos = new Float32Array(TR * 3);
    const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
    const trail = new THREE.Line(tg, new THREE.LineBasicMaterial({ color: new THREE.Color(o.color).multiplyScalar(4), transparent: true, opacity: .9 }));
    trail.frustumCulled = false; scene.add(trail);
    return { ...o, head, trail, trailPos, hist: [], done: false };
  }

  /* ── Post ── */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), .75, .55, .75));
  composer.addPass(new OutputPass());
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    camera.userData.dist = w / h < 1 ? 92 : 64;
  };
  resize(); addEventListener('resize', resize);
  { const d = camera.position.clone().sub(controls.target).setLength(camera.userData.dist); camera.position.copy(controls.target).add(d); }

  /* ── Loop ── */
  const clock = new THREE.Clock();
  let visible = true, raf = null, lastShot = 0;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) loop(); }).observe(canvas);
  const up = new THREE.Vector3(0, 1, 0), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  const arc = (s, k, out) => out.copy(s.a).lerp(s.b, k).setY(s.a.y + (s.b.y - s.a.y) * k + Math.sin(k * Math.PI) * s.h);

  function loop() {
    if (!visible) { raf = null; return; }
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
    const charge = Math.min(1, t / 9), ease = 1 - Math.pow(1 - charge, 3);

    // Armies
    armies.forEach(A => {
      const s = A.side;
      A.d.forEach((d, i) => {
        d.x = d.hx - s * 14 * ease * d.sp;
        if (s < 0) d.x = Math.min(d.x, -1.2); else d.x = Math.max(d.x, 1.2);
        d.z = d.hz + Math.sin(t * .3 + d.ph) * .6;
        const front = Math.abs(d.x) < 6 && charge >= 1;
        let x = d.x + (front ? Math.sin(t * 7 + d.ph) * .45 * -s : 0);
        let y = charge < 1 ? Math.abs(Math.sin(t * 9 + d.ph)) * .35 : (front ? Math.abs(Math.sin(t * 7 + d.ph)) * .25 : Math.abs(Math.sin(t * 2 + d.ph)) * .06);
        let rz = 0, rx = Math.sin(t * 7 + d.ph) * (front ? .25 : .05);
        // ambient melee losses on the front line
        if (front && !d.fall && Math.random() < .0004) d.fall = t;
        if (d.fall) {
          const k = t - d.fall;
          if (k > 0) { rz = Math.min(1, k * 2.5) * Math.PI / 2 * -s; y = -Math.max(0, k - 2.5) * .6; }
          if (k > 5) { d.fall = 0; d.hx = s * rand(28, 42); }
        }
        e.set(rx, s < 0 ? 0 : Math.PI, rz); q.setFromEuler(e);
        sv.setScalar(d.s); pv.set(x, y, d.z);
        A.mesh.setMatrixAt(i, m4.compose(pv, q, sv));
      });
      A.mesh.instanceMatrix.needsUpdate = true;
    });

    // Volleys
    if (t - lastShot > .06) {
      lastShot = t;
      const s = arrowD.find(x => t - x.t0 > x.dur) ;
      if (s) {
        const rama = Math.random() < .18;
        const from = rama ? ramaPos.clone().add(tmp.set(0, 1.5, 0)) : new THREE.Vector3(rand(4, 22), 1.6, rand(-20, 20));
        const to = rama ? new THREE.Vector3(rand(3, 24), .3, rand(-20, 20)) : new THREE.Vector3(rand(-22, -2), .3, rand(-20, 20));
        launch(s, t, from, to, rand(4, 9), rand(1.1, 1.9));
      }
      const r = rockD.find(x => t - x.t0 > x.dur);
      if (r && Math.random() < .5) launch(r, t, new THREE.Vector3(rand(-14, -3), 1.8, rand(-20, 20)), new THREE.Vector3(rand(2, 16), .3, rand(-20, 20)), rand(5, 10), rand(1.2, 2));
    }
    arrowD.forEach((s, i) => {
      const k = (t - s.t0) / s.dur;
      if (k < 0 || k > 1) { arrows.setMatrixAt(i, m4.makeScale(0, 0, 0)); return; }
      arc(s, k, pv); arc(s, Math.min(1, k + .02), tmp2);
      m4.lookAt(tmp2, pv, up); q.setFromRotationMatrix(m4); sv.set(1, 1, 1);
      arrows.setMatrixAt(i, m4.compose(pv, q, sv));
    });
    arrows.instanceMatrix.needsUpdate = true;
    rockD.forEach((s, i) => {
      const k = (t - s.t0) / s.dur;
      if (k < 0 || k > 1) { rocks.setMatrixAt(i, m4.makeScale(0, 0, 0)); return; }
      arc(s, k, pv); e.set(t * 4 + i, t * 3, 0); q.setFromEuler(e); sv.setScalar(1);
      rocks.setMatrixAt(i, m4.compose(pv, q, sv));
    });
    rocks.instanceMatrix.needsUpdate = true;

    // Astras
    astras.forEach(a => {
      if (a.done) return;
      const k = (t - a.t0) / a.dur;
      if (k < 0) return;
      a.head.visible = true;
      const kk = Math.min(1, k);
      tmp.copy(a.from).lerp(a.to, kk); tmp.y += Math.sin(kk * Math.PI) * (a.small ? 3 : 10);
      if (a.wiggle) { tmp.x += Math.sin(kk * 30) * .8 * (1 - kk); tmp.z += Math.cos(kk * 30) * .8 * (1 - kk); }
      a.head.position.copy(tmp);
      a.hist.unshift(tmp.clone()); if (a.hist.length > 40) a.hist.pop();
      for (let j = 0; j < 40; j++) { const h = a.hist[Math.min(j, a.hist.length - 1)]; a.trailPos[j * 3] = h.x; a.trailPos[j * 3 + 1] = h.y; a.trailPos[j * 3 + 2] = h.z; }
      a.trail.geometry.attributes.position.needsUpdate = true;
      if (k >= 1) {
        a.done = true; scene.remove(a.head, a.trail);
        if (a.small) { emit(a.to, a.color, 40, .4); wave(a.to, a.color, 4, .8); knockdown(armies[0], a.to, 2.5); shake = Math.max(shake, .3); flash.position.copy(a.to).setY(4); flash.color.set(a.color); flash.intensity = Math.max(flash.intensity, 300); }
        else impact(a);
      }
    });
    for (let i = astras.length - 1; i >= 0; i--) if (astras[i].done) astras.splice(i, 1);

    // Burst particles
    for (let k = 0; k < BURST; k++) {
      if (bLife[k] <= 0) continue;
      bVel[k * 3 + 1] -= .012;
      bPos[k * 3] += bVel[k * 3]; bPos[k * 3 + 1] = Math.max(.1, bPos[k * 3 + 1] + bVel[k * 3 + 1]); bPos[k * 3 + 2] += bVel[k * 3 + 2];
      bVel[k * 3] *= .97; bVel[k * 3 + 2] *= .97;
      bLife[k] -= .012;
    }
    bGeo.attributes.position.needsUpdate = true; bGeo.attributes.aLife.needsUpdate = true; bGeo.attributes.aCol.needsUpdate = true;

    waves.forEach(w => { const k = (t - w.t0) / w.dur; w.m.scale.setScalar(1 + k * w.size); w.m.material.opacity = Math.max(0, 1 - k); if (k > 1) { scene.remove(w.m); w.dead = true; } });
    for (let i = waves.length - 1; i >= 0; i--) if (waves[i].dead) waves.splice(i, 1);
    pillars.forEach(p => { const k = (t - p.t0) / 2.2; p.m.material.uniforms.uA.value = Math.max(0, 1 - k); p.m.scale.set(1 + k * 2, 1, 1 + k * 2); if (k > 1) { scene.remove(p.m); p.dead = true; } });
    for (let i = pillars.length - 1; i >= 0; i--) if (pillars[i].dead) pillars.splice(i, 1);
    bolts.forEach(b => { const k = (t - b.t0) / .5; b.l.visible = k > 0; b.l.material.opacity = k > 0 ? Math.max(0, 1 - k) * (Math.random() > .3 ? 1 : .2) : 0; if (k > 1) { scene.remove(b.l); b.dead = true; } });
    for (let i = bolts.length - 1; i >= 0; i--) if (bolts[i].dead) bolts.splice(i, 1);

    flash.intensity *= .9;
    fires.forEach(f => {
      if (f.s) f.s.scale.setScalar(f.base * (.85 + Math.sin(t * 9 + f.ph) * .1 + Math.random() * .08));
      if (f.light) f.light.intensity = 30 + Math.sin(t * 7 + f.ph) * 8 + Math.random() * 6;
    });
    ramaGlow.scale.setScalar(6.5 + Math.sin(t * 2) * .6);
    sea.material.uniforms.uTime.value = t;

    controls.update();
    if (shake > .01) { camera.position.x += rand(-1, 1) * shake * .4; camera.position.y += rand(-1, 1) * shake * .4; shake *= .9; }
    composer.render();
    raf = requestAnimationFrame(loop);
  }
  loop();

  // Let the user drag without fighting the auto-orbit
  canvas.addEventListener('pointerdown', () => { controls.autoRotate = false; });
  canvas.addEventListener('pointerup', () => setTimeout(() => { controls.autoRotate = true; }, 4000));

  return { fireAstra };
}
