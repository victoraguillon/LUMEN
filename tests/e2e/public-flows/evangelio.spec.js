import { test, expect } from '@playwright/test';
import { go } from '../_support/nav.js';

const FIXTURE = {
  date: '2026-09-09',
  source: 'https://www.vaticannews.va/es/evangelio-de-hoy/2026/09/09.html',
  title: 'Evangelio y palabra del día 09 septiembre 2026',
  readings: [
    {
      type: 'lectura',
      heading: 'Lectura de la primera carta del apóstol san Pablo a los Corintios',
      ref: '1 Corintios 7, 25-31',
      text: 'Queridos hermanos: les voy a dar un consejo, pues por la misericordia del Señor, soy digno de confianza.'
    },
    {
      type: 'gospel',
      heading: 'Lectura del santo evangelio según san Lucas',
      ref: 'Lucas 6, 20-26',
      text: 'En aquel tiempo, mirando Jesús a sus discípulos, les dijo: "Dichosos ustedes los pobres, porque de ustedes es el Reino de Dios."'
    }
  ],
  reflection: {
    text: 'En el monte, Cristo entrega a los discípulos la ley nueva, escrita en los corazones.',
    cite: 'León XIV - Ángelus, 1° de febrero de 2026'
  }
};

const SUNDAY_FIXTURE = {
  date: '2026-09-06',
  source: 'https://www.vaticannews.va/es/evangelio-de-hoy/2026/09/06.html',
  title: 'Evangelio y palabra del día 06 septiembre 2026',
  readings: [
    {
      type: 'lectura',
      label: 'Primera lectura',
      heading: 'Lectura de la profecía de Ezequiel',
      ref: 'Ezequiel 33, 7-9',
      text: 'Esto dice el Señor: "A ti, hijo de hombre, te he constituido centinela del pueblo de Israel."'
    },
    {
      type: 'lectura',
      label: 'Segunda lectura',
      heading: 'Lectura de la carta del apóstol san Pablo a los Romanos',
      ref: 'Romanos 13, 8-10',
      text: 'Hermanos: no tengan con nadie otra deuda que la del amor mutuo.'
    },
    {
      type: 'gospel',
      heading: 'Lectura del santo evangelio según san Mateo',
      ref: 'Mateo 18, 15-20',
      text: 'En aquel tiempo, dijo Jesús a sus discípulos: "Si tu hermano comete un pecado, ve a corregirlo a solas con él."'
    }
  ],
  reflection: {
    text: 'La corrección fraterna nace del amor: quien te corrige, te quiere.',
    cite: 'León XIV - Ángelus, 6 de septiembre de 2026'
  }
};

async function hasView(page) {
  await page.goto('/');
  await page.waitForFunction(() => typeof LumenRouter !== 'undefined' && !!LumenRouter.navigateTo);
  return page.evaluate(() => typeof EvangelioView !== 'undefined');
}

test.describe('Evangelio del día · flujo público', () => {
  test('Hermético: lecturas, evangelio, meditación y estado de error', async ({ page }) => {
    const deployed = await hasView(page);
    test.skip(!deployed, 'Evangelio aún no desplegado en este entorno');

    await page.route('**/api/evangelio', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FIXTURE),
    }));

    await go(page, 'evangelio');

    await expect(page.locator('.evangelio-hero')).toBeVisible();
    await expect(page.getByText('Primera lectura', { exact: true })).toBeVisible();
    await expect(page.getByText('1 Corintios 7, 25-31')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Evangelio', exact: true }).first()).toBeVisible();
    await expect(page.getByText('León XIV - Ángelus, 1° de febrero de 2026')).toBeVisible();
    await expect(page.locator('#app-container')).not.toContainText('undefined');

    await page.route('**/api/evangelio', route => route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'fuente caída' }),
    }));

    await page.evaluate(() => {
      EvangelioView._data = null;
      EvangelioView._loading = false;
      LumenRouter.navigateTo('evangelio');
    });

    await expect(page.getByText(/No pudimos cargar el Evangelio de hoy/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
  });

  test('Hermético (domingo): primera y segunda lectura etiquetadas', async ({ page }) => {
    const deployed = await hasView(page);
    test.skip(!deployed, 'Evangelio aún no desplegado en este entorno');

    await page.route('**/api/evangelio', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(SUNDAY_FIXTURE),
    }));

    await go(page, 'evangelio');

    await expect(page.getByText('Primera lectura', { exact: true })).toBeVisible();
    await expect(page.getByText('Segunda lectura', { exact: true })).toBeVisible();
    await expect(page.getByText('Ezequiel 33, 7-9')).toBeVisible();
    await expect(page.getByText('Romanos 13, 8-10')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Evangelio', exact: true }).first()).toBeVisible();
    await expect(page.getByText('Mateo 18, 15-20')).toBeVisible();

    const firstCard = page.locator('.evangelio-card').first();
    await expect(firstCard).not.toContainText('Segunda lectura');
    await expect(page.locator('#app-container')).not.toContainText('undefined');
  });

  test('En línea: consume el endpoint real si está disponible', async ({ page }) => {
    const deployed = await hasView(page);
    test.skip(!deployed, 'Evangelio aún no desplegado en este entorno');

    const resp = await page.evaluate(() =>
      fetch('/api/evangelio')
        .then(r => ({ ok: r.ok, status: r.status }))
        .catch(() => ({ ok: false, status: 0 }))
    );
    test.skip(!resp || !resp.ok, 'API /api/evangelio no disponible en este entorno');

    await go(page, 'evangelio');
    await expect(page.locator('.evangelio-hero')).toBeVisible();
    await expect(page.locator('.evangelio-card').first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('#app-container')).not.toContainText('undefined');
    await expect(page.locator('#app-container')).not.toContainText('Error al cargar');
  });
});