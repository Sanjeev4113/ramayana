import { PROLOGUE, KANDAS } from './data/story.js';
import { CHARACTERS, FACTIONS, MINOR_NAMES } from './data/characters.js';
import { PLACES } from './data/places.js';
import { DUELS, ASTRAS } from './data/duels.js';
import { Sound } from './sound.js';
import { specFor } from './puppet.js';
import { CAST } from './data/cast.js';
import { SHADOW, LIGHT } from './data/proxies.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
// Keep animations in real time even when a heavy WebGL frame stalls the ticker.
gsap.ticker.lagSmoothing(0);

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const CHAR = Object.fromEntries(CHARACTERS.map(c => [c.id, c]));
const PLACE = Object.fromEntries(PLACES.map(p => [p.id, p]));
const BOOKS = [PROLOGUE, ...KANDAS];
const DEV_NUM = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const devNum = n => String(n).split('').map(d => DEV_NUM[+d]).join('');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sound = window.__sound = new Sound();

// Wrap Devanagari runs so they get the Devanagari face and gold colour.
const fmt = t => t.replace(/[ऀ-ॿ][ऀ-ॿ\s।॥,]*[ऀ-ॿ।॥]/g, m => `<span class="dv">${m}</span>`);

/* ───────────────────────── Emblem (for figures without portraits) ───────────────────────── */
function emblemSVG(color, petals = 16) {
  let p = '';
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * 360;
    p += `<path d="M100 100 C 92 70, 92 40, 100 18 C 108 40, 108 70, 100 100Z" transform="rotate(${a} 100 100)" />`;
  }
  let dots = '';
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    dots += `<circle cx="${100 + Math.cos(a) * 94}" cy="${100 + Math.sin(a) * 94}" r="1.2"/>`;
  }
  return `<svg viewBox="0 0 200 200" aria-hidden="true">
    <g fill="none" stroke="${color}" stroke-width=".7" opacity=".85">${p}</g>
    <circle cx="100" cy="100" r="86" fill="none" stroke="${color}" stroke-width=".6" opacity=".6"/>
    <circle cx="100" cy="100" r="40" fill="none" stroke="${color}" stroke-width="1" opacity=".8"/>
    <g fill="${color}" opacity=".7">${dots}</g>
  </svg>`;
}

/* ───────────────────────── SOUND TOGGLE ───────────────────────── */
function updateSoundBtn() {
  $('#sound-toggle').classList.toggle('muted', !sound.on);
  $$('[data-snd]').forEach(b => b.classList.toggle('on', { music: sound.musicOn, sfx: sound.sfxOn, narrate: sound.narrateOn }[b.dataset.snd]));
}
sound.onChange(updateSoundBtn);
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-snd]'); if (!b) return;
  await sound.start();
  const k = b.dataset.snd;
  if (k === 'music') sound.setMusic(!sound.musicOn);
  if (k === 'sfx') sound.setSfx(!sound.sfxOn);
  if (k === 'narrate') sound.setNarrate(!sound.narrateOn);
});
// Browsers need a gesture before audio can start.
document.addEventListener('pointerdown', () => { if (!sound.ctx && document.body.classList.contains('entered')) sound.start(); }, { once: false, passive: true });

/* ───────────────────────── CHARACTERS ───────────────────────── */
let activeFaction = 'all';
const FEATURED = ['rama', 'sita', 'hanuman', 'ravana', 'lakshmana'];
// Cut-out character art built by tools/build-characters.mjs from the 3D renders.
let CUTM = {};
const cutReady = fetch('assets/characters/cut/manifest.json').then(r => r.ok ? r.json() : {}).catch(() => ({})).then(m => { CUTM = m || {}; });
const cutViews = id => { const v = CUTM[id]?.views; return v ? ['front', 'left', 'right', 'back'].filter(k => v[k]).map(k => v[k].src) : null; };
// A figure with no art of its own is shown as a golden-rimmed silhouette (or radiant light for a deva) of a related figure.
function proxyArt(id) {
  const l = LIGHT[id], key = l ? l[0] : SHADOW[id];
  const src = key && CUTM[key]?.views?.front?.src;
  return src ? { src, light: !!l, color: l ? l[1] : null } : null;
}

/* ───────────────────────── CHARACTER MODAL (360° turntable) ───────────────────────── */
function appearancesOf(id) {
  const out = [];
  BOOKS.forEach(b => b.episodes.forEach((ep, i) => { if (ep.chars?.includes(id)) out.push({ book: b, i, ep }); }));
  return out;
}

