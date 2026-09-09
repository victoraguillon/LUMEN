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