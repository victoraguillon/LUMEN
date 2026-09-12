import { test } from 'node:test';
import assert from 'node:assert/strict';
import { milestoneDue, veNow } from './push.js';

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