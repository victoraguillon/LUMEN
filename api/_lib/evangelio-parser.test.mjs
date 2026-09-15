import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEvangelioRss } from './evangelio-parser.mjs';

function item(title, guid, body) {
  return `<item><title>${title}</title>` +
    `<guid>${guid}</guid>` +
    `<description><![CDATA[\n${body}\n]]></description></item>`;
}

const SUNDAY = item(
  'Evangelio y palabra del día 06 septiembre 2026',
  'https://www.vaticannews.va/content/vaticannews/es/evangelio-de-hoy/2026/09/06.html',
  [
    '<p>Primera lectura</p>',
    '<p>Lectura de la profec&iacute;a de Ezequiel&nbsp;</p>',
    '<p>Ezequiel 33, 7-9</p>',
    '<p>Esto dice el Se&ntilde;or: &quot;A ti, hijo de hombre, te he constituido centinela.&quot;</p>',
    '<p>Segunda lectura</p>',
    '<p>Lectura de la carta del ap&oacute;stol san Pablo a los Romanos&nbsp;</p>',
    '<p>Romanos 13, 8-10</p>',
    '<p>Hermanos: no tengan con nadie otra deuda que la del amor mutuo.</p>',
    '<p>Lectura del santo evangelio seg&uacute;n san Mateo&nbsp;</p>',
    '<p>Mateo 18, 15-20&nbsp;</p>',
    '<p>En aquel tiempo, dijo Jes&uacute;s a sus disc&iacute;pulos:<br/>Si tu hermano comete una falta contra ti, ve a corregirlo a solas.&quot;</p>',
  ].join('\n'),
);

const WEEKDAY = item(
  'Evangelio y palabra del día 09 septiembre 2026',
  'https://www.vaticannews.va/content/vaticannews/es/evangelio-de-hoy/2026/09/09.html',
  [
    '<p>Lectura de la primera carta del ap&oacute;stol san Pablo a los Corintios&nbsp;</p>',
    '<p>1 Corintios 7, 25-31</p>',
    '<p>Queridos hermanos: les voy a dar un consejo, pues por la misericordia del Se&ntilde;or.</p>',
    '<p>Lectura del santo evangelio seg&uacute;n san Lucas&nbsp;</p>',
    '<p>Lucas 6, 20-26&nbsp;</p>',
    '<p>En aquel tiempo, mirando Jes&uacute;s a sus disc&iacute;pulos: &quot;Dichosos ustedes los pobres.&quot;</p>',
    '<p>Las bienaventuranzas reescriben la felicidad en clave de Reino. (León XIV - Ángelus, 1° de febrero de 2026)</p>',
  ].join('\n'),
);

// Formato simplificado (el feed pasó a este formato desde el 15 sep 2026):
// referencias desnudas sin cabeceras litúrgicas.
const SIMPLIFIED = item(
  'Evangelio y palabra del día 15 septiembre 2026',
  'https://www.vaticannews.va/content/vaticannews/es/evangelio-de-hoy/2026/09/15.html',
  [
    '<p>Hebreos 5, 7-9</p>',
    '<p>Hermanos: Durante su vida mortal, Cristo ofreci&oacute; oraciones y s&uacute;plicas.</p>',
    '<p>Juan 19, 25-27</p>',
    '<p>En aquel tiempo, junto a la cruz de Jes&uacute;s estaban su madre, la hermana de su madre.</p>',
    '<p>La maternidad de Mar&iacute;a, a trav&eacute;s del misterio de la cruz, dio un salto impensable. (Le&oacute;n XIV - Homil&iacute;a nella Santa Messa, 9 de junio de 2025)</p>',
  ].join('\n'),
);

// Formato simplificado con salmo intercalado entre las lecturas.
const SIMPLIFIED_SALMO = item(
  'Evangelio y palabra del día 16 septiembre 2026',
  'https://www.vaticannews.va/content/vaticannews/es/evangelio-de-hoy/2026/09/16.html',
  [
    '<p>Hebreos 5, 7-9</p>',
    '<p>Hermanos: aprendi&oacute; a obedecer padeciendo.</p>',
    '<p>Salmo 27(28), 8-9</p>',
    '<p>El Se&ntilde;or es la fuerza de su pueblo.</p>',
    '<p>Juan 19, 25-27</p>',
    '<p>En aquel tiempo, Jes&uacute;s dijo a su madre: &quot;Mujer, ah&iacute; est&aacute; tu hijo&quot;.</p>',
    '<p>La fecundidad de la Iglesia es la misma fecundidad de Mar&iacute;a. (Le&oacute;n XIV - Homil&iacute;a, 9 de junio de 2025)</p>',
  ].join('\n'),
);

