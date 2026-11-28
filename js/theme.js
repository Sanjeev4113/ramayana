// The temple theme around every scene: smooth scrolling, the navigation and its switches, embers drifting over the
// page, scenes that rise into view, and the gallery of the seven Kāṇḍas.
import { PROLOGUE, KANDAS } from './data/story.js';
import { COVER, CV } from './data/covers.js';
import { loop as frames, dpr, LITE } from './calm.js';

const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DEV_NUM = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/* ───────── embers rising over everything ───────── */
export class Embers {
  constructor(canvas, n = 70) {
    this.c = canvas; this.x = canvas.getContext('2d'); this.n = n; this.on = true; this.alpha = 1;
    const s = document.createElement('canvas'); s.width = s.height = 32; const g = s.getContext('2d');
    const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(255,236,190,1)'); gr.addColorStop(.25, 'rgba(255,170,70,.9)'); gr.addColorStop(1, 'rgba(255,90,20,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32); this.sprite = s;
    this.resize = () => { this.dpr = dpr(1); canvas.width = innerWidth * this.dpr; canvas.height = innerHeight * this.dpr; };
    this.resize(); addEventListener('resize', this.resize);
    this.p = Array.from({ length: n }, () => this.spawn(true));
    // drawn only while the page is awake and the embers are shown (they are hidden in the intro and the full-screen book)
    this.run = frames(canvas, t => { if (this.on) this.frame(t); });
  }
  spawn(init) {
    const W = this.c.width, H = this.c.height, z = Math.random();
    return { x: Math.random() * W, y: init ? Math.random() * H : H + 20, z, s: (1 + z * 3.2) * this.dpr, vy: (.25 + z * .9) * this.dpr, vx: (Math.random() - .3) * .5 * this.dpr, ph: Math.random() * 6.28, life: 0 };
  }
  frame(t) {
    const { x: c } = this, W = this.c.width, H = this.c.height;
    c.clearRect(0, 0, W, H); c.globalCompositeOperation = 'lighter';
    for (const p of this.p) {
      p.y -= p.vy; p.x += p.vx + Math.sin(t / 900 + p.ph) * .35 * this.dpr;
      const a = (.35 + .65 * Math.abs(Math.sin(t / 300 + p.ph * 3))) * Math.min(1, (H - p.y) / (H * .2)) * Math.min(1, p.y / (H * .25)) * (.35 + p.z * .65);
      c.globalAlpha = Math.max(0, a) * (this.alpha ?? 1);
      c.drawImage(this.sprite, p.x - p.s * 2, p.y - p.s * 2, p.s * 4, p.s * 4);
      if (p.y < -20 || p.x < -30 || p.x > W + 30) Object.assign(p, this.spawn(false));
    }
  }
}

/* ───────── smooth scrolling ───────── */
export let lenis = null;
function smooth() {
  if (reduced || !window.Lenis) return;
  lenis = new window.Lenis({ lerp: .085, smoothWheel: true, wheelMultiplier: .95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  $$('.modal, .ov, #duel, #fight, .pt-lore, #jr-map').forEach(el => el.setAttribute('data-lenis-prevent', ''));
  window.__lenis = lenis;
}
export function goTo(target, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target; if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: opts.offset ?? 0, duration: opts.duration ?? 1.8, easing: x => 1 - Math.pow(1 - x, 4), immediate: !!opts.immediate });
  else el.scrollIntoView({ behavior: opts.immediate ? 'auto' : 'smooth' });
}

