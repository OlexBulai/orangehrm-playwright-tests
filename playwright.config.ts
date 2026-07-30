import { defineConfig, devices } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';
const requestedCiWorkers = Number.parseInt(process.env.CI_WORKERS ?? '4', 10);
const ciWorkers = requestedCiWorkers > 0 ? requestedCiWorkers : 4;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  timeout: process.env.CI ? 90_000 : 30_000,
  /* The public demo uses one shared employee, so mutations must stay sequential. */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  expect: {
    timeout: process.env.CI ? 15_000 : 5_000,
  },
  workers: process.env.CI ? ciWorkers : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  /* Configure projects for major browsers */
  projects: [
    ...(process.env.CI
      ? [
          {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
          },
        ]
      : []),
    {
      name: 'chromium',
      testIgnore: /.*\.setup\.ts/,
      dependencies: process.env.CI ? ['setup'] : [],
      use: {
        ...devices['Desktop Chrome'],
        storageState: process.env.CI ? authFile : undefined,
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
