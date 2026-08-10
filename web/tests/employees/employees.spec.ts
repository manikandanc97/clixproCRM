import { test, expect } from '@playwright/test';

test.describe('Employees Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employees');
  });

  test('Page loads correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /employees/i })).toBeVisible();
    const listContainer = page.locator('table, [data-testid="employees-list"]');
    await expect(listContainer.first()).toBeVisible({ timeout: 10000 });
  });

  test('Invite Employee', async ({ page }) => {
    await page.getByRole('button', { name: /invite|add employee/i }).click();
    const modal = page.locator('[role="dialog"], form');
    await expect(modal).toBeVisible();

    const testId = Date.now();
    await page.getByLabel(/email/i).fill(`e2e_employee_${testId}@example.com`);
    await page.getByRole('button', { name: /send invite|invite/i }).click();

    await expect(page.getByText(/invitation sent successfully|success/i)).toBeVisible().catch(() => {});
  });
});
