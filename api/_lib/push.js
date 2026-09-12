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
  SITE_URL = "https://lumenve.vercel.app",
} = process.env;

export const config = { CRON_SECRET, SITE_URL };

// ---------- rate limiting DB-backed + auditoría de seguridad ----------

export async function rateLimit(key, limit, windowS = 3600) {
  try {
    const { data, error } = await sb.rpc("rate_limit_check", {
      p_clave: String(key).slice(0, 200),
      p_limite: limit,
      p_ventana_s: windowS,
    });
    if (error) {
      console.error("[push] rate_limit", error.message);
      return true; // fail-open: un fallo de BD no debe tumbar el servicio
    }
    return data !== false;
  } catch (e) {
    console.error("[push] rate_limit", e.message);
    return true;
  }
}

export async function logSec(tipo, detalle = {}, ip = "", ua = "") {
  try {
    await sb.from("security_logs").insert({ tipo, detalle, ip, ua: String(ua || "").slice(0, 200) });
  } catch (e) {
    console.error("[sec]", tipo, e.message);
  }
}

const VE_TZ = "America/Caracas";

export const sb = SUPABASE_URL ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

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

// Suscripciones de los inscritos a una actividad (o a un conjunto de user_ids).
// Devuelve las suscripciones válidas + el total de usuarios alcanzados.
export async function subsDeInscritos(userIds) {
  const ids = Array.isArray(userIds) ? userIds.filter(Boolean) : [];
  if (ids.length === 0) return { subs: [], conSub: 0 };
  const data = await neg(await sb.from("push_subscriptions").select("endpoint,user_id,keys").in("user_id", ids));
  const subs = (data || []).filter((s) => s.keys && s.keys.p256dh && s.keys.auth);
  return { subs, conSub: new Set(subs.map((s) => s.user_id)).size };
}

// ---------- hora / fecha en Venezuela (independiente del TZ del servidor) ----------

export function veNow(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: VE_TZ,
      hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    })
      .formatToParts(now)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value])
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
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

// ---------- recordatorios: único hito "1 día antes" ----------

export function milestoneDue(ev, nowMs) {
  const inicio = Date.parse(ev.fecha_inicio);
  if (isNaN(inicio)) return null;
  const diff = inicio - nowMs;
  if (diff <= 0) return null;
  const day = 86400000;
  const sent = Array.isArray(ev.notifs_sent) ? ev.notifs_sent : [];
  if (!sent.includes("1day") && diff <= day) {
    const esHoy = new Date(inicio).toDateString() === new Date(nowMs).toDateString();
    return { hito: "1day", texto: esHoy ? `¡Hoy es "${ev.titulo}"! ☀️` : `Mañana es "${ev.titulo}".` };
  }
  return null;
}

// ---------- bitácora (push_logs): cron y recordatorios manuales ----------

async function logPush(tipo, fields = {}) {
  try {
    await sb.from("push_logs").insert({
      tipo,
      evento_id: fields.eventoId || null,
      admin_id: fields.adminId || null,
      target_count: Math.max(0, fields.targetCount || 0),
      sent: fields.sent || 0,
      failed: fields.failed || 0,
      gone: fields.gone || 0,
    });
  } catch (e) {
    console.error("[push] push_logs", e.message);
  }
}

// ---------- recordatorio automático "1 día antes" → solo inscritos ----------

