// LUMEN - Service Worker único (v12) en la RAÍZ (/sw.js)
// v12: bump de caché del batch de íconos (Tabler canónico) + limpieza de texto
// (sin guiones/artefactos CJK, paréntesis y comas en datos); mantiene cache-first
// con actualización en segundo plano y navegaciones network-first.
const CACHE = "lumen-cache-v12";

// Endpoint de eco: la API confirma el recibo (diagnóstico de entrega).
const PUSH_ENDPOINT = "https://lumenve.vercel.app/api/send-push";

const SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/styles.css",
  "/js/supabase.js",
  "/js/icons.js",
  "/js/ui.js",
  "/js/auth.js",
  "/js/data.js",
  "/js/push.js",
  "/js/app.js",
  "/js/santoral.js",
  "/js/devocional_data.js",
  "/js/frases_santos.js",
  "/js/formacion_data.js",
  "/js/oraciones_data.js",
  "/js/rosario_data.js",
  "/js/novenas_data.js",
  "/js/examen_data.js",
  "/js/views/landing.js",
  "/js/views/inicio.js",
  "/js/views/nosotros.js",
  "/js/views/actividades.js",
  "/js/views/detalle.js",
  "/js/views/devocional.js",
  "/js/views/recursos.js",
  "/js/views/perfil.js",
  "/js/views/notificaciones.js",
  "/js/views/intenciones.js",
  "/js/views/encuestas.js",
  "/js/views/blog.js",
  "/js/views/formacion.js",
  "/js/views/oraciones.js",
  "/js/views/rosario.js",
  "/js/views/novenas.js",
  "/js/views/examen.js",
  "/js/views/favoritos.js",
  "/js/views/gestion.js",
  "/js/views/contacto.js",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  "/assets/icons/icon-512-maskable.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all(
      SHELL.map((p) =>
        fetch(p)
          .then((res) => (res && res.ok ? caches.open(CACHE).then((c) => c.put(p, res)) : null))
          .catch(() => null)
      )
    ).then(() => self.skipWaiting())
  );
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

  // Navegaciones: red primero (HTML siempre fresco), caché como respaldo.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match("/"))
    );
    return;
  }

  // Assets/datos: cache-first con actualización en segundo plano.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      const online = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() => null);
      return hit || online;
    })
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