/* ───────── navigation, sound and the switches ───────── */
function nav(sound) {
  const navEl = $('#nav');
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const t = document.getElementById(a.getAttribute('href').slice(1)); if (!t) return;
    e.preventDefault(); document.body.classList.remove('menu-open'); $('.nv-menu')?.setAttribute('aria-expanded', 'false'); goTo(t);
  });
  $('.nv-menu').addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    $('.nv-menu').setAttribute('aria-expanded', String(open));
  });
  addEventListener('scroll', () => navEl.classList.toggle('solid', scrollY > innerHeight * .5), { passive: true });
  const links = $$('[data-nav]');
  const ctx = $('#ctx-switch');
  const CTX = { hero: 'Mandala', verse: 'Mandala', dharma: 'Mandala', kandas: 'Mandala', odyssey: 'Map', pantheon: 'Map', journey: 'Mandala', today: 'Mandala', yuddha: 'Mandala', sources: 'Mandala' };
  ['hero', 'verse', 'dharma', 'kandas', 'odyssey', 'pantheon', 'journey', 'today', 'learn', 'yuddha', 'sources'].forEach(id => ScrollTrigger.create({
    trigger: '#' + id, start: 'top 55%', end: 'bottom 55%',
    onToggle: s => { if (!s.isActive) return; links.forEach(a => a.classList.toggle('on', a.dataset.nav === id)); ctx.dataset.mode = CTX[id]; $('span', ctx).textContent = CTX[id]; ctx.setAttribute('aria-checked', String(CTX[id] === 'Map' ? !document.body.classList.contains('no-map') : !document.body.classList.contains('no-mandala'))); }
  }));
  ctx.addEventListener('click', () => {
    const k = ctx.dataset.mode === 'Map' ? 'no-map' : 'no-mandala';
    document.body.classList.toggle(k); ctx.setAttribute('aria-checked', String(!document.body.classList.contains(k)));
  });
  // one switch for the temple's sound: music and ambience (narration has its own control in the book)
  const sw = $('#sound-switch');
  const sync = () => sw.setAttribute('aria-checked', String(!!sound.ctx && (sound.musicOn || sound.sfxOn)));
  sw.addEventListener('click', async () => {
    const on = sw.getAttribute('aria-checked') !== 'true';
    await sound.start(); sound.setMusic(on); sound.setSfx(on); sync();
  });
  sound.onChange(sync); sync();
  $('#sound-toggle').addEventListener('click', e => { e.stopPropagation(); $('#sound-panel').hidden = !$('#sound-panel').hidden; });
  document.addEventListener('click', e => { if (!e.target.closest('#sound-panel, #sound-toggle')) $('#sound-panel').hidden = true; });
}

/* ───────── scenes rising into view ───────── */
function reveals() {
  if (reduced) return;
  $$('.scene .sc-head').forEach(h => gsap.from(h.children, { y: 40, opacity: 0, filter: 'blur(8px)', duration: 1.3, stagger: .12, ease: 'power3.out', clearProps: 'filter,transform', scrollTrigger: { trigger: h, start: 'top 85%', once: true } }));
  $$('.sc-orn i').forEach(i => gsap.from(i, { scaleX: 0, duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: i, start: 'top 90%', once: true } }));
  gsap.from('.book', { y: 60, opacity: 0, rotateX: 8, transformPerspective: 1600, duration: 1.5, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: '.book', start: 'top 85%', once: true } });
  gsap.from('.od-side > *', { x: 50, opacity: 0, duration: 1.2, stagger: .14, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: '.od-side', start: 'top 85%', once: true } });
  gsap.from('.src-card', { y: 40, opacity: 0, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.src-grid', start: 'top 85%', once: true } });
  // the hero: the title rises and dissolves into the sky as the Kāṇḍas come up
  gsap.to('.hs', { y: () => -innerHeight * .12, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom 15%', scrub: true } });
  // (a scale and a fade, both drawn by the compositor: a blur here was recomputed on every scroll frame)
  gsap.to('#hero-canvas', { scale: 1.1, opacity: .4, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
}

/* ───────── the seven Kāṇḍas ───────── */
function kandas(open) {
  const track = $('.kd-track');
  const SHORT = { bala: 'Bāla', ayodhya: 'Ayodhyā', aranya: 'Araṇya', kishkindha: 'Kiṣkindhā', sundara: 'Sundara', yuddha: 'Yuddha', uttara: 'Uttara' };
  track.innerHTML = KANDAS.map((k, i) => `
    <article class="kd-card" data-book="${k.id}" tabindex="0" role="button" aria-label="Open ${k.name}">
      <img src="assets/scenes/ill/${COVER[k.id]}.webp?v=${CV}" alt="" loading="lazy" decoding="async">
      <div class="kd-top">${SHORT[k.id]}<span class="kd-num">${DEV_NUM[i + 1]}</span></div>
      <i class="kd-glare"></i>
      <div class="kd-bot"><div class="kd-dev">${k.dev}</div><div class="kd-name">${k.subtitle}</div><p class="kd-sum">${k.summary}</p><span class="kd-open">Open the Kāṇḍa →</span></div>
    </article>`).join('');
  $$('.kd-card', track).forEach(c => {
    c.addEventListener('click', () => open(c.dataset.book));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(c.dataset.book); } });
    if (!reduced && matchMedia('(hover: hover)').matches) {
      const rx = gsap.quickTo(c, 'rotateX', { duration: .6, ease: 'power3' }), ry = gsap.quickTo(c, 'rotateY', { duration: .6, ease: 'power3' });
      c.addEventListener('pointermove', e => { const b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height; rx((.5 - y) * 10); ry((x - .5) * 12); c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%'); });
      c.addEventListener('pointerleave', () => { rx(0); ry(0); });
      gsap.set(c, { transformPerspective: 900 });
    }
  });
  $('.kd-arrow.l').addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * .6, behavior: 'smooth' }));
  $('.kd-arrow.r').addEventListener('click', () => track.scrollBy({ left: track.clientWidth * .6, behavior: 'smooth' }));
  if (!reduced) gsap.from($$('.kd-card', track), { y: 120, opacity: 0, rotateX: -18, transformPerspective: 1400, duration: 1.4, stagger: .09, ease: 'power3.out', scrollTrigger: { trigger: track, start: 'top 90%', once: true } });
}


/* ───────── the golden cursor ───────── */
function cursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || reduced) return;
  document.documentElement.classList.add('has-cursor');
  const el = $('#cursor'), dot = $('.dot', el), halo = $('.halo', el);
  const dx = gsap.quickSetter(dot, 'x', 'px'), dy = gsap.quickSetter(dot, 'y', 'px');
  const hx = gsap.quickTo(halo, 'x', { duration: .45, ease: 'power3.out' }), hy = gsap.quickTo(halo, 'y', { duration: .45, ease: 'power3.out' });
  addEventListener('pointermove', e => {
    dx(e.clientX); dy(e.clientY); hx(e.clientX); hy(e.clientY);
    const t = e.target.closest?.('a, button, [role="button"], select, .kd-card, .face, .pin, .bk-page, .pt-figure');
    el.classList.toggle('on', !!t);
    const b = e.target.closest?.('.hs-btn, .th-play');
    if (b) { const r = b.getBoundingClientRect(); b.style.setProperty('--mx', `${(e.clientX - r.left) / r.width * 100}%`); b.style.setProperty('--my', `${(e.clientY - r.top) / r.height * 100}%`); }
  }, { passive: true });
  addEventListener('pointerdown', () => el.classList.toggle('down', true)); addEventListener('pointerup', () => el.classList.toggle('down', false));
  document.addEventListener('mouseleave', () => gsap.to(el, { opacity: 0, duration: .3 })); document.addEventListener('mouseenter', () => gsap.to(el, { opacity: 1, duration: .3 }));
}

