import { test, expect, type Page } from '@playwright/test';

test.describe('Detail Page Copy Button', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/prompts');
  });

  test('should show copy buttons on detail page', async ({ page }: { page: Page }) => {
    await page.click('text=创建音乐生成提示词');
    await page.fill('[name="lyrics"]', 'Test lyrics for copy');
    await page.fill('[name="style"]', 'Test style');
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/prompts\/[a-z0-9-]+$/);

    const topCopyButton = page.getByRole('button', { name: /复制提示词到剪贴板/ }).first();
    const bottomCopyButton = page.getByRole('button', { name: /复制/ }).nth(1);

    await expect(topCopyButton).toBeVisible();
    await expect(bottomCopyButton).toBeVisible();
  });

  test('should display copy count on detail page', async ({ page }: { page: Page }) => {
    await page.click('text=创建音乐生成提示词');
    await page.fill('[name="style"]', 'Test');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/prompts\/[a-z0-9-]+$/);

    const copyCount = page.getByText(/已复制 \d+ 次/);
    await expect(copyCount).toBeVisible();
  });

  test('should copy prompt content from detail page', async ({ page }: { page: Page }) => {
    await page.click('text=创建音乐生成提示词');
    await page.fill('[name="lyrics"]', '[Verse]\nTest lyrics');
    await page.fill('[name="style"]', 'Pop style');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/prompts\/[a-z0-9-]+$/);

    const copyButton = page.getByRole('button', { name: /复制/ }).first();
    await copyButton.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('lyrics:\n[Verse]\nTest lyrics');
    expect(clipboardText).toContain('style:\nPop style');
  });

  test('should track copy API call', async ({ page }: { page: Page }) => {
    await page.click('text=创建音乐生成提示词');
    await page.fill('[name="style"]', 'Test');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/prompts\/[a-z0-9-]+$/);

    const copyButton = page.getByRole('button', { name: /复制/ }).first();

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/prompts/') && resp.url().includes('/copy')
    );

    await copyButton.click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });

  test('should have responsive layout on mobile', async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('text=创建音乐生成提示词');
    await page.fill('[name="style"]', 'Test');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/prompts\/[a-z0-9-]+$/);

    const topCopyButton = page.getByRole('button', { name: /复制提示词到剪贴板/ }).first();
    const bottomCopyButton = page.getByRole('button', { name: /复制/ }).nth(1);

    await expect(topCopyButton).toBeVisible();
    await expect(bottomCopyButton).toBeVisible();
  });

  test('should show last copied timestamp', async ({ page }: { page: Page }) => {
    await page.click('text=创建音乐生成提示词');
    await page.fill('[name="style"]', 'Test');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/prompts\/[a-z0-9-]+$/);

    const copyButton = page.getByRole('button', { name: /复制/ }).first();
    await copyButton.click();
    await page.waitForTimeout(1000);
    await page.reload();

    const lastCopiedText = page.getByText(/最后复制于/);
    await expect(lastCopiedText).toBeVisible();
  });
});
