import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('Admin should login successfully', async ({ page }) => {
    // Navigate using baseURL configured in playwright.config.ts
    await page.goto('/login');

    // Use stable data-testid selectors for inputs
    await page.getByTestId('email-input').fill('admin@admin.com');
    await page.getByTestId('password-input').fill('admin123');

    // Click Sign In and wait for response/navigation
    await page.getByTestId('login-btn').click();

    // Verify successful redirect to dashboard
    // We rely on auto-retrying assertions instead of fixed waits
    await expect(page).toHaveURL(/.*(\/dashboard|\/$)/);
    
    // Optionally verify that an element specific to the dashboard appears
    // to ensure the page has fully loaded after redirect.
    // e.g., await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});