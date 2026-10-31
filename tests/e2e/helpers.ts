import { expect, type Page } from '@playwright/test';
export async function login(page: Page, name: string) {
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill(`${name}@demo.local`);
  await page.getByLabel('Mật khẩu').fill(process.env.DEMO_PASSWORD!);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
}
export async function logout(page: Page) {
  await page.getByRole('button', { name: 'Đăng xuất' }).click();
  await expect(page.getByRole('link', { name: 'Đăng nhập', exact: true }).first()).toBeVisible();
}
