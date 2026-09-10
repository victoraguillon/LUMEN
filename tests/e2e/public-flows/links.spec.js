import { test, expect } from '@playwright/test';

test.describe('Sistema de deep links por hash', () => {
  test('Rosario: deep link abre el set indicado en la URL', async ({ page }) => {
    await page.goto('/#/rosario/gozosos');
    await expect(page).toHaveTitle(/Rosario/);
    await expect(page.getByText('Misterios gozosos', { exact: true }).first()).toBeVisible();
  });

  test('Formación: sección profunda con breadcrumbs, términos y relacionados', async ({ page }) => {
    await page.goto('/#/formacion/moral/conciencia/pecado-misericordia');
    await expect(page.locator('.vcrumbs').first()).toContainText('Formación');
    await expect(page.locator('.vcrumbs').first()).toContainText('El pecado y la misericordia');
    await expect(page.locator('.glos-link').first()).toContainText('pecado');
    await expect(page.getByRole('heading', { name: /Seguir explorando/i })).toBeVisible();
    await expect(page.locator('.rel-card').first()).toBeVisible();
  });

  test('Formación: ruta de unidad sola normaliza a primera sección sin cambiar la URL', async ({ page }) => {
    await page.goto('/#/formacion/moral/conciencia');
    await expect(page).toHaveURL(/#\/formacion\/moral\/conciencia$/);
    const state = await page.evaluate(() => ({
      subId: FormacionView._subId,
      autoSub: FormacionView._autoSub
    }));
    expect(state.subId).toBe('conciencia-dios');
    expect(state.autoSub).toBe(true);
  });

  test('Término del glosario: ?t= abre el detalle y resalta la entrada', async ({ page }) => {
    await page.goto('/#/formacion/glosario?t=Conciencia');
    await expect(page.locator('.glos-item.is-target').first()).toBeVisible();
    const state = await page.evaluate(() => ({
      input: document.getElementById('glos-input')?.value,
      open: document.querySelectorAll('.glos-item details[open]').length
    }));
    expect(state.input).toBe('Conciencia');
    expect(state.open).toBeGreaterThan(0);
  });

  test('Ruta inválida redirige al inicio', async ({ page }) => {
    await page.goto('/#/ruta/que/no/existe');
    await expect(page).toHaveTitle(/Inicio/);
  });

  test('Historial: volver restaura la sección anterior', async ({ page }) => {
    await page.goto('/#/formacion/moral/conciencia/pecado-misericordia');
    await page.getByRole('link', { name: /pecado/ }).first().click();
    await expect(page).toHaveURL(/#\/formacion\/glosario\?t=/);
    await page.goBack();
    await expect(page).toHaveURL(/#\/formacion\/moral\/conciencia\/pecado-misericordia$/);
    await expect(page.locator('.glos-link').first()).toBeVisible();
  });

  test('Módulos de la portada navegan como enlaces reales', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a.module-card').first()).toBeVisible();
    await page.locator('a.module-card').filter({ hasText: 'Rosario' }).click();
    await expect(page).toHaveTitle(/Rosario/);
  });
});