// The animated stage: painted environments, puppets, props, particles and a
// small "director" that plays one scene-script per paragraph of the story.
//
// Script grammar (one string per paragraph):
//   "bg[/time] | cast… | fx… | acts"
//   cast:  id[.variant]@x[^alt][*scale][:pose][<|>]     props start with #  (e.g. #altar@50)
//   fx:    petals rain fire@x embers smoke mist fireflies birds snow dust rays burn stars waves
//   acts:  "t id verb[>target]" separated by ;   e.g.  1 rama shoot>tataka ; 2.5 tataka fall
//          "t id say "Line of dialogue""   ·   "t fx petals"   ·   "t cam shake"
import { createPuppet, startIdle, act, handPoint, centerPoint, specFor } from './puppet.js';
import { CAST, VARIANT_BY_BOOK } from './data/cast.js';
import { CHARACTERS, MINOR_NAMES } from './data/characters.js';

const gsap = window.gsap;
const NS = 'http://www.w3.org/2000/svg';
export const W = 900, H = 760, GROUND = 630, BASE_SCALE = .68;

const NAME = Object.fromEntries(CHARACTERS.map(c => [c.id, c.name]));
const GENERIC = { citizen: 'Citizen', citizenf: 'Citizen', priest: 'Priest', soldier: 'Soldier', sage: 'Sage', hunter: 'Hunter', muniboy: 'Young ascetic', vanara: 'Vānara', rakshasa: 'Rākṣasa', rakshasi: 'Rākṣasī', gandharva: 'Gandharva', yajnapurusha: 'Divine being', krauncha: 'Krauñca' };
const nameOf = id => { const b = id.split('.')[0], g = b.replace(/\d+$/, ''); return NAME[b] || MINOR_NAMES[b] || NAME[g] || GENERIC[g] || g; };

/* ───────────────────────── seeded random & noise ───────────────────────── */
function rng(seed) { let a = seed >>> 0 || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function noiseFn(r) { const f = [...Array(5)].map((_, i) => ({ f: .004 * (i + 1) ** 1.6, p: r() * 10, a: 1 / (i + 1) })); return x => f.reduce((s, o) => s + Math.sin(x * o.f + o.p) * o.a, 0) / 2.28; }

/* ───────────────────────── painter primitives ───────────────────────── */
const SKY = {
  dawn: ['#1c1a3a', '#6a3e66', '#e8906a', '#ffd9a0'], day: ['#1e4c8a', '#4a86c0', '#9ccbe6', '#f2ead4'],
  dusk: ['#120c24', '#4a1e3a', '#c84a3a', '#ffae5a'], night: ['#010208', '#050d24', '#0c1a38', '#18284a'],
  gold: ['#2a1206', '#6a3010', '#d8862a', '#ffe0a0'], war: ['#120604', '#3a1008', '#a8381a', '#ff9a4a'],
  storm: ['#08080e', '#14141e', '#2a2632', '#46404a'], cosmic: ['#04020e', '#120a30', '#2a1a5a', '#4a3a8a']
};
const SUN = { dawn: [.2, .62, '#ffd9a0'], day: [.75, .16, '#fff6dc'], dusk: [.8, .6, '#ffb060'], gold: [.5, .3, '#fff2c0'], war: [.82, .58, '#ff7a3a'] };

function paintSky(c, t) {
  const s = SKY[t] || SKY.day, g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, s[0]); g.addColorStop(.35, s[1]); g.addColorStop(.62, s[2]); g.addColorStop(.85, s[3]);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (t === 'night' || t === 'cosmic') {
    const r = rng(7); for (let i = 0; i < 260; i++) { c.globalAlpha = r() * .8 + .2; c.fillStyle = '#fff'; c.fillRect(r() * W, r() * H * .6, r() < .1 ? 2 : 1, r() < .1 ? 2 : 1); }
    c.globalAlpha = 1;
    if (t === 'night') { glow(c, W * .78, H * .16, 70, 'rgba(220,230,255,.35)'); c.fillStyle = '#eef2ff'; c.beginPath(); c.arc(W * .78, H * .16, 26, 0, 7); c.fill(); c.fillStyle = 'rgba(180,190,220,.35)'; c.beginPath(); c.arc(W * .78 - 7, H * .16 - 4, 6, 0, 7); c.arc(W * .78 + 8, H * .16 + 6, 4, 0, 7); c.fill(); }
    if (t === 'cosmic') { const r2 = rng(3); for (let i = 0; i < 5; i++) glow(c, r2() * W, r2() * H * .7, 200 + r2() * 200, `rgba(${120 + r2() * 100},${80 + r2() * 60},255,.12)`); }
  }
  const sun = SUN[t];
  if (sun) { glow(c, W * sun[0], H * sun[1], 260, hexA(sun[2], .35)); glow(c, W * sun[0], H * sun[1], 90, hexA(sun[2], .8)); c.fillStyle = sun[2]; c.beginPath(); c.arc(W * sun[0], H * sun[1], 30, 0, 7); c.fill(); }
}
function hexA(h, a) { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
function glow(c, x, y, r, col) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
function ridge(c, baseY, amp, col, seed, rough = 1, snow = false) {
  const n = noiseFn(rng(seed)); c.beginPath(); c.moveTo(0, H);
  const pts = []; for (let x = 0; x <= W; x += 6) { const y = baseY - amp * (.55 + .45 * n(x * rough)) - Math.abs(n(x * 3.1 * rough)) * amp * .18; pts.push([x, y]); c.lineTo(x, y); }
  c.lineTo(W, H); c.closePath(); c.fillStyle = col; c.fill();
  if (snow) { c.save(); c.clip(); pts.forEach(([x, y]) => { c.fillStyle = 'rgba(245,248,255,.9)'; c.fillRect(x, y, 6, Math.max(0, (baseY - amp * .55 - y) * 1.2 + 4)); }); c.restore(); }
}
function haze(c, y, h, col) { const g = c.createLinearGradient(0, y - h, 0, y + h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, y - h, W, h * 2); }
function tree(c, x, y, h, type, col, r) {
  c.fillStyle = col; c.strokeStyle = col;
  if (type === 'palm') {
    c.lineWidth = h * .04; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + h * .15, y - h * .5, x + h * .05, y - h); c.stroke();
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .45; c.beginPath(); c.moveTo(x + h * .05, y - h); c.quadraticCurveTo(x + h * .05 + Math.cos(a) * h * .3, y - h + Math.sin(a) * h * .2 - h * .05, x + h * .05 + Math.cos(a) * h * .42, y - h + h * .12 + Math.abs(i - 3) * h * .04); c.lineWidth = h * .025; c.stroke(); }
    return;
  }
  c.fillRect(x - h * .03, y - h * .5, h * .06, h * .5);
  const blobs = type === 'sal' ? 6 : type === 'ashoka' ? 7 : 9;
  for (let i = 0; i < blobs; i++) {
    const bx = x + (r() - .5) * h * (type === 'sal' ? .3 : .7), by = y - h * (type === 'sal' ? .4 + i * .1 : .55 + r() * .4), br = h * (type === 'sal' ? .16 : .2) * (.7 + r() * .6);
    c.beginPath(); c.ellipse(bx, by, br * (type === 'ashoka' ? .7 : 1), br * (type === 'ashoka' ? 1.3 : 1), 0, 0, 7); c.fill();
  }
  if (type === 'ashoka') { c.fillStyle = '#e8402a'; for (let i = 0; i < 26; i++) { c.beginPath(); c.arc(x + (r() - .5) * h * .5, y - h * (.5 + r() * .45), 2.2, 0, 7); c.fill(); } }
}
function forestBand(c, y, n, h, col, seed, types = ['round', 'sal', 'palm']) {
  const r = rng(seed); for (let i = 0; i < n; i++) tree(c, r() * W, y + r() * 12, h * (.7 + r() * .6), types[Math.floor(r() * types.length)], col, r);
}
function ground(c, y, top, bottom) { const g = c.createLinearGradient(0, y, 0, H); g.addColorStop(0, top); g.addColorStop(1, bottom); c.fillStyle = g; c.fillRect(0, y, W, H - y); }
function water(c, y0, y1, t, ocean) {
  const s = { day: ['#4a8ab8', '#1a4a6a'], dawn: ['#a8708a', '#3a2a4a'], dusk: ['#c86a4a', '#3a1a2a'], night: ['#1a2a4a', '#060c1a'], gold: ['#e8a050', '#6a3a1a'], war: ['#8a3a1a', '#2a0a06'] }[t] || ['#4a8ab8', '#1a4a6a'];
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, s[0]); g.addColorStop(1, s[1]); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0);
  const r = rng(11); c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1.2;
  for (let i = 0; i < (ocean ? 120 : 60); i++) { const yy = y0 + Math.pow(r(), 1.6) * (y1 - y0), w = 10 + (yy - y0) * .2 * r(); const xx = r() * W; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + w, yy); c.stroke(); }
}
function grass(c, y, col, n = 140, h = 26, seed = 5) { const r = rng(seed); c.strokeStyle = col; for (let i = 0; i < n; i++) { const x = r() * W, hh = h * (.4 + r()); c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y + 6); c.quadraticCurveTo(x + (r() - .5) * 10, y - hh * .5, x + (r() - .5) * 16, y - hh); c.stroke(); } }
function boulders(c, y, n, col, seed, sz = 60) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * W, s = sz * (.5 + r()), yy = y - r() * sz * .6;
    const g = c.createLinearGradient(x - s, yy - s, x + s, yy + s); g.addColorStop(0, shadeHex(col, .25)); g.addColorStop(1, shadeHex(col, -.45));
    c.fillStyle = g; c.beginPath(); c.ellipse(x, yy, s, s * (.6 + r() * .3), (r() - .5) * .6, 0, 7); c.fill();
  }
}
function shadeHex(h, a) { const n = parseInt(h.slice(1), 16); let rr = n >> 16 & 255, gg = n >> 8 & 255, bb = n & 255; const f = v => a >= 0 ? v + (255 - v) * a : v * (1 + a); return `rgb(${f(rr) | 0},${f(gg) | 0},${f(bb) | 0})`; }

