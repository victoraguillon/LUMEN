export async function go(page, view) {
  // Estado de navegador ya consentido: los tests de contenido no deben
  // fotografiar el banner de primera visita ni el aviso de instalación.
  await page.addInitScript(() => {
    try {
      localStorage.setItem('lumen-cookie-consent', JSON.stringify({ level: 'essential', ts: Date.now() }));
      localStorage.setItem('lumen_pwa_dismissed', '1');
    } catch (e) {}
  });
  await page.goto('/');
  await page.waitForFunction(() => typeof LumenRouter !== 'undefined' && !!LumenRouter.navigateTo);
  await page.evaluate((v) => LumenRouter.navigateTo(v), view);
  await page.waitForTimeout(450);
}

export async function goAndCheckJsErrors(page, views) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const view of views) await go(page, view);
  await page.waitForTimeout(350);
  return errors;
}