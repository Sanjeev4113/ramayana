// Laṅkā Yuddha: the last battle painted wide, with blazing arrows streaking across the smoke like meteors.
import { loop as frames, dpr } from './calm.js';
const $ = (s, el = document) => el.querySelector(s);

export function initYuddha({ src }) {
  const img = $('.yd-bg img'); img.src = src;
  const cv = $('#meteors'), c = cv.getContext('2d'); let list = [];
  const resize = () => { const d = dpr(1.5); cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d; };
  resize(); addEventListener('resize', resize);
  const spawn = () => {
    const W = cv.width, H = cv.height, fromRight = Math.random() < .7, s = (.6 + Math.random() * .9) * dpr(1.5);
    const ang = fromRight ? Math.PI * (.74 + Math.random() * .08) : Math.PI * (.18 + Math.random() * .08);
    const v = (900 + Math.random() * 900) * s;
    return { x: fromRight ? W * (.45 + Math.random() * .7) : W * (-.1 + Math.random() * .4), y: -40 - Math.random() * H * .3, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, len: (120 + Math.random() * 200) * s, w: (2 + Math.random() * 4) * s, life: 1.6 };
  };
  const frame = (t, dt) => {
    if (Math.random() < dt * 4.5) list.push(spawn());
    c.clearRect(0, 0, cv.width, cv.height); c.globalCompositeOperation = 'lighter';
    list = list.filter(m => (m.life -= dt) > 0 && m.y < cv.height + 200);
    for (const m of list) {
      m.x += m.vx * dt; m.y += m.vy * dt;
      const n = Math.hypot(m.vx, m.vy), tx = m.x - m.vx / n * m.len, ty = m.y - m.vy / n * m.len;
      const g = c.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(.12, 'rgba(255,200,90,.95)'); g.addColorStop(.5, 'rgba(255,110,30,.5)'); g.addColorStop(1, 'rgba(160,30,0,0)');
      c.strokeStyle = g; c.lineWidth = m.w; c.lineCap = 'round'; c.beginPath(); c.moveTo(m.x, m.y); c.lineTo(tx, ty); c.stroke();
      const r = c.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.w * 6); r.addColorStop(0, 'rgba(255,240,200,.95)'); r.addColorStop(1, 'rgba(255,120,30,0)');
      c.fillStyle = r; c.beginPath(); c.arc(m.x, m.y, m.w * 6, 0, 6.283); c.fill();
    }
  };
  frames(cv, frame);    // only while the battle is in view and the page awake
  // explicit end values and cleared afterwards: a card never stays lowered over the Sources line
  window.gsap.fromTo('.yd-card', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: .12, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '.yd-cards', start: 'top 95%', once: true } });
}
