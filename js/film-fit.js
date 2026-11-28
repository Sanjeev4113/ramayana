// A film is never cropped. On a screen taller than the film (a phone held upright) the whole 16:9 picture is shown,
// and the space around it glows with the film's own colours: the current frame drawn into a tiny canvas, enlarged and
// blurred behind it (like an "ambient" mode). Costs almost nothing: a 32×18 draw at most every 100 ms (200 ms on modest
// devices), only while the film plays and the page is in view. On a wide screen the film fills it as before.
import { LITE } from './calm.js';

export function fitFilm(video, { host = video.parentElement, ratio = 16 / 9 } = {}) {
  if (!video || video.__fit) return;
  video.__fit = true;
  const amb = document.createElement('canvas');
  amb.className = 'film-amb'; amb.width = 32; amb.height = 18; amb.setAttribute('aria-hidden', 'true');
  host.insertBefore(amb, video);
  const cx = amb.getContext('2d', { alpha: false });
  let whole = false, last = 0, timer = 0;
  const paint = () => {
    const now = performance.now();
    if (!whole || document.hidden || video.readyState < 2 || now - last < (LITE ? 200 : 100)) return;
    last = now; try { cx.drawImage(video, 0, 0, 32, 18); } catch { /* not decodable yet */ }
  };
  const frame = () => { paint(); if (!video.paused && !video.ended) arm(); };
  const arm = () => { if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(frame); else { clearTimeout(timer); timer = setTimeout(frame, LITE ? 200 : 100); } };
  const apply = () => {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
    whole = w / Math.max(1, h) < ratio * .92;
    video.classList.toggle('film-whole', whole); amb.hidden = !whole;
    if (whole) { last = 0; paint(); }
  };
  video.addEventListener('play', arm); video.addEventListener('seeked', () => { last = 0; paint(); });
  video.addEventListener('loadeddata', () => { last = 0; paint(); });
  addEventListener('resize', apply); addEventListener('orientationchange', () => setTimeout(apply, 250));
  apply();
}
