// ============================================================
// LUMEN - Edge Function: send-push (Web Push real a teléfonos)
// Desplegar: supabase functions deploy send-push --no-verify-jwt
// Secretos (supabase secrets set ...):
//   VAPID_PUBLIC_KEY  = clave pública VAPID (base64url, 65 bytes con prefijo 0x04)
//   VAPID_PRIVATE_KEY = clave privada VAPID (base64url, 32 bytes, JWK d)
//   CRON_SECRET       = secreto compartido para el modo cron
// Roles:
//   { mode: 'self' } (JWT membro)  -> push solo al que invoca
//   { mode: 'all'  } (JWT admin)   -> push a todos los suscritos
//   { mode: 'cron' } (x-cron-secret) -> hitos 5d/1d/1h programados (dedupe via notifs_sent)
// Cifrado: RFC 8188 aes128gcm, claves ECDH P-256 + auth secret (validado contra RFC 8291 Apéndice A).
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const enc = new TextEncoder();
const dec = new TextDecoder();

// ---------- utilidades base64url ----------
function b64urlEncode(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function concat(...arrays) {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of arrays) { out.set(a, off); off += a.length; }
  return out;
}

// ---------- configuración ----------
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const VAPID_PUB = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIV = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const CRON_SECRET = Deno.env.get("CRON_SECRET") || "";
const VAPID_SUBJECT = "mailto:juvemar08@gmail.com";
const MAX_PAYLOAD = 3500;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" },
  });
}
function corsPreflight() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "authorization, x-cron-secret, content-type" } });
}

// ---------- VAPID JWT (ES256) ----------
async function buildVapidJwk() {
  const raw = b64urlDecode(VAPID_PUB);
  if (raw.length !== 65 || raw[0] !== 0x04) throw new Error("VAPID_PUBLIC_KEY inválida: debe ser punto P-256 sin comprimir de 65 bytes (prefijo 0x04)");
  return {
    kty: "EC",
    crv: "P-256",
    x: b64urlEncode(raw.subarray(1, 33)),
    y: b64urlEncode(raw.subarray(33, 65)),
    d: VAPID_PRIV,
    ext: true,
  };
}
async function signVapid(aud) {
  const jwk = await buildVapidJwk();
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const header = { alg: "ES256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  // aud = origen del push service al que entregamos. Apple (web.push.apple.com),
  // FCM (fcm.googleapis.com) y Mozilla (push.mozilla.org) lo exigen exacto.
  const payload = { aud: aud || "https://fcm.googleapis.com", exp: now + 12 * 3600, sub: VAPID_SUBJECT };
  const token = `${b64urlEncode(enc.encode(JSON.stringify(header)))}.${b64urlEncode(enc.encode(JSON.stringify(payload)))}`;
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(token));
  return `${token}.${b64urlEncode(new Uint8Array(sig))}`;
}

// ---------- cifrado Web Push (RFC 8291 / RFC 8188) ----------
async function encryptPush(sub, payloadText) {
  const uaPublicRaw = b64urlDecode(sub.keys.p256dh);
  if (uaPublicRaw.length !== 65) throw new Error("p256dh inválida");
  const uaKeyJwk = { kty: "EC", crv: "P-256", x: b64urlEncode(uaPublicRaw.subarray(1, 33)), y: b64urlEncode(uaPublicRaw.subarray(33, 65)), ext: true };
  const uaPublicKey = await crypto.subtle.importKey("jwk", uaKeyJwk, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ecdh = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asJwk = await crypto.subtle.exportKey("jwk", ecdh.publicKey);
  const asPublicRaw = concat(Uint8Array.of(0x04), b64urlDecode(asJwk.x), b64urlDecode(asJwk.y));

  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaPublicKey }, ecdh.privateKey, 256));
  const authSecret = b64urlDecode(sub.keys.auth);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const hkdfKey1 = await crypto.subtle.importKey("raw", shared, "HKDF", false, ["deriveBits"]);
  const keyInfo = concat(enc.encode("WebPush: info"), Uint8Array.of(0x00), uaPublicRaw, asPublicRaw);
  const IKM = new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: authSecret, info: keyInfo }, hkdfKey1, 256));

  const hkdfKey2 = await crypto.subtle.importKey("raw", IKM, "HKDF", false, ["deriveBits"]);
  const CEK = new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info: enc.encode("Content-Encoding: aes128gcm\u0000") }, hkdfKey2, 128));
  const NONCE = new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info: enc.encode("Content-Encoding: nonce\u0000") }, hkdfKey2, 96));

  const rs = 4096;
  const rsBuf = new Uint8Array(4);
  new DataView(rsBuf.buffer).setUint32(0, rs);
  const header = concat(salt, rsBuf, Uint8Array.of(65), asPublicRaw); // 86 bytes

  const gcmKey = await crypto.subtle.importKey("raw", CEK, { name: "AES-GCM" }, false, ["encrypt"]);
  const padded = concat(enc.encode(payloadText), Uint8Array.of(0x02));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: NONCE, additionalData: header, tagLength: 128 }, gcmKey, padded));
  return concat(header, ciphertext);
}

