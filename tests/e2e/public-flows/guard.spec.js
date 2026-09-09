import { test, expect } from '@playwright/test';
import { go, goAndCheckJsErrors } from '../_support/nav.js';

test.describe('Guardia CI · Flujos públicos (solo lectura)', () => {
  test('Landing carga la portada', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/LUMEN/);
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('#app-container')).toBeVisible();
  });

  test('Blog muestra el artículo de bienvenida', async ({ page }) => {
    await go(page, 'blog');
    await expect(page.getByRole('heading', { name: /Bienvenidos a Lumen/i }).first()).toBeVisible();
  });

  test('Actividades lista las actividades sin errores', async ({ page }) => {
    await go(page, 'actividades');
    await expect(page.getByRole('heading', { name: /Actividades/i }).first()).toBeVisible();
    await expect(page.locator('#app-container')).not.toContainText('Error al cargar');
    await expect(page.locator('#app-container')).not.toContainText('undefined');
  });

  test('Intenciones bloquea publicar a invitados', async ({ page }) => {
    await go(page, 'intenciones');
    await expect(page.locator('#app-container').getByText('Solo los miembros de Juvemar pueden publicar intenciones.')).toBeVisible();
    await expect(page.locator('#app-container').getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();
  });

  test('Encuestas requiere acceso de miembro', async ({ page }) => {
    await go(page, 'encuestas');
    await expect(page.getByRole('heading', { name: 'Acceso para miembros' })).toBeVisible();
  });

  test('Avisos requiere acceso de miembro', async ({ page }) => {
    await go(page, 'notificaciones');
    await expect(page.getByRole('heading', { name: 'Acceso para miembros' })).toBeVisible();
  });

  test('Recursos requiere acceso de miembro', async ({ page }) => {
    await go(page, 'recursos');
    await expect(page.getByRole('heading', { name: 'Acceso para miembros' })).toBeVisible();
  });

  test('Calendario pinta el mes sin errores', async ({ page }) => {
    await go(page, 'calendario');
    const deployed = await page.evaluate(() => typeof CalendarioView !== 'undefined');
    test.skip(!deployed, 'Calendario aún no desplegado en este entorno');
    await expect(page.locator('.cal-grid')).toBeVisible();
    await expect(page.locator('.cal-day').first()).toBeVisible();
    await expect(page.locator('#app-container')).not.toContainText('Error al cargar');
    await expect(page.locator('#app-container')).not.toContainText('undefined');
  });

  test('Formación expone los módulos de catequesis', async ({ page }) => {
    await go(page, 'formacion');
    await expect(page.getByText('Catecismo', { exact: true })).toBeVisible();
    await expect(page.locator('#app-container')).not.toContainText('Error al cargar');
  });

  test('Vistas públicas no generan excepciones JS', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => typeof LumenRouter !== 'undefined');
    const withCal = await page.evaluate(() => typeof CalendarioView !== 'undefined');
    const views = ['inicio', 'nosotros', 'actividades', 'blog'];
    if (withCal) views.push('calendario');
    const errors = await goAndCheckJsErrors(page, views);
    expect(errors).toEqual([]);
  });
});