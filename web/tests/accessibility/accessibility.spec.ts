import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Checks', () => {
  const pages = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Leads', path: '/leads' },
    { name: 'Companies', path: '/companies' }
  ];

  for (const p of pages) {
    test(`Should not have any automatically detectable accessibility issues on ${p.name}`, async ({ page }) => {
      await page.goto(p.path);
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      
      // Filter out low-impact or known issues if necessary
      // For this audit, we will just expect 0 violations, but in reality you might filter.
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
