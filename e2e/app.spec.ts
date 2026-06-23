import { test, expect } from '@playwright/test';

test.describe('App shell', () => {
  test('loads with the correct title and header', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('AI Agent based on Claude');
    await expect(page.locator('.logo')).toContainText('AI Agent based on Claude');
  });

  test('shows the welcome screen on a fresh chat', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.welcome h1')).toHaveText('How can I help you today?');
    await expect(page.getByPlaceholder('Message Claude…')).toBeVisible();
  });
});
