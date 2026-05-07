import { defineConfig, devices } from '@playwright/test';

const port = Number.parseInt(process.env.PLAYWRIGHT_PORT ?? '4174', 10);
const baseURL = `http://127.0.0.1:${port}/hum-to-orchestra/`;

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL,
    trace: 'on-first-retry'
  },
  webServer: {
    command: `PORT=${port} npm run pages-preview`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 30_000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
