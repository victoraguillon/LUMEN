// LUMEN · Servidor local de desarrollo (app estática + APIs, sin dependencias de Vercel).
// Uso:  node scripts/static.mjs [puerto]   (por defecto 3000)
import "dotenv/config";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, normalize, extname } from "node:path";
import { fileURLToPath } from "node:url";
import evangelioHandler from "../api/evangelio.mjs";
import pushHandler from "../api/send-push.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const PORT = Number(process.env.PORT || process.argv[2] || 3000);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".txt": "text/plain; charset=utf-8",
};

createServer(async (req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.statusCode = 400;
    res.end("Bad Request");
    return;
  }
  // API de notificaciones push (mismo handler que Vercel), para probar el
  // flujo completo en local: /api/send-push (POST).
  if (pathname === "/api/send-push") {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      req.body = raw ? raw : undefined;
      pushHandler(req, res);
    });
    return;
  }
  // Endpoint de la vista Evangelio del día (mismo handler que Vercel), para
  // probar el flujo completo en local: /api/evangelio -> Vatican News -> JSON.
  if (pathname === "/api/evangelio") {
    req.body = req.body || undefined;
    return evangelioHandler(req, res);
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }
  if (pathname === "/") pathname = "/index.html";
  const filePath = normalize(join(ROOT, pathname));
  if (!filePath.startsWith(ROOT)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("not a file");
    const data = await readFile(filePath);
    res.statusCode = 200;
    res.setHeader("Content-Type", MIME[extname(filePath).toLowerCase()] || "application/octet-stream");
    res.setHeader("Content-Length", data.length);
    if (req.method === "HEAD") return res.end();
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Not Found");
  }
}).listen(PORT, () => {
  console.log(`LUMEN estático en http://localhost:${PORT}`);
});