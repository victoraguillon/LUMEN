// ============================================================
// LUMEN - Service Worker "limpiador" de la raíz (legacy)
// El antiguo /sw.js con caché agresiva impedía que la app
// se actualizara sin borrar datos. Este SW:
//  1) No intercepta NINGÚN fetch (la app siempre va a red)
//  2) Purgas TODAS las cachés viejas
//  3) Se des-registra solo para no interferir con js/sw.js
// Desplegable en Vercel; la app además fuerza la des-registración.
// ============================================================
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all((keys || []).map((k) => caches.delete(k)));
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      await Promise.all(clients.map((c) => ("navigate" in c) ? c.navigate(c.url).catch(() => {}) : Promise.resolve()));
      await self.registration.unregister();
    })()
  );
});

// Sin handler de fetch: nunca se sirve caché. Solo navegación segura.
self.addEventListener("fetch", () => {});