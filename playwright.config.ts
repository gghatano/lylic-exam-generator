import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './playwright',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5180/lilyc-exam-generator/',
    headless: true,
  },
  webServer: {
    command: 'npm run dev -- --port 5180',
    port: 5180,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
})
