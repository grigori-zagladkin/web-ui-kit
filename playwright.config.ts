import { defineConfig, devices } from '@playwright/test';

/**
 * Скриншотные тесты Storybook. Запускайте через Docker (npm run docker:visual),
 * чтобы шрифты и рендеринг совпадали на любой машине и в CI.
 */
export default defineConfig({
  testDir: './tests',
  // эталоны без суффикса платформы: снимаем всегда в одном и том же Linux-образе
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      maxDiffPixelRatio: 0.001,
      threshold: 0.2,
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:6006',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
        deviceScaleFactor: 1,
        locale: 'ru-RU',
        timezoneId: 'Europe/Moscow',
      },
    },
  ],
  webServer: {
    command: 'npx http-server storybook-static -a 127.0.0.1 -p 6006 -s -c-1',
    url: 'http://127.0.0.1:6006/index.json',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