function city(c, baseY, style, t) {
  const night = t === 'night', r = rng(style === 'lanka' ? 21 : style === 'mithila' ? 31 : 13);
  const wall = style === 'lanka' ? (night ? '#6a4a10' : '#c8901a') : style === 'mithila' ? (night ? '#3a2a30' : '#e0a878') : (night ? '#2a2a40' : '#f0e4cc');
  const dome = style === 'lanka' ? '#ffcc4a' : '#e8b44a';
  const n = style === 'lanka' ? 26 : 18;
  for (let i = 0; i < n; i++) {
    const w = 30 + r() * 50, x = r() * W, h = (style === 'lanka' ? 120 : 70) + r() * (style === 'lanka' ? 200 : 110), y = baseY;
    const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, shadeHex(wall.startsWith('#') ? wall : '#888888', -.25)); g.addColorStop(.6, wall); g.addColorStop(1, shadeHex(wall, -.15));
    c.fillStyle = g; c.fillRect(x, y - h, w, h);
    // roof: dome or shikhara
    c.fillStyle = style === 'lanka' ? dome : (r() < .5 ? dome : wall);
    if (r() < .5 || style === 'lanka') { c.beginPath(); c.moveTo(x - 4, y - h); c.quadraticCurveTo(x + w / 2, y - h - w * (style === 'lanka' ? 1.6 : 1.1), x + w + 4, y - h); c.fill(); }
    else { c.beginPath(); c.ellipse(x + w / 2, y - h, w / 2 + 2, w / 2.4, 0, Math.PI, 0); c.fill(); }
    c.fillStyle = '#ffd46a'; c.beginPath(); c.arc(x + w / 2, y - h - (style === 'lanka' ? w * .8 : w * .5) - 4, 3, 0, 7); c.fill();
    if (r() < .5) { c.strokeStyle = '#6a4a2a'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + w / 2, y - h - w * .6); c.lineTo(x + w / 2, y - h - w * .6 - 22); c.stroke(); c.fillStyle = r() < .5 ? '#e8501a' : '#f0a020'; c.beginPath(); c.moveTo(x + w / 2, y - h - w * .6 - 22); c.lineTo(x + w / 2 + 16, y - h - w * .6 - 17); c.lineTo(x + w / 2, y - h - w * .6 - 12); c.fill(); }
    // windows / arches
    for (let k = 0; k < Math.floor(h / 26); k++) for (let j = 0; j < Math.floor(w / 14); j++) {
      if (r() < .45) { c.fillStyle = night || style === 'lanka' ? `rgba(255,${190 + r() * 50 | 0},100,${night ? .9 : .5})` : 'rgba(80,50,30,.35)'; c.fillRect(x + 5 + j * 14, y - h + 10 + k * 26, 6, 10); }
    }
  }
  // city wall
  c.fillStyle = shadeHex(wall, -.2); c.fillRect(0, baseY - 26, W, 40);
  for (let x = 0; x < W; x += 22) { c.fillRect(x, baseY - 36, 12, 12); }
  if (night || style === 'lanka') glow(c, W / 2, baseY - 80, 500, style === 'lanka' ? 'rgba(255,190,60,.18)' : 'rgba(255,190,90,.08)');
}
function hut(c, x, y, s = 1) {
  c.fillStyle = '#6a4a28'; c.fillRect(x - 50 * s, y - 50 * s, 100 * s, 50 * s);
  c.fillStyle = '#2a1a0a'; c.fillRect(x - 12 * s, y - 36 * s, 24 * s, 36 * s);
  c.fillStyle = '#b89a50'; c.beginPath(); c.moveTo(x - 70 * s, y - 44 * s); c.lineTo(x, y - 100 * s); c.lineTo(x + 70 * s, y - 44 * s); c.closePath(); c.fill();
  c.strokeStyle = '#8a6a30'; for (let i = 0; i < 14; i++) { c.beginPath(); c.moveTo(x - 66 * s + i * 10 * s, y - 46 * s); c.lineTo(x, y - 98 * s); c.stroke(); }
}
function interior(c, t, dark, golden) {
  const wallC = golden ? ['#3a2208', '#8a5a14'] : dark ? ['#0a0608', '#1e1012'] : ['#3a1e14', '#7a4a2a'];
  const g = c.createLinearGradient(0, 0, 0, GROUND); g.addColorStop(0, wallC[0]); g.addColorStop(1, wallC[1]); c.fillStyle = g; c.fillRect(0, 0, W, GROUND);
  // arches
  for (let i = 0; i < 5; i++) {
    const x = 90 + i * 180; c.fillStyle = dark ? '#050304' : golden ? '#2a1404' : '#24100a';
    c.beginPath(); c.moveTo(x - 60, GROUND - 40); c.lineTo(x - 60, 260); c.quadraticCurveTo(x, 150, x + 60, 260); c.lineTo(x + 60, GROUND - 40); c.fill();
    if (!dark) { glow(c, x, 300, 90, golden ? 'rgba(255,200,80,.25)' : 'rgba(255,160,80,.15)'); }
  }
  // pillars
  for (let i = 0; i < 6; i++) {
    const x = i * 180; const pg = c.createLinearGradient(x - 22, 0, x + 22, 0); pg.addColorStop(0, golden ? '#6a4210' : '#4a2a1a'); pg.addColorStop(.5, golden ? '#f0c060' : dark ? '#3a2a24' : '#c8946a'); pg.addColorStop(1, golden ? '#4a2a08' : '#3a1a10');
    c.fillStyle = pg; c.fillRect(x - 22, 140, 44, GROUND - 140);
    c.fillStyle = golden ? '#ffd870' : '#d8a050'; c.fillRect(x - 30, 130, 60, 16); c.fillRect(x - 30, GROUND - 26, 60, 16);
  }
  // floor
  const fg = c.createLinearGradient(0, GROUND, 0, H); fg.addColorStop(0, golden ? '#8a5a18' : dark ? '#120a08' : '#5a3020'); fg.addColorStop(1, golden ? '#2a1606' : '#0a0604'); c.fillStyle = fg; c.fillRect(0, GROUND, W, H - GROUND);
  c.strokeStyle = 'rgba(255,220,150,.08)'; for (let i = -10; i < 20; i++) { c.beginPath(); c.moveTo(W / 2 + i * 30, GROUND); c.lineTo(W / 2 + i * 120, H); c.stroke(); }
  // carpet
  c.fillStyle = dark ? '#2a0a0a' : '#8a1a1a'; c.beginPath(); c.moveTo(W / 2 - 80, GROUND); c.lineTo(W / 2 + 80, GROUND); c.lineTo(W / 2 + 220, H); c.lineTo(W / 2 - 220, H); c.fill();
  c.strokeStyle = '#d8a040'; c.lineWidth = 3; c.stroke();
  if (!dark) for (let i = 0; i < 4; i++) { const x = 180 + i * 180; c.strokeStyle = '#8a6a30'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 90); c.stroke(); glow(c, x, 100, 50, 'rgba(255,200,100,.6)'); c.fillStyle = '#ffe0a0'; c.beginPath(); c.arc(x, 100, 5, 0, 7); c.fill(); }
}
function clouds(c, y, n, col, seed, big = 1) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * W, yy = y + r() * 60, s = (40 + r() * 70) * big; for (let k = 0; k < 6; k++) { glow(c, x + (k - 3) * s * .35, yy + Math.sin(k) * s * .15, s * (.6 + r() * .4), col); } } }

