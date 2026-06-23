import { test, expect } from '@playwright/test';
import { mockChat } from './helpers';

test.describe('Chat', () => {
  test('sends a message and renders the streamed reply', async ({ page }) => {
    await mockChat(page, ['Hello', ', world!']);
    await page.goto('/');

    const input = page.getByPlaceholder('Message Claude…');
    await input.fill('Hi there');
    await page.getByRole('button', { name: 'Send' }).click();

    // The user's message shows immediately.
    await expect(page.locator('.bubble-user')).toHaveText('Hi there');

    // The mocked stream is assembled into a single assistant bubble.
    await expect(page.locator('.bubble-assistant')).toContainText('Hello, world!');
  });

  test('handles the /help command without calling the API', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('Message Claude…');
    await input.fill('/help');
    await input.press('Enter');

    await expect(page.locator('.bubble-system')).toContainText('Available commands');
  });
});