let turntableCleanup = null;
function openChar(id) {
  const c = CHAR[id]; if (!c) return;
  const f = FACTIONS[c.faction];
  const modal = $('#char-modal');
  modal.style.setProperty('--fc', f.color);
  $('.modal-panel', modal).style.setProperty('--fc', f.color);
  const vis = $('#cm-visual');
  const cut = cutViews(c.id);
  const views = cut || c.views;
  vis.classList.toggle('cut', !!cut); vis.classList.toggle('lowres', !!CUTM[c.id]?.lowres);
  const single = views && views.length < 4;
  if (single) {
    vis.innerHTML = `<img src="${views[0]}" alt="${c.name}" class="on" draggable="false"/>`;
  } else if (views) {
    vis.innerHTML = views.map((v, i) => `<img src="${v}" alt="${c.name} — ${['front', 'left', 'right', 'back'][i]} view" class="${i === 0 ? 'on' : ''}" draggable="false"/>`).join('') +
      `<div class="view-dots">${views.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div><div class="turn-hint">⟲ Drag to turn</div>`;
  } else {
    const px = proxyArt(c.id);
    vis.classList.add('cut');
    vis.innerHTML = px ? `<div class="cm-sil${px.light ? ' light' : ''}" style="--glow:${px.color || f.color}"><img src="${px.src}" alt="" draggable="false"/></div><div class="turn-hint">Portrait in preparation</div>`
      : `<div class="emblem-lg">${emblemSVG(f.color, 24)}<span class="em-letter">${c.dev.replace('श्री', '').trim().charAt(0)}</span></div>`;
  }
  vis.insertAdjacentHTML('beforeend', `<div class="cm-tabs">${single ? '<button class="on" data-tab="photo">Portrait</button>' : views ? '<button class="on" data-tab="turn">Turnaround</button>' : '<button class="on" data-tab="turn">Portrait</button>'}<button data-tab="action">In Action ▶</button></div><div class="cm-action" hidden></div>`);
  const apps = appearancesOf(id);
  $('#cm-body').innerHTML = `
    <div class="cm-dev">${c.dev}</div>
    <h3 class="cm-name" id="cm-name">${c.name}</h3>
    <div class="cm-title">${c.title}</div>
    <div class="cm-meta">
      ${c.lineage ? `<div><b>Lineage</b>${c.lineage}</div>` : ''}
      ${c.weapon ? `<div><b>Arms &amp; Powers</b>${c.weapon}</div>` : ''}
      <div><b>Belongs to</b>${f.label}</div>
    </div>
    ${c.bio.map(p => `<p>${fmt(p)}</p>`).join('')}
    ${c.moments?.length ? `<h4>Defining Moments</h4><ul class="cm-moments">${c.moments.map(m => `<li>${m}</li>`).join('')}</ul>` : ''}
    ${apps.length ? `<h4>Appears in the Kathā</h4><div class="cm-appear">${apps.map(a => `<button data-go="${a.book.id}:${a.i}"><small>${a.book.num ? a.book.name.replace(' Kāṇḍa', '') : 'Prologue'}</small>${a.ep.title}</button>`).join('')}</div>` : ''}`;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  gsap.fromTo('.modal-panel', { opacity: 0, y: 40, scale: .96, rotateX: 8, transformPerspective: 1200 }, { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: .6, ease: 'power3.out' });
  $('.modal-panel').scrollTop = 0;
  turntableCleanup?.();
  turntableCleanup = single ? null : views ? turntable(vis, views.length) : null;
  vis.querySelector('.cm-tabs').addEventListener('click', e => {
    const t = e.target.closest('[data-tab]'); if (!t) return;
    vis.querySelectorAll('.cm-tabs button').forEach(b => b.classList.toggle('on', b === t));
    const act = vis.querySelector('.cm-action'); act.hidden = t.dataset.tab !== 'action';
    if (single) vis.querySelector(':scope > img').hidden = t.dataset.tab === 'action';
    if (t.dataset.tab === 'action') playSignature(c, act);
  });
}

