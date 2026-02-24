import { test, expect, type Page } from '@playwright/test';

test.describe('Form Page Copy Button', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/prompts/new');
  });

  test('should show copy button on form page', async ({ page }: { page: Page }) => {
    const copyButton = page.getByRole('button', { name: /复制|复制提示词到剪贴板/ });
    await expect(copyButton).toBeVisible();
  });

  test('should be disabled when all fields are empty', async ({ page }: { page: Page }) => {
    const copyButton = page.getByRole('button', { name: /复制/ }).first();

    await expect(copyButton).toBeDisabled();
  });

  test('should be enabled when at least one field is filled', async ({ page }: { page: Page }) => {
    const copyButton = page.getByRole('button', { name: /复制/ }).first();

    await page.fill('[name="lyrics"]', 'Test lyrics');
    await expect(copyButton).toBeEnabled();
  });

  test('should copy formatted text to clipboard', async ({ page }: { page: Page }) => {
    await page.fill('[name="lyrics"]', '[Verse]\nTest lyrics');
    await page.fill('[name="style"]', 'Pop style');

    const copyButton = page.getByRole('button', { name: /复制/ }).first();
    await copyButton.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

    expect(clipboardText).toContain('lyrics:\n[Verse]\nTest lyrics');
    expect(clipboardText).toContain('style:\nPop style');
  });

  test('should show success toast after copy', async ({ page }: { page: Page }) => {
    await page.fill('[name="style"]', 'Test style');

    const copyButton = page.getByRole('button', { name: /复制/ }).first();
    await copyButton.click();

    const toast = page.getByText('已复制到剪贴板');
    await expect(toast).toBeVisible();
  });

  test('should show error toast when trying to copy empty prompt', async ({
    page,
  }: {
    page: Page;
  }) => {
    const copyButton = page.getByRole('button', { name: /复制/ }).first();

    await copyButton.click();

    const toast = page.getByText('请先填写提示词内容');
    await expect(toast).toBeVisible();
  });

  test('should show icon state change after copy', async ({ page }) => {
    await page.fill('[name="style"]', 'Test style');

    const copyButton = page.getByRole('button', { name: /复制/ }).first();
    const copyIcon = copyButton.locator('svg').first();

    await copyButton.click();

    const checkIcon = copyButton.locator('svg').nth(1);
    await expect(checkIcon).toBeVisible({ timeout: 2000 });
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.fill('[name="style"]', 'Test');

    const copyButton = page.getByRole('button', { name: /复制/ }).first();

    await page.keyboard.press('Tab');
    await expect(copyButton).toBeFocused();

    await page.keyboard.press('Enter');

    const toast = page.getByText('已复制到剪贴板');
    await expect(toast).toBeVisible();
  });
});
