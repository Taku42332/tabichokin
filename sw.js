// 画面ファイルを端末に保存し、次回は通信を待たずに即表示する。裏で最新版を取得して次回に反映する。
// 家計データ（script.google.com）は保存しない。
const CACHE = 'hapalua-shell-v5';
const SHELL = ['./', './index.html', './icon.png?v=2'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL.map(url => new Request(url, { cache: 'no-cache' })))));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(event.request, { ignoreSearch: true });
    // GitHub Pagesはブラウザに10分キャッシュさせるため、必ずサーバーへ更新確認する。
    const network = fetch(event.request.url, { cache: 'no-cache', credentials: 'same-origin' })
      .then(response => {
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      })
      .catch(() => cached);
    return cached || network;
  }));
});
