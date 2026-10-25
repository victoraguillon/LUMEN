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

  test('Los planes litúrgicos muestran los cuatro caminos y sus pasos', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Planes litúrgicos', { exact: true })).toBeVisible();
    await page.goto('/planes');
    await expect(page.getByRole('heading', { name: /Planes litúrgicos/i })).toBeVisible();
    await expect(page).toHaveTitle(/Planes litúrgicos/);
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

  test('El audio del plan expande las abreviaturas bíblicas', async ({ page }) => {
    await page.goto('/planes/adviento');
    const audio = page.locator('.plan-audio .audio-btn');
    await expect(audio).toBeVisible();
    const audioText = await audio.getAttribute('data-audio-text');
    expect(audioText).toContain('Lucas, capítulo 21, versículos 25 al 28');
    expect(audioText).not.toContain('Lc 21');

    const normalized = await page.evaluate(() => LumenAudio.normalizeScripture(
      '1 Cor 12,12-13; 1 Pe 1,8-9; 1 Tim 2,1-4; Sal 139,23-24; Jn 3,16'
    ));
    expect(normalized).toContain('Primera carta a los Corintios, capítulo 12, versículos 12 al 13');
    expect(normalized).toContain('Primera carta de Pedro, capítulo 1, versículos 8 al 9');
    expect(normalized).toContain('Primera carta a Timoteo, capítulo 2, versículos 1 al 4');
    expect(normalized).toContain('Salmos, capítulo 139, versículos 23 al 24');
    expect(normalized).toContain('Juan, capítulo 3, versículo 16');
  });

  test('El rosario y las coronillas muestran el título y la voz lee solo la oración', async ({ page }) => {
    await page.goto('/rosario/eucaristico');
    const firstTitle = page.locator('.rosario-step-content h2');
    await expect(firstTitle).toBeVisible();
    await expect(firstTitle).toHaveText('Señal de la Cruz');
    await expect(page.locator('.rosario-step-content .rosario-icon')).toBeVisible();
    await expect(page.locator('.rosario-step-content .rosario-text')).toContainText('Por la señal de la Santa Cruz');
    const firstAudio = await page.locator('.rosario-step-actions .audio-btn').getAttribute('data-audio-text');
    expect(firstAudio).toContain('Por la señal de la Santa Cruz');
    expect(firstAudio).not.toContain('Señal de la Cruz');

    await page.goto('/rosario/espiritu-santo');
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /Siguiente cuenta/i }).click();
    }
    await expect(page.locator('.rosario-section-label')).toHaveText('Don de Sabiduría');
    await expect(page.locator('.rosario-step-content h2')).toHaveText('Espíritu de Sabiduría 1/7');
    const invocation = page.locator('.rosario-step-content .rosario-text');
    await expect(invocation).toContainText('Ven, Espíritu de Sabiduría');
    const invocationAudio = await page.locator('.rosario-step-actions .audio-btn').getAttribute('data-audio-text');
    expect(invocationAudio).toContain('Ven, Espíritu de Sabiduría');
    expect(invocationAudio).not.toContain('Don de Sabiduría');
    expect(invocationAudio).not.toContain('Isaías 11,2');
    expect(invocationAudio).not.toContain('1/7');
  });
});

test.describe('Formación sugerida en Inicio', () => {
  test.use({ timezoneId: 'America/Caracas' });

  test('Hoy sugiere un módulo de formación estable y abre su lector', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-25T12:00:00-04:00') });
    await page.goto('/inicio');

    const cards = page.locator('.today-grid .today-card');
    await expect(cards).toHaveCount(4);
    const formacionCard = cards.nth(3);
    await expect(formacionCard).toContainText('Formación de hoy');
    await expect(formacionCard).toContainText('Vocación y Propósito');

    await formacionCard.click();
    await expect(page).toHaveURL(/\/formacion\/vocacion$/);
    await expect(page.locator('.fm-mod')).toContainText('Vocación y Propósito');
    await expect(page.locator('.reading-h')).toBeVisible();
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
