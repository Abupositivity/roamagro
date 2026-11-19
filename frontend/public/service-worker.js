/* eslint-disable no-restricted-globals */

const CACHE_PREFIX = 'roamagro-';
const CACHE_VERSION = 'v2';

const STATIC_CACHE =
  `${CACHE_PREFIX}static-${CACHE_VERSION}`;

const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
  OFFLINE_URL,
  '/favicon.ico',
  '/icons/roamagro-192.png',
  '/icons/roamagro-512.png',
  '/icons/roamagro-maskable-512.png',
];

const PUBLIC_STATIC_PATHS = new Set([
  '/favicon.ico',
  '/icons/roamagro-192.png',
  '/icons/roamagro-512.png',
  '/icons/roamagro-maskable-512.png',
]);

const VERSIONED_BUNDLE_PATTERN =
  /^\/static\/(?:js|css)\/[^/]+\.[a-f0-9]{8,}(?:\.chunk)?\.(?:js|css)$/i;

/**
 * Install the service worker and cache
 * essential public offline resources.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);

      const requests = PRECACHE_URLS.map(
        (url) =>
          new Request(url, {
            cache: 'reload',
          })
      );

      await cache.addAll(requests);
    })()
  );
});

/**
 * Remove outdated RoamAgro caches.
 * Leave unrelated application caches untouched.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith(CACHE_PREFIX) &&
              name !== STATIC_CACHE
          )
          .map((name) => caches.delete(name))
      );

      await self.clients.claim();
    })()
  );
});

/**
 * Identify sensitive application routes.
 *
 * These requests must use the network directly
 * without service worker caching.
 */
function isSensitivePath(pathname) {
  const path = pathname.toLowerCase();

  const sensitivePrefixes = [
    '/api',
    '/auth',
    '/login',
    '/register',
    '/logout',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/subscription',
    '/payment',
    '/payments',
    '/ads/report',
    '/admin',
  ];

  return sensitivePrefixes.some(
    (prefix) =>
      path === prefix ||
      path.startsWith(`${prefix}/`)
  );
}

/**
 * Only explicitly approved public assets
 * are eligible for runtime caching.
 */
function isCacheableStaticAsset(request, url) {
  if (url.search) {
    return false;
  }

  if (request.headers.has('Authorization')) {
    return false;
  }

  if (PUBLIC_STATIC_PATHS.has(url.pathname)) {
    return request.destination === 'image';
  }

  if (!VERSIONED_BUNDLE_PATTERN.test(url.pathname)) {
    return false;
  }

  return (
    request.destination === 'script' ||
    request.destination === 'style'
  );
}

/**
 * Prevent error pages, redirected responses,
 * or inappropriate content from entering the cache.
 */
function isCacheableResponse(request, response) {
  if (
    !response ||
    response.status !== 200 ||
    response.type !== 'basic' ||
    response.redirected
  ) {
    return false;
  }

  const cacheControl =
    response.headers.get('Cache-Control') || '';

  if (/\b(?:private|no-store)\b/i.test(cacheControl)) {
    return false;
  }

  const contentType = (
    response.headers.get('Content-Type') || ''
  ).toLowerCase();

  switch (request.destination) {
    case 'script':
      return (
        contentType.includes('javascript') ||
        contentType.includes('ecmascript')
      );

    case 'style':
      return contentType.includes('text/css');

    case 'image':
      return contentType.startsWith('image/');

    default:
      return false;
  }
}

/**
 * Cache-first strategy for safe static assets.
 */
async function handleStaticAsset(request) {
  let cache;

  try {
    cache = await caches.open(STATIC_CACHE);

    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }
  } catch {
    // Cache storage failure must not block the network.
  }

  const networkResponse = await fetch(request);

  if (
    cache &&
    isCacheableResponse(request, networkResponse)
  ) {
    try {
      await cache.put(
        request,
        networkResponse.clone()
      );
    } catch {
      // Storage limits must not break asset loading.
    }
  }

  return networkResponse;
}

/**
 * Network-first navigation.
 *
 * Application HTML is deliberately not cached.
 * Serve the public offline page if the network fails.
 */
async function handleNavigation(request) {
  try {
    return await fetch(request, {
      cache: 'no-store',
    });
  } catch {
    try {
      const cache = await caches.open(STATIC_CACHE);

      const offlineResponse =
        await cache.match(OFFLINE_URL);

      if (offlineResponse) {
        return offlineResponse;
      }
    } catch {
      // Use the basic fallback if cache access fails.
    }

    return new Response(
      'RoamAgro is offline. Please reconnect and try again.',
      {
        status: 503,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}

/**
 * Handle only approved same-origin GET requests.
 *
 * All other requests retain their normal
 * browser networking behaviour.
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (
    url.protocol !== 'https:' &&
    url.protocol !== 'http:'
  ) {
    return;
  }

  if (
    isSensitivePath(url.pathname) ||
    request.headers.has('Authorization')
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      handleNavigation(request)
    );

    return;
  }

  if (isCacheableStaticAsset(request, url)) {
    event.respondWith(
      handleStaticAsset(request)
    );
  }
});