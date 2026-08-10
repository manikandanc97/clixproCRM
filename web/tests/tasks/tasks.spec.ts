import { test, expect } from '@playwright/test';

test.describe('Tasks Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks');
  });

  test('Page loads correctly with task list rendering', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /tasks/i })).toBeVisible();
    const listContainer = page.locator('[data-testid="tasks-list"], [data-testid="task-board"]');
    await expect(listContainer.first()).toBeVisible({ timeout: 10000 });
  });

  test('Create new task', async ({ page }) => {
    await page.getByRole('button', { name: /add task|create task/i }).click();
    
    const modal = page.locator('[role="dialog"], form');
    await expect(modal).toBeVisible();

    const testId = Date.now();
    const taskTitle = `E2E_Task_${testId}`;
    
    await page.getByLabel(/title|task name/i).fill(taskTitle);
    await page.getByRole('button', { name: /save|submit|create/i }).click();

    await expect(page.getByText(/task created successfully|success/i)).toBeVisible().catch(() => {});
    await expect(page.getByText(taskTitle)).toBeVisible();
  });
});
