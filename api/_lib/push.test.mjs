import { test } from 'node:test';
import assert from 'node:assert/strict';
import { milestoneDue, rachaDue, rachaPayload, rolesForAudience, veNow } from './push.js';

const HOUR = 3600000;
const now = () => Date.now();
const en = (h) => new Date(now() + h * HOUR).toISOString();

test('milestoneDue: solo queda el hito 1 día antes', () => {
  assert.equal(milestoneDue({ titulo: 'Retiro', fecha_inicio: en(25) }, now()), null, 'más de 24h no dispara');
  assert.equal(milestoneDue({ titulo: 'Retiro', fecha_inicio: en(-1) }, now()), null, 'pasado no dispara');
  assert.equal(milestoneDue({ titulo: 'Retiro', fecha_inicio: 'no-valida' }, now()), null, 'fecha inválida no dispara');
});

test('milestoneDue: dispara una sola vez (notifs_sent)', () => {
  const ev = { titulo: 'Retiro', fecha_inicio: en(20), notifs_sent: [] };
  const m = milestoneDue(ev, now());
  assert.ok(m, 'dentro de 24h dispara');
  assert.equal(m.hito, '1day');
  assert.match(m.texto, /Retiro/);

  ev.notifs_sent = ['1day'];
  assert.equal(milestoneDue(ev, now()), null, 'ya enviado no re-dispara');
});

test('milestoneDue: notifs_sent ausente se trata como vacío', () => {
  const m = milestoneDue({ titulo: 'Misión', fecha_inicio: en(3) }, now());
  assert.ok(m && m.hito === '1day');
});

test('veNow: convierte a hora de Venezuela (UTC-4)', () => {
  const v = veNow(new Date('2026-09-11T11:00:00.000Z'));
  assert.equal(v.date, '2026-09-11');
  assert.equal(v.hour, 7);
  assert.equal(v.minute, 0);
});

test('veNow: cruce de fecha por UTC-4', () => {
  assert.equal(veNow(new Date('2026-09-11T23:30:00.000Z')).date, '2026-09-11');
  assert.equal(veNow(new Date('2026-09-11T23:30:00.000Z')).hour, 19);
  assert.equal(veNow(new Date('2026-09-12T01:30:00.000Z')).date, '2026-09-11');
  assert.equal(veNow(new Date('2026-09-12T04:30:00.000Z')).hour, 0, 'medianoche en VE');
});

test('rolesForAudience: cumpleaños excluye global; racha lo incluye', () => {
  assert.deepEqual(rolesForAudience('members'), ['miembro', 'admin']);
  assert.ok(!rolesForAudience('members').includes('global'));
  assert.deepEqual(rolesForAudience('all'), ['global', 'miembro', 'admin']);
  assert.ok(rolesForAudience('all').includes('global'));
});

test('rachaDue: solo desde las 18:00 y con recuperación hasta las 21:00', () => {
  const ve = (hour) => ({ date: '2026-10-25', hour, minute: 0 });
  assert.equal(rachaDue(ve(17)), false);
  assert.equal(rachaDue(ve(18)), true);
  assert.equal(rachaDue(ve(19)), true);
  assert.equal(rachaDue(ve(21)), true);
  assert.equal(rachaDue(ve(22)), false);
  assert.equal(rachaDue(ve(18), true), false, 'ya enviada no re-dispara');
});

test('rachaPayload: usa el conteo exacto y distingue si ya completó hoy', () => {
  const pendiente = rachaPayload({ days: 4, last_date: '2026-10-24' }, '2026-10-25');
  assert.equal(pendiente.title, 'LUMEN · Tu racha');
  assert.equal(pendiente.tag, 'lumen-racha');
  assert.match(pendiente.body, /Llevas 4 días de racha/);
  assert.match(pendiente.body, /llegar a 5/);

  const hecho = rachaPayload({ days: 4, last_date: '2026-10-25' }, '2026-10-25');
  assert.match(hecho.body, /Llevas 4 días de racha/);
  assert.match(hecho.body, /Ya completaste hoy/);

  const singular = rachaPayload({ days: 1, last_date: '2026-10-24' }, '2026-10-25');
  assert.match(singular.body, /Llevas 1 día de racha/);
  assert.match(singular.body, /llegar a 2/);
});

test('rachaPayload: sin fila o con racha rota usa un mensaje genérico', () => {
  for (const streak of [null, { days: 4, last_date: '2026-10-20' }]) {
    const p = rachaPayload(streak, '2026-10-25');
    assert.match(p.body, /Completa tu práctica de hoy/);
    assert.doesNotMatch(p.body, /Llevas/);
  }
});