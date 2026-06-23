import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Build the app and serve it. The chat endpoint is mocked in tests, so a real
  // API key is never used — a dummy keeps the Anthropic client from complaining.
  // DATA_DIR points at a throwaway dir so tests never touch real chat history.
  webServer: {
    command: 'pnpm run build && pnpm run start',
    url: BASE_URL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: {
      PORT: String(PORT),
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? 'test-dummy-key',
      DATA_DIR: '.playwright-data',
    },
  },
});