// ---------- envío HTTP al push service ----------
async function deliver(sub) {
  let payloadText;
  try {
    payloadText = JSON.stringify(sub.payload);
    if (payloadText.length > MAX_PAYLOAD) payloadText = JSON.stringify({ title: sub.payload.title, body: "", url: sub.payload.url });
  } catch { payloadText = "{}"; }
  const body = await encryptPush(sub, payloadText);
  const jwt = await signVapid(new URL(sub.endpoint).origin);
  const res = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${jwt}, k=${VAPID_PUB}`,
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "28800",
    },
    body,
  });
  if (res.status === 404 || res.status === 410) return { ok: false, gone: true };
  if (res.status >= 200 && res.status < 300) return { ok: true };
  console.error("[send-push] entrega rechazada", res.status, new URL(sub.endpoint).host);
  return { ok: false, status: res.status };
}

// ---------- cómputo de hitos de recordatorio ----------
function milestoneDue(ev, nowMs) {
  const inicio = Date.parse(ev.fecha_inicio);
  if (isNaN(inicio)) return null;
  const diffMs = inicio - nowMs;
  if (diffMs <= 0) return null;
  const day = 86400000, hour = 3600000;
  const days = diffMs / day, hours = diffMs / hour;
  const sent = Array.isArray(ev.notifs_sent) ? ev.notifs_sent : [];
  if (!sent.includes("5days") && days > 1 && days <= 5) return { hito: "5days", texto: `Recuerda: "${ev.titulo}" es en 5 días.` };
  if (!sent.includes("1day") && hours > 1 && days <= 1) {
    const esHoy = new Date(inicio).toDateString() === new Date(nowMs).toDateString();
    return { hito: "1day", texto: esHoy ? `¡Hoy es "${ev.titulo}"! ☀️` : `Mañana es "${ev.titulo}".` };
  }
  if (!sent.includes("1hour") && hours <= 1) return { hito: "1hour", texto: `¡ATENCIÓN! "${ev.titulo}" en 1 hora.` };
  return null;
}

// ---------- push a un conjunto de suscripciones ----------
async function pushToSubscriptions(subs, payload) {
  let sent = 0, failed = 0, gone = 0;
  for (const s of subs) {
    try {
      const r = await deliver({ endpoint: s.endpoint, keys: s.keys, payload });
      if (r.ok) sent++;
      else if (r.gone) { gone++; await sb.from("push_subscriptions").delete().eq("endpoint", s.endpoint); }
      else failed++;
    } catch (e) {
      failed++;
      console.error("[send-push] deliver error", e);
    }
  }
  return { sent, failed, gone };
}

// ---------- modo cron: hitos 5d/1d/1h + avisos pendientes ----------
async function runCron() {
  const nowMs = Date.now();

  // A) Hitos de recordatorio (5d / 1d / 1h)
  const { data: eventos, error: evErr } = await sb
    .from("eventos")
    .select("id,titulo,fecha_inicio,notifs_sent")
    .eq("tipo", "unico")
    .not("fecha_inicio", "is", null)
    .limit(300);
  if (evErr) throw new Error("eventos: " + evErr.message);

  const due = [];
  for (const ev of eventos || []) {
    const m = milestoneDue(ev, nowMs);
    if (m) due.push({ ev, ...m });
  }

  let hits = 0;
  if (due.length > 0) {
    const avisos = due.map((d) => ({ texto: d.texto, for_admin: false, manual: false, timestamp: nowMs }));
    const { error: notifErr } = await sb.from("notificaciones").insert(avisos);
    if (notifErr) throw new Error("notificaciones: " + notifErr.message);

    for (const d of due) {
      const sent = Array.isArray(d.ev.notifs_sent) ? d.ev.notifs_sent : [];
      if (!sent.includes(d.hito)) sent.push(d.hito);
      await sb.from("eventos").update({ notifs_sent: sent }).eq("id", d.ev.id);
    }
    hits = due.length;
  }

  // B) Avisos del coordinador pendientes (manual=true, aún sin push)
  //    Fallback robusto: si el admin envió el aviso sin estar conectado,
  //    este cron lo entrega (GitHub Actions cada ~5 min, sin pg_net).
  const { data: pendientes, error: pendErr } = await sb
    .from("notificaciones")
    .select("id,texto")
    .eq("manual", true)
    .is("pushed_at", null)
    .limit(50);
  if (pendErr) throw new Error("pendientes: " + pendErr.message);

  const subs = await listSubscriptions();
  let push = { sent: 0, failed: 0, gone: 0 };

  if (due.length > 0) {
    push = await pushToSubscriptions(subs, { title: "LUMEN · Recordatorio", body: due.map((d) => d.texto.replace(/"/g, "")).join(" · "), url: "/actividades" });
  }

  if ((pendientes || []).length > 0) {
    const body = pendientes.map((n) => n.texto.replace(/"/g, "")).join(" · ");
    const r = await pushToSubscriptions(subs, { title: "LUMEN · Aviso", body, url: "/notificaciones" });
    push.sent += r.sent; push.failed += r.failed; push.gone += r.gone;
    if (r.sent > 0) {
      await sb.from("notificaciones").update({ pushed_at: new Date().toISOString() }).in("id", pendientes.map((n) => n.id));
    }
  }

  return { mode: "cron", hits, pendientes: (pendientes || []).length, push };
}

async function listSubscriptions() {
  const { data, error } = await sb
    .from("push_subscriptions")
    .select("endpoint,user_id,keys,profiles!inner(role,status)")
    .in("profiles.role", ["miembro", "admin"])
    .eq("profiles.status", "approved");
  if (error) throw new Error("push_subscriptions: " + error.message);
  return (data || [])
    .filter((s) => s && s.keys && s.keys.p256dh && s.keys.auth)
    .map((s) => ({ user_id: s.user_id, endpoint: s.endpoint, keys: s.keys }));
}

// ---------- verificación de usuario mediante JWT ----------
async function getUser(token) {
  const authClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") || "", {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await authClient.auth.getUser();
  if (error || !data.user) throw Object.assign(new Error("Sesión inválida"), { status: 401 });
  return data.user;
}

// ---------- handler ----------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsPreflight();
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    let body = {};
    try { body = await req.json(); } catch { /* cuerpo opcional */ }
    const mode = body.mode;

    if (mode === "cron") {
      const secret = req.headers.get("x-cron-secret") || "";
      if (secret !== CRON_SECRET) return json({ error: "No autorizado" }, 401);
      if (!secret) return json({ error: "CRON_SECRET no configurado" }, 500);
      const result = await runCron();
      return json(result);
    }

    const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Se requiere sesión" }, 401);
    const user = await getUser(token);

    const { data: profile } = await sb.from("profiles").select("id,role,status,push_subscription").eq("id", user.id).maybeSingle();
    if (!profile || profile.status !== "approved") return json({ error: "Perfil no disponible" }, 403);

    const title = String(body.title || "").slice(0, 80);
    const text = String(body.body || "").slice(0, 240);
    const url = String(body.url || "/").slice(0, 200);

    if (mode === "self") {
      const { data: mine } = await sb
        .from("push_subscriptions")
        .select("endpoint,user_id,keys")
        .eq("user_id", user.id);
      const mineOk = (mine || []).filter((s) => s && s.keys && s.keys.p256dh && s.keys.auth);
      if (mineOk.length === 0) return json({ mode: "self", sent: 0, reason: "no-subscription" });
      const res = await pushToSubscriptions(mineOk, { title, body: text, url });
      return json({ mode: "self", ...res });
    }

    if (mode === "all") {
      if (profile.role !== "admin") return json({ error: "Solo coordinadores" }, 403);
      const subs = await listSubscriptions();
      const res = await pushToSubscriptions(subs, { title: title || "LUMEN · Aviso", body: text, url });
      // Marcar el aviso como enviado (dedupe con el flujo cron de GitHub Actions)
      const avisoId = body.avisoId;
      if (avisoId && res.sent > 0) {
        try { await sb.from("notificaciones").update({ pushed_at: new Date().toISOString() }).eq("id", avisoId); } catch (e) { /* best-effort */ }
      }
      return json({ mode: "all", ...res });
    }

    return json({ error: "Modo desconocido" }, 400);
  } catch (e) {
    console.error("[send-push]", e);
    return json({ error: e.message || "Error interno" }, e.status || 500);
  }
});