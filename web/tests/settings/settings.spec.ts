import { test, expect } from '@playwright/test';

test.describe('Settings Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('Settings page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
    
    // Check if sections exist
    await expect(page.getByText(/profile/i).first()).toBeVisible();
  });
});