// 3D turntable for illustrated figures: stacked slices give the figure volume as it turns.
function spinTurntable(el) {
  const card = el.querySelector('.tt-card'); if (!card) return () => {};
  const st = { ry: 0 }; let dragging = false, lastX = 0;
  const tw = gsap.to(st, { ry: 360, duration: 9, ease: 'none', repeat: -1, onUpdate: () => { card.style.transform = `rotateY(${st.ry}deg)`; } });
  const down = e => { dragging = true; tw.pause(); lastX = e.clientX; el.setPointerCapture?.(e.pointerId); };
  const move = e => { if (!dragging) return; st.ry += (e.clientX - lastX) * .6; lastX = e.clientX; card.style.transform = `rotateY(${st.ry}deg)`; };
  const up = () => { if (!dragging) return; dragging = false; tw.invalidate(); gsap.to(st, { ry: st.ry % 360, duration: 0, onComplete: () => { tw.vars.ry = st.ry + 360; tw.invalidate().restart(); } }); };
  el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  return () => { tw.kill(); el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); };
}

// A short signature scene for any character, played on a small stage.
let actionStage = null;
async function playSignature(c, host) {
  const { Stage3D } = await import('./stage3d/stage.js');
  if (!actionStage || !host.contains(actionStage.root)) { host.innerHTML = '<div class="cm-stage"></div>'; actionStage = new Stage3D(host.querySelector('.cm-stage'), { sound }); }
  const s = specFor(c.id), id = c.id;
  const bg = { divine: 'heaven', raghu: 'ayodhya/dusk', mithila: 'mithila', rishi: 'ashram/dawn', vanara: 'rocks', rakshasa: 'lanka/night' }[c.faction] || 'forest';
  let cast = `${id}@40`, acts = '';
  if (s.kind === 'bird') { cast = `${id}@20^30:fly`; acts = `0.5 ${id} fly>70^20; 3 ${id} fly>40^30`; }
  else if (s.kind === 'deer') acts = `0.5 ${id} run>70; 3 ${id} run>30`;
  else if (s.weapon === 'bow') { cast += ' #rock@85*0.6'; acts = `0.5 ${id} shoot>85; 2.6 ${id} astra>85 "${s.aura || '#ffd870'}"`; }
  else if (['mace', 'sword', 'spear', 'axe', 'trident'].includes(s.weapon)) { cast += ' #rock@62*0.7'; acts = `0.5 ${id} walk>52; 1.8 ${id} strike>62; 3.5 ${id} roar`; }
  else if (s.head === 'sage' || c.faction === 'divine') acts = `0.5 ${id} bless; 2.5 fx petals; 3 ${id} glow`;
  else if (s.kind === 'vanara' || s.kind === 'bear') acts = `0.5 ${id} roar; 1.8 ${id} leap>65^20; 3.5 ${id} leap>40`;
  else acts = `0.5 ${id} pray; 2 fx petals`;
  if (id === 'hanuman') { cast = 'hanuman@30 #mountain@62^14*0.6'; acts = '0.5 hanuman grow; 2 hanuman leap>55^30; 3.6 hanuman lift; 5 fx petals'; }
  if (id === 'ravana') { cast = 'ravana@50'; acts = '0.5 ravana roar; 2 fx embers; 2.5 ravana strike>70; 4 fx shake'; }
  actionStage.play({ script: `${bg} | ${cast} | ${s.aura ? 'rays' : ''} | ${acts}`, kanda: FACTIONS[c.faction].label, title: c.name });
}

// Order the 4 views as a rotation: front → right → back → left
function turntable(el, n) {
  const imgs = $$('img', el), dots = $$('.view-dots i', el);
  const order = [0, 2, 3, 1];
  let pos = 0, acc = 0, dragging = false, lastX = 0, auto = true, timer;
  const show = () => {
    const idx = order[((pos % 4) + 4) % 4];
    imgs.forEach((im, i) => im.classList.toggle('on', i === idx));
    dots.forEach((d, i) => d.classList.toggle('on', i === idx));
  };
  const step = () => { if (auto && !dragging) { pos++; show(); } };
  timer = setInterval(step, 1800);
  const down = e => { dragging = true; auto = false; lastX = e.clientX; acc = 0; el.setPointerCapture?.(e.pointerId); };
  const move = e => {
    if (!dragging) return;
    acc += e.clientX - lastX; lastX = e.clientX;
    const th = Math.max(50, el.clientWidth / 6);
    while (acc > th) { pos--; acc -= th; show(); }
    while (acc < -th) { pos++; acc += th; show(); }
  };
  const up = () => { dragging = false; };
  el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  return () => { clearInterval(timer); el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); };
}

