const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.MP1_BASE_URL || 'http://127.0.0.1:4173/mp1/',
    browserName: 'chromium',
    viewport: { width: 1366, height: 768 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.MP1_BASE_URL ? undefined : {
    // Test the same production bundle and project subpath used by GitHub Pages.
    command: 'npm run build && npm run preview',
    url: 'http://127.0.0.1:4173/mp1/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
