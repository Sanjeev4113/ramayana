// The way in: a night sky over which a sacred lotus maṇḍala is drawn in gold around ॐ while the site loads, then a
// dawn that rises behind the Rāma-nāma śloka, and on entering, the sun flares into the day of the Rāmāyaṇa.
//   DawnSky   a full-screen WebGL sky: stars, a golden nebula, a rising sun with slow god rays, clouds and grain
//   GoldDust  drifting motes of gold light (canvas 2D, additive)
//   mandala() the loader's lotus maṇḍala, drawn stroke by stroke
const gsap = window.gsap;

const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime, uDawn, uFlare, uSunY; uniform vec2 uMouse;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 7.1; a *= .5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - .5) * asp, uv.y);
  vec2 sun = vec2(uMouse.x * .04, uSunY + uMouse.y * .015);
  vec2 d = p - sun; float r = length(d);
  // sky: a deep indigo night that warms into a saffron dawn at the horizon
  vec3 nTop = vec3(.010, .012, .035), nHor = vec3(.055, .035, .075);
  vec3 dTop = vec3(.045, .060, .160), dHor = vec3(.98, .56, .22);
  vec3 top = mix(nTop, dTop, uDawn), hor = mix(nHor, dHor, uDawn * .85);
  vec3 col = mix(hor, top, pow(clamp(uv.y, 0., 1.), .62));
  // stars, fading as the dawn grows
  vec2 sg = floor(gl_FragCoord.xy / 2.);
  float tw = .5 + .5 * sin(uTime * 1.7 + hash(sg + 3.) * 40.);
  col += step(.9968, hash(sg)) * tw * (1. - uDawn) * smoothstep(.25, .9, uv.y) * vec3(1., .92, .78) * .9;
  // a slow golden nebula
  float n = fbm(p * 1.4 + vec2(uTime * .008, -uTime * .005));
  float n2 = fbm(p * 3.1 - vec2(uTime * .006, 0.));
  col += vec3(.95, .62, .26) * pow(n, 3.2) * .30 * (1. - uDawn * .45);
  col += vec3(.55, .35, .75) * pow(n2, 4.) * .10 * (1. - uDawn);
  // god rays from the sun
  float ang = atan(d.y, d.x);
  float rays = fbm(vec2(ang * 5.5, uTime * .045)) * fbm(vec2(ang * 11. + 2., -uTime * .035));
  rays = pow(rays, 1.5) * 2.4;
  col += vec3(1., .80, .46) * rays * smoothstep(1.7, .0, r) * (.10 + .55 * uDawn);
  // the sun: corona, glow and disc
  col += vec3(1., .86, .58) * exp(-r * r * 16.) * (.18 + .95 * uDawn);
  col += vec3(1., .66, .30) * exp(-r * 3.0) * (.10 + .42 * uDawn);
  col += vec3(1., .93, .78) * smoothstep(.034, .018, r) * smoothstep(.05, .3, uDawn) * .9;
  col += vec3(1., .80, .50) * exp(-r * r * 90.) * (.35 + .5 * uDawn);
  // soft clouds along the horizon, lit from behind
  float c = fbm(vec2(p.x * 1.2 + uTime * .004, p.y * 4.2 - uTime * .002));
  float cm = smoothstep(.46, .78, c) * smoothstep(.42, .02, uv.y);
  vec3 cloud = mix(vec3(.07, .05, .09), vec3(1., .64, .38), uDawn) * (.55 + .7 * c);
  col = mix(col, cloud, cm * .55);
  // the flare of entering
  col = mix(col, vec3(1., .95, .84), uFlare);
  // vignette and film grain
  float vig = smoothstep(1.3, .2, length((uv - .5) * vec2(asp, 1.)));
  col *= mix(.5, 1., vig);
  col += (hash(gl_FragCoord.xy + fract(uTime) * 91.) - .5) * .025;
  gl_FragColor = vec4(col, 1.);
}`;

export class DawnSky {
  constructor(canvas, { scale = .6 } = {}) {
    this.c = canvas; this.scale = scale; this.u = { dawn: 0, flare: 0, sunY: .05 }; this.mouse = [0, 0]; this.m = [0, 0];
    const gl = this.gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) { canvas.style.background = 'radial-gradient(ellipse at 50% 80%, #3a2010, #05060f 70%)'; return; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(o)); return o; };
    const pr = this.pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }'));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr); gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    this.loc = Object.fromEntries(['uRes', 'uTime', 'uDawn', 'uFlare', 'uSunY', 'uMouse'].map(k => [k, gl.getUniformLocation(pr, k)]));
    this.resize = this.resize.bind(this); addEventListener('resize', this.resize); this.resize();
    this.onMove = e => { this.mouse = [e.clientX / innerWidth * 2 - 1, 1 - e.clientY / innerHeight * 2]; };
    addEventListener('pointermove', this.onMove, { passive: true });
    this.t0 = performance.now(); this.running = true;
    const loop = () => { if (!this.running) return; this.draw(); this.raf = requestAnimationFrame(loop); };
    loop();
  }
  resize() {
    const s = Math.min(devicePixelRatio || 1, 1.5) * this.scale;
    this.c.width = Math.round(innerWidth * s); this.c.height = Math.round(innerHeight * s);
    this.gl?.viewport(0, 0, this.c.width, this.c.height);
  }
  draw() {
    const gl = this.gl, L = this.loc; if (!gl) return;
    this.m[0] += (this.mouse[0] - this.m[0]) * .04; this.m[1] += (this.mouse[1] - this.m[1]) * .04;
    gl.uniform2f(L.uRes, this.c.width, this.c.height); gl.uniform1f(L.uTime, (performance.now() - this.t0) / 1000);
    gl.uniform1f(L.uDawn, this.u.dawn); gl.uniform1f(L.uFlare, this.u.flare); gl.uniform1f(L.uSunY, this.u.sunY);
    gl.uniform2f(L.uMouse, this.m[0], this.m[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  stop() { this.running = false; cancelAnimationFrame(this.raf); removeEventListener('resize', this.resize); removeEventListener('pointermove', this.onMove); }
}

// motes of golden light rising slowly, nearer ones larger and faster, drifting with the pointer
export class GoldDust {
  constructor(canvas, n = 120) {
    this.c = canvas; this.x = canvas.getContext('2d'); this.parts = []; this.mx = 0; this.running = true;
    const s = document.createElement('canvas'); s.width = s.height = 64; const g = s.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,248,220,1)'); gr.addColorStop(.22, 'rgba(255,206,120,.85)'); gr.addColorStop(1, 'rgba(255,150,40,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); this.sprite = s;
    this.resize = () => { this.dpr = Math.min(devicePixelRatio || 1, 2); this.w = canvas.width = innerWidth * this.dpr; this.h = canvas.height = innerHeight * this.dpr; };
    this.resize(); addEventListener('resize', this.resize);
    this.onMove = e => { this.mx = e.clientX / innerWidth - .5; }; addEventListener('pointermove', this.onMove, { passive: true });
    for (let i = 0; i < n; i++) this.parts.push(this.spawn(true));
    const loop = t => { if (!this.running) return; this.frame(t); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }
  spawn(init) {
    const z = Math.random();
    return { x: Math.random() * this.w, y: init ? Math.random() * this.h : this.h + 20, z, s: (1.5 + z * z * 7) * this.dpr,
      vy: (.12 + z * .5) * this.dpr, ph: Math.random() * 6.28 };
  }
  frame(t) {
    const { x, w, h } = this; x.clearRect(0, 0, w, h); x.globalCompositeOperation = 'lighter';
    for (const p of this.parts) {
      p.y -= p.vy; p.x += Math.sin(t / 1600 + p.ph) * .25 * this.dpr - this.mx * p.z * .6;
      const tw = .55 + .45 * Math.sin(t / 420 + p.ph * 5);
      x.globalAlpha = tw * Math.min(1, p.y / (h * .35)) * (.35 + p.z * .6) * (this.alpha ?? 1);
      x.drawImage(this.sprite, p.x - p.s, p.y - p.s, p.s * 2, p.s * 2);
      if (p.y < -30 || p.x < -40 || p.x > w + 40) Object.assign(p, this.spawn(false));
    }
  }
  stop() { this.running = false; cancelAnimationFrame(this.raf); removeEventListener('resize', this.resize); removeEventListener('pointermove', this.onMove); }
  pause() { this.running = false; cancelAnimationFrame(this.raf); }
  resume() { if (this.running) return; this.running = true; const loop = t => { if (!this.running) return; this.frame(t); this.raf = requestAnimationFrame(loop); }; this.raf = requestAnimationFrame(loop); }
}

// a lotus maṇḍala of three rings of petals, a ring of pearls and a ṣaṭkoṇa (six-pointed star), every line drawn in turn
export function mandala(svg) {
  const C = 200, P = [];
  const petal = (r0, r1, w, n, rot = 0) => {
    for (let i = 0; i < n; i++) {
      const a = rot + i * 360 / n;
      P.push(`<path pathLength="1" d="M${C} ${C - r0} C ${C - w} ${C - r0 - (r1 - r0) * .35}, ${C - w * .55} ${C - r1 + 6}, ${C} ${C - r1} C ${C + w * .55} ${C - r1 + 6}, ${C + w} ${C - r0 - (r1 - r0) * .35}, ${C} ${C - r0}Z" transform="rotate(${a} ${C} ${C})"/>`);
    }
  };
  const ring = r => P.push(`<circle pathLength="1" cx="${C}" cy="${C}" r="${r}"/>`);
  ring(62); petal(64, 104, 15, 8); ring(108); petal(110, 146, 10, 16, 11.25); ring(150); petal(152, 178, 6, 32); ring(184); ring(192);
  const tri = (r, rot) => { const pts = [0, 1, 2].map(k => { const a = (rot + k * 120 - 90) * Math.PI / 180; return `${C + Math.cos(a) * r},${C + Math.sin(a) * r}`; }); P.push(`<polygon pathLength="1" points="${pts.join(' ')}"/>`); };
  tri(56, 0); tri(56, 180);
  let pearls = ''; for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2; pearls += `<circle cx="${C + Math.cos(a) * 188}" cy="${C + Math.sin(a) * 188}" r="1.3"/>`; }
  svg.innerHTML = `<defs><linearGradient id="md-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3cf"/><stop offset=".45" stop-color="#f2c66a"/><stop offset="1" stop-color="#a86a1c"/></linearGradient>
    <filter id="md-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <g class="md-lines" fill="none" stroke="url(#md-gold)" stroke-width="1.1" filter="url(#md-glow)">${P.join('')}</g>
    <g class="md-pearls" fill="#f4c96b">${pearls}</g>
    <circle class="md-progress" cx="${C}" cy="${C}" r="197" fill="none" stroke="url(#md-gold)" stroke-width="1.6" pathLength="1" transform="rotate(-90 ${C} ${C})"/>`;
  const lines = [...svg.querySelectorAll('.md-lines > *')];
  lines.forEach(l => { l.style.strokeDasharray = 1; l.style.strokeDashoffset = 1; });
  return { lines, pearls: svg.querySelector('.md-pearls'), progress: svg.querySelector('.md-progress') };
}

// split a line of text into words (kept whole so Devanagari conjuncts never break), for a word-by-word reveal
export function words(el) {
  const parts = el.textContent.trim().split(/\s+/);
  el.innerHTML = parts.map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
  return [...el.querySelectorAll('.w > span')];
}

export { gsap };
