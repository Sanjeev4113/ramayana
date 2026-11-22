// Laṅkā Yuddha: the burning city of Laṅkā under an all-out war sky — blazing meteor-arrow barrages streaking through
// drifting backlit battle smoke, flickering siege-fire blooms along the horizon, sparks, and distant war-storm flashes.
import { loop as frames, dpr, LITE } from './calm.js';
const $ = (s, el = document) => el.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);

export function initYuddha({ src }) {
  const img = $('.yd-bg img'); img.src = src;
  const cv = $('#meteors'), c = cv.getContext('2d');
  let list = [], sparks = [], flashes = [];
  const resize = () => { const d = dpr(1.5); cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d; };
  resize(); addEventListener('resize', resize);

  const spawn = (salvo = false) => {
    const W = cv.width, H = cv.height, d = dpr(1.5);
    const fromRight = Math.random() < .62, s = (.65 + Math.random() * 1.05) * d;
    const ang = fromRight ? Math.PI * (.73 + Math.random() * .09) : Math.PI * (.17 + Math.random() * .09);
    const v = (950 + Math.random() * 980) * s;
    const x = fromRight ? W * (salvo ? rnd(.55, 1.08) : rnd(.42, 1.12)) : W * (salvo ? rnd(-.08, .42) : rnd(-.1, .45));
    return { x, y: -30 - Math.random() * H * .28, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, len: (130 + Math.random() * 230) * s, w: (2 + Math.random() * 4.2) * s, life: 1.7, gold: !fromRight };
  };

  let salvoCd = 1.2, flashCd = 2.8;
  const frame = (t, dt) => {
    const W = cv.width, H = cv.height, d = dpr(1.5), sec = t / 1000;
    if (Math.random() < dt * (LITE ? 4 : 7.5)) list.push(spawn());
    salvoCd -= dt;
    if (salvoCd <= 0) {
      salvoCd = rnd(1.8, 3.6);
      const n = LITE ? 4 : 7;
      for (let i = 0; i < n; i++) list.push(spawn(true));
    }
    flashCd -= dt;
    if (flashCd <= 0) {
      flashCd = rnd(2.2, 4.8);
      flashes.push({ x: rnd(W * .15, W * .85), y: rnd(H * .38, H * .72), r: rnd(W * .16, W * .34), a: rnd(.28, .52), life: .45, max: .45, fire: Math.random() < .72 });
    }

    c.clearRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';

    // distant flickering siege-fire blooms along Laṅkā's burning skyline
    for (let i = 0; i < 3; i++) {
      const fx = W * (.18 + i * .32), fy = H * (.74 + (i % 2) * .06);
      const flick = .55 + .45 * Math.sin(sec * (3.4 + i * 1.4) + i * 2);
      const fr = W * (.22 + .06 * flick);
      const g = c.createRadialGradient(fx, fy, 0, fx, fy, fr);
      g.addColorStop(0, `rgba(255,112,32,${.18 * flick})`);
      g.addColorStop(.5, `rgba(195,46,12,${.07 * flick})`);
      g.addColorStop(1, 'rgba(120,20,0,0)');
      c.fillStyle = g; c.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
    }

    // distant artillery explosion / lightning cloud flashes
    flashes = flashes.filter(f => (f.life -= dt) > 0);
    for (const f of flashes) {
      const a = (f.life / f.max) * f.a;
      const g = c.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      g.addColorStop(0, f.fire ? `rgba(255,218,130,${a})` : `rgba(210,232,255,${a * .9})`);
      g.addColorStop(.35, f.fire ? `rgba(255,102,28,${a * .55})` : `rgba(120,170,255,${a * .4})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
    }

    // blazing flaming meteor-arrows + trailing sparks
    list = list.filter(m => (m.life -= dt) > 0 && m.y < H + 220);
    for (const m of list) {
      m.x += m.vx * dt; m.y += m.vy * dt;
      const n = Math.hypot(m.vx, m.vy), tx = m.x - m.vx / n * m.len, ty = m.y - m.vy / n * m.len;
      const g = c.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, 'rgba(255,252,230,1)');
      g.addColorStop(.14, m.gold ? 'rgba(255,222,124,.95)' : 'rgba(255,186,84,.95)');
      g.addColorStop(.5, m.gold ? 'rgba(255,164,54,.55)' : 'rgba(255,96,26,.55)');
      g.addColorStop(1, 'rgba(160,30,0,0)');
      c.strokeStyle = g; c.lineWidth = m.w; c.lineCap = 'round';
      c.beginPath(); c.moveTo(m.x, m.y); c.lineTo(tx, ty); c.stroke();
      const r = c.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.w * 6.5);
      r.addColorStop(0, 'rgba(255,248,218,.98)'); r.addColorStop(.4, 'rgba(255,156,56,.42)'); r.addColorStop(1, 'rgba(255,100,20,0)');
      c.fillStyle = r; c.beginPath(); c.arc(m.x, m.y, m.w * 6.5, 0, 6.283); c.fill();
      if (sparks.length < (LITE ? 45 : 95) && Math.random() < dt * 20) {
        sparks.push({ x: m.x, y: m.y, vx: -m.vx * .08 + rnd(-55, 55) * d, vy: -m.vy * .08 + rnd(-45, 35) * d, life: rnd(.35, .75), max: .75, s: rnd(1.2, 2.8) * d });
      }
    }

    // trailing wind-whipped sparks
    sparks = sparks.filter(s => (s.life -= dt) > 0);
    for (const s of sparks) {
      s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 120 * d * dt;
      const a = s.life / s.max;
      c.strokeStyle = `rgba(255,196,92,${a * .85})`; c.lineWidth = s.s;
      c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(s.x - s.vx * .03, s.y - s.vy * .03); c.stroke();
    }
  };
  frames(cv, frame);
  window.gsap.fromTo('.yd-card', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: .12, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '.yd-cards', start: 'top 95%', once: true } });
}
