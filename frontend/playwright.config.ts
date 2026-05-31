import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false, // Serial execution for auth state consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1, // Serial: avoid race conditions on shared test DB
  reporter: [
    ['html', { open: 'never', outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  globalSetup: path.resolve('./e2e/fixtures/global-setup.ts'),
  globalTeardown: path.resolve('./e2e/fixtures/global-teardown.ts'),
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:9090',
    // Trace: keep all traces on failure (includes network, DOM snapshots, console logs)
    trace: 'retain-on-failure',
    // Video: record only on failure to save disk space
    video: 'retain-on-failure',
    // Screenshot: on failure for quick visual inspection
    screenshot: 'only-on-failure',
    storageState: 'auth.json', // Loaded from globalSetup
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  timeout: 30_000, // Global test timeout
  expect: {
    timeout: 5000, // Assertion timeout (web-first assertions)
  },
  webServer: undefined, // Use existing dev server instead of starting new instance
});