/* ───────────────────────── environments ───────────────────────── */
// Each returns { back(c,t), front(c,t), ground:y, amb:{…}, time }
const ENV = {
  ayodhya: { time: 'day', amb: { birds: 1, sound: 'city' }, back(c, t) { paintSky(c, t); ridge(c, 470, 90, t === 'night' ? '#141a2e' : '#8a9ab8', 4, .8); city(c, 560, 'ayodhya', t); ground(c, 560, t === 'night' ? '#2a2a3a' : '#d8c8a8', t === 'night' ? '#0a0a12' : '#8a7a5a'); }, front(c, t) { grass(c, H - 6, t === 'night' ? '#0a120a' : '#3a5a2a', 60, 22); } },
  palace: { time: 'day', amb: { sound: 'palace' }, back(c, t) { interior(c, t, false, false); } },
  court: { time: 'day', amb: { sound: 'palace' }, back(c, t) { interior(c, t, false, true); } },
  chamber: { time: 'night', amb: { sound: 'night-in' }, back(c, t) { interior(c, t, true, false); glow(c, 120, 560, 160, 'rgba(255,150,60,.35)'); } },
  'lanka-court': { time: 'night', amb: { embers: .4, sound: 'palace' }, back(c, t) { interior(c, t, false, true); glow(c, W / 2, 380, 300, 'rgba(255,120,40,.18)'); } },
  mithila: { time: 'day', amb: { birds: 1, sound: 'city' }, back(c, t) { paintSky(c, t); city(c, 560, 'mithila', t); ground(c, 560, '#d8b890', '#7a5a3a'); } },
  yajna: { time: 'dawn', amb: { smoke: 1, sound: 'yajna' }, back(c, t) { paintSky(c, t); ridge(c, 520, 60, t === 'night' ? '#0e1424' : '#5a6a7a', 9); forestBand(c, 560, 30, 120, t === 'night' ? '#0a1208' : '#2a3a22', 3); ground(c, 560, '#a88a5a', '#4a3a24'); } },
  river: { time: 'day', amb: { water: [470, 640], birds: 1, sound: 'river' }, back(c, t) { paintSky(c, t); ridge(c, 440, 50, t === 'night' ? '#0c1420' : '#6a8aa0', 6); forestBand(c, 470, 40, 90, t === 'night' ? '#08100a' : '#3a5a3a', 8); water(c, 470, 650, t); ground(c, 640, '#b8a070', '#5a4a30'); } },
  ganga: { time: 'dawn', amb: { water: [430, 650], birds: 1, mist: 1, sound: 'river' }, back(c, t) { paintSky(c, t); forestBand(c, 430, 50, 70, t === 'night' ? '#08100a' : '#4a5a4a', 18, ['palm', 'round']); water(c, 430, 680, t); ground(c, 670, '#c8b088', '#6a5a3a'); } },
  forest: { time: 'day', amb: { birds: 1, sound: 'forest' }, back(c, t) { paintSky(c, t); ridge(c, 420, 80, t === 'night' ? '#0c1420' : '#6a8a9a', 2); forestBand(c, 520, 30, 220, t === 'night' ? '#0a140c' : '#4a6a4a', 12); forestBand(c, 610, 22, 300, t === 'night' ? '#050a06' : '#22351e', 14); ground(c, 620, t === 'night' ? '#141a10' : '#5a6a3a', '#1a1a0a'); }, front(c, t) { grass(c, H - 4, t === 'night' ? '#040804' : '#24361a', 160, 34); } },
  dandaka: { time: 'dusk', amb: { mist: 1, fireflies: 1, sound: 'forest-night' }, back(c, t) { paintSky(c, t); forestBand(c, 470, 40, 300, '#1a2418', 22, ['sal', 'round']); forestBand(c, 600, 30, 420, '#0a120a', 23, ['sal', 'round']); haze(c, 560, 80, 'rgba(120,140,120,.15)'); ground(c, 620, '#1e2a14', '#080c04'); }, front(c, t) { grass(c, H - 4, '#040804', 200, 40); } },
  ashram: { time: 'dawn', amb: { birds: 1, smoke: .6, sound: 'forest' }, back(c, t) { paintSky(c, t); ridge(c, 470, 70, t === 'night' ? '#0c1420' : '#7a8aa0', 31); forestBand(c, 560, 26, 200, t === 'night' ? '#0a140c' : '#3a5a3a', 32); ground(c, 600, t === 'night' ? '#1a1a10' : '#8a7a4a', '#3a2a14'); hut(c, 720, 610, 1.1); }, front(c, t) { grass(c, H - 4, '#2a3a1a', 120, 26); } },
  chitrakoot: { time: 'day', amb: { water: [560, 640], birds: 1, sound: 'river' }, back(c, t) { paintSky(c, t); ridge(c, 400, 160, t === 'night' ? '#101828' : '#5a7a6a', 41, 1.2); forestBand(c, 520, 40, 150, t === 'night' ? '#08100a' : '#2e4a2a', 42); water(c, 560, 640, t); ground(c, 630, '#7a7a4a', '#2a2a14'); hut(c, 160, 630, .9); }, front(c, t) { grass(c, H - 4, '#1e3016', 120, 28); } },
  panchavati: { time: 'day', amb: { water: [540, 610], birds: 1, sound: 'forest' }, back(c, t) { paintSky(c, t); ridge(c, 440, 90, t === 'night' ? '#0c1420' : '#6a8a8a', 51); forestBand(c, 520, 30, 180, t === 'night' ? '#08100a' : '#2e4a2a', 52, ['round', 'palm']); water(c, 540, 610, t); ground(c, 600, t === 'night' ? '#141a10' : '#7a8a4a', '#2a2a10'); hut(c, 760, 616, 1); }, front(c, t) { grass(c, H - 4, '#1a2a12', 140, 30); } },
  pampa: { time: 'day', amb: { water: [520, 620], birds: 1, sound: 'river' }, back(c, t) { paintSky(c, t); boulders(c, 500, 18, t === 'night' ? '#2a2a30' : '#a07a5a', 61, 70); water(c, 520, 620, t); const r = rng(62); for (let i = 0; i < 22; i++) { const x = r() * W, y = 540 + r() * 70; c.fillStyle = '#2a6a3a'; c.beginPath(); c.ellipse(x, y, 14, 5, 0, 0, 7); c.fill(); c.fillStyle = '#f0a0c0'; c.beginPath(); c.arc(x, y - 4, 4, 0, 7); c.fill(); } ground(c, 615, '#8a7a4a', '#3a2a14'); } },
  rocks: { time: 'day', amb: { birds: .5, sound: 'wind' }, back(c, t) { paintSky(c, t); ridge(c, 460, 120, t === 'night' ? '#141828' : '#8a7a7a', 71, 1.4); boulders(c, 520, 26, t === 'night' ? '#2a2630' : '#b08a62', 72, 90); boulders(c, 600, 10, t === 'night' ? '#1a161e' : '#8a6a4a', 73, 70); ground(c, 620, t === 'night' ? '#1a161a' : '#9a7a52', '#3a2a1a'); } },
  kishkindha: { time: 'day', amb: { birds: .5, sound: 'wind' }, back(c, t) { ENV.rocks.back(c, t); c.fillStyle = '#1a0e08'; c.beginPath(); c.ellipse(W / 2, 600, 90, 120, 0, Math.PI, 0); c.fill(); glow(c, W / 2, 560, 120, 'rgba(255,190,90,.3)'); c.strokeStyle = '#e8b44a'; c.lineWidth = 4; c.beginPath(); c.ellipse(W / 2, 600, 96, 126, 0, Math.PI, 0); c.stroke(); } },
  cave: { time: 'night', amb: { sound: 'cave', mist: .5 }, back(c, t) { c.fillStyle = '#060404'; c.fillRect(0, 0, W, H); glow(c, W / 2, 360, 420, 'rgba(255,180,90,.18)'); boulders(c, 300, 20, '#2a1e18', 81, 140); ground(c, 620, '#2a1e16', '#0a0604'); } },
  shore: { time: 'day', amb: { water: [380, 560], waves: 1, birds: .5, sound: 'ocean' }, back(c, t) { paintSky(c, t); water(c, 380, 580, t, true); ground(c, 560, t === 'night' ? '#3a3a3a' : '#e0c890', t === 'night' ? '#141414' : '#8a7040'); } },
  ocean: { time: 'day', amb: { water: [420, H], waves: 1, sound: 'ocean' }, back(c, t) { paintSky(c, t); clouds(c, 160, 6, 'rgba(255,255,255,.18)', 91); water(c, 420, H, t, true); } },
  setu: { time: 'day', amb: { water: [400, H], waves: 1, sound: 'ocean' }, back(c, t) { paintSky(c, t); water(c, 400, H, t, true); const r = rng(95); for (let i = 0; i < 90; i++) { const k = i / 90, x = W * .1 + k * W * .9, y = 700 - k * 290, s = 26 * (1 - k * .75); c.fillStyle = shadeHex('#8a7a6a', (r() - .5) * .4); c.beginPath(); c.ellipse(x + (r() - .5) * 30 * (1 - k), y, s, s * .5, 0, 0, 7); c.fill(); } } },
  sky: { time: 'day', amb: { clouds: 1, sound: 'wind' }, back(c, t) { paintSky(c, t); clouds(c, 520, 14, t === 'night' ? 'rgba(120,140,200,.12)' : 'rgba(255,255,255,.35)', 101, 1.5); clouds(c, 640, 10, t === 'night' ? 'rgba(80,90,140,.2)' : 'rgba(255,240,230,.5)', 102, 1.8); } },
  lanka: { time: 'night', amb: { embers: .3, sound: 'city-night' }, back(c, t) { paintSky(c, t); ridge(c, 520, 220, t === 'night' ? '#120e14' : '#3a2a22', 111, 1.1); city(c, 420, 'lanka', t); ridge(c, 600, 60, t === 'night' ? '#0a0608' : '#2a1a12', 112); ground(c, 620, '#2a1e18', '#0a0604'); } },
  'lanka-street': { time: 'night', amb: { embers: .4, sound: 'city-night' }, back(c, t) { paintSky(c, t); city(c, 640, 'lanka', t); ground(c, 640, '#5a3a14', '#1a0e04'); } },
  ashoka: { time: 'night', amb: { fireflies: 1, mist: .6, sound: 'night' }, back(c, t) { paintSky(c, t); city(c, 420, 'lanka', t); forestBand(c, 560, 18, 260, t === 'night' ? '#141e10' : '#3a5a2a', 121, ['ashoka']); ground(c, 600, t === 'night' ? '#121a0e' : '#4a5a2a', '#050804'); const r = rng(122); tree(c, 640, 620, 420, 'round', t === 'night' ? '#0c140a' : '#26401e', r); }, front(c, t) { grass(c, H - 4, '#050a04', 140, 30); } },
  battle: { time: 'war', amb: { embers: 1, dust: 1, smoke: .8, sound: 'battle' }, back(c, t) { paintSky(c, t); ridge(c, 480, 200, '#2a1410', 131, 1.1); city(c, 400, 'lanka', 'night'); ground(c, 560, '#5a3a22', '#1a0c06'); const r = rng(133); c.strokeStyle = 'rgba(30,15,10,.8)'; for (let i = 0; i < 40; i++) { const x = r() * W, y = 590 + r() * 160; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 40, y - 30 - r() * 30); c.stroke(); } }, front(c) { grass(c, H - 2, '#140a04', 80, 20); } },
  himalaya: { time: 'night', amb: { snow: 1, sound: 'wind' }, back(c, t) { paintSky(c, t); ridge(c, 300, 220, t === 'night' ? '#2a3448' : '#8a9ab8', 141, 1.2, true); ridge(c, 470, 160, t === 'night' ? '#1a2234' : '#6a7a9a', 142, 1.4, true); ground(c, 600, t === 'night' ? '#d8e0f0' : '#f0f4fa', t === 'night' ? '#6a7a9a' : '#a8b8d0'); } },
  kailasa: { time: 'dusk', amb: { snow: .5, rays: 1, sound: 'wind' }, back(c, t) { paintSky(c, t); c.fillStyle = t === 'night' ? '#2a3448' : '#c8d0e8'; c.beginPath(); c.moveTo(150, 640); c.lineTo(450, 120); c.lineTo(750, 640); c.fill(); c.fillStyle = '#f8faff'; c.beginPath(); c.moveTo(370, 260); c.lineTo(450, 120); c.lineTo(530, 260); c.lineTo(490, 240); c.lineTo(450, 270); c.lineTo(410, 240); c.fill(); glow(c, 450, 160, 200, 'rgba(200,230,255,.3)'); ridge(c, 600, 100, t === 'night' ? '#1a2234' : '#7a8aa8', 151, 1, true); ground(c, 620, '#e8eef8', '#9aa8c0'); } },
  heaven: { time: 'gold', amb: { rays: 1, petals: .3, sound: 'divine' }, back(c, t) { paintSky(c, 'gold'); clouds(c, 470, 16, 'rgba(255,230,180,.35)', 161, 1.6); clouds(c, 600, 12, 'rgba(255,220,160,.55)', 162, 2); } },
  cosmic: { time: 'cosmic', amb: { stars: 1, sound: 'divine' }, back(c) { paintSky(c, 'cosmic'); water(c, 560, H, 'night', true); glow(c, W / 2, 420, 380, 'rgba(255,230,160,.18)'); } },
  sarayu: { time: 'dusk', amb: { water: [480, 650], mist: .6, sound: 'river' }, back(c, t) { paintSky(c, t); city(c, 470, 'ayodhya', t); water(c, 480, 660, t); ground(c, 650, '#a8906a', '#4a3a24'); } },
  naimisha: { time: 'day', amb: { birds: 1, smoke: .6, sound: 'yajna' }, back(c, t) { ENV.forest.back(c, t); c.fillStyle = '#c89a4a'; c.fillRect(250, 360, 400, 18); for (let i = 0; i < 5; i++) c.fillRect(260 + i * 92, 370, 12, 250); c.fillStyle = '#a8202a'; c.beginPath(); c.moveTo(230, 362); c.lineTo(450, 280); c.lineTo(670, 362); c.fill(); } }
};

