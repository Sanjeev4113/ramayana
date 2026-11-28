// The Rāmāyaṇa as an app (installed from the browser, or inside the iOS/Android shell): what has been read stays
// readable offline, and a new version of the site is never hidden behind an old one.
//  · pages and data (unversioned): the network first, the cache only when offline
//  · versioned code and paintings (…?v=…, a new version gets a new address): the cache first
//  · other images and fonts: the cache at once, refreshed in the background
//  · films and narration (range requests): always streamed from the network, never stored
const V = 'r1', SHELL = `shell-${V}`, ART = `art-${V}`, MAX = 420;
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(SHELL).then(c => c.add('/').catch(() => { }))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SHELL && k !== ART).map(k => caches.delete(k)))).then(() => self.clients.claim())));
const trim = async c => { const ks = await c.keys(); for (let i = 0; i < ks.length - MAX; i++) await c.delete(ks[i]); };
const keep = (c, r, res) => { if (res.ok && res.type === 'basic' && res.status === 200) { c.put(r, res.clone()).then(() => trim(c)).catch(() => { }); } return res; };
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (r.headers.has('range') || /\.(mp4|m4a|mp3|webm|ogg)$/i.test(u.pathname)) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { if (res.ok) caches.open(SHELL).then(c => c.put('/', res.clone())); return res; }).catch(() => caches.match('/')));
    return;
  }
  if (/[?&]v=/.test(u.search)) { e.respondWith(caches.open(ART).then(async c => (await c.match(r)) || fetch(r).then(res => keep(c, r, res)))); return; }
  if (/\.(webp|png|jpe?g|svg|woff2?)$/i.test(u.pathname)) {
    e.respondWith(caches.open(ART).then(async c => { const hit = await c.match(r); const net = fetch(r).then(res => keep(c, r, res)).catch(() => hit); return hit || net; }));
    return;
  }
  e.respondWith(fetch(r).then(res => { if (res.ok && res.type === 'basic') caches.open(SHELL).then(c => c.put(r, res.clone())); return res; }).catch(() => caches.match(r)));
});
