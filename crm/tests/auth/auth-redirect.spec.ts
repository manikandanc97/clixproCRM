import { test, expect } from '@playwright/test';

test('Unauthenticated user should be redirected to login', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/login/);
});