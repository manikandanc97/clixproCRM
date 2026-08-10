import { test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const testEmail = 'e2e_admin_1786276028193@gmail.com';
  const testPassword = 'TestPassword123!';

  await page.goto('/login');

  // Now login
  await page.getByTestId('email-input').fill(testEmail);
  await page.getByTestId('password-input').fill(testPassword);
  await page.getByTestId('login-btn').click();
  
  // Wait until the page actually redirects and is on the dashboard
  await page.waitForURL(/.*(\/dashboard|\/$)/, { timeout: 15000 });

  await page.context().storageState({ path: authFile });
});
