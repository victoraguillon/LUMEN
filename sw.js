// LUMEN - Service Worker único (v6) en la RAÍZ (/sw.js)
// Un solo SW en la ruta estándar que todos los navegadores (iOS y Chrome)
// manejan mejor. CACHE v6 nueva: limpia cualquier caché anterior.
const CACHE = "lumen-cache-v6";

// Endpoint de eco: la función confirma el recibo (diagnóstico de entrega).
const PUSH_ENDPOINT = "https://etioxnigysbxitiaveyp.functions.supabase.co/send-push";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => (keys || []).some((k) => k !== CACHE) ? Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))) : Promise.resolve())
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone));
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("/"))
      )
  );
});

function pingReceipt(pingId, ok) {
  if (!pingId) return Promise.resolve();
  try {
    return fetch(PUSH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "sw-received",
        pingId: String(pingId),
        ok: !!ok,
        ua: (self.navigator && self.navigator.userAgent) || "sw"
      })
    }).catch(() => null);
  } catch (e) {
    return Promise.resolve();
  }
}

self.addEventListener("push", (event) => {
  let data = { title: "LUMEN", body: "", url: "/" };
  try {
    if (event.data) {
      const parsed = event.data.json();
      if (parsed && typeof parsed === "object") data = Object.assign({}, data, parsed);
    }
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }
  const pingId = data.pingId || null;
  const notify = () =>
    self.registration
      .showNotification(data.title, {
        body: data.body,
        icon: "/assets/icons/icon-192.png",
        badge: "/assets/icons/icon-192.png",
        data: { url: data.url },
        tag: "lumen-notif",
        renotify: true
      })
      .catch(() =>
        // Algunos navegadores descartan la notificación completa si el ícono no carga.
        // Fallback sin assets: garantiza que SIEMPRE se muestre algo.
        self.registration.showNotification(data.title, {
          body: data.body,
          data: { url: data.url },
          tag: "lumen-notif",
          renotify: true
        })
      );
  event.waitUntil(
    notify().then(
      () => pingReceipt(pingId, true),
      () => pingReceipt(pingId, false)
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});