// LUMEN · Núcleo de notificaciones push (Node.js).
// Toda la parte delicada (cifrado AES-128-GCM + autenticación VAPID ES256)
// la resuelve el paquete oficial "web-push". Aquí solo queda la lógica:
// leer suscripciones de Supabase, entregar y registrar el recibo.
//
// Variables de entorno (Vercel o .env para local):
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, CRON_SECRET

import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const {
  SUPABASE_URL = "",
  SUPABASE_ANON_KEY = "",
  SUPABASE_SERVICE_ROLE_KEY = "",
  VAPID_PUBLIC_KEY = "",
  VAPID_PRIVATE_KEY = "",
  CRON_SECRET = "",
  VAPID_SUBJECT = "mailto:juvemar08@gmail.com",
} = process.env;

export const config = { CRON_SECRET };

export const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const neg = (r) => (r.error ? Promise.reject(new Error(r.error.message)) : Promise.resolve(r.data));
const endpoint = (s) => {
  try { return new URL(s.endpoint).host + "…" + String(s.endpoint).slice(-16); } catch { return String(s.endpoint || "").slice(-24); }
};

// ---------- acceso ----------

export async function getUser(token) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw Object.assign(new Error("Sesión inválida"), { status: 401 });
  return data.user;
}

export async function getProfile(userId) {
  return neg(await sb.from("profiles").select("id,role,status").eq("id", userId).maybeSingle());
}

export async function getSubscriptions() {
  const data = await neg(
    await sb
      .from("push_subscriptions")
      .select("endpoint,user_id,keys,profiles!inner(role,status)")
      .in("profiles.role", ["miembro", "admin"])
      .eq("profiles.status", "approved")
  );
  return (data || []).filter((s) => s.keys && s.keys.p256dh && s.keys.auth);
}

export async function getMySubscriptions(userId) {
  const data = await neg(await sb.from("push_subscriptions").select("endpoint,user_id,keys").eq("user_id", userId));
  return (data || []).filter((s) => s.keys && s.keys.p256dh && s.keys.auth);
}

// ---------- entrega ----------

async function deliverOne(subscription, payload) {
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: subscription.keys },
      JSON.stringify(payload),
      { TTL: 28800, urgency: "normal" }
    );
    return { ok: true };
  } catch (e) {
    if (e && e.statusCode === 404 || e && e.statusCode === 410) {
      await sb.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
      return { ok: false, gone: true };
    }
    return { ok: false, status: e && e.statusCode };
  }
}

export async function pushToSubscriptions(subs, payload) {
  let sent = 0, failed = 0, gone = 0;
  for (const s of subs) {
    const pingId = crypto.randomUUID();
    const r = await deliverOne(s, { ...payload, pingId });
    if (r.ok) {
      sent++;
      try { await sb.from("push_pings").insert({ ping_id: pingId, endpoint: s.endpoint }); } catch (e) { console.error("[push] ping", e.message); }
    } else if (r.gone) {
      gone++;
    } else {
      failed++;
      console.warn("[push] rechazado", r.status, endpoint(s));
    }
  }
  return { sent, failed, gone };
}

// ---------- diagnóstico: el Service Worker confirma el recibo ----------

export async function markSwReceived(pingId, ok, ua) {
  if (!pingId) throw Object.assign(new Error("pingId requerido"), { status: 400 });
  return neg(
    await sb
      .from("push_pings")
      .update({ recibido_at: new Date().toISOString(), render_ok: ok !== false, ua: String(ua || "").slice(0, 200) })
      .eq("ping_id", String(pingId))
      .is("recibido_at", null)
  );
}

export async function recientesSinRecibo(min = 60) {
  try {
    const since = new Date(Date.now() - min * 60000).toISOString();
    const data = await neg(
      await sb
        .from("push_pings")
        .select("creado_at,recibido_at,render_ok,ua,endpoint")
        .gte("creado_at", since)
        .order("creado_at", { ascending: false })
        .limit(50)
    );
    const list = data || [];
    return {
      esperados: list.length,
      recibidos: list.filter((p) => p.recibido_at).length,
      detalle: list.map((p) => ({ t: p.creado_at, rec: !!p.recibido_at, render: p.render_ok === true, ua: p.ua || "", ep: endpoint(p) })),
    };
  } catch (e) {
    return { esperados: 0, recibidos: 0, error: e.message };
  }
}

// ---------- recordatorios 5d / 1d / 1h ----------

export function milestoneDue(ev, nowMs) {
  const inicio = Date.parse(ev.fecha_inicio);
  if (isNaN(inicio)) return null;
  const diff = inicio - nowMs;
  if (diff <= 0) return null;
  const day = 86400000, hour = 3600000;
  const days = diff / day, hours = diff / hour;
  const sent = Array.isArray(ev.notifs_sent) ? ev.notifs_sent : [];
  if (!sent.includes("5days") && days > 1 && days <= 5) {
    const n = Math.ceil(days);
    return { hito: "5days", texto: `Recuerda: "${ev.titulo}" es en ${n} día${n === 1 ? "" : "s"}.` };
  }
  if (!sent.includes("1day") && hours > 1 && days <= 1) {
    const esHoy = new Date(inicio).toDateString() === new Date(nowMs).toDateString();
    return { hito: "1day", texto: esHoy ? `¡Hoy es "${ev.titulo}"! ☀️` : `Mañana es "${ev.titulo}".` };
  }
  if (!sent.includes("1hour") && hours <= 1) return { hito: "1hour", texto: `¡ATENCIÓN! "${ev.titulo}" en 1 hora.` };
  return null;
}

