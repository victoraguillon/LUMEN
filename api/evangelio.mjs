// LUMEN · /api/evangelio — Evangelio del día desde Vatican News.
// Proxy server-side (Node.js, sin deps): evita CORS del navegador, normaliza
// el RSS y devuelve JSON. Las copias se cachean por el Service Worker
// (network-first) y por edge (s-maxage) para caber offline.
import { VATICAN_RSS_URL, parseEvangelioRss } from "./_lib/evangelio-parser.mjs";

const FETCH_TIMEOUT_MS = 10000;
const SITE_URL = "https://lumenve.vercel.app";
// Orígenes de desarrollo donde el frontend puede abrirse y consumir la API.
const DEV_ORIGINS = new Set([
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3133",
  "http://127.0.0.1:3133",
]);

function corsOrigin(req) {
  const origin = (req.headers.origin || "").trim();
  if (!origin) return SITE_URL;
  return DEV_ORIGINS.has(origin) ? origin : SITE_URL;
}

function applyCors(res, req) {
  const origin = corsOrigin(req);
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
}

function done(res, req, body, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  applyCors(res, req);
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=86400");
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    applyCors(res, req);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== "GET") return done(res, req, { error: "Método no permitido" }, 405);

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
      return done(res, req, { error: "La fuente no respondió correctamente" }, 502);
    }

    const xml = await rss.text();
    const data = parseEvangelioRss(xml);

    if (!data.readings.some((r) => r.type === "gospel") && !data.reflection.text) {
      return done(res, req, { error: "No se pudo interpretar el evangelio de hoy" }, 502);
    }

    return done(res, req, data);
  } catch (e) {
    console.error("[evangelio]", e && e.name === "AbortError" ? "Timeout al conectar con Vatican News" : e);
    return done(res, req, { error: "No se pudo obtener el evangelio de hoy. Intenta más tarde." }, 502);
  }
}