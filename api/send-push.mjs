// LUMEN · Http handler de notificaciones push (Vercel /api/send-push, Node.js).
// Modos:
//   { mode: 'cron' }          -> GitHub Actions cada 5 min (header x-cron-secret)
//   { mode: 'sw-received' }   -> el Service Worker confirma recibo (pingId)
//   { mode: 'all'  } (JWT admin)  -> aviso del coordinador a todos los suscritos
//   { mode: 'self' } (JWT miembro) -> solo al que invoca
//
// Rate limiting DB-backed (public.rate_limit_check) + auditoría en security_logs.

import {
  config,
  getUser,
  getProfile,
  runCron,
  sendAll,
  sendSelf,
  sendEventReminder,
  markSwReceived,
  rateLimit,
  logSec,
} from "./_lib/push.js";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", config.SITE_URL);
  res.setHeader("Vary", "Origin");
}

function done(res, body, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  cors(res);
  res.end(JSON.stringify(body));
}

function readBody(req) {
  if (req.body && typeof req.body === "string") {
    try { return Promise.resolve(JSON.parse(req.body)); } catch { return Promise.resolve({}); }
  }
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => { raw += c; });
    req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch { resolve({}); } });
  });
}

function clientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim() || "n/a";
  return req.socket && req.socket.remoteAddress || "n/a";
}

export default async function handler(req, res) {
  const ip = clientIp(req);
  const ua = String(req.headers["user-agent"] || "");

  if (req.method === "OPTIONS") {
    cors(res);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "authorization, x-cron-secret, content-type");
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== "POST") return done(res, { error: "Método no permitido" }, 405);

  // Guarda por IP: acota aquí cualquier abuso, con o sin sesión.
  if (!(await rateLimit(`ip:${ip}`, 300))) {
    await logSec("throttle_ip", { clave: `ip:${ip}` }, ip, ua);
    return done(res, { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." }, 429);
  }

  try {
    const body = await readBody(req);
    const mode = body.mode;

    if (mode === "cron") {
      const secret = req.headers["x-cron-secret"] || "";
      if (!secret || secret !== config.CRON_SECRET) {
        await logSec("cron_unauthorized", {}, ip, ua);
        return done(res, { error: "No autorizado" }, 401);
      }
      return done(res, await runCron());
    }

    if (mode === "sw-received") {
      if (!(await rateLimit(`swck:${ip}`, 120))) {
        await logSec("throttle_sw", { clave: `swck:${ip}` }, ip, ua);
        return done(res, { error: "Demasiados recibos. Intenta de nuevo más tarde." }, 429);
      }
      await markSwReceived(body.pingId, body.ok, body.ua);
      return done(res, { ok: true });
    }

    const token = String(req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");
    if (!token) {
      await logSec("no_token", { mode }, ip, ua);
      return done(res, { error: "Se requiere sesión" }, 401);
    }
    let user;
    try {
      user = await getUser(token);
    } catch (e) {
      await logSec("invalid_token", { mode, detail: e.message }, ip, ua);
      return done(res, { error: "Sesión inválida" }, 401);
    }
    const profile = await getProfile(user.id);
    if (!profile || profile.status !== "approved") {
      await logSec("forbidden_profile", { uid: user.id, mode }, ip, ua);
      return done(res, { error: "Perfil no disponible" }, 403);
    }

    const payload = {
      title: String(body.title || "").slice(0, 80),
      body: String(body.body || "").slice(0, 240),
      url: String(body.url || "/").slice(0, 200),
    };

    if (mode === "self") {
      if (!(await rateLimit(`self:${user.id}`, 20))) {
        await logSec("throttle_self", { uid: user.id }, ip, ua);
        return done(res, { error: "Demasiados envíos de prueba. Intenta de nuevo más tarde." }, 429);
      }
      return done(res, await sendSelf(user.id, payload));
    }
    if (mode === "all") {
      if (profile.role !== "admin") {
        await logSec("forbidden_all", { uid: user.id }, ip, ua);
        return done(res, { error: "Solo coordinadores" }, 403);
      }
      if (!(await rateLimit(`all:${user.id}`, 5))) {
        await logSec("throttle_all", { uid: user.id }, ip, ua);
        return done(res, { error: "Has alcanzado el límite de avisos por hora." }, 429);
      }
      return done(res, await sendAll(payload, body.avisoId));
    }
    if (mode === "evento") {
      if (profile.role !== "admin") {
        await logSec("forbidden_evento", { uid: user.id }, ip, ua);
        return done(res, { error: "Solo coordinadores" }, 403);
      }
      if (!(await rateLimit(`evento:${user.id}`, 10))) {
        await logSec("throttle_evento", { uid: user.id }, ip, ua);
        return done(res, { error: "Has alcanzado el límite de recordatorios por hora." }, 429);
      }
      return done(res, await sendEventReminder(user.id, body.eventoId, payload.body));
    }

    await logSec("unknown_mode", { mode }, ip, ua);
    return done(res, { error: "Modo desconocido" }, 400);
  } catch (e) {
    console.error("[send-push]", e);
    return done(res, { error: "Error interno. Inténtalo de nuevo." }, e.status || 500);
  }
}