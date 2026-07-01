import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false, // Tests within a spec file run serially (auth state consistency)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // 3 spec files run in parallel — each test creates its own user so no DB race conditions.
  // Each spec file still runs serially internally (fullyParallel: false).
  // Use PLAYWRIGHT_WORKERS=1 to force serial when debugging a flaky test.
  workers: process.env.PLAYWRIGHT_WORKERS ? parseInt(process.env.PLAYWRIGHT_WORKERS) : (process.env.CI ? 1 : 3),
  reporter: [
    ['html', { open: 'never' }],
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
    // Screenshot: capture on both success and failure for evidence documentation
    screenshot: 'only-on-failure',
    storageState: 'auth.json', // Loaded from globalSetup
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Add --no-sandbox for Docker environments where kernel namespaces aren't available
        launchArgs: process.env.CI || process.env.DOCKER ? ['--no-sandbox'] : [],
      },
    },
  ],
  timeout: 30_000, // Global test timeout
  expect: {
    timeout: 5000, // Assertion timeout (web-first assertions)
    toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.02 },
  },
  webServer: undefined, // Use existing dev server instead of starting new instance
});
