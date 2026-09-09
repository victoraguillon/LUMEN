import { test, expect } from '@playwright/test';
import { go } from '../_support/nav.js';
import { shot } from '../_support/shot.js';

test.describe('Visual · baselines por viewport', () => {
  test('Landing', async ({ page }) => {
    await go(page, 'landing');
    await expect(page.getByText('Únete', { exact: false }).first()).toBeVisible();
    await shot(page, 'landing.png', [
      page.locator('#app-container img'),
      page.locator('.verse-card')
    ]);
  });

  test('Nosotros', async ({ page }) => {
    await go(page, 'nosotros');
    await expect(page.locator('.about-hero-title')).toBeVisible();
    await shot(page, 'nosotros.png', [page.locator('#app-container img')]);
  });

  test('Devocional (contenido del día enmascarado)', async ({ page }) => {
    await go(page, 'devocional');
    await expect(page.getByText('Alimento de Hoy')).toBeVisible();
    await shot(page, 'devocional.png', [
      page.locator('.hero-quote'),
      page.locator('.hero-reflexion'),
      page.locator('.santo-banner'),
      page.locator('#app-container audio'),
      page.locator('#app-container .santo-banner-title')
    ]);
  });

  test('Formación (módulos estáticos)', async ({ page }) => {
    await go(page, 'formacion');
    await expect(page.getByText('Catecismo', { exact: true })).toBeVisible();
    await shot(page, 'formacion.png', [page.locator('#app-container img')]);
  });

  test('Intenciones (gating invitado)', async ({ page }) => {
    await go(page, 'intenciones');
    await expect(page.locator('#app-container').getByText('Solo los miembros de Juvemar pueden publicar intenciones.')).toBeVisible();
    await shot(page, 'intenciones.png', [page.locator('.verse-card')]);
  });

  test('Encuestas (gating invitado)', async ({ page }) => {
    await go(page, 'encuestas');
    await expect(page.getByRole('heading', { name: 'Acceso para miembros' })).toBeVisible();
    await shot(page, 'encuestas.png', [page.locator('#app-container img')]);
  });
});