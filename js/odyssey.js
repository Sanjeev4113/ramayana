// The Odyssey: the Rāmāyaṇa as an open book. The left page holds the painting of the sentence being read (it moves on
// with the narration), the right page the passage in the reader's language with that sentence lit; the leaf turns to
// the next passage. Beside the book: the journey on the map, the figures of the episode and its lore.
import { PROLOGUE, KANDAS } from './data/story.js';
import { PLACES, JOURNEYS } from './data/places.js';
import { SARGAS, sargaUrl } from './data/scenes.js';
import { CHARACTERS, FACTIONS } from './data/characters.js';
import { COVER, coverSrc } from './data/covers.js';
import { Stage3D } from './stage3d/stage.js';
import { sentences } from './stage3d/director.js';
import { hold } from './calm.js';
import { LANGS, lang, langInfo, setLang, ui, tr, trSpeech, kandaName, initialLang, inScript, epOrnament, isIndic } from './i18n.js';

const gsap = window.gsap;
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const BOOKS = [PROLOGUE, ...KANDAS];
const PLACE = Object.fromEntries(PLACES.map(p => [p.id, p]));
const CHAR = Object.fromEntries(CHARACTERS.map(c => [c.id, c]));
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
// the mini map: assets/theme/india-map-small.webp covers longitude 60–100° E, latitude 37–3° N
const mapXY = (lat, lon, W = 640, H = 544) => [(lon - 60) / 40 * W, (37 - lat) / 34 * H];

export async function initOdyssey({ sound, cut = {}, onChar, onPlace }) {
  await setLang(initialLang());
  const stageEl = $('#stage'), text = $('#pg-text'), spread = $('#spread');
  const stage = new Stage3D(stageEl, { sound, filmOnly: true, covers: Object.fromEntries(Object.keys(COVER).map(k => [k, coverSrc(k)])) });
  const media = await fetch('assets/scenes/manifest.json').then(r => r.json()).catch(() => ({}));
  const firstStill = id => { const l = media[id.replace(/:/g, '-')]; const c = Array.isArray(l) && [...l].sort((a, b) => (a.at ?? 0) - (b.at ?? 0))[0]; return c ? `assets/scenes/${c.src}${c.v ? `?v=${c.v}` : ''}` : `assets/scenes/${coverSrc('idle')}`; };

  /* ── every paragraph of the kathā, in order ── */
  let beats = [];
  function build() {
    beats = [];
    BOOKS.forEach(b => b.episodes.forEach((ep, i) => ep.text.forEach((t, k) => beats.push({
      id: `${b.id}:${i}:${k}`, book: b.id, ep: i, k, n: ep.text.length, en: t, text: tr(`p.${b.id}.${i}.${k}`, t),
      title: tr(`e.${b.id}.${i}.title`, ep.title), dev: ep.dev || '', kanda: kandaName(b.id, b.name), place: PLACE[ep.place]?.name || '', placeId: ep.place,
      chars: (ep.chars || []).filter(c => CHAR[c]), num: b.num, accent: b.accent
    }))));
  }
  build();
  const index = id => beats.findIndex(b => b.id === id);
  let cur = 0, reading = false, readTimer = 0, busy = null;

  /* ── the right page ── */
  function pageHTML(b, i) {
    const sg = SARGAS[`${b.book}-${b.ep}`];
    const sarga = sg ? `${sg[0] === sg[1] ? `${ui('sarga')} ${sg[0]}` : `${ui('sargas')} ${sg[0]}–${sg[1]}`}` : '';
    const parts = sentences(b.text);
    const body = parts.map((s, j) => `<span class="s" data-i="${j}">${esc(s)}</span>`).join(' ');
    const last = b.k === b.n - 1;
    return `<div class="pt-kanda">${esc(b.kanda)}</div>
      <div class="pt-sub">${sg ? `<a href="${sargaUrl(b.book, sg[0])}" target="_blank" rel="noopener">${sarga} · ${ui('original')}</a>` : 'Chronicle'}</div>
      ${b.k === 0 ? `<div class="pt-dev">${epOrnament(b.dev)}</div><div class="pt-rule"></div><div class="pt-title">${esc(b.title)}</div>` : `<div class="pt-rule"></div><div class="pt-title">${esc(b.title)}</div>`}
      <div class="pt-body"><p class="${b.k === 0 ? 'first' : ''}">${body}</p>${last ? '<div class="pt-end" style="text-align:center;color:#8c5c1e">❁</div>' : ''}</div>
      <div class="pt-foot"><span>${b.place ? esc(b.place) : ''}</span><span>${i + 1} / ${beats.length}</span></div>`;
  }
  // the passage is set as large as its page allows
  function fit(el) {
    const body = $('.pt-body', el); if (!body) return;
    const w = el.clientWidth || 300; let fs = Math.max(12, Math.min(24, w * .052));
    body.style.setProperty('--fs', fs + 'px');
    for (let k = 0; k < 24 && body.scrollHeight > body.clientHeight + 1; k++) { fs *= .94; body.style.setProperty('--fs', fs + 'px'); }
  }
  function setText(i) { text.innerHTML = pageHTML(beats[i], i); fit(text); }
  stage.onRead = (beat, j) => {
    if (!beat || beat.id !== beats[cur]?.id) return;
    $$('.pt-body .s', text).forEach(s => s.classList.toggle('on', +s.dataset.i === j));
  };

  /* ── the side panel ── */
  const faceImg = id => cut[id]?.views?.front?.src || CHAR[id]?.views?.[0] || '';
  function side(b) {
    // the journey: the Kāṇḍa's road on the map, and where this passage stands
    const svg = $('#sd-journey svg'), p = PLACE[b.placeId];
    const j = JOURNEYS.find(x => x.kanda === b.num && x.path.includes(b.placeId)) || JOURNEYS.find(x => x.kanda === b.num);
    const pts = j ? j.path.map(id => PLACE[id]).filter(Boolean).map(q => mapXY(q.lat, q.lon)) : [];
    const ay = PLACE.ayodhya, la = PLACE.lanka;
    const shortPlace = name => {
      if (!name) return '—';
      const base = name.split(' (')[0].trim();
      return /['’]s Hermitage$/i.test(base) ? base.replace(/['’]s Hermitage$/i, ' Āśrama') : base;
    };
    const word = q => q.name.split(' (')[0].split(' ')[0].replace(/['’]s$/i, '').toUpperCase();
    // side: 1 names the place to the right of its pin, -1 to the left; 0 leaves only the pin
    const lab = (q, cls = '', side = 1) => { const [x, y] = mapXY(q.lat, q.lon); return `<circle class="pin ${cls}" cx="${x}" cy="${y}" r="5"/>` +
      (side ? `<text x="${x + 9 * side}" y="${y + 5}"${side < 0 ? ' text-anchor="end"' : ''}>${esc(word(q))}</text>` : ''); };
    // the passage's place and Ayodhyā or Laṅkā close beside it never print their names over each other: the two names
    // part to either side, and where the pins all but touch (Nandigrāma by Ayodhyā) the passage's place names the spot
    const now = p && p !== ay && p !== la ? p : null;
    let nowSide = 1;
    const fixed = q => {
      if (!now) return lab(q);
      const [x, y] = mapXY(q.lat, q.lon), [nx, ny] = mapXY(now.lat, now.lon), w = s => word(s).length * 11;
      const clash = Math.abs(ny - y) < 18 && !(nx + 9 + w(now) < x || x + 9 + w(q) < nx);
      if (!clash) return lab(q);
      if (Math.abs(nx - x) < 5 && Math.abs(ny - y) < 6) return lab(q, '', 0);
      if (nx >= x) return lab(q, '', -1);
      nowSide = -1; return lab(q);
    };
    const marks = fixed(ay) + fixed(la);
    svg.innerHTML = (pts.length > 1 ? `<path class="jp" d="M${pts.map(q => q.map(v => v.toFixed(1)).join(' ')).join(' L')}"/>` : '') +
      marks + (now ? lab(now, 'now', nowSide) : '');
    // where the passage stands pulses as a ring over the map: an HTML ring that only scales and fades, so the browser
    // moves it without laying out or repainting anything (an SVG <animate> here re-laid the page out every frame)
    const map = svg.parentElement; let pu = $('.sd-pulse', map);
    if (p) { const [x, y] = mapXY(p.lat, p.lon); if (!pu) { pu = document.createElement('i'); pu.className = 'sd-pulse'; map.appendChild(pu); } pu.hidden = false;
      // the map is cropped to the card's shape (the svg slices like the picture's cover), so the ring is placed through
      // the svg's own transform, wherever the place falls inside the card
      const m = svg.getScreenCTM(), r = map.getBoundingClientRect(), q = m && r.width ? new DOMPoint(x, y).matrixTransform(m) : null;
      pu.style.left = `${q ? (q.x - r.left) / r.width * 100 : x / 6.4}%`; pu.style.top = `${q ? (q.y - r.top) / r.height * 100 : y / 5.44}%`; }
    else if (pu) pu.hidden = true;
    const path = $('.jp', svg); if (path) { const L = path.getTotalLength(); path.style.strokeDasharray = L; gsap.fromTo(path, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }); }
    $('#sd-journey').onclick = () => onPlace?.(b.placeId, j?.id);
    // the figures of the episode
    const ids = b.chars.length ? b.chars : ['rama'];
    const order = ids.length >= 3 ? [ids[1], ids[0], ids[2]] : ids.length === 2 ? [ids[1], ids[0]] : [ids[0]];
    $('#sd-faces').innerHTML = order.map(id => `<button class="face ${id === ids[0] ? 'big' : ''}" data-char="${id}"><span class="ring"><img src="${faceImg(id)}" alt="" loading="lazy"></span>${id === ids[0] ? '' : `<b>${esc(CHAR[id].name)}</b>`}</button>`).join('');
    const c = CHAR[ids[0]];
    $('#sd-who').innerHTML = `<b>${esc(c.name)}</b><small>${esc(c.title.split(/\s[—–]\s/)[0])}</small>`;
    // the lore of the passage
    const book = BOOKS.find(x => x.id === b.book), sg = SARGAS[`${b.book}-${b.ep}`];
    $('#sd-lore').innerHTML = `<h4>Lore Summary</h4>
      <div class="stats"><div><b>${esc(book.name.replace(' Kāṇḍa', ''))}</b><small>Kāṇḍa</small></div><div><b>${sg ? (sg[0] === sg[1] ? sg[0] : `${sg[0]}–${sg[1]}`) : '—'}</b><small>Sarga</small></div><div><b>${esc(shortPlace(b.place))}</b><small>Place</small></div></div>
      <h5>${esc(b.title)}</h5><p>${esc(tr(`k.${book.id}.summary`, book.summary))}</p>
      ${sg ? `<p style="margin-top:8px"><a href="${sargaUrl(b.book, sg[0])}" target="_blank" rel="noopener">Read the original sarga ↗</a></p>` : ''}`;
    setKanda(b.book); window.__compass?.(b.book);
    document.body.dataset.kanda = b.book;                     // the reading room takes on this Kāṇḍa's light (theme.css)
  }
  $('#sd-faces').addEventListener('click', e => { const f = e.target.closest('[data-char]'); if (f) onChar?.(f.dataset.char); });

  /* ── showing a passage, and turning the leaf to it ── */
  function show(i, { narrate = false } = {}) {
    cur = Math.max(0, Math.min(beats.length - 1, i));
    const b = beats[cur];
    stage.play(b);
    side(b);
    if (narrate) return speak(cur);
    stage.direct?.(b, null);               // the paintings follow the sentences at a reading pace
  }
  function face(html, cls) { const d = document.createElement('div'); d.className = `lf ${cls}`; d.innerHTML = html; return d; }
  // A leaf of the book, lifted from the right page (forward) or the left (back). Its progress p runs 0 → 1; it can be
  // driven by a tween (a click on the arrows, the narration) or by the reader's hand (dragging the page).
  function leafTo(to) {
    const dir = to > cur ? 1 : -1;
    const leaf = document.createElement('div'); leaf.className = 'bk-leaf';
    const rightPage = i => `<div class="bk-page right"><div class="pg-text">${pageHTML(beats[i], i)}</div></div>`;
    const leftPage = src => `<div class="bk-page left"><div class="pg-art"><img src="${src}" alt=""></div></div>`;
    const curSrc = stage.cutEl?.querySelector('img')?.src || firstStill(beats[cur].id);
    // the two faces of the leaf, laid out once at full size (the text fitted to the page), then cut into strips
    const full = { front: face(dir > 0 ? rightPage(cur) : rightPage(to), 'front'), back: face(leftPage(dir > 0 ? firstStill(beats[to].id) : curSrc), 'back') };
    const proof = document.createElement('div'); proof.className = 'bk-leaf bk-proof'; proof.append(full.front, full.back); spread.appendChild(proof);
    $$('.pg-text', proof).forEach(fit);
    // A real leaf is paper, not a board: it is a chain of narrow strips hinged to one another, each turning a little
    // further than the one before, so the page curves as it is lifted and settles flat as it lands.
    const N = 12, strips = [];
    let host = leaf;
    for (let k = 0; k < N; k++) {
      const s = document.createElement('div'); s.className = 'cs' + (k ? '' : ' root'); if (!k) s.style.width = `${100 / N}%`;
      for (const side of ['front', 'back']) {
        const pane = document.createElement('div'); pane.className = `sf ${side}`;
        const c = full[side].cloneNode(true); c.className = 'sc';
        c.style.left = `${-(side === 'front' ? k : N - 1 - k) * 100}%`; c.style.width = `${N * 100}%`;
        const sh = document.createElement('i'); sh.className = 'sh';
        pane.append(c, sh); s.appendChild(pane);
      }
      host.appendChild(s); strips.push({ el: s, sh: $$('.sh', s) }); host = s;
    }
    proof.remove();
    spread.appendChild(leaf);
    const cast = document.createElement('div'); cast.className = 'bk-cast ' + (dir > 0 ? 'r' : 'l'); spread.appendChild(cast);
    // beneath: the next passage's text (forward), or the earlier passage's painting (back)
    let under = null;
    if (dir > 0) setText(to);
    else { under = document.createElement('img'); under.className = 'bk-under'; under.src = firstStill(beats[to].id); $('.bk-page.left .pg-art', spread).appendChild(under); }
    const L = { dir, to, p: 0 };
    const wsum = Array.from({ length: N }, (_, k) => k ** 1.35).reduce((a, b) => a + b, 0);
    L.put = () => {
      const r = dir > 0 ? -180 * L.p : -180 * (1 - L.p), lift = Math.sin(Math.PI * L.p), sg = dir > 0 ? -1 : 1;
      leaf.style.transform = `perspective(2600px) rotateY(${r}deg)`;
      // the outer edge leads while the leaf is in the air (it was lifted by the edge), up to 78° beyond the spine
      let abs = r;
      strips.forEach((s, k) => {
        const th = k ? sg * 78 * lift * (k ** 1.35) / wsum : 0; abs += th;
        if (k) s.el.style.transform = `rotateY(${th}deg)`;
        // light from the reader: a strip facing away darkens, one tilted toward the lamp catches a sheen
        const a = abs * Math.PI / 180, dark = (1 - Math.abs(Math.cos(a))) * .62, shine = Math.max(0, Math.cos(a + .55)) ** 14 * .4 * lift;
        s.sh.forEach(e => { e.style.opacity = dark.toFixed(3); e.parentNode.style.setProperty('--g', shine.toFixed(3)); });
      });
      cast.style.opacity = lift * .9; cast.style.setProperty('--w', `${lift * 60}%`);
      // as the leaf comes down onto the left page, the same painting is laid beneath it, so the hairlines between its
      // strips show the painting itself, never the one it covers
      if (dir > 0 && L.p > .94 && !L.flat) {
        L.flat = document.createElement('img'); L.flat.className = 'bk-under'; L.flat.src = firstStill(beats[to].id);
        $('.bk-page.left .pg-art', spread).appendChild(L.flat);
      }
    };
    L.finish = (done, opts = {}) => {
      cast.remove();
      if (!done) {                                   // the reader let go: the leaf falls back
        if (dir > 0) setText(cur);
        under?.remove(); L.flat?.remove(); leaf.remove(); return;
      }
      if (!L.rustled) sound?.sfx?.('page');
      // The landed leaf shows the next painting on the left page. A flat copy of that painting takes its place at once
      // (so the strips' hairline seams never show, and nothing 3D is faded: that would flatten the leaf and show its
      // back mirrored); the copy dissolves once the stage has brought the same painting in beneath it.
      const settle = img => gsap.to(img, { opacity: 0, duration: .7, delay: 1.4, ease: 'sine.inOut', onComplete: () => img.remove() });
      if (dir > 0) {
        const flat = L.flat || document.createElement('img');
        if (!L.flat) { flat.className = 'bk-under'; flat.src = firstStill(beats[to].id); $('.bk-page.left .pg-art', spread).appendChild(flat); }
        leaf.remove(); show(to, opts); settle(flat);
      }
      else { setText(to); show(to, opts); leaf.remove(); if (under) settle(under); }
    };
    L.put();
    return L;
  }
  function turn(to, opts = {}) {
    to = Math.max(0, Math.min(beats.length - 1, to));
    if (to === cur && !opts.force) return show(cur, opts);
    if (busy) busy.progress(1);
    const targetBeat = beats[to];
    if (targetBeat) {
      setKanda(targetBeat.book);
      window.__compass?.(targetBeat.book);
      if (targetBeat.book !== beats[cur]?.book) side(targetBeat);
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setText(to); show(to, opts); sound?.sfx?.('page'); return; }
    if (stacked()) return pageTurn(to, opts);
    const L = leafTo(to);
    // the leaf is built first and lifted only on the frame after, so building it never eats into the turn; then it is
    // lifted by its edge, carried slowly over the spine and laid down, as a reader turns a precious book
    const tw = gsap.to(L, { p: 1, duration: 1.8, ease: 'power1.inOut', paused: true, onUpdate: L.put, onComplete: () => { if (busy === tw) busy = null; L.finish(true, opts); } });
    busy = tw; L.rustled = true; sound?.sfx?.('page');
    requestAnimationFrame(() => requestAnimationFrame(() => { if (!tw.progress()) tw.play(); }));
  }
  // On a phone the book is one page (the painting above, the text below): the page of text turns over by its left
  // edge like a leaf of a bound book — forward, the old page lifts away and reveals the next beneath it; back, the
  // earlier page comes down over it — while the painting above dissolves into the next.
  const stacked = () => getComputedStyle(spread).display === 'grid';
  function pageTurn(to, opts = {}) {
    const page = $('.bk-page.right', spread), dir = to > cur ? 1 : -1;
    const leaf = document.createElement('div'); leaf.className = 'bk-page right ph-leaf';
    leaf.style.cssText = `position:absolute;left:${page.offsetLeft}px;top:${page.offsetTop}px;width:${page.offsetWidth}px;height:${page.offsetHeight}px;margin:0`;
    leaf.innerHTML = `<div class="pg-text">${pageHTML(beats[dir > 0 ? cur : to], dir > 0 ? cur : to)}</div><i class="ph-shade"></i>`;
    spread.appendChild(leaf); fit($('.pg-text', leaf));
    const shade = $('.ph-shade', leaf);
    sound?.sfx?.('page');
    const done = () => { if (busy === tw) busy = null; leaf.remove(); };
    let tw;
    if (dir > 0) {                                         // the old page lifts away; the next lies beneath
      setText(to); show(to, opts);
      tw = gsap.timeline({ onComplete: done })
        .fromTo(leaf, { rotateY: 0, x: 0 }, { rotateY: -96, x: -6, duration: 1.15, ease: 'power2.inOut', transformPerspective: 2600, transformOrigin: '0% 50%' }, 0)
        .fromTo(shade, { opacity: 0 }, { opacity: .85, duration: 1.15, ease: 'power1.in' }, 0);
    } else {                                               // the earlier page comes down over this one
      show(to, opts);
      tw = gsap.timeline({ onComplete: () => { setText(to); done(); } })
        .fromTo(leaf, { rotateY: -96, x: -6 }, { rotateY: 0, x: 0, duration: 1.15, ease: 'power2.inOut', transformPerspective: 2600, transformOrigin: '0% 50%' }, 0)
        .fromTo(shade, { opacity: .85 }, { opacity: 0, duration: 1.15, ease: 'power1.out' }, 0);
    }
    busy = tw;
  }
  // turning a page by hand: take the outer half of either page and draw it across the spine (on a phone: a swipe)
  let drag = null, swipe = null;
  spread.addEventListener('pointerdown', e => {
    if (e.target.closest('a, .fs-btn, select, button')) return;
    if (stacked()) { swipe = { x: e.clientX, y: e.clientY, t: performance.now() }; return; }
    if (e.button !== 0 || busy) return;
    const r = spread.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
    const dir = x > .5 ? 1 : -1;
    if (Math.abs(x - .5) < .14) return;                                       // near the spine: not a page edge
    if ((dir > 0 && cur >= beats.length - 1) || (dir < 0 && cur <= 0)) return;
    drag = { x0: e.clientX, w: r.width / 2, dir, L: null, t0: performance.now(), id: e.pointerId };
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = (e.clientX - drag.x0) * -drag.dir;
    if (!drag.L) { if (dx < 8) return; if (reading) { clearTimeout(readTimer); sound?.stopSpeaking(); } drag.L = leafTo(cur + drag.dir); spread.classList.add('dragging'); }
    drag.L.p = Math.max(0, Math.min(1, dx / (drag.w * 1.6))); drag.L.put();
  }, { passive: true });
  const letGo = e => {
    if (swipe) {                                           // a phone: a clear sideways swipe turns the page
      const s = swipe; swipe = null;
      const dx = (e.clientX ?? s.x) - s.x, dy = (e.clientY ?? s.y) - s.y;
      if (e.type === 'pointerup' && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3 && performance.now() - s.t < 900) {
        const to = cur + (dx < 0 ? 1 : -1);
        if (to >= 0 && to < beats.length) { if (reading) { clearTimeout(readTimer); sound?.stopSpeaking(); } turn(to, { narrate: reading }); }
      }
      return;
    }
    if (!drag) return; const d = drag; drag = null; spread.classList.toggle('dragging', false);
    if (!d.L) { // a tap on the outer edge turns the page
      return;
    }
    const fast = (performance.now() - d.t0) < 280 && d.L.p > .08, done = d.L.p > .4 || fast;
    busy = gsap.to(d.L, { p: done ? 1 : 0, duration: done ? 1.1 * (1 - d.L.p) + .35 : .7 * d.L.p + .2, ease: 'power1.out', onUpdate: d.L.put, onComplete: () => { busy = null; d.L.finish(done, { narrate: reading }); } });
  };
  addEventListener('pointerup', letGo); addEventListener('pointercancel', letGo);

  /* ── motes of light drifting over the painting ── */
  import('./intro.js').then(({ Sparks }) => {
    const cv = $('#stage-panel .motes'); if (!cv) return;
    const m = new Sparks(cv, { rise: 3 });
    m.emit.push((dt, t, S) => { if (Math.random() < dt * 5) S.add(Math.random() * cv.clientWidth, cv.clientHeight * (.3 + Math.random() * .7), (Math.random() - .5) * 8, -6 - Math.random() * 10, 5 + Math.random() * 5, .5 + Math.random() * 1.3, .999); });
  });

  /* ── reading aloud ── */
  function speak(i) {
    const b = beats[i];
    const speech = lang() === 'hi-Latn' ? trSpeech(`p.${b.book}.${b.ep}.${b.k}`, b.text) : undefined;
    const h = sound?.narrate(b.id, b.text, () => { if (reading) readTimer = setTimeout(() => step(1, true), 900); }, { lang: lang(), speech });
    stage.direct?.(b, h || null);
    if (!h && reading) readTimer = setTimeout(() => step(1, true), Math.max(8000, b.text.split(/\s+/).length * 330));
  }
  const play = $('#bk-play');
  function setPlay(on) { reading = on; hold('reading', on); play.classList.toggle('on', on); $('span', play).textContent = on ? ui('pause') : ui('read'); }
  function stop() { setPlay(false); clearTimeout(readTimer); sound?.stopSpeaking(); }
  async function start(i = cur) {
    await sound?.start(); if (sound?.narrateOn) await sound.ready?.();
    setPlay(true); clearTimeout(readTimer);
    if (i === cur) show(cur, { narrate: true }); else turn(i, { narrate: true });
  }
  function step(d, keepReading = false) {
    if (!keepReading && reading) { clearTimeout(readTimer); sound?.stopSpeaking(); }
    if (cur + d < 0 || cur + d >= beats.length) return stop();
    turn(cur + d, { narrate: reading });
  }
  const epStart = (book, ep) => index(`${book}:${ep}:0`);
  function jumpEpisode(d) {
    const b = beats[cur]; let i = cur;
    if (d < 0) { i = epStart(b.book, b.ep); if (i === cur) { i--; while (i > 0 && beats[i].k !== 0) i--; } }
    else { i++; while (i < beats.length && beats[i].k !== 0) i++; }
    if (i >= 0 && i < beats.length) { if (reading) { clearTimeout(readTimer); sound?.stopSpeaking(); } turn(i, { narrate: reading }); }
  }
  play.addEventListener('click', () => reading ? stop() : start());
  $('#bk-prev').addEventListener('click', () => step(-1));
  $('#bk-next').addEventListener('click', () => step(1));
  $('#bk-back').addEventListener('click', () => jumpEpisode(-1));
  $('#bk-fwd').addEventListener('click', () => jumpEpisode(1));
  const sel = $('#bk-kanda');
  const CHEV = `<svg class="lp-chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  let curBook = BOOKS[0].id;
  const kandaLabel = id => { const b = BOOKS.find(x => x.id === id) || BOOKS[0]; return `${b.num ? b.num + '. ' : ''}${kandaName(b.id, b.name)}`; };
  const renderKandas = () => {
    sel.innerHTML = `<button type="button" class="lp-cur" aria-haspopup="listbox" aria-expanded="${sel.classList.contains('open')}"><span>${esc(kandaLabel(curBook))}</span>${CHEV}</button>
      <div class="lp-list" role="listbox">${BOOKS.map(b => `<button type="button" class="lb-pill${b.id === curBook ? ' on' : ''}" data-kanda="${b.id}">${esc(kandaLabel(b.id))}</button>`).join('')}</div>`;
  };
  function setKanda(id) {
    if (!id) return;
    curBook = id;
    const lbl = $('.lp-cur span', sel);
    if (lbl) lbl.textContent = kandaLabel(id);
    $$('[data-kanda]', sel).forEach(b => b.classList.toggle('on', b.dataset.kanda === id));
  }
  renderKandas();
  sel.addEventListener('click', e => {
    if (e.target.closest('.lp-cur')) { e.stopPropagation(); bar.classList.remove('open'); const open = sel.classList.toggle('open'); $('.lp-cur', sel)?.setAttribute('aria-expanded', String(open)); return; }
    const b = e.target.closest('[data-kanda]');
    if (b) { sel.classList.remove('open'); $('.lp-cur', sel)?.setAttribute('aria-expanded', 'false'); if (reading) { clearTimeout(readTimer); sound?.stopSpeaking(); } turn(epStart(b.dataset.kanda, 0), { narrate: reading }); }
  });
  document.addEventListener('click', e => { if (!e.target.closest('#bk-kanda')) { sel.classList.remove('open'); $('.lp-cur', sel)?.setAttribute('aria-expanded', 'false'); } });
  text.addEventListener('click', e => { const s = e.target.closest('.s'); if (s && !reading && !busy) start(cur); });
  addEventListener('keydown', e => {
    if (!/Arrow(Left|Right)/.test(e.key) || e.target.closest('input, select, textarea')) return;
    const r = $('#odyssey').getBoundingClientRect(); if (r.top > innerHeight * .5 || r.bottom < innerHeight * .5) if (!$('.is-max')) return;
    step(e.key === 'ArrowRight' ? 1 : -1);
  });
  new ResizeObserver(() => fit(text)).observe(text);

  /* ── the language of the book ── */
  const bar = $('#lang-bar');
  const pills = () => { bar.innerHTML = `<button type="button" class="lp-cur" aria-haspopup="true"><span>${LANGS.find(l => l.id === lang())?.name || 'English'}</span>${CHEV}</button><div class="lp-list">${LANGS.map(l => `<button type="button" class="lb-pill${l.id === lang() ? ' on' : ''}" data-lang="${l.id}" lang="${l.bcp.split('-')[0]}">${l.name}</button>`).join('')}</div>`; };
  bar.addEventListener('click', e => { if (e.target.closest('.lp-cur')) { e.stopPropagation(); sel.classList.remove('open'); bar.classList.toggle('open'); } });
  document.addEventListener('click', e => { if (!e.target.closest('#lang-bar')) bar.classList.toggle('open', false); });
  bar.addEventListener('click', async e => {
    const b = e.target.closest('[data-lang]'); if (!b) return; bar.classList.toggle('open', false); if (b.dataset.lang === lang()) return;
    const id = beats[cur].id, was = reading; stop();
    bar.classList.add('busy'); await setLang(b.dataset.lang); sound?.setLang?.(langInfo().audio || lang()); bar.classList.remove('busy');
    build(); pills(); cur = index(id);
    curBook = beats[cur].book;
    renderKandas();
    setText(cur); side(beats[cur]);
    const u = new URL(location.href); u.searchParams.set('lang', lang()); history.replaceState(null, '', u);
    if (was) start(cur); else show(cur);
  });
  pills();
  sound?.setLang?.(langInfo().audio || lang());

  /* ── the first page ── */
  setText(0); side(beats[0]); stage.play(beats[0]);
  const api = {
    stage,
    goTo(book, ep = 0, play = false) { const i = epStart(book, ep); if (i < 0) return; if (play) return start(i); if (reading) stop(); turn(i); },
    playBook(book) { return start(epStart(book, 0)); },
    fit() { fit(text); stage.resize?.(); }
  };
  window.__katha = { stage, sound, book: api };
  return api;
}
