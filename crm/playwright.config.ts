import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  /* Run tests in parallel */
  fullyParallel: true,

  /* Fail if test.only is committed */
  forbidOnly: !!process.env.CI,

  /* Retry only in CI */
  retries: process.env.CI ? 2 : 0,

  /* One worker in CI */
  workers: process.env.CI ? 1 : undefined,

  /* HTML Report */
  reporter: 'html',

  /* Shared settings */
  use: {
    /* Your local Next.js app */
    baseURL: 'http://localhost:3000',

    /* Capture screenshot only when test fails */
    screenshot: 'only-on-failure',

    /* Record video only for failed tests */
    video: 'retain-on-failure',

    /* Save trace on first retry */
    trace: 'on-first-retry',

    /* Ignore HTTPS certificate errors (useful in local dev) */
    ignoreHTTPSErrors: true,

    /* Viewport */
    viewport: {
      width: 1440,
      height: 900,
    },

    /* Headless browser */
    headless: true,
  },

  /* Browser Projects */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  /* Automatically start Next.js before tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});