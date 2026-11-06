// 画面を開く際は最新版を優先し、通信が遅い/オフラインなら保存済み画面を使う。
// 家計データ（script.google.com）は保存しない。
const CACHE = 'hapalua-shell-v23';
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
  if (url.pathname.endsWith('/version.json')) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(event.request, { ignoreSearch: true });
    // GitHub Pagesはブラウザに10分キャッシュさせるため、必ずサーバーへ更新確認する。
    const network = fetch(event.request.url, { cache: 'no-cache', credentials: 'same-origin' })
      .then(response => {
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      })
      .catch(() => cached);
    event.waitUntil(network.then(() => {}));
    if (event.request.mode === 'navigate') {
      // 再読込で古いHTMLが繰り返し表示されるのを防ぐ。遅い回線は最大3秒でキャッシュへ。
      if (!cached) return network;
      const latest = await Promise.race([network, new Promise(resolve => setTimeout(() => resolve(null), 3000))]);
      return latest || cached;
    }
    return cached || network;
  }));
});
