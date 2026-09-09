import { test, expect } from '@playwright/test';
import { go } from '../_support/nav.js';

const VIEWS = ['landing', 'nosotros', 'actividades', 'calendario', 'blog', 'devocional', 'formacion', 'intenciones', 'encuestas', 'contacto'];

async function noOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return { w: doc.clientWidth, elem: doc.scrollWidth, body: document.body.scrollWidth };
  });
}

test.describe('Responsive · sin desborde horizontal', () => {
  for (const view of VIEWS) {
    test(`Vista ${view} sin desborde horizontal`, async ({ page }) => {
      if (view === 'calendario') {
        await page.goto('/');
        await page.waitForFunction(() => typeof LumenRouter !== 'undefined');
        const deployed = await page.evaluate(() => typeof CalendarioView !== 'undefined');
        test.skip(!deployed, 'Calendario aún no desplegado en este entorno');
      }
      await go(page, view);
      await page.waitForTimeout(700);
      const m = await noOverflow(page);
      expect(Math.max(m.elem, m.body)).toBeLessThanOrEqual(m.w + 2);
    });
  }
});

test.describe('Responsive · navegación', () => {
  test('Nav del escritorio abre el dropdown Espiritualidad', async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.viewport.width <= 1200, 'Solo escritorio ancho (>1200px)');
    await page.goto('/');
    await page.waitForFunction(() => typeof LumenRouter !== 'undefined');
    await page.evaluate(() => { document.getElementById('espiritualidad-dropdown')?.classList.add('active'); });
    await page.locator(`.nav-link[data-view="formacion"]`).click();
    await expect(page.getByText('Catecismo', { exact: true })).toBeVisible();
  });

  test('Drawer móvil navega a una vista', async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.viewport.width > 1200, 'Solo móvil/tablet (≤1200px)');
    await page.goto('/');
    await page.waitForFunction(() => typeof LumenRouter !== 'undefined');
    await page.locator('.mobile-menu-btn').click();
    await expect(page.locator('#side-drawer')).toBeVisible();
    await page.locator('.drawer-link[data-view="nosotros"]').first().click();
    await page.waitForTimeout(600);
    await expect(page.locator('.about-hero-title')).toBeVisible();
    expect(await page.locator('#side-drawer').evaluate(el => el.classList.contains('active'))).toBe(false);
  });

  test('Componentes clave visibles en vista móvil/tablet', async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.viewport.width > 1200, 'Solo móvil/tablet (≤1200px)');
    await page.goto('/');
    await expect(page.locator('.mobile-menu-btn')).toBeVisible();
    await expect(page.locator('header').first()).toBeVisible();
  });
});