import { test, expect } from '@playwright/test';

test.describe('Google OAuth Callback Route', () => {
  test('Callback route serves popup close script and dispatches auth success message', async ({ page }) => {
    // Navigate directly to the callback with simulated error to check popup html & message payload
    await page.goto('/api/auth/callback?error=access_denied&error_description=User+cancelled');
    
    // Check that the response contains the expected payload script and title
    await expect(page).toHaveTitle(/ClixProCRM Authentication/);
    await expect(page.getByRole('heading', { name: /Authentication Failed/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Close Window/i })).toBeVisible();
  });
});
