// Minimalist PWA Service Worker for Lawyer Abdullah Al-Watihi Legal Suite
const CACHE_NAME = "watihi-v3";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

self.addEventListener("install", (e) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("activate", (e) => {
  // Claim immediate control and clear old caches
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // Skip intercepting API calls and non-GET requests to prevent fetch failure issues
  if (e.request.url.includes("/api/") || e.request.method !== "GET") {
    return;
  }

  // Network First, falling back to cache
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Clone the response because it can only be consumed once
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          // Only cache successful GET requests
          if (e.request.method === "GET" && !e.request.url.startsWith("chrome-extension") && !e.request.url.includes("/api/")) {
            cache.put(e.request, responseToCache);
          }
        });

        return response;
      })
      .catch(() => {
        // If network fail, fall back to cache
        return caches.match(e.request).then((cachedResponse) => {
          return cachedResponse;
        });
      })
  );
});
