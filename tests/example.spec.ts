import { test, expect } from '../src/fixtures';

test('home page loads', async ({ pageWithConsole }) => {
  const page = pageWithConsole;
  await page.goto('/');
  await expect(page).toHaveTitle(/Example Domain/);
  await page.evaluate(() => console.log('Merhaba test log!'));
});
