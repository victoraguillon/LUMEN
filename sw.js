// LUMEN - Service Worker único (v32) en la RAÍZ (/sw.js)
// v36: securitymaxxing — sanitización XSS, CORS restringido y guards por rol
// v35: push v3 — recordatorios a inscritos, evangelio 07:00 y devocional 20:00
// v34: celeste de la app alineado al azul del nuevo logo (#245888)
// v33: nuevo logo de la app (logo.png reemplaza a icons antiguos)
// v31: footer global en todas las vistas del SPA (index.html + styles)
// v30: fix censo de gestión + 5 módulos nuevos de Formación (bumpeo de caché para forzar actualización en clientes)
// v29: vista Evangelio del día — network-first sobre /api/evangelio (offline usa última copia)
// v28: Fase B offline — store.js (caché IndexedDB + outbox) precacheador
// v27: unificación de vistas estilo v-header + utilidades dark-safe + rosario avemarías numeradas
// v26: banner instalación PWA (dark mode + botones por plataforma) + rediseño vistas Nosotros y Blog
// v25: bitácora de exportaciones (migración 11)
const CACHE = "lumen-cache-v36";

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
  "/js/store.js",
  "/js/data.js",
  "/js/push.js",
  "/js/app.js",
  "/js/links_data.js",
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
  "/js/views/calendario.js",
  "/js/views/detalle.js",
  "/js/views/devocional.js",
  "/js/views/evangelio.js",
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
  "/assets/icons/logo.png",
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

  // Navegaciones: stale-while-revalidate. Se sirve el shell de cach� al
  // instante y se refresca la copia en segundo plano (el HTML nuevo entra
  // en la pr�xima visita). Sin cach� -> red directa.
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("/").then((cached) => {
        const net = fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const clone = res.clone();
              caches.open(CACHE).then((c) => c.put("/", clone));
            }
            return res;
          })
          .catch(() => null);
        return cached || net;
      })
    );
    return;
  }

  // Evangelio del día (/api/evangelio): network-first. En línea se devuelve
  // siempre la versión fresca (y se guarda en caché); sin conexión se sirve la
  // última copia cacheada. Va ANTES del branch genérico de assets/datos.
  const url = new URL(req.url);
  if (url.pathname === "/api/evangelio") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
            return res;
          }
          if (res && res.status >= 500) {
            return caches.match(req).then((hit) => hit || res);
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Assets/datos: stale-while-revalidate con claves exactas por recurso
  // (sin ignoreSearch) para no devolver cach�frias que mienten.
  event.respondWith(
    caches.match(req).then((hit) => {
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
        icon: "/assets/icons/logo.png",
        badge: "/assets/icons/logo.png",
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