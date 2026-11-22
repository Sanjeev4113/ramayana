// The divine layer over the page: smooth inertial scrolling, section titles in gold leaf that rise letter by letter
// beneath a lotus ornament, painted backdrops that drift with parallax, a soft golden light that follows the
// pointer, and the gallery of the seven Kāṇḍas.
import { PROLOGUE, KANDAS } from './data/story.js';
import { COVER, CV } from './data/covers.js';

const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, SplitText = window.SplitText;
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const DEV_NUM = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

const LOTUS = `<svg class="orn" viewBox="0 0 240 40" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1"><path d="M0 20 H86"/><path d="M154 20 H240"/><path d="M120 6 C110 14 110 26 120 34 C130 26 130 14 120 6Z"/><path d="M120 12 C100 12 94 22 92 28 C104 26 112 24 120 20"/><path d="M120 12 C140 12 146 22 148 28 C136 26 128 24 120 20"/><circle cx="96" cy="20" r="1.6"/><circle cx="144" cy="20" r="1.6"/></g></svg>`;

/* ───────── smooth scrolling ───────── */
export let lenis = null;
function smooth() {
  if (reduced || !window.Lenis) return;
  lenis = new window.Lenis({ lerp: .09, smoothWheel: true, wheelMultiplier: .95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  // the book, the stage, the map and every overlay keep their own wheel and touch handling
  $$('#katha, #map .map-shell, #war-3d, .modal, #duel, #fight, #char-grid').forEach(el => el.setAttribute('data-lenis-prevent', ''));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const t = document.getElementById(a.getAttribute('href').slice(1)); if (!t) return;
    e.preventDefault(); lenis.scrollTo(t, { offset: -10, duration: 1.6, easing: x => 1 - Math.pow(1 - x, 4) });
  });
  window.__lenis = lenis;
}

/* ───────── section titles ───────── */
function titles() {
  $$('.eyebrow').forEach(e => {
    // letter-spacing breaks Devanagari apart, so its words are kept tight within the spaced Latin caps
    e.innerHTML = e.innerHTML.replace(/[ऀ-ॿ][ऀ-ॿ\s]*[ऀ-ॿ]|[ऀ-ॿ]/g, m => `<span class="dv0">${m}</span>`);
    if (!e.nextElementSibling?.classList.contains('orn')) e.insertAdjacentHTML('afterend', LOTUS);
  });
  $$('.section-title').forEach(t => {
    if (reduced || !SplitText) { t.classList.add('leaf'); return; }
    // the letters rise in plain gold; once they settle, the title becomes one sheet of moving gold leaf
    const split = new SplitText(t, { type: 'words,chars', wordsClass: 'st-w', charsClass: 'st-c' });
    gsap.from(split.chars, {
      yPercent: 70, opacity: 0, rotateX: -50, filter: 'blur(6px)', duration: 1.1, ease: 'power3.out', stagger: .022,
      scrollTrigger: { trigger: t, start: 'top 86%', once: true },
      onComplete: () => { split.revert(); t.classList.add('leaf'); }
    });
  });
  $$('.orn').forEach(o => gsap.from(o, { scaleX: 0, opacity: 0, duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: o, start: 'top 90%', once: true } }));
  $$('.lede').filter(l => !gsap.getTweensOf(l).length).forEach(l => gsap.from(l, { y: 24, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: l, start: 'top 90%', once: true } }));
}