// Día mixto: encabezado clásico con su referencia + otra lectura con referencia desnuda.
const MIXED = item(
  'Evangelio y palabra del día 20 septiembre 2026',
  'https://www.vaticannews.va/content/vaticannews/es/evangelio-de-hoy/2026/09/20.html',
  [
    '<p>Lectura de la carta del ap&oacute;stol san Pablo a los Efesios&nbsp;</p>',
    '<p>Efesios 2, 4-10</p>',
    '<p>Hermanos: Dios, rico en misericordia, nos hizo revivir con Cristo.</p>',
    '<p>Marcos 10, 17-27</p>',
    '<p>En aquel tiempo, cuando sal&iacute;a Jes&uacute;s al camino.</p>',
    '<p>Cu&aacute;nto le costar&aacute; a los ricos entrar en el Reino. (Benedicto XVI - &Aacute;ngelus, 18 de marzo de 2012)</p>',
  ].join('\n'),
);

test('domingo: tres lecturas etiquetadas sin contaminar la primera', () => {
  const d = parseEvangelioRss(SUNDAY);
  assert.equal(d.readings.length, 3);
  assert.equal(d.reflection.text, '');
  assert.equal(d.readings[0].type, 'lectura');
  assert.equal(d.readings[0].label, 'Primera lectura');
  assert.equal(d.readings[0].ref, 'Ezequiel 33, 7-9');
  assert.match(d.readings[0].text, /centinela/);
  assert.doesNotMatch(d.readings[0].text, /Segunda lectura/);
  assert.equal(d.readings[1].type, 'lectura');
  assert.equal(d.readings[1].label, 'Segunda lectura');
  assert.equal(d.readings[1].ref, 'Romanos 13, 8-10');
  assert.match(d.readings[1].text, /amor mutuo/);
  assert.equal(d.readings[2].type, 'gospel');
  assert.equal(d.readings[2].label, null);
  assert.equal(d.readings[2].ref, 'Mateo 18, 15-20');
  assert.match(d.readings[2].text, /corregirlo a solas/);
});

test('entre semana: una lectura etiquetada como Primera + evangelio + meditación', () => {
  const d = parseEvangelioRss(WEEKDAY);
  assert.equal(d.readings.length, 2);
  assert.equal(d.readings[0].type, 'lectura');
  assert.equal(d.readings[0].label, 'Primera lectura');
  assert.doesNotMatch(d.readings[0].text, /Segunda lectura/);
  assert.equal(d.readings[1].type, 'gospel');
  assert.equal(d.readings[1].ref, 'Lucas 6, 20-26');
  assert.equal(d.reflection.cite, 'León XIV - Ángelus, 1° de febrero de 2026');
  assert.match(d.reflection.text, /bienaventuranzas/);
});

test('formato simplificado: refs desnudas clasificadas como lectura + evangelio + meditación', () => {
  const d = parseEvangelioRss(SIMPLIFIED);
  assert.equal(d.readings.length, 2);
  const [r1, r2] = d.readings;
  assert.equal(r1.type, 'lectura');
  assert.equal(r1.label, 'Primera lectura');
  assert.equal(r1.heading, '');
  assert.equal(r1.ref, 'Hebreos 5, 7-9');
  assert.match(r1.text, /Cristo/);
  assert.equal(r2.type, 'gospel');
  assert.equal(r2.ref, 'Juan 19, 25-27');
  assert.match(r2.text, /madre/);
  assert.equal(d.reflection.cite, 'León XIV - Homilía nella Santa Messa, 9 de junio de 2025');
  assert.match(d.reflection.text, /maternidad/);
});

test('formato simplificado: salmo intercalado entre las lecturas', () => {
  const d = parseEvangelioRss(SIMPLIFIED_SALMO);
  assert.equal(d.readings.length, 3);
  assert.equal(d.readings[0].type, 'lectura');
  assert.equal(d.readings[0].ref, 'Hebreos 5, 7-9');
  assert.equal(d.readings[1].type, 'salmo');
  assert.equal(d.readings[1].ref, 'Salmo 27(28), 8-9');
  assert.match(d.readings[1].text, /fuerza/);
  assert.equal(d.readings[2].type, 'gospel');
  assert.equal(d.readings[2].ref, 'Juan 19, 25-27');
});

test('día mixto: encabezado con ref + lectura adicional con ref desnuda', () => {
  const d = parseEvangelioRss(MIXED);
  assert.equal(d.readings.length, 2);
  assert.equal(d.readings[0].type, 'lectura');
  assert.equal(d.readings[0].heading, 'Lectura de la carta del apóstol san Pablo a los Efesios');
  assert.equal(d.readings[0].ref, 'Efesios 2, 4-10');
  assert.equal(d.readings[1].type, 'gospel');
  assert.equal(d.readings[1].heading, '');
  assert.equal(d.readings[1].ref, 'Marcos 10, 17-27');
});