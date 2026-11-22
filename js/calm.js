// The page's breath. Every decorative motion (embers, golden dust, light on the painted plates, meteors, the slow
// spin of the yantras) asks here whether to move, so that the site stays light on any machine:
//  · motion out of view sleeps, and a section's CSS animations pause while it is off screen;
//  · when the tab is hidden, the window is in the background, or the reader has been still for a while with nothing
//    being read aloud, the page comes to rest (ambient motion pauses, embers fade) and wakes at the first touch,
//    scroll or key;
//  · effects are drawn at modest resolution and at most 60 frames a second (30 on a modest machine).
const gsap = window.gsap;
const html = document.documentElement;
const mem = navigator.deviceMemory || 8, cores = navigator.hardwareConcurrency || 8;
export const LITE = !!(navigator.connection?.saveData || mem <= 4 || cores <= 4 || matchMedia('(max-width: 760px)').matches);
export const FPS = LITE ? 30 : 60;
/** resolution for a soft effect: never above `max`, and 1 on a modest machine */
export const dpr = (max = 1) => Math.min(devicePixelRatio || 1, LITE ? 1 : max);
if (LITE) html.classList.add('lite');

let awake = true, last = performance.now(), focused = document.hasFocus();
const holds = new Set(), subs = new Set();
const IDLE = 60000, AWAY = 15000;
export const isAwake = () => awake && !document.hidden;
/** fn(awake) runs whenever the page comes to rest or wakes */
export const onBreath = fn => { subs.add(fn); return fn; };
export const offBreath = fn => subs.delete(fn);
/** something being read aloud or played keeps the page awake while it lasts */
export function hold(key, on) { on ? holds.add(key) : holds.delete(key); if (on) wake(); }

function set(v) {
  if (v === awake) return; awake = v;
  html.classList.toggle('calm', !v);
  v ? gsap?.ticker.wake() : gsap?.ticker.sleep();
  subs.forEach(f => f(v));
}
function wake() { last = performance.now(); set(true); }
['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(e => addEventListener(e, wake, { passive: true, capture: true }));
addEventListener('scroll', wake, { passive: true });
addEventListener('focus', () => { focused = true; wake(); });
addEventListener('blur', () => { focused = false; last = performance.now(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); subs.forEach(f => f(isAwake())); });
// a film, a duel or a fight on screen plays by itself: someone is watching, so the page never rests under it
const watching = () => document.getElementById('intro') || ['duel', 'fight'].some(id => { const e = document.getElementById(id); return e && !e.hidden; });
// one quiet check every few seconds decides whether the page may rest
setInterval(() => {
  if (!awake || holds.size || watching()) { if (awake) last = Math.max(last, performance.now() - IDLE / 2); return; }
  if (performance.now() - last > (focused ? IDLE : AWAY)) set(false);
}, 3000);

/**
 * A decorative animation loop: draw(t, dt) runs only while `el` is near the view, the page is awake and the tab is
 * shown, at most `fps` times a second; otherwise no frames are requested at all.
 */
export function loop(el, draw, { fps = FPS, margin = '100px' } = {}) {
  let seen = !el, raf = 0, prev = 0, stopped = false;
  const gap = 1000 / fps - 2;
  const want = () => !stopped && seen && isAwake();
  const tick = t => {
    raf = 0; if (!want()) return;
    raf = requestAnimationFrame(tick);
    if (prev && t - prev < gap) return;
    const dt = prev ? Math.min(.05, (t - prev) / 1000) : 1 / fps; prev = t;
    draw(t, dt);
  };
  const kick = () => { if (!raf && want()) { prev = 0; raf = requestAnimationFrame(tick); } };
  if (el) new IntersectionObserver(([e]) => { seen = e.isIntersecting; kick(); }, { rootMargin: margin }).observe(el);
  onBreath(kick);
  kick();
  return { kick, stop() { stopped = true; cancelAnimationFrame(raf); raf = 0; }, get running() { return !!raf; } };
}

/** pause GSAP tweens that only decorate (an endless sheen, a turning ring) while `el` is out of view */
export function ambient(el, tweens) {
  tweens = tweens.filter(Boolean);
  let seen = true;
  const apply = () => tweens.forEach(t => (seen ? t.resume() : t.pause()));
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; apply(); }, { rootMargin: '100px' }).observe(el);
}

/** CSS animations inside a section sleep while the section is out of view */
export function sleepOffscreen(els) {
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('zz', !e.isIntersecting)), { rootMargin: '120px' });
  els.forEach(el => el && io.observe(el));
}