/* ───────── painted backdrops ───────── */
function backdrops() {
  $$('[data-backdrop]').forEach(sec => {
    const d = document.createElement('div'); d.className = 'backdrop';
    d.innerHTML = `<img src="assets/scenes/${sec.dataset.backdrop}?v=${CV}" alt="" loading="lazy" decoding="async">`;
    sec.prepend(d);
    if (!reduced) gsap.fromTo(d.firstChild, { yPercent: -8, scale: 1.12 }, { yPercent: 8, scale: 1.04, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

/* ───────── the light that follows the pointer ───────── */
function glow() {
  if (!fine || reduced) return;
  const g = document.createElement('div'); g.className = 'cursor-glow'; document.body.appendChild(g);
  const x = gsap.quickTo(g, 'x', { duration: .9, ease: 'power3.out' }), y = gsap.quickTo(g, 'y', { duration: .9, ease: 'power3.out' });
  addEventListener('pointermove', e => { x(e.clientX); y(e.clientY); }, { passive: true });
}

/* ───────── the seven Kāṇḍas ───────── */
function kandas() {
  const sec = $('#kandas'); if (!sec) return;
  const track = $('.k-track', sec);
  track.innerHTML = KANDAS.map((k, i) => `
    <article class="k-card" data-book="${k.id}" style="--accent:${k.accent}" tabindex="0" role="button" aria-label="Open ${k.name}">
      <div class="k-img"><img src="assets/scenes/ill/${COVER[k.id]}.webp?v=${CV}" alt="" loading="lazy" decoding="async"></div>
      <div class="k-shade"></div>
      <div class="k-num">${DEV_NUM[i + 1]}</div>
      <div class="k-body">
        <div class="k-dev">${k.dev}</div>
        <h3 class="k-en">${k.name}</h3>
        <div class="k-sub">${k.subtitle}</div>
        <p class="k-sum">${k.summary}</p>
        <span class="k-open">Open the Kāṇḍa <i>→</i></span>
      </div>
      <i class="k-corner tl"></i><i class="k-corner tr"></i><i class="k-corner bl"></i><i class="k-corner br"></i>
    </article>`).join('');
  const open = id => window.__openBook?.(id, 0, true);
  $$('.k-card', track).forEach(c => {
    c.addEventListener('click', () => open(c.dataset.book));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(c.dataset.book); } });
    if (fine && !reduced) {
      const rx = gsap.quickTo(c, 'rotateX', { duration: .6, ease: 'power3' }), ry = gsap.quickTo(c, 'rotateY', { duration: .6, ease: 'power3' });
      c.addEventListener('pointermove', e => { const b = c.getBoundingClientRect(); const u = (e.clientX - b.left) / b.width - .5, v = (e.clientY - b.top) / b.height - .5; ry(u * 8); rx(-v * 8); c.style.setProperty('--mx', `${(u + .5) * 100}%`); c.style.setProperty('--my', `${(v + .5) * 100}%`); });
      c.addEventListener('pointerleave', () => { rx(0); ry(0); });
    }
  });
  // on wide screens the gallery is pinned and glides sideways as the page scrolls
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const dist = () => track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft);
    const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1 } });
    $$('.k-card img', track).forEach(img => gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('.k-card'), containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } }));
    return () => tw.scrollTrigger?.kill();
  });
  gsap.from($$('.k-card', track), { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: sec, start: 'top 75%', once: true } });
}

/* ───────── the closing maṇḍala ───────── */
async function footer() {
  const f = $('#footer'); if (!f) return;
  const { mandala } = await import('./entry.js');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 400 400'); svg.setAttribute('class', 'footer-mandala'); svg.setAttribute('aria-hidden', 'true');
  f.prepend(svg);
  const md = mandala(svg); md.progress.style.display = 'none'; md.pearls.style.opacity = .7;
  gsap.to(md.lines, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', stagger: .015, scrollTrigger: { trigger: f, start: 'top 80%', once: true } });
  if (!reduced) gsap.to(svg, { rotation: 360, duration: 300, repeat: -1, ease: 'none' });
}

export async function initDivine() {
  footer();
  await document.fonts.ready;
  smooth(); titles(); backdrops(); glow(); kandas();
  if (lenis && document.body.classList.contains('is-loading')) lenis.stop();
  // triggers made before the pinned gallery must be measured after it: refresh in page order
  const start = () => { lenis?.start(); ScrollTrigger.sort(); ScrollTrigger.refresh(); };
  new MutationObserver(() => { if (document.body.classList.contains('entered')) start(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  addEventListener('load', () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
  ScrollTrigger.sort(); ScrollTrigger.refresh();
}