/* ───────── the Kāṇḍa compass on the left pillar ───────── */
function compass(open) {
  const c = $('#compass');
  const NAMES = { bala: 'Bāla', ayodhya: 'Ayodhyā', aranya: 'Araṇya', kishkindha: 'Kiṣkindhā', sundara: 'Sundara', yuddha: 'Yuddha', uttara: 'Uttara' };
  c.innerHTML = KANDAS.map((k, i) => `<button data-k="${k.id}" aria-label="${k.name}"><span>${DEV_NUM[i + 1]} · ${NAMES[k.id] || k.name}</span></button>`).join('');
  c.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) open(b.dataset.k); });
  window.__compass = id => $$('button', c).forEach(b => b.classList.toggle('on', b.dataset.k === id));
  ScrollTrigger.create({ trigger: '#kandas', start: 'top 60%', endTrigger: '#odyssey', end: 'bottom 40%', onToggle: s => c.classList.toggle('show', s.isActive) });
}

/* ───────── the numbers of the epic ───────── */
function dharma() {
  $$('.dh-ring b').forEach(b => {
    const n = +b.dataset.count, o = { v: 0 };
    gsap.to(o, { v: n, duration: 2.4, ease: 'power2.out', scrollTrigger: { trigger: b, start: 'top 85%', once: true }, onUpdate: () => { b.textContent = Math.round(o.v).toLocaleString('en-IN'); } });
  });
  if (!reduced) gsap.from('.dh-ring', { scale: .6, opacity: 0, rotate: -40, duration: 1.4, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.dh-rings', start: 'top 85%', once: true } });
}

/* ───────── the opening verse, over the Glimpse (the film itself is run by js/glimpse.js) ───────── */
function verse() {
  gsap.timeline({ scrollTrigger: { trigger: '#verse', start: 'top 45%', once: true } })
    .fromTo('.vs-dev', { opacity: 0, letterSpacing: '.2em', filter: 'blur(10px)' }, { opacity: 1, letterSpacing: '0em', filter: 'blur(0px)', duration: 1.6, ease: 'power2.out', clearProps: 'filter' })
    .fromTo('.vs-tr, .vs-en, .vs-src', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.1, stagger: .18, ease: 'power2.out' }, '-=.9');
}

export function initTheme({ sound, openKanda }) {
  smooth(); nav(sound); kandas(openKanda); reveals(); cursor(); compass(openKanda); dharma(); verse();
  const embers = new Embers($('#embers'), LITE ? 30 : 64);
  const lightUp = () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); };
  addEventListener('load', lightUp);
  return { embers, refresh: lightUp };
}