function closeModal() {
  turntableCleanup?.(); turntableCleanup = null;
  $('#char-modal').hidden = true;
  document.body.style.overflow = '';
}
$('#char-modal').addEventListener('click', e => {
  if (e.target.closest('[data-close]')) return closeModal();
  const go = e.target.closest('[data-go]');
  if (go) {
    const [book, i] = go.dataset.go.split(':');
    closeModal();
    renderBook(book, false, +i);
  }
});
addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#char-modal').hidden) closeModal(); if (!$('#duel').hidden) closeDuel(); if (!$('#fight').hidden) fightGame?.exit(); } });

/* ───────────────────────── WAR (lazy) ───────────────────────── */
// धर्म युद्ध — the fighting game
let fightGame = null;
async function openFight() {
  const el = $('#fight'); el.hidden = false; document.body.style.overflow = 'hidden';
  await sound.start();
  const [{ DharmaYuddha }, art] = await Promise.all([import('./stage3d/fight.js'), fetch('assets/characters/cut/manifest.json').then(r => r.json()).catch(() => ({}))]);
  const close = () => { el.hidden = true; document.body.style.overflow = ''; };
  if (!fightGame) fightGame = window.__dy = new DharmaYuddha(el, { sound, art, onExit: close });
  else fightGame.open();
}
function initWarSection() {
  cutReady.then(renderDuels);
}
// the Divine Astras: the painted battlefield of the reference film, each astra loosed as light (js/astras.js)
let astrasApi = null;
function openAstras() {
  openOv('#astras-ov');
  if (!astrasApi) astrasApi = import('./astras.js').then(m => m.initAstras($('#astras'), { sound }));
  else astrasApi.then(x => x?.start?.());
}

/* ───────────────────────── DUELS ───────────────────────── */
function faceHTML(id) {
  const c = CHAR[id]; const f = FACTIONS[c.faction];
  const cut = cutViews(id);
  const px = !cut && !c.views ? proxyArt(id) : null;
  return cut ? `<img class="dc-cut" src="${cut[0]}" alt="">` : c.views ? `<img src="${c.views[0]}" alt="">` : px ? `<img class="dc-cut dc-sil" src="${px.src}" alt="">` : `<span style="color:${f.color}">${c.dev.charAt(0)}</span>`;
}
function renderDuels() {
  $('#duel-grid').innerHTML = DUELS.map(d => `
    <button class="duel-card ${d.final ? 'final' : ''}" data-duel="${d.id}">
      <div class="dc-side"><div class="dc-face">${faceHTML(d.left)}</div><div class="dc-name">${CHAR[d.left].name}</div></div>
      <div class="dc-vs">VS</div>
      <div class="dc-side"><div class="dc-face">${faceHTML(d.right)}</div><div class="dc-name">${CHAR[d.right].name}${d.rightAlt ? ' & ' + CHAR[d.rightAlt].name : ''}</div></div>
      <div class="dc-meta">${d.kanda} · ${d.place}</div>
      <div class="dc-more">
        <p>${d.outcome || ''}</p>
        <div class="dc-foot"><span class="dc-rounds">${d.rounds.length} Rounds</span><span class="dc-go">Witness the duel ▶</span></div>
      </div>
    </button>`).join('');
  $('#duel-grid').addEventListener('click', e => { const b = e.target.closest('[data-duel]'); if (b) openDuel(b.dataset.duel); });
}

function fighterHTML(id, alt) {
  const c = CHAR[id], f = FACTIONS[c.faction];
  if (c.views) return `<img src="${c.views[0]}" alt="${c.name}">`;
  const cut = cutViews(id), px = proxyArt(id), src = cut?.[0] || px?.src;
  return src ? `<img src="${src}" alt="${c.name}"${!cut ? ' class="dc-sil"' : ''}>` : '';
}

