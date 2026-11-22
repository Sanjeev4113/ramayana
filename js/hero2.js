// The hero: the painted darbār of Śrī Rāma, brought to life. The painting is displaced by its depth map, so it
// moves with real parallax as the pointer drifts and the page scrolls; a slow push-in, god rays from the light of
// the hall, and motes of gold in the air. Built from assets/backgrounds/hero.webp and hero-depth.png
// (tools/build-backgrounds.mjs); without them the page keeps the modelled hero of hero.js.
import { GoldDust } from './entry.js';

const FRAG = `
precision highp float;
uniform sampler2D tCol, tDep; uniform vec2 uRes, uImg, uMouse, uLight; uniform float uTime, uScroll, uIntro;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 7.1; a *= .5; } return v; }
void main(){
  vec2 frag = gl_FragCoord.xy / uRes;
  // cover the screen with the painting, anchored a little above centre so the throne stays in view
  vec2 s = uRes / uImg; float sc = max(s.x, s.y); vec2 size = uImg * sc; vec2 off = (uRes - size) * vec2(.5, .62);
  vec2 uv = (gl_FragCoord.xy - off) / size; uv.y = 1. - uv.y;
  float z = 1. + .07 * (1. - uIntro) + .10 * uScroll + .012 * sin(uTime * .12);
  uv = (uv - vec2(.5, .45)) / z + vec2(.5, .45);
  float d = texture2D(tDep, uv).r;
  uv += (uMouse * vec2(.016, .010) + vec2(0., -.03 * uScroll)) * (d - .4);
  vec3 col = texture2D(tCol, clamp(uv, .001, .999)).rgb;
  // god rays from the light of the hall
  vec2 lp = vec2(uLight.x * uRes.x / uRes.y, uLight.y), q = vec2(frag.x * uRes.x / uRes.y, frag.y) - lp;
  float ang = atan(q.y, q.x), r = length(q);
  float rays = pow(fbm(vec2(ang * 6., uTime * .04)) * fbm(vec2(ang * 12. + 3., -uTime * .03)), 1.5) * 2.;
  col += vec3(1., .82, .5) * rays * smoothstep(1.4, 0., r) * .16 * (1. - d * .5);
  col += vec3(1., .78, .45) * exp(-r * 2.6) * .10;
  // the flare of arrival dissolving into the painting
  col = mix(vec3(1., .95, .84), col, smoothstep(0., 1., uIntro));
  float vig = smoothstep(1.25, .25, length((frag - vec2(.5, .48)) * vec2(uRes.x / uRes.y, 1.)));
  col *= mix(.45, 1., vig);
  col += (hash(gl_FragCoord.xy + fract(uTime) * 91.) - .5) * .02;
  gl_FragColor = vec4(col, 1.);
}`;

function load(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }

export async function initHero2(canvas, dustCanvas) {
  const man = await fetch('assets/backgrounds/manifest.json').then(r => r.json()).catch(() => ({}));
  const meta = man.hero; if (!meta) return null;
  const [img, dep] = await Promise.all([load(meta.src), load(meta.depth)]).catch(() => []);
  if (!img) return null;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false }); if (!gl) return null;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }'));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr); gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  const tex = (im, unit) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; };
  tex(img, 0); tex(dep, 1);
  const L = Object.fromEntries(['tCol', 'tDep', 'uRes', 'uImg', 'uMouse', 'uLight', 'uTime', 'uScroll', 'uIntro'].map(k => [k, gl.getUniformLocation(pr, k)]));
  gl.uniform1i(L.tCol, 0); gl.uniform1i(L.tDep, 1); gl.uniform2f(L.uImg, img.width, img.height);
  gl.uniform2f(L.uLight, meta.keyX ?? .5, 1 - (meta.keyY ?? .1));
  const st = { intro: 0, scroll: 0, mouse: [0, 0], m: [0, 0], running: true, visible: true };
  const resize = () => { const s = Math.min(devicePixelRatio || 1, 1.75); canvas.width = Math.round(canvas.clientWidth * s); canvas.height = Math.round(canvas.clientHeight * s); gl.viewport(0, 0, canvas.width, canvas.height); };
  resize(); addEventListener('resize', resize);
  addEventListener('pointermove', e => { st.mouse = [e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1]; }, { passive: true });
  const dust = dustCanvas ? new GoldDust(dustCanvas, innerWidth < 700 ? 40 : 80) : null;
  const t0 = performance.now();
  const loop = () => {
    if (!st.running) return;
    st.raf = requestAnimationFrame(loop);
    if (!st.visible) return;
    st.m[0] += (st.mouse[0] - st.m[0]) * .05; st.m[1] += (st.mouse[1] - st.m[1]) * .05;
    gl.uniform2f(L.uRes, canvas.width, canvas.height); gl.uniform2f(L.uMouse, st.m[0], st.m[1]);
    gl.uniform1f(L.uTime, (performance.now() - t0) / 1000); gl.uniform1f(L.uScroll, st.scroll); gl.uniform1f(L.uIntro, st.intro);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  loop();
  window.gsap.to(st, { intro: 1, duration: 2.6, ease: 'power2.out' });
  window.ScrollTrigger.create({ trigger: canvas.closest('section'), start: 'top top', end: 'bottom top', scrub: true, onUpdate: s => { st.scroll = s.progress; } });
  return { pause() { st.visible = false; }, resume() { st.visible = true; } };
}
