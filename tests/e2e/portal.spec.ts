import { test, expect } from '@playwright/test';
import { login, logout } from './helpers';
test('manager creates, edits, publishes, unpublishes and deletes a real article', async ({
  page,
  browser,
}) => {
  await login(page, 'manager');
  await page.goto('/admin/articles/new');
  const title = `Bài kiểm thử trình duyệt ${Date.now()}`;
  await page.getByRole('textbox', { name: 'Tiêu đề', exact: true }).fill(title);
  await page
    .getByRole('textbox', { name: 'Tóm tắt', exact: true })
    .fill('Tóm tắt bài kiểm thử vòng đời nội dung.');
  await page
    .getByRole('textbox', { name: 'Nội dung HTML' })
    .fill('<h2>Kiểm thử thực tế</h2><p>Nội dung được lưu trong PostgreSQL.</p>');
  await page
    .getByRole('combobox', { name: 'Danh mục', exact: true })
    .selectOption({ label: 'Học máy' });
  const response = page.waitForResponse(
    (r) => r.url().endsWith('/api/v1/documents') && r.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Lưu bài viết' }).click();
  const doc = (await (await response).json()).data;
  await expect(page).toHaveURL(/\/admin\/articles$/);
  let row = page.getByRole('row').filter({ hasText: title });
  await expect(row).toBeVisible();
  const guest = await browser.newContext({ baseURL: 'http://localhost:5173' });
  const gp = await guest.newPage();
  expect(
    (await gp.request.get(`http://localhost:5173/api/v1/documents/${doc.slug}`)).status(),
  ).toBe(404);
  await row.getByRole('link', { name: 'Sửa', exact: true }).click();
  await page.getByRole('textbox', { name: 'Tiêu đề', exact: true }).fill(`${title} đã sửa`);
  await page.getByRole('button', { name: 'Lưu bài viết' }).click();
  row = page.getByRole('row').filter({ hasText: `${title} đã sửa` });
  await row.getByRole('button', { name: 'Xuất bản', exact: true }).click();
  await expect(row.getByText('PUBLISHED', { exact: true })).toBeVisible();
  await gp.goto(`/articles/${doc.slug}`);
  await expect(gp.getByRole('heading', { level: 1 })).toHaveText(`${title} đã sửa`);
  await row.getByRole('button', { name: 'Gỡ xuất bản', exact: true }).click();
  await expect(row.getByText('UNPUBLISHED', { exact: true })).toBeVisible();
  expect(
    (await gp.request.get(`http://localhost:5173/api/v1/documents/${doc.slug}`)).status(),
  ).toBe(404);
  page.once('dialog', (d) => d.accept());
  await row.getByRole('button', { name: 'Xóa', exact: true }).click();
  await expect(row).toHaveCount(0);
  await guest.close();
});
test('guest searches, filters, clicks a real result and views article metadata', async ({
  page,
}) => {
  await page.goto('/search');
  await page.getByRole('textbox', { name: 'Từ khóa', exact: true }).fill('dữ liệu');
  await page
    .getByRole('combobox', { name: 'Danh mục', exact: true })
    .selectOption({ label: 'Học máy' });
  const response = page.waitForResponse((r) => r.url().includes('/api/v1/search?'));
  await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
  const search = await (await response).json();
  expect(search.meta.searchId).toBeTruthy();
  expect(search.data.length).toBeGreaterThan(0);
  const click = page.waitForResponse(
    (r) => r.url().endsWith('/search/clicks') && r.request().method() === 'POST',
  );
  await page.locator('.article-card h2 a').first().click();
  expect((await click).status()).toBe(201);
  await expect(page).toHaveURL(/\/articles\//);
  await expect(page.locator('.article-body')).toBeVisible();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
  await page.goto('/search?q=khongcoketqua_unique_847372');
  await expect(page.getByRole('heading', { name: 'Chưa tìm thấy bài viết' })).toBeVisible();
});
test('user comments, likes, rates and reports; moderator hides and resolves', async ({
  page,
  browser,
}) => {
  await login(page, 'user');
  const docs = await page.request.get('/api/v1/documents');
  const doc = (await docs.json()).data[0];
  await page.goto(`/articles/${doc.slug}`);
  const body = `Thảo luận kiểm thử ${Date.now()} @seo`;
  await page.getByRole('textbox', { name: 'Bình luận của bạn', exact: true }).fill(body);
  await page.getByRole('button', { name: 'Gửi bình luận', exact: true }).click();
  let comment = page.locator('.comment').filter({ hasText: body });
  await expect(comment).toBeVisible();
  if (await page.getByRole('button', { name: 'Bỏ thích', exact: true }).isVisible())
    await page.getByRole('button', { name: 'Bỏ thích', exact: true }).click();
  await page.getByRole('button', { name: 'Thích bài viết', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Bỏ thích', exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Đánh giá của bạn', exact: true }).selectOption('5');
  await expect(page.getByRole('combobox', { name: 'Đánh giá của bạn', exact: true })).toHaveValue(
    '5',
  );
  await comment.getByRole('button', { name: 'Sửa bình luận', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Sửa bình luận của bạn', exact: true })
    .fill(`${body} đã sửa`);
  await page.getByRole('button', { name: 'Lưu bình luận', exact: true }).click();
  comment = page.locator('.comment').filter({ hasText: `${body} đã sửa` });
  await expect(comment).toBeVisible();
  await comment.getByText('Báo cáo bình luận', { exact: true }).click();
  await comment.getByRole('button', { name: 'Gửi báo cáo', exact: true }).click();
  await expect(comment.getByText('Đã gửi báo cáo đến kiểm duyệt viên.')).toBeVisible();
  await logout(page);
  await login(page, 'moderator');
  await page.goto('/admin/moderation');
  const report = page.locator('.moderation-item').filter({ hasText: body });
  await expect(report).toBeVisible();
  await report.getByRole('button', { name: 'Đã xử lý', exact: true }).click();
  await expect(report.getByText('RESOLVED', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Bình luận', exact: true }).click();
  const item = page.locator('.moderation-item').filter({ hasText: body });
  await item.getByRole('button', { name: 'Ẩn', exact: true }).click();
  await expect(item.getByText('HIDDEN', { exact: true })).toBeVisible();
  const guest = await browser.newContext({ baseURL: 'http://localhost:5173' });
  const gp = await guest.newPage();
  await gp.goto(`/articles/${doc.slug}`);
  await expect(gp.getByText(`${body} đã sửa`, { exact: true })).toHaveCount(0);
  await guest.close();
});
test('super admin assigns roles, edits permissions, reads logs and saves settings', async ({
  page,
}) => {
  const username = `admin_reader_${Date.now().toString(36)}`;
  const csrf = await (await page.request.get('/api/v1/auth/csrf')).json();
  const registration = await page.request.post('/api/v1/auth/register', {
    headers: { 'X-CSRF-Token': csrf.data.csrfToken },
    data: { email: `${username}@example.test`, username, password: 'Browser-test-password-1234' },
  });
  expect(registration.status()).toBe(201);
  await login(page, 'admin');
  await page.goto('/admin/users');
  const row = page.getByRole('row').filter({ hasText: username });
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'Gán vai trò', exact: true }).click();
  await page.getByRole('checkbox', { name: 'SEO_SPECIALIST', exact: true }).check();
  await page.getByRole('button', { name: 'Lưu vai trò', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Đã lưu vai trò. Quyền mới áp dụng ở yêu cầu tiếp theo.',
  );
  await page.getByRole('checkbox', { name: 'SEO_SPECIALIST', exact: true }).uncheck();
  const roleRestore = page.waitForResponse(
    (r) => r.url().includes('/roles') && r.request().method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Lưu vai trò', exact: true }).click();
  expect((await roleRestore).status()).toBe(200);
  await page.goto('/admin/roles');
  await page
    .getByRole('combobox', { name: 'Chọn vai trò', exact: true })
    .selectOption({ label: 'USER' });
  const checkbox = page.getByRole('checkbox', { name: 'analytics.read', exact: true });
  await checkbox.check();
  await page.getByRole('button', { name: 'Lưu quyền', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Đã cập nhật quyền.');
  await checkbox.uncheck();
  const permissionRestore = page.waitForResponse(
    (r) => r.url().includes('/permissions') && r.request().method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Lưu quyền', exact: true }).click();
  expect((await permissionRestore).status()).toBe(200);
  await page.goto('/admin/logs');
  await page.getByRole('textbox', { name: 'Hành động', exact: true }).fill('permissions.update');
  await page.getByRole('button', { name: 'Lọc nhật ký' }).click();
  await expect(
    page.getByRole('cell', { name: 'permissions.update', exact: true }).first(),
  ).toBeVisible();
  await page.goto('/admin/settings');
  await page.getByRole('spinbutton', { name: 'Thời gian lưu log (ngày)' }).fill('90');
  await page.getByRole('button', { name: 'Lưu cài đặt' }).click();
  await expect(page.getByRole('status')).toHaveText('Đã lưu cài đặt.');
});
test('SEO specialist updates metadata and reads activity analytics', async ({ page }) => {
  await login(page, 'seo');
  await page.goto('/admin/seo');
  await page.getByRole('button', { name: 'Sửa SEO', exact: true }).first().click();
  const title = `Metadata kiểm thử ${Date.now()}`;
  await page.getByRole('textbox', { name: 'Tiêu đề SEO', exact: true }).fill(title);
  await page
    .getByRole('textbox', { name: 'Mô tả SEO', exact: true })
    .fill('Mô tả được kiểm chứng qua trình duyệt.');
  const saved = page.waitForResponse(
    (r) => r.url().includes('/seo/documents/') && r.request().method() === 'PATCH',
  );
  await page.getByRole('button', { name: 'Lưu metadata' }).click();
  const updated = (await (await saved).json()).data;
  await expect(page.getByRole('status')).toHaveText('Đã lưu metadata.');
  if (updated.status === 'PUBLISHED') {
    await page.goto(`/articles/${updated.slug}`);
    await expect(page).toHaveTitle(`${title} · Điểm Mới`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'Mô tả được kiểm chứng qua trình duyệt.',
    );
  }
  await page.goto('/admin/analytics');
  await expect(page.getByRole('heading', { name: 'Phân tích độc giả' })).toBeVisible();
  await expect(
    page.locator('.metric').filter({ hasText: 'Lượt tìm kiếm' }).locator('strong'),
  ).not.toHaveText('0');
  await expect(
    page
      .getByRole('navigation', { name: 'Quản trị' })
      .getByRole('link', { name: 'Tài khoản', exact: true }),
  ).toHaveCount(0);
});
test('mobile public listing and role navigation fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.article-card')).toHaveCount(10);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Trang sau', exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator('.article-card')).toHaveCount(10);
  await login(page, 'moderator');
  await page.goto('/admin');
  const nav = page.getByRole('navigation', { name: 'Quản trị' });
  await expect(nav.getByRole('link', { name: 'Kiểm duyệt' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Bài viết', exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
