import { test, expect } from '@playwright/test';

const baseURL = process.env.TEST_BASE_URL || 'https://queue-management-taupe.vercel.app/';

test('Business Owner Sign Up and Login', async ({ page }) => {
  // Generate unique username and business name
  const uniqueUsername = 'pwtest' + Date.now();
  const businessName = 'business' + Date.now();

  await page.goto(`${baseURL}`);

  // Navigate to Sign-Up page
  await page.getByRole('button', { name: 'Start Now' }).click();
  await page.getByRole('link', { name: 'Sign up' }).click();

  // Fill in Sign-Up form
  await page.getByPlaceholder('Username').click();
  await page.getByPlaceholder('Username').fill(uniqueUsername);
  await page.getByPlaceholder('Business Name').fill(businessName);
  await page.getByPlaceholder('Username').click();
  await page.locator('#password1').fill('hackme11'); // Password
  await page.locator('#password2').fill('hackme11'); // Confirm Password

  // Submit form
  await page.getByRole('button', { name: 'Sign up' }).click();

  await page.waitForURL(`${baseURL}business/login`);
  await expect(page).toHaveURL(`${baseURL}business/login`);

  // Login with new credentials
  await page.getByPlaceholder('Username').fill(uniqueUsername);
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('hackme11');
  await page.getByRole('button', { name: 'Login' }).click();

  // Navigate to Profile page
  const accountMenu = page.locator('summary.font-bold', { hasText: 'Account' });
  await accountMenu.click();
  await page.getByRole('link', { name: 'Profile' }).click();

  // Verify correct business name
  const businessNameElement = page.getByText(businessName);
  await expect(businessNameElement).toBeVisible();
});
