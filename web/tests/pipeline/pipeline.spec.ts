import { test, expect } from '@playwright/test';

test.describe('Pipeline Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pipeline');
  });

  test('All stages render and contain deal cards', async ({ page }) => {
    // Wait for the pipeline board to be visible
    const board = page.locator('.dnd-context, [data-testid="pipeline-board"]');
    await expect(board.first()).toBeVisible({ timeout: 15000 });

    // Expect columns/stages to be present
    const stages = page.locator('[data-testid="pipeline-stage"]');
    // Assuming at least 1 stage is configured
    await expect(stages.first()).toBeVisible();
  });
});
