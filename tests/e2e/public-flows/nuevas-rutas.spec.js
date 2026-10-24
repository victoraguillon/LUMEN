import { test, expect } from '@playwright/test';

test.describe('Rosario ampliado, planes y descargas', () => {
  test('El hub del Rosario reúne el rosario convencional, el eucarístico y cuatro coronillas', async ({ page }) => {
    await page.goto('/rosario');
    await expect(page.getByRole('heading', { name: /Rosario y coronillas/i })).toBeVisible();
    await expect(page.getByText('Rosario convencional')).toBeVisible();
    await expect(page.getByRole('button', { name: /Rosario Eucarístico/i })).toBeVisible();
    for (const name of ['Divina Misericordia', 'San Miguel', 'Espíritu Santo', 'San José']) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }
  });

  test('El Rosario Eucarístico y las coronillas abren su primer paso', async ({ page }) => {
    await page.goto('/rosario/eucaristico');
    await expect(page.getByRole('heading', { name: /Rosario Eucarístico, cuenta 1/i })).toBeVisible();
    await expect(page.getByText(/1 \/ \d+/)).toBeVisible();

    const chaplets = [
      ['divina-misericordia', /Coronilla de la Divina Misericordia/i],
      ['san-miguel', /Coronilla de San Miguel/i],
      ['espiritu-santo', /Coronilla al Espíritu Santo/i],
      ['san-jose', /Coronilla de los Imposibles/i]
    ];
    for (const [route, heading] of chaplets) {
      await page.goto('/rosario/' + route);
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    }
  });

  test('Los planes estacionales muestran los cuatro caminos y sus pasos', async ({ page }) => {
    await page.goto('/planes');
    for (const count of ['28 pasos', '12 pasos', '40 pasos', '50 pasos']) {
      await expect(page.getByText(count, { exact: true }).first()).toBeVisible();
    }
    await page.getByRole('button', { name: /Adviento: prepara el camino/i }).click();
    await expect(page).toHaveURL(/\/planes\/adviento$/);
    await expect(page.getByRole('heading', { name: /paso 1/i })).toBeVisible();
    await expect(page.getByText('Paso concreto')).toBeVisible();
  });

  test('Las descargas muestran grupos públicos y no datos privados', async ({ page }) => {
    await page.goto('/offline');
    await expect(page.getByRole('heading', { name: /Lleva LUMEN contigo/i })).toBeVisible();
    const groups = page.locator('.offline-card');
    for (const name of ['Formación', 'Oración', 'Devocional', 'Planes']) {
      await expect(groups.filter({ hasText: name }).getByRole('heading', { name })).toBeVisible();
    }
    await expect(page.getByText(/nunca se guardan datos de tu cuenta/i)).toBeVisible();
  });
});

test.describe('Frase del día', () => {
  test.use({ timezoneId: 'America/Caracas' });

  test('Sigue al santo del santoral y no al respaldo por fecha', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-24T12:00:00-04:00') });
    await page.goto('/inicio');
    await expect(page.locator('.verse-text-large')).toContainText('Predicar la verdad, aunque cueste la vida.');
    await expect(page.locator('.verse-text-large + cite')).toContainText('San Antonio María Claret');
  });
});

test.describe('Búsqueda global y portada expandible', () => {
  test('La búsqueda global encuentra contenido y abre un plan', async ({ page }) => {
    await page.goto('/inicio');
    await page.locator('[data-search-open]').click();
    await expect(page.locator('#search-modal')).toHaveClass(/active/);
    await page.locator('#global-search-input').fill('adviento');
    await expect(page.locator('.search-result').first()).toBeVisible();
    await page.locator('.search-result').filter({ hasText: 'Adviento: prepara el camino' }).first().click();
    await expect(page).toHaveURL(/\/planes\/adviento$/);
    await expect(page.getByRole('heading', { name: /Adviento: prepara el camino/i })).toBeVisible();
  });

  test('Las tarjetas de la portada se expanden en línea con Leer más / Leer menos', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('.module-card').first();
    const toggle = card.locator('.expand-toggle');
    await expect(toggle).toHaveText('Leer más');
    await toggle.click();
    await expect(toggle).toHaveText('Leer menos');
    await expect(card.locator('.expandable-more')).toBeVisible();
    await toggle.click();
    await expect(toggle).toHaveText('Leer más');
    await expect(card.locator('.expandable-more')).toBeHidden();
  });
});