let duelState = null, sparks = null, duelStage = null;
function openDuel(id) {
  const d = DUELS.find(x => x.id === id);
  const el = $('#duel');
  el.style.setProperty('--arena', d.arena);
  $('#f-left').innerHTML = fighterHTML(d.left);
  $('#f-right').innerHTML = fighterHTML(d.right, d.rightAlt);
  $('#hp-name-l').textContent = CHAR[d.left].name;
  $('#hp-name-r').textContent = CHAR[d.right].name + (d.rightAlt ? ' & ' + CHAR[d.rightAlt].name : '');
  $('#duel-meta').innerHTML = `${d.kanda}<br>${d.place}`;
  setHP(100, 100, true);
  $('#duel-round').innerHTML = '';
  $('#duel-text').innerHTML = `<span class="victory">${d.kanda}</span>${CHAR[d.left].title}<br><i>versus</i><br>${CHAR[d.right].title}`;
  $('#duel-next .btn-en').textContent = 'Begin ▶';
  el.hidden = false;
  document.body.style.overflow = 'hidden';
  duelState = { d, round: -1 };
  sparks = sparks || sparkCanvas($('#duel-sparks'));
  sparks.start();
  // the fight itself is staged on the painted field (js/duels.js): its place, the armies at war, every round acted out
  el.classList.add('duel2d');
  $('#duel-next').disabled = true;
  (duelStage = duelStage || Promise.all([import('./duels.js'), cutReady]).then(([m]) => new m.DuelTheatre(el, { sound, art: CUTM })))
    .then(th => th.open(d)).then(() => { $('#duel-next').disabled = false; }).catch(e => { console.error(e); $('#duel-next').disabled = false; });

  const tl = gsap.timeline();
  tl.fromTo('#f-left', { xPercent: -110, opacity: 0 }, { xPercent: 0, opacity: 1, duration: .9, ease: 'power4.out' })
    .fromTo('#f-right', { xPercent: 110, opacity: 0 }, { xPercent: 0, opacity: 1, duration: .9, ease: 'power4.out' }, '<')
    .fromTo('#vs', { scale: 4, opacity: 0, rotate: -12 }, { scale: 1, opacity: 1, rotate: 0, duration: .5, ease: 'back.out(2)', onComplete: () => { shake(); sparks.burst(innerWidth / 2, innerHeight * .42, 120, '#ffb347'); sound.boom(); } }, '-=.2')
    .fromTo('.duel-top', { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: .6 }, '-=.2')
    .fromTo('#duel-text, .duel-controls', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .6 }, '-=.3');
}

function setHP(l, r, instant) {
  ['l', 'r'].forEach((s, i) => {
    const v = [l, r][i] + '%';
    const bar = $('#hp-' + s), ghost = $(`#hp-${s}-ghost`);
    if (instant) { bar.style.transition = ghost.style.transition = 'none'; }
    bar.style.width = v; ghost.style.width = v;
    if (instant) requestAnimationFrame(() => { bar.style.transition = ghost.style.transition = ''; });
  });
}
function shake() { const el = $('#duel'); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

$('#duel-next').addEventListener('click', () => {
  if (!duelState) return;
  const { d } = duelState;
  duelState.round++;
  const r = d.rounds[duelState.round];
  if (r) {
    gsap.to('#vs', { opacity: 0, scale: .6, duration: .3 });
    $('#duel-round').innerHTML = `<small>Round ${duelState.round + 1}</small><strong>${r.title}</strong>`;
    gsap.fromTo('#duel-round', { scale: 2.2, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: 'back.out(1.6)' });
    $('#duel-text').innerHTML = r.text;
    gsap.fromTo('#duel-text', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .5, delay: .15 });
    const prev = d.rounds[duelState.round - 1]?.hp || [100, 100];
    setHP(r.hp[0], r.hp[1]);
    const hitL = r.hp[0] < prev[0], hitR = r.hp[1] < prev[1];
    const lastRound = duelState.round === d.rounds.length - 1;
    // the round is acted out on the field; the bars fall as it plays
    setHP(prev[0], prev[1]);
    const btn = $('#duel-next'); btn.disabled = true;
    duelStage.then(th => th.round(duelState.round)).finally(() => { setHP(r.hp[0], r.hp[1]); btn.disabled = false; });
    setTimeout(() => setHP(r.hp[0], r.hp[1]), 1600);
    $('#duel-next .btn-en').textContent = duelState.round === d.rounds.length - 1 ? 'Outcome ▶' : 'Next Round ▶';
  } else if (duelState.round === d.rounds.length) {
    const last = d.rounds[d.rounds.length - 1].hp;
    const fallen = last[1] === 0 ? 'right' : 'left';
    const fallenName = fallen === 'right' ? $('#hp-name-r').textContent : $('#hp-name-l').textContent;
    const loser = fallen === 'right' ? d.right : d.left;
    duelStage.then(th => th.outcome(fallen === 'right' && d.rightAlt ? [loser, d.rightAlt] : [loser], fallen === 'right'));
    $('#duel-round').innerHTML = `<small>${d.final ? '<span class="dvs">धर्म विजय</span> · Dharma Triumphs' : 'The Outcome'}</small><strong>${fallenName} ${fallenName.includes('&') ? 'fall' : 'falls'}</strong>`;
    gsap.fromTo('#duel-round', { scale: 2, opacity: 0 }, { scale: 1, opacity: 1, duration: .6, ease: 'back.out(1.4)' });
    $('#duel-text').innerHTML = `<span class="outcome">${d.outcome}</span>`;
    sparks.burst(innerWidth / 2, innerHeight * .3, d.final ? 260 : 120, '#fff1c1', true);
    sound.sfx(d.final ? 'conch' : 'swell', d.final ? .9 : .5);
    $('#duel-next .btn-en').textContent = 'Close ✕';
  } else {
    closeDuel();
  }
});
$('#duel-close').addEventListener('click', closeDuel);
function closeDuel() {
  $('#duel').hidden = true; document.body.style.overflow = ''; sparks?.stop(); duelState = null; duelStage?.then(th => th.close());
  gsap.set('#f-left, #f-right', { clearProps: 'all' });
}

function sparkCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  let parts = [], raf = null, w, h;
  const resize = () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; };
  resize(); addEventListener('resize', resize);
  const loop = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    // ambient embers
    if (Math.random() < .5) parts.push({ x: Math.random() * w, y: h + 10, vx: (Math.random() - .5) * .6, vy: -Math.random() * 1.6 - .4, life: 1, decay: .004, c: '#ff8a3a', s: Math.random() * 2 + 1, g: 0 });
    parts = parts.filter(p => p.life > 0);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= p.decay;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.strokeStyle = p.c; ctx.lineWidth = p.s;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3); ctx.stroke();
    }
    raf = requestAnimationFrame(loop);
  };
  return {
    start() { if (!raf) loop(); },
    stop() { cancelAnimationFrame(raf); raf = null; parts = []; ctx.clearRect(0, 0, w, h); },
    burst(x, y, n, c, rain) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, sp = Math.random() * (rain ? 6 : 12) + 2;
        parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (rain ? 3 : 0), life: 1, decay: Math.random() * .02 + .012, c, s: Math.random() * 2.4 + .8, g: .18 });
      }
    }
  };
}

/* ───────────────────────── THE TEMPLE: boot ───────────────────────── */
import { initTheme, goTo } from './theme.js';
import { runIntro } from './intro.js';
import { sleepOffscreen } from './calm.js';

const params = new URLSearchParams(location.search);
let odyssey = null, odysseyP = null, pantheon = null;
const themeMan = fetch('assets/theme/manifest.json').then(r => r.ok ? r.json() : {}).catch(() => ({}));
function loadOdyssey() {
  if (!odysseyP) odysseyP = cutReady.then(() => import('./odyssey.js')).then(m => m.initOdyssey({
    sound, cut: CUTM,
    onChar: id => { goTo('#pantheon'); pantheon?.show(id); },
    onPlace: (place, journey) => { goTo('#journey'); journeyApi?.then(j => { if (journey) j.play(journey); j.place(place); }); }
  })).then(api => { odyssey = api; window.ScrollTrigger.refresh(); return api; }).catch(e => { console.error(e); });
  return odysseyP;
}
// open the book at an episode (from a Kāṇḍa card, a character, a place): the book comes into view first
async function renderBook(book, _s, ep = 0, play = false) {
  goTo('#odyssey', { offset: -10 });
  const api = await loadOdyssey();
  if (play) api?.playBook(book); else api?.goTo(book, ep);
}
window.__openBook = (b, ep = 0, play = false) => renderBook(b, false, ep, play);

const theme = initTheme({ sound, openKanda: id => renderBook(id, false, 0, true) });
sleepOffscreen([...document.querySelectorAll('section, footer')]);   // CSS motion in a section out of view pauses
updateSoundBtn();
initWarSection();
import('./fullscreen.js').then(m => m.initFullscreen());
$('[data-begin]').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); renderBook('prologue', false, 0, true); });

