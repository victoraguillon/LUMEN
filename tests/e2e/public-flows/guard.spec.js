import { test, expect } from '@playwright/test';

const DIRECT = {
  inicio: '.nav-link[data-view="inicio"]',
  nosotros: '.nav-link[data-view="nosotros"]',
  actividades: '.nav-link[data-view="actividades"]',
  blog: '.nav-link[data-view="blog"]',
  contacto: '.nav-link[data-view="contacto"]'
};

const DROPDOWN = {
  intenciones: 'comunidad-dropdown'
};

async function openDropdown(page, id) {
  await page.evaluate((did) => {
    document.getElementById(did)?.classList.add('active');
  }, id);
  await page.waitForTimeout(250);
}

test.describe('Guardia CI · Flujos públicos (solo lectura)', () => {
  test('Landing carga la portada', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/LUMEN/);
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('#app-container')).toBeVisible();
  });

  test('Blog muestra el artículo de bienvenida', async ({ page }) => {
    await page.goto('/');
    await page.locator(DIRECT.blog).first().click();
    await expect(page.getByRole('heading', { name: /Bienvenidos a Lumen/i }).first()).toBeVisible();
  });

  test('Actividades lista las actividades sin errores', async ({ page }) => {
    await page.goto('/');
    await page.locator(DIRECT.actividades).first().click();
    await expect(page.getByRole('heading', { name: /Actividades/i }).first()).toBeVisible();
    await expect(page.locator('#app-container')).not.toContainText('Error al cargar');
    await expect(page.locator('#app-container')).not.toContainText('undefined');
  });

  test('Intenciones bloquea publicar a invitados', async ({ page }) => {
    await page.goto('/');
    await openDropdown(page, DROPDOWN.intenciones);
    await page.locator(`.nav-link[data-view="intenciones"]`).click();
    await expect(page.locator('#app-container').getByText('Solo los miembros de Juvemar pueden publicar intenciones.')).toBeVisible();
    await expect(page.locator('#app-container').getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();
  });

  test('Encuestas requiere acceso de miembro', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => LumenRouter.navigateTo('encuestas'));
    await expect(page.getByRole('heading', { name: 'Acceso para miembros' })).toBeVisible();
  });

  test('Avisos requiere acceso de miembro', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => LumenRouter.navigateTo('notificaciones'));
    await expect(page.getByRole('heading', { name: 'Acceso para miembros' })).toBeVisible();
  });

  test('Recursos requiere acceso de miembro', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => LumenRouter.navigateTo('recursos'));
    await expect(page.getByRole('heading', { name: 'Acceso para miembros' })).toBeVisible();
  });

  test('Formación expone los módulos de catequesis', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { document.getElementById('espiritualidad-dropdown')?.classList.add('active'); });
    await page.locator(`.nav-link[data-view="formacion"]`).click();
    await expect(page.getByText('Catecismo', { exact: true })).toBeVisible();
    await expect(page.locator('#app-container')).not.toContainText('Error al cargar');
  });

  test('Vistas públicas no generan excepciones JS', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const view of ['inicio', 'nosotros', 'actividades', 'blog']) {
      await page.goto('/');
      await page.locator(DIRECT[view]).first().click();
      await page.waitForTimeout(400);
    }
    expect(errors).toEqual([]);
  });
});