
importScripts("/assets/js/workbox-sw.js");

workbox.core.setCacheNameDetails({
  prefix: "jekyll-pwa",
  suffix: "v1.0",
});

workbox.core.skipWaiting();
workbox.core.clientsClaim();

// Konfigurasi cache
const CACHE_CONFIG = {
  pages: { name: "pages-cache", maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 },
  images: { name: "image-cache", maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
  lanyardAPI: { name: "lanyard-api-cache", maxEntries: 10, maxAgeSeconds: 5 * 60 },
  githubImages: { name: "github-preview-cache", maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 },
};

// Precache file dari Jekyll
workbox.precaching.precacheAndRoute(self.__precacheManifest || []);

// manifest
workbox.routing.registerRoute(/manifest\.json$/, new workbox.strategies.NetworkFirst({ cacheName: "manifest-cache" }));

// Cache halaman HTML (Network First)
workbox.routing.registerRoute(
  ({ request }) => request.destination === "document",
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_CONFIG.pages.name,
    plugins: [new workbox.expiration.ExpirationPlugin(CACHE_CONFIG.pages)],
  })
);

// Cache CSS & JS (Stale While Revalidate)
workbox.routing.registerRoute(/\.(?:js|css)$/, new workbox.strategies.StaleWhileRevalidate());

// Cache font (Cache First)
workbox.routing.registerRoute(
  /\.(?:woff2|woff|ttf|otf)$/,
  new workbox.strategies.CacheFirst({
    cacheName: "font-cache",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10, // Maksimal 10 font disimpan
        maxAgeSeconds: 60 * 24 * 60 * 60, // Berlaku 60 hari
      }),
    ],
  })
);

// Cache gambar (Cache First)
workbox.routing.registerRoute(
  /\.(?:png|avif|jpg|jpeg|svg)$/,
  new workbox.strategies.CacheFirst({
    cacheName: CACHE_CONFIG.images.name,
    plugins: [new workbox.expiration.ExpirationPlugin(CACHE_CONFIG.images)],
  })
);

// Cache API Lanyard (Stale While Revalidate)
// workbox.routing.registerRoute(
//   ({ url }) => url.origin === "https://api.lanyard.rest",
//   new workbox.strategies.StaleWhileRevalidate({
//     cacheName: CACHE_CONFIG.lanyardAPI.name,
//     plugins: [new workbox.expiration.ExpirationPlugin(CACHE_CONFIG.lanyardAPI)],
//   })
// );

// Cache gambar dari GitHub raw (Cache First)
workbox.routing.registerRoute(
  ({ url }) => url.origin === "https://raw.githubusercontent.com" && url.pathname.includes("/preview.png"),
  new workbox.strategies.CacheFirst({
    cacheName: CACHE_CONFIG.githubImages.name,
    plugins: [new workbox.expiration.ExpirationPlugin(CACHE_CONFIG.githubImages)],
  })
);

// Hapus cache lama saat activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith("jekyll-pwa") && !Object.values(CACHE_CONFIG).some((cfg) => cfg.name === cacheName)
            )
            .map((cacheName) => caches.delete(cacheName))
        )
      )
  );
});

// Perbarui Service Worker secara manual saat menerima pesan dari client
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