// each scene is built as it comes near — or earlier, in the quiet moments after the page opens (below), so that
// nothing is ever built while the reader is scrolling
const later = [];
const near = (sel, fn, margin = '900px') => {
  const el = $(sel); let done = false;
  const run = () => { if (done) return; done = true; io.disconnect(); fn(); };
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) run(); }, { rootMargin: `${margin} 0px` }); io.observe(el);
  later.push(run);
};
{
  const idle = f => (window.requestIdleCallback || (cb => setTimeout(cb, 120)))(f, { timeout: 3000 });
  // the large backdrops are decoded ahead too, off the main path
  const decode = src => { const i = new Image(); i.decoding = 'async'; i.src = src; return i.decode().catch(() => { }); };
  const next = () => { const run = later.shift(); if (!run) return; run(); setTimeout(() => idle(next), 450); };
  setTimeout(() => idle(async () => {
    for (const s of ['assets/theme/night.webp', 'assets/theme/sky.webp', 'assets/theme/hall.webp', 'assets/theme/india-wide.webp', 'assets/theme/yuddha.webp']) await decode(s);
    next();
  }), 2600);
}
near('#verse', () => import('./glimpse.js').then(m => m.initGlimpse({ sound })));
near('#odyssey', loadOdyssey, '1400px');
near('#pantheon', () => cutReady.then(() => import('./pantheon.js')).then(m => { pantheon = m.initPantheon({ cut: CUTM, openBook: (b, i) => renderBook(b, false, i), openChar }); }));
let journeyApi = null;
const loadJourney = () => (journeyApi = journeyApi || import('./journey.js').then(m => m.initJourney({ openBook: (b, i) => renderBook(b, false, i) })));
near('#journey', loadJourney);
// the Rāmāyaṇa today: each place can be shown on the Journey map above it
near('#learn', () => import('./learn.js').then(m => m.initLearn({ openBook: (b, i) => renderBook(b, false, i), openChar })));
near('#today', () => import('./today.js').then(m => m.initToday({ showPlace: id => { goTo('#journey'); loadJourney().then(j => setTimeout(() => j.place(id), 900)); } })));
near('#yuddha', () => themeMan.then(t => import('./yuddha.js').then(m => m.initYuddha({ src: t.yuddha || 'assets/scenes/ill/yuddha-15-1-1.webp' }))));
setTimeout(() => (window.requestIdleCallback || setTimeout)(() => loadOdyssey()), 6000);

// the overlays of the war: the duels, the astras, the game
function openOv(id) { const o = $(id); o.hidden = false; document.body.style.overflow = 'hidden'; window.__lenis?.stop(); window.gsap.fromTo(o, { opacity: 0 }, { opacity: 1, duration: .5 }); }
function closeOv(o) { o.hidden = true; document.body.style.overflow = ''; window.__lenis?.start(); }
document.addEventListener('click', e => {
  const c = e.target.closest('[data-ov-close]'); if (c) { const o = c.closest('.ov'); if (o.id === 'astras-ov') astrasApi?.then(x => x?.stop()); closeOv(o); return; }
  const b = e.target.closest('[data-open]'); if (!b) return;
  if (b.dataset.open === 'duels') openOv('#duels-ov');
  if (b.dataset.open === 'codex') { window.__codex?.(); openOv('#codex-ov'); }
  if (b.dataset.open === 'fight') openFight();
  if (b.dataset.open === 'astras') openAstras();
});
addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.ov:not([hidden])').forEach(o => o.querySelector('[data-ov-close]').click()); });

// ?skip passes the intro; &go=<section>, &book=<kāṇḍa>&ep=<n>, &char=<id>, &duel=<id>, &fight=<id> open things directly
const skip = params.has('skip');
runIntro({ sound, embers: theme.embers, skip });
if (skip) {
  if (params.get('go')) setTimeout(() => goTo('#' + params.get('go'), { immediate: true }), 400);
  if (params.get('book')) setTimeout(() => renderBook(params.get('book'), false, +(params.get('ep') || 0)), 500);
  if (params.get('char')) setTimeout(() => openChar(params.get('char')), 700);
  if (params.get('fight')) setTimeout(async () => { await openFight(); setTimeout(() => fightGame?.startLadder(params.get('fight')), 2500); }, 800);
  if (params.get('duel')) setTimeout(() => { openDuel(params.get('duel')); }, 700);
}

// The site as an app: installable, and what has been read stays readable offline (sw.js). Not on a development server.
if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => { }));