async function enviarRecordatorios(nowMs) {
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

  const totals = { sent: 0, failed: 0, gone: 0 };
  let hits = 0, evCount = 0;
  for (const d of due) {
    const sent = Array.isArray(d.ev.notifs_sent) ? d.ev.notifs_sent : [];
    if (!sent.includes(d.hito)) sent.push(d.hito);
    await sb.from("eventos").update({ notifs_sent: sent }).eq("id", d.ev.id);
    hits++;
    try {
      const rows = await neg(await sb.from("inscripciones").select("user_id").eq("evento_id", d.ev.id));
      const userIds = (rows || []).map((r) => r.user_id);
      if (userIds.length === 0) continue;
      evCount++;
      await neg(
        await sb.from("notificaciones").insert(
          userIds.map((uid) => ({ texto: d.texto, for_admin: false, manual: false, user_id: uid, timestamp: nowMs }))
        )
      );
      const { subs } = await subsDeInscritos(userIds);
      if (subs.length > 0) {
        const r = await pushToSubscriptions(subs, { title: "LUMEN · Recordatorio", body: d.texto.replace(/"/g, ""), url: "/actividades" });
        totals.sent += r.sent;
        totals.failed += r.failed;
        totals.gone += r.gone;
      }
    } catch (e) {
      console.error("[push] recordatorio", e.message);
    }
  }
  return { hits, evCount, ...totals };
}

// ---------- cumpleaños del día (dedup diario vía push_daily) ----------

async function repartirCumpleanos(subs, fechaVE) {
  const ya = await neg(await sb.from("push_daily").select("clave").eq("clave", "cumpleanos").eq("fecha", fechaVE).limit(1));
  if (ya && ya.length > 0) return null;

  const br = await neg(await sb.rpc("cumpleanos_list", { p_dias: 0 }));
  const celeb = (br || []).filter((c) => Number(c.en_dias) === 0);
  if (celeb.length === 0) return { hoy: 0, push: { sent: 0, failed: 0, gone: 0 } };

  const names = celeb.map((c) => c.nombre);
  const texto =
    names.length === 1
      ? `🎉 Hoy cumple años: ${names[0]}. ¡Envíale un saludo!`
      : `🎉 Hoy cumplen años: ${names.join(", ")}. ¡Envíenles un saludo!`;

  await neg(await sb.from("push_daily").insert({ clave: "cumpleanos", fecha: fechaVE }));
  await neg(await sb.from("notificaciones").insert({ texto, for_admin: false, manual: false, timestamp: Date.now() }));
  const r = await pushToSubscriptions(subs, { title: "LUMEN · Cumpleaños 🎉", body: texto.replace(/"/g, ""), url: "/actividades" });
  return { hoy: celeb.length, push: r };
}

// ---------- evangelio 07:00 + devocional 20:00 (hora Venezuela) ----------

async function notificarDiario(subs, ve) {
  // Evangelio del día: 07:00 (ventana de 5 min por si el cron se retrasa).
  if (ve.hour === 7 && ve.minute <= 4) {
    const ya = await neg(await sb.from("push_daily").select("clave").eq("clave", "evangelio").eq("fecha", ve.date).limit(1));
    if (!ya || ya.length === 0) {
      try {
        const resp = await fetch(`${config.SITE_URL}/api/evangelio`, { signal: AbortSignal.timeout(12000) });
        if (resp.ok) {
          const d = await resp.json();
          const gospel = (d.readings || []).find((r) => r.type === "gospel");
          const ref = (gospel && gospel.ref) || (d.reflection && d.reflection.cite) || "la lectura de hoy";
          const excerpt = ((gospel && gospel.text) || d.reflection.text || "")
            .replace(/[“”\"]/g, "")
            .replace(/\s+/g, " ")
            .trim();
          const body = excerpt ? `${ref}: ${excerpt.slice(0, 160)}` : `Hoy te espera la Palabra: ${ref}`;
          await neg(await sb.from("push_daily").insert({ clave: "evangelio", fecha: ve.date }));
          const r = await pushToSubscriptions(subs, { title: "LUMEN · Evangelio del día", body, url: "/evangelio" });
          return { evangelio: r.sent > 0 || r.failed > 0, push: r };
        }
      } catch (e) {
        console.error("[push] evangelio", e.message);
      }
    }
  }

  // Devocional (noche de oración): 20:00.
  if (ve.hour === 20 && ve.minute <= 4) {
    const ya = await neg(await sb.from("push_daily").select("clave").eq("clave", "devocional").eq("fecha", ve.date).limit(1));
    if (!ya || ya.length === 0) {
      await neg(await sb.from("push_daily").insert({ clave: "devocional", fecha: ve.date }));
      const r = await pushToSubscriptions(subs, {
        title: "LUMEN · Devocional",
        body: "Tómate unos minutos para el «Alimento de Hoy» y cierra el día en oración 🙏",
        url: "/devocional",
      });
      return { devocional: r.sent > 0 || r.failed > 0, push: r };
    }
  }

  return null;
}

// ---------- modo cron (GitHub Actions cada 5 min) ----------

export async function runCron() {
  const nowMs = Date.now();
  const ve = veNow(new Date(nowMs));
  const push = { sent: 0, failed: 0, gone: 0 };
  const report = { hits: 0, pendientes: 0, recordatorios: 0, evangelio: false, devocional: false, cumple: { hoy: 0 } };

  // 1) Recordatorios «1 día antes» → inscritos.
  try {
    const rec = await enviarRecordatorios(nowMs);
    report.hits = rec.hits;
    report.recordatorios = rec.evCount;
    push.sent += rec.sent;
    push.failed += rec.failed;
    push.gone += rec.gone;
  } catch (e) {
    console.error("[push] recordatorios", e.message);
  }

  // 2) Avisos manuales pendientes → todos los suscritos.
  let subs = [];
  try { subs = await getSubscriptions(); } catch (e) { console.error("[push] subscriptions", e.message); }

  let pendientes = [];
  try {
    pendientes = await neg(await sb.from("notificaciones").select("id,texto").eq("manual", true).is("pushed_at", null).limit(50));
  } catch (e) { console.error("[push] pendientes", e.message); }
  report.pendientes = (pendientes || []).length;
  if ((pendientes || []).length > 0 && subs.length > 0) {
    const r = await pushToSubscriptions(subs, { title: "LUMEN · Aviso", body: pendientes.map((n) => n.texto.replace(/"/g, "")).join(" · "), url: "/notificaciones" });
    push.sent += r.sent;
    push.failed += r.failed;
    push.gone += r.gone;
    if (r.sent > 0) {
      await sb.from("notificaciones").update({ pushed_at: new Date().toISOString() }).in("id", pendientes.map((n) => n.id));
    }
  }

  // 3) Cumpleaños del día.
  try {
    const celeb = await repartirCumpleanos(subs, ve.date);
    if (celeb) {
      report.cumple.hoy = celeb.hoy;
      push.sent += celeb.push.sent;
      push.failed += celeb.push.failed;
      push.gone += celeb.push.gone;
    }
  } catch (e) { console.error("[push] cumpleaños", e.message); }

  // 4) Evangelio (07:00) y devocional (20:00).
  try {
    const diario = await notificarDiario(subs, ve);
    if (diario) {
      if (diario.evangelio) report.evangelio = true;
      if (diario.devocional) report.devocional = true;
      push.sent += diario.push.sent;
      push.failed += diario.push.failed;
      push.gone += diario.push.gone;
    }
  } catch (e) { console.error("[push] diario", e.message); }

  await logPush("cron", { targetCount: (pendientes || []).length + report.recordatorios + (report.cumple.hoy > 0 ? 1 : 0), ...push });

  return {
    mode: "cron",
    hits: report.hits,
    recordatorios: report.recordatorios,
    pendientes: report.pendientes,
    push,
    cumple: { hoy: report.cumple.hoy },
    diario: { evangelio: report.evangelio, devocional: report.devocional },
    ping: await recientesSinRecibo(60),
  };
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

// ---------- recordatorio manual del coordinador → inscritos de una actividad ----------

export async function sendEventReminder(adminId, eventoId, customBody) {
  if (!eventoId) throw Object.assign(new Error("eventoId requerido"), { status: 400 });
  if (!adminId) throw Object.assign(new Error("adminId requerido"), { status: 403 });

  const ev = await neg(await sb.from("eventos").select("id,titulo,fecha_inicio").eq("id", eventoId).maybeSingle());
  if (!ev) throw Object.assign(new Error("Actividad no encontrada"), { status: 404 });

  const rows = await neg(await sb.from("inscripciones").select("user_id").eq("evento_id", eventoId));
  const userIds = (rows || []).map((r) => r.user_id);
  if (userIds.length === 0) {
    await logPush("evento", { adminId, eventoId, targetCount: 0, sent: 0, failed: 0, gone: 0 });
    return { mode: "evento", inscritos: 0, sent: 0, failed: 0, gone: 0, sin_suscripcion: 0 };
  }

  const fecha = ev.fecha_inicio
    ? new Intl.DateTimeFormat("es-VE", { timeZone: VE_TZ, day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(ev.fecha_inicio))
    : "";
  const texto = customBody && customBody.trim()
    ? customBody.trim()
    : `Recuerda: "${ev.titulo}"${fecha ? ` el ${fecha}` : ""}.`;
  const corto = texto.slice(0, 500);

  await neg(
    await sb.from("notificaciones").insert(
      userIds.map((uid) => ({ texto: corto, for_admin: false, manual: false, user_id: uid, timestamp: Date.now() }))
    )
  );

  const { subs, conSub } = await subsDeInscritos(userIds);
  const entrega = { sent: 0, failed: 0, gone: 0 };
  if (subs.length > 0) {
    const r = await pushToSubscriptions(subs, { title: "LUMEN · Recordatorio", body: corto.replace(/"/g, ""), url: "/actividades" });
    entrega.sent = r.sent;
    entrega.failed = r.failed;
    entrega.gone = r.gone;
  }

  await logPush("evento", { adminId, eventoId, targetCount: userIds.length, ...entrega });

  return { mode: "evento", inscritos: userIds.length, ...entrega, sin_suscripcion: userIds.length - conSub };
}