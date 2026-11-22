// The opening of the home page. Two paintings, each with its depth, fill the screen and move with real parallax as
// the pointer drifts; the golden name of the Rāmāyaṇa rises over the first light of dawn. As the reader scrolls, the
// first painting dissolves through a bloom of golden light into the second (Rāma, Sītā and Lakṣmaṇa walking into the
// forest), and the verse that sums up the epic appears. Built from assets/hero/manifest.json (tools/build-hero.mjs).
import { GoldDust } from './entry.js';

const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;

const FRAG = `
precision highp float;
uniform sampler2D tA, tAd, tB, tBd;
uniform vec2 uRes, uImgA, uImgB, uMouse, uLightA, uLightB;
uniform float uTime, uMix, uIntro;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.02 + 7.1; a *= .5; } return v; }
// the painting covering the screen, pushed in by z around a focus point, displaced by its depth
vec3 plate(sampler2D tc, sampler2D td, vec2 img, float z, vec2 focus, float par){
  vec2 s = uRes / img; float sc = max(s.x, s.y); vec2 size = img * sc; vec2 off = (uRes - size) * .5;
  vec2 uv = (gl_FragCoord.xy - off) / size; uv.y = 1. - uv.y;
  uv = (uv - focus) / z + focus;
  float d = texture2D(td, uv).r;
  uv += uMouse * vec2(.018, .011) * (d - .45) * par;
  uv.y += .006 * sin(uTime * .21) * (d - .45);
  return texture2D(tc, clamp(uv, .001, .999)).rgb;
}
vec3 rays(vec2 frag, vec2 light, float k){
  float asp = uRes.x / uRes.y;
  vec2 q = vec2(frag.x * asp, frag.y) - vec2(light.x * asp, light.y);
  float ang = atan(q.y, q.x), r = length(q);
  float ry = pow(fbm(vec2(ang * 5., uTime * .035)) * fbm(vec2(ang * 11. + 3., -uTime * .028)), 1.6) * 2.2;
  return vec3(1., .80, .48) * (ry * smoothstep(1.5, 0., r) * .20 + exp(-r * 2.8) * .12) * k;
}
void main(){
  vec2 frag = gl_FragCoord.xy / uRes;
  float t = uTime;
  float zA = 1.02 + .08 * (1. - uIntro) + .10 * uMix + .008 * sin(t * .13);
  float zB = 1.16 - .12 * uMix + .006 * sin(t * .11 + 1.);
  vec3 a = plate(tA, tAd, uImgA, zA, vec2(.5, .42), 1.);
  vec3 b = plate(tB, tBd, uImgB, zB, vec2(.5, .5), 1.2);
  a += rays(frag, vec2(uLightA.x, 1. - uLightA.y), 1.);
  b += rays(frag, vec2(uLightB.x, 1. - uLightB.y), .8);
  // the dawn dissolves into the forest through a bloom of golden light: no edge ever crosses a figure
  float m = smoothstep(.0, 1., uMix);
  float bloom = sin(3.14159 * clamp(uMix, 0., 1.));
  vec3 col = mix(a, b, m);
  col = mix(col, vec3(1., .86, .6), bloom * .38) + vec3(1., .78, .45) * bloom * .12;
  // the flare of arrival dissolving into the painting
  col = mix(vec3(1., .95, .84), col, smoothstep(0., 1., uIntro));
  float asp = uRes.x / uRes.y;
  float vig = smoothstep(1.3, .2, length((frag - vec2(.5, .5)) * vec2(asp, 1.) * vec2(.82, 1.)));
  col *= mix(.38, 1., vig);
  col += (hash(gl_FragCoord.xy + fract(t) * 91.) - .5) * .018;
  gl_FragColor = vec4(col, 1.);
}`;

const load = src => new Promise((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src; });

export async function initHero3(canvas, dustCanvas) {
  const man = await fetch('assets/hero/manifest.json').then(r => r.json()).catch(() => null);
  const P = man?.plates; if (!P || P.length < 2) return null;
  const [A, B] = P;
  const imgs = await Promise.all([A.src, A.depth, B.src, B.depth].map(load)).catch(() => null);
  if (!imgs) return null;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' }); if (!gl) return null;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(o)); return o; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }'));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;   // the page falls back to the painting itself
  gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const at = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
  const tex = (im, unit) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); };
  imgs.forEach((im, i) => tex(im, i));
  const L = Object.fromEntries(['tA', 'tAd', 'tB', 'tBd', 'uRes', 'uImgA', 'uImgB', 'uMouse', 'uLightA', 'uLightB', 'uTime', 'uMix', 'uIntro'].map(k => [k, gl.getUniformLocation(pr, k)]));
  ['tA', 'tAd', 'tB', 'tBd'].forEach((k, i) => gl.uniform1i(L[k], i));
  gl.uniform2f(L.uImgA, imgs[0].width, imgs[0].height); gl.uniform2f(L.uImgB, imgs[2].width, imgs[2].height);
  gl.uniform2f(L.uLightA, ...(A.light || [.5, .3])); gl.uniform2f(L.uLightB, ...(B.light || [.5, .2]));
  const st = { intro: 0, mix: 0, mouse: [0, 0], m: [0, 0], running: true, visible: true };
  const resize = () => { const s = Math.min(devicePixelRatio || 1, 1.6); canvas.width = Math.round(canvas.clientWidth * s); canvas.height = Math.round(canvas.clientHeight * s); gl.viewport(0, 0, canvas.width, canvas.height); };
  resize(); addEventListener('resize', resize);
  addEventListener('pointermove', e => { st.mouse = [e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1]; }, { passive: true });
  const dust = dustCanvas ? new GoldDust(dustCanvas, innerWidth < 700 ? 36 : 70) : null;
  const t0 = performance.now();
  const loop = () => {
    if (!st.running) return;
    st.raf = requestAnimationFrame(loop);
    if (!st.visible) return;
    st.m[0] += (st.mouse[0] - st.m[0]) * .045; st.m[1] += (st.mouse[1] - st.m[1]) * .045;
    gl.uniform2f(L.uRes, canvas.width, canvas.height); gl.uniform2f(L.uMouse, st.m[0], -st.m[1]);
    gl.uniform1f(L.uTime, (performance.now() - t0) / 1000); gl.uniform1f(L.uMix, st.mix); gl.uniform1f(L.uIntro, st.intro);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  loop();
  gsap.to(st, { intro: 1, duration: 2.8, ease: 'power2.out' });
  return {
    state: st, plates: P,
    pause() { st.visible = false; dust?.pause?.(); }, resume() { st.visible = true; dust?.resume?.(); }
  };
}

// The golden name: drawn as an outline first, then filled with embossed gold over which a slow light travels.
export function logoLight(svg) {
  const light = svg.querySelector('fePointLight'); if (!light) return;
  const vb = svg.viewBox.baseVal, st = { x: -200, y: -160 };
  const put = () => { light.setAttribute('x', st.x); light.setAttribute('y', st.y); };
  gsap.to(st, { x: vb.width + 200, duration: 7.5, ease: 'sine.inOut', repeat: -1, yoyo: true, onUpdate: put });
  put();
}
