// ═══════════════════════════════════════════════
//  PlayZone Service Worker
//  Caches static assets for offline support
//  Updates automatically when files change
// ═══════════════════════════════════════════════

const CACHE_NAME = 'playzone-v1';

// فایل‌هایی که باید cache بشن
const PRECACHE = [
  '/',
  '/dashboard',
  '/game',
  '/contra',
  '/snake',
  '/landing.html',
  '/dashboard.html',
  '/index.html',
  '/contra.html',
  '/snake.html',
  '/pz-core.js',
  '/pz-ui.js',
];

// ── Install: فایل‌های اصلی رو cache کن ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching app shell');
      // graceful — اگه یه فایل fail کرد بقیه cache بشن
      return Promise.allSettled(
        PRECACHE.map(url => cache.add(url).catch(() => {
          console.warn('[SW] Could not cache:', url);
        }))
      );
    })
  );
  // فوری activate بشه بدون منتظر ماندن برای tabs قبلی
  self.skipWaiting();
});

// ── Activate: cache های قدیمی رو پاک کن ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  // همه tabها رو بدون reload کنترل کن
  self.clients.claim();
});

// ── Fetch: Network First، اگه offline شد Cache ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Supabase requests رو bypass کن (همیشه network)
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('supabase.com')) {
    return; // browser خودش handle کنه
  }

  // CDN requests رو bypass کن
  if (url.hostname !== self.location.hostname) {
    return;
  }

  // برای بقیه: Network First
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // پاسخ رو cache کن
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // اگه network نبود از cache بده
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // fallback برای navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/dashboard.html') ||
                   caches.match('/landing.html');
          }
        });
      })
  );
});

// ── Background sync برای score ها ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-scores') {
    console.log('[SW] Background sync: scores');
  }
});

console.log('[SW] PlayZone Service Worker loaded');
