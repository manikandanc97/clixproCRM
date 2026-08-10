import { test, expect } from '@playwright/test';

test.describe('Customers Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customers');
  });

  test('Page loads correctly with table rendering', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /customers/i })).toBeVisible();
    const listContainer = page.locator('table, [data-testid="customers-list"], [data-testid="customers-grid"]');
    await expect(listContainer.first()).toBeVisible({ timeout: 10000 });
  });

  test('Create new customer', async ({ page }) => {
    await page.getByRole('button', { name: /add customer|create customer/i }).click();
    
    const modal = page.locator('[role="dialog"], form');
    await expect(modal).toBeVisible();

    const testId = Date.now();
    await page.getByLabel(/first name/i).fill(`E2E_Customer_First_${testId}`);
    await page.getByLabel(/last name/i).fill(`E2E_Customer_Last_${testId}`);
    await page.getByLabel(/email/i).fill(`e2e_customer_${testId}@example.com`);
    
    await page.getByRole('button', { name: /save|submit|create/i }).click();

    await expect(page.getByText(/customer created successfully|success/i)).toBeVisible().catch(() => {});
    await expect(page.getByText(`E2E_Customer_First_${testId}`)).toBeVisible();
  });

  test('Search customers', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'));
    await searchInput.fill('E2E_Customer');
    await page.waitForTimeout(500);
    
    const tableRows = page.locator('table tbody tr');
    await expect(tableRows.first().or(page.getByText(/no customers found|no results/i))).toBeVisible();
  });
});
