// إصدار التطبيق (غيّره عند تحديث الموقع)
const CACHE_VERSION = 'v1';
const CACHE_NAME = `sidra-store-${CACHE_VERSION}`;

// الملفات التي سيتم تخزينها محلياً
const FILES_TO_CACHE = [
  '/sidra-store/',
  '/sidra-store/index.html',
  '/sidra-store/manifest.json'
];

// عند تثبيت التطبيق
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ تم تخزين الملفات مؤقتاً');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// عند تنشيط التطبيق (حذف الكاش القديم)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
});

// عند طلب أي ملف
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا كان الملف في الكاش، أرسله من الكاش
        if (response) {
          return response;
        }
        // وإلا، حاول جلبها من الإنترنت
        return fetch(event.request)
          .then(networkResponse => {
            // لا نخزن كل شيء، فقط الملفات المهمة
            return networkResponse;
          })
          .catch(() => {
            // إذا فشل كل شيء، أرسل صفحة فارغة
            return new Response('⚠️ غير متصل بالإنترنت', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});