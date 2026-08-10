import { test, expect } from '@playwright/test';

test.describe('Calendar Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calendar');
  });

  test('Calendar renders properly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /calendar/i })).toBeVisible();
    
    // Check for the calendar grid or month view
    const calendarView = page.locator('.fc, [data-testid="calendar-view"]');
    await expect(calendarView.first()).toBeVisible({ timeout: 10000 });
  });
});