// ---------- modo cron (GitHub Actions cada 5 min) ----------

export async function runCron() {
  const nowMs = Date.now();

  const eventos = await neg(
    await sb
      .from("eventos")
      .select("id,titulo,fecha_inicio,notifs_sent")
      .eq("tipo", "unico")
      .not("fecha_inicio", "is", null)
      .limit(300)
  );
  const due = [];
  for (const ev of eventos || []) {
    const m = milestoneDue(ev, nowMs);
    if (m) due.push({ ev, ...m });
  }

  let hits = 0;
  if (due.length > 0) {
    await neg(
      await sb.from("notificaciones").insert(due.map((d) => ({ texto: d.texto, for_admin: false, manual: false, timestamp: nowMs })))
    );
    for (const d of due) {
      const sent = Array.isArray(d.ev.notifs_sent) ? d.ev.notifs_sent : [];
      if (!sent.includes(d.hito)) sent.push(d.hito);
      await sb.from("eventos").update({ notifs_sent: sent }).eq("id", d.ev.id);
    }
    hits = due.length;
  }

  const pendientes = await neg(
    await sb.from("notificaciones").select("id,texto").eq("manual", true).is("pushed_at", null).limit(50)
  );

  const subs = await getSubscriptions();
  const push = { sent: 0, failed: 0, gone: 0 };

  if (due.length > 0) {
    const r = await pushToSubscriptions(subs, { title: "LUMEN · Recordatorio", body: due.map((d) => d.texto.replace(/"/g, "")).join(" · "), url: "/actividades" });
    Object.assign(push, r);
  }

  if ((pendientes || []).length > 0) {
    const r = await pushToSubscriptions(subs, { title: "LUMEN · Aviso", body: pendientes.map((n) => n.texto.replace(/"/g, "")).join(" · "), url: "/notificaciones" });
    push.sent += r.sent;
    push.failed += r.failed;
    push.gone += r.gone;
    if (r.sent > 0) {
      await sb.from("notificaciones").update({ pushed_at: new Date().toISOString() }).in("id", pendientes.map((n) => n.id));
    }
  }

  const cumple = { hoy: 0, push: { sent: 0, failed: 0, gone: 0 } };
  try {
    const br = await neg(await sb.rpc("cumpleanos_list", { p_dias: 0 }));
    const celeb = (br || []).filter((c) => Number(c.en_dias) === 0);
    if (celeb.length > 0) {
      const names = celeb.map((c) => c.nombre);
      const texto =
        names.length === 1
          ? `🎉 Hoy cumple años: ${names[0]}. ¡Envíale un saludo!`
          : `🎉 Hoy cumplen años: ${names.join(", ")}. ¡Envíenles un saludo!`;
      const inicioDelDia = new Date();
      inicioDelDia.setHours(0, 0, 0, 0);
      const dup = await neg(
        await sb.from("notificaciones").select("id").eq("texto", texto).gte("timestamp", inicioDelDia.getTime()).limit(1)
      );
      if (!dup || dup.length === 0) {
        await neg(await sb.from("notificaciones").insert({ texto, for_admin: false, manual: false, timestamp: Date.now() }));
        const r = await pushToSubscriptions(subs, { title: "LUMEN · Cumpleaños 🎉", body: texto.replace(/"/g, ""), url: "/actividades" });
        cumple.hoy = celeb.length;
        Object.assign(cumple.push, r);
      } else {
        cumple.hoy = 0;
      }
    }
  } catch (e) {
    console.error("[send-push] cumpleaños", e.message);
  }

  return { mode: "cron", hits, pendientes: (pendientes || []).length, push, cumple, ping: await recientesSinRecibo(60) };
}

// ---------- envíos solicitados por la app ----------

export async function sendAll(payload, avisoId) {
  const subs = await getSubscriptions();
  const res = await pushToSubscriptions(subs, {
    title: payload.title || "LUMEN · Aviso",
    body: payload.body || "",
    url: payload.url || "/notificaciones",
  });
  if (avisoId && res.sent > 0) {
    await sb.from("notificaciones").update({ pushed_at: new Date().toISOString() }).eq("id", avisoId);
  }
  return { mode: "all", ...res };
}

export async function sendSelf(userId, payload) {
  const subs = await getMySubscriptions(userId);
  if (subs.length === 0) return { mode: "self", sent: 0, failed: 0, gone: 0, reason: "no-subscription" };
  const res = await pushToSubscriptions(subs, { title: payload.title || "", body: payload.body || "", url: payload.url || "/actividades" });
  return { mode: "self", ...res };
}