/* ───────────────────────── props (SVG) ───────────────────────── */
const PROPS = {
  altar: () => `<g><rect x="-60" y="-34" width="120" height="34" fill="#8a5a3a" stroke="#2a1408"/><rect x="-70" y="-44" width="140" height="12" fill="#a8744a" stroke="#2a1408"/><path d="M-70 -44 h140" stroke="#e8b44a" stroke-width="2"/></g>`,
  pyre: () => `<g>${[0, 1, 2, 3, 4].map(i => `<rect x="-90" y="${-14 - i * 14}" width="180" height="12" rx="4" fill="${i % 2 ? '#6a4020' : '#7a4a28'}" stroke="#2a1408" transform="rotate(${(i % 2 ? 3 : -3)})"/>`).join('')}</g>`,
  bow: () => `<g class="pr-bow"><rect x="-150" y="-40" width="300" height="40" rx="6" fill="#5a3a20" stroke="#e8b44a" stroke-width="3"/><circle cx="-110" cy="-4" r="16" fill="#3a2410" stroke="#e8b44a"/><circle cx="110" cy="-4" r="16" fill="#3a2410" stroke="#e8b44a"/><g class="half-l"><path d="M0 -60 C -60 -110 -140 -110 -230 -70" stroke="#2a1408" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M0 -60 C -60 -110 -140 -110 -230 -70" stroke="#c88a3a" stroke-width="10" fill="none" stroke-linecap="round"/></g><g class="half-r"><path d="M0 -60 C 60 -110 140 -110 230 -70" stroke="#2a1408" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M0 -60 C 60 -110 140 -110 230 -70" stroke="#c88a3a" stroke-width="10" fill="none" stroke-linecap="round"/></g><circle cx="0" cy="-62" r="10" fill="#e8b44a"/><line class="str" x1="-230" y1="-70" x2="230" y2="-70" stroke="#f0e6c8" stroke-width="1.5"/></g>`,
  boat: () => `<g class="pr-boat"><path d="M-130 -10 C -100 30 100 30 130 -10 Z" fill="#6a3a1a" stroke="#2a1408" stroke-width="2"/><path d="M-120 -10 h240" stroke="#e8b44a" stroke-width="3"/><line x1="0" y1="-10" x2="0" y2="-130" stroke="#3a2010" stroke-width="5"/><path d="M0 -126 L 70 -40 L 0 -40Z" fill="#e8d8b0" opacity=".9"/></g>`,
  hut: () => `<g><rect x="-60" y="-60" width="120" height="60" fill="#7a5a30" stroke="#2a1408"/><rect x="-14" y="-44" width="28" height="44" fill="#2a1a0a"/><path d="M-84 -52 L 0 -118 L 84 -52 Z" fill="#c8a860" stroke="#6a4a20" stroke-width="2"/></g>`,
  throne: () => `<g><rect x="-70" y="-30" width="140" height="30" fill="#8a1a1a" stroke="#e8b44a" stroke-width="3"/><path d="M-60 -30 L -60 -170 Q 0 -230 60 -170 L 60 -30Z" fill="#e8b44a" stroke="#6a4210" stroke-width="3"/><path d="M-44 -40 L -44 -160 Q 0 -206 44 -160 L 44 -40Z" fill="#a8202a"/><circle cx="0" cy="-180" r="10" fill="#fff0b0"/></g>`,
  chariot: () => `<g><path d="M-90 -40 L 90 -40 L 70 -110 L -60 -110Z" fill="#c8901a" stroke="#4a2a08" stroke-width="2"/><path d="M-60 -110 L -40 -170 L 50 -170 L 70 -110" fill="#e8b44a" stroke="#4a2a08"/><circle cx="-40" cy="-30" r="34" fill="none" stroke="#6a4210" stroke-width="7"/><circle cx="-40" cy="-30" r="6" fill="#e8b44a"/>${[0, 1, 2, 3, 4, 5].map(i => `<line x1="-40" y1="-30" x2="${-40 + Math.cos(i) * 32}" y2="${-30 + Math.sin(i) * 32}" stroke="#6a4210" stroke-width="3"/>`).join('')}<line x1="90" y1="-50" x2="170" y2="-60" stroke="#6a4210" stroke-width="5"/><path d="M-20 -170 L-20 -220 L 20 -206 L -20 -196" fill="#c8202a"/></g>`,
  pushpaka: () => `<g class="pr-push"><ellipse cx="0" cy="10" rx="200" ry="40" fill="url(#stg-glow)"/><path d="M-170 0 C -120 30 120 30 170 0 L 140 -30 L -140 -30Z" fill="#e8b44a" stroke="#6a4210" stroke-width="2"/>${[-110, -55, 0, 55, 110].map((x, i) => `<path d="M${x - 22} -30 L ${x - 22} -80 Q ${x} ${-120 - (i === 2 ? 50 : 0)} ${x + 22} -80 L ${x + 22} -30Z" fill="${i % 2 ? '#f0c860' : '#ffd870'}" stroke="#6a4210"/><circle cx="${x}" cy="${-124 - (i === 2 ? 46 : 0)}" r="5" fill="#fff0b0"/>`).join('')}<path d="M-160 -30 h320" stroke="#c8202a" stroke-width="4"/></g>`,
  mountain: () => `<g class="pr-mtn"><path d="M-130 0 L -70 -120 L -30 -90 L 10 -170 L 60 -100 L 90 -130 L 140 0Z" fill="#4a5a4a" stroke="#1a2a1a" stroke-width="2"/><path d="M-10 -150 L 10 -170 L 30 -140" fill="#e8f0f8"/>${Array.from({ length: 14 }, (_, i) => `<circle cx="${-90 + (i * 37) % 200}" cy="${-20 - (i * 23) % 90}" r="5" fill="#9effa8" opacity=".9"/>`).join('')}<path d="M-130 0 Q 0 30 140 0" fill="#3a2a1a"/></g>`,
  tree: () => `<g><rect x="-14" y="-200" width="28" height="200" fill="#3a2414"/>${Array.from({ length: 10 }, (_, i) => `<ellipse cx="${-90 + (i * 41) % 180}" cy="${-220 - (i * 29) % 120}" rx="70" ry="50" fill="${i % 2 ? '#1e3a1a' : '#2a4a22'}"/>`).join('')}</g>`,
  sandals: () => `<g class="pr-sand"><ellipse cx="-22" cy="-6" rx="16" ry="34" fill="#e8b44a" stroke="#6a4210" stroke-width="2" transform="rotate(-8)"/><ellipse cx="22" cy="-6" rx="16" ry="34" fill="#e8b44a" stroke="#6a4210" stroke-width="2" transform="rotate(8)"/><circle cx="-22" cy="-30" r="5" fill="#c8202a"/><circle cx="22" cy="-30" r="5" fill="#c8202a"/></g>`,
  lamp: () => `<g><path d="M-20 0 L 20 0 L 10 -20 L -10 -20Z" fill="#c8901a"/><ellipse cx="0" cy="-22" rx="14" ry="5" fill="#e8b44a"/></g>`,
  pot: () => `<g><path d="M-30 -10 C -44 -60 44 -60 30 -10 Z" fill="#e8b44a" stroke="#6a4210" stroke-width="2"/><ellipse cx="0" cy="-54" rx="22" ry="7" fill="#d8d8e0" stroke="#6a6a7a"/><ellipse cx="0" cy="-10" rx="30" ry="6" fill="#c8901a"/></g>`,
  cradle: () => `<g><path d="M-80 -10 C -80 -60 80 -60 80 -10Z" fill="#e8b44a" stroke="#6a4210" stroke-width="2"/><path d="M-80 -10 h160" stroke="#c8202a" stroke-width="5"/>${[-45, -15, 15, 45].map(x => `<circle cx="${x}" cy="-44" r="11" fill="${x === -45 ? '#4f6f8f' : '#e2b48a'}" stroke="#2a1408"/>`).join('')}</g>`,
  ring: () => `<g class="pr-ring"><circle r="16" fill="none" stroke="#ffd870" stroke-width="5"/><circle cy="-16" r="6" fill="#4ab0ff"/></g>`,
  jewel: () => `<g><path d="M0 -24 L 14 0 L 0 24 L -14 0Z" fill="#ff4a6a" stroke="#ffd870" stroke-width="3"/></g>`,
  gate: () => `<g><rect x="-140" y="-300" width="60" height="300" fill="#c8a870" stroke="#4a3a20"/><rect x="80" y="-300" width="60" height="300" fill="#c8a870" stroke="#4a3a20"/><path d="M-140 -300 Q 0 -420 140 -300 L 140 -280 Q 0 -390 -140 -280Z" fill="#e8b44a"/></g>`,
  bed: () => `<g><rect x="-110" y="-50" width="220" height="30" fill="#8a1a2a" stroke="#e8b44a" stroke-width="2"/><rect x="-120" y="-24" width="10" height="24" fill="#e8b44a"/><rect x="110" y="-24" width="10" height="24" fill="#e8b44a"/><ellipse cx="-80" cy="-56" rx="30" ry="10" fill="#f0e0c0"/></g>`,
  rock: () => `<g><ellipse cx="0" cy="-50" rx="90" ry="60" fill="#5a4a3a" stroke="#2a1a10" stroke-width="2"/></g>`,
  skeleton: () => `<g opacity=".85"><path d="M-110 -20 Q 0 -70 110 -20" stroke="#e8e0cc" stroke-width="8" fill="none"/>${[-80, -50, -20, 10, 40, 70].map(x => `<path d="M${x} -40 q 10 30 0 40" stroke="#e8e0cc" stroke-width="4" fill="none"/>`).join('')}<ellipse cx="120" cy="-34" rx="30" ry="22" fill="#e8e0cc"/></g>`,
  sala: () => `<g>${[-180, -120, -60, 0, 60, 120, 180].map(x => `<g transform="translate(${x},0)"><rect x="-9" y="-260" width="18" height="260" fill="#4a3018"/><ellipse cx="0" cy="-270" rx="30" ry="60" fill="#2a4a22"/></g>`).join('')}</g>`,
  head: () => `<g><circle cy="-20" r="22" fill="#4f6f8f" opacity=".7"/></g>`,
  twins: () => `<g><path d="M-60 -10 C -60 -50 60 -50 60 -10Z" fill="#c89a4a" stroke="#6a4210" stroke-width="2"/><path d="M-60 -10 h120" stroke="#e8b44a" stroke-width="4"/><circle cx="-18" cy="-38" r="11" fill="#4f6f8f" stroke="#2a1408"/><circle cx="18" cy="-38" r="11" fill="#4f6f8f" stroke="#2a1408"/></g>`
};

