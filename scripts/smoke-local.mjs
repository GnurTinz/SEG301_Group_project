import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const health = await fetch('http://127.0.0.1:3001/health');
if (health.status !== 200 || (await health.json()).data.status !== 'ok')
  throw new Error('API health failed');
const web = await fetch('http://localhost:5173');
if (web.status !== 200) throw new Error('Web HTTP check failed');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:5173');
await page.locator('.article-card').nth(9).waitFor();
mkdirSync('.local', { recursive: true });
await page.screenshot({ path: '.local/preview-desktop.png', fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: '.local/preview-mobile.png', fullPage: true });
if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
  throw new Error('Mobile overflow');
await browser.close();
if (errors.length) throw new Error(errors.join('\n'));
console.info(
  'Development API/web HTTP 200; 10 database-backed cards; desktop/mobile screenshots; no page errors or mobile overflow.',
);
