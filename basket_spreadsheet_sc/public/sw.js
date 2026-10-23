
// ============================================================
// CONFIG
// ============================================================
const VERSION = "v3"; // súbelo (v2, v3...) para invalidar todos los caches

// Rutas a precachear al instalar el SW (añade las tuyas)
const PRECACHE_ROUTES = [
  "/",
  "/new_planilla",
  "/continue_planilla",
  "/torneos",
  "/offline",
  "/login"
];

// Archivos extra a precachear
const PRECACHE_FILES = [
  "/manifest.webmanifest",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
  "/favicon.ico",
];
// Llamadas a API (DESACTIVADO por ahora).
// Cuando la tengas, pon enabled: true y ajusta matches().
const API_CONFIG = {
  enabled: false,
  matches: (url) => url.pathname.startsWith("/api/"),
  // Para un servicio externo: url.origin === "https://mi-api.com"
};

// ============================================================
// CACHES
// ============================================================
const CACHES = {
  pages: `pages-${VERSION}`,
  rsc: `rsc-${VERSION}`,
  static: `static-${VERSION}`,
  assets: `assets-${VERSION}`,
  api: `api-${VERSION}`,
};
const CURRENT = Object.values(CACHES);

// ============================================================
// HELPERS
// ============================================================
const MATCH_OPTS = { ignoreVary: true };

// Quita el parámetro _rsc (cambia en cada request) para poder hacer match offline
function rscKey(urlStr) {
  const u = new URL(urlStr);
  u.searchParams.delete("_rsc");
  return new Request(u.toString());
}

// Extrae URLs de /_next/static/... del HTML (y del payload RSC embebido)
function extractAssets(html) {
  const found = new Set();
  const re =
    /(?:\/_next\/)?static\/(?:chunks|css|media)\/[A-Za-z0-9_\-./\[\]%~]+?\.(?:js|css|woff2?)/g;
  for (const m of html.matchAll(re)) {
    const path = m[0].startsWith("/_next/") ? m[0] : `/_next/${m[0]}`;
    found.add(path);
  }
  // iconos / manifest declarados en <link>
  for (const m of html.matchAll(/<link[^>]+href="([^"]+)"/g)) {
    if (m[1].startsWith("/") && !m[1].startsWith("/_next/static/")) found.add(m[1]);
  }
  return [...found];
}

async function precacheRoute(route) {
  const pages = await caches.open(CACHES.pages);
  const rsc = await caches.open(CACHES.rsc);
  const statics = await caches.open(CACHES.static);

  // 1. HTML
  const htmlRes = await fetch(route, { credentials: "same-origin" });
  if (!htmlRes.ok) throw new Error(`Precache falló: ${route}`);
  const html = await htmlRes.clone().text();
  await pages.put(route, htmlRes);

  // 2. Payload RSC (lo que Next pide al navegar con <Link>)
  try {
    const rscRes = await fetch(route, {
      headers: { RSC: "1" },
      credentials: "same-origin",
    });
    if (rscRes.ok) await rsc.put(rscKey(new URL(route, self.location.origin).href), rscRes);
  } catch (_) {}

  // 3. JS/CSS/fuentes que usa la página
  await Promise.allSettled(
    extractAssets(html).map(async (asset) => {
      if (await statics.match(asset)) return;
      const res = await fetch(asset);
      if (res.ok) await statics.put(asset, res);
    })
  );
}

// ============================================================
// ESTRATEGIAS
// ============================================================
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, MATCH_OPTS);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, MATCH_OPTS);
  const network = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

async function networkFirst(request, cacheName, key = request) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(key, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(key, MATCH_OPTS);
    if (cached) return cached;
    throw err;
  }
}

async function handleNavigation(request) {
  const url = new URL(request.url);
  const pages = await caches.open(CACHES.pages);
  try {
    const res = await fetch(request);
    if (res.ok) pages.put(url.pathname, res.clone());
    return res;
  } catch (_) {
    const cached = await pages.match(url.pathname, MATCH_OPTS);
    if (cached) return cached;
    const offline = await pages.match("/offline", MATCH_OPTS);
    return offline || new Response("Sin conexión", { status: 503 });
  }
}

async function handleRSC(request) {
  const key = rscKey(request.url);
  const cache = await caches.open(CACHES.rsc);
  const isPrefetch = request.headers.get("Next-Router-Prefetch") === "1";
  try {
    const res = await fetch(request);
    if (res.ok) {
      // Un prefetch puede ser parcial: no pisa una respuesta completa ya guardada
      if (!isPrefetch || !(await cache.match(key, MATCH_OPTS))) {
        cache.put(key, res.clone());
      }
    }
    return res;
  } catch (err) {
    const cached = await cache.match(key, MATCH_OPTS);
    if (cached) return cached;
    throw err; // Next hará un fallback a navegación completa (que sí tenemos cacheada)
  }
}

// ============================================================
// EVENTOS
// ============================================================
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await Promise.allSettled(PRECACHE_ROUTES.map(precacheRoute));
      const assets = await caches.open(CACHES.assets);
      await Promise.allSettled(
        PRECACHE_FILES.map(async (f) => {
          const res = await fetch(f);
          if (res.ok) await assets.put(f, res);
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => !CURRENT.includes(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API (inactivo mientras API_CONFIG.enabled sea false)
  if (API_CONFIG.enabled && API_CONFIG.matches(url)) {
    event.respondWith(networkFirst(request, CACHES.api));
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js") return;

  // JS/CSS/fuentes con hash: inmutables
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, CACHES.static));
    return;
  }

  // Imágenes optimizadas de next/image
  if (url.pathname.startsWith("/_next/image")) {
    event.respondWith(staleWhileRevalidate(request, CACHES.assets));
    return;
  }

  // Navegación con <Link> (payload RSC)
  if (request.headers.get("RSC") === "1") {
    event.respondWith(handleRSC(request));
    return;
  }

  // Carga/recarga de página completa
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Resto de recursos estáticos
  if (["style", "script", "font", "image", "manifest"].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request, CACHES.assets));
  }
});