// LUMEN · /api/evangelio — Evangelio del día desde Vatican News.
// Proxy server-side (Node.js, sin deps): evita CORS del navegador, normaliza
// el RSS y devuelve JSON. Las copias se cachean por el Service Worker
// (network-first) y por edge (s-maxage) para caber offline.
import { VATICAN_RSS_URL, parseEvangelioRss } from "./_lib/evangelio-parser.mjs";

const FETCH_TIMEOUT_MS = 10000;
const SITE_URL = "https://lumenve.vercel.app";

function corsHeaders(req) {
  const origin = req.headers.origin;
  // Reflecta el origen de quien llama: el endpoint es GET público sin
  // credenciales, así nunca vuelve a romperse por host/puerto distinto
  // (p. ej. el dev server local o Live Server).
  return { "Access-Control-Allow-Origin": origin || SITE_URL, Vary: "Origin" };
}

function done(req, res, body, status = 200) {
  const h = corsHeaders(req);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", h["Access-Control-Allow-Origin"]);
  res.setHeader("Vary", "Origin");
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=86400");
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    const h = corsHeaders(req);
    res.setHeader("Access-Control-Allow-Origin", h["Access-Control-Allow-Origin"]);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== "GET") return done(req, res, { error: "Método no permitido" }, 405);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let rss;
    try {
      rss = await fetch(VATICAN_RSS_URL, {
        signal: controller.signal,
        headers: { "user-agent": "LUMEN/1.0 (+https://lumenve.vercel.app)" },
      });
    } finally {
      clearTimeout(timer);
    }
    if (!rss || !rss.ok) {
      return done(req, res, { error: "La fuente no respondió correctamente" }, 502);
    }

    const xml = await rss.text();
    const data = parseEvangelioRss(xml);

    if (!data.readings.some((r) => r.type === "gospel") && !data.reflection.text) {
      return done(req, res, { error: "No se pudo interpretar el evangelio de hoy" }, 502);
    }

    return done(req, res, data);
  } catch (e) {
    console.error("[evangelio]", e && e.name === "AbortError" ? "Timeout al conectar con Vatican News" : e);
    return done(req, res, { error: "No se pudo obtener el evangelio de hoy. Intenta más tarde." }, 502);
  }
}