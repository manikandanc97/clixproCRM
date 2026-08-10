import { test, expect } from '@playwright/test';

test.describe('Deals Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/deals');
  });

  test('Page loads correctly with table rendering', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /deals/i })).toBeVisible();
    const listContainer = page.locator('table, [data-testid="deals-list"], [data-testid="deals-grid"]');
    await expect(listContainer.first()).toBeVisible({ timeout: 10000 });
  });

  test('Create new deal', async ({ page }) => {
    await page.getByRole('button', { name: /add deal|create deal/i }).click();
    
    const modal = page.locator('[role="dialog"], form');
    await expect(modal).toBeVisible();

    const testId = Date.now();
    const dealName = `E2E_Deal_${testId}`;
    
    await page.getByLabel(/deal name|title/i).fill(dealName);
    // Fill amount if required
    const amountInput = page.getByLabel(/amount|value/i);
    if (await amountInput.isVisible()) {
      await amountInput.fill('10000');
    }
    
    await page.getByRole('button', { name: /save|submit|create/i }).click();

    await expect(page.getByText(/deal created successfully|success/i)).toBeVisible().catch(() => {});
    await expect(page.getByText(dealName)).toBeVisible();
  });
});
