// The Living Book: a page-turning Rāmāyaṇa beside an animated stage.
// Pages are paginated at runtime from story data; every paragraph is a "beat"
// with its own scene. Turning a page, clicking a paragraph, or Read-Along mode
// plays the matching scene on the stage, directed shot by shot to the narration.
// The book can be read in English or seven Indian-language editions (js/i18n.js).
import { PROLOGUE, KANDAS } from './data/story.js';
import { PLACES } from './data/places.js';
import { BEATS, SARGAS, sargaUrl } from './data/scenes.js';
import { SARGA_INDEX } from './data/sargas.js';
import { Stage } from './scene.js';
import { Stage3D } from './stage3d/stage.js';
import { COVER, coverSrc } from './data/covers.js';
import { LANGS, lang, langInfo, setLang, ui, tr, trSpeech, kandaName, shloka, isIndic, initialLang, inScript, numeral } from './i18n.js';

const BOOKS = [PROLOGUE, ...KANDAS];
const PLACE = Object.fromEntries(PLACES.map(p => [p.id, p.name]));
const fmtEn = t => t.replace(/[ऀ-ॿ][ऀ-ॿ\s।॥,]*[ऀ-ॿ।॥]/g, m => `<span class="dv">${m}</span>`);
const PW = 460, PH = 640;

