export default {
  testDir: './tests/e2e',
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.BASE_URL || 'https://lumenve.vercel.app',
    headless: true,
    viewport: { width: 1280, height: 800 },
    locale: 'es-ES',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    serviceWorkers: 'block'
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
};