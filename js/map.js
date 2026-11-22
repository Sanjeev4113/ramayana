import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { PLACES, JOURNEYS } from './data/places.js';

const gsap = window.gsap, d3 = window.d3, topojson = window.topojson;

// Bounding box of the epic's world: from Kekaya to Laṅkā, Kailāsa to Mithilā.
const BBOX = { w: 66, e: 93, s: 4.5, n: 34.5 };
const TW = 2048;

// Schematic courses of the rivers that flow through the story (lat, lon).
const RIVERS = [
  { name: 'Gaṅgā', pts: [[30.99, 78.94], [30.1, 78.3], [29.95, 78.16], [28.9, 78.6], [27.9, 79.3], [27.05, 79.92], [26.45, 80.33], [25.9, 81.1], [25.43, 81.88], [25.32, 83.0], [25.57, 83.98], [25.62, 85.1], [25.25, 87.0], [24.8, 87.9], [23.7, 88.3], [22.57, 88.36], [21.6, 88.1]] },
  { name: 'Yamunā', pts: [[31.01, 78.45], [30.3, 77.6], [29.4, 77.2], [28.6, 77.25], [27.5, 77.68], [27.18, 78.0], [26.78, 79.0], [25.9, 80.3], [25.43, 81.88]] },
  { name: 'Sarayū', pts: [[29.6, 80.3], [28.6, 80.9], [27.6, 81.6], [26.8, 82.2], [26.4, 83.3], [25.75, 84.6]] },
  { name: 'Narmadā', pts: [[22.67, 81.75], [23.1, 79.95], [22.75, 77.7], [22.18, 75.58], [21.9, 74.3], [21.7, 73.0]] },
  { name: 'Godāvarī', pts: [[19.93, 73.53], [20.0, 73.79], [19.5, 75.3], [19.15, 77.3], [18.9, 79.3], [17.67, 80.89], [17.0, 81.78], [16.6, 82.3]] },
  { name: 'Tuṅgabhadrā', pts: [[13.95, 75.6], [14.5, 75.8], [15.33, 76.46], [15.9, 77.6], [15.95, 78.2]] },
  { name: 'Kṛṣṇā', pts: [[17.98, 73.66], [17.2, 74.6], [16.6, 75.9], [16.2, 76.9], [15.95, 78.2], [16.3, 79.6], [16.5, 80.6], [15.9, 81.1]] }
];
// Mountain ranges drawn as relief and ornament (lat, lon, strength).
const RANGES = [
  { name: 'HIMAVAT', label: [29.4, 84.5], pts: [[34.2, 74.5], [33.2, 76.2], [32.2, 77.6], [31.2, 79.0], [30.3, 80.6], [29.4, 82.4], [28.5, 84.2], [28.0, 86.2], [27.9, 88.0], [27.8, 90.0], [27.9, 92.0]], k: 1 },
  { name: 'VINDHYA', label: [23.3, 78.0], pts: [[23.3, 74.6], [23.5, 76.0], [23.6, 77.5], [23.8, 79.0], [24.2, 80.6], [24.5, 82.0]], k: .45 },
  { name: 'SAHYĀDRI', label: [16.0, 74.0], pts: [[21.0, 73.6], [19.5, 73.6], [18.0, 73.7], [16.5, 73.9], [15.0, 74.3], [13.5, 75.0], [12.0, 75.6], [10.5, 76.9], [9.0, 77.2]], k: .5 },
  { name: 'EASTERN GHATS', label: [18.6, 83.4], pts: [[21.5, 85.6], [20.0, 84.3], [18.8, 83.2], [17.6, 82.2], [16.2, 80.5]], k: .3 },
  { name: '', label: null, pts: [[7.4, 80.5], [7.0, 80.8], [6.8, 80.7]], k: .35 }
];
const REGIONS = [
  ['KOSALA', 27.3, 81.6], ['VIDEHA', 26.4, 86.4], ['DAṆḌAKĀRAṆYA', 20.6, 80.9], ['KEKAYA', 31.8, 72.2],
  ['ARABIAN SEA', 15.5, 68.8], ['BAY OF BENGAL', 16.5, 87.5], ['INDIAN OCEAN', 6.0, 72.5]
];

