import type { Page } from '@playwright/test';

/**
 * Build a Server-Sent Events body in the shape the chat client expects:
 * a sequence of `data: {json}` lines terminated by `data: [DONE]`.
 */
export function sseBody(chunks: string[], usage = { input: 10, output: 5 }): string {
  const lines = chunks.map(text => `data: ${JSON.stringify({ text })}\n\n`);
  lines.push(`data: ${JSON.stringify({ usage })}\n\n`);
  lines.push('data: [DONE]\n\n');
  return lines.join('');
}

/**
 * Intercept POST /api/chat and reply with a canned streamed response, so E2E
 * runs never call the real Anthropic API.
 */
export async function mockChat(page: Page, chunks: string[]): Promise<void> {
  await page.route('**/api/chat', async route => {
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
      body: sseBody(chunks),
    });
  });
}
