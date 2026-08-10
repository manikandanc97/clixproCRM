import { test, expect } from '@playwright/test';

test.describe('Visual Regression and UI Consistency', () => {
  // Define standard viewports for responsive testing
  const viewports = [
    { name: 'Desktop', width: 1440, height: 900 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 390, height: 844 }
  ];

  const pages = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Leads', path: '/leads' },
    { name: 'Companies', path: '/companies' },
    { name: 'Customers', path: '/customers' },
    { name: 'Deals', path: '/deals' },
    { name: 'Pipeline', path: '/pipeline' },
    { name: 'Tasks', path: '/tasks' },
    { name: 'Calendar', path: '/calendar' },
    { name: 'Quotations', path: '/quotations' },
    { name: 'Employees', path: '/employees' },
    { name: 'Settings', path: '/settings' }
  ];

  for (const viewport of viewports) {
    test.describe(`Viewport: ${viewport.name}`, () => {
      test.use({ viewport });

      for (const p of pages) {
        test(`Visual regression for ${p.name}`, async ({ page }) => {
          await page.goto(p.path);
          // Wait for any loaders to finish to avoid flaky screenshots
          await page.waitForLoadState('networkidle');
          // Wait for animations to settle
          await page.waitForTimeout(1000); 

          // Capture full page screenshot
          await expect(page).toHaveScreenshot(`${p.name}-${viewport.name}.png`, { fullPage: true, maxDiffPixelRatio: 0.05 });
        });
      }
    });
  }
});
