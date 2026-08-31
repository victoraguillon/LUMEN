// LUMEN · Http handler de notificaciones push (Vercel /api/send-push, Node.js).
// Modos:
//   { mode: 'cron' }          -> GitHub Actions cada 5 min (header x-cron-secret)
//   { mode: 'sw-received' }   -> el Service Worker confirma recibo (pingId)
//   { mode: 'all'  } (JWT admin)  -> aviso del coordinador a todos los suscritos
//   { mode: 'self' } (JWT miembro) -> solo al que invoca

import {
  config,
  getUser,
  getProfile,
  runCron,
  sendAll,
  sendSelf,
  markSwReceived,
} from "./_lib/push.js";

function done(res, body, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(body));
}

function readBody(req) {
  try {
    if (typeof req.body === "string") return JSON.parse(req.body);
    if (req.body && typeof req.body === "object") return req.body;
    return {};
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "authorization, x-cron-secret, content-type");
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== "POST") return done(res, { error: "Método no permitido" }, 405);

  try {
    const body = readBody(req);
    const mode = body.mode;

    if (mode === "cron") {
      const secret = req.headers["x-cron-secret"] || "";
      if (!secret || secret !== config.CRON_SECRET) return done(res, { error: "No autorizado" }, 401);
      return done(res, await runCron());
    }

    if (mode === "sw-received") {
      await markSwReceived(body.pingId, body.ok, body.ua);
      return done(res, { ok: true });
    }

    const token = String(req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");
    if (!token) return done(res, { error: "Se requiere sesión" }, 401);
    const user = await getUser(token);
    const profile = await getProfile(user.id);
    if (!profile || profile.status !== "approved") return done(res, { error: "Perfil no disponible" }, 403);

    const payload = {
      title: String(body.title || "").slice(0, 80),
      body: String(body.body || "").slice(0, 240),
      url: String(body.url || "/").slice(0, 200),
    };

    if (mode === "self") return done(res, await sendSelf(user.id, payload));
    if (mode === "all") {
      if (profile.role !== "admin") return done(res, { error: "Solo coordinadores" }, 403);
      return done(res, await sendAll(payload, body.avisoId));
    }

    return done(res, { error: "Modo desconocido" }, 400);
  } catch (e) {
    console.error("[send-push]", e);
    return done(res, { error: e.message || "Error interno" }, e.status || 500);
  }
}