import { test, expect } from '@playwright/test';

test.describe('Settings panel', () => {
  test('toggles open and closed from the header', async ({ page }) => {
    await page.goto('/');

    const settingsButton = page.getByRole('button', { name: 'Settings' });
    await expect(settingsButton).toHaveAttribute('aria-expanded', 'false');

    await settingsButton.click();
    await expect(settingsButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.setting-select')).toBeVisible();

    await settingsButton.click();
    await expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('lets you change the model', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Settings' }).click();

    const select = page.locator('.setting-select');
    await select.selectOption({ index: 1 });
    await expect(select).not.toHaveValue('');
  });
});