export async function initMap({ canvas, labels, card, journeyList, playBtn, loading, onBell, episodesAt, openEpisode }) {
  const topo = await fetch('assets/data/land-50m.json').then(r => r.json());
  const land = topojson.feature(topo, topo.objects.land);

  const proj = d3.geoMercator().fitWidth(TW, { type: 'MultiPoint', coordinates: [[BBOX.w, BBOX.s], [BBOX.e, BBOX.n]] });
  const [[, y0], [, y1]] = [proj([BBOX.w, BBOX.n]), proj([BBOX.e, BBOX.s])];
  proj.translate([proj.translate()[0], proj.translate()[1] - y0]);
  const TH = Math.round(y1 - y0);
  const P = (lat, lon) => proj([lon, lat]);

  /* ── 1. Painted map texture ── */
  const tex = document.createElement('canvas'); tex.width = TW; tex.height = TH;
  const x = tex.getContext('2d');
  const path = d3.geoPath(proj, x);
  // ocean
  const og = x.createRadialGradient(TW * .55, TH * .55, 0, TW * .55, TH * .55, TW);
  og.addColorStop(0, '#0c2236'); og.addColorStop(1, '#03070d');
  x.fillStyle = og; x.fillRect(0, 0, TW, TH);
  // graticule
  x.strokeStyle = 'rgba(244,201,107,.07)'; x.lineWidth = 1.5;
  x.beginPath(); path(d3.geoGraticule().step([5, 5])()); x.stroke();
  // coastal ripples
  for (let i = 9; i >= 1; i--) {
    x.beginPath(); path(land);
    x.strokeStyle = `rgba(120,180,255,${.022 + (9 - i) * .004})`; x.lineWidth = i * 16; x.stroke();
  }
  // land
  x.save();
  x.beginPath(); path(land); x.clip();
  const lg = x.createLinearGradient(0, 0, 0, TH);
  lg.addColorStop(0, '#3a2a18'); lg.addColorStop(.5, '#2e2414'); lg.addColorStop(1, '#2a2416');
  x.fillStyle = lg; x.fillRect(0, 0, TW, TH);
  for (let i = 0; i < 26000; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '255,220,160' : '0,0,0'},${Math.random() * .05})`; x.fillRect(Math.random() * TW, Math.random() * TH, 2, 2); }
  // forest tint for Daṇḍaka & the south
  const fg = x.createRadialGradient(...P(19.5, 80.5), 0, ...P(19.5, 80.5), 360);
  fg.addColorStop(0, 'rgba(70,120,60,.35)'); fg.addColorStop(1, 'rgba(70,120,60,0)');
  x.fillStyle = fg; x.fillRect(0, 0, TW, TH);
  x.restore();
  // coastline
  x.beginPath(); path(land); x.strokeStyle = 'rgba(244,201,107,.85)'; x.lineWidth = 2.5; x.shadowColor = '#f4c96b'; x.shadowBlur = 12; x.stroke(); x.shadowBlur = 0;
  // mountains as ornament
  RANGES.forEach(r => {
    const pts = r.pts.map(([la, lo]) => P(la, lo));
    for (let i = 0; i < pts.length - 1; i++) {
      for (let s = 0; s < 4; s++) {
        const t = s / 4, px = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, py = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
        const sz = 14 + r.k * 18;
        x.beginPath(); x.moveTo(px - sz, py + sz * .6); x.lineTo(px, py - sz * .7); x.lineTo(px + sz, py + sz * .6);
        x.strokeStyle = `rgba(244,201,107,${.25 + r.k * .25})`; x.lineWidth = 2; x.stroke();
      }
    }
    if (r.label) { x.font = 'italic 600 30px Cinzel, serif'; x.fillStyle = 'rgba(244,201,107,.55)'; x.textAlign = 'center'; x.fillText(r.name, ...P(...r.label)); }
  });
  // rivers
  const line = d3.line().curve(d3.curveCatmullRom.alpha(.5)).context(x);
  RIVERS.forEach(rv => {
    const pts = rv.pts.map(([la, lo]) => P(la, lo));
    x.beginPath(); line(pts); x.strokeStyle = 'rgba(130,200,255,.25)'; x.lineWidth = 9; x.stroke();
    x.beginPath(); line(pts); x.strokeStyle = 'rgba(170,220,255,.85)'; x.lineWidth = 3; x.stroke();
    const mid = pts[Math.floor(pts.length / 2)];
    x.font = 'italic 26px "Cormorant Garamond", serif'; x.fillStyle = 'rgba(170,220,255,.8)'; x.textAlign = 'left';
    x.fillText(rv.name, mid[0] + 12, mid[1] - 10);
  });
  // regions & seas
  REGIONS.forEach(([n, la, lo]) => {
    const sea = /SEA|BAY|OCEAN/.test(n);
    x.font = `${sea ? 'italic 400 38px "Cormorant Garamond"' : '600 32px Cinzel'}, serif`;
    x.fillStyle = sea ? 'rgba(140,190,240,.45)' : 'rgba(255,220,160,.35)'; x.textAlign = 'center';
    if (x.letterSpacing !== undefined) x.letterSpacing = '8px';
    x.fillText(n, ...P(la, lo));
  });
  if (x.letterSpacing !== undefined) x.letterSpacing = '0px';
  // compass rose
  const [cx, cy] = P(8.5, 88.5);
  x.save(); x.translate(cx, cy); x.strokeStyle = 'rgba(244,201,107,.6)'; x.fillStyle = 'rgba(244,201,107,.6)';
  for (let i = 0; i < 16; i++) { x.rotate(Math.PI / 8); x.beginPath(); x.moveTo(0, 0); x.lineTo(i % 2 ? 8 : 14, -10); x.lineTo(0, i % 4 === 3 ? -120 : -60); x.closePath(); i % 2 ? x.stroke() : x.fill(); }
  x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); x.stroke();
  x.font = '600 34px Cinzel, serif'; x.textAlign = 'center'; x.fillText('N', 0, -132);
  x.restore();

  /* ── 2. Height map for relief ── */
  const hc = document.createElement('canvas'); hc.width = TW / 2; hc.height = Math.round(TH / 2);
  const h = hc.getContext('2d');
  h.fillStyle = '#000'; h.fillRect(0, 0, hc.width, hc.height);
  h.save(); h.scale(.5, .5);
  h.filter = 'blur(10px)';
  h.beginPath(); d3.geoPath(proj, h)(land); h.fillStyle = '#2a2a2a'; h.fill();
  h.globalCompositeOperation = 'lighter';
  RANGES.forEach(r => r.pts.forEach(([la, lo], i) => {
    const [px, py] = P(la, lo); const rad = 60 + r.k * 90;
    const g = h.createRadialGradient(px, py, 0, px, py, rad);
    const v = Math.round(60 + r.k * 140);
    g.addColorStop(0, `rgb(${v},${v},${v})`); g.addColorStop(1, 'rgb(0,0,0)');
    h.fillStyle = g; h.fillRect(px - rad, py - rad, rad * 2, rad * 2);
  }));
  h.restore();
  // re-clip so mountains do not rise from the sea
  h.globalCompositeOperation = 'destination-in';
  h.save(); h.scale(.5, .5); h.filter = 'blur(6px)'; h.beginPath(); d3.geoPath(proj, h)(land); h.fillStyle = '#fff'; h.fill(); h.restore();
  const hdata = h.getImageData(0, 0, hc.width, hc.height).data;

  /* ── 3. Three.js scene ── */
  const PW = 20, PH = PW * TH / TW, DISP = 1.1;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#03060b');
  scene.fog = new THREE.Fog('#03060b', 22, 48);
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 200);
  camera.position.set(0, 27, 13);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = .08;
  controls.maxPolarAngle = 1.25; controls.minDistance = 3; controls.maxDistance = 42;
  controls.target.set(0, 0, .8);
  controls.enableZoom = true;

  const colorTex = new THREE.CanvasTexture(tex); colorTex.colorSpace = THREE.SRGBColorSpace; colorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const heightTex = new THREE.CanvasTexture(hc);
  const geo = new THREE.PlaneGeometry(PW, PH, 360, Math.round(360 * PH / PW));
  const mat = new THREE.MeshStandardMaterial({ map: colorTex, displacementMap: heightTex, displacementScale: DISP, bumpMap: heightTex, bumpScale: 3, roughness: .92, metalness: .05 });
  const ground = new THREE.Mesh(geo, mat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  scene.add(new THREE.HemisphereLight('#ffe2b0', '#0a1830', 1.1));
  const sun = new THREE.DirectionalLight('#ffd7a0', 2.2); sun.position.set(-8, 10, -6); scene.add(sun);
  const rim = new THREE.DirectionalLight('#7aa8ff', .6); rim.position.set(8, 4, 10); scene.add(rim);

  const heightAt = (px, py) => {
    const ix = Math.min(hc.width - 1, Math.max(0, Math.round(px / 2))), iy = Math.min(hc.height - 1, Math.max(0, Math.round(py / 2)));
    return hdata[(iy * hc.width + ix) * 4] / 255 * DISP;
  };
  const world = (lat, lon) => {
    const [px, py] = P(lat, lon);
    return new THREE.Vector3((px / TW - .5) * PW, heightAt(px, py) + .02, (py / TH - .5) * PH);
  };

  /* ── Beacons ── */
  const beamMat = (c) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(c) }, uI: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 uColor; uniform float uI; varying vec2 vUv; void main(){ float a = pow(1.-vUv.y, 1.6) * uI; gl_FragColor = vec4(uColor*2., a); }`
  });
  const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, '#fff'); r.addColorStop(.3, 'rgba(255,200,100,.9)'); r.addColorStop(1, 'rgba(255,120,30,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const markers = {};
  const hitTargets = [];
  PLACES.forEach(pl => {
    const p = world(pl.lat, pl.lon);
    const major = ['ayodhya', 'mithila', 'chitrakoot', 'panchavati', 'kishkindha', 'lanka', 'rameswaram'].includes(pl.id);
    const H = major ? 1.3 : .75;
    const g = new THREE.Group(); g.position.copy(p); scene.add(g);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.018, .05, H, 10, 1, true), beamMat(pl.id === 'lanka' ? '#ff6a4a' : '#f4c96b'));
    beam.position.y = H / 2; g.add(beam);
    const ring = new THREE.Mesh(new THREE.RingGeometry(.12, .16, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 1.4, .6), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = .01; g.add(ring);
    const dot = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, sizeAttenuation: false }));
    dot.scale.setScalar(major ? .05 : .034); dot.position.y = H; g.add(dot);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(.35, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = H * .6; hit.userData.id = pl.id; g.add(hit); hitTargets.push(hit);
    const el = document.createElement('div');
    el.className = 'map-label'; el.dataset.id = pl.id;
    el.innerHTML = `<div class="ml-dev">${pl.dev}</div><div class="ml-en">${pl.name}</div>`;
    labels.appendChild(el);
    markers[pl.id] = { pl, g, beam, ring, dot, el, top: new THREE.Vector3(p.x, p.y + H, p.z), phase: Math.random() * 6, major };
  });

  /* ── Journeys ── */
  const pathMat = (c) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(c) }, uProg: { value: 1 }, uTime: { value: 0 }, uAlpha: { value: .35 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 uColor; uniform float uProg, uTime, uAlpha; varying vec2 vUv;
      void main(){ if (vUv.x > uProg) discard;
        float head = smoothstep(uProg-.04, uProg, vUv.x) * step(uProg, .999);
        float pulse = .5 + .5*sin(vUv.x*160. - uTime*6.);
        gl_FragColor = vec4(uColor*(1.6 + head*3.), uAlpha*(.55 + .45*pulse) + head); }`
  });
  const journeys = JOURNEYS.map(j => {
    const pts = [];
    for (let i = 0; i < j.path.length - 1; i++) {
      const a = markers[j.path[i]].g.position, b = markers[j.path[i + 1]].g.position;
      const d = a.distanceTo(b);
      const mid = a.clone().lerp(b, .5); mid.y += Math.max(.25, d * .28);
      const seg = new THREE.QuadraticBezierCurve3(a.clone().setY(a.y + .05), mid, b.clone().setY(b.y + .05));
      const sp = seg.getPoints(40); if (i > 0) sp.shift(); pts.push(...sp);
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 600, .03, 6, false), pathMat(j.color));
    scene.add(mesh);
    return { ...j, curve, mesh };
  });
  const traveler = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, color: '#fff2c0' }));
  traveler.scale.setScalar(.7); traveler.visible = false; scene.add(traveler);

  /* ── Post ── */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), .7, .5, .8));
  composer.addPass(new OutputPass());

  const resize = () => {
    const w = canvas.clientWidth, hh = canvas.clientHeight;
    renderer.setSize(w, hh, false); composer.setSize(w, hh);
    camera.aspect = w / hh; camera.updateProjectionMatrix();
  };
  resize(); addEventListener('resize', resize);

  /* ── UI: journey list ── */
  journeyList.innerHTML = `<h5>Journeys</h5>` + JOURNEYS.map(j => `<button class="journey-btn" data-j="${j.id}" style="--jc:${j.color}"><i></i>${j.name}</button>`).join('');
  let activeJourney = null, playing = null;
  const setLabelsFor = (ids) => Object.values(markers).forEach(m => m.el.classList.toggle('dim', !!ids && !ids.includes(m.pl.id)));

  function flyTo(target, dist = 7, dur = 1.6) {
    const dir = camera.position.clone().sub(controls.target).normalize();
    dir.y = Math.max(dir.y, .6); dir.normalize();
    const camPos = target.clone().add(dir.multiplyScalar(dist));
    gsap.to(controls.target, { x: target.x, y: target.y, z: target.z, duration: dur, ease: 'power3.inOut' });
    gsap.to(camera.position, { x: camPos.x, y: camPos.y, z: camPos.z, duration: dur, ease: 'power3.inOut' });
  }

  function showJourney(id, animate = true) {
    const j = journeys.find(x => x.id === id);
    activeJourney = id;
    journeys.forEach(o => { o.mesh.visible = o.id === id; });
    $$('.journey-btn', journeyList).forEach(b => b.classList.toggle('active', b.dataset.j === id));
    setLabelsFor(j.path);
    const box = new THREE.Box3().setFromPoints(j.path.map(pid => markers[pid].g.position));
    const c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3()).length();
    flyTo(c, Math.max(6, size * 1.25), 1.4);
    const u = j.mesh.material.uniforms; u.uAlpha.value = .9;
    traveler.visible = true; traveler.material.color.set(j.color);
    onBell?.();
    return new Promise(res => {
      if (!animate) { u.uProg.value = 1; res(); return; }
      gsap.fromTo(u.uProg, { value: 0 }, { value: 1, duration: 2.4 + j.path.length * .7, delay: .8, ease: 'power1.inOut',
        onUpdate: () => traveler.position.copy(j.curve.getPointAt(Math.min(1, u.uProg.value))).add(new THREE.Vector3(0, .05, 0)),
        onComplete: res });
    });
  }
  function resetJourneys() {
    activeJourney = null; traveler.visible = false; setLabelsFor(null);
    journeys.forEach(o => { o.mesh.visible = true; o.mesh.material.uniforms.uProg.value = 1; o.mesh.material.uniforms.uAlpha.value = .35; });
    $$('.journey-btn', journeyList).forEach(b => b.classList.remove('active'));
  }
  journeyList.addEventListener('click', e => {
    const b = e.target.closest('[data-j]'); if (!b) return;
    stopPlay();
    if (activeJourney === b.dataset.j) { resetJourneys(); flyTo(new THREE.Vector3(0, 0, .8), 30); return; }
    showJourney(b.dataset.j);
  });

  async function playAll() {
    const token = {}; playing = token;
    playBtn.querySelector('.btn-en').textContent = '■ Stop';
    const order = ['vishwamitra', 'exile', 'ravana-flight', 'search', 'leap', 'war', 'sanjeevani', 'pushpaka'];
    for (const id of order) {
      if (playing !== token) return;
      await showJourney(id);
      if (playing !== token) return;
      const j = JOURNEYS.find(x => x.id === id);
      openCard(j.path[j.path.length - 1], false);
      await new Promise(r => setTimeout(r, 2200));
    }
    stopPlay();
  }
  function stopPlay() { playing = null; playBtn.querySelector('.btn-en').textContent = '▶ Play the Whole Journey'; }
  playBtn.addEventListener('click', () => (playing ? stopPlay() : playAll()));

  /* ── UI: place card ── */
  const KN = ['Prologue', 'Bāla', 'Ayodhyā', 'Araṇya', 'Kiṣkindhā', 'Sundara', 'Yuddha', 'Uttara'];
  const CERT = { firm: 'Firmly identified', traditional: 'Traditional identification', approximate: 'Approximate region', disputed: 'Traditions differ' };
  function openCard(id, fly = true) {
    const m = markers[id]; if (!m) return;
    const pl = m.pl;
    const eps = episodesAt ? episodesAt(id) : [];
    card.innerHTML = `<button class="pc-close" aria-label="Close">✕</button>
      <div class="pc-dev">${pl.dev}</div><div class="pc-name">${pl.name}</div>
      <span class="pc-cert ${pl.certainty}">${CERT[pl.certainty]}</span>
      <div class="pc-modern"><b>Today</b>${pl.modern}</div>
      <p>${pl.desc}</p>
      <p style="color:var(--muted);font-size:14px">Kāṇḍas: ${pl.kanda.map(k => KN[k]).join(' · ')}</p>
      ${eps.length ? `<div class="ep-chips">${eps.map(e => `<button class="chip" data-ep="${e.book}:${e.i}">${e.title}</button>`).join('')}</div>` : ''}`;
    card.hidden = false;
    gsap.fromTo(card, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: .5 });
    Object.values(markers).forEach(o => o.el.classList.toggle('hot', o === m));
    if (fly) flyTo(m.g.position, 5);
  }
  card.addEventListener('click', e => {
    if (e.target.closest('.pc-close')) { card.hidden = true; return; }
    const ep = e.target.closest('[data-ep]'); if (ep) { const [b, i] = ep.dataset.ep.split(':'); openEpisode?.(b, +i); }
  });
  labels.addEventListener('click', e => { const l = e.target.closest('.map-label'); if (l) { stopPlay(); openCard(l.dataset.id); } });

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let downAt = null;
  canvas.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; stopPlay(); });
  canvas.addEventListener('pointerup', e => {
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5) return;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(hitTargets)[0];
    if (hit) openCard(hit.object.userData.id);
  });

  // Only let wheel-zoom capture after the user has clicked into the map, so page scrolling still works.
  let mapHot = false;
  controls.enableZoom = false;
  canvas.addEventListener('pointerdown', () => { mapHot = true; controls.enableZoom = true; });
  canvas.parentElement.addEventListener('pointerleave', () => { mapHot = false; controls.enableZoom = false; });

  /* ── Loop ── */
  let visible = true, raf = null;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) loop(); }).observe(canvas);
  const v = new THREE.Vector3();
  const clock = new THREE.Clock();
  function loop() {
    if (!visible) { raf = null; return; }
    const t = clock.getElapsedTime();
    controls.update();
    journeys.forEach(j => { j.mesh.material.uniforms.uTime.value = t; });
    const w = canvas.clientWidth, hh = canvas.clientHeight;
    Object.values(markers).forEach(m => {
      const s = 1 + ((t * .6 + m.phase) % 1) * 2.2;
      m.ring.scale.setScalar(s); m.ring.material.opacity = 1 - ((t * .6 + m.phase) % 1);
      v.copy(m.top).project(camera);
      const zoomedOut = camera.position.distanceTo(controls.target) > 15;
      const wanted = m.major || m.el.classList.contains('hot') || !zoomedOut || (activeJourney && JOURNEYS.find(j => j.id === activeJourney).path.includes(m.pl.id));
      const vis = wanted && v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
      m.el.style.display = vis ? '' : 'none';
      if (vis) m.el.style.transform = `translate(${(v.x * .5 + .5) * w}px, ${(-v.y * .5 + .5) * hh}px) translate(-50%, -120%)`;
    });
    composer.render();
    raf = requestAnimationFrame(loop);
  }
  // labels are positioned by transform from the top-left corner
  $$('.map-label', labels).forEach(l => { l.style.left = '0'; l.style.top = '0'; });

  loading.remove();
  gsap.from(camera.position, { y: 40, z: 30, duration: 3, ease: 'power3.out' });
  loop();

  return { focusPlace: (id) => { stopPlay(); openCard(id); } };
}

function $$(s, el) { return [...el.querySelectorAll(s)]; }
