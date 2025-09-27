import { test, expect } from '../src/fixtures';

test('captures console errors', async ({ pageWithConsole }) => {
  const page = pageWithConsole;
  await page.goto('/');

  // Intentionally trigger an error in the page context (for logging demo)
  await page.evaluate(() => console.error('Deliberate error for logging demo'));

  // Basic check
  await expect(page.locator('h1')).toContainText(/Example/);
});
