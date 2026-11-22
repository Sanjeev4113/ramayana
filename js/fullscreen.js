// Full screen for either side of the Kathā: the book or the paintings. The panel fills the screen (the Fullscreen
// API where the browser has it, a fixed overlay where it does not, as on iPhone), and the transport bar moves into it
// as a floating bar that shows while the pointer moves and fades when it rests.
const $ = (s, el = document) => el.querySelector(s);

export function initFullscreen() {
  const bar = $('#th-bar'), home = bar?.parentElement, after = bar?.previousElementSibling;
  if (!bar) return;
  let open = null, idleT = 0;
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const wake = () => {
    if (!open) return;
    open.classList.remove('idle'); clearTimeout(idleT);
    idleT = setTimeout(() => { if (open && !open.matches(':hover .th-bar, :focus-within')) open.classList.add('idle'); }, 2600);
  };
  // the book (PageFlip) and the stage measure themselves again once the panel has its new size
  const settle = () => { [30, 250, 700].forEach(ms => setTimeout(() => { dispatchEvent(new Event('resize')); window.__katha?.book?.fit?.(); }, ms)); };
  function enter(panel) {
    if (open) leave();
    open = panel;
    panel.appendChild(bar); bar.classList.add('floating');
    const req = panel.requestFullscreen || panel.webkitRequestFullscreen;
    // the panel always takes the full-screen layout (class), whether or not the browser grants real full screen
    panel.classList.add('is-max'); document.body.classList.add('fs-open'); document.documentElement.style.overflow = 'hidden'; window.__lenis?.stop(); settle();
    if (req) Promise.resolve(req.call(panel, { navigationUI: 'hide' })).then(settle).catch(() => { });
    wake();
  }
  function leave() {
    const panel = open; if (!panel) return;
    open = null; clearTimeout(idleT);
    panel.classList.remove('is-max', 'idle'); document.body.classList.remove('fs-open');
    bar.classList.remove('floating');
    if (after?.parentElement === home) after.after(bar); else home.appendChild(bar);
    document.documentElement.style.overflow = ''; window.__lenis?.start();
    if (fsEl()) (document.exitFullscreen || document.webkitExitFullscreen)?.call(document).catch?.(() => { });
    settle();
    // keep the reader where they were
    setTimeout(() => panel.scrollIntoView({ block: 'center' }), 120);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-fs]');
    if (b) { const p = document.getElementById(b.dataset.fs); if (open === p) leave(); else enter(p); return; }
    if (e.target.closest('[data-fs-exit]')) leave();
  });
  let wasFs = false;
  const onChange = () => { if (fsEl()) { wasFs = true; settle(); return; } if (open && wasFs) { wasFs = false; leave(); } else settle(); };
  document.addEventListener('fullscreenchange', onChange); document.addEventListener('webkitfullscreenchange', onChange);
  addEventListener('keydown', e => { if (e.key === 'Escape' && open && !fsEl()) leave(); if (open) wake(); });
  addEventListener('pointermove', wake, { passive: true });
  addEventListener('pointerdown', wake, { passive: true });
}
