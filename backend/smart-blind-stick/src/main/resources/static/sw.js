const CACHE = "smartblind-public-v1";
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([
    "/offline.html", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"
  ])));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith("smartblind-public-") && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  // No cache for readings, GPS positions, authenticated HTML, login, or external map tiles.
  if (event.request.method === "GET" && event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/offline.html")));
  }
});
