// The Glimpse: the ten-second film of the saga (assets/glimpse/glimpse.mp4) fills the screen beneath the opening verse,
// where the painting of Rāma, Sītā and Lakṣmaṇa once stood. In view it plays silently in a loop, like a painted temple
// wall come alive; "Watch with sound" plays it from the start with its music (the site's own music rests meanwhile).
// The verse steps aside while the film shows its own title, and while it is watched with sound. Out of view, in a
// hidden tab or while the page rests, the film pauses.
import { hold, onBreath, isAwake } from './calm.js';
import { fitFilm } from './film-fit.js';

const $ = (s, el = document) => el.querySelector(s);
const CARD = 8.1;            // from here the film shows its own title card (रामायण · Experience the saga)

export function initGlimpse({ sound } = {}) {
  const sec = $('#verse'), v = $('#gl-video'), play = $('.gl-play', sec), snd = $('.gl-snd', sec);
  fitFilm(v);                                                    // the whole film on an upright phone, never cropped
  if (!sec || !v) return;
  let seen = false, watching = false, musicWas = null;
  const want = () => seen && isAwake();
  const sync = () => {
    if (want()) { if (v.paused) v.play().catch(() => { }); } else if (!v.paused) v.pause();
    hold('glimpse', watching && !v.paused);
    snd.classList.toggle('off', v.muted); snd.setAttribute('aria-label', v.muted ? 'Sound on' : 'Sound off');
  };
  // it starts loading only as the section comes near
  // (in 1080p for a large screen on a fast line, else 720p: the choice made for the opening film, index.html)
  new IntersectionObserver(([e]) => { if (e.isIntersecting && !v.src) { v.src = window.__hd ? v.dataset.hd : v.dataset.sd; v.preload = 'auto'; v.load(); } }, { rootMargin: '900px 0px' }).observe(sec);
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); }, { threshold: .3 }).observe(v);
  onBreath(sync);
  document.addEventListener('visibilitychange', sync);
  // the verse gives way to the film's own title card (checked a few times a second, not every frame)
  v.addEventListener('timeupdate', () => sec.classList.toggle('gl-card', v.currentTime >= CARD));

  const quiet = on => {                                   // the film carries its own music
    if (!sound) return;
    if (on && musicWas === null) { musicWas = sound.musicOn; if (musicWas) sound.setMusic(false); }
    if (!on && musicWas !== null) { if (musicWas) sound.setMusic(true); musicWas = null; }
  };
  const watch = () => {
    watching = true; sec.classList.add('watching');
    v.loop = false; v.currentTime = 0; v.muted = false; v.volume = .9; quiet(true);
    v.play().catch(() => { v.muted = true; v.play().catch(() => { }); });
    sync();
  };
  const ambient = () => {
    watching = false; sec.classList.remove('watching');
    v.muted = true; v.loop = true; quiet(false); sync();
  };
  play.addEventListener('click', watch);
  v.addEventListener('click', () => { if (!watching) watch(); });
  v.addEventListener('ended', () => { ambient(); v.currentTime = 0; sync(); });
  snd.addEventListener('click', () => {
    if (!watching) return watch();
    v.muted = !v.muted; quiet(!v.muted); sync();
  });
  sync();
}
