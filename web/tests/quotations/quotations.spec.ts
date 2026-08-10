import { test, expect } from '@playwright/test';

test.describe('Quotations Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quotations');
  });

  test('Page loads correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /quotations/i })).toBeVisible();
    const listContainer = page.locator('table, [data-testid="quotations-list"]');
    await expect(listContainer.first()).toBeVisible({ timeout: 10000 });
  });
});
