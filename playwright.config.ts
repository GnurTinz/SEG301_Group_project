import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1, timeout: 45000,
  use: { baseURL: 'http://localhost:5173', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: 'node --import tsx apps/api/src/server.ts', url: 'http://127.0.0.1:3001/health', reuseExistingServer: false, timeout: 30000 },
    { command: 'node ../../node_modules/vite/bin/vite.js --host localhost', cwd: 'apps/web', url: 'http://localhost:5173', reuseExistingServer: false, timeout: 30000 },
  ],
});