/* ───────────────────────── the Stage ───────────────────────── */
export class Stage {
  constructor(root, { sound } = {}) {
    this.root = root; this.sound = sound;
    root.classList.add('stage');
    root.innerHTML = `
      <div class="stg-cam">
        <canvas class="stg-back"></canvas><canvas class="stg-back2"></canvas>
        <svg class="stg-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="stg-glow"><stop offset="0" stop-color="#ffd870" stop-opacity=".6"/><stop offset="1" stop-color="#ffd870" stop-opacity="0"/></radialGradient></defs><g class="stg-props"></g><g class="stg-cast"></g></svg>
        <canvas class="stg-front"></canvas>
        <canvas class="stg-fx"></canvas>
      </div>
      <div class="stg-flash"></div>
      <div class="stg-vignette"></div>
      <div class="stg-title"></div>
      <div class="stg-dialog"><b></b><span></span></div>`;
    this.cam = root.querySelector('.stg-cam');
    this.back = root.querySelector('.stg-back'); this.back2 = root.querySelector('.stg-back2');
    this.front = root.querySelector('.stg-front'); this.fx = root.querySelector('.stg-fx');
    this.svg = root.querySelector('.stg-svg'); this.castG = root.querySelector('.stg-cast'); this.propG = root.querySelector('.stg-props');
    this.flashEl = root.querySelector('.stg-flash'); this.titleEl = root.querySelector('.stg-title'); this.dialog = root.querySelector('.stg-dialog');
    [this.back, this.back2, this.front, this.fx].forEach(cv => { cv.width = W * 1.5; cv.height = H * 1.5; });
    this.fctx = this.fx.getContext('2d'); this.fctx.scale(1.5, 1.5);
    this.actors = new Map(); this.props = new Map(); this.timers = []; this.parts = []; this.emitters = []; this.env = null; this.envKey = '';
    this.loop = this.loop.bind(this); this.running = false; this.visible = true;
    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible && this.running) requestAnimationFrame(this.loop); }).observe(root);
  }

  paintEnv(key, time) {
    const env = ENV[key] || ENV.forest, t = time || env.time;
    const k = `${key}/${t}`;
    if (k === this.envKey) return false;
    this.envKey = k; this.env = env; this.time = t;
    // crossfade: paint into back2, fade it in, then swap
    const paint = (cv, fn) => { const c = cv.getContext('2d'); c.setTransform(1.5, 0, 0, 1.5, 0, 0); c.clearRect(0, 0, W, H); fn && fn(c, t); };
    paint(this.back2, env.back); this.back2.style.opacity = 0;
    gsap.to(this.back2, { opacity: 1, duration: .9, ease: 'power2.inOut', onComplete: () => { paint(this.back, env.back); this.back2.style.opacity = 0; } });
    paint(this.front, env.front);
    gsap.fromTo(this.front, { opacity: 0 }, { opacity: 1, duration: .9 });
    // ambient emitters
    this.amb = { ...env.amb };
    this.sound?.ambience(env.amb?.sound || null, t);
    return true;
  }

  clearCast(fade = true) {
    for (const [id, p] of this.actors) { gsap.killTweensOf(p.state); p.idleTween?.kill(); if (fade) gsap.to(p.el, { opacity: 0, duration: .5, onComplete: () => p.el.remove() }); else p.el.remove(); }
    this.actors.clear();
    for (const [, pr] of this.props) { if (fade) gsap.to(pr.el, { opacity: 0, duration: .5, onComplete: () => pr.el.remove() }); else pr.el.remove(); }
    this.props.clear();
  }

  // Parse "id.variant@x^alt*scale:pose<"
  parseCast(tok, book) {
    const m = tok.match(/^(#?[\w.-]+)@(-?[\d.]+)(?:\^([\d.]+))?(?:\*([\d.]+))?(?::(\w+))?([<>])?$/);
    if (!m) return null;
    let [, id, x, alt, sc, pose, face] = m;
    if (!id.startsWith('#') && !id.includes('.') && VARIANT_BY_BOOK[book]?.[id]) id = VARIANT_BY_BOOK[book][id];
    return { id, key: id.startsWith('#') ? id : id.split('.')[0], x: +x / 100 * W, alt: alt ? +alt / 100 * H : 0, sc: sc ? +sc : 1, pose, face: face === '<' ? -1 : face === '>' ? 1 : null };
  }

  placeActor(c) {
    let p = this.actors.get(c.key);
    const y = GROUND - c.alt - (1 - c.sc) * 70;
    const flip = c.face ?? (c.x < W / 2 ? 1 : -1);
    if (p && p.id !== c.id) { gsap.killTweensOf(p.state); p.idleTween?.kill(); p.el.remove(); this.actors.delete(c.key); p = null; }
    if (!p) {
      p = createPuppet(c.id, this.castG);
      Object.assign(p.state, { x: c.x, y, sc: BASE_SCALE * c.sc, flip, op: 0 });
      p.render(); startIdle(p);
      if (c.pose !== 'hidden') gsap.to(p.state, { op: 1, duration: .7, onUpdate: p.render });
      this.actors.set(c.key, p);
    } else {
      gsap.killTweensOf(p.state, 'x,y,sc,rot,crouch,sit,armL,armR,foreL,foreR,lean,head,gait,flap');
      const dist = Math.abs(p.state.x - c.x);
      if (dist > 30) { act(p, dist > 260 ? 'run' : 'walk', { to: c.x }).eventCallback('onComplete', () => { p.state.flip = flip; p.render(); }); }
      else gsap.to(p.state, { x: c.x, duration: .5, onUpdate: p.render, onComplete: () => { p.state.flip = flip; p.render(); } });
      gsap.to(p.state, { y, sc: BASE_SCALE * c.sc, op: c.pose === 'hidden' ? 0 : 1, rot: 0, duration: .6, onUpdate: p.render });
    }
    this.applyPose(p, c.pose);
    return p;
  }

  applyPose(p, pose) {
    const S = p.state;
    const base = { crouch: 0, sit: 0, rot: 0, armL: 8, foreL: -6, armR: 8, foreR: -6, lean: 0, head: 0 };
    const P = {
      sit: { sit: 1, armR: 20, foreR: 60, armL: 20, foreL: 60 }, kneel: { crouch: 1, armR: 22, foreR: 150, armL: 22, foreL: 150 },
      lie: { rot: -S.flip * 84 }, bow: { armR: 22, foreR: 150, armL: 22, foreL: 150, lean: 10, head: 10 }, pray: { armR: 22, foreR: 150, armL: 22, foreL: 150, glow: .8 },
      weep: { head: 16, armL: -20, foreL: 150, lean: 8 }, bless: { armR: -30, foreR: 158, glow: .9 }, lift: { armR: -168, foreR: -10, armL: -168, foreL: -10 },
      fly: { lean: 20, armR: -150, armL: -150, foreR: 0, foreL: 0, flap: 1 }, glow: { glow: 1 }, hidden: { op: 0 }, aim: { armR: -86, foreR: -4, armL: -78, foreL: -158 },
      talk: { foreR: -100, armR: 14 }, sad: { head: 14 }
    }[pose] || {};
    if (pose === 'hidden') { S.op = 0; p.render(); return; }
    gsap.to(S, { ...base, ...P, duration: .7, onUpdate: p.render });
    if (pose === 'fly' && (p.spec.kind === 'bird' || p.spec.kind === 'crow')) gsap.to(S, { phase: '+=200', duration: 20, ease: 'none', onUpdate: p.render });
  }

  placeProp(c) {
    let pr = this.props.get(c.key);
    if (!pr) {
      const name = c.key.slice(1).replace(/\d+$/, ''), g = document.createElementNS(NS, 'g');
      g.setAttribute('class', `prop prop-${name}`); g.innerHTML = (PROPS[name] || PROPS.rock)();
      this.propG.appendChild(g); pr = { name, el: g, x: c.x, y: GROUND - c.alt, sc: c.sc };
      this.props.set(c.key, pr); gsap.fromTo(g, { opacity: 0 }, { opacity: 1, duration: .6 });
    }
    pr.x = c.x; pr.y = GROUND - c.alt; pr.sc = c.sc;
    pr.el.setAttribute('transform', `translate(${pr.x},${pr.y}) scale(${pr.sc})`);
    if (['altar', 'lamp'].includes(pr.name)) this.addFire(pr.x, pr.y - (pr.name === 'lamp' ? 26 : 46) * pr.sc, pr.name === 'lamp' ? .3 : 1, c.key);
    return pr;
  }

  addFire(x, y, size, key) { if (!this.emitters.find(e => e.key === key)) this.emitters.push({ key, type: 'fire', x, y, size }); }

  /* ── play one beat ── */
  play(beat) {
    const { script = 'forest', book, title, kanda, place } = beat;
    this.timers.forEach(t => t.kill()); this.timers = [];
    this.hideDialog();
    const [bgPart = 'forest', castPart = '', fxPart = '', actPart = ''] = script.split('|').map(s => s.trim());
    const [bgKey, time] = bgPart.split('/');
    const changed = this.paintEnv(bgKey, time);
    if (changed) { this.clearCast(true); this.emitters = []; }
    // title card
    this.titleEl.innerHTML = `<small>${kanda || ''}</small>${title || ''}${place ? `<i>${place}</i>` : ''}`;
    // cast
    const tokens = castPart.split(/\s+/).filter(Boolean).map(t => this.parseCast(t, book)).filter(Boolean);
    const keep = new Set(tokens.map(t => t.key));
    for (const [k, p] of this.actors) if (!keep.has(k)) { gsap.killTweensOf(p.state); p.idleTween?.kill(); gsap.to(p.state, { op: 0, duration: .5, onUpdate: p.render, onComplete: () => p.el.remove() }); this.actors.delete(k); }
    for (const [k, pr] of this.props) if (!keep.has(k)) { gsap.to(pr.el, { opacity: 0, duration: .5, onComplete: () => pr.el.remove() }); this.props.delete(k); this.emitters = this.emitters.filter(e => e.key !== k); }
    tokens.forEach(t => t.key.startsWith('#') ? this.placeProp(t) : this.placeActor(t));
    // z-order by scale (smaller = further back)
    [...this.actors.values()].sort((a, b) => a.state.sc - b.state.sc).forEach(p => this.castG.appendChild(p.el));
    // fx
    this.fxSet = new Set();
    fxPart.split(/\s+/).filter(Boolean).forEach(f => this.startFx(f));
    // camera: slow Ken Burns
    gsap.killTweensOf(this.cam);
    gsap.fromTo(this.cam, { scale: changed ? 1.08 : gsap.getProperty(this.cam, 'scale') || 1 }, { scale: 1.0 + (Math.random() * .04), x: (Math.random() - .5) * 20, duration: 14, ease: 'sine.inOut' });
    // acts
    (actPart.match(/(?:[^;"]|"[^"]*")+/g) || []).map(s => s.trim()).filter(Boolean).forEach(a => {
      const m = a.match(/^([\d.]+)\s+(\S+)\s+(\S+)(?:\s+"(.*)")?$/);
      if (!m) return;
      const [, t, who, verb, text] = m;
      this.timers.push(gsap.delayedCall(+t + (changed ? .6 : .2), () => this.doAct(who, verb, text)));
    });
    if (!this.running) { this.running = true; requestAnimationFrame(this.loop); }
  }

  doAct(who, verb, text) {
    if (who === 'fx') return this.startFx(verb);
    if (who === 'cam') { if (verb === 'shake') this.shake(); if (verb === 'zoom') gsap.to(this.cam, { scale: 1.18, duration: 2.5, ease: 'power2.inOut' }); if (verb === 'flash') this.flash('#fff'); return; }
    if (who.startsWith('#')) {
      const pr = this.props.get(who); if (!pr) return;
      if (verb === 'break') { const l = pr.el.querySelector('.half-l'), r = pr.el.querySelector('.half-r'); gsap.to(l, { rotation: -24, x: -30, y: 20, svgOrigin: '0 -60', duration: .4, ease: 'power4.out' }); gsap.to(r, { rotation: 24, x: 30, y: 20, svgOrigin: '0 -60', duration: .4, ease: 'power4.out' }); pr.el.querySelector('.str')?.remove(); this.flash('#fff2c0'); this.shake(1.6); this.burst(pr.x, pr.y - 70 * pr.sc, '#ffd870', 160); this.sound?.sfx('thunder'); return; }
      if (verb === 'burn') { this.addFire(pr.x, pr.y - 60 * pr.sc, 2.4, who); this.sound?.sfx('fire'); return; }
      const mv = verb.match(/^(fly|move)>(-?[\d.]+)(?:\^([\d.]+))?$/);
      if (mv) { const tx = +mv[2] / 100 * W, ty = GROUND - (mv[3] ? +mv[3] / 100 * H : 0); gsap.to(pr, { x: tx, y: ty, duration: mv[1] === 'fly' ? 3 : 1.5, ease: 'sine.inOut', onUpdate: () => pr.el.setAttribute('transform', `translate(${pr.x},${pr.y}) scale(${pr.sc})`) }); if (mv[1] === 'fly') this.sound?.sfx('whoosh'); return; }
      if (verb === 'vanish') gsap.to(pr.el, { opacity: 0, duration: .8 });
      if (verb === 'appear') { gsap.fromTo(pr.el, { opacity: 0 }, { opacity: 1, duration: 1 }); this.burst(pr.x, pr.y - 40, '#fff2c0', 60); this.sound?.sfx('chime'); }
      return;
    }
    const key = who.split('.')[0];
    let p = this.actors.get(key);
    if (!p) return;
    if (verb === 'say') return this.say(key, text);
    const [v, target] = verb.split('>');
    const tgtP = target && isNaN(+target) ? (this.actors.get(target) || this.props.get('#' + target)) : null;
    const tgtX = target && !isNaN(+target) ? +target / 100 * W : tgtP ? (tgtP.state ? tgtP.state.x : tgtP.x) : undefined;
    if (tgtX != null && ['shoot', 'strike', 'throw'].includes(v)) { p.state.flip = tgtX > p.state.x ? 1 : -1; p.render(); }
    const snd = { walk: 'steps', run: 'steps', fly: 'whoosh', leap: 'whoosh', fall: 'thud', roar: 'roar', appear: 'chime', bless: 'chime', grow: 'swell', pray: 'chime' }[v];
    if (snd) this.sound?.sfx(snd);
    const opts = { to: tgtX };
    if (v === 'fly' || v === 'leap') { const m = target?.match(/^(-?[\d.]+)(?:\^([\d.]+))?$/); if (m) { opts.to = +m[1] / 100 * W; opts.toY = GROUND - (m[2] ? +m[2] / 100 * H : 0); } else if (tgtP) { opts.toY = (tgtP.state?.y ?? tgtP.y); } }
    if (v === 'shoot') { this.sound?.sfx('draw'); opts.onRelease = () => { const from = handPoint(p, this.svg); const to = tgtP?.state ? centerPoint(tgtP) : { x: tgtX ?? from.x + p.state.flip * 400, y: from.y + 30 }; const col = text || (p.spec.id === 'indrajit' ? '#7aff9a' : '#ffe08a'); this.sound?.sfx('twang'); this.projectile(from, to, col, 'arrow', () => { if (tgtP?.state) { act(tgtP, 'hit'); this.sound?.sfx('impact'); } this.burst(to.x, to.y, col, 50); }); }; }
    if (v === 'strike' || v === 'throw') { this.sound?.sfx('swing'); opts.onRelease = () => { if (v === 'throw') { const from = handPoint(p, this.svg); const to = tgtP?.state ? centerPoint(tgtP) : { x: tgtX, y: GROUND - 100 }; this.projectile(from, to, '#8a7a6a', 'rock', () => { tgtP?.state && act(tgtP, 'hit'); this.sound?.sfx('impact'); this.burst(to.x, to.y, '#d8c8a8', 40); this.shake(.6); }); } else { tgtP?.state && act(tgtP, 'hit'); this.sound?.sfx('impact'); const c = tgtP?.state ? centerPoint(tgtP) : centerPoint(p); this.burst(c.x, c.y, '#ffd8a0', 40); this.shake(.5); } }; }
    if (v === 'fire' || v === 'burn') { const c = centerPoint(p); this.emitters.push({ key: 'burn-' + key, type: 'fire', x: c.x, y: c.y + 40, size: 1.2, follow: p }); this.sound?.sfx('fire'); return; }
    if (v === 'astra') { const from = handPoint(p, this.svg); const to = tgtP?.state ? centerPoint(tgtP) : { x: tgtX ?? W / 2, y: GROUND - 120 }; const col = text || '#ffd870'; act(p, 'shoot', { onRelease: () => { this.sound?.sfx('astra'); this.projectile(from, to, col, 'astra', () => { this.flash(col); this.shake(1.4); this.burst(to.x, to.y, col, 220); this.ring(to.x, to.y, col); tgtP?.state && act(tgtP, 'hit'); this.sound?.sfx('boom'); }); } }); return; }
    const tl = act(p, v, opts);
    this.timers.push(tl);
  }

  say(key, text) {
    if (!text) return;
    const d = this.dialog;
    d.querySelector('b').textContent = nameOf(key);
    const span = d.querySelector('span'); span.textContent = '';
    d.classList.add('on');
    const p = this.actors.get(key);
    if (p) act(p, 'talk');
    let i = 0; const chars = [...text];
    this._typer?.kill();
    this._typer = gsap.to({}, { duration: Math.min(3, chars.length * .028), onUpdate() { const n = Math.floor(this.progress() * chars.length); if (n !== i) { i = n; span.textContent = chars.slice(0, n).join(''); } }, onComplete: () => { span.textContent = text; } });
    clearTimeout(this._dlgT); this._dlgT = setTimeout(() => this.hideDialog(), 3200 + text.length * 55);
  }
  hideDialog() { this.dialog.classList.remove('on'); }

  /* ── fx ── */
  startFx(f) {
    const [name, arg] = f.split('@');
    const x = arg ? +arg / 100 * W : W / 2;
    switch (name) {
      case 'fire': this.addFire(x, GROUND - 10, 1.4, 'fx-fire' + x); this.sound?.sfx('fire'); break;
      case 'burn': for (let i = 0; i < 9; i++) this.addFire(60 + i * 100, 360 + Math.sin(i * 1.7) * 60, 2.2, 'burn' + i); this.sound?.sfx('blaze'); break;
      case 'flash': this.flash('#fff'); break;
      case 'conch': this.sound?.sfx('conch'); break;
      case 'bell': this.sound?.bell(.5); break;
      case 'shake': this.shake(); break;
      case 'lightning': this.lightning(); break;
      case 'ring': this.ring(x, GROUND - 100, '#ffd870'); break;
      case 'nagapasha': this.serpents(); break;
      default: this.amb = { ...this.amb, [name]: 1 }; if (name === 'petals') this.sound?.sfx('petals'); if (name === 'rain') this.sound?.ambience('rain'); break;
    }
  }
  flash(col) { this.flashEl.style.background = col; gsap.fromTo(this.flashEl, { opacity: .85 }, { opacity: 0, duration: .9, ease: 'power2.out' }); }
  shake(k = 1) { gsap.fromTo(this.cam, { x: '+=' + 10 * k }, { x: 0, duration: .5, ease: 'elastic.out(1.4,.25)' }); }
  ring(x, y, col) { this.parts.push({ t: 'ring', x, y, r: 10, life: 1, col }); }
  lightning() { const pts = []; let x = W * (.3 + Math.random() * .4), y = 0; while (y < GROUND) { pts.push([x, y]); x += (Math.random() - .5) * 60; y += 30 + Math.random() * 30; } this.parts.push({ t: 'bolt', pts, life: 1 }); this.flash('#dfe8ff'); this.sound?.sfx('thunder'); }
  serpents() { for (let i = 0; i < 10; i++) { const from = { x: W * .9, y: 60 + i * 20 }, to = { x: W * (.15 + Math.random() * .4), y: GROUND - 80 - Math.random() * 120 }; setTimeout(() => this.projectile(from, to, '#5dff9a', 'serpent', () => this.burst(to.x, to.y, '#5dff9a', 30)), i * 120); } this.sound?.sfx('hiss'); }
  burst(x, y, col, n = 60) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = Math.random() * 7 + 1; this.parts.push({ t: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, life: 1, d: .015 + Math.random() * .02, col, sz: Math.random() * 2.5 + .8 }); } }
  projectile(from, to, col, kind, onHit) {
    const dur = kind === 'astra' ? 55 : kind === 'rock' ? 50 : 32;
    this.parts.push({ t: 'proj', kind, x: from.x, y: from.y, fx: from.x, fy: from.y, tx: to.x, ty: to.y, k: 0, dur, col, trail: [], onHit, arc: kind === 'rock' ? 140 : kind === 'arrow' ? 30 : 10 });
    if (kind !== 'rock') this.sound?.sfx('whoosh');
  }

  loop() {
    if (!this.running || !this.visible) return;
    const c = this.fctx, a = this.amb || {}, t = performance.now() / 1000;
    c.clearRect(0, 0, W, H);
    // ambient spawners
    const R = Math.random;
    if (a.embers && R() < .35 * a.embers) this.parts.push({ t: 'ember', x: R() * W, y: H + 10, vx: (R() - .5) * .6, vy: -R() * 1.6 - .5, life: 1, d: .004, sz: R() * 2 + 1 });
    if (a.petals && R() < .5) this.parts.push({ t: 'petal', x: R() * W, y: -10, vx: (R() - .5) * 1.2, vy: R() * 1.2 + .8, life: 1, d: .002, rot: R() * 6, vr: (R() - .5) * .1, col: ['#ff7aa8', '#ffd870', '#ff9a3a', '#fff0f0'][R() * 4 | 0] });
    if (a.rain && R() < .9) for (let i = 0; i < 3; i++) this.parts.push({ t: 'rain', x: R() * W * 1.2, y: -10, vx: -2, vy: 14, life: 1, d: .02 });
    if (a.snow && R() < .5) this.parts.push({ t: 'snow', x: R() * W, y: -10, vx: (R() - .5) * .6, vy: R() * .8 + .4, life: 1, d: .002, sz: R() * 2 + 1 });
    if (a.fireflies && this.parts.filter(p => p.t === 'fly').length < 30) this.parts.push({ t: 'fly', x: R() * W, y: 300 + R() * 400, ph: R() * 6, life: 1, d: .002 });
    if (a.dust && R() < .2) this.parts.push({ t: 'smoke', x: R() * W, y: GROUND + R() * 80, vx: (R() - .5) * .5, vy: -.2, life: 1, d: .004, sz: 40 + R() * 60, col: '120,80,50' });
    if (a.smoke && R() < .06 * a.smoke) this.parts.push({ t: 'smoke', x: R() * W, y: GROUND, vx: .2, vy: -.4, life: 1, d: .003, sz: 60 + R() * 80, col: '160,150,140' });
    if (a.mist && R() < .05) this.parts.push({ t: 'smoke', x: -100, y: GROUND - 60 + R() * 120, vx: .5 + R() * .4, vy: 0, life: 1, d: .0015, sz: 120 + R() * 140, col: '210,220,230' });
    if (a.birds && R() < .004 * a.birds) { const y = 80 + R() * 200; for (let i = 0; i < 5; i++) this.parts.push({ t: 'bird', x: -20 - i * 18, y: y + Math.abs(i - 2) * 10, vx: 1.6, life: 1, d: .0018, ph: R() * 6 }); this.sound?.sfx('birds'); }
    // fire emitters
    for (const e of this.emitters) {
      if (e.follow) { const cp = centerPoint(e.follow); e.x = cp.x - e.follow.state.flip * 40; e.y = cp.y + 70; }
      for (let i = 0; i < e.size * 2; i++) this.parts.push({ t: 'flame', x: e.x + (R() - .5) * 28 * e.size, y: e.y, vx: (R() - .5) * .5, vy: -R() * 2.2 * e.size - .6, life: 1, d: .03 + R() * .02, sz: (8 + R() * 10) * e.size });
      glowDraw(c, e.x, e.y - 20 * e.size, 70 * e.size, 'rgba(255,140,40,.25)');
    }
    // water shimmer
    if (a.water) { c.globalCompositeOperation = 'lighter'; const [y0, y1] = a.water; for (let i = 0; i < 40; i++) { const yy = y0 + ((i * 37.7) % (y1 - y0)), xx = ((i * 97.3 + t * 30 * (1 + (i % 3))) % (W + 60)) - 30; c.fillStyle = `rgba(255,255,240,${.08 + .08 * Math.sin(t * 3 + i)})`; c.fillRect(xx, yy, 18 + (yy - y0) * .1, 1.5); } c.globalCompositeOperation = 'source-over'; }
    if (a.rays) { c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const x = W * (.2 + i * .13) + Math.sin(t * .3 + i) * 20; const g = c.createLinearGradient(x, 0, x + 120, H); g.addColorStop(0, 'rgba(255,230,170,.12)'); g.addColorStop(1, 'rgba(255,230,170,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 40, 0); c.lineTo(x + 200, H); c.lineTo(x + 100, H); c.fill(); } c.globalCompositeOperation = 'source-over'; }
    // particles
    const next = [];
    for (const p of this.parts) {
      switch (p.t) {
        case 'proj': {
          p.k += 1 / p.dur; const k = Math.min(1, p.k);
          p.x = p.fx + (p.tx - p.fx) * k; p.y = p.fy + (p.ty - p.fy) * k - Math.sin(k * Math.PI) * p.arc;
          if (p.kind === 'serpent') { p.x += Math.sin(k * 30) * 10; }
          p.trail.unshift([p.x, p.y]); if (p.trail.length > (p.kind === 'astra' ? 26 : 12)) p.trail.pop();
          c.globalCompositeOperation = 'lighter';
          c.strokeStyle = p.col; c.lineCap = 'round';
          for (let i = 1; i < p.trail.length; i++) { c.globalAlpha = 1 - i / p.trail.length; c.lineWidth = p.kind === 'astra' ? 10 * (1 - i / p.trail.length) + 2 : p.kind === 'rock' ? 0 : 3; c.beginPath(); c.moveTo(...p.trail[i - 1]); c.lineTo(...p.trail[i]); c.stroke(); }
          c.globalAlpha = 1;
          if (p.kind === 'rock') { c.globalCompositeOperation = 'source-over'; c.fillStyle = '#6a5a4a'; c.beginPath(); c.arc(p.x, p.y, 14, 0, 7); c.fill(); }
          else glowDraw(c, p.x, p.y, p.kind === 'astra' ? 60 : 16, p.col);
          c.globalCompositeOperation = 'source-over';
          if (p.k >= 1) { p.onHit?.(); } else next.push(p);
          continue;
        }
        case 'ring': p.r += 9; p.life -= .03; c.globalCompositeOperation = 'lighter'; c.strokeStyle = p.col; c.globalAlpha = Math.max(0, p.life); c.lineWidth = 6 * p.life; c.beginPath(); c.ellipse(p.x, p.y, p.r, p.r * .35, 0, 0, 7); c.stroke(); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; break;
        case 'bolt': p.life -= .06; c.strokeStyle = `rgba(220,230,255,${p.life})`; c.lineWidth = 3; c.beginPath(); p.pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); break;
        case 'spark': p.x += p.vx; p.y += p.vy; p.vy += .15; p.life -= p.d; c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.max(0, p.life); c.strokeStyle = p.col; c.lineWidth = p.sz; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 2, p.y - p.vy * 2); c.stroke(); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; break;
        case 'ember': p.x += p.vx + Math.sin(t + p.y * .02) * .3; p.y += p.vy; p.life -= p.d; c.globalCompositeOperation = 'lighter'; glowDraw(c, p.x, p.y, p.sz * 4, `rgba(255,${140 + (Math.sin(t * 9 + p.x) * 60 | 0)},40,${p.life * .8})`); c.globalCompositeOperation = 'source-over'; break;
        case 'flame': p.x += p.vx; p.y += p.vy; p.life -= p.d; p.sz *= .985; c.globalCompositeOperation = 'lighter'; glowDraw(c, p.x, p.y, p.sz, `rgba(255,${(80 + p.life * 150) | 0},${(20 + p.life * 40) | 0},${p.life * .55})`); c.globalCompositeOperation = 'source-over'; break;
        case 'smoke': p.x += p.vx; p.y += p.vy; p.life -= p.d; glowDraw(c, p.x, p.y, p.sz, `rgba(${p.col},${Math.sin(p.life * Math.PI) * .14})`); break;
        case 'petal': p.x += p.vx + Math.sin(t * 2 + p.rot) * .6; p.y += p.vy; p.rot += p.vr; p.life -= p.d; c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col; c.globalAlpha = .9; c.beginPath(); c.ellipse(0, 0, 5, 2.6, 0, 0, 7); c.fill(); c.restore(); if (p.y > H) p.life = 0; break;
        case 'rain': p.x += p.vx; p.y += p.vy; c.strokeStyle = 'rgba(180,200,230,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + p.vx * 2, p.y + p.vy * 2); c.stroke(); if (p.y > H) p.life = 0; break;
        case 'snow': p.x += p.vx + Math.sin(t + p.y * .02) * .4; p.y += p.vy; c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(p.x, p.y, p.sz, 0, 7); c.fill(); if (p.y > H) p.life = 0; break;
        case 'fly': p.ph += .02; p.x += Math.sin(p.ph * 1.3) * .6; p.y += Math.cos(p.ph) * .4; p.life -= p.d; c.globalCompositeOperation = 'lighter'; glowDraw(c, p.x, p.y, 8, `rgba(220,255,140,${(.5 + .5 * Math.sin(t * 4 + p.ph * 5)) * p.life})`); c.globalCompositeOperation = 'source-over'; break;
        case 'bird': p.x += p.vx; p.life -= p.d; { const f = Math.sin(t * 10 + p.ph) * 5; c.strokeStyle = 'rgba(20,15,20,.7)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(p.x - 8, p.y - f); c.quadraticCurveTo(p.x - 3, p.y - 2, p.x, p.y); c.quadraticCurveTo(p.x + 3, p.y - 2, p.x + 8, p.y - f); c.stroke(); } if (p.x > W + 20) p.life = 0; break;
      }
      if (p.life > 0) next.push(p);
    }
    this.parts = next.length > 2500 ? next.slice(-2500) : next;
    requestAnimationFrame(this.loop);
  }
}
function glowDraw(c, x, y, r, col) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
