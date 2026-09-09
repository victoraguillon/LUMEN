export default {
  testDir: './tests/e2e',
  timeout: 60000,
  expect: {
    timeout: 15000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled' }
  },
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.BASE_URL || 'https://lumenve.vercel.app',
    headless: true,
    locale: 'es-ES',
    colorScheme: 'dark',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    serviceWorkers: 'block'
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: ['**/offline/**'],
      use: { viewport: { width: 1280, height: 800 } }
    },
    {
      name: 'tablet',
      testIgnore: ['**/offline/**'],
      use: { viewport: { width: 820, height: 1180 } }
    },
    {
      name: 'mobile',
      testIgnore: ['**/offline/**'],
      use: { viewport: { width: 390, height: 844 } }
    },
    {
      name: 'mobile-offline',
      testMatch: ['**/offline/**'],
      use: { viewport: { width: 390, height: 844 }, serviceWorkers: 'allow' }
    }
  ]
};