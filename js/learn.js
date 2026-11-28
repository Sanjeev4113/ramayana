// Learn the Rāmāyaṇa: the family trees, the teachings, a quiz for each Kāṇḍa, the words of the epic and the years of
// the exile, each linked to its page in the book and to the figures' cards in the Pantheon (data: js/data/learn.js).
import { FAMILIES, TEACHINGS, QUIZ, GLOSSARY, TIMELINE } from './data/learn.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const KANDA = { bala: 'Bāla', ayodhya: 'Ayodhyā', aranya: 'Araṇya', kishkindha: 'Kiṣkindhā', sundara: 'Sundara', yuddha: 'Yuddha', uttara: 'Uttara' };
const LS = 'ramayana3d.quiz';
const best = () => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } };
const saveBest = (k, n) => { try { const b = best(); if (!(b[k] >= n)) { b[k] = n; localStorage.setItem(LS, JSON.stringify(b)); } } catch { /* storage unavailable */ } };
const epLink = (ep, label = 'Read it in the book') => ep ? `<button class="ln-go" data-book="${ep.book}" data-i="${ep.i}">${esc(label)} <span aria-hidden="true">→</span></button>` : '';

export function initLearn({ openBook, openChar }) {
  const sec = $('#learn'), body = $('.ln-body', sec), tabs = $('.ln-tabs', sec);
  let view = 'family', fam = 0, quiz = null, kanda = 'bala';

  // ── the family trees ──
  const person = (n, sp = false) => `<button class="tn${n.char ? ' has' : ''}${sp ? ' sp' : ''}"${n.char ? ` data-char="${n.char}"` : ' tabindex="-1"'}><b>${esc(n.name)}</b>${n.dev ? `<i lang="hi">${esc(n.dev)}</i>` : ''}</button>`;
  // a line of single descendants (Manu → Ikṣvāku → … → Aja) is shown as one row of names, so the tree branches out
  // where the story does instead of running down the page
  const chainOf = n => { const c = [n]; while (c.at(-1).children?.length === 1 && !c.at(-1).spouse?.length) c.push(c.at(-1).children[0]); return c; };
  const inner = n => `<div class="tc">${person(n)}${(n.spouse || []).map(s => `<span class="tw" aria-label="married to">⚭</span>${person(s, true)}`).join('')}</div>${n.note ? `<small class="tnote">${esc(n.note)}</small>` : ''}${n.children?.length ? `<ul>${n.children.map(node).join('')}</ul>` : ''}`;
  const node = n => {
    const ch = chainOf(n);
    if (ch.length < 3) return `<li>${inner(n)}</li>`;
    const row = ch.slice(0, -1).map(x => `<span class="tlink" title="${esc(x.note || '')}">${person(x)}</span><i aria-hidden="true">→</i>`).join('');
    return `<li><div class="tchain" aria-label="line of descent">${row}</div>${inner(ch.at(-1))}</li>`;
  };
  const family = () => {
    const f = FAMILIES[fam];
    return `<div class="ln-sub" role="tablist">${FAMILIES.map((x, i) => `<button role="tab" aria-selected="${i === fam}" data-fam="${i}">${esc(x.name)}</button>`).join('')}</div>
      <div class="ln-fam-head"><span lang="hi">${esc(f.dev || '')}</span><p>${esc(f.note || '')}</p></div>
      <div class="ln-tree" tabindex="0" aria-label="${esc(f.name)}"><ul>${node(f.tree)}</ul></div>
      <p class="ln-hint">Touch a name to open that figure in the Pantheon.</p>`;
  };

  // ── the teachings ──
  const teach = () => `<div class="ln-teach">${TEACHINGS.map(t => `<article class="ln-card">
      <div class="lc-dev" lang="hi">${esc(t.dev || '')}</div><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p>
      ${t.verse ? `<blockquote><div lang="sa">${esc(t.verse.sa)}</div><em>${esc(t.verse.tr || '')}</em><span>“${esc(t.verse.en)}”</span><cite>${esc(t.verse.ref)}</cite></blockquote>` : ''}
      <div class="lc-foot">${(t.who || []).map(id => `<button class="lc-who" data-char="${id}">${esc(id)}</button>`).join('')}${epLink(t.ep)}</div></article>`).join('')}</div>`;

  // ── the quiz ──
  const quizView = () => {
    const b = best();
    const pick = `<div class="ln-sub" role="tablist">${Object.keys(QUIZ).map(k => `<button role="tab" aria-selected="${k === kanda}" data-kanda="${k}">${KANDA[k] || k}${b[k] != null ? ` <small>${b[k]}/${QUIZ[k].length}</small>` : ''}</button>`).join('')}</div>`;
    if (!quiz || quiz.k !== kanda) quiz = { k: kanda, n: 0, score: 0, picked: null };
    const Q = QUIZ[kanda], q = Q[quiz.n];
    if (!q) {
      const s = quiz.score, all = Q.length; saveBest(kanda, s);
      const word = s === all ? 'Perfect! Sādhu, sādhu!' : s >= all * .75 ? 'Excellent — you know this Kāṇḍa well.' : s >= all * .5 ? 'Good — read on and try again.' : 'A good beginning: the book is the best teacher.';
      return `${pick}<div class="ln-quiz done"><div class="qz-score">${s}<span>/${all}</span></div><p>${word}</p>
        <div class="qz-row"><button class="ln-go" data-again>Try again</button>${epLink({ book: kanda, i: 0 }, `Read the ${KANDA[kanda]} Kāṇḍa`)}</div></div>`;
    }
    const answered = quiz.picked != null;
    return `${pick}<div class="ln-quiz"><div class="qz-top"><span>Question ${quiz.n + 1} of ${Q.length}</span><span>Score ${quiz.score}</span></div>
      <div class="qz-bar"><i style="width:${(quiz.n / Q.length) * 100}%"></i></div>
      <h3>${esc(q.q)}</h3><div class="qz-opts">${q.options.map((o, i) => `<button data-opt="${i}" ${answered ? 'disabled' : ''} class="${answered ? (i === q.answer ? 'right' : i === quiz.picked ? 'wrong' : '') : ''}">${esc(o)}</button>`).join('')}</div>
      ${answered ? `<div class="qz-why ${quiz.picked === q.answer ? 'ok' : 'no'}"><b>${quiz.picked === q.answer ? 'Right!' : 'Not quite.'}</b> ${esc(q.why)}</div>
        <div class="qz-row">${epLink(q.ep, 'Read this moment')}<button class="ln-next" data-next>${quiz.n + 1 < Q.length ? 'Next question' : 'See your score'} →</button></div>` : ''}</div>`;
  };

  // ── the words ──
  const words = (f = '') => {
    const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const list = GLOSSARY.filter(g => !f || norm(g.term + ' ' + g.meaning).includes(norm(f)) || g.dev?.includes(f));
    return `<label class="ln-search"><span class="sr">Search the words</span><input type="search" placeholder="Search a word: dharma, astra, setu…" value="${esc(f)}" autocomplete="off"></label>
      <dl class="ln-words">${list.map(g => `<div><dt>${esc(g.term)} <span lang="sa">${esc(g.dev || '')}</span></dt><dd>${esc(g.meaning)}</dd></div>`).join('') || '<p class="ln-hint">No word matches.</p>'}</dl>`;
  };

  // ── the years ──
  const time = () => `<ol class="ln-time">${TIMELINE.map(t => `<li><div class="lt-when">${esc(t.when)}</div><div class="lt-body"><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p>
      ${t.place ? `<small>${esc(t.place)}</small>` : ''}${epLink(t.ep)}</div></li>`).join('')}</ol>`;

  const VIEWS = { family, teach, quiz: quizView, words, time };
  const show = (v = view, keep = false) => {
    view = v; $$('button[data-view]', tabs).forEach(b => b.setAttribute('aria-selected', String(b.dataset.view === v)));
    body.innerHTML = VIEWS[v](); body.dataset.view = v;
    if (!keep && v !== 'words') window.gsap?.fromTo(body.children, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, stagger: .03, ease: 'power2.out', clearProps: 'all' });
    if (v === 'family') { const t = $('.ln-tree', body); requestAnimationFrame(() => { t.scrollLeft = (t.scrollWidth - t.clientWidth) / 2; }); }
  };

  tabs.addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (b) show(b.dataset.view); });
  body.addEventListener('click', e => {
    // only this panel's own controls (the page's <body> carries data-kanda of its own, for the Kāṇḍa's tint)
    const hit = sel => { const el = e.target.closest(sel); return el && body.contains(el) ? el : null; };
    const t = e.target;
    const c = hit('[data-char]'); if (c) { openChar(c.dataset.char); return; }
    const g = hit('[data-book]'); if (g) { openBook(g.dataset.book, +g.dataset.i); return; }
    const f = hit('[data-fam]'); if (f) { fam = +f.dataset.fam; show('family'); return; }
    const k = hit('[data-kanda]'); if (k && QUIZ[k.dataset.kanda]) { kanda = k.dataset.kanda; quiz = null; show('quiz'); return; }
    const o = hit('[data-opt]'); if (o && quiz && quiz.picked == null) { quiz.picked = +o.dataset.opt; if (quiz.picked === QUIZ[kanda][quiz.n].answer) quiz.score++; show('quiz', true); return; }
    if (hit('[data-next]')) { quiz.n++; quiz.picked = null; show('quiz'); $('.ln-quiz', body)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
    if (hit('[data-again]')) { quiz = null; show('quiz'); }
  });
  body.addEventListener('input', e => {
    if (!e.target.matches('.ln-search input')) return;
    const v = e.target.value, pos = e.target.selectionStart;
    $('.ln-words', body).outerHTML = words(v).replace(/^[\s\S]*?(<dl)/, '$1');
    e.target.setSelectionRange?.(pos, pos);
  });
  // nice names on the "who" chips once the Pantheon's names are known
  import('./data/characters.js').then(({ CHARACTERS }) => {
    const N = Object.fromEntries(CHARACTERS.map(c => [c.id, c.name]));
    const fix = () => $$('.lc-who', body).forEach(b => { if (N[b.dataset.char]) b.textContent = N[b.dataset.char]; });
    new MutationObserver(fix).observe(body, { childList: true }); fix();
  }).catch(() => { });
  show('family');
}
