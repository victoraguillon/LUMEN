import { test, expect } from '@playwright/test';

test.describe('Racha diaria', () => {
  test('El Rosario Eucarístico solo suma racha al terminar, no en un paso intermedio', async ({ page }) => {
    await page.goto('/rosario/eucaristico');
    const next = page.locator('#rosario-next-btn');

    await next.click();
    expect(await page.evaluate(() => localStorage.getItem('lumen-streak'))).toBeNull();

    for (let i = 0; i < 300; i++) {
      if ((await next.textContent()).includes('Terminar')) break;
      await next.click();
    }
    await expect(next).toHaveText('Terminar');
    await next.click();

    const local = await page.evaluate(() => JSON.parse(localStorage.getItem('lumen-streak') || 'null'));
    expect(local).not.toBeNull();
    expect(local.days).toBe(1);
    await expect(page.locator('.celebrate-card')).toContainText('Racha: 1 día');

    await page.goto('/inicio');
    await expect(page.locator('.streak-chip')).toContainText('1 día');
  });

  test('Los planes solo suman racha al completar el último paso', async ({ page }) => {
    await page.goto('/planes/adviento');
    const next = page.locator('#plan-next-btn');

    await next.click();
    expect(await page.evaluate(() => localStorage.getItem('lumen-streak'))).toBeNull();

    for (let i = 0; i < 300; i++) {
      if ((await next.textContent()).includes('Terminar el plan')) break;
      await next.click();
    }
    await expect(next).toHaveText('Terminar el plan');
    await next.click();

    const local = await page.evaluate(() => JSON.parse(localStorage.getItem('lumen-streak') || 'null'));
    expect(local).not.toBeNull();
    expect(local.days).toBe(1);
    await expect(page.locator('.celebrate-card')).toContainText('Racha: 1 día');
  });

  test('Formación sigue sumando la racha al marcar una sección como completada', async ({ page }) => {
    await page.goto('/formacion/introduccion');
    await page.getByRole('button', { name: 'Marcar hecho' }).first().click();

    const local = await page.evaluate(() => JSON.parse(localStorage.getItem('lumen-streak') || 'null'));
    expect(local).not.toBeNull();
    expect(local.days).toBe(1);
    await expect(page.locator('.toast')).toContainText('Racha: 1 día');
  });

  test('La racha guardada en el servidor hidrata el chip al iniciar sesión', async ({ page }) => {
    await page.goto('/inicio');
    await page.waitForFunction(() => typeof LumenAuth !== 'undefined' && LumenAuth.ready === true);
    const today = await page.evaluate(() => LumenUI._dayKey());
    await page.route('**/rest/v1/streaks*', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ days: 7, last_date: today })
    }));

    const result = await page.evaluate(async () => {
      const uid = '11111111-1111-1111-1111-111111111111';
      LumenAuth.currentUser = { id: uid };
      localStorage.removeItem(LumenUI._streakUserKey(uid));
      const out = await LumenUI.syncStreak();
      return {
        out,
        local: JSON.parse(localStorage.getItem(LumenUI._streakUserKey(uid)) || 'null')
      };
    });

    expect(result.local).not.toBeNull();
    expect(result.local.days).toBe(7);
    expect(result.out.days).toBe(7);
    await expect(page.locator('.streak-chip')).toContainText('7 días');
  });

  test('Una racha local más nueva se envía al servidor al sincronizar', async ({ page }) => {
    await page.goto('/inicio');
    await page.waitForFunction(() => typeof LumenAuth !== 'undefined' && LumenAuth.ready === true);
    const today = await page.evaluate(() => LumenUI._dayKey());
    const yesterday = await page.evaluate((d) => LumenUI._yesterdayKey(d), today);
    let rpcBody = null;

    await page.route('**/rest/v1/streaks*', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ days: 9, last_date: yesterday })
    }));
    await page.route('**/rest/v1/rpc/sync_streak*', async (route) => {
      rpcBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify([{ days: 10, last_date: today }])
      });
    });

    const result = await page.evaluate(async ({ today }) => {
      const uid = '22222222-2222-2222-2222-222222222222';
      LumenAuth.currentUser = { id: uid };
      localStorage.setItem(LumenUI._streakUserKey(uid), JSON.stringify({ last: today, days: 6, uid: uid, dirty: true }));
      const out = await LumenUI.syncStreak();
      return {
        out,
        local: JSON.parse(localStorage.getItem(LumenUI._streakUserKey(uid)) || 'null')
      };
    }, { today });

    expect(rpcBody).toEqual({ p_last: today, p_days: 6 });
    expect(result.local).not.toBeNull();
    expect(result.local.days).toBe(10);
    expect(result.local.dirty).toBe(false);
  });

  test('La racha continúa al día siguiente y el chip muestra el conteo', async ({ page }) => {
    await page.goto('/inicio');
    const result = await page.evaluate(() => {
      const today = LumenUI._dayKey();
      const yesterday = LumenUI._yesterdayKey(today);
      localStorage.setItem('lumen-streak', JSON.stringify({ last: yesterday, days: 1 }));
      return LumenUI.recordStreak();
    });

    expect(result.days).toBe(2);
    await page.reload();
    await expect(page.locator('.streak-chip')).toContainText('2 días');
  });

  test('Una racha rota vuelve a empezar en 1', async ({ page }) => {
    await page.goto('/inicio');
    const result = await page.evaluate(() => {
      const today = LumenUI._dayKey();
      const old = new Date(Date.parse(today + 'T12:00:00-04:00') - 3 * 86400000);
      localStorage.setItem('lumen-streak', JSON.stringify({ last: LumenUI._dayKey(old), days: 8 }));
      return LumenUI.recordStreak();
    });

    expect(result.days).toBe(1);
  });
});
