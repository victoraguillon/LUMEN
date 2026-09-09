export async function go(page, view) {
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