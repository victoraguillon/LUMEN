import { expect } from '@playwright/test';

export async function shot(page, name, masks = []) {
  await expect(page).toHaveScreenshot(name, { mask: masks });
}