export async function initBook({ root, stageEl, controls, sound, langBar }) {
  await setLang(initialLang());
  await document.fonts.ready;
  // The cinematic 3D stage; the illustrated 2D stage is the fallback where WebGL is unavailable.
  let stage;
  try { const c = document.createElement('canvas'); if (!(c.getContext('webgl2') || c.getContext('webgl'))) throw 0; stage = new Stage3D(stageEl, { sound, filmOnly: true, covers: Object.fromEntries(Object.keys(COVER).map(k => [k, coverSrc(k)])) }); }
  catch { stage = new Stage(stageEl, { sound }); }
  sound?.setLang?.(langInfo().audio || lang());

  let beats = new Map(), pages = [], bookStart = {}, pf = null, host = null;
  let currentBeat = null, reading = false, readTimer = null, awaitingFlip = false, pendingBeat = null;

  /* ── build the whole book in the reader's language ── */
  function build() {
    const fmt = isIndic() ? (t => t) : fmtEn;
    beats = new Map();
    BOOKS.forEach(b => b.episodes.forEach((ep, i) => ep.text.forEach((t, k) => {
      const key = `${b.id}-${i}`;
      beats.set(`${b.id}:${i}:${k}`, {
        id: `${b.id}:${i}:${k}`, book: b.id, ep: i, k, en: t, text: tr(`p.${b.id}.${i}.${k}`, t),
        title: tr(`e.${b.id}.${i}.title`, ep.title), kanda: kandaName(b.id, b.name), place: PLACE[ep.place] || '', script: BEATS[key]?.[k] || 'forest'
      });
    })));

    host = document.createElement('div'); host.className = 'fb-host'; root.appendChild(host);
    const measure = document.createElement('div');
    measure.className = 'book-measure flip-book';
    measure.innerHTML = `<div class="page" style="width:${PW}px;height:${PH}px"><div class="pg"><div class="pg-head"></div><div class="pg-body"></div><div class="pg-foot"></div></div></div>`;
    document.body.appendChild(measure);
    const mBody = measure.querySelector('.pg-body');
    const fits = () => mBody.scrollHeight <= mBody.clientHeight + 1;

    pages = []; bookStart = {};
    let cur = null;
    const newPage = (head = '', meta = {}) => { cur = { parts: [], head, ...meta }; pages.push(cur); mBody.innerHTML = ''; };
    const add = (html) => { mBody.insertAdjacentHTML('beforeend', html); if (fits()) { cur.parts.push(html); return true; } mBody.lastElementChild.remove(); return false; };
    const special = (html, cls, meta = {}) => { pages.push({ special: html, cls, ...meta }); cur = null; };
    const sargaLabel = sg => `${sg[0] === sg[1] ? `${ui('sarga')} ${sg[0]}` : `${ui('sargas')} ${sg[0]}–${sg[1]}`}`;

    special(`<div class="cover-art"><div class="cv-ring"></div><div class="cv-om">ॐ</div><div class="cv-dev">श्रीमद्वाल्मीकीय<br>रामायणम्</div><div class="cv-rule"></div><div class="cv-en">${ui('cover')}</div><div class="cv-foot">Ramayana 3D · A Living Book</div></div>`, 'page-cover');
    special(`<div class="pg"><div class="pg-body center"><div class="inv-small">श्रीगणेशाय नमः ।<br>श्रीसीतारामचन्द्राभ्यां नमः ।</div><div class="orn">❁</div><p class="sl">श्री राम राम रामेति रमे रामे मनोरमे ।<br>सहस्रनाम तत्तुल्यं रामनाम वरानने ॥</p><p class="tr">${shloka()}</p><div class="orn">❁</div><p class="hint">${ui('hint')}</p></div></div>`, 'page-front');
    special('', 'page-toc', { toc: true });

    for (const b of BOOKS) {
      const kName = kandaName(b.id, b.name);
      bookStart[b.id] = pages.length;
      special(`<div class="pg kanda-page" style="--acc:${b.accent}"><div class="kp-num">${b.num ? numeral(b.num) : 'ॐ'}</div><div class="kp-dev">${inScript(b.dev)}</div><div class="kp-en">${kName}</div><div class="kp-sub">${tr(`k.${b.id}.subtitle`, b.subtitle)}</div><div class="kp-rule"></div><p class="kp-sum">${tr(`k.${b.id}.summary`, b.summary)}</p></div>`, 'page-kanda', { book: b.id });
      newPage(kName, { book: b.id });
      b.episodes.forEach((ep, i) => {
        const sg = SARGAS[`${b.id}-${i}`];
        const link = sg && sargaUrl(b.id, sg[0]);
        const title = tr(`e.${b.id}.${i}.title`, ep.title);
        const head = `<div class="ep-h" data-ep="${b.id}:${i}"><div class="eh-dev">${inScript(ep.dev || '')}</div><h3>${title}</h3>${sg ? `<a class="eh-sarga" href="${link}" target="_blank" rel="noopener">${sargaLabel(sg)} · ${ui('original')}</a>` : b.id === 'uttara' ? `<span class="eh-sarga">${kName}</span>` : ''}</div>`;
        const text0 = beats.get(`${b.id}:${i}:0`).text;
        // keep the heading with the start of its first paragraph
        mBody.insertAdjacentHTML('beforeend', head + `<p class="beat">${text0.split(' ').slice(0, 18).join(' ')}</p>`);
        const ok = fits(); mBody.lastElementChild.remove(); mBody.lastElementChild.remove();
        if (!ok) newPage(kName, { book: b.id });
        add(head);
        ep.text.forEach((_, k) => {
          const id = `${b.id}:${i}:${k}`, t = beats.get(id).text;
          const cls = `beat${k === 0 ? ' first' : ''}`;
          if (add(`<p class="${cls}" data-beat="${id}">${fmt(t)}</p>`)) return;
          // split by words across pages
          let words = t.split(' '), cont = false;
          while (words.length) {
            let lo = 0, hi = words.length;
            while (lo < hi) { const mid = Math.ceil((lo + hi) / 2); mBody.insertAdjacentHTML('beforeend', `<p class="${cls}${cont ? ' cont' : ''}">${fmt(words.slice(0, mid).join(' '))}</p>`); const f = fits(); mBody.lastElementChild.remove(); if (f) lo = mid; else hi = mid - 1; }
            if (lo === 0) { newPage(kName, { book: b.id }); continue; }
            add(`<p class="${cls}${cont ? ' cont' : ''}${lo < words.length ? ' split' : ''}" data-beat="${id}">${fmt(words.slice(0, lo).join(' '))}</p>`);
            words = words.slice(lo); cont = true;
            if (words.length) newPage(kName, { book: b.id });
          }
        });
        const note = ep.note && `<div class="pg-note"><b>${ui('telling')}</b>${tr(`e.${b.id}.${i}.note`, ep.note)}</div>`;
        if (note && !add(note)) { newPage(kName, { book: b.id }); add(note); }
        add('<div class="ep-end">❁</div>');
      });
      // Sarga Sūcī: one line for every sarga of this Kāṇḍa, linked to the original and to its retelling here.
      const idx = SARGA_INDEX[b.id];
      if (idx) {
        newPage(`${kName} · ${ui('suci')}`, { book: b.id });
        add(`<div class="sg-h"><div class="eh-dev">सर्ग सूची</div><h3>${ui('every', { k: kName })}</h3><p>${ui('count', { n: idx.length })}</p></div>`);
        idx.forEach((line, n) => {
          const sn = n + 1, ep = b.episodes.findIndex((_, i) => { const r = SARGAS[`${b.id}-${i}`]; return r && sn >= r[0] && sn <= r[1]; });
          const html = `<div class="sg-line"${ep >= 0 ? ` data-ep-go="${b.id}:${ep}"` : ''}><b>${sn}</b><span>${tr(`s.${b.id}.${n}`, line)}</span><a href="${sargaUrl(b.id, sn)}" target="_blank" rel="noopener" aria-label="${ui('sarga')} ${sn}">↗</a></div>`;
          if (!add(html)) { newPage(`${kName} · ${ui('suci')}`, { book: b.id }); add(html); }
        });
      }
    }
    special(`<div class="pg"><div class="pg-body center"><div class="orn">❁</div><p class="sl">इति श्रीमद्रामायणे वाल्मीकीये आदिकाव्ये<br>सम्पूर्णम् ॥</p><p class="tr">${ui('end1')}</p><div class="orn">❁</div><p class="sl small">यावत् स्थास्यन्ति गिरयः सरितश्च महीतले ।<br>तावद्रामायणकथा लोकेषु प्रचरिष्यति ॥</p><p class="tr">${ui('end2')}</p><p class="jsr">जय श्री राम</p></div></div>`, 'page-end');
    special(`<div class="pg"><div class="pg-body"><h3 class="ref-h">Sources</h3>${ui('note') ? `<p class="tr-note">${ui('note')}</p>` : ''}<p>The narrative of this book retells the <i>Śrīmad Vālmīki Rāmāyaṇa</i>. Sarga references follow the numbering of <a href="https://www.valmikiramayan.net/" target="_blank" rel="noopener">valmikiramayan.net</a>, whose verse-by-verse translations are by <b>Desiraju Hanumanta Rao</b> (Bāla, Araṇya, Kiṣkindhā) and <b>K. M. K. Murthy</b> (Ayodhyā, Sundara, Yuddha). Read the original verses and their translations there.</p><p>The retelling and dialogue in this book are written afresh. Quotations in Devanagari are from Vālmīki's verses. The Uttara Kāṇḍa is not yet covered on valmikiramayan.net and is retold here from the traditional text.</p></div></div>`, 'page-refs');
    if (pages.length % 2 === 1) special('<div class="pg"><div class="pg-body center"><div class="orn big">ॐ</div></div></div>', 'page-blank');
    special(`<div class="cover-art back"><div class="cv-om">ॐ</div><div class="cv-dev">जय श्री राम</div></div>`, 'page-cover');
    measure.remove();

    const tocHtml = `<div class="pg"><div class="pg-body"><h3 class="toc-h">${ui('contents')}</h3>${BOOKS.map(b => `<button class="toc-row" data-goto="${bookStart[b.id]}" style="--acc:${b.accent}"><span class="tr-n">${b.num ? numeral(b.num) : 'ॐ'}</span><span class="tr-t">${kandaName(b.id, b.name)}<small>${tr(`k.${b.id}.subtitle`, b.subtitle)}</small></span><span class="tr-p">${bookStart[b.id] + 1}</span></button>`).join('')}</div></div>`;
    host.innerHTML = pages.map((p, n) => {
      const hard = p.cls === 'page-cover' ? ' data-density="hard"' : '';
      if (p.toc) return `<div class="page page-toc"${hard}>${tocHtml}</div>`;
      if (p.special != null) return `<div class="page ${p.cls}"${hard}>${p.special}<div class="pg-num">${p.cls === 'page-cover' ? '' : n + 1}</div></div>`;
      return `<div class="page"><div class="pg"><div class="pg-head">${p.head}</div><div class="pg-body">${p.parts.join('')}</div><div class="pg-foot">${n + 1}</div></div></div>`;
    }).join('');

    pf = new window.St.PageFlip(host, {
      width: PW, height: PH, size: 'stretch', minWidth: 260, maxWidth: 1200, minHeight: 360, maxHeight: 1670,
      showCover: true, usePortrait: true, mobileScrollSupport: false, maxShadowOpacity: .55, flippingTime: 950,
      drawShadow: true, autoSize: true, disableFlipByClick: true, clickEventForward: true, showPageCorners: true
    });
    pf.loadFromHTML(host.querySelectorAll('.page'));
    setK(); pf.on('changeOrientation', setK);
    pf.on('flip', onFlip);
    pf.on('changeState', e => { if (e.data === 'flipping' || e.data === 'user_fold') { const i = pf.getCurrentPageIndex(); if (i === 0) panel?.classList.remove('at-cover'); } });
    pf.on('changeOrientation', () => place());
    setTimeout(place, 0);
    controls.kanda.innerHTML = BOOKS.map(b => `<option value="${b.id}">${b.num ? b.num + '. ' : ''}${kandaName(b.id, b.name)}</option>`).join('');
    controls.play.querySelector('span').textContent = reading ? ui('pause') : ui('read');
  }
  // Pages are laid out at 460×640; scale their content to the rendered page size.
  const setK = () => { const r = pf?.getBoundsRect?.(); const w = r?.pageWidth || host?.querySelector('.page')?.offsetWidth; if (w) root.style.setProperty('--k', (w / PW).toFixed(4)); };
  // PageFlip lays itself out after the resize: measure again once it has
  new ResizeObserver(() => { setK(); [80, 300, 800].forEach(ms => setTimeout(setK, ms)); }).observe(root);
  const pageEls = () => [...host.querySelectorAll('.page')];

  /* ── state ── */
  const visiblePages = () => {
    const i = pf.getCurrentPageIndex();
    if (pf.getOrientation() === 'portrait') return [i];
    if (i === 0) return [0];
    return i % 2 === 1 ? [i, i + 1] : [i - 1, i];
  };
  const beatsOnSpread = () => {
    const els = pageEls(); const ids = [];
    visiblePages().forEach(i => els[i]?.querySelectorAll('[data-beat]').forEach(p => { if (!ids.includes(p.dataset.beat)) ids.push(p.dataset.beat); }));
    return ids;
  };
  const spreadInfo = () => { const v = visiblePages(); return pages[v[v.length - 1]] || pages[v[0]]; };

  function highlight(id) {
    host.querySelectorAll('.beat.on').forEach(p => p.classList.remove('on'));
    host.querySelectorAll(`[data-beat="${id}"]`).forEach(p => p.classList.add('on'));
  }

  function playBeat(id) {
    const b = beats.get(id); if (!b) return;
    currentBeat = id; highlight(id);
    stage.play(b);
    const sg = SARGAS[`${b.book}-${b.ep}`];
    controls.sarga.innerHTML = sg ? `<a href="${sargaUrl(b.book, sg[0])}" target="_blank" rel="noopener">${b.kanda} · ${sg[0] === sg[1] ? `${ui('sarga')} ${sg[0]}` : `${ui('sargas')} ${sg[0]}–${sg[1]}`} ↗</a>` : `<span>${b.kanda}</span>`;
    controls.kanda.value = b.book;
  }
  // Narrate a paragraph and let the stage direct it sentence by sentence (shots, subtitles), like a film.
  function narrateBeat(id, onEnd) {
    const b = beats.get(id);
    const speech = lang() === 'hi-Latn' ? trSpeech(`p.${b.book}.${b.ep}.${b.k}`, b.text) : undefined;
    const handle = sound?.narrate(id, b.text, onEnd, { lang: lang(), speech });
    stage.direct?.(b, handle || null);
    return handle;
  }

  function stopReading() { reading = false; clearTimeout(readTimer); sound?.stopSpeaking(); controls.play.classList.remove('on'); controls.play.querySelector('span').textContent = ui('read'); }
  function nextInReading() {
    if (!reading) return;
    const list = beatsOnSpread();
    const next = list[list.indexOf(currentBeat) + 1];
    if (next) return readBeat(next);
    if (pf.getCurrentPageIndex() >= pf.getPageCount() - 2) return stopReading();
    awaitingFlip = true; pf.flipNext();
  }
  function readBeat(id) {
    playBeat(id);
    const b = beats.get(id);
    clearTimeout(readTimer);
    const spoke = narrateBeat(id, () => { if (reading) readTimer = setTimeout(nextInReading, 900); });
    if (!spoke) readTimer = setTimeout(nextInReading, Math.max(8000, b.text.split(/\s+/).length * 330));
  }

  // go to any paragraph: turn to its page if it is not open, then show it (and read it aloud when reading)
  function goBeat(id, read) {
    const idx = pageEls().findIndex(el => el.querySelector(`[data-beat="${id}"]`));
    if (idx < 0) return;
    const show = () => { if (read) readBeat(id); else { playBeat(id); if (sound?.narrateOn && reading) narrateBeat(id); else stage.direct?.(beats.get(id), null); } };
    if (visiblePages().includes(idx)) return show();
    pendingBeat = show; pf.flip(idx);
  }
  function step(d) {
    const ids = [...beats.keys()], i = ids.indexOf(currentBeat);
    const to = i < 0 ? ids[0] : ids[Math.max(0, Math.min(ids.length - 1, i + d))];
    const r = reading; if (r) { clearTimeout(readTimer); sound?.stopSpeaking(); }
    goBeat(to, r);
  }

  // the closed book (front or back cover alone) is centred on its side
  const panel = root.closest('.panel');
  function place() {
    if (!panel || !pf) return;
    const i = pf.getCurrentPageIndex(), n = pf.getPageCount(), land = pf.getOrientation() !== 'portrait';
    panel.classList.toggle('at-cover', land && i === 0); panel.classList.toggle('at-back', land && i >= n - 1);
  }
  function onFlip() {
    place();
    sound?.sfx('page');
    if (pendingBeat) { const f = pendingBeat; pendingBeat = null; awaitingFlip = false; return f(); }
    const list = beatsOnSpread();
    const fresh = list.find(id => id !== currentBeat) || list[0];
    if (awaitingFlip) { awaitingFlip = false; const first = list.find(id => id !== currentBeat); if (first) readBeat(first); else nextInReading(); return; }
    if (list.length && fresh && !list.includes(currentBeat)) playBeat(fresh);
    else if (!list.length) { const p = spreadInfo(); if (p?.book) { const b = BOOKS.find(x => x.id === p.book); stage.play({ script: kandaScene[p.book] || 'heaven', cover: coverSrc(p.book), kanda: kandaName(b.id, b.name), title: tr(`k.${b.id}.subtitle`, b.subtitle) }); controls.kanda.value = p.book; } else stage.play({ script: 'cosmic | | stars petals', cover: coverSrc('idle'), kanda: 'Śrīmad Vālmīki Rāmāyaṇa', title: 'जय श्री राम' }); }
  }

  const kandaScene = {
    prologue: 'ashram/dawn | valmiki@40:sit | rays', bala: 'ayodhya/dawn | | birds petals', ayodhya: 'ayodhya/dusk | | birds',
    aranya: 'dandaka/dusk | | mist fireflies', kishkindha: 'rocks/day | | birds', sundara: 'ocean/dusk | hanuman@50^40:fly | ', yuddha: 'battle | | embers dust', uttara: 'sarayu | | mist rays'
  };

  root.addEventListener('click', e => {
    const go = e.target.closest('[data-goto]'); if (go) { e.preventDefault(); pf.flip(+go.dataset.goto); return; }
    const sg = e.target.closest('[data-ep-go]'); if (sg && !e.target.closest('a')) { const [bk, ep] = sg.dataset.epGo.split(':'); api.goToEpisode(bk, +ep); return; }
    const p = e.target.closest('[data-beat]');
    if (p) { stopReading(); playBeat(p.dataset.beat); if (sound?.narrateOn) narrateBeat(p.dataset.beat); else stage.direct?.(beats.get(p.dataset.beat), null); }
  });

  /* ── controls ── */
  controls.back?.addEventListener('click', () => step(-1));
  controls.fwd?.addEventListener('click', () => step(1));
  controls.prev.addEventListener('click', () => { stopReading(); pf.flipPrev(); });
  controls.next.addEventListener('click', () => { stopReading(); pf.flipNext(); });
  controls.play.addEventListener('click', async () => {
    if (reading) return stopReading();
    await sound?.start();
    if (sound?.narrateOn) await sound.ready?.();
    reading = true; controls.play.classList.add('on'); controls.play.querySelector('span').textContent = ui('pause');
    const list = beatsOnSpread();
    if (!list.length) { awaitingFlip = true; pf.flipNext(); return; }
    readBeat(list.includes(currentBeat) ? currentBeat : list[0]);
  });
  controls.kanda.addEventListener('change', () => { stopReading(); pf.flip(bookStart[controls.kanda.value]); });
  addEventListener('keydown', e => {
    if (!root.closest('section').matches(':hover') && document.activeElement?.closest('#katha') == null) return;
    if (e.key === 'ArrowRight') { stopReading(); pf.flipNext(); } if (e.key === 'ArrowLeft') { stopReading(); pf.flipPrev(); }
  });

  /* ── language bar: switch the whole book in place and stay on the same passage ── */
  function renderLangBar() {
    if (!langBar) return;
    langBar.innerHTML = `<span class="lb-label">${ui('lang')}</span>` + LANGS.map(l => `<button class="lb-pill${l.id === lang() ? ' on' : ''}" data-lang="${l.id}" lang="${l.bcp.split('-')[0]}">${l.name}</button>`).join('');
  }
  langBar?.addEventListener('click', async e => {
    const btn = e.target.closest('[data-lang]'); if (!btn || btn.dataset.lang === lang()) return;
    const keep = currentBeat;
    stopReading();
    langBar.classList.add('busy');
    await setLang(btn.dataset.lang);
    sound?.setLang?.(langInfo().audio || lang());
    const loading = document.getElementById('book-loading'); if (loading) { loading.textContent = ui('loading'); loading.style.display = ''; }
    await new Promise(r => setTimeout(r, 30));
    try { pf?.destroy(); } catch { host?.remove(); }
    build(); renderLangBar();
    if (loading) loading.style.display = 'none';
    langBar.classList.remove('busy');
    const u = new URL(location.href); u.searchParams.set('lang', lang()); history.replaceState(null, '', u);
    if (keep) { const [bk, ep] = keep.split(':'); api.goToEpisode(bk, +ep, keep); }
  });

  build(); renderLangBar();
  window.__katha = { stage, sound };   // handy for debugging in the console
  // initial scene
  stage.play({ script: 'cosmic | vishnu@50:glow | stars petals', cover: coverSrc('idle'), kanda: 'Śrīmad Vālmīki Rāmāyaṇa', title: ui('open') });

  const api = {
    stage, get pf() { return pf; },
    goToEpisode(book, ep, beatId) {
      const els = pageEls();
      const idx = els.findIndex(el => el.querySelector(`[data-ep="${book}:${ep}"]`));
      if (idx >= 0) { stopReading(); pf.flip(idx); setTimeout(() => playBeat(beatId || `${book}:${ep}:0`), 1100); }
    },
    goToBook(book) { pf.flip(bookStart[book] ?? 0); },
    fit() { try { pf?.update(); } catch { } setK(); },
    // open a Kāṇḍa in the theatre and begin reading it aloud
    async playBook(book) {
      await sound?.start(); if (sound?.narrateOn) await sound.ready?.();
      reading = true; controls.play.classList.add('on'); controls.play.querySelector('span').textContent = ui('pause');
      goBeat(`${book}:0:0`, true);
    }
  };
  window.__katha.book = api;
  return api;
}
