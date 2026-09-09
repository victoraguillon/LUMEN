import { test, expect } from '@playwright/test';

async function controlled(page) {
  await page.goto('/');
  await page.waitForFunction(() => typeof LumenRouter !== 'undefined' && !!LumenRouter.navigateTo, undefined, { timeout: 30000 });
  const hasController = await page.evaluate(() => !!navigator.serviceWorker.controller);
  if (!hasController) {
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 15000 }).catch(() => {});
    await page.reload();
    await page.waitForFunction(() => typeof LumenRouter !== 'undefined' && !!LumenRouter.navigateTo, undefined, { timeout: 30000 });
  }
}

test.describe('Offline · shell y contenido estático', () => {
  test('Tras visitar online, la app funciona sin conexión', async ({ page, context }) => {
    await controlled(page);

    for (const v of ['devocional', 'formacion', 'oraciones', 'rosario']) {
      await page.evaluate((x) => LumenRouter.navigateTo(x), v);
      await page.waitForTimeout(500);
    }

    await context.setOffline(true);

    await page.goto('/');
    await page.waitForFunction(() => typeof LumenRouter !== 'undefined' && !!LumenRouter.navigateTo, undefined, { timeout: 20000 });

    await page.evaluate(() => LumenRouter.navigateTo('devocional'));
    await expect(page.getByText('Alimento de Hoy')).toBeVisible();
    await expect(page.locator('.santo-banner-title')).toBeVisible();

    await page.evaluate(() => LumenRouter.navigateTo('formacion'));
    await expect(page.getByRole('heading', { name: /Formación/i }).first()).toBeVisible();

    await page.evaluate(() => LumenRouter.navigateTo('rosario'));
    await expect(page.getByRole('heading', { name: /Rosario/i }).first()).toBeVisible();
  });

  test('El shell está precacheador (manifest y raíz servibles offline)', async ({ page }) => {
    await controlled(page);
    const cached = await page.evaluate(async () => {
      const keys = await caches.keys();
      for (const k of keys) {
        const c = await caches.open(k);
        return { manifest: !!(await c.match('/manifest.json')), root: !!(await c.match('/')) };
      }
      return { manifest: false, root: false };
    });
    expect(cached.manifest).toBe(true);
    expect(cached.root).toBe(true);
  });

  test('Sin conexión se sirven datos cacheados y se muestra el badge', async ({ page, context }) => {
    // Visita online: precarga el store de LumenStore (eventos/recursos en IndexedDB).
    await controlled(page);

    // Solo aplica si la app desplegada incluye la capa offline (store.js).
    const hasStore = await page.evaluate(() => typeof LumenStore !== 'undefined');
    test.skip(!hasStore, 'La app desplegada aún no incluye la capa offline (store.js)');

    await page.evaluate(() => LumenRouter.navigateTo('actividades'));
    await page.waitForTimeout(2000);

    await context.setOffline(true);
    await page.goto('/');
    await page.waitForFunction(() => typeof LumenRouter !== 'undefined' && !!LumenRouter.navigateTo, undefined, { timeout: 20000 });

    const errs = [];
    page.on('pageerror', e => errs.push(e.message));

    await page.evaluate(() => LumenRouter.navigateTo('actividades'));
    await page.waitForTimeout(800);

    await expect(page.locator('#offline-badge')).toBeVisible();
    expect(errs).toEqual([]);
  });
});