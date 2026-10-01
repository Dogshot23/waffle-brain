// ─────────────────────────────────────────────
//  WaffleBrain — sw.js (service worker)
//  Keeps WaffleBrain working offline, e.g. if classroom Wi-Fi drops.
//
//  • On install it saves the Teacher and Student pages, their scripts,
//    styles, icons and ALL Waffles (data/waffles.json).
//  • Online, every request still goes to the network first, so teachers
//    always get the newest version; each fresh copy is saved for later.
//  • Offline, the saved copy is used instead.
//  • Google Fonts are saved too (so offline pages keep their fonts);
//    Google Analytics and the separate /wafflebrain-kids/ app are left
//    alone.
//
//  When you add, rename or remove a file the pages need, update PRECACHE
//  below and bump CACHE_VERSION. Ordinary content or code edits need no
//  change here (network-first always fetches them).
// ─────────────────────────────────────────────

const CACHE_VERSION = 'v2';
const CACHE = `wafflebrain-${CACHE_VERSION}`;

const PRECACHE = [
  './',
  'index.html',
  'student.html',
  'style.css',
  'analytics.js',
  'collections.js',
  'js/payment.js',
  'engine.js',
  'app.js',
  'student.js',
  'studentSupport.js',
  'data/waffles.json',
  'manifest.json',
  'images/logo.png',
  'images/favicon.ico',
  'images/icon-192.png',
  'images/icon-512.png',
  'images/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Remove caches from older versions of this file.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(k => k.startsWith('wafflebrain-') && k !== CACHE)
        .map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: saved copy first (font files never change), else network.
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Only this site's own files; never the separate Kids app.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/wafflebrain-kids/')) return;

  event.respondWith(networkFirst(req));
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    // Offline. Pages are matched without their ?query (e.g. the Student
    // link's ?collection=…), and any page falls back to the Teacher page.
    const saved = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
    if (saved) return saved;
    if (req.mode === 'navigate') {
      const home = await cache.match('index.html');
      if (home) return home;
    }
    throw err;
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const saved = await cache.match(req);
  if (saved) return saved;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
  return res;
}
