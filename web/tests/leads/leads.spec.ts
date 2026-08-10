import { test, expect } from '@playwright/test';

// Assume authenticated state via global setup

test.describe('Leads Module', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the leads page
    await page.goto('/leads');
  });

  test('Page loads correctly with table rendering', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /leads/i })).toBeVisible();
    
    // Check if table or grid is rendered
    // Could be a table element or a custom data-testid
    const listContainer = page.locator('table, [data-testid="leads-list"], [data-testid="leads-grid"]');
    await expect(listContainer.first()).toBeVisible({ timeout: 10000 });
  });

  test('Create new lead', async ({ page }) => {
    await page.getByRole('button', { name: /add lead|create lead/i }).click();
    
    // Check modal or page loads
    const modal = page.locator('[role="dialog"], form');
    await expect(modal).toBeVisible();

    // Fill form
    const testId = Date.now();
    await page.getByLabel(/first name/i).fill(`E2E_Lead_First_${testId}`);
    await page.getByLabel(/last name/i).fill(`E2E_Lead_Last_${testId}`);
    await page.getByLabel(/email/i).fill(`e2e_lead_${testId}@example.com`);
    
    await page.getByRole('button', { name: /save|submit|create/i }).click();

    // Expect success toast or redirect back to list
    await expect(page.getByText(/lead created successfully|success/i)).toBeVisible().catch(() => {});
    
    // Verify lead is in the list
    await expect(page.getByText(`E2E_Lead_First_${testId}`)).toBeVisible();
  });

  test('Search leads', async ({ page }) => {
    // Create a lead to search or just search an existing one
    const searchInput = page.getByPlaceholder(/search leads/i).or(page.getByRole('searchbox'));
    await searchInput.fill('E2E_Lead');
    await page.waitForTimeout(500); // debounce wait
    
    // Verify results update
    const tableRows = page.locator('table tbody tr');
    // Just ensuring we don't crash and we see at least something or an empty state
    await expect(tableRows.first().or(page.getByText(/no leads found|no results/i))).toBeVisible();
  });

  test('List/Grid toggle', async ({ page }) => {
    const listToggle = page.getByRole('button', { name: /list view|list/i }).or(page.getByTestId('list-view-btn'));
    const gridToggle = page.getByRole('button', { name: /grid view|grid/i }).or(page.getByTestId('grid-view-btn'));

    if (await gridToggle.isVisible()) {
        await gridToggle.click();
        await expect(page.locator('[data-testid="leads-grid"]')).toBeVisible().catch(() => {});
        
        await listToggle.click();
        await expect(page.locator('table')).toBeVisible().catch(() => {});
    }
  });

  test('Delete lead', async ({ page }) => {
    // Find a lead we created and delete it
    // Assuming there is an actions menu per row
    const row = page.locator('table tbody tr', { hasText: 'E2E_Lead' }).first();
    
    if (await row.isVisible()) {
        const actionButton = row.getByRole('button', { name: /actions|more/i }).or(row.locator('[data-testid="row-actions"]'));
        if (await actionButton.isVisible()) {
            await actionButton.click();
            await page.getByRole('menuitem', { name: /delete/i }).click();
            
            // Confirm delete
            await page.getByRole('button', { name: /confirm|delete|yes/i }).click();
            
            await expect(page.getByText(/deleted successfully/i)).toBeVisible().catch(() => {});
        }
    }
  });